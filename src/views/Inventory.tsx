import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Plus, Search, Edit2, Trash2, Filter, Upload } from 'lucide-react';
import { getDB, setDB, addLog } from '../lib/storage';
import { Inventaris, Kategori, KondisiBarang, User } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { generateKodeBarang, formatDate } from '../lib/utils';
import { format } from 'date-fns';

export function Inventory({ currentUser }: { currentUser: User }) {
  const [items, setItems] = useState<Inventaris[]>([]);
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventaris | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKat, setFilterKat] = useState('');
  const [filterKondisi, setFilterKondisi] = useState('');

  const emptyForm = {
    nama_barang: '',
    kategori_id: '',
    jumlah_total: 1,
    kondisi: 'Baik' as KondisiBarang,
    lokasi: '',
    foto_barang: '',
    keterangan: ''
  };
  const [formData, setFormData] = useState(emptyForm);

  const loadData = () => {
    const db = getDB();
    setItems(db.inventaris);
    setCategories(db.kategori);
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenModal = (item?: Inventaris) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        nama_barang: item.nama_barang,
        kategori_id: item.kategori_id,
        jumlah_total: item.jumlah_total,
        kondisi: item.kondisi,
        lokasi: item.lokasi,
        foto_barang: item.foto_barang,
        keterangan: item.keterangan
      });
    } else {
      setEditingItem(null);
      setFormData(emptyForm);
      if(categories.length > 0) setFormData(f => ({...f, kategori_id: categories[0].kategori_id}));
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = () => {
    const db = getDB();
    if (editingItem) {
      const diff = formData.jumlah_total - editingItem.jumlah_total;
      db.inventaris = db.inventaris.map(i => 
        i.barang_id === editingItem.barang_id 
          ? { 
              ...i, 
              ...formData, 
              jumlah_tersedia: Math.max(0, i.jumlah_tersedia + diff) 
            } 
          : i
      );
      addLog(currentUser.user_id, `Mengubah data barang: ${formData.nama_barang}`);
    } else {
      const newItem: Inventaris = {
        barang_id: uuidv4(),
        kode_barang: generateKodeBarang(db.inventaris.length),
        ...formData,
        jumlah_tersedia: formData.jumlah_total,
        tanggal_masuk: new Date().toISOString()
      };
      db.inventaris.push(newItem);
      addLog(currentUser.user_id, `Menambahkan barang baru: ${formData.nama_barang}`);
    }
    setDB(db);
    loadData();
    handleCloseModal();
  };

  const handleDelete = (id: string, nama: string) => {
    if (confirm(`Hapus barang ${nama} secara permanen? Aksi ini mungkin mempengaruhi riwayat peminjaman.`)) {
      const db = getDB();
      db.inventaris = db.inventaris.filter(i => i.barang_id !== id);
      addLog(currentUser.user_id, `Menghapus barang: ${nama}`);
      setDB(db);
      loadData();
    }
  };

  const filteredData = useMemo(() => {
    return items.filter(i => {
      const matchSearch = i.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          i.kode_barang.toLowerCase().includes(searchTerm.toLowerCase());
      const matchKat = filterKat ? i.kategori_id === filterKat : true;
      const matchCond = filterKondisi ? i.kondisi === filterKondisi : true;
      return matchSearch && matchKat && matchCond;
    });
  }, [items, searchTerm, filterKat, filterKondisi]);

  const getKondisiBadge = (kondisi: KondisiBarang) => {
    switch(kondisi) {
      case 'Baik': return <Badge variant="success">Baik</Badge>;
      case 'Rusak Ringan': return <Badge variant="warning">Rusak Ringan</Badge>;
      case 'Rusak Berat': return <Badge variant="danger">Rusak Berat</Badge>;
      default: return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Manajemen Inventaris</h2>
          <p className="text-neutral-500 mt-1">Daftar seluruh barang inventaris sekretariat.</p>
        </div>
        {currentUser.role === 'Admin' && (
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Tambah Barang
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-neutral-800 bg-[#111111] flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 min-w-[250px] max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600" />
              <Input 
                className="pl-10 bg-neutral-900" 
                placeholder="Cari kode atau nama barang..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select 
                className="px-3 py-2 border border-neutral-800 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm bg-neutral-900 text-neutral-300"
                value={filterKat}
                onChange={(e) => setFilterKat(e.target.value)}
              >
                <option value="">Semua Kategori</option>
                {categories.map(k => <option key={k.kategori_id} value={k.kategori_id}>{k.nama_kategori}</option>)}
              </select>
              <select 
                className="px-3 py-2 border border-neutral-800 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm bg-neutral-900 text-neutral-300"
                value={filterKondisi}
                onChange={(e) => setFilterKondisi(e.target.value)}
              >
                <option value="">Semua Kondisi</option>
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-900 border-b border-neutral-800">
                  <th className="px-6 py-4 text-xs tracking-wider uppercase font-semibold text-neutral-500">Info Barang</th>
                  <th className="px-6 py-4 text-xs tracking-wider uppercase font-semibold text-neutral-500 text-center">Stok</th>
                  <th className="px-6 py-4 text-xs tracking-wider uppercase font-semibold text-neutral-500 text-center">Kondisi</th>
                  <th className="px-6 py-4 text-xs tracking-wider uppercase font-semibold text-neutral-500">Lokasi</th>
                  {currentUser.role === 'Admin' && <th className="px-6 py-4 text-xs tracking-wider uppercase font-semibold text-neutral-500 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredData.map(item => {
                  const kat = categories.find(k => k.kategori_id === item.kategori_id);
                  const isLowStock = item.jumlah_tersedia > 0 && item.jumlah_tersedia <= 2;
                  return (
                    <tr key={item.barang_id} className="hover:bg-[#111111] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center overflow-hidden border border-neutral-800 shrink-0">
                            {item.foto_barang ? (
                               <img src={item.foto_barang} alt={item.nama_barang} className="w-full h-full object-cover" />
                            ) : (
                               <span className="text-xs font-mono text-neutral-600">IMG</span>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{item.nama_barang}</div>
                            <div className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                              <span className="font-mono bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400">{item.kode_barang}</span>
                              <span>·</span>
                              <span>{kat?.nama_kategori || 'Tanpa Kategori'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`text-lg font-bold ${isLowStock ? 'text-amber-500' : item.jumlah_tersedia === 0 ? 'text-red-500' : 'text-white'}`}>
                            {item.jumlah_tersedia}
                          </span>
                          <span className="text-xs text-neutral-500">dari {item.jumlah_total}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                         {getKondisiBadge(item.kondisi)}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-400">
                        {item.lokasi || '-'}
                      </td>
                      {currentUser.role === 'Admin' && (
                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(item)}>
                            <Edit2 className="w-4 h-4 text-blue-500" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.barang_id, item.nama_barang)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  )
                })}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={currentUser.role === 'Admin' ? 5 : 4} className="px-6 py-12 text-center text-neutral-500">
                      Tidak ada data barang ditemukan.
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
        title={editingItem ? "Edit Barang Inventaris" : "Tambah Barang Baru"}
        className="max-w-2xl"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCloseModal}>Batal</Button>
            <Button onClick={handleSave}>Simpan Data</Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4 md:col-span-2">
             <Input 
              label="Nama Barang" 
              placeholder="Contoh: Proyektor Epson X100" 
              value={formData.nama_barang}
              onChange={e => setFormData({...formData, nama_barang: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Kategori</label>
            <select 
              className="w-full px-3 py-2 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-blue-500 sm:text-sm"
              value={formData.kategori_id}
              onChange={e => setFormData({...formData, kategori_id: e.target.value})}
            >
              <option value="" disabled>Pilih Kategori...</option>
              {categories.map(k => <option key={k.kategori_id} value={k.kategori_id}>{k.nama_kategori}</option>)}
            </select>
          </div>
          <Input 
            label="Jumlah Total" 
            type="number"
            min="1"
            value={formData.jumlah_total}
            onChange={e => setFormData({...formData, jumlah_total: parseInt(e.target.value) || 0})}
          />
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Kondisi Awal</label>
            <select 
              className="w-full px-3 py-2 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-blue-500 sm:text-sm"
              value={formData.kondisi}
              onChange={e => setFormData({...formData, kondisi: e.target.value as KondisiBarang})}
            >
              <option value="Baik">Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select>
          </div>
          <Input 
            label="Lokasi Penyimpanan" 
            placeholder="Contoh: Lemari Kaca 1" 
            value={formData.lokasi}
            onChange={e => setFormData({...formData, lokasi: e.target.value})}
          />
          <div className="md:col-span-2">
            <Input 
              label="URL Foto Barang (opsional)" 
              placeholder="https://..." 
              value={formData.foto_barang}
              onChange={e => setFormData({...formData, foto_barang: e.target.value})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-300 mb-1">Keterangan / Catatan</label>
            <textarea
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-neutral-300 placeholder-neutral-600 sm:text-sm min-h-[80px]"
              placeholder="Catatan tambahan spesifikasi atau kelengkapan..."
              value={formData.keterangan}
              onChange={e => setFormData({...formData, keterangan: e.target.value})}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
