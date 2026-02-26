import { Router } from 'express';
import {
  addBookmark,
  removeBookmark,
  getBookmarks,
  checkBookmark,
} from '../controllers/bookmarkController';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * POST /api/bookmarks
 * Salvar um projecto
 */
router.post('/', requireAuth, addBookmark);

/**
 * DELETE /api/bookmarks/:projectId
 * Remover um projecto dos salvos
 */
router.delete('/:projectId', requireAuth, removeBookmark);

/**
 * GET /api/bookmarks
 * Listar projetos salvos do utilizador autenticado
 */
router.get('/', requireAuth, getBookmarks);

/**
 * GET /api/bookmarks/check/:projectId
 * Verificar se um projecto está salvo
 */
router.get('/check/:projectId', requireAuth, checkBookmark);

export default router;