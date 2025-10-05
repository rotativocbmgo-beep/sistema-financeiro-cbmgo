// web/src/pages/Admin.tsx

import { useState, useEffect, useCallback, useRef } from 'react'; // 1. Adicionar useRef
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { useLayout } from '../contexts/LayoutContext';
import { Skeleton } from '../components/Skeleton';
import { Check, X, Pencil } from '@phosphor-icons/react';

// --- Interfaces (sem alterações) ---
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

// --- Componente de Edição (Modal) - MODIFICADO ---
function EditPermissionsModal({ user, allPermissions, onClose, onSave }: { user: User; allPermissions: Permission[]; onClose: () => void; onSave: (userId: string, permissions: string[]) => void; }) {
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(() => new Set(user.permissions.map(p => p.action)));
  
  // 2. Criar uma referência para o checkbox "mestre"
  const masterCheckboxRef = useRef<HTMLInputElement>(null);

  // 3. Efeito para controlar o estado (marcado, desmarcado, indeterminado) do checkbox mestre
  useEffect(() => {
    if (masterCheckboxRef.current) {
      const allSelected = selectedPermissions.size === allPermissions.length;
      const someSelected = selectedPermissions.size > 0 && !allSelected;
      
      masterCheckboxRef.current.checked = allSelected;
      masterCheckboxRef.current.indeterminate = someSelected;
    }
  }, [selectedPermissions, allPermissions.length]);

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

  // 4. Função para marcar/desmarcar todos
  const handleSelectAll = () => {
    if (selectedPermissions.size === allPermissions.length) {
      // Se todos estão selecionados, desmarca todos
      setSelectedPermissions(new Set());
    } else {
      // Se alguns ou nenhum estão selecionados, marca todos
      const allPermissionActions = new Set(allPermissions.map(p => p.action));
      setSelectedPermissions(allPermissionActions);
    }
  };

  const handleSave = () => {
    onSave(user.id, Array.from(selectedPermissions));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-4">
            <div>
                <h3 className="text-xl font-bold text-purple-400 mb-1">Editar Permissões</h3>
                <p className="text-gray-400">Usuário: <span className="font-semibold text-white">{user.name}</span></p>
            </div>
            {/* 5. Adicionar o checkbox "Marcar Todos" */}
            <label className="flex items-center gap-2 cursor-pointer bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md">
                <input
                    ref={masterCheckboxRef}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-purple-500 focus:ring-purple-600"
                    onChange={handleSelectAll}
                />
                <span className="text-sm font-semibold text-white">Marcar Todos</span>
            </label>
        </div>
        
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


// --- Componente Principal (sem alterações) ---
export function Admin() {
  const { setPageTitle } = useLayout();
  const [users, setUsers] = useState<User[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>('PENDENTE');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    setPageTitle("Administração");
  }, [setPageTitle]);

  const fetchUsers = useCallback((status: StatusTab) => {
    setLoading(true);
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
      className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === status ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
        <h1 className="text-2xl font-bold text-white">Gerenciar Usuários</h1>
        <div className="flex space-x-2 bg-gray-800 p-1 rounded-lg">
          <TabButton status="PENDENTE" label="Pendentes" />
          <TabButton status="ATIVO" label="Ativos" />
          <TabButton status="RECUSADO" label="Recusados" />
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-700">
              {users.length > 0 ? users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.name}</td>
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
                <tr>
                  <td colSpan={3} className="text-center py-10 text-gray-500">Nenhum usuário encontrado nesta categoria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
