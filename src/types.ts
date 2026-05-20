export type Role = 'Admin' | 'Pengurus';
export type Status = 'Aktif' | 'Nonaktif';
export type KondisiBarang = 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
export type StatusPeminjaman = 'Menunggu' | 'Dipinjam' | 'Dikembalikan';

export interface User {
  user_id: string;
  nama: string;
  username: string;
  password?: string;
  role: Role;
  status: Status;
  created_at: string;
}

export interface Kategori {
  kategori_id: string;
  nama_kategori: string;
  deskripsi: string;
}

export interface Inventaris {
  barang_id: string;
  kode_barang: string;
  nama_barang: string;
  kategori_id: string; // Relasi ke Kategori
  jumlah_total: number;
  jumlah_tersedia: number;
  kondisi: KondisiBarang;
  lokasi: string;
  foto_barang: string; // URL
  tanggal_masuk: string;
  keterangan: string;
}

export interface Peminjaman {
  peminjaman_id: string;
  barang_id: string;
  user_id: string;
  jumlah_pinjam: number;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  status: StatusPeminjaman;
  catatan: string;
}

export interface Pengembalian {
  pengembalian_id: string;
  peminjaman_id: string;
  tanggal_pengembalian: string;
  kondisi_setelah: KondisiBarang;
  catatan_kerusakan: string;
  foto_pengembalian?: string;
}

export interface LogAktivitas {
  log_id: string;
  user_id: string;
  aktivitas: string;
  waktu: string;
}

export interface AppSettings {
  logo?: string;
  login_title?: string;
  login_subtitle?: string;
}

export interface DatabaseSchema {
  users: User[];
  kategori: Kategori[];
  inventaris: Inventaris[];
  peminjaman: Peminjaman[];
  pengembalian: Pengembalian[];
  log_aktivitas: LogAktivitas[];
  settings?: AppSettings;
}
