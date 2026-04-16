// src/api/middleware/errorHandler.ts — v5.0.0
import type { Request, Response, NextFunction } from 'express';
import type { APIResponse } from '../../types/index.js';

const VERSION = '5.0.0';
const IS_DEV = process.env['NODE_ENV'] !== 'production';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const body: APIResponse<null> & { stack?: string } = {
    success: false,
    error: err.message ?? 'Internal Server Error',
    timestamp: new Date().toISOString(),
    version: VERSION,
    ...(IS_DEV && err.stack ? { stack: err.stack } : {}),
  };

  if (statusCode >= 500) {
    console.error('[ERROR]', err.message, IS_DEV ? err.stack : '');
  }

  res.status(statusCode).json(body);
}

export function notFoundHandler(_req: Request, res: Response): void {
  const body: APIResponse<null> = {
    success: false,
    error: 'Ruta nu a fost găsită',
    timestamp: new Date().toISOString(),
    version: VERSION,
  };
  res.status(404).json(body);
}

export function createError(
  message: string,
  statusCode = 500,
  code?: string
): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  err.code = code;
  err.isOperational = true;
  return err;
}
