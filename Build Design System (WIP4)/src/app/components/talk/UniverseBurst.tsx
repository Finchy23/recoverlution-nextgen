/**
 * UniverseBurst — dramatic constellation-tracing particle burst for universe completion
 *
 * When the final star is illuminated (all 34), this renders particles that trace
 * along constellation connection lines before bursting outward. Each constellation's
 * lines light up in sequence, then all particles scatter in a golden supernova.
 *
 * Phase AB++: The last-completed constellation traces first, then the remaining
 * constellations follow in angular proximity order, rippling outward from the
 * territory that carried the final star home.
 *
 * Phase AC: After the supernova, persistent afterimage outlines of every
 * constellation linger and slowly fade over ~12 seconds, like light burned
 * into the cosmos.
 *
 * Phase AC+: Afterimage outlines drift gently outward from center over
 * their lifetime, as if the constellations themselves are expanding with
 * the cosmos after the burst.
 *
 * Phase AC++: Afterimage drift includes a slow 2-degree rotation so
 * constellations appear to gently spiral outward rather than expanding
 * purely radially, like galaxies turning as the cosmos breathes.
 *
 * Phase AC++: Naming echoes — personal names stagger into view
 * Each echo has its own fade lifecycle: 1s fade-in, 3s hold, 2s fade-out
 *
 * Phase AC+++: Ghost traces — after each naming echo fades, a faint
 * persistent afterimage lingers, dissolving over the remaining afterimage
 * duration with chromatic shift toward gold.
 *
 * Phase AC+++: Universe name echo — after all constellation naming echoes
 * have faded, the universe's personal name blooms at screen center in gold.
 *
 * Phase AC++++: Universe ghost trace — after the universe name echo fades,
 * a persistent golden ghost lingers for ~15 seconds with a slow power curve.
 * During the hold phase of the universe echo, a gentle breathing sine pulse
 * modulates the alpha.
 *
 * Phase AC++++: Orbiting constellation glyph ring — while the universe name
 * echo is visible, six miniature constellation patterns orbit slowly around
 * the text in their constellation colors, like satellites circling a star.
 *
 * Phase AC++++: Ghost trace chromatic shift — constellation name ghosts
 * gradually blend from their original constellation color toward gold
 * (255, 224, 136) as they fade, as if being absorbed into the golden cosmos.
 *
 * Phase AC+++++: Cometary trail arcs — each orbiting mini-constellation
 * leaves a fading arc trail behind it as it moves, like a cometary tail
 * dissolving over ~90 degrees of arc, rendered as a series of translucent
 * dots at previous angular positions with exponentially decaying opacity.
 *
 * Phase AC+++++: Universe ghost letter spacing pulse — during the 15-second
 * universe ghost trace fade, letter spacing slowly expands and contracts
 * in a dampened sine wave, as if the name is breathing its last breath
 * before dissolving into the cosmos.
 *
 * Phase AC+++++: Gathering convergence — during the final 3-second fade-out
 * of the universe name echo, the six orbiting constellation glyphs ease
 * inward toward center, converging on the name as if being drawn back into
 * the word that holds them, accelerating with an easeIn curve.
 *
 * Phase AC++++++: Convergence spark — at the moment the gathering
 * completes (orbit radius reaches zero), a tiny golden spark blooms
 * at screen center, marking the instant the six constellations merge
 * into the universe name, then quickly fades over ~30 frames.
 *
 * Phase AC+++++++: Spark fusion particles — at the convergence spark
 * moment, six tiny particles (one per constellation, in their gold-shifted
 * colors) drift outward from center like sparks from the moment of fusion,
 * each fading over ~50 frames with gentle deceleration.
 *
 * Phase AC+++++++: Gravitational compression — during gathering convergence,
 * each glyph's connection lines thicken progressively as they approach
 * center, as if the constellations are being compressed by gravitational
 * pressure, scaling from 0.5px to 1.4px at full convergence.
 *
 * Phase AC+++++++: Spark-synced letter spacing — the universe ghost trace's
 * letter spacing pulse begins with a sharp initial bloom synchronized to
 * the convergence spark's timing (peaking at the same frame), created by
 * overlaying a fast-decaying impulse on the slower 2.5-oscillation breathing,
 * so the spark's energy visibly ripples through the dissolving name.
 *
 * Phase AC++++++++ (Resonance Depth Extensions x10): Three refinements:
 * Fusion micro-trails leave 3 faint trailing dots behind each spark fusion
 * particle as it drifts outward, echoing the cometary trail language.
 * Gravitational lensing swells star dots from 0.9px to 1.3px during
 * gathering compression, as if the stars themselves are being lensed.
 * Spark-sync alpha bloom briefly intensifies the ghost trace's alpha
 * at frame 18 (matching the convergence spark peak), linking the visual
 * spark to a momentary brightening of the dissolving universe name.
 *
 * Phase AC+++++++++ (Resonance Depth Extensions x11): Three refinements:
 * Compressed star brilliance brightens star dot alpha from 0.8 to 0.95
 * of glyphAlpha during gathering, as if the stars burn hotter under pressure.
 * Fusion ember memory shifts each micro-trail dot's color back from the
 * 85% gold-shifted core toward the original constellation color at the tail,
 * like cooling embers remembering their origin.
 * Causal spark ripple delays the letter spacing impulse by 2 frames relative
 * to the alpha bloom, so the brightness flash arrives first and the spatial
 * expansion follows, as if light travels faster than the physical distortion.
 *
 * Phase AC++++++++++ (Resonance Depth Extensions x12): Critical luminosity halo
 * — soft glow emerges around each star as they approach critical brightness
 * under compression, enhancing the visual impact of gravitational pressure.
 * Time-dependent ember cooling modulates fusion micro-trail reversion by
 * fusionProgress so early trail dots stay gold-hot and only cool toward their
 * original constellation color as the particle drifts further from center.
 * Animated causal delay replaces the fixed 2-frame delay with a widening
 * gap that grows from 0 to 3 frames over the impulse's 60-frame lifetime,
 * so brightness and distortion start simultaneous then gradually separate
 * as the energy dissipates.
 *
 * Phase AC+++++++++++ (Resonance Depth Extensions x13): Three refinements:
 * Critical threshold flicker pulses the star dot halo's shadowBlur at 3Hz
 * during the final 20% of gathering with ±35% modulation, suggesting the
 * stars are approaching a critical threshold before collapse.
 * Ember mass loss shrinks each fusion micro-trail dot proportional to its
 * color reversion amount (up to 30% smaller at full cooling), so dots that
 * have shed more golden energy also lose physical mass.
 * Decaying impulse amplitude replaces the fixed 1.8x letter spacing
 * multiplier with a value that starts at 2.2x and decays to 1.4x over
 * the impulse's 60-frame window, so spatial distortion starts more dramatic
 * but weakens faster than brightness, reinforcing that physical effects
 * are the first to dissipate.
 * Phase AC++++++++++++ (Resonance Depth Extensions x14): Three refinements:
 * Frequency doubling accelerates the critical threshold flicker from 3Hz to
 * 6Hz in the final 5% of gathering, as if the oscillation is becoming
 * unstable just before collapse.
 * Ember dissolution opacity applies a 15% alpha penalty proportional to
 * mass loss on fusion micro-trail dots, compounding the sense of dissolution
 * as cooling embers become both smaller and more transparent.
 * Square root decay curve replaces the linear impulse amplitude ramp with
 * Math.sqrt, so the 2.2x to 1.4x decay drops quickly at first then
 * plateaus, creating an organic feeling of initial explosive energy that
 * rapidly settles into a residual ripple.
 * Phase AC+++++++++++++ (Resonance Depth Extensions x15): Three refinements:
 * Luminous expenditure — as flicker frequency doubles, shadow alpha dims
 * from 0.4 to 0.3 as if the star is spending its luminous energy faster in
 * those final oscillations before collapse.
 * Spectral blue shift — the most dissolved fusion micro-trail dots gain a
 * faint blue channel boost (up to 5%), like the last light of a dying star
 * shifting toward shorter wavelengths as it vanishes.
 * Front-loaded bloom decay — the spark-sync alpha bloom's intensity is
 * scaled down by the square of impulseDecay, so the brightness flash is
 * also more front-loaded but decays more gracefully than spatial distortion.
 * Phase AC++++++++++++++ (Resonance Depth Extensions x16): Three refinements:
 * Corona contraction tightens the star dot halo's shadowBlur from 100% to 85%
 * at maximum flicker frequency, so the glow both dims and contracts inward as
 * if the corona is being drawn back into the star before the final implosion.
 * Red channel suppression reduces finalEmR by up to 3% on the most dissolved
 * fusion micro-trail dots, complementing the spectral blue shift so the color
 * migration is not just additive blue but a genuine wavelength shift away from
 * warm tones, creating a more physically accurate spectral transition.
 * Glow radius contraction scales the ghost trace's shadowBlur down by 30% of
 * bloomDecayFactor, so the glow radius contracts alongside the alpha reduction,
 * reinforcing that the energy pulse is physically shrinking as it dissipates
 * rather than just fading in place.
 * Phase AC+++++++++++++++ (Resonance Depth Extensions x17): Three refinements:
 * Luminous compression shrinks star dots by up to 5% at maximum flicker
 * frequency, as if gravitational pressure is momentarily overpowering their
 * luminosity, compressing them inward alongside their contracting halos.
 * Green channel suppression reduces finalEmG by up to 1.5% on the most
 * dissolved fusion micro-trail dots, complementing the red suppression so the
 * color trends toward a deeper violet like the extreme ultraviolet edge of a
 * stellar spectrum collapsing beyond visible wavelengths.
 * Glow radius breathing adds a subtle ±0.5px oscillation to the ghost trace's
 * shadowBlur at the same 2.5 frequency as the letter spacing's slow breathing,
 * so the glow appears to inhale and exhale in synchrony with the dissolving
 * name's spatial pulse.
 * Phase AC++++++++++++++++ (Resonance Depth Extensions x18): Three refinements:
 * Density brightening increases star dot alpha by up to 5% at maximum flicker
 * frequency to match the luminous compression's 5% size reduction, creating a
 * density illusion where the same luminous energy is packed into a smaller volume.
 * Chromatic vividity boost increases the spectral blue shift from 5% to 7% when
 * greenSuppression exceeds half its range, so the violet shift becomes more
 * chromatically vivid rather than just subtractive, like a prism separating colors
 * more dramatically at shorter wavelengths
 * Counterpoint phase shift offsets the glow radius breathing by a quarter cycle
 * (π/2) relative to the letter spacing breathing, so the glow reaches its maximum
 * radius when the letters are at their neutral spacing, creating an out of phase
 * dance where the name and its aura breathe in counterpoint rather than unison.
 * Phase AC++++++++++++++++++ (Resonance Depth Extensions x19): Three refinements:
 * Corona density intensification modulates the halo's shadowColor alpha by
 * densityBrighten scaled to 0.4, so the compressed star's surrounding corona
 * intensifies proportionally alongside the dot core's density brightening,
 * reinforcing the illusion across both core and glow.
 * Sigmoid vividity smoothing replaces the hard cutoff at greenSuppression > 0.005
 * with a smooth sigmoid curve (steepness 20) so the transition from 5% to 7%
 * spectral shift is gradual and continuous, avoiding perceptible discontinuity.
 * Glow breath quieting independently narrows the glow breathing's ±0.5px range
 * to ±0.3px over the ghost duration's final third, so the glow reaches stillness
 * before the letter spacing's spatial breathing, like the aura settling first.
 */

