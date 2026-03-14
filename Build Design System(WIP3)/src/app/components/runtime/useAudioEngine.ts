/**
 * useAudioEngine — Web Audio API Engine for PLAY Surface
 *
 * Manages the full audio pipeline:
 *   Audio element → MediaElementSource → AnalyserNode → DepthFilter → GainNode → Destination
 *
 * Provides:
 *   - Play/pause/skip controls
 *   - Real-time frequency data (Uint8Array) for the SonicField visualization
 *   - Volume control (GainNode)
 *   - Depth duck control (BiquadFilter peaking at 2.2kHz voice presence)
 *   - Track queue management (sequential playback of soundbites)
 *   - Audio state (playing, paused, loading, ended)
 *
 * The AnalyserNode exposes frequency bin data at 60fps,
 * which the SonicField reads to create audio-reactive waveforms.
 *
 * Architecture:
 *   This hook does NOT fetch soundbites — it receives audio URLs
 *   from the PlaySurface (which gets them from useContentSoundbites
 *   or usePlayRuntime). Separation of data and playback.
 */

import { useState, useRef, useCallback, useEffect } from 'react';

// ─── Types ───

export type AudioState = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';

export interface AudioTrack {
  trackId: string;
  audioUrl: string;
  title?: string;
  type?: string;
}

interface AudioEngineState {
  state: AudioState;
  currentTrack: AudioTrack | null;
  currentIndex: number;
  /** Total number of tracks in current queue */
  queueLength: number;
  volume: number;
  /** Normalized 0-1 average amplitude — for simple reactivity */
  amplitude: number;
  /** Raw frequency data — 64 bins, 0-255 each */
  frequencyData: Uint8Array;
  /** Current crossfade phase — 'idle' when no crossfade in progress */
  crossfadePhase: CrossfadePhase;
  /** Continuous 0→1 progress through entire crossfade lifecycle (rAF-driven) */
  crossfadeProgress: number;
  /** Current playback position in seconds */
  currentTime: number;
  /** Total duration of current track in seconds (0 if unknown) */
  duration: number;
  error: string | null;
}

interface AudioEngineControls {
  /** Load and play a single track */
  playTrack: (track: AudioTrack) => void;
  /** Load a queue of tracks and begin sequential playback */
  playQueue: (tracks: AudioTrack[]) => void;
  /**
   * Crossfade to a new track — fades current audio out, swaps source,
   * fades new audio in. Accepts optional durationMs (half-duration).
   * If nothing is currently playing, behaves like playTrack.
   */
  crossfadeToTrack: (track: AudioTrack, halfDurationMs?: number) => void;
  /**
   * Crossfade to a new queue — same fade-out/swap/fade-in as crossfadeToTrack
   * but loads an entire queue and starts from the first item.
   */
  crossfadeToQueue: (tracks: AudioTrack[], halfDurationMs?: number) => void;
  /** Pause current playback */
  pause: () => void;
  /** Resume current playback */
  resume: () => void;
  /** Toggle play/pause */
  toggle: () => void;
  /** Skip to next track in queue (crossfade at 150ms half-duration) */
  skip: () => void;
  /** Skip to previous track in queue (crossfade at 150ms half-duration) */
  skipPrev: () => void;
  /** Set volume (0-1) */
  setVolume: (v: number) => void;
  /**
   * Seek by a relative offset in seconds.
   * Positive = fast-forward, negative = rewind.
   * Clamped to [0, duration].
   */
  seekBy: (offsetSeconds: number) => void;
  /**
   * Seek to an absolute position in seconds.
   * Clamped to [0, duration].
   */
  seekTo: (positionSeconds: number) => void;
  /**
   * Set depth duck (0-1).
   * Adjusts a voice-presence EQ filter to shift the perceived
   * voice/music balance in pre-mixed tracks (Mode A).
   *   0 = music-forward (attenuate voice frequencies)
   *   1 = voice-deep    (boost voice frequencies)
   * The filter is a peaking band at ~2kHz with ±6dB range.
   */
  setDepthDuck: (depth: number) => void;
  /** Stop and tear down */
  stop: () => void;
}

export type UseAudioEngineResult = AudioEngineState & AudioEngineControls;

// ─── Constants ───

