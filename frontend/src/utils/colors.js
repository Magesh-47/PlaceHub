// Deterministic color assignment so the same person/department always gets
// the same color across renders and page loads, without a lookup table.
const PALETTE = [
  { grad: 'linear-gradient(135deg, #0d9488, #0891b2)', bg: 'rgba(13, 148, 136, 0.12)', fgLight: '#0f766e', fgDark: '#2dd4bf' },
  { grad: 'linear-gradient(135deg, #f59e0b, #ea580c)', bg: 'rgba(245, 158, 11, 0.12)', fgLight: '#b45309', fgDark: '#fbbf24' },
  { grad: 'linear-gradient(135deg, #6366f1, #8b5cf6)', bg: 'rgba(99, 102, 241, 0.12)', fgLight: '#4f46e5', fgDark: '#a5b4fc' },
  { grad: 'linear-gradient(135deg, #ec4899, #db2777)', bg: 'rgba(236, 72, 153, 0.12)', fgLight: '#be185d', fgDark: '#f9a8d4' },
  { grad: 'linear-gradient(135deg, #10b981, #059669)', bg: 'rgba(16, 185, 129, 0.12)', fgLight: '#047857', fgDark: '#34d399' },
  { grad: 'linear-gradient(135deg, #3b82f6, #2563eb)', bg: 'rgba(59, 130, 246, 0.12)', fgLight: '#1d4ed8', fgDark: '#93c5fd' },
  { grad: 'linear-gradient(135deg, #f43f5e, #e11d48)', bg: 'rgba(244, 63, 94, 0.12)', fgLight: '#be123c', fgDark: '#fda4af' },
  { grad: 'linear-gradient(135deg, #a855f7, #7c3aed)', bg: 'rgba(168, 85, 247, 0.12)', fgLight: '#7e22ce', fgDark: '#d8b4fe' },
  { grad: 'linear-gradient(135deg, #06b6d4, #0e7490)', bg: 'rgba(6, 182, 212, 0.12)', fgLight: '#0e7490', fgDark: '#67e8f9' },
  { grad: 'linear-gradient(135deg, #84cc16, #4d7c0f)', bg: 'rgba(132, 204, 22, 0.14)', fgLight: '#4d7c0f', fgDark: '#bef264' },
];

function paletteIndexFor(seed) {
  const str = String(seed || '?');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash % PALETTE.length;
}

// Gradient background for an initials avatar, consistent per seed (name/username).
export const avatarGradientFor = (seed) => PALETTE[paletteIndexFor(seed)].grad;

// Soft badge background + text color pair, consistent per seed (e.g. department name).
export const badgeColorFor = (seed, theme = 'light') => {
  const p = PALETTE[paletteIndexFor(seed)];
  return { backgroundColor: p.bg, color: theme === 'dark' ? p.fgDark : p.fgLight, borderColor: 'transparent' };
};
