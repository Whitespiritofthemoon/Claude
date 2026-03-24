import { ReelScene } from '../compositions/TextReel';
import { CarouselSlide } from '../compositions/CarouselVideo';

// ─────────────────────────────────────────────────────────────
// ÇARŞAMBA 16 NİSAN — REEL: Dijital Tükenmişlik
// ─────────────────────────────────────────────────────────────
export const dijitalTukenmislikReelScenes: ReelScene[] = [
  {
    lines: ['Telefona bakıyorsun.', 'Ama aslında', 'hiçbir şey görmüyorsun.'],
    background: 'white',
    durationSec: 3.5,
    fontSize: 70,
    fontFamily: 'heading',
    fontWeight: 'bold',
    animationStyle: 'spring',
  },
  {
    lines: ['Bu "dijital tükenmişlik."', '', 'Ve düşündüğünden', 'çok daha yaygın.'],
    background: 'cream',
    durationSec: 4,
    fontSize: 66,
    fontFamily: 'body',
    animationStyle: 'slide-up',
    showDividerBefore: true,
  },
  {
    lines: ['Belirtiler:', '', '→ Bildirim gelince', '   kaygı hissediyorsun.', '', '→ İçerik aklında kalmıyor.'],
    background: 'white',
    durationSec: 5,
    fontSize: 58,
    fontFamily: 'body',
    animationStyle: 'fade',
    showDividerBefore: true,
  },
  {
    lines: ['→ Sosyal medya hem', '   sıkıyor hem', '   bırakamıyorsun.', '', '→ "5 dakika" diyorsun,', '   45 dakika geçiyor.'],
    background: 'cream',
    durationSec: 5,
    fontSize: 58,
    fontFamily: 'body',
    animationStyle: 'fade',
    showDividerBefore: true,
  },
  {
    lines: ['Beyin, sürekli', 'uyarılmaya alıştığında', 'dinlenmesini unutur.', '', 'Bu bir tercih değil.', 'Bu bir alışkanlık döngüsü.'],
    background: 'sage',
    durationSec: 5,
    fontSize: 60,
    fontFamily: 'heading',
    fontStyle: 'italic',
    animationStyle: 'fade',
    showDividerBefore: true,
  },
  {
    lines: ['Yarın telefonu', '1 saat bırak.', '', 'Ne değişiyor', 'fark et. 📵'],
    background: 'white',
    durationSec: 4,
    fontSize: 68,
    fontFamily: 'body',
    fontWeight: 'bold',
    animationStyle: 'spring',
    showDividerBefore: true,
  },
];

// ─────────────────────────────────────────────────────────────
// SALI 15 NİSAN — CAROUSEL: VR Terapi
// ─────────────────────────────────────────────────────────────
export const vrTerapiCarouselSlides: CarouselSlide[] = [
  {
    isCover: true,
    title: 'Terapi artık\nsanal gerçeklikte.',
    lines: ['VR Terapi nedir?', 'Nasıl çalışır?', 'Kim için?'],
    background: 'night',
  },
  {
    slideNumber: '01 / 07',
    title: 'VR Terapi nedir?',
    lines: [
      'Sanal gerçeklik gözlüğü ile',
      'kontrollü ortamlarda terapötik',
      'deneyimler yaşanmasına dayanan',
      'bir tedavi yöntemi.',
      '',
      'Beyin simüle edilmiş ortamları',
      'gerçekmiş gibi işler.',
    ],
    background: 'white',
  },
  {
    slideNumber: '02 / 07',
    title: 'Hangi durumlarda kullanılıyor?',
    background: 'cream',
    lines: [],
    bullets: [
      'Özgül fobiler (uçak, yükseklik)',
      'PTSD (travma sonrası stres)',
      'Sosyal anksiyete',
      'Otizm — sosyal beceri gelişimi',
      'Yeme bozuklukları — beden algısı',
      'Depresyon — olumlu anı yeniden yaşatma',
    ],
  },
  {
    isHighlight: true,
    slideNumber: '03 / 07',
    title: 'Fobide nasıl çalışır?',
    lines: [
      '"Maruz bırakma terapisi"',
      'artık gerçek ortam gerektirmiyor.',
      '',
      'Güvenli ortamda beyin',
      'bu deneyimi gerçek yaşıyor',
      've yeniden öğrenme başlıyor.',
    ],
    background: 'sage',
  },
  {
    slideNumber: '04 / 07',
    title: 'PTSD tedavisinde devrim',
    lines: [
      'ABD\'de savaş gazileri için',
      'geliştirilen VR sistemleri,',
      '%80 iyileşme oranı rapor ediyor.',
      '',
      'Travmatik anı, kontrollü ve',
      'güvenli ortamda yeniden işleniyor.',
    ],
    background: 'white',
  },
  {
    slideNumber: '05 / 07',
    title: 'Türkiye\'de VR terapi',
    lines: [
      'Henüz yaygın değil,',
      'ama büyük şehirlerde',
      'bazı kliniklerde uygulanıyor.',
      '',
      'Önümüzdeki 5 yılda çok daha',
      'erişilebilir olacak.',
    ],
    background: 'cream',
  },
  {
    slideNumber: '06 / 07',
    title: 'Peki ya yapay zeka (AI)?',
    lines: [
      'AI artık:',
      '→ Ruh hali takip ediyor',
      '→ Kriz anında destek veriyor',
      '→ Terapist ile seans aralarını dolduruyor',
      '',
      'UYARI: AI terapistin yerini alamaz.',
      'Ama destekleyebilir.',
    ],
    background: 'white',
  },
  {
    slideNumber: '07 / 07',
    title: 'VR terapi hakkında\nne düşünüyorsun?',
    lines: ['Yorumda paylaş 👇', '', 'Kaydet 📌 — psikoloji meraklısına ilet.'],
    background: 'night',
  },
];
