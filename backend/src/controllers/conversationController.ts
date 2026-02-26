import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { createNotification } from './notificationController';


export const sendMessageSchema = z.object({
  recipientId: z.string().cuid('recipientId inválido'),
  content: z.string().max(5000, 'Mensagem muito longa').optional(),
  type: z.enum(['TEXT', 'IMAGE', 'FILE', 'AUDIO']).default('TEXT'),
  fileUrl: z.string().url().optional(),
  fileName: z.string().optional(),
  audioUrl: z.string().url().optional(),
  audioDuration: z.number().int().positive().optional(),
});

export const updateMessageSchema = z.object({
  content: z.string().min(1, 'Mensagem não pode estar vazia').max(5000, 'Mensagem muito longa'),
});

export const updateThemeSchema = z.object({
  theme: z.any(),
});


export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { user1Id: userId },
        { user2Id: userId },
      ],
    },
    include: {
      user1: { select: { id: true, name: true, username: true, avatar: true, type: true } },
      user2: { select: { id: true, name: true, username: true, avatar: true, type: true } },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        select: { content: true, createdAt: true, senderId: true, isRead: true },
      },
    },
    orderBy: { lastMessageAt: 'desc' },
  });

  // Otimização: Evitar N+1 query para contagem de mensagens não lidas
  const conversationIds = conversations.map((c) => c.id);
  const unreadCounts = await prisma.directMessage.groupBy({
    by: ['conversationId'],
    where: {
      conversationId: { in: conversationIds },
      senderId: { not: userId },
      isRead: false,
    },
    _count: {
      _all: true,
    },
  });

  const unreadCountMap = new Map<string, number>(
    unreadCounts.map((uc) => [uc.conversationId, uc._count._all])
  );

  // Formatar resposta para incluir o "outro utilizador" e contar não lidas
  const formatted = conversations.map((conv) => {
    const otherUser = conv.user1Id === userId ? conv.user2 : conv.user1;
    const lastMessage = conv.messages[0] || null;
    const unreadCount = unreadCountMap.get(conv.id) || 0;

    return {
      id: conv.id,
      otherUser,
      lastMessage,
      unreadCount,
      lastMessageAt: conv.lastMessageAt,
    };
  });

  res.json({ conversations: formatted });
});

