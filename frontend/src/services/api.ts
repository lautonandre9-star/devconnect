import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Instância do Axios com cookies automáticos
const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Envia cookies httpOnly automaticamente
});

// Interceptor para tratar erros globais
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      console.error('Rate limit excedido:', error.response.data);
      // Opcional: Aqui poderíamos disparar um evento global ou toast
    }

    if (error.response?.status === 401) {
      // Se não for rota de auth, redirecionar
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/auth') && currentPath !== '/') {
        // window.location.href = '/'; // Comentado para evitar loops, AuthContext já trata
      }
    }

    return Promise.reject(error);
  }
);

// 3. API completa com TODAS as funcionalidades
export const api = {
  // Métodos de conveniência
  get: (url: string) => apiInstance.get(url),
  post: (url: string, data: any) => apiInstance.post(url, data),

  // ===== JOBS =====
  jobs: {
    getAll: async (filters?: any) => {
      const response = await apiInstance.get('/jobs', { params: filters });
      return response.data;
    },
    create: async (jobData: any) => {
      const response = await apiInstance.post('/jobs', jobData);
      return response.data;
    },
    delete: async (jobId: string) => {
      const response = await apiInstance.delete(`/jobs/${jobId}`);
      return response.data;
    },
    post: async (jobData: any) => {
      const response = await apiInstance.post('/jobs', jobData);
      return response.data;
    }
  },

  // ===== APPLICATIONS =====
  applications: {
    create: async (jobId: string, coverLetter?: string) => {
      const response = await apiInstance.post('/applications', { jobId, coverLetter });
      return response.data;
    },
    getMy: async () => {
      const response = await apiInstance.get('/applications');
      return response.data;
    },
    getByUser: async () => {
      const response = await apiInstance.get('/applications');
      return response.data;
    },
    delete: async (appId: string) => {
      const response = await apiInstance.delete(`/applications/${appId}`);
      return response.data;
    },
    getForJob: async (jobId: string) => {
      const response = await apiInstance.get(`/jobs/${jobId}/applications`);
      return response.data;
    },
    updateStatus: async (appId: string, status: string) => {
      const response = await apiInstance.put(`/applications/${appId}/status`, { status });
      return response.data;
    }
  },

  // ===== AUTH =====
  auth: {
    login: async (email: string, password: string) => {
      const response = await apiInstance.post('/auth/login', { email, password });
      return response.data;
    },
    register: async (userData: any) => {
      const response = await apiInstance.post('/auth/register', userData);
      return response.data;
    },
    getMe: async () => {
      const response = await apiInstance.get('/auth/me');
      return response.data;
    },
    logout: async () => {
      await apiInstance.post('/auth/logout');
    }
  },

  // ===== USERS =====
  users: {
    getAll: async (searchQuery: string = '') => {
      const response = await apiInstance.get('/users', {
        params: searchQuery ? { search: searchQuery } : {}
      });
      return response.data;
    },
    getById: async (userId: string) => {
      const response = await apiInstance.get(`/users/${userId}`);
      return response.data;
    },
    updateProfile: async (data: any) => {
      const response = await apiInstance.put('/users/profile', data);
      return response.data;
    }
  },

  // ===== PROJECTS =====
  projects: {
    getAll: async (filters?: any) => {
      const response = await apiInstance.get('/projects', { params: filters });
      return response.data;
    },
    getById: async (id: string) => {
      const response = await apiInstance.get(`/projects/${id}`);
      return response.data;
    },
    create: async (data: any) => {
      const response = await apiInstance.post('/projects', data);
      return response.data;
    },
    update: async (id: string, data: any) => {
      const response = await apiInstance.put(`/projects/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      const response = await apiInstance.delete(`/projects/${id}`);
      return response.data;
    },
    like: async (id: string) => {
      const response = await apiInstance.post(`/projects/${id}/like`);
      return response.data;
    },
    unlike: async (id: string) => {
      const response = await apiInstance.delete(`/projects/${id}/like`);
      return response.data;
    },
    addComment: async (id: string, content: string) => {
      const response = await apiInstance.post(`/projects/${id}/comments`, { content });
      return response.data;
    }
  },

  // ===== CONVERSATIONS (Mensagens Diretas) =====
  conversations: {
    getAll: async () => {
      const response = await apiInstance.get('/conversations');
      return response.data;
    },
    getMessages: async (id: string, page = 1, limit = 50) => {
      const response = await apiInstance.get(`/conversations/${id}/messages`, {
        params: { page, limit }
      });
      return response.data;
    },
    sendMessage: async (data: {
      recipientId: string;
      content?: string;
      type?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO';
      fileUrl?: string;
      fileName?: string;
      audioUrl?: string;
      audioDuration?: number;
    }) => {
      const response = await apiInstance.post('/conversations/send', data);
      return response.data;
    },
    updateMessage: async (messageId: string, content: string) => {
      const response = await apiInstance.put(`/conversations/messages/${messageId}`, { content });
      return response.data;
    },
    deleteMessage: async (messageId: string) => {
      const response = await apiInstance.delete(`/conversations/messages/${messageId}`);
      return response.data;
    },
    forwardMessage: async (messageId: string, recipientId: string) => {
      const response = await apiInstance.post(`/conversations/messages/${messageId}/forward`, { recipientId });
      return response.data;
    },
    pinMessage: async (messageId: string) => {
      const response = await apiInstance.patch(`/conversations/messages/${messageId}/pin`);
      return response.data;
    },
    updateTheme: async (conversationId: string, theme: any) => {
      const response = await apiInstance.patch(`/conversations/${conversationId}/theme`, { theme });
      return response.data;
    },
    markAsRead: async (conversationId: string) => {
      const response = await apiInstance.post(`/conversations/${conversationId}/read`);
      return response.data;
    }
  },

  // ===== HUBS (Comunidades/Grupos) =====
  hubs: {
    getAll: async (searchQuery: string = '') => {
      const response = await apiInstance.get('/hubs', {
        params: searchQuery ? { search: searchQuery } : {}
      });
      return response.data;
    },
    getById: async (hubId: string) => {
      const response = await apiInstance.get(`/hubs/${hubId}`);
      return response.data;
    },
    create: async (data: { name: string; description?: string; icon?: string; color?: string }) => {
      const response = await apiInstance.post('/hubs', data);
      return response.data;
    },
    join: async (hubId: string) => {
      const response = await apiInstance.post(`/hubs/${hubId}/join`);
      return response.data;
    },
    leave: async (hubId: string) => {
      const response = await apiInstance.post(`/hubs/${hubId}/leave`);
      return response.data;
    },
    getMessages: async (hubId: string) => {
      const response = await apiInstance.get(`/hubs/${hubId}/messages`);
      return response.data;
    },
    sendMessage: async (hubId: string, content: string) => {
      const response = await apiInstance.post(`/hubs/${hubId}/messages`, { content });
      return response.data;
    },
    likeMessage: async (messageId: string) => {
      const response = await apiInstance.post(`/hubs/messages/${messageId}/like`);
      return response.data;
    },
    getMembers: async (hubId: string) => {
      const response = await apiInstance.get(`/hubs/${hubId}/members`);
      return response.data;
    },
    addMember: async (hubId: string, userId: string) => {
      const response = await apiInstance.post(`/hubs/${hubId}/members`, { userId });
      return response.data;
    },
    removeMember: async (hubId: string, userId: string) => {
      const response = await apiInstance.delete(`/hubs/${hubId}/members/${userId}`);
      return response.data;
    }
  },

  // ===== FRIENDSHIPS (Amizades) =====
  friendships: {
    sendRequest: async (receiverId: string) => {
      const response = await apiInstance.post('/friendships/send', { receiverId });
      return response.data;
    },
    acceptRequest: async (friendshipId: string) => {
      const response = await apiInstance.post(`/friendships/${friendshipId}/accept`);
      return response.data;
    },
    rejectRequest: async (friendshipId: string) => {
      const response = await apiInstance.delete(`/friendships/${friendshipId}/reject`);
      return response.data;
    },
    removeFriend: async (friendId: string) => {
      const response = await apiInstance.delete(`/friendships/${friendId}/remove`);
      return response.data;
    },
    getFriends: async () => {
      const response = await apiInstance.get('/friendships');
      return response.data;
    },
    getPendingRequests: async () => {
      const response = await apiInstance.get('/friendships/requests');
      return response.data;
    },
    checkStatus: async (targetUserId: string) => {
      const response = await apiInstance.get(`/friendships/status/${targetUserId}`);
      return response.data;
    }
  },

  // ===== BOOKMARKS =====
  bookmarks: {
    getAll: async () => {
      const response = await apiInstance.get('/bookmarks');
      return response.data;
    },
    add: async (projectId: string) => {
      const response = await apiInstance.post('/bookmarks', { projectId });
      return response.data;
    },
    remove: async (projectId: string) => {
      const response = await apiInstance.delete('/bookmarks', { data: { projectId } });
      return response.data;
    },
    check: async (projectId: string) => {
      const response = await apiInstance.get(`/bookmarks/check/${projectId}`);
      return response.data;
    }
  },

  // ===== SETTINGS =====
  settings: {
    get: async () => {
      const response = await apiInstance.get('/settings');
      return response.data;
    },
    update: async (data: any) => {
      const response = await apiInstance.put('/settings', data);
      return response.data;
    },
    reset: async () => {
      const response = await apiInstance.post('/settings/reset');
      return response.data;
    }
  },

  // ===== AI =====
  ai: {
    analyzeMatch: async (jobId: string, userId: string) => {
      const response = await apiInstance.post('/ai/analyze-match', { jobId, userId });
      return response.data;
    },
    improveResumeForJob: async (currentResume: string, jobDetails: string) => {
      const response = await apiInstance.post('/ai/improve-resume-for-job', { currentResume, jobDetails });
      return response.data.result;
    },
    generateInterviewQuestions: async (jobDetails: string) => {
      const response = await apiInstance.post('/ai/interview-questions', { jobDetails });
      return response.data.result;
    },
    improveResume: async (bio: string, skills: string[]) => {
      const response = await apiInstance.post('/ai/improve-resume', { bio, skills });
      return response.data.result;
    },
    getCareerAdvice: async (message: string, history: any[]) => {
      const response = await apiInstance.post('/ai/career-advice', { message, history });
      return response.data.result;
    },
    generateSkillRoadmap: async (currentSkills: string[]) => {
      const response = await apiInstance.post('/ai/skill-roadmap', { currentSkills });
      return response.data.result;
    }
  },

  // ===== STARTUPS =====
  startups: {
    getAll: async (params?: any) => {
      const response = await apiInstance.get('/startups', { params });
      return response.data;
    },
    getById: async (id: string) => {
      const response = await apiInstance.get(`/startups/${id}`);
      return response.data;
    },
    create: async (data: any) => {
      const response = await apiInstance.post('/startups', data);
      return response.data;
    },
    upvote: async (id: string) => {
      const response = await apiInstance.post(`/startups/${id}/upvote`);
      return response.data;
    }
  },

  // ===== EVENTS =====
  events: {
    getAll: async (params?: any) => {
      const response = await apiInstance.get('/events', { params });
      return response.data;
    },
    create: async (eventData: any) => {
      const response = await apiInstance.post('/events', eventData);
      return response.data;
    },
    getById: async (id: string) => {
      const response = await apiInstance.get(`/events/${id}`);
      return response.data;
    },
    attend: async (id: string) => {
      const response = await apiInstance.post(`/events/${id}/attend`);
      return response.data;
    },
    cancelAttend: async (id: string) => {
      const response = await apiInstance.delete(`/events/${id}/attend`);
      return response.data;
    }
  },

  // ===== FOLLOWS =====
  follows: {
    follow: async (userId: string) => {
      const response = await apiInstance.post(`/follows/${userId}`);
      return response.data;
    },
    unfollow: async (userId: string) => {
      const response = await apiInstance.delete(`/follows/${userId}`);
      return response.data;
    },
    getStatus: async (userId: string) => {
      const response = await apiInstance.get(`/follows/${userId}/status`);
      return response.data;
    },
    getCounts: async (userId: string) => {
      const response = await apiInstance.get(`/follows/${userId}/counts`);
      return response.data;
    },
    getFollowers: async (userId: string, page = 1) => {
      const response = await apiInstance.get(`/follows/${userId}/followers`, { params: { page } });
      return response.data;
    },
    getFollowing: async (userId: string, page = 1) => {
      const response = await apiInstance.get(`/follows/${userId}/following`, { params: { page } });
      return response.data;
    },
  },

  // ===== NOTIFICATIONS =====
  notifications: {
    getAll: async (page = 1, limit = 20) => {
      const response = await apiInstance.get('/notifications', { params: { page, limit } });
      return response.data;
    },
    markAsRead: async (id: string) => {
      const response = await apiInstance.put(`/notifications/${id}/read`);
      return response.data;
    },
    markAllAsRead: async () => {
      const response = await apiInstance.put('/notifications/mark-all-read');
      return response.data;
    },
    delete: async (id: string) => {
      const response = await apiInstance.delete(`/notifications/${id}`);
      return response.data;
    }
  },

  // ===== TRENDING =====
  trending: {
    getTopics: async (limit: number = 4) => {
      const response = await apiInstance.get('/trending/topics', { params: { limit } });
      return response.data;
    },
    getHashtags: async (limit: number = 10) => {
      const response = await apiInstance.get('/trending/hashtags', { params: { limit } });
      return response.data;
    }
  },

  // ===== SUGGESTIONS =====
  suggestions: {
    getUsers: async (limit: number = 3) => {
      const response = await apiInstance.get('/suggestions/users', { params: { limit } });
      return response.data;
    },
    getProjects: async (limit: number = 5) => {
      const response = await apiInstance.get('/suggestions/projects', { params: { limit } });
      return response.data;
    }
  }
};

export default api;