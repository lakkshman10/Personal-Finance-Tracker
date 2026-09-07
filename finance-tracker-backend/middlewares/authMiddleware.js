const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const authenticateToken = async (req, res, next) => {
  const authorization = req.headers.authorization;
  const bearerToken = authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : null;
  const token = bearerToken || req.cookies?.token;

  if (!token) return next(new AppError('Authentication required.', 401));

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded.userId) return next(new AppError('Invalid authentication token.', 401));
    const user = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { id: true, email: true } });
    if (!user) return next(new AppError('Authentication required.', 401));
    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.name === 'NotBeforeError') return next(new AppError('Authentication token is invalid or expired.', 401));
    return next(error);
  }
};

module.exports = authenticateToken;
