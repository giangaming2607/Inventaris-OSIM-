import { 
  Boxes, LayoutDashboard, Tags, ClipboardList, 
  ArrowLeftRight, Users, FileBarChart, Settings, History, Palette
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Role } from '../../types';
import { useDB } from '../../lib/storage';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  userRole: Role;
}

export function Sidebar({ currentView, onNavigate, userRole }: SidebarProps) {
  const db = useDB();
  const logo = db.settings?.logo || null;
  const loginTitle = db.settings?.login_title || 'Inventaris OSIM';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Pengurus'] },
    { id: 'inventory', label: 'Inventaris', icon: Boxes, roles: ['Admin', 'Pengurus'] },
    { id: 'categories', label: 'Kategori', icon: Tags, roles: ['Admin'] },
    { id: 'borrowing', label: 'Peminjaman', icon: ClipboardList, roles: ['Admin', 'Pengurus', 'Peminjam'] },
    { id: 'returns', label: 'Pengembalian', icon: ArrowLeftRight, roles: ['Admin', 'Pengurus', 'Peminjam'] },
    { id: 'history', label: 'Riwayat', icon: History, roles: ['Admin', 'Pengurus', 'Peminjam'] },
    { id: 'users', label: 'Pengguna', icon: Users, roles: ['Admin'] },
    { id: 'reports', label: 'Laporan', icon: FileBarChart, roles: ['Admin'] },
    { id: 'settings', label: 'Pengaturan', icon: Settings, roles: ['Admin'] },
    { id: 'ganti-ui', label: 'Ganti UI', icon: Palette, roles: ['Admin'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-[#050505] border-r border-neutral-800 text-neutral-400 flex-shrink-0 flex flex-col transition-all duration-300">
      <div className="h-16 flex items-center px-6 bg-[#050505] border-b border-neutral-800 font-bold text-white text-lg tracking-tight overflow-hidden">
        {logo ? (
          <img src={logo} alt="Logo" className="w-8 h-8 mr-3 object-contain rounded" />
        ) : (
          <Boxes className="w-6 h-6 mr-3 text-blue-500 flex-shrink-0" />
        )}
        <span className="truncate">{loginTitle}</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto w-full">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
              currentView === item.id 
                ? "bg-neutral-800 text-white" 
                : "hover:bg-neutral-800 hover:text-white"
            )}
          >
            <item.icon className={cn("w-5 h-5 mr-3 opacity-70", currentView === item.id ? "text-white" : "")} />
            {item.label}
          </button>
        ))}

        {userRole === 'Pengurus' && (
          <button
            onClick={() => onNavigate('login')}
            className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors hover:bg-neutral-800 mt-4 text-blue-500 border border-neutral-800"
            style={{ color: 'var(--thm-primary)', borderColor: 'var(--thm-border)' }}
          >
            <Users className="w-5 h-5 mr-3 opacity-70" style={{ color: 'var(--thm-primary)' }} />
            Masuk sebagai Admin
          </button>
        )}
      </nav>
    </aside>
  );
}
