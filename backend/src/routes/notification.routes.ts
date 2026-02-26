import { Router } from 'express';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from '../controllers/notificationController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Todas as rotas de notificações requerem autenticação
router.use(requireAuth);

/**
 * GET /api/notifications
 * Listar notificações do utilizador
 */
router.get('/', getNotifications);

/**
 * PUT /api/notifications/mark-all-read
 * Marcar todas como lidas
 */
router.put('/mark-all-read', markAllAsRead);

/**
 * PUT /api/notifications/:id/read
 * Marcar uma como lida
 */
router.put('/:id/read', markAsRead);

/**
 * DELETE /api/notifications/:id
 * Remover uma notificação
 */
router.delete('/:id', deleteNotification);

export default router;
