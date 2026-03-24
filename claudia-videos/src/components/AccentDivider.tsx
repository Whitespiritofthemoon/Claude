import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { COLORS, BackgroundStyle, getBackgroundColor, getTextColor } from '../theme';

interface AccentDividerProps {
  background: BackgroundStyle;
}

// İçerik bölümleri arasında animasyonlu geçiş sahnesi
export const AccentDivider: React.FC<AccentDividerProps> = ({ background }) => {
  const frame = useCurrentFrame();
  const bgColor = getBackgroundColor(background);
  const accentColor = background === 'cream' || background === 'white'
    ? COLORS.sageGreen
    : COLORS.warmCream;

  const width = interpolate(frame, [0, 20], [0, 700], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width,
          height: 4,
          borderRadius: 2,
          backgroundColor: accentColor,
        }}
      />
    </AbsoluteFill>
  );
};
