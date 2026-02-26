// src/components/BookmarksPage.tsx
import React from 'react';
import { useBookmarks } from '../src/hooks/useBookmarks';
import { Bookmark, Sparkles, Trash2, ChevronRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BookmarksPageProps {
  onViewProfile: (userId: string) => void;
}

const BookmarksPage: React.FC<BookmarksPageProps> = ({ onViewProfile }) => {
  const { bookmarks, loading, removeBookmark } = useBookmarks();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
          <p className="text-slate-500 text-sm">A carregar salvos...</p>
        </div>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-6 py-32 text-center">
        <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 relative">
          <div className="absolute inset-0 bg-indigo-500/10 rounded-3xl animate-ping opacity-20" />
          <Bookmark className="w-9 h-9 text-slate-700" />
        </div>
        <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">Biblioteca Vazia</h2>
        <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
          Usa o botão <Bookmark className="inline w-3.5 h-3.5 text-yellow-400" /> em qualquer publicação do Feed ou Showcase para a guardar aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto pb-20 px-4">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-3 uppercase tracking-tight">
            <Bookmark className="w-7 h-7 text-yellow-400 fill-current" />
            Salvos
          </h1>
          <p className="text-slate-500 text-sm">
            {bookmarks.length} {bookmarks.length === 1 ? 'projeto guardado' : 'projetos guardados'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {bookmarks.map((bookmark, index) => {
            // Normalizar tags (pode vir como string JSON ou array)
            let tags: string[] = [];
            try {
              tags = Array.isArray(bookmark.project.tags)
                ? bookmark.project.tags
                : JSON.parse(bookmark.project.tags as string);
            } catch {
              tags = [];
            }

            return (
              <motion.div
                key={bookmark.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ delay: index * 0.04, duration: 0.2 }}
                className="group bg-[#12152a] border border-slate-800/60 rounded-2xl overflow-hidden hover:border-indigo-500/40 transition-all shadow-xl flex flex-col"
              >
                {/* Imagem / placeholder */}
                <div className="h-40 bg-slate-900 relative overflow-hidden">
                  {bookmark.project.imageUrl ? (
                    <img
                      src={bookmark.project.imageUrl}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      alt={bookmark.project.title}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900/30 via-slate-900 to-slate-950 flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-slate-800" />
                    </div>
                  )}

                  {/* Botão remover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBookmark(bookmark.project.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-red-500 text-white rounded-xl backdrop-blur-md transition-all shadow-lg border border-white/10 opacity-0 group-hover:opacity-100"
                    title="Remover dos salvos"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="absolute bottom-3 left-3 flex gap-1 flex-wrap">
                      {tags.slice(0, 3).map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-black/60 backdrop-blur-md text-white rounded text-[9px] font-black uppercase tracking-widest border border-white/10"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <h3 className="text-base font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight truncate">
                    {bookmark.project.title}
                  </h3>

                  {/* Autor */}
                  <button
                    onClick={() => onViewProfile(bookmark.project.author.id)}
                    className="flex items-center gap-2 w-fit hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={
                        bookmark.project.author.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${bookmark.project.authorId}`
                      }
                      alt={bookmark.project.author.name}
                      className="w-6 h-6 rounded-full border border-slate-700 object-cover"
                    />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
                      {bookmark.project.author.name}
                    </span>
                  </button>

                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 flex-1">
                    {bookmark.project.description}
                  </p>

                  <button className="mt-1 w-full py-2.5 bg-slate-900 hover:bg-indigo-600/10 border border-slate-800 hover:border-indigo-500/40 text-slate-400 hover:text-indigo-400 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn">
                    Ver Projeto
                    <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookmarksPage;