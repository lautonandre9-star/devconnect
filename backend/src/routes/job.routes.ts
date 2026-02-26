import { Router } from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobApplications,
  createJobSchema,
  updateJobSchema,
} from '../controllers/jobController';
import { requireAuth, requireCompany } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * GET /api/jobs
 * Listar todas as vagas
 */
router.get('/', getJobs);

/**
 * GET /api/jobs/:id
 * Obter detalhes de uma vaga
 */
router.get('/:id', getJobById);

/**
 * POST /api/jobs
 * Criar nova vaga (apenas empresas)
 */
router.post('/', requireAuth, requireCompany, validate(createJobSchema), createJob);

/**
 * PUT /api/jobs/:id
 * Atualizar vaga
 */
router.put('/:id', requireAuth, requireCompany, validate(updateJobSchema), updateJob);

/**
 * DELETE /api/jobs/:id
 * Remover vaga
 */
router.delete('/:id', requireAuth, requireCompany, deleteJob);

/**
 * GET /api/jobs/:id/applications
 * Listar candidatos de uma vaga
 */
router.get('/:id/applications', requireAuth, requireCompany, getJobApplications);

export default router;
