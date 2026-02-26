import { Router } from 'express';
import {
  getStartups,
  getStartupById,
  createStartup,
  updateStartup,
  deleteStartup,
  upvoteStartup,
  removeUpvote,
  createStartupSchema,
  updateStartupSchema,
} from '../controllers/startupController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * GET /api/startups
 * Listar startups
 */
router.get('/', getStartups);

/**
 * GET /api/startups/:id
 * Obter detalhes de uma startup
 */
router.get('/:id', getStartupById);

/**
 * POST /api/startups
 * Criar nova startup
 */
router.post('/', requireAuth, validate(createStartupSchema), createStartup);

/**
 * PUT /api/startups/:id
 * Atualizar startup
 */
router.put('/:id', requireAuth, validate(updateStartupSchema), updateStartup);

/**
 * DELETE /api/startups/:id
 * Remover startup
 */
router.delete('/:id', requireAuth, deleteStartup);

/**
 * POST /api/startups/:id/upvote
 * Dar upvote em uma startup
 */
router.post('/:id/upvote', requireAuth, upvoteStartup);

/**
 * DELETE /api/startups/:id/upvote
 * Remover upvote
 */
router.delete('/:id/upvote', requireAuth, removeUpvote);

export default router;
