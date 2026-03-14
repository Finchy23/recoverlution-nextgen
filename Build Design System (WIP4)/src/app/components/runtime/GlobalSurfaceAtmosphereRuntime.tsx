import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import {
  buildSurfaceAtmosphereDeckVariants,
  resolveSurfaceAtmosphereState,
  resolveSurfaceAtmosphereSurfaceKeyFromModeId,
  resolveSurfaceAtmosphereSurfaceKeyFromPathname,
  resolveSurfaceAtmosphereTransitionContract,
  type SurfaceAtmosphereDeckSpec,
  type SurfaceAtmosphereSurfaceKey,
} from './surface-atmosphere';
import { useSurfaceAtmosphereSeam } from './surface-atmosphere-seam';

interface Deck {
  primary: HTMLAudioElement | null;
  secondary: HTMLAudioElement | null;
  key: string | null;
}

function createDeck(): Deck {
  return {
    primary: null,
    secondary: null,
    key: null,
  };
}

function createLoopingAudio(url: string | null) {
  if (!url || typeof Audio === 'undefined') return null;
  const audio = new Audio(url);
  audio.loop = true;
  audio.preload = 'auto';
  audio.crossOrigin = 'anonymous';
  audio.playsInline = true;
  audio.volume = 0;
  return audio;
}

function clampGain(value: number) {
  return Number.isFinite(value) ? Math.min(Math.max(value, 0), 1) : 0;
}

async function safePlay(audio: HTMLAudioElement | null) {
  if (!audio) return;
  try {
    await audio.play();
  } catch {
    // Browser policy should not break the shell.
  }
}

function stopAudio(audio: HTMLAudioElement | null) {
  if (!audio) return;
  audio.pause();
  audio.volume = 0;
  try {
    audio.currentTime = 0;
  } catch {
    // Some browsers can throw if media is not seekable yet.
  }
}

function setDeckVolumes(deck: Deck, primaryGain: number, secondaryGain: number) {
  if (deck.primary) deck.primary.volume = clampGain(primaryGain);
  if (deck.secondary) deck.secondary.volume = clampGain(secondaryGain);
}

function pauseDeck(deck: Deck) {
  stopAudio(deck.primary);
  stopAudio(deck.secondary);
}

function replaceDeckSources(deck: Deck, spec: SurfaceAtmosphereDeckSpec) {
  const nextPrimary =
    deck.primary && deck.primary.src === spec.primaryUrl
      ? deck.primary
      : createLoopingAudio(spec.primaryUrl);
  const nextSecondary =
    deck.secondary && deck.secondary.src === spec.secondaryUrl
      ? deck.secondary
      : createLoopingAudio(spec.secondaryUrl);

  if (deck.primary && deck.primary !== nextPrimary) {
    stopAudio(deck.primary);
  }
  if (deck.secondary && deck.secondary !== nextSecondary) {
    stopAudio(deck.secondary);
  }

  deck.primary = nextPrimary;
  deck.secondary = nextSecondary;
  deck.key = spec.key;
  setDeckVolumes(deck, 0, 0);
}

