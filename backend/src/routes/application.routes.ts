import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  createApplication,
  getMyApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication
} from '../controllers/applicationController';

const router = Router();

// Todas as rotas requerem autenticação
router.use(requireAuth);

// Criar candidatura (developers)
router.post('/', createApplication);

// Listar minhas candidaturas (developers)
router.get('/my', getMyApplications);

// Ver detalhes de uma candidatura
router.get('/:id', getApplicationById);

// Atualizar status (companies)
router.put('/:id/status', updateApplicationStatus);

// Cancelar candidatura (developers)
router.delete('/:id', deleteApplication);

export default router;