const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const authenticateToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1] || req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded.userId) {
      return res.status(403).json({ message: 'Forbidden: Invalid token.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true },
    });

    if (!user) return res.status(401).json({ message: 'Unauthorized: User not found.' });

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Forbidden: Invalid or expired token.' });
    }
    console.error('Authentication error:', error.message);
    return res.status(500).json({ message: 'Failed to authenticate user.' });
  }
};

module.exports = authenticateToken;
