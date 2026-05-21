import { useState } from 'react';
import { getDB, useDB } from '../lib/storage';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onCancel?: () => void;
}

export function Login({ onLogin, onCancel }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const db = useDB();

  const logo = db.settings?.logo || null;
  const loginTitle = db.settings?.login_title || 'OSIS Inventory';
  const loginSubtitle = db.settings?.login_subtitle || 'Masuk ke akun Anda';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentDb = getDB();
    
    const user = currentDb.users.find(u => u.username === username);
    
    if (user && user.password === password) {
      onLogin(user);
    } else {
      setError('Username atau password salah.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-between bg-[#050505] text-neutral-200 py-10 px-4">
      {/* Spacer to push card to middle on tall screens */}
      <div className="hidden sm:block h-4"></div>

      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl p-8 my-auto">
        <div className="mb-8 text-center">
          {logo && (
            <img src={logo} alt="Logo" className="h-24 object-contain mx-auto mb-4" />
          )}
          {!logo && <h1 className="text-2xl font-semibold text-white tracking-tight">{loginTitle}</h1>}
          {logo && loginTitle && <h1 className="text-2xl font-semibold text-white tracking-tight mt-4">{loginTitle}</h1>}
          <p className="text-sm text-neutral-500 mt-2">{loginSubtitle}</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-900/30 border border-red-900 text-red-500 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Username</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-[#0A0A0A] border border-neutral-800 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-white sm:text-sm"
              placeholder="Masukkan username anda..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 bg-[#0A0A0A] border border-neutral-800 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-white sm:text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-1/3 bg-neutral-800 text-neutral-300 py-2 px-4 rounded-lg font-medium hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050505] focus:ring-neutral-500 text-sm"
              >
                Kembali
              </button>
            )}
            <button
              type="submit"
              className={`${onCancel ? 'w-2/3' : 'w-full'} bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050505] focus:ring-blue-500 text-sm`}
            >
              Masuk
            </button>
          </div>
        </form>
      </div>
      
      <div className="text-xs text-neutral-500 text-center px-4 mt-8">
        &copy; {new Date().getFullYear()} OSIM MTs Madani Alauddin.<br className="sm:hidden" /> Dikembangkan oleh Gian Aditya.
      </div>
    </div>
  );
}
