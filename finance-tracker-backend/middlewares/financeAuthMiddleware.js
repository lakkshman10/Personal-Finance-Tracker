const jwt = require('jsonwebtoken');
const User = require('../models/user');
const prisma = require('../config/prisma');

// Transitional bridge while authentication is still stored in MongoDB.
// The existing auth token remains unchanged, but financial APIs operate on
// the corresponding PostgreSQL UUID.
const authenticateFinanceUser = async (req, res, next) => {
  const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

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
      },
      create: {
        firstName: mongoUser.firstName,
        lastName: mongoUser.lastName,
        email: mongoUser.email,
        passwordHash: mongoUser.password,
      },
    });

    // Provision one usable default account for a newly created financial profile.
    const accountCount = await prisma.account.count({ where: { userId: pgUser.id } });
    if (accountCount === 0) {
      await prisma.account.create({
        data: {
          userId: pgUser.id,
          name: 'Cash',
          type: 'CASH',
          currency: pgUser.currency,
          openingBalance: 0,
          isActive: true,
        },
      });
    }

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
