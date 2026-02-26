import { useEffect } from 'react';
import { useConversations } from './useConversations';

export const useMessages = (conversationId: string) => {
  const { messages, messagesLoading, fetchMessages } = useConversations();

  useEffect(() => {
    // Se for uma nova conversa (ainda não existe no backend), não buscar mensagens
    if (conversationId && !conversationId.startsWith('new-')) {
      fetchMessages(conversationId);
    }
  }, [conversationId]);

  const refetch = () => {
    if (conversationId && !conversationId.startsWith('new-')) {
      fetchMessages(conversationId);
    }
  };

  return { messages: conversationId.startsWith('new-') ? [] : messages, loading: conversationId.startsWith('new-') ? false : messagesLoading, refetch };
};
