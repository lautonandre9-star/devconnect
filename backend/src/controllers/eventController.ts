import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { createNotification } from './notificationController';

// Schemas de validação
export const createEventSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  organizer: z.string().min(3, 'Organizador deve ter pelo menos 3 caracteres'),
  date: z.string().datetime('Data inválida'),
  type: z.enum(['Hackathon', 'Meetup', 'Webinar']),
  image: z.string().url('Imagem deve ser uma URL válida'),
  description: z.string().optional(),
  isOnline: z.boolean().optional(),
  location: z.string().optional(),
  maxAttendees: z.number().int().positive().optional(),
  registrationUrl: z.string().url().optional(),
});

export const updateEventSchema = createEventSchema.partial();

/**
 * GET /api/events
 * Listar eventos
 */
export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const {
    type,
    isOnline,
    upcoming,
    search,
    page = '1',
    limit = '20',
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Construir filtros
  const where: any = {};

  if (type) {
    where.type = type;
  }

  if (isOnline !== undefined) {
    where.isOnline = isOnline === 'true';
  }

  if (upcoming === 'true') {
    where.date = {
      gte: new Date(),
    };
  }

  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { organizer: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [events, total] = await Promise.all([
    prisma.devEvent.findMany({
      where,
      include: {
        _count: {
          select: { attendees_list: true }
        },
        attendees_list: {
          where: { userId: req.userId! },
          select: { id: true }
        }
      },
      orderBy: { date: 'asc' },
      skip,
      take: limitNum,
    }),
    prisma.devEvent.count({ where }),
  ]);

  const formattedEvents = events.map(event => ({
    ...event,
    attendees: event._count.attendees_list,
    isAttending: event.attendees_list.length > 0,
    attendees_list: undefined, // Hide raw list
    _count: undefined
  }));

  return res.json({
    events: formattedEvents,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * GET /api/events/:id
 * Obter detalhes de um evento
 */
export const getEventById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const event = await prisma.devEvent.findUnique({
    where: { id },
    include: {
      _count: {
        select: { attendees_list: true }
      },
      attendees_list: {
        where: { userId: req.userId! },
        select: { id: true }
      }
    }
  });

  if (!event) {
    throw new AppError('Evento não encontrado', 404);
  }

  const formattedEvent = {
    ...event,
    attendees: event._count.attendees_list,
    isAttending: event.attendees_list.length > 0,
    attendees_list: undefined,
    _count: undefined
  };

  return res.json(formattedEvent);
});

/**
 * POST /api/events
 * Criar novo evento (apenas admin ou empresas)
 */
export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const {
    title,
    organizer,
    date,
    type,
    image,
    description,
    isOnline,
    location,
    maxAttendees,
    registrationUrl,
  } = req.body;

  // Verificar se o utilizador é empresa ou admin
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { type: true, role: true },
  });

  if (user?.type !== 'company' && user?.role !== 'admin') {
    throw new AppError('Apenas empresas ou administradores podem criar eventos', 403);
  }

  const event = await prisma.devEvent.create({
    data: {
      title,
      organizer,
      creatorId: req.userId!,
      date: new Date(date),
      type,
      image,
      description,
      isOnline: isOnline ?? false,
      location,
      maxAttendees,
      registrationUrl,
    } as any,
  });

  res.status(201).json({
    message: 'Evento criado com sucesso',
    event,
  });
});

/**
 * PUT /api/events/:id
 * Atualizar evento
 */
export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Verificar se o utilizador é empresa ou admin
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { type: true, role: true },
  });

  if (user?.type !== 'company' && user?.role !== 'admin') {
    throw new AppError('Apenas empresas ou administradores podem editar eventos', 403);
  }

  const existingEvent = await prisma.devEvent.findUnique({
    where: { id },
  });

  if (!existingEvent) {
    throw new AppError('Evento não encontrado', 404);
  }

  const { date, ...updateData } = req.body;

  const event = await prisma.devEvent.update({
    where: { id },
    data: {
      ...updateData,
      ...(date && { date: new Date(date) }),
    },
  });

  res.json({
    message: 'Evento atualizado com sucesso',
    event,
  });
});

