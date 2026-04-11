// ─────────────────────────────────────────────────────────────────────────────
// TOLERAN — Core Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export type SafetyLevel = 'safe' | 'caution' | 'avoid' | 'unknown'
export type ConfidenceLevel = 'high' | 'medium' | 'low'
export type ConditionType =
  | 'allergy'
  | 'intolerance'
  | 'celiac'
  | 'sensitivity'
  | 'fodmap'
  | 'preference'

export type DataSource =
  | 'user_upload'
  | 'doctor_diagnosis'
  | 'lab_test'
  | 'content_analysis'
  | 'symptom_log'
  | 'consumption_history'
  | 'user_declaration'
  | 'commercial_test'

export type SymptomType =
  | 'bloating'
  | 'gas'
  | 'stomach_pain'
  | 'nausea'
  | 'diarrhea'
  | 'constipation'
  | 'skin_rash'
  | 'headache'
  | 'fatigue'
  | 'itching'
  | 'mouth_discomfort'
  | 'other'

export type RecipeCategory =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'dessert'
  | 'kids'
  | 'quick'
  | 'high_protein'
  | 'budget'
  | 'meal_prep'
  | 'guest'

// ─── User ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  name: string
  age: number
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  country: string
  city: string
  language: 'tr' | 'en'
  dietaryPreference: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'other'
  conditions: FoodCondition[]
  childProfiles: ChildProfile[]
  isPregnant: boolean
  chronicConditions: string[]
  symptomGoals: SymptomType[]
  subscriptionPlan: 'free' | 'premium' | 'family' | 'expert'
  onboardingCompleted: boolean
  createdAt: string
}

export interface FoodCondition {
  id: string
  type: ConditionType
  foodItem: string
  foodAliases: string[]
  severity: 'mild' | 'moderate' | 'severe' | 'anaphylactic'
  dataSource: DataSource
  diagnosedBy?: string
  confidence: ConfidenceLevel
  notes?: string
  createdAt: string
}

export interface ChildProfile {
  id: string
  name: string
  age: number
  conditions: FoodCondition[]
}

// ─── Food Analysis ───────────────────────────────────────────────────────────

export interface FoodAnalysis {
  query: string
  safetyLevel: SafetyLevel
  confidence: ConfidenceLevel
  reason: string
  riskyIngredients: RiskyIngredient[]
  safeAlternatives: Alternative[]
  countryBrandRecommendations: BrandRecommendation[]
  dataSources: DataSource[]
  disclaimer: string
  emergencyAlert?: boolean
}

export interface RiskyIngredient {
  name: string
  reason: string
  conditionType: ConditionType
  confidence: ConfidenceLevel
}

export interface Alternative {
  name: string
  purpose: string
  availability: string
  priceRange: 'budget' | 'mid' | 'premium'
  notes?: string
}

export interface BrandRecommendation {
  brand: string
  product: string
  country: string
  reason: string
  priceRange: 'budget' | 'mid' | 'premium'
  store: string
  notes?: string
}

// ─── Recipe ──────────────────────────────────────────────────────────────────

export interface Recipe {
  id: string
  name: string
  category: RecipeCategory
  duration: number
  difficulty: 'easy' | 'medium' | 'hard'
  costLevel: 'budget' | 'mid' | 'premium'
  servings: number
  ingredients: RecipeIngredient[]
  steps: string[]
  substitutions: RecipeSubstitution[]
  tags: string[]
  suitableFor: string[]
  emoji: string
}

export interface RecipeIngredient {
  name: string
  amount: string
  unit: string
  isOptional: boolean
  alternatives?: string[]
}

export interface RecipeSubstitution {
  original: string
  substitute: string
  notes: string
  purpose: 'dairy_free' | 'gluten_free' | 'egg_free' | 'nut_free' | 'vegan' | 'budget'
}

// ─── Symptom Log ─────────────────────────────────────────────────────────────

export interface SymptomLog {
  id: string
  userId: string
  date: string
  time: string
  foodItem: string
  amount: string
  location: string
  symptoms: SymptomType[]
  onsetMinutes: number
  severity: 1 | 2 | 3 | 4 | 5
  notes: string
  createdAt: string
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  analysis?: FoodAnalysis
  timestamp: string
}

// ─── Shopping List ───────────────────────────────────────────────────────────

export interface ShoppingListItem {
  id: string
  name: string
  amount?: string
  category: string
  checked: boolean
  recipeId?: string
}

// ─── Uploaded Report ─────────────────────────────────────────────────────────

