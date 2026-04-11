'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { SafetyResultCard } from '@/components/ui/SafetyBadge'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { generateId } from '@/lib/utils'
import type { FoodAnalysis } from '@/types'
import {
  ScanLine,
  Type,
  Camera,
  Search,
  ChevronRight,
  AlertTriangle,
  Lightbulb,
  X,
  ShoppingCart,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ScanMode = 'select' | 'barcode' | 'text' | 'photo'

// ─── Mode selector ─────────────────────────────────────────────────────────────
function ModeSelector({ onSelect }: { onSelect: (mode: ScanMode) => void }) {
  const modes = [
    {
      mode: 'barcode' as ScanMode,
      icon: <ScanLine size={28} className="text-toleran-sage-600" />,
      title: 'Barkod Tara',
      desc: 'Ürün barkodunu okuyun',
      color: 'bg-toleran-sage-50 border-toleran-sage-200',
    },
    {
      mode: 'text' as ScanMode,
      icon: <Type size={28} className="text-blue-600" />,
      title: 'İçerik Listesi Yaz',
      desc: 'Ambalajdaki içerikleri yapıştırın',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      mode: 'photo' as ScanMode,
      icon: <Camera size={28} className="text-purple-600" />,
      title: 'Fotoğraf Yükle',
      desc: 'Ambalaj fotoğrafı çekin veya yükleyin',
      color: 'bg-purple-50 border-purple-200',
    },
  ]

  return (
    <div className="space-y-5 animate-fade-in-up px-4 py-6">
      <div>
        <h2 className="text-xl font-bold text-toleran-text">Ürün Analizi</h2>
        <p className="text-sm text-toleran-muted mt-1">
          Nasıl analiz yapmak istersiniz?
        </p>
      </div>

      <div className="space-y-3">
        {modes.map(({ mode, icon, title, desc, color }) => (
          <button
            key={mode}
            onClick={() => onSelect(mode)}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:shadow-card-hover text-left',
              color
            )}
          >
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-toleran-text">{title}</p>
              <p className="text-sm text-toleran-muted mt-0.5">{desc}</p>
            </div>
            <ChevronRight size={18} className="text-gray-400 shrink-0" />
          </button>
        ))}
      </div>

      <div className="bg-toleran-sage-50 rounded-xl p-4">
        <p className="text-xs text-toleran-sage-700 leading-relaxed">
          🔍 Analiz sonuçları profilinize göre kişiselleştirilir. Tüm değerlendirmeler içerik
          analizine ve yüklenen sağlık verilerinize dayanır.
        </p>
      </div>
    </div>
  )
}

