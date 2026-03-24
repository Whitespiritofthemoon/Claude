import { ReelScene } from '../compositions/TextReel';
import { CarouselSlide } from '../compositions/CarouselVideo';

// ─────────────────────────────────────────────────────────────
// ÇARŞAMBA 26 MART — REEL: "Sınır koymak bencillik değil"
// Süre: ~25 saniye
// ─────────────────────────────────────────────────────────────
export const sinirReelScenes: ReelScene[] = [
  {
    // HOOK: 0-3 sn
    lines: ['Sınır koymak', 'bencillik', 'DEĞİLDİR.'],
    background: 'white',
    durationSec: 3,
    fontSize: 88,
    fontFamily: 'heading',
    fontWeight: 'bold',
    animationStyle: 'spring',
  },
  {
    // 3-8 sn
    lines: ['Bencillik →', 'Başkasının haklarını', 'çiğnemek.'],
    background: 'cream',
    durationSec: 4.5,
    fontSize: 68,
    fontFamily: 'body',
    animationStyle: 'slide-up',
    showDividerBefore: true,
  },
  {
    // 8-13 sn
    lines: ['Sınır →', 'Kendi haklarını', 'korumak.'],
    background: 'sage',
    durationSec: 4.5,
    fontSize: 68,
    fontFamily: 'body',
    fontWeight: 'bold',
    animationStyle: 'slide-up',
    showDividerBefore: true,
  },
  {
    // 13-18 sn
    lines: ['Biri almak.', 'Diğeri kendine', 'sahip çıkmak.'],
    background: 'cream',
    durationSec: 4.5,
    fontSize: 68,
    fontFamily: 'heading',
    fontStyle: 'italic',
    animationStyle: 'fade',
    showDividerBefore: true,
  },
  {
    // 18-24 sn — duygusal vurgu
    lines: [
      'Sınır koyduğunda',
      'suçluluk hissediyorsan —',
      '',
      'bu seni yetiştiren',
      'sistemin sesi.',
      '',
      'Senin sesin değil.',
    ],
    background: 'white',
    durationSec: 6,
    fontSize: 58,
    fontFamily: 'heading',
    fontStyle: 'italic',
    animationStyle: 'fade',
    showDividerBefore: true,
  },
  {
    // Son frame: CTA
    lines: ['Kaydet. 📌', 'İhtiyacın olduğunda', 'tekrar oku.'],
    background: 'sage',
    durationSec: 3,
    fontSize: 64,
    fontFamily: 'body',
    fontWeight: 'bold',
    animationStyle: 'spring',
    showDividerBefore: true,
  },
];

