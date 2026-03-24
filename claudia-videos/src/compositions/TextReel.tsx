import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useVideoConfig,
  Audio,
  staticFile,
} from 'remotion';
import { TextFrame } from '../components/TextFrame';
import { AccentDivider } from '../components/AccentDivider';
import { WatermarkOverlay } from '../components/WatermarkOverlay';
import { BackgroundStyle, TIMING } from '../theme';

// Her "sahne" için tip tanımı
export interface ReelScene {
  lines: string[];
  background: BackgroundStyle;
  durationSec: number;          // Kaç saniye gösterilsin
  fontSize?: number;
  fontFamily?: 'heading' | 'body' | 'quote';
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  animationStyle?: 'fade' | 'slide-up' | 'spring';
  showDividerBefore?: boolean;  // Bu sahneden önce geçiş animasyonu
  emoji?: string;
}

export interface TextReelProps {
  scenes: ReelScene[];
  showWatermark?: boolean;
  backgroundMusic?: string;     // public/ klasöründe ses dosyası adı
  musicVolume?: number;
}

export const TextReel: React.FC<TextReelProps> = ({
  scenes,
  showWatermark = true,
  backgroundMusic,
  musicVolume = 0.25,
}) => {
  const { fps } = useVideoConfig();
  const DIVIDER_FRAMES = 15; // 0.5 sn geçiş

  // Her sahnenin başlangıç frame'ini hesapla
  let currentFrame = 0;
  const sceneTimings = scenes.map((scene, i) => {
    const start = currentFrame;
    const dividerFrames = scene.showDividerBefore && i > 0 ? DIVIDER_FRAMES : 0;
    const sceneDurationFrames = Math.round(scene.durationSec * fps);
    currentFrame += dividerFrames + sceneDurationFrames;
    return { start, dividerFrames, sceneDurationFrames };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#F5F0E8' }}>
      {/* Arka plan müziği */}
      {backgroundMusic && (
        <Audio
          src={staticFile(backgroundMusic)}
          volume={musicVolume}
          loop
        />
      )}

      {/* Sahneler */}
      {scenes.map((scene, i) => {
        const timing = sceneTimings[i];

        return (
          <React.Fragment key={i}>
            {/* Geçiş animasyonu */}
            {scene.showDividerBefore && i > 0 && (
              <Sequence
                from={timing.start}
                durationInFrames={timing.dividerFrames}
              >
                <AccentDivider background={scene.background} />
              </Sequence>
            )}

            {/* Ana sahne */}
            <Sequence
              from={timing.start + timing.dividerFrames}
              durationInFrames={timing.sceneDurationFrames}
            >
              <TextFrame
                lines={scene.lines}
                background={scene.background}
                fontSize={scene.fontSize ?? 72}
                fontFamily={scene.fontFamily ?? 'heading'}
                fontWeight={scene.fontWeight ?? 'bold'}
                fontStyle={scene.fontStyle ?? 'normal'}
                animationStyle={scene.animationStyle ?? 'fade'}
                emoji={scene.emoji}
              />
              {showWatermark && (
                <WatermarkOverlay background={scene.background} />
              )}
            </Sequence>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
