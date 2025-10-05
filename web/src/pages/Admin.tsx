// web/src/pages/Admin.tsx

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { useLayout } from '../contexts/LayoutContext';
import { Skeleton } from '../components/Skeleton';
import { Check, X, Pencil } from '@phosphor-icons/react';

// --- Interfaces ---
interface User {
  id: string;
  name: string;
  email: string;
  status: 'PENDENTE' | 'ATIVO' | 'RECUSADO';
  permissions: { action: string }[];
}

interface Permission {
  id:string;
  action: string;
  description: string;
}

type StatusTab = 'PENDENTE' | 'ATIVO' | 'RECUSADO';

// --- Componente de Skeleton para Mobile ---
function UserCardSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md animate-pulse">
          <div className="mb-3">
            <Skeleton className="h-5 w-3/5 mb-2" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="flex justify-end gap-4 border-t border-gray-700 pt-3">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Componente de Edição (Modal) ---
function EditPermissionsModal({ user, allPermissions, onClose, onSave }: { user: User; allPermissions: Permission[]; onClose: () => void; onSave: (userId: string, permissions: string[]) => void; }) {
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(() => new Set(user.permissions.map(p => p.action)));

  const handleCheckboxChange = (action: string) => {
    setSelectedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(action)) {
        newSet.delete(action);
      } else {
        newSet.add(action);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    onSave(user.id, Array.from(selectedPermissions));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <h3 className="text-xl font-bold text-purple-400 mb-1">Editar Permissões</h3>
        <p className="text-gray-400 mb-4">Usuário: <span className="font-semibold text-white">{user.name}</span></p>
        
        <div className="overflow-y-auto flex-grow pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allPermissions.map(permission => (
              <label key={permission.id} className="flex items-start gap-3 bg-gray-700 p-3 rounded-md cursor-pointer hover:bg-gray-600">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-500 bg-gray-600 text-purple-500 focus:ring-purple-600"
                  checked={selectedPermissions.has(permission.action)}
                  onChange={() => handleCheckboxChange(permission.action)}
                />
                <div>
                  <span className="font-semibold text-white">{permission.action}</span>
                  <p className="text-xs text-gray-400">{permission.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4 pt-4 border-t border-gray-700">
          <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Cancelar</button>
          <button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">Salvar Alterações</button>
        </div>
      </div>
    </div>
  );
}


// --- Componente Principal ---
export function Admin() {
  const { setPageTitle } = useLayout();
  const [users, setUsers] = useState<User[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>('PENDENTE');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);

  const allUserIdsOnPage = useMemo(() => users.map(u => u.id), [users]);
  const isAllSelected = useMemo(() => users.length > 0 && selectedUsers.size === users.length, [selectedUsers, users.length]);

  useEffect(() => {
    setPageTitle("Administração");
  }, [setPageTitle]);

  const fetchUsers = useCallback((status: StatusTab) => {
    setLoading(true);
    setSelectedUsers(new Set());
    api.get('/admin/users', { params: { status } })
      .then(response => setUsers(response.data))
      .catch(() => toast.error(`Falha ao buscar usuários ${status.toLowerCase()}.`))
      .finally(() => setLoading(false));
  }, []);

  const fetchAllPermissions = useCallback(() => {
    api.get('/admin/permissions')
      .then(response => setAllPermissions(response.data))
      .catch(() => toast.error("Falha ao buscar a lista de permissões."));
  }, []);

  useEffect(() => {
    fetchUsers(activeTab);
    if (allPermissions.length === 0) {
      fetchAllPermissions();
    }
  }, [activeTab, fetchUsers, fetchAllPermissions, allPermissions.length]);

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(allUserIdsOnPage));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedUsers.size === 0) {
      toast.error("Nenhum usuário selecionado.");
      return;
    }

    const confirmationText = action === 'approve'
      ? `Tem certeza que deseja aprovar ${selectedUsers.size} usuários?`
      : `Tem certeza que deseja recusar ${selectedUsers.size} usuários?`;

    if (!window.confirm(confirmationText)) return;

    setIsSubmittingBulk(true);
    const toastId = toast.loading("Processando ação em lote...");

    try {
      await api.post('/admin/users/bulk-action', {
        userIds: Array.from(selectedUsers),
        action: action,
      });
      toast.success("Ação em lote concluída com sucesso!", { id: toastId });
      fetchUsers(activeTab);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Falha ao processar a ação em lote.", { id: toastId });
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  const handleAction = async (action: 'approve' | 'reject', userId: string) => {
    if (action === 'reject') {
      const originalUsers = [...users];
      setUsers(users.filter(u => u.id !== userId));
      try {
        await api.patch(`/admin/users/${userId}/reject`);
        toast.success("Usuário recusado.");
      } catch (error) {
        toast.error("Falha ao processar a ação.");
        setUsers(originalUsers);
      }
      return;
    }

    if (action === 'approve') {
      const toastId = toast.loading("Carregando dados do usuário...");
      try {
        const response = await api.get(`/admin/users/${userId}`); 
        setEditingUser(response.data);
        toast.dismiss(toastId);
      } catch (error) {
        toast.error("Falha ao carregar os dados do usuário.", { id: toastId });
      }
    }
  };

  const handleSavePermissions = async (userId: string, permissions: string[]) => {
    const isApproving = activeTab === 'PENDENTE';
    const toastId = toast.loading("Salvando permissões...");
    
    try {
      if (isApproving) {
        await api.patch(`/admin/users/${userId}/approve`, { permissions });
        toast.success("Usuário aprovado com sucesso!", { id: toastId });
      } else {
        await api.put(`/admin/users/${userId}/permissions`, { permissions });
        toast.success("Permissões atualizadas!", { id: toastId });
      }
      setEditingUser(null);
      fetchUsers(activeTab);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Falha ao salvar.", { id: toastId });
    }
  };

  const TabButton = ({ status, label }: { status: StatusTab, label: string }) => (
    <button
      onClick={() => setActiveTab(status)}
      className={`w-full text-center px-4 py-2 text-sm font-medium rounded-md ${activeTab === status ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-gray-900 p-4 sm:p-6 rounded-lg shadow-lg">
      {selectedUsers.size > 0 && activeTab === 'PENDENTE' && (
        <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-40 bg-gray-700 p-3 rounded-lg shadow-lg flex items-center gap-4 animate-pulse">
          <span className="text-sm font-medium text-white">{selectedUsers.size} selecionado(s)</span>
          <button onClick={() => handleBulkAction('approve')} disabled={isSubmittingBulk} className="flex items-center gap-1 text-sm bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg disabled:opacity-50">
            <Check size={16} /> Aprovar
          </button>
          <button onClick={() => handleBulkAction('reject')} disabled={isSubmittingBulk} className="flex items-center gap-1 text-sm bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg disabled:opacity-50">
            <X size={16} /> Recusar
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 border-b border-gray-700 pb-4 gap-4">
        <h1 className="text-2xl font-bold text-white">Gerenciar Usuários</h1>
        <div className="flex w-full sm:w-auto space-x-1 bg-gray-800 p-1 rounded-lg">
          <TabButton status="PENDENTE" label="Pendentes" />
          <TabButton status="ATIVO" label="Ativos" />
          <TabButton status="RECUSADO" label="Recusados" />
        </div>
      </div>

      {loading ? (
        <div className="md:hidden"><UserCardSkeleton /></div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 w-12">
                    {activeTab === 'PENDENTE' && (
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-purple-500 focus:ring-purple-600"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        aria-label="Selecionar todos"
                      />
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-700">
                {users.length > 0 ? users.map(user => (
                  <tr key={user.id} className={`transition-colors ${selectedUsers.has(user.id) ? 'bg-purple-900/30' : ''}`}>
                    <td className="px-6 py-4">
                      {activeTab === 'PENDENTE' && (
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-purple-500 focus:ring-purple-600"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      <Link to={`/admin/users/${user.id}`} className="hover:underline">
                        {user.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center items-center gap-4">
                        {activeTab === 'PENDENTE' && (
                          <>
                            <button onClick={() => handleAction('approve', user.id)} className="text-green-400 hover:text-green-300 flex items-center gap-1"><Check size={18} /> Aprovar</button>
                            <button onClick={() => handleAction('reject', user.id)} className="text-red-400 hover:text-red-300 flex items-center gap-1"><X size={18} /> Recusar</button>
                          </>
                        )}
                        {activeTab === 'ATIVO' && (
                          <button onClick={() => handleAction('approve', user.id)} className="text-blue-400 hover:text-blue-300 flex items-center gap-1"><Pencil size={18} /> Editar Permissões</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="text-center py-10 text-gray-500">Nenhum usuário encontrado nesta categoria.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {users.length > 0 ? users.map(user => (
              <div key={user.id} className={`bg-gray-800 p-4 rounded-lg shadow-md transition-colors ${selectedUsers.has(user.id) ? 'ring-2 ring-purple-500' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-grow">
                    <Link to={`/admin/users/${user.id}`} className="font-bold text-white break-words hover:underline">
                      {user.name}
                    </Link>
                    <p className="text-sm text-gray-400 break-words">{user.email}</p>
                  </div>
                  {activeTab === 'PENDENTE' && (
                    <input
                      type="checkbox"
                      className="ml-4 h-5 w-5 rounded border-gray-500 bg-gray-600 text-purple-500 focus:ring-purple-600 flex-shrink-0"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                  )}
                </div>
                <div className="flex justify-end items-center gap-3 border-t border-gray-700 pt-3">
                  {activeTab === 'PENDENTE' && (
                    <>
                      <button onClick={() => handleAction('approve', user.id)} className="flex items-center gap-1 text-sm bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg"><Check size={16} /> Aprovar</button>
                      <button onClick={() => handleAction('reject', user.id)} className="flex items-center gap-1 text-sm bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg"><X size={16} /> Recusar</button>
                    </>
                  )}
                  {activeTab === 'ATIVO' && (
                    <button onClick={() => handleAction('approve', user.id)} className="flex items-center gap-1 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg"><Pencil size={16} /> Editar</button>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-gray-500">Nenhum usuário encontrado nesta categoria.</div>
            )}
          </div>
        </>
      )}

      {editingUser && (
        <EditPermissionsModal
          user={editingUser}
          allPermissions={allPermissions}
          onClose={() => setEditingUser(null)}
          onSave={handleSavePermissions}
        />
      )}
    </div>
  );
}
