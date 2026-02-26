import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
  getPendingRequests,
  checkFriendshipStatus
} from '../controllers/friendshipController';

const router = Router();

// Todas as rotas requerem autenticação
router.use(requireAuth);

// Enviar solicitação
router.post('/send', sendFriendRequest);

// Aceitar solicitação
router.post('/:friendshipId/accept', acceptFriendRequest);

// Rejeitar solicitação
router.delete('/:friendshipId/reject', rejectFriendRequest);

// Remover amigo
router.delete('/:friendId/remove', removeFriend);

// Listar amigos
router.get('/', getFriends);

// Listar solicitações pendentes
router.get('/requests', getPendingRequests);

// Verificar status de amizade
router.get('/status/:targetUserId', checkFriendshipStatus);

export default router;