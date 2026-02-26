// Backend Notification Controller
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';

/**
 * Listar notificações do utilizador
 */
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.notification.count({ where: { userId } }),
    ]);

    const unreadCount = await prisma.notification.count({
        where: { userId, isRead: false },
    });

    return res.json({
        notifications,
        unreadCount,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
});

/**
 * Marcar notificação como lida
 */
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.userId!;

    const notification = await prisma.notification.findFirst({
        where: { id, userId },
    });

    if (!notification) {
        throw new AppError('Notificação não encontrada', 404);
    }

    await prisma.notification.update({
        where: { id },
        data: { isRead: true },
    });

    return res.json({ message: 'Notificação marcada como lida' });
});

/**
 * Marcar todas como lidas
 */
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;

    await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
    });

    return res.json({ message: 'Todas as notificações marcadas como lidas' });
});

/**
 * Eliminar notificação
 */
export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.userId!;

    const notification = await prisma.notification.findFirst({
        where: { id, userId },
    });

    if (!notification) {
        throw new AppError('Notificação não encontrada', 404);
    }

    await prisma.notification.delete({
        where: { id },
    });

    return res.json({ message: 'Notificação removida' });
});

/**
 * Utilitário para criar notificações
 */
export const createNotification = async (data: {
    userId: string;
    type: any;
    title: string;
    content: string;
    link?: string;
}) => {
    try {
        return await prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                title: data.title,
                content: data.content,
                link: data.link,
            },
        });
    } catch (error) {
        console.error('Erro ao criar notificação:', error);
        return null;
    }
};
