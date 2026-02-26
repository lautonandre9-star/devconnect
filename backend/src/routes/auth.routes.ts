import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  registerSchema,
  loginSchema,
} from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

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