export function GlobalSurfaceAtmosphereRuntime() {
  const location = useLocation();
  const { settings, activeModeId } = useSurfaceAtmosphereSeam();
  const [sceneVariantIndex, setSceneVariantIndex] = useState(0);

  const routeSurfaceKey = useMemo(
    () => resolveSurfaceAtmosphereSurfaceKeyFromPathname(location.pathname),
    [location.pathname],
  );
  const modeSurfaceKey = useMemo(
    () => resolveSurfaceAtmosphereSurfaceKeyFromModeId(activeModeId),
    [activeModeId],
  );

  const surfaceKey: SurfaceAtmosphereSurfaceKey = useMemo(() => {
    if (!settings.adaptToSurface) return 'home';
    if (location.pathname.startsWith('/surfaces') && modeSurfaceKey) {
      return modeSurfaceKey;
    }
    return routeSurfaceKey;
  }, [location.pathname, modeSurfaceKey, routeSurfaceKey, settings.adaptToSurface]);

  const state = useMemo(
    () => resolveSurfaceAtmosphereState(surfaceKey, settings),
    [settings, surfaceKey],
  );
  const deckVariants = useMemo(
    () => buildSurfaceAtmosphereDeckVariants(state, settings),
    [settings, state],
  );
  const deckSpec = deckVariants[sceneVariantIndex % Math.max(deckVariants.length, 1)] ?? null;

  const unlockedRef = useRef(false);
  const activeDeckIndexRef = useRef(0);
  const decksRef = useRef<[Deck, Deck]>([createDeck(), createDeck()]);
  const animationFrameRef = useRef<number | null>(null);
  const activeSpecKeyRef = useRef<string | null>(null);
  const activeSurfaceKeyRef = useRef<SurfaceAtmosphereSurfaceKey>(surfaceKey);

  useEffect(() => {
    setSceneVariantIndex(0);
  }, [surfaceKey, state.sceneId]);

  useEffect(() => {
    if (
      !settings.enabled ||
      settings.intensity === 'off' ||
      surfaceKey === 'play' ||
      deckVariants.length < 2
    ) {
      return undefined;
    }

    const dwellDurationMs = settings.intensity === 'immersive' ? 150_000 : 210_000;
    const timeoutId = window.setTimeout(() => {
      setSceneVariantIndex((current) => (current + 1) % deckVariants.length);
    }, dwellDurationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    deckVariants.length,
    sceneVariantIndex,
    settings.enabled,
    settings.intensity,
    surfaceKey,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const unlock = () => {
      unlockedRef.current = true;
      const activeDeck = decksRef.current[activeDeckIndexRef.current];
      void safePlay(activeDeck.primary);
      void safePlay(activeDeck.secondary);
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const onVisibilityChange = () => {
      const activeDeck = decksRef.current[activeDeckIndexRef.current];
      if (document.hidden) {
        activeDeck.primary?.pause();
        activeDeck.secondary?.pause();
        return;
      }

      if (
        unlockedRef.current &&
        settings.enabled &&
        settings.intensity !== 'off' &&
        surfaceKey !== 'play'
      ) {
        void safePlay(activeDeck.primary);
        void safePlay(activeDeck.secondary);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [settings.enabled, settings.intensity, surfaceKey]);

  useEffect(() => {
    const stopAnimation = () => {
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    if (
      !deckSpec ||
      !settings.enabled ||
      settings.intensity === 'off' ||
      surfaceKey === 'play'
    ) {
      stopAnimation();
      decksRef.current.forEach((deck) => pauseDeck(deck));
      activeSpecKeyRef.current = null;
      return stopAnimation;
    }

    const activeDeck = decksRef.current[activeDeckIndexRef.current];
    if (activeSpecKeyRef.current === deckSpec.key && activeDeck.key === deckSpec.key) {
      setDeckVolumes(activeDeck, deckSpec.primaryGain01, deckSpec.secondaryGain01);
      activeSurfaceKeyRef.current = surfaceKey;
      return stopAnimation;
    }

    const nextDeckIndex = activeDeckIndexRef.current === 0 ? 1 : 0;
    const nextDeck = decksRef.current[nextDeckIndex];
    const transition = resolveSurfaceAtmosphereTransitionContract(
      activeSurfaceKeyRef.current,
      surfaceKey,
    );

    replaceDeckSources(nextDeck, deckSpec);
    if (unlockedRef.current) {
      void safePlay(nextDeck.primary);
      void safePlay(nextDeck.secondary);
    }

    stopAnimation();

    const start = performance.now();
    const outgoingPrimaryStart = activeDeck.primary?.volume ?? 0;
    const outgoingSecondaryStart = activeDeck.secondary?.volume ?? 0;

    const run = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / transition.durationMs);

      setDeckVolumes(
        activeDeck,
        outgoingPrimaryStart * (1 - progress),
        outgoingSecondaryStart * (1 - progress),
      );
      setDeckVolumes(
        nextDeck,
        deckSpec.primaryGain01 * progress,
        deckSpec.secondaryGain01 * progress,
      );

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(run);
        return;
      }

      pauseDeck(activeDeck);
      activeDeckIndexRef.current = nextDeckIndex;
      activeSpecKeyRef.current = deckSpec.key;
      activeSurfaceKeyRef.current = surfaceKey;
      animationFrameRef.current = null;
    };

    animationFrameRef.current = requestAnimationFrame(run);

    if (deckSpec.transitionUrl && unlockedRef.current) {
      const oneShot = new Audio(deckSpec.transitionUrl);
      oneShot.preload = 'auto';
      oneShot.crossOrigin = 'anonymous';
      oneShot.playsInline = true;
      oneShot.volume = clampGain(deckSpec.transitionGain01);
      void oneShot.play().catch(() => {});
    }

    return () => {
      stopAnimation();
    };
  }, [deckSpec, settings.enabled, settings.intensity, surfaceKey]);

  useEffect(() => {
    return () => {
      decksRef.current.forEach((deck) => pauseDeck(deck));
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return null;
}
