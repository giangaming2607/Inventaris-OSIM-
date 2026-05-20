import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Role, User } from '../../types';

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: User;
  onLogout: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export function Layout({ 
  children, 
  currentView, 
  onNavigate, 
  currentUser, 
  onLogout,
  isSidebarOpen,
  toggleSidebar
}: LayoutProps) {
  return (
    <div className="flex h-screen bg-[#0A0A0A] font-sans text-neutral-200">
      {isSidebarOpen && (
        <Sidebar currentView={currentView} onNavigate={onNavigate} userRole={currentUser.role} />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          currentUser={currentUser} 
          onLogout={onLogout} 
          toggleSidebar={toggleSidebar} 
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
