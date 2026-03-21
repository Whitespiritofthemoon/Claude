---
name: remotion-best-practices
description: Best practices for Remotion - Video creation in React
metadata:
  tags: remotion, video, react, animation, composition
---

## Overview

Remotion is a framework for creating videos programmatically using React. Instead of a timeline editor, you write React components that are rendered frame-by-frame. Each component receives the current frame number via `useCurrentFrame()` and uses `interpolate()` or `spring()` to drive animations deterministically — the same frame always produces the same output.

Use this skill whenever you are working with Remotion code. It provides domain-specific knowledge, patterns, and code examples for every aspect of Remotion development.

## Core concepts

- **Frame-based rendering**: All animation state derives from `useCurrentFrame()`. There is no imperative animation — just pure functions of frame number.
- **Compositions**: Videos are defined as `<Composition>` entries in a root file. Each composition has a fixed `width`, `height`, `fps`, and `durationInFrames`.
- **Sequencing**: Use `<Sequence from={n}>` to offset children in time, `<Series>` to play items back-to-back, and `<Freeze frame={n}>` to hold a frame.
- **Rendering**: Use `remotion render` (CLI) or `@remotion/lambda` / `@remotion/cloudrun` for cloud rendering.

## When to load specific rule files

| Situation | Rule file to load |
|-----------|------------------|
| Writing or animating any component | [rules/animations.md](rules/animations.md) |
| Timing, easing, spring physics | [rules/timing.md](rules/timing.md) |
| Sequencing and scene ordering | [rules/sequencing.md](rules/sequencing.md) |
| Scene transitions (fade, slide, wipe) | [rules/transitions.md](rules/transitions.md) |
| Text and typography animations | [rules/text-animations.md](rules/text-animations.md) |
| Captions or subtitles | [rules/subtitles.md](rules/subtitles.md) |
| Displaying styled captions (TikTok-style) | [rules/display-captions.md](rules/display-captions.md) |
| Importing `.srt` subtitle files | [rules/import-srt-captions.md](rules/import-srt-captions.md) |
| Auto-transcribing audio to captions | [rules/transcribe-captions.md](rules/transcribe-captions.md) |
| Audio playback, volume, speed, pitch | [rules/audio.md](rules/audio.md) |
| Sound effects | [rules/sfx.md](rules/sfx.md) |
| Audio visualization (spectrum, waveform) | [rules/audio-visualization.md](rules/audio-visualization.md) |
| AI-generated voiceover (ElevenLabs TTS) | [rules/voiceover.md](rules/voiceover.md) |
| Embedding videos | [rules/videos.md](rules/videos.md) |
| Embedding images | [rules/images.md](rules/images.md) |
| Displaying GIFs | [rules/gifs.md](rules/gifs.md) |
| Lottie animations | [rules/lottie.md](rules/lottie.md) |
| 3D content (Three.js / React Three Fiber) | [rules/3d.md](rules/3d.md) |
| Charts and data visualization | [rules/charts.md](rules/charts.md) |
| Maps with Mapbox | [rules/maps.md](rules/maps.md) |
| Fonts (Google Fonts, local fonts) | [rules/fonts.md](rules/fonts.md) |
| Light leak overlay effects | [rules/light-leaks.md](rules/light-leaks.md) |
| Tailwind CSS styling | [rules/tailwind.md](rules/tailwind.md) |
| Parametrizable videos (Zod schema) | [rules/parameters.md](rules/parameters.md) |
| Dynamic duration/dimensions from data | [rules/calculate-metadata.md](rules/calculate-metadata.md) |
| Trimming the start or end of animations | [rules/trimming.md](rules/trimming.md) |
| Transparent video output (alpha channel) | [rules/transparent-videos.md](rules/transparent-videos.md) |
| Measuring text size and overflow | [rules/measuring-text.md](rules/measuring-text.md) |
| Measuring DOM element dimensions | [rules/measuring-dom-nodes.md](rules/measuring-dom-nodes.md) |
| Importing assets (images, video, audio) | [rules/assets.md](rules/assets.md) |
| Defining compositions and stills | [rules/compositions.md](rules/compositions.md) |
| Checking browser video decode support | [rules/can-decode.md](rules/can-decode.md) |
| Getting audio file duration | [rules/get-audio-duration.md](rules/get-audio-duration.md) |
| Getting video file duration | [rules/get-video-duration.md](rules/get-video-duration.md) |
| Getting video dimensions | [rules/get-video-dimensions.md](rules/get-video-dimensions.md) |
| Extracting frames from a video | [rules/extract-frames.md](rules/extract-frames.md) |
| FFmpeg operations (trim, silence detection) | [rules/ffmpeg.md](rules/ffmpeg.md) |

## Full rule index

### Animation & timing
- [rules/animations.md](rules/animations.md) — `useCurrentFrame`, `interpolate`, `spring`, `AbsoluteFill`; the building blocks of all Remotion motion
- [rules/timing.md](rules/timing.md) — Easing curves (`Easing.bezier`, `Easing.elastic`), spring physics parameters (`stiffness`, `damping`, `mass`), and choosing between `interpolate` and `spring`
- [rules/sequencing.md](rules/sequencing.md) — `<Sequence>`, `<Series>`, `<Freeze>`, `<Loop>`; controlling when components appear and how long they run
- [rules/trimming.md](rules/trimming.md) — Cutting the start or end of an animation with `<Sequence from={} durationInFrames={}>` patterns
- [rules/transitions.md](rules/transitions.md) — `<TransitionSeries>` with built-in presentations: `fade`, `slide`, `wipe`, `flip`, `clockWipe`, `none`

### Text & typography
- [rules/text-animations.md](rules/text-animations.md) — Word-by-word reveals, typewriter effects, highlight sweeps, per-character staggering; includes reusable component examples
- [rules/measuring-text.md](rules/measuring-text.md) — `measureText()` to get pixel dimensions of a string before rendering; fitting text to a container; overflow detection
- [rules/fonts.md](rules/fonts.md) — Loading Google Fonts with `@remotion/google-fonts` and local font files; ensuring fonts are ready before the first frame renders

### Captions & subtitles
- [rules/subtitles.md](rules/subtitles.md) — General guide to captions in Remotion: choosing between SRT import, transcription, and manual timing
- [rules/display-captions.md](rules/display-captions.md) — Rendering TikTok/Reels-style caption pages with word-level highlight using `@remotion/captions`
- [rules/import-srt-captions.md](rules/import-srt-captions.md) — Parsing `.srt` files with `parseSrt()` from `@remotion/captions` and syncing them to the timeline
- [rules/transcribe-captions.md](rules/transcribe-captions.md) — Auto-generating captions via Whisper transcription; converting word timestamps to Remotion-compatible caption data

### Audio
- [rules/audio.md](rules/audio.md) — `<Audio>` component; `src`, `startFrom`, `endAt`, `volume`, `playbackRate`, `toneFrequency`; looping and muting audio
- [rules/sfx.md](rules/sfx.md) — Triggering short sound effects at specific frames using `<Audio>` inside a `<Sequence>`
- [rules/audio-visualization.md](rules/audio-visualization.md) — `visualizeAudio()` from `@remotion/media-utils`; building spectrum bars, waveforms, and bass-reactive effects
- [rules/voiceover.md](rules/voiceover.md) — Generating speech with ElevenLabs TTS, saving the file, and using `calculateMetadata` to derive composition duration from audio length

### Video & media
- [rules/videos.md](rules/videos.md) — `<Video>` and `<OffthreadVideo>`; `startFrom`, `endAt`, `volume`, `playbackRate`, `muted`; when to use each component
- [rules/images.md](rules/images.md) — `<Img>` component; preloading with `prefetch()`; handling load errors
- [rules/gifs.md](rules/gifs.md) — `<Gif>` from `@remotion/gif`; synchronising GIF playback speed to Remotion's timeline
- [rules/transparent-videos.md](rules/transparent-videos.md) — Rendering with `--codec vp8`/`vp9`/`prores-4444` to preserve an alpha channel; compositing transparent overlays
- [rules/extract-frames.md](rules/extract-frames.md) — Extracting a still from a video at a given timestamp using Mediabunny's `extractFrame()`
- [rules/can-decode.md](rules/can-decode.md) — `canUseVideoInCanvas()` from Mediabunny to check browser decode support before rendering

### Media metadata
- [rules/get-audio-duration.md](rules/get-audio-duration.md) — `getAudioDurationInSeconds()` from Mediabunny; use inside `calculateMetadata` to set composition length from audio
- [rules/get-video-duration.md](rules/get-video-duration.md) — `getVideoDurationInSeconds()` from Mediabunny
- [rules/get-video-dimensions.md](rules/get-video-dimensions.md) — `getVideoMetadata()` from Mediabunny to retrieve width, height, and duration

### Compositions & data
- [rules/compositions.md](rules/compositions.md) — `<Composition>`, `<Still>`, `<Folder>`; `defaultProps`; schema validation; registering multiple compositions
- [rules/calculate-metadata.md](rules/calculate-metadata.md) — `calculateMetadata` callback to dynamically set `durationInFrames`, `width`, `height`, and `props` at render time from async data
- [rules/parameters.md](rules/parameters.md) — Defining a Zod schema on a composition so props are type-safe, validated, and editable in Remotion Studio

### Assets & styling
- [rules/assets.md](rules/assets.md) — `staticFile()` for files in the `public/` folder; `getRemotionEnvironment()` to detect studio vs render context
- [rules/tailwind.md](rules/tailwind.md) — Configuring Tailwind CSS v3 with Remotion's Webpack override; using utility classes inside compositions
- [rules/light-leaks.md](rules/light-leaks.md) — Overlaying cinematic light leak effects from `@remotion/light-leaks`; controlling blend mode and opacity over time

### Advanced / integrations
- [rules/3d.md](rules/3d.md) — `@remotion/three` with React Three Fiber; `<ThreeCanvas>`, camera setup, lighting, and frame-driven 3D animation
- [rules/charts.md](rules/charts.md) — Animated bar, pie, line, and stock charts; includes reusable component patterns and `@remotion/shapes` usage
- [rules/maps.md](rules/maps.md) — Embedding a Mapbox map with `@remotion/mapbox-gl`; animating camera position, zoom, and bearing over frames
- [rules/lottie.md](rules/lottie.md) — `<LottieAnimation>` from `@remotion/lottie`; controlling playback speed and synchronising with the Remotion timeline
- [rules/measuring-dom-nodes.md](rules/measuring-dom-nodes.md) — `useRef` + `getBoundingClientRect` patterns safe for Remotion's rendering pipeline
- [rules/ffmpeg.md](rules/ffmpeg.md) — Running FFmpeg as a child process from a Remotion Lambda/Cloud Run function; trimming clips, detecting silence, and merging tracks
