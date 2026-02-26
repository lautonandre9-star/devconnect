// src/components/MessagesPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, Users, Search, Plus, Sparkles, ChevronRight, Hash } from 'lucide-react';
import ConversationsList from './ConversationsList';
import { ChatWindow } from './ChatWindow';
import { HubsList } from './HubList';
import { HubChatWindow } from './HubChatWindow';
import { CreateHubModal } from './CreateHubModal';
import { useConversations } from '../src/hooks/useConversations';
import { motion, AnimatePresence } from 'framer-motion';

type ActiveTab = 'direct' | 'hubs';

export const MessagesPage: React.FC<{
  initialChatUserId?: string | null;
  onViewProfile: (userId: string) => void
}> = ({ initialChatUserId, onViewProfile }) => {
  const location = useLocation();
  const { startChatWithUser } = useConversations();
  const [activeTab, setActiveTab] = useState<ActiveTab>('direct');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedHub, setSelectedHub] = useState<string | null>(null);
  const [showCreateHub, setShowCreateHub] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (location.state && (location.state as any).selectedHub) {
      const hubId = (location.state as any).selectedHub;
      setSelectedHub(hubId);
      setActiveTab('hubs');
      setSelectedConversation(null);
    }
  }, [location.state]);

  useEffect(() => {
    const initChat = async () => {
      if (initialChatUserId) {
        setActiveTab('direct');
        const convId = await startChatWithUser(initialChatUserId);
        if (convId) {
          setSelectedConversation(convId);
          setSelectedHub(null);
        }
      }
    };
    initChat();
  }, [initialChatUserId]);

  return (
    <div className="h-[calc(100vh-60px)] flex overflow-hidden bg-[#0d0f1e]">
      {/* Search/Conversations Sidebar */}
      <div className="w-80 md:w-96 bg-[#12152a] border-r border-slate-800/60 flex flex-col shadow-2xl z-10">
        {/* Header Section */}
        <div className="p-6 border-b border-slate-800/60">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              Chats
            </h1>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
          </div>

          {/* Tab Switcher - Matches Feed Filter Style */}
          <div className="flex p-1 bg-[#0d0f1e] rounded-xl border border-slate-800/60 mb-6">
            <button
              onClick={() => setActiveTab('direct')}
              className={`flex-1 py-2 px-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'direct'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Diretas
            </button>
            <button
              onClick={() => setActiveTab('hubs')}
              className={`flex-1 py-2 px-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'hubs'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              <Hash className="w-3.5 h-3.5" />
              Grupos
            </button>
          </div>

          {/* Powerful Search Bar */}
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition" />
            <input
              type="text"
              placeholder={activeTab === 'direct' ? 'Buscar conversas...' : 'Buscar comunidades...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d0f1e] border border-slate-800/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition shadow-inner"
            />
          </div>

          {/* Admin CTA for Hubs */}
          {activeTab === 'hubs' && (
            <button
              onClick={() => setShowCreateHub(true)}
              className="w-full mt-4 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 py-2.5 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Criar Nova Comunidade
            </button>
          )}
        </div>

        {/* Dynamic Lists */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-2">
          {activeTab === 'direct' ? (
            <ConversationsList
              searchQuery={searchQuery}
              selectedId={selectedConversation}
              onSelect={(id) => {
                setSelectedConversation(id);
                setSelectedHub(null);
              }}
            />
          ) : (
            <HubsList
              searchQuery={searchQuery}
              selectedId={selectedHub}
              onSelect={(id) => {
                setSelectedHub(id);
                setSelectedConversation(null);
              }}
            />
          )}
        </div>
      </div>

      {/* Primary Chat Viewport */}
      <div className="flex-1 flex flex-col relative bg-[#0b0d18]">
        <AnimatePresence mode="wait">
          {activeTab === 'direct' && selectedConversation ? (
            <motion.div key={`conv-${selectedConversation}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <ChatWindow conversationId={selectedConversation} />
            </motion.div>
          ) : activeTab === 'hubs' && selectedHub ? (
            <motion.div key={`hub-${selectedHub}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <HubChatWindow hubId={selectedHub} />
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="w-24 h-24 bg-indigo-600/5 rounded-full flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping opacity-20" />
                <MessageSquare className="w-10 h-10 text-indigo-500/40" />
              </div>
              <h3 className="text-xl font-black text-white/40 mb-2 uppercase tracking-widest text-center">
                {activeTab === 'direct' ? 'Nenhuma Conversa' : 'Nenhum Grupo'}
              </h3>
              <p className="text-slate-600 text-sm font-medium text-center max-w-xs leading-relaxed">
                {activeTab === 'direct'
                  ? 'Selecione um contato na lista lateral para iniciar sua jornada épica no DevConnect.'
                  : 'Escolha um hub para compartilhar código e ideias com a comunidade.'}
              </p>

              <div className="mt-8 flex gap-4">
                <div className="px-4 py-2 bg-slate-900 rounded-lg border border-slate-800 text-[10px] font-black text-slate-500 uppercase">Fim a Fim</div>
                <div className="px-4 py-2 bg-slate-900 rounded-lg border border-slate-800 text-[10px] font-black text-slate-500 uppercase">Seguro</div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Hub Creation Overlay */}
      <AnimatePresence>
        {showCreateHub && (
          <CreateHubModal onClose={() => setShowCreateHub(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessagesPage;
