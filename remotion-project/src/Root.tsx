import React from 'react';
import { Composition } from 'remotion';
import { MyComposition } from './MyComposition';
import { AuDHDVideo } from './AuDHDVideo';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="MyComposition"
        component={MyComposition}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AuDHDVideo"
        component={AuDHDVideo}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
