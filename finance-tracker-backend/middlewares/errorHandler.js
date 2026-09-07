const { Prisma } = require('@prisma/client');

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  let statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : null;
  let message = error?.message || 'Internal server error.';

  if (!statusCode && error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        statusCode = 409;
        message = 'The requested resource already exists.';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'The requested resource was not found.';
        break;
      case 'P2003':
        statusCode = 409;
        message = 'The requested operation conflicts with existing data.';
        break;
      default:
        statusCode = 500;
        break;
    }
  }

  if (!statusCode && (error?.code === 'P1001' || error?.code === 'P1002' || error?.code === 'P2024')) {
    statusCode = 503;
    message = 'The database service is temporarily unavailable. Please try again later.';
  }

  if (!statusCode) statusCode = 500;

  if (statusCode >= 500) {
    console.error('Unhandled backend error:', {
      method: req.method,
      path: req.originalUrl,
      statusCode,
      error,
    });
    message = statusCode === 503
      ? message
      : 'An unexpected error occurred. Please try again later.';
  }

  return res.status(statusCode).json({ message });
};

module.exports = errorHandler;
