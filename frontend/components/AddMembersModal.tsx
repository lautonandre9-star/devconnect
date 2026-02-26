// src/components/AddMembersModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, Loader2, Check, Sparkles, UserCheck, Shield } from 'lucide-react';
import { api } from '../src/services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface AddMembersModalProps {
  hubId: string;
  hubName: string;
  onClose: () => void;
}

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  type: string;
  isMember: boolean;
}

export const AddMembersModal: React.FC<AddMembersModalProps> = ({
  hubId,
  hubName,
  onClose
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.users.getAll();
      const membersData = await api.hubs.getMembers(hubId);
      const memberIds = new Set(membersData.members.map((m: any) => m.userId));

      const usersWithMembership = (data.users || data).map((user: any) => ({
        ...user,
        isMember: memberIds.has(user.id)
      }));

      setUsers(usersWithMembership);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    setAddingUserId(userId);
    try {
      await api.hubs.addMember(hubId, userId);
      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, isMember: true }
          : user
      ));
      setTimeout(() => setAddingUserId(null), 1500);
    } catch (err: any) {
      alert(err.message || 'Erro ao adicionar membro');
      setAddingUserId(null);
    }
  };

  const filteredUsers = users.filter(user =>
    !user.isMember &&
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#0d0f1e]/80 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-[#12152a] border border-slate-800/60 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-800/60 flex items-center justify-between bg-gradient-to-r from-indigo-600/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Expansão de Hub</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Convidando membros para #{hubName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-800/60 rounded-xl transition text-slate-500 hover:text-white border border-transparent hover:border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Console-style Search */}
        <div className="p-8 border-b border-slate-800/60 bg-[#0d0f1e]/40">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Escaneando usuários por nome ou @ID..."
              className="w-full bg-[#0d0f1e] border border-slate-800/60 rounded-2xl pl-11 pr-4 py-4 focus:border-indigo-500 outline-none text-white placeholder-slate-700 text-sm transition-all shadow-inner font-bold"
            />
          </div>
        </div>

        {/* User Data Stream */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sincronizando Base de Dados...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl text-slate-700">
                <UserPlus className="w-8 h-8" />
              </div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
                {searchQuery ? 'Sem correspondências no grid' : 'População de Membros Completa!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-[#12152a]/50 border border-slate-800/40 rounded-2xl hover:bg-[#12152a] hover:border-slate-800 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                        alt={user.name}
                        className="w-13 h-13 rounded-xl border border-slate-800 object-cover shadow-lg group-hover:scale-105 transition-transform"
                      />
                      {user.type === 'company' && (
                        <div className="absolute -top-1 -right-1 p-1 bg-indigo-600 rounded-lg shadow-xl shadow-indigo-600/20">
                          <Shield className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-black text-white uppercase tracking-tight text-sm italic">{user.name}</p>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">@{user.username}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddMember(user.id)}
                    disabled={addingUserId === user.id}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 ${addingUserId === user.id
                        ? 'bg-green-600 text-white shadow-green-600/20'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                      }`}
                  >
                    {addingUserId === user.id ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" /> Sucesso
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" /> Recrutar
                      </>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-8 py-4 bg-[#0d0f1e] border-t border-slate-800/60 flex items-center justify-center">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> DevConnect Member Protocol v2.4
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AddMembersModal;