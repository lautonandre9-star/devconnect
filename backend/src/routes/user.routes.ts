import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getAllUsers,
  getUserById,
  updateUserProfile
} from '../controllers/userController';

const router = Router();

// Todas as rotas requerem autenticação
router.use(requireAuth);

// Listar usuários (com busca)
router.get('/', getAllUsers);

// Obter usuário por ID
router.get('/:userId', getUserById);

// Atualizar perfil
router.put('/profile', updateUserProfile);

export default router;