import { api } from '../src/services/api';

export const improveResumeForJob = async (currentResume: string, jobDetails: string) => {
  return api.ai.improveResumeForJob(currentResume, jobDetails);
};

export const generateInterviewQuestions = async (jobDetails: string) => {
  return api.ai.generateInterviewQuestions(jobDetails);
};

export const improveResume = async (bio: string, skills: string[]) => {
  return api.ai.improveResume(bio, skills);
};

export const getCareerAdvice = async (message: string, history: any[]) => {
  return api.ai.getCareerAdvice(message, history);
};

export const generateSkillRoadmap = async (currentSkills: string[]) => {
  return api.ai.generateSkillRoadmap(currentSkills);
};

export const analyzeJobFit = async (jobStr: string, profileStr: string) => {
  throw new Error("analyzeJobFit should be called from the backend.");
};

export const generateJobDescription = async (title: string, companyName: string) => {
  throw new Error("generateJobDescription should be called from the backend.");
};
