import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { buildRecipePrompt } from '@/lib/ai-prompts'
import type { UserProfile, Recipe } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      category,
      userProfile,
      language = 'tr',
    }: {
      category: string
      userProfile: UserProfile | null
      language: 'tr' | 'en'
    } = body

    const prompt = buildRecipePrompt(category ?? 'breakfast', userProfile, language)

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: [
        {
          type: 'text',
          text: `Sen Toleran'ın tarif öneri motorusun. Kullanıcının beslenme kısıtlamalarına uygun, pratik ve lezzetli tarifler önerirsin.

KURALLAR:
- Kısıtlamalara uymayan malzeme kullanma
- Her tarif için mutlaka malzeme alternatifleri sun
- Tarifler gerçekçi ve yapılabilir olsun
- JSON array formatında yanıt ver`,
          // @ts-expect-error cache_control is supported
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    let recipes: Partial<Recipe>[]
    try {
      const cleaned = content.text.trim().replace(/^```json?\n?/, '').replace(/\n?```$/, '')
      const parsed = JSON.parse(cleaned)
      recipes = Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      recipes = []
    }

    return NextResponse.json({ recipes })
  } catch (error) {
    console.error('[/api/recipes] Error:', error)
    return NextResponse.json(
      { error: 'Tarif önerileri yüklenemedi.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST with { category, userProfile, language }',
  })
}
