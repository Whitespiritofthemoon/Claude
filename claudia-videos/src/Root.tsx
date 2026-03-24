import React from 'react';
import { Composition } from 'remotion';
import { TextReel } from './compositions/TextReel';
import { CarouselVideo } from './compositions/CarouselVideo';
import { SIZES, TIMING } from './theme';

// Hafta 1 içerikleri
import {
  sinirReelScenes,
  anksiyeteCarouselSlides,
  iyilesmeQuoteScenes,
} from './data/week1';

// Hafta 2 içerikleri
import {
  dehbCarouselSlides,
  toksikSoruReelScenes,
} from './data/week2';

// Hafta 3 içerikleri
import {
  gaslightingReelScenes,
  narsizmCarouselSlides,
} from './data/week3';

// Hafta 4 içerikleri
import {
  dijitalTukenmislikReelScenes,
  vrTerapiCarouselSlides,
} from './data/week4';

// ── Yardımcı: saniye → frame ──────────────────────────────────
const secToFrames = (scenes: { durationSec: number; showDividerBefore?: boolean }[]) => {
  const DIVIDER_SEC = 0.5;
  return Math.ceil(
    scenes.reduce(
      (total, s, i) =>
        total + s.durationSec + (s.showDividerBefore && i > 0 ? DIVIDER_SEC : 0),
      0
    ) * TIMING.fps
  );
};

const carouselFrames = (slideCount: number, durationSec = 4) =>
  slideCount * durationSec * TIMING.fps;

// ── Remotion Composition Listesi ─────────────────────────────
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ══════════════════════════════════════════════════════
          HAFTA 1 — 24-30 Mart
          ══════════════════════════════════════════════════════ */}

      {/* Çarşamba 26 Mart — Reel: Sınır koymak bencillik değil */}
      <Composition
        id="Reel_Sinir_Bencillik"
        component={TextReel}
        durationInFrames={secToFrames(sinirReelScenes)}
        fps={TIMING.fps}
        width={SIZES.reelWidth}
        height={SIZES.reelHeight}
        defaultProps={{ scenes: sinirReelScenes }}
      />

      {/* Salı 25 Mart — Carousel: Anksiyete vs Kaygı */}
      <Composition
        id="Carousel_Anksiyete_Kaygi"
        component={CarouselVideo}
        durationInFrames={carouselFrames(anksiyeteCarouselSlides.length)}
        fps={TIMING.fps}
        width={SIZES.carouselWidth}
        height={SIZES.carouselHeight}
        defaultProps={{ slides: anksiyeteCarouselSlides }}
      />

      {/* Perşembe — Quote Reel: İyileşmek doğrusal değildir */}
      <Composition
        id="Reel_Iyilesme_Quote"
        component={TextReel}
        durationInFrames={secToFrames(iyilesmeQuoteScenes)}
        fps={TIMING.fps}
        width={SIZES.reelWidth}
        height={SIZES.reelHeight}
        defaultProps={{ scenes: iyilesmeQuoteScenes }}
      />

      {/* ══════════════════════════════════════════════════════
          HAFTA 2 — 31 Mart - 6 Nisan
          ══════════════════════════════════════════════════════ */}

      {/* Salı 1 Nisan — Carousel: Yetişkin DEHB */}
      <Composition
        id="Carousel_DEHB_Yetiskin"
        component={CarouselVideo}
        durationInFrames={carouselFrames(dehbCarouselSlides.length)}
        fps={TIMING.fps}
        width={SIZES.carouselWidth}
        height={SIZES.carouselHeight}
        defaultProps={{ slides: dehbCarouselSlides }}
      />

      {/* Çarşamba 2 Nisan — Reel: Toksik ilişki 5 soru */}
      <Composition
        id="Reel_Toksik_5_Soru"
        component={TextReel}
        durationInFrames={secToFrames(toksikSoruReelScenes)}
        fps={TIMING.fps}
        width={SIZES.reelWidth}
        height={SIZES.reelHeight}
        defaultProps={{ scenes: toksikSoruReelScenes }}
      />

      {/* ══════════════════════════════════════════════════════
          HAFTA 3 — 7-13 Nisan
          ══════════════════════════════════════════════════════ */}

      {/* Salı 8 Nisan — Carousel: Narsizm Döngüsü */}
      <Composition
        id="Carousel_Narsizm_Dongusu"
        component={CarouselVideo}
        durationInFrames={carouselFrames(narsizmCarouselSlides.length)}
        fps={TIMING.fps}
        width={SIZES.carouselWidth}
        height={SIZES.carouselHeight}
        defaultProps={{ slides: narsizmCarouselSlides }}
      />

      {/* Çarşamba 9 Nisan — Reel: Gaslighting */}
      <Composition
        id="Reel_Gaslighting"
        component={TextReel}
        durationInFrames={secToFrames(gaslightingReelScenes)}
        fps={TIMING.fps}
        width={SIZES.reelWidth}
        height={SIZES.reelHeight}
        defaultProps={{ scenes: gaslightingReelScenes }}
      />

      {/* ══════════════════════════════════════════════════════
          HAFTA 4 — 14-20 Nisan
          ══════════════════════════════════════════════════════ */}

      {/* Salı 15 Nisan — Carousel: VR Terapi */}
      <Composition
        id="Carousel_VR_Terapi"
        component={CarouselVideo}
        durationInFrames={carouselFrames(vrTerapiCarouselSlides.length)}
        fps={TIMING.fps}
        width={SIZES.carouselWidth}
        height={SIZES.carouselHeight}
        defaultProps={{ slides: vrTerapiCarouselSlides }}
      />

      {/* Çarşamba 16 Nisan — Reel: Dijital Tükenmişlik */}
      <Composition
        id="Reel_Dijital_Tukenmislik"
        component={TextReel}
        durationInFrames={secToFrames(dijitalTukenmislikReelScenes)}
        fps={TIMING.fps}
        width={SIZES.reelWidth}
        height={SIZES.reelHeight}
        defaultProps={{ scenes: dijitalTukenmislikReelScenes }}
      />
    </>
  );
};
