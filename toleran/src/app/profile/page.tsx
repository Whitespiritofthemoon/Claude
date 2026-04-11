'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge, ConditionBadge } from '@/components/ui/Badge'
import { Input, Select } from '@/components/ui/Input'
import { generateId, COUNTRY_NAMES } from '@/lib/utils'
import type { FoodCondition, ConditionType, DataSource } from '@/types'
import { CONDITION_TYPE_LABELS, COUNTRIES } from '@/types'
import {
  User,
  MapPin,
  Shield,
  Plus,
  Trash2,
  ShoppingCart,
  Crown,
  X,
  ChevronRight,
  AlertTriangle,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Add condition form ────────────────────────────────────────────────────────
function AddConditionForm({
  onSave,
  onClose,
}: {
  onSave: (condition: FoodCondition) => void
  onClose: () => void
}) {
  const [type, setType] = useState<ConditionType>('intolerance')
  const [foodItem, setFoodItem] = useState('')
  const [severity, setSeverity] = useState('moderate')
  const [dataSource, setDataSource] = useState<DataSource>('user_declaration')

  const handleSave = () => {
    if (!foodItem.trim()) return
    onSave({
      id: generateId('cond'),
      type,
      foodItem: foodItem.trim(),
      foodAliases: [],
      severity: severity as FoodCondition['severity'],
      dataSource,
      confidence: dataSource === 'doctor_diagnosis' ? 'high' : dataSource === 'lab_test' ? 'high' : 'low',
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end max-w-[480px] mx-auto">
      <div className="w-full bg-toleran-bg rounded-t-3xl animate-fade-in-up">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-bold text-toleran-text">Durum Ekle</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-toleran-muted hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        <div className="px-4 py-5 space-y-4 pb-8">
          <Select
            label="Durum türü"
            value={type}
            onChange={(e) => setType(e.target.value as ConditionType)}
            options={Object.entries(CONDITION_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
          />

          <Input
            label="Besin adı"
            placeholder="Örn: süt, buğday, yumurta"
            value={foodItem}
            onChange={(e) => setFoodItem(e.target.value)}
            autoFocus
          />

          <Select
            label="Şiddet"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            options={[
              { value: 'mild', label: 'Hafif' },
              { value: 'moderate', label: 'Orta' },
              { value: 'severe', label: 'Şiddetli' },
              { value: 'anaphylactic', label: 'Anafilaktik (acil risk)' },
            ]}
          />

          <Select
            label="Veri kaynağı"
            value={dataSource}
            onChange={(e) => setDataSource(e.target.value as DataSource)}
            options={[
              { value: 'user_declaration', label: 'Kendi bildirimi' },
              { value: 'doctor_diagnosis', label: 'Doktor tanısı' },
              { value: 'lab_test', label: 'Laboratuvar testi' },
              { value: 'commercial_test', label: 'Ticari intolerans testi' },
            ]}
          />

          {(type === 'allergy' || severity === 'anaphylactic') && (
            <div className="bg-red-50 rounded-xl p-3 flex gap-2">
              <AlertTriangle size={15} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">
                Alerji veya anafilaktik reaksiyon bildirimi yüksek güvenlik uyarısı oluşturur.
                Bu bilgiyi yalnızca doktor tanılı durumlar için kullanın.
              </p>
            </div>
          )}

          <Button onClick={handleSave} disabled={!foodItem.trim()} fullWidth size="lg">
            <Check size={16} />
            Ekle
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Subscription banner ───────────────────────────────────────────────────────
function SubscriptionBanner({ plan }: { plan: string }) {
  if (plan === 'premium' || plan === 'family' || plan === 'expert') {
    return (
      <div className="bg-gradient-to-r from-toleran-sage-500 to-toleran-sage-600 rounded-2xl p-4 flex items-center gap-3">
        <Crown size={24} className="text-yellow-300 shrink-0" />
        <div>
          <p className="text-white font-bold text-sm capitalize">{plan} Plan</p>
          <p className="text-white/80 text-xs">Tüm özellikler aktif</p>
        </div>
      </div>
    )
  }

  return (
    <Card variant="default" padding="md">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <Crown size={20} className="text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-toleran-text">Premium&apos;a Geç</p>
          <p className="text-xs text-toleran-muted mt-0.5">
            Sınırsız sohbet, barkod tarama, semptom analizi ve daha fazlası
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {['Sınırsız sohbet', 'Barkod tarama', '7 günlük plan', 'Ülke markaları'].map((f) => (
              <Badge key={f} variant="sage" size="sm">✓ {f}</Badge>
            ))}
          </div>
        </div>
      </div>
      <Button className="mt-3" variant="secondary" size="sm" fullWidth>
        149₺/ay ile başla
        <ChevronRight size={14} />
      </Button>
    </Card>
  )
}

// ─── Shopping list section ────────────────────────────────────────────────────
function ShoppingListSection() {
  const shoppingList = useAppStore((s) => s.shoppingList)
  const toggleShoppingItem = useAppStore((s) => s.toggleShoppingItem)
  const removeFromShoppingList = useAppStore((s) => s.removeFromShoppingList)
  const clearShoppingList = useAppStore((s) => s.clearShoppingList)

  if (shoppingList.length === 0) {
    return (
      <Card variant="default" padding="md">
        <div className="flex items-center gap-2 mb-2">
          <ShoppingCart size={16} className="text-toleran-sage-500" />
          <h3 className="text-sm font-bold text-toleran-text">Alışveriş Listesi</h3>
        </div>
        <p className="text-xs text-toleran-muted">
          Tarif malzemeleri veya alternatif ürünler buraya eklenir.
        </p>
      </Card>
    )
  }

  const unchecked = shoppingList.filter((i) => !i.checked)
  const checked = shoppingList.filter((i) => i.checked)

  return (
    <Card variant="default" padding="md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShoppingCart size={16} className="text-toleran-sage-500" />
          <h3 className="text-sm font-bold text-toleran-text">Alışveriş Listesi</h3>
          <Badge variant="sage" size="sm">{unchecked.length}</Badge>
        </div>
        {checked.length > 0 && (
          <button
            onClick={clearShoppingList}
            className="text-xs text-red-400 hover:text-red-600"
          >
            Tümünü Temizle
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {shoppingList.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-3 py-2 border-b border-gray-50 last:border-0',
              item.checked && 'opacity-50'
            )}
          >
            <button
              onClick={() => toggleShoppingItem(item.id)}
              className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                item.checked
                  ? 'bg-toleran-sage-500 border-toleran-sage-500'
                  : 'border-gray-300'
              )}
            >
              {item.checked && <Check size={10} className="text-white" strokeWidth={3} />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm text-toleran-text', item.checked && 'line-through')}>
                {item.name}
              </p>
              {item.amount && (
                <p className="text-xs text-toleran-muted">{item.amount}</p>
              )}
            </div>
            <button
              onClick={() => removeFromShoppingList(item.id)}
              className="p-1 text-gray-300 hover:text-red-400"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Main profile page ────────────────────────────────────────────────────────
export default function ProfilePage() {
  const user = useAppStore((s) => s.user)
  const updateUser = useAppStore((s) => s.updateUser)
  const clearUser = useAppStore((s) => s.clearUser)
  const router = useRouter()

  const [showAddCondition, setShowAddCondition] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'conditions' | 'shopping'>('profile')

  const handleAddCondition = (condition: FoodCondition) => {
    const updated = [...(user?.conditions ?? []), condition]
    updateUser({ conditions: updated })
    setShowAddCondition(false)
  }

  const handleRemoveCondition = (id: string) => {
    const updated = (user?.conditions ?? []).filter((c) => c.id !== id)
    updateUser({ conditions: updated })
  }

  const handleReset = () => {
    if (confirm('Profil verileriniz silinecek. Emin misiniz?')) {
      clearUser()
      router.replace('/onboarding')
    }
  }

  if (!user) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <p className="text-toleran-muted">Profil bulunamadı</p>
          <Button onClick={() => router.push('/onboarding')} className="mt-4">
            Profil Oluştur
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-toleran-bg page-content">
      {showAddCondition && (
        <AddConditionForm
          onSave={handleAddCondition}
          onClose={() => setShowAddCondition(false)}
        />
      )}

      <Header title="Profil" subtitle="Kişisel beslenme profiliniz" />

      {/* Tabs */}
      <div className="px-4 py-3">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {([
            { key: 'profile' as const, label: 'Profil' },
            { key: 'conditions' as const, label: 'Durumlar' },
            { key: 'shopping' as const, label: 'Alışveriş' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                'flex-1 rounded-lg py-2 text-xs font-semibold transition-all',
                activeTab === key
                  ? 'bg-white text-toleran-sage-700 shadow-sm'
                  : 'text-toleran-muted'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-4 pb-8">
        {/* Profile tab */}
        {activeTab === 'profile' && (
          <>
            {/* User card */}
            <Card variant="default" padding="lg">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-toleran-sage-100 flex items-center justify-center shrink-0">
                  <span className="text-2xl font-bold text-toleran-sage-700">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-toleran-text">{user.name}</h2>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={13} className="text-toleran-muted" />
                    <span className="text-sm text-toleran-muted">
                      {user.city ? `${user.city}, ` : ''}{COUNTRY_NAMES[user.country] ?? user.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="sage" size="sm">
                      {user.language === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
                    </Badge>
                    <Badge variant="default" size="sm">
                      {user.age} yaş
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Info rows */}
            <Card variant="default" padding="md">
              <h3 className="text-sm font-bold text-toleran-text mb-3 flex items-center gap-2">
                <User size={16} className="text-toleran-sage-500" />
                Bilgiler
              </h3>
              {[
                { label: 'Beslenme tercihi', value: {
                  omnivore: 'Her şey yiyor',
                  vegetarian: 'Vejetaryen',
                  vegan: 'Vegan',
                  pescatarian: 'Pesketaryen',
                  other: 'Diğer',
                }[user.dietaryPreference] ?? user.dietaryPreference },
                { label: 'Abonelik', value: {
                  free: 'Ücretsiz',
                  premium: 'Premium',
                  family: 'Aile',
                  expert: 'Uzman',
                }[user.subscriptionPlan] ?? user.subscriptionPlan },
                { label: 'Ülke', value: COUNTRY_NAMES[user.country] ?? user.country },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-toleran-muted">{label}</span>
                  <span className="text-sm font-medium text-toleran-text">{value}</span>
                </div>
              ))}
            </Card>

            {/* Subscription */}
            <SubscriptionBanner plan={user.subscriptionPlan} />

            {/* Danger zone */}
            <Card variant="default" padding="md">
              <h3 className="text-sm font-bold text-red-600 mb-3">Tehlikeli Alan</h3>
              <Button onClick={handleReset} variant="danger" size="sm" fullWidth>
                Profili Sıfırla ve Yeniden Başla
              </Button>
              <p className="text-xs text-toleran-muted mt-2 text-center">
                Bu işlem tüm verilerinizi siler.
              </p>
            </Card>
          </>
        )}

        {/* Conditions tab */}
        {activeTab === 'conditions' && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-toleran-text">Sağlık Durumları</h3>
                <p className="text-xs text-toleran-muted mt-0.5">
                  {user.conditions.length} durum kayıtlı
                </p>
              </div>
              <button
                onClick={() => setShowAddCondition(true)}
                className="flex items-center gap-1 bg-toleran-sage-500 text-white text-xs font-semibold px-3 py-2 rounded-xl"
              >
                <Plus size={14} />
                Ekle
              </button>
            </div>

            {user.conditions.length === 0 ? (
              <Card variant="default" padding="lg">
                <div className="text-center py-4">
                  <Shield size={36} className="text-toleran-sage-200 mx-auto mb-2" />
                  <p className="text-sm font-medium text-toleran-text">Henüz durum eklenmedi</p>
                  <p className="text-xs text-toleran-muted mt-1">
                    Alerji, intolerans veya diğer durumlarınızı ekleyin.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-2">
                {user.conditions.map((cond) => (
                  <Card key={cond.id} variant="default" padding="md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-bold text-toleran-text">
                            {cond.foodItem}
                          </span>
                          <ConditionBadge type={cond.type} />
                          {cond.severity === 'anaphylactic' && (
                            <Badge variant="danger" size="sm">⚠️ Anafilaktik</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-toleran-muted capitalize">
                            Şiddet: {cond.severity}
                          </span>
                          <span className="text-xs text-toleran-muted">·</span>
                          <span className="text-xs text-toleran-muted capitalize">
                            Kaynak: {cond.dataSource.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveCondition(cond.id)}
                        className="p-1.5 text-gray-300 hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="bg-toleran-sage-50 rounded-xl p-4">
              <p className="text-xs text-toleran-sage-700 leading-relaxed">
                🔒 Verileriniz yalnızca cihazınızda saklanır. Daha doğru sonuçlar için doktor
                tanılarınızı veya test raporlarınızı da ekleyebilirsiniz.
              </p>
            </div>
          </>
        )}

        {/* Shopping tab */}
        {activeTab === 'shopping' && <ShoppingListSection />}
      </div>

      <BottomNav />
    </div>
  )
}
