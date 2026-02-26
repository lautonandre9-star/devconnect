import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useHubs = (searchQuery: string = '') => {
  const [hubs, setHubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHubs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.hubs.getAll(searchQuery);
      setHubs(data.hubs || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao buscar hubs:', err);
      setHubs([]); // Não quebra a UI
    } finally {
      setLoading(false);
    }
  };

  const joinHub = async (hubId: string) => {
    try {
      await api.hubs.join(hubId);
      await fetchHubs();
      return true;
    } catch (err) {
      console.error('Erro ao entrar no hub:', err);
      return false;
    }
  };

  const leaveHub = async (hubId: string) => {
    try {
      await api.hubs.leave(hubId);
      await fetchHubs();
      return true;
    } catch (err) {
      console.error('Erro ao sair do hub:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchHubs();
  }, [searchQuery]);

  return {
    hubs,
    loading,
    error,
    joinHub,
    leaveHub,
    refetch: fetchHubs
  };
};

export const useHubMessages = (hubId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await api.hubs.getMessages(hubId);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    try {
      await api.hubs.sendMessage(hubId, content);
      await fetchMessages();
      return true;
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      return false;
    }
  };

  const likeMessage = async (messageId: string) => {
    try {
      await api.hubs.likeMessage(messageId);
      await fetchMessages();
      return true;
    } catch (err) {
      console.error('Erro ao dar like:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [hubId]);

  return {
    messages,
    loading,
    sendMessage,
    likeMessage,
    refetch: fetchMessages
  };
};