const FFT_SIZE = 128; // 64 frequency bins
const SMOOTHING = 0.8;
/** Voice presence center frequency (Hz) — where human speech has most energy */
const VOICE_PRESENCE_HZ = 2200;
/** Voice presence Q factor — wider band catches more speech formants */
const VOICE_PRESENCE_Q = 0.8;
/** Max depth duck range in dB (±) */
const DEPTH_DUCK_DB = 6;
/** Ramp duration for smooth volume transitions (seconds) */
const VOLUME_RAMP_S = 0.08;
/** Ramp duration for smooth depth duck transitions (seconds) */
const DEPTH_RAMP_S = 0.25;
/** Default crossfade half-duration in ms — total crossfade = 2x this value */
const CROSSFADE_HALF_MS = 300;
/** Shorter crossfade for skip navigation (snappier feel) */
const CROSSFADE_SKIP_HALF_MS = 150;
/** Longer crossfade for mutation recompiles (smoother blend) */
const CROSSFADE_MUTATION_HALF_MS = 400;
/** If >3s into current track, skipPrev restarts instead of going back */
const SKIP_PREV_RESTART_THRESHOLD_S = 3;

/** Crossfade phase for visual indicators */
export type CrossfadePhase = 'idle' | 'fading-out' | 'swapping' | 'fading-in';

// ─── The Hook ───

