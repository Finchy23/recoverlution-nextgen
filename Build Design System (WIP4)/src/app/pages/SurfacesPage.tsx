/**
 * SURFACES — The Universal Player
 *
 * This page IS the Universal Player.
 * The interface IS the intervention.
 *
 * One piece of glass. One anchor. One stream.
 * The Surface consumes the viewport.
 * The Anchor floats inside the glass.
 * The Stream flows along the top horizon.
 *
 * Hold the orb. Shift your state.
 * The glass becomes exactly what you need.
 *
 * Components dissolve. Surfaces remain.
 */

import { useEffect, useMemo, useState } from 'react';
import { UniversalPlayer } from '../components/universal-player/UniversalPlayer';
import { font, room, tracking, typeSize, weight, timing, glaze } from '../components/design-system/surface-tokens';
import type { Device } from '../components/design-system/surface-engine';
import type { SurfaceMode } from '../components/universal-player/surface-modes';
import {
  buildSurfaceAtmosphereDeckVariants,
  resolveSurfaceAtmosphereState,
  resolveSurfaceAtmosphereSurfaceKeyFromModeId,
} from '../components/runtime/surface-atmosphere';
import { useSurfaceAtmosphereSeam } from '../components/runtime/surface-atmosphere-seam';

export function SurfacesPage() {
  const [device, setDevice] = useState<Device>('phone');
  const [currentMode, setCurrentMode] = useState<SurfaceMode | null>(null);
  const { settings, updateSettings, setActiveModeId } = useSurfaceAtmosphereSeam();

  const activeModeId = currentMode?.id ?? 'sync';

  useEffect(() => {
    setActiveModeId(activeModeId);
    return () => {
      setActiveModeId(null);
    };
  }, [activeModeId, setActiveModeId]);

  const activeSurfaceKey = useMemo(() => {
    if (!settings.adaptToSurface) return 'home';
    return resolveSurfaceAtmosphereSurfaceKeyFromModeId(activeModeId) ?? 'home';
  }, [activeModeId, settings.adaptToSurface]);

  const activeAtmosphere = useMemo(
    () => resolveSurfaceAtmosphereState(activeSurfaceKey, settings),
    [activeSurfaceKey, settings],
  );
  const activeDeck = useMemo(
    () => buildSurfaceAtmosphereDeckVariants(activeAtmosphere, settings)[0] ?? null,
    [activeAtmosphere, settings],
  );
  const yieldsToPlay =
    settings.enabled && settings.intensity !== 'off' && activeSurfaceKey === 'play';

  return (
    <div
      className="flex flex-col"
      style={{
        height: 'calc(100vh - 56px)',
        background: room.void,
      }}
    >
      {/* The Universal Player — the hero */}
      <div className="flex-1 min-h-0 relative flex flex-col">
        {/* Player viewport */}
        <div className="flex-1 min-h-0 flex items-center justify-center px-4 pt-2">
            <UniversalPlayer
              key="universal-player-v3"
              initialMode="sync"
              device={device}
              onModeChange={setCurrentMode}
              showSystemInfo
            />
        </div>

        {/* Device toggle — minimal, outside the glass */}
        <div
          className="shrink-0 flex items-center justify-center gap-6 py-3"
          style={{ background: room.void }}
        >
          {(['phone', 'desktop'] as Device[]).map(d => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              style={{
                fontFamily: font.sans,
                fontSize: typeSize.detail,
                fontWeight: weight.medium,
                letterSpacing: tracking.shelf,
                textTransform: 'uppercase',
                color: device === d ? glaze.milk : glaze.sheen,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: timing.t.color,
              }}
            >
              {d}
            </button>
          ))}
        </div>

        <div
          className="shrink-0 flex items-center justify-center px-4 pb-4"
          style={{ background: room.void }}
        >
          <div
            className="w-full max-w-[720px] rounded-[22px] px-4 py-3"
            style={{
              background: 'rgba(255,255,255,0.03)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div
                  style={{
                    fontFamily: font.sans,
                    fontSize: typeSize.label,
                    fontWeight: weight.medium,
                    letterSpacing: tracking.shelf,
                    textTransform: 'uppercase',
                    color: glaze.sheen,
                  }}
                >
                  Atmosphere
                </div>
                <div
                  className="mt-1 flex flex-wrap items-center gap-2"
                  style={{
                    fontFamily: font.sans,
                    fontSize: typeSize.detail,
                    fontWeight: weight.medium,
                    color: glaze.milk,
                  }}
                >
                  <span>{activeAtmosphere.label}</span>
                  <span style={{ color: glaze.sheen }}>·</span>
                  <span>{currentMode?.label ?? 'Sync'}</span>
                  <span style={{ color: glaze.sheen }}>·</span>
                  <span>{yieldsToPlay ? 'yielding to PLAY' : activeDeck?.delivery ?? 'standby'}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                {[
                  {
                    label: 'Off',
                    active: !settings.enabled || settings.intensity === 'off',
                    onClick: () =>
                      updateSettings({
                        enabled: false,
                        intensity: 'off',
                      }),
                  },
                  {
                    label: 'Subtle',
                    active: settings.enabled && settings.intensity === 'subtle',
                    onClick: () =>
                      updateSettings({
                        enabled: true,
                        intensity: 'subtle',
                      }),
                  },
                  {
                    label: 'Immersive',
                    active: settings.enabled && settings.intensity === 'immersive',
                    onClick: () =>
                      updateSettings({
                        enabled: true,
                        intensity: 'immersive',
                      }),
                  },
                ].map((option) => (
                  <button
                    key={option.label}
                    onClick={option.onClick}
                    style={{
                      fontFamily: font.sans,
                      fontSize: typeSize.label,
                      fontWeight: weight.medium,
                      letterSpacing: tracking.shelf,
                      textTransform: 'uppercase',
                      color: option.active ? glaze.milk : glaze.sheen,
                      background: option.active ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 999,
                      cursor: 'pointer',
                      padding: '8px 12px',
                      transition: timing.t.color,
                    }}
                  >
                    {option.label}
                  </button>
                ))}

                <button
                  onClick={() =>
                    updateSettings({
                      adaptToSurface: !settings.adaptToSurface,
                      enabled: settings.enabled || settings.intensity !== 'off',
                    })
                  }
                  style={{
                    fontFamily: font.sans,
                    fontSize: typeSize.label,
                    fontWeight: weight.medium,
                    letterSpacing: tracking.shelf,
                    textTransform: 'uppercase',
                    color: settings.adaptToSurface ? glaze.milk : glaze.sheen,
                    background: settings.adaptToSurface ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 999,
                    cursor: 'pointer',
                    padding: '8px 12px',
                    transition: timing.t.color,
                  }}
                >
                  Adapt {settings.adaptToSurface ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
