// src/lib/theme.svelte.ts
// Theme picker state for Coverage Tracker — the same store the dashboard ships.
// Persists to localStorage and reflects onto <html data-theme data-mode>,
// which the theme scopes in app.css turn into semantic design tokens.

export type Mode = 'light' | 'dark';

export interface ThemeMeta {
  id: string;
  label: string;
  /** sublabel shown under the theme name */
  note: string;
  /** which modes this scheme ships */
  modes: Mode[];
  /** four swatches for the picker: bg, primary, chart-1, chart-2 (dark) */
  swatch: [string, string, string, string];
}

export const THEMES: ThemeMeta[] = [
  { id: 'catppuccin', label: 'Catppuccin', note: 'Mocha · default', modes: ['light', 'dark'], swatch: ['#181825', '#89b4fa', '#cba6f7', '#94e2d5'] },
  { id: 'gruvbox',    label: 'Gruvbox',    note: 'Dark',            modes: ['light', 'dark'], swatch: ['#1d2021', '#fabd2f', '#d3869b', '#8ec07c'] },
  { id: 'nord',       label: 'Nord',       note: 'Polar Night',     modes: ['light', 'dark'], swatch: ['#2e3440', '#88c0d0', '#b48ead', '#a3be8c'] },
  { id: 'solarized',  label: 'Solarized',  note: 'Dark',            modes: ['light', 'dark'], swatch: ['#002b36', '#268bd2', '#d33682', '#859900'] },
  { id: 'dracula',    label: 'Dracula',    note: 'Dark only',       modes: ['dark'],          swatch: ['#282a36', '#bd93f9', '#ff79c6', '#50fa7b'] },
  { id: 'tokyonight', label: 'Tokyo Night', note: 'Dark only',      modes: ['dark'],          swatch: ['#1a1b26', '#7aa2f7', '#bb9af7', '#9ece6a'] }
];

const KEY = 'ct-theme';
const DEFAULT = { id: 'catppuccin', mode: 'dark' as Mode };

function load(): { id: string; mode: Mode } {
  if (typeof localStorage === 'undefined') return { ...DEFAULT };
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '');
    if (v && v.id && v.mode) return v;
  } catch {
    /* fall through */
  }
  return { ...DEFAULT };
}

// Svelte 5 runes store
export const theme = $state(load());

export function meta(id = theme.id): ThemeMeta {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function setTheme(id: string) {
  const m = meta(id);
  // keep current mode if the scheme has it, else fall back to what it ships
  if (!m.modes.includes(theme.mode)) theme.mode = m.modes[0];
  theme.id = id;
}

export function toggleMode() {
  const m = meta();
  if (m.modes.length < 2) return; // dark-only scheme: no-op
  theme.mode = theme.mode === 'dark' ? 'light' : 'dark';
}

/** Reflect onto <html> + persist. Call inside an $effect in +layout.svelte. */
export function applyTheme() {
  const root = document.documentElement;
  root.dataset.theme = theme.id;
  root.dataset.mode = theme.mode;
  root.classList.toggle('dark', theme.mode === 'dark');
  localStorage.setItem(KEY, JSON.stringify({ id: theme.id, mode: theme.mode }));
}
