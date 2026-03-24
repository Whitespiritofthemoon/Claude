import { ReelScene } from '../compositions/TextReel';
import { CarouselSlide } from '../compositions/CarouselVideo';

// ─────────────────────────────────────────────────────────────
// ÇARŞAMBA 9 NİSAN — REEL: Gaslighting nedir?
// ─────────────────────────────────────────────────────────────
export const gaslightingReelScenes: ReelScene[] = [
  {
    lines: ['"Sen aşırı duyarlısın."', '"Öyle bir şey demedim."', '"Hayal ediyorsun."'],
    background: 'white',
    durationSec: 4,
    fontSize: 60,
    fontFamily: 'heading',
    fontStyle: 'italic',
    animationStyle: 'fade',
  },
  {
    lines: ['Bu cümleler tanıdık', 'geliyorsa —', '', 'gaslighting görmüş', 'olabilirsin.'],
    background: 'cream',
    durationSec: 4.5,
    fontSize: 66,
    fontFamily: 'body',
    animationStyle: 'slide-up',
    showDividerBefore: true,
  },
  {
    lines: ['Gaslighting:', '', 'Birinin kendi gerçekliğini', 'sorgulamasını', 'sağlamak.'],
    background: 'sage',
    durationSec: 4.5,
    fontSize: 62,
    fontFamily: 'heading',
    fontWeight: 'bold',
    animationStyle: 'spring',
    showDividerBefore: true,
  },
  {
    lines: ['Zamanla şunu', 'hissettiriyor:', '', '"Belki ben gerçekten', 'çok abartıyorum."', '"Belki sorun bende."'],
    background: 'white',
    durationSec: 5,
    fontSize: 58,
    fontFamily: 'body',
    fontStyle: 'italic',
    animationStyle: 'fade',
    showDividerBefore: true,
  },
  {
    lines: ['Sorun sende değil.', '', 'Gerçekliğini sorgulatmak', 'bir manipülasyon', 'biçimidir.'],
    background: 'cream',
    durationSec: 5,
    fontSize: 62,
    fontFamily: 'heading',
    fontWeight: 'bold',
    animationStyle: 'slide-up',
    showDividerBefore: true,
  },
  {
    lines: ['Bunu kaydet.', 'Oku. Ve kendine', 'inan. 📌'],
    background: 'sage',
    durationSec: 3,
    fontSize: 68,
    fontFamily: 'body',
    fontWeight: 'bold',
    animationStyle: 'spring',
    showDividerBefore: true,
  },
];

// ─────────────────────────────────────────────────────────────
// SALI 8 NİSAN — CAROUSEL: Narsizm Döngüsü
// ─────────────────────────────────────────────────────────────
export const narsizmCarouselSlides: CarouselSlide[] = [
  {
    isCover: true,
    title: 'Aşk bombalaması.\nİdealleştirme.\nDeğersizleştirme.\nTerk etme.',
    lines: ['Ve başa dön.', '', 'Narsistik ilişki döngüsü.'],
    background: 'mauve',
  },
  {
    slideNumber: '01 / 08',
    title: 'Narsistik Kişilik Bozukluğu nedir?',
    lines: [
      'Büyüklük duygusu, empati eksikliği',
      've hayranlık ihtiyacıyla',
      'karakterize bir kişilik yapısı.',
      '',
      'Dikkat: Her narsist aynı değil.',
      'Gizli narsizm daha tehlikeli.',
    ],
    background: 'white',
  },
  {
    slideNumber: '02 / 08',
    title: 'Açık Narsist',
    lines: [
      '→ Dikkat çekmeyi sever',
      '→ "Ben her şeyin en iyisiyim"',
      '→ Kolayca fark edilir',
      '→ Eleştiriye şiddetle tepki',
      '→ Güçlü görünür',
    ],
    background: 'cream',
  },
  {
    slideNumber: '03 / 08',
    title: 'Gizli (Örtük) Narsist',
    lines: [
      '→ Kurban rolünde görünür',
      '→ Pasif-agresiftir',
      '→ "Kimse beni anlamıyor"',
      '→ Manipülasyonu ince ve sinsi',
      '→ Fark edilmesi çok zor',
    ],
    background: 'white',
  },
  {
    isHighlight: true,
    slideNumber: '04 / 08',
    title: '"Aşk bombalaması"',
    lines: [
      'İlişkinin başında: Fazla ilgi,',
      'aşırı övgü, "seninle olmak',
      'hayatımın en güzel şeyi."',
      '',
      'Bu yoğunluk gerçek değil.',
      'Seni bağlamak için.',
    ],
    background: 'sage',
  },
  {
    slideNumber: '05 / 08',
    title: 'Döngünün aşamaları:',
    lines: [
      '1. İDEALLEŞTİRME',
      '   "Mükemmelsin. Seni çılgınca seviyorum."',
      '',
      '2. DEĞERSİZLEŞTİRME',
      '   Eleştiri, aşağılama, görmezden gelme.',
      '',
      '3. TERK ETME — Uzaklaşma.',
      '',
      '4. GERİ DÖNME — Kontrol ihtiyacı.',
    ],
    background: 'cream',
  },
  {
    slideNumber: '06 / 08',
    title: 'Neden bırakmak bu kadar zor?',
    lines: [
      'Travma bağı oluşur.',
      '',
      'Acı ve haz dönüşümlü gelince',
      'beyin bağımlılık benzeri tepki verir.',
      '',
      'Kortizol + dopamin kombinasyonu',
      'seni o ilişkiye "yapıştırır."',
      '',
      'Bu senin zayıflığın değil.',
    ],
    background: 'white',
  },
  {
    slideNumber: '07 / 08',
    title: 'Ne yapabilirsin?',
    background: 'sage',
    lines: [],
    bullets: [
      'Bu döngüyü gör ve adlandır',
      'Güvendiğin birine anlat',
      'Travma bağını çözmek için terapi',
      'Güvenli bir çıkış planla',
    ],
  },
  {
    slideNumber: '08 / 08',
    title: 'Bu döngüyü tanıdın mı?',
    lines: [
      'Yorumda bir kelime yetişsin 👇',
      '"Tanıdım" dersen yeterli.',
      '',
      'Kaydet 📌 — ihtiyacı olan biri için.',
    ],
    background: 'cream',
  },
];
