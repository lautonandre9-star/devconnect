import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Listar todos os usuários (com busca opcional)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const users = await prisma.user.findMany({
      where: search ? {
        OR: [
          { name: { contains: search as string } },
          { username: { contains: search as string } }
        ]
      } : undefined,
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        type: true,
        role: true,
        bio: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    res.json({ users });
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

// Obter usuário por ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        type: true,
        role: true,
        bio: true,
        githubUsername: true,
        website: true,
        companyDescription: true,
        industry: true,
        logo: true,
        skills: true,
        createdAt: true,
        _count: {
          select: {
            projects: true,
            sentFriendships: true,
            receivedFriendships: true,
            jobsPosted: true,
            startupProjects: true
          }
        },
        projects: {
          take: 6,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            tags: true,
            likes: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    const formattedUser = {
      ...user,
      skills: typeof user.skills === 'string' ? JSON.parse(user.skills) : (user.skills || [])
    };

    res.json({ user: formattedUser });
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
};

// Atualizar perfil do usuário
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, bio, avatar, role, githubUsername, website, industry, skills } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(avatar && { avatar }),
        ...(role && { role }),
        ...(githubUsername && { githubUsername }),
        ...(website && { website }),
        ...(industry && { industry }),
        ...(skills && {
          skills: Array.isArray(skills) ? JSON.stringify(skills) : skills
        })
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        type: true,
        role: true,
        bio: true,
        githubUsername: true,
        website: true,
        industry: true,
        skills: true
      }
    });

    const formattedUser = {
      ...user,
      skills: typeof user.skills === 'string' ? JSON.parse(user.skills) : (user.skills || [])
    };

    res.json({ user: formattedUser });
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};