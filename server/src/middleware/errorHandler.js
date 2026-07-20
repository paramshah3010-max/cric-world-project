import { ApiError } from '../utils/ApiError.js';

// 404 handler for unknown routes.
export function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// Central error handler. Must have four args for Express to treat it as such.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode ?? 500;
  const isServerError = statusCode >= 500;

  if (isServerError) {
    console.error('[error]', err);
  }

  res.status(statusCode).json({
    error: {
      message: isServerError ? 'Internal server error' : err.message,
      details: err.details,
    },
  });
}
