import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { buildChatSystemPrompt } from '@/lib/ai-prompts'
import type { UserProfile } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      messages,
      userProfile,
      language = 'tr',
    }: {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>
      userProfile: UserProfile | null
      language: 'tr' | 'en'
    } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
    }

    const systemPrompt = buildChatSystemPrompt(userProfile, language)

    // Use prompt caching for the system prompt (it stays constant per user session)
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          // @ts-expect-error cache_control is supported but not in all SDK type versions
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      })),
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from AI')
    }

    // Parse structured analysis from the response if present
    const analysis = extractAnalysis(content.text)

    return NextResponse.json({
      content: content.text,
      analysis,
      usage: response.usage,
    })
  } catch (error) {
    console.error('[/api/chat] Error:', error)

    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'API anahtarı geçersiz. Lütfen ayarları kontrol edin.' },
          { status: 401 }
        )
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Çok fazla istek. Lütfen bir dakika bekleyin.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Yapay zeka yanıt veremedi. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
}

// ─── Extract structured analysis from AI response text ───────────────────────

function extractAnalysis(text: string) {
  const lower = text.toLowerCase()

  let safetyLevel: 'safe' | 'caution' | 'avoid' | 'unknown' = 'unknown'

  if (lower.includes('✅') || lower.includes('uygun') || lower.includes('safe')) {
    safetyLevel = 'safe'
  }
  if (lower.includes('⚠️') || lower.includes('dikkat') || lower.includes('caution')) {
    safetyLevel = 'caution'
  }
  if (lower.includes('🚫') || lower.includes('kaçın') || lower.includes('avoid')) {
    safetyLevel = 'avoid'
  }
  if (lower.includes('❓') || lower.includes('emin değil') || lower.includes('unsure') || lower.includes('belirsiz')) {
    safetyLevel = 'unknown'
  }

  // Determine if emergency alert needed
  const emergencyKeywords = [
    'acil', 'emergency', '112', 'anaphylaxis', 'anafılaksi',
    'nefes darlığı', 'boğaz şişmesi', 'acil servis'
  ]
  const emergencyAlert = emergencyKeywords.some((k) => lower.includes(k))

  if (safetyLevel === 'unknown' && !emergencyAlert) return null

  return {
    safetyLevel,
    confidence: 'medium' as const,
    dataSources: ['content_analysis'] as const,
    emergencyAlert,
  }
}
