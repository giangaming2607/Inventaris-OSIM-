import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Download, FileText, Printer } from 'lucide-react';
import { getDB } from '../lib/storage';
import { Inventaris, Peminjaman, Pengembalian, Kategori, User } from '../types';
import { formatDateTime, formatDate } from '../lib/utils';
import { differenceInDays, parseISO } from 'date-fns';

export function Reports() {
  const [inventaris, setInventaris] = useState<Inventaris[]>([]);
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [activeTab, setActiveTab] = useState<'stok' | 'rusak' | 'peminjaman'>('stok');

  const loadData = () => {
    const db = getDB();
    setInventaris(db.inventaris);
    setPeminjaman(db.peminjaman);
    setKategori(db.kategori);
    setUsers(db.users);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('db-update', loadData);
    return () => window.removeEventListener('db-update', loadData);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const renderStok = () => (
    <div className="overflow-x-auto print:overflow-visible">
      <table className="w-full text-left border-collapse border border-neutral-800">
        <thead>
          <tr className="bg-neutral-800">
             <th className="border border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-300">Kode</th>
             <th className="border border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-300">Nama Barang</th>
             <th className="border border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-300">Kategori</th>
             <th className="border border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-300 text-center">Total</th>
             <th className="border border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-300 text-center">Tersedia</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {inventaris.map(i => (
             <tr key={i.barang_id}>
               <td className="border border-neutral-800 px-4 py-2 text-sm font-mono text-neutral-400">{i.kode_barang}</td>
               <td className="border border-neutral-800 px-4 py-2 text-sm text-white">{i.nama_barang}</td>
               <td className="border border-neutral-800 px-4 py-2 text-sm text-neutral-400">{kategori.find(k => k.kategori_id === i.kategori_id)?.nama_kategori}</td>
               <td className="border border-neutral-800 px-4 py-2 text-sm text-center font-medium">{i.jumlah_total}</td>
               <td className="border border-neutral-800 px-4 py-2 text-sm text-center font-medium">{i.jumlah_tersedia}</td>
             </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderRusak = () => {
    const rusakData = inventaris.filter(i => i.kondisi !== 'Baik');
    return (
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-left border-collapse border border-neutral-800">
          <thead>
            <tr className="bg-neutral-800">
               <th className="border border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-300">Kode</th>
               <th className="border border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-300">Nama Barang</th>
               <th className="border border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-300 text-center">Kondisi</th>
               <th className="border border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-300">Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {rusakData.map(i => (
               <tr key={i.barang_id}>
                 <td className="border border-neutral-800 px-4 py-2 text-sm font-mono text-neutral-400">{i.kode_barang}</td>
                 <td className="border border-neutral-800 px-4 py-2 text-sm text-white">{i.nama_barang}</td>
                 <td className="border border-neutral-800 px-4 py-2 text-sm text-center text-red-600 font-medium">{i.kondisi}</td>
                 <td className="border border-neutral-800 px-4 py-2 text-sm text-neutral-400">{i.keterangan || '-'}</td>
               </tr>
            ))}
            {rusakData.length === 0 && (
              <tr><td colSpan={4} className="border border-neutral-800 px-4 py-8 text-center text-neutral-500">Tidak ada barang rusak.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPeminjaman = () => {
    // Only show last 30 days or general history for simple report
    const sorted = [...peminjaman].sort((a,b) => new Date(b.tanggal_pinjam).getTime() - new Date(a.tanggal_pinjam).getTime());
    return (
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-left border-collapse border border-neutral-800">
          <thead>
            <tr className="bg-neutral-800">
               <th className="border border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-300">Pelaku</th>
               <th className="border border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-300">Unit Barang</th>
               <th className="border border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-300">Tanggal Pinjam</th>
               <th className="border border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-300">Status Akhir</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {sorted.map(p => (
               <tr key={p.peminjaman_id}>
                 <td className="border border-neutral-800 px-4 py-2 text-sm text-white">{users.find(u => u.user_id === p.user_id)?.nama}</td>
                 <td className="border border-neutral-800 px-4 py-2 text-sm text-neutral-400">
                   {inventaris.find(i => i.barang_id === p.barang_id)?.nama_barang} (x{p.jumlah_pinjam})
                 </td>
                 <td className="border border-neutral-800 px-4 py-2 text-sm text-neutral-400">{formatDate(p.tanggal_pinjam)}</td>
                 <td className="border border-neutral-800 px-4 py-2 text-sm font-medium">
                   {p.status}
                 </td>
               </tr>
            ))}
            {sorted.length === 0 && (
              <tr><td colSpan={4} className="border border-neutral-800 px-4 py-8 text-center text-neutral-500">Tidak ada riwayat peminjaman.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-white">Laporan Inventaris</h2>
          <p className="text-neutral-500 mt-1">Cetak dan export data laporan inventaris keseluruhan.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="w-4 h-4" /> Cetak (PDF)
          </Button>
        </div>
      </div>

      <div className="print:hidden flex gap-2 border-b border-neutral-800 mb-6">
        <button 
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'stok' ? 'border-blue-600 text-blue-500' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
          onClick={() => setActiveTab('stok')}
        >
          Laporan Stok
        </button>
        <button 
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'rusak' ? 'border-blue-600 text-blue-500' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
          onClick={() => setActiveTab('rusak')}
        >
          Barang Rusak/Hilang
        </button>
        <button 
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'peminjaman' ? 'border-blue-600 text-blue-500' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
          onClick={() => setActiveTab('peminjaman')}
        >
          Riwayat Peminjaman
        </button>
      </div>

      {/* Print View Header */}
      <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold uppercase">Laporan Inventaris OSIM</h1>
        <p className="text-sm mt-1">Periode Cetak: {formatDateTime(new Date().toISOString())}</p>
        <p className="text-sm font-bold mt-2">Kategori Laporan: {activeTab === 'stok' ? 'Stok Barang' : activeTab === 'rusak' ? 'Kerusakan' : 'Riwayat Peminjaman'}</p>
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardContent className="p-6 print:p-0">
          {activeTab === 'stok' && renderStok()}
          {activeTab === 'rusak' && renderRusak()}
          {activeTab === 'peminjaman' && renderPeminjaman()}
        </CardContent>
      </Card>
      
      {/* Print View Footer */}
      <div className="hidden print:flex justify-end mt-16 pl-64">
         <div className="text-center">
            <p className="mb-16">Mengetahui, Administrator</p>
            <p className="font-bold underline text-sm border-b border-black pb-1 inline-block min-w-[200px]"></p>
         </div>
      </div>
    </div>
  );
}
