import React, { useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useProjects } from '../src/hooks';
import {
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Image as ImageIcon,
  Hash,
  Code2,
  Plus,
  Bookmark,
  TrendingUp,
  Clock,
  Eye,
  Link as LinkIcon,
  Sparkles,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BookmarkButton from './BookmarkButton';
import CreatePostModal from './CreatePostModal';
import ProjectPreview from './ProjectPreview';

export const Feed: React.FC<{ onViewProfile: (userId: string) => void }> = ({ onViewProfile }) => {
  const { user } = useAuth();
  const { projects, loading, likeProject, unlikeProject, addComment } = useProjects();

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'trending' | 'recent'>('all');
  const [previewProject, setPreviewProject] = useState<any>(null);

  const handleLike = async (projectId: string) => {
    try {
      if (likedPosts.has(projectId)) {
        await unlikeProject(projectId);
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(projectId);
          return newSet;
        });
      } else {
        await likeProject(projectId);
        setLikedPosts(prev => new Set(prev).add(projectId));
      }
    } catch (error) {
      console.error('Erro ao dar like:', error);
    }
  };

  const handleComment = async (projectId: string) => {
    if (!commentText.trim()) return;
    try {
      await addComment(projectId, commentText);
      setCommentText('');
      setCommentingOn(null);
    } catch (error) {
      console.error('Erro ao comentar:', error);
    }
  };

  const handleShare = (project: any) => {
    const url = `${window.location.origin}/project/${project.id}`;
    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: project.description,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copiado para a área de transferência!');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const filteredProjects = projects
    .filter(p => {
      if (filter === 'trending') return p.likes > 5;
      return true;
    })
    .sort((a, b) => {
      if (filter === 'trending') return b.likes - a.likes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 px-4">
      {/* Main Feed Column */}
      <div className="lg:col-span-8 space-y-6 pb-20">
        {/* Page Title & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-black text-white">Feed Social</h1>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'Todos', icon: Hash },
              { id: 'trending', label: 'Especialistas', icon: TrendingUp },
              { id: 'recent', label: 'Mais Recentes', icon: Clock },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${filter === f.id
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
              >
                <f.icon className="w-3.5 h-3.5" />
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Post Composer - Matches Reference */}
        <div className="bg-[#12152a] border border-slate-800/60 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="flex gap-4">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
              className="w-10 h-10 rounded-xl object-cover"
              alt={user?.name}
            />
            <div className="flex-1">
              <textarea
                onClick={() => setShowCreatePost(true)}
                readOnly
                placeholder="O que você está desenvolvendo hoje?"
                className="w-full bg-transparent border-none text-slate-300 placeholder-slate-500 text-sm py-2 focus:outline-none resize-none cursor-pointer"
                rows={2}
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/60">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowCreatePost(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition text-slate-400 hover:text-indigo-400 text-xs font-bold">
                <ImageIcon className="w-4 h-4" /> Imagem
              </button>
              <button onClick={() => setShowCreatePost(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition text-slate-400 hover:text-green-400 text-xs font-bold">
                <Code2 className="w-4 h-4" /> Código
              </button>
              <button onClick={() => setShowCreatePost(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition text-slate-400 hover:text-purple-400 text-xs font-bold">
                <Hash className="w-4 h-4" /> Tag
              </button>
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20 transition-all uppercase tracking-widest"
            >
              Publicar
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="bg-[#12152a] border border-slate-800/60 rounded-2xl p-12 text-center border-dashed">
            <Code2 className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Nada por aqui ainda</h3>
            <p className="text-slate-500 text-sm mb-6">Explore outros filtros ou comece uma conversa!</p>
            <button onClick={() => setShowCreatePost(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-600/20">
              Compartilhar Primeiro Post
            </button>
          </div>
        )}

        {/* Posts Loop */}
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project, index) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#12152a] border border-slate-800/60 rounded-2xl overflow-hidden shadow-sm hover:border-slate-700 transition-all group"
            >
              {/* Post Header */}
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={project.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.authorId}`}
                      className="w-10 h-10 rounded-xl object-cover cursor-pointer"
                      alt={project.authorName}
                      onClick={() => onViewProfile(project.authorId)}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#12152a] rounded-full" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-white text-sm hover:text-indigo-400 transition cursor-pointer" onClick={() => onViewProfile(project.authorId)}>
                        {project.authorName}
                      </h4>
                      <span className="text-slate-500 text-xs">• online</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">@{project.authorId.slice(0, 8)} • {formatDate(project.createdAt)}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-800 rounded-lg transition text-slate-500">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Post Content */}
              <div className="px-5 pb-4">
                <h3 className="text-base font-bold text-white mb-2">{project.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">{project.description}</p>

                {/* Image if any */}
                {project.image && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-slate-800">
                    <img src={project.image} className="w-full object-cover max-h-[400px]" alt={project.title} />
                  </div>
                )}

                {/* Code Block if any */}
                {project.code && (
                  <div className="mb-4 bg-slate-900/80 rounded-xl p-4 border border-slate-800/60 relative overflow-hidden group/code">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{project.language || 'Code'}</span>
                      <button onClick={() => setPreviewProject({ ...project, name: project.title })} className="text-[10px] text-slate-500 hover:text-indigo-400 font-bold transition">Executar Código</button>
                    </div>
                    <pre className="text-xs text-indigo-100 font-mono overflow-x-auto whitespace-pre-wrap">
                      <code>{project.code.slice(0, 200)}{project.code.length > 200 ? '...' : ''}</code>
                    </pre>
                  </div>
                )}

                {/* Hashtags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag: string, i: number) => (
                      <span key={i} className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Footer / Actions */}
              <div className="px-3 py-2 border-t border-slate-800/30 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button onClick={() => handleLike(project.id)} className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${likedPosts.has(project.id) ? 'text-red-400 bg-red-400/10' : 'text-slate-400 hover:bg-slate-800'}`}>
                    <Heart className={`w-4.5 h-4.5 ${likedPosts.has(project.id) ? 'fill-current' : ''}`} />
                    <span className="text-xs font-bold">{project.likes || 0}</span>
                  </button>
                  <button onClick={() => setCommentingOn(commentingOn === project.id ? null : project.id)} className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-slate-400 hover:bg-slate-800">
                    <MessageSquare className="w-4.5 h-4.5" />
                    <span className="text-xs font-bold">{project.comments || 0}</span>
                  </button>
                  <button onClick={() => handleShare(project)} className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-slate-400 hover:bg-slate-800">
                    <Share2 className="w-4.5 h-4.5" />
                  </button>
                </div>
                <BookmarkButton projectId={project.id} size="sm" />
              </div>

              {/* Comments Box */}
              <AnimatePresence>
                {commentingOn === project.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-5 pb-5 border-t border-slate-800/30 overflow-hidden">
                    <div className="pt-4 flex gap-3">
                      <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} className="w-8 h-8 rounded-lg" alt="" />
                      <div className="flex-1 space-y-3">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Adicione um comentário..."
                          className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-indigo-500 transition text-slate-200 resize-none"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setCommentingOn(null)} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-300">Cancelar</button>
                          <button onClick={() => handleComment(project.id)} disabled={!commentText.trim()} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-black uppercase tracking-widest disabled:opacity-50">Comentar</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {/* Right Sidebar Column */}
      <div className="lg:col-span-4 space-y-6 hidden lg:block pb-20">
        {/* Trending Topics */}
        <div className="bg-[#12152a] border border-slate-800/60 rounded-2xl p-5">
          <h3 className="text-sm font-black text-white mb-4 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" /> Trending Topics
          </h3>
          <div className="space-y-4">
            {[
              { tag: 'rust_concurrency', count: '1.2k', category: 'Backend' },
              { tag: 'nextjs15_beta', count: '850', category: 'Frontend' },
              { tag: 'typescript_decorators', count: '620', category: 'Dev' },
              { tag: 'webassembly_games', count: '430', category: 'General' },
            ].map((topic, i) => (
              <div key={i} className="flex flex-col group cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition">#{topic.tag}</span>
                  <span className="text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded uppercase">{topic.count} posts</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5">{topic.category} • Trending agora</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center justify-center gap-1 group">
            Ver mais tendências <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Pro Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 shadow-xl shadow-indigo-600/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
          <h4 className="text-white font-black text-lg mb-2 relative">DevConnect Pro</h4>
          <p className="text-indigo-100 text-xs leading-relaxed mb-4 relative opacity-90">
            Acesse filtros avançados, métricas de IA e visibilidade prioritária para empresas.
          </p>
          <button className="w-full bg-white text-indigo-600 font-black text-xs py-3 rounded-xl uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98]">
            Ver Planos
          </button>
        </div>

        {/* Suggestions */}
        <div className="bg-[#12152a] border border-slate-800/60 rounded-2xl p-5">
          <h3 className="text-sm font-black text-white mb-4 uppercase tracking-widest">Sugestões para você</h3>
          <div className="space-y-4">
            {[
              { name: 'Sarah Drasner', handle: 'sdras', type: 'Expert', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=74' },
              { name: 'Dan Abramov', handle: 'gaearon', type: 'Creator', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=23' },
              { name: 'Guillermo Rauch', handle: 'rauchg', type: 'CEO', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=12' },
            ].map((suggest, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <img src={suggest.avatar} className="w-9 h-9 rounded-xl grayscale group-hover:grayscale-0 transition-all" alt="" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate group-hover:text-indigo-400 transition">{suggest.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">@{suggest.handle} • {suggest.type}</p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition">
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Links */}
        <div className="px-2 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-600 font-medium tracking-tight">
          <a href="#" className="hover:text-slate-400">Sobre</a>
          <a href="#" className="hover:text-slate-400">Acessibilidade</a>
          <a href="#" className="hover:text-slate-400">Termos</a>
          <a href="#" className="hover:text-slate-400">Privacidade</a>
          <span>© 2024 DevConnect ITEL</span>
        </div>
      </div>

      {/* FAB - Matches Reference Bottom Right */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-indigo-600/40 hover:scale-110 hover:bg-indigo-500 transition-all group z-40 active:scale-95">
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-slate-950 rounded-full text-[10px] font-black flex items-center justify-center">2</span>
      </button>

      {/* Modals */}
      <CreatePostModal isOpen={showCreatePost} onClose={() => setShowCreatePost(false)} />
      {previewProject && (
        <ProjectPreview isOpen={!!previewProject} onClose={() => setPreviewProject(null)} project={previewProject} />
      )}
    </div>
  );
};

export default Feed;