import { useRef, useEffect } from 'react';
import {
  CONSTELLATIONS, ALL_STARS, project, aimCamera,
  type UniverseStar, type Camera,
} from './talk-universe';

interface TraceParticle {
  x: number;
  y: number;
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  t: number;
  speed: number;
  bvx: number;
  bvy: number;
  phase: 'trace' | 'burst';
  life: number;
  maxLife: number;
  size: number;
  r: number;
  g: number;
  b: number;
  conDelay: number;
}

/** Pre-computed projected line for afterimage rendering */
interface AfterimageSegment {
  x1: number; y1: number;
  x2: number; y2: number;
  r: number; g: number; b: number;
}

/** Pre-computed miniature constellation pattern for orbiting glyph ring */
interface MiniGlyph {
  points: { nx: number; ny: number }[];
  lines: [number, number][];
  r: number; g: number; b: number;
}

interface UniverseBurstProps {
  stars: UniverseStar[];
  camera: Camera;
  width: number;
  height: number;
  /** ID of the last-completed constellation (traces first) */
  lastCompletedId?: string;
  /** Personal constellation names for naming echo effect */
  constellationNames?: Record<string, string>;
  /** Personal name for the universe */
  universeName?: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function angularDistance(a: { yaw: number; pitch: number }, b: { yaw: number; pitch: number }): number {
  const dy = a.yaw - b.yaw;
  const dp = a.pitch - b.pitch;
  return Math.sqrt(dy * dy + dp * dp);
}

/** Pre-compute miniature constellation patterns (module-level, computed once) */
function buildMiniGlyphs(): MiniGlyph[] {
  return CONSTELLATIONS.map(con => {
    const [r, g, b] = hexToRgb(con.color);
    const conStars = con.starIds
      .map(id => ALL_STARS.find(s => s.id === id))
      .filter(Boolean) as typeof ALL_STARS;
    if (conStars.length === 0) return { points: [], lines: [], r, g, b };

    const pts = conStars.map(s => ({ id: s.id, x: s.pos.x, y: -s.pos.y }));
    const xs = pts.map(p => p.x);
    const ys = pts.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const glyphSize = 10;
    const scale = glyphSize / Math.max(rangeX, rangeY);

    const normalized = pts.map(p => ({
      id: p.id,
      nx: (p.x - minX) * scale - (rangeX * scale) / 2,
      ny: (p.y - minY) * scale - (rangeY * scale) / 2,
    }));

    const idToIdx = new Map(normalized.map((p, i) => [p.id, i]));
    const lines: [number, number][] = [];
    for (const [idA, idB] of con.connections) {
      const a = idToIdx.get(idA);
      const b = idToIdx.get(idB);
      if (a !== undefined && b !== undefined) lines.push([a, b]);
    }

    return { points: normalized, lines, r, g, b };
  });
}

let _miniGlyphs: MiniGlyph[] | null = null;
function getMiniGlyphs(): MiniGlyph[] {
  if (!_miniGlyphs) _miniGlyphs = buildMiniGlyphs();
  return _miniGlyphs;
}

export function UniverseBurst({ stars, camera, width, height, lastCompletedId, constellationNames, universeName }: UniverseBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const miniGlyphs = getMiniGlyphs();

    // ── Order constellations: last-completed first, then by angular proximity ──
    const ordered = [...CONSTELLATIONS];
    const anchorCon = lastCompletedId
      ? ordered.find(c => c.id === lastCompletedId) || ordered[0]
      : ordered[0];
    const anchorAim = aimCamera(anchorCon.center);

    ordered.sort((a, b) => {
      if (a.id === anchorCon.id) return -1;
      if (b.id === anchorCon.id) return 1;
      const distA = angularDistance(aimCamera(a.center), anchorAim);
      const distB = angularDistance(aimCamera(b.center), anchorAim);
      return distA - distB;
    });

    // ── Build trace particles from constellation connections ──
    const traceParticles: TraceParticle[] = [];
    const centerX = width / 2;
    const centerY = height / 2;

    // ── Pre-compute afterimage segments for all constellations ──
    const afterimageSegments: AfterimageSegment[] = [];

    // ── Pre-compute naming echo positions (constellation centers projected to screen) ──
    interface NamingEcho {
      name: string;
      x: number;
      y: number;
      r: number;
      g: number;
      b: number;
      /** Stagger delay in frames from afterimage start */
      delay: number;
    }
    const namingEchoes: NamingEcho[] = [];

    ordered.forEach((con, conIdx) => {
      const [r, g, b] = hexToRgb(con.color);
      const conDelay = conIdx * 40;

      // Check for personal name for naming echo
      const personalName = constellationNames?.[con.id];
      if (personalName && personalName !== con.name) {
        // Project constellation center to screen
        const cp = project(con.center, camera, width, height);
        if (!cp.behind) {
          namingEchoes.push({
            name: personalName.toUpperCase(),
            x: cp.x,
            y: cp.y,
            r, g, b,
            delay: conIdx * 60, // Each constellation's name appears 1 second apart
          });
        }
      }

      for (const [idA, idB] of con.connections) {
        const starA = stars.find(s => s.id === idA);
        const starB = stars.find(s => s.id === idB);
        if (!starA || !starB) continue;

        const pA = project(starA.pos, camera, width, height);
        const pB = project(starB.pos, camera, width, height);
        if (pA.behind || pB.behind) continue;

        // Store segment for afterimage
        afterimageSegments.push({
          x1: pA.x, y1: pA.y,
          x2: pB.x, y2: pB.y,
          r, g, b,
        });

        // Spawn trace particles
        const particleCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < particleCount; i++) {
          const burstAngle = Math.random() * Math.PI * 2;
          const burstSpeed = 0.5 + Math.random() * 2;
          traceParticles.push({
            x: pA.x, y: pA.y,
            sx: pA.x, sy: pA.y,
            ex: pB.x, ey: pB.y,
            t: -i * 0.15,
            speed: 0.008 + Math.random() * 0.012,
            bvx: Math.cos(burstAngle) * burstSpeed,
            bvy: Math.sin(burstAngle) * burstSpeed,
            phase: 'trace',
            life: 180 + Math.floor(Math.random() * 120),
            maxLife: 180 + Math.floor(Math.random() * 120),
            size: 1.2 + Math.random() * 1.8,
            r, g, b,
            conDelay,
          });
        }
      }
    });

