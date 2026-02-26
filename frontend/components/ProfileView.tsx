// src/components/ProfileView.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { api } from '../src/services/api';
import {
  Github,
  Mail,
  Briefcase,
  Calendar,
  Edit,
  Code2,
  X,
  Save,
  Loader,
  Activity,
  Camera,
  Layers,
  Users,
  CheckCircle2,
  Globe,
  Building2,
  Percent,
  ExternalLink,
  MapPin,
  Sparkles,
  Link as LinkIcon,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileViewProps {
  userId?: string;
  onViewProfile?: (userId: string) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ userId, onViewProfile }) => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // For this component we mainly focus on current user
  const profileUser = user;
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [companyJobs, setCompanyJobs] = useState<any[]>([]);
  const [companyStats, setCompanyStats] = useState({ totalJobs: 0, totalApps: 0, accepted: 0, acceptRate: 0 });

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    role: '',
    skills: '',
    githubUsername: '',
    website: '',
    industry: '',
    companySize: '',
    foundedYear: '',
    avatar: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        role: user.role || '',
        skills: user.skills ? (Array.isArray(user.skills) ? user.skills.join(', ') : user.skills) : '',
        githubUsername: user.githubUsername || '',
        website: user.website || '',
        industry: user.industry || '',
        companySize: (user as any).companySize || '',
        foundedYear: (user as any).foundedYear || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (user?.type === 'company') {
      api.jobs.getAll().then((res: any) => {
        const all = Array.isArray(res) ? res : (res?.jobs || []);
        const mine = all.filter((j: any) => j.companyId === user.id || j.company?.id === user.id);
        setCompanyJobs(mine);

        let totalApps = 0;
        let accepted = 0;
        let loaded = 0;
        if (mine.length === 0) return;
        mine.forEach((job: any) => {
          api.applications.getForJob(job.id)
            .then((apps: any) => {
              const list = Array.isArray(apps) ? apps : [];
              totalApps += list.length;
              accepted += list.filter((a: any) => a.status === 'ACCEPTED').length;
            })
            .catch(() => { })
            .finally(() => {
              loaded++;
              if (loaded === mine.length) {
                const acceptRate = totalApps > 0 ? Math.round((accepted / totalApps) * 100) : 0;
                setCompanyStats({ totalJobs: mine.length, totalApps, accepted, acceptRate });
              }
            });
        });
      }).catch(() => { });
    }
  }, [user?.id]);

  if (!profileUser) {
    return (
      <div className="flex justify-center items-center py-20">
        <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
      </div>
    );
  }

  const isDeveloper = profileUser.type === 'developer';
  const isCompany = profileUser.type === 'company';

  let skills: string[] = [];
  if (isDeveloper && profileUser.skills) {
    try {
      skills = typeof profileUser.skills === 'string'
        ? JSON.parse(profileUser.skills)
        : profileUser.skills;
    } catch (e) {
      skills = Array.isArray(profileUser.skills) ? profileUser.skills : [];
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData: any = {
        name: formData.name,
        bio: formData.bio,
        avatar: formData.avatar,
      };
      if (isDeveloper) {
        updateData.role = formData.role;
        updateData.skills = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
        updateData.githubUsername = formData.githubUsername;
      }
      if (isCompany) {
        updateData.website = formData.website;
        updateData.industry = formData.industry;
      }
      await updateUser(updateData);
      setIsEditing(false);
    } catch (error: any) {
      alert(error.message || 'Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-20 px-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />

      {/* Profile Header / Banner */}
      <div className="relative mb-20">
        <div className="h-56 md:h-72 rounded-3xl overflow-hidden relative shadow-2xl border border-slate-800/60 bg-[#12152a]">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-slate-900 to-violet-900/20" />
          <div className="absolute inset-0 bg-[#0d0f1e]/40" />

          <div className="absolute bottom-6 right-6 flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-600/20 transition-all flex items-center gap-2"
                >
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-all shadow-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar Perfil
              </button>
            )}
          </div>
        </div>

        {/* Floating Identity */}
        <div className="absolute -bottom-12 left-10 flex flex-col md:flex-row items-end gap-6 px-2">
          <div className="relative group/avatar">
            <div className="p-1.5 rounded-[2.5rem] bg-[#0d0f1e] shadow-2xl ring-1 ring-slate-800/60">
              <img
                src={formData.avatar || profileUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser.id}`}
                alt={profileUser.name}
                className="w-36 h-36 md:w-44 md:h-44 rounded-[2rem] object-cover"
              />
            </div>
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-2 md:inset-1.5 rounded-[2rem] bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity border-2 border-dashed border-white/20"
              >
                <Camera className="w-8 h-8 mb-1" />
                <span className="text-[10px] font-black uppercase tracking-widest">Mudar Foto</span>
              </button>
            )}
            <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-xl border-4 border-[#0d0f1e]">
              {isDeveloper ? '⚡' : '🔥'}
            </div>
          </div>

          <div className="pb-4 mb-2">
            {!isEditing ? (
              <>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                  {profileUser.name}
                </h1>
                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-indigo-400 font-bold text-sm">@{profileUser.username}</span>
                  <span className="text-slate-500 text-xs font-medium">• {profileUser.type === 'company' ? 'Organização' : profileUser.role || 'Developer'}</span>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</p>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#12152a] border border-slate-800 rounded-xl px-4 py-2 text-xl font-bold text-white focus:border-indigo-500 outline-none w-full md:w-80"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column - Meta & Info */}
        <div className="lg:col-span-4 space-y-6">

          {/* Stats Card - Matches KPI Style */}
          <div className="bg-[#12152a] border border-slate-800/60 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-indigo-400" /> Métricas e Status
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {isCompany ? (
                <>
                  <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/60">
                    <p className="text-2xl font-black text-white leading-none">{companyStats.totalJobs}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">Vagas Abertas</p>
                  </div>
                  <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/60">
                    <p className="text-2xl font-black text-white leading-none">{companyStats.totalApps}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">Inscrições</p>
                  </div>
                  <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/60">
                    <p className="text-2xl font-black text-green-400 leading-none">{companyStats.acceptRate}%</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">Taxa Aceite</p>
                  </div>
                  <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/60">
                    <p className="text-2xl font-black text-indigo-400 leading-none">{companyStats.accepted}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">Contratados</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/60">
                    <p className="text-2xl font-black text-white leading-none">0</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">Projetos</p>
                  </div>
                  <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800/60">
                    <p className="text-2xl font-black text-white leading-none">0</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">Seguidores</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Social & Contact */}
          <div className="bg-[#12152a] border border-slate-800/60 rounded-3xl p-6 shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Conexões</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email</p>
                  <p className="text-sm font-bold text-slate-200">{profileUser.email}</p>
                </div>
              </div>

              {/* Editables */}
              {isDeveloper ? (
                <div className="space-y-4 pt-4 border-t border-slate-800/40">
                  {!isEditing ? (
                    profileUser.githubUsername && (
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                          <Github className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">GitHub</p>
                          <p className="text-sm font-bold text-slate-200">github.com/{profileUser.githubUsername}</p>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">GitHub Username</label>
                      <input type="text" value={formData.githubUsername} onChange={e => setFormData({ ...formData, githubUsername: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 pt-4 border-t border-slate-800/40">
                  {!isEditing ? (
                    profileUser.website && (
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                          <Globe className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Website</p>
                          <p className="text-sm font-bold text-slate-200 truncate max-w-[140px]">{profileUser.website}</p>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Website (URL)</label>
                      <input type="url" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white" />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800/40 flex items-center gap-2 text-slate-500">
              <Calendar className="w-4 h-4" />
              <span className="text-[11px] font-bold">Membro desde {profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Right Column - Main Info */}
        <div className="lg:col-span-8 space-y-6">

          {/* About Card */}
          <div className="bg-[#12152a] border border-slate-800/60 rounded-3xl p-8 shadow-xl">
            <h2 className="text-xl font-black text-white flex items-center gap-3 mb-6 uppercase tracking-tight">
              <div className="p-2 bg-indigo-500/10 rounded-xl"><Activity className="w-5 h-5 text-indigo-400" /></div>
              Biografia Profissional
            </h2>

            {!isEditing ? (
              <p className="text-slate-300 leading-relaxed text-base opacity-90 whitespace-pre-wrap">
                {profileUser.bio || "Descreva sua trajetória e paixão por tecnologia..."}
              </p>
            ) : (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={5}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-5 text-white placeholder:text-slate-600 focus:border-indigo-500 outline-none transition-all resize-none text-sm"
                placeholder="Ex: Desenvolvedor Senior com foco em arquitetura de sistemas escaláveis..."
              />
            )}
          </div>

          {/* Contextual Section (Skills or Industry) */}
          <div className="bg-[#12152a] border border-slate-800/60 rounded-3xl p-8 shadow-xl">
            {isDeveloper ? (
              <>
                <h2 className="text-xl font-black text-white flex items-center gap-3 mb-6 uppercase tracking-tight">
                  <div className="p-2 bg-purple-500/10 rounded-xl"><Code2 className="w-5 h-5 text-purple-400" /></div>
                  Stack Tecnológica
                </h2>
                {!isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.length > 0 ? (
                      skills.map((skill, i) => (
                        <span key={i} className="px-4 py-2 bg-indigo-500/5 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500/10 transition-colors">
                          {skill}
                        </span>
                      ))
                    ) : <p className="text-slate-500 text-sm font-medium">As tecnologias que você domina aparecerão aqui.</p>}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Especialidade / Cargo</label>
                      <input type="text" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-sm text-white" placeholder="Ex: Fullstack Developer" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Linguagens e Ferramentas (separadas por vírgula)</label>
                      <input type="text" value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-sm text-white" placeholder="React, Node, TypeScript..." />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-xl font-black text-white flex items-center gap-3 mb-6 uppercase tracking-tight">
                  <div className="p-2 bg-fuchsia-500/10 rounded-xl"><Building2 className="w-5 h-5 text-fuchsia-400" /></div>
                  Detalhes do Negócio
                </h2>
                {!isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/60">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Indústria</p>
                      <p className="text-sm font-black text-white">{profileUser.industry || '—'}</p>
                    </div>
                    <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/60">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Equipe</p>
                      <p className="text-sm font-black text-white">{(profileUser as any).companySize || '—'}</p>
                    </div>
                    <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/60">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sede</p>
                      <p className="text-sm font-black text-white">{(profileUser as any).foundedYear || '—'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Setor</label>
                      <input type="text" value={formData.industry} onChange={e => setFormData({ ...formData, industry: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-sm text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tamanho da Empresa</label>
                      <input type="text" value={formData.companySize} onChange={e => setFormData({ ...formData, companySize: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-sm text-white" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Project Highlights / Active Jobs */}
          {isCompany ? (
            <div className="bg-[#12152a] border border-slate-800/60 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Minhas Vagas</h2>
                <span className="text-[10px] font-black bg-indigo-500 text-white px-3 py-1 rounded-lg uppercase">{companyJobs.length} ATIVAS</span>
              </div>
              {companyJobs.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl">
                  <p className="text-slate-500 font-bold italic">Nenhuma oportunidade listada.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {companyJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-5 bg-slate-900/60 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all group cursor-pointer">
                      <div className="min-w-0">
                        <h4 className="font-black text-white text-sm group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{job.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-slate-500 text-[10px] font-bold">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                          <span>• {job.hiredCount || 0}/{job.vacancies || 1} preenchidas</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-transform" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#12152a] border border-slate-800/60 border-dashed rounded-3xl p-16 text-center shadow-xl group hover:border-indigo-500/50 transition-all">
              <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-8 h-8 text-slate-700 group-hover:text-indigo-400" />
              </div>
              <h3 className="text-xl font-black text-white/80 mb-2 uppercase tracking-widest">Portfólio coming soon</h3>
              <p className="text-slate-500 text-sm font-medium italic">Seus projetos em destaque aparecerão nesta vitrine em breve.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfileView;