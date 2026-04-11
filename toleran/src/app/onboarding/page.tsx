'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { generateId } from '@/lib/utils'
import type { UserProfile, FoodCondition, ConditionType } from '@/types'
import { COUNTRIES } from '@/types'
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Leaf,
  AlertTriangle,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const TOTAL_STEPS = 6

// ─── Step components ──────────────────────────────────────────────────────────

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-6 animate-fade-in-up">
      <div className="w-24 h-24 rounded-3xl bg-toleran-sage-500 flex items-center justify-center shadow-float">
        <span className="text-white font-bold text-5xl">T</span>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-toleran-sage-700">Hoş geldiniz!</h1>
        <p className="text-toleran-muted text-sm leading-relaxed max-w-xs">
          Toleran, beslenme kısıtlamalarınıza göre kişiselleştirilmiş karar desteği sunar.
        </p>
      </div>

      <div className="w-full space-y-3">
        {[
          { icon: '🔍', text: 'Ürün ve içerik analizi' },
          { icon: '🤖', text: '7/24 AI sohbet asistanı' },
          { icon: '🌍', text: 'Ülkenize göre marka önerileri' },
          { icon: '📖', text: 'Kişiye özel tarif önerileri' },
        ].map((item) => (
          <div
            key={item.text}
            className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-card text-left"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm font-medium text-toleran-text">{item.text}</span>
          </div>
        ))}
      </div>

      <div className="bg-toleran-sage-50 rounded-xl p-4 text-left">
        <div className="flex items-start gap-2">
          <Info size={16} className="text-toleran-sage-600 shrink-0 mt-0.5" />
          <p className="text-xs text-toleran-sage-700 leading-relaxed">
            Toleran tanı koymaz. Yüklediğiniz veriler ve içerik analizine dayanarak beslenme
            kararlarınıza destek verir.
          </p>
        </div>
      </div>

      <Button onClick={onNext} size="xl" fullWidth>
        Başlayalım
        <ChevronRight size={18} />
      </Button>
    </div>
  )
}

