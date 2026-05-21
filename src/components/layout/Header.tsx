import { Bell, UserCircle, LogOut, Menu } from 'lucide-react';
import { User } from '../../types';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  toggleSidebar: () => void;
}

export function Header({ currentUser, onLogout, toggleSidebar }: HeaderProps) {
  return (
    <header className="h-16 bg-[#0A0A0A] border-b border-neutral-800 flex items-center justify-between px-6 z-10 flex-shrink-0">
      <div className="flex items-center text-neutral-500 font-medium space-x-4">
        <button 
          onClick={toggleSidebar}
          className="p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex items-center space-x-6">
        <button className="text-neutral-400 hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center space-x-4 border-l border-neutral-800 pl-6">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-white">{currentUser.nama}</span>
            <span className="text-xs text-neutral-500">
              {currentUser.role === 'Peminjam' ? 'Tamu' : `Role: ${currentUser.role}`}
            </span>
          </div>
          <UserCircle className="w-9 h-9 text-neutral-700" />
          
          {currentUser.role !== 'Peminjam' && (
            <button 
              onClick={onLogout}
              className="flex items-center justify-center p-2 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-2"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
