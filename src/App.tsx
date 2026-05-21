import { useState, useEffect } from 'react';
import { User } from './types';
import { getDB, useDB, useDBReady, setCurrentUser, addLog } from './lib/storage';
import { Layout } from './components/layout/Layout';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { Inventory } from './views/Inventory';
import { Categories } from './views/Categories';
import { Borrowing } from './views/Borrowing';
import { Returns } from './views/Returns';
import { Users } from './views/Users';
import { Reports } from './views/Reports';
import { Settings } from './views/Settings';
import { GantiUI } from './views/GantiUI';
import { Toaster } from 'sonner';
import { ResultPopup } from './components/ui/ResultPopup';
import { getActiveTheme, applyTheme } from './lib/theme';

export default function App() {
  const db = useDB();
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('osim_current_user');
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          if (u) {
            setCurrentUser(u);
            return u;
          }
        } catch (e) {
          console.error("Failed to parse saved session", e);
        }
      }
    }
    return null;
  });
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const dbPengurus = db.users.find(u => u.role === 'Pengurus') || {
    user_id: 'pengurus-1',
    nama: 'Budi (Pengurus)',
    username: 'petugas',
    role: 'Pengurus',
    status: 'Aktif',
    created_at: new Date().toISOString()
  };

  const guestUser: User = {
    user_id: dbPengurus.user_id,
    nama: dbPengurus.nama,
    username: dbPengurus.username,
    role: 'Pengurus',
    status: 'Aktif',
    created_at: dbPengurus.created_at
  };

  useEffect(() => {
    applyTheme(getActiveTheme());
  }, []);

  useEffect(() => {
    // Apabila user masih belum login atau saat aplikasi pertama kali dimuat,
    // kita minta lokasi pengunjung.
    if (!user && typeof window !== 'undefined') {
      const hasGuestLoggedLocation = sessionStorage.getItem('osim_guest_location_logged');
      if (!hasGuestLoggedLocation && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            addLog(guestUser.user_id, 'Akses sebagai pengunjung', `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`);
            sessionStorage.setItem('osim_guest_location_logged', 'true');
          },
          (error) => {
            addLog(guestUser.user_id, 'Akses sebagai pengunjung', 'Lokasi tidak diizinkan');
            sessionStorage.setItem('osim_guest_location_logged', 'true');
          }
        );
      }
    }
  }, [user]);

  const activeUser = user || guestUser;

  const handleLogin = (user: User) => {
    setUser(user);
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('osim_current_user', JSON.stringify(user));
    }
    setCurrentView('dashboard');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          addLog(user.user_id, 'Login ke sistem', `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`);
        },
        (error) => {
          addLog(user.user_id, 'Login ke sistem', 'Lokasi tidak tersedia');
        }
      );
    } else {
      addLog(user.user_id, 'Login ke sistem', 'Perangkat tidak mendukung lokasi');
    }
  };

  const handleLogout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('osim_current_user');
    }
    setCurrentView('dashboard');
  };

  const isReady = useDBReady();

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-[#F3F4F6]">
        <div className="flex flex-col items-center max-w-sm px-6 text-center space-y-4">
          <div className="relative flex items-center justify-center w-12 h-12">
            <div className="absolute w-12 h-12 border-4 border-blue-600/20 rounded-full"></div>
            <div className="absolute w-12 h-12 border-4 border-t-blue-500 border-r-blue-500 rounded-full animate-spin"></div>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold tracking-tight text-white">Sinkronisasi Database</h3>
            <p className="text-sm text-neutral-500 text-center">Mengkoneksikan perangkat dan mengambil data terbaru secara real-time...</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'login') {
    return <Login onLogin={handleLogin} onCancel={() => setCurrentView('dashboard')} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return activeUser.role !== 'Peminjam' ? <Dashboard /> : <Borrowing currentUser={activeUser} />;
      case 'inventory': return activeUser.role !== 'Peminjam' ? <Inventory currentUser={activeUser} /> : <Borrowing currentUser={activeUser} />;
      case 'categories': return activeUser.role === 'Admin' ? <Categories /> : <Borrowing currentUser={activeUser} />;
      case 'borrowing': return <Borrowing currentUser={activeUser} />;
      case 'returns': return <Returns currentUser={activeUser} initialTab="pending" />;
      case 'history': return <Returns currentUser={activeUser} initialTab="history" />;
      case 'users': return activeUser.role === 'Admin' ? <Users /> : <Borrowing currentUser={activeUser} />;
      case 'reports': return activeUser.role === 'Admin' ? <Reports /> : <Borrowing currentUser={activeUser} />;
      case 'settings': return activeUser.role === 'Admin' ? <Settings onBack={() => setCurrentView('dashboard')} /> : <Borrowing currentUser={activeUser} />;
      case 'ganti-ui': return activeUser.role === 'Admin' ? <GantiUI onBack={() => setCurrentView('dashboard')} /> : <Borrowing currentUser={activeUser} />;
      default: return <Borrowing currentUser={activeUser} />;
    }
  };

  return (
    <>
      <Toaster position="bottom-center" duration={3000} />
      <ResultPopup />
      <Layout 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        currentUser={activeUser} 
        isLoggedIn={user !== null}
        onLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {renderView()}
      </Layout>
    </>
  );
}
