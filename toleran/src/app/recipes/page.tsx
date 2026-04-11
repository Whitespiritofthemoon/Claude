'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Recipe, RecipeCategory } from '@/types'
import { RECIPE_CATEGORY_LABELS } from '@/types'
import { Clock, ChefHat, DollarSign, Heart, ShoppingCart, X, Users } from 'lucide-react'
import { generateId } from '@/lib/utils'
import { cn } from '@/lib/utils'

// ─── Static recipe data (MVP) ──────────────────────────────────────────────────
const STATIC_RECIPES: Recipe[] = [
  {
    id: 'r1',
    name: 'Sütsüz Muzlu Yulaf',
    category: 'breakfast',
    duration: 10,
    difficulty: 'easy',
    costLevel: 'budget',
    servings: 1,
    emoji: '🥣',
    ingredients: [
      { name: 'Yulaf ezmesi', amount: '60', unit: 'g', isOptional: false },
      { name: 'Yulaf sütü', amount: '200', unit: 'ml', isOptional: false, alternatives: ['Badem sütü', 'Soya sütü'] },
      { name: 'Muz', amount: '1', unit: 'adet', isOptional: false },
      { name: 'Tarçın', amount: '1', unit: 'tutam', isOptional: true },
      { name: 'Chia tohumu', amount: '1', unit: 'yemek kaşığı', isOptional: true },
    ],
    steps: [
      'Yulaf sütünü orta ateşte ısıtın.',
      'Yulaf ezmesini ekleyin ve 3-4 dakika karıştırarak pişirin.',
      'Muzu dilimleyin ve üzerine koyun.',
      'İsteğe göre tarçın ve chia tohumu ekleyin.',
    ],
    substitutions: [
      { original: 'Yulaf sütü', substitute: 'Badem sütü', notes: '1:1 oranında kullanın', purpose: 'dairy_free' },
      { original: 'Yulaf sütü', substitute: 'Soya sütü', notes: 'Hafif farklı tat verir', purpose: 'dairy_free' },
    ],
    tags: ['hızlı', 'sağlıklı', 'vejetaryen'],
    suitableFor: ['lactose_free', 'dairy_free', 'egg_free'],
  },
  {
    id: 'r2',
    name: 'Glutensiz Kırmızı Mercimek Çorbası',
    category: 'lunch',
    duration: 25,
    difficulty: 'easy',
    costLevel: 'budget',
    servings: 4,
    emoji: '🍲',
    ingredients: [
      { name: 'Kırmızı mercimek', amount: '200', unit: 'g', isOptional: false },
      { name: 'Soğan', amount: '1', unit: 'adet', isOptional: false },
      { name: 'Havuç', amount: '1', unit: 'adet', isOptional: true },
      { name: 'Zeytinyağı', amount: '2', unit: 'yemek kaşığı', isOptional: false },
      { name: 'Tuz, karabiber, kimyon', amount: '', unit: '', isOptional: false },
      { name: 'Et veya sebze suyu', amount: '1', unit: 'litre', isOptional: false, alternatives: ['Su'] },
    ],
    steps: [
      'Zeytinyağında doğranmış soğanı kavurun.',
      'Havuç ve mercimeği ekleyip 2 dakika kavurun.',
      'Et suyunu ekleyin ve 20 dakika kısık ateşte pişirin.',
      'Blender ile pürüzsüz hale getirin.',
      'Tuz, karabiber ve kimyon ile tatlandırın.',
    ],
    substitutions: [
      { original: 'Et suyu', substitute: 'Sebze suyu veya su', notes: 'Vegan seçenek için', purpose: 'vegan' },
    ],
    tags: ['glutensiz', 'vegan', 'protein'],
    suitableFor: ['gluten_free', 'celiac', 'dairy_free', 'egg_free', 'vegan'],
  },
  {
    id: 'r3',
    name: 'Avokado Tost (Glutensiz Ekmek)',
    category: 'breakfast',
    duration: 8,
    difficulty: 'easy',
    costLevel: 'mid',
    servings: 1,
    emoji: '🥑',
    ingredients: [
      { name: 'Glutensiz ekmek', amount: '2', unit: 'dilim', isOptional: false },
      { name: 'Avokado', amount: '1', unit: 'adet', isOptional: false },
      { name: 'Limon suyu', amount: '1', unit: 'yemek kaşığı', isOptional: false },
      { name: 'Tuz, karabiber', amount: '', unit: '', isOptional: false },
      { name: 'Kırmızı pul biber', amount: '', unit: '', isOptional: true },
    ],
    steps: [
      'Glutensiz ekmeği kızartın.',
      'Avokadoyu ezip limon suyu, tuz ve karabiberle karıştırın.',
      'Ekmekler üzerine avokado karışımını sürün.',
      'İsteğe göre kırmızı biber serpin.',
    ],
    substitutions: [],
    tags: ['glutensiz', 'vegan', 'hızlı'],
    suitableFor: ['gluten_free', 'celiac', 'dairy_free', 'egg_free', 'vegan'],
  },
  {
    id: 'r4',
    name: 'Yumurtasız Çikolatalı Kurabiye',
    category: 'dessert',
    duration: 25,
    difficulty: 'medium',
    costLevel: 'mid',
    servings: 12,
    emoji: '🍪',
    ingredients: [
      { name: 'Un (veya glutensiz un)', amount: '200', unit: 'g', isOptional: false, alternatives: ['Glutensiz un karışımı'] },
      { name: 'Şeker', amount: '80', unit: 'g', isOptional: false },
      { name: 'Kakao', amount: '30', unit: 'g', isOptional: false },
      { name: 'Hindistancevizi yağı', amount: '80', unit: 'ml', isOptional: false, alternatives: ['Tereyağı'] },
      { name: 'Bitki bazlı süt', amount: '3', unit: 'yemek kaşığı', isOptional: false },
      { name: 'Kabartma tozu', amount: '1', unit: 'çay kaşığı', isOptional: false },
      { name: 'Tuz', amount: '1', unit: 'tutam', isOptional: false },
    ],
    steps: [
      'Fırını 180°C&apos;ye ısıtın.',
      'Kuru malzemeleri bir kapta karıştırın.',
      'Hindistancevizi yağını eritin, bitki bazlı sütle karıştırın.',
      'Kuru ve yaş malzemeleri birleştirip hamur yoğurun.',
      'Fırın kağıdına yuvarlak toplar yapın.',
      '12-15 dakika pişirin.',
    ],
    substitutions: [
      { original: 'Yumurta', substitute: 'Keten tohumu jeli (1 yemek kaşığı öğütülmüş keten + 3 yemek kaşığı su)', notes: '5 dakika bekletin', purpose: 'egg_free' },
      { original: 'Un', substitute: 'Glutensiz un karışımı', notes: '1:1 oranında kullanın', purpose: 'gluten_free' },
      { original: 'Hindistancevizi yağı', substitute: 'Margarin', notes: 'Sert margarin kullanın', purpose: 'budget' },
    ],
    tags: ['yumurtasız', 'vegan', 'tatlı'],
    suitableFor: ['egg_free', 'dairy_free', 'vegan'],
  },
  {
    id: 'r5',
    name: 'Protein Kasesi (Tavuk + Kinoa)',
    category: 'lunch',
    duration: 30,
    difficulty: 'medium',
    costLevel: 'mid',
    servings: 2,
    emoji: '🥗',
    ingredients: [
      { name: 'Kinoa', amount: '150', unit: 'g', isOptional: false },
      { name: 'Tavuk göğsü', amount: '300', unit: 'g', isOptional: false, alternatives: ['Nohut (vegan)'] },
      { name: 'Avokado', amount: '1', unit: 'adet', isOptional: true },
      { name: 'Kiraz domates', amount: '10', unit: 'adet', isOptional: true },
      { name: 'Limon suyu', amount: '2', unit: 'yemek kaşığı', isOptional: false },
      { name: 'Zeytinyağı', amount: '2', unit: 'yemek kaşığı', isOptional: false },
      { name: 'Tuz, karabiber', amount: '', unit: '', isOptional: false },
    ],
    steps: [
      'Kinoayı yıkayıp 2 kat su ile 15 dakika pişirin.',
      'Tavuğu tuz ve karabiberle marine edip ızgarada pişirin.',
      'Tavuğu şeritler halinde kesin.',
      'Tüm malzemeleri kaseye koyun.',
      'Limon ve zeytinyağı ile tatlandırın.',
    ],
    substitutions: [
      { original: 'Tavuk', substitute: 'Nohut', notes: 'Zeytinyağında kavurun', purpose: 'vegan' },
      { original: 'Kinoa', substitute: 'Pirinç', notes: 'Glutensizdir, kinoa yoksa kullanabilirsiniz', purpose: 'budget' },
    ],
    tags: ['yüksek protein', 'glutensiz', 'sağlıklı'],
    suitableFor: ['gluten_free', 'dairy_free', 'celiac'],
  },
  {
    id: 'r6',
    name: 'Çocuk Dostu Meyve Smoothie',
    category: 'snack',
    duration: 5,
    difficulty: 'easy',
    costLevel: 'budget',
    servings: 2,
    emoji: '🥤',
    ingredients: [
      { name: 'Muz', amount: '1', unit: 'adet', isOptional: false },
      { name: 'Çilek (taze veya dondurulmuş)', amount: '100', unit: 'g', isOptional: false },
      { name: 'Yulaf sütü', amount: '200', unit: 'ml', isOptional: false, alternatives: ['Badem sütü', 'Pirinç sütü'] },
      { name: 'Bal', amount: '1', unit: 'çay kaşığı', isOptional: true },
    ],
    steps: [
      'Tüm malzemeleri blender\'a koyun.',
      'Pürüzsüz olana kadar blendırdan geçirin.',
      'Bardaklara dökün ve servis edin.',
    ],
    substitutions: [
      { original: 'Yulaf sütü', substitute: 'Pirinç sütü', notes: 'Daha hafif tat', purpose: 'dairy_free' },
    ],
    tags: ['çocuk', 'hızlı', 'vegan', 'sütsüz'],
    suitableFor: ['dairy_free', 'lactose_free', 'egg_free', 'gluten_free'],
  },
]

