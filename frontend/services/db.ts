
import { Job, Application, StartupProject, DevEvent, User } from '../types';

const KEYS = {
  JOBS: 'dc_db_jobs',
  APPS: 'dc_db_applications',
  STARTUPS: 'dc_db_startups',
  EVENTS: 'dc_db_events',
  USER: 'dc_db_current_user'
};

export const db = {
  // Inicialização com dados fake se vazio
  init: () => {
    if (!localStorage.getItem(KEYS.JOBS)) {
      localStorage.setItem(KEYS.JOBS, JSON.stringify([
        {
          id: '1',
          companyId: 'c1',
          companyName: 'TechNova',
          companyLogo: 'https://picsum.photos/48/48?random=1',
          title: 'Senior Frontend Engineer',
          location: 'São Paulo (Remoto)',
          type: 'Full-time',
          salary: 'R$ 18k',
          description: 'React expert needed.',
          requirements: ['React', 'TypeScript'],
          postedAt: new Date().toISOString(),
          applicantsCount: 0
        }
      ]));
    }
  },

  get: <T>(key: string): T[] => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  save: <T>(key: string, data: T[]) => {
    localStorage.setItem(key, JSON.stringify(data));
  },

  // Helpers específicos
  jobs: {
    list: () => db.get<Job>(KEYS.JOBS),
    add: (job: Job) => {
      const all = db.get<Job>(KEYS.JOBS);
      all.unshift(job);
      db.save(KEYS.JOBS, all);
    }
  },

  applications: {
    list: (jobId?: string) => {
      const all = db.get<Application>(KEYS.APPS);
      return jobId ? all.filter(a => a.jobId === jobId) : all;
    },
    add: (app: Application) => {
      const all = db.get<Application>(KEYS.APPS);
      all.push(app);
      db.save(KEYS.APPS, all);
      
      // Update job counter
      const jobs = db.get<Job>(KEYS.JOBS);
      const jobIdx = jobs.findIndex(j => j.id === app.jobId);
      if (jobIdx > -1) {
        jobs[jobIdx].applicantsCount += 1;
        db.save(KEYS.JOBS, jobs);
      }
    }
  }
};

db.init();
