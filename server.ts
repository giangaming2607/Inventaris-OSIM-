import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set limits for base64 image uploads (like logo and return photos)
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  const DB_PATH = path.join(process.cwd(), "db.json");

  const defaultData = {
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

  // Read DB from db.json or create with defaults if missing
  const readDB = () => {
    try {
      if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), "utf-8");
        return defaultData;
      }
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      if (!raw || raw.trim() === "") {
        fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), "utf-8");
        return defaultData;
      }
      return JSON.parse(raw);
    } catch (err) {
      console.error("Error reading database file, returning default data:", err);
      return defaultData;
    }
  };

  // Write DB to db.json safely
  const writeDB = (data: any) => {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("Error writing database file:", err);
    }
  };

  // API router for JSON database
  app.get("/api/db", (req, res) => {
    const data = readDB();
    res.json(data);
  });

  app.post("/api/db", (req, res) => {
    const data = req.body;
    writeDB(data);
    res.json({ success: true, data });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
