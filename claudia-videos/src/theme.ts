// @psikologclaudiakonar — Marka Renk & Tasarım Sistemi

export const COLORS = {
  // Ana renkler
  sageGreen: '#A8C5B5',
  warmCream: '#F5F0E8',
  dustyMauve: '#C4A5A5',
  charcoal: '#2C2C2C',
  softWhite: '#FAFAFA',
  white: '#FFFFFF',
  // Özel
  nightBlue: '#1A2A4A', // VR/Teknoloji içerikleri için
  textOnDark: '#FFFFFF',
  textOnLight: '#2C2C2C',
} as const;

export const FONTS = {
  // Google Fonts üzerinden yüklenir
  heading: 'Playfair Display',
  body: 'DM Sans',
  quote: 'Cormorant Garamond',
} as const;

export const SIZES = {
  // Instagram formatları (px)
  reelWidth: 1080,
  reelHeight: 1920,
  carouselWidth: 1080,
  carouselHeight: 1350,
  squareWidth: 1080,
  squareHeight: 1080,
} as const;

export const TIMING = {
  // Frame rate
  fps: 30,
  // Tipik süreler (saniye)
  hookDuration: 3,
  frameDuration: 5,
  fadeInDuration: 0.5,
  fadeOutDuration: 0.3,
} as const;

export type BackgroundStyle = 'cream' | 'sage' | 'mauve' | 'white' | 'night';

export function getBackgroundColor(style: BackgroundStyle): string {
  const map: Record<BackgroundStyle, string> = {
    cream: COLORS.warmCream,
    sage: COLORS.sageGreen,
    mauve: COLORS.dustyMauve,
    white: COLORS.softWhite,
    night: COLORS.nightBlue,
  };
  return map[style];
}

export function getTextColor(background: BackgroundStyle): string {
  if (background === 'sage' || background === 'night' || background === 'mauve') {
    return COLORS.white;
  }
  return COLORS.charcoal;
}
