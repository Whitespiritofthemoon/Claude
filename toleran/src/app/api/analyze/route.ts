import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { buildAnalysisPrompt } from '@/lib/ai-prompts'
import type { UserProfile, FoodAnalysis } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      ingredients,
      userProfile,
      language = 'tr',
    }: {
      ingredients: string
      userProfile: UserProfile | null
      language: 'tr' | 'en'
    } = body

    if (!ingredients || typeof ingredients !== 'string' || ingredients.trim().length === 0) {
      return NextResponse.json({ error: 'Ingredients are required' }, { status: 400 })
    }

    const prompt = buildAnalysisPrompt(ingredients, userProfile, language)

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      system: [
        {
          type: 'text',
          text: `Sen Toleran'ın beslenme analiz motorusun. Kullanıcının besinle ilgili durumlarına ve sağladığın içerik listesine göre analiz yap.

ÖNEMLİ KURALLAR:
- Alerji ve intoleransı KARIŞTIRAMA. Alerji = bağışıklık yanıtı, intolerans = sindirim sorunu
- Çölyak için gluten kesinlikle yasak
- Doktor tanısı en yüksek ağırlıktadır
- Kesinlik yoksa "unknown" döndür
- ASLA tıbbi tanı koyma
- Acil semptom söz konusu olduğunda bunu response'da belirt

JSON formatında yanıt ver. Başka hiçbir metin ekleme.`,
          // @ts-expect-error cache_control is supported
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected AI response type')
    }

    // Parse JSON response
    let analysis: FoodAnalysis
    try {
      const jsonText = content.text.trim()
      // Strip markdown code blocks if present
      const cleaned = jsonText.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
      const parsed = JSON.parse(cleaned)

      analysis = {
        query: ingredients.slice(0, 100),
        safetyLevel: parsed.safetyLevel ?? 'unknown',
        confidence: parsed.confidence ?? 'medium',
        reason: parsed.reason ?? 'Analiz tamamlandı.',
        riskyIngredients: Array.isArray(parsed.riskyIngredients) ? parsed.riskyIngredients : [],
        safeAlternatives: Array.isArray(parsed.safeAlternatives) ? parsed.safeAlternatives : [],
        countryBrandRecommendations: Array.isArray(parsed.countryBrandRecommendations)
          ? parsed.countryBrandRecommendations
          : [],
        dataSources: ['content_analysis', 'user_upload'],
        disclaimer:
          parsed.disclaimer ??
          'Bu öneri içerik analizine dayanmaktadır. Toleran tanı koymaz. Şüphe durumunda sağlık uzmanına başvurun.',
      }
    } catch {
      // If JSON parsing fails, create a fallback response
      analysis = {
        query: ingredients.slice(0, 100),
        safetyLevel: 'unknown',
        confidence: 'low',
        reason: content.text.slice(0, 200),
        riskyIngredients: [],
        safeAlternatives: [],
        countryBrandRecommendations: [],
        dataSources: ['content_analysis'],
        disclaimer: 'Bu öneri içerik analizine dayanmaktadır. Toleran tanı koymaz.',
      }
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('[/api/analyze] Error:', error)

    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'API anahtarı geçersiz.' },
          { status: 401 }
        )
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'İstek limiti aşıldı. Lütfen bekleyin.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Analiz başarısız. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
}
