import { ReelScene } from '../compositions/TextReel';
import { CarouselSlide } from '../compositions/CarouselVideo';

// ─────────────────────────────────────────────────────────────
// SALI 1 NİSAN — CAROUSEL: Yetişkin DEHB
// ─────────────────────────────────────────────────────────────
export const dehbCarouselSlides: CarouselSlide[] = [
  {
    isCover: true,
    title: 'Yetişkin DEHB.',
    lines: ['Kimse sana söylememişti ki.', '', 'Ve bu, hayatını nasıl şekillendirdi?'],
    background: 'cream',
  },
  {
    slideNumber: '01 / 08',
    title: 'DEHB sadece çocuklara ait değil.',
    lines: [
      'Yetişkin DEHB olanların %60\'ı',
      'tanı almadan hayatını sürdürüyor.',
    ],
    background: 'white',
  },
  {
    slideNumber: '02 / 08',
    title: 'Belki sen de şunları yaşıyorsundur:',
    lines: [],
    bullets: [
      'Toplantılarda odaklanamıyorsun',
      'İşi sürekli erteliyorsun',
      'Kafanda sürekli gürültü var',
      'Bir şeyi başlatıyorsun ama bitiremiyorsun',
      '"Tembel" ya da "sorumsuz" etiketleniyorsun',
    ],
    background: 'cream',
  },
  {
    isHighlight: true,
    slideNumber: '03 / 08',
    lines: ['"Tembellik değil.', 'Sorumsuzluk değil.', 'Beynin farklı çalışıyor."'],
    background: 'sage',
  },
  {
    slideNumber: '04 / 08',
    title: 'DEHB beyni ne yapar?',
    lines: [
      'Dopamin eksikliği yaşar.',
      '',
      '→ Sıkıcı işlere odaklanmak neredeyse imkânsız',
      '→ İlgi çekici işlerde "hyperfocus" yaşanır',
      '→ Duygusal yoğunluk çok yüksek',
    ],
    background: 'white',
  },
  {
    slideNumber: '05 / 08',
    title: 'MOXO Dikkat Testi nedir?',
    lines: [
      'DEHB tanısında kullanılan',
      'bilgisayar tabanlı bir test.',
      '',
      'Standart anketlerden',
      'çok daha objektif sonuç verir.',
      '',
      'Değerlendirme için bir uzmana',
      'başvurulabilir.',
    ],
    background: 'cream',
  },
  {
    slideNumber: '06 / 08',
    title: 'Ne yapılabilir?',
    background: 'sage',
    lines: [],
    bullets: [
      'Klinisyenden değerlendirme',
      'İlaç tedavisi (psikiyatrist ile)',
      'Bilişsel davranışçı terapi',
      'Pomodoro tekniği (25 dk odak / 5 dk mola)',
      'Yapılandırılmış rutin',
    ],
  },
  {
    slideNumber: '07 / 08',
    title: 'DEHB bir eksiklik değil.',
    lines: [
      '→ Yüksek yaratıcılık',
      '→ Kriz anında üretkenlik',
      '→ Yüksek empati kapasitesi',
      '→ Hyperfocus gücü',
      '',
      'Fark = Doğru araçları bulmak.',
    ],
    background: 'white',
  },
  {
    slideNumber: '08 / 08',
    title: 'Bu belirtilerden tanıdık gelenler var mı?',
    lines: ['Yorumda paylaş 👇', '', 'Kaydet 📌 — ihtiyacı olan biri tanıyor musun?'],
    background: 'cream',
  },
];

// ─────────────────────────────────────────────────────────────
// ÇARŞAMBA 2 NİSAN — REEL: Toksik ilişkide misin? 5 soru
// ─────────────────────────────────────────────────────────────
export const toksikSoruReelScenes: ReelScene[] = [
  {
    lines: ['Sana 5 şey soracağım.', 'Dürüstçe cevapla.'],
    background: 'white',
    durationSec: 3,
    fontSize: 74,
    fontFamily: 'heading',
    fontWeight: 'bold',
    animationStyle: 'spring',
  },
  {
    lines: ['1.', '', 'Kendini sürekli', 'savunmak zorunda', 'hissediyor musun?'],
    background: 'cream',
    durationSec: 4,
    fontSize: 64,
    fontFamily: 'body',
    animationStyle: 'slide-up',
    showDividerBefore: true,
  },
  {
    lines: ['2.', '', 'Onunla geçirdiğin', 'zamandan sonra', 'yorgun mu çıkıyorsun?'],
    background: 'white',
    durationSec: 4,
    fontSize: 64,
    fontFamily: 'body',
    animationStyle: 'slide-up',
    showDividerBefore: true,
  },
  {
    lines: ['3.', '', '"Aşırı duyarlı"', 'olduğun söyleniyor', 'mu sana?'],
    background: 'cream',
    durationSec: 4,
    fontSize: 64,
    fontFamily: 'body',
    animationStyle: 'slide-up',
    showDividerBefore: true,
  },
  {
    lines: ['4.', '', 'İhtiyaçların', 'abartılı mı', 'görünüyor?'],
    background: 'white',
    durationSec: 4,
    fontSize: 64,
    fontFamily: 'body',
    animationStyle: 'slide-up',
    showDividerBefore: true,
  },
  {
    lines: ['5.', '', 'Onunla olmadan', 'daha iyi mi', 'hissediyorsun?'],
    background: 'cream',
    durationSec: 4,
    fontSize: 64,
    fontFamily: 'body',
    animationStyle: 'slide-up',
    showDividerBefore: true,
  },
  {
    lines: ['Eğer birden fazlası', '"evet" ise —', '', 'bu fark etmen', 'gereken bir şey.'],
    background: 'sage',
    durationSec: 5,
    fontSize: 64,
    fontFamily: 'heading',
    fontStyle: 'italic',
    animationStyle: 'fade',
    showDividerBefore: true,
  },
  {
    lines: ['Kaydet. 📌', 'Ve kendine', 'dürüst ol.'],
    background: 'white',
    durationSec: 3,
    fontSize: 68,
    fontFamily: 'body',
    fontWeight: 'bold',
    animationStyle: 'spring',
    showDividerBefore: true,
  },
];
