import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  status?: number;
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = (err as any).statusCode || err.status || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(status).json({
    success: false,
    status,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
