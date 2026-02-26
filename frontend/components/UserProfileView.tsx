// src/components/UserProfileView.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../src/services/api';
import {
  MessageSquare,
  UserPlus,
  UserCheck,
  UserX,
  Phone,
  Video,
  Loader2,
  MapPin,
  Briefcase,
  Calendar,
  Github,
  Linkedin,
  Globe,
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserProfileViewProps {
  userId: string;
  onStartChat: (userId: string) => void;
  onStartCall: (userId: string, type: 'audio' | 'video') => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  userId,
  onStartChat,
  onStartCall
}) => {
  const [user, setUser] = useState<any>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchFriendshipStatus();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const data = await api.users.getById(userId);
      setUser(data.user || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendshipStatus = async () => {
    try {
      const data = await api.friendships.checkStatus(userId);
      setFriendshipStatus(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendFriendRequest = async () => {
    setActionLoading(true);
    try {
      await api.friendships.sendRequest(userId);
      await fetchFriendshipStatus();
    } catch (err) {
      alert('Erro ao enviar solicitação');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!friendshipStatus?.friendshipId) return;
    setActionLoading(true);
    try {
      await api.friendships.acceptRequest(friendshipStatus.friendshipId);
      await fetchFriendshipStatus();
    } catch (err) {
      alert('Erro ao aceitar solicitação');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!confirm('Tem certeza que deseja remover esta amizade?')) return;
    setActionLoading(true);
    try {
      await api.friendships.removeFriend(userId);
      await fetchFriendshipStatus();
    } catch (err) {
      alert('Erro ao remover amigo');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Sparkles className="w-8 h-8 animate-pulse text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 bg-[#12152a] rounded-3xl border border-slate-800/60">
        <p className="text-slate-400 font-bold">Usuário não encontrado ou oculto.</p>
      </div>
    );
  }

  const renderFriendButton = () => {
    if (!friendshipStatus || friendshipStatus.status === 'self') return null;

    if (friendshipStatus.status === 'none') {
      return (
        <button
          onClick={handleSendFriendRequest}
          disabled={actionLoading}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
        >
          {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          Conectar
        </button>
      );
    }

    if (friendshipStatus.status === 'pending') {
      if (friendshipStatus.isSender) {
        return (
          <button
            disabled
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-xl font-black text-xs uppercase tracking-widest cursor-not-allowed"
          >
            <UserCheck className="w-4 h-4" />
            Solicitado
          </button>
        );
      } else {
        return (
          <button
            onClick={handleAcceptRequest}
            disabled={actionLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-600/20 transition-all disabled:opacity-50"
          >
            <UserCheck className="w-4 h-4" />
            Aceitar
          </button>
        );
      }
    }

    if (friendshipStatus.status === 'accepted') {
      return (
        <button
          onClick={handleRemoveFriend}
          disabled={actionLoading}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 border border-slate-700 transition-all text-slate-400 rounded-xl font-black text-xs uppercase tracking-widest"
        >
          <UserX className="w-4 h-4" />
          Remover
        </button>
      );
    }

    return null;
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-20 px-4">
      {/* Profile Header / Banner */}
      <div className="relative mb-20">
        <div className="h-48 md:h-64 rounded-3xl overflow-hidden relative shadow-2xl border border-slate-800/60 bg-[#12152a]">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-slate-900 to-fuchsia-900/30" />
          <div className="absolute inset-0 bg-[#0d0f1e]/40" />
        </div>

        {/* Floating Identity Area */}
        <div className="absolute -bottom-10 left-8 flex flex-col md:flex-row items-end gap-6 px-2">
          <div className="relative">
            <div className="p-1.5 rounded-[2.5rem] bg-[#0d0f1e] shadow-2xl ring-1 ring-slate-800/60">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                alt={user.name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-xl border-4 border-[#0d0f1e]">
              {user.type === 'developer' ? '🚀' : '✨'}
            </div>
          </div>

          <div className="pb-4 mb-2">
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight uppercase">
              {user.name}
            </h1>
            <div className="flex items-center gap-2 mt-1 px-1">
              <span className="text-indigo-400 font-black text-xs uppercase tracking-widest">@{user.username}</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{user.type === 'company' ? 'Recrutador' : user.role || 'Membro'}</span>
            </div>
          </div>
        </div>

        {/* Top Right Desktop Actions */}
        <div className="absolute -bottom-6 right-8 hidden md:flex items-center gap-3">
          {/* Message Button */}
          <button
            onClick={() => onStartChat(user.id)}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-100 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            Conversar
          </button>

          {/* Call Buttons (if friends) */}
          {friendshipStatus?.status === 'accepted' && (
            <div className="flex gap-2">
              <button onClick={() => onStartCall(user.id, 'audio')} className="p-2.5 bg-slate-800 hover:bg-indigo-500/10 border border-slate-700 rounded-xl text-slate-300 hover:text-indigo-400 transition-all shadow-lg"><Phone className="w-4.5 h-4.5" /></button>
              <button onClick={() => onStartCall(user.id, 'video')} className="p-2.5 bg-slate-800 hover:bg-indigo-500/10 border border-slate-700 rounded-xl text-slate-300 hover:text-indigo-400 transition-all shadow-lg"><Video className="w-4.5 h-4.5" /></button>
            </div>
          )}

          {/* Friend Action */}
          {renderFriendButton()}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">

          {/* Stats Summary Card */}
          <div className="bg-[#12152a] border border-slate-800/60 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp className="w-20 h-20 text-indigo-400" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-indigo-400" /> Atividade Social
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/60 transition-colors hover:bg-slate-900/60 shadow-inner group/stat">
                <p className="text-2xl font-black text-white leading-none mb-2">{user._count?.projects || 0}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover/stat:text-indigo-400 transition-colors">Projetos</p>
              </div>
              <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/60 transition-colors hover:bg-slate-900/60 shadow-inner group/stat">
                <p className="text-2xl font-black text-white leading-none mb-2">{user._count?.sentFriendships || 0}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover/stat:text-indigo-400 transition-colors">Conexões</p>
              </div>
            </div>
          </div>

          {/* Details Panel */}
          <div className="bg-[#12152a] border border-slate-800/60 rounded-3xl p-6 shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Informações Gerais</h3>
            <div className="space-y-4">
              {user.location && (
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors"><MapPin className="w-5 h-5" /></div>
                  <span className="text-xs font-bold text-slate-300">{user.location}</span>
                </div>
              )}
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors"><Calendar className="w-5 h-5" /></div>
                <span className="text-xs font-bold text-slate-300">Entrou em {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
              </div>

              {/* Social Links Grid */}
              <div className="pt-6 border-t border-slate-800/40 mt-6 grid grid-cols-2 gap-3">
                {user.github && (
                  <a href={user.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-all group">
                    <Github className="w-4 h-4 text-slate-400 group-hover:text-white" />
                    <span className="text-[10px] font-black text-slate-500 group-hover:text-white uppercase">GitHub</span>
                  </a>
                )}
                {user.website && (
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-all group">
                    <Globe className="w-4 h-4 text-slate-400 group-hover:text-white" />
                    <span className="text-[10px] font-black text-slate-500 group-hover:text-white uppercase">Site</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-6">

          {/* About Card */}
          <div className="bg-[#12152a] border border-slate-800/60 rounded-3xl p-8 shadow-xl">
            <h2 className="text-xl font-black text-white flex items-center gap-3 mb-6 uppercase tracking-tight">
              <div className="p-2 bg-indigo-500/10 rounded-xl"><Sparkles className="w-5 h-5 text-indigo-400" /></div>
              Sobre {user.name?.split(' ')[0] || user.username}
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm opacity-90 whitespace-pre-wrap">
              {user.bio || "O usuário ainda não compartilhou sua biografia."}
            </p>
          </div>

          {/* Skills Section for Devs */}
          {user.type === 'developer' && user.skills && (
            <div className="bg-[#12152a] border border-slate-800/60 rounded-3xl p-8 shadow-xl">
              <h2 className="text-xl font-black text-white flex items-center gap-3 mb-6 uppercase tracking-tight">
                <div className="p-2 bg-purple-500/10 rounded-xl"><Award className="w-5 h-5 text-purple-400" /></div>
                Especialidades Tech
              </h2>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(user.skills) ? user.skills.map((skill: string, i: number) => (
                  <span key={i} className="px-4 py-2 bg-indigo-500/5 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/10 transition-all">
                    {skill}
                  </span>
                )) : (typeof user.skills === 'string' && user.skills.length > 0) && user.skills.split(',').map((skill: string, i: number) => (
                  <span key={i} className="px-4 py-2 bg-indigo-500/5 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/10 transition-all">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Project Highlights Grid */}
          {user.type === 'developer' && user.projects && user.projects.length > 0 && (
            <div className="bg-[#12152a] border border-slate-800/60 rounded-3xl p-8 shadow-xl">
              <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3 mb-8">
                <div className="p-2 bg-green-500/10 rounded-xl"><Layers className="w-5 h-5 text-green-400" /></div>
                Vitrine de Projetos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.projects.map((project: any) => (
                  <div key={project.id} className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl group hover:border-indigo-500/40 transition-all cursor-pointer shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-black text-white text-sm uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{project.title}</h4>
                      <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-4">{project.description}</p>
                    <div className="flex items-center gap-2 overflow-hidden">
                      {project.tags?.slice(0, 2).map((tag: string, i: number) => (
                        <span key={i} className="text-[9px] font-black text-indigo-500 bg-indigo-500/5 px-2 py-0.5 rounded uppercase">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Company Specific Info */}
          {user.type === 'company' && (
            <div className="bg-[#12152a] border border-slate-800/60 border-dashed rounded-3xl p-20 text-center shadow-xl grayscale opacity-50">
              <Briefcase className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-black text-slate-600 uppercase tracking-widest">Painel Institucional</h3>
              <p className="text-slate-600 text-sm italic">O histórico de vagas desta organização está sendo sincronizado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;