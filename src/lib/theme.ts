export interface UITheme {
  id: string;
  name: string;
  description: string;
  category: string;
  primaryColor: string; // Used for preview bullet
  colors: {
    bgApp: string;
    bgSidebar: string;
    bgHeader: string;
    bgCard: string;
    border: string;
    primary: string;
    primaryDim: string;
    hover: string;
    textPrimary: string;
    textMuted: string;
    glow?: string;
  };
}

export const UI_THEMES: UITheme[] = [
  {
    id: 'cosmic-dark',
    name: 'Cosmic Dark (Sleek)',
    description: 'Sleek dark space theme with elegant high-contrast neon blue highlights.',
    category: 'Dark Minimal',
    primaryColor: '#3b82f6',
    colors: {
      bgApp: '#0A0A0A',
      bgSidebar: '#050505',
      bgHeader: '#0A0A0A',
      bgCard: '#121212',
      border: '#262626',
      primary: '#3b82f6',
      primaryDim: 'rgba(59, 130, 246, 0.12)',
      hover: '#1a1a1a',
      textPrimary: '#ffffff',
      textMuted: '#a3a3a3',
      glow: '0 0 12px rgba(59, 130, 246, 0.3)'
    }
  },
  {
    id: 'emerald-horizon',
    name: 'Emerald Horizon',
    description: 'Deep forest shades combined with organic emerald green highlights.',
    category: 'Nature',
    primaryColor: '#10b981',
    colors: {
      bgApp: '#060F0E',
      bgSidebar: '#030807',
      bgHeader: '#060F0E',
      bgCard: '#0D1A18',
      border: '#1E3530',
      primary: '#10b981',
      primaryDim: 'rgba(16, 185, 129, 0.15)',
      hover: '#132C28',
      textPrimary: '#F0F9F6',
      textMuted: '#8EA49E',
      glow: '0 0 10px rgba(16, 185, 129, 0.3)'
    }
  },
  {
    id: 'neon-tokyo',
    name: 'Neon Tokyo (Cyberpunk)',
    description: 'Vibrant cyberpunk neon magenta overlaying futuristic synthwave dark violet.',
    category: 'Sci-Fi',
    primaryColor: '#f43f5e',
    colors: {
      bgApp: '#0C0614',
      bgSidebar: '#06020A',
      bgHeader: '#0C0614',
      bgCard: '#150A24',
      border: '#2E154D',
      primary: '#ec4899',
      primaryDim: 'rgba(236, 72, 153, 0.15)',
      hover: '#23103D',
      textPrimary: '#FAF5FF',
      textMuted: '#AF9EC4',
      glow: '0 0 15px rgba(236, 72, 153, 0.4)'
    }
  },
  {
    id: 'sapphire-ocean',
    name: 'Sapphire Ocean',
    description: 'Deep marine navy gradients coupled with beautiful clear sea sapphire tones.',
    category: 'Calm',
    primaryColor: '#0ea5e9',
    colors: {
      bgApp: '#040b17',
      bgSidebar: '#020610',
      bgHeader: '#040b17',
      bgCard: '#09152b',
      border: '#15294a',
      primary: '#0ea5e9',
      primaryDim: 'rgba(14, 165, 233, 0.15)',
      hover: '#0e2343',
      textPrimary: '#f0f7ff',
      textMuted: '#8ba6cf',
      glow: '0 0 10px rgba(14, 165, 233, 0.3)'
    }
  },
  {
    id: 'rose-velvet',
    name: 'Rose Velvet',
    description: 'Warm dusty vintage burgundy canvas topped with sophisticated rose quartz.',
    category: 'Aesthetic',
    primaryColor: '#f43f5e',
    colors: {
      bgApp: '#14080D',
      bgSidebar: '#0A0306',
      bgHeader: '#14080D',
      bgCard: '#210F17',
      border: '#401A29',
      primary: '#f43f5e',
      primaryDim: 'rgba(244, 63, 94, 0.15)',
      hover: '#311622',
      textPrimary: '#FFF5F7',
      textMuted: '#C29FAB',
      glow: '0 0 12px rgba(244, 63, 94, 0.3)'
    }
  },
  {
    id: 'carbon-tech',
    name: 'Carbon Tech',
    description: 'Ultra-low fatigue charcoal tones paired with vivid polar ice accents.',
    category: 'Dark Minimal',
    primaryColor: '#22d3ee',
    colors: {
      bgApp: '#0F1115',
      bgSidebar: '#090A0D',
      bgHeader: '#0F1115',
      bgCard: '#171B22',
      border: '#2A303C',
      primary: '#22d3ee',
      primaryDim: 'rgba(34, 211, 238, 0.15)',
      hover: '#212836',
      textPrimary: '#F1F5F9',
      textMuted: '#94A3B8',
      glow: '0 0 10px rgba(34, 211, 238, 0.3)'
    }
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Amber',
    description: 'Hot basalt rock dark background highlighted with energetic solar orange.',
    category: 'Warm',
    primaryColor: '#f97316',
    colors: {
      bgApp: '#120B06',
      bgSidebar: '#090503',
      bgHeader: '#120B06',
      bgCard: '#1E120A',
      border: '#3D2211',
      primary: '#f97316',
      primaryDim: 'rgba(249, 115, 22, 0.15)',
      hover: '#2D1A0D',
      textPrimary: '#FFF9F5',
      textMuted: '#D9C1B0',
      glow: '0 0 12px rgba(249, 115, 22, 0.35)'
    }
  },
  {
    id: 'royal-amethyst',
    name: 'Royal Amethyst',
    description: 'Luxurious dark purple base featuring modern glowing amethyst details.',
    category: 'Sci-Fi',
    primaryColor: '#a855f7',
    colors: {
      bgApp: '#0E081A',
      bgSidebar: '#07040D',
      bgHeader: '#0E081A',
      bgCard: '#190F2E',
      border: '#351F61',
      primary: '#a855f7',
      primaryDim: 'rgba(168, 85, 247, 0.15)',
      hover: '#251545',
      textPrimary: '#FAF5FF',
      textMuted: '#C1B6E0',
      glow: '0 0 12px rgba(168, 85, 247, 0.35)'
    }
  },
  {
    id: 'volcanic-fire',
    name: 'Volcanic Ash',
    description: 'Fiery molten red borders erupting from cold charcoal ash backgrounds.',
    category: 'Creative',
    primaryColor: '#ef4444',
    colors: {
      bgApp: '#0E0B0B',
      bgSidebar: '#070505',
      bgHeader: '#0E0B0B',
      bgCard: '#1A1313',
      border: '#381E1E',
      primary: '#ef4444',
      primaryDim: 'rgba(239, 68, 68, 0.15)',
      hover: '#2C1D1D',
      textPrimary: '#FFF5F5',
      textMuted: '#C2ACAC',
      glow: '0 0 14px rgba(239, 68, 68, 0.4)'
    }
  },
  {
    id: 'mint-obsidian',
    name: 'Mint Obsidian',
    description: 'Cool mineral spearmint accents over crisp volcanic obsidian panels.',
    category: 'Calm',
    primaryColor: '#4ade80',
    colors: {
      bgApp: '#050A08',
      bgSidebar: '#020504',
      bgHeader: '#050A08',
      bgCard: '#0A1410',
      border: '#152C23',
      primary: '#4ade80',
      primaryDim: 'rgba(74, 222, 128, 0.15)',
      hover: '#0E231C',
      textPrimary: '#EDFDF5',
      textMuted: '#A2BCB0',
      glow: '0 0 10px rgba(74, 222, 128, 0.3)'
    }
  },
  {
    id: 'warm-coffee',
    name: 'Warm Coffee (Espresso)',
    description: 'Cozy and classic coffee brown palette with soft gold and ivory highlights.',
    category: 'Warm',
    primaryColor: '#d97706',
    colors: {
      bgApp: '#140D0A',
      bgSidebar: '#0A0605',
      bgHeader: '#140D0A',
      bgCard: '#231711',
      border: '#452E22',
      primary: '#d97706',
      primaryDim: 'rgba(217, 119, 6, 0.15)',
      hover: '#332118',
      textPrimary: '#FFF9F5',
      textMuted: '#C2ABA0',
      glow: '0 0 10px rgba(217, 119, 6, 0.3)'
    }
  },
  {
    id: 'crimson-shadow',
    name: 'Crimson Shadow',
    description: 'Intense gothic midnight background accompanied by luxury blood crimson buttons.',
    category: 'Creative',
    primaryColor: '#dc2626',
    colors: {
      bgApp: '#060103',
      bgSidebar: '#030001',
      bgHeader: '#060103',
      bgCard: '#14050A',
      border: '#310A18',
      primary: '#dc2626',
      primaryDim: 'rgba(220, 38, 38, 0.15)',
      hover: '#220812',
      textPrimary: '#FFF0F3',
      textMuted: '#BFAAB1',
      glow: '0 0 15px rgba(220, 38, 38, 0.4)'
    }
  },
  {
    id: 'nordic-frost',
    name: 'Nordic Frost',
    description: 'Chilly polar subzero slate blue background with bright arctic ice cyan highlights.',
    category: 'Calm',
    primaryColor: '#06b6d4',
    colors: {
      bgApp: '#0B1119',
      bgSidebar: '#05080C',
      bgHeader: '#0B1119',
      bgCard: '#131D2A',
      border: '#24354B',
      primary: '#06b6d4',
      primaryDim: 'rgba(6, 182, 212, 0.15)',
      hover: '#19283B',
      textPrimary: '#F0F9FF',
      textMuted: '#99AFCE',
      glow: '0 0 11px rgba(6, 182, 212, 0.32)'
    }
  },
  {
    id: 'gold-luxe',
    name: 'Gold Luxe (Premium)',
    description: 'Sophisticated onyx premium space with exquisite radiant imperial gold lines.',
    category: 'Luxury',
    primaryColor: '#fbbf24',
    colors: {
      bgApp: '#0C0C0B',
      bgSidebar: '#060605',
      bgHeader: '#0C0C0B',
      bgCard: '#171714',
      border: '#33332B',
      primary: '#fbbf24',
      primaryDim: 'rgba(251, 191, 36, 0.15)',
      hover: '#24241F',
      textPrimary: '#FFFDF0',
      textMuted: '#B8B59E',
      glow: '0 0 14px rgba(251, 191, 36, 0.4)'
    }
  },
  {
    id: 'lavender-dream',
    name: 'Lavender Dream',
    description: 'Comfortable pastel lavender dark mode with majestic blooming lilac highlights.',
    category: 'Aesthetic',
    primaryColor: '#c084fc',
    colors: {
      bgApp: '#0F0918',
      bgSidebar: '#07040C',
      bgHeader: '#0F0918',
      bgCard: '#1A1129',
      border: '#352254',
      primary: '#c084fc',
      primaryDim: 'rgba(192, 132, 252, 0.15)',
      hover: '#25193B',
      textPrimary: '#FCFAFF',
      textMuted: '#BCACC7',
      glow: '0 0 10px rgba(192, 132, 252, 0.3)'
    }
  },
  {
    id: 'monochrome-clean',
    name: 'Monochrome Bauhaus',
    description: 'Extreme simplicity. Pitch black backgrounds with crystal white text.',
    category: 'Dark Minimal',
    primaryColor: '#ffffff',
    colors: {
      bgApp: '#000000',
      bgSidebar: '#000000',
      bgHeader: '#000000',
      bgCard: '#0A0A0A',
      border: '#262626',
      primary: '#ffffff',
      primaryDim: 'rgba(255, 255, 255, 0.12)',
      hover: '#171717',
      textPrimary: '#ffffff',
      textMuted: '#8a8a8a',
      glow: '0 0 8px rgba(255, 255, 255, 0.15)'
    }
  },
  {
    id: 'matrix-terminal',
    name: 'Matrix Phosphor',
    description: 'Green-screen code aesthetics. Classic 1980s retro tech matrix style.',
    category: 'Retro',
    primaryColor: '#22c55e',
    colors: {
      bgApp: '#020503',
      bgSidebar: '#010302',
      bgHeader: '#020503',
      bgCard: '#051207',
      border: '#10391A',
      primary: '#22c55e',
      primaryDim: 'rgba(34, 197, 94, 0.2)',
      hover: '#0A2410',
      textPrimary: '#E8F5E9',
      textMuted: '#7CB382',
      glow: '0 0 15px rgba(34, 197, 94, 0.45)'
    }
  },
  {
    id: 'desert-sage',
    name: 'Desert Sage',
    description: 'A serene combo of desert sage olive green with high contrast solar sand trims.',
    category: 'Nature',
    primaryColor: '#84cc16',
    colors: {
      bgApp: '#10120B',
      bgSidebar: '#080905',
      bgHeader: '#10120B',
      bgCard: '#1C1F13',
      border: '#353A23',
      primary: '#84cc16',
      primaryDim: 'rgba(132, 204, 22, 0.15)',
      hover: '#292C1C',
      textPrimary: '#F6FAF0',
      textMuted: '#A5AC97',
      glow: '0 0 10px rgba(132, 204, 22, 0.3)'
    }
  },
  {
    id: 'nebula-cloud',
    name: 'Orion Nebula',
    description: 'Majestic deep indigo colors overlayed with intergalactic violet starlight colors.',
    category: 'Creative',
    primaryColor: '#c084fc',
    colors: {
      bgApp: '#07091B',
      bgSidebar: '#03040C',
      bgHeader: '#07091B',
      bgCard: '#111533',
      border: '#232961',
      primary: '#a855f7',
      primaryDim: 'rgba(168, 85, 247, 0.15)',
      hover: '#1B204D',
      textPrimary: '#F5F5FF',
      textMuted: '#9E9EB5',
      glow: '0 0 14px rgba(168, 85, 247, 0.35)'
    }
  },
  {
    id: 'atlantic-wave',
    name: 'Atlantic Crest',
    description: 'Strong deep cold navy base with vibrant ice turquoise oceanic crest accents.',
    category: 'Calm',
    primaryColor: '#14b8a6',
    colors: {
      bgApp: '#070F14',
      bgSidebar: '#03070A',
      bgHeader: '#070F14',
      bgCard: '#0F1E29',
      border: '#1F3F54',
      primary: '#14b8a6',
      primaryDim: 'rgba(20, 184, 166, 0.15)',
      hover: '#162C3C',
      textPrimary: '#F0FDFA',
      textMuted: '#94A6B5',
      glow: '0 0 12px rgba(20, 184, 166, 0.33)'
    }
  }
];

