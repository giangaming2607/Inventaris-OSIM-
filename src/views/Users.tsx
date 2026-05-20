import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Plus, Search, Edit2, ShieldAlert } from 'lucide-react';
import { getDB, setDB, addLog } from '../lib/storage';
import { User, Role, Status } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { formatDateTime } from '../lib/utils';

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({ nama: '', username: '', password: '', role: 'Pengurus' as Role, status: 'Aktif' as Status });
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = () => {
    const db = getDB();
    setUsers(db.users);
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({ nama: user.nama, username: user.username, password: '', role: user.role, status: user.status });
    } else {
      setEditingUser(null);
      setFormData({ nama: '', username: '', password: '', role: 'Pengurus', status: 'Aktif' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = () => {
    const db = getDB();
    if (editingUser) {
      db.users = db.users.map(u => {
        if (u.user_id === editingUser.user_id) {
          const updatedUser = { ...u, nama: formData.nama, username: formData.username, role: formData.role, status: formData.status };
          if (formData.password) {
            updatedUser.password = formData.password;
          }
          return updatedUser;
        }
        return u;
      });
      addLog('admin-1', `Mengubah pengguna: ${formData.nama}`);
    } else {
      const newUser: User = {
        user_id: uuidv4(),
        nama: formData.nama,
        username: formData.username,
        password: formData.password || 'admin123',
        role: formData.role,
        status: formData.status,
        created_at: new Date().toISOString()
      };
      db.users.push(newUser);
      addLog('admin-1', `Menambahkan pengguna baru: ${formData.nama}`);
    }
    setDB(db);
    loadData();
    handleCloseModal();
  };

  const filteredData = users.filter(u => u.nama.toLowerCase().includes(searchTerm.toLowerCase()) || u.username.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Manajemen Pengguna</h2>
          <p className="text-neutral-500 mt-1">Kelola akses admin dan pengurus OSIM.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Pengguna
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-neutral-800 bg-[#111111] flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600" />
              <Input 
                className="pl-10" 
                placeholder="Cari nama atau username..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-900 border-b border-neutral-800">
                  <th className="px-6 py-4 text-sm font-semibold text-neutral-400">Nama Lengkap</th>
                  <th className="px-6 py-4 text-sm font-semibold text-neutral-400">Username</th>
                  <th className="px-6 py-4 text-sm font-semibold text-neutral-400">Role</th>
                  <th className="px-6 py-4 text-sm font-semibold text-neutral-400">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-neutral-400 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredData.map(u => (
                  <tr key={u.user_id} className="hover:bg-[#111111] transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                         {u.role === 'Admin' && <ShieldAlert className="w-4 h-4 text-amber-500" />}
                         {u.nama}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-400">{u.username}</td>
                    <td className="px-6 py-4 text-sm">
                       <Badge variant={u.role === 'Admin' ? 'warning' : 'info'}>{u.role}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm">
                       <Badge variant={u.status === 'Aktif' ? 'success' : 'danger'}>{u.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenModal(u)}>
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCloseModal}>Batal</Button>
            <Button onClick={handleSave}>Simpan</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input 
            label="Nama Lengkap" 
            placeholder="John Doe" 
            value={formData.nama}
            onChange={e => setFormData({...formData, nama: e.target.value})}
          />
          <Input 
            type="text"
            label="Username" 
            placeholder="john.doe" 
            value={formData.username}
            onChange={e => setFormData({...formData, username: e.target.value})}
          />
          <Input 
            type="password"
            label="Password" 
            placeholder={editingUser ? "Kosongkan jika tidak ingin mengubah" : "admin123"}
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Role Akun</label>
            <select 
              className="w-full px-3 py-2 border border-neutral-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value as Role})}
            >
              <option value="Pengurus">Pengurus (Bisa meminjam)</option>
              <option value="Admin">Admin (Bebas akses semuanya)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Status</label>
            <select 
              className="w-full px-3 py-2 border border-neutral-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as Status})}
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
