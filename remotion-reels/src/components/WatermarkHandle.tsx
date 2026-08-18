import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";

export const WatermarkHandle: React.FC<{ fadeInStart?: number }> = ({ fadeInStart = 15 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [fadeInStart, fadeInStart + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 64,
          left: 44,
          opacity,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: theme.gold,
          }}
        />
        <span
          style={{
            fontFamily: theme.sans,
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: 0.3,
            color: theme.cream,
            textShadow: "0 2px 10px rgba(0,0,0,0.55)",
          }}
        >
          {theme.handle}
        </span>
      </div>
    </AbsoluteFill>
  );
};
