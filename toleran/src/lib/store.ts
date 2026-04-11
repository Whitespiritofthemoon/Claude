'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  UserProfile,
  ChatMessage,
  SymptomLog,
  ShoppingListItem,
  OnboardingData,
  UploadedReport,
  FoodCondition,
} from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// App Store — Zustand with localStorage persistence
// ─────────────────────────────────────────────────────────────────────────────

interface RecentAnalysis {
  query: string
  safetyLevel: string
  summary: string
  timestamp: string
}

interface AppState {
  // ── User ─────────────────────────────────────────────────────────────────
  user: UserProfile | null
  setUser: (user: UserProfile) => void
  updateUser: (updates: Partial<UserProfile>) => void
  clearUser: () => void

  // ── Onboarding ───────────────────────────────────────────────────────────
  onboarding: Partial<OnboardingData>
  setOnboarding: (data: Partial<OnboardingData>) => void
  resetOnboarding: () => void

  // ── Chat ─────────────────────────────────────────────────────────────────
  chatHistory: ChatMessage[]
  addMessage: (message: ChatMessage) => void
  clearChat: () => void

  // ── Symptom Logs ─────────────────────────────────────────────────────────
  symptomLogs: SymptomLog[]
  addSymptomLog: (log: SymptomLog) => void
  removeSymptomLog: (id: string) => void

  // ── Shopping List ─────────────────────────────────────────────────────────
  shoppingList: ShoppingListItem[]
  addToShoppingList: (item: ShoppingListItem) => void
  toggleShoppingItem: (id: string) => void
  removeFromShoppingList: (id: string) => void
  clearShoppingList: () => void

  // ── Reports ───────────────────────────────────────────────────────────────
  uploadedReports: UploadedReport[]
  addReport: (report: UploadedReport) => void

  // ── Favorites ─────────────────────────────────────────────────────────────
  favoriteRecipes: string[]
  toggleFavoriteRecipe: (recipeId: string) => void

  // ── Recent Analyses ───────────────────────────────────────────────────────
  recentAnalyses: RecentAnalysis[]
  addRecentAnalysis: (analysis: RecentAnalysis) => void
}

const defaultOnboarding: Partial<OnboardingData> = {
  step: 0,
  name: '',
  age: '',
  gender: '',
  country: 'TR',
  city: '',
  language: 'tr',
  dietaryPreference: 'omnivore',
  hasAllergies: false,
  hasIntolerance: false,
  hasCeliac: false,
  hasFodmap: false,
  hasDoctorDiagnosis: false,
  wantsToUploadTest: false,
  hasChildren: false,
  isPregnant: false,
  primaryGoal: '',
  conditions: [],
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // ── User ───────────────────────────────────────────────────────────────
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      clearUser: () => set({ user: null }),

      // ── Onboarding ─────────────────────────────────────────────────────────
      onboarding: defaultOnboarding,
      setOnboarding: (data) =>
        set((state) => ({ onboarding: { ...state.onboarding, ...data } })),
      resetOnboarding: () => set({ onboarding: defaultOnboarding }),

      // ── Chat ───────────────────────────────────────────────────────────────
      chatHistory: [],
      addMessage: (message) =>
        set((state) => ({
          chatHistory: [...state.chatHistory.slice(-99), message],
        })),
      clearChat: () => set({ chatHistory: [] }),

      // ── Symptom Logs ───────────────────────────────────────────────────────
      symptomLogs: [],
      addSymptomLog: (log) =>
        set((state) => ({
          symptomLogs: [log, ...state.symptomLogs],
        })),
      removeSymptomLog: (id) =>
        set((state) => ({
          symptomLogs: state.symptomLogs.filter((l) => l.id !== id),
        })),

      // ── Shopping List ──────────────────────────────────────────────────────
      shoppingList: [],
      addToShoppingList: (item) =>
        set((state) => ({ shoppingList: [...state.shoppingList, item] })),
      toggleShoppingItem: (id) =>
        set((state) => ({
          shoppingList: state.shoppingList.map((item) =>
            item.id === id ? { ...item, checked: !item.checked } : item
          ),
        })),
      removeFromShoppingList: (id) =>
        set((state) => ({
          shoppingList: state.shoppingList.filter((item) => item.id !== id),
        })),
      clearShoppingList: () => set({ shoppingList: [] }),

      // ── Reports ────────────────────────────────────────────────────────────
      uploadedReports: [],
      addReport: (report) =>
        set((state) => ({
          uploadedReports: [report, ...state.uploadedReports],
        })),

      // ── Favorites ──────────────────────────────────────────────────────────
      favoriteRecipes: [],
      toggleFavoriteRecipe: (recipeId) =>
        set((state) => ({
          favoriteRecipes: state.favoriteRecipes.includes(recipeId)
            ? state.favoriteRecipes.filter((id) => id !== recipeId)
            : [...state.favoriteRecipes, recipeId],
        })),

      // ── Recent Analyses ────────────────────────────────────────────────────
      recentAnalyses: [],
      addRecentAnalysis: (analysis) =>
        set((state) => ({
          recentAnalyses: [analysis, ...state.recentAnalyses.slice(0, 19)],
        })),
    }),
    {
      name: 'toleran-storage',
      partialize: (state) => ({
        user: state.user,
        onboarding: state.onboarding,
        chatHistory: state.chatHistory,
        symptomLogs: state.symptomLogs,
        shoppingList: state.shoppingList,
        uploadedReports: state.uploadedReports,
        favoriteRecipes: state.favoriteRecipes,
        recentAnalyses: state.recentAnalyses,
      }),
    }
  )
)

// ─── Selector helpers ─────────────────────────────────────────────────────────

export const selectUserConditions = (state: AppState): FoodCondition[] =>
  state.user?.conditions ?? []

export const selectIsOnboardingComplete = (state: AppState): boolean =>
  state.user?.onboardingCompleted ?? false

export const selectUserCountry = (state: AppState): string =>
  state.user?.country ?? 'TR'

export const selectUserLanguage = (state: AppState): 'tr' | 'en' =>
  state.user?.language ?? 'tr'
