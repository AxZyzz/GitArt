// Contribution-graph palettes. The CSS tokens in index.css are the source of
// truth for DOM elements; these hex values exist for <canvas> drawing and for
// the palette switcher swatches.
export const PALETTES = {
  yellow: {
    label: 'Yellow',
    levels: ['#161b22', '#5c3d00', '#9e6a03', '#d29922', '#f2cc60'],
  },
  green: {
    label: 'Classic',
    levels: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
  },
};

export const DEFAULT_PALETTE = 'yellow';
const STORAGE_KEY = 'gitart-palette';

// CSS-variable references for DOM elements, so they follow the active palette.
export const LEVEL_VARS = [0, 1, 2, 3, 4].map(i => `var(--lvl-${i})`);

export function getStoredPalette() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v && PALETTES[v] ? v : DEFAULT_PALETTE;
  } catch {
    return DEFAULT_PALETTE;
  }
}

export function applyPalette(name) {
  const key = PALETTES[name] ? name : DEFAULT_PALETTE;
  document.documentElement.dataset.palette = key;
  try { localStorage.setItem(STORAGE_KEY, key); } catch { /* storage blocked */ }
  window.dispatchEvent(new CustomEvent('gitart:palette', { detail: key }));
  return key;
}

export function currentPalette() {
  return document.documentElement.dataset.palette || DEFAULT_PALETTE;
}
