import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { COLORS, FONTS, BackgroundStyle, getBackgroundColor, getTextColor } from '../theme';

export interface TextFrameProps {
  lines: string[];           // Satırlar halinde metin
  background: BackgroundStyle;
  fontSize?: number;
  fontFamily?: 'heading' | 'body' | 'quote';
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  subtext?: string;          // Alt küçük metin (watermark vs.)
  accentLine?: boolean;      // Sol kenar çizgisi göster
  animationStyle?: 'fade' | 'slide-up' | 'spring';
  delay?: number;            // Animasyon başlama gecikmesi (frame)
  emoji?: string;            // Sağ üst köşeye emoji
}

export const TextFrame: React.FC<TextFrameProps> = ({
  lines,
  background,
  fontSize = 72,
  fontFamily = 'heading',
  fontWeight = 'bold',
  fontStyle = 'normal',
  subtext,
  accentLine = false,
  animationStyle = 'fade',
  delay = 0,
  emoji,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bgColor = getBackgroundColor(background);
  const textColor = getTextColor(background);
  const fontName = FONTS[fontFamily];

  const adjustedFrame = Math.max(0, frame - delay);

  // Animasyon hesaplama
  let opacity = 1;
  let translateY = 0;
  let scale = 1;

  if (animationStyle === 'fade') {
    opacity = interpolate(adjustedFrame, [0, fps * 0.4], [0, 1], {
      extrapolateRight: 'clamp',
      extrapolateLeft: 'clamp',
    });
  } else if (animationStyle === 'slide-up') {
    opacity = interpolate(adjustedFrame, [0, fps * 0.3], [0, 1], {
      extrapolateRight: 'clamp',
      extrapolateLeft: 'clamp',
    });
    translateY = interpolate(adjustedFrame, [0, fps * 0.5], [40, 0], {
      extrapolateRight: 'clamp',
      extrapolateLeft: 'clamp',
    });
  } else if (animationStyle === 'spring') {
    scale = spring({
      frame: adjustedFrame,
      fps,
      config: { damping: 12, stiffness: 100 },
      from: 0.85,
      to: 1,
    });
    opacity = interpolate(adjustedFrame, [0, fps * 0.2], [0, 1], {
      extrapolateRight: 'clamp',
      extrapolateLeft: 'clamp',
    });
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 90px',
        position: 'relative',
      }}
    >
      {/* Sol kenar aksanı */}
      {accentLine && (
        <div
          style={{
            position: 'absolute',
            left: 40,
            top: '15%',
            bottom: '15%',
            width: 6,
            borderRadius: 3,
            backgroundColor: background === 'cream' || background === 'white'
              ? COLORS.sageGreen
              : COLORS.warmCream,
          }}
        />
      )}

      {/* Emoji sağ üstte */}
      {emoji && (
        <div
          style={{
            position: 'absolute',
            top: 60,
            right: 70,
            fontSize: 64,
          }}
        >
          {emoji}
        </div>
      )}

      {/* Ana metin bloğu */}
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px) scale(${scale})`,
          textAlign: 'center',
          width: '100%',
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: fontName,
              fontSize: fontSize,
              fontWeight: fontWeight,
              fontStyle: fontStyle,
              color: textColor,
              lineHeight: 1.3,
              marginBottom: i < lines.length - 1 ? '0.15em' : 0,
              letterSpacing: fontFamily === 'heading' ? '-0.01em' : '0',
            }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Alt metin (watermark / psikolog adı) */}
      {subtext && (
        <div
          style={{
            position: 'absolute',
            bottom: 50,
            right: 70,
            fontFamily: FONTS.body,
            fontSize: 32,
            color: textColor,
            opacity: 0.55,
            letterSpacing: '0.02em',
          }}
        >
          {subtext}
        </div>
      )}
    </AbsoluteFill>
  );
};
