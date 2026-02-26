// src/components/MessageInput.tsx
import React, { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { useConversations } from '../src/hooks/useConversations';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    
    onSend(message.trim());
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-slate-900/50 border-t border-slate-800">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="p-2 text-slate-400 hover:text-indigo-400 transition"
          title="Anexar arquivo"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <button
          type="button"
          className="p-2 text-slate-400 hover:text-yellow-400 transition"
          title="Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Digite sua mensagem..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-slate-500 resize-none min-h-[48px] max-h-[120px]"
            disabled={disabled}
          />
        </div>

        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Enviar mensagem"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;