// ─── Barcode scan UI (mock) ───────────────────────────────────────────────────
function BarcodeScan({ onResult }: { onResult: (barcode: string) => void }) {
  const [manual, setManual] = useState('')

  // For MVP: manual barcode entry (real camera scanning requires native module)
  return (
    <div className="px-4 py-6 space-y-5 animate-fade-in-up">
      <div className="bg-gray-900 rounded-2xl h-64 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/40" />
        {/* Viewfinder */}
        <div className="w-48 h-36 border-2 border-white rounded-xl relative">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-toleran-sage-400" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-toleran-sage-400" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-toleran-sage-400" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-toleran-sage-400" />
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-toleran-sage-400/70 animate-pulse-soft" />
        </div>
        <p className="text-white/60 text-xs mt-4 z-10">Kameradan barkod okuma web&apos;de kısıtlıdır</p>
      </div>

      <div>
        <p className="text-sm font-semibold text-toleran-text mb-2">Manuel barkod girişi</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Barkod numarası girin"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-toleran-sage-400"
          />
          <Button onClick={() => manual.trim() && onResult(manual.trim())} disabled={!manual.trim()}>
            <Search size={16} />
          </Button>
        </div>
        <p className="text-xs text-toleran-muted mt-2">
          Örnek: 8690613015602 (Türkiye), 4008814609946 (Almanya)
        </p>
      </div>

      {/* Demo barcodes */}
      <div>
        <p className="text-xs font-semibold text-toleran-muted mb-2">Demo barkodlar deneyin:</p>
        <div className="flex flex-wrap gap-2">
          {[
            { code: '8690613015602', label: 'Pınar Süt' },
            { code: '4008814609946', label: 'Schär GF Ekmek' },
            { code: '8690504035015', label: 'Ülker Bisküvi' },
          ].map(({ code, label }) => (
            <button
              key={code}
              onClick={() => onResult(code)}
              className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 text-toleran-sage-700 hover:bg-toleran-sage-50"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Text analysis UI ─────────────────────────────────────────────────────────
function TextAnalysis({ onAnalyze }: { onAnalyze: (text: string) => void }) {
  const [text, setText] = useState('')

  return (
    <div className="px-4 py-6 space-y-5 animate-fade-in-up">
      <div>
        <h3 className="text-base font-bold text-toleran-text">İçerik Listesi Analizi</h3>
        <p className="text-sm text-toleran-muted mt-1">
          Ürün ambalajındaki içerik listesini buraya yapıştırın.
        </p>
      </div>

      <Textarea
        label="İçerik listesi"
        placeholder="Örn: Buğday unu, şeker, palm yağı, tuz, yumurta, süt tozu, lesitin (soya)..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        hint="Ambalajda 'İçindekiler' veya 'Ingredients' başlığı altındaki listeyi kopyalayın"
      />

      {/* Predefined examples */}
      <div>
        <p className="text-xs font-semibold text-toleran-muted mb-2">Örnek deneyin:</p>
        <div className="space-y-1.5">
          {[
            {
              label: 'Bisküvi (Gluten)',
              text: 'Buğday unu, şeker, margarin, yumurta, malt aroması, kabartma tozu (E500)',
            },
            {
              label: 'Soya sütü (Soya)',
              text: 'Su, soya fasulyesi (%6), kalsiyum karbonat, vitamin B12, vitamin D',
            },
            {
              label: 'Peynir (Süt/Laktoz)',
              text: 'Pastörize inek sütü, laktik asit bakterileri, rennet, tuz',
            },
          ].map(({ label, text: t }) => (
            <button
              key={label}
              onClick={() => setText(t)}
              className="w-full text-left bg-white border border-gray-100 rounded-xl px-3 py-2.5 text-xs text-toleran-text hover:border-toleran-sage-200 hover:bg-toleran-sage-50 transition-colors"
            >
              <span className="font-semibold">{label}:</span>{' '}
              <span className="text-toleran-muted">{t.slice(0, 60)}…</span>
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={() => text.trim() && onAnalyze(text.trim())}
        disabled={!text.trim()}
        size="lg"
        fullWidth
      >
        <Search size={16} />
        Analiz Et
      </Button>
    </div>
  )
}

// ─── Analysis result ──────────────────────────────────────────────────────────
function AnalysisResult({
  result,
  query,
  onReset,
}: {
  result: FoodAnalysis
  query: string
  onReset: () => void
}) {
  const addToShoppingList = useAppStore((s) => s.addToShoppingList)

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-toleran-text">Analiz Sonucu</h3>
        <button
          onClick={onReset}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-toleran-muted hover:bg-gray-100"
        >
          <X size={16} />
        </button>
      </div>

      {/* Query */}
      <div className="bg-gray-50 rounded-xl px-3 py-2.5">
        <p className="text-xs text-toleran-muted">Analiz edilen:</p>
        <p className="text-sm text-toleran-text font-medium mt-0.5 line-clamp-2">{query}</p>
      </div>

      {/* Main safety result */}
      <SafetyResultCard
        level={result.safetyLevel}
        confidence={result.confidence}
        reason={result.reason}
        riskyItems={result.riskyIngredients.map((r) => `${r.name}: ${r.reason}`)}
      />

      {/* Risky ingredients detail */}
      {result.riskyIngredients.length > 0 && (
        <Card variant="default" padding="md">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-500" />
            <span className="text-sm font-semibold text-toleran-text">Riskli İçerikler</span>
          </div>
          <div className="space-y-2">
            {result.riskyIngredients.map((ri, i) => (
              <div key={i} className="flex items-start gap-2">
                <Badge
                  variant={ri.conditionType === 'allergy' ? 'danger' : 'warning'}
                  size="sm"
                  className="shrink-0 mt-0.5"
                >
                  {ri.name}
                </Badge>
                <p className="text-xs text-toleran-muted leading-relaxed">{ri.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Safe alternatives */}
      {result.safeAlternatives.length > 0 && (
        <Card variant="default" padding="md">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} className="text-toleran-sage-500" />
            <span className="text-sm font-semibold text-toleran-text">Güvenli Alternatifler</span>
          </div>
          <div className="space-y-3">
            {result.safeAlternatives.map((alt, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-toleran-sage-50 flex items-center justify-center shrink-0">
                  <span className="text-sm">✓</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-toleran-text">{alt.name}</p>
                  <p className="text-xs text-toleran-muted">{alt.purpose}</p>
                  {alt.notes && <p className="text-xs text-toleran-sage-600 mt-0.5">{alt.notes}</p>}
                </div>
                <button
                  onClick={() =>
                    addToShoppingList({
                      id: generateId('shop'),
                      name: alt.name,
                      category: 'Alternatif',
                      checked: false,
                    })
                  }
                  className="shrink-0 p-1.5 text-toleran-sage-500 hover:bg-toleran-sage-50 rounded-lg"
                  title="Alışveriş listesine ekle"
                >
                  <ShoppingCart size={14} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Brand recommendations */}
      {result.countryBrandRecommendations.length > 0 && (
        <Card variant="default" padding="md">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🏪</span>
            <span className="text-sm font-semibold text-toleran-text">Marka Önerileri</span>
          </div>
          <div className="space-y-3">
            {result.countryBrandRecommendations.map((brand, i) => (
              <div key={i} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-toleran-text">
                    {brand.brand} — {brand.product}
                  </p>
                  <Badge
                    variant={
                      brand.priceRange === 'budget'
                        ? 'success'
                        : brand.priceRange === 'mid'
                        ? 'info'
                        : 'default'
                    }
                    size="sm"
                  >
                    {brand.priceRange === 'budget' ? 'Uygun' : brand.priceRange === 'mid' ? 'Orta' : 'Yüksek'}
                  </Badge>
                </div>
                <p className="text-xs text-toleran-muted">{brand.reason}</p>
                <p className="text-xs text-toleran-sage-600 mt-1">📍 {brand.store}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Disclaimer */}
      <div className="bg-gray-50 rounded-xl p-3">
        <p className="text-xs text-toleran-muted leading-relaxed">{result.disclaimer}</p>
      </div>

      <Button onClick={onReset} variant="outline" fullWidth size="lg">
        Yeni Analiz
      </Button>
    </div>
  )
}

// ─── Main scan page ───────────────────────────────────────────────────────────
export default function ScanPage() {
  const searchParams = useSearchParams()
  const user = useAppStore((s) => s.user)
  const addRecentAnalysis = useAppStore((s) => s.addRecentAnalysis)

  const [mode, setMode] = useState<ScanMode>('select')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<FoodAnalysis | null>(null)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const m = searchParams.get('mode') as ScanMode | null
    if (m && m !== 'select') setMode(m)
  }, [searchParams])

  const analyze = async (text: string) => {
    setIsLoading(true)
    setError('')
    setQuery(text)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: text,
          userProfile: user,
          language: user?.language ?? 'tr',
        }),
      })

      if (!res.ok) throw new Error('Analysis failed')
      const data = await res.json()
      setResult(data)

      addRecentAnalysis({
        query: text.slice(0, 60),
        safetyLevel: data.safetyLevel,
        summary: data.reason,
        timestamp: new Date().toISOString(),
      })
    } catch {
      setError('Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBarcode = async (barcode: string) => {
    setIsLoading(true)
    setQuery(`Barkod: ${barcode}`)
    setError('')

    // For MVP: use Open Food Facts API directly
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      )
      const data = await res.json()

      if (data.status === 1 && data.product) {
        const product = data.product
        const ingredientsText =
          product.ingredients_text || product.ingredients_text_tr || 'İçerik bilgisi bulunamadı'
        const productName = product.product_name || `Ürün (${barcode})`
        setQuery(`${productName} — ${ingredientsText.slice(0, 100)}`)
        await analyze(`Ürün: ${productName}\nİçerikler: ${ingredientsText}`)
      } else {
        setError('Bu barkod için ürün bulunamadı. İçerik listesini manuel olarak girebilirsiniz.')
        setIsLoading(false)
      }
    } catch {
      setError('Barkod sorgulanırken hata oluştu. İçerik listesini manuel giriniz.')
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setQuery('')
    setError('')
    setMode('select')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-toleran-bg page-content">
      <Header
        title="Ürün Analizi"
        subtitle="Barkod, fotoğraf veya içerik analizi"
        showBack={mode !== 'select' && !result}
        action={
          mode !== 'select' && !result ? (
            <button
              onClick={() => setMode('select')}
              className="text-xs text-toleran-sage-600 font-medium px-2 py-1 rounded-lg hover:bg-toleran-sage-50"
            >
              Değiştir
            </button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-toleran-sage-100 flex items-center justify-center">
              <Search size={28} className="text-toleran-sage-500 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-toleran-text">Analiz ediliyor…</p>
              <p className="text-sm text-toleran-muted mt-1">Profilinizle karşılaştırılıyor</p>
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div className="px-4 py-6">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={handleReset}
                className="mt-3 text-xs font-semibold text-red-600 underline"
              >
                Yeni analiz yap
              </button>
            </div>
          </div>
        )}

        {!isLoading && !error && result && (
          <AnalysisResult result={result} query={query} onReset={handleReset} />
        )}

        {!isLoading && !error && !result && (
          <>
            {mode === 'select' && <ModeSelector onSelect={setMode} />}
            {mode === 'barcode' && <BarcodeScan onResult={handleBarcode} />}
            {mode === 'text' && <TextAnalysis onAnalyze={analyze} />}
            {mode === 'photo' && (
              <div className="px-4 py-6 space-y-4 animate-fade-in-up">
                <div>
                  <h3 className="text-base font-bold text-toleran-text">Fotoğraf Yükle</h3>
                  <p className="text-sm text-toleran-muted mt-1">
                    Ambalaj fotoğrafını seçin (OCR ile içerik listesi okunacak)
                  </p>
                </div>
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-toleran-sage-300 rounded-2xl bg-toleran-sage-50 cursor-pointer hover:bg-toleran-sage-100 transition-colors">
                  <Camera size={40} className="text-toleran-sage-400 mb-2" />
                  <p className="text-sm font-medium text-toleran-sage-700">
                    Fotoğraf seç veya çek
                  </p>
                  <p className="text-xs text-toleran-muted mt-1">JPG, PNG, HEIC desteklenir</p>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        // OCR feature - for MVP, prompt user to type ingredients
                        setMode('text')
                        setError('OCR özelliği yakında aktif olacak. Şimdilik içerikleri manuel girebilirsiniz.')
                      }
                    }}
                  />
                </label>
                <Button onClick={() => setMode('text')} variant="outline" fullWidth>
                  Manuel Giriş Yap
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