export function useAudioEngine(): UseAudioEngineResult {
  const [state, setState] = useState<AudioState>('idle');
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [amplitude, setAmplitude] = useState(0);
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(FFT_SIZE / 2));
  const [crossfadePhase, setCrossfadePhase] = useState<CrossfadePhase>('idle');
  const [crossfadeProgress, setCrossfadeProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Refs for audio pipeline
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const depthFilterRef = useRef<BiquadFilterNode | null>(null);
  const queueRef = useRef<AudioTrack[]>([]);
  const rafRef = useRef(0);
  const connectedRef = useRef(false);
  const crossfadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Tracks the user's intended volume — crossfade restores to this */
  const targetVolumeRef = useRef(0.7);
  /** Crossfade progress animation refs */
  const crossfadeStartRef = useRef(0);
  const crossfadeTotalDurationRef = useRef(0);
  const crossfadeProgressRafRef = useRef(0);

  // ── Crossfade progress rAF loop — updates crossfadeProgress 0→1 ──
  const startCrossfadeProgress = useCallback((totalMs: number) => {
    crossfadeStartRef.current = performance.now();
    crossfadeTotalDurationRef.current = totalMs;
    setCrossfadeProgress(0);

    const tick = () => {
      const elapsed = performance.now() - crossfadeStartRef.current;
      const progress = Math.min(1, elapsed / crossfadeTotalDurationRef.current);
      setCrossfadeProgress(progress);
      if (progress < 1) {
        crossfadeProgressRafRef.current = requestAnimationFrame(tick);
      }
    };
    crossfadeProgressRafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopCrossfadeProgress = useCallback(() => {
    if (crossfadeProgressRafRef.current) {
      cancelAnimationFrame(crossfadeProgressRafRef.current);
      crossfadeProgressRafRef.current = 0;
    }
    setCrossfadeProgress(0);
  }, []);

  // ── Initialize AudioContext lazily (needs user gesture) ──
  const ensureContext = useCallback(() => {
    if (ctxRef.current) {
      if (ctxRef.current.state === 'suspended') {
        ctxRef.current.resume();
      }
      return ctxRef.current;
    }

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      ctxRef.current = ctx;

      // Create analyser
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = SMOOTHING;
      analyserRef.current = analyser;

      // Create gain node
      const gain = ctx.createGain();
      gain.gain.value = volume;
      gainRef.current = gain;

      // Create depth duck filter
      const depthFilter = ctx.createBiquadFilter();
      depthFilter.type = 'peaking';
      depthFilter.frequency.value = VOICE_PRESENCE_HZ;
      depthFilter.Q.value = VOICE_PRESENCE_Q;
      depthFilter.gain.value = 0; // Start with no effect
      depthFilterRef.current = depthFilter;

      // Connect: analyser → depthFilter → gain → destination
      analyser.connect(depthFilter);
      depthFilter.connect(gain);
      gain.connect(ctx.destination);

      console.info('[audio-engine] AudioContext created');
      return ctx;
    } catch (err) {
      console.error('[audio-engine] Failed to create AudioContext:', err);
      setError('AudioContext not available');
      return null;
    }
  }, [volume]);

  // ── Connect audio element to the pipeline ──
  const connectAudioElement = useCallback((audio: HTMLAudioElement) => {
    const ctx = ensureContext();
    if (!ctx || !analyserRef.current) return;

    // Disconnect previous source if it exists
    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch {
        // May already be disconnected
      }
    }

    // Only create a new source if this audio element hasn't been connected before
    // MediaElementAudioSourceNode can only be created once per element
    if (!connectedRef.current || audioRef.current !== audio) {
      try {
        const source = ctx.createMediaElementSource(audio);
        source.connect(analyserRef.current);
        sourceRef.current = source;
        connectedRef.current = true;
        audioRef.current = audio;
        console.info('[audio-engine] Audio element connected to pipeline');
      } catch (err) {
        // Element may already have a source — reuse it
        console.warn('[audio-engine] Source connection error (may be reused):', err);
      }
    }
  }, [ensureContext]);

  // ── Frequency data animation loop ──
  const startAnalysisLoop = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(dataArray);

      // Calculate average amplitude (normalized 0-1)
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length / 255;
      setAmplitude(avg);

      // Copy frequency data for consumers
      setFrequencyData(new Uint8Array(dataArray));

      // Update playback position from audio element
      const audio = audioRef.current;
      if (audio) {
        setCurrentTime(audio.currentTime);
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopAnalysisLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  // ── Play a single track ──
  const playTrack = useCallback((track: AudioTrack) => {
    setError(null);
    setState('loading');
    setCurrentTrack(track);

    console.info(`[audio-engine] Loading track: ${track.trackId} (${track.audioUrl})`);

    // Create or reuse audio element
    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.preload = 'metadata';
      audioRef.current = audio;
      connectedRef.current = false;
    }

    // Set source
    audio.src = track.audioUrl;
    audio.volume = 1; // Volume controlled via GainNode

    // Connect to Web Audio pipeline
    connectAudioElement(audio);

    // Event handlers
    const onCanPlay = () => {
      console.info(`[audio-engine] Track ready: ${track.trackId}`);
      audio!.play()
        .then(() => {
          setState('playing');
          startAnalysisLoop();
        })
        .catch((err) => {
          console.error('[audio-engine] Play failed:', err);
          setState('error');
          setError(`Playback failed: ${err.message}`);
        });
    };

    const onEnded = () => {
      console.info(`[audio-engine] Track ended: ${track.trackId}`);
      // Auto-advance queue
      const queue = queueRef.current;
      const nextIndex = currentIndex + 1;
      if (queue.length > 0 && nextIndex < queue.length) {
        console.info(`[audio-engine] Advancing to queue item ${nextIndex}/${queue.length}`);
        setCurrentIndex(nextIndex);
        playTrack(queue[nextIndex]);
      } else {
        setState('ended');
        stopAnalysisLoop();
        // Reset amplitude smoothly
        setAmplitude(0);
      }
    };

    const onError = () => {
      const mediaError = audio!.error;
      const msg = mediaError ? `Media error ${mediaError.code}: ${mediaError.message}` : 'Unknown playback error';
      console.error(`[audio-engine] Error: ${msg}`);
      setState('error');
      setError(msg);
      stopAnalysisLoop();
    };

    // Clean up previous listeners
    audio.oncanplay = onCanPlay;
    audio.onended = onEnded;
    audio.onerror = onError;

    audio.load();
  }, [connectAudioElement, startAnalysisLoop, stopAnalysisLoop, currentIndex]);

  // ── Play a queue ──
  const playQueue = useCallback((tracks: AudioTrack[]) => {
    if (tracks.length === 0) return;
    queueRef.current = tracks;
    setCurrentIndex(0);
    playTrack(tracks[0]);
  }, [playTrack]);

  // ── Crossfade to a new track ──
  // Phase 1: ramp gain → 0 over halfDuration
  // Phase 2: after fade-out, swap src and play (gain stays at 0)
  // Phase 3: once new track is playing, ramp gain → targetVolume over halfDuration
  const crossfadeToTrack = useCallback((track: AudioTrack, halfDurationMs: number = CROSSFADE_HALF_MS) => {
    // Cancel any in-progress crossfade
    if (crossfadeTimerRef.current) {
      clearTimeout(crossfadeTimerRef.current);
      crossfadeTimerRef.current = null;
    }

    const audio = audioRef.current;
    const isPlaying = audio && state === 'playing';

    if (!isPlaying || !gainRef.current || !ctxRef.current) {
      // Nothing playing — just start normally
      setCrossfadePhase('idle');
      stopCrossfadeProgress();
      playTrack(track);
      return;
    }

    const halfS = halfDurationMs / 1000;
    console.info(`[audio-engine] Crossfading to: ${track.trackId} (half=${halfDurationMs}ms)`);
    setCrossfadePhase('fading-out');
    // Start continuous progress tracking (total duration = 2× half for fade-out + fade-in)
    startCrossfadeProgress(halfDurationMs * 2);

    // Phase 1: fade out current audio (exponential for natural loudness perception)
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    gain.gain.cancelScheduledValues(ctx.currentTime);
    // exponentialRamp requires value > 0; clamp current to at least 0.001
    gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.001), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + halfS);

    // Phase 2: after fade-out completes, swap and play new track at silence
    crossfadeTimerRef.current = setTimeout(() => {
      setCrossfadePhase('swapping');

      // Set gain to near-zero before swapping (prevents any pop)
      if (gainRef.current && ctxRef.current) {
        gainRef.current.gain.cancelScheduledValues(ctxRef.current.currentTime);
        gainRef.current.gain.setValueAtTime(0.001, ctxRef.current.currentTime);
      }

      // Swap source — this internally calls audio.load() and plays on canplay
      setError(null);
      setState('loading');
      setCurrentTrack(track);

      const a = audioRef.current!;
      a.src = track.audioUrl;
      connectAudioElement(a);

      a.oncanplay = () => {
        a.play()
          .then(() => {
            setState('playing');
            startAnalysisLoop();
            setCrossfadePhase('fading-in');

            // Phase 3: fade in — exponential ramp for natural loudness curve
            if (gainRef.current && ctxRef.current) {
              const now = ctxRef.current.currentTime;
              gainRef.current.gain.cancelScheduledValues(now);
              gainRef.current.gain.setValueAtTime(0.001, now);
              gainRef.current.gain.exponentialRampToValueAtTime(
                Math.max(targetVolumeRef.current, 0.001),
                now + halfS,
              );
            }
            // Clear crossfade phase after fade-in completes
            setTimeout(() => setCrossfadePhase('idle'), halfDurationMs);
            console.info(`[audio-engine] Crossfade complete: ${track.trackId}`);
          })
          .catch((err) => {
            console.error('[audio-engine] Crossfade play failed:', err);
            setState('error');
            setError(`Crossfade playback failed: ${err.message}`);
            setCrossfadePhase('idle');
            // Restore gain in case of error
            if (gainRef.current && ctxRef.current) {
              gainRef.current.gain.setValueAtTime(targetVolumeRef.current, ctxRef.current.currentTime);
            }
          });
      };

      a.onerror = () => {
        const mediaError = a.error;
        const msg = mediaError ? `Media error ${mediaError.code}: ${mediaError.message}` : 'Unknown crossfade error';
        console.error(`[audio-engine] Crossfade error: ${msg}`);
        setState('error');
        setError(msg);
        setCrossfadePhase('idle');
        // Restore gain
        if (gainRef.current && ctxRef.current) {
          gainRef.current.gain.setValueAtTime(targetVolumeRef.current, ctxRef.current.currentTime);
        }
      };

      a.onended = () => {
        const queue = queueRef.current;
        const nextIndex = currentIndex + 1;
        if (queue.length > 0 && nextIndex < queue.length) {
          setCurrentIndex(nextIndex);
          playTrack(queue[nextIndex]);
        } else {
          setState('ended');
          stopAnalysisLoop();
          setAmplitude(0);
        }
      };

      a.load();
      crossfadeTimerRef.current = null;
    }, halfDurationMs);
  }, [state, playTrack, connectAudioElement, startAnalysisLoop, stopAnalysisLoop, currentIndex, startCrossfadeProgress, stopCrossfadeProgress]);

  // ── Crossfade to a new queue ──
  const crossfadeToQueue = useCallback((tracks: AudioTrack[], halfDurationMs?: number) => {
    if (tracks.length === 0) return;
    queueRef.current = tracks;
    setCurrentIndex(0);
    crossfadeToTrack(tracks[0], halfDurationMs);
  }, [crossfadeToTrack]);

  // ── Pause ──
  const pause = useCallback(() => {
    if (audioRef.current && state === 'playing') {
      audioRef.current.pause();
      setState('paused');
      stopAnalysisLoop();
    }
  }, [state, stopAnalysisLoop]);

  // ── Resume ──
  const resume = useCallback(() => {
    if (audioRef.current && state === 'paused') {
      audioRef.current.play()
        .then(() => {
          setState('playing');
          startAnalysisLoop();
        })
        .catch((err) => {
          console.error('[audio-engine] Resume failed:', err);
        });
    }
  }, [state, startAnalysisLoop]);

  // ── Toggle ──
  const toggle = useCallback(() => {
    if (state === 'playing') pause();
    else if (state === 'paused') resume();
  }, [state, pause, resume]);

  // ── Skip (with crossfade when playing) ──
  const skip = useCallback(() => {
    const queue = queueRef.current;
    const nextIndex = currentIndex + 1;
    if (queue.length > 0 && nextIndex < queue.length) {
      setCurrentIndex(nextIndex);
      // Use crossfade for smooth queue-advance during playback
      if (state === 'playing') {
        crossfadeToTrack(queue[nextIndex], CROSSFADE_SKIP_HALF_MS);
      } else {
        playTrack(queue[nextIndex]);
      }
    }
  }, [currentIndex, state, playTrack, crossfadeToTrack]);

  // ── Skip Previous (with crossfade when playing) ──
  // Standard media player behavior: if >3s into current track, restart it.
  // Otherwise, go to previous track in queue.
  const skipPrev = useCallback(() => {
    const audio = audioRef.current;
    // If >3s into current track, restart instead of going back
    if (audio && audio.currentTime > SKIP_PREV_RESTART_THRESHOLD_S) {
      console.info('[audio-engine] skipPrev: restarting current track (>3s in)');
      audio.currentTime = 0;
      return;
    }

    const queue = queueRef.current;
    const prevIndex = currentIndex - 1;
    if (queue.length > 0 && prevIndex >= 0) {
      setCurrentIndex(prevIndex);
      if (state === 'playing') {
        crossfadeToTrack(queue[prevIndex], CROSSFADE_SKIP_HALF_MS);
      } else {
        playTrack(queue[prevIndex]);
      }
    } else if (audio) {
      // At start of queue — restart current track regardless of position
      console.info('[audio-engine] skipPrev: at queue start, restarting current track');
      audio.currentTime = 0;
    }
  }, [currentIndex, state, playTrack, crossfadeToTrack]);

  // ── Volume ──
  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    targetVolumeRef.current = clamped;
    if (gainRef.current) {
      gainRef.current.gain.setValueAtTime(gainRef.current.gain.value, ctxRef.current!.currentTime);
      gainRef.current.gain.linearRampToValueAtTime(clamped, ctxRef.current!.currentTime + VOLUME_RAMP_S);
    }
  }, []);

  // ── Seek ──
  const seekBy = useCallback((offsetSeconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, Math.min(audio.currentTime + offsetSeconds, audio.duration));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  const seekTo = useCallback((positionSeconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, Math.min(positionSeconds, audio.duration));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  // ── Depth Duck ──
  const setDepthDuck = useCallback((depth: number) => {
    const clamped = Math.max(0, Math.min(1, depth));
    if (depthFilterRef.current) {
      // Map 0-1 depth to ±DEPTH_DUCK_DB:
      //   depth=0 → -6dB (attenuate voice, music-forward)
      //   depth=0.5 → 0dB (neutral)
      //   depth=1 → +6dB (boost voice, voice-deep)
      depthFilterRef.current.gain.setValueAtTime(depthFilterRef.current.gain.value, ctxRef.current!.currentTime);
      depthFilterRef.current.gain.linearRampToValueAtTime(DEPTH_DUCK_DB * (clamped - 0.5) * 2, ctxRef.current!.currentTime + DEPTH_RAMP_S);
    }
  }, []);

  // ── Stop ──
  const stop = useCallback(() => {
    // Cancel any in-progress crossfade
    if (crossfadeTimerRef.current) {
      clearTimeout(crossfadeTimerRef.current);
      crossfadeTimerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    stopAnalysisLoop();
    stopCrossfadeProgress();
    setState('idle');
    setCrossfadePhase('idle');
    setCurrentTrack(null);
    setAmplitude(0);
    setFrequencyData(new Uint8Array(FFT_SIZE / 2));
    queueRef.current = [];
    setCurrentIndex(0);
  }, [stopAnalysisLoop, stopCrossfadeProgress]);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      if (crossfadeTimerRef.current) {
        clearTimeout(crossfadeTimerRef.current);
      }
      if (crossfadeProgressRafRef.current) {
        cancelAnimationFrame(crossfadeProgressRafRef.current);
      }
      stopAnalysisLoop();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (ctxRef.current && ctxRef.current.state !== 'closed') {
        ctxRef.current.close().catch(() => {});
      }
    };
  }, [stopAnalysisLoop, stopCrossfadeProgress]);

  return {
    state,
    currentTrack,
    currentIndex,
    queueLength: queueRef.current.length,
    volume,
    amplitude,
    frequencyData,
    crossfadePhase,
    crossfadeProgress,
    currentTime,
    duration,
    error,
    playTrack,
    playQueue,
    crossfadeToTrack,
    crossfadeToQueue,
    pause,
    resume,
    toggle,
    skip,
    skipPrev,
    setVolume,
    seekBy,
    seekTo,
    setDepthDuck,
    stop,
  };
}