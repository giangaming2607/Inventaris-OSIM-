import { useState, useEffect } from 'react';
import { 
  Palette, Check, Sparkles, Filter, Search, 
  Layers, Circle, Eye, Sliders, CheckCircle2 
} from 'lucide-react';
import { UI_THEMES, UITheme, getActiveTheme, setActiveThemeId } from '../lib/theme';
import { toast } from 'sonner';

export function GantiUI() {
  const [activeTheme, setActiveTheme] = useState<UITheme>(() => getActiveTheme());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  useEffect(() => {
    const onThemeChange = () => {
      setActiveTheme(getActiveTheme());
    };
    window.addEventListener('theme-change', onThemeChange);
    return () => window.removeEventListener('theme-change', onThemeChange);
  }, []);

  // Unique categories
  const categories = ['Semua', ...new Set(UI_THEMES.map(t => t.category))];

  // Map of category translation to Indonesian
  const categoryLabels: { [key: string]: string } = {
    'Semua': 'Semua Tema',
    'Dark Minimal': 'Gelap Minimalis',
    'Nature': 'Bernuansa Alam',
    'Sci-Fi': 'Fiksi Ilmiah / Futuristik',
    'Calm': 'Tenang & Menyejukkan',
    'Warm': 'Hangat & Estetis',
    'Creative': 'Kreatif / Berani',
    'Luxury': 'Premium & Mewah',
    'Retro': 'Klasik Retro'
  };

  const filteredThemes = UI_THEMES.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectTheme = (theme: UITheme) => {
    if (theme.id === activeTheme.id) {
      toast.info(`Tema ${theme.name} sudah aktif.`);
      return;
    }
    
    // Smooth fade effect via body transition class during switch
    document.documentElement.classList.add('transition-all', 'duration-500');
    setActiveThemeId(theme.id);
    toast.success(`Tema berhasil diubah menjadi ${theme.name}!`, {
      icon: <Sparkles className="w-5 h-5 text-yellow-400" />,
      duration: 1500
    });
    
    // Remove temporary class
    setTimeout(() => {
      document.documentElement.classList.remove('transition-all', 'duration-500');
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Palette className="w-6 h-6 text-blue-500" style={{ color: 'var(--thm-primary)' }} />
            Personalisasi Tema Antarmuka (Ganti UI)
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Ubah penampilan visual dan skema warna seluruh sistem Inventaris Sekretariat OSIM secara langsung.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-neutral-900/50 border border-neutral-800 px-3 py-1.5 rounded-lg text-xs text-neutral-400 font-mono">
          <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
          <span>Tema Aktif: <strong className="text-white">{activeTheme.name}</strong></span>
        </div>
      </div>

      {/* Toolbar / Search and Categories */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Cari nama atau deskripsi gaya tema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-2 text-xs text-neutral-400 px-1">
            <Filter className="w-3.5 h-3.5 text-neutral-500" />
            <span>Menampilkan <strong>{filteredThemes.length}</strong> dari <strong>{UI_THEMES.length}</strong> variasi presets</span>
          </div>
        </div>

        {/* Categories Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
          {categories.map((catKey) => (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === catKey
                  ? 'bg-white text-black'
                  : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white hover:bg-neutral-900'
              }`}
            >
              {categoryLabels[catKey] ?? catKey}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of UI Themes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredThemes.map((theme) => {
          const isSelected = theme.id === activeTheme.id;
          
          return (
            <div 
              key={theme.id}
              className={`group flex flex-col bg-neutral-900 border rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 ${
                isSelected 
                  ? 'border-blue-500 ring-1 ring-blue-500/30' 
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
              style={{
                borderColor: isSelected ? 'var(--thm-primary)' : '',
                boxShadow: isSelected ? 'var(--thm-glow)' : 'none'
              }}
            >
              {/* Miniature Layout Preview Component Box */}
              <div 
                className="relative h-32 p-3 flex gap-2 overflow-hidden border-b transition-colors duration-300"
                style={{ 
                  backgroundColor: theme.colors.bgApp, 
                  borderColor: theme.colors.border 
                }}
              >
                {/* Mini Sidebar */}
                <div 
                  className="w-12 rounded border flex flex-col gap-1.5 p-1.5 transition-colors duration-300"
                  style={{ 
                    backgroundColor: theme.colors.bgSidebar, 
                    borderColor: theme.colors.border
                  }}
                >
                  <div className="h-2 w-4 rounded-sm" style={{ backgroundColor: theme.colors.primary }} />
                  <div className="space-y-1 mt-1">
                    <div className="h-1 w-full rounded-full opacity-60" style={{ backgroundColor: theme.colors.primary }} />
                    <div className="h-1 w-2/3 rounded-full bg-neutral-700" />
                    <div className="h-1 w-4/5 rounded-full bg-neutral-700" />
                  </div>
                </div>

                {/* Mini Core Content Frame */}
                <div className="flex-1 flex flex-col gap-2">
                  {/* Mini Header */}
                  <div 
                    className="h-5 rounded border flex items-center justify-between px-1.5 transition-colors duration-300"
                    style={{ 
                      backgroundColor: theme.colors.bgHeader, 
                      borderColor: theme.colors.border 
                    }}
                  >
                    <div className="h-1 w-6 rounded-full bg-neutral-700" />
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                      <div className="h-1 w-4 rounded-full bg-neutral-700" />
                    </div>
                  </div>

                  {/* Simulated Content Area with Cards */}
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    {/* Simulated Card 1 */}
                    <div 
                      className="rounded border p-1 flex flex-col justify-between transition-colors duration-300"
                      style={{ 
                        backgroundColor: theme.colors.bgCard, 
                        borderColor: theme.colors.border 
                      }}
                    >
                      <div className="space-y-1">
                        <div className="h-1 w-2/3 rounded-full bg-neutral-700" />
                        <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <div className="h-1 w-5 rounded-full bg-neutral-600" />
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                      </div>
                    </div>

                    {/* Simulated Card 2 */}
                    <div 
                      className="rounded border p-1 flex flex-col justify-between transition-colors duration-300"
                      style={{ 
                        backgroundColor: theme.colors.bgCard, 
                        borderColor: theme.colors.border 
                      }}
                    >
                      <div className="space-y-1">
                        <div className="h-1.5 w-4/5 rounded-full bg-neutral-600" />
                        <div className="h-1 w-full rounded-full bg-neutral-700" />
                      </div>
                      <div className="h-3.5 w-full rounded bg-blue-600 flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: theme.colors.primary }}>
                        <div className="h-0.5 w-4 rounded-full bg-neutral-900" style={{ backgroundColor: theme.colors.bgApp }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Category Badge */}
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-medium text-neutral-300 border border-neutral-800">
                  {theme.category}
                </span>
              </div>

              {/* Theme description details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 group-hover:transition-all" style={{ color: isSelected ? 'var(--thm-primary)' : '' }}>
                      {theme.name}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      {/* Color dots preview */}
                      <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: theme.colors.primary }} title="Aksen Utama" />
                      <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: theme.colors.bgApp }} title="Latar Belakang" />
                      <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: theme.colors.bgCard }} title="Kartu Konten" />
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed min-h-[32px]">
                    {theme.description}
                  </p>
                </div>

                <div className="pt-2">
                  {isSelected ? (
                    <div className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" />
                      Tema Sedang Aktif
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSelectTheme(theme)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-950 text-neutral-300 border border-neutral-800 hover:border-neutral-500 hover:text-white hover:bg-neutral-850 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 opacity-60" />
                      Terapkan Gaya UI
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredThemes.length === 0 && (
        <div className="text-center py-12 bg-neutral-900 border border-neutral-800 rounded-xl">
          <Palette className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-white mb-1">Gaya Tema Tidak Ditemukan</h3>
          <p className="text-xs text-neutral-500">Coba kata kunci pencarian atau ganti kategori penyaring.</p>
        </div>
      )}
    </div>
  );
}
