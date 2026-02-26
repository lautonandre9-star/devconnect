import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { generateJobDescription, generateJobRequirements } from '../services/aiService';

// Schemas de validação
export const createJobSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  location: z.string().min(2, 'Localização é obrigatória'),
  type: z.enum(['FullTime', 'Internship', 'Contract']),
  salary: z.string().optional(),
  description: z.string().min(50, 'Descrição deve ter pelo menos 50 caracteres').optional(),
  requirements: z.array(z.string()).min(1, 'Adicione pelo menos 1 requisito').optional(),
  vacancies: z.number().min(1).optional(),
  generateWithAI: z.boolean().optional(),
});

export const updateJobSchema = createJobSchema.partial();

/**
 * GET /api/jobs
 * Listar todas as vagas (com filtros)
 */
export const getJobs = asyncHandler(async (req: Request, res: Response) => {
  const {
    type,
    location,
    search,
    skills: _skills,
    page = '1',
    limit = '20',
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Construir filtros
  const where: any = {
    isActive: true,
  };

  if (type) {
    where.type = type;
  }

  if (location) {
    where.location = {
      contains: location as string,
      mode: 'insensitive',
    };
  }

  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const currentUserId = req.userId;

  // Buscar vagas
  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            avatar: true,
            logo: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
        applications: {
          where: { status: 'ACCEPTED' },
          select: { id: true, developerId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.job.count({ where }),
  ]);

  // For developers: check if current user has applied to each job
  let appliedJobIds = new Set<string>();
  if (currentUserId) {
    const userApplications = await prisma.application.findMany({
      where: { developerId: currentUserId },
      select: { jobId: true },
    });
    appliedJobIds = new Set(userApplications.map(a => a.jobId));
  }

  const parsedJobs = jobs.map((job) => ({
    ...job,
    requirements:
      job.requirements && typeof job.requirements === 'string'
        ? JSON.parse(job.requirements)
        : job.requirements,
    hiredCount: job.applications.length, // applications already filtered by status: 'ACCEPTED'
    hasApplied: appliedJobIds.has(job.id),
  }));

  res.json({
    jobs: parsedJobs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * GET /api/jobs/:id
 * Obter detalhes de uma vaga
 */
export const getJobById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          avatar: true,
          logo: true,
          bio: true,
          website: true,
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });

  if (!job) {
    throw new AppError('Vaga não encontrada', 404);
  }

  // Incrementar views
  await prisma.job.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  const parsedJob = {
    ...job,
    requirements:
      job.requirements && typeof job.requirements === 'string'
        ? JSON.parse(job.requirements)
        : job.requirements,
  };
  res.json(parsedJob);
});

/**
 * POST /api/jobs
 * Criar nova vaga (apenas empresas)
 */
export const createJob = asyncHandler(async (req: Request, res: Response) => {
  const {
    title,
    location,
    type,
    salary,
    description,
    requirements,
    vacancies,
    generateWithAI,
  } = req.body;

  let finalDescription = description;
  let finalRequirements = requirements;

  // Gerar com IA se solicitado
  if (generateWithAI) {
    const company = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { name: true },
    });

    if (!finalDescription) {
      finalDescription = await generateJobDescription(title, company?.name || 'Nossa Empresa');
    }

    if (!finalRequirements || finalRequirements.length === 0) {
      finalRequirements = await generateJobRequirements(title);
    }
  }

  // Validar que temos descrição e requisitos
  if (!finalDescription) {
    throw new AppError('Descrição é obrigatória (ou ative geração com IA)', 400);
  }

  if (!finalRequirements || finalRequirements.length === 0) {
    throw new AppError('Requisitos são obrigatórios (ou ative geração com IA)', 400);
  }

  const job = await prisma.job.create({
    data: {
      companyId: req.userId!,
      title,
      location,
      type,
      salary,
      description: finalDescription,
      requirements: JSON.stringify(finalRequirements),
      vacancies: vacancies || 1,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
    },
  });

  res.status(201).json({
    message: 'Vaga criada com sucesso',
    job: {
      ...job,
      requirements:
        job.requirements && typeof job.requirements === 'string'
          ? JSON.parse(job.requirements)
          : job.requirements,
    },
  });
});

/**
 * PUT /api/jobs/:id
 * Atualizar vaga
 */
export const updateJob = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Verificar se a vaga existe e pertence à empresa
  const existingJob = await prisma.job.findUnique({
    where: { id },
  });

  if (!existingJob) {
    throw new AppError('Vaga não encontrada', 404);
  }

  if (existingJob.companyId !== req.userId) {
    throw new AppError('Você não tem permissão para editar esta vaga', 403);
  }

  const { requirements, ...updateData } = req.body;

  const job = await prisma.job.update({
    where: { id },
    data: {
      ...updateData,
      ...(requirements && { requirements: JSON.stringify(requirements) }),
    },
  });

  res.json({
    message: 'Vaga atualizada com sucesso',
    job: {
      ...job,
      requirements:
        job.requirements && typeof job.requirements === 'string'
          ? JSON.parse(job.requirements)
          : job.requirements,
    },
  });
});

/**
 * DELETE /api/jobs/:id
 * Remover vaga (soft delete - marca como inativa)
 */
export const deleteJob = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Verificar se a vaga existe e pertence à empresa
  const existingJob = await prisma.job.findUnique({
    where: { id },
  });

  if (!existingJob) {
    throw new AppError('Vaga não encontrada', 404);
  }

  if (existingJob.companyId !== req.userId) {
    throw new AppError('Você não tem permissão para remover esta vaga', 403);
  }

  // Soft delete
  await prisma.job.update({
    where: { id },
    data: { isActive: false },
  });

  res.json({ message: 'Vaga removida com sucesso' });
});

/**
 * GET /api/jobs/:id/applications
 * Listar candidatos de uma vaga (apenas para a empresa dona)
 */
export const getJobApplications = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Verificar se a vaga existe e pertence à empresa
    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new AppError('Vaga não encontrada', 404);
    }

    if (job.companyId !== req.userId) {
      throw new AppError('Você não tem permissão para ver estes candidatos', 403);
    }

    const applications = await prisma.application.findMany({
      where: { jobId: id },
      include: {
        developer: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            bio: true,
            role: true,
            skills: true,
            githubUsername: true,
          },
        },
      },
      orderBy: [
        { aiScore: 'desc' }, // Melhores matches primeiro
        { createdAt: 'desc' },
      ],
    });

    res.json(applications);
  }
);
