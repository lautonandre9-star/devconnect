
import { Job, StartupProject, DevEvent, User } from '../types';

// Simula o comportamento de um banco de dados real usando LocalStorage
const STORAGE_KEYS = {
  JOBS: 'devconnect_jobs',
  PROJECTS: 'devconnect_projects',
  EVENTS: 'devconnect_events',
  USER: 'devconnect_current_user'
};

export const dataService = {
  getJobs: (): Job[] => {
    const data = localStorage.getItem(STORAGE_KEYS.JOBS);
    return data ? JSON.parse(data) : [];
  },

  postJob: (job: Job) => {
    const jobs = dataService.getJobs();
    jobs.unshift(job);
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  },

  getStartups: (): StartupProject[] => {
    return [
      {
        id: 's1',
        ownerId: 'u1',
        name: 'Nexus Cloud',
        tagline: 'Infraestrutura serverless para edge computing',
        description: 'Estamos revolucionando como o deploy é feito.',
        logo: 'https://picsum.photos/60/60?random=101',
        tags: ['Rust', 'Wasm', 'Cloud'],
        status: 'Beta',
        upvotes: 156
      },
      {
        id: 's2',
        ownerId: 'u2',
        name: 'DevHealth',
        tagline: 'Monitoramento de saúde mental para times remotos',
        description: 'Otimize o burnout antes que ele aconteça.',
        logo: 'https://picsum.photos/60/60?random=102',
        tags: ['AI', 'React Native', 'HealthTech'],
        status: 'MVP',
        upvotes: 89
      }
    ];
  },

  getEvents: (): DevEvent[] => {
    return [
      {
        id: 'e1',
        title: 'Global AI Hackathon 2025',
        organizer: 'Google Cloud',
        date: '15 Mar - 17 Mar',
        type: 'Hackathon',
        image: 'https://picsum.photos/400/200?random=201',
        attendees: 1250,
        isOnline: true
      },
      {
        id: 'e2',
        title: 'React São Paulo Meetup',
        organizer: 'React Brasil',
        date: '20 Abr, 19:00',
        type: 'Meetup',
        image: 'https://picsum.photos/400/200?random=202',
        attendees: 200,
        isOnline: false
      }
    ];
  }
};
