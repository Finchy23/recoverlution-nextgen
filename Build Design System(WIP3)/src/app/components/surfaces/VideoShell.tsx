/**
 * VIDEO SHELL — The Glass Becomes Transparent
 *
 * Not a video player. Not a media frame. The glass surface
 * becomes transparent, and the practice is what you see through it.
 *
 * No play bar. No scrub bar. No time display chrome.
 * The 2px refractive progress line at the bottom IS the progress.
 * Tap to pause/resume. "Surface" to return.
 *
 * Auto-plays muted on entry (guaranteed by browsers), then
 * unmutes after 600ms. Zero gates — "Step inside" IS the play.
 *
 * Sources come from content-runtime /item/videos/:key (hls_url, mp4_url).
 * Frontend NEVER calls JW APIs directly.
 *
 * HLS playback:
 *   Safari → native HLS (built-in)
 *   Chrome / Firefox / etc → hls.js library
 *
 * The video fills edge-to-edge BEHIND the orb (z-15 < z-30).
 * The orb becomes a focal well within the cinematic space.
 */

import { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ResolvedMedia } from '../runtime/useJWMedia';

import { useSurfaceArrival, STAGGER, SURFACE_EASE, SURFACE_DURATION } from './useSurfaceArrival';
import { room, font, tracking, typeSize, weight, timing, glow, radii, glaze, void_, refract, layer, layout } from '../design-system/surface-tokens';

// ─── Orb clearance (shared constant) ───
const ORB_CLEARANCE = layout.orbClearance;

// ─── Safari detection ─
const IS_SAFARI = typeof navigator !== 'undefined' &&
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

// ─── Can the browser play HLS natively? ───
function canPlayHlsNatively(): boolean {
  if (typeof document === 'undefined') return false;
  const video = document.createElement('video');
  return !!video.canPlayType('application/vnd.apple.mpegurl');
}

// ─── Public API ───

export interface VideoShellHandle {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (fraction: number) => void;
  /** Current playback state */
  readonly playing: boolean;
}

interface VideoShellProps {
  /** Resolved media from content-runtime video detail */
  media: ResolvedMedia;
  /** Fallback poster from rail data (hero.poster_url) */
  fallbackPoster?: string;
  /** Modality color for the refractive progress line */
  color: string;
  /** Called when playback ends naturally */
  onComplete?: () => void;
  /** Called when user taps to exit — initiates resurfacing */
  onExit?: () => void;
  /** Called with progress fraction 0–1 on each time update */
  onProgress?: (fraction: number) => void;
  /** Whether the shell is active (mounted in immersion) */
  active: boolean;
  /** Whether we're in the exit/resurfacing transition */
  resurfacing?: boolean;
  /** Practice title — whispered above the orb */
  title?: string;
}

