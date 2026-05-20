import { useEffect, useState } from "react";
import { DatabaseSchema, LogAktivitas, User } from "../types";
import { v4 as uuidv4 } from "uuid";

const defaultData: DatabaseSchema = {
  users: [
    {
      user_id: "admin-1",
      nama: "Administrator OSIM",
      username: "admin",
      password: "admin123",
      role: "Admin",
      status: "Aktif",
      created_at: new Date().toISOString()
    },
    {
      user_id: "pengurus-1",
      nama: "Budi (Pengurus)",
      username: "petugas",
      password: "admin123",
      role: "Pengurus",
      status: "Aktif",
      created_at: new Date().toISOString()
    }
  ],
  kategori: [
    { kategori_id: "kat-1", nama_kategori: "Elektronik", deskripsi: "Barang elektronik" },
    { kategori_id: "kat-2", nama_kategori: "Alat Kebersihan", deskripsi: "Peralatan kebersihan" },
    { kategori_id: "kat-3", nama_kategori: "ATK", deskripsi: "Alat tulis kantor" }
  ],
  inventaris: [
    {
      barang_id: "inv-1",
      kode_barang: "INV-2023-001",
      nama_barang: "Proyektor Epson X100",
      kategori_id: "kat-1",
      jumlah_total: 2,
      jumlah_tersedia: 2,
      kondisi: "Baik",
      lokasi: "Lemari A1",
      foto_barang: "",
      tanggal_masuk: "2023-01-15T00:00:00Z",
      keterangan: "Lengkap dengan kabel HDMI"
    },
    {
      barang_id: "inv-2",
      kode_barang: "INV-2023-002",
      nama_barang: "Kamera DSLR Canon EOS",
      kategori_id: "kat-1",
      jumlah_total: 1,
      jumlah_tersedia: 1,
      kondisi: "Baik",
      lokasi: "Lemari B2",
      foto_barang: "",
      tanggal_masuk: "2023-05-10T00:00:00Z",
      keterangan: "Lensa kit 18-55mm"
    },
    {
      barang_id: "inv-3",
      kode_barang: "INV-2023-003",
      nama_barang: "Sapu Injuk",
      kategori_id: "kat-2",
      jumlah_total: 5,
      jumlah_tersedia: 5,
      kondisi: "Baik",
      lokasi: "Gudang Belakang",
      foto_barang: "",
      tanggal_masuk: "2023-02-20T00:00:00Z",
      keterangan: ""
    }
  ],
  peminjaman: [],
  pengembalian: [],
  log_aktivitas: [],
  settings: {
    login_title: "OSIS Inventory",
    login_subtitle: "Masuk ke akun Anda"
  }
};

const LOCAL_STORAGE_KEY = 'osim_inventory_db';

const loadInitialDB = (): DatabaseSchema => {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.users)) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse local storage key", e);
      }
    }
  }
  return defaultData;
};

// In-memory cache
let cachedDB: DatabaseSchema = loadInitialDB();
let lastHash = "";

// Helper to compute a simple hash string to check for differences
function computeHash(obj: any): string {
  try {
    return JSON.stringify(obj);
  } catch (e) {
    return "";
  }
}

// Function to pull latest DB from backend server asynchronously
export async function syncFromServer() {
  try {
    const res = await fetch("/api/db");
    if (res.ok) {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data: DatabaseSchema = await res.json();
        const currentHash = computeHash(data);
        if (currentHash !== lastHash) {
          cachedDB = data;
          lastHash = currentHash;
          if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
            // Notify React components to trigger re-renders
            window.dispatchEvent(new CustomEvent("db-update", { detail: cachedDB }));
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to sync database from server:", error);
  }
}

// Keep a persistent background polling loop
if (typeof window !== "undefined") {
  // Sync immediately on script load
  syncFromServer();
  // Poll every 3 seconds to push and check updates across multi-device
  setInterval(syncFromServer, 3000);
}

// Synchronous getter for views
export const getDB = (): DatabaseSchema => {
  return cachedDB;
};

// Publisher helper to save and dispatch updates to express backend
export const setDB = (data: DatabaseSchema) => {
  cachedDB = data;
  lastHash = computeHash(data);
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("db-update", { detail: cachedDB }));
  }

  // Post changes asynchronously with retry/fail tolerance
  fetch("/api/db", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }).catch((err) => {
    console.error("Failed to save database to server:", err);
  });
};

// Custom hook for components to bind reactively to DB changes
export function useDB() {
  const [db, setDb] = useState<DatabaseSchema>(cachedDB);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<DatabaseSchema>;
      setDb(customEvent.detail || cachedDB);
    };

    window.addEventListener("db-update", handleUpdate);
    return () => {
      window.removeEventListener("db-update", handleUpdate);
    };
  }, []);

  return db;
}

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

// Logged-in user singleton config
let currentUser: User | null = null;
export const setCurrentUser = (user: User) => {
  currentUser = user;
};
export const getCurrentUser = (): User => {
  if (!currentUser) {
    const db = getDB();
    currentUser = db.users[0]; // fallback
  }
  return currentUser;
};
