// src/routes/follow.routes.ts
import { Router } from 'express';
import {
  followUser,
  unfollowUser,
  getFollowStatus,
  getFollowers,
  getFollowing,
  getFollowCounts,
} from '../controllers/followController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Seguir utilizador
router.post('/:userId', requireAuth, followUser);

// Deixar de seguir
router.delete('/:userId', requireAuth, unfollowUser);

// Verificar se segue
router.get('/:userId/status', requireAuth, getFollowStatus);

// Contar seguidores e seguindo
router.get('/:userId/counts', getFollowCounts);

// Listar seguidores
router.get('/:userId/followers', getFollowers);

// Listar seguindo
router.get('/:userId/following', getFollowing);

export default router;