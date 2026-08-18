import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { theme } from "../theme";
import subtitles from "../subtitles.json";

type Cue = { start: number; end: number; text: string };

// Renders bold, animated bottom-third captions from src/subtitles.json.
// Each cue is { start, end } in SECONDS on the *edited* timeline.
// Fill subtitles.json once the transcript is available; this component
// already handles fade + pop-in animation, no further wiring needed.
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const cue = (subtitles as Cue[]).find((c) => t >= c.start && t <= c.end && c.text);
  if (!cue) return null;

  const localFrame = frame - Math.round(cue.start * fps);
  const scale = interpolate(localFrame, [0, 6], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(localFrame, [0, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: 210,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
          maxWidth: "84%",
          textAlign: "center",
          fontFamily: theme.sans,
          fontWeight: 800,
          fontSize: 50,
          lineHeight: 1.25,
          color: theme.cream,
          textShadow:
            "0 2px 4px rgba(0,0,0,0.65), 0 0 18px rgba(0,0,0,0.45)",
        }}
      >
        {cue.text}
      </div>
    </AbsoluteFill>
  );
};
