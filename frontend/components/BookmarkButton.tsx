// src/components/BookmarkButton.tsx
import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useBookmarks } from '../src/hooks/useBookmarks';

interface BookmarkButtonProps {
  projectId: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  projectId,
  size = 'md',
  showCount = false,
  className = '',
}) => {
  const { bookmarkedIds, addBookmark, removeBookmark } = useBookmarks();
  const [loading, setLoading] = useState(false);

  // Resolve instantaneamente via Set — sem chamada à API por render
  const bookmarked = bookmarkedIds.has(projectId);

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      if (bookmarked) {
        await removeBookmark(projectId);
      } else {
        await addBookmark(projectId);
      }
    } catch (error) {
      console.error('Erro ao toggle bookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-1.5 rounded-xl transition-all duration-200 ${
        bookmarked
          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20'
          : 'text-slate-400 hover:text-yellow-400 hover:bg-slate-800/50 border border-transparent'
      } ${sizeClasses[size]} ${className}`}
      title={bookmarked ? 'Remover dos salvos' : 'Guardar publicação'}
    >
      <Bookmark
        className={`${iconSizes[size]} transition-all duration-200 ${
          bookmarked ? 'fill-current' : ''
        } ${loading ? 'opacity-50 scale-90' : ''}`}
      />
      {showCount && (
        <span className="text-xs font-semibold">{bookmarked ? 'Salvo' : 'Salvar'}</span>
      )}
    </button>
  );
};

export default BookmarkButton;