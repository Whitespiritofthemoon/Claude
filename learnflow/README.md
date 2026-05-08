# LearnFlow — AI Destekli Mobil Öğrenme Uygulaması

**"Sosyal medya kaydırma alışkanlığını öğrenmeye dönüştür"**

## Özellikler

- **Kullanıcı Hesap Yönetimi** — E-posta ile kayıt/giriş, JWT oturum yönetimi
- **AI İçerik Analizi** — Claude API ile otomatik özet, önemli kavramlar, flashcard'lar ve quiz soruları
- **Instagram Tarzı Akış** — Sonsuz kaydırmalı, animasyonlu içerik kartları
- **Quiz Modülü** — 5 soruluk çoktan seçmeli, anında geri bildirim, puan sistemi
- **Flashcard Destesi** — Çevrilebilir kart animasyonu ile interaktif tekrar
- **Gamification** — Puan sistemi, seviyeler, rozetler, günlük giriş ödülleri, seri bonusu
- **Profil & İstatistikler** — Günlük aktivite grafiği, quiz geçmişi, rozet galerisi
- **Arama & Filtreleme** — Başlık/içerik araması, popüler/yeni/favori filtreleri
- **Çalışma Planı** — Haftalık hedef belirleme ve ilerleme takibi

## Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Dil | TypeScript |
| Stil | Tailwind CSS v4 (custom dark theme) |
| Veritabanı | SQLite via Prisma 7 + libsql |
| Auth | Jose (JWT) + httpOnly cookies |
| AI | Anthropic Claude API |
| Grafikler | Recharts |
| Animasyonlar | Framer Motion |

## Kurulum

```bash
cd learnflow
npm install

# Prisma migrations
npx prisma migrate dev

# Badge seed
node -e "..."  # (see src/lib/gamification.ts seedBadges)

# Geliştirme sunucusu
npm run dev
```

## Ortam Değişkenleri

`.env` dosyasını düzenleyin:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
ANTHROPIC_API_KEY="sk-ant-..."  # Opsiyonel, yoksa demo içerik kullanılır
```

## AI Özelliği Hakkında

`ANTHROPIC_API_KEY` ayarlanmadığında uygulama otomatik olarak demo içerik kullanır.
API key ayarlandığında yüklenen PDF/metin dosyasını Claude ile analiz eder ve üretir:
- Özet (2-3 paragraf)
- 5 önemli kavram
- 5 flashcard (soru/cevap)
- 5 çoktan seçmeli quiz sorusu

## Sayfa Yapısı

```
/               → Landing page
/login          → Giriş sayfası
/register       → Kayıt sayfası
/feed           → Ana akış (sıralama: yeni/popüler/favoriler)
/upload         → Dosya yükleme + AI analiz
/content/[id]   → İçerik detay, flashcard destesi
/quiz/[id]      → Interaktif quiz
/search         → Arama ve filtreleme
/plan           → Haftalık çalışma planı
/profile        → Profil, istatistikler, rozetler
```

## Puan Sistemi

| Eylem | Puan |
|-------|------|
| İçerik yükleme | +20 |
| İçerik görüntüleme | +2 |
| Quiz tamamlama | +30 |
| Mükemmel quiz (%100) | +50 |
| Günlük giriş | +10 |
| 7 gün seri bonusu | +5/7gün |
| Favoriye ekleme | +3 |
