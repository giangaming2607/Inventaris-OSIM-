import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Search, Undo2, AlertCircle, Camera, CheckCircle2, RotateCw } from 'lucide-react';
import { getDB, setDB, addLog } from '../lib/storage';
import { Inventaris, Peminjaman, Pengembalian, User, KondisiBarang } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { formatDate } from '../lib/utils';
import { differenceInDays } from 'date-fns';
import { useRef } from 'react';
import { toast } from 'sonner';

export function Returns({ currentUser, initialTab = 'pending' }: { currentUser: User, initialTab?: 'pending' | 'history' }) {
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [inventaris, setInventaris] = useState<Inventaris[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pengembalian, setPengembalian] = useState<Pengembalian[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>(initialTab);
  const [selectedPinjaman, setSelectedPinjaman] = useState<Peminjaman | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  
  const [kondisi, setKondisi] = useState<KondisiBarang>('Baik');
  const [catatan, setCatatan] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  const [lokasiFoto, setLokasiFoto] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      toast.success('Data berhasil dimuat ulang!');
    }, 800);
  };

  useEffect(() => { 
    loadData(); 
    window.addEventListener('db-update', loadData);
    return () => window.removeEventListener('db-update', loadData);
  }, []);

  const handleOpenModal = (p: Peminjaman) => {
    setSelectedPinjaman(p);
    const b = inventaris.find(i => i.barang_id === p.barang_id);
    setKondisi(b?.kondisi || 'Baik');
    setCatatan('');
    setFoto(null);
    setLokasiFoto('');
    setIsModalOpen(true);
  };

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLokasiFoto(`Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`);
          },
          (error) => {
            setLokasiFoto('Lokasi tidak diizinkan');
          }
        );
      } else {
        setLokasiFoto('Lokasi tidak didukung');
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReturn = () => {
    if (!selectedPinjaman) return;

    const db = getDB();
    
    // Update Peminjaman status
    db.peminjaman = db.peminjaman.map(p => 
      p.peminjaman_id === selectedPinjaman.peminjaman_id 
        ? { ...p, status: 'Dikembalikan' } 
        : p
    );

    // Create Pengembalian record
    const ret: Pengembalian = {
      pengembalian_id: uuidv4(),
      peminjaman_id: selectedPinjaman.peminjaman_id,
      tanggal_pengembalian: new Date().toISOString(),
      kondisi_setelah: kondisi,
      catatan_kerusakan: catatan,
      foto_pengembalian: foto || undefined
    };
    db.pengembalian.push(ret);

    // Add back to inventory and update condition
    db.inventaris = db.inventaris.map(i => {
      if (i.barang_id === selectedPinjaman.barang_id) {
        return { 
          ...i, 
          jumlah_tersedia: i.jumlah_tersedia + selectedPinjaman.jumlah_pinjam,
          kondisi: kondisi // Update item condition based on return
        };
      }
      return i;
    });

    const b = db.inventaris.find(i => i.barang_id === selectedPinjaman.barang_id);
    addLog(currentUser.user_id, `Mengembalikan alat: ${b?.nama_barang} (${selectedPinjaman.jumlah_pinjam} qty)`, lokasiFoto);
    
    setDB(db);
    loadData();
    setIsModalOpen(false);
    toast.success('Barang berhasil dikembalikan', { duration: 1000 });
  };

  const activeLoans = peminjaman.filter(p => p.status === 'Dipinjam');
  const pastReturns = pengembalian.map(ret => {
    const p = peminjaman.find(pem => pem.peminjaman_id === ret.peminjaman_id);
    return { ...ret, peminjaman: p };
  }).filter(ret => ret.peminjaman !== undefined).sort((a,b) => new Date(b.tanggal_pengembalian).getTime() - new Date(a.tanggal_pengembalian).getTime());
  
  const filteredData = activeLoans.filter(p => {
    const b = inventaris.find(i => i.barang_id === p.barang_id);
    const u = users.find(u => u.user_id === p.user_id);
    const searchString = `${b?.nama_barang || ''} ${u?.nama || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  }).sort((a,b) => new Date(a.tanggal_kembali).getTime() - new Date(b.tanggal_kembali).getTime()); // sort deadline soonest

  const filteredHistory = pastReturns.filter(ret => {
    const p = ret.peminjaman;
    if (!p) return false;
    const b = inventaris.find(i => i.barang_id === p.barang_id);
    const u = users.find(u => u.user_id === p.user_id);
    const searchString = `${b?.nama_barang || ''} ${u?.nama || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Pengembalian Barang</h2>
          <p className="text-neutral-500 mt-1">Daftar barang yang sedang dipinjam dan riwayat pengembalian.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="flex items-center gap-2 cursor-pointer border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-850"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} style={{ color: 'var(--thm-primary)' }} />
          <span>Refresh Data</span>
        </Button>
      </div>

      <div className="flex gap-4 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium text-sm transition-colors relative ${activeTab === 'pending' ? 'text-blue-500' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          Perlu Dikembalikan
          {activeTab === 'pending' && <span className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-blue-500 rounded-t" />}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium text-sm transition-colors relative ${activeTab === 'history' ? 'text-blue-500' : 'text-neutral-500 hover:text-neutral-300'}`}
        >
          Riwayat Pengembalian
          {activeTab === 'history' && <span className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-blue-500 rounded-t" />}
        </button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-neutral-800 bg-[#111111]">
             <div className="relative max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600" />
              <Input 
                className="pl-10" 
                placeholder={activeTab === 'pending' ? "Cari transaksi aktif..." : "Cari riwayat pengembalian..."} 
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
                  <th className="px-6 py-4 text-xs tracking-wider uppercase font-semibold text-neutral-500">Barang & Qty</th>
                  {activeTab === 'pending' ? (
                    <>
                      <th className="px-6 py-4 text-xs tracking-wider uppercase font-semibold text-neutral-500">Tanggal Pinjam</th>
                      <th className="px-6 py-4 text-xs tracking-wider uppercase font-semibold text-neutral-500">Tenggat Kembali</th>
                      <th className="px-6 py-4 text-xs tracking-wider uppercase font-semibold text-neutral-500 text-right">Aksi</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 text-xs tracking-wider uppercase font-semibold text-neutral-500">Kondisi Setelah</th>
                      <th className="px-6 py-4 text-xs tracking-wider uppercase font-semibold text-neutral-500">Waktu Dikembalikan</th>
                      <th className="px-6 py-4 text-xs tracking-wider uppercase font-semibold text-neutral-500 text-right">Status</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {activeTab === 'pending' && filteredData.map(p => {
                  const b = inventaris.find(i => i.barang_id === p.barang_id);
                  const u = users.find(u => u.user_id === p.user_id);
                  const isLate = differenceInDays(new Date(), new Date(p.tanggal_kembali)) > 0;
                  // Allow Peminjam to return items, realistically they find their own name
                  const canReturn = true;
                  
                  return (
                    <tr key={p.peminjaman_id} className={`hover:bg-[#111111] transition-colors ${isLate ? 'bg-red-900/10' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{u?.nama || 'Unknown'}</div>
                        {isLate && <Badge variant="danger" className="mt-1">Terlambat</Badge>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{b?.nama_barang || 'Barang Dihapus'}</div>
                        <div className="text-xs text-neutral-500">Jumlah: {p.jumlah_pinjam} unit</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-400">
                         {formatDate(p.tanggal_pinjam)}
                      </td>
                      <td className={`px-6 py-4 text-sm font-medium ${isLate ? 'text-red-600' : 'text-neutral-400'}`}>
                         {formatDate(p.tanggal_kembali)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {canReturn ? (
                          <Button size="sm" onClick={() => handleOpenModal(p)} className="flex items-center gap-2 ml-auto">
                            <Undo2 className="w-4 h-4" /> Proses Kembali
                          </Button>
                        ) : (
                          <span className="text-xs text-neutral-600 italic">Bukan peminjam</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {activeTab === 'pending' && filteredData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                      Tidak ada barang yang sedang dipinjam saat ini.
                    </td>
                  </tr>
                )}
                {activeTab === 'history' && filteredHistory.map(ret => {
                  const p = ret.peminjaman!;
                  const b = inventaris.find(i => i.barang_id === p.barang_id);
                  const u = users.find(u => u.user_id === p.user_id);
                  
                  return (
                    <tr key={ret.pengembalian_id} className="hover:bg-[#111111] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{u?.nama || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{b?.nama_barang || 'Barang Dihapus'}</div>
                        <div className="text-xs text-neutral-500">Jumlah: {p.jumlah_pinjam} unit</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-300">{ret.kondisi_setelah}</div>
                        {ret.catatan_kerusakan && (
                           <div className="text-xs text-amber-500 mt-1 max-w-[200px] truncate" title={ret.catatan_kerusakan}>Note: {ret.catatan_kerusakan}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-400">
                         {formatDate(ret.tanggal_pengembalian)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 text-green-500 text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4" /> Selesai
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {activeTab === 'history' && filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                      Belum ada riwayat pengembalian.
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
        title="Form Pengembalian Barang"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button variant="primary" onClick={handleReturn} disabled={!foto}>
              Konfirmasi Pengembalian
            </Button>
          </div>
        }
      >
        {selectedPinjaman && (
          <div className="space-y-5">
            <div className="bg-[#111111] p-4 rounded-lg flex items-start gap-3 border border-neutral-800">
              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">
                  Mengembalikan: {inventaris.find(i => i.barang_id === selectedPinjaman.barang_id)?.nama_barang}
                </p>
                <p className="text-sm text-neutral-400">
                  Jumlah: {selectedPinjaman.jumlah_pinjam} unit
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Kondisi Barang Setelah Dipinjam</label>
              <select 
                className="w-full px-3 py-2 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-blue-500 sm:text-sm"
                value={kondisi}
                onChange={e => setKondisi(e.target.value as KondisiBarang)}
              >
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan (Perlu dicatat)</option>
                <option value="Rusak Berat">Rusak Berat (Akan ditandai rusak)</option>
              </select>
              {kondisi !== 'Baik' && (
                <p className="text-xs text-amber-500 mt-1 font-medium">* Status barang di inventaris otomatis akan terpengaruh.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Catatan (Wajib jika rusak)</label>
              <textarea
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-neutral-300 placeholder-neutral-600 sm:text-sm min-h-[80px]"
                placeholder="Deskripsikan kerusakan ringan atau hal lain (jika ada)..."
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Foto Bukti Pengembalian <span className="text-red-500">*</span>
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden relative ${
                  foto ? 'border-neutral-700 bg-black' : 'border-neutral-700 hover:border-neutral-500 bg-[#0A0A0A]'
                }`}
              >
                {foto ? (
                  <>
                    <img src={foto} alt="Bukti Pengembalian" className="max-w-full max-h-full object-contain" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity text-white text-sm font-medium">
                      Ganti Foto
                    </div>
                  </>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-neutral-500 mb-2" />
                    <span className="text-sm text-neutral-500">Klik untuk upload foto</span>
                  </>
                )}
              </div>
               <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                capture="environment"
                onChange={handleFotoUpload}
              />
              {!foto && <p className="text-xs text-red-500 mt-2 font-medium">Foto pengembalian wajib diunggah.</p>}
              {lokasiFoto && <p className="text-xs text-neutral-400 mt-1 font-mono">{lokasiFoto}</p>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