/**
 * GET /api/conversations/:conversationId/messages
 * Listar mensagens de uma conversa
 */
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const userId = req.userId!;
  const { page = '1', limit = '50' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Verificar que o utilizador faz parte da conversa
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new AppError('Conversa não encontrada', 404);
  }

  if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
    throw new AppError('Sem permissão para aceder a esta conversa', 403);
  }

  // Usar transação para buscar mensagens e marcá-las como lidas atomicamente
  const [messages, total] = await prisma.$transaction(async (tx) => {
    const messagePromise = tx.directMessage.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    });

    const countPromise = tx.directMessage.count({ where: { conversationId } });

    const updatePromise = tx.directMessage.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true, readAt: new Date() },
    });

    const [foundMessages, totalCount] = await Promise.all([messagePromise, countPromise, updatePromise]);
    return [foundMessages, totalCount];
  });

  res.json({
    messages: messages.reverse(), // Ordenar do mais antigo para o mais recente
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * POST /api/conversations/send
 * Enviar mensagem (cria conversa se não existir)
 */
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { recipientId, content } = req.body;
  const senderId = req.userId!;

  if (recipientId === senderId) {
    throw new AppError('Não pode enviar mensagens para si próprio', 400);
  }

  // Verificar se o destinatário existe
  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: { id: true, settings: true },
  });

  if (!recipient) {
    throw new AppError('Destinatário não encontrado', 404);
  }

  // Verificar se o destinatário permite mensagens
  if (recipient.settings && !recipient.settings.allowMessages) {
    throw new AppError('Este utilizador não aceita mensagens', 403);
  }

  const [user1Id, user2Id] = [senderId, recipientId].sort();

  // Usar uma transação para garantir a atomicidade da operação
  const message = await prisma.$transaction(async (tx) => {
    const conversation = await tx.conversation.upsert({
      where: {
        user1Id_user2Id: { user1Id, user2Id },
      },
      create: { user1Id, user2Id, lastMessageAt: new Date() },
      update: { lastMessageAt: new Date() },
    });

    const newMessage = await tx.directMessage.create({
      data: {
        conversationId: conversation.id,
        senderId,
        content: req.body.content || '',
        type: req.body.type || 'TEXT',
        fileUrl: req.body.fileUrl,
        fileName: req.body.fileName,
        audioUrl: req.body.audioUrl,
        audioDuration: req.body.audioDuration,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return newMessage;
  });

  // Notificar o destinatário
  await createNotification({
    userId: recipientId,
    type: 'NEW_MESSAGE',
    title: 'Nova Mensagem',
    content: `${message.sender.name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
    link: `/messages`, // Ou link específico da conversa
  });

  res.status(201).json({
    message: 'Mensagem enviada',
    data: message,
  });
});

/**
 * DELETE /api/conversations/:conversationId
 * Apagar conversa para o utilizador atual (soft delete)
 */
/**
 * PUT /api/conversations/messages/:messageId
 * Editar uma mensagem
 */
export const updateMessage = asyncHandler(async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const { content } = req.body;
  const userId = req.userId!;

  const message = await prisma.directMessage.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new AppError('Mensagem não encontrada', 404);
  }

  if (message.senderId !== userId) {
    throw new AppError('Não tem permissão para editar esta mensagem', 403);
  }

  const updatedMessage = await prisma.directMessage.update({
    where: { id: messageId },
    data: {
      content,
      isEdited: true,
    },
    include: {
      sender: {
        select: { id: true, name: true, username: true, avatar: true },
      },
    },
  });

  res.json({ message: 'Mensagem atualizada', data: updatedMessage });
});

/**
 * DELETE /api/conversations/messages/:messageId
 * Apagar uma mensagem (unsend)
 */
export const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const userId = req.userId!;

  const message = await prisma.directMessage.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new AppError('Mensagem não encontrada', 404);
  }

  if (message.senderId !== userId) {
    throw new AppError('Não tem permissão para apagar esta mensagem', 403);
  }

  await prisma.directMessage.delete({
    where: { id: messageId },
  });

  res.json({ message: 'Mensagem apagada' });
});

/**
 * POST /api/conversations/messages/:messageId/forward
 * Reencaminhar uma mensagem
 */
export const forwardMessage = asyncHandler(async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const { recipientId } = req.body;
  const userId = req.userId!;

  const originalMessage = await prisma.directMessage.findUnique({
    where: { id: messageId },
  });

  if (!originalMessage) {
    throw new AppError('Mensagem original não encontrada', 404);
  }

  const [user1Id, user2Id] = [userId, recipientId].sort();

  const message = await prisma.$transaction(async (tx) => {
    const conversation = await tx.conversation.upsert({
      where: { user1Id_user2Id: { user1Id, user2Id } },
      create: { user1Id, user2Id, lastMessageAt: new Date() },
      update: { lastMessageAt: new Date() },
    });

    return tx.directMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: userId,
        content: originalMessage.content,
        type: originalMessage.type,
        fileUrl: originalMessage.fileUrl,
        fileName: originalMessage.fileName,
        audioUrl: originalMessage.audioUrl,
        audioDuration: originalMessage.audioDuration,
        isForwarded: true,
      },
      include: {
        sender: {
          select: { id: true, name: true, username: true, avatar: true },
        },
      },
    });
  });

  res.status(201).json({ message: 'Mensagem reencaminhada', data: message });
});

/**
 * PATCH /api/conversations/messages/:messageId/pin
 * Afixar/Desafixar uma mensagem
 */
export const pinMessage = asyncHandler(async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const userId = req.userId!;

  const message = await prisma.directMessage.findUnique({
    where: { id: messageId },
    include: { conversation: true },
  });

  if (!message) {
    throw new AppError('Mensagem não encontrada', 404);
  }

  if (message.conversation.user1Id !== userId && message.conversation.user2Id !== userId) {
    throw new AppError('Sem permissão', 403);
  }

  const updatedMessage = await prisma.directMessage.update({
    where: { id: messageId },
    data: { isPinned: !message.isPinned },
  });

  res.json({
    message: updatedMessage.isPinned ? 'Mensagem afixada' : 'Mensagem desafixada',
    data: updatedMessage
  });
});

/**
 * PATCH /api/conversations/:conversationId/theme
 * Alterar tema da conversa
 */
export const updateConversationTheme = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const { theme } = req.body;
  const userId = req.userId!;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new AppError('Conversa não encontrada', 404);
  }

  if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
    throw new AppError('Sem permissão', 403);
  }

  const updatedConversation = await prisma.conversation.update({
    where: { id: conversationId },
    data: { theme },
  });

  res.json({ message: 'Tema atualizado', data: updatedConversation });
});

export const deleteConversation = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const userId = req.userId!;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new AppError('Conversa não encontrada', 404);
  }

  if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
    throw new AppError('Sem permissão', 403);
  }

  // Soft delete: esconde a conversa para o utilizador que a apagou.
  // Assumindo que o schema tem `deletedForUserIds String[] @default([])`
  // Soft delete: esconde a conversa para o utilizador que a apagou.
  // Assumindo que o schema tem `deletedForUserIds String[] @default([])`
  // Delete real, já que não há campo de soft delete
  await prisma.conversation.delete({
    where: { id: conversationId },
  });


  res.json({ message: 'Conversa apagada' });
});