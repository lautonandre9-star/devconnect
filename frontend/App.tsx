import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './src/contexts/AuthContext';
import { webrtcService } from './services/webrtcService';
import AuthPage from './src/pages/AuthPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import JobBoard from './components/JobBoard';
import ProfileView from './components/ProfileView';
import EventView from './components/EventView';
import StartupShowcase from './components/StartupShowcase';
import CompanyDashboard from './components/CompanyDashboard';
import DevBuddy from './components/DevBuddy';
import DevBuddyPage from './components/DevBuddyPage';
import Hubs from './components/Hubs';
import BookmarksPage from './components/BookmarksPage';
import MessagesPage from './components/MessagesPage';
import SettingsPage from './components/Settings';
import UserProfileView from './components/UserProfileView';
import { AppView } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Briefcase,
  Rocket,
  User,
  Bookmark,
  MessageSquare,
  Loader
} from 'lucide-react';

// Mapear paths para AppView
const pathToView: Record<string, AppView> = {
  '/home': 'feed',
  '/jobs': 'jobs',
  '/projects': 'projects',
  '/communities': 'communities',
  '/events': 'events',
  '/profile': 'profile',
  '/company-dashboard': 'company-dashboard',
  '/bookmarks': 'bookmarks',
  '/messages': 'messages',
  '/settings': 'settings',
  '/devbuddy': 'devbuddy',
};

const viewToPath: Record<AppView, string> = {
  'feed': '/home',
  'jobs': '/jobs',
  'projects': '/projects',
  'communities': '/communities',
  'events': '/events',
  'profile': '/profile',
  'company-dashboard': '/company-dashboard',
  'bookmarks': '/bookmarks',
  'messages': '/messages',
  'settings': '/settings',
  'devbuddy': '/devbuddy',
};

const AppContent: React.FC = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [chatWithUserId, setChatWithUserId] = useState<string | null>(null);

  // Descobrir a view actual a partir do path
  const currentView: AppView = pathToView[location.pathname] || 'feed';

  useEffect(() => {
    if (user?.id) {
      try {
        webrtcService.connect(user.id);
      } catch (err) {
        console.log('WebRTC não disponível');
      }
      return () => {
        try {
          webrtcService.disconnect();
        } catch (err) { }
      };
    }
  }, [user?.id]);


  const setView = (view: AppView) => {
    setViewingUserId(null);
    setChatWithUserId(null);
    navigate(viewToPath[view]);
  };

  const viewUserProfile = (userId: string) => {
    setViewingUserId(userId);
    navigate(`/user/${userId}`);
  };

  const startChatWith = (userId: string) => {
    setChatWithUserId(userId);
    navigate('/messages');
  };

  const startCallWith = (userId: string, type: 'audio' | 'video') => {
    try {
      webrtcService.startCall(userId, type);
    } catch (err) {
      alert('Sistema de chamadas ainda não configurado.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<AuthPage />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f1e] text-slate-200 selection:bg-indigo-500/30">
      <Navbar
        onNavigateToProfile={() => {
          setViewingUserId(null);
          navigate('/profile');
        }}
        onNavigate={(view) => setView(view)}
        onViewUser={viewUserProfile}
      />

      <div className="pt-[60px] flex">
        <Sidebar
          currentView={currentView}
          setView={setView}
        />

        <main className="flex-1 md:ml-[220px] p-6 lg:p-8 overflow-x-hidden min-h-screen">
          <div className="container mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <Routes>
                  <Route path="/home" element={<Feed onViewProfile={viewUserProfile} />} />
                  <Route path="/jobs" element={
                    user?.type === 'company' ? <CompanyDashboard onViewProfile={viewUserProfile} onStartChat={startChatWith} onStartCall={startCallWith} /> : <JobBoard onViewProfile={viewUserProfile} />
                  } />
                  <Route path="/projects" element={<StartupShowcase onViewProfile={viewUserProfile} />} />
                  <Route path="/communities" element={<Hubs onViewProfile={viewUserProfile} />} />
                  <Route path="/events" element={<EventView onViewProfile={viewUserProfile} />} />
                  <Route path="/profile" element={<ProfileView userId={user?.id} />} />
                  <Route path="/user/:userId" element={
                    <UserProfileView
                      userId={viewingUserId || ''}
                      onStartChat={startChatWith}
                      onStartCall={startCallWith}
                    />
                  } />
                  <Route path="/company-dashboard" element={<CompanyDashboard onViewProfile={viewUserProfile} onStartChat={startChatWith} onStartCall={startCallWith} />} />
                  <Route path="/bookmarks" element={<BookmarksPage onViewProfile={viewUserProfile} />} />
                  <Route path="/messages" element={
                    <MessagesPage
                      initialChatUserId={chatWithUserId}
                      onViewProfile={viewUserProfile}
                    />
                  } />
                  <Route path="/settings" element={<SettingsPage onViewProfile={viewUserProfile} />} />
                  <Route path="/devbuddy" element={<DevBuddyPage />} />
                  <Route path="/" element={<Navigate to="/home" replace />} />
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Widget flutuante — esconde quando estamos na página dedicada */}
      {location.pathname !== '/devbuddy' && <DevBuddy />}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/50 flex justify-around items-center z-[100] px-4">
        {[
          { path: '/home', icon: Home, label: 'feed' },
          { path: '/jobs', icon: Briefcase, label: 'jobs' },
          { path: '/messages', icon: MessageSquare, label: 'chat' },
          { path: '/bookmarks', icon: Bookmark, label: 'saved' },
          { path: '/profile', icon: User, label: 'profile' }
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1.5 p-2 transition-all ${location.pathname === item.path
              ? 'text-indigo-400 scale-110'
              : 'text-slate-500'
              }`}
          >
            <item.icon className={`w-6 h-6 ${location.pathname === item.path && (item.path === '/bookmarks' || item.path === '/messages') ? 'fill-current' : ''
              }`} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

const App: React.FC = () => {
  return <AppContent />;
};

export default App;