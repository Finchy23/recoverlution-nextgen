/**
 * CANVAS — the living surface playground
 *
 * Six composable layers using exact doctrine variable names:
 *   Interaction   — floating-particle-displacement | surface-refraction | viscous-drag | gyroscopic-parallax | haptic-entrainment | acoustic-flutter
 *   Motion        — somatic-breath | viscous-unspooling | pendulum-settle | defocus-dissolve | cymatic-ripple | tectonic-drift
 *   Atmosphere    — sanctuary | cryo-chamber | abyssal-void | bioluminescent-mesh | chiaroscuro-spotlight | twilight-shroud
 *   Temperature   — Band 0–4 (Safe & Social → Survival Mode)
 *   Color         — neural-reset | amber-resonance | quiet-authority | sacred-ordinary | verdant-calm | void-presence | twilight-shift
 *   Attenuation   — open | surface | floor | panel | fused | dark
 */

import { useState } from 'react';
import { room, font, tracking, typeSize, weight, timing, glaze } from '../components/design-system/surface-tokens';
import {
  type InteractionType, type MotionType, type ColorType, type Device,
  type AttenuationMode,
  interactionList, motionList, atmosphereList, temperatureList, colorList,
  attenuationLevels,
} from '../components/design-system/surface-engine';
import { GlassSurface } from '../components/design-system/GlassSurface';

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

const labelStyle = {
  fontSize: typeSize.detail,
  fontWeight: weight.medium,
  letterSpacing: tracking.shelf,
  textTransform: 'uppercase' as const,
  color: glaze.smoke,
};

export function BasePage() {
  const [device, setDevice] = useState<Device>('phone');
  const [interactionId, setInteractionId] = useState<InteractionType>('floating-particle-displacement');
  const [motionId, setMotionId] = useState<MotionType>('somatic-breath');
  const [atmosphereId, setAtmosphereId] = useState('sanctuary');
  const [temperatureId, setTemperatureId] = useState('band-1');
  const [colorId, setColorId] = useState<ColorType>('amber-resonance');
  const [attenuationId, setAttenuationId] = useState<AttenuationMode>('open');

  const currentAtten = attenuationLevels.find(a => a.id === attenuationId)!;

  return (
    <div
      className="flex flex-col"
      style={{ height: 'calc(100vh - 56px)', background: room.deep }}
    >
      <div className="flex-1 flex items-center justify-center min-h-0">
        <GlassSurface
          interactionId={interactionId}
          motionId={motionId}
          atmosphereId={atmosphereId}
          temperatureId={temperatureId}
          colorId={colorId}
          device={device}
          attenuationId={attenuationId}
        />
      </div>

      <div
        className="shrink-0 px-6 sm:px-10 pb-4 pt-4 relative"
        style={{ background: room.deep }}
      >
        {/* Gradient edge replaces 1px solid border */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent 5%, ${glaze.veil} 30%, ${glaze.frost} 50%, ${glaze.veil} 70%, transparent 95%)` }} />
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
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
            <div>
              <span className="block mb-2" style={labelStyle}>Attenuation</span>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {attenuationLevels.map(a => (
                  <button key={a.id} onClick={() => setAttenuationId(a.id)} style={btnStyle(attenuationId === a.id)}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-6 sm:justify-between">
            <div className="flex items-center gap-3">
              <span style={{ fontFamily: font.serif, fontSize: typeSize.note, color: glaze.dim, fontStyle: 'italic' }}>
                {currentAtten.description}
              </span>
              <span style={{ fontFamily: font.sans, fontSize: typeSize.detail, fontWeight: weight.medium, letterSpacing: tracking.tight, color: glaze.muted }}>
                bg {Math.round(currentAtten.bgEnergy * 100)}% / fg {Math.round((1 - currentAtten.bgEnergy) * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-6">
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
    </div>
  );
}