// src/components/Auth/AuthModal.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, Mail, Lock, User, Briefcase, Code2, Building2, Globe, Loader, Github, Tag } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register';
type UserType = 'developer' | 'company';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  
  // Estados
  const [mode, setMode] = useState<AuthMode>('login');
  const [userType, setUserType] = useState<UserType>('developer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Campos de formulário
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    role: '',
    skills: '',
    githubUsername: '',
    website: '',
    industry: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      setSuccess('Login realizado com sucesso!');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const userData: any = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        type: userType,
        bio: formData.bio,
      };

      // Campos específicos para Developer
      if (userType === 'developer') {
        userData.role = formData.role;
        userData.skills = formData.skills.split(',').map((s) => s.trim()).filter(Boolean);
        if (formData.githubUsername) {
          userData.githubUsername = formData.githubUsername;
        }
      }

      // Campos específicos para Company
      if (userType === 'company') {
        userData.website = formData.website;
        userData.industry = formData.industry;
      }

      await register(userData);
      setSuccess('Conta criada com sucesso! Bem-vindo ao DevConnect!');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      bio: '',
      role: '',
      skills: '',
      githubUsername: '',
      website: '',
      industry: '',
    });
    setError('');
    setSuccess('');
    setMode('login');
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setSuccess('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full my-8 relative border border-slate-800">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {mode === 'login' ? 'Entrar no DevConnect' : 'Criar Conta'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {mode === 'login'
                ? 'Acesse sua conta e conecte-se'
                : 'Junte-se à maior rede de desenvolvedores'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-2 hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Mensagens de Erro/Sucesso */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg p-3 mb-4 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 rounded-lg p-3 mb-4 text-sm flex items-center gap-2">
              <span>✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* Seletor de Tipo (apenas no registro) */}
          {mode === 'register' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Tipo de Conta
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('developer')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    userType === 'developer'
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <Code2 className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-semibold">Developer</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Encontre vagas e projetos
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setUserType('company')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    userType === 'company'
                      ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <Building2 className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-semibold">Company</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Publique vagas e encontre talentos
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Formulário de Login */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
          )}

          {/* Formulário de Registro */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Campos Comuns */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                      placeholder={userType === 'developer' ? 'João Silva' : 'Tech Corp'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">@</span>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full pl-8 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                      placeholder="joaosilva"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 transition resize-none"
                  placeholder={
                    userType === 'developer'
                      ? 'Full Stack Developer apaixonado por React...'
                      : 'Empresa de tecnologia inovadora...'
                  }
                />
              </div>

              {/* Campos específicos para Developer */}
              {userType === 'developer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Cargo
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                        placeholder="Senior Frontend Developer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Skills (separadas por vírgula)
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                        placeholder="React, TypeScript, Node.js, PostgreSQL"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      GitHub Username (opcional)
                    </label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        name="githubUsername"
                        value={formData.githubUsername}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                        placeholder="joaosilva"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Campos específicos para Company */}
              {userType === 'company' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                        placeholder="https://minhaempresa.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Indústria
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                        placeholder="Tecnologia, SaaS, Fintech..."
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  userType === 'developer'
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-fuchsia-600 hover:bg-fuchsia-700'
                } text-white`}
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </button>
            </form>
          )}

          {/* Trocar entre Login/Registro */}
          <div className="mt-6 text-center text-sm text-slate-400">
            {mode === 'login' ? (
              <>
                Não tem conta?{' '}
                <button
                  onClick={switchMode}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Criar conta grátis
                </button>
              </>
            ) : (
              <>
                Já tem uma conta?{' '}
                <button
                  onClick={switchMode}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Entrar
                </button>
              </>
            )}
          </div>

          {/* Contas de Teste */}
          <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-xs font-semibold text-slate-400 mb-2">🧪 Contas de Teste:</p>
            <div className="text-xs text-slate-500 space-y-1">
              <p><strong>Developer:</strong> gabriel@example.com / password123</p>
              <p><strong>Company:</strong> contato@technova.com / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};