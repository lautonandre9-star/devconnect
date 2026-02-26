// src/hooks/useConversations.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

import { Message, User } from '../../types.ts';

interface Conversation {
  id: string;
  otherUser: User;
  lastMessage: Message | null;
  unreadCount: number;
  lastMessageAt: string;
  theme?: any;
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await api.conversations.getAll();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string, page = 1, limit = 50) => {
    try {
      setMessagesLoading(true);
      const data = await api.conversations.getMessages(conversationId, page, limit);
      setMessages(data.messages || []);
      return data;
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async (data: any) => {
    const response = await api.conversations.sendMessage(typeof data === 'string' ? { recipientId: data, content: '' } : data);
    await fetchConversations();
    return response;
  };

  const deleteConversation = async (conversationId: string) => {
    // Not implemented in backend yet
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (activeConversation?.id === conversationId) {
      closeConversation();
    }
  };

  const openConversation = async (conversation: Conversation) => {
    setActiveConversation(conversation);
    await fetchMessages(conversation.id);
  };

  const closeConversation = () => {
    setActiveConversation(null);
    setMessages([]);
  };

  const startChatWithUser = async (userId: string) => {
    try {
      setLoading(true);
      // Primeiro, recarregar conversas para garantir que temos a lista atualizada
      const data = await api.conversations.getAll();
      const existingConversations = data.conversations || [];
      setConversations(existingConversations);

      // Tentar encontrar uma conversa com esse usuário
      const conv = existingConversations.find((c: any) => c.otherUser.id === userId);

      if (conv) {
        await openConversation(conv);
        return conv.id;
      } else {
        // Se não houver conversa, podemos apenas retornar o ID do usuário
        // O ChatWindow deve ser capaz de lidar com isso (enviando a primeira mensagem)
        // Ou podemos criar uma conversa dummy localmente
        return `new-${userId}`;
      }
    } catch (error) {
      console.error('Erro ao iniciar chat:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  return {
    conversations,
    loading,
    activeConversation,
    messages,
    messagesLoading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    deleteConversation,
    openConversation,
    closeConversation,
    startChatWithUser
  };
};
