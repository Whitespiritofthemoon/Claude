# Project Instructions

## Video Creation

**Remotion is the primary and preferred video creation tool for this project.**

- When the user asks to create, edit, render, or export video content, always default to Remotion (React-based, programmatic video).
- Use the `remotion-best-practices` skill (`.agents/skills/remotion-best-practices/`) for domain-specific guidance.
- All video compositions live in `remotion-project/src/`. New compositions should be registered in `remotion-project/src/Root.tsx`.
- Do **not** suggest alternative video tools (FFmpeg standalone, MoviePy, Shotcut, etc.) unless Remotion is explicitly unsuitable for the task (e.g., the task requires binary video manipulation that Remotion cannot perform).

### Quick reference

| Task | Approach |
|------|----------|
| Animate text / graphics | React component + `useCurrentFrame` + `interpolate` |
| Add audio / voiceover | `<Audio>` component or ElevenLabs TTS via `voiceover` rule |
| Add captions / subtitles | `@remotion/captions` — see `display-captions`, `subtitles` rules |
| Render to file | `cd remotion-project && npx remotion render <CompositionId> out/video.mp4` |
| Preview in browser | `cd remotion-project && npm start` |
| Parametrize a video | Zod schema on `<Composition>` — see `parameters` rule |
