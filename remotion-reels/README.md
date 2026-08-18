# @psikologclaudiakonar — Reels Düzenleme (Remotion)

Ham çekimden (`3c4f74f9-...mov`, 720x1280, 2:03) üretilen Instagram Reels kurgusu.

## Yapılanlar

- **Kesim:** Sessizlik analiziyle (ffmpeg `silencedetect`) baş/son ölü hava ve
  0.4sn'den uzun konuşma boşlukları 0.3sn'ye kadar sıkıştırıldı. 122.9sn → 116.6sn.
- **Renk/ışık:** Hafif merkez kırpma (yakın plan hissi), pozlama/kontrast/doygunluk
  düzeltmesi, sıcak-cilt tonu renk dengesi, keskinlik. 1080x1920'ye yükseltildi (gerçek Reels çözünürlüğü).
- **Ses:** Loudness normalizasyonu (-16 LUFS), rumble filtresi.
- **Müzik:** Konuşmayla çakışmayan, düşük ses seviyeli (~%16), sözcük duraklarında
  daha da kısılan sentetik ambiyans pad (ffmpeg ile üretildi — dış kaynak müzik
  indirilemedi, ortamda internet erişimi npm/pypi ile sınırlı).
- **Marka bileşenleri:** Açılış kartı, alt/üst gradyan (vinyet + scrim), ince
  film grain, sol üstte `@psikologclaudiakonar` filigranı, kapanışta
  "Kaydet 🔖 paylaş 💬" CTA kartı — stratejideki krem/bej/koyu kahve palet ve
  serif+sans font kombinasyonuyla uyumlu (`src/theme.ts`).
- **Format:** 1080x1920 (9:16), 30fps — Reels/Story için hazır.

## Alt yazı (bekliyor)

Ortamda konuşma tanıma servisine erişim olmadığı için otomatik transkript
çıkarılamadı. Konuşulan metni (ya da yaklaşık akışını) verirsen:

1. `src/subtitles.json` içine `{ "start": 12.4, "end": 15.1, "text": "..." }`
   formatında zaman kodlu cümleler eklenir (saniye cinsinden, kurgulanmış
   116.6sn'lik zaman çizelgesine göre).
2. `src/components/Captions.tsx` bu dosyayı otomatik okuyup animasyonlu,
   markaya uygun alt yazı olarak basar — başka bir değişiklik gerekmez.

## Yeniden render etmek için

```bash
cd remotion-reels
npm install
npx remotion render src/index.ts Reel out/reel.mp4 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

Kaynak dosyalar `public/edited_graded.mp4` (kurgulanmış+renklendirilmiş ham görüntü)
ve `public/music_bed.mp3` (müzik).
