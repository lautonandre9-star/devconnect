import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getCareerAdvice,
  generateInterviewQuestions,
  improveResume,
  generateSkillRoadmap,
} from '../controllers/aiController';

const router = Router();

/**
 * POST /api/ai/career-advice
 * Rota para obter conselhos de carreira do DevBuddy.
 */
router.post('/career-advice', requireAuth, getCareerAdvice);

/**
 * POST /api/ai/interview-questions
 * Rota para gerar perguntas de entrevista com base numa vaga.
 */
router.post('/interview-questions', requireAuth, generateInterviewQuestions);

/**
 * POST /api/ai/improve-resume
 * Rota para melhorar a bio de um utilizador.
 */
router.post('/improve-resume', requireAuth, improveResume);

/**
 * POST /api/ai/skill-roadmap
 * Rota para gerar um roadmap de skills.
 */
router.post('/skill-roadmap', requireAuth, generateSkillRoadmap);

// Nota: As rotas `analyzeJobFit` e `generateJobDescription` são chamadas
// internamente por outros controllers (`applicationController` e `jobController`),
// pelo que não necessitam de um endpoint público aqui.

export default router;