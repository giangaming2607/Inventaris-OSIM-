import { useState, useEffect } from 'react';
import { User } from './types';
import { getDB, setCurrentUser } from './lib/storage';
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
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogin = (user: User) => {
    setUser(user);
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <Inventory currentUser={user} />;
      case 'categories': return user.role === 'Admin' ? <Categories /> : <Dashboard />;
      case 'borrowing': return <Borrowing currentUser={user} />;
      case 'returns': return <Returns currentUser={user} />;
      case 'users': return user.role === 'Admin' ? <Users /> : <Dashboard />;
      case 'reports': return user.role === 'Admin' ? <Reports /> : <Dashboard />;
      case 'settings': return user.role === 'Admin' ? <Settings /> : <Dashboard />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={setCurrentView} 
      currentUser={user} 
      onLogout={handleLogout}
      isSidebarOpen={isSidebarOpen}
      toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
    >
      {renderView()}
    </Layout>
  );
}
