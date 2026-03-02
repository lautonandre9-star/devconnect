import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { generateToken } from '../utils/jwt';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import * as otpService from '../services/otpService';
import * as emailService from '../services/emailService';
import '../middleware/auth'; // Ajuda o IDE a reconhecer as extensões de tipo (como req.userId)

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
  otpCode: z.string().length(6, 'Código OTP deve ter 6 dígitos'),
});

export const requestOTPSchema = z.object({
  email: z.string().email('Email inválido'),
  type: z.enum(['REGISTRATION', 'PASSWORD_RESET']),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
  otpCode: z.string().length(6, 'Código OTP deve ter 6 dígitos'),
  newPassword: z.string().min(6, 'Nova password deve ter pelo menos 6 caracteres'),
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

  // Verificar OTP
  const isOTPValid = await otpService.verifyOTP(
    validatedData.email,
    validatedData.otpCode,
    otpService.OTPType.REGISTRATION
  );

  if (!isOTPValid) {
    throw new AppError('Código OTP inválido ou expirado', 400);
  }

  const hashedPassword = await bcrypt.hash(validatedData.password, 10);

  const user = await prisma.user.create({
    data: {
      name: validatedData.name,
      username: validatedData.username,
      email: validatedData.email,
      password: hashedPassword,
      type: validatedData.type,
      bio: validatedData.bio,
      isVerified: true, // Campo sincronizado com o Prisma Client
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

/**
 * POST /api/auth/send-otp
 */
export const requestOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email, type } = requestOTPSchema.parse(req.body);

  if (type === 'REGISTRATION') {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('Este e-mail já está em uso', 400);
    }
  }

  const otp = await otpService.createOTP(email, type as otpService.OTPType);
  await emailService.sendOTPEmail(email, otp.code);

  res.json({ message: `Código de verificação enviado para ${email}` });
});

/**
 * POST /api/auth/forgot-password
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = forgotPasswordSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Por segurança, não confirmamos se o e-mail existe
    res.json({ message: 'Se o e-mail existir, um código de recuperação será enviado.' });
    return;
  }

  const otp = await otpService.createOTP(email, otpService.OTPType.PASSWORD_RESET);
  await emailService.sendResetPasswordEmail(email, otp.code);

  res.json({ message: 'Código de recuperação enviado para o seu e-mail.' });
});

/**
 * POST /api/auth/reset-password
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, otpCode, newPassword } = resetPasswordSchema.parse(req.body);

  const isOTPValid = await otpService.verifyOTP(email, otpCode, otpService.OTPType.PASSWORD_RESET);
  if (!isOTPValid) {
    throw new AppError('Código OTP inválido ou expirado', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  res.json({ message: 'Senha redefinida com sucesso.' });
});