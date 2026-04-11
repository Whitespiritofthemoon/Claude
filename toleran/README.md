# Toleran — Kişisel Beslenme Karar Destek Uygulaması

> **"Bunu yiyebilir miyim?"** sorusuna 7/24 kişiselleştirilmiş, kaynaklı ve güvenli yanıt.

Toleran, gıda intoleransı, alerjisi, çölyak hastalığı veya beslenme duyarlılıkları olan
bireyler için geliştirilmiş, Claude AI destekli bir mobil-öncelikli karar destek
uygulamasıdır.

## MVP Özellikleri

- **Onboarding** — 6 adımlı kişisel profil kurma akışı
- **AI Sohbet Asistanı** — 7/24 beslenme karar desteği (Claude Sonnet, prompt caching)
- **İçerik Analizi** — Metin, barkod ve fotoğraf ile ürün güvenlik analizi
- **Ülke Bazlı Markalar** — TR, DE, GB, US için yerel marka önerileri
- **Tarif Motoru** — Kısıtlamalara uygun tarifler ve malzeme alternatifleri
- **Semptom Günlüğü** — Beslenme-reaksiyon takibi ve örüntü analizi
- **Alışveriş Listesi** — Tariflerden otomatik liste oluşturma
- **Güvenlik Katmanı** — Acil durum tespiti ve yönlendirme

## Kurulum

```bash
cd toleran
npm install

# .env dosyası oluşturun
cp .env.example .env.local
# ANTHROPIC_API_KEY= değerini ekleyin

npm run dev
```

## Teknik Yığın

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Stil | Tailwind CSS (özel tasarım sistemi) |
| State | Zustand + localStorage |
| AI | Anthropic Claude API (claude-sonnet-4-6) |
| Deployment | Vercel |

## Tasarım Sistemi

- **Primary:** Sage Green `#5B8A7A` — güven, doğallık
- **Accent:** Warm Coral `#E8856A` — enerji, eylem
- **Background:** `#F8F6F2` — sıcak beyaz
- **Güvenlik:** ✅ Yeşil / ⚠️ Sarı / 🚫 Kırmızı / ❓ Gri

## Önemli Notlar

- Uygulama **tanı koymaz**, karar desteği sunar
- Alerji ile intolerans kesinlikle ayrı tutulur
- Acil semptomlar (nefes darlığı, boğaz şişmesi) algılandığında 112 yönlendirmesi yapılır
- Tüm veriler MVP'de client-side (localStorage) saklanır

## Ekranlar

```
/ → Splash (kullanıcıya göre yönlendir)
/onboarding → 6 adımlı profil kurma
/home → Ana sayfa dashboard
/chat → AI sohbet asistanı
/scan → Barkod / içerik analizi
/recipes → Tarif listesi ve detay
/symptom-log → Semptom günlüğü
/profile → Profil ve alışveriş listesi
```

## API Endpoints

```
POST /api/chat     → Claude AI sohbet
POST /api/analyze  → İçerik güvenlik analizi
POST /api/recipes  → Tarif önerisi
```

---

*Toleran — "Bunu yiyebilir miyim?" sorusunun en iyi cevabı.*
