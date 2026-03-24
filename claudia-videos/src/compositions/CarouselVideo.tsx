import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { COLORS, FONTS, BackgroundStyle, getBackgroundColor, getTextColor, TIMING } from '../theme';
import { WatermarkOverlay } from '../components/WatermarkOverlay';

export interface CarouselSlide {
  slideNumber?: string;      // "01 / 08" formatı
  title?: string;
  lines: string[];
  background: BackgroundStyle;
  isCover?: boolean;         // Kapak slayt — farklı stil
  isHighlight?: boolean;     // Vurgu slayt (daha büyük metin, kontrast arka plan)
  accentColor?: string;      // Sol çizgi rengi override
  bullets?: string[];        // Madde işaretli liste
}

export interface CarouselVideoProps {
  slides: CarouselSlide[];
  slideDurationSec?: number;  // Her slayt kaç saniye
  showSlideNumbers?: boolean;
}

// Tek bir slayt komponenti
const Slide: React.FC<{
  slide: CarouselSlide;
  showSlideNumber: boolean;
}> = ({ slide, showSlideNumber }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgColor = getBackgroundColor(slide.background);
  const textColor = getTextColor(slide.background);

  // Fade in animasyonu
  const opacity = interpolate(frame, [0, fps * 0.35], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  const translateY = interpolate(frame, [0, fps * 0.4], [30, 0], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  const accentColor = slide.accentColor
    ?? (slide.background === 'cream' || slide.background === 'white'
      ? COLORS.sageGreen
      : COLORS.warmCream);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: slide.isCover ? '80px 90px' : '70px 90px 70px 120px',
        position: 'relative',
      }}
    >
      {/* Sol kenar çizgisi (kapak hariç) */}
      {!slide.isCover && (
        <div
          style={{
            position: 'absolute',
            left: 40,
            top: '12%',
            bottom: '12%',
            width: 6,
            borderRadius: 3,
            backgroundColor: accentColor,
          }}
        />
      )}

      {/* Slayt numarası */}
      {showSlideNumber && slide.slideNumber && (
        <div
          style={{
            position: 'absolute',
            top: 50,
            right: 70,
            fontFamily: FONTS.body,
            fontSize: 28,
            color: textColor,
            opacity: 0.4,
            letterSpacing: '0.08em',
          }}
        >
          {slide.slideNumber}
        </div>
      )}

      <div style={{ opacity, transform: `translateY(${translateY}px)` }}>
        {/* Başlık */}
        {slide.title && (
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: slide.isCover ? 90 : 56,
              fontWeight: 'bold',
              color: textColor,
              lineHeight: 1.2,
              marginBottom: 36,
              letterSpacing: '-0.01em',
            }}
          >
            {slide.title}
          </div>
        )}

        {/* Gövde satırları */}
        {slide.lines.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: slide.isCover ? FONTS.body : FONTS.body,
              fontSize: slide.isCover ? 44 : 40,
              fontWeight: slide.isHighlight ? 'bold' : 'normal',
              color: textColor,
              lineHeight: 1.5,
              marginBottom: 8,
            }}
          >
            {line}
          </div>
        ))}

        {/* Madde işaretli liste */}
        {slide.bullets && slide.bullets.map((bullet, i) => (
          <div
            key={i}
            style={{
              fontFamily: FONTS.body,
              fontSize: 38,
              color: textColor,
              lineHeight: 1.6,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16,
              marginBottom: 6,
            }}
          >
            <span style={{ color: accentColor, fontWeight: 'bold', flexShrink: 0 }}>✓</span>
            <span>{bullet}</span>
          </div>
        ))}
      </div>

      {/* Watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: 44,
          right: 60,
          fontFamily: FONTS.body,
          fontSize: 28,
          color: textColor,
          opacity: 0.4,
        }}
      >
        @psikologclaudiakonar
      </div>
    </AbsoluteFill>
  );
};

export const CarouselVideo: React.FC<CarouselVideoProps> = ({
  slides,
  slideDurationSec = 4,
  showSlideNumbers = true,
}) => {
  const { fps } = useVideoConfig();
  const frameDuration = Math.round(slideDurationSec * fps);

  return (
    <AbsoluteFill>
      {slides.map((slide, i) => (
        <Sequence
          key={i}
          from={i * frameDuration}
          durationInFrames={frameDuration}
        >
          <Slide slide={slide} showSlideNumber={showSlideNumbers} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