    let raf: number;
    let frame = 0;
    const maxFrames = 2400; // ~40s to accommodate universe ghost trace

    // Supernova state
    let supernovaStarted = false;
    let supernovaFrame = 0;

    // Afterimage state
    let afterimageStarted = false;
    let afterimageStartFrame = 0;
    const afterimageDuration = 720; // ~12 seconds at 60fps

    // Shared timing constants
    const echoLifespan = 360; // 6 seconds total at 60fps
    const uniLifespan = 480;  // 8 seconds
    const uniGhostDuration = 900; // 15 seconds

    const draw = () => {
      if (frame >= maxFrames) return;
      ctx.clearRect(0, 0, width, height);

      let tracingCount = 0;
      let burstCount = 0;

      // ── Afterimage layer (drawn first, behind everything) ──
      if (afterimageStarted) {
        const aiProgress = Math.min(1, (frame - afterimageStartFrame) / afterimageDuration);
        // Fade: start visible then slowly dissolve
        const aiAlpha = 0.12 * Math.pow(1 - aiProgress, 1.5);

        // Phase AC+: Drift multiplier — segments expand gently outward from center
        const driftScale = 1 + aiProgress * 0.06;

        // Phase AC++: Rotation angle for spiral effect
        const rotationAngle = aiProgress * 2 * Math.PI / 180;
        const cosTheta = Math.cos(rotationAngle);
        const sinTheta = Math.sin(rotationAngle);

        // ── Afterimage constellation outlines ─
        if (aiAlpha > 0.002) {
          for (const seg of afterimageSegments) {
            const dx1 = (seg.x1 - centerX) * driftScale + centerX;
            const dy1 = (seg.y1 - centerY) * driftScale + centerY;
            const dx2 = (seg.x2 - centerX) * driftScale + centerX;
            const dy2 = (seg.y2 - centerY) * driftScale + centerY;

            const x1r = (dx1 - centerX) * cosTheta - (dy1 - centerY) * sinTheta + centerX;
            const y1r = (dx1 - centerX) * sinTheta + (dy1 - centerY) * cosTheta + centerY;
            const x2r = (dx2 - centerX) * cosTheta - (dy2 - centerY) * sinTheta + centerX;
            const y2r = (dx2 - centerX) * sinTheta + (dy2 - centerY) * cosTheta + centerY;

            ctx.beginPath();
            ctx.moveTo(x1r, y1r);
            ctx.lineTo(x2r, y2r);
            ctx.strokeStyle = `rgba(${seg.r}, ${seg.g}, ${seg.b}, ${aiAlpha * 0.6})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();

            const dotAlpha = aiAlpha * 0.9;
            ctx.beginPath();
            ctx.arc(x1r, y1r, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${seg.r}, ${seg.g}, ${seg.b}, ${dotAlpha})`;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x2r, y2r, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${seg.r}, ${seg.g}, ${seg.b}, ${dotAlpha})`;
            ctx.fill();
          }

          // ── Naming echoes — personal names stagger into view ──
          const echoFadeIn = 60;
          const echoFadeOut = 120;
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          for (const echo of namingEchoes) {
            const echoFrame = frame - afterimageStartFrame - echo.delay;
            if (echoFrame < 0 || echoFrame > echoLifespan) continue;

            let echoAlpha: number;
            if (echoFrame < echoFadeIn) {
              echoAlpha = echoFrame / echoFadeIn;
            } else if (echoFrame > echoLifespan - echoFadeOut) {
              echoAlpha = (echoLifespan - echoFrame) / echoFadeOut;
            } else {
              echoAlpha = 1;
            }
            echoAlpha *= 0.45;

            const ex = (echo.x - centerX) * driftScale;
            const ey = (echo.y - centerY) * driftScale;
            const rx = ex * cosTheta - ey * sinTheta + centerX;
            const ry = ex * sinTheta + ey * cosTheta + centerY;

            const yDrift = -echoFrame * 0.015;

            const fontSize = Math.min(11, width * 0.028);
            ctx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
            ctx.letterSpacing = '2px';

            ctx.shadowColor = `rgba(${echo.r}, ${echo.g}, ${echo.b}, ${echoAlpha * 0.5})`;
            ctx.shadowBlur = 8;
            ctx.fillStyle = `rgba(${echo.r}, ${echo.g}, ${echo.b}, ${echoAlpha})`;
            ctx.fillText(echo.name, rx, ry - 18 + yDrift);

            ctx.shadowBlur = 0;
          }
          ctx.restore();
        }

        // ── Ghost traces with chromatic shift toward gold ──
        // Rendered outside aiAlpha guard so they persist independently
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (const echo of namingEchoes) {
          const echoFrame = frame - afterimageStartFrame - echo.delay;
          if (echoFrame <= echoLifespan) continue;

          const echoEndTime = afterimageStartFrame + echo.delay + echoLifespan;
          const remainingDuration = afterimageDuration - (echoEndTime - afterimageStartFrame);
          if (remainingDuration <= 0) continue;
          const ghostProgress = Math.min(1, (frame - echoEndTime) / remainingDuration);
          const ghostAlpha = 0.07 * Math.pow(1 - ghostProgress, 1.5);
          if (ghostAlpha < 0.002) continue;

          const gex = (echo.x - centerX) * driftScale;
          const gey = (echo.y - centerY) * driftScale;
          const grx = gex * cosTheta - gey * sinTheta + centerX;
          const gry = gex * sinTheta + gey * cosTheta + centerY;
          const frozenYDrift = -echoLifespan * 0.015;

          const fontSize = Math.min(11, width * 0.028);
          ctx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
          ctx.letterSpacing = '2px';

          // Phase AC++++: Chromatic shift — blend from constellation color toward gold
          const shiftCurve = Math.pow(ghostProgress, 0.7);
          const gr = Math.round(echo.r + (255 - echo.r) * shiftCurve);
          const gg = Math.round(echo.g + (224 - echo.g) * shiftCurve);
          const gb = Math.round(echo.b + (136 - echo.b) * shiftCurve);

          ctx.shadowColor = `rgba(${gr}, ${gg}, ${gb}, ${ghostAlpha * 0.4})`;
          ctx.shadowBlur = 6;
          ctx.fillStyle = `rgba(${gr}, ${gg}, ${gb}, ${ghostAlpha})`;
          ctx.fillText(echo.name, grx, gry - 18 + frozenYDrift);

          ctx.shadowBlur = 0;
        }
        ctx.restore();

        // ── Universe name echo + breathing pulse + orbiting glyphs ──
        if (universeName && namingEchoes.length > 0) {
          const lastEchoEnd = Math.max(...namingEchoes.map(e => e.delay + echoLifespan));
          const uniFrame = (frame - afterimageStartFrame) - lastEchoEnd;
          const uniFadeIn = 120;
          const uniFadeOut = 180;

          if (uniFrame >= 0 && uniFrame <= uniLifespan) {
            let uniAlpha: number;
            if (uniFrame < uniFadeIn) {
              uniAlpha = uniFrame / uniFadeIn;
            } else if (uniFrame > uniLifespan - uniFadeOut) {
              uniAlpha = (uniLifespan - uniFrame) / uniFadeOut;
            } else {
              uniAlpha = 1;
            }

            // Phase AC++++: Breathing pulse during hold phase
            const holdStart = uniFadeIn;
            const holdEnd = uniLifespan - uniFadeOut;
            if (uniFrame >= holdStart && uniFrame <= holdEnd) {
              const breathFreq = 0.8; // Hz — gentle breath
              const breathPhase = (uniFrame - holdStart) / 60 * breathFreq * Math.PI * 2;
              const breathMod = 1 + 0.08 * Math.sin(breathPhase);
              uniAlpha *= breathMod;
            }

            uniAlpha *= 0.55;

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const uniFontSize = Math.min(18, width * 0.045);
            ctx.font = `300 ${uniFontSize}px Georgia, 'Times New Roman', serif`;
            ctx.letterSpacing = '3px';

            ctx.shadowColor = `rgba(255, 224, 136, ${uniAlpha * 0.6})`;
            ctx.shadowBlur = 14;
            ctx.fillStyle = `rgba(255, 224, 136, ${uniAlpha})`;
            ctx.fillText(universeName.toUpperCase(), centerX, centerY);

            ctx.shadowBlur = 4;
            ctx.fillText(universeName.toUpperCase(), centerX, centerY);

            ctx.shadowBlur = 0;
            ctx.restore();

            // ── Phase AC++++: Orbiting constellation glyph ring ──
            // Six miniature constellation patterns orbit around the text
            const orbitRadiusBase = Math.min(55, width * 0.12);
            const orbitSpeedBase = (2 * Math.PI) / (30 * 60); // Full rotation in 30 seconds
            const glyphAlpha = uniAlpha * 0.7;

            // Phase AC+++++: Gathering convergence — during fade-out, glyphs ease inward
            const fadeOutStart = uniLifespan - uniFadeOut;
            let gatherProgress = 0;
            if (uniFrame > fadeOutStart) {
              gatherProgress = Math.min(1, (uniFrame - fadeOutStart) / uniFadeOut);
            }
            // easeIn (quadratic) so the gathering accelerates toward center
            const gatherFactor = 1 - Math.pow(gatherProgress, 2);
            const orbitRadius = orbitRadiusBase * gatherFactor;

            // Phase AC++++++: Gravitational spiral — orbit speed increases
            // with a cubic curve during gathering, like matter spiraling into a singularity
            const spiralAccel = 1 + Math.pow(gatherProgress, 3) * 8;
            const baseAngle = uniFrame * orbitSpeedBase * spiralAccel;

            for (let gi = 0; gi < miniGlyphs.length; gi++) {
              const mg = miniGlyphs[gi];
              if (mg.points.length === 0) continue;

              const angle = baseAngle + (gi / miniGlyphs.length) * Math.PI * 2;
              const ox = centerX + orbitRadius * Math.cos(angle);
              const oy = centerY + orbitRadius * Math.sin(angle);

              // Phase AC++++++: Chromatic shift toward gold during gathering
              const goldShift = Math.pow(gatherProgress, 0.7);
              const shR = Math.round(mg.r + (255 - mg.r) * goldShift);
              const shG = Math.round(mg.g + (224 - mg.g) * goldShift);
              const shB = Math.round(mg.b + (136 - mg.b) * goldShift);

              // Phase AC+++++: Cometary trail arcs — fading dots behind each glyph
              // spanning ~90° of arc (π/2 radians) at the current orbit radius
              const trailSteps = 14;
              const trailArcSpan = Math.PI / 2; // 90 degrees
              for (let ti = 1; ti <= trailSteps; ti++) {
                const trailAngle = angle - (ti / trailSteps) * trailArcSpan;
                const trailFade = Math.pow(1 - ti / trailSteps, 2.2); // Exponential decay
                const tx = centerX + orbitRadius * Math.cos(trailAngle);
                const ty = centerY + orbitRadius * Math.sin(trailAngle);
                const trailDotAlpha = glyphAlpha * trailFade * 0.35;
                if (trailDotAlpha < 0.003) continue;

                ctx.beginPath();
                ctx.arc(tx, ty, 0.6 + trailFade * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${shR}, ${shG}, ${shB}, ${trailDotAlpha})`;
                ctx.fill();
              }

              // Draw connection lines
              for (const [ia, ib] of mg.lines) {
                const pa = mg.points[ia];
                const pb = mg.points[ib];
                ctx.beginPath();
                ctx.moveTo(ox + pa.nx, oy + pa.ny);
                ctx.lineTo(ox + pb.nx, oy + pb.ny);
                ctx.strokeStyle = `rgba(${shR}, ${shG}, ${shB}, ${glyphAlpha * 0.5})`;
                ctx.lineWidth = 0.5 + (gatherProgress * 0.9);
                ctx.stroke();
              }

              // Draw star dots
              for (const p of mg.points) {
                // Phase AC+++++++++++++++ : Luminous compression — at maximum
                // flicker frequency the star dots shrink by up to 5%, as if
                // gravitational pressure is momentarily overpowering their
                // luminosity, compressing them inward alongside their halos
                let starDotRadius = 0.9 + gatherProgress * 0.4;
                // Phase AC++++++++++++++++ : Density brightening multiplier —
                // computed alongside compression so the same energy is packed
                // into a smaller volume, making the star momentarily brighter
                let densityBrighten = 0;
                if (gatherProgress > 0.8) {
                  const flickerNorm = (gatherProgress - 0.8) / 0.2;
                  const freqHz = flickerNorm > 0.75 ? 3 + (flickerNorm - 0.75) / 0.25 * 3 : 3;
                  const freqRatioForSize = freqHz / 6;
                  starDotRadius *= 1 - freqRatioForSize * 0.05;
                  // Phase AC++++++++++++++++ : Density brightening — as the star
                  // compresses by up to 5%, alpha increases by a matching 5% at
                  // the same frequency ratio, creating a density illusion where
                  // the same luminous energy is packed into a smaller volume
                  densityBrighten = freqRatioForSize * 0.05;
                }
                ctx.beginPath();
                ctx.arc(ox + p.nx, oy + p.ny, starDotRadius, 0, Math.PI * 2);
                // Phase AC+++++++++: Compressed star brilliance — stars burn hotter
                // under gravitational pressure, alpha rises from 0.8 to 0.95
                const starDotAlpha = glyphAlpha * (0.8 + gatherProgress * 0.15 + densityBrighten);
                // Phase AC++++++++++ : Critical luminosity halo — soft glow emerges
                // around each star as they approach critical brightness under compression
                if (gatherProgress > 0.01) {
                  ctx.save();
                  // Phase AC++++++++++++++++++ : Corona density intensification —
                  // the halo's shadowColor alpha also increases by densityBrighten
                  // scaled to 0.4, so the compressed star's surrounding corona
                  // intensifies proportionally, reinforcing the density illusion
                  // not just at the dot core but through its glow as well
                  const haloAlphaBase = 0.4 + densityBrighten * 0.4;
                  ctx.shadowColor = `rgba(${shR}, ${shG}, ${shB}, ${starDotAlpha * haloAlphaBase})`;
                  // Phase AC+++++++++++ : Critical threshold flicker — in the final
                  // 20% of gathering, shadowBlur pulses at 3Hz suggesting the stars
                  // are approaching a critical threshold before collapse
                  let haloBlur = gatherProgress * 2;
                  if (gatherProgress > 0.8) {
                    // Phase AC++++++++++++ : Frequency doubling — in the final 5%
                    // of gathering the flicker accelerates from 3Hz to 6Hz, as if
                    // the oscillation is becoming unstable just before collapse
                    const flickerNorm = (gatherProgress - 0.8) / 0.2; // 0→1 over last 20%
                    const freqHz = flickerNorm > 0.75 ? 3 + (flickerNorm - 0.75) / 0.25 * 3 : 3; // 3→6Hz in final 5%
                    const flickerPhase = flickerNorm * freqHz * Math.PI * 2;
                    haloBlur *= 1 + 0.35 * Math.sin(flickerPhase);
                    // Phase AC+++++++++++++ : Luminous expenditure — as flicker
                    // frequency doubles, shadow alpha dims from 0.4 to 0.3 as if
                    // the star is spending its luminous energy faster in those
                    // final oscillations before collapse
                    const freqRatio = freqHz / 6; // 0.5 at 3Hz, 1.0 at 6Hz
                    const expendedAlpha = starDotAlpha * (0.4 - freqRatio * 0.1);
                    ctx.shadowColor = `rgba(${shR}, ${shG}, ${shB}, ${expendedAlpha})`;
                    // Phase AC++++++++++++++ : Corona contraction — shadowBlur also
                    // tightens from 100% to 85% at maximum frequency, so the glow
                    // both dims and contracts inward as if the corona is being drawn
                    // back into the star before the final implosion
                    haloBlur *= 1 - freqRatio * 0.15;
                  }
                  ctx.shadowBlur = haloBlur;
                }
                ctx.fillStyle = `rgba(${shR}, ${shG}, ${shB}, ${starDotAlpha})`;
                ctx.fill();
                if (gatherProgress > 0.01) {
                  ctx.restore();
                }
              }
            }
          }

          // Phase AC++++++: Convergence spark — golden bloom when glyphs merge
          // Rendered outside the uniFrame<=uniLifespan guard so it persists after convergence
          {
            const sparkDuration = 36; // ~0.6 seconds
            if (uniFrame >= uniLifespan && uniFrame < uniLifespan + sparkDuration) {
              const sparkProgress = (uniFrame - uniLifespan) / sparkDuration;
              const sparkAlpha = 0.65 * Math.sin(sparkProgress * Math.PI);
              const sparkRadius = 1.2 + sparkProgress * 4;

              if (sparkAlpha > 0.01) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(centerX, centerY, sparkRadius * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 224, 136, ${sparkAlpha * 0.15})`;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(centerX, centerY, sparkRadius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 240, 190, ${sparkAlpha})`;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(centerX, centerY, sparkRadius * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${sparkAlpha * 0.8})`;
                ctx.fill();
                ctx.restore();
              }
            }
          }

          // Phase AC+++++++: Spark fusion particles — at the convergence spark
          // moment, six tiny particles (one per constellation, in their gold-shifted
          // colors) drift outward from center like sparks from the moment of fusion,
          // each fading over ~50 frames with gentle deceleration.
          {
            const fusionFrame = uniFrame - uniLifespan;
            if (fusionFrame >= 0 && fusionFrame < 50) {
              const fusionProgress = fusionFrame / 50;
              const fusionAlpha = 0.55 * Math.pow(1 - fusionProgress, 1.5);

              if (fusionAlpha > 0.01) {
                for (let gi = 0; gi < miniGlyphs.length; gi++) {
                  const mg = miniGlyphs[gi];
                  if (mg.points.length === 0) continue;

                  // Fully gold-shifted (gatherProgress was 1 at convergence)
                  const shR = Math.round(mg.r + (255 - mg.r) * 0.85);
                  const shG = Math.round(mg.g + (224 - mg.g) * 0.85);
                  const shB = Math.round(mg.b + (136 - mg.b) * 0.85);

                  const angle = (gi / miniGlyphs.length) * Math.PI * 2 + 0.3;
                  // Decelerated outward drift: starts fast, slows down
                  const driftDist = 22 * (1 - Math.pow(1 - fusionProgress, 0.4));
                  const fx = centerX + driftDist * Math.cos(angle);
                  const fy = centerY + driftDist * Math.sin(angle);
                  const dotSize = 0.8 * (1 - fusionProgress * 0.4);

                  // Outer glow
                  ctx.beginPath();
                  ctx.arc(fx, fy, dotSize * 2.5, 0, Math.PI * 2);
                  ctx.fillStyle = `rgba(${shR}, ${shG}, ${shB}, ${fusionAlpha * 0.15})`;
                  ctx.fill();
                  // Core dot
                  ctx.beginPath();
                  ctx.arc(fx, fy, dotSize, 0, Math.PI * 2);
                  ctx.fillStyle = `rgba(${shR}, ${shG}, ${shB}, ${fusionAlpha})`;
                  ctx.fill();

                  // Phase AC++++++++: Fusion micro-trails
                  // Leave 3 faint trailing dots behind each spark fusion particle,
                  // echoing the cometary trail language from the orbiting glyphs
                  for (let ti = 1; ti <= 3; ti++) {
                    const trailFade = Math.pow(1 - ti / 4, 2.2);
                    // Trail dots sit at earlier positions along the drift path
                    const trailProgress = Math.max(0, fusionProgress - ti * 0.06);
                    const trailDriftDist = 22 * (1 - Math.pow(1 - trailProgress, 0.4));
                    const trailX = centerX + trailDriftDist * Math.cos(angle);
                    const trailY = centerY + trailDriftDist * Math.sin(angle);
                    const trailDotAlpha = fusionAlpha * trailFade * 0.35;
                    if (trailDotAlpha < 0.003) continue;

                    // Phase AC+++++++++: Fusion ember memory — trail dots shift
                    // back from gold toward the original constellation color at
                    // the tail, like cooling embers remembering their origin
                    // Phase AC++++++++++ : Time-dependent ember cooling — reversion
                    // scales with fusionProgress so early trail dots stay gold-hot
                    // and only cool toward constellation color as they drift further
                    const emberRevert = ti / 3; // 0.33, 0.67, 1.0 along the tail
                    const coolingFactor = 0.6 * fusionProgress; // starts 0, reaches 0.6
                    const emR = Math.round(shR + (mg.r - shR) * emberRevert * coolingFactor);
                    const emG = Math.round(shG + (mg.g - shG) * emberRevert * coolingFactor);
                    const emB = Math.round(shB + (mg.b - shB) * emberRevert * coolingFactor);

                    // Phase AC+++++++++++ : Ember mass loss — dots that have cooled
                    // more also shrink slightly, as if losing mass as they shed golden energy
                    const massLoss = 1 - emberRevert * coolingFactor * 0.3;
                    const trailDotSize = (0.5 + trailFade * 0.3) * massLoss;

                    // Phase AC++++++++++++ : Ember dissolution opacity — dots that
                    // have lost mass also become more transparent, compounding the
                    // sense of dissolution as cooling embers fade from existence
                    const dissolutionAlpha = trailDotAlpha * (1 - emberRevert * coolingFactor * 0.15);

                    // Phase AC+++++++++++++ : Spectral blue shift — the most dissolved
                    // dots gain a faint blue channel boost (up to 5%), like the last
                    // light of a dying star shifting toward shorter wavelengths
                    const spectralShift = emberRevert * coolingFactor * 0.05;
                    // Phase AC++++++++++++++ : Red channel suppression — the most
                    // dissolved dots also lose up to 3% red, so the color shift is
                    // not just additive blue but a genuine wavelength migration away
                    // from warm tones, creating a more physically accurate spectral transition
                    const redSuppression = emberRevert * coolingFactor * 0.03;
                    // Phase AC+++++++++++++++ : Green channel suppression — the most
                    // dissolved dots also lose up to 1.5% green, complementing the
                    // red suppression so the color trends toward a deeper violet
                    // like the extreme ultraviolet edge of a stellar spectrum
                    // collapsing beyond visible wavelengths
                    const greenSuppression = emberRevert * coolingFactor * 0.015;
                    // Phase AC++++++++++++++++ : Chromatic vividity boost — when
                    // greenSuppression exceeds half its range, the blue channel's
                    // spectral shift increases from 5% to 7%, so the violet shift
                    // becomes more chromatically vivid rather than just subtractive,
                    // like the way a prism separates colors more dramatically at
                    // shorter wavelengths
                    // Phase AC++++++++++++++++++ : Sigmoid vividity smoothing —
                    // replaces the hard cutoff at greenSuppression > 0.005 with a
                    // smooth sigmoid curve so the transition from 5% to 7% spectral
                    // shift is gradual, avoiding any perceptible discontinuity in
                    // the color migration, like light passing through a prism where
                    // the refraction angle changes continuously, not in steps
                    const vividitySigmoid = 1 / (1 + Math.exp(-20 * (greenSuppression - 0.005)));
                    const vividityBoost = 0.02 * vividitySigmoid;
                    const boostedSpectralShift = spectralShift + vividityBoost;
                    const finalEmR = Math.round(emR * (1 - redSuppression));
                    const finalEmG = Math.round(emG * (1 - greenSuppression));
                    const finalEmB = Math.min(255, Math.round(emB + (255 - emB) * boostedSpectralShift));

                    ctx.beginPath();
                    ctx.arc(trailX, trailY, trailDotSize, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${finalEmR}, ${finalEmG}, ${finalEmB}, ${dissolutionAlpha})`;
                    ctx.fill();
                  }
                }
              }
            }
          }

          // ── Phase AC++++: Universe ghost trace ──
          // After the universe name echo fades, a persistent golden ghost lingers
          if (uniFrame > uniLifespan) {
            const ghostFrame = uniFrame - uniLifespan;
            const ghostProgress = Math.min(1, ghostFrame / uniGhostDuration);
            const ghostAlpha = 0.06 * Math.pow(1 - ghostProgress, 1.8);
            if (ghostAlpha > 0.002) {
              ctx.save();
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';

              const uniFontSize = Math.min(18, width * 0.045);
              ctx.font = `300 ${uniFontSize}px Georgia, 'Times New Roman', serif`;

              // Phase AC+++++: Letter spacing pulse — dampened sine wave
              // ~2.5 slow oscillations over the 15-second ghost duration,
              // amplitude shrinks as the ghost fades so the breathing stills
              const breathDampen = Math.pow(1 - ghostProgress, 1.2);
              const spacingBase = 3;
              const spacingAmplitude = 2.5 * breathDampen;
              const spacingFreq = 2.5; // oscillations over full duration

              // Phase AC+++++++: Spark-synced letter spacing — overlay a fast-decaying
              // impulse that peaks at the same frame as the convergence spark (frame 18),
              // so the spark's energy visibly ripples through the dissolving name before
              // the slower breathing takes over
              // Phase AC+++++++++: Causal spark ripple — delay widens over the
              // impulse lifetime so the gap between light and distortion grows
              // as the energy dissipates (0 frames at ignition, 3 frames at decay)
              // Phase AC++++++++++ : Animated causal delay — the delay itself is
              // animated from 0→3 frames over the impulse's 60-frame active window,
              // so brightness and distortion start simultaneous then gradually separate
              const causalDelay = Math.min(3, ghostFrame * 3 / 60);
              const delayedGhostFrame = Math.max(0, ghostFrame - causalDelay);
              const sparkSyncImpulse = Math.sin(delayedGhostFrame * Math.PI / 36)
                * Math.pow(Math.max(0, 1 - delayedGhostFrame / 60), 2);
              const slowBreath = Math.sin(ghostProgress * spacingFreq * Math.PI * 2);
              // Phase AC+++++++++++ : Decaying impulse amplitude — the spatial
              // distortion starts more dramatic (2.2x) but weakens faster than
              // brightness (to 1.4x), reinforcing that physical effects dissipate first
              // Phase AC++++++++++++ : Square root decay curve — amplitude drops
              // quickly at first then plateaus, creating an organic feeling of
              // initial explosive energy that rapidly settles into a residual ripple
              const impulseDecay = Math.sqrt(Math.min(1, ghostFrame / 60));
              const impulseAmplitude = 2.2 - impulseDecay * 0.8; // 2.2 → 1.4 (sqrt shaped)
              const spacingOffset = (sparkSyncImpulse * impulseAmplitude + slowBreath) * spacingAmplitude;
              ctx.letterSpacing = `${spacingBase + spacingOffset}px`;

              // Phase AC++++++++: Spark-sync alpha bloom
              // Briefly intensify the ghost trace's alpha at frame 18
              const sparkSyncAlphaBoost = Math.pow(Math.max(0, 1 - Math.abs(ghostFrame - 18) / 6), 2);
              // Phase AC+++++++++++++ : Front-loaded bloom decay — scale the alpha
              // boost's intensity down with the square of impulseDecay so the
              // brightness flash is also more front-loaded but decays more
              // gracefully than spatial distortion
              const bloomDecayFactor = 1 - Math.pow(impulseDecay, 2);
              const finalAlpha = ghostAlpha + sparkSyncAlphaBoost * 0.1 * bloomDecayFactor;

              ctx.shadowColor = `rgba(255, 224, 136, ${finalAlpha * 0.5})`;
              // Phase AC++++++++++++++ : Glow radius contraction — shadowBlur
              // contracts alongside the alpha reduction, scaled down by 30% of
              // bloomDecayFactor, reinforcing that the energy pulse is physically
              // shrinking as it dissipates rather than just fading in place
              // Phase AC+++++++++++++++ : Glow radius breathing — a subtle ±0.5px
              // oscillation at the same 2.5 frequency as the letter spacing's slow
              // breathing, so the glow appears to inhale and exhale in synchrony
              // with the dissolving name's spatial pulse
              // Phase AC++++++++++++++++ : Counterpoint phase shift — the glow
              // breathing is offset by a quarter cycle (π/2) relative to the
              // letter spacing, so the glow reaches its maximum radius when the
              // letters are at their neutral spacing, creating an out of phase
              // dance where the name and its aura breathe in counterpoint
              const glowBreathPhase = Math.sin(ghostProgress * spacingFreq * Math.PI * 2 + Math.PI / 2);
              // Phase AC++++++++++++++++++ : Glow breath quieting — in the final
              // third of the ghost duration, the glow breathing's ±0.5px range
              // narrows independently to ±0.3px, so the glow is the first to
              // reach stillness while the letter spacing continues its spatial
              // breathing slightly longer, like the aura settling before the name
              const glowQuietFactor = ghostProgress > 0.667
                ? 1 - (ghostProgress - 0.667) / 0.333 * 0.4  // 1.0 → 0.6 (maps ±0.5 to ±0.3)
                : 1;
              const glowBreathOsc = glowBreathPhase * breathDampen * 0.5 * glowQuietFactor;
              ctx.shadowBlur = 10 * (1 - (1 - bloomDecayFactor) * 0.3) + glowBreathOsc;
              ctx.fillStyle = `rgba(255, 224, 136, ${finalAlpha})`;
              ctx.fillText(universeName.toUpperCase(), centerX, centerY);

              ctx.shadowBlur = 0;
              ctx.restore();
            }
          }
        }
      }

      // ── Trace and burst particles ──
      for (const p of traceParticles) {
        const effectiveFrame = frame - p.conDelay;
        if (effectiveFrame < 0) continue;

        if (p.phase === 'trace') {
          tracingCount++;
          p.t += p.speed;
          if (p.t < 0) continue;

          const clampedT = Math.min(1, p.t);
          p.x = p.sx + (p.ex - p.sx) * clampedT;
          p.y = p.sy + (p.ey - p.sy) * clampedT;

          const traceAlpha = 0.5 * Math.sin(clampedT * Math.PI);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${traceAlpha * 0.2})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${traceAlpha * 0.7})`;
          ctx.fill();

          if (clampedT > 0.05) {
            const trailT = Math.max(0, clampedT - 0.15);
            const trailX = p.sx + (p.ex - p.sx) * trailT;
            const trailY = p.sy + (p.ey - p.sy) * trailT;
            ctx.beginPath();
            ctx.moveTo(trailX, trailY);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${traceAlpha * 0.15})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          if (p.t >= 1) {
            p.phase = 'burst';
            p.life = p.maxLife;
          }
        } else {
          if (p.life <= 0) continue;
          burstCount++;

          p.x += p.bvx;
          p.y += p.bvy;
          p.bvx *= 0.992;
          p.bvy *= 0.992;
          p.life--;

          const burstAlpha = Math.pow(p.life / p.maxLife, 0.7) * 0.45;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${burstAlpha * 0.12})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${burstAlpha})`;
          ctx.fill();
        }
      }

      // ── Golden supernova halo when all traces complete ──
      if (tracingCount === 0 && !supernovaStarted) {
        supernovaStarted = true;
        supernovaFrame = frame;
      }

      if (supernovaStarted) {
        const novaProgress = Math.min(1, (frame - supernovaFrame) / 180);
        const novaRadius = 20 + novaProgress * 120;
        const novaAlpha = novaProgress < 0.15
          ? (novaProgress / 0.15) * 0.12
          : 0.12 * Math.pow(1 - (novaProgress - 0.15) / 0.85, 0.4);

        if (novaAlpha > 0.003) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, novaRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 224, 136, ${novaAlpha})`;
          ctx.lineWidth = 1.5 + (1 - novaProgress) * 2.5;
          ctx.stroke();

          const grad = ctx.createRadialGradient(
            centerX, centerY, novaRadius * 0.2,
            centerX, centerY, novaRadius,
          );
          grad.addColorStop(0, `rgba(255, 224, 136, ${novaAlpha * 0.25})`);
          grad.addColorStop(0.5, `rgba(255, 224, 136, ${novaAlpha * 0.08})`);
          grad.addColorStop(1, `rgba(255, 224, 136, 0)`);
          ctx.beginPath();
          ctx.arc(centerX, centerY, novaRadius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Start afterimage when supernova halo is about halfway through
        if (!afterimageStarted && novaProgress > 0.4) {
          afterimageStarted = true;
          afterimageStartFrame = frame;
        }
      }

      frame++;
      const particlesAlive = burstCount > 0 || tracingCount > 0;
      const supernovaAlive = supernovaStarted && (frame - supernovaFrame) < 180;
      const afterimageAlive = afterimageStarted && (frame - afterimageStartFrame) < afterimageDuration;
      // Universe echo + ghost extend well beyond afterimage duration
      const lastEchoEndForLoop = namingEchoes.length > 0
        ? Math.max(...namingEchoes.map(e => e.delay + echoLifespan))
        : 0;
      const universePhaseAlive = afterimageStarted && universeName && namingEchoes.length > 0
        && (frame - afterimageStartFrame) < (lastEchoEndForLoop + uniLifespan + uniGhostDuration);
      // Ghost traces may still be visible
      const ghostsAlive = afterimageStarted && namingEchoes.length > 0
        && (frame - afterimageStartFrame) < afterimageDuration;
      if ((particlesAlive || supernovaAlive || afterimageAlive || universePhaseAlive || ghostsAlive) && frame < maxFrames) {
        raf = requestAnimationFrame(draw);
      }
    };

    const timeout = setTimeout(() => {
      raf = requestAnimationFrame(draw);
    }, 1200);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [stars, camera, width, height, lastCompletedId, constellationNames, universeName]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}