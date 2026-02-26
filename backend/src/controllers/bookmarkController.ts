import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';

/**
 * POST /api/bookmarks
 * Salvar um projecto nos bookmarks do utilizador autenticado
 */
export const addBookmark = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.body;

  if (!projectId) {
    throw new AppError('projectId é obrigatório', 400);
  }

  // Verificar se o projecto existe
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new AppError('Projecto não encontrado', 404);
  }

  // Verificar se já existe bookmark (evitar erro de unique)
  const existing = await prisma.bookmark.findFirst({
    where: {
      userId: req.userId!,
      projectId,
    },
  });

  if (existing) {
    throw new AppError('Projecto já está salvo', 409);
  }

  const bookmark = await prisma.bookmark.create({
    data: {
      userId: req.userId!,
      projectId,
    },
    include: {
      project: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  res.status(201).json({
    message: 'Projecto salvo',
    bookmark,
  });
});

/**
 * DELETE /api/bookmarks/:projectId
 * Remover um projecto dos bookmarks do utilizador autenticado
 */
export const removeBookmark = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;

  const deleted = await prisma.bookmark.deleteMany({
    where: {
      userId: req.userId!,
      projectId,
    },
  });

  if (deleted.count === 0) {
    throw new AppError('Bookmark não encontrado', 404);
  }

  res.json({ message: 'Bookmark removido' });
});

/**
 * GET /api/bookmarks
 * Listar todos os bookmarks do utilizador autenticado
 */
export const getBookmarks = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '20' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [bookmarks, total] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId: req.userId! },
      include: {
        project: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                role: true,
              },
            },
            _count: {
              select: {
                comments: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.bookmark.count({ where: { userId: req.userId! } }),
  ]);

  res.json({
    bookmarks,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * GET /api/bookmarks/check/:projectId
 * Verificar se um projecto está salvo pelo utilizador autenticado
 */
export const checkBookmark = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;

  const bookmark = await prisma.bookmark.findFirst({
    where: {
      userId: req.userId!,
      projectId,
    },
  });

  res.json({ bookmarked: !!bookmark });
});