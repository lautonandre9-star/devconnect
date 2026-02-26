import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { AppView } from '../types';
import {
  LayoutDashboard,
  Briefcase,
  FolderKanban,
  Users,
  Calendar,
  MessageSquare,
  Settings,
  Sparkles,
  Bookmark,
  Code2,
} from 'lucide-react';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'feed' as AppView, label: 'Feed', icon: LayoutDashboard, path: '/home' },
    { id: 'jobs' as AppView, label: user?.type === 'company' ? 'Talent Manager' : 'Vagas', icon: Briefcase, path: '/jobs' },
    { id: 'projects' as AppView, label: 'Projetos', icon: FolderKanban, path: '/projects' },
    { id: 'communities' as AppView, label: 'Comunidade', icon: Users, path: '/communities' },
    { id: 'events' as AppView, label: 'Eventos', icon: Calendar, path: '/events' },
    { id: 'messages' as AppView, label: 'Mensagens', icon: MessageSquare, path: '/messages' },
    { id: 'bookmarks' as AppView, label: 'Salvos', icon: Bookmark, path: '/bookmarks' },
    { id: 'devbuddy' as AppView, label: 'DevBuddy', icon: Sparkles, path: '/devbuddy' },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="w-[220px] h-screen bg-[#0d0f1e] border-r border-slate-800/60 fixed left-0 top-0 hidden md:flex flex-col z-30">
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-3 border-b border-slate-800/60">
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 flex-shrink-0">
          <Code2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-black text-white tracking-tight">DevConnect</h1>
          <p className="text-[10px] text-slate-500 font-medium">
            {user?.type === 'company' ? 'Talent Manager' : 'Hub de Devs'}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-left ${active
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
            >
              <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} style={{ width: '18px', height: '18px' }} />
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* AI Insights Card */}
      <div className="mx-3 mb-3 p-4 rounded-xl bg-indigo-600/10 border border-indigo-500/20">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Insights</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Você tem <span className="text-indigo-300 font-bold">3 novas</span> sugestões de projetos baseadas no seu interesse por Rust.
        </p>
      </div>

      {/* Settings */}
      <div className="px-3 pb-2">
        <button
          onClick={() => setView('settings')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-left ${isActive('/settings')
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
            }`}
        >
          <Settings style={{ width: '18px', height: '18px' }} className="text-slate-500 flex-shrink-0" />
          <span className="text-sm font-semibold">Configurações</span>
        </button>
      </div>

      {/* User Card */}
      <div className="mx-3 mb-4 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-3">
        <img
          src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
          alt={user?.name}
          className="w-9 h-9 rounded-full border border-slate-700 flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white truncate">{user?.name}</p>
          <p className="text-[11px] text-slate-500 truncate">
            {user?.type === 'company' ? 'HR Director' : user?.role || 'Developer'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;