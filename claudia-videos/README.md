# @psikologclaudiakonar — Remotion Video Üretim Sistemi

Tüm Instagram Reels ve Carousel videoları otomatik olarak bu sistemle üretilir.

## Kurulum (İlk Kez)

```bash
cd claudia-videos
npm install
```

## Studio'yu Başlat (Önizleme)

```bash
npm start
```
Tarayıcıda `http://localhost:3000` adresine git → Tüm videoları önizle

## Video Render Et

### Tek Video Render
```bash
# Hafta 1 Reel — Sınır koymak bencillik değil
npx remotion render src/index.ts Reel_Sinir_Bencillik --output out/reel_sinir.mp4

# Hafta 1 Carousel — Anksiyete vs Kaygı
npx remotion render src/index.ts Carousel_Anksiyete_Kaygi --output out/carousel_anksiyete.mp4

# Hafta 2 Reel — Toksik ilişki 5 soru
npx remotion render src/index.ts Reel_Toksik_5_Soru --output out/reel_toksik.mp4

# Hafta 2 Carousel — DEHB
npx remotion render src/index.ts Carousel_DEHB_Yetiskin --output out/carousel_dehb.mp4

# Hafta 3 Carousel — Narsizm
npx remotion render src/index.ts Carousel_Narsizm_Dongusu --output out/carousel_narsizm.mp4

# Hafta 3 Reel — Gaslighting
npx remotion render src/index.ts Reel_Gaslighting --output out/reel_gaslighting.mp4

# Hafta 4 Carousel — VR Terapi
npx remotion render src/index.ts Carousel_VR_Terapi --output out/carousel_vr_terapi.mp4

# Hafta 4 Reel — Dijital Tükenmişlik
npx remotion render src/index.ts Reel_Dijital_Tukenmislik --output out/reel_dijital.mp4
```

### Tüm Videoları Render Et
```bash
mkdir -p out
for id in Reel_Sinir_Bencillik Carousel_Anksiyete_Kaygi Reel_Iyilesme_Quote \
           Carousel_DEHB_Yetiskin Reel_Toksik_5_Soru \
           Carousel_Narsizm_Dongusu Reel_Gaslighting \
           Carousel_VR_Terapi Reel_Dijital_Tukenmislik; do
  npx remotion render src/index.ts $id --output out/${id}.mp4
done
```

## Video Listesi — Nisan 2026

| Composition ID | İçerik | Gün | Format |
|---|---|---|---|
| `Reel_Sinir_Bencillik` | Sınır koymak bencillik değil | Çar 26 Mart | 1080x1920 Reel |
| `Carousel_Anksiyete_Kaygi` | Anksiyete vs Kaygı farkı | Sal 25 Mart | 1080x1350 Carousel |
| `Reel_Iyilesme_Quote` | İyileşmek doğrusal değildir | Per 27 Mart | 1080x1920 Reel |
| `Carousel_DEHB_Yetiskin` | Yetişkin DEHB | Sal 1 Nisan | 1080x1350 Carousel |
| `Reel_Toksik_5_Soru` | Toksik ilişkide misin? | Çar 2 Nisan | 1080x1920 Reel |
| `Carousel_Narsizm_Dongusu` | Narsizm döngüsü | Sal 8 Nisan | 1080x1350 Carousel |
| `Reel_Gaslighting` | Gaslighting nedir? | Çar 9 Nisan | 1080x1920 Reel |
| `Carousel_VR_Terapi` | VR Terapi | Sal 15 Nisan | 1080x1350 Carousel |
| `Reel_Dijital_Tukenmislik` | Dijital Tükenmişlik | Çar 16 Nisan | 1080x1920 Reel |

## Yeni İçerik Eklemek

1. `src/data/` klasöründe yeni bir dosya oluştur (örn. `week5.ts`)
2. `ReelScene[]` veya `CarouselSlide[]` tipinde data yaz
3. `src/Root.tsx`'e yeni `<Composition>` bloğu ekle
4. `npm start` ile önizle, `npx remotion render` ile export et

## Ses Eklemek

1. `public/` klasörüne `.mp3` dosyası koy (örn. `bgmusic.mp3`)
2. Composition defaultProps'una ekle:
   ```tsx
   defaultProps={{ scenes: ..., backgroundMusic: 'bgmusic.mp3', musicVolume: 0.3 }}
   ```

## Proje Yapısı

```
claudia-videos/
├── src/
│   ├── index.ts          ← Giriş noktası
│   ├── Root.tsx          ← Tüm composition'lar burada kayıtlı
│   ├── theme.ts          ← Renkler, fontlar, boyutlar
│   ├── components/
│   │   ├── TextFrame.tsx      ← Tekli animasyonlu metin sahnesi
│   │   ├── AccentDivider.tsx  ← Sahneler arası geçiş
│   │   └── WatermarkOverlay.tsx ← @psikologclaudiakonar logosu
│   ├── compositions/
│   │   ├── TextReel.tsx       ← Reel video şablonu
│   │   └── CarouselVideo.tsx  ← Carousel video şablonu
│   └── data/
│       ├── TODAY_24mart.ts    ← BUGÜN ne paylaşılacak
│       ├── week1.ts           ← 24-30 Mart içerikleri
│       ├── week2.ts           ← 31 Mart - 6 Nisan
│       ├── week3.ts           ← 7-13 Nisan
│       └── week4.ts           ← 14-20 Nisan
├── public/               ← Ses dosyaları buraya
├── out/                  ← Render edilen videolar buraya
├── package.json
└── tsconfig.json
```
