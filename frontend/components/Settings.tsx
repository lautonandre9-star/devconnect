// src/components/Settings.tsx
import React, { useState } from 'react';
import { useSettings } from '../src/hooks/useSettings';
import {
  Settings as SettingsIcon,
  Bell,
  Lock,
  Loader2,
  Check,
  Shield,
  Eye,
  Mail,
  Smartphone,
  Briefcase,
  MessageSquare,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsPageProps {
  onViewProfile: (userId: string) => void;
}

export const SettingsPage = ({ onViewProfile }: SettingsPageProps) => {
  const { settings, loading, saving, updateSettings, resetSettings } = useSettings();
  const [showSuccess, setShowSuccess] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
      </div>
    );
  }

  if (!settings) return null;

  const handleToggle = async (key: keyof typeof settings) => {
    const success = await updateSettings({ [key]: !settings[key] });
    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  const handleVisibilityChange = async (value: 'public' | 'connections' | 'private') => {
    const success = await updateSettings({ profileVisibility: value });
    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  const handleReset = async () => {
    if (confirm('Deseja realmente restaurar as configurações padrão?')) {
      const success = await resetSettings();
      if (success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    }
  };

  const toggleConfigs = [
    { key: 'emailNotifications', label: 'E-mail do Sistema', icon: Mail, desc: 'Alertas sobre sua conta e atualizações.' },
    { key: 'pushNotifications', label: 'Push no Navegador', icon: Smartphone, desc: 'Notificações em tempo real.' },
    { key: 'jobAlerts', label: 'Match de Vagas', icon: Briefcase, desc: 'Avisar quando novas vagas surgirem.' },
    { key: 'messageAlerts', label: 'Mensagens Diretas', icon: MessageSquare, desc: 'Sinalizar novos chats.' },
  ];

  const privacyToggles = [
    { key: 'showEmail', label: 'E-mail Público', icon: Mail, desc: 'Exibir seu contato no perfil.' },
    { key: 'showActivity', label: 'Atividade Recente', icon: Activity, desc: 'Mostrar seus posts no feed.' },
    { key: 'allowMessages', label: 'Receber Mensagens', icon: MessageSquare, desc: 'Permitir que outros falem com você.' },
  ];

  return (
    <div className="max-w-[800px] mx-auto pb-20 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
            <SettingsIcon className="w-8 h-8 text-indigo-500" />
            Configurações
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Gerencie suas preferências e privacidade no DevConnect.</p>
        </div>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2 bg-green-500/10 text-green-400 border border-green-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl"
            >
              <Check className="w-4 h-4" />
              Atualizado
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-8">
        {/* Notificações Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <Bell className="w-4 h-4 text-indigo-400" />
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Centro de Notificações</h2>
          </div>

          <div className="bg-[#12152a] border border-slate-800/60 rounded-3xl overflow-hidden shadow-xl">
            <div className="divide-y divide-slate-800/40">
              {toggleConfigs.map(({ key, label, icon: Icon, desc }) => (
                <div key={key} className="flex items-center justify-between p-6 hover:bg-slate-900/30 transition-colors">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{label}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{desc}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggle(key as any)}
                    disabled={saving}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${settings[key as keyof typeof settings] ? 'bg-indigo-600' : 'bg-slate-800'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-md ${settings[key as keyof typeof settings] ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacidade Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <Lock className="w-4 h-4 text-purple-400" />
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Controle de Privacidade</h2>
          </div>

          <div className="bg-[#12152a] border border-slate-800/60 rounded-3xl overflow-hidden shadow-xl">
            {/* Dropdown Visibility */}
            <div className="p-6 border-b border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-400">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Visibilidade Geral</p>
                  <p className="text-[11px] text-slate-500 font-medium">Quem pode encontrar seu perfil nas buscas.</p>
                </div>
              </div>

              <select
                value={settings.profileVisibility}
                onChange={(e) => handleVisibilityChange(e.target.value as any)}
                disabled={saving}
                className="bg-[#0d0f1e] border border-slate-800 rounded-xl px-4 py-2 text-xs font-black text-white focus:border-indigo-500 outline-none uppercase tracking-widest cursor-pointer shadow-inner"
              >
                <option value="public">Público</option>
                <option value="connections">Conexões</option>
                <option value="private">Privado</option>
              </select>
            </div>

            <div className="divide-y divide-slate-800/40">
              {privacyToggles.map(({ key, label, icon: Icon, desc }) => (
                <div key={key} className="flex items-center justify-between p-6 hover:bg-slate-900/30 transition-colors">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{label}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{desc}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggle(key as any)}
                    disabled={saving}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${settings[key as keyof typeof settings] ? 'bg-indigo-600' : 'bg-slate-800'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-md ${settings[key as keyof typeof settings] ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-8">
          <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
            <div>
              <h3 className="text-red-400 font-black text-sm uppercase tracking-widest mb-1 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Resetar Experiência
              </h3>
              <p className="text-slate-500 text-xs font-medium">Isso restaurará todas as configurações para o padrão de fábrica.</p>
            </div>
            <button
              onClick={handleReset}
              disabled={saving}
              className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-red-500/5"
            >
              <RotateCcw className="w-4 h-4 inline mr-2" /> Restaurar Padrão
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}