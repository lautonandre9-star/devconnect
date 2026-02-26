import React, { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import api from '../src/services/api';

interface TrendingTopic {
  id: string;
  tag: string;
  postCount: number;
  category?: string;
}

const TrendingTopics: React.FC = () => {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const data = await api.trending.getTopics(4);
        setTopics(data);
      } catch (error) {
        console.error('Erro ao buscar tópicos em tendência:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchTopics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-800/40 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-indigo-400" />
        <h3 className="text-sm font-bold text-slate-100">TRENDING TOPICS</h3>
      </div>

      {topics.length > 0 ? (
        topics.map((topic, index) => (
          <button
            key={topic.id}
            className="w-full p-3 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 transition text-left border border-slate-700/50 hover:border-slate-600"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Tendência {index + 1}</p>
                <p className="text-sm font-bold text-slate-100">#{topic.tag}</p>
              </div>
              <span className="text-xs text-slate-500">{topic.postCount} posts</span>
            </div>
          </button>
        ))
      ) : (
        <p className="text-sm text-slate-500 text-center py-4">Nenhum tópico em tendência no momento</p>
      )}
    </div>
  );
};

export default TrendingTopics;