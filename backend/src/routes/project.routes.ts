import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  likeProject,
  unlikeProject,
  addComment,
  deleteComment,
  createProjectSchema,
  updateProjectSchema,
} from '../controllers/projectController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * GET /api/projects
 * Listar projetos (feed)
 */
router.get('/', getProjects);

/**
 * GET /api/projects/:id
 * Obter detalhes de um projeto
 */
router.get('/:id', getProjectById);

/**
 * POST /api/projects
 * Criar novo projeto
 */
router.post('/', requireAuth, validate(createProjectSchema), createProject);

/**
 * PUT /api/projects/:id
 * Atualizar projeto
 */
router.put('/:id', requireAuth, validate(updateProjectSchema), updateProject);

/**
 * DELETE /api/projects/:id
 * Remover projeto
 */
router.delete('/:id', requireAuth, deleteProject);

/**
 * POST /api/projects/:id/like
 * Dar like em um projeto
 */
router.post('/:id/like', requireAuth, likeProject);

/**
 * DELETE /api/projects/:id/like
 * Remover like de um projeto
 */
router.delete('/:id/like', requireAuth, unlikeProject);

/**
 * POST /api/projects/:id/comments
 * Adicionar comentário
 */
router.post('/:id/comments', requireAuth, addComment);

/**
 * DELETE /api/projects/:projectId/comments/:commentId
 * Remover comentário
 */
router.delete('/:projectId/comments/:commentId', requireAuth, deleteComment);

export default router;
