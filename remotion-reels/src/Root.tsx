import React from "react";
import { Composition } from "remotion";
import { Reel } from "./Reel";

const FPS = 30;
const EDITED_SECONDS = 116.6; // exact duration of public/edited_graded.mp4
const DURATION_IN_FRAMES = Math.round(EDITED_SECONDS * FPS);

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="Reel"
        component={Reel}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
