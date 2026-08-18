import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

// Plays during the final `durationInFrames` frames of the composition.
export const BrandOutro: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: total } = useVideoConfig();
  const start = total - durationInFrames;
  const local = frame - start;

  if (local < 0) return null;

  const opacity = interpolate(local, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rise = interpolate(local, [0, 18], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        background: `linear-gradient(160deg, ${theme.darkBrown} 0%, ${theme.ink} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: `translateY(${rise}px)`,
      }}
    >
      <div
        style={{
          fontFamily: theme.serif,
          fontSize: 54,
          color: theme.cream,
          textAlign: "center",
          padding: "0 70px",
          lineHeight: 1.3,
        }}
      >
        Kaydet 🔖 bir arkadaşına gönder 💬
      </div>
      <div
        style={{
          fontFamily: theme.sans,
          fontSize: 30,
          color: theme.gold,
          marginTop: 26,
          letterSpacing: 1.5,
        }}
      >
        {theme.handle}
      </div>
    </AbsoluteFill>
  );
};
