import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  attendEvent,
  cancelAttendance,
  createEventSchema,
  updateEventSchema,
} from '../controllers/eventController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();



/**
 * GET /api/events
 * Listar eventos
 */
router.get('/', getEvents);

/**
 * GET /api/events/:id
 * Obter detalhes de um evento
 */



router.get('/:id', getEventById);

router.post('/', requireAuth, validate(createEventSchema), createEvent);

/**
 * PUT /api/events/:id
 * Atualizar evento
 */



router.put('/:id', requireAuth, validate(updateEventSchema), updateEvent);

/**
 * DELETE /api/events/:id
 * Remover evento
 */
router.delete('/:id', requireAuth, deleteEvent);

/**
 * POST /api/events/:id/attend
 * Confirmar presença
 */
router.post('/:id/attend', requireAuth, attendEvent);

/**
 <* DELETE /api/events/:id/attend
 * Cancelar presença
 */
router.delete('/:id/attend', requireAuth, cancelAttendance);


export default router;