// ─────────────────────────────────────────────────────────────
// SALI 25 MART — CAROUSEL VIDEO: Anksiyete vs Kaygı
// Her slayt 4 saniye = toplam ~36 saniye
// ─────────────────────────────────────────────────────────────
export const anksiyeteCarouselSlides: CarouselSlide[] = [
  {
    // SLAYT 1 — KAPAK
    isCover: true,
    title: 'Anksiyete mi,\nkaygı mı?',
    lines: ['Çoğu insan bu farkı bilmiyor.'],
    background: 'cream',
  },
  {
    // SLAYT 2
    slideNumber: '01 / 08',
    title: 'Kaygı nedir?',
    lines: [
      'Gerçek bir tehdide verilen,',
      'normal ve geçici bir tepki.',
      '',
      'Sınav öncesi gerginlik.',
      'Toplantı öncesi huzursuzluk.',
      '',
      'Bunlar kaygı. Ve bu tamamen normal.',
    ],
    background: 'white',
  },
  {
    // SLAYT 3
    slideNumber: '02 / 08',
    title: 'Anksiyete nedir?',
    lines: [
      'Gerçek bir tehdit olmasa bile',
      'devam eden, kronik alarm durumu.',
      '',
      'Uyurken bile sürebilir.',
      'Sebep olmadan gelebilir.',
      'Hayatını kısıtlamaya başlayabilir.',
    ],
    background: 'cream',
  },
  {
    // SLAYT 4 — VURGU
    isHighlight: true,
    slideNumber: '03 / 08',
    lines: ['"Kaygı seni korur.', 'Anksiyete seni tüketir."'],
    background: 'sage',
    accentColor: '#F5F0E8',
  },
  {
    // SLAYT 5
    slideNumber: '04 / 08',
    title: 'Temel farklar',
    lines: ['Kaygı:', '→ Belirli bir sebebe bağlı', '→ Geçicidir', '→ İşlevselliği bozmaz', '', 'Anksiyete:', '→ Sebebi belirsiz olabilir', '→ Kronikleşir', '→ Günlük hayatı etkiler'],
    background: 'white',
  },
  {
    // SLAYT 6
    slideNumber: '05 / 08',
    title: 'Beyinde ne oluyor?',
    lines: [
      'İkisi de amigdaladan başlar —',
      'beynin alarm merkezi.',
      '',
      'Kaygıda alarm çalar, tehlike',
      'geçer, durur.',
      '',
      'Anksiyetede alarm sistemi',
      'sürekli açık kalır.',
    ],
    background: 'cream',
  },
  {
    // SLAYT 7
    slideNumber: '06 / 08',
    title: 'Bu sana tanıdık geliyor mu?',
    lines: [
      'Türkiye\'de her 5 kişiden 1\'i',
      'anksiyete bozukluğu yaşıyor.',
      '',
      'Ama pek çoğu bunu sadece',
      '"aşırı düşünceli olmak"',
      'olarak etiketliyor.',
    ],
    background: 'white',
  },
  {
    // SLAYT 8 — ARAÇLAR
    slideNumber: '07 / 08',
    title: 'Ne yapabilirsin?',
    background: 'sage',
    lines: [],
    bullets: [
      '4-7-8 nefes tekniğini dene',
      'Bedenini fark et — kasılma nerede?',
      'Düşünceyi test et: "Bu tehlike gerçek mi?"',
      'Gerekirse destek al — anksiyete tedavi edilebilir',
    ],
  },
  {
    // SLAYT 9 — SON
    slideNumber: '08 / 08',
    title: 'Hangi durumla\ndaha çok mücadele\nediyorsun?',
    lines: ['Yorumda paylaş 👇', '', 'Kaydet 📌 — ileride işine yarayabilir.'],
    background: 'cream',
  },
];

// ─────────────────────────────────────────────────────────────
// PERŞEMBE — QUOTE REEL: "İyileşmek doğrusal değildir"
// ─────────────────────────────────────────────────────────────
export const iyilesmeQuoteScenes: ReelScene[] = [
  {
    lines: ['"İyileşmek', 'doğrusal değildir."'],
    background: 'sage',
    durationSec: 3.5,
    fontSize: 82,
    fontFamily: 'quote',
    fontStyle: 'italic',
    animationStyle: 'fade',
  },
  {
    lines: ['İki adım ileri,', 'bir adım geri.'],
    background: 'white',
    durationSec: 3.5,
    fontSize: 72,
    fontFamily: 'heading',
    fontStyle: 'italic',
    animationStyle: 'slide-up',
    showDividerBefore: true,
  },
  {
    lines: ['Bu başarısızlık değil —', 'sürecin kendisi.'],
    background: 'cream',
    durationSec: 4,
    fontSize: 68,
    fontFamily: 'heading',
    fontStyle: 'italic',
    animationStyle: 'fade',
    showDividerBefore: true,
  },
  {
    lines: ['— Claudia Konar,', 'Psikolog'],
    background: 'sage',
    durationSec: 3,
    fontSize: 54,
    fontFamily: 'body',
    fontStyle: 'italic',
    fontWeight: 'normal',
    animationStyle: 'spring',
    showDividerBefore: true,
  },
];
