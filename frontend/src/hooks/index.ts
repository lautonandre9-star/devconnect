// hooks/useJobs.ts
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Job } from '../types';

export const useJobs = (filters?: {
  type?: 'FullTime' | 'Internship' | 'Contract';
  location?: string;
  search?: string;
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { jobs: fetchedJobs } = await api.jobs.getAll(filters);
      setJobs(fetchedJobs);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters?.type, filters?.location, filters?.search]);

  const createJob = async (jobData: any) => {
    try {
      const newJob = await api.jobs.create(jobData);
      setJobs((prev) => [newJob, ...prev]);
      return newJob;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      await api.jobs.delete(jobId);
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return { jobs, loading, error, refetch: fetchJobs, createJob, deleteJob };
};

// hooks/useProjects.ts
export const useProjects = (filters?: {
  authorId?: string;
  search?: string;
}) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { projects: fetchedProjects } = await api.projects.getAll(filters);
      setProjects(fetchedProjects);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filters?.authorId, filters?.search]);

  const createProject = async (projectData: any) => {
    try {
      const newProject = await api.projects.create(projectData);
      setProjects((prev) => [newProject, ...prev]);
      return newProject;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const likeProject = async (projectId: string) => {
    try {
      await api.projects.like(projectId);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, likes: p.likes + 1 } : p))
      );
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const unlikeProject = async (projectId: string) => {
    try {
      await api.projects.unlike(projectId);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, likes: Math.max(0, p.likes - 1) } : p))
      );
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const addComment = async (projectId: string, content: string) => {
    try {
      await api.projects.addComment(projectId, content);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, comments: p.comments + 1 } : p))
      );
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    likeProject,
    unlikeProject,
    addComment,
  };
};

// hooks/useApplications.ts
export const useMyApplications = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const apps = await api.applications.getMy();
      setApplications(apps);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const applyToJob = async (jobId: string, coverLetter?: string) => {
    try {
      const newApp = await api.applications.create(jobId, coverLetter);
      setApplications((prev) => [newApp, ...prev]);
      return newApp;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const cancelApplication = async (appId: string) => {
    try {
      await api.applications.delete(appId);
      setApplications((prev) => prev.filter((app) => app.id !== appId));
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return {
    applications,
    loading,
    error,
    refetch: fetchApplications,
    applyToJob,
    cancelApplication,
  };
};

// hooks/useStartups.ts
export const useStartups = (filters?: {
  status?: 'MVP' | 'Beta' | 'Scaling';
  search?: string;
}) => {
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStartups = async () => {
    try {
      setLoading(true);
      const { startups: fetchedStartups } = await api.startups.getAll(filters);
      setStartups(fetchedStartups);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setStartups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, [filters?.status, filters?.search]);

  const createStartup = async (startupData: any) => {
    try {
      const newStartup = await api.startups.create(startupData);
      setStartups((prev) => [newStartup, ...prev]);
      return newStartup;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const upvoteStartup = async (startupId: string) => {
    try {
      await api.startups.upvote(startupId);
      setStartups((prev) =>
        prev.map((s) => (s.id === startupId ? { ...s, upvotes: s.upvotes + 1 } : s))
      );
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return {
    startups,
    loading,
    error,
    refetch: fetchStartups,
    createStartup,
    upvoteStartup,
  };
};

// hooks/useEvents.ts
export const useEvents = (filters?: {
  type?: 'Hackathon' | 'Meetup' | 'Webinar';
  upcoming?: boolean;
}) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { events: fetchedEvents } = await api.events.getAll(filters);
      setEvents(fetchedEvents);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters?.type, filters?.upcoming]);

  const attendEvent = async (eventId: string) => {
    try {
      await api.events.attend(eventId);
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, attendees: e.attendees + 1 } : e))
      );
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
    attendEvent,
  };
};
