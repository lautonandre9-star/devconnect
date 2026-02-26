// src/components/DevBuddyPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Sparkles, User, Zap, Loader2, BrainCircuit,
  RotateCcw, Code2, TrendingUp, FileText, Map
} from 'lucide-react';
import { api } from '../src/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant';
  text: string;
}

// ─── Inline renderer (bold + inline code) ────────────────────────────────────
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|`([^`]+?)`)/g;
  let last = 0;
  let k = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[0].startsWith('**')) {
      parts.push(<strong key={k++} className="text-white font-semibold">{match[2]}</strong>);
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

// ─── Full markdown formatter ──────────────────────────────────────────────────
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
        <div key={i} className="my-3 rounded-xl overflow-hidden border border-slate-700/60">
          {lang && (
            <div className="px-3 py-1.5 bg-slate-800 text-[10px] font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-700/60 flex items-center gap-1.5">
              <Code2 className="w-3 h-3" /> {lang}
            </div>
          )}
          <pre className="bg-[#0a0c1a] p-4 overflow-x-auto">
            <code className="text-indigo-300 text-[12px] font-mono leading-relaxed">
              {codeLines.join('\n')}
            </code>
          </pre>
        </div>
      );
      i++; continue;
    }

    if (line.trim() === '') { elements.push(<div key={i} className="h-1.5" />); i++; continue; }

    if (line.startsWith('### ')) {
      elements.push(<p key={i} className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mt-4 mb-1.5">{renderInline(line.replace('### ', ''))}</p>);
      i++; continue;
    }
    if (line.startsWith('## ')) {
      elements.push(<p key={i} className="text-[13px] font-black text-white mt-4 mb-1.5">{renderInline(line.replace('## ', ''))}</p>);
      i++; continue;
    }
    if (line.startsWith('# ')) {
      elements.push(<p key={i} className="text-[15px] font-black text-white mt-4 mb-2">{renderInline(line.replace('# ', ''))}</p>);
      i++; continue;
    }

    if (/^[\-\*]\s+/.test(line)) {
      elements.push(
        <div key={i} className="flex gap-2.5 items-start my-1">
          <span className="text-indigo-400 mt-[3px] text-[10px] shrink-0">▸</span>
          <span className="text-[13px] text-slate-300 leading-relaxed">{renderInline(line.replace(/^[\-\*]\s+/, ''))}</span>
        </div>
      );
      i++; continue;
    }

    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={i} className="flex gap-2.5 items-start my-1">
          <span className="text-indigo-400 font-bold text-[11px] shrink-0 mt-[2px] min-w-[16px]">{numMatch[1]}.</span>
          <span className="text-[13px] text-slate-300 leading-relaxed">{renderInline(numMatch[2])}</span>
        </div>
      );
      i++; continue;
    }

    if (line.trim() === '---') {
      elements.push(<hr key={i} className="border-slate-700/50 my-3" />);
      i++; continue;
    }

    elements.push(
      <p key={i} className="text-[13px] text-slate-300 leading-relaxed">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
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

// ─── Suggestion cards ─────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: <Code2 className="w-4 h-4" />, label: 'Revisão de código', text: 'Podes rever o meu código e sugerir melhorias de performance?' },
  { icon: <TrendingUp className="w-4 h-4" />, label: 'Estratégia de carreira', text: 'Quais as melhores estratégias para crescer como dev sénior em 2025?' },
  { icon: <FileText className="w-4 h-4" />, label: 'Preparação de entrevista', text: 'Como me preparar para uma entrevista técnica de React e Node.js?' },
  { icon: <Map className="w-4 h-4" />, label: 'Roadmap de aprendizado', text: 'Cria um roadmap de 6 meses para eu aprender desenvolvimento fullstack.' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
const DevBuddyPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 140) + 'px';
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

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-60px)] -m-6 lg:-m-8 overflow-hidden">

      {/* ── Sidebar info ── */}
      <div className="hidden lg:flex flex-col w-64 xl:w-72 border-r border-slate-800/60 bg-[#0d0f1e] p-6 gap-6 shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">DevBuddy</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Online</span>
            </div>
          </div>
        </div>

        <p className="text-[12px] text-slate-500 leading-relaxed">
          O teu mentor de IA para dúvidas técnicas, conselhos de carreira e preparação para entrevistas.
        </p>

        {/* Quick actions */}
        <div>
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">Começar com</p>
          <div className="space-y-2">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s.text)}
                disabled={isLoading}
                className="w-full text-left px-3 py-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-indigo-600/10 hover:border-indigo-500/40 transition-all group flex items-center gap-3 disabled:opacity-40"
              >
                <span className="text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0">
                  {s.icon}
                </span>
                <span className="text-[11px] text-slate-400 group-hover:text-slate-200 transition-colors leading-snug">
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Clear button */}
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="mt-auto flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-800/60 text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition-all text-[11px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Nova conversa
          </button>
        )}

        {/* Brain decoration */}
        <div className="mt-auto opacity-5 flex justify-center">
          <BrainCircuit className="w-20 h-20 text-indigo-400" />
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="flex flex-col flex-1 min-w-0 bg-[#0f1226]">

        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-5 py-3 border-b border-slate-800/60 bg-[#0d0f1e] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-black text-white uppercase tracking-widest">DevBuddy</span>
          </div>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} className="p-2 text-slate-500 hover:text-slate-300">
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 no-scrollbar">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Empty state */}
            {isEmpty && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-20 h-20 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center mb-6">
                  <Sparkles className="w-9 h-9 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Olá! Sou o DevBuddy</h2>
                <p className="text-slate-500 text-sm max-w-sm leading-relaxed mb-10">
                  Estou aqui para te ajudar a crescer como developer. Pergunta-me qualquer coisa sobre tecnologia, carreira ou entrevistas.
                </p>

                {/* Mobile suggestion grid */}
                <div className="lg:hidden grid grid-cols-2 gap-2 w-full max-w-sm">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s.text)}
                      className="text-left px-3 py-3 rounded-xl border border-slate-800/60 bg-slate-900/40 hover:bg-indigo-600/10 hover:border-indigo-500/40 transition-all group"
                    >
                      <span className="text-slate-500 group-hover:text-indigo-400 transition-colors">{s.icon}</span>
                      <p className="text-[11px] text-slate-400 group-hover:text-slate-200 mt-1.5 leading-snug">{s.label}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Message list */}
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 shrink-0 rounded-xl bg-indigo-600 flex items-center justify-center self-start mt-0.5 shadow-lg shadow-indigo-600/20">
                    <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                )}

                <div className={`max-w-[78%] sm:max-w-[70%] px-4 py-3 rounded-2xl shadow-lg ${
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

                {msg.role === 'user' && (
                  <div className="w-8 h-8 shrink-0 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center self-start mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Typing indicator */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-8 h-8 shrink-0 rounded-xl bg-indigo-600 flex items-center justify-center self-start">
                    <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                  </div>
                  <div className="bg-slate-900 border border-slate-800/80 px-4 py-3 rounded-2xl rounded-tl-sm shadow-lg">
                    <TypingDots />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input bar */}
        <div className="shrink-0 px-4 sm:px-8 py-4 border-t border-slate-800/60 bg-[#0d0f1e]">
          <div className="max-w-3xl mx-auto flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreve a tua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-slate-900/60 border border-slate-800/60 rounded-2xl px-5 py-3.5 text-[13px] text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-all resize-none leading-relaxed no-scrollbar"
              style={{ minHeight: '50px', maxHeight: '140px' }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="p-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20 shrink-0 self-end"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest text-center mt-2.5">
            Powered by Groq
          </p>
        </div>
      </div>
    </div>
  );
};

export default DevBuddyPage;