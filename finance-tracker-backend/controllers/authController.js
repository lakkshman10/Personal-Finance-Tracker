const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const generateTokens = (userId, email) => {
  const accessToken = jwt.sign({ userId, email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId, email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  currency: user.currency,
  timezone: user.timezone,
});

const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body || {};
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!firstName || !lastName || !normalizedEmail || !password) return res.status(400).json({ message: 'All fields are required.' });
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!passwordRegex.test(password)) return res.status(400).json({ message: 'Password must be at least 8 characters long and contain a number and a special character.' });
    if (await prisma.user.findUnique({ where: { email: normalizedEmail } })) return res.status(400).json({ message: 'User already exists.' });
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { firstName: String(firstName).trim(), lastName: String(lastName).trim(), email: normalizedEmail, passwordHash } });
    return res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ message: 'User already exists.' });
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'An error occurred. Please try again later.' });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!normalizedEmail || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(400).json({ message: 'Invalid credentials.' });
    const { accessToken, refreshToken } = generateTokens(user.id, user.email);
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(200).json({ message: 'Signin successful.', accessToken, user: publicUser(user) });
  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

const logout = async (req, res) => {
  res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logged out successfully.' });
};

const check = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.status(200).json({ message: 'User is authenticated.', user: publicUser(user) });
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(500).json({ message: 'Failed to check authentication.' });
  }
};

const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token provided.' });
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(401).json({ message: 'User not found.' });
    const { accessToken, refreshToken: rotatedRefreshToken } = generateTokens(user.id, user.email);
    res.cookie('refreshToken', rotatedRefreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(200).json({ message: 'Token refreshed successfully.', accessToken });
  } catch (error) {
    return res.status(403).json({ message: 'Refresh token is invalid or expired.' });
  }
};

// Kept temporarily as explicit deprecation responses so stale clients fail safely.
const getPreferences = async (req, res) => res.status(410).json({ error: 'User preferences endpoint has been replaced by PostgreSQL-backed budget settings.' });
const updatePreferences = async (req, res) => res.status(410).json({ error: 'User preferences endpoint has been replaced by PostgreSQL-backed budget settings.' });

module.exports = { signup, signin, logout, check, refreshToken, getPreferences, updatePreferences };
