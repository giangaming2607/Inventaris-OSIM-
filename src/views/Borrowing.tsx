import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Plus, Search, Calendar, ChevronRight, RotateCw } from 'lucide-react';
import { getDB, setDB, addLog } from '../lib/storage';
import { Inventaris, Peminjaman, User, StatusPeminjaman } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { formatDate } from '../lib/utils';
import { differenceInDays } from 'date-fns';
import { toast } from 'sonner';

export function Borrowing({ currentUser }: { currentUser: User }) {
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [inventaris, setInventaris] = useState<Inventaris[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pengembalian, setPengembalian] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState('');
  const [jumlah, setJumlah] = useState(1);
  const [tglKembali, setTglKembali] = useState('');
  const [catatan, setCatatan] = useState('');
  const [namaPeminjam, setNamaPeminjam] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = () => {
    const db = getDB();
    setPeminjaman(db.peminjaman);
    setInventaris(db.inventaris);
    setUsers(db.users);
    setPengembalian(db.pengembalian);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Data riwayat berhasil dimuat ulang!');
    }, 800);
  };

  useEffect(() => { 
    loadData(); 
    window.addEventListener('db-update', loadData);
    return () => window.removeEventListener('db-update', loadData);
  }, []);

  const handleOpenModal = () => {
    setSelectedBarang('');
    setJumlah(1);
    setTglKembali('');
    setCatatan('');
    setNamaPeminjam('');
    setIsModalOpen(true);
  };

  const handleAjukan = () => {
    if (!selectedBarang || !tglKembali || jumlah <= 0) {
      toast.error('Harap lengkapi formulir peminjaman.', { duration: 1000 });
      return;
    }

    if ((currentUser.role === 'Peminjam' || currentUser.role === 'Pengurus') && !namaPeminjam.trim()) {
      toast.error('Harap masukkan nama peminjam.', { duration: 1000 });
      return;
    }

    const db = getDB();
    const barang = db.inventaris.find(i => i.barang_id === selectedBarang);
    
    if (!barang) return;

    if (jumlah > barang.jumlah_tersedia) {
      toast.error(`Stok tidak mencukupi. Tersedia hanya ${barang.jumlah_tersedia}.`, { duration: 1000 });
      return;
    }

    let actualUserId = currentUser.user_id;

    if (currentUser.role === 'Peminjam' || currentUser.role === 'Pengurus') {
      // Find or create a temporary user for this name
      let tempUser = db.users.find(u => u.nama.toLowerCase() === namaPeminjam.toLowerCase() && u.role === 'Peminjam');
      if (!tempUser) {
        tempUser = {
          user_id: uuidv4(),
          nama: namaPeminjam,
          username: `peminjam_${Date.now()}`,
          role: 'Peminjam',
          status: 'Aktif',
          created_at: new Date().toISOString()
        };
        db.users.push(tempUser);
      }
      actualUserId = tempUser.user_id;
    }

    const newPem: Peminjaman = {
      peminjaman_id: uuidv4(),
      barang_id: selectedBarang,
      user_id: actualUserId,
      jumlah_pinjam: jumlah,
      tanggal_pinjam: new Date().toISOString(),
      tanggal_kembali: new Date(tglKembali).toISOString(),
      status: 'Menunggu',
      catatan
    };

    db.peminjaman.push(newPem);
    
    // Deduct stock
    db.inventaris = db.inventaris.map(i => 
      i.barang_id === selectedBarang ? { ...i, jumlah_tersedia: i.jumlah_tersedia - jumlah } : i
    );

    addLog(currentUser.user_id, `Meminjam alat: ${barang.nama_barang} (${jumlah} qty)`);
    setDB(db);
    loadData();
    setIsModalOpen(false);
    toast.success('Peminjaman berhasil diajukan', { duration: 1000 });
  };

  const getStatusBadge = (status: StatusPeminjaman) => {
    switch(status) {
      case 'Dipinjam': return <Badge variant="warning">Sedang Dipinjam</Badge>;
      case 'Dikembalikan': return <Badge variant="success">Dikembalikan</Badge>;
      case 'Menunggu': return <Badge variant="info">Menunggu Approv</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const handleViewPhoto = (peminjaman_id: string) => {
    const ret = pengembalian.find(r => r.peminjaman_id === peminjaman_id);
    if (ret && ret.foto_pengembalian) {
      setPhotoPreview(ret.foto_pengembalian);
    } else {
      toast.error('Foto pengembalian tidak ditemukan.', { duration: 1000 });
    }
  };

  const filteredData = peminjaman.filter(p => {
    const b = inventaris.find(i => i.barang_id === p.barang_id);
    const u = users.find(u => u.user_id === p.user_id);
    const searchString = `${b?.nama_barang || ''} ${u?.nama || ''} ${p.status}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  }).sort((a,b) => new Date(b.tanggal_pinjam).getTime() - new Date(a.tanggal_pinjam).getTime());

  const availableItems = inventaris.filter(i => i.jumlah_tersedia > 0 && i.kondisi === 'Baik');
  const selectedItemData = inventaris.find(i => i.barang_id === selectedBarang);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Peminjaman Barang</h2>
          <p className="text-neutral-500 mt-1">Ajukan dan pantau barang yang sedang dipinjam.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="flex items-center gap-2 cursor-pointer border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-850"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} style={{ color: 'var(--thm-primary)' }} />
            <span>Refresh</span>
          </Button>
          <Button onClick={handleOpenModal} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Ajukan Peminjaman
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-neutral-800 bg-[#111111]">
             <div className="relative max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600" />
              <Input 
                className="pl-10" 
                placeholder="Cari transaksi peminjaman..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-900 border-b border-neutral-800">
                  <th className="px-6 py-4 text-xs tracking-wider uppercase font-semibold text-neutral-500">Peminjam</th>
                  <th className="px-6 py-4 text-xs tracking-wider uppercase font-semibold text-neutral-500">Barang</th>
                  <th className="px-6 py-4 text-xs tracking-wider uppercase font-semibold text-neutral-500 text-center">Qty</th>
                  <th className="px-6 py-4 text-xs tracking-wider uppercase font-semibold text-neutral-500">Jadwal</th>
                  <th className="px-6 py-4 text-xs tracking-wider uppercase font-semibold text-neutral-500">Status</th>
                  <th className="px-6 py-4 text-xs tracking-wider uppercase font-semibold text-neutral-500 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredData.map(p => {
                  const b = inventaris.find(i => i.barang_id === p.barang_id);
                  const u = users.find(u => u.user_id === p.user_id);
                  const isLate = p.status === 'Dipinjam' && differenceInDays(new Date(), new Date(p.tanggal_kembali)) > 0;
                  return (
                    <tr key={p.peminjaman_id} className="hover:bg-[#111111] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{u?.nama || 'Unknown'}</div>
                        <div className="text-xs text-neutral-500">{u?.role}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{b?.nama_barang || 'Barang Dihapus'}</div>
                        <div className="text-xs font-mono text-neutral-500">{b?.kode_barang}</div>
                      </td>
                      <td className="px-6 py-4 text-center font-medium">x{p.jumlah_pinjam}</td>
                      <td className="px-6 py-4 text-sm text-neutral-400">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {formatDate(p.tanggal_pinjam)}</div>
                          <div className={`flex items-center gap-1 ${isLate ? 'text-red-600 font-medium' : ''}`}>
                             <ChevronRight className="w-3 h-3" /> {formatDate(p.tanggal_kembali)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(p.status)}
                        {isLate && <div className="text-xs text-red-500 mt-1 font-medium">Terlambat!</div>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {p.status === 'Dikembalikan' && (
                          <Button size="sm" variant="outline" onClick={() => handleViewPhoto(p.peminjaman_id)}>
                            Lihat Foto
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                      Tidak ada riwayat peminjaman.
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
        onClose={() => setIsModalOpen(false)} 
        title="Form Pengajuan Peminjaman"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button onClick={handleAjukan}>Ajukan Pinjaman</Button>
          </div>
        }
      >
        <div className="space-y-5">
           {(currentUser.role === 'Peminjam' || currentUser.role === 'Pengurus') && (
             <Input 
               label="Nama Lengkap Peminjam" 
               placeholder="Masukkan nama lengkap peminjam..."
               value={namaPeminjam}
               onChange={e => setNamaPeminjam(e.target.value)}
             />
           )}
           <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Pilih Barang yang Tersedia</label>
            <select 
              className="w-full px-3 py-2 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-blue-500 sm:text-sm"
              value={selectedBarang}
              onChange={e => {
                setSelectedBarang(e.target.value);
                setJumlah(1);
              }}
            >
              <option value="" disabled>Pilih Barang...</option>
              {availableItems.map(i => (
                <option key={i.barang_id} value={i.barang_id}>
                  {i.nama_barang} (Tersedia: {i.jumlah_tersedia})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Jumlah Pinjam" 
              type="number"
              min="1"
              max={selectedItemData?.jumlah_tersedia || 1}
              value={jumlah}
              readOnly={!selectedBarang}
              onChange={e => setJumlah(parseInt(e.target.value) || 1)}
            />
            <Input 
              label="Rencana Tanggal Kembali" 
              type="date"
              min={new Date().toISOString().split('T')[0]} // today
              value={tglKembali}
              onChange={e => setTglKembali(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Keperluan / Catatan</label>
            <textarea
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-neutral-300 placeholder-neutral-600 sm:text-sm min-h-[80px]"
              placeholder="Jelaskan alasan peminjaman secara singkat..."
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={!!photoPreview} 
        onClose={() => setPhotoPreview(null)} 
        title="Foto Bukti Pengembalian"
        footer={
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setPhotoPreview(null)}>Tutup</Button>
          </div>
        }
      >
        {photoPreview && (
          <div className="flex justify-center bg-black rounded-lg overflow-hidden border border-neutral-800 p-2">
            <img src={photoPreview} alt="Bukti pengembalian" className="max-w-full max-h-[60vh] object-contain" />
          </div>
        )}
      </Modal>
    </div>
  );
}
