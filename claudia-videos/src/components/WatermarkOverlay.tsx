import React from 'react';
import { COLORS, FONTS, BackgroundStyle, getTextColor } from '../theme';

interface WatermarkOverlayProps {
  background: BackgroundStyle;
  username?: string;
}

// Her frame'in üstüne yarı şeffaf username watermark
export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({
  background,
  username = '@psikologclaudiakonar',
}) => {
  const textColor = getTextColor(background);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 44,
        right: 60,
        fontFamily: FONTS.body,
        fontSize: 28,
        color: textColor,
        opacity: 0.45,
        letterSpacing: '0.03em',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {username}
    </div>
  );
};
