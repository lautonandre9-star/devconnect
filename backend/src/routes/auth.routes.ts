import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  registerSchema,
  loginSchema,
  requestOTP,
  requestOTPSchema,
  forgotPassword,
  forgotPasswordSchema,
  resetPassword,
  resetPasswordSchema,
} from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * POST /api/auth/send-otp
 * Solicitar código de verificação
 */
router.post('/send-otp', validate(requestOTPSchema), requestOTP);

/**
 * POST /api/auth/forgot-password
 * Solicitar recuperação de senha
 */
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);

/**
 * POST /api/auth/reset-password
 * Redefinir senha usando OTP
 */
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

/**
 * POST /api/auth/register
 * Criar nova conta
 */
router.post('/register', validate(registerSchema), register);

/**
 * POST /api/auth/login
 * Fazer login
 */
router.post('/login', validate(loginSchema), login);

/**
 * POST /api/auth/logout
 * Fazer logout (limpar cookie)
 */
router.post('/logout', logout);

/**
 * GET /api/auth/me
 * Obter perfil do utilizador autenticado
 */
router.get('/me', requireAuth, getMe);

export default router;
