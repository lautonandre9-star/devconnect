// src/components/ConversationsList.tsx
import React from 'react';
import { MessageSquare, Loader, Sparkles, ChevronRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useConversations } from '../src/hooks/useConversations';

interface ConversationsListProps {
  searchQuery?: string;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

const ConversationsList: React.FC<ConversationsListProps> = ({ searchQuery = '', selectedId, onSelect }) => {
  const { conversations, loading, openConversation } = useConversations();

  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center mb-4">
          <Loader className="w-5 h-5 animate-spin text-indigo-500" />
        </div>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Sincronizando...</span>
      </div>
    );
  }

  if (filteredConversations.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <div className="w-16 h-16 bg-[#12152a] border border-slate-800/60 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <MessageSquare className="w-8 h-8 text-slate-700" />
        </div>
        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2 italic">
          Nenhuma Transmissão
        </h3>
        <p className="text-slate-500 text-[11px] font-medium leading-relaxed max-w-[180px] mx-auto">
          Inicie um novo fluxo de dados com a comunidade agora.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto no-scrollbar pr-1">
      {filteredConversations.map((conv, index) => {
        const isSelected = selectedId === conv.id;
        const hasUnread = conv.unreadCount > 0;

        return (
          <motion.div
            key={conv.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border group relative overflow-hidden ${isSelected
                ? 'bg-[#12152a] border-indigo-500/40 shadow-lg shadow-indigo-600/5'
                : 'bg-transparent border-transparent hover:bg-[#12152a]/50 hover:border-slate-800/60'
              }`}
            onClick={() => (onSelect ? onSelect(conv.id) : openConversation(conv))}
          >
            {/* Active Glow Indicator */}
            {isSelected && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />
            )}

            <div className="relative flex-shrink-0">
              <div className={`absolute -inset-1 bg-indigo-600 blur opacity-0 transition-opacity duration-300 ${isSelected ? 'opacity-20' : ''}`} />
              <img
                src={conv.otherUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.otherUser.id}`}
                alt={conv.otherUser.name}
                className={`relative w-12 h-12 rounded-xl border object-cover transition-all ${isSelected ? 'border-indigo-500/50 scale-105' : 'border-slate-800 group-hover:border-slate-700'
                  }`}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#0d0f1e] rounded-full shadow-lg" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className={`text-xs font-black uppercase tracking-tight truncate flex items-center gap-2 ${isSelected ? 'text-white italic' : 'text-slate-200'}`}>
                  {conv.otherUser.name}
                  {conv.otherUser.type === 'company' && (
                    <Shield className="w-3 h-3 text-indigo-400" />
                  )}
                </p>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">
                  {new Date(conv.lastMessageAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className={`text-[11px] truncate ${hasUnread ? 'font-black text-indigo-400' : 'font-medium text-slate-500'}`}>
                  {conv.lastMessage ? (
                    conv.lastMessage.senderId === conv.otherUser.id ? (
                      conv.lastMessage.content
                    ) : (
                      <span className="opacity-60 italic">Você: {conv.lastMessage.content}</span>
                    )
                  ) : 'Sem mensagens'}
                </p>

                {hasUnread && (
                  <div className="flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-pulse" />
                )}
              </div>
            </div>

            {/* Hover Action Indicator */}
            {!isSelected && (
              <ChevronRight className="w-4 h-4 text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity -ml-2" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default ConversationsList;