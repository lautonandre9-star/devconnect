// src/components/CreatePostModal.tsx
import React, { useState } from 'react';
import { useProjects } from '../src/hooks';
import { X, Image as ImageIcon, Loader, Sparkles, Code2, Hash, Zap, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const { createProject } = useProjects();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    tags: '',
    code: '',
    language: 'html' as 'html' | 'react' | 'javascript',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await createProject({
        title: formData.title,
        description: formData.description,
        image: formData.image || undefined,
        tags: tagsArray,
        code: formData.code || undefined,
        language: formData.language,
      });

      setFormData({ title: '', description: '', image: '', tags: '', code: '', language: 'html' });
      onClose();
    } catch (error: any) {
      alert(error.message || 'Erro ao criar post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0d0f1e]/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-[#12152a] border border-slate-800/60 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-800/60 flex items-center justify-between bg-gradient-to-r from-indigo-600/5 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Novo Post</h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Compartilhe sua jornada épica</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-slate-800/60 rounded-xl transition text-slate-500 hover:text-white border border-transparent hover:border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Scrollable Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-8">
              {/* Primary Info */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Título do Projeto</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    minLength={5}
                    className="w-full px-5 py-4 bg-[#0d0f1e] border border-slate-800/60 rounded-2xl focus:border-indigo-500 outline-none text-white placeholder-slate-700 text-sm transition-all shadow-inner"
                    placeholder="Ex: 'UI Overhaul 2026'..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    minLength={10}
                    rows={4}
                    className="w-full px-5 py-4 bg-[#0d0f1e] border border-slate-800/60 rounded-2xl focus:border-indigo-500 outline-none text-white placeholder-slate-700 text-sm transition-all resize-none shadow-inner leading-relaxed"
                    placeholder="O que você construiu hoje? Conte os detalhes técnicos..."
                  />
                </div>
              </div>

              {/* Visual Assets and Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Link da Imagem</label>
                  <div className="relative group">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400" />
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full pl-11 pr-4 py-4 bg-[#0d0f1e] border border-slate-800/60 rounded-2xl focus:border-indigo-500 outline-none text-white placeholder-slate-700 text-[13px] shadow-inner"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tags (Semicolon)</label>
                  <div className="relative group">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400" />
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full pl-11 pr-4 py-4 bg-[#0d0f1e] border border-slate-800/60 rounded-2xl focus:border-indigo-500 outline-none text-white placeholder-slate-700 text-[13px] shadow-inner"
                      placeholder="React, Laravel..."
                    />
                  </div>
                </div>
              </div>

              {/* Preview Box */}
              {formData.image && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-800/60 group">
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/60 px-4 py-2 rounded-lg backdrop-blur-md">Preview do Asset</span>
                  </div>
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-40 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}

              {/* Code Forge Section */}
              <div className="pt-8 border-t border-slate-800/60">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl"><Code2 className="w-5 h-5 text-indigo-400" /></div>
                    The Code Forge
                  </h3>

                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value as any })}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-[10px] font-black text-slate-400 focus:border-indigo-500 outline-none uppercase tracking-widest cursor-pointer"
                  >
                    <option value="html">HTML Render</option>
                    <option value="javascript">JS Logic</option>
                    <option value="react">React V-DOM</option>
                  </select>
                </div>

                <div className="relative">
                  <textarea
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    rows={6}
                    className="w-full px-5 py-4 bg-black/40 border border-slate-800/60 rounded-2xl focus:border-indigo-500/50 outline-none text-green-400 font-mono text-xs resize-none shadow-inner leading-relaxed"
                    placeholder="// Cole seu código aqui para torná-lo interativo..."
                  />
                  <div className="absolute bottom-4 right-4 text-[9px] font-bold text-slate-700 uppercase tracking-widest">Sandbox Ready</div>
                </div>
              </div>
            </form>

            {/* Footer Actions */}
            <div className="px-8 py-6 bg-[#0d0f1e] border-t border-slate-800/60 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
              >
                Descartar
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading || !formData.title || !formData.description}
                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] transition-all disabled:opacity-50 flex items-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    Publicar Projeto <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;