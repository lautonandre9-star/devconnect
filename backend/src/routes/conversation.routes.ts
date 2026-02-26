import { Router } from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  deleteConversation,
  updateMessage,
  deleteMessage,
  forwardMessage,
  pinMessage,
  updateConversationTheme,
  sendMessageSchema,
  updateMessageSchema,
  updateThemeSchema,
} from '../controllers/conversationController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * GET /api/conversations
 * Listar conversas do utilizador autenticado
 */
router.get('/', requireAuth, getConversations);

/**
 * GET /api/conversations/:conversationId/messages
 * Listar mensagens de uma conversa
 */
router.get('/:conversationId/messages', requireAuth, getMessages);

/**
 * POST /api/conversations/send
 * Enviar mensagem (cria conversa se não existir)
 */
router.post('/send', requireAuth, validate(sendMessageSchema), sendMessage);

/**
 * DELETE /api/conversations/:conversationId
 * Apagar conversa
 */
router.delete('/:conversationId', requireAuth, deleteConversation);

/**
 * PUT /api/conversations/messages/:messageId
 * Editar uma mensagem
 */
router.put('/messages/:messageId', requireAuth, validate(updateMessageSchema), updateMessage);

/**
 * DELETE /api/conversations/messages/:messageId
 * Apagar uma mensagem
 */
router.delete('/messages/:messageId', requireAuth, deleteMessage);

/**
 * POST /api/conversations/messages/:messageId/forward
 * Reencaminhar uma mensagem
 */
router.post('/messages/:messageId/forward', requireAuth, forwardMessage);

/**
 * PATCH /api/conversations/messages/:messageId/pin
 * Afixar/Desafixar uma mensagem
 */
router.patch('/messages/:messageId/pin', requireAuth, pinMessage);

/**
 * PATCH /api/conversations/:conversationId/theme
 * Alterar tema da conversa
 */
router.patch('/:conversationId/theme', requireAuth, validate(updateThemeSchema), updateConversationTheme);

export default router;