function StepBasicInfo({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: { name: string; age: string; gender: string }
  onChange: (k: string, v: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const valid = data.name.trim().length > 1 && data.age && data.gender

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-bold text-toleran-text">Sizi tanıyalım</h2>
        <p className="text-sm text-toleran-muted mt-1">
          Bu bilgiler kişiselleştirilmiş öneriler için kullanılır.
        </p>
      </div>

      <Input
        label="Adınız"
        placeholder="Adınızı girin"
        value={data.name}
        onChange={(e) => onChange('name', e.target.value)}
        autoFocus
      />

      <Input
        label="Yaşınız"
        type="number"
        placeholder="Örn: 32"
        min="1"
        max="120"
        value={data.age}
        onChange={(e) => onChange('age', e.target.value)}
      />

      <div>
        <label className="block text-sm font-medium text-toleran-text mb-1.5">Cinsiyet</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'female', label: 'Kadın' },
            { value: 'male', label: 'Erkek' },
            { value: 'other', label: 'Diğer' },
            { value: 'prefer_not_to_say', label: 'Belirtmek istemiyorum' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange('gender', opt.value)}
              className={cn(
                'rounded-xl px-3 py-3 text-sm font-medium text-left transition-all border-2',
                data.gender === opt.value
                  ? 'bg-toleran-sage-50 border-toleran-sage-400 text-toleran-sage-700'
                  : 'bg-white border-gray-200 text-toleran-muted hover:border-toleran-sage-200'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} size="lg">
          <ChevronLeft size={16} />
          Geri
        </Button>
        <Button onClick={onNext} size="lg" fullWidth disabled={!valid}>
          Devam
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}

function StepLocation({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: { country: string; city: string; language: string }
  onChange: (k: string, v: string) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-bold text-toleran-text">Nerede yaşıyorsunuz?</h2>
        <p className="text-sm text-toleran-muted mt-1">
          Bulunduğunuz ülkeye göre marka ve market önerileri yapalım.
        </p>
      </div>

      <Select
        label="Ülke"
        value={data.country}
        onChange={(e) => onChange('country', e.target.value)}
        options={COUNTRIES.map((c) => ({ value: c.code, label: c.nameTr }))}
      />

      <Input
        label="Şehir (isteğe bağlı)"
        placeholder="Örn: İstanbul"
        value={data.city}
        onChange={(e) => onChange('city', e.target.value)}
      />

      <div>
        <label className="block text-sm font-medium text-toleran-text mb-1.5">
          Tercih ettiğiniz dil
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'tr', label: '🇹🇷 Türkçe' },
            { value: 'en', label: '🇬🇧 English' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange('language', opt.value)}
              className={cn(
                'rounded-xl px-3 py-3 text-sm font-medium text-center transition-all border-2',
                data.language === opt.value
                  ? 'bg-toleran-sage-50 border-toleran-sage-400 text-toleran-sage-700'
                  : 'bg-white border-gray-200 text-toleran-muted hover:border-toleran-sage-200'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} size="lg">
          <ChevronLeft size={16} />
          Geri
        </Button>
        <Button onClick={onNext} size="lg" fullWidth>
          Devam
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}

function StepDiet({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: string
  onChange: (v: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const options = [
    { value: 'omnivore', label: 'Her şey yiyorum', sub: 'Et, balık, süt ve bitkisel ürünler' },
    { value: 'vegetarian', label: 'Vejetaryen', sub: 'Et yemiyorum, süt ve yumurta yiyorum' },
    { value: 'vegan', label: 'Vegan', sub: 'Hiçbir hayvansal ürün tüketmiyorum' },
    { value: 'pescatarian', label: 'Pesketaryen', sub: 'Balık yiyorum, et yemiyorum' },
    { value: 'other', label: 'Diğer', sub: 'Başka bir beslenme şeklim var' },
  ]

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-bold text-toleran-text">Beslenme tercihiniz</h2>
        <p className="text-sm text-toleran-muted mt-1">
          Tarif ve önerilerinizi buna göre uyarlayalım.
        </p>
      </div>

      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'w-full rounded-xl px-4 py-3.5 text-left transition-all border-2',
              value === opt.value
                ? 'bg-toleran-sage-50 border-toleran-sage-400'
                : 'bg-white border-gray-200 hover:border-toleran-sage-200'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={cn(
                    'text-sm font-semibold',
                    value === opt.value ? 'text-toleran-sage-700' : 'text-toleran-text'
                  )}
                >
                  {opt.label}
                </p>
                <p className="text-xs text-toleran-muted mt-0.5">{opt.sub}</p>
              </div>
              {value === opt.value && (
                <CheckCircle2 size={20} className="text-toleran-sage-500 shrink-0" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} size="lg">
          <ChevronLeft size={16} />
          Geri
        </Button>
        <Button onClick={onNext} size="lg" fullWidth disabled={!value}>
          Devam
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}

function StepConditions({
  conditions,
  onChange,
  onNext,
  onBack,
}: {
  conditions: Array<{ type: ConditionType; foodItem: string; severity: string; dataSource: string }>
  onChange: (conditions: Array<{ type: ConditionType; foodItem: string; severity: string; dataSource: string }>) => void
  onNext: () => void
  onBack: () => void
}) {
  const [selected, setSelected] = useState<ConditionType[]>(
    conditions.map((c) => c.type).filter((v, i, a) => a.indexOf(v) === i)
  )
  const [adding, setAdding] = useState<{ type: ConditionType; food: string; severity: string } | null>(null)
  const [localConditions, setLocalConditions] = useState(conditions)

  const toggleType = (type: ConditionType) => {
    setSelected((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const addCondition = () => {
    if (!adding || !adding.food.trim()) return
    const newCond = {
      type: adding.type,
      foodItem: adding.food.trim(),
      severity: adding.severity || 'moderate',
      dataSource: 'user_declaration',
    }
    const updated = [...localConditions, newCond]
    setLocalConditions(updated)
    onChange(updated)
    setAdding(null)
  }

  const typeOptions: Array<{ type: ConditionType; label: string; desc: string; color: string }> = [
    { type: 'allergy', label: 'Alerji', desc: 'Bağışıklık sistemi reaksiyonu', color: 'border-red-300 bg-red-50 text-red-700' },
    { type: 'intolerance', label: 'İntolerans', desc: 'Sindirim sistemi sorunu', color: 'border-amber-300 bg-amber-50 text-amber-700' },
    { type: 'celiac', label: 'Çölyak', desc: 'Gluten otoimmün hastalığı', color: 'border-red-300 bg-red-50 text-red-700' },
    { type: 'sensitivity', label: 'Hassasiyet', desc: 'Bireysel duyarlılık', color: 'border-amber-300 bg-amber-50 text-amber-700' },
    { type: 'fodmap', label: 'FODMAP', desc: 'Fermente karbonhidrat hassasiyeti', color: 'border-blue-300 bg-blue-50 text-blue-700' },
  ]

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-bold text-toleran-text">Sağlık durumunuz</h2>
        <p className="text-sm text-toleran-muted mt-1">
          Hangi durum(lar) sizin için geçerli? (birden fazla seçebilirsiniz)
        </p>
      </div>

      <div className="space-y-2">
        {typeOptions.map(({ type, label, desc, color }) => (
          <button
            key={type}
            onClick={() => toggleType(type)}
            className={cn(
              'w-full rounded-xl px-4 py-3 text-left transition-all border-2 flex items-center justify-between',
              selected.includes(type)
                ? color
                : 'bg-white border-gray-200 hover:border-gray-300'
            )}
          >
            <div>
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs opacity-80 mt-0.5">{desc}</p>
            </div>
            {selected.includes(type) && (
              <CheckCircle2 size={18} className="shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Add specific foods */}
      {selected.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-toleran-text">Hangi besinler?</p>
            <button
              onClick={() => setAdding({ type: selected[0], food: '', severity: 'moderate' })}
              className="text-xs text-toleran-sage-600 font-medium"
            >
              + Ekle
            </button>
          </div>

          {localConditions.length > 0 && (
            <div className="space-y-1.5">
              {localConditions.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 border border-gray-100"
                >
                  <div>
                    <span className="text-sm font-medium text-toleran-text">{c.foodItem}</span>
                    <span className="ml-2 text-xs text-toleran-muted">({c.type})</span>
                  </div>
                  <button
                    onClick={() => {
                      const updated = localConditions.filter((_, idx) => idx !== i)
                      setLocalConditions(updated)
                      onChange(updated)
                    }}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
          )}

          {adding && (
            <div className="mt-3 bg-toleran-sage-50 rounded-xl p-4 space-y-3 border border-toleran-sage-200">
              <Select
                label="Durum türü"
                value={adding.type}
                onChange={(e) => setAdding({ ...adding, type: e.target.value as ConditionType })}
                options={typeOptions.map((t) => ({ value: t.type, label: t.label }))}
              />
              <Input
                label="Besin adı"
                placeholder="Örn: süt, buğday, yumurta"
                value={adding.food}
                onChange={(e) => setAdding({ ...adding, food: e.target.value })}
                autoFocus
              />
              <Select
                label="Şiddet"
                value={adding.severity}
                onChange={(e) => setAdding({ ...adding, severity: e.target.value })}
                options={[
                  { value: 'mild', label: 'Hafif' },
                  { value: 'moderate', label: 'Orta' },
                  { value: 'severe', label: 'Şiddetli' },
                  { value: 'anaphylactic', label: 'Anafilaktik (Hayati risk)' },
                ]}
              />
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setAdding(null)} fullWidth>
                  İptal
                </Button>
                <Button size="sm" onClick={addCondition} fullWidth disabled={!adding.food.trim()}>
                  Ekle
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-amber-50 rounded-xl p-3 flex gap-2">
        <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">
          Bu bilgileri daha sonra profilinizde güncelleyebilir, test sonuçlarınızı da
          yükleyebilirsiniz.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} size="lg">
          <ChevronLeft size={16} />
          Geri
        </Button>
        <Button onClick={onNext} size="lg" fullWidth>
          Devam
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}

function StepGoal({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: string
  onChange: (v: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const goals = [
    { value: 'product_check', label: 'Ürün kontrolü', emoji: '🔍', sub: 'Barkod tarama ve içerik analizi' },
    { value: 'recipe', label: 'Tarif bulmak', emoji: '📖', sub: 'Kısıtlamalarıma uygun yemekler' },
    { value: 'symptom', label: 'Semptom takibi', emoji: '📊', sub: 'Yediklerim ve reaksiyonlarım' },
    { value: 'shopping', label: 'Alışveriş', emoji: '🛒', sub: 'Güvenli ürün ve marka önerileri' },
    { value: 'chat', label: 'Hızlı soru-cevap', emoji: '💬', sub: 'Her an beslenme soruları sormak' },
    { value: 'all', label: 'Hepsi', emoji: '✨', sub: 'Tüm özellikleri kullanmak istiyorum' },
  ]

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-bold text-toleran-text">Toleran&apos;ı ne için kullanacaksınız?</h2>
        <p className="text-sm text-toleran-muted mt-1">
          Buna göre ana sayfanızı kişiselleştirelim.
        </p>
      </div>

      <div className="space-y-2">
        {goals.map((goal) => (
          <button
            key={goal.value}
            onClick={() => onChange(goal.value)}
            className={cn(
              'w-full rounded-xl px-4 py-3.5 text-left transition-all border-2 flex items-center gap-3',
              value === goal.value
                ? 'bg-toleran-sage-50 border-toleran-sage-400'
                : 'bg-white border-gray-200 hover:border-toleran-sage-200'
            )}
          >
            <span className="text-2xl shrink-0">{goal.emoji}</span>
            <div className="min-w-0">
              <p
                className={cn(
                  'text-sm font-semibold',
                  value === goal.value ? 'text-toleran-sage-700' : 'text-toleran-text'
                )}
              >
                {goal.label}
              </p>
              <p className="text-xs text-toleran-muted">{goal.sub}</p>
            </div>
            {value === goal.value && (
              <CheckCircle2 size={18} className="text-toleran-sage-500 shrink-0 ml-auto" />
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} size="lg">
          <ChevronLeft size={16} />
          Geri
        </Button>
        <Button onClick={onNext} size="lg" fullWidth disabled={!value}>
          Profili Tamamla
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}

// ─── Main onboarding page ─────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const { setUser } = useAppStore()

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [country, setCountry] = useState('TR')
  const [city, setCity] = useState('')
  const [language, setLanguage] = useState('tr')
  const [diet, setDiet] = useState('omnivore')
  const [conditions, setConditions] = useState<
    Array<{ type: ConditionType; foodItem: string; severity: string; dataSource: string }>
  >([])
  const [goal, setGoal] = useState('')

  const progress = ((step) / (TOTAL_STEPS - 1)) * 100

  const handleComplete = () => {
    const foodConditions: FoodCondition[] = conditions.map((c) => ({
      id: generateId('cond'),
      type: c.type,
      foodItem: c.foodItem,
      foodAliases: [],
      severity: c.severity as FoodCondition['severity'],
      dataSource: 'user_declaration',
      confidence: 'low',
      createdAt: new Date().toISOString(),
    }))

    const user: UserProfile = {
      id: generateId('usr'),
      name: name.trim(),
      age: parseInt(age) || 30,
      gender: gender as UserProfile['gender'],
      country,
      city,
      language: language as 'tr' | 'en',
      dietaryPreference: diet as UserProfile['dietaryPreference'],
      conditions: foodConditions,
      childProfiles: [],
      isPregnant: false,
      chronicConditions: [],
      symptomGoals: [],
      subscriptionPlan: 'free',
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
    }

    setUser(user)
    router.replace('/home')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-toleran-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-toleran-sage-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="text-base font-bold text-toleran-sage-700">toleran</span>
        </div>
        {step > 0 && (
          <span className="text-xs text-toleran-muted font-medium">
            {step}/{TOTAL_STEPS - 1}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {step > 0 && (
        <div className="px-4 mb-2">
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="step-card">
          {step === 0 && <StepWelcome onNext={() => setStep(1)} />}
          {step === 1 && (
            <StepBasicInfo
              data={{ name, age, gender }}
              onChange={(k, v) => {
                if (k === 'name') setName(v)
                if (k === 'age') setAge(v)
                if (k === 'gender') setGender(v)
              }}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <StepLocation
              data={{ country, city, language }}
              onChange={(k, v) => {
                if (k === 'country') setCountry(v)
                if (k === 'city') setCity(v)
                if (k === 'language') setLanguage(v)
              }}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepDiet
              value={diet}
              onChange={setDiet}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <StepConditions
              conditions={conditions}
              onChange={setConditions}
              onNext={() => setStep(5)}
              onBack={() => setStep(3)}
            />
          )}
          {step === 5 && (
            <StepGoal
              value={goal}
              onChange={setGoal}
              onNext={handleComplete}
              onBack={() => setStep(4)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
