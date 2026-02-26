import { Router } from 'express';
import {
  getHubs,
  getHubById,
  createHub,
  updateHub,
  deleteHub,
  joinHub,
  leaveHub,
  getHubMessages,
  sendHubMessage,
  likeHubMessage,
  getHubMembers,
  addHubMember,
  removeHubMember,
  createHubSchema,
  updateHubSchema,
  sendHubMessageSchema,
} from '../controllers/hubController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * GET /api/hubs
 * Listar hubs
 */
router.get('/', getHubs);

/**
 * GET /api/hubs/:id
 * Obter detalhes de um hub
 */
router.get('/:id', getHubById);

/**
 * POST /api/hubs
 * Criar novo hub
 */
router.post('/', requireAuth, validate(createHubSchema), createHub);

/**
 * PUT /api/hubs/:id
 * Atualizar hub (apenas criador)
 */
router.put('/:id', requireAuth, validate(updateHubSchema), updateHub);

/**
 * DELETE /api/hubs/:id
 * Apagar hub (apenas criador)
 */
router.delete('/:id', requireAuth, deleteHub);

/**
 * POST /api/hubs/:id/join
 * Entrar num hub
 */
router.post('/:id/join', requireAuth, joinHub);

/**
 * POST /api/hubs/:id/leave
 * Sair de um hub
 */
router.post('/:id/leave', requireAuth, leaveHub);

/**
 * GET /api/hubs/:id/messages
 * Listar mensagens do hub
 */
router.get('/:id/messages', getHubMessages);

/**
 * POST /api/hubs/:id/messages
 * Enviar mensagem no hub
 */
router.post('/:id/messages', requireAuth, validate(sendHubMessageSchema), sendHubMessage);

/**
 * POST /api/hubs/messages/:messageId/like
 * Like numa mensagem
 */
router.post('/messages/:messageId/like', requireAuth, likeHubMessage);

/**
 * GET /api/hubs/:id/members
 * Listar membros de um hub
 */
router.get('/:id/members', getHubMembers);

/**
 * POST /api/hubs/:id/members
 * Adicionar membro a um hub
 */
router.post('/:id/members', requireAuth, addHubMember);

/**
 * DELETE /api/hubs/:id/members/:userId
 * Remover membro de um hub
 */
router.delete('/:id/members/:userId', requireAuth, removeHubMember);

export default router;