// src/components/FollowStats.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useFollow } from '../src/hooks/useFollow';
import { useAuth } from '../src/contexts/AuthContext';
import { api } from '../src/services/api';

interface FollowUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  role?: string;
}

interface FollowStatsProps {
  userId: string;
  onViewProfile?: (userId: string) => void;
}

type ModalType = 'followers' | 'following' | null;

const FollowStats: React.FC<FollowStatsProps> = ({ userId, onViewProfile }) => {
  const { user: currentUser } = useAuth();
  const { counts, loading } = useFollow(userId, currentUser?.id);
  const [modal, setModal] = useState<ModalType>(null);
  const [modalUsers, setModalUsers] = useState<FollowUser[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const openModal = async (type: ModalType) => {
    if (!type) return;
    setModal(type);
    setModalLoading(true);
    setModalUsers([]);
    try {
      const data = type === 'followers'
        ? await api.follows.getFollowers(userId)
        : await api.follows.getFollowing(userId);
      setModalUsers(type === 'followers' ? data.followers : data.following);
    } catch (err) {
      console.error('Erro ao carregar lista:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModal(null);
    setModalUsers([]);
  };

  const handleViewProfile = (uid: string) => {
    closeModal();
    onViewProfile?.(uid);
  };

  if (loading) {
    return (
      <div className="flex gap-6">
        {[0, 1].map(i => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-8 h-5 bg-slate-800 rounded animate-pulse" />
            <div className="w-14 h-3 bg-slate-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-6">
        <button
          onClick={() => openModal('followers')}
          className="flex flex-col items-center gap-0.5 group hover:opacity-80 transition-opacity"
        >
          <span className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors">
            {counts.followersCount.toLocaleString()}
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {counts.followersCount === 1 ? 'Seguidor' : 'Seguidores'}
          </span>
        </button>

        <button
          onClick={() => openModal('following')}
          className="flex flex-col items-center gap-0.5 group hover:opacity-80 transition-opacity"
        >
          <span className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors">
            {counts.followingCount.toLocaleString()}
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            A Seguir
          </span>
        </button>
      </div>

      {/* Modal de lista */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500]"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm bg-[#12152a] border border-slate-800/60 rounded-2xl shadow-2xl z-[501] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">
                  {modal === 'followers' ? 'Seguidores' : 'A Seguir'}
                </h3>
                <button onClick={closeModal} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Lista */}
              <div className="max-h-80 overflow-y-auto no-scrollbar">
                {modalLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                  </div>
                ) : modalUsers.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 text-sm">
                    {modal === 'followers' ? 'Sem seguidores ainda.' : 'Não segue ninguém ainda.'}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60">
                    {modalUsers.map(u => (
                      <button
                        key={u.id}
                        onClick={() => handleViewProfile(u.id)}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-800/40 transition-colors text-left"
                      >
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`}
                          alt={u.name}
                          className="w-9 h-9 rounded-full border border-slate-700 object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{u.name}</p>
                          <p className="text-xs text-slate-500 truncate">@{u.username}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FollowStats;