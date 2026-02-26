// src/components/GlobalSearchBar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Building2, X, Sparkles, ChevronRight, UserRound } from 'lucide-react';
import { api } from '../src/services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  type: 'developer' | 'company';
  role?: string | null;
}

interface GlobalSearchBarProps {
  onSelectUser: (userId: string) => void;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({ onSelectUser }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fechar resultados ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar usuários
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const searchUsers = async () => {
      setLoading(true);
      try {
        const data = await api.users.getAll(query);
        setResults(data.users || []);
        setShowResults(true);
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectUser = (userId: string) => {
    onSelectUser(userId);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-lg">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: 'Senior Dev' ou 'Innovators Inc'..."
          className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl pl-12 pr-10 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-800/60 transition-all shadow-inner"
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                setQuery('');
                setShowResults(false);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1 hover:bg-slate-700 rounded-lg transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-full mt-3 w-full bg-[#12152a] border border-slate-800/60 rounded-3xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] overflow-hidden z-[100] backdrop-blur-xl"
          >
            {/* Context Header */}
            <div className="p-4 bg-slate-900/40 border-b border-slate-800/60 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Explorar Comunidade</span>
              {loading && <div className="w-3 h-3 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mr-2" />}
            </div>

            <div className="max-h-[450px] overflow-y-auto no-scrollbar py-2">
              {results.length > 0 ? (
                results.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user.id)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-900/40 transition-all text-left group"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                        alt={user.name}
                        className="w-11 h-11 rounded-1.5xl object-cover ring-2 ring-slate-800/60 group-hover:ring-indigo-500/40 transition-all"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg border-2 border-[#12152a] flex items-center justify-center ${user.type === 'developer' ? 'bg-indigo-600' : 'bg-fuchsia-600'}`}>
                        {user.type === 'developer' ? <UserRound className="w-2.5 h-2.5 text-white" /> : <Building2 className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-black text-white group-hover:text-indigo-400 transition-colors truncate tracking-tight">{user.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium truncate">@{user.username}</p>
                      {user.type === 'developer' && user.role && (
                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter mt-0.5">{user.role}</p>
                      )}
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-4 h-4 text-indigo-500" />
                    </div>
                  </button>
                ))
              ) : !loading && (
                <div className="py-12 px-8 text-center bg-slate-900/10">
                  <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 opacity-40">
                    <User className="w-7 h-7 text-slate-500" />
                  </div>
                  <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">Nenhum resultado encontrado para o termo pesquisado</h4>
                </div>
              )}
            </div>

            {results.length > 0 && (
              <div className="p-3 bg-slate-950/40 border-t border-slate-800/60 text-center">
                <button className="text-[9px] font-black text-slate-600 hover:text-indigo-400 transition-colors uppercase tracking-[0.2em] w-full py-2">
                  Pressione Enter para ver todos os resultados
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalSearchBar;