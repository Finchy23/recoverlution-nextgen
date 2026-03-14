/**
 * COPY — text cut into the glass
 *
 * The glass device on the left, copy parameters on the right.
 * Base surface controls at the bottom.
 *
 * Copy variables:
 *   Content    — what words (Silence, Presence, Anchor, Name)
 *   Position   — where on the glass (Center, Upper, Lower, Offset)
 *   Scale      — visual size (Whisper, Voice, Declaration)
 *   Treatment  — the glass effect (Recess, Etch, Frost, Ember, Shadow)
 *   Weight     — font weight (Light, Regular, Medium)
 *   Tracking   — letter-spacing (Tight, Normal, Wide, Expansive)
 *   Style      — font style (Roman, Italic)
 *   Entrance   — how text appears (Instant, Fade, Rise, Breathe)
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  type InteractionType, type MotionType, type ColorType, type Device,
  type Atmosphere,
  interactionList, motionList, atmosphereList, temperatureList, colorList,
} from '../components/design-system/surface-engine';
import { GlassSurface } from '../components/design-system/GlassSurface';
import { room, font, tracking, typeSize, weight, timing, glaze, layer, leading } from '../components/design-system/surface-tokens';

// ═══════════════════════════════════════════════════
// COPY LAYER DEFINITIONS
// ═══════════════════════════════════════════════

type ContentType = 'silence' | 'presence' | 'anchor' | 'name';
type PositionType = 'center' | 'upper' | 'lower' | 'offset';
type ScaleType = 'whisper' | 'voice' | 'declaration';
type TreatmentType = 'recess' | 'etch' | 'frost' | 'ember' | 'shadow';
type WeightType = 'light' | 'regular' | 'medium';
type TrackingType = 'tight' | 'normal' | 'wide' | 'expansive';
type StyleType = 'roman' | 'italic';
type EntranceType = 'instant' | 'fade' | 'rise' | 'breathe';

const contentList: { id: ContentType; label: string }[] = [
  { id: 'silence',  label: 'Silence' },
  { id: 'presence', label: 'Presence' },
  { id: 'anchor',   label: 'Anchor' },
  { id: 'name',     label: 'Name' },
];

const positionList: { id: PositionType; label: string }[] = [
  { id: 'center', label: 'Center' },
  { id: 'upper',  label: 'Upper' },
  { id: 'lower',  label: 'Lower' },
  { id: 'offset', label: 'Offset' },
];

const scaleList: { id: ScaleType; label: string }[] = [
  { id: 'whisper',     label: 'Whisper' },
  { id: 'voice',       label: 'Voice' },
  { id: 'declaration', label: 'Declaration' },
];

const treatmentList: { id: TreatmentType; label: string }[] = [
  { id: 'recess', label: 'Recess' },
  { id: 'etch',   label: 'Etch' },
  { id: 'frost',  label: 'Frost' },
  { id: 'ember',  label: 'Ember' },
  { id: 'shadow', label: 'Shadow' },
];

const weightList: { id: WeightType; label: string }[] = [
  { id: 'light',   label: 'Light' },
  { id: 'regular', label: 'Regular' },
  { id: 'medium',  label: 'Medium' },
];

const trackingList: { id: TrackingType; label: string }[] = [
  { id: 'tight',     label: 'Tight' },
  { id: 'normal',    label: 'Normal' },
  { id: 'wide',      label: 'Wide' },
  { id: 'expansive', label: 'Expansive' },
];

const styleList: { id: StyleType; label: string }[] = [
  { id: 'roman',  label: 'Roman' },
  { id: 'italic', label: 'Italic' },
];

const entranceList: { id: EntranceType; label: string }[] = [
  { id: 'instant', label: 'Instant' },
  { id: 'fade',    label: 'Fade' },
  { id: 'rise',    label: 'Rise' },
  { id: 'breathe', label: 'Breathe' },
];

// ═══════════════════════════════════════════════════
// COPY CONTENT RESOLVER
// ═══════════════════════════════════════════════════

function getCopyText(
  content: ContentType, interaction: InteractionType, motion: MotionType, breath: number,
): string | null {
  if (content === 'silence') return null;
  if (content === 'name') return 'Recoverlution';
  if (content === 'anchor') {
    const p: Record<InteractionType, string> = {
      'floating-particle-displacement': 'you are here', 'surface-refraction': 'let it move through',
      'viscous-drag': 'already connected', 'gyroscopic-parallax': 'held', 'haptic-entrainment': 'still beating',
      'acoustic-flutter': 'I hear you',
    };
    return p[interaction];
  }
  // presence — cycling words
  const inhale = breath > 0.5;
  const w: Record<InteractionType, Partial<Record<MotionType, [string, string]>>> = {
    'floating-particle-displacement': { 'tectonic-drift':['rest','settle'], 'somatic-breath':['expand','gather'], 'viscous-unspooling':['drift','release'], 'pendulum-settle':['together','finding'], 'cymatic-ripple':['scatter','return'], 'defocus-dissolve':['dissolve','emerge'] },
    'surface-refraction':             { 'tectonic-drift':['quiet','deep'], 'somatic-breath':['ripple','still'], 'viscous-unspooling':['carry','arrive'], 'pendulum-settle':['echo','resonate'], 'cymatic-ripple':['surge','recede'], 'defocus-dissolve':['blur','focus'] },
    'viscous-drag':                   { 'tectonic-drift':['rooted','held'], 'somatic-breath':['weave','rest'], 'viscous-unspooling':['reach','connect'], 'pendulum-settle':['converge','form'], 'cymatic-ripple':['dissolve','reform'], 'defocus-dissolve':['soften','sharpen'] },
    'gyroscopic-parallax':            { 'tectonic-drift':['surface','beneath'], 'somatic-breath':['inhale','exhale'], 'viscous-unspooling':['undulate','settle'], 'pendulum-settle':['tension','release'], 'cymatic-ripple':['tremor','ground'], 'defocus-dissolve':['recede','approach'] },
    'haptic-entrainment':             { 'tectonic-drift':['steady','here'], 'somatic-breath':['rise','fall'], 'viscous-unspooling':['rhythm','carry'], 'pendulum-settle':['pulse','gather'], 'cymatic-ripple':['surge','anchor'], 'defocus-dissolve':['fade','return'] },
    'acoustic-flutter':               { 'tectonic-drift':['listen','hold'], 'somatic-breath':['breathe','speak'], 'viscous-unspooling':['flow','pause'], 'pendulum-settle':['resonate','settle'], 'cymatic-ripple':['flutter','ground'], 'defocus-dissolve':['whisper','silence'] },
  };
  const pair = w[interaction]?.[motion] ?? ['here', 'now'];
  return inhale ? pair[0] : pair[1];
}

// ═══════════════════════════════════════════════════
// COPY RENDERER — the glass-cut text overlay
// ══════════════════════════════════════════════════

function CopyOverlay({
  text, position, scale, treatment, weight, tracking, fontStyle, entrance,
  breath, atmosphere, isPhone,
}: {
  text: string;
  position: PositionType;
  scale: ScaleType;
  treatment: TreatmentType;
  weight: WeightType;
  tracking: TrackingType;
  fontStyle: StyleType;
  entrance: EntranceType;
  breath: number;
  atmosphere: Atmosphere;
  isPhone: boolean;
}) {
  const mountRef = useRef(performance.now());
  const [, tick] = useState(0);

  // Animate entrance
  useEffect(() => {
    mountRef.current = performance.now();
    if (entrance === 'instant') return;
    const id = setInterval(() => tick(n => n + 1), 60);
    const timeout = setTimeout(() => clearInterval(id), 3000);
    return () => { clearInterval(id); clearTimeout(timeout); };
  }, [text, entrance]);

  const elapsed = (performance.now() - mountRef.current) / 1000;

  // Entrance progress (0→1 over ~1.5s)
  let entranceProgress = 1;
  if (entrance === 'fade') entranceProgress = Math.min(1, elapsed / 1.5);
  if (entrance === 'rise') entranceProgress = Math.min(1, elapsed / 1.8);
  if (entrance === 'breathe') entranceProgress = breath;

  // Font size — big enough for treatments to read
  const sizeMap: Record<ScaleType, { phone: string; desktop: string }> = {
    whisper:     { phone: '22px', desktop: '28px' },
    voice:       { phone: '36px', desktop: '52px' },
    declaration: { phone: '56px', desktop: '84px' },
  };
  const fontSize = isPhone ? sizeMap[scale].phone : sizeMap[scale].desktop;

  // Font weight
  const weightMap: Record<WeightType, number> = { light: 300, regular: 400, medium: 500 };
  const fontWeightVal = weightMap[weight];

  // Letter spacing
  const trackMap: Record<TrackingType, string> = {
    tight: '0.02em', normal: '0.06em', wide: '0.14em', expansive: '0.28em',
  };
  const letterSpacing = trackMap[tracking];

  // Position
  const posMap: Record<PositionType, React.CSSProperties> = {
    center: { top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
    upper:  { top: 0, left: 0, right: 0, bottom: '40%', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '4%' },
    lower:  { top: '40%', left: 0, right: 0, bottom: 0, alignItems: 'flex-start', justifyContent: 'center', paddingTop: '4%' },
    offset: { top: 0, left: 0, right: '10%', bottom: '8%', alignItems: 'flex-end', justifyContent: 'flex-start', paddingLeft: '10%' },
  };

  // Shared font
  const copyFont: React.CSSProperties = {
    fontFamily: font.serif,
    fontSize,
    fontWeight: fontWeightVal,
    fontStyle: fontStyle === 'italic' ? 'italic' : 'normal',
    letterSpacing,
    textTransform: text === 'Recoverlution' ? 'none' : 'lowercase',
    textAlign: position === 'offset' ? 'left' : 'center',
    padding: '0 24px',
    userSelect: 'none',
    lineHeight: leading.display,
  };

  // Entrance transforms
  let opacity = entranceProgress;
  let translateY = 0;
  if (entrance === 'rise') {
    const ease = 1 - Math.pow(1 - entranceProgress, 3);
    translateY = (1 - ease) * 20;
    opacity = ease;
  }

  const bScale = 1 + (breath - 0.5) * 0.006;

  // Treatment-specific rendering
  const renderTreatment = () => {
    // Atmosphere colour hex helpers
    const midHex = (a: number) => `${atmosphere.mid}${Math.round(Math.min(1, a) * 255).toString(16).padStart(2, '0')}`;
    const deepHex = (a: number) => `${atmosphere.deep}${Math.round(Math.min(1, a) * 255).toString(16).padStart(2, '0')}`;
    const accentHex = (a: number) => `${atmosphere.accent}${Math.round(Math.min(1, a) * 255).toString(16).padStart(2, '0')}`;

    switch (treatment) {
      case 'recess':
        // CUT INTO GLASS — deep multiply void, strong edge highlights,
        // atmosphere refraction at the cut rim. The surface beneath
        // shows through the letter-shaped absence.
        return (
          <>
            {/* Deep recess — darkens what's beneath */}
            <span style={{
              ...copyFont, position: 'absolute',
              color: `rgba(0,0,0,${(0.55 + breath * 0.15).toFixed(3)})`,
              mixBlendMode: 'multiply',
            }}>
              {text}
            </span>
            {/* Inner shadow — depth of the cut */}
            <span style={{
              ...copyFont, position: 'absolute',
              color: 'transparent',
              textShadow: [
                `0 1px 2px rgba(0,0,0,${(0.6 + breath * 0.15).toFixed(3)})`,
                `0 2px 6px rgba(0,0,0,${(0.3 + breath * 0.1).toFixed(3)})`,
              ].join(', '),
            }}>
              {text}
            </span>
            {/* Top-edge catch light — the glass rim catches ambient light */}
            <span style={{
              ...copyFont, position: 'absolute',
              color: 'transparent',
              textShadow: `0 -1px 0 rgba(255,255,255,${(0.14 + breath * 0.06).toFixed(3)})`,
            }}>
              {text}
            </span>
            {/* Atmosphere refraction at cut edges */}
            <span style={{
              ...copyFont, position: 'absolute',
              color: 'transparent',
              WebkitTextStroke: `0.5px rgba(255,255,255,${(0.08 + breath * 0.04).toFixed(3)})`,
              textShadow: [
                `0 0 4px ${midHex(0.2 + breath * 0.1)}`,
                `0 0 12px ${deepHex(0.1 + breath * 0.06)}`,
              ].join(', '),
            }}>
              {text}
            </span>
          </>
        );

      case 'etch':
        // LASER ETCHED — no recess, no fill. Pure luminous outline
        // as if a laser has scored the glass and light bleeds from
        // the score lines. Crisp, high contrast, unmistakable.
        return (
          <>
            {/* Wide atmosphere bloom behind the score */}
            <span style={{
              ...copyFont, position: 'absolute',
              color: 'transparent',
              textShadow: [
                `0 0 20px ${midHex(0.15 + breath * 0.1)}`,
                `0 0 40px ${deepHex(0.08 + breath * 0.05)}`,
              ].join(', '),
            }}>
              {text}
            </span>
            {/* Mid glow — the light bleeding from the score */}
            <span style={{
              ...copyFont, position: 'absolute',
              color: 'transparent',
              textShadow: [
                `0 0 3px rgba(255,255,255,${(0.3 + breath * 0.15).toFixed(3)})`,
                `0 0 8px ${midHex(0.25 + breath * 0.12)}`,
              ].join(', '),
            }}>
              {text}
            </span>
            {/* The score itself — crisp luminous stroke */}
            <span style={{
              ...copyFont, position: 'absolute',
              color: 'transparent',
              WebkitTextStroke: `1px rgba(255,255,255,${(0.55 + breath * 0.2).toFixed(3)})`,
              textShadow: `0 0 1px rgba(255,255,255,${(0.4 + breath * 0.2).toFixed(3)})`,
            }}>
              {text}
            </span>
          </>
        );

      case 'frost':
        // FROSTED GLASS — soft, diffused, as if breath has condensed
        // on the glass. Visible white fill with a wide milky bloom.
        // Atmosphere colour seeps through at the edges.
        return (
          <>
            {/* Wide atmospheric haze around text */}
            <span style={{
              ...copyFont, position: 'absolute',
              color: 'transparent',
              textShadow: [
                `0 0 30px rgba(255,255,255,${(0.08 + breath * 0.04).toFixed(3)})`,
                `0 0 60px ${midHex(0.06 + breath * 0.03)}`,
              ].join(', '),
            }}>
              {text}
            </span>
            {/* Mid frost bloom */}
            <span style={{
              ...copyFont, position: 'absolute',
              color: 'transparent',
              textShadow: [
                `0 0 12px rgba(255,255,255,${(0.15 + breath * 0.08).toFixed(3)})`,
                `0 0 4px rgba(255,255,255,${(0.12 + breath * 0.06).toFixed(3)})`,
              ].join(', '),
            }}>
              {text}
            </span>
            {/* Visible frosted text — soft white fill */}
            <span style={{
              ...copyFont, position: 'absolute',
              color: `rgba(255,255,255,${(0.28 + breath * 0.12).toFixed(3)})`,
              textShadow: `0 0 2px rgba(255,255,255,${(0.1 + breath * 0.05).toFixed(3)})`,
            }}>
              {text}
            </span>
            {/* Subtle outline definition */}
            <span style={{
              ...copyFont, position: 'absolute',
              color: 'transparent',
              WebkitTextStroke: `0.3px rgba(255,255,255,${(0.08 + breath * 0.04).toFixed(3)})`,
            }}>
              {text}
            </span>
          </>
        );

      case 'ember':
        // BURNING FROM WITHIN — the text glows with the atmosphere
        // colour as if the glass is incandescent at those points.
        // Rich colour fill, dramatic bloom, unmistakable palette.
        return (
          <>
            {/* Wide colour bloom — the heat haze */}
            <span style={{
              ...copyFont, position: 'absolute',
              color: 'transparent',
              textShadow: [
                `0 0 40px ${midHex(0.2 + breath * 0.12)}`,
                `0 0 80px ${deepHex(0.1 + breath * 0.06)}`,
              ].join(', '),
            }}>
              {text}
            </span>
            {/* Tight colour glow */}
            <span style={{
              ...copyFont, position: 'absolute',
              color: 'transparent',
              textShadow: [
                `0 0 6px ${midHex(0.4 + breath * 0.15)}`,
                `0 0 15px ${midHex(0.2 + breath * 0.1)}`,
              ].join(', '),
            }}>
              {text}
            </span>
            {/* Solid colour fill — the ember */}
            <span style={{
              ...copyFont, position: 'absolute',
              color: `${atmosphere.mid}${Math.round((0.6 + breath * 0.2) * 255).toString(16).padStart(2, '0')}`,
            }}>
              {text}
            </span>
            {/* Hot accent core — brighter, lighter centre */}
            <span style={{
              ...copyFont, position: 'absolute',
              color: 'transparent',
              WebkitTextStroke: `0.5px ${accentHex(0.35 + breath * 0.15)}`,
              textShadow: `0 0 2px ${accentHex(0.2 + breath * 0.1)}`,
            }}>
              {text}
            </span>
          </>
        );

      case 'shadow':
        // DARK IMPRESSION — the text is a void pressed into the glass.
        // Deep, heavy darkness with only the faintest atmosphere-colour
        // rim to define the letter edges. Palpable weight.
        return (
          <>
            {/* Deep void — heavy darkness */}
            <span style={{
              ...copyFont, position: 'absolute',
              color: `rgba(0,0,0,${(0.7 + breath * 0.15).toFixed(3)})`,
              mixBlendMode: 'multiply',
            }}>
              {text}
            </span>
            {/* Cast shadow — offset depth */}
            <span style={{
              ...copyFont, position: 'absolute',
              color: 'transparent',
              textShadow: [
                `0 3px 6px rgba(0,0,0,${(0.5 + breath * 0.15).toFixed(3)})`,
                `0 6px 20px rgba(0,0,0,${(0.3 + breath * 0.1).toFixed(3)})`,
              ].join(', '),
            }}>
              {text}
            </span>
            {/* Second multiply pass for extra depth */}
            <span style={{
              ...copyFont, position: 'absolute',
              color: `rgba(0,0,0,${(0.4 + breath * 0.1).toFixed(3)})`,
              mixBlendMode: 'multiply',
            }}>
              {text}
            </span>
            {/* Faint atmosphere rim — letter edges catch distant light */}
            <span style={{
              ...copyFont, position: 'absolute',
              color: 'transparent',
              WebkitTextStroke: `0.4px ${midHex(0.12 + breath * 0.06)}`,
              textShadow: `0 0 6px ${midHex(0.08 + breath * 0.04)}`,
            }}>
              {text}
            </span>
          </>
        );
    }
  };

  return (
    <div
      className="absolute inset-0 flex pointer-events-none"
      style={{
        ...posMap[position],
        display: 'flex',
        zIndex: layer.content,
        transform: `scale(${bScale}) translateY(${translateY}px)`,
        opacity,
        willChange: 'transform, opacity',
        transition: entrance === 'instant' ? 'none' : undefined,
      }}
    >
      {renderTreatment()}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// SHARED STYLES
// ═══════════════════════════════════════════════════

const btnStyle = (active: boolean) => ({
  fontFamily: font.serif,
  fontSize: typeSize.reading,
  fontWeight: active ? weight.medium : weight.regular,
  color: active ? room.fg : glaze.pewter,
  background: 'none',
  border: 'none',
  cursor: 'pointer' as const,
  padding: 0,
  transition: timing.t.color,
});

const labelStyle: React.CSSProperties = {
  fontSize: typeSize.detail,
  fontWeight: weight.medium,
  letterSpacing: tracking.shelf,
  textTransform: 'uppercase',
  color: glaze.smoke,
};

// ═══════════════════════════════════════════════════
// THE PAGE
// ═══════════════════════════════════════════════════

export function CopyPage() {
  // Base surface state
  const [device, setDevice] = useState<Device>('phone');
  const [interactionId, setInteractionId] = useState<InteractionType>('viscous-drag');
  const [motionId, setMotionId] = useState<MotionType>('somatic-breath');
  const [atmosphereId, setAtmosphereId] = useState('sanctuary');
  const [temperatureId, setTemperatureId] = useState('band-1');
  const [colorId, setColorId] = useState<ColorType>('amber-resonance');

  // Copy state
  const [contentId, setContentId] = useState<ContentType>('presence');
  const [positionId, setPositionId] = useState<PositionType>('center');
  const [scaleId, setScaleId] = useState<ScaleType>('voice');
  const [treatmentId, setTreatmentId] = useState<TreatmentType>('recess');
  const [weightId, setWeightId] = useState<WeightType>('light');
  const [trackingId, setTrackingId] = useState<TrackingType>('normal');
  const [styleId, setStyleId] = useState<StyleType>('roman');
  const [entranceId, setEntranceId] = useState<EntranceType>('fade');

  const copyOverlay = ({ breath, atmosphere, isPhone }: { breath: number; atmosphere: Atmosphere; isPhone: boolean }) => {
    const text = getCopyText(contentId, interactionId, motionId, breath);
    if (!text) return null;
    return (
      <CopyOverlay
        text={text}
        position={positionId}
        scale={scaleId}
        treatment={treatmentId}
        weight={weightId}
        tracking={trackingId}
        fontStyle={styleId}
        entrance={entranceId}
        breath={breath}
        atmosphere={atmosphere}
        isPhone={isPhone}
      />
    );
  };

  return (
    <div
      className="flex flex-col"
      style={{ height: 'calc(100vh - 56px)', background: room.deep }}
    >
      {/* ═══ MAIN AREA — glass left, copy params right ═══ */}
      <div className="flex-1 flex min-h-0">
        {/* Glass device */}
        <div className="flex-1 flex items-center justify-center min-h-0 min-w-0">
          <GlassSurface
            interactionId={interactionId}
            motionId={motionId}
            atmosphereId={atmosphereId}
            temperatureId={temperatureId}
            colorId={colorId}
            device={device}
            overlay={copyOverlay}
          />
        </div>

        {/* Copy parameters panel */}
        <div
          className="hidden lg:flex flex-col justify-center shrink-0 pr-8 pl-4"
          style={{ width: '260px' }}
        >
          <div className="space-y-5">
            <CopyControlGroup label="Content" items={contentList} active={contentId} onSelect={setContentId} />
            <CopyControlGroup label="Position" items={positionList} active={positionId} onSelect={setPositionId} />
            <CopyControlGroup label="Scale" items={scaleList} active={scaleId} onSelect={setScaleId} />
            <CopyControlGroup label="Treatment" items={treatmentList} active={treatmentId} onSelect={setTreatmentId} />
            <CopyControlGroup label="Weight" items={weightList} active={weightId} onSelect={setWeightId} />
            <CopyControlGroup label="Tracking" items={trackingList} active={trackingId} onSelect={setTrackingId} />
            <CopyControlGroup label="Style" items={styleList} active={styleId} onSelect={setStyleId} />
            <CopyControlGroup label="Entrance" items={entranceList} active={entranceId} onSelect={setEntranceId} />
          </div>
        </div>
      </div>

      {/* ═══ MOBILE COPY CONTROLS (below glass on < lg) ═══ */}
      <div
        className="lg:hidden shrink-0 px-6 pb-2 pt-3 overflow-x-auto relative"
        style={{
          background: room.deep,
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent 5%, ${glaze.veil} 30%, ${glaze.frost} 50%, ${glaze.veil} 70%, transparent 95%)` }} />
        <div className="flex gap-6 min-w-max">
          <CopyControlGroup label="Content" items={contentList} active={contentId} onSelect={setContentId} />
          <CopyControlGroup label="Position" items={positionList} active={positionId} onSelect={setPositionId} />
          <CopyControlGroup label="Scale" items={scaleList} active={scaleId} onSelect={setScaleId} />
          <CopyControlGroup label="Treatment" items={treatmentList} active={treatmentId} onSelect={setTreatmentId} />
          <CopyControlGroup label="Weight" items={weightList} active={weightId} onSelect={setWeightId} />
          <CopyControlGroup label="Tracking" items={trackingList} active={trackingId} onSelect={setTrackingId} />
          <CopyControlGroup label="Style" items={styleList} active={styleId} onSelect={setStyleId} />
          <CopyControlGroup label="Entrance" items={entranceList} active={entranceId} onSelect={setEntranceId} />
        </div>
      </div>

      {/* ═══ BASE CONTROLS ═══ */}
      <div
        className="shrink-0 px-6 sm:px-10 pb-4 pt-3 relative"
        style={{
          background: room.deep,
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent 5%, ${glaze.veil} 30%, ${glaze.frost} 50%, ${glaze.veil} 70%, transparent 95%)` }} />
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            <div>
              <span className="block mb-2" style={labelStyle}>Interaction</span>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {interactionList.map(i => (
                  <button key={i.id} onClick={() => setInteractionId(i.id)} style={btnStyle(interactionId === i.id)}>
                    {i.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="block mb-2" style={labelStyle}>Motion</span>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {motionList.map(m => (
                  <button key={m.id} onClick={() => setMotionId(m.id)} style={btnStyle(motionId === m.id)}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="block mb-2" style={labelStyle}>Atmosphere</span>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {atmosphereList.map(a => (
                  <button key={a.id} onClick={() => setAtmosphereId(a.id)} style={btnStyle(atmosphereId === a.id)}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="block mb-2" style={labelStyle}>Temperature</span>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {temperatureList.map(t => (
                  <button key={t.id} onClick={() => setTemperatureId(t.id)} style={btnStyle(temperatureId === t.id)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="block mb-2" style={labelStyle}>Color</span>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {colorList.map(c => (
                  <button key={c.id} onClick={() => setColorId(c.id)} style={btnStyle(colorId === c.id)}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-6 sm:justify-end">
            {(['phone', 'desktop'] as Device[]).map(d => (
              <button
                key={d} onClick={() => setDevice(d)}
                style={{
                  fontFamily: font.sans, fontSize: typeSize.detail, fontWeight: weight.medium,
                  letterSpacing: tracking.shelf, textTransform: 'uppercase' as const,
                  color: device === d ? glaze.bright : glaze.dim,
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  transition: timing.t.color,
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// COPY CONTROL GROUP COMPONENT
// ═══════════════════════════════════════════════════

function CopyControlGroup<T extends string>({
  label, items, active, onSelect,
}: {
  label: string;
  items: { id: T; label: string }[];
  active: T;
  onSelect: (id: T) => void;
}) {
  return (
    <div>
      <span className="block mb-2" style={labelStyle}>{label}</span>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            style={btnStyle(active === item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}