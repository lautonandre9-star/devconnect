// src/hooks/useFollow.ts
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../src/services/api';

interface FollowCounts {
  followersCount: number;
  followingCount: number;
}

export const useFollow = (targetUserId: string, currentUserId?: string) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [counts, setCounts] = useState<FollowCounts>({ followersCount: 0, followingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const isSelf = currentUserId === targetUserId;

  const fetchData = useCallback(async () => {
    if (!targetUserId) return;
    try {
      setLoading(true);
      const requests: Promise<any>[] = [(api as any).follows.getCounts(targetUserId)];
      if (currentUserId && !isSelf) {
        requests.push((api as any).follows.getStatus(targetUserId));
      }
      const [countsData, statusData] = await Promise.all(requests);
      setCounts(countsData);
      if (statusData) setIsFollowing(statusData.isFollowing);
    } catch (err) {
      console.error('Erro ao buscar dados de follow:', err);
    } finally {
      setLoading(false);
    }
  }, [targetUserId, currentUserId, isSelf]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const follow = useCallback(async () => {
    if (actionLoading || isSelf) return;
    setActionLoading(true);
    try {
      await (api as any).follows.follow(targetUserId);
      setIsFollowing(true);
      setCounts(prev => ({ ...prev, followersCount: prev.followersCount + 1 }));
    } catch (err) {
      console.error('Erro ao seguir:', err);
    } finally {
      setActionLoading(false);
    }
  }, [targetUserId, actionLoading, isSelf]);

  const unfollow = useCallback(async () => {
    if (actionLoading || isSelf) return;
    setActionLoading(true);
    try {
      await (api as any).follows.unfollow(targetUserId);
      setIsFollowing(false);
      setCounts(prev => ({ ...prev, followersCount: Math.max(0, prev.followersCount - 1) }));
    } catch (err) {
      console.error('Erro ao deixar de seguir:', err);
    } finally {
      setActionLoading(false);
    }
  }, [targetUserId, actionLoading, isSelf]);

  const toggle = useCallback(() => {
    if (isFollowing) unfollow();
    else follow();
  }, [isFollowing, follow, unfollow]);

  return {
    isFollowing,
    counts,
    loading,
    actionLoading,
    isSelf,
    follow,
    unfollow,
    toggle,
    refetch: fetchData,
  };
};