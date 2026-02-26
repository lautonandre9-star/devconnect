import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';

// Schemas de validação
export const createStartupSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  tagline: z.string().min(10, 'Tagline deve ter pelo menos 10 caracteres'),
  description: z.string().min(50, 'Descrição deve ter pelo menos 50 caracteres'),
  logo: z.string().url('Logo deve ser uma URL válida'),
  tags: z.array(z.string()).min(1, 'Adicione pelo menos 1 tag'),
  status: z.enum(['MVP', 'Beta', 'Scaling']).optional(),
  websiteUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  code: z.string().optional(),
  language: z.enum(['html', 'react', 'javascript']).optional(),
});

export const updateStartupSchema = createStartupSchema.partial();

/**
 * GET /api/startups
 * Listar startups
 */
export const getStartups = asyncHandler(async (req: Request, res: Response) => {
  const {
    status,
    search,
    page = '1',
    limit = '20',
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Construir filtros
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { tagline: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [startups, total] = await Promise.all([
    prisma.startupProject.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: { upvotes: 'desc' }, // Ordenar por mais votadas
      skip,
      take: limitNum,
    }),
    prisma.startupProject.count({ where }),
  ]);

  const parsedStartups = startups.map((startup) => ({
    ...startup,
    tags:
      startup.tags && typeof startup.tags === 'string'
        ? JSON.parse(startup.tags)
        : startup.tags,
  }));

  res.json({
    startups: parsedStartups,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * GET /api/startups/:id
 * Obter detalhes de uma startup
 */
export const getStartupById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const startup = await prisma.startupProject.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
      },
    });

    if (!startup) {
      throw new AppError('Startup não encontrada', 404);
    }

    const parsedStartup = {
      ...startup,
      tags:
        startup.tags && typeof startup.tags === 'string' ? JSON.parse(startup.tags) : startup.tags,
    };

    res.json(parsedStartup);
  }
);

/**
 * POST /api/startups
 * Criar nova startup
 */
export const createStartup = asyncHandler(
  async (req: Request, res: Response) => {
    // Validar input
    const validatedData = createStartupSchema.parse(req.body);

    const {
      name,
      tagline,
      description,
      logo,
      tags,
      status,
      websiteUrl,
      githubUrl,
      code,
      language,
    } = validatedData;

    const startup = await prisma.startupProject.create({
      data: {
        ownerId: req.userId!,
        name,
        tagline,
        description,
        logo,
        tags: tags, // Prisma handles JSON arrays directly
        status: status || 'MVP',
        websiteUrl,
        githubUrl,
        code,
        language,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Startup criada com sucesso',
      startup: {
        ...startup,
        tags:
          startup.tags && typeof startup.tags === 'string'
            ? JSON.parse(startup.tags)
            : startup.tags,
      },
    });
  }
);

/**
 * PUT /api/startups/:id
 * Atualizar startup
 */
export const updateStartup = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Verificar se a startup existe e pertence ao utilizador
    const existingStartup = await prisma.startupProject.findUnique({
      where: { id },
    });

    if (!existingStartup) {
      throw new AppError('Startup não encontrada', 404);
    }

    if (existingStartup.ownerId !== req.userId) {
      throw new AppError('Você não tem permissão para editar esta startup', 403);
    }

    const validatedData = updateStartupSchema.parse(req.body);
    const { tags, code, language, ...updateData } = validatedData;

    const startup = await prisma.startupProject.update({
      where: { id },
      data: {
        ...updateData,
        code,
        language,
        ...(tags && { tags: tags }),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    res.json({
      message: 'Startup atualizada com sucesso',
      startup: {
        ...startup,
        tags:
          startup.tags && typeof startup.tags === 'string'
            ? JSON.parse(startup.tags)
            : startup.tags,
      },
    });
  }
);

/**
 * DELETE /api/startups/:id
 * Remover startup
 */
export const deleteStartup = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Verificar se a startup existe e pertence ao utilizador
    const existingStartup = await prisma.startupProject.findUnique({
      where: { id },
    });

    if (!existingStartup) {
      throw new AppError('Startup não encontrada', 404);
    }

    if (existingStartup.ownerId !== req.userId) {
      throw new AppError('Você não tem permissão para remover esta startup', 403);
    }

    await prisma.startupProject.delete({
      where: { id },
    });

    res.json({ message: 'Startup removida com sucesso' });
  }
);

/**
 * POST /api/startups/:id/upvote
 * Dar upvote em uma startup
 */
export const upvoteStartup = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const startup = await prisma.startupProject.findUnique({
      where: { id },
    });

    if (!startup) {
      throw new AppError('Startup não encontrada', 404);
    }

    // Incrementar upvotes
    const updatedStartup = await prisma.startupProject.update({
      where: { id },
      data: {
        upvotes: {
          increment: 1,
        },
      },
    });

    res.json({
      message: 'Upvote adicionado',
      upvotes: updatedStartup.upvotes,
    });
  }
);

/**
 * DELETE /api/startups/:id/upvote
 * Remover upvote de uma startup
 */
export const removeUpvote = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Usar updateMany para garantir a atomicidade e não decrementar abaixo de 0.
    const result = await prisma.startupProject.updateMany({
      where: {
        id,
        upvotes: { gt: 0 },
      },
      data: {
        upvotes: {
          decrement: 1,
        },
      },
    });

    // Buscar o estado final para retornar o número atual de upvotes.
    const finalStartup = await prisma.startupProject.findUnique({ where: { id }, select: { upvotes: true } });

    if (!finalStartup) {
      throw new AppError('Startup não encontrada', 404);
    }

    res.json({
      message: result.count > 0 ? 'Upvote removido' : 'Upvote não pode ser removido',
      upvotes: finalStartup.upvotes,
    });
  }
);