export interface UploadedReport {
  id: string
  userId: string
  fileName: string
  fileType: 'pdf' | 'image' | 'text'
  rawText: string
  extractedConditions: Partial<FoodCondition>[]
  reportType:
    | 'allergy_test'
    | 'intolerance_test'
    | 'doctor_diagnosis'
    | 'celiac_test'
    | 'other'
  reportDate?: string
  confidence: ConfidenceLevel
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
}

// ─── Onboarding ──────────────────────────────────────────────────────────────

export interface OnboardingData {
  step: number
  name: string
  age: string
  gender: string
  country: string
  city: string
  language: string
  dietaryPreference: string
  hasAllergies: boolean
  hasIntolerance: boolean
  hasCeliac: boolean
  hasFodmap: boolean
  hasDoctorDiagnosis: boolean
  wantsToUploadTest: boolean
  hasChildren: boolean
  isPregnant: boolean
  primaryGoal: string
  conditions: Array<{
    type: ConditionType
    foodItem: string
    severity: string
    dataSource: DataSource
  }>
}

// ─── Country Config ───────────────────────────────────────────────────────────

export interface CountryConfig {
  code: string
  name: string
  nameTr: string
  currency: string
  majorMarkets: string[]
  language: string
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: 'TR',
    name: 'Turkey',
    nameTr: 'Türkiye',
    currency: 'TRY',
    majorMarkets: ['Migros', 'CarrefourSA', 'BİM', 'A101', 'Şok', 'Hakmar'],
    language: 'tr',
  },
  {
    code: 'DE',
    name: 'Germany',
    nameTr: 'Almanya',
    currency: 'EUR',
    majorMarkets: ['Rewe', 'Edeka', 'Aldi', 'Lidl', 'dm', 'Rossmann', 'Kaufland'],
    language: 'de',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    nameTr: 'İngiltere',
    currency: 'GBP',
    majorMarkets: ['Tesco', 'Sainsbury\'s', 'Waitrose', 'M&S', 'Asda', 'Morrisons'],
    language: 'en',
  },
  {
    code: 'US',
    name: 'United States',
    nameTr: 'Amerika',
    currency: 'USD',
    majorMarkets: ['Whole Foods', 'Trader Joe\'s', 'Kroger', 'Costco', 'Target', 'Walmart'],
    language: 'en',
  },
]

// ─── Label Maps ───────────────────────────────────────────────────────────────

export const CONDITION_TYPE_LABELS: Record<ConditionType, string> = {
  allergy: 'Alerji',
  intolerance: 'İntolerans',
  celiac: 'Çölyak',
  sensitivity: 'Duyarlılık',
  fodmap: 'FODMAP',
  preference: 'Tercih',
}

export const SAFETY_LABELS: Record<SafetyLevel, string> = {
  safe: 'Uygun',
  caution: 'Dikkat',
  avoid: 'Kaçın',
  unknown: 'Belirsiz',
}

export const SYMPTOM_LABELS: Record<SymptomType, string> = {
  bloating: 'Şişkinlik',
  gas: 'Gaz',
  stomach_pain: 'Mide Ağrısı',
  nausea: 'Bulantı',
  diarrhea: 'İshal',
  constipation: 'Kabızlık',
  skin_rash: 'Cilt Döküntüsü',
  headache: 'Baş Ağrısı',
  fatigue: 'Yorgunluk',
  itching: 'Kaşıntı',
  mouth_discomfort: 'Ağız Rahatsızlığı',
  other: 'Diğer',
}

export const RECIPE_CATEGORY_LABELS: Record<RecipeCategory, string> = {
  breakfast: 'Kahvaltı',
  lunch: 'Öğle',
  dinner: 'Akşam',
  snack: 'Atıştırmalık',
  dessert: 'Tatlı',
  kids: 'Çocuk',
  quick: 'Hızlı',
  high_protein: 'Yüksek Protein',
  budget: 'Ekonomik',
  meal_prep: 'Haftalık Hazırlık',
  guest: 'Misafir',
}

export const DATA_SOURCE_LABELS: Record<DataSource, string> = {
  user_upload: 'Kullanıcı Yüklemesi',
  doctor_diagnosis: 'Doktor Tanısı',
  lab_test: 'Laboratuvar Testi',
  content_analysis: 'İçerik Analizi',
  symptom_log: 'Semptom Günlüğü',
  consumption_history: 'Tüketim Geçmişi',
  user_declaration: 'Kullanıcı Beyanı',
  commercial_test: 'Ticari Test',
}
