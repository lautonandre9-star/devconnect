import React, { useState, useEffect } from 'react';
import { api } from '../src/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, ExternalLink, Sparkles, MessageSquare, Briefcase, UserPlus, X, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NotificationDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await api.notifications.getAll();
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await api.notifications.markAsRead(id);
            loadNotifications();
        } catch (error) {
            console.error('Erro ao marcar como lida:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.notifications.markAllAsRead();
            loadNotifications();
        } catch (error) {
            console.error('Erro ao marcar todas como lidas:', error);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await api.notifications.delete(id);
            loadNotifications();
        } catch (error) {
            console.error('Erro ao eliminar notificação:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'FRIEND_REQUEST': return <UserPlus className="w-4 h-4 text-blue-400" />;
            case 'FRIEND_ACCEPTED': return <Sparkles className="w-4 h-4 text-green-400" />;
            case 'JOB_APPLICATION': return <Briefcase className="w-4 h-4 text-orange-400" />;
            case 'APPLICATION_STATUS_CHANGE': return <Sparkles className="w-4 h-4 text-indigo-400" />;
            case 'NEW_MESSAGE': return <MessageSquare className="w-4 h-4 text-purple-400" />;
            default: return <Bell className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2.5 rounded-xl transition-all border ${isOpen
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                        : 'bg-slate-800/40 text-slate-400 hover:text-white border-slate-700/50 hover:bg-slate-800'
                    }`}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[1.25rem] h-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#12152a] px-1 shadow-lg">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 12, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.95 }}
                            className="absolute right-0 mt-4 w-80 md:w-96 bg-[#12152a] border border-slate-800/60 rounded-3xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] z-50 overflow-hidden backdrop-blur-xl"
                        >
                            {/* Header Widget style */}
                            <div className="p-5 border-b border-slate-800/60 flex items-center justify-between bg-gradient-to-r from-indigo-600/5 to-transparent">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Centro de Eventos</h3>
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest bg-indigo-500/10 px-3 py-1.5 rounded-lg hover:bg-indigo-500/20 transition-all"
                                    >
                                        Marcar como lidas
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[440px] overflow-y-auto no-scrollbar">
                                {loading && notifications.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-4" />
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sincronizando...</p>
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-16 text-center">
                                        <div className="w-16 h-16 bg-slate-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-800/60 shadow-inner">
                                            <Bell className="w-7 h-7 text-slate-700" />
                                        </div>
                                        <p className="text-white/40 text-[11px] font-black uppercase tracking-widest italic">Tudo limpo por aqui</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-800/40">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className={`p-5 cursor-pointer transition-all hover:bg-slate-900/40 flex gap-4 group relative ${!notification.isRead ? 'bg-indigo-600/[0.03]' : ''}`}
                                            >
                                                {!notification.isRead && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
                                                )}

                                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${!notification.isRead ? 'bg-indigo-600/20 border border-indigo-500/30' : 'bg-slate-900/60 border border-slate-800'}`}>
                                                    {getIcon(notification.type)}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                                        <p className={`text-[13px] font-black tracking-tight leading-tight truncate ${!notification.isRead ? 'text-white' : 'text-slate-400'}`}>
                                                            {notification.title}
                                                        </p>
                                                        <div className="flex items-center gap-1 text-[9px] text-slate-600 shrink-0 font-bold uppercase tracking-tighter">
                                                            <Clock className="w-3 h-3" />
                                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: false, locale: ptBR })}
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed mb-4">
                                                        {notification.content}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        {notification.link && (
                                                            <a
                                                                href={notification.link}
                                                                className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-[0.1em] flex items-center gap-2 group/link"
                                                            >
                                                                Explorar <ChevronRight className="w-2.5 h-2.5 group-hover/link:translate-x-0.5 transition-transform" />
                                                            </a>
                                                        )}
                                                        <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => handleDelete(notification.id, e)}
                                                                className="p-1.5 bg-slate-900 hover:bg-red-500/20 text-slate-600 hover:text-red-400 rounded-lg transition-all border border-slate-800"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-[#0d0f1e] border-t border-slate-800/60 flex items-center justify-center shadow-inner">
                                <button className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-[0.2em] transition-colors w-full py-2.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800">
                                    Ver Fluxo Completo
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;

function ChevronRight(props: any) {
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
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}
