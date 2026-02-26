import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Safe logging to avoid Node.js internal inspect errors
  try {
    if (error instanceof Error) {
      console.error(`[${error.name}] ${error.message}`);
      if (error.stack) console.error(error.stack);
    } else {
      console.error('Error object:', JSON.stringify(error, null, 2));
    }
  } catch (e) {
    console.error('Error occurred (logging failed):', error?.message || 'Unknown error');
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Erro de validação',
      details: error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Custom app errors
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  // Prisma errors
  if (error.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;

    if (prismaError.code === 'P2002') {
      res.status(409).json({ error: 'Este registo já existe' });
      return;
    }

    if (prismaError.code === 'P2025') {
      res.status(404).json({ error: 'Registo não encontrado' });
      return;
    }
  }

  // Default error
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
};

// Async handler para evitar try-catch em todos os controllers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
