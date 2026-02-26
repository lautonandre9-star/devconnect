import React, { useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { GlobalSearchBar } from './GlobalSearchBar';
import NotificationDropdown from './NotificationDropdown';
import { AppView } from '../types';

interface NavbarProps {
  onNavigateToProfile?: () => void;
  onNavigate?: (view: AppView) => void;
  onViewUser?: (userId: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigateToProfile, onNavigate, onViewUser }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => { logout(); setShowUserMenu(false); };
  const handleNavigate = (view: AppView) => {
    setShowUserMenu(false);
    if (onNavigate) onNavigate(view);
  };
  const handleProfileClick = () => {
    setShowUserMenu(false);
    if (onNavigateToProfile) onNavigateToProfile();
  };

  return (
    <nav className="fixed top-0 right-0 z-40 h-[60px] bg-[#0d0f1e] border-b border-slate-800/60 flex items-center md:left-[220px] left-0 md:border-l-0 border-l border-slate-800/60">
      <div className="flex-1 flex items-center justify-between px-6 gap-4">
        {/* Search */}
        {isAuthenticated && onViewUser && (
          <div className="flex-1 max-w-lg">
            <GlobalSearchBar onSelectUser={onViewUser} />
          </div>
        )}

        {/* Right side actions */}
        {isAuthenticated && user && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Notifications */}
            <NotificationDropdown />

            {/* Messages */}
            <button
              onClick={() => handleNavigate('messages')}
              className="relative p-2 hover:bg-slate-800/60 rounded-xl transition-all text-slate-400 hover:text-slate-100"
              title="Mensagens"
            >
              <MessageSquare className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition border border-slate-700/60 hover:border-slate-600"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                  alt={user.name}
                  className="w-7 h-7 rounded-full"
                />
                <span className="text-sm font-semibold text-slate-200 hidden md:block max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 py-2 overflow-hidden z-40">
                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-sm font-bold text-slate-200">{user.name}</p>
                      <p className="text-xs text-slate-500">@{user.username}</p>
                    </div>
                    {[
                      { icon: User, label: 'Ver Perfil', action: handleProfileClick },
                      { icon: MessageSquare, label: 'Mensagens', action: () => handleNavigate('messages') },
                      { icon: Settings, label: 'Configurações', action: () => handleNavigate('settings') },
                    ].map(({ icon: Icon, label, action }) => (
                      <button key={label} onClick={action}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-800/60 transition flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-slate-500" />
                        {label}
                      </button>
                    ))}
                    <div className="border-t border-slate-800 mt-1 pt-1">
                      <button onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition flex items-center gap-2.5">
                        <LogOut className="w-4 h-4" />
                        Sair
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile search row */}
      {isAuthenticated && onViewUser && (
        <div className="md:hidden absolute bottom-0 left-0 right-0 translate-y-full bg-[#0d0f1e] border-b border-slate-800/60 p-3">
          <GlobalSearchBar onSelectUser={onViewUser} />
        </div>
      )}
    </nav>
  );
};

export default Navbar;