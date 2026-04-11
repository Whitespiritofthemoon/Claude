'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { SafetyBadge } from '@/components/ui/SafetyBadge'
import { DataSourceBadge } from '@/components/ui/Badge'
import { generateId, relativeTime, QUICK_SUGGESTIONS_TR, containsEmergencyKeyword } from '@/lib/utils'
import type { ChatMessage } from '@/types'
import { Send, Trash2, RotateCcw, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Emergency alert ──────────────────────────────────────────────────────────
function EmergencyAlert() {
  return (
    <div className="mx-4 mb-3 bg-red-600 rounded-2xl p-4 text-white animate-fade-in-up">
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sm">🚨 Acil Durum Uyarısı</p>
          <p className="text-sm mt-1 text-red-100 leading-relaxed">
            Nefes darlığı, boğazda şişme veya ağır reaksiyon yaşıyorsanız derhal{' '}
            <strong>112&apos;yi arayın</strong> veya en yakın acil servise gidin.
          </p>
          <a
            href="tel:112"
            className="inline-block mt-2 bg-white text-red-600 font-bold text-sm px-4 py-2 rounded-xl"
          >
            112&apos;yi Ara
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-4 animate-fade-in">
      <div className="w-7 h-7 rounded-full bg-toleran-sage-100 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-toleran-sage-700">T</span>
      </div>
      <div className="chat-bubble-assistant px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-toleran-muted animate-pulse-soft inline-block"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Message renderer ─────────────────────────────────────────────────────────
function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
    .replace(/---/g, '<hr/>')
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end px-4 animate-fade-in-up">
        <div className="chat-bubble-user px-4 py-3 max-w-[80%]">
          <p className="text-sm text-white leading-relaxed">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2 px-4 animate-fade-in-up">
      <div className="w-7 h-7 rounded-full bg-toleran-sage-100 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-toleran-sage-700">T</span>
      </div>
      <div className="chat-bubble-assistant px-4 py-3 max-w-[85%]">
        {message.analysis && (
          <div className="mb-3 pb-3 border-b border-gray-100">
            <SafetyBadge
              level={message.analysis.safetyLevel}
              confidence={message.analysis.confidence}
              showConfidence={message.analysis.confidence}
            />
            {message.analysis.dataSources && message.analysis.dataSources.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {message.analysis.dataSources.map((src) => (
                  <DataSourceBadge key={src} source={src} />
                ))}
              </div>
            )}
          </div>
        )}
        <div
          className="prose-chat"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
        />
        <p className="text-[10px] text-toleran-muted mt-2 text-right">
          {relativeTime(message.timestamp)}
        </p>
      </div>
    </div>
  )
}

// ─── Quick suggestion chips ───────────────────────────────────────────────────
function QuickSuggestions({
  onSelect,
  disabled,
}: {
  onSelect: (q: string) => void
  disabled: boolean
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 px-4 -mx-0 scrollbar-hide">
      {QUICK_SUGGESTIONS_TR.slice(0, 5).map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          disabled={disabled}
          className="shrink-0 text-xs font-medium px-3 py-2 bg-white rounded-full border border-gray-200 text-toleran-text hover:border-toleran-sage-300 hover:bg-toleran-sage-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {q}
        </button>
      ))}
    </div>
  )
}

