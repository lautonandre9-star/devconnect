// src/components/DevBuddy.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Sparkles, User, Zap, Loader2, BrainCircuit,
  ChevronDown, X, Maximize2, Minimize2, RotateCcw
} from 'lucide-react';
import { api } from '../src/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant';
  text: string;
}

// ─── Message Formatter ────────────────────────────────────────────────────────
// Renders markdown-like syntax: **bold**, `code`, ```blocks```, # headings, - bullets, 1. lists
function FormattedMessage({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.trim().startsWith('```')) {
      const lang = line.trim().replace('```', '').trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <div key={i} className="my-2 rounded-xl overflow-hidden border border-slate-700/60">
          {lang && (
            <div className="px-3 py-1 bg-slate-800 text-[10px] font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-700/60">
              {lang}
            </div>
          )}
          <pre className="bg-[#0d0f1e] p-3 overflow-x-auto">
            <code className="text-indigo-300 text-[11px] font-mono leading-relaxed">
              {codeLines.join('\n')}
            </code>
          </pre>
        </div>
      );
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />);
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <p key={i} className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mt-3 mb-1">
          {renderInline(line.replace('### ', ''))}
        </p>
      );
      i++; continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <p key={i} className="text-[12px] font-black text-white mt-3 mb-1">
          {renderInline(line.replace('## ', ''))}
        </p>
      );
      i++; continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <p key={i} className="text-[13px] font-black text-white mt-3 mb-1">
          {renderInline(line.replace('# ', ''))}
        </p>
      );
      i++; continue;
    }

    // Bullet list
    if (/^[\-\*]\s+/.test(line)) {
      elements.push(
        <div key={i} className="flex gap-2 items-start my-0.5">
          <span className="text-indigo-400 mt-[3px] text-[10px] shrink-0">▸</span>
          <span className="text-[13px] text-slate-300 leading-relaxed">{renderInline(line.replace(/^[\-\*]\s+/, ''))}</span>
        </div>
      );
      i++; continue;
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={i} className="flex gap-2 items-start my-0.5">
          <span className="text-indigo-400 font-bold text-[11px] shrink-0 mt-[2px] min-w-[14px]">{numMatch[1]}.</span>
          <span className="text-[13px] text-slate-300 leading-relaxed">{renderInline(numMatch[2])}</span>
        </div>
      );
      i++; continue;
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push(<hr key={i} className="border-slate-700/60 my-2" />);
      i++; continue;
    }

    // Normal paragraph
    elements.push(
      <p key={i} className="text-[13px] text-slate-300 leading-relaxed">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|`([^`]+?)`)/g;
  let last = 0;
  let k = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));

    if (match[0].startsWith('**')) {
      parts.push(
        <strong key={k++} className="text-white font-bold">{match[2]}</strong>
      );
    } else {
      parts.push(
        <code key={k++} className="bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded text-[11px] font-mono border border-slate-700/50">
          {match[3]}
        </code>
      );
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex gap-1 items-center px-1 py-1">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-indigo-400"
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

// ─── Suggestion chips ─────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: '🚀', text: 'Como melhorar meu portfólio?' },
  { icon: '🎯', text: 'Prepara-me para entrevista de React' },
  { icon: '📈', text: 'Quais skills aprender em 2025?' },
  { icon: '💰', text: 'Como negociar meu salário?' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const DevBuddy: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Olá! Sou o **DevBuddy**, o teu mentor de carreira.\n\nPosso ajudar-te com:\n- Dúvidas técnicas e revisão de código\n- Conselhos de carreira e estratégia\n- Preparação para entrevistas\n- Roadmap de aprendizado\n\nO que queres explorar hoje?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleSend = async (text?: string) => {
    const msgText = (text ?? input).trim();
    if (!msgText || isLoading) return;

    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', text: msgText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const result = await api.ai.getCareerAdvice(msgText, history);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: result || 'Encontrei um problema ao processar. Tenta novamente.'
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Conexão instável. Tenta novamente em instantes.'
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      text: 'Conversa reiniciada! Como posso ajudar-te?'
    }]);
  };

  const hasOnlyWelcome = messages.length === 1;

  // Panel dimensions
  const panelClass = isFullscreen
    ? 'fixed inset-4 sm:inset-8 z-[300] rounded-[2rem]'
    : 'absolute bottom-20 right-0 w-[360px] sm:w-[440px] h-[620px] rounded-[2.5rem]';

  return (
    <div className="fixed bottom-24 right-8 z-[200] md:bottom-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`${panelClass} bg-[#12152a] border border-slate-800/60 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden`}
          >
            {/* ── Header ── */}
            <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-br from-indigo-600/10 to-transparent border-b border-slate-800/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <BrainCircuit className="w-28 h-28 text-indigo-400" />
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/30">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">DevBuddy</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80" />
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Online</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {messages.length > 1 && (
                    <button
                      onClick={clearChat}
                      title="Nova conversa"
                      className="p-2 hover:bg-slate-800/60 rounded-xl transition-all text-slate-500 hover:text-slate-300"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsFullscreen(f => !f)}
                    className="p-2 hover:bg-slate-800/60 rounded-xl transition-all text-slate-500 hover:text-slate-300"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-slate-800/60 rounded-xl transition-all text-slate-500 hover:text-white"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Messages ── */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-5 py-5 space-y-5 no-scrollbar"
              style={{ background: 'linear-gradient(180deg, #12152a 0%, #0f1226 100%)' }}
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[88%] flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`w-7 h-7 shrink-0 rounded-xl flex items-center justify-center shadow-lg self-end mb-0.5 ${
                      msg.role === 'user'
                        ? 'bg-slate-800 border border-slate-700 text-slate-400'
                        : 'bg-indigo-600 text-white'
                    }`}>
                      {msg.role === 'user'
                        ? <User className="w-3.5 h-3.5" />
                        : <Zap className="w-3.5 h-3.5" />
                      }
                    </div>

                    {/* Bubble */}
                    <div className={`px-4 py-3 rounded-2xl shadow-lg ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 rounded-tr-sm'
                        : 'bg-slate-900 border border-slate-800/80 rounded-tl-sm'
                    }`}>
                      {msg.role === 'user' ? (
                        <p className="text-[13px] text-white leading-relaxed font-medium">{msg.text}</p>
                      ) : (
                        <FormattedMessage text={msg.text} />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-2.5 max-w-[80%]">
                    <div className="w-7 h-7 shrink-0 rounded-xl bg-indigo-600 flex items-center justify-center self-end">
                      <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                    </div>
                    <div className="bg-slate-900 border border-slate-800/80 px-4 py-3 rounded-2xl rounded-tl-sm shadow-lg">
                      <TypingDots />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Suggestion chips — only on welcome state */}
              {hasOnlyWelcome && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-2 gap-2 pt-2"
                >
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s.text)}
                      className="text-left px-3 py-2.5 rounded-xl border border-slate-700/60 bg-slate-900/60 hover:bg-indigo-600/10 hover:border-indigo-500/50 transition-all group"
                    >
                      <span className="text-base">{s.icon}</span>
                      <p className="text-[11px] text-slate-400 group-hover:text-slate-200 mt-1 leading-snug transition-colors">
                        {s.text}
                      </p>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* ── Input ── */}
            <div className="flex-shrink-0 px-5 py-4 bg-[#0d0f1e] border-t border-slate-800/60">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escreve a tua mensagem... (Enter para enviar)"
                  rows={1}
                  className="flex-1 bg-[#12152a] border border-slate-800/60 rounded-2xl px-4 py-3 text-[13px] text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-all resize-none leading-relaxed no-scrollbar"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20 shrink-0 self-end"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest text-center mt-2">
                Powered by Groq · Shift+Enter para nova linha
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB Button ── */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(o => !o)}
        className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-300 ${
          isOpen
            ? 'bg-slate-900 border border-slate-800'
            : 'bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600'
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="spark" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Sparkles className="w-7 h-7 text-white drop-shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification dot */}
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-[3px] border-[#0d0f1e] rounded-full"
          />
        )}

        {/* Glow */}
        {!isOpen && (
          <div className="absolute inset-0 bg-indigo-400/20 blur-xl pointer-events-none" />
        )}
      </motion.button>
    </div>
  );
};

export default DevBuddy;