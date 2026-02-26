import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';

// Schemas de validação
export const createHubSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50),
  description: z.string().max(500).optional(),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve ser em formato hex (#RRGGBB)').optional(),
});

export const updateHubSchema = createHubSchema.partial();

export const sendHubMessageSchema = z.object({
  content: z.string().min(1, 'Mensagem não pode estar vazia').max(2000),
});

/**
 * GET /api/hubs
 * Listar todas as comunidades
 */
export const getHubs = asyncHandler(async (req: Request, res: Response) => {
  const { search, page = '1', limit = '20' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [hubs, total] = await Promise.all([
    prisma.hub.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: { membersCount: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.hub.count({ where }),
  ]);

  res.json({
    hubs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * GET /api/hubs/:id
 * Obter detalhes de uma comunidade
 */
export const getHubById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const hub = await prisma.hub.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },
    },
  });

  if (!hub) {
    throw new AppError('Hub não encontrado', 404);
  }

  res.json(hub);
});

/**
 * POST /api/hubs
 * Criar nova comunidade
 */
export const createHub = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createHubSchema.parse(req.body);
  const { name, description, icon, color } = validatedData;

  // Verificar se já existe um hub com este nome
  const existing = await prisma.hub.findUnique({
    where: { name },
  });

  if (existing) {
    throw new AppError('Já existe uma comunidade com este nome', 409);
  }

  // Usar transação para garantir atomicidade
  const hub = await prisma.$transaction(async (tx) => {
    const newHub = await tx.hub.create({
      data: {
        name,
        description,
        icon,
        color,
        createdById: req.userId!,
        membersCount: 1, // Iniciar com 1 membro
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Auto-join do criador
    await tx.hubMember.create({
      data: {
        hubId: newHub.id,
        userId: req.userId!,
      },
    });

    return newHub;
  });

  res.status(201).json({
    message: 'Hub criado com sucesso',
    hub,
  });
});

/**
 * PUT /api/hubs/:id
 * Atualizar hub (apenas criador)
 */
export const updateHub = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const hub = await prisma.hub.findUnique({
    where: { id },
  });

  if (!hub) {
    throw new AppError('Hub não encontrado', 404);
  }

  if (hub.createdById !== req.userId) {
    throw new AppError('Apenas o criador pode editar o hub', 403);
  }

  const updated = await prisma.hub.update({
    where: { id },
    data: req.body,
  });

  res.json({
    message: 'Hub atualizado',
    hub: updated,
  });
});

/**
 * DELETE /api/hubs/:id
 * Apagar hub (apenas criador)
 */
export const deleteHub = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const hub = await prisma.hub.findUnique({
    where: { id },
  });

  if (!hub) {
    throw new AppError('Hub não encontrado', 404);
  }

  if (hub.createdById !== req.userId) {
    throw new AppError('Apenas o criador pode apagar o hub', 403);
  }

  await prisma.hub.delete({
    where: { id },
  });

  res.json({ message: 'Hub apagado' });
});

/**
 * POST /api/hubs/:id/join
 * Entrar numa comunidade
 */
export const joinHub = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userId!;

  const hub = await prisma.hub.findUnique({
    where: { id },
  });

  if (!hub) {
    throw new AppError('Hub não encontrado', 404);
  }

  // Verificar se já é membro
  const existing = await prisma.hubMember.findUnique({
    where: {
      hubId_userId: { hubId: id, userId },
    },
  });

  if (existing) {
    throw new AppError('Já é membro deste hub', 409);
  }

  // Usar transação para garantir consistência
  await prisma.$transaction([
    prisma.hubMember.create({
      data: { hubId: id, userId },
    }),
    prisma.hub.update({
      where: { id },
      data: { membersCount: { increment: 1 } },
    }),
  ]);

  res.json({ message: 'Entrou no hub' });
});

/**
 * POST /api/hubs/:id/leave
 * Sair de uma comunidade
 */
export const leaveHub = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userId!;

  const membership = await prisma.hubMember.findUnique({
    where: {
      hubId_userId: { hubId: id, userId },
    },
  });

  if (!membership) {
    throw new AppError('Não é membro deste hub', 404);
  }

  // Usar transação para garantir consistência
  await prisma.$transaction([
    prisma.hubMember.delete({
      where: { hubId_userId: { hubId: id, userId } },
    }),
    prisma.hub.update({
      where: { id },
      data: { membersCount: { decrement: 1 } },
    }),
  ]);

  res.json({ message: 'Saiu do hub' });
});

