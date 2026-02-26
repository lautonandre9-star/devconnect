import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { User, RegisterData } from '../../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar autenticação ao carregar (o cookie é enviado automaticamente)
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // O cookie httpOnly é enviado automaticamente pelo browser
      const data = await api.auth.getMe();
      setUser(data.user || data);
    } catch (err: any) {
      // Apenas limpar o utilizador se for explicitamente não autorizado
      // Outros erros (como 429) não devem forçar o logout
      if (err?.response?.status === 401) {
        setUser(null);
      }
      console.error('Erro na verificação de auth:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await api.auth.login(email, password);
      // O token é guardado automaticamente como httpOnly cookie pelo backend
      setUser(data.user);
      setLoading(false);
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || 'Erro ao fazer login';
      throw new Error(message);
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      // Garantir que qualquer sessão anterior é limpa antes de registar
      // Isto previne conflitos de sessão ao trocar de utilizador
      try { await api.auth.logout(); } catch (_) { /* ignorar se não há sessão */ }

      const data = await api.auth.register(registerData);
      // O token é guardado automaticamente como httpOnly cookie pelo backend
      setUser(data.user);
      setLoading(false);
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || 'Erro ao registrar';
      throw new Error(message);
    }
  };

  const logout = async () => {
    setUser(null); // Limpar localmente primeiro para UX imediata
    try {
      await api.auth.logout(); // Depois limpar o cookie no servidor
    } catch (err) {
      // Mesmo que o logout falhe no server, o utilizador já foi limpo localmente
      console.error('Erro no logout do servidor:', err);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      const response = await api.users.updateProfile(data);
      // Backend retorna { user: ... }
      setUser(response.user);
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || 'Erro ao atualizar perfil';
      throw new Error(message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        updateUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};