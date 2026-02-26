import React, { useEffect, useRef, useState } from 'react';
import {
  X, Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Users,
  MessageSquare, Smile, Share2, MoreVertical, ScreenShare,
  Settings, Zap, Shield, Sparkles, Wand2, Volume2, VolumeX,
  Type, Download, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../src/contexts/AuthContext';

interface GroupVideoCallModalProps {
  hubId: string;
  hubName: string;
  onClose: () => void;
}

interface Participant {
  id: string;
  name: string;
  avatar: string;
  stream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeaking?: boolean;
}

interface Reaction {
  id: string;
  emoji: string;
  x: number;
  y: number;
}

export const GroupVideoCallModal: React.FC<GroupVideoCallModalProps> = ({
  hubId,
  hubName,
  onClose
}) => {
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showReactions, setShowReactions] = useState(false);
  const [aiTranscription, setAiTranscription] = useState<string[]>([]);
  const [isNoiseCancelled, setIsNoiseCancelled] = useState(true);
  const [isBlurred, setIsBlurred] = useState(false);
  const [messages, setMessages] = useState<{ id: string, sender: string, text: string }[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startGroupCall();
    // Simular transcrição via IA
    const intervals = [
      "Bem-vindos ao Hub " + hubName + "!",
      "A IA está processando o áudio em tempo real...",
      "João: Vamos discutir o novo sprint amanhã?",
      "DevConnect: Segurança de dados é nossa prioridade.",
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < intervals.length) {
        setAiTranscription(prev => [...prev.slice(-2), intervals[i]]);
        i++;
      }
    }, 5000);

    return () => {
      endCall();
      clearInterval(interval);
    };
  }, []);

  const startGroupCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Simular participantes com estados dinâmicos
      setTimeout(() => {
        setParticipants([
          {
            id: '1',
            name: 'Sarah Connor',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            stream: null,
            isMuted: false,
            isVideoOff: false,
            isSpeaking: true
          },
          {
            id: '2',
            name: 'Arthur Morgan',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arthur',
            stream: null,
            isMuted: true,
            isVideoOff: false
          }
        ]);
      }, 1000);

    } catch (error) {
      console.error('Erro ao iniciar chamada:', error);
      alert('Erro ao acessar câmera/microfone');
      onClose();
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const sendReaction = (emoji: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const reaction = {
      id,
      emoji,
      x: Math.random() * 80 + 10, // 10% a 90% da largura
      y: 100
    };
    setReactions(prev => [...prev, reaction]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 4000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: user?.name || 'Eu',
      text: inputMessage
    }]);
    setInputMessage('');
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[200] flex animate-in fade-in duration-500 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="flex-1 flex flex-col relative z-10 p-6 gap-6">
        {/* Superior Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20">
              <Zap className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white tracking-tight uppercase">{hubName}</h3>
                <span className="px-2 py-0.5 bg-red-500 rounded text-[10px] font-bold text-white animate-pulse">AO VIVO</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-green-400" /> End-to-End Encrypted</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {participants.length + 1} presentes</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 hover:bg-slate-800 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 transition-all">
              <Shield className="w-4 h-4 text-indigo-400" />
              Verificar Segurança
            </button>
            <button
              onClick={endCall}
              className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Video Grid Section */}
        <div className="flex-1 relative">
          <div className={`grid gap-6 h-full transition-all duration-500 ${participants.length === 0 ? 'grid-cols-1' :
              participants.length === 1 ? 'grid-cols-2' :
                participants.length <= 4 ? 'grid-cols-2' :
                  'grid-cols-3'
            }`}>
            {/* Local User Card */}
            <motion.div
              layout
              className={`relative rounded-3xl overflow-hidden border-2 transition-all ${!isMuted && !isVideoOff ? 'border-indigo-500/50 shadow-2xl shadow-indigo-500/10' : 'border-slate-800'
                }`}
            >
              <div className={`absolute inset-0 bg-slate-900 transition-opacity duration-700 ${isVideoOff ? 'opacity-100' : 'opacity-0'}`} />

              {isVideoOff ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-indigo-600/20 rounded-full blur-xl animate-pulse" />
                    <img
                      src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                      className="w-32 h-32 rounded-full border-4 border-indigo-600 relative z-10"
                      alt="Me"
                    />
                  </div>
                  <h4 className="mt-4 text-xl font-bold text-white uppercase tracking-widest">{user?.name}</h4>
                  <p className="text-slate-500 text-xs font-bold">CÂMERA DESLIGADA</p>
                </div>
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover mirror transition-all duration-1000 ${isBlurred ? 'blur-2xl scale-110' : 'blur-0 scale-100'}`}
                />
              )}

              {/* Status Tags */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500" />
                  <span className="text-white text-xs font-black uppercase tracking-tighter">Você</span>
                  {isMuted && <MicOff className="w-3.5 h-3.5 text-red-500" />}
                </div>
              </div>
            </motion.div>

            {/* Simulated Remote Participants */}
            {participants.map((participant) => (
              <motion.div
                key={participant.id}
                layout
                className={`relative rounded-3xl overflow-hidden border-2 transition-all ${participant.isSpeaking ? 'border-green-500/50 shadow-2xl shadow-green-500/10' : 'border-slate-800'
                  }`}
              >
                <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center">
                  <img
                    src={participant.avatar}
                    alt={participant.name}
                    className="w-28 h-28 rounded-full border-4 border-slate-800"
                  />
                  <h4 className="mt-4 text-lg font-bold text-white uppercase tracking-widest">{participant.name}</h4>
                  {participant.isSpeaking && (
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 2, 1].map((h, i) => (
                        <div key={i} className="w-1 bg-green-400 rounded-full animate-bounce" style={{ height: h * 4, animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/10">
                  <span className="text-white text-xs font-black uppercase tracking-tighter">{participant.name}</span>
                  {participant.isMuted && <MicOff className="w-3.5 h-3.5 text-red-500" />}
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI Live Transcription Overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">DevConnect AI Transcript</span>
              </div>
              <div className="space-y-1">
                {aiTranscription.map((line, idx) => (
                  <p key={idx} className={`text-sm transition-all duration-500 ${idx === aiTranscription.length - 1 ? 'text-white font-bold' : 'text-slate-500 opacity-50'}`}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Floating Reactions Overlay */}
          <AnimatePresence>
            {reactions.map(r => (
              <motion.div
                key={r.id}
                initial={{ y: 0, opacity: 1, scale: 0.5 }}
                animate={{ y: -600, opacity: 0, scale: 2 }}
                transition={{ duration: 4, ease: "easeOut" }}
                className="absolute bottom-0 text-5xl pointer-events-none z-[100]"
                style={{ left: `${r.x}%` }}
              >
                {r.emoji}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Floating Controls Bar */}
        <div className="flex justify-center pb-4">
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-3 rounded-[2.5rem] flex items-center gap-4 shadow-3xl">
            <div className="flex items-center gap-2 px-4 border-r border-white/5">
              <button
                onClick={() => setIsNoiseCancelled(!isNoiseCancelled)}
                className={`p-3 rounded-2xl transition-all ${isNoiseCancelled ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500'}`}
                title="Supressão de Ruído IA"
              >
                {isNoiseCancelled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsBlurred(!isBlurred)}
                className={`p-3 rounded-2xl transition-all ${isBlurred ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500'}`}
                title="Fundo Desfocado IA"
              >
                <Wand2 className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={toggleMute}
              className={`p-5 rounded-[1.8rem] transition-all transform active:scale-90 ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
            >
              {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-5 rounded-[1.8rem] transition-all transform active:scale-90 ${isVideoOff ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
            >
              {isVideoOff ? <VideoOff className="w-7 h-7" /> : <VideoIcon className="w-7 h-7" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="p-5 bg-slate-800 text-slate-300 rounded-[1.8rem] hover:bg-slate-700 transition-all active:scale-90"
              >
                <Smile className="w-7 h-7" />
              </button>

              <AnimatePresence>
                {showReactions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: -70, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 rounded-3xl p-3 flex gap-2 shadow-2xl"
                  >
                    {['🚀', '⚡', '🔥', '💻', '💯', '❤️'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => { sendReaction(emoji); setShowReactions(false); }}
                        className="text-2xl hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button className="p-5 bg-slate-800 text-slate-300 rounded-[1.8rem] hover:bg-slate-700 transition-all">
              <ScreenShare className="w-7 h-7" />
            </button>

            <button
              onClick={endCall}
              className="p-5 bg-red-600 text-white rounded-[1.8rem] hover:bg-red-700 shadow-xl shadow-red-600/30 transition-all active:scale-95"
            >
              <PhoneOff className="w-7 h-7" />
            </button>

            <div className="flex items-center gap-2 pl-4 border-l border-white/5">
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`p-4 rounded-2xl relative transition-all ${isChatOpen ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                <MessageSquare className="w-6 h-6" />
                {!isChatOpen && <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900" />}
              </button>
              <button className="p-4 bg-slate-800 text-slate-400 rounded-2xl hover:text-white transition-all">
                <MoreVertical className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Futuristic Chat Sidebar */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="w-96 bg-slate-900/40 backdrop-blur-3xl border-l border-white/5 flex flex-col relative z-20"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-white uppercase tracking-tighter">Chat Colaborativo</h3>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                  <div className="p-4 bg-slate-800 rounded-full mb-4">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest">Inicie a conversa</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === (user?.name || 'Eu') ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] font-black text-slate-500 uppercase mb-1">{msg.sender}</span>
                    <div className={`px-4 py-3 rounded-2xl text-sm ${msg.sender === (user?.name || 'Eu')
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-100 rounded-tl-none border border-white/5'
                      }`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-6 border-t border-white/5 bg-black/20">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Envie uma mensagem..."
                  className="flex-1 bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-600"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};