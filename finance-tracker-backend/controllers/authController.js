const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const defaultPreferences = { budgetMonth: '', alertPercent: 80 };

// Helper function to generate tokens
const generateTokens = (userId, email) => {
  const accessToken = jwt.sign(
    { userId, email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { userId, email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

// Signup controller
const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and contain a number and a special character.',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ firstName, lastName, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'An error occurred. Please try again later.' });
  }
};

// Signin controller
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Signin successful.',
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        preferences: user.preferences || { budgetMonth: '', alertPercent: 80 },
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

// Logout controller
const logout = async (req, res) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    res.clearCookie('token');
    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Error logging out.' });
  }
};

// Check token validity
const check = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ message: 'User is authenticated.', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check authentication.' });
  }
};

// Refresh access token
const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const { accessToken } = generateTokens(decoded.userId, decoded.email);

    res.status(200).json({ message: 'Token refreshed successfully.', accessToken });
  } catch (error) {
    res.status(403).json({ message: 'Refresh token is invalid or expired.' });
  }
};

// Get User Preferences
const getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.status(200).json(user.preferences || defaultPreferences);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch preferences.' });
  }
};

// Update User Preferences
const updatePreferences = async (req, res) => {
  try {
    const { budgetMonth, alertPercent } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (budgetMonth !== undefined && !/^\d{4}-(0[1-9]|1[0-2])$/.test(budgetMonth)) {
      return res.status(400).json({ error: 'budgetMonth must use YYYY-MM format.' });
    }
    if (alertPercent !== undefined && (!Number.isFinite(Number(alertPercent)) || Number(alertPercent) < 0 || Number(alertPercent) > 100)) {
      return res.status(400).json({ error: 'alertPercent must be between 0 and 100.' });
    }

    user.preferences = user.preferences || { ...defaultPreferences };
    if (budgetMonth !== undefined) user.preferences.budgetMonth = budgetMonth;
    if (alertPercent !== undefined) user.preferences.alertPercent = Number(alertPercent);

    await user.save();
    res.status(200).json(user.preferences);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update preferences.' });
  }
};

module.exports = {
  signup,
  signin,
  logout,
  check,
  refreshToken,
  getPreferences,
  updatePreferences,
};
