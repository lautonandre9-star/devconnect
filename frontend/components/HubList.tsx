// src/components/HubList.tsx
import React from 'react';
import { useHubs } from '../src/hooks/useHubs';
import { Loader2, Users, Hash, ChevronRight, MessageSquare, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface HubsListProps {
  searchQuery: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const HubsList: React.FC<HubsListProps> = ({ searchQuery, selectedId, onSelect }) => {
  const { hubs, loading } = useHubs(searchQuery);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mb-4" />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Compilando Grids...</span>
      </div>
    );
  }

  if (hubs.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-12 h-12 bg-[#12152a] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-800/60 shadow-xl">
          <Hash className="w-6 h-6 text-slate-700" />
        </div>
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">
          {searchQuery ? 'Fragmentos não encontrados' : 'Hubs Desativados'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto no-scrollbar pr-1">
      {hubs.map((hub, index) => {
        const isSelected = selectedId === hub.id;

        return (
          <motion.button
            key={hub.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            onClick={() => onSelect(hub.id)}
            className={`w-full group relative overflow-hidden flex items-center gap-4 p-4 rounded-2xl transition-all border ${isSelected
                ? 'bg-[#12152a] border-indigo-500/40 shadow-lg shadow-indigo-600/5'
                : 'bg-transparent border-transparent hover:bg-[#12152a]/50 hover:border-slate-800/60'
              }`}
          >
            {/* Active Glow Indicator */}
            {isSelected && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />
            )}

            <div
              className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-2xl relative z-10 transition-all ${isSelected ? 'scale-110 rotate-3' : 'group-hover:scale-105'
                }`}
              style={{ backgroundColor: hub.color || '#4F46E5' }}
            >
              {hub.icon || <Hash className="w-5 h-5 text-white" />}
              <div className="absolute -inset-1 border border-white/20 rounded-xl opacity-20" />
            </div>

            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className={`text-xs font-black uppercase tracking-tight truncate ${isSelected ? 'text-white italic' : 'text-slate-200'}`}>
                  #{hub.name}
                </h3>
                {hub.messagesCount > 100 && (
                  <Sparkles className="w-3 h-3 text-yellow-500/60" />
                )}
              </div>

              <div className="flex items-center gap-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                <span className="flex items-center gap-1.5 font-mono">
                  <Users className="w-3 h-3 text-slate-700" />
                  {hub.membersCount}
                </span>
                <span className="flex items-center gap-1.5 font-mono">
                  <MessageSquare className="w-3 h-3 text-slate-700" />
                  {hub.messagesCount}
                </span>
              </div>
            </div>

            {!isSelected && (
              <ChevronRight className="w-4 h-4 text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity -ml-2" />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
export default HubsList;