// ─── Main chat page ───────────────────────────────────────────────────────────
export default function ChatPage() {
  const user = useAppStore((s) => s.user)
  const chatHistory = useAppStore((s) => s.chatHistory)
  const addMessage = useAppStore((s) => s.addMessage)
  const clearChat = useAppStore((s) => s.clearChat)
  const addRecentAnalysis = useAppStore((s) => s.addRecentAnalysis)

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isLoading])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return

      // Check for emergency keywords
      if (containsEmergencyKeyword(text)) {
        setShowEmergency(true)
        return
      }

      const userMsg: ChatMessage = {
        id: generateId('msg'),
        role: 'user',
        content: text.trim(),
        timestamp: new Date().toISOString(),
      }

      addMessage(userMsg)
      setInput('')
      setIsLoading(true)
      setShowEmergency(false)

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              ...chatHistory.slice(-8).map((m) => ({ role: m.role, content: m.content })),
              { role: 'user', content: text.trim() },
            ],
            userProfile: user,
            language: user?.language ?? 'tr',
          }),
        })

        if (!res.ok) throw new Error('API error')
        const data = await res.json()

        const assistantMsg: ChatMessage = {
          id: generateId('msg'),
          role: 'assistant',
          content: data.content,
          analysis: data.analysis,
          timestamp: new Date().toISOString(),
        }

        addMessage(assistantMsg)

        // Save to recent analyses if contains safety assessment
        if (data.analysis?.safetyLevel) {
          addRecentAnalysis({
            query: text.trim().slice(0, 60),
            safetyLevel: data.analysis.safetyLevel,
            summary: data.content.slice(0, 120),
            timestamp: new Date().toISOString(),
          })
        }
      } catch {
        const errMsg: ChatMessage = {
          id: generateId('msg'),
          role: 'assistant',
          content:
            'Üzgünüm, şu anda yanıt veremiyorum. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.',
          timestamp: new Date().toISOString(),
        }
        addMessage(errMsg)
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, chatHistory, user, addMessage, addRecentAnalysis]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const isEmpty = chatHistory.length === 0

  return (
    <div className="min-h-dvh flex flex-col bg-toleran-bg">
      <Header
        title="Sohbet Asistanı"
        subtitle="7/24 beslenme karar desteği"
        action={
          chatHistory.length > 0 ? (
            <button
              onClick={clearChat}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-toleran-muted hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label="Sohbeti temizle"
            >
              <Trash2 size={18} />
            </button>
          ) : undefined
        }
      />

      {/* Emergency alert */}
      {showEmergency && <EmergencyAlert />}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3" style={{ paddingBottom: '140px' }}>
        {isEmpty && (
          <div className="px-4 py-8 animate-fade-in-up">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-toleran-sage-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="font-bold text-toleran-text">Merhaba!</h3>
              <p className="text-sm text-toleran-muted mt-1 leading-relaxed">
                Beslenme kararlarında sana yardımcı olmaya hazırım.
                {user?.name && ` ${user.name}, sana nasıl yardımcı olabilirim?`}
              </p>
            </div>

            {/* Example questions */}
            <div className="space-y-2">
              {[
                { q: 'Bu süt bana uygun mu?', emoji: '🥛' },
                { q: 'Glutensiz kahvaltı tarifleri öner', emoji: '🍳' },
                { q: 'Starbucks\'ta laktozsuz seçenekler', emoji: '☕' },
                { q: 'Yumurta yerine ne kullanabilirim?', emoji: '🥚' },
                { q: 'Türkiye\'de laktozsuz yoğurt markası', emoji: '🇹🇷' },
              ].map(({ q, emoji }) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="w-full flex items-center gap-3 bg-white rounded-xl px-4 py-3 text-left shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <span className="text-xl">{emoji}</span>
                  <span className="text-sm text-toleran-text">{q}</span>
                  <Send size={14} className="text-toleran-muted ml-auto shrink-0" />
                </button>
              ))}
            </div>

            <div className="mt-6 bg-toleran-sage-50 rounded-xl p-4">
              <p className="text-xs text-toleran-sage-700 leading-relaxed">
                ℹ️ Toleran tanı koymaz. Yanıtlar, profilinize ve içerik analizine dayanır.
                Riskli durumlarda lütfen sağlık uzmanına başvurun.
              </p>
            </div>
          </div>
        )}

        {chatHistory.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="fixed bottom-16 left-0 right-0 z-40 max-w-[480px] mx-auto">
        {/* Quick suggestions */}
        {isEmpty && (
          <div className="mb-2">
            <QuickSuggestions onSelect={sendMessage} disabled={isLoading} />
          </div>
        )}

        <div className="bg-white border-t border-gray-100 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Bir besin veya ürün hakkında sor…"
              rows={1}
              disabled={isLoading}
              className={cn(
                'flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-toleran-text',
                'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-toleran-sage-400 focus:border-toleran-sage-400',
                'disabled:opacity-60 disabled:cursor-not-allowed max-h-24 leading-relaxed',
                'transition-all duration-150'
              )}
              style={{ scrollbarWidth: 'none' }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                'w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-150 shrink-0',
                input.trim() && !isLoading
                  ? 'bg-toleran-sage-500 text-white hover:bg-toleran-sage-600 shadow-sm hover:shadow-md'
                  : 'bg-gray-100 text-gray-300'
              )}
            >
              {isLoading ? (
                <RotateCcw size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </form>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
