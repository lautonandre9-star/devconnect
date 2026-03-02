// src/pages/AuthPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Code2,
  Mail,
  Lock,
  User,
  Building2,
  Globe,
  Github,
  Tag,
  Briefcase,
  Loader,
  Sparkles,
  Users,
  Rocket,
  Zap,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

type AuthMode = 'login' | 'register';
type UserType = 'developer' | 'company';

const AuthPage: React.FC = () => {
  const { login, register, sendOTP, forgotPassword, resetPassword } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [userType, setUserType] = useState<UserType>('developer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'reset'>('request');

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
      setSuccess('Login realizado com sucesso! Redirecionando...');
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
        bio: formData.bio || `${userType === 'developer' ? 'Developer' : 'Company'} no DevConnect`,
        otpCode: otpCode,
      };

      if (userType === 'developer') {
        userData.role = formData.role || 'Developer';
        userData.skills = formData.skills.split(',').map((s) => s.trim()).filter(Boolean);
        if (formData.githubUsername) {
          userData.githubUsername = formData.githubUsername;
        }
      }

      if (userType === 'company') {
        userData.website = formData.website;
        userData.industry = formData.industry || 'Tecnologia';
      }

      await register(userData);
      setSuccess('Conta criada com sucesso! Bem-vindo ao DevConnect!');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendOTP(formData.email, 'REGISTRATION');
      setShowOTP(true);
      setSuccess(`Código enviado para ${formData.email}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await forgotPassword(formData.email);
      setRecoveryStep('reset');
      setSuccess('Se o e-mail existir, um código foi enviado.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      await resetPassword({
        email: formData.email,
        otpCode,
        newPassword: formData.password
      });
      setSuccess('Senha alterada com sucesso! Faça login agora.');
      setShowForgotPassword(false);
      setMode('login');
      setRecoveryStep('request');
      setOtpCode('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden lg:block space-y-8 p-12">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/50">
                <Code2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                  DevConnect
                </h1>
                <p className="text-slate-400 text-sm">The LinkedIn for Developers</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Conecte-se com desenvolvedores e empresas de todo o mundo
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                A plataforma que une talentos tech com as melhores oportunidades do mercado.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Users, text: 'Conecte-se com milhares de desenvolvedores' },
                { icon: Rocket, text: 'Encontre as melhores oportunidades' },
                { icon: Zap, text: 'Análise de compatibilidade com IA' },
                { icon: Sparkles, text: 'Showcase de projetos e startups' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="w-10 h-10 bg-slate-800/50 rounded-xl flex items-center justify-center border border-slate-700">
                    <item.icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-slate-800">
              <p className="text-xs text-slate-500 mb-3">Contas de teste disponíveis:</p>
              <div className="space-y-2 text-xs text-slate-600">
                <p>👨‍💻 Dev: gabriel@example.com / password123</p>
                <p>🏢 Company: contato@technova.com / password123</p>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 lg:p-12">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
                <Code2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
                  DevConnect
                </h1>
              </div>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                {mode === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}
              </h2>
              <p className="text-slate-400">
                {mode === 'login'
                  ? 'Entre para continuar sua jornada'
                  : 'Junte-se à maior rede de desenvolvedores'}
              </p>
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl p-4 mb-6 text-sm flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-400 rounded-xl p-4 mb-6 text-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Type Selector (Register Only) */}
            {mode === 'register' && !showOTP && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Tipo de Conta
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType('developer')}
                    className={`p-4 rounded-xl border-2 transition-all ${userType === 'developer'
                      ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
                      }`}
                  >
                    <Code2 className={`w-7 h-7 mx-auto mb-2 ${userType === 'developer' ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <div className={`font-semibold text-sm ${userType === 'developer' ? 'text-indigo-400' : 'text-slate-400'}`}>
                      Developer
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserType('company')}
                    className={`p-4 rounded-xl border-2 transition-all ${userType === 'company'
                      ? 'border-fuchsia-500 bg-fuchsia-500/10 shadow-lg shadow-fuchsia-500/20'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
                      }`}
                  >
                    <Building2 className={`w-7 h-7 mx-auto mb-2 ${userType === 'company' ? 'text-fuchsia-400' : 'text-slate-500'}`} />
                    <div className={`font-semibold text-sm ${userType === 'company' ? 'text-fuchsia-400' : 'text-slate-400'}`}>
                      Company
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Forgot Password Flow */}
            {mode === 'login' && showForgotPassword && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setRecoveryStep('request');
                      setError('');
                      setSuccess('');
                    }}
                    className="text-slate-400 hover:text-white transition"
                  >
                    ← Voltar
                  </button>
                  <h3 className="text-xl font-bold text-white">Recuperar Senha</h3>
                </div>

                {recoveryStep === 'request' ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <p className="text-sm text-slate-400">Insira seu e-mail para receber um código de recuperação.</p>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-white placeholder-slate-500"
                        placeholder="seu@email.com"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50"
                    >
                      {loading ? 'Enviando...' : 'Enviar Código'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <p className="text-sm text-slate-400">Enviamos um código para {formData.email}.</p>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Código OTP</label>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        required
                        maxLength={6}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-white text-center text-2xl tracking-[0.5em]"
                        placeholder="000000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Nova Senha</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-white"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Confirmar Nova Senha</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        minLength={6}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-white"
                        placeholder="••••••••"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50"
                    >
                      {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Login Form */}
            {mode === 'login' && !showForgotPassword && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-white placeholder-slate-500"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-white placeholder-slate-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      Entrar
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Register Form */}
            {mode === 'register' && (
              <>
                {!showOTP ? (
                  <form onSubmit={handleRequestOTP} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Nome {userType === 'company' && 'da Empresa'}
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-white placeholder-slate-500"
                          placeholder={userType === 'developer' ? 'João Silva' : 'Tech Corp'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-white placeholder-slate-500"
                          placeholder="@username"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-white placeholder-slate-500"
                        placeholder="seu@email.com"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Senha
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          minLength={6}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-white placeholder-slate-500"
                          placeholder="••••••••"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Confirmar
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          minLength={6}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-white placeholder-slate-500"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg ${userType === 'developer'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-600/20'
                        : 'bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 shadow-fuchsia-600/20'
                        } text-white`}
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Enviando código...
                        </>
                      ) : (
                        <>
                          Continuar
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="text-center mb-6">
                      <p className="text-sm text-slate-400">Insira o código enviado para</p>
                      <p className="text-white font-semibold">{formData.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Código de Verificação (6 dígitos)
                      </label>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        required
                        maxLength={6}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-white text-center text-2xl tracking-[0.5em]"
                        placeholder="000000"
                        autoFocus
                      />
                    </div>

                    {userType === 'developer' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Skills (separadas por vírgula)
                          </label>
                          <input
                            type="text"
                            name="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-white placeholder-slate-500"
                            placeholder="React, Node.js, TypeScript"
                          />
                        </div>
                      </>
                    )}

                    {userType === 'company' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-white placeholder-slate-500"
                          placeholder="https://minhaempresa.com"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg ${userType === 'developer'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-600/20'
                        : 'bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 shadow-fuchsia-600/20'
                        } text-white`}
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Finalizando...
                        </>
                      ) : (
                        <>
                          Finalizar Cadastro
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowOTP(false)}
                      className="w-full text-sm text-slate-400 hover:text-white transition"
                    >
                      Alterar dados / Reenviar e-mail
                    </button>
                  </form>
                )}
              </>
            )}

            {/* Toggle Mode */}
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError('');
                  setSuccess('');
                }}
                className="text-slate-400 hover:text-white transition"
              >
                {mode === 'login' ? (
                  <>
                    Não tem conta?{' '}
                    <span className="text-indigo-400 font-semibold">Criar conta grátis</span>
                  </>
                ) : (
                  <>
                    Já tem uma conta?{' '}
                    <span className="text-indigo-400 font-semibold">Entrar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

function sendOTP(email: string, arg1: string) {
  throw new Error('Function not implemented.');
}
function resetPassword(arg0: { email: string; otpCode: string; newPassword: string; }) {
  throw new Error('Function not implemented.');
}

