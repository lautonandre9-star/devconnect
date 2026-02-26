import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { api } from '../src/services/api';
import { DevEvent } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Calendar, MapPin, Users, Sparkles, ExternalLink,
  Globe, Map as MapIcon, Link as LinkIcon, Image as ImageIcon,
  Video, Clock, CheckCircle, ChevronRight, Filter, Info, Loader
} from 'lucide-react';

interface EventViewProps {
  onViewProfile: (userId: string) => void;
}

const MEETING_PLATFORMS = [
  { name: 'Google Meet', placeholder: 'https://meet.google.com/xxx-xxxx-xxx' },
  { name: 'Microsoft Teams', placeholder: 'https://teams.microsoft.com/l/meetup-join/...' },
  { name: 'Zoom', placeholder: 'https://zoom.us/j/...' },
  { name: 'Skype', placeholder: 'https://join.skype.com/invite/...' },
  { name: 'Outra plataforma', placeholder: 'https://...' },
];

const EventView: React.FC<EventViewProps> = ({ onViewProfile }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<DevEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<DevEvent | null>(null);
  const [filter, setFilter] = useState<'all' | 'Hackathon' | 'Meetup' | 'Webinar'>('all');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [newEvent, setNewEvent] = useState({
    title: '',
    organizer: user?.name || '',
    date: '',
    type: 'Meetup' as 'Hackathon' | 'Meetup' | 'Webinar',
    image: '',
    imagePreview: '',
    description: '',
    isOnline: false,
    location: '',
    meetingLink: '',
    maxAttendees: '' as string | number,
  });

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    try {
      const response = await api.events.getAll();
      setEvents(response.events || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttend = async (event: DevEvent) => {
    try {
      if (event.isAttending) await api.events.cancelAttend(event.id);
      else await api.events.attend(event.id);
      await loadEvents();
      if (selectedEvent?.id === event.id) {
        const updated = events.find(e => e.id === event.id);
        if (updated) setSelectedEvent({ ...updated, isAttending: !event.isAttending });
      }
    } catch (error) {
      alert('Erro ao processar inscrição');
    }
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setNewEvent(prev => ({ ...prev, image: base64, imagePreview: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.image && !newEvent.imagePreview) { alert('Por favor, adiciona uma imagem ao evento.'); return; }
    if (newEvent.isOnline && !newEvent.meetingLink) { alert('Por favor, adiciona o link do meeting para eventos online.'); return; }
    setCreating(true);
    try {
      await api.events.create({
        title: newEvent.title,
        description: newEvent.description,
        date: new Date(newEvent.date).toISOString(),
        type: newEvent.type,
        image: newEvent.image || newEvent.imagePreview,
        isOnline: newEvent.isOnline,
        location: newEvent.isOnline ? newEvent.meetingLink : newEvent.location,
        maxAttendees: Number(newEvent.maxAttendees),
        registrationUrl: newEvent.isOnline ? newEvent.meetingLink : undefined,
      });
      setShowCreateModal(false);
      setNewEvent({ title: '', organizer: user?.name || '', date: '', type: 'Meetup', image: '', imagePreview: '', description: '', isOnline: false, location: '', meetingLink: '', maxAttendees: '' });
      await loadEvents();
    } catch (err) {
      alert('Erro ao criar evento');
    } finally {
      setCreating(false);
    }
  };

  const filteredEvents = events.filter(e => filter === 'all' || e.type === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Sparkles className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto pb-20 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Calendar className="w-8 h-8 text-indigo-500" /> Eventos da Comunidade
          </h1>
          <p className="text-slate-400 mt-1 text-sm font-medium">Aprenda, conecte-se e cresça com especialistas da área.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-[#12152a] border border-slate-800/60 rounded-xl">
            {['all', 'Hackathon', 'Meetup', 'Webinar'].map(f => (
              <button key={f} onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}>
                {f === 'all' ? 'Todos' : f}
              </button>
            ))}
          </div>
          <button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Criar Evento
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredEvents.map((event, index) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedEvent(event)} className="bg-[#12152a] border border-slate-800/60 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all group cursor-pointer shadow-xl">
              <div className="relative h-44 overflow-hidden bg-slate-900">
                <img src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">{event.type}</span>
                  {event.isOnline && <span className="px-3 py-1 bg-green-500/20 backdrop-blur-md border border-green-500/30 text-green-400 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Video className="w-3 h-3" /> Online</span>}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-black text-white group-hover:text-indigo-400 transition leading-tight mb-4 min-h-[3.5rem] line-clamp-2">{event.title}</h3>

                <div className="grid grid-cols-2 gap-y-4 mb-6">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold whitespace-nowrap">{new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold whitespace-nowrap">{new Date(event.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 col-span-2">
                    {event.isOnline ? <Globe className="w-4 h-4 text-indigo-400" /> : <MapPin className="w-4 h-4 text-indigo-400" />}
                    <span className="text-xs font-bold truncate">{event.isOnline ? 'Online via Meeting' : event.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-slate-800/60">
                  <div className="flex items-center -space-x-2">
                    {Array.from({ length: Math.min(event.attendees || 0, 3) }).map((_, i) => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-[#12152a] overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=EventUser-${i}-${event.id}`} alt="" />
                      </div>
                    ))}
                    {(event.attendees || 0) > 3 && <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-[#12152a] flex items-center justify-center text-[10px] font-black text-slate-400">+{(event.attendees || 0) - 3}</div>}
                    {(event.attendees || 0) === 0 && <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3">0 Inscritos</span>}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleAttend(event); }} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${event.isAttending ? 'bg-green-500/15 text-green-400 border border-green-500/30' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}>
                    {event.isAttending ? '✓ Confirmado' : 'Participar'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal - Event Detail - Polished */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setSelectedEvent(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0e1120] border border-slate-800/60 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl relative">
              <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-xl z-10 transition-all"><X className="w-5 h-5" /></button>

              <div className="h-64 relative">
                <img src={selectedEvent.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80'} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1120] to-transparent" />
                <div className="absolute bottom-6 left-8">
                  <div className="flex gap-2 mb-3">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg text-xs font-black uppercase tracking-widest">{selectedEvent.type}</span>
                    {selectedEvent.isOnline && <span className="px-3 py-1 bg-green-500/20 backdrop-blur-md border border-green-500/30 text-green-400 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2"><Video className="w-3 h-3" /> Online</span>}
                  </div>
                  <h2 className="text-3xl font-black text-white">{selectedEvent.title}</h2>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="flex flex-wrap gap-x-10 gap-y-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Informações Gerais</p>
                    <div className="flex flex-col gap-3">
                      <p className="text-slate-200 font-bold flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-400" /> {new Date(selectedEvent.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
                      <p className="text-slate-200 font-bold flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-400" /> {new Date(selectedEvent.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}h</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{selectedEvent.isOnline ? 'Plataforma' : 'Localização'}</p>
                    <div className="flex flex-col gap-3">
                      <p className="text-slate-200 font-bold flex items-center gap-2">
                        {selectedEvent.isOnline ? <Globe className="w-4 h-4 text-indigo-400" /> : <MapPin className="w-4 h-4 text-indigo-400" />}
                        {selectedEvent.isOnline ? 'Link enviado aos inscritos' : selectedEvent.location}
                      </p>
                      <p className="text-slate-200 font-bold flex items-center gap-2"><Users className="w-4 h-4 text-indigo-400" /> {selectedEvent.attendees || 0} participantes confirmados</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Sobre o Evento</p>
                  <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">{selectedEvent.description}</p>
                </div>

                {selectedEvent.isOnline && selectedEvent.isAttending && selectedEvent.registrationUrl && (
                  <div className="bg-green-600/10 border border-green-500/30 rounded-2xl p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-green-400" />
                      <h4 className="font-black text-green-400 uppercase tracking-widest text-xs">Link do Meeting</h4>
                    </div>
                    <p className="text-slate-300 text-xs">Como inscrito, você tem acesso direto à reunião:</p>
                    <a href={selectedEvent.registrationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-green-600/20">
                      Entrar na Reunião <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                <div className="pt-2">
                  <button onClick={() => handleAttend(selectedEvent)} className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${selectedEvent.isAttending ? 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'}`}>
                    {selectedEvent.isAttending ? <><X className="w-5 h-5" /> Cancelar Presença</> : <><CheckCircle className="w-5 h-5" /> Confirmar Participação</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal - Create Event - Polished */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0e1120] border border-slate-800/60 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
                <h2 className="text-xl font-black text-white uppercase tracking-widest">Criar Novo Evento</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleCreateEvent} className="p-8 space-y-6 overflow-y-auto no-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Título do Evento *</label>
                  <input required value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} className="w-full px-5 py-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition" placeholder="Ex: Workshop de Rust para Iniciantes" />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data e Hora *</label>
                    <input required type="datetime-local" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} className="w-full px-5 py-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl text-white focus:outline-none focus:border-indigo-500 transition" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Categoria *</label>
                    <select value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value as any })} className="w-full px-5 py-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl text-white appearance-none focus:outline-none focus:border-indigo-500 transition">
                      <option value="Meetup">Meetup</option>
                      <option value="Hackathon">Hackathon</option>
                      <option value="Webinar">Webinar</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Descrição do Evento *</label>
                  <textarea required value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} rows={4} className="w-full px-5 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition resize-none" placeholder="Explique o que os participantes podem esperar..." />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={newEvent.isOnline} onChange={e => setNewEvent({ ...newEvent, isOnline: e.target.checked })} className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 transition" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition">Evento 100% Online</span>
                    </label>
                  </div>
                </div>

                {newEvent.isOnline ? (
                  <div className="space-y-3 p-5 bg-slate-900/30 rounded-2xl border border-slate-800/60">
                    <label className="text-[10px] font-black text-green-400 uppercase tracking-widest flex items-center gap-2"><Video className="w-4 h-4" /> Link do Meeting *</label>
                    <input required type="url" value={newEvent.meetingLink} onChange={e => setNewEvent({ ...newEvent, meetingLink: e.target.value })} className="w-full px-5 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-green-500 transition" placeholder="https://meet.google.com/..." />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-4 h-4" /> Localização / Presencial *</label>
                    <input required value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} className="w-full px-5 py-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition" placeholder="Ex: Auditório principal, Hub Inovação" />
                  </div>
                )}

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Capa do Evento *</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button type="button" onClick={() => imageInputRef.current?.click()} className="h-32 rounded-2xl border-2 border-dashed border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/40 transition flex flex-col items-center justify-center gap-2 text-slate-500 group">
                      <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Enviar Imagem</span>
                    </button>
                    <input type="file" ref={imageInputRef} onChange={handleImageFile} accept="image/*" className="hidden" />
                    {newEvent.imagePreview ? (
                      <div className="h-32 rounded-2xl overflow-hidden border border-slate-800 relative group">
                        <img src={newEvent.imagePreview} className="w-full h-full object-cover" alt="" />
                        <button onClick={() => setNewEvent(p => ({ ...p, image: '', imagePreview: '' }))} className="absolute top-2 right-2 p-1 bg-black/60 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <div className="h-32 rounded-2xl bg-slate-900/30 flex items-center justify-center text-[10px] font-black text-slate-700 uppercase tracking-widest border border-slate-800/60">Sem Prévia</div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4 sticky bottom-0 bg-[#0e1120] pb-2">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest hover:text-white transition">Cancelar</button>
                  <button type="submit" disabled={creating} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2">
                    {creating ? <Loader className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Publicar Evento</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventView;
