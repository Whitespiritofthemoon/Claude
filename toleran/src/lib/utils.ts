import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { SafetyLevel, ConfidenceLevel, SymptomType } from '@/types'

// ─── Tailwind class merger ────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── ID generator ────────────────────────────────────────────────────────────
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
export function formatDate(dateStr: string, lang: 'tr' | 'en' = 'tr'): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5)
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function nowTime(): string {
  return new Date().toTimeString().slice(0, 5)
}

export function relativeTime(isoString: string, lang: 'tr' | 'en' = 'tr'): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)

  if (lang === 'tr') {
    if (mins < 1) return 'az önce'
    if (mins < 60) return `${mins} dk önce`
    if (hours < 24) return `${hours} saat önce`
    return `${days} gün önce`
  }
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// ─── Safety helpers ───────────────────────────────────────────────────────────
export const safetyConfig: Record<
  SafetyLevel,
  { label: string; labelEn: string; bgClass: string; textClass: string; borderClass: string; emoji: string }
> = {
  safe: {
    label: 'Uygun',
    labelEn: 'Safe',
    bgClass: 'bg-green-50',
    textClass: 'text-green-700',
    borderClass: 'border-green-300',
    emoji: '✅',
  },
  caution: {
    label: 'Dikkat',
    labelEn: 'Caution',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-300',
    emoji: '⚠️',
  },
  avoid: {
    label: 'Kaçın',
    labelEn: 'Avoid',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    borderClass: 'border-red-300',
    emoji: '🚫',
  },
  unknown: {
    label: 'Belirsiz',
    labelEn: 'Unknown',
    bgClass: 'bg-gray-50',
    textClass: 'text-gray-600',
    borderClass: 'border-gray-300',
    emoji: '❓',
  },
}

export const confidenceConfig: Record<ConfidenceLevel, { label: string; color: string }> = {
  high: { label: 'Yüksek güven', color: 'text-green-600' },
  medium: { label: 'Orta güven', color: 'text-amber-600' },
  low: { label: 'Düşük güven', color: 'text-gray-500' },
}

// ─── Food aliases ─────────────────────────────────────────────────────────────
// Maps common ingredients to their condition-triggering forms
export const FOOD_ALIASES: Record<string, string[]> = {
  laktoz: ['süt', 'peynir', 'tereyağı', 'yoğurt', 'krema', 'kazein', 'whey', 'laktoz', 'milk', 'cheese', 'butter', 'cream', 'dairy', 'lactalbumin', 'lactoglobulin'],
  gluten: ['buğday', 'arpa', 'çavdar', 'malt', 'wheat', 'barley', 'rye', 'spelt', 'kamut', 'semolina', 'triticale', 'gluten', 'nişasta'],
  yumurta: ['yumurta', 'egg', 'albumin', 'albümin', 'ovomucin', 'lysozyme'],
  soya: ['soya', 'soy', 'tofu', 'edamame', 'miso', 'tempeh'],
  findik: ['fındık', 'hazelnut'],
  ceviz: ['ceviz', 'walnut'],
  badem: ['badem', 'almond'],
  yer_fistigi: ['yer fıstığı', 'fıstık', 'peanut', 'groundnut'],
  susam: ['susam', 'sesame', 'tahini'],
  kabuklu_deniz: ['karides', 'shrimp', 'prawn', 'ıstakoz', 'lobster', 'yengeç', 'crab'],
  gluten_turevleri: ['modifiye nişasta', 'hidrolize buğday proteini', 'malt aroması', 'bira mayası'],
}

// ─── Symptom severity helpers ─────────────────────────────────────────────────
export function severityLabel(n: number): string {
  const labels = ['', 'Hafif', 'Hafif-Orta', 'Orta', 'Orta-Şiddetli', 'Şiddetli']
  return labels[n] ?? 'Bilinmiyor'
}

export function severityColor(n: number): string {
  if (n <= 2) return 'text-green-600'
  if (n === 3) return 'text-amber-600'
  return 'text-red-600'
}

// ─── Country helpers ──────────────────────────────────────────────────────────
export const COUNTRY_NAMES: Record<string, string> = {
  TR: 'Türkiye',
  DE: 'Almanya',
  GB: 'İngiltere',
  US: 'Amerika',
  FR: 'Fransa',
  NL: 'Hollanda',
  BE: 'Belçika',
  AT: 'Avusturya',
  CH: 'İsviçre',
}

// ─── Emergency keywords ───────────────────────────────────────────────────────
export const EMERGENCY_KEYWORDS = [
  'nefes alamıyorum',
  'boğazım şişiyor',
  'dilim şişti',
  'bayılıyorum',
  'bayılacak gibi',
  'can\'t breathe',
  'throat closing',
  'tongue swelling',
  'lips swelling',
  'anaphylaxis',
  'anafılaksi',
  'epinephrine',
  'epipen',
]

export function containsEmergencyKeyword(text: string): boolean {
  const lower = text.toLowerCase()
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw))
}

// ─── Quick suggestion chips ───────────────────────────────────────────────────
export const QUICK_SUGGESTIONS_TR = [
  'Bu ürün bana uygun mu?',
  'Laktozsuz seçenekler neler?',
  'Glutensiz ekmek öner',
  'Kahvede süt yerine ne kullanayım?',
  'Dışarıda ne yiyebilirim?',
  'Bu tarifte yumurta yerine ne koyayım?',
  'Protein için ne yerim?',
  'Çocuğum için güvenli atıştırmalık',
]

export const QUICK_SUGGESTIONS_EN = [
  'Is this product safe for me?',
  'What are lactose-free options?',
  'Suggest gluten-free bread',
  'What can I use instead of milk in coffee?',
  'What can I eat out?',
  'What can I use instead of eggs in this recipe?',
  'What to eat for protein?',
  'Safe snack for my child',
]
