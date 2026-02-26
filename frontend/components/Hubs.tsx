// src/components/Hubs.tsx
import React, { useState } from 'react';
import { useHubs } from '../src/hooks/useHubs';
import { useNavigate } from 'react-router-dom';
import {
  Hash,
  Users,
  Search,
  Plus,
  MessageSquare,
  Loader,
  ArrowRight,
  TrendingUp,
  Globe,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateHubModal } from './CreateHubModal';

interface HubsProps {
  onViewProfile?: (userId: string) => void;
}

const Hubs: React.FC<HubsProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { hubs, loading, refetch } = useHubs(searchTerm);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  const handleJoinChat = (hubId: string) => {
    navigate('/messages', { state: { selectedHub: hubId } });
  };

  if (loading && hubs.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto pb-20 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3 uppercase tracking-tight">
            <Users className="w-8 h-8 text-indigo-500" />
            Hubs da Comunidade
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            Explore grupos temáticos e conecte-se com desenvolvedores que compartilham seus interesses.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Criar Novo Grupo
        </button>
      </div>

      {/* Toolbar - Matches Reference Style */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
        <div className="lg:col-span-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar comunidades ou tecnologias..."
              className="w-full pl-12 pr-4 py-3.5 bg-[#12152a] border border-slate-800/60 rounded-2xl focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500 text-sm transition-all shadow-lg"
            />
          </div>
        </div>
        <div className="bg-[#12152a] border border-slate-800/60 rounded-2xl p-4 flex items-center justify-between px-6 shadow-lg">
          <div>
            <p className="text-2xl font-black text-white">{hubs.length}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Grupos Ativos</p>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Hubs Grid */}
      <AnimatePresence mode="popLayout">
        {hubs.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#12152a] border border-slate-800/60 border-dashed rounded-3xl p-16 text-center shadow-xl">
            <Globe className="w-16 h-16 text-slate-800 mx-auto mb-6" />
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest">Nenhuma comunidade</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8">
              {searchTerm
                ? `Não encontramos resultados para "${searchTerm}".`
                : 'Seja o primeiro a fundar uma comunidade épica!'}
            </p>
            <button
              onClick={() => searchTerm ? setSearchTerm('') : setShowCreateModal(true)}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all"
            >
              {searchTerm ? 'Limpar Busca' : 'Fundar Primeiro Hub'}
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hubs.map((hub, index) => (
              <motion.div
                key={hub.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-[#12152a] border border-slate-800/60 rounded-2xl overflow-hidden hover:border-indigo-500/40 transition-all shadow-xl flex flex-col"
              >
                {/* Visual Header */}
                <div
                  className="h-20 relative overflow-hidden"
                  style={{ backgroundColor: `${hub.color}15` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                  <div
                    className="absolute -bottom-6 left-6 w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-2xl border-4 border-[#12152a] z-10 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: hub.color || '#6366f1' }}
                  >
                    {hub.icon || <Hash className="w-7 h-7 text-white" />}
                  </div>
                </div>

                <div className="p-6 pt-10 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors truncate">
                      {hub.name}
                    </h3>
                  </div>

                  <p className="text-slate-400 text-xs font-medium line-clamp-2 mb-6 flex-1 leading-relaxed">
                    {hub.description || `Espaço para discussão técnica e networking focado em ${hub.name}.`}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-800/30">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[11px] font-black uppercase tracking-tighter">{hub.membersCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-[11px] font-black uppercase tracking-tighter">{hub.messagesCount || 0}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleJoinChat(hub.id)}
                      className="flex items-center gap-1.5 text-indigo-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-300 transition group/btn"
                    >
                      Entrar <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Modal Criar Grupo */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateHubModal
            onClose={() => {
              setShowCreateModal(false);
              refetch();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Hubs;