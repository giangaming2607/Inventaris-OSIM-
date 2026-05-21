import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useDB } from '../lib/storage';
import { Boxes, PackageCheck, PackageMinus, AlertTriangle } from 'lucide-react';
import { formatDateTime } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const db = useDB();
  
  const totalBarang = db.inventaris.reduce((acc, curr) => acc + curr.jumlah_total, 0);
  const totalTersedia = db.inventaris.reduce((acc, curr) => acc + curr.jumlah_tersedia, 0);
  const totalDipinjam = totalBarang - totalTersedia; // simplifikasi
  const totalRusak = db.inventaris.reduce((acc, curr) => acc + (curr.kondisi !== 'Baik' ? curr.jumlah_total : 0), 0);

  // Kategori Stats
  const kategoriStats = db.kategori.map(k => {
    const barangInKategori = db.inventaris.filter(i => i.kategori_id === k.kategori_id);
    const count = barangInKategori.reduce((acc, curr) => acc + curr.jumlah_total, 0);
    return { name: k.nama_kategori, total: count };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-neutral-500 mt-1">Ringkasan statistik inventaris OSIM.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-blue-900/30 text-blue-500 rounded-lg">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Total Barang</p>
              <h4 className="text-2xl font-bold text-white">{totalBarang}</h4>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-green-900/30 text-green-500 rounded-lg">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Tersedia</p>
              <h4 className="text-2xl font-bold text-white">{totalTersedia}</h4>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-amber-900/30 text-amber-500 rounded-lg">
              <PackageMinus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Dipinjam</p>
              <h4 className="text-2xl font-bold text-white">{totalDipinjam}</h4>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-red-900/30 text-red-600 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Rusak / Hilang</p>
              <h4 className="text-2xl font-bold text-white">{totalRusak}</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Distribusi Kategori Barang</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="h-80 w-full">
              {kategoriStats.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={kategoriStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#737373'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#737373'}} />
                    <Tooltip cursor={{fill: '#171717'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-neutral-600">Belum ada data barang</div>
              )}
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-neutral-800 max-h-[352px] overflow-y-auto">
              {db.log_aktivitas.filter(l => l.aktivitas !== 'Login ke sistem').slice(0, 10).map((log) => {
                const user = db.users.find(u => u.user_id === log.user_id);
                return (
                  <div key={log.log_id} className="p-4 hover:bg-[#111111] transition-colors">
                    <p className="text-sm text-white font-medium">{log.aktivitas}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-neutral-500">{user?.nama || 'Unknown'}</span>
                      <span className="text-xs text-neutral-600">{formatDateTime(log.waktu)}</span>
                    </div>
                  </div>
                );
              })}
              {db.log_aktivitas.filter(l => l.aktivitas !== 'Login ke sistem').length === 0 && (
                <div className="p-8 text-center text-sm text-neutral-500">Belum ada aktivitas.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Aktivitas Login</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-neutral-800 max-h-[250px] overflow-y-auto">
              {db.log_aktivitas.filter(l => l.aktivitas === 'Login ke sistem').slice(0, 10).map((log) => {
                const user = db.users.find(u => u.user_id === log.user_id);
                return (
                  <div key={log.log_id} className="p-4 hover:bg-[#111111] transition-colors flex justify-between items-center">
                    <div>
                      <p className="text-sm text-white font-medium">{user?.nama || 'Unknown'} <span className="text-neutral-500 font-normal">({user?.role})</span></p>
                      <p className="text-xs text-neutral-500 mt-1">Lokasi: {log.lokasi || 'Tidak diketahui'}</p>
                    </div>
                    <span className="text-xs text-neutral-600 font-mono">{formatDateTime(log.waktu)}</span>
                  </div>
                );
              })}
              {db.log_aktivitas.filter(l => l.aktivitas === 'Login ke sistem').length === 0 && (
                <div className="p-8 text-center text-sm text-neutral-500">Belum ada aktivitas login.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
