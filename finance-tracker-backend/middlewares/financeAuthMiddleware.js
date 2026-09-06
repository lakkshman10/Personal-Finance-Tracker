const jwt = require('jsonwebtoken');
const User = require('../models/user');
const prisma = require('../config/prisma');

// Transitional bridge while authentication is still stored in MongoDB.
// Financial APIs receive a PostgreSQL UUID in req.user.id, while the existing
// auth token continues to carry the MongoDB user id. This can be removed once
// authentication is fully moved to PostgreSQL.
const authenticateFinanceUser = async (req, res, next) => {
  const token = req.cookies.token || req.cookies.refreshToken || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const mongoUser = await User.findById(decoded.userId);

    if (!mongoUser) {
      return res.status(401).json({ message: 'Unauthorized: User not found.' });
    }

    const pgUser = await prisma.user.upsert({
      where: { email: mongoUser.email },
      update: {
        firstName: mongoUser.firstName,
        lastName: mongoUser.lastName,
        passwordHash: mongoUser.password,
      },
      create: {
        firstName: mongoUser.firstName,
        lastName: mongoUser.lastName,
        email: mongoUser.email,
        passwordHash: mongoUser.password,
      },
    });

    req.user = { id: pgUser.id, email: pgUser.email };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Forbidden: Invalid or expired token.' });
    }

    console.error('Finance authentication error:', error.message);
    return res.status(500).json({ message: 'Failed to authenticate financial account.' });
  }
};

module.exports = authenticateFinanceUser;
