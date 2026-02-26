import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import prisma from '../utils/prisma';
import { User } from '@prisma/client';

// Extender Request do Express para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
    }
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Tentar ler o token do cookie httpOnly
    let token = req.cookies?.['devconnect-token'];

    // 2. Fallback: ler do header Authorization (para compatibilidade)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
      }
    }

    if (!token) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    const payload: JWTPayload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      res.status(401).json({ error: 'Utilizador não encontrado' });
      return;
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

export const requireCompany = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.type !== 'company') {
    res.status(403).json({ error: 'Apenas empresas podem realizar esta ação' });
    return;
  }
  next();
};

export const requireDeveloper = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.type !== 'developer') {
    res.status(403).json({ error: 'Apenas desenvolvedores podem realizar esta ação' });
    return;
  }
  next();
};
