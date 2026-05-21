import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { getDB, setDB, addLog } from '../lib/storage';
import { User, Kategori } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export function Categories() {
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Kategori | null>(null);
  
  const [formData, setFormData] = useState({ nama: '', deskripsi: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = () => {
    const db = getDB();
    setKategori(db.kategori);
  };

  useEffect(() => { 
    loadData(); 
    window.addEventListener('db-update', loadData);
    return () => window.removeEventListener('db-update', loadData);
  }, []);

  const handleOpenModal = (cat?: Kategori) => {
    if (cat) {
      setEditingCat(cat);
      setFormData({ nama: cat.nama_kategori, deskripsi: cat.deskripsi });
    } else {
      setEditingCat(null);
      setFormData({ nama: '', deskripsi: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = () => {
    const db = getDB();
    if (editingCat) {
      db.kategori = db.kategori.map(k => 
        k.kategori_id === editingCat.kategori_id 
          ? { ...k, nama_kategori: formData.nama, deskripsi: formData.deskripsi } 
          : k
      );
      addLog('admin-1', `Mengubah kategori: ${formData.nama}`);
      toast.success('Kategori berhasil diubah', { duration: 1000 });
    } else {
      const newCat: Kategori = {
        kategori_id: uuidv4(),
        nama_kategori: formData.nama,
        deskripsi: formData.deskripsi
      };
      db.kategori.push(newCat);
      addLog('admin-1', `Menambahkan kategori baru: ${formData.nama}`);
      toast.success('Kategori berhasil ditambahkan', { duration: 1000 });
    }
    setDB(db);
    loadData();
    handleCloseModal();
  };

  const handleDelete = (id: string, nama: string) => {
    if (confirm(`Hapus kategori ${nama}?`)) {
      const db = getDB();
      db.kategori = db.kategori.filter(k => k.kategori_id !== id);
      addLog('admin-1', `Menghapus kategori: ${nama}`);
      setDB(db);
      loadData();
      toast.success('Kategori berhasil dihapus', { duration: 1000 });
    }
  };

  const filteredData = kategori.filter(k => k.nama_kategori.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Kategori Barang</h2>
          <p className="text-neutral-500 mt-1">Kelola jenis dan pengelompokan barang inventaris.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Kategori
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-neutral-800 bg-[#111111] flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600" />
              <Input 
                className="pl-10" 
                placeholder="Cari kategori..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-900 border-b border-neutral-800">
                  <th className="px-6 py-4 text-sm font-semibold text-neutral-400">Nama Kategori</th>
                  <th className="px-6 py-4 text-sm font-semibold text-neutral-400">Deskripsi</th>
                  <th className="px-6 py-4 text-sm font-semibold text-neutral-400 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredData.map(k => (
                  <tr key={k.kategori_id} className="hover:bg-[#111111] transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">{k.nama_kategori}</td>
                    <td className="px-6 py-4 text-sm text-neutral-400">{k.deskripsi}</td>
                    <td className="px-6 py-4 text-sm text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenModal(k)}>
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(k.kategori_id, k.nama_kategori)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">
                      Tidak ada data kategori.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingCat ? "Edit Kategori" : "Tambah Kategori Baru"}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCloseModal}>Batal</Button>
            <Button onClick={handleSave}>Simpan</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input 
            label="Nama Kategori" 
            placeholder="Contoh: Elektronik" 
            value={formData.nama}
            onChange={e => setFormData({...formData, nama: e.target.value})}
            autoFocus
          />
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Deskripsi</label>
            <textarea
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-neutral-300 placeholder-neutral-600 sm:text-sm transition-colors min-h-[100px]"
              placeholder="Deskripsi singkat mengenai kategori barang"
              value={formData.deskripsi}
              onChange={e => setFormData({...formData, deskripsi: e.target.value})}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
