'use client'

import { useAppStore } from '@/lib/store'
import { BottomNav } from '@/components/layout/BottomNav'
import { Card } from '@/components/ui/Card'
import { SafetyBadge } from '@/components/ui/SafetyBadge'
import { Badge } from '@/components/ui/Badge'
import { relativeTime, COUNTRY_NAMES } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ScanLine,
  MessageCircle,
  BookOpen,
  ClipboardList,
  Search,
  ShoppingCart,
  Bell,
  ChevronRight,
  Sparkles,
  TrendingUp,
  MapPin,
} from 'lucide-react'
import type { SafetyLevel } from '@/types'

// ─── Quick action button ───────────────────────────────────────────────────────

function QuickAction({
  icon,
  label,
  color,
  href,
}: {
  icon: React.ReactNode
  label: string
  color: string
  href: string
}) {
  return (
    <Link href={href} className="quick-action-btn">
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color}`}
      >
        {icon}
      </div>
      <span className="text-[11px] font-medium text-toleran-text leading-tight text-center">
        {label}
      </span>
    </Link>
  )
}

// ─── Sample recipes (static for MVP) ─────────────────────────────────────────

const SAMPLE_RECIPES = [
  { id: '1', name: 'Sütsüz Muzlu Yulaf', emoji: '🥣', tag: 'Kahvaltı', duration: 10 },
  { id: '2', name: 'Glutensiz Mercimek Çorbası', emoji: '🍲', tag: 'Öğle', duration: 25 },
  { id: '3', name: 'Avokadolu Pirinç Keki', emoji: '🥑', tag: 'Atıştırmalık', duration: 15 },
]

// ─── Sample brand recommendations ─────────────────────────────────────────────

const BRAND_SUGGESTIONS: Record<string, Array<{ brand: string; product: string; store: string; emoji: string }>> = {
  TR: [
    { brand: 'Pınar', product: 'Laktozsuz Süt', store: 'BİM, A101, Migros', emoji: '🥛' },
    { brand: 'Schar', product: 'Glutensiz Ekmek', store: 'Migros, CarrefourSA', emoji: '🍞' },
    { brand: 'Alpro', product: 'Yulaf Sütü', store: 'CarrefourSA, Hakmar', emoji: '🌾' },
  ],
  DE: [
    { brand: 'Alpro', product: 'Hafermilch', store: 'Rewe, Edeka', emoji: '🥛' },
    { brand: 'Schär', product: 'Glutenfreies Brot', store: 'Aldi, Lidl', emoji: '🍞' },
    { brand: 'Oatly', product: 'Haferdrink', store: 'dm, Rossmann', emoji: '🌾' },
  ],
  GB: [
    { brand: 'Oatly', product: 'Oat Milk', store: 'Tesco, Sainsbury\'s', emoji: '🥛' },
    { brand: 'FREEE', product: 'GF Bread', store: 'Waitrose, M&S', emoji: '🍞' },
    { brand: 'Alpro', product: 'Soya Yogurt', store: 'Tesco', emoji: '🥣' },
  ],
  US: [
    { brand: 'Oatly', product: 'Oat Milk', store: 'Whole Foods, Target', emoji: '🥛' },
    { brand: 'Schar', product: 'GF Bread', store: 'Whole Foods', emoji: '🍞' },
    { brand: "Silk", product: 'Almond Milk', store: 'Kroger, Walmart', emoji: '🌰' },
  ],
}

// ─── Main home page ───────────────────────────────────────────────────────────

export default function HomePage() {
  const user = useAppStore((s) => s.user)
  const recentAnalyses = useAppStore((s) => s.recentAnalyses)
  const symptomLogs = useAppStore((s) => s.symptomLogs)
  const router = useRouter()

  const country = user?.country ?? 'TR'
  const brandSuggestions = BRAND_SUGGESTIONS[country] ?? BRAND_SUGGESTIONS['TR']
  const greeting = getGreeting(user?.name)
  const recentSymptoms = symptomLogs.slice(0, 3)

  return (
    <div className="min-h-dvh bg-toleran-bg page-content">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-toleran-bg px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-7 h-7 rounded-lg bg-toleran-sage-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-base font-bold text-toleran-sage-700">toleran</span>
          </div>
          <p className="text-lg font-bold text-toleran-text">{greeting}</p>
          {user?.country && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-toleran-muted" />
              <span className="text-xs text-toleran-muted">{COUNTRY_NAMES[user.country] ?? user.country}</span>
            </div>
          )}
        </div>
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center text-toleran-sage-700 hover:bg-toleran-sage-50 relative"
          aria-label="Bildirimler"
        >
          <Bell size={20} strokeWidth={1.8} />
        </button>
      </div>

      <div className="px-4 space-y-5 pb-6">
        {/* ── Condition summary chips ─────────────────────────────────────── */}
        {user?.conditions && user.conditions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 animate-fade-in-up">
            {user.conditions.slice(0, 4).map((c) => (
              <Badge key={c.id} variant={c.type === 'allergy' || c.type === 'celiac' ? 'danger' : 'warning'} size="sm">
                {c.foodItem}
              </Badge>
            ))}
            {user.conditions.length > 4 && (
              <Badge variant="default" size="sm">
                +{user.conditions.length - 4} daha
              </Badge>
            )}
          </div>
        )}

        {/* ── Quick Actions ───────────────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-bold text-toleran-text mb-3">Hızlı Eylemler</h2>
          <div className="grid grid-cols-4 gap-2 stagger-children">
            <QuickAction
              href="/scan?mode=barcode"
              icon={<ScanLine size={22} className="text-toleran-sage-600" />}
              label="Barkod Tara"
              color="bg-toleran-sage-50"
            />
            <QuickAction
              href="/chat"
              icon={<MessageCircle size={22} className="text-purple-600" />}
              label="Soru Sor"
              color="bg-purple-50"
            />
            <QuickAction
              href="/scan?mode=text"
              icon={<Search size={22} className="text-blue-600" />}
              label="İçerik Analiz"
              color="bg-blue-50"
            />
            <QuickAction
              href="/recipes"
              icon={<BookOpen size={22} className="text-toleran-coral-500" />}
              label="Tarif Bul"
              color="bg-toleran-coral-50"
            />
            <QuickAction
              href="/symptom-log"
              icon={<ClipboardList size={22} className="text-green-600" />}
              label="Semptom Kaydet"
              color="bg-green-50"
            />
            <QuickAction
              href="/chat?q=alternatif"
              icon={<Sparkles size={22} className="text-amber-600" />}
              label="Alternatif Bul"
              color="bg-amber-50"
            />
            <QuickAction
              href="/scan?mode=photo"
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-600">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              }
              label="Fotoğraf Yükle"
              color="bg-rose-50"
            />
            <QuickAction
              href="/profile?tab=shopping"
              icon={<ShoppingCart size={22} className="text-indigo-600" />}
              label="Alışveriş Listesi"
              color="bg-indigo-50"
            />
          </div>
        </section>

        {/* ── AI Quick Ask ─────────────────────────────────────────────────── */}
        <button
          onClick={() => router.push('/chat')}
          className="w-full bg-gradient-to-r from-toleran-sage-500 to-toleran-sage-600 rounded-2xl p-4 text-left shadow-float"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <MessageCircle size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Hızlı Soru Sor</p>
              <p className="text-white/80 text-xs mt-0.5">
                &ldquo;Bu ürün bana uygun mu?&rdquo; gibi sorularla başlayın
              </p>
            </div>
            <ChevronRight size={18} className="text-white/60 ml-auto shrink-0" />
          </div>
        </button>

        {/* ── Recent Analyses ─────────────────────────────────────────────── */}
        {recentAnalyses.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-toleran-text">Son Analizler</h2>
              <Link href="/chat" className="text-xs text-toleran-sage-600 font-medium">
                Tümü →
              </Link>
            </div>
            <div className="space-y-2">
              {recentAnalyses.slice(0, 3).map((a, i) => (
                <Card key={i} variant="default" padding="sm" hoverable>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-toleran-text truncate">{a.query}</p>
                      <p className="text-xs text-toleran-muted mt-0.5">{relativeTime(a.timestamp)}</p>
                    </div>
                    <SafetyBadge level={a.safetyLevel as SafetyLevel} size="sm" />
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* ── Recipe suggestions ───────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-toleran-text">Size Özel Tarifler</h2>
            <Link href="/recipes" className="text-xs text-toleran-sage-600 font-medium">
              Tümü →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {SAMPLE_RECIPES.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes?id=${recipe.id}`}
                className="shrink-0 w-40 bg-white rounded-2xl p-3 shadow-card flex flex-col gap-2"
              >
                <div className="w-full h-20 bg-toleran-sage-50 rounded-xl flex items-center justify-center">
                  <span className="text-4xl">{recipe.emoji}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-toleran-text leading-tight">
                    {recipe.name}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant="sage" size="sm">{recipe.tag}</Badge>
                    <span className="text-xs text-toleran-muted">{recipe.duration}dk</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Country brand recommendations ─────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-toleran-text">
                {COUNTRY_NAMES[country] ?? country} için Öneriler
              </h2>
              <p className="text-xs text-toleran-muted mt-0.5">
                Ülkenizde bulabileceğiniz güvenli ürünler
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {brandSuggestions.map((b, i) => (
              <Card key={i} variant="default" padding="sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-toleran-sage-50 flex items-center justify-center text-xl shrink-0">
                    {b.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-toleran-text">
                      {b.brand} — {b.product}
                    </p>
                    <p className="text-xs text-toleran-muted truncate">{b.store}</p>
                  </div>
                  <Badge variant="sage" size="sm">Uygun</Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Symptom summary ─────────────────────────────────────────────── */}
        {recentSymptoms.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-toleran-text">Semptom Özetim</h2>
              <Link href="/symptom-log" className="text-xs text-toleran-sage-600 font-medium">
                Detaylar →
              </Link>
            </div>
            <Card variant="default" padding="md">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-toleran-sage-500" />
                <span className="text-sm font-semibold text-toleran-text">Son 7 gün</span>
              </div>
              <div className="space-y-2">
                {recentSymptoms.map((log) => (
                  <div key={log.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span className="text-sm text-toleran-text truncate">{log.foodItem}</span>
                    </div>
                    <span className="text-xs text-toleran-muted shrink-0">{log.date}</span>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        )}

        {/* ── Empty state (no conditions) ─────────────────────────────────── */}
        {(!user?.conditions || user.conditions.length === 0) && (
          <Card variant="default" padding="lg">
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-2xl bg-toleran-sage-50 flex items-center justify-center mx-auto mb-3">
                <Sparkles size={24} className="text-toleran-sage-500" />
              </div>
              <h3 className="text-sm font-bold text-toleran-text">Profilinizi tamamlayın</h3>
              <p className="text-xs text-toleran-muted mt-1 leading-relaxed">
                Sağlık durumlarınızı ekleyin, kişiselleştirilmiş öneriler alın.
              </p>
              <Link
                href="/profile"
                className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-toleran-sage-600"
              >
                Profili Düzenle <ChevronRight size={14} />
              </Link>
            </div>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

function getGreeting(name?: string): string {
  const hour = new Date().getHours()
  const suffix = name ? `, ${name}` : ''
  if (hour < 12) return `Günaydın${suffix} ☀️`
  if (hour < 18) return `İyi günler${suffix} 👋`
  return `İyi akşamlar${suffix} 🌙`
}
