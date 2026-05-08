'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'

type UploadStep = 'idle' | 'uploading' | 'analyzing' | 'done' | 'error'

export default function UploadClient() {
  const [step, setStep] = useState<UploadStep>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const router = useRouter()

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) {
      setFile(accepted[0])
      setError('')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    onDropRejected: () => setError('Dosya kabul edilmedi. PDF veya metin dosyası (max 10MB) yükleyin.'),
  })

  const handleUpload = async (useDemo = false) => {
    setStep('uploading')
    setProgress(20)

    const formData = new FormData()
    if (file && !useDemo) formData.append('file', file)
    if (useDemo) formData.append('demo', 'true')

    try {
      setProgress(50)
      setStep('analyzing')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      setProgress(90)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Yükleme başarısız')

      setProgress(100)
      setStep('done')
      setTimeout(() => router.push('/feed'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
      setStep('error')
    }
  }

  if (step === 'done') {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-bounce-in">
        <div className="text-7xl mb-4">🎉</div>
        <h2 className="text-xl font-bold mb-2">Harika!</h2>
        <p className="text-[var(--text-muted)] text-sm">İçerik analiz edildi, akışa yönlendiriliyorsunuz...</p>
      </div>
    )
  }

  const isLoading = step === 'uploading' || step === 'analyzing'

  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`card p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2 border-dashed min-h-48 ${
          isDragActive
            ? 'border-[var(--primary)] bg-[var(--primary)]/5'
            : 'border-[var(--border)] hover:border-[var(--primary)]/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-5xl mb-3">{file ? '📄' : '📁'}</div>
        {file ? (
          <>
            <p className="font-semibold text-[var(--primary)]">{file.name}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold mb-1">
              {isDragActive ? 'Dosyayı bırak!' : 'Dosya sürükle veya tıkla'}
            </p>
            <p className="text-sm text-[var(--text-muted)]">PDF, TXT, MD — Maks 10MB</p>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-xl">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">
              {step === 'uploading' ? 'Dosya yükleniyor...' : '🤖 AI analiz ediyor...'}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {!isLoading && (
        <>
          <button
            onClick={() => handleUpload(false)}
            disabled={!file}
            className={`btn-primary w-full ${!file ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            🤖 AI ile Analiz Et
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--text-muted)]">veya</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          <button
            onClick={() => handleUpload(true)}
            className="btn-secondary w-full"
          >
            🎮 Demo İçerik Yükle
          </button>
        </>
      )}

      <div className="card p-4">
        <h3 className="font-semibold mb-3 text-sm">AI neler yapacak?</h3>
        <div className="flex flex-col gap-2">
          {[
            { icon: '📝', text: 'Kısa ve anlaşılır özet oluşturur' },
            { icon: '💡', text: 'Önemli kavramları listeler' },
            { icon: '🃏', text: '5 adet flashcard hazırlar' },
            { icon: '🎯', text: '5 çoktan seçmeli soru üretir' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2.5 text-sm text-[var(--text-muted)]">
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
