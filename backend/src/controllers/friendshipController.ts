import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { createNotification } from './notificationController';

// Definição do Schema (estava faltando)
const sendRequestSchema = z.object({
  receiverId: z.string().uuid(),
});

// Enviar solicitação de amizade
export const sendFriendRequest = asyncHandler(async (req: Request, res: Response) => {
  // Use apenas uma forma de pegar o ID (ajuste conforme seu middleware de auth)
  const userId = req.userId!;
  const { receiverId } = sendRequestSchema.parse(req.body);

  if (userId === receiverId) {
    throw new AppError('Você não pode enviar solicitação para si mesmo', 400);
  }

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId }
  });

  if (!receiver) {
    throw new AppError('Usuário não encontrado', 404);
  }

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId: userId, receiverId },
        { senderId: receiverId, receiverId: userId }
      ]
    }
  });

  if (existing) {
    if (existing.status === 'accepted') {
      throw new AppError('Vocês já são amigos', 400);
    }
    if (existing.status === 'pending') {
      throw new AppError('Já existe uma solicitação pendente', 400);
    }
  }

  const friendship = await prisma.friendship.create({
    data: {
      senderId: userId,
      receiverId,
      status: 'pending'
    },
    include: {
      sender: { select: { id: true, name: true, username: true, avatar: true, type: true } },
      receiver: { select: { id: true, name: true, username: true, avatar: true, type: true } }
    }
  });

  // Notificar o destinatário
  await createNotification({
    userId: receiverId,
    type: 'FRIEND_REQUEST',
    title: 'Nova Solicitação de Amizade',
    content: `${friendship.sender.name} enviou-lhe uma solicitação de amizade.`,
    link: `/profile`, // Ou uma aba específica de solicitações
  });

  res.status(201).json({ friendship });
});

// Aceitar solicitação
export const acceptFriendRequest = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { friendshipId } = req.params;

  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId }
  });

  if (!friendship) {
    throw new AppError('Solicitação não encontrada', 404);
  }

  if (friendship.receiverId !== userId) {
    throw new AppError('Você não pode aceitar esta solicitação', 403);
  }

  if (friendship.status !== 'pending') {
    throw new AppError('Esta solicitação já foi processada', 400);
  }

  const updated = await prisma.friendship.update({
    where: { id: friendshipId },
    data: { status: 'accepted' },
    include: {
      sender: { select: { id: true, name: true, username: true, avatar: true, type: true } },
      receiver: { select: { id: true, name: true, username: true, avatar: true, type: true } }
    }
  }); // Fechamento corrigido aqui

  // Notificar o remetente que o pedido foi aceite
  await createNotification({
    userId: updated.senderId,
    type: 'FRIEND_ACCEPTED',
    title: 'Solicitação de Amizade Aceite',
    content: `${updated.receiver.name} aceitou o seu pedido de amizade.`,
    link: `/profile/${updated.receiver.id}`,
  });

  res.json({ friendship: updated });
});

// Rejeitar solicitação
export const rejectFriendRequest = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { friendshipId } = req.params;

  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId }
  });

  if (!friendship) {
    throw new AppError('Solicitação não encontrada', 404);
  }

  if (friendship.receiverId !== userId) {
    throw new AppError('Você não pode rejeitar esta solicitação', 403);
  }

  await prisma.friendship.delete({
    where: { id: friendshipId }
  });

  res.json({ message: 'Solicitação rejeitada' });
});

// Remover amizade
export const removeFriend = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { friendId } = req.params;

  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId }
      ],
      status: 'accepted'
    }
  });

  if (!friendship) {
    throw new AppError('Amizade não encontrada', 404);
  }

  await prisma.friendship.delete({
    where: { id: friendship.id }
  });

  res.json({ message: 'Amizade removida' });
});

// Listar amigos
export const getFriends = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
      status: 'accepted'
    },
    include: {
      sender: { select: { id: true, name: true, username: true, avatar: true, type: true } },
      receiver: { select: { id: true, name: true, username: true, avatar: true, type: true } }
    }
  });

  const friends = friendships.map(f => (f.senderId === userId ? f.receiver : f.sender));

  res.json({ friends });
});

// Listar solicitações pendentes
export const getPendingRequests = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;

  const requests = await prisma.friendship.findMany({
    where: {
      receiverId: userId,
      status: 'pending'
    },
    include: {
      sender: { select: { id: true, name: true, username: true, avatar: true, type: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ requests });
});

// Verificar status de amizade
export const checkFriendshipStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { targetUserId } = req.params;

  if (userId === targetUserId) {
    return res.json({ status: 'self' });
  }

  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId: userId, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: userId }
      ]
    }
  });

  if (!friendship) {
    return res.json({ status: 'none', friendshipId: null });
  }

  if (friendship.status === 'pending') {
    const isSender = friendship.senderId === userId;
    return res.json({
      status: 'pending',
      friendshipId: friendship.id,
      isSender
    });
  }

  return res.json({
    status: friendship.status,
    friendshipId: friendship.id
  });
});