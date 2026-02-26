import React, { useEffect, useState } from 'react';
import { UserPlus, Star } from 'lucide-react';
import api from '../src/services/api';

interface SuggestedUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  type: 'developer' | 'company';
  bio?: string;
}

interface SuggestedUsersProps {
  onViewUser?: (userId: string) => void;
}

const SuggestedUsers: React.FC<SuggestedUsersProps> = ({ onViewUser }) => {
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await api.suggestions.getUsers(3);
        setUsers(data);
      } catch (error) {
        console.error('Erro ao buscar usuários sugeridos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    
    // Atualizar a cada 10 minutos
    const interval = setInterval(fetchUsers, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleViewUser = (userId: string) => {
    if (onViewUser) {
      onViewUser(userId);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-800/40 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-indigo-400" />
        <h3 className="text-sm font-bold text-slate-100">SUGESTÕES PARA VOCÊ</h3>
      </div>

      {users.length > 0 ? (
        users.map((user) => (
          <div
            key={user.id}
            className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition"
          >
            <div className="flex items-start gap-3">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                alt={user.name}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => handleViewUser(user.id)}
                  className="text-sm font-bold text-slate-100 hover:text-indigo-400 transition text-left truncate"
                >
                  {user.name}
                </button>
                <p className="text-xs text-slate-500 truncate">@{user.username}</p>
                {user.bio && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{user.bio}</p>
                )}
              </div>
              <button
                className="flex-shrink-0 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition text-white"
                title="Seguir"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-slate-500 text-center py-4">Nenhuma sugestão no momento</p>
      )}
    </div>
  );
};

export default SuggestedUsers;