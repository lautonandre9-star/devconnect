import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';
import { Job } from '../types';
import {
  Phone, Video, MessageSquare, User as UserIcon, Check, X,
  Briefcase, Star, Github, ChevronRight, Sparkles,
  FileText, AlertCircle, TrendingUp, Users, CheckCircle2,
  BarChart2, Clock, Percent
} from 'lucide-react';

interface Developer {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
  githubUsername?: string;
}

interface Application {
  id: string;
  jobId: string;
  developerId: string;
  coverLetter?: string;
  status: 'PENDING' | 'REVIEWING' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';
  aiScore?: number;
  aiReasoning?: string;
  createdAt: string;
  developer: Developer;
}

interface CompanyDashboardProps {
  onViewProfile?: (userId: string) => void;
  onStartChat?: (userId: string) => void;
  onStartCall?: (userId: string, type: 'audio' | 'video') => void;
}

const STATUS_CONFIG = {
  PENDING: { label: 'Pendente', color: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10', dot: 'bg-yellow-400' },
  REVIEWING: { label: 'Analisando', color: 'text-blue-400   border-blue-500/40   bg-blue-500/10', dot: 'bg-blue-400' },
  INTERVIEW: { label: 'Entrevista', color: 'text-purple-400 border-purple-500/40 bg-purple-500/10', dot: 'bg-purple-400' },
  ACCEPTED: { label: 'Aceito', color: 'text-green-400  border-green-500/40  bg-green-500/10', dot: 'bg-green-400' },
  REJECTED: { label: 'Rejeitado', color: 'text-red-400    border-red-500/40    bg-red-500/10', dot: 'bg-red-400' },
};

type JobTab = 'all' | 'open' | 'filled';

// Pure-CSS mini bar chart for a job
const MiniBar: React.FC<{ label: string; value: number; max: number; color: string }> = ({ label, value, max, color }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">{label}</span>
        <span className="text-[10px] font-black text-slate-300">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const CompanyDashboard: React.FC<CompanyDashboardProps> = ({ onViewProfile, onStartChat, onStartCall }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Application[]>([]);
  // Cache applicants per job so we can compute cross-job stats
  const [allApplicantsMap, setAllApplicantsMap] = useState<Record<string, Application[]>>({});
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobVacancies, setNewJobVacancies] = useState(1);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [jobTab, setJobTab] = useState<JobTab>('all');

  // Read jobId from URL query param (from notifications)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jobIdFromUrl = params.get('jobId');
    if (jobIdFromUrl) setSelectedJobId(jobIdFromUrl);
  }, []);

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    try {
      const response = await api.jobs.getAll();
      const jobList = Array.isArray(response) ? response : (response?.jobs || []);
      const myJobs = jobList.filter((j: any) => j.companyId === user?.id || j.company?.id === user?.id);
      setJobs(myJobs);
      if (myJobs.length > 0 && !selectedJobId) setSelectedJobId(myJobs[0].id);
    } catch { setJobs([]); }
  };

  useEffect(() => {
    if (selectedJobId) loadApplicantsForJob(selectedJobId);
  }, [selectedJobId]);

  const loadApplicantsForJob = async (jobId: string) => {
    setLoadingApplicants(true);
    try {
      const data = await api.applications.getForJob(jobId);
      const parsed = (Array.isArray(data) ? data : []).map((app: any) => ({
        ...app,
        developer: {
          ...app.developer,
          skills: typeof app.developer?.skills === 'string'
            ? JSON.parse(app.developer.skills)
            : (app.developer?.skills || []),
        }
      }));
      setApplicants(parsed);
      setAllApplicantsMap(prev => ({ ...prev, [jobId]: parsed }));
    } catch { setApplicants([]); }
    finally { setLoadingApplicants(false); }
  };

  // ---- Global stats from cached applicant data ----
  const globalStats = useMemo(() => {
    const allApps = Object.values(allApplicantsMap).flat();
    const totalJobs = jobs.length;
    const totalApps = allApps.length;
    const totalAccepted = allApps.filter(a => a.status === 'ACCEPTED').length;
    const acceptRate = totalApps > 0 ? Math.round((totalAccepted / totalApps) * 100) : 0;
    return { totalJobs, totalApps, totalAccepted, acceptRate };
  }, [jobs, allApplicantsMap]);

  // Trigger loading applicants for all jobs to build full stats
  useEffect(() => {
    jobs.forEach(job => {
      if (!allApplicantsMap[job.id]) {
        api.applications.getForJob(job.id).then((data: any) => {
          const parsed = (Array.isArray(data) ? data : []).map((app: any) => ({
            ...app,
            developer: {
              ...app.developer,
              skills: typeof app.developer?.skills === 'string'
                ? JSON.parse(app.developer.skills)
                : (app.developer?.skills || []),
            }
          }));
          setAllApplicantsMap(prev => ({ ...prev, [job.id]: parsed }));
        }).catch(() => { });
      }
    });
  }, [jobs]);

  // ---- Per-job stats for chart ----
  const jobStats = (jobId: string) => {
    const apps = allApplicantsMap[jobId] || [];
    const total = apps.length;
    const accepted = apps.filter(a => a.status === 'ACCEPTED').length;
    const rejected = apps.filter(a => a.status === 'REJECTED').length;
    const pending = apps.filter(a => a.status === 'PENDING' || a.status === 'REVIEWING' || a.status === 'INTERVIEW').length;
    return { total, accepted, rejected, pending };
  };

  // ---- Filtered jobs list ----
  const filteredJobs = useMemo(() => {
    if (jobTab === 'open') return jobs.filter(j => ((j as any).hiredCount || 0) < ((j as any).vacancies || 1));
    if (jobTab === 'filled') return jobs.filter(j => ((j as any).hiredCount || 0) >= ((j as any).vacancies || 1));
    return jobs;
  }, [jobs, jobTab]);

  const handleStatusChange = async (appId: string, status: string) => {
    setUpdatingStatus(appId);
    try {
      await api.applications.updateStatus(appId, status);
      const updater = (prev: Application[]) =>
        prev.map(a => a.id === appId ? { ...a, status: status as any } : a);
      setApplicants(updater);
      if (selectedJobId) setAllApplicantsMap(prev => ({
        ...prev,
        [selectedJobId]: updater(prev[selectedJobId] || [])
      }));
      if (selectedApp?.id === appId) setSelectedApp(prev => prev ? { ...prev, status: status as any } : null);
      loadJobs();
    } catch { alert('Erro ao atualizar status'); }
    finally { setUpdatingStatus(null); }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) return;
    setAiGenerating(true);
    try {
      await api.jobs.post({ title: newJobTitle, location: 'Remoto', type: 'FullTime', salary: 'A combinar', vacancies: newJobVacancies, generateWithAI: true });
      setIsPosting(false); setNewJobTitle(''); setNewJobVacancies(1);
      await loadJobs();
      alert('Vaga criada com sucesso via IA! 🚀');
    } catch (err: any) {
      alert(`Erro ao criar vaga: ${err.response?.data?.message || err.message}`);
    } finally { setAiGenerating(false); }
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId);
  const selStats = selectedJobId ? jobStats(selectedJobId) : null;

  // KPI card component — matches Talent Manager reference
  const KpiCard = ({ icon: Icon, value, label, trend, colorClass, iconBg }: {
    icon: any; value: string | number; label: string; trend?: string; colorClass: string; iconBg: string;
  }) => (
    <div className="flex-1 min-w-0 bg-[#12152a] border border-slate-800/60 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-green-400">
            <TrendingUp className="w-3 h-3" /> {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-white leading-none mb-1">{value}</p>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-4 px-4 space-y-6">

      {/* ---- PAGE HEADER ---- */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white">Talent Manager</h1>
          <p className="text-slate-400 mt-1 text-sm">Bem-vindo de volta! Aqui está o resumo das suas contratações.</p>
        </div>
        <button
          onClick={() => setIsPosting(true)}
          className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 text-sm"
        >
          <Sparkles className="w-4 h-4" />
          + Nova Vaga
        </button>
      </div>

      {/* ---- KPI STATS BAR ---- */}
      <div className="flex flex-wrap gap-4">
        <KpiCard icon={Briefcase} value={globalStats.totalJobs} label="Vagas Ativas" trend="+2%" colorClass="text-indigo-400" iconBg="bg-indigo-500/15" />
        <KpiCard icon={Users} value={globalStats.totalApps} label="Candidatos Totais" trend="+15%" colorClass="text-violet-400" iconBg="bg-violet-500/15" />
        <KpiCard icon={CheckCircle2} value={globalStats.totalAccepted} label="Aceitos" trend="+5%" colorClass="text-green-400" iconBg="bg-green-500/15" />
        <KpiCard icon={Percent} value={`${globalStats.acceptRate}%`} label="Taxa de Conversão" trend="+1.2%" colorClass="text-amber-400" iconBg="bg-amber-500/15" />
      </div>


      {/* ---- MAIN GRID ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ---- JOBS SIDEBAR ---- */}
        <div className="lg:col-span-1 space-y-3">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-slate-900/60 border border-slate-800 rounded-xl">
            {([['all', 'Todas'], ['open', 'Abertas'], ['filled', 'Cheias']] as [JobTab, string][]).map(([key, lbl]) => (
              <button
                key={key}
                onClick={() => setJobTab(key)}
                className={`flex-1 text-[10px] font-black uppercase tracking-widest py-1.5 rounded-lg transition-all ${jobTab === key ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {lbl}
              </button>
            ))}
          </div>

          {filteredJobs.length === 0 ? (
            <div className="text-center py-10 text-slate-600 text-sm">Nenhuma vaga.</div>
          ) : filteredJobs.map(job => {
            const st = jobStats(job.id);
            const isFull = ((job as any).hiredCount || 0) >= ((job as any).vacancies || 1);
            const isSelected = selectedJobId === job.id;
            return (
              <button
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${isSelected ? 'bg-indigo-600/10 border-indigo-500/60' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm leading-tight truncate flex-1 pr-1">{job.title}</h4>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase shrink-0 ${isFull ? 'bg-red-500/15 text-red-400' : 'bg-green-500/15 text-green-400'}`}>
                    {isFull ? 'Cheia' : 'Aberta'}
                  </span>
                </div>

                {/* Mini stat bars */}
                {st.total > 0 && (
                  <div className="flex gap-2 mt-2">
                    <MiniBar label="Total" value={st.total} max={st.total} color="bg-slate-500" />
                    <MiniBar label="Ace" value={st.accepted} max={st.total} color="bg-green-500" />
                    <MiniBar label="Rej" value={st.rejected} max={st.total} color="bg-red-500" />
                  </div>
                )}
                <p className="text-[10px] text-slate-600 mt-2">
                  {(job as any).hiredCount || 0}/{(job as any).vacancies || 1} preenchidas
                </p>
              </button>
            );
          })}
        </div>

        {/* ---- APPLICANTS PANEL ---- */}
        <div className="lg:col-span-3">
          {/* Job stats header */}
          {selStats && selStats.total > 0 && (
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Candidatos', value: selStats.total, cls: 'text-white' },
                { label: 'Pendentes', value: selStats.pending, cls: 'text-yellow-400' },
                { label: 'Aceitos', value: selStats.accepted, cls: 'text-green-400' },
                { label: 'Rejeitados', value: selStats.rejected, cls: 'text-red-400' },
              ].map(s => (
                <div key={s.label} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 text-center">
                  <p className={`text-xl font-black ${s.cls}`}>{s.value}</p>
                  <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Progress bar for selected job */}
          {selStats && selStats.total > 0 && (
            <div className="mb-4 bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">Pipeline de candidaturas</span>
                <span className="text-xs text-slate-500">{selectedJob?.title}</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                {selStats.accepted > 0 && (
                  <div className="bg-green-500 transition-all duration-700" style={{ flex: selStats.accepted }} title={`${selStats.accepted} aceitos`} />
                )}
                {selStats.pending > 0 && (
                  <div className="bg-yellow-500 transition-all duration-700" style={{ flex: selStats.pending }} title={`${selStats.pending} pendentes`} />
                )}
                {selStats.rejected > 0 && (
                  <div className="bg-red-500/60 transition-all duration-700" style={{ flex: selStats.rejected }} title={`${selStats.rejected} rejeitados`} />
                )}
              </div>
              <div className="flex gap-4 mt-2">
                {[
                  { color: 'bg-green-500', label: 'Aceitos' },
                  { color: 'bg-yellow-500', label: 'Pendentes/Entrevista' },
                  { color: 'bg-red-500/60', label: 'Rejeitados' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${l.color}`} />
                    <span className="text-[9px] text-slate-500 font-bold">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Applicants list */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold">{selectedJob?.title || 'Candidatos'}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{applicants.length} candidatura{applicants.length !== 1 ? 's' : ''}</p>
              </div>
              {selStats && selStats.total > 0 && (
                <div className="text-right">
                  <p className="text-xs font-black text-green-400">
                    {selStats.total > 0 ? Math.round((selStats.accepted / selStats.total) * 100) : 0}% aprovação
                  </p>
                  <p className="text-[10px] text-slate-500">nesta vaga</p>
                </div>
              )}
            </div>

            <div className="divide-y divide-slate-800/60">
              {loadingApplicants ? (
                <div className="p-12 text-center text-slate-500 text-sm">A carregar candidatos...</div>
              ) : applicants.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-14 h-14 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="w-6 h-6 text-slate-600" />
                  </div>
                  <p className="text-slate-500 text-sm">Nenhum candidato ainda.</p>
                </div>
              ) : applicants.map(app => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className="p-5 flex items-center justify-between hover:bg-slate-800/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={app.developer?.avatar || `https://avatar.vercel.sh/${app.developerId}`}
                      className="w-11 h-11 rounded-2xl object-cover border border-slate-700"
                      alt={app.developer?.name}
                    />
                    <div>
                      <h4 className="font-bold text-sm">{app.developer?.name || 'Developer'}</h4>
                      <p className="text-xs text-slate-500">@{app.developer?.username}</p>
                      {app.developer?.skills && app.developer.skills.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {app.developer.skills.slice(0, 3).map((s: string) => (
                            <span key={s} className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-full font-medium border border-indigo-500/20">{s}</span>
                          ))}
                          {app.developer.skills.length > 3 && <span className="text-[10px] text-slate-500">+{app.developer.skills.length - 3}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {app.aiScore && (
                      <div className="text-right hidden md:block">
                        <div className="text-xs font-black text-green-400">{app.aiScore}%</div>
                        <div className="text-[10px] text-slate-500">IA</div>
                      </div>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${STATUS_CONFIG[app.status]?.color}`}>
                      {STATUS_CONFIG[app.status]?.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== APPLICATION REVIEW MODAL ===== */}
      {selectedApp && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedApp(null); }}
        >
          <div className="bg-slate-900 border border-slate-700/60 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10 rounded-t-3xl">
              <h2 className="text-lg font-black">Revisão de Candidatura</h2>
              <button onClick={() => setSelectedApp(null)} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Dev profile row */}
              <div className="flex items-start gap-4">
                <img
                  src={selectedApp.developer?.avatar || `https://avatar.vercel.sh/${selectedApp.developerId}`}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-700"
                  alt={selectedApp.developer?.name}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-black">{selectedApp.developer?.name}</h3>
                  <p className="text-slate-400 text-sm">@{selectedApp.developer?.username}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {selectedApp.developer?.githubUsername && (
                      <a href={`https://github.com/${selectedApp.developer.githubUsername}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        <Github className="w-3.5 h-3.5" />{selectedApp.developer.githubUsername}
                      </a>
                    )}
                    <span className="text-xs text-slate-600">
                      {new Date(selectedApp.createdAt).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border shrink-0 ${STATUS_CONFIG[selectedApp.status]?.color}`}>
                  {STATUS_CONFIG[selectedApp.status]?.label}
                </span>
              </div>

              {/* Bio */}
              {selectedApp.developer?.bio && (
                <div>
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Sobre</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{selectedApp.developer.bio}</p>
                </div>
              )}

              {/* Skills */}
              {selectedApp.developer?.skills && selectedApp.developer.skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Habilidades</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.developer.skills.map((skill: string) => (
                      <span key={skill} className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold rounded-xl">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Score */}
              {selectedApp.aiScore && (
                <div className="bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-green-500/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-green-400" />
                      <h4 className="text-sm font-black text-green-400">Match por IA</h4>
                    </div>
                    <div className="text-2xl font-black text-green-400">{selectedApp.aiScore}%</div>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all" style={{ width: `${selectedApp.aiScore}%` }} />
                  </div>
                  {selectedApp.aiReasoning && <p className="text-xs text-slate-400 leading-relaxed">{selectedApp.aiReasoning}</p>}
                </div>
              )}

              {/* Cover Letter */}
              {selectedApp.coverLetter && (
                <div>
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" /> Carta de Apresentação
                  </h4>
                  <div className="bg-slate-800/50 rounded-2xl p-4 text-sm text-slate-300 leading-relaxed border border-slate-700/50">
                    {selectedApp.coverLetter}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-slate-800 pt-5">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Ações</h4>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {onViewProfile && (
                    <button onClick={() => { onViewProfile(selectedApp.developerId); setSelectedApp(null); }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all border border-slate-700">
                      <UserIcon className="w-4 h-4" />Ver Perfil
                    </button>
                  )}
                  {onStartChat && (
                    <button onClick={() => { onStartChat(selectedApp.developerId); setSelectedApp(null); }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white text-sm font-semibold transition-all border border-indigo-500/30">
                      <MessageSquare className="w-4 h-4" />Chat
                    </button>
                  )}
                  {onStartCall && (
                    <>
                      <button onClick={() => { onStartCall(selectedApp.developerId, 'audio'); setSelectedApp(null); }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 hover:bg-green-600 text-green-400 hover:text-white text-sm font-semibold transition-all border border-green-500/30">
                        <Phone className="w-4 h-4" />Ligar
                      </button>
                      <button onClick={() => { onStartCall(selectedApp.developerId, 'video'); setSelectedApp(null); }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-600 text-purple-400 hover:text-white text-sm font-semibold transition-all border border-purple-500/30">
                        <Video className="w-4 h-4" />Vídeo
                      </button>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    disabled={selectedApp.status === 'ACCEPTED' || updatingStatus === selectedApp.id}
                    onClick={() => handleStatusChange(selectedApp.id, 'ACCEPTED')}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-green-500/10 hover:bg-green-500 border border-green-500/30 hover:border-green-500 text-green-400 hover:text-white font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Check className="w-5 h-5" />
                    {updatingStatus === selectedApp.id ? 'A processar...' : 'Aceitar'}
                  </button>
                  <button
                    disabled={selectedApp.status === 'REJECTED' || updatingStatus === selectedApp.id}
                    onClick={() => handleStatusChange(selectedApp.id, 'REJECTED')}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <X className="w-5 h-5" />
                    {updatingStatus === selectedApp.id ? 'A processar...' : 'Rejeitar'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <button
                    disabled={selectedApp.status === 'REVIEWING' || updatingStatus === selectedApp.id}
                    onClick={() => handleStatusChange(selectedApp.id, 'REVIEWING')}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500/5 hover:bg-blue-500/15 border border-blue-500/20 text-blue-400 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <AlertCircle className="w-4 h-4" />Em análise
                  </button>
                  <button
                    disabled={selectedApp.status === 'INTERVIEW' || updatingStatus === selectedApp.id}
                    onClick={() => handleStatusChange(selectedApp.id, 'INTERVIEW')}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-500/5 hover:bg-purple-500/15 border border-purple-500/20 text-purple-400 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Star className="w-4 h-4" />Convidar p/ Entrevista
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== NEW JOB MODAL ===== */}
      {isPosting && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Nova Vaga Assistida por IA</h2>
            <form onSubmit={handlePostJob}>
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Título do Cargo</label>
                <input
                  type="text" value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  placeholder="Ex: Senior Cloud Architect"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Vagas Disponíveis</label>
                <input
                  type="number" min="1" value={newJobVacancies}
                  onChange={(e) => setNewJobVacancies(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mb-6 bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-3">
                💡 A IA irá gerar a descrição técnica e requisitos completos baseados no cargo.
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsPosting(false)} className="flex-1 py-3 border border-slate-700 rounded-xl font-bold hover:bg-slate-800 transition-all">Cancelar</button>
                <button type="submit" disabled={aiGenerating} className="flex-1 py-3 bg-indigo-600 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all">
                  {aiGenerating ? 'Gerando...' : 'Postar Vaga ✨'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;