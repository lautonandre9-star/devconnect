import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as aiService from '../services/aiService';

/**
 * POST /api/ai/career-advice
 * Obtém conselho de carreira da IA.
 */
export const getCareerAdvice = asyncHandler(async (req: Request, res: Response) => {
  const { message, history } = req.body;
  const advice = await aiService.getCareerAdvice(message, history);
  res.json({ result: advice });
});

/**
 * POST /api/ai/interview-questions
 * Gera perguntas de entrevista.
 */
export const generateInterviewQuestions = asyncHandler(async (req: Request, res: Response) => {
  const { jobDetails } = req.body;
  const questions = await aiService.generateInterviewQuestions(jobDetails);
  res.json({ result: questions });
});

/**
 * POST /api/ai/improve-resume
 * Melhora a bio/currículo do utilizador.
 */
export const improveResume = asyncHandler(async (req: Request, res: Response) => {
  const { bio, skills } = req.body;
  const improvedBio = await aiService.improveResume(bio, skills);
  res.json({ result: improvedBio });
});

/**
 * POST /api/ai/skill-roadmap
 * Gera um roadmap de skills.
 */
export const generateSkillRoadmap = asyncHandler(async (req: Request, res: Response) => {
  const { currentSkills } = req.body;
  const roadmap = await aiService.generateSkillRoadmap(currentSkills);
  res.json({ result: roadmap });
});