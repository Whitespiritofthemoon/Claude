import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";

// Short brand card: holds ~0.7s, then fades to reveal the footage.
const HOLD_END = 22;
const FADE_END = 30;

export const BrandIntro: React.FC = () => {
  const frame = useCurrentFrame();

  if (frame > FADE_END) return null;

  const cardOpacity = interpolate(frame, [HOLD_END, FADE_END], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textOpacity = interpolate(frame, [0, 8, HOLD_END], [0, 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: cardOpacity,
        background: `linear-gradient(160deg, ${theme.beige} 0%, ${theme.cream} 55%, ${theme.beige} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          opacity: textOpacity,
          fontFamily: theme.serif,
          fontSize: 64,
          color: theme.darkBrown,
          letterSpacing: 1,
          textAlign: "center",
          padding: "0 60px",
        }}
      >
        Bugünün Notu
      </div>
      <div
        style={{
          opacity: textOpacity,
          fontFamily: theme.sans,
          fontSize: 28,
          color: theme.dustyRose,
          marginTop: 14,
          letterSpacing: 2,
        }}
      >
        {theme.handle}
      </div>
    </AbsoluteFill>
  );
};
