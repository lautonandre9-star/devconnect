// src/components/HubChatWindow.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useHubMessages } from '../src/hooks/useHubs';
import { api } from '../src/services/api';
import { Send, Users, Settings, Video, Loader2, Heart, UserPlus, Hash, Shield, Sparkles, ChevronRight, Maximize2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../src/contexts/AuthContext';
import { GroupVideoCallModal } from './GroupVideoCallModal';
import { AddMembersModal } from './AddMembersModal';
import { motion, AnimatePresence } from 'framer-motion';

interface HubChatWindowProps {
  hubId: string;
  onViewProfile?: (userId: string) => void;
}

export const HubChatWindow: React.FC<HubChatWindowProps> = ({ hubId, onViewProfile }) => {
  const { user } = useAuth();
  const { messages, loading, sendMessage, likeMessage, refetch } = useHubMessages(hubId);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [hub, setHub] = useState<any>(null);
  const [isMember, setIsMember] = useState(false);
  const [showGroupCall, setShowGroupCall] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHub = async () => {
      try {
        const data = await api.hubs.getById(hubId);
        setHub(data);
        setIsMember(true); // Simplificado
      } catch (err) {
        console.error(err);
      }
    };
    fetchHub();
  }, [hubId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    const success = await sendMessage(newMessage.trim());
    if (success) {
      setNewMessage('');
    } else {
      alert('Erro ao enviar mensagem');
    }
    setSending(false);
  };

  const handleJoin = async () => {
    try {
      await api.hubs.join(hubId);
      setIsMember(true);
    } catch (err) {
      alert('Erro ao entrar no grupo');
    }
  };

  if (loading || !hub) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0d0f1e]">
        <div className="w-16 h-16 bg-indigo-600/10 rounded-3xl flex items-center justify-center mb-6">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Sincronizando com o Hub...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex flex-col h-full bg-[#0d0f1e] overflow-hidden relative">
        {/* Header - Advanced Hub UI */}
        <div className="bg-[#12152a] border-b border-slate-800/60 px-6 py-4 flex items-center justify-between z-20 shadow-xl overflow-hidden relative">
          {/* Static background glow */}
          <div className="absolute top-0 left-0 w-64 h-full bg-indigo-600/5 blur-3xl rounded-full -translate-x-1/2" />

          <div className="flex items-center gap-5 relative z-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-2xl relative group"
              style={{ backgroundColor: hub.color || '#4F46E5' }}
            >
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                <Maximize2 className="w-5 h-5 text-white/40" />
              </div>
              <span className="relative z-10 drop-shadow-md">{hub.icon || <Hash className="w-6 h-6 text-white" />}</span>
              <div className="absolute -inset-1 border border-white/20 rounded-2xl scale-110 opacity-30" />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg font-black text-white uppercase tracking-tight italic">#{hub.name}</h2>
                <div className="px-2.5 py-0.5 bg-indigo-600/10 border border-indigo-500/20 rounded-lg flex items-center gap-1.5">
                  <Shield className="w-2.5 h-2.5 text-indigo-400" />
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Verificado</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Users className="w-3 h-3" /> {hub.membersCount} Conexões
                </p>
                <div className="w-1 h-1 rounded-full bg-slate-700" />
                <p className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> {Math.floor(hub.membersCount * 0.3)} Ativos
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            {[
              { icon: UserPlus, title: 'Convidar', onClick: () => setShowAddMembers(true) },
              { icon: Video, title: 'Call de Hub', onClick: () => setShowGroupCall(true) },
              { icon: Users, title: 'Lista de Membros', onClick: () => { } },
              { icon: Settings, title: 'Configurações', onClick: () => { } }
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.onClick}
                className="p-3 bg-slate-900 border border-slate-800/60 text-slate-400 hover:text-white rounded-xl transition-all shadow-lg active:scale-95 group"
                title={btn.title}
              >
                <btn.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] no-scrollbar">
          {!isMember ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center h-full">
              <div className="bg-[#12152a] ring-1 ring-slate-800/60 p-12 rounded-[3rem] text-center shadow-2xl max-w-sm">
                <div className="w-24 h-24 bg-indigo-600/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-indigo-500/20">
                  <Users className="w-12 h-12 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Perímetro Criptografado</h3>
                <p className="text-slate-500 mb-8 text-sm font-medium italic">Este hub requer autorização de acesso para visualização de dados.</p>
                <button
                  onClick={handleJoin}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-3"
                >
                  Garantir Acesso <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-20 text-center">
              <Sparkles className="w-16 h-16 text-slate-500 mb-4" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[.4em]">Inicie a Transmissão</p>
            </div>
          ) : (
            <div className="space-y-10">
              {messages.map((msg) => {
                const isMe = msg.authorId === user?.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-4 group"
                  >
                    {/* Avatar Column */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => onViewProfile?.(msg.authorId)}
                        className="relative"
                      >
                        <img
                          src={msg.author.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${msg.authorId}`}
                          alt={msg.author.name}
                          className="w-12 h-12 rounded-xl border border-slate-800 shadow-xl group-hover:scale-105 transition-transform"
                        />
                        {msg.author.isCompany && <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 border-2 border-[#12152a] rounded-full" />}
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <button
                          onClick={() => onViewProfile?.(msg.authorId)}
                          className="font-black text-white text-[13px] uppercase tracking-tight hover:text-indigo-400 transition-colors italic"
                        >
                          {msg.author.name}
                        </button>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">
                          {formatDistanceToNow(new Date(msg.createdAt), { locale: ptBR })}
                        </span>
                      </div>

                      <div className="relative inline-block max-w-[90%]">
                        <p className="text-slate-300 text-[14px] leading-relaxed font-medium bg-[#12152a]/40 border border-slate-800/60 px-5 py-3 rounded-2xl rounded-tl-none shadow-sm backdrop-blur-sm">
                          {msg.content}
                        </p>
                        <button
                          onClick={() => likeMessage(msg.id)}
                          className={`absolute -bottom-3 -right-3 px-3 py-1.5 rounded-xl border border-slate-800 shadow-xl text-[10px] font-black transition-all flex items-center gap-2 ${msg.likes > 0 ? 'bg-red-500 text-white border-red-400' : 'bg-slate-900 text-slate-500 hover:text-red-400'
                            }`}
                        >
                          <Heart className={`w-3 h-3 ${msg.likes > 0 ? 'fill-current' : ''}`} />
                          {msg.likes > 0 ? msg.likes : 'Like'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Forge */}
        {isMember && (
          <form onSubmit={handleSend} className="bg-[#12152a] border-t border-slate-800/60 p-6 shadow-[0_-12px_48px_-12px_rgba(0,0,0,0.5)]">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative group">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Transmitir para #${hub.name.toLowerCase()}...`}
                  disabled={sending}
                  className="w-full bg-[#0d0f1e] border border-slate-800/60 rounded-2xl px-6 py-4 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all disabled:opacity-50 shadow-inner font-medium"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">ASCII / UTF-8</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-xl shadow-indigo-600/30 active:scale-95"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Enviar <Send className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showGroupCall && (
          <GroupVideoCallModal
            hubId={hubId}
            hubName={hub.name}
            onClose={() => setShowGroupCall(false)}
          />
        )}

        {showAddMembers && (
          <AddMembersModal
            hubId={hubId}
            hubName={hub.name}
            onClose={() => setShowAddMembers(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};