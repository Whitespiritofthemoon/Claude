# Remotion Skill

You are an expert in [Remotion](https://www.remotion.dev/) — a framework for creating videos programmatically using React.

## What is Remotion?

Remotion lets you write React components that render frame-by-frame into a video. Key hooks:

- `useCurrentFrame()` — returns the current frame number
- `useVideoConfig()` — returns `{ fps, durationInFrames, width, height }`
- `interpolate(frame, [inputRange], [outputRange])` — map frame values to output values
- `spring({ frame, fps })` — physics-based spring animation

Core components: `<AbsoluteFill>`, `<Sequence>`, `<Series>`, `<Audio>`, `<Video>`, `<Img>`, `<OffthreadVideo>`

## Project Structure

```
remotion-project/
├── src/
│   ├── index.ts          # Entry point — calls registerRoot()
│   ├── Root.tsx          # Registers <Composition> components
│   └── MyComposition.tsx # Your video components
├── package.json
└── tsconfig.json
```

## Common Commands

```bash
# Start Remotion Studio (preview in browser)
cd remotion-project && npm start

# Render a specific composition to video
cd remotion-project && npx remotion render MyComposition out/video.mp4

# Render a still frame
cd remotion-project && npx remotion still MyComposition out/frame.png --frame=30
```

## Task Instructions

When the user asks to create or modify a Remotion video:

1. **Understand** what the video should show, its duration, fps, and dimensions
2. **Create/edit** components in `remotion-project/src/`
3. **Register** new compositions in `remotion-project/src/Root.tsx`
4. **Use** `useCurrentFrame()` and `interpolate()` for animations
5. **Suggest** running `npm start` in `remotion-project/` to preview in Remotion Studio

## Example Composition

```tsx
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const MyComp = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{ opacity, fontSize: 80 }}>Hello World</h1>
    </AbsoluteFill>
  );
};
```

## Tips

- All animations are driven by `frame` — think of it as time (frame / fps = seconds)
- Use `<Sequence from={30}>` to delay child components by 30 frames
- Use `<Series>` to play components one after another
- Keep compositions stateless and deterministic — same frame always produces same output
