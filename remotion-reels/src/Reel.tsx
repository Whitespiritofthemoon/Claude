import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Vignette, BottomScrim, TopScrim } from "./components/Vignette";
import { Grain } from "./components/Grain";
import { WatermarkHandle } from "./components/WatermarkHandle";
import { BrandIntro } from "./components/BrandIntro";
import { BrandOutro } from "./components/BrandOutro";
import { Captions } from "./components/Captions";

const OUTRO_FRAMES = 90; // last 3s at 30fps

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const musicVolume = interpolate(
    frame,
    [0, fps * 1.5, durationInFrames - OUTRO_FRAMES - fps, durationInFrames - OUTRO_FRAMES],
    [0, 0.16, 0.16, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo src={staticFile("edited_graded.mp4")} />

      <TopScrim />
      <BottomScrim heightPct={30} />
      <Vignette />
      <Grain opacity={0.045} />

      <WatermarkHandle fadeInStart={26} />
      <Captions />

      <Audio src={staticFile("music_bed.mp3")} volume={musicVolume} />

      <BrandIntro />
      <BrandOutro durationInFrames={OUTRO_FRAMES} />
    </AbsoluteFill>
  );
};
