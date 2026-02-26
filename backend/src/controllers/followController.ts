// src/controllers/followController.ts
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';

/**
 * POST /api/follows/:userId
 * Seguir um utilizador
 */
export const followUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId: followingId } = req.params;
  const followerId = req.userId!;

  if (followerId === followingId) {
    throw new AppError('Não podes seguir-te a ti próprio', 400);
  }

  // Verificar se o utilizador alvo existe
  const targetUser = await prisma.user.findUnique({
    where: { id: followingId },
    select: { id: true, name: true, username: true },
  });

  if (!targetUser) {
    throw new AppError('Utilizador não encontrado', 404);
  }

  // Verificar se já segue
  const existing = await (prisma as any).follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });

  if (existing) {
    throw new AppError('Já estás a seguir este utilizador', 409);
  }

  // Criar follow
  const follow = await (prisma as any).follow.create({
    data: { followerId, followingId },
    include: {
      follower: { select: { id: true, name: true, username: true, avatar: true } },
      following: { select: { id: true, name: true, username: true, avatar: true } },
    },
  });

  // Obter dados do seguidor para a notificação
  const followerUser = await prisma.user.findUnique({
    where: { id: followerId },
    select: { name: true, username: true },
  });

  // Criar notificação para o utilizador seguido
  await prisma.notification.create({
    data: {
      userId: followingId,
      type: 'SYSTEM',
      title: 'Novo seguidor',
      content: `${followerUser?.name} (@${followerUser?.username}) começou a seguir-te.`,
      link: `/user/${followerId}`,
    },
  });

  res.status(201).json({ message: 'A seguir com sucesso', follow });
});

/**
 * DELETE /api/follows/:userId
 * Deixar de seguir um utilizador
 */
export const unfollowUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId: followingId } = req.params;
  const followerId = req.userId!;

  const deleted = await (prisma as any).follow.deleteMany({
    where: { followerId, followingId },
  });

  if (deleted.count === 0) {
    throw new AppError('Não estás a seguir este utilizador', 404);
  }

  res.json({ message: 'Deixaste de seguir' });
});

/**
 * GET /api/follows/:userId/status
 * Verificar se o utilizador autenticado segue outro
 */
export const getFollowStatus = asyncHandler(async (req: Request, res: Response) => {
  const { userId: followingId } = req.params;
  const followerId = req.userId!;

  const follow = await (prisma as any).follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });

  res.json({ isFollowing: !!follow });
});

/**
 * GET /api/follows/:userId/followers
 * Listar seguidores de um utilizador
 */
export const getFollowers = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { page = '1', limit = '20' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  const [followers, total] = await Promise.all([
    (prisma as any).follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: { id: true, name: true, username: true, avatar: true, role: true, type: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    (prisma as any).follow.count({ where: { followingId: userId } }),
  ]);

  res.json({
    followers: followers.map((f: any) => f.follower),
    total,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

/**
 * GET /api/follows/:userId/following
 * Listar utilizadores que um utilizador segue
 */
export const getFollowing = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { page = '1', limit = '20' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  const [following, total] = await Promise.all([
    (prisma as any).follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: { id: true, name: true, username: true, avatar: true, role: true, type: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    (prisma as any).follow.count({ where: { followerId: userId } }),
  ]);

  res.json({
    following: following.map((f: any) => f.following),
    total,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

/**
 * GET /api/follows/:userId/counts
 * Contar seguidores e seguindo de um utilizador
 */
export const getFollowCounts = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const [followersCount, followingCount] = await Promise.all([
    (prisma as any).follow.count({ where: { followingId: userId } }),
    (prisma as any).follow.count({ where: { followerId: userId } }),
  ]);

  res.json({ followersCount, followingCount });
});