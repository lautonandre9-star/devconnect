import api from '../src/services/api';

export interface TrendingTopic {
  id: string;
  tag: string;
  postCount: number;
  category?: string;
}

export interface SuggestedUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  type: 'developer' | 'company';
  bio?: string;
}

// Buscar tópicos em tendência
export const getTrendingTopics = async (limit: number = 4): Promise<TrendingTopic[]> => {
  try {
    const data = await api.trending.getTopics(limit);
    return data;
  } catch (error) {
    console.error('Erro ao buscar tópicos em tendência:', error);
    return [];
  }
};

// Buscar usuários sugeridos
export const getSuggestedUsers = async (limit: number = 3): Promise<SuggestedUser[]> => {
  try {
    const data = await api.suggestions.getUsers(limit);
    return data;
  } catch (error) {
    console.error('Erro ao buscar usuários sugeridos:', error);
    return [];
  }
};