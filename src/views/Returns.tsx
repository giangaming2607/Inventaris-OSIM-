import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Search, Undo2, AlertCircle } from 'lucide-react';
import { getDB, setDB, addLog } from '../lib/storage';
import { Inventaris, Peminjaman, Pengembalian, User, KondisiBarang } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { formatDate } from '../lib/utils';
import { differenceInDays } from 'date-fns';

export function Returns({ currentUser }: { currentUser: User }) {
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [inventaris, setInventaris] = useState<Inventaris[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pengembalian, setPengembalian] = useState<Pengembalian[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPinjaman, setSelectedPinjaman] = useState<Peminjaman | null>(null);
  
  const [kondisi, setKondisi] = useState<KondisiBarang>('Baik');
  const [catatan, setCatatan] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = () => {
    const db = getDB();
    setPeminjaman(db.peminjaman);
    setInventaris(db.inventaris);
    setUsers(db.users);
    setPengembalian(db.pengembalian);
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenModal = (p: Peminjaman) => {
    setSelectedPinjaman(p);
    const b = inventaris.find(i => i.barang_id === p.barang_id);
    setKondisi(b?.kondisi || 'Baik');
    setCatatan('');
    setIsModalOpen(true);
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
      catatan_kerusakan: catatan
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
    addLog(currentUser.user_id, `Mengembalikan alat: ${b?.nama_barang} (${selectedPinjaman.jumlah_pinjam} qty)`);
    
    setDB(db);
    loadData();
    setIsModalOpen(false);
  };

  const activeLoans = peminjaman.filter(p => p.status === 'Dipinjam');
  
  const filteredData = activeLoans.filter(p => {
    const b = inventaris.find(i => i.barang_id === p.barang_id);
    const u = users.find(u => u.user_id === p.user_id);
    const searchString = `${b?.nama_barang || ''} ${u?.nama || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  }).sort((a,b) => new Date(a.tanggal_kembali).getTime() - new Date(b.tanggal_kembali).getTime()); // sort deadline soonest

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Pengembalian Barang</h2>
          <p className="text-neutral-500 mt-1">Daftar barang yang sedang dipinjam dan perlu dikembalikan.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-neutral-800 bg-[#111111]">
             <div className="relative max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600" />
              <Input 
                className="pl-10" 
                placeholder="Cari transaksi aktif..." 
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
                  <th className="px-6 py-4 text-xs tracking-wider uppercase font-semibold text-neutral-500">Tanggal Pinjam</th>
                  <th className="px-6 py-4 text-xs tracking-wider uppercase font-semibold text-neutral-500">Tenggat Kembali</th>
                  <th className="px-6 py-4 text-xs tracking-wider uppercase font-semibold text-neutral-500 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredData.map(p => {
                  const b = inventaris.find(i => i.barang_id === p.barang_id);
                  const u = users.find(u => u.user_id === p.user_id);
                  const isLate = differenceInDays(new Date(), new Date(p.tanggal_kembali)) > 0;
                  // Restrict users to only return their own items, unless they are Admin
                  const canReturn = currentUser.role === 'Admin' || currentUser.user_id === p.user_id;
                  
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
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                      Tidak ada barang yang sedang dipinjam saat ini.
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
            <Button variant="primary" onClick={handleReturn}>Konfirmasi Pengembalian</Button>
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
          </div>
        )}
      </Modal>
    </div>
  );
}
