import { useEffect, useState } from "react";
import { DatabaseSchema, LogAktivitas, User } from "../types";
import { v4 as uuidv4 } from "uuid";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db as firestoreDb } from "./firebase";

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
let hasSyncedFromServer = false;

// Helper to compute a simple hash string to check for differences
function computeHash(obj: any): string {
  try {
    return JSON.stringify(obj);
  } catch (e) {
    return "";
  }
}

let isListeningToFirebase = false;

// Function to pull latest DB from backend server asynchronously
export async function syncFromServer() {
  if (typeof window === "undefined" || isListeningToFirebase) return;
  isListeningToFirebase = true;

  try {
    const docRef = doc(firestoreDb, "db", "state");
    onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as DatabaseSchema;
        const currentHash = computeHash(data);
        if (currentHash !== lastHash) {
          cachedDB = data;
          lastHash = currentHash;
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
          window.dispatchEvent(new CustomEvent("db-update", { detail: cachedDB }));
        }
      } else {
        // Init if not exists with client's cached/default data
        setDoc(docRef, cachedDB).catch(console.error);
      }
      
      if (!hasSyncedFromServer) {
        hasSyncedFromServer = true;
        window.dispatchEvent(new CustomEvent("db-init-complete"));
      }
    }, (err) => {
      console.error("Firebase sync error", err);
      // Fallback to local offline mode to avoid getting stuck forever
      if (!hasSyncedFromServer) {
        hasSyncedFromServer = true;
        window.dispatchEvent(new CustomEvent("db-init-complete"));
      }
    });
  } catch (error) {
    console.error("Failed to connect to Firebase:", error);
    if (!hasSyncedFromServer) {
      hasSyncedFromServer = true;
      window.dispatchEvent(new CustomEvent("db-init-complete"));
    }
  }
}

// Keep a persistent background polling loop
if (typeof window !== "undefined") {
  // Sync immediately on script load
  syncFromServer();
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

  // Save to Firebase ONLY if initial sync has completed
  if (typeof window !== 'undefined') {
    if (hasSyncedFromServer) {
      const docRef = doc(firestoreDb, "db", "state");
      setDoc(docRef, data).catch((err) => {
        console.error("Failed to save to Firebase:", err);
      });
    } else {
      console.warn("setDB buffered locally; Firebase sync is still in progress.");
    }
  }
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

// Hook to check if DB has finished syncing from Firestore
export function useDBReady() {
  const [ready, setReady] = useState(hasSyncedFromServer);

  useEffect(() => {
    if (hasSyncedFromServer) {
      setReady(true);
      return;
    }

    const handleInitComplete = () => {
      setReady(true);
    };

    window.addEventListener("db-init-complete", handleInitComplete);
    return () => {
      window.removeEventListener("db-init-complete", handleInitComplete);
    };
  }, []);

  return ready;
}

export const addLog = (user_id: string, aktivitas: string, lokasi?: string) => {
  // Prevent adding startup logs before we actually sync the online database
  if (!hasSyncedFromServer) {
    console.warn("addLog skipped because database is not synced yet:", aktivitas);
    return;
  }
  
  const db = getDB();
  const log: LogAktivitas = {
    log_id: uuidv4(),
    user_id,
    waktu: new Date().toISOString(),
    aktivitas,
    lokasi
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
