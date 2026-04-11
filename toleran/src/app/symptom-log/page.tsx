'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { generateId, todayISO, nowTime, severityLabel, severityColor } from '@/lib/utils'
import type { SymptomLog, SymptomType } from '@/types'
import { SYMPTOM_LABELS } from '@/types'
import { Plus, Trash2, TrendingUp, X, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

const SYMPTOM_OPTIONS: SymptomType[] = [
  'bloating', 'gas', 'stomach_pain', 'nausea', 'diarrhea', 'constipation',
  'skin_rash', 'headache', 'fatigue', 'itching', 'mouth_discomfort', 'other',
]

// ─── Add log form ─────────────────────────────────────────────────────────────
function AddLogForm({ onClose }: { onClose: () => void }) {
  const addSymptomLog = useAppStore((s) => s.addSymptomLog)
  const user = useAppStore((s) => s.user)

  const [foodItem, setFoodItem] = useState('')
  const [amount, setAmount] = useState('')
  const [location, setLocation] = useState('ev')
  const [date, setDate] = useState(todayISO())
  const [time, setTime] = useState(nowTime())
  const [symptoms, setSymptoms] = useState<SymptomType[]>([])
  const [onsetTime, setOnsetTime] = useState('30')
  const [severity, setSeverity] = useState<1 | 2 | 3 | 4 | 5>(2)
  const [notes, setNotes] = useState('')

  const toggleSymptom = (s: SymptomType) => {
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  const handleSave = () => {
    if (!foodItem.trim()) return
    const log: SymptomLog = {
      id: generateId('sym'),
      userId: user?.id ?? 'local',
      date,
      time,
      foodItem: foodItem.trim(),
      amount,
      location,
      symptoms,
      onsetMinutes: parseInt(onsetTime) || 30,
      severity,
      notes,
      createdAt: new Date().toISOString(),
    }
    addSymptomLog(log)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end max-w-[480px] mx-auto">
      <div className="w-full bg-toleran-bg rounded-t-3xl max-h-[90dvh] overflow-y-auto animate-fade-in-up">
        <div className="sticky top-0 bg-toleran-bg border-b border-gray-100 flex items-center justify-between px-4 py-3 rounded-t-3xl">
          <h2 className="text-base font-bold text-toleran-text">Semptom Kaydı Ekle</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-toleran-muted hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-4 py-5 space-y-5 pb-8">
          <Input
            label="Ne yediniz / içtiniz?"
            placeholder="Örn: Makarna, pizza, süt..."
            value={foodItem}
            onChange={(e) => setFoodItem(e.target.value)}
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Miktar (isteğe bağlı)"
              placeholder="Örn: 1 porsiyon"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Select
              label="Mekan"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              options={[
                { value: 'ev', label: 'Ev' },
                { value: 'restoran', label: 'Restoran' },
                { value: 'is', label: 'İş' },
                { value: 'disa', label: 'Dışarı' },
                { value: 'market', label: 'Market' },
                { value: 'diger', label: 'Diğer' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tarih"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              label="Saat"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium text-toleran-text mb-2">
              Yaşadığınız semptomlar
            </label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_OPTIONS.map((sym) => (
                <button
                  key={sym}
                  onClick={() => toggleSymptom(sym)}
                  className={cn(
                    'text-xs font-medium px-3 py-1.5 rounded-full border-2 transition-all',
                    symptoms.includes(sym)
                      ? 'bg-amber-50 border-amber-400 text-amber-700'
                      : 'bg-white border-gray-200 text-toleran-muted hover:border-gray-300'
                  )}
                >
                  {SYMPTOM_LABELS[sym]}
                </button>
              ))}
            </div>
          </div>

          {/* Onset time */}
          <Select
            label="Semptom ne zaman başladı?"
            value={onsetTime}
            onChange={(e) => setOnsetTime(e.target.value)}
            options={[
              { value: '10', label: 'Yedikten hemen sonra (< 10 dk)' },
              { value: '30', label: '~30 dakika sonra' },
              { value: '60', label: '~1 saat sonra' },
              { value: '120', label: '~2 saat sonra' },
              { value: '360', label: '~6 saat sonra' },
              { value: '720', label: '~12 saat sonra' },
              { value: '1440', label: 'Ertesi gün' },
            ]}
          />

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-toleran-text mb-2">
              Şiddet: <span className={severityColor(severity)}>{severityLabel(severity)}</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setSeverity(n as 1 | 2 | 3 | 4 | 5)}
                  className={cn(
                    'flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all',
                    severity === n
                      ? n <= 2
                        ? 'bg-green-50 border-green-400 text-green-700'
                        : n === 3
                        ? 'bg-amber-50 border-amber-400 text-amber-700'
                        : 'bg-red-50 border-red-400 text-red-700'
                      : 'bg-white border-gray-200 text-toleran-muted'
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Not (isteğe bağlı)"
            placeholder="Ek bilgi veya gözlem..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />

          <Button
            onClick={handleSave}
            disabled={!foodItem.trim() || symptoms.length === 0}
            fullWidth
            size="lg"
          >
            Kaydet
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Log card ─────────────────────────────────────────────────────────────────
function LogCard({ log, onDelete }: { log: SymptomLog; onDelete: () => void }) {
  return (
    <Card variant="default" padding="md">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-sm font-bold text-toleran-text">{log.foodItem}</p>
          <p className="text-xs text-toleran-muted mt-0.5">
            {log.date} · {log.time} · {log.location}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn('text-xs font-bold', severityColor(log.severity))}>
            {severityLabel(log.severity)}
          </span>
          <button
            onClick={onDelete}
            className="p-1 text-gray-300 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {log.symptoms.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {log.symptoms.map((sym) => (
            <Badge key={sym} variant="warning" size="sm">
              {SYMPTOM_LABELS[sym]}
            </Badge>
          ))}
        </div>
      )}

      {log.onsetMinutes && (
        <p className="text-xs text-toleran-muted">
          ⏱ {log.onsetMinutes < 60
            ? `${log.onsetMinutes} dk sonra`
            : `${Math.round(log.onsetMinutes / 60)} saat sonra`} başladı
        </p>
      )}

      {log.notes && <p className="text-xs text-toleran-muted mt-1 italic">{log.notes}</p>}
    </Card>
  )
}

// ─── Pattern insights ─────────────────────────────────────────────────────────
function PatternInsights({ logs }: { logs: SymptomLog[] }) {
  if (logs.length < 3) return null

  // Find most common food items with symptoms
  const foodSymptomCount: Record<string, number> = {}
  logs.forEach((log) => {
    if (log.symptoms.length > 0) {
      const key = log.foodItem.toLowerCase()
      foodSymptomCount[key] = (foodSymptomCount[key] || 0) + 1
    }
  })

  const patterns = Object.entries(foodSymptomCount)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  if (patterns.length === 0) return null

  return (
    <Card variant="default" padding="md">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={16} className="text-toleran-sage-500" />
        <h3 className="text-sm font-bold text-toleran-text">Olası Örüntüler</h3>
      </div>

      <div className="bg-amber-50 rounded-xl p-3 mb-3">
        <p className="text-xs text-amber-700">
          ⚠️ Bu olası örüntülerdir, kesin tanı değildir. Sağlık uzmanınızla paylaşın.
        </p>
      </div>

      <div className="space-y-2">
        {patterns.map(([food, count]) => (
          <div key={food} className="flex items-center justify-between">
            <p className="text-sm text-toleran-text capitalize">{food}</p>
            <Badge variant="warning" size="sm">
              {count} kez semptom
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Main symptom log page ─────────────────────────────────────────────────────
export default function SymptomLogPage() {
  const symptomLogs = useAppStore((s) => s.symptomLogs)
  const removeSymptomLog = useAppStore((s) => s.removeSymptomLog)
  const [showForm, setShowForm] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | '7d' | '30d'>('all')

  const now = Date.now()
  const filteredLogs = symptomLogs.filter((log) => {
    if (activeFilter === '7d') {
      return now - new Date(log.date).getTime() < 7 * 24 * 60 * 60 * 1000
    }
    if (activeFilter === '30d') {
      return now - new Date(log.date).getTime() < 30 * 24 * 60 * 60 * 1000
    }
    return true
  })

  return (
    <div className="min-h-dvh bg-toleran-bg page-content">
      {showForm && <AddLogForm onClose={() => setShowForm(false)} />}

      <Header
        title="Semptom Günlüğü"
        subtitle="Beslenme ve reaksiyon takibi"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-toleran-sage-500 text-white text-xs font-semibold px-3 py-2 rounded-xl"
          >
            <Plus size={14} />
            Ekle
          </button>
        }
      />

      <div className="px-4 space-y-4">
        {/* Stats */}
        {symptomLogs.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <Card variant="default" padding="sm">
              <p className="text-2xl font-bold text-toleran-sage-600">{symptomLogs.length}</p>
              <p className="text-xs text-toleran-muted mt-0.5">Toplam Kayıt</p>
            </Card>
            <Card variant="default" padding="sm">
              <p className="text-2xl font-bold text-amber-600">
                {symptomLogs.filter(
                  (l) => now - new Date(l.date).getTime() < 7 * 24 * 60 * 60 * 1000
                ).length}
              </p>
              <p className="text-xs text-toleran-muted mt-0.5">Bu Hafta</p>
            </Card>
            <Card variant="default" padding="sm">
              <p className="text-2xl font-bold text-toleran-coral-500">
                {[...new Set(symptomLogs.flatMap((l) => l.symptoms))].length}
              </p>
              <p className="text-xs text-toleran-muted mt-0.5">Farklı Semptom</p>
            </Card>
          </div>
        )}

        {/* Pattern insights */}
        <PatternInsights logs={symptomLogs} />

        {/* Filter */}
        {symptomLogs.length > 0 && (
          <div className="flex gap-2">
            {[
              { key: 'all' as const, label: 'Tümü' },
              { key: '7d' as const, label: 'Son 7 gün' },
              { key: '30d' as const, label: 'Son 30 gün' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={cn(
                  'text-xs font-medium px-3 py-2 rounded-full transition-all',
                  activeFilter === key
                    ? 'bg-toleran-sage-500 text-white'
                    : 'bg-white text-toleran-muted border border-gray-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Log list */}
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 animate-fade-in-up">
            <CalendarDays size={48} className="text-toleran-sage-200 mx-auto mb-3" />
            <h3 className="font-bold text-toleran-text">Henüz kayıt yok</h3>
            <p className="text-sm text-toleran-muted mt-1 max-w-xs mx-auto leading-relaxed">
              Yediklerinizi ve sonrasında yaşadıklarınızı kaydederek örüntüleri keşfedin.
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="mt-4 mx-auto"
              size="md"
            >
              <Plus size={16} />
              İlk Kaydı Ekle
            </Button>
          </div>
        ) : (
          <div className="space-y-3 pb-6">
            {filteredLogs.map((log) => (
              <LogCard
                key={log.id}
                log={log}
                onDelete={() => removeSymptomLog(log.id)}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
