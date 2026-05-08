import UploadClient from '@/components/UploadClient'

export default function UploadPage() {
  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">İçerik Yükle</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          PDF veya metin dosyası yükle, AI otomatik özet ve quiz oluştursun
        </p>
      </div>
      <UploadClient />
    </div>
  )
}
