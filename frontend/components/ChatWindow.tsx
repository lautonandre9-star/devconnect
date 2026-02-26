// src/components/ChatWindow.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useMessages } from '../src/hooks/useMessages';
import { api } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';
import {
  Send, Phone, Video, MoreVertical, Loader2,
  Check, CheckCheck, Edit2, Trash2, Pin,
  Forward, Image as ImageIcon, File, Mic,
  Palette, Reply, X, Download, Shield, Sparkles, ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { VideoCallModal } from './VideoCallModal';
import { motion, AnimatePresence } from 'framer-motion';

import { Message, User } from '../types.ts';

interface ChatWindowProps {
  conversationId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId }) => {
  const { user: currentUser } = useAuth();
  const { messages, loading, refetch } = useMessages(conversationId);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video'>('video');
  const [theme, setTheme] = useState<any>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        if (conversationId.startsWith('new-')) {
          const targetUserId = conversationId.replace('new-', '');
          const data = await api.users.getById(targetUserId);
          setOtherUser(data.user || data);
        } else {
          const data = await api.conversations.getAll();
          const conv = data.conversations?.find((c: any) => c.id === conversationId);
          if (conv) {
            setOtherUser(conv.otherUser);
            setTheme(conv.theme);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar dados do chat:', err);
      }
    };

    fetchChatData();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !otherUser) return;

    setSending(true);
    try {
      if (editingMessage) {
        await api.conversations.updateMessage(editingMessage.id, newMessage.trim());
        setEditingMessage(null);
      } else {
        await api.conversations.sendMessage({
          recipientId: otherUser.id,
          content: newMessage.trim(),
          type: 'TEXT'
        });
      }

      setNewMessage('');
      if (conversationId.startsWith('new-')) {
        window.location.reload();
      } else {
        await refetch();
      }
    } catch (err) {
      console.error('Erro ao processar mensagem:', err);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Deseja apagar esta mensagem para todos?')) return;
    try {
      await api.conversations.deleteMessage(messageId);
      await refetch();
    } catch (err) {
      console.error('Erro ao apagar:', err);
    }
  };

  const handlePin = async (messageId: string) => {
    try {
      await api.conversations.pinMessage(messageId);
      await refetch();
    } catch (err) {
      console.error('Erro ao fixar:', err);
    }
  };

  const handleUpdateTheme = async (newTheme: any) => {
    try {
      await api.conversations.updateTheme(conversationId, newTheme);
      setTheme(newTheme);
      setShowThemePicker(false);
    } catch (err) {
      console.error('Erro ao salvar tema:', err);
    }
  };

  if (loading || !otherUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0d0f1e]">
        <div className="w-16 h-16 bg-indigo-600/10 rounded-3xl flex items-center justify-center mb-6">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estabelecendo Conexão Segura...</p>
      </div>
    );
  }

  const chatStyles = theme ? {
    backgroundColor: theme.bg || undefined,
    backgroundImage: theme.bgImage ? `url(${theme.bgImage})` : undefined,
    backgroundSize: 'cover',
  } : {};

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d0f1e] overflow-hidden relative">
      {/* Header - Unified with Sidebar Header style */}
      <div className="bg-[#12152a] border-b border-slate-800/60 px-6 py-4 flex items-center justify-between z-20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300" />
            <img
              src={otherUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.id}`}
              alt={otherUser.name}
              className="relative w-12 h-12 rounded-1.5xl border border-slate-800 object-cover"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#12152a] rounded-full shadow-lg" />
          </div>
          <div>
            <h2 className="font-black text-white leading-tight uppercase tracking-tight text-sm italic">{otherUser.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">@{otherUser.username}</span>
              <div className="w-1 h-1 rounded-full bg-slate-700" />
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded-md flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" /> Fim-a-Fim
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Action Buttons with consistent premium style */}
          {[
            { icon: Palette, title: 'Personalizar', onClick: () => setShowThemePicker(!showThemePicker) },
            { icon: Phone, title: 'Chamada de Voz', onClick: () => { setCallType('audio'); setShowVideoCall(true); } },
            { icon: Video, title: 'Chamada de Vídeo', onClick: () => { setCallType('video'); setShowVideoCall(true); } }
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.onClick}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800/60 text-slate-400 hover:text-white rounded-xl transition-all shadow-lg active:scale-95"
              title={btn.title}
            >
              <btn.icon className="w-5 h-5" />
            </button>
          ))}
          <button className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800/60 text-slate-400 hover:text-white rounded-xl transition-all shadow-lg">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Theme Picker Popover */}
      <AnimatePresence>
        {showThemePicker && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            className="absolute top-24 right-6 w-72 bg-[#12152a] border border-slate-800/60 rounded-3xl p-6 z-30 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl"
          >
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-indigo-400" /> Cores da Conexão
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#1e293b'].map(color => (
                <button
                  key={color}
                  onClick={() => handleUpdateTheme({ color })}
                  className="w-11 h-11 rounded-xl transition-all hover:scale-110 active:scale-90 border-2 border-transparent hover:border-white/20 shadow-lg"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area - Dark Grid Pattern */}
      <div
        className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"
        style={chatStyles}
      >
        <div className="flex flex-col items-center justify-center py-10 opacity-30">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-slate-700 mb-4" />
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[.4em]">Início do Fluxo de Dados</p>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isMe = msg.senderId !== otherUser.id;
            const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isMe && showAvatar ? (
                  <img
                    src={msg.sender.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender.id}`}
                    alt=""
                    className="w-8 h-8 rounded-xl border border-slate-800 shadow-lg mb-1"
                  />
                ) : !isMe ? (
                  <div className="w-8" />
                ) : null}

                <div className={`group relative max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {/* Action Menu (hover) - Polished style */}
                  <div className={`absolute top-0 ${isMe ? '-left-28' : '-right-28'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#12152a]/95 backdrop-blur-md border border-slate-800/60 rounded-xl p-1 shadow-2xl z-10`}>
                    {isMe && (
                      <>
                        <button onClick={() => { setEditingMessage(msg); setNewMessage(msg.content); }} className="p-2 hover:bg-slate-800 text-slate-500 hover:text-indigo-400 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(msg.id)} className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </>
                    )}
                    <button onClick={() => handlePin(msg.id)} className={`p-2 hover:bg-slate-800 rounded-lg transition-colors ${msg.isPinned ? 'text-yellow-400' : 'text-slate-500 hover:text-yellow-400'}`}><Pin className="w-3.5 h-3.5" /></button>
                    <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-indigo-400"><Forward className="w-3.5 h-3.5" /></button>
                  </div>

                  <div
                    className={`relative px-5 py-4 shadow-2xl transition-all duration-300 ${isMe
                      ? (theme?.color ? '' : 'bg-indigo-600') + ' text-white rounded-3xl rounded-tr-none'
                      : 'bg-[#12152a] text-slate-100 border border-slate-800/60 rounded-3xl rounded-tl-none'
                      }`}
                    style={isMe && theme?.color ? { backgroundColor: theme.color } : {}}
                  >
                    {msg.isForwarded && (
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-50 mb-2 italic">
                        <Forward className="w-3 h-3" /> Transmitida
                      </div>
                    )}

                    {msg.type === 'TEXT' && <p className="text-[13.5px] font-medium leading-[1.6] tracking-tight">{msg.content}</p>}

                    {msg.type === 'IMAGE' && (
                      <div className="rounded-2xl overflow-hidden mb-2 border border-black/20 shadow-inner">
                        <img src={msg.fileUrl} alt="Visual Asset" className="max-w-full h-auto" />
                      </div>
                    )}

                    {msg.type === 'FILE' && (
                      <div className="flex items-center gap-4 bg-black/20 p-3 rounded-2xl border border-white/5">
                        <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg"><File className="w-6 h-6 text-white" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black truncate uppercase tracking-tight">{msg.fileName || 'Archive.data'}</p>
                          <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest mt-0.5">Component / Resource</p>
                        </div>
                        <a href={msg.fileUrl} download className="p-2.5 bg-white/5 hover:bg-indigo-600 rounded-xl transition-all"><Download className="w-4 h-4" /></a>
                      </div>
                    )}

                    {msg.type === 'AUDIO' && (
                      <div className="flex items-center gap-3 min-w-[180px] bg-black/10 p-2 rounded-2xl">
                        <button className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"><Mic className="w-4.5 h-4.5" /></button>
                        <div className="flex-1 h-1 bg-white/10 rounded-full relative overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '40%' }} className="absolute inset-y-0 left-0 bg-white/50" />
                        </div>
                        <span className="text-[10px] font-black tracking-tighter opacity-70 font-mono">{msg.audioDuration || '0:12'}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 mt-2 opacity-40">
                      <span className="text-[9px] font-black uppercase tracking-tighter font-mono">{formatDistanceToNow(new Date(msg.createdAt), { locale: ptBR })}</span>
                      {msg.isEdited && <span className="text-[8px] font-black uppercase tracking-widest">Modified</span>}
                      {isMe && (
                        msg.isRead ? <CheckCheck className="w-3.5 h-3.5 text-sky-400" /> : <Check className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </div>

                  {msg.isPinned && (
                    <div className="flex items-center gap-1.5 mt-2 text-[9px] text-yellow-500 font-black uppercase tracking-widest pl-1">
                      <Pin className="w-3 h-3 fill-yellow-500" /> Afixado no Topo
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Futuristic Console style */}
      <div className="p-6 bg-[#12152a] border-t border-slate-800/60 relative shadow-[0_-12px_48px_-12px_rgba(0,0,0,0.5)]">
        {editingMessage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="flex items-center justify-between bg-indigo-600/10 p-3 rounded-2xl mb-4 px-5 border-l-4 border-indigo-500 shadow-inner"
          >
            <div className="flex items-center gap-3 text-[10px] text-indigo-400 font-black uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Reescrevendo a História...
            </div>
            <button onClick={() => { setEditingMessage(null); setNewMessage(''); }} className="p-1.5 hover:bg-indigo-500/20 rounded-lg text-slate-500 transition-colors"><X className="w-4 h-4" /></button>
          </motion.div>
        )}

        <form onSubmit={handleSend} className="flex gap-4 items-center">
          <button type="button" className="p-3 bg-slate-900 border border-slate-800/60 hover:bg-slate-800 text-slate-500 hover:text-white rounded-2xl transition-all shadow-lg active:scale-95">
            <PaperclipIcon />
          </button>

          <div className="flex-1 relative flex items-center group">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={editingMessage ? "Modifique o fluxo..." : "Inicie uma conversa épica..."}
              disabled={sending}
              className="w-full bg-[#0d0f1e] border border-slate-800/60 rounded-2xl px-6 py-4 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all disabled:opacity-50 shadow-inner font-medium"
            />
            <button type="button" className="absolute right-4 p-2 text-slate-600 hover:text-indigo-400 transition-colors">
              <ImageIcon className="w-5 h-5" />
            </button>
          </div>

          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className={`p-4 rounded-2.5xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl active:scale-90 ${(sending || !newMessage.trim()) ? 'bg-slate-800 text-slate-600 border border-slate-700/50' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'}`}
            style={!sending && newMessage.trim() && theme?.color ? { backgroundColor: theme.color } : {}}
          >
            {sending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
          </button>

          <button type="button" className="p-4 bg-slate-900 border border-slate-800/60 text-slate-500 hover:text-indigo-400 rounded-2.5xl transition-all shadow-lg hidden sm:flex">
            <Mic className="w-6 h-6" />
          </button>
        </form>
      </div>

      {/* Video Call Wrapper */}
      {showVideoCall && otherUser && (
        <VideoCallModal
          recipientId={otherUser.id}
          recipientName={otherUser.name}
          recipientAvatar={otherUser.avatar || null}
          callType={callType}
          onClose={() => setShowVideoCall(false)}
        />
      )}
    </div>
  );
};

const PaperclipIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
);

export default ChatWindow;