/**
 * GET /api/hubs/:id/messages
 * Listar mensagens de uma comunidade
 */
export const getHubMessages = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { page = '1', limit = '50' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const hub = await prisma.hub.findUnique({
    where: { id },
  });

  if (!hub) {
    throw new AppError('Hub não encontrado', 404);
  }

  const [messages, total] = await Promise.all([
    prisma.hubMessage.findMany({
      where: { hubId: id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.hubMessage.count({ where: { hubId: id } }),
  ]);

  res.json({
    messages: messages.reverse(),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * POST /api/hubs/:id/messages
 * Enviar mensagem numa comunidade
 */
export const sendHubMessage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.userId!;

  const hub = await prisma.hub.findUnique({
    where: { id },
  });

  if (!hub) {
    throw new AppError('Hub não encontrado', 404);
  }

  // Verificar se é membro
  const membership = await prisma.hubMember.findUnique({
    where: {
      hubId_userId: { hubId: id, userId },
    },
  });

  if (!membership) {
    throw new AppError('Precisa de ser membro para enviar mensagens', 403);
  }

  // Usar transação para garantir consistência
  const message = await prisma.$transaction(async (tx) => {
    const newMessage = await tx.hubMessage.create({
      data: {
        hubId: id,
        authorId: userId,
        content,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            type: true,
          },
        },
      },
    });
    await tx.hub.update({
      where: { id },
      data: { messagesCount: { increment: 1 } },
    });
    return newMessage;
  });

  res.status(201).json({
    message: 'Mensagem enviada',
    data: message,
  });
});

/**
 * POST /api/hubs/messages/:messageId/like
 * Dar like numa mensagem de hub
 */
export const likeHubMessage = asyncHandler(async (req: Request, res: Response) => {
  const { messageId } = req.params;

  const message = await prisma.hubMessage.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new AppError('Mensagem não encontrada', 404);
  }

  const updated = await prisma.hubMessage.update({
    where: { id: messageId },
    data: { likes: { increment: 1 } },
  });

  res.json({ likes: updated.likes });
});

/**
 * GET /api/hubs/:id/members
 * Listar membros de um hub
 */
export const getHubMembers = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const hub = await prisma.hub.findUnique({ where: { id } });
  if (!hub) {
    throw new AppError('Hub não encontrado', 404);
  }

  const members = await prisma.hubMember.findMany({
    where: { hubId: id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          type: true,
        },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });

  res.json({ members });
});

/**
 * POST /api/hubs/:id/members
 * Adicionar membro a um hub (pelo criador)
 */
export const addHubMember = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    throw new AppError('userId é obrigatório', 400);
  }

  const hub = await prisma.hub.findUnique({ where: { id } });
  if (!hub) {
    throw new AppError('Hub não encontrado', 404);
  }

  // Verificar se já é membro
  const existing = await prisma.hubMember.findUnique({
    where: { hubId_userId: { hubId: id, userId } },
  });

  if (existing) {
    throw new AppError('Utilizador já é membro deste hub', 409);
  }

  await prisma.$transaction([
    prisma.hubMember.create({
      data: { hubId: id, userId },
    }),
    prisma.hub.update({
      where: { id },
      data: { membersCount: { increment: 1 } },
    }),
  ]);

  res.status(201).json({ message: 'Membro adicionado com sucesso' });
});

/**
 * DELETE /api/hubs/:id/members/:userId
 * Remover membro de um hub
 */
export const removeHubMember = asyncHandler(async (req: Request, res: Response) => {
  const { id, userId } = req.params;

  const hub = await prisma.hub.findUnique({ where: { id } });
  if (!hub) {
    throw new AppError('Hub não encontrado', 404);
  }

  const membership = await prisma.hubMember.findUnique({
    where: { hubId_userId: { hubId: id, userId } },
  });

  if (!membership) {
    throw new AppError('Utilizador não é membro deste hub', 404);
  }

  await prisma.$transaction([
    prisma.hubMember.delete({
      where: { hubId_userId: { hubId: id, userId } },
    }),
    prisma.hub.update({
      where: { id },
      data: { membersCount: { decrement: 1 } },
    }),
  ]);

  res.json({ message: 'Membro removido' });
});