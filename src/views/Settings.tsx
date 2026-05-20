import { useState, useRef, useEffect } from 'react';
import { getDB, setDB, useDB } from '../lib/storage';
import { ImagePlus, Save } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Settings() {
  const dbState = useDB();
  const [logo, setLogo] = useState<string | null>(null);
  const [loginTitle, setLoginTitle] = useState('OSIS Inventory');
  const [loginSubtitle, setLoginSubtitle] = useState('Masuk ke akun Anda');
  const [isSaved, setIsSaved] = useState(false);
  const [isTextSaved, setIsTextSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (dbState.settings) {
      setLogo(dbState.settings.logo || null);
      setLoginTitle(dbState.settings.login_title || 'OSIS Inventory');
      setLoginSubtitle(dbState.settings.login_subtitle || 'Masuk ke akun Anda');
    }
  }, [dbState]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogo(base64String);
        
        const db = getDB();
        db.settings = { ...db.settings, logo: base64String };
        setDB(db);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveText = () => {
    const db = getDB();
    db.settings = { 
      ...db.settings, 
      login_title: loginTitle,
      login_subtitle: loginSubtitle
    };
    setDB(db);
    setIsTextSaved(true);
    setTimeout(() => setIsTextSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Pengaturan Sistem</h1>
        <p className="text-sm text-neutral-400 mt-1">Kelola konfigurasi aplikasi dan tampilan</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-800 flex justify-between items-center">
          <h2 className="text-lg font-medium text-white">Logo Aplikasi</h2>
          {isSaved && <span className="text-sm text-green-500 font-medium">Berhasil disimpan</span>}
        </div>
        <div className="p-6">
          <div className="flex items-start space-x-8">
            <div className="relative group">
              {logo ? (
                <div className="w-32 h-32 bg-[#050505] border border-neutral-800 rounded-lg p-2 flex items-center justify-center">
                  <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-32 h-32 bg-[#050505] border border-neutral-800 border-dashed rounded-lg flex items-center justify-center">
                  <ImagePlus className="w-8 h-8 text-neutral-600" />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-300 font-medium mb-1">Upload Logo Baru</p>
                <p className="text-xs text-neutral-500 mb-4">
                  Format yang didukung: PNG, JPG, GIF. Ukuran logo disarankan dengan rasio 1:1 atau proporsional dengan tinggi maksimal 100px pada form login.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="primary"
                >
                  <ImagePlus className="w-4 h-4 mr-2" />
                  Pilih Gambar
                </Button>
                
                {logo && (
                  <Button 
                    onClick={() => {
                      setLogo(null);
                      const db = getDB();
                      if (db.settings) {
                        delete db.settings.logo;
                        setDB(db);
                        setIsSaved(true);
                        setTimeout(() => setIsSaved(false), 3000);
                      }
                    }}
                    variant="danger"
                  >
                    Hapus Logo
                  </Button>
                )}
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleLogoUpload}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-neutral-800 flex justify-between items-center">
          <h2 className="text-lg font-medium text-white">Teks Halaman Login</h2>
          {isTextSaved && <span className="text-sm text-green-500 font-medium">Berhasil disimpan</span>}
        </div>
        <div className="p-6">
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Judul Login</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-neutral-800 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-white sm:text-sm"
                value={loginTitle}
                onChange={(e) => setLoginTitle(e.target.value)}
                placeholder="OSIS Inventory"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Sub Judul Login</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-neutral-800 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-white sm:text-sm"
                value={loginSubtitle}
                onChange={(e) => setLoginSubtitle(e.target.value)}
                placeholder="Masuk ke akun Anda"
              />
            </div>
            <div className="pt-2">
              <Button onClick={handleSaveText} variant="primary">
                <Save className="w-4 h-4 mr-2" />
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
