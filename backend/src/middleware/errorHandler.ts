import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('🔥 Error:', err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(400).json({
      message: 'Validation error',
      error: err.message,
    });
    return;
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    res.status(409).json({
      message: 'Duplicate entry',
      error: 'A record with this value already exists',
    });
    return;
  }

  // MongoDB cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      message: 'Invalid ID format',
      error: err.message,
    });
    return;
  }

  // Default server error
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    message: 'Route not found',
    error: 'The requested resource does not exist',
  });
};
