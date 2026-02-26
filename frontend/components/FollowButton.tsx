// src/components/FollowButton.tsx
import React from 'react';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useFollow } from '../src/hooks/useFollow';
import { useAuth } from '../src/contexts/AuthContext';

interface FollowButtonProps {
  targetUserId: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const { user } = useAuth();
  const { isFollowing, loading, actionLoading, isSelf, toggle } = useFollow(targetUserId, user?.id);

  if (isSelf || !user) return null;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-[11px]',
    md: 'px-4 py-2 text-xs',
    lg: 'px-6 py-2.5 text-sm',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center rounded-xl bg-slate-800/60 border border-slate-700/60 ${sizeClasses[size]} ${className}`}>
        <Loader2 className={`${iconSizes[size]} text-slate-500 animate-spin`} />
      </div>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={actionLoading}
      className={`flex items-center gap-2 rounded-xl font-bold transition-all duration-200 ${
        isFollowing
          ? 'bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400'
          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
      } ${sizeClasses[size]} ${actionLoading ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
    >
      {actionLoading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : showIcon ? (
        isFollowing
          ? <UserMinus className={iconSizes[size]} />
          : <UserPlus className={iconSizes[size]} />
      ) : null}
      {isFollowing ? 'A seguir' : 'Seguir'}
    </button>
  );
};

export default FollowButton;