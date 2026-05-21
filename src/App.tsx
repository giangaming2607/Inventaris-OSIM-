import { useState, useEffect } from 'react';
import { User } from './types';
import { getDB, setCurrentUser, addLog } from './lib/storage';
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

export default function App() {
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
  const [currentView, setCurrentView] = useState(user ? 'dashboard' : 'borrowing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const guestUser: User = {
    user_id: 'guest',
    nama: 'Pengunjung',
    username: 'guest',
    role: 'Peminjam',
    status: 'Aktif',
    created_at: new Date().toISOString()
  };

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
    setCurrentView('borrowing');
  };

  if (currentView === 'login') {
    return <Login onLogin={handleLogin} onCancel={() => setCurrentView('borrowing')} />;
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
      case 'settings': return activeUser.role === 'Admin' ? <Settings /> : <Borrowing currentUser={activeUser} />;
      default: return <Borrowing currentUser={activeUser} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={setCurrentView} 
      currentUser={activeUser} 
      onLogout={handleLogout}
      isSidebarOpen={isSidebarOpen}
      toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
    >
      {renderView()}
    </Layout>
  );
}
