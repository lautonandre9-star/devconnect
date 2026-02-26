import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { generateToken } from '../utils/jwt';
import { AppError, asyncHandler } from '../middleware/errorHandler';

// Configuração do cookie
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  path: '/',
};

// Schemas de validação
export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  username: z.string().min(3, 'Username deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Password deve ter pelo menos 6 caracteres'),
  type: z.enum(['developer', 'company']),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  website: z.string().url().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password é obrigatória'),
});

/**
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = registerSchema.parse(req.body);

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: validatedData.email }, { username: validatedData.username }],
    },
  });

  if (existingUser) {
    throw new AppError('Email ou username já está em uso', 409);
  }

  const hashedPassword = await bcrypt.hash(validatedData.password, 10);

  const user = await prisma.user.create({
    data: {
      ...validatedData,
      password: hashedPassword,
      skills: validatedData.skills ? JSON.stringify(validatedData.skills) : undefined,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${validatedData.username}`,
    },
  });

  const token = generateToken({ userId: user.id, type: user.type });

  // Definir token como httpOnly cookie
  res.cookie('devconnect-token', token, COOKIE_OPTIONS);

  const { password: _, ...userResponse } = user;

  res.status(201).json({
    message: 'Conta criada com sucesso',
    user: {
      ...userResponse,
      skills: userResponse.skills ? JSON.parse(userResponse.skills as string) : []
    },
  });
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Email ou password incorretos', 401);
  }

  const token = generateToken({ userId: user.id, type: user.type });

  // Definir token como httpOnly cookie
  res.cookie('devconnect-token', token, COOKIE_OPTIONS);

  const { password: _, ...userResponse } = user;

  res.json({
    message: 'Login realizado com sucesso',
    user: {
      ...userResponse,
      skills: userResponse.skills ? JSON.parse(userResponse.skills as string) : []
    },
  });
});

/**
 * POST /api/auth/logout
 * Limpar o cookie de autenticação
 */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie('devconnect-token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const,
    path: '/',
  });

  res.json({ message: 'Logout realizado com sucesso' });
});

/**
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      type: true,
      bio: true,
      avatar: true,
      role: true,
      githubUsername: true,
      skills: true,
      website: true,
      companyDescription: true,
      industry: true,
      logo: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('Utilizador não encontrado', 404);
  }

  const formattedUser = {
    ...user,
    skills: typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills
  };

  res.json(formattedUser);
});

/**
 * GET /api/auth/current
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) {
    throw new AppError('Usuário não autenticado', 401);
  }

  return getMe(req, res, () => { });
});