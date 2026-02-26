import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { analyzeJobMatch } from '../services/aiService';
import { createNotification } from './notificationController';

// Schemas de validação
export const createApplicationSchema = z.object({
  jobId: z.string().cuid('ID da vaga inválido'),
  coverLetter: z.string().optional(),
  resumeUrl: z.string().url().optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWING', 'INTERVIEW', 'ACCEPTED', 'REJECTED']),
});

/**
 * POST /api/applications
 * Candidatar-se a uma vaga
 */
export const createApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const { jobId, coverLetter, resumeUrl } = req.body;

    // Verificar se a vaga existe e está ativa
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!job) {
      throw new AppError('Vaga não encontrada', 404);
    }

    if (!job.isActive) {
      throw new AppError('Esta vaga não está mais ativa', 400);
    }

    // Verificar se há vagas disponíveis
    const acceptedCount = await prisma.application.count({
      where: {
        jobId,
        status: 'ACCEPTED',
      },
    });

    if (job.vacancies && acceptedCount >= job.vacancies) {
      throw new AppError('Esta vaga já foi preenchida (limite de vagas atingido)', 400);
    }

    // Verificar se é desenvolvedor
    if (req.user?.type !== 'developer') {
      throw new AppError('Apenas desenvolvedores podem candidatar-se', 403);
    }

    // Verificar se já se candidatou
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_developerId: {
          jobId,
          developerId: req.userId!,
        },
      },
    });

    if (existingApplication) {
      throw new AppError('Você já se candidatou a esta vaga', 409);
    }

    // Buscar dados do desenvolvedor
    const developer = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!developer) {
      throw new AppError('Desenvolvedor não encontrado', 404);
    }

    // Análise de match com IA
    let aiScore: number | null = null;
    let aiReasoning: string | null = null;

    try {
      const devSkills = developer.skills
        ? JSON.parse(developer.skills as string)
        : [];
      const jobRequirements = job.requirements
        ? JSON.parse(job.requirements as string)
        : [];

      const analysis = await analyzeJobMatch(
        job.title,
        jobRequirements,
        job.description,
        developer.name,
        devSkills,
        developer.bio || ''
      );

      aiScore = analysis.score;
      aiReasoning = analysis.reason;
    } catch (error) {
      console.error('Erro na análise de IA:', error);
      // Continuar mesmo se a IA falhar
    }

    // Criar candidatura
    const application = await prisma.application.create({
      data: {
        jobId,
        developerId: req.userId!,
        coverLetter,
        resumeUrl,
        aiScore,
        aiReasoning,
      },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
    });

    // Notificar a empresa
    await createNotification({
      userId: job.companyId,
      type: 'JOB_APPLICATION',
      title: 'Nova Candidatura',
      content: `${developer.name} candidatou-se à vaga de ${job.title}`,
      link: `/company-dashboard?jobId=${job.id}`,
    });

    res.status(201).json({
      message: 'Candidatura enviada com sucesso',
      application,
    });
  }
);

/**
 * GET /api/applications/my
 * Listar minhas candidaturas (desenvolvedor)
 */
export const getMyApplications = asyncHandler(
  async (req: Request, res: Response) => {
    const applications = await prisma.application.findMany({
      where: { developerId: req.userId },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(applications);
  }
);

/**
 * GET /api/applications/:id
 * Obter detalhes de uma candidatura
 */
export const getApplicationById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
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
    });

    if (!application) {
      throw new AppError('Candidatura não encontrada', 404);
    }

    // Verificar permissão (desenvolvedor ou empresa dona)
    const isDeveloper = application.developerId === req.userId;
    const isCompany = application.job.companyId === req.userId;

    if (!isDeveloper && !isCompany) {
      throw new AppError('Você não tem permissão para ver esta candidatura', 403);
    }

    // Parse skills do developer para o frontend
    if (application.developer && application.developer.skills && typeof application.developer.skills === 'string') {
      (application.developer as any).skills = JSON.parse(
        application.developer.skills
      );
    }

    res.json(application);
  }
);

/**
 * PUT /api/applications/:id/status
 * Atualizar status da candidatura (apenas empresa)
 */
export const updateApplicationStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
      },
    });

    if (!application) {
      throw new AppError('Candidatura não encontrada', 404);
    }

    // Verificar se é a empresa dona da vaga
    if (application.job.companyId !== req.userId) {
      throw new AppError(
        'Você não tem permissão para alterar esta candidatura',
        403
      );
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status },
      include: {
        developer: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Notificar o desenvolvedor
    await createNotification({
      userId: application.developerId,
      type: 'APPLICATION_STATUS_CHANGE',
      title: 'Atualização de Candidatura',
      content: `O seu status para a vaga ${application.job.title} foi alterado para ${status}`,
      link: `/profile`,
    });

    res.json({
      message: 'Status atualizado com sucesso',
      application: updatedApplication,
    });
  }
);

/**
 * DELETE /api/applications/:id
 * Cancelar candidatura (apenas desenvolvedor)
 */
export const deleteApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new AppError('Candidatura não encontrada', 404);
    }

    // Verificar se é o desenvolvedor dono
    if (application.developerId !== req.userId) {
      throw new AppError('Você não tem permissão para cancelar esta candidatura', 403);
    }

    // Não permitir cancelar se já foi aceita
    if ((application.status as any) === 'ACCEPTED') {
      throw new AppError('Não é possível cancelar uma candidatura aceita', 400);
    }

    await prisma.application.delete({
      where: { id },
    });

    res.json({ message: 'Candidatura cancelada com sucesso' });
  }
);
