import React, { useState, useEffect, useRef } from 'react';
import { api } from '../src/services/api';
import {
  MapPin, DollarSign, Briefcase, Clock, Building2, Search,
  Loader2, CheckCircle, AlertCircle, X, Bookmark, BookmarkCheck,
  SlidersHorizontal, ChevronDown, CircleDot, TrendingUp, ArrowRight
} from 'lucide-react';
import { useAuth } from '../src/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Job {
  id: string;
  title: string;
  company: {
    id: string;
    name: string;
    logo: string | null;
    industry: string | null;
  };
  location: string;
  type: string;
  salary: string | null;
  description: string;
  requirements: string[];
  createdAt: string;
  views: number;
  isActive: boolean;
  _count?: { applications: number };
  hasApplied?: boolean;
}

interface JobBoardProps {
  onViewProfile: (userId: string) => void;
}

// Company icon colored backgrounds
const COMPANY_COLORS = [
  'from-indigo-500 to-violet-600',
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-fuchsia-500 to-purple-600',
];
const getCompanyColor = (id: string) => COMPANY_COLORS[id.charCodeAt(0) % COMPANY_COLORS.length];

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Agora mesmo';
  if (hours < 24) return `Há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Ontem';
  if (days < 7) return `Há ${days} dias`;
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

const JobBoard: React.FC<JobBoardProps> = ({ onViewProfile }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applying, setApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchJobs();
    return () => { if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current); };
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.jobs.getAll();
      const mapJob = (item: any): Job => ({
        id: item.id,
        title: item.title,
        company: {
          id: item.companyId || item.company?.id || '',
          name: item.companyName || item.company?.name || 'Empresa',
          logo: item.companyLogo || item.company?.logo || null,
          industry: item.companyIndustry || item.company?.industry || null
        },
        location: item.location,
        type: item.type,
        salary: item.salary || null,
        description: item.description,
        requirements: item.requirements || [],
        createdAt: item.createdAt || new Date().toISOString(),
        views: item.views || 0,
        isActive: item.isActive ?? true,
        hasApplied: item.hasApplied || false
      });
      const arr = Array.isArray(data) ? data : (data?.jobs || []);
      setJobs(arr.map(mapJob));
    } catch (err) {
      setError('Não foi possível carregar as vagas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!user || user.type !== 'developer') {
      alert('Apenas desenvolvedores podem candidatar-se a vagas!');
      return;
    }
    setApplying(true);
    if (successTimeoutRef.current) { clearTimeout(successTimeoutRef.current); successTimeoutRef.current = null; }
    try {
      await api.applications.create(jobId, 'Tenho interesse nesta vaga e gostaria de fazer parte da equipe.');
      setApplicationSuccess(true);
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, hasApplied: true } : j));
      if (selectedJob?.id === jobId) setSelectedJob(prev => prev ? { ...prev, hasApplied: true } : null);
      successTimeoutRef.current = setTimeout(() => { setApplicationSuccess(false); successTimeoutRef.current = null; }, 3000);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? (err as any).message : '';
      if (msg.includes('já candidatou')) alert('Você já se candidatou a esta vaga!');
      else alert('Erro ao candidatar-se. Tente novamente.');
    } finally {
      setApplying(false);
    }
  };

  const toggleSave = (jobId: string) => {
    setSavedJobs(prev => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId); else next.add(jobId);
      return next;
    });
  };

  const filteredJobs = jobs.filter(job => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || job.title.toLowerCase().includes(q) || job.company.name.toLowerCase().includes(q) || job.location.toLowerCase().includes(q);
    const matchType = selectedType === 'all' || job.type === selectedType;
    return matchSearch && matchType && job.isActive;
  });

  const typeLabel = (type: string) => type === 'FullTime' ? 'Full-Time' : type === 'Internship' ? 'Estágio' : 'Contrato';

  // Determine if a job is "new" (posted in the last 24h)
  const isNew = (createdAt: string) => Date.now() - new Date(createdAt).getTime() < 24 * 3600000;
  // Treat high-view jobs as "destaque"
  const isDestaque = (job: Job) => job.views > 50;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="w-14 h-14 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Ops! Algo deu errado</h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <button onClick={fetchJobs} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-bold transition-all">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Vagas Disponíveis</h1>
          <p className="text-slate-400 flex items-center gap-2 text-sm">
            <CircleDot className="w-3.5 h-3.5 text-green-400 animate-pulse" />
            {filteredJobs.length} novas oportunidades encontradas hoje
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#12152a] border border-slate-700/60 hover:border-slate-600 rounded-xl text-slate-300 text-sm font-semibold transition-all group">
          <TrendingUp className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          Mais Recentes
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" style={{ width: '18px', height: '18px' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Pesquisar cargos, empresas ou palavras-chave..."
          className="w-full bg-[#12152a] border border-slate-700/60 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none transition-all text-sm"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        {[
          { label: 'Todos', value: 'all' },
          { label: 'Full-Time', value: 'FullTime' },
          { label: 'Estágio', value: 'Internship' },
          { label: 'Contrato', value: 'Contract' },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => setSelectedType(opt.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${selectedType === opt.value
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-[#12152a] border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
          >
            {opt.label}
            {opt.value !== 'all' && <ChevronDown className="w-3 h-3 opacity-60" />}
          </button>
        ))}
        {(searchQuery || selectedType !== 'all') && (
          <button
            onClick={() => { setSearchQuery(''); setSelectedType('all'); }}
            className="ml-auto text-sm text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase className="w-14 h-14 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhuma vaga encontrada</h3>
          <p className="text-slate-500">Tente ajustar seus filtros de busca</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-5">
            <AnimatePresence>
              {filteredJobs.map((job, index) => {
                const saved = savedJobs.has(job.id);
                const color = getCompanyColor(job.company.id);
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => setSelectedJob(job)}
                    className="bg-[#12152a] border border-slate-800/60 hover:border-indigo-500/50 rounded-2xl p-6 cursor-pointer transition-all group relative"
                  >
                    {/* Badges */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      {isNew(job.createdAt) && (
                        <span className="px-2.5 py-1 bg-green-500/15 text-green-400 border border-green-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest">NOVO</span>
                      )}
                      {isDestaque(job) && !isNew(job.createdAt) && (
                        <span className="px-2.5 py-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest">DESTAQUE</span>
                      )}
                    </div>

                    {/* Company */}
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                        {job.company.logo ? (
                          <img src={job.company.logo} alt={job.company.name} className="w-8 h-8 object-contain rounded-xl" />
                        ) : (
                          <Building2 className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white group-hover:text-indigo-300 transition-colors leading-tight">{job.title}</h3>
                        <p className="text-sm text-slate-400 font-medium">{job.company.name}</p>
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-2 mb-5 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-600" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-600" />
                        {typeLabel(job.type)}
                      </span>
                      {job.salary && (
                        <span className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-slate-600" />
                          {job.salary}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                        Postado {formatTimeAgo(job.createdAt)}
                      </span>
                    </div>

                    {/* CTA Row */}
                    {user?.type === 'developer' && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={e => { e.stopPropagation(); handleApply(job.id); }}
                          disabled={applying || job.hasApplied}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${job.hasApplied
                              ? 'bg-green-600/15 text-green-400 border border-green-500/30 cursor-default'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20'
                            }`}
                        >
                          {job.hasApplied ? (
                            <><CheckCircle className="w-4 h-4" /> Candidatura Enviada</>
                          ) : (
                            <>Garantir Minha Vaga <ArrowRight className="w-3.5 h-3.5" /></>
                          )}
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); toggleSave(job.id); }}
                          className={`p-2.5 rounded-xl border transition-all ${saved
                              ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-400'
                              : 'border-slate-700/60 text-slate-500 hover:border-indigo-500/40 hover:text-indigo-400 hover:bg-indigo-600/10'
                            }`}
                        >
                          {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Load more */}
          <div className="flex justify-center mt-10 mb-20">
            <button
              onClick={fetchJobs}
              className="px-8 py-3 bg-transparent border border-slate-700/60 hover:border-indigo-500/50 rounded-full text-slate-400 hover:text-slate-200 text-sm font-semibold transition-all"
            >
              Carregar mais oportunidades
            </button>
          </div>
        </>
      )}

      {/* Job Detail Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={e => { if (e.target === e.currentTarget) setSelectedJob(null); }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#0e1120] border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Modal header */}
              <div className="p-8 border-b border-slate-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getCompanyColor(selectedJob.company.id)} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      {selectedJob.company.logo
                        ? <img src={selectedJob.company.logo} className="w-9 h-9 object-contain rounded-xl" alt="" />
                        : <Building2 className="w-6 h-6 text-white" />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white mb-0.5">{selectedJob.title}</h2>
                      <p className="text-slate-400 font-medium">{selectedJob.company.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-all">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 mt-5 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg"><MapPin className="w-4 h-4" />{selectedJob.location}</span>
                  <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg"><Briefcase className="w-4 h-4" />{typeLabel(selectedJob.type)}</span>
                  {selectedJob.salary && <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg"><DollarSign className="w-4 h-4" />{selectedJob.salary}</span>}
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-base font-black text-white mb-3">Descrição</h3>
                  <p className="text-slate-300 whitespace-pre-line leading-relaxed text-sm">{selectedJob.description}</p>
                </div>

                {selectedJob.requirements?.length > 0 && (
                  <div>
                    <h3 className="text-base font-black text-white mb-3">Requisitos</h3>
                    <ul className="space-y-2">
                      {selectedJob.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-slate-300 text-sm">
                          <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {applicationSuccess && (
                  <div className="bg-green-600/15 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <p className="text-green-400 font-bold text-sm">Candidatura enviada com sucesso! A empresa entrará em contato em breve.</p>
                  </div>
                )}

                {user?.type === 'developer' && (
                  <button
                    onClick={() => handleApply(selectedJob.id)}
                    disabled={applying || selectedJob.hasApplied}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${selectedJob.hasApplied
                        ? 'bg-green-600/15 text-green-400 border border-green-500/30 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20'
                      }`}
                  >
                    {applying ? <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
                      : selectedJob.hasApplied ? <><CheckCircle className="w-5 h-5" /> Candidatura Enviada</>
                        : <>Garantir Minha Vaga <ArrowRight className="w-4 h-4" /></>}
                  </button>
                )}

                {user?.type === 'company' && (
                  <div className="bg-slate-800/40 rounded-2xl p-6 text-center">
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-slate-300 font-medium">Empresas não podem candidatar-se a vagas</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobBoard;