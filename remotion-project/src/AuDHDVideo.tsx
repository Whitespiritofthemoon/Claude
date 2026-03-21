import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// ─── Design tokens ────────────────────────────────────────────────────────────
const CYAN = '#00F5FF';
const MAGENTA = '#FF2D9B';
const PURPLE = '#7B2FBE';
const YELLOW = '#FFE600';
const DARK = '#07001A';
const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

// Safe zones for short-form (TikTok / Reels / Shorts)
// UI chrome sits at top ~12% and bottom ~15% of a 1080×1920 frame.
const SAFE_TOP = 220;
const SAFE_BOTTOM = 260;

// ─── Shared: floating particle ────────────────────────────────────────────────
const PARTICLE_DATA = [
  { x: 90,  y: 280,  s: 9,  d: 0,  c: CYAN },
  { x: 920, y: 180,  s: 6,  d: 5,  c: MAGENTA },
  { x: 210, y: 580,  s: 11, d: 10, c: PURPLE },
  { x: 820, y: 710,  s: 7,  d: 3,  c: YELLOW },
  { x: 140, y: 1020, s: 5,  d: 8,  c: CYAN },
  { x: 960, y: 1130, s: 9,  d: 2,  c: MAGENTA },
  { x: 310, y: 1390, s: 6,  d: 6,  c: PURPLE },
  { x: 710, y: 1540, s: 8,  d: 1,  c: YELLOW },
  { x: 510, y: 420,  s: 5,  d: 15, c: CYAN },
  { x: 610, y: 1210, s: 7,  d: 12, c: MAGENTA },
  { x: 75,  y: 1720, s: 5,  d: 4,  c: CYAN },
  { x: 990, y: 1630, s: 8,  d: 9,  c: PURPLE },
];

const Particle: React.FC<{
  x: number; y: number; s: number; d: number; c: string;
}> = ({ x, y, s, d, c }) => {
  const frame = useCurrentFrame();
  const floatY = Math.sin((frame + d * 10) / 45) * 28;
  const floatX = Math.cos((frame + d * 7)  / 60) * 18;
  const opacity = interpolate(frame, [d, d + 20], [0, 0.65], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <div style={{
      position: 'absolute',
      left: x + floatX,
      top:  y + floatY,
      width: s, height: s,
      borderRadius: '50%',
      backgroundColor: c,
      opacity,
      boxShadow: `0 0 ${s * 2}px ${c}`,
    }} />
  );
};

const Particles: React.FC = () => (
  <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
    {PARTICLE_DATA.map((p, i) => <Particle key={i} {...p} />)}
  </AbsoluteFill>
);

// ─── Shared: word highlight (spring wipe) ─────────────────────────────────────
const Highlight: React.FC<{
  word: string; color: string; delay: number; dur: number;
  fontSize: number; textColor?: string;
}> = ({ word, color, delay, dur, fontSize, textColor = DARK }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 200 }, delay, durationInFrames: dur });
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span style={{
        position: 'absolute', left: 0, right: 0, top: '50%', height: '1.08em',
        transform: `translateY(-50%) scaleX(${Math.min(1, p)})`,
        transformOrigin: 'left center',
        backgroundColor: color,
        borderRadius: '0.12em',
        zIndex: 0,
      }} />
      <span style={{ position: 'relative', zIndex: 1, fontSize, fontWeight: 900, color: textColor }}>
        {word}
      </span>
    </span>
  );
};

// ─── Shared: glitch text (deterministic using frame) ─────────────────────────
const GlitchText: React.FC<{
  text: string; fontSize: number; color?: string; glitchAt?: number[];
}> = ({ text, fontSize, color = 'white', glitchAt = [] }) => {
  const frame = useCurrentFrame();
  const on = glitchAt.includes(frame);
  // Deterministic offsets via frame parity
  const ox = on ? (frame % 3 === 0 ? 5 : -5) : 0;
  const oy = on ? (frame % 2 === 0 ? 2 : -2) : 0;
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {on && <>
        <span style={{ position: 'absolute', color: CYAN,    left: 4,  top: -2, opacity: 0.8, fontSize, fontWeight: 900 }}>{text}</span>
        <span style={{ position: 'absolute', color: MAGENTA, left: -4, top:  2, opacity: 0.8, fontSize, fontWeight: 900 }}>{text}</span>
      </>}
      <span style={{
        color, fontSize, fontWeight: 900, position: 'relative',
        transform: `translate(${ox}px,${oy}px)`,
        textShadow: on ? `0 0 20px ${color}` : undefined,
      }}>
        {text}
      </span>
    </div>
  );
};

// ─── Scene 1: HOOK  (0–5 s) ───────────────────────────────────────────────────
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // White flash at start
  const flash = interpolate(frame, [0, 6, 14], [1, 0.4, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // 🧠 emoji spring-scale in
  const brainScale = spring({ frame, fps, config: { damping: 8 }, delay: 4, durationInFrames: 28 });

  // "YOUR BRAIN" slides in from left
  const brainX = interpolate(
    spring({ frame, fps, config: { damping: 18, stiffness: 220 }, delay: 14, durationInFrames: 22 }),
    [0, 1], [-500, 0],
  );
  const brainAlpha = interpolate(frame, [14, 28], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // "isn't broken." typewriter
  const ISN = "isn't broken.";
  const nChars = Math.floor(
    interpolate(frame, [40, 80], [0, ISN.length], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      easing: Easing.linear,
    }),
  );
  const cursor = Math.floor(frame / 8) % 2 === 0;

  // "It's DIFFERENT." slides up
  const itsY = interpolate(
    spring({ frame, fps, config: { damping: 14 }, delay: 88, durationInFrames: 28 }),
    [0, 1], [100, 0],
  );
  const itsAlpha = interpolate(frame, [88, 105], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Horizontal accent bar
  const barAlpha = interpolate(frame, [10, 28, 125, 148], [0, 0.5, 0.5, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 50% 35%, #1C0038 0%, ${DARK} 65%, #030008 100%)`,
      fontFamily: FONT,
      overflow: 'hidden',
    }}>
      <Particles />

      {/* Flash */}
      <AbsoluteFill style={{ backgroundColor: 'white', opacity: flash, zIndex: 20 }} />

      {/* Accent line */}
      <div style={{
        position: 'absolute', left: 0, top: '31%', width: '100%', height: 2,
        background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)`,
        opacity: barAlpha,
      }} />

      {/* Safe zone container */}
      <div style={{
        position: 'absolute',
        top: SAFE_TOP, left: 64, right: 64, bottom: SAFE_BOTTOM,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 18,
      }}>
        {/* Brain */}
        <div style={{
          fontSize: 148,
          transform: `scale(${brainScale})`,
          lineHeight: 1,
          filter: `drop-shadow(0 0 36px ${PURPLE})`,
        }}>🧠</div>

        {/* YOUR BRAIN */}
        <div style={{ transform: `translateX(${brainX}px)`, opacity: brainAlpha }}>
          <GlitchText
            text="YOUR BRAIN"
            fontSize={100}
            glitchAt={[34, 35, 62, 63, 92, 93]}
          />
        </div>

        {/* isn't broken. typewriter */}
        <div style={{
          opacity: interpolate(frame, [38, 50], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          }),
          textAlign: 'center',
        }}>
          <span style={{
            fontSize: 54, color: CYAN, fontWeight: 700, fontStyle: 'italic', letterSpacing: 1,
          }}>
            {ISN.slice(0, nChars)}
            <span style={{ opacity: cursor ? 1 : 0 }}>|</span>
          </span>
        </div>

        {/* It's DIFFERENT. */}
        <div style={{ transform: `translateY(${itsY}px)`, opacity: itsAlpha, textAlign: 'center' }}>
          <span style={{ fontSize: 58, color: 'white', fontWeight: 700 }}>It's </span>
          <Highlight word="DIFFERENT." color={YELLOW} delay={112} dur={22} fontSize={82} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2: CONTENT  (0–7 s inside its Sequence) ───────────────────────────
const REPOS = [
  { title: 'remotion-dev/skills',      desc: '🎬 Pro video creation in React'   },
  { title: 'anthropics/claude-code',   desc: '🤖 AI pair programming CLI'        },
  { title: 'BuilderIO/gpt-crawler',    desc: '🕷️  AI-powered web crawler'        },
  { title: 'Significant-Gravitas/Auto', desc: '⚡ Autonomous AI agents'          },
  { title: 'f/awesome-chatgpt-prompts', desc: '✨ Prompts & skill resources'     },
];

const RepoCard: React.FC<{ title: string; desc: string; delay: number }> = ({
  title, desc, delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const x = interpolate(
    spring({ frame, fps, config: { damping: 16, stiffness: 170 }, delay }),
    [0, 1], [560, 0],
  );
  const alpha = interpolate(frame, [delay, delay + 14], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <div style={{
      transform: `translateX(${x}px)`, opacity: alpha,
      display: 'flex', alignItems: 'center', gap: 20,
      background: 'rgba(0,245,255,0.06)',
      border: `1.5px solid rgba(0,245,255,0.22)`,
      borderRadius: 20, padding: '20px 26px', width: '100%',
    }}>
      <div style={{
        width: 11, height: 11, borderRadius: '50%', flexShrink: 0,
        backgroundColor: CYAN, boxShadow: `0 0 12px ${CYAN}`,
      }} />
      <div>
        <div style={{ fontSize: 30, fontWeight: 800, color: 'white', lineHeight: 1.25 }}>{title}</div>
        <div style={{ fontSize: 23, color: 'rgba(255,255,255,0.58)', fontWeight: 500, marginTop: 5 }}>{desc}</div>
      </div>
    </div>
  );
};

const ContentScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleY = interpolate(
    spring({ frame, fps, config: { damping: 18 }, durationInFrames: 32 }),
    [0, 1], [-80, 0],
  );
  const titleAlpha = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const subAlpha = interpolate(frame, [22, 40], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const dividerAlpha = interpolate(frame, [32, 50], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(155deg, #000B20 0%, #001535 55%, #000B20 100%)',
      fontFamily: FONT, overflow: 'hidden',
    }}>
      <Particles />

      {/* Faint vertical grid lines */}
      {[0.25, 0.5, 0.75].map((f) => (
        <div key={f} style={{
          position: 'absolute', left: `${f * 100}%`, top: 0, bottom: 0, width: 1,
          background: 'linear-gradient(180deg, transparent, rgba(0,245,255,0.07), transparent)',
        }} />
      ))}

      {/* Safe zone */}
      <div style={{
        position: 'absolute',
        top: SAFE_TOP, left: 64, right: 64, bottom: SAFE_BOTTOM,
        display: 'flex', flexDirection: 'column', gap: 22,
      }}>
        {/* Header */}
        <div style={{ transform: `translateY(${titleY}px)`, opacity: titleAlpha, textAlign: 'center', marginBottom: 4 }}>
          <div style={{
            fontSize: 26, color: CYAN, fontWeight: 700, letterSpacing: 5,
            textTransform: 'uppercase', marginBottom: 10,
          }}>
            Free GitHub Repos
          </div>
          <div style={{ fontSize: 54, color: 'white', fontWeight: 900, lineHeight: 1.1, letterSpacing: -1 }}>
            Claude Code Skills
          </div>
          <div style={{ fontSize: 26, color: MAGENTA, fontWeight: 600, marginTop: 10, opacity: subAlpha }}>
            for the AuDHD brain 🧠✨
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: 2, opacity: dividerAlpha,
          background: `linear-gradient(90deg, transparent, ${CYAN}, ${MAGENTA}, transparent)`,
        }} />

        {/* Cards */}
        {REPOS.map((r, i) => (
          <RepoCard key={i} title={r.title} desc={r.desc} delay={42 + i * 26} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: CTA  (0–3 s inside its Sequence) ───────────────────────────────
const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ctaScale = spring({ frame, fps, config: { damping: 8 }, durationInFrames: 38 });
  const ctaAlpha = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Pulsing ring
  const ringPulse = interpolate(Math.sin(frame / 14), [-1, 1], [0.92, 1.08], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const ringAlpha = interpolate(frame, [18, 38], [0, 0.55], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Button slide
  const btnY = interpolate(
    spring({ frame, fps, config: { damping: 14 }, delay: 22, durationInFrames: 28 }),
    [0, 1], [70, 0],
  );
  const btnAlpha = interpolate(frame, [22, 38], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Hashtag typewriter
  const TAGS = '#AuDHD #ADHD #Autism #ClaudeCode #AI';
  const nTags = Math.floor(
    interpolate(frame, [52, 88], [0, TAGS.length], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      easing: Easing.linear,
    }),
  );

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 50% 55%, #22003E 0%, ${DARK} 65%, #040010 100%)`,
      fontFamily: FONT, overflow: 'hidden',
    }}>
      <Particles />

      {/* Pulsing ring */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: ringAlpha }}>
        <div style={{
          width: 440, height: 440, borderRadius: '50%',
          border: `3px solid ${MAGENTA}`,
          transform: `scale(${ringPulse})`,
          boxShadow: `0 0 50px ${MAGENTA}40`,
        }} />
      </AbsoluteFill>

      {/* Safe zone */}
      <div style={{
        position: 'absolute',
        top: SAFE_TOP, left: 64, right: 64, bottom: SAFE_BOTTOM,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 30,
      }}>
        {/* Main CTA text */}
        <div style={{ transform: `scale(${ctaScale})`, opacity: ctaAlpha, textAlign: 'center' }}>
          <div style={{ fontSize: 46, color: 'white', fontWeight: 700, lineHeight: 1.3 }}>
            🔔 Follow for more
          </div>
          <div style={{
            fontSize: 78, fontWeight: 900, lineHeight: 1, letterSpacing: -2, marginTop: 4,
          }}>
            <Highlight word="AuDHD" color={CYAN} delay={28} dur={18} fontSize={78} textColor={DARK} />
          </div>
          <div style={{ fontSize: 42, color: MAGENTA, fontWeight: 700, marginTop: 6 }}>
            tech tips ⚡
          </div>
        </div>

        {/* Follow button */}
        <div style={{
          transform: `translateY(${btnY}px)`, opacity: btnAlpha,
          background: `linear-gradient(135deg, ${PURPLE}, #4B0082)`,
          borderRadius: 64, padding: '22px 70px',
          border: `2px solid ${MAGENTA}`,
          boxShadow: `0 0 36px ${PURPLE}90`,
        }}>
          <span style={{ fontSize: 38, fontWeight: 800, color: 'white', letterSpacing: 1 }}>
            + FOLLOW
          </span>
        </div>

        {/* Hashtags */}
        <div style={{
          opacity: interpolate(frame, [50, 60], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          }),
          textAlign: 'center',
        }}>
          <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
            {TAGS.slice(0, nTags)}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Root composition ─────────────────────────────────────────────────────────
export const AuDHDVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  const hookDur    = 5 * fps; // 150 frames
  const contentDur = 7 * fps; // 210 frames
  const ctaDur     = 3 * fps; //  90 frames
  return (
    <AbsoluteFill>
      <Sequence from={0}                        durationInFrames={hookDur}    premountFor={fps}><HookScene    /></Sequence>
      <Sequence from={hookDur}                  durationInFrames={contentDur} premountFor={fps}><ContentScene /></Sequence>
      <Sequence from={hookDur + contentDur}     durationInFrames={ctaDur}     premountFor={fps}><CTAScene     /></Sequence>
    </AbsoluteFill>
  );
};
