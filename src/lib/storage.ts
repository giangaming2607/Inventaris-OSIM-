import { DatabaseSchema, LogAktivitas, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'osim_inventory_db';

const defaultData: DatabaseSchema = {
  users: [
    {
      user_id: 'admin-1',
      nama: 'Administrator OSIM',
      username: 'admin',
      password: 'admin123',
      role: 'Admin',
      status: 'Aktif',
      created_at: new Date().toISOString()
    },
    {
      user_id: 'pengurus-1',
      nama: 'Budi (Pengurus)',
      username: 'petugas',
      password: 'admin123',
      role: 'Pengurus',
      status: 'Aktif',
      created_at: new Date().toISOString()
    }
  ],
  kategori: [
    { kategori_id: 'kat-1', nama_kategori: 'Elektronik', deskripsi: 'Barang elektronik' },
    { kategori_id: 'kat-2', nama_kategori: 'Alat Kebersihan', deskripsi: 'Peralatan kebersihan' },
    { kategori_id: 'kat-3', nama_kategori: 'ATK', deskripsi: 'Alat tulis kantor' },
  ],
  inventaris: [
    {
      barang_id: 'inv-1',
      kode_barang: 'INV-2023-001',
      nama_barang: 'Proyektor Epson X100',
      kategori_id: 'kat-1',
      jumlah_total: 2,
      jumlah_tersedia: 2,
      kondisi: 'Baik',
      lokasi: 'Lemari A1',
      foto_barang: '',
      tanggal_masuk: '2023-01-15T00:00:00Z',
      keterangan: 'Lengkap dengan kabel HDMI'
    },
    {
      barang_id: 'inv-2',
      kode_barang: 'INV-2023-002',
      nama_barang: 'Kamera DSLR Canon EOS',
      kategori_id: 'kat-1',
      jumlah_total: 1,
      jumlah_tersedia: 1,
      kondisi: 'Baik',
      lokasi: 'Lemari B2',
      foto_barang: '',
      tanggal_masuk: '2023-05-10T00:00:00Z',
      keterangan: 'Lensa kit 18-55mm'
    },
    {
      barang_id: 'inv-3',
      kode_barang: 'INV-2023-003',
      nama_barang: 'Sapu Injuk',
      kategori_id: 'kat-2',
      jumlah_total: 5,
      jumlah_tersedia: 5,
      kondisi: 'Baik',
      lokasi: 'Gudang Belakang',
      foto_barang: '',
      tanggal_masuk: '2023-02-20T00:00:00Z',
      keterangan: ''
    }
  ],
  peminjaman: [],
  pengembalian: [],
  log_aktivitas: [],
  settings: {}
};

export const getDB = (): DatabaseSchema => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    const parsed = JSON.parse(data);
    let modified = false;
    
    // Migration: If existing users have legacy 'email' but no 'username', map them.
    if (parsed.users) {
      parsed.users = parsed.users.map((u: any) => {
        if (!u.username && u.email) {
          modified = true;
          if (u.email === 'admin@osim.id') u.username = 'admin';
          else if (u.email === 'budi@osim.id' || u.email === 'petugas@osis.id') u.username = 'petugas';
          else u.username = u.email.split('@')[0];
        }
        if (!u.password) {
          modified = true;
          u.password = 'admin123';
        }
        return u;
      });
    }
    
    if (modified) {
      setDB(parsed);
    }
    return parsed;
  }
  setDB(defaultData);
  return defaultData;
};

export const setDB = (data: DatabaseSchema) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const addLog = (user_id: string, aktivitas: string) => {
  const db = getDB();
  const log: LogAktivitas = {
    log_id: uuidv4(),
    user_id,
    waktu: new Date().toISOString(),
    aktivitas
  };
  db.log_aktivitas.unshift(log);
  if (db.log_aktivitas.length > 100) {
    db.log_aktivitas.pop();
  }
  setDB(db);
};

// Current matching user singleton for simulation
let currentUser: User | null = null;
export const setCurrentUser = (user: User) => {
  currentUser = user;
}
export const getCurrentUser = (): User => {
  if (!currentUser) {
     const db = getDB();
     currentUser = db.users[0]; // fallback
  }
  return currentUser;
}