/**
 * DELETE /api/events/:id
 * Remover evento
 */
export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Verificar se o utilizador é empresa ou admin
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { type: true, role: true },
  });

  if (user?.type !== 'company' && user?.role !== 'admin') {
    throw new AppError('Apenas empresas ou administradores podem apagar eventos', 403);
  }

  const existingEvent = await prisma.devEvent.findUnique({
    where: { id },
  });

  if (!existingEvent) {
    throw new AppError('Evento não encontrado', 404);
  }

  await prisma.devEvent.delete({
    where: { id },
  });

  res.json({ message: 'Evento removido com sucesso' });
});

/**
 * POST /api/events/:id/attend
 * Confirmar presença em um evento
 */
export const attendEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userId!;

  const event = await prisma.devEvent.findUnique({
    where: { id },
    include: {
      _count: {
        select: { attendees_list: true }
      }
    }
  });

  if (!event) {
    throw new AppError('Evento não encontrado', 404);
  }

  // Verificar se já está inscrito
  const existingAttendance = await prisma.eventAttendee.findUnique({
    where: {
      eventId_userId: {
        eventId: id,
        userId
      }
    }
  });

  if (existingAttendance) {
    return res.json({
      message: 'Você já está inscrito neste evento',
      attendees: event._count.attendees_list,
      isAttending: true
    });
  }

  // Verificar capacidade
  if (event.maxAttendees && event._count.attendees_list >= event.maxAttendees) {
    throw new AppError('Evento já atingiu capacidade máxima', 400);
  }

  // Registrar presença
  await prisma.eventAttendee.create({
    data: {
      eventId: id,
      userId
    }
  });

  // Atualizar contagem no modelo principal (cache para performance se necessário, mas aqui usaremos a tabela de relação)
  // No schema atual, 'attendees' é um campo Int. Vamos mantê-lo sincronizado para compatibilidade, 
  // embora o ideal fosse usar apenas o count da relação.
  await prisma.devEvent.update({
    where: { id },
    data: {
      attendees: {
        increment: 1,
      },
    },
  });

  // Notificar o organizador
  const creatorId = (event as any).creatorId;
  if (creatorId) {
    const attendee = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });

    await createNotification({
      userId: creatorId,
      type: 'SYSTEM',
      title: 'Nova Inscrição em Evento',
      content: `${attendee?.name || 'Um utilizador'} garantiu uma vaga no seu evento: ${event.title}`,
      link: `/events`,
    });
  }

  return res.json({
    message: 'Presença confirmada',
    attendees: event._count.attendees_list + 1,
    isAttending: true
  });
});

/**
 * DELETE /api/events/:id/attend
 * Cancelar presença em um evento
 */
export const cancelAttendance = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.userId!;

    const event = await prisma.devEvent.findUnique({
      where: { id },
      include: {
        _count: {
          select: { attendees_list: true }
        }
      }
    });

    if (!event) {
      throw new AppError('Evento não encontrado', 404);
    }

    // Remover inscrição
    try {
      await prisma.eventAttendee.delete({
        where: {
          eventId_userId: {
            eventId: id,
            userId
          }
        }
      });

      // Atualizar contagem cacheada
      const updatedEvent = await prisma.devEvent.update({
        where: { id },
        data: {
          attendees: {
            decrement: 1,
          },
        },
        select: { attendees: true }
      });

      return res.json({
        message: 'Presença cancelada',
        attendees: updatedEvent.attendees,
        isAttending: false
      });
    } catch (err) {
      return res.json({
        message: 'Você não está inscrito neste evento',
        attendees: event._count.attendees_list,
        isAttending: false
      });
    }
  }
);
