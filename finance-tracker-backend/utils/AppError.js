class AppError extends Error {
  constructor(message, statusCode = 400, options = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = options.isOperational !== false;
    Error.captureStackTrace?.(this, AppError);
  }
}

module.exports = AppError;