// ─── Recipe card ──────────────────────────────────────────────────────────────
function RecipeCard({
  recipe,
  isFavorite,
  onToggleFavorite,
  onClick,
}: {
  recipe: Recipe
  isFavorite: boolean
  onToggleFavorite: () => void
  onClick: () => void
}) {
  const difficultyLabel = { easy: 'Kolay', medium: 'Orta', hard: 'Zor' }[recipe.difficulty]
  const costLabel = { budget: '₺', mid: '₺₺', premium: '₺₺₺' }[recipe.costLevel]

  return (
    <Card variant="default" padding="none" hoverable onClick={onClick}>
      {/* Image placeholder */}
      <div className="w-full h-28 bg-gradient-to-br from-toleran-sage-50 to-toleran-sage-100 rounded-t-2xl flex items-center justify-center">
        <span className="text-5xl">{recipe.emoji}</span>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-bold text-toleran-text leading-tight">{recipe.name}</h3>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
            className="shrink-0 p-1"
          >
            <Heart
              size={16}
              className={isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-300'}
            />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-toleran-muted">
            <Clock size={11} />
            <span>{recipe.duration}dk</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-toleran-muted">
            <ChefHat size={11} />
            <span>{difficultyLabel}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-toleran-muted">
            <DollarSign size={11} />
            <span>{costLabel}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          <Badge variant="sage" size="sm">
            {RECIPE_CATEGORY_LABELS[recipe.category]}
          </Badge>
          {recipe.suitableFor.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" size="sm">
              {tag.replace(/_/g, '-')}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  )
}

// ─── Recipe detail modal ──────────────────────────────────────────────────────
function RecipeDetail({
  recipe,
  isFavorite,
  onToggleFavorite,
  onClose,
}: {
  recipe: Recipe
  isFavorite: boolean
  onToggleFavorite: () => void
  onClose: () => void
}) {
  const addToShoppingList = useAppStore((s) => s.addToShoppingList)
  const [activeTab, setActiveTab] = useState<'steps' | 'ingredients' | 'subs'>('ingredients')

  const addAllToShoppingList = () => {
    recipe.ingredients.forEach((ing) => {
      addToShoppingList({
        id: generateId('shop'),
        name: ing.name,
        amount: `${ing.amount} ${ing.unit}`.trim(),
        category: 'Tarif: ' + recipe.name,
        checked: false,
        recipeId: recipe.id,
      })
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-toleran-bg overflow-y-auto max-w-[480px] mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-toleran-bg flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-toleran-muted hover:bg-gray-100"
        >
          <X size={18} />
        </button>
        <h2 className="text-sm font-bold text-toleran-text">Tarif Detayı</h2>
        <button
          onClick={onToggleFavorite}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
        >
          <Heart
            size={18}
            className={isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-300'}
          />
        </button>
      </div>

      {/* Hero */}
      <div className="w-full h-40 bg-gradient-to-br from-toleran-sage-50 to-toleran-sage-100 flex items-center justify-center">
        <span className="text-7xl">{recipe.emoji}</span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Title & meta */}
        <div>
          <h1 className="text-xl font-bold text-toleran-text">{recipe.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-sm text-toleran-muted">
              <Clock size={14} />
              <span>{recipe.duration} dakika</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-toleran-muted">
              <Users size={14} />
              <span>{recipe.servings} kişilik</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-toleran-muted">
              <ChefHat size={14} />
              <span>{{ easy: 'Kolay', medium: 'Orta', hard: 'Zor' }[recipe.difficulty]}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {recipe.suitableFor.map((tag) => (
            <Badge key={tag} variant="sage" size="sm">
              ✓ {tag.replace(/_/g, ' ')}
            </Badge>
          ))}
        </div>

        {/* Shopping list button */}
        <Button onClick={addAllToShoppingList} variant="outline" fullWidth>
          <ShoppingCart size={16} />
          Malzemeleri Alışveriş Listesine Ekle
        </Button>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          {([
            { key: 'ingredients', label: 'Malzemeler' },
            { key: 'steps', label: 'Yapılış' },
            { key: 'subs', label: 'Alternatifler' },
          ] as const).map(({ key, label }) => (
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

        {/* Tab content */}
        {activeTab === 'ingredients' && (
          <div className="space-y-2">
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <span className="text-sm text-toleran-text font-medium">{ing.name}</span>
                  {ing.isOptional && (
                    <span className="ml-2 text-xs text-toleran-muted">(isteğe bağlı)</span>
                  )}
                  {ing.alternatives && ing.alternatives.length > 0 && (
                    <p className="text-xs text-toleran-sage-600 mt-0.5">
                      Alternatif: {ing.alternatives.join(', ')}
                    </p>
                  )}
                </div>
                <span className="text-sm text-toleran-muted shrink-0 ml-2">
                  {ing.amount} {ing.unit}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'steps' && (
          <ol className="space-y-4">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-toleran-sage-100 flex items-center justify-center shrink-0 text-sm font-bold text-toleran-sage-700">
                  {i + 1}
                </div>
                <p className="text-sm text-toleran-text leading-relaxed pt-1">{step}</p>
              </li>
            ))}
          </ol>
        )}

        {activeTab === 'subs' && (
          <div>
            {recipe.substitutions.length === 0 ? (
              <p className="text-sm text-toleran-muted text-center py-4">
                Bu tarif için özel alternatif önerisi bulunmuyor.
              </p>
            ) : (
              <div className="space-y-3">
                {recipe.substitutions.map((sub, i) => (
                  <Card key={i} variant="bordered" padding="md">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-red-500 font-medium line-through">{sub.original}</span>
                      <span className="text-xs text-toleran-muted">→</span>
                      <span className="text-xs text-toleran-sage-700 font-semibold">{sub.substitute}</span>
                    </div>
                    <p className="text-xs text-toleran-muted">{sub.notes}</p>
                    <Badge variant="outline" size="sm" className="mt-2">
                      {sub.purpose.replace(/_/g, ' ')}
                    </Badge>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main recipes page ────────────────────────────────────────────────────────
export default function RecipesPage() {
  const favoriteRecipes = useAppStore((s) => s.favoriteRecipes)
  const toggleFavoriteRecipe = useAppStore((s) => s.toggleFavoriteRecipe)
  const user = useAppStore((s) => s.user)

  const [activeCategory, setActiveCategory] = useState<RecipeCategory | 'all'>('all')
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [showFavorites, setShowFavorites] = useState(false)

  const categories: Array<RecipeCategory | 'all'> = [
    'all', 'breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'kids', 'quick',
  ]

  const filteredRecipes = STATIC_RECIPES.filter((r) => {
    if (showFavorites && !favoriteRecipes.includes(r.id)) return false
    if (activeCategory !== 'all' && r.category !== activeCategory) return false
    // Filter by user conditions
    if (user?.conditions) {
      const hasGlutenCondition = user.conditions.some(
        (c) => c.foodItem.toLowerCase().includes('gluten') || c.type === 'celiac'
      )
      // Don't filter out, just warn — for MVP show all
    }
    return true
  })

  return (
    <div className="min-h-dvh bg-toleran-bg page-content">
      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          isFavorite={favoriteRecipes.includes(selectedRecipe.id)}
          onToggleFavorite={() => toggleFavoriteRecipe(selectedRecipe.id)}
          onClose={() => setSelectedRecipe(null)}
        />
      )}

      <Header
        title="Tarifler"
        subtitle="Kısıtlamalarınıza uygun yemekler"
        action={
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={cn(
              'text-xs font-medium px-3 py-1.5 rounded-full transition-colors',
              showFavorites
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 text-toleran-muted hover:bg-gray-200'
            )}
          >
            {showFavorites ? '❤️ Favoriler' : '🤍 Favoriler'}
          </button>
        }
      />

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto py-3 px-4 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'shrink-0 text-xs font-medium px-3 py-2 rounded-full transition-all',
              activeCategory === cat
                ? 'bg-toleran-sage-500 text-white'
                : 'bg-white text-toleran-muted border border-gray-200 hover:border-toleran-sage-300'
            )}
          >
            {cat === 'all' ? 'Tümü' : RECIPE_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Recipe grid */}
      <div className="px-4 pb-6">
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-3">🍽️</span>
            <p className="font-semibold text-toleran-text">Tarif bulunamadı</p>
            <p className="text-sm text-toleran-muted mt-1">
              {showFavorites
                ? 'Henüz favori tarifiniz yok.'
                : 'Bu kategori için tarif hazırlanıyor.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 stagger-children">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isFavorite={favoriteRecipes.includes(recipe.id)}
                onToggleFavorite={() => toggleFavoriteRecipe(recipe.id)}
                onClick={() => setSelectedRecipe(recipe)}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
