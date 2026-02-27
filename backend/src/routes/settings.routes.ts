import { Router } from 'express';
import {
  getSettings,
  updateSettings,
  resetSettings,
  updateSettingsSchema,
} from '../controllers/settingsController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * GET /api/settings
 * Buscar configurações do utilizador autenticado
 */
router.get('/', requireAuth, getSettings);

/**
 * PUT /api/settings
 * Atualizar configurações
 */
router.put('/', requireAuth, validate(updateSettingsSchema), updateSettings);

/**
 * POST /api/settings/reset
 * Resetar para valores por defeito
 */
router.post('/reset', requireAuth, resetSettings);

export default router;