export const VideoShell = forwardRef<VideoShellHandle, VideoShellProps>(function VideoShell(
  { media, fallbackPoster, color, onComplete, onExit, onProgress, active, resurfacing, title },
  ref,
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [hasUnmuted, setHasUnmuted] = useState(false);
  const [userHasPaused, setUserHasPaused] = useState(false);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevSrcRef = useRef<string | null>(null);
  const unmuteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  // ── Derived values ──
  const durationSec = media.durationSec || 1;
  const elapsedSec = progress * durationSec;
  const elapsedMin = Math.floor(elapsedSec / 60);
  const elapsedSecRemainder = Math.floor(elapsedSec % 60);
  const posterUrl = media.posterUrl || fallbackPoster || '';
  const hasVideo = !!(media.mp4Url || media.hlsUrl);

  // ── Imperative handle ──
  useImperativeHandle(ref, () => ({
    play: () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause(),
    toggle: () => {
      const v = videoRef.current;
      if (!v) return;
      v.paused ? v.play() : v.pause();
    },
    seek: (fraction: number) => {
      const v = videoRef.current;
      if (v && v.duration) {
        v.currentTime = fraction * v.duration;
      }
    },
    get playing() { return playing; },
  }), [playing]);

  // ── Attach source to video element ──
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !active || !hasVideo) return;

    const hlsUrl = media.hlsUrl;
    const mp4Url = media.mp4Url;

    let src: string | null = null;

    if (hlsUrl) {
      if (canPlayHlsNatively()) {
        src = hlsUrl;
        console.info('[VideoShell] Using native HLS:', hlsUrl);
      } else if (mp4Url) {
        src = mp4Url;
        console.info('[VideoShell] HLS not supported, falling back to MP4:', mp4Url);
      }
    } else if (mp4Url) {
      src = mp4Url;
      console.info('[VideoShell] Using MP4:', mp4Url);
    }

    if (!src) {
      console.warn('[VideoShell] No playable source found');
      return;
    }

    if (prevSrcRef.current === src) return;
    prevSrcRef.current = src;

    setVideoReady(false);
    setVideoError(false);
    setProgress(0);
    setPlaying(false);
    setHasUnmuted(false);
    setUserHasPaused(false);

    // Start muted for guaranteed autoplay
    video.muted = true;
    video.src = src;
    video.load();

    return () => {};
  }, [active, hasVideo, media.hlsUrl, media.mp4Url]);

  // ── Full cleanup on deactivation / unmount ──
  useEffect(() => {
    return () => {
      prevSrcRef.current = null;
      if (unmuteTimer.current) clearTimeout(unmuteTimer.current);
    };
  }, []);

  // ── Safe play helper — tracks the promise so we never race ──
  const safePlay = useCallback((video: HTMLVideoElement) => {
    // Wait for any pending play to settle before issuing a new one
    const doPlay = () => {
      if (!activeRef.current) return; // bail if we deactivated while waiting
      const promise = video.play();
      if (promise) {
        playPromiseRef.current = promise;
        promise
          .then(() => {
            playPromiseRef.current = null;
            if (!activeRef.current) {
              // Deactivated while play was resolving — pause immediately
              video.pause();
              return;
            }
            console.info('[VideoShell] Autoplay started (muted)');
            unmuteTimer.current = setTimeout(() => {
              if (activeRef.current && videoRef.current) {
                videoRef.current.muted = false;
                setHasUnmuted(true);
                console.info('[VideoShell] Unmuted');
              }
            }, 800);
          })
          .catch(() => {
            playPromiseRef.current = null;
            // Silently swallow — element was likely removed during transition
          });
      }
    };

    if (playPromiseRef.current) {
      // Wait for the previous play() to settle first
      playPromiseRef.current.then(doPlay).catch(doPlay);
    } else {
      doPlay();
    }
  }, []);

  // ── Safe pause helper — waits for pending play to settle ──
  const safePause = useCallback((video: HTMLVideoElement) => {
    if (playPromiseRef.current) {
      playPromiseRef.current
        .then(() => { video.pause(); })
        .catch(() => { /* element gone, nothing to do */ });
      playPromiseRef.current = null;
    } else {
      video.pause();
    }
  }, []);

  // ── Auto-play muted when active + ready, then unmute ──
  useEffect(() => {
    if (active && videoRef.current && videoReady && !resurfacing) {
      const video = videoRef.current;
      video.muted = true;
      safePlay(video);
    }
    if (!active && videoRef.current) {
      const video = videoRef.current;
      if (unmuteTimer.current) {
        clearTimeout(unmuteTimer.current);
        unmuteTimer.current = null;
      }
      safePause(video);
      video.currentTime = 0;
      setProgress(0);
      setPlaying(false);
      setVideoReady(false);
      setHasUnmuted(false);
      setUserHasPaused(false);
      prevSrcRef.current = null;
    }
  }, [active, videoReady, resurfacing, safePlay, safePause]);

  // ── Fade out audio during resurfacing ──
  useEffect(() => {
    if (resurfacing && videoRef.current) {
      const video = videoRef.current;
      let vol = video.volume;
      const fadeInterval = setInterval(() => {
        vol = Math.max(0, vol - 0.08);
        if (videoRef.current) {
          videoRef.current.volume = vol;
        }
        if (vol <= 0) {
          clearInterval(fadeInterval);
          if (videoRef.current) {
            safePause(videoRef.current);
          }
        }
      }, 60);
      return () => clearInterval(fadeInterval);
    }
  }, [resurfacing, safePause]);

  // ── Controls auto-hide ──
  const flashControls = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3200);
  }, []);

  // Show controls briefly after video starts playing
  useEffect(() => {
    if (active && playing && !userHasPaused) {
      // Delay showing controls so the entry feels clean
      const t = setTimeout(() => flashControls(), 2000);
      return () => clearTimeout(t);
    }
  }, [active, playing, userHasPaused, flashControls]);

  // ── Event handlers ──
  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const frac = v.currentTime / v.duration;
    setProgress(frac);
    onProgress?.(frac);
  }, [onProgress]);

  const handleBufferProgress = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.duration || v.buffered.length === 0) return;
    const end = v.buffered.end(v.buffered.length - 1);
    setBuffered(end / v.duration);
  }, []);

  const handlePlay = useCallback(() => setPlaying(true), []);
  const handlePause = useCallback(() => setPlaying(false), []);
  const handleCanPlay = useCallback(() => {
    console.info('[VideoShell] canplay — video ready');
    setVideoReady(true);
  }, []);
  const handleError = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const err = video.error;
    console.error('[VideoShell] Video error:', err?.code, err?.message);
    setVideoError(true);
  }, []);

  const handleEnded = useCallback(() => {
    setPlaying(false);
    setProgress(1);
    onComplete?.();
  }, [onComplete]);

  const handleTap = useCallback(() => {
    if (resurfacing) return;
    const video = videoRef.current;
    if (!video) return;
    if (!playing) {
      setUserHasPaused(false);
      safePlay(video);
    } else {
      if (!showControls) {
        flashControls();
      } else {
        setUserHasPaused(true);
        safePause(video);
        flashControls();
      }
    }
  }, [playing, showControls, flashControls, resurfacing, safePlay, safePause]);

  if (!active) return null;

  return (
    <motion.div
      className="absolute inset-0"
      style={{ zIndex: layer.playerChrome }}
      initial={{ opacity: 0 }}
      animate={{ opacity: resurfacing ? 0 : 1 }}
      transition={{
        duration: resurfacing ? 1.4 : 1.8,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {/* ── The video element — starts muted for guaranteed autoplay ── */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: videoReady ? 1 : 0,
          transition: `opacity ${timing.dur.reveal} ${timing.curve}`,
        }}
        poster={posterUrl || undefined}
        playsInline
        muted
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleBufferProgress}
        onPlay={handlePlay}
        onPause={handlePause}
        onCanPlay={handleCanPlay}
        onEnded={handleEnded}
        onError={handleError}
      />

      {/* ── Poster fallback — shows while video loads or if no video ── */}
      <AnimatePresence>
        {(!videoReady || !hasVideo || videoError) && (
          <>
            {posterUrl ? (
              <motion.img
                src={posterUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{
                  opacity: 1,
                  scale: [1.0, 1.015, 1.0],
                }}
                exit={{ opacity: 0, transition: { duration: 1.6, ease: [0.16, 1, 0.3, 1] } }}
                transition={{
                  opacity: { duration: 1.2 },
                  scale: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
                }}
              />
            ) : (
              /* No poster — glass refractive atmosphere as the immersion backdrop */
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 1.6, ease: [0.16, 1, 0.3, 1] } }}
                transition={{ duration: 1.2 }}
              >
                <div
                  className="absolute inset-0"
                  style={{ background: void_.solid }}
                />
                <motion.div
                  className="absolute inset-0"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    background: `radial-gradient(ellipse 100% 60% at 50% 40%, ${color}0a, transparent 70%)`,
                  }}
                />
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* ── Cinematic letterbox gradients ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            to bottom,
            ${void_.mist} 0%,
            transparent 10%,
            transparent 68%,
            ${void_.haze} 85%,
            ${void_.dim} 100%
          )`,
        }}
      />

      {/* ── Pause frost — only when user explicitly pauses ── */}
      <AnimatePresence>
        {!playing && videoReady && userHasPaused && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: void_.fog,
              backdropFilter: refract.gentle,
              WebkitBackdropFilter: refract.gentle,
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Tap zone — above the orb territory ── */}
      <div
        className="absolute left-0 right-0 top-0"
        style={{ bottom: ORB_CLEARANCE, cursor: 'pointer' }}
        onClick={handleTap}
      />

      {/* ── Controls overlay ── */}
      <AnimatePresence>
        {!resurfacing && (
          <>
            {/* Top — surface (exit) + elapsed — always visible during immersion */}
            <motion.div
              className="absolute top-0 left-0 right-0 flex items-start justify-between px-5 pt-5"
              style={{ zIndex: layer.content }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onExit?.(); }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  borderRadius: radii.round,
                }}
              >
                {/* Upward gesture — resurfacing through the glass */}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" opacity="0.35">
                  <path d="M6 10L6 2M3 5L6 2L9 5" stroke={room.fg} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{
                  fontFamily: font.serif,
                  fontSize: typeSize.caption,
                  fontWeight: weight.light,
                  fontStyle: 'italic',
                  letterSpacing: tracking.compact,
                  color: glaze.silver,
                }}>
                  surface
                </span>
              </button>

              <span style={{
                fontFamily: font.mono,
                fontSize: typeSize.caption,
                fontWeight: weight.regular,
                color: glaze.dim,
                fontVariantNumeric: 'tabular-nums',
                paddingTop: 6,
              }}>
                {String(elapsedMin).padStart(2, '0')}:{String(elapsedSecRemainder).padStart(2, '0')}
              </span>
            </motion.div>

            {/* Center — play indicator ONLY when user has paused */}
            {!playing && userHasPaused && showControls && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div style={{
                  width: 0,
                  height: 0,
                  borderLeft: `14px solid ${glaze.muted}`,
                  borderTop: '9px solid transparent',
                  borderBottom: '9px solid transparent',
                  filter: `drop-shadow(0 0 12px ${color}20)`,
                }} />
              </motion.div>
            )}

            {/* Title whisper — above the orb */}
            {title && showControls && (
              <motion.div
                className="absolute left-0 right-0 flex flex-col items-center"
                style={{ bottom: ORB_CLEARANCE + 8 }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <span style={{
                  fontFamily: font.mono,
                  fontSize: typeSize.note,
                  fontWeight: weight.light,
                  fontStyle: 'italic',
                  color: glaze.muted,
                }}>
                  {title}
                </span>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* ── Refractive progress line ── */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: 2 }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${buffered * 100}%`,
            background: glaze.veil,
            transition: timing.t.widthModerate,
          }}
        />
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, transparent 0%, ${color}35 30%, ${color}55 100%)`,
            boxShadow: glow.dot(color, '25') + `, 0 -1px 8px ${color}10`,
          }}
        />
        {progress > 0.01 && (
          <div
            className="absolute top-0 rounded-full"
            style={{
              left: `${progress * 100}%`,
              transform: 'translate(-50%, -25%)',
              width: 4,
              height: 4,
              background: `radial-gradient(circle, ${color}50, transparent 70%)`,
              filter: refract.subtle,
            }}
          />
        )}
      </div>

      {/* ── Entry bloom — refractive wash as video materializes ── */}
      <AnimatePresence>
        {!videoReady && hasVideo && !videoError && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background: `radial-gradient(ellipse 80% 50% at 50% 45%, ${color}08, transparent 70%)`,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="rounded-full"
                style={{
                  width: 4,
                  height: 4,
                  background: `radial-gradient(circle, ${color}40, transparent)`,
                }}
                animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── No video available — atmospheric placeholder ── */}
      {!hasVideo && active && !videoError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-3">
          <motion.div
            className="rounded-full"
            style={{
              width: 4,
              height: 4,
              background: `radial-gradient(circle, ${color}40, transparent)`,
            }}
            animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
            style={{
              fontFamily: font.serif,
              fontSize: typeSize.note,
              fontWeight: weight.light,
              fontStyle: 'italic',
              color: glaze.muted,
            }}
          >
            preparing the space
          </motion.span>
        </div>
      )}

      {/* ── Error state ── */}
      {videoError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-3">
          <div
            className="rounded-full"
            style={{
              width: 4,
              height: 4,
              background: `radial-gradient(circle, ${color}25, transparent)`,
            }}
          />
          <span style={{
            fontFamily: font.serif,
            fontSize: typeSize.note,
            fontWeight: weight.light,
            fontStyle: 'italic',
            color: glaze.sheen,
          }}>
            the stream is resting
          </span>
        </div>
      )}

      {/* ── Resurfacing overlay — glass reforms ── */}
      <AnimatePresence>
        {resurfacing && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: void_.deep,
              backdropFilter: refract.frost,
              WebkitBackdropFilter: refract.frost,
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
});
