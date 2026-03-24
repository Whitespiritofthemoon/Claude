/**
 * BUGÜN — PAZARTESİ 24 MART 2026
 *
 * Bugün post yok. Sadece story paylaşılacak.
 * Bu dosya "bugün ne paylaşacağım?" sorusunun cevabı.
 *
 * Aşağıdaki içerikleri kopyala → Instagram Story'ne yapıştır.
 * Her story frame için Canva direktifleri verilmiştir.
 */

// ─────────────────────────────────────────────────────────────
// SABAH STORY — 08:00 (2 Frame)
// ─────────────────────────────────────────────────────────────

export const sabahStory = {
  frame1: {
    background: '#F5F0E8', // Warm Cream
    font: 'Playfair Display Bold',
    fontSize: 64,
    textColor: '#2C2C2C',
    text: 'Yeni bir hafta.\nYeni bir fırsat. 🌿',
    subtext: 'Bu hafta seninle çok şey konuşacağız.',
    subtextFont: 'DM Sans',
    subtextSize: 32,
    canvaInstructions: [
      '1. Canva\'da yeni Story (1080x1920) aç',
      '2. Arka plan rengi: #F5F0E8',
      '3. Ortaya Playfair Display Bold ile metni yaz',
      '4. Alt kısmına DM Sans ile subtext\'i yaz',
      '5. Sağ alt köşeye küçük: @psikologclaudiakonar',
    ],
  },
  frame2: {
    background: '#F5F0E8',
    stickerType: 'POLL',
    question: 'Bu hafta seni en çok zorlayan ne?',
    optionA: 'İş / Kariyer',
    optionB: 'İlişkiler / Aile',
    canvaInstructions: [
      '1. Aynı arka plan rengi',
      '2. Soruyu büyük fontla ortaya yaz',
      '3. Instagram\'da yayınlarken "Poll" sticker ekle',
      '4. Seçenekler: "İş / Kariyer" ve "İlişkiler / Aile"',
    ],
  },
};

// ─────────────────────────────────────────────────────────────
// AKŞAM STORY — 20:00 (2 Frame)
// ─────────────────────────────────────────────────────────────

export const aksamStory = {
  frame1: {
    background: '#A8C5B5', // Sage Green
    font: 'Playfair Display Italic',
    textColor: '#FFFFFF',
    text: '"Kendine nasıl davrandığını\ndüşünürken bir dur."',
    subtext: '— Claudia Konar, Psikolog',
    canvaInstructions: [
      '1. Canva\'da yeni Story aç',
      '2. Arka plan: #A8C5B5 (Sage Green)',
      '3. Ortaya beyaz Playfair Display Italic ile quote metni',
      '4. Altına küçük DM Sans ile imza',
    ],
  },
  frame2: {
    background: '#FAFAFA',
    stickerType: 'QUESTION',
    question: 'Bu hafta sana sormak istediğin bir psikoloji sorusu var mı?',
    subtext: 'Tüm soruları okuyorum. 💙',
    canvaInstructions: [
      '1. Beyaz arka plan',
      '2. Üste soruyu yaz',
      '3. Instagram\'da "Question" sticker ekle',
      '4. Altına "Tüm soruları okuyorum. 💙" yaz',
    ],
  },
};

// ─────────────────────────────────────────────────────────────
// BUGÜN YAPILACAKLAR KONTROL LİSTESİ
// ─────────────────────────────────────────────────────────────

export const bugunYapilacaklar = `
BUGÜN — 24 MART PAZARTESİ
─────────────────────────
☐ 08:00 — Sabah Story Frame 1 yayınla
          (Warm cream bg + "Yeni bir hafta" metni)

☐ 08:05 — Sabah Story Frame 2 yayınla
          (Poll: İş/Kariyer vs İlişkiler/Aile)

☐ Gün içi — Yarınki carousel'ı Canva'da tasarla
            (Anksiyete vs Kaygı - 9 slayt)
            → 01_mart_hafta1.md dosyasına bak

☐ 20:00 — Akşam Story Frame 1 yayınla
          (Sage green bg + quote)

☐ 20:05 — Akşam Story Frame 2 yayınla
          (Question box: Soru sor)

☐ Gece  — Poll sonuçlarını not al
          (Hangi konu kazandı → ileride o konuda içerik)
─────────────────────────
YARIN → Carousel post saat 19:00!
`;
