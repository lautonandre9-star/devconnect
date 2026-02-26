// src/hooks/useBookmarks.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../../src/services/api';

interface BookmarkProject {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  tags: string[] | string;
  authorId: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    role?: string;
  };
  _count?: { comments: number };
}

interface Bookmark {
  id: string;
  projectId: string;
  project: BookmarkProject;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const useBookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  // Set de projectIds guardados — checkBookmark instantâneo sem chamadas extra à API
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const fetchBookmarks = useCallback(async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      const data = await api.bookmarks.getAll();
      const list: Bookmark[] = data.bookmarks ?? data;
      setBookmarks(list);
      setBookmarkedIds(new Set(list.map((b: Bookmark) => b.projectId)));
      if (data.pagination) setPagination(data.pagination);
    } catch (error) {
      console.error('Erro ao buscar bookmarks:', error);
      setBookmarks([]);
      setBookmarkedIds(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  const addBookmark = useCallback(async (projectId: string) => {
    const data = await api.bookmarks.add(projectId);
    const newBookmark: Bookmark = data.bookmark ?? data;
    setBookmarks(prev => [newBookmark, ...prev]);
    setBookmarkedIds(prev => new Set([...prev, projectId]));
    return newBookmark;
  }, []);

  const removeBookmark = useCallback(async (projectId: string) => {
    await api.bookmarks.remove(projectId);
    setBookmarks(prev => prev.filter(b => b.projectId !== projectId));
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      next.delete(projectId);
      return next;
    });
  }, []);

  // Resolve localmente via Set — zero chamadas extra à API por card
  const checkBookmark = useCallback(async (projectId: string): Promise<boolean> => {
    if (!loading) return bookmarkedIds.has(projectId);
    // Fallback à API apenas enquanto ainda está a carregar
    try {
      const data = await api.bookmarks.check(projectId);
      return data.bookmarked ?? false;
    } catch {
      return false;
    }
  }, [bookmarkedIds, loading]);

  useEffect(() => {
    if (user) fetchBookmarks();
  }, [user, fetchBookmarks]);

  return {
    bookmarks,
    loading,
    pagination,
    bookmarkedIds,
    fetchBookmarks,
    addBookmark,
    removeBookmark,
    checkBookmark,
  };
};