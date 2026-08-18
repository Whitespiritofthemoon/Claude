import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "../theme";

export const Vignette: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: `radial-gradient(120% 90% at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)`,
      }}
    />
  );
};

export const BottomScrim: React.FC<{ heightPct?: number }> = ({ heightPct = 34 }) => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <div
        style={{
          width: "100%",
          height: `${heightPct}%`,
          background: `linear-gradient(to top, ${theme.ink}CC 0%, ${theme.ink}66 45%, transparent 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const TopScrim: React.FC = () => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          width: "100%",
          height: "16%",
          background: `linear-gradient(to bottom, ${theme.ink}88 0%, transparent 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