export function getActiveTheme(): UITheme {
  if (typeof window === 'undefined') return UI_THEMES[0];
  const saved = localStorage.getItem('osim_ui_theme');
  if (saved) {
    const found = UI_THEMES.find(t => t.id === saved);
    if (found) return found;
  }
  return UI_THEMES[0];
}

export function setActiveThemeId(id: string): UITheme {
  const found = UI_THEMES.find(t => t.id === id);
  if (found) {
    localStorage.setItem('osim_ui_theme', id);
    applyTheme(found);
    window.dispatchEvent(new Event('theme-change'));
    return found;
  }
  return UI_THEMES[0];
}

export function applyTheme(theme: UITheme) {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  const vars = theme.colors;

  // Set the structural variables
  root.style.setProperty('--thm-bg-app', vars.bgApp);
  root.style.setProperty('--thm-bg-sidebar', vars.bgSidebar);
  root.style.setProperty('--thm-bg-header', vars.bgHeader);
  root.style.setProperty('--thm-bg-card', vars.bgCard);
  root.style.setProperty('--thm-border', vars.border);
  root.style.setProperty('--thm-primary', vars.primary);
  root.style.setProperty('--thm-primary-dim', vars.primaryDim);
  root.style.setProperty('--thm-hover', vars.hover);
  root.style.setProperty('--thm-text-primary', vars.textPrimary);
  root.style.setProperty('--thm-text-muted', vars.textMuted);
  root.style.setProperty('--thm-glow', vars.glow || 'none');

  // Inject or update the dynamic style block to override hardcoded Tailwind colors seamlessly
  let styleEl = document.getElementById('dynamic-theme-overrides');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamic-theme-overrides';
    document.head.appendChild(styleEl);
  }

  // Pure Magic CSS that translates our structural custom variables into deep Tailwind selector overrides
  styleEl.textContent = `
    /* Root modifications */
    html, body {
      background-color: var(--thm-bg-app) !important;
      color: var(--thm-text-primary) !important;
    }

    /* Force layouts */
    .bg-\\[\\#0A0A0A\\], .bg-\\[\\#050505\\], .bg-neutral-950, .bg-black {
      background-color: var(--thm-bg-app) !important;
    }
    
    /* Aside sidebar special overriding */
    aside, aside * {
      /* Keep sidebar elements in line */
    }
    aside {
      background-color: var(--thm-bg-sidebar) !important;
      border-color: var(--thm-border) !important;
    }
    aside .bg-neutral-800 {
      background-color: var(--thm-primary-dim) !important;
      color: var(--thm-primary) !important;
    }
    aside .hover\\:bg-neutral-800:hover {
      background-color: var(--thm-hover) !important;
      color: var(--thm-text-primary) !important;
    }

    /* Header modifications */
    header {
      background-color: var(--thm-bg-header) !important;
      border-color: var(--thm-border) !important;
    }

    /* Cards and panels */
    .bg-neutral-900, .bg-\\[\\#111111\\], .bg-card, .bg-neutral-900\\/50, .bg-neutral-800\\/50 {
      background-color: var(--thm-bg-card) !important;
      border-color: var(--thm-border) !important;
    }
    .border-neutral-800, .border-neutral-700, .border-neutral-900 {
      border-color: var(--thm-border) !important;
    }

    /* Primary text and accents */
    .text-blue-500, .text-blue-400, .text-indigo-500, .text-emerald-500, .text-violet-500, .text-primary-accent {
      color: var(--thm-primary) !important;
    }
    .text-neutral-400, .text-neutral-500 {
      color: var(--thm-text-muted) !important;
    }

    /* Primary backgrounds and badges */
    .bg-blue-600, .bg-blue-500, .bg-emerald-600 {
      background-color: var(--thm-primary) !important;
      color: var(--thm-bg-app) !important;
    }
    .bg-blue-600:hover, .bg-blue-500:hover, .bg-emerald-600:hover {
      filter: brightness(1.15);
    }
    .bg-blue-500\\/10, .bg-emerald-500\\/10, .bg-violet-500\\/10, .bg-blue-500\\/20 {
      background-color: var(--thm-primary-dim) !important;
      color: var(--thm-primary) !important;
    }

    /* Borders */
    .border-blue-500, .border-blue-600 {
      border-color: var(--thm-primary) !important;
    }

    /* Focus and ring accents */
    .focus\\:ring-blue-500:focus, .focus\\:border-blue-500:focus {
      --tw-ring-color: var(--thm-primary) !important;
      border-color: var(--thm-primary) !important;
    }

    /* Floating action glow on clickable badges & buttons */
    .theme-glow-act {
      box-shadow: var(--thm-glow) !important;
    }

    /* Custom scrollbar adjustments for premium appearance */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: var(--thm-bg-app);
    }
    ::-webkit-scrollbar-thumb {
      background: var(--thm-border);
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: var(--thm-primary);
    }
  `;
}
