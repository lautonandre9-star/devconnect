import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';

// Schemas de validação
export const createProjectSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  image: z.string().url().optional(),
  tags: z.array(z.string()).min(1, 'Adicione pelo menos 1 tag'),
  code: z.string().optional(),
  language: z.enum(['html', 'react', 'javascript']).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

/**
 * GET /api/projects
 * Listar projetos (feed)
 */
export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const {
    authorId,
    tags: _tags,
    search,
    page = '1',
    limit = '20',
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Construir filtros
  const where: any = {};

  if (authorId) {
    where.authorId = authorId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.project.count({ where }),
  ]);

  const parsedProjects = projects.map((project) => ({
    ...project,
    tags:
      project.tags && typeof project.tags === 'string'
        ? JSON.parse(project.tags)
        : project.tags,
  }));

  res.json({
    projects: parsedProjects,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * GET /api/projects/:id
 * Obter detalhes de um projeto
 */
export const getProjectById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
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
        comments: {
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
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!project) {
      throw new AppError('Projeto não encontrado', 404);
    }

    const parsedProject = {
      ...project,
      tags:
        project.tags && typeof project.tags === 'string' ? JSON.parse(project.tags) : project.tags,
    };

    res.json(parsedProject);
  }
);

/**
 * POST /api/projects
 * Criar novo projeto/post
 */
export const createProject = asyncHandler(
  async (req: Request, res: Response) => {
    const validatedData = createProjectSchema.parse(req.body);
    const { title, description, image, tags, code, language } = validatedData;

    const project = await prisma.project.create({
      data: {
        authorId: req.userId!,
        title,
        description,
        image,
        tags: tags,
        code,
        language,
      },
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
    });

    res.status(201).json({
      message: 'Projeto criado com sucesso',
      project: {
        ...project,
        tags: project.tags,
      },
    });
  }
);


/**
 * PUT /api/projects/:id
 * Atualizar projeto
 */
export const updateProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Verificar se o projeto existe e pertence ao utilizador
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new AppError('Projeto não encontrado', 404);
    }

    if (existingProject.authorId !== req.userId) {
      throw new AppError('Você não tem permissão para editar este projeto', 403);
    }

    const validatedData = updateProjectSchema.parse(req.body);

    const project = await prisma.project.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        image: validatedData.image,
        code: validatedData.code,
        language: validatedData.language,
        ...(validatedData.tags && { tags: validatedData.tags }),
      },
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
    });

    res.json({
      message: 'Projeto atualizado com sucesso',
      project: {
        ...project,
        tags:
          project.tags && typeof project.tags === 'string'
            ? JSON.parse(project.tags)
            : project.tags,
      },
    });
  }
);

/**
 * DELETE /api/projects/:id
 * Remover projeto
 */
export const deleteProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Verificar se o projeto existe e pertence ao utilizador
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new AppError('Projeto não encontrado', 404);
    }

    if (existingProject.authorId !== req.userId) {
      throw new AppError('Você não tem permissão para remover este projeto', 403);
    }

    await prisma.project.delete({
      where: { id },
    });

    res.json({ message: 'Projeto removido com sucesso' });
  }
);

/**
 * POST /api/projects/:id/like
 * Dar like em um projeto
 */
export const likeProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    throw new AppError('Projeto não encontrado', 404);
  }

  // Incrementar likes
  const updatedProject = await prisma.project.update({
    where: { id },
    data: {
      likes: {
        increment: 1,
      },
    },
  });

  res.json({
    message: 'Like adicionado',
    likes: updatedProject.likes,
  });
});

/**
 * DELETE /api/projects/:id/like
 * Remover like de um projeto
 */
export const unlikeProject = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Usar updateMany para garantir a atomicidade e não decrementar abaixo de 0.
    const result = await prisma.project.updateMany({
      where: {
        id,
        likes: { gt: 0 },
      },
      data: {
        likes: {
          decrement: 1,
        },
      },
    });

    // Buscar o estado final para retornar o número atual de likes.
    const finalProject = await prisma.project.findUnique({ where: { id }, select: { likes: true } });

    if (!finalProject) {
      throw new AppError('Projeto não encontrado', 404);
    }

    res.json({
      message: result.count > 0 ? 'Like removido' : 'Like não pode ser removido',
      likes: finalProject.likes,
    });
  }
);

/**
 * POST /api/projects/:id/comments
 * Adicionar comentário
 */
export const addComment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    throw new AppError('Comentário não pode estar vazio', 400);
  }

  // Verificar se projeto existe
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    throw new AppError('Projeto não encontrado', 404);
  }

  const comment = await prisma.comment.create({
    data: {
      projectId: id,
      authorId: req.userId!,
      content,
    },
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
  });

  res.status(201).json({
    message: 'Comentário adicionado',
    comment,
  });
});

/**
 * DELETE /api/projects/:projectId/comments/:commentId
 * Remover comentário
 */
export const deleteComment = asyncHandler(
  async (req: Request, res: Response) => {
    const { commentId } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new AppError('Comentário não encontrado', 404);
    }

    // Apenas o autor pode deletar
    if (comment.authorId !== req.userId) {
      throw new AppError('Você não tem permissão para remover este comentário', 403);
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.json({ message: 'Comentário removido com sucesso' });
  }
);
