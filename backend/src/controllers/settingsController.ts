import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { ProfileVisibility } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';

// Schema de validação
export const updateSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  jobAlerts: z.boolean().optional(),
  messageAlerts: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
  profileVisibility: z.enum(['public', 'connections', 'private']).optional(),
  showEmail: z.boolean().optional(),
  showActivity: z.boolean().optional(),
  allowMessages: z.boolean().optional(),
});

/**
 * GET /api/settings
 * Buscar configurações do utilizador autenticado.
 * Cria com defaults se ainda não existirem.
 */
export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const defaultSettings = {
    emailNotifications: true,
    pushNotifications: false,
    jobAlerts: true,
    messageAlerts: true,
    weeklyDigest: false,
    profileVisibility: ProfileVisibility.public,
    showEmail: false,
    showActivity: true,
    allowMessages: true,
  };

  const settings = await prisma.userSettings.upsert({
    where: { userId: req.userId! },
    update: {},
    create: { userId: req.userId!, ...defaultSettings },
  });

  res.json(settings);
});

/**
 * PUT /api/settings
 * Atualizar configurações do utilizador autenticado
 */
export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const data = updateSettingsSchema.parse(req.body);

  // Converter string para enum ProfileVisibility
  if (data.profileVisibility) {
    data.profileVisibility =
      ProfileVisibility[data.profileVisibility as keyof typeof ProfileVisibility];
  }

  const updatedSettings = await prisma.userSettings.upsert({
    where: { userId: req.userId! },
    update: data,
    create: {
      userId: req.userId!,
      ...data,
    },
  });

  res.json({
    message: 'Configurações atualizadas',
    settings: updatedSettings,
  });
});

/**
 * POST /api/settings/reset
 * Resetar configurações para os valores por defeito
 */
export const resetSettings = asyncHandler(async (req: Request, res: Response) => {
  const defaultSettings = {
    emailNotifications: true,
    pushNotifications: false,
    jobAlerts: true,
    messageAlerts: true,
    weeklyDigest: false,
    profileVisibility: ProfileVisibility.public,
    showEmail: false,
    showActivity: true,
    allowMessages: true,
  };

  const resetedSettings = await prisma.userSettings.upsert({
    where: { userId: req.userId! },
    update: defaultSettings,
    create: { userId: req.userId!, ...defaultSettings },
  });

  res.json({
    message: 'Configurações resetadas',
    settings: resetedSettings,
  });
});
