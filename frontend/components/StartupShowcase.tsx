import React, { useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useStartups } from '../src/hooks';
import {
  Rocket,
  TrendingUp,
  ExternalLink,
  Github,
  Loader,
  Plus,
  X,
  Sparkles,
  Code2,
  Play,
  Search,
  Clock,
  ChevronRight,
  ArrowUpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectPreview from './ProjectPreview';

export const StartupShowcase: React.FC<{ onViewProfile: (userId: string) => void }> = ({ onViewProfile }) => {
  const { user } = useAuth();
  const { startups, loading, createStartup, upvoteStartup } = useStartups();
  const [upvotedStartups, setUpvotedStartups] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [previewProject, setPreviewProject] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'trending' | 'recent'>('all');

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    logo: '',
    tags: '',
    status: 'MVP' as 'MVP' | 'Beta' | 'Scaling',
    websiteUrl: '',
    githubUrl: '',
    code: '',
    language: 'html' as 'html' | 'react' | 'javascript',
  });

  const handleUpvote = async (startupId: string) => {
    if (upvotedStartups.has(startupId)) return;
    try {
      await upvoteStartup(startupId);
      setUpvotedStartups(prev => new Set(prev).add(startupId));
    } catch (error) {
      console.error('Erro ao dar upvote:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      await createStartup({ ...formData, tags: tagsArray });
      setFormData({ name: '', tagline: '', description: '', logo: '', tags: '', status: 'MVP', websiteUrl: '', githubUrl: '', code: '', language: 'html' });
      setShowCreateModal(false);
    } catch (error: any) {
      alert(error.message || 'Erro ao criar startup');
    } finally {
      setCreating(false);
    }
  };

  const statusColors = {
    MVP: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
    Beta: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
    Scaling: 'bg-green-500/10 text-green-400 border-green-500/25',
  };

  const filteredStartups = startups
    .filter(s => {
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.tagline.toLowerCase().includes(q) || s.tags.some(t => t.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (filter === 'trending') return b.upvotes - a.upvotes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto pb-20 px-4">
      {/* Header Slider / Featured Project (Optional, matching image 2 style) */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white mb-2">Showcase de Projetos</h1>
        <p className="text-slate-400 text-sm">Descubra projetos inovadores e talentos da comunidade.</p>
      </div>

      {/* Toolbar - Matches Reference 2 */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8 bg-[#12152a] p-4 rounded-2xl border border-slate-800/60 shadow-lg">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar projetos ou tecnologias..."
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Todos', icon: Rocket },
            { id: 'trending', label: 'Especialistas', icon: TrendingUp },
            { id: 'recent', label: 'Mais Recentes', icon: Clock },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${filter === f.id
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
            >
              <f.icon className="w-3.5 h-3.5" />
              <span>{f.label}</span>
            </button>
          ))}
          {user?.type === 'developer' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20 transition-all uppercase tracking-widest flex items-center gap-2 ml-auto"
            >
              <Plus className="w-4 h-4" /> Adicionar Projeto
            </button>
          )}
        </div>
      </div>

      {/* Startups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredStartups.map((startup, index) => (
            <motion.div
              key={startup.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.04 }}
              className="bg-[#12152a] border border-slate-800/60 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all group shadow-xl"
            >
              {/* Featured Image Area */}
              <div className="relative h-48 overflow-hidden bg-slate-900">
                <img
                  src={startup.logo || `https://api.dicebear.com/7.x/shapes/svg?seed=${startup.id}`}
                  alt={startup.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />

                {/* Upvote Badge Top Right */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleUpvote(startup.id); }}
                    disabled={upvotedStartups.has(startup.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-xl transition-all ${upvotedStartups.has(startup.id)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20'
                      }`}
                  >
                    <ArrowUpCircle className="w-4 h-4" /> {startup.upvotes}
                  </button>
                </div>

                {/* Status Badge Bottom Left Overlay */}
                <div className="absolute bottom-3 left-3">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${statusColors[startup.status as keyof typeof statusColors]}`}>
                    {startup.status}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-black text-white group-hover:text-indigo-400 transition leading-tight truncate">
                    {startup.name}
                  </h3>
                  {startup.code && <Code2 className="w-4 h-4 text-green-400" />}
                </div>
                <p className="text-slate-400 text-xs font-bold mb-3 truncate">{startup.tagline}</p>
                <p className="text-slate-300 text-sm mb-5 line-clamp-2 h-10">
                  {startup.description}
                </p>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {startup.tags?.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer bg-indigo-400/5 px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPreviewProject({
                      id: startup.id,
                      name: startup.name,
                      description: startup.description,
                      code: startup.code,
                      language: startup.language || 'html',
                    })}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    Explorar Código <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                  {(startup.websiteUrl || startup.githubUrl) && (
                    <div className="flex gap-2">
                      {startup.githubUrl && (
                        <a href={startup.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-800/60 rounded-xl text-slate-400 hover:text-white transition">
                          <Github className="w-4.5 h-4.5" />
                        </a>
                      )}
                      {startup.websiteUrl && (
                        <a href={startup.websiteUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-800/60 rounded-xl text-slate-400 hover:text-white transition">
                          <ExternalLink className="w-4.5 h-4.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal - Polished styling */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0e1120] rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-800/60 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
                <h2 className="text-xl font-black text-white uppercase tracking-widest">Adicionar Projeto</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleCreate} className="p-8 space-y-5 overflow-y-auto no-scrollbar">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome do Projeto *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
                      className="w-full px-5 py-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-500 text-white placeholder-slate-600 transition" placeholder="Nome da sua ideia" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status *</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-5 py-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-500 text-white appearance-none transition">
                      <option value="MVP">MVP</option>
                      <option value="Beta">Beta</option>
                      <option value="Scaling">Scaling</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tagline (Bio Curta) *</label>
                  <input type="text" value={formData.tagline} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} required minLength={10}
                    className="w-full px-5 py-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-500 text-white placeholder-slate-600 transition" placeholder="A ideia em uma frase impactante" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Descrição Completa *</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required minLength={50} rows={4}
                    className="w-full px-5 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-500 text-white placeholder-slate-600 transition resize-none" placeholder="Explique seu projeto profundamente..." />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Banner Image (URL) *</label>
                    <input type="url" value={formData.logo} onChange={(e) => setFormData({ ...formData, logo: e.target.value })} required
                      className="w-full px-5 py-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-500 text-white placeholder-slate-600 transition" placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tags (Svelte, Python...)</label>
                    <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl focus:outline-none focus:border-indigo-500 text-white placeholder-slate-600 transition" placeholder="Separadas por vírgula" />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-800/60 sticky bottom-0 bg-[#0e1120] pb-2">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest hover:text-white transition">Cancelar</button>
                  <button type="submit" disabled={creating} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2">
                    {creating ? <Loader className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Publicar Projeto</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      {previewProject && (
        <ProjectPreview isOpen={!!previewProject} onClose={() => setPreviewProject(null)} project={previewProject} />
      )}
    </div>
  );
};

export default StartupShowcase;