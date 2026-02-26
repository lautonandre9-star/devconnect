// src/components/CreateHubModal.tsx
import React, { useState } from 'react';
import { X, Hash, Palette, Sparkles, ChevronRight, Zap, Target } from 'lucide-react';
import { api } from '../src/services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateHubModalProps {
  onClose: () => void;
}

const COLORS = [
  '#4F46E5', // Indigo
  '#EC4899', // Pink
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

export const CreateHubModal: React.FC<CreateHubModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: COLORS[0]
  });
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setCreating(true);
    try {
      const payload: any = { name: formData.name.trim(), color: formData.color };
      if (formData.description?.trim()) payload.description = formData.description.trim();
      if (formData.icon?.trim()) payload.icon = formData.icon.trim();

      await api.hubs.create(payload);
      onClose();
      window.location.reload();
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || 'Erro ao criar grupo';
      alert(message);
    } finally {
      setCreating(false);
    }
  };

  return (
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
        className="relative bg-[#12152a] border border-slate-800/60 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] max-w-lg w-full overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-800/60 flex items-center justify-between bg-gradient-to-r from-indigo-600/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Criar Hub</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inicie uma nova comunidade</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-800/60 rounded-xl transition text-slate-500 hover:text-white border border-transparent hover:border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Identity Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome da Comunidade</label>
              <div className="relative group">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: 'rust-geeks'..."
                  maxLength={50}
                  className="w-full bg-[#0d0f1e] border border-slate-800/60 rounded-2xl pl-11 pr-4 py-4 focus:border-indigo-500 outline-none text-white placeholder-slate-700 text-sm transition-all shadow-inner font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ícone / Emoji</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="⚛️"
                  maxLength={2}
                  className="w-full bg-[#0d0f1e] border border-slate-800/60 rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none text-white placeholder-slate-700 text-lg text-center transition-all shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Atalho</label>
                <div className="h-[60px] bg-[#0d0f1e] border border-slate-800/60 rounded-2xl flex items-center justify-center text-xs font-black text-slate-600 uppercase tracking-widest italic">
                  #{formData.name.slice(0, 3).toLowerCase()}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="O que torna este hub único?"
                maxLength={500}
                rows={3}
                className="w-full bg-[#0d0f1e] border border-slate-800/60 rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none text-white placeholder-slate-700 text-sm transition-all resize-none shadow-inner leading-relaxed"
              />
            </div>
          </div>

          {/* Style Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 px-1">
              <Palette className="w-4 h-4 text-slate-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Identidade Visual</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`relative h-10 rounded-xl transition-all duration-300 group ${formData.color === color
                      ? 'scale-110 shadow-[0_0_20px_rgba(255,255,255,0.1)] ring-2 ring-white/20'
                      : 'hover:scale-105 opacity-60'
                    }`}
                  style={{ backgroundColor: color }}
                >
                  {formData.color === color && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full shadow-lg" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-white hover:bg-slate-800/60 transition-all border border-transparent hover:border-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating || !formData.name.trim()}
              className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Forjar Hub <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

function Loader2(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
  );
}