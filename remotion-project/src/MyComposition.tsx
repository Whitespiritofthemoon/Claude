import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const MyComposition = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(frame, [0, 30], [0.5, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0f0f23',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          color: 'white',
          fontSize: 72,
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        Hello, Remotion!
        <div style={{ fontSize: 32, marginTop: 16, color: '#888' }}>
          Frame {frame} / {durationInFrames}
        </div>
      </div>
    </AbsoluteFill>
  );
};
