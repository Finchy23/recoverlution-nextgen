/**
 * CAPTURE OVERLAYS — The Doors the Glass Opens
 *
 * Five overlay components, one per overlay capture mode.
 * Each one fades in softly on top of the atom canvas.
 * The timer always runs. A declined invitation is valid signal.
 *
 * The overlay is transparent enough that the atom physics
 * remain visible underneath. The person can still see
 * the visual world while the door is open.
 *
 * Design principles:
 *   The glass opens a door. It does not push you through it.
 *   No pills. No borders. No containers.
 *   Text floats on the glass. Interaction is a color shift.
 *   The physics carries the weight. The copy supports.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { CaptureOptions, CaptureResult, OverlayCaptureMode } from './composition-types';
import { getRandomPrompt } from './capture-prompts';
import {
  room, font, colors, opacity, typeSize, tracking, weight,
  leading, glaze, layer, refract, timing, void_, glow,
} from '../design-system/surface-tokens';

// ─── Shared Constants ───

const OVERLAY_EASE = [0.16, 1, 0.3, 1] as const;
const OVERLAY_FADE_IN = 1.2;    // seconds — slow emergence

// ─── Shared Overlay Shell ───

interface OverlayShellProps {
  visible: boolean;
  children: React.ReactNode;
}

function OverlayShell({ visible, children }: OverlayShellProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: OVERLAY_FADE_IN, ease: OVERLAY_EASE }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: layer.overlay,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingBottom: '20%',
            paddingLeft: '10%',
            paddingRight: '10%',
            background: `linear-gradient(
              180deg,
              transparent 0%,
              ${void_.haze} 40%,
              ${void_.shade} 70%,
              ${void_.deep} 100%
            )`,
            backdropFilter: refract.subtle,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Ambient Prompt Text ───
// The invitation. Small. Supporting. Not the main voice.

function AmbientPrompt({ text }: { text: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.8, ease: OVERLAY_EASE }}
      style={{
        fontFamily: font.serif,
        fontSize: typeSize.small,
        fontStyle: 'italic',
        fontWeight: weight.light,
        color: room.fg,
        opacity: opacity.voice,
        lineHeight: leading.relaxed,
        textAlign: 'center',
        margin: 0,
        marginBottom: 16,
        letterSpacing: tracking.body,
      }}
    >
      {text}
    </motion.p>
  );
}

// ═══════════════════════════════════════════════════════
// BINARY OVERLAY — Two words on the glass
// ═══════════════════════════════════════════════════════
//
// No pills. No borders. Just two floating words
// separated by a single particle. Tap one.

interface BinaryOverlayProps {
  visible: boolean;
  options: CaptureOptions;
  onCapture: (result: CaptureResult) => void;
}

export function BinaryOverlay({ visible, options, onCapture }: BinaryOverlayProps) {
  const [selected, setSelected] = useState<'a' | 'b' | null>(null);
  const choices = options.options ?? ['this', 'that'];
  const prompt = options.prompt ?? getRandomPrompt('binary').text;

  const handleSelect = (choice: 'a' | 'b') => {
    setSelected(choice);
    setTimeout(() => {
      onCapture({
        mode: 'binary',
        chosen: choice,
        options: [choices[0], choices[1]] as [string, string],
      });
    }, 600);
  };

  useEffect(() => {
    if (!visible) setSelected(null);
  }, [visible]);

  return (
    <OverlayShell visible={visible}>
      <AmbientPrompt text={prompt} />

      <div
        className="flex items-center justify-center gap-6"
        style={{ width: '100%', maxWidth: '16rem' }}
      >
        {(['a', 'b'] as const).map((key, i) => {
          const isSelected = selected === key;
          const isOther = selected !== null && !isSelected;
          return (
            <motion.button
              key={key}
              onClick={() => !selected && handleSelect(key)}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: isOther ? 0.15 : 1,
                y: 0,
              }}
              transition={{
                delay: 0.6 + i * 0.15,
                duration: 0.7,
                ease: OVERLAY_EASE,
              }}
              style={{
                padding: 0,
                background: 'transparent',
                border: 'none',
                cursor: selected ? 'default' : 'pointer',
                fontFamily: font.serif,
                fontSize: typeSize.reading,
                fontWeight: weight.light,
                fontStyle: 'italic',
                color: isSelected
                  ? colors.accent.cyan.primary
                  : room.fg,
                opacity: isOther ? opacity.ambient : opacity.spoken,
                letterSpacing: tracking.body,
                textAlign: 'center',
                transition: timing.t.settle,
              }}
            >
              {choices[i]}
            </motion.button>
          );
        })}
      </div>
    </OverlayShell>
  );
}

// ═══════════════════════════════════════════════════════
// SELECT OVERLAY — Floating words. Tap what resonates.
// ═══════════════════════════════════════════════════════

interface SelectOverlayProps {
  visible: boolean;
  options: CaptureOptions;
  onCapture: (result: CaptureResult) => void;
}

export function SelectOverlay({ visible, options, onCapture }: SelectOverlayProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allOptions = options.options ?? ['clarity', 'warmth', 'weight', 'space'];
  const prompt = options.prompt ?? getRandomPrompt('select').text;

  const toggleOption = (opt: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(opt)) next.delete(opt);
      else next.add(opt);
      return next;
    });
  };

  // Auto-resolve after first selection + brief pause
  useEffect(() => {
    if (selected.size === 0) return;
    const timer = setTimeout(() => {
      onCapture({
        mode: 'select',
        chosen: [...selected],
        options: allOptions,
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [selected]);

  useEffect(() => {
    if (!visible) setSelected(new Set());
  }, [visible]);

  return (
    <OverlayShell visible={visible}>
      <AmbientPrompt text={prompt} />

      <div
        className="flex flex-wrap justify-center gap-x-5 gap-y-2"
        style={{ maxWidth: '18rem' }}
      >
        {allOptions.map((opt, i) => {
          const isChosen = selected.has(opt);
          return (
            <motion.button
              key={opt}
              onClick={() => toggleOption(opt)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.6 + i * 0.1,
                duration: 0.6,
                ease: OVERLAY_EASE,
              }}
              style={{
                padding: 0,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: font.serif,
                fontSize: typeSize.small,
                fontStyle: 'italic',
                fontWeight: weight.light,
                color: isChosen ? colors.accent.cyan.primary : room.fg,
                opacity: isChosen ? opacity.bright : opacity.spoken,
                letterSpacing: tracking.body,
                transition: timing.t.settle,
              }}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>
    </OverlayShell>
  );
}

// ═══════════════════════════════════════════════════════
// WHISPER OVERLAY — A ghostly input. No container.
// ═══════════════════════════════════════════════════════

interface WhisperOverlayProps {
  visible: boolean;
  options: CaptureOptions;
  onCapture: (result: CaptureResult) => void;
}

export function WhisperOverlay({ visible, options, onCapture }: WhisperOverlayProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const prompt = options.prompt ?? getRandomPrompt('whisper').text;

  // Auto-resolve after typing pauses
  useEffect(() => {
    if (!text) return;
    const timer = setTimeout(() => {
      onCapture({ mode: 'whisper', text: text.trim() || null });
    }, 3000);
    return () => clearTimeout(timer);
  }, [text]);

  useEffect(() => {
    if (!visible) setText('');
  }, [visible]);

  return (
    <OverlayShell visible={visible}>
      <AmbientPrompt text={prompt} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: OVERLAY_EASE }}
        style={{ width: '100%', maxWidth: '16rem' }}
      >
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && text.trim()) {
              onCapture({ mode: 'whisper', text: text.trim() });
            }
          }}
          placeholder=""
          style={{
            width: '100%',
            padding: '6px 0',
            background: 'transparent',
            border: 'none',
            borderBottom: `1px solid ${text
              ? colors.accent.cyan.primary + '30'
              : glaze.frost}`,
            borderRadius: 0,
            fontFamily: font.serif,
            fontSize: typeSize.reading,
            fontWeight: weight.light,
            fontStyle: 'italic',
            color: room.fg,
            opacity: opacity.clear,
            letterSpacing: tracking.body,
            outline: 'none',
            caretColor: colors.accent.cyan.primary,
            transition: timing.t.settle,
          }}
        />
      </motion.div>
    </OverlayShell>
  );
}

// ═══════════════════════════════════════════════════════
// THOUGHT OVERLAY — Voice to text. A breathing dot.
// ═══════════════════════════════════════════════════════

interface ThoughtOverlayProps {
  visible: boolean;
  options: CaptureOptions;
  onCapture: (result: CaptureResult) => void;
}

export function ThoughtOverlay({ visible, options, onCapture }: ThoughtOverlayProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [durationMs, setDurationMs] = useState(0);
  const startTimeRef = useRef<number>(0);
  const prompt = options.prompt ?? getRandomPrompt('thought').text;

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition
      || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      startTimeRef.current = Date.now();
    };

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      setTranscript(result[0].transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
      const elapsed = Date.now() - startTimeRef.current;
      setDurationMs(elapsed);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.start();
  }, []);

  // Auto-resolve after speech ends
  useEffect(() => {
    if (!isListening && transcript && durationMs > 0) {
      const timer = setTimeout(() => {
        onCapture({
          mode: 'thought',
          text: transcript.trim() || null,
          durationMs,
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isListening, transcript, durationMs]);

  useEffect(() => {
    if (!visible) {
      setTranscript('');
      setIsListening(false);
      setDurationMs(0);
    }
  }, [visible]);

  return (
    <OverlayShell visible={visible}>
      <AmbientPrompt text={prompt} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: OVERLAY_EASE }}
        className="flex flex-col items-center gap-4"
        style={{ width: '100%', maxWidth: '16rem' }}
      >
        {/* Transcript — floating text */}
        {transcript && (
          <p
            style={{
              fontFamily: font.serif,
              fontSize: typeSize.small,
              fontStyle: 'italic',
              fontWeight: weight.light,
              color: room.fg,
              opacity: opacity.bright,
              lineHeight: leading.relaxed,
              textAlign: 'center',
              margin: 0,
            }}
          >
            {transcript}
          </p>
        )}

        {/* Breathing dot — the only interaction surface */}
        <button
          onClick={startListening}
          disabled={isListening}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: isListening
              ? colors.accent.cyan.primary
              : glaze.silver,
            border: 'none',
            padding: 0,
            cursor: isListening ? 'default' : 'pointer',
            boxShadow: isListening
              ? glow.halo(colors.accent.cyan.primary)
              : 'none',
            transition: timing.t.settle,
            animation: isListening ? 'pulse-glow 1.5s ease infinite' : 'none',
          }}
        />

        <span
          style={{
            fontFamily: font.mono,
            fontSize: typeSize.whisper,
            letterSpacing: tracking.wide,
            textTransform: 'uppercase',
            color: isListening ? colors.accent.cyan.primary : glaze.dim,
            opacity: opacity.steady,
          }}
        >
          {isListening ? 'listening' : transcript ? '' : 'tap to speak'}
        </span>
      </motion.div>
    </OverlayShell>
  );
}

// ═══════════════════════════════════════════════════════
// VOICE OVERLAY — Raw audio. A breathing dot.
// ═══════════════════════════════════════════════════════

interface VoiceOverlayProps {
  visible: boolean;
  options: CaptureOptions;
  onCapture: (result: CaptureResult) => void;
}

export function VoiceOverlay({ visible, options, onCapture }: VoiceOverlayProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [declined, setDeclined] = useState(false);
  const startTimeRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const prompt = options.prompt ?? getRandomPrompt('voice').text;

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      startTimeRef.current = Date.now();

      recorder.ondataavailable = () => {};

      recorder.onstop = () => {
        const elapsed = Date.now() - startTimeRef.current;
        setIsRecording(false);
        stream.getTracks().forEach(t => t.stop());

        setTimeout(() => {
          onCapture({
            mode: 'voice',
            durationMs: elapsed,
            declined: false,
          });
        }, 1000);
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      setDeclined(true);
      onCapture({ mode: 'voice', durationMs: 0, declined: true });
    }
  }, [onCapture]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  useEffect(() => {
    if (!visible) {
      setIsRecording(false);
      setDeclined(false);
    }
  }, [visible]);

  // Elapsed time while recording
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!isRecording) { setElapsed(0); return; }
    const iv = setInterval(() => {
      setElapsed(Date.now() - startTimeRef.current);
    }, 100);
    return () => clearInterval(iv);
  }, [isRecording]);

  return (
    <OverlayShell visible={visible}>
      <AmbientPrompt text={prompt} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: OVERLAY_EASE }}
        className="flex flex-col items-center gap-4"
        style={{ width: '100%', maxWidth: '16rem' }}
      >
        {/* Elapsed — small mono, only while recording */}
        {isRecording && (
          <span
            style={{
              fontFamily: font.mono,
              fontSize: typeSize.label,
              letterSpacing: tracking.code,
              color: colors.accent.cyan.primary,
              opacity: opacity.spoken,
            }}
          >
            {(elapsed / 1000).toFixed(1)}s
          </span>
        )}

        {/* Breathing dot — the interaction surface */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={declined}
          style={{
            width: isRecording ? 10 : 8,
            height: isRecording ? 10 : 8,
            borderRadius: '50%',
            background: isRecording
              ? colors.accent.cyan.primary
              : glaze.silver,
            border: 'none',
            padding: 0,
            cursor: declined ? 'default' : 'pointer',
            boxShadow: isRecording
              ? glow.halo(colors.accent.cyan.primary)
              : 'none',
            transition: timing.t.settle,
          }}
        />

        <span
          style={{
            fontFamily: font.mono,
            fontSize: typeSize.whisper,
            letterSpacing: tracking.wide,
            textTransform: 'uppercase',
            color: isRecording ? colors.accent.cyan.primary : glaze.dim,
            opacity: opacity.steady,
          }}
        >
          {declined ? 'unavailable' : isRecording ? 'recording' : 'tap to record'}
        </span>
      </motion.div>
    </OverlayShell>
  );
}

// ═══════════════════════════════════════════════════════
// CAPTURE OVERLAY — Unified orchestrator
// ═══════════════════════════════════════════════════════

interface CaptureOverlayProps {
  mode: OverlayCaptureMode;
  visible: boolean;
  options: CaptureOptions;
  onCapture: (result: CaptureResult) => void;
}

export function CaptureOverlay({ mode, visible, options, onCapture }: CaptureOverlayProps) {
  switch (mode) {
    case 'binary':
      return <BinaryOverlay visible={visible} options={options} onCapture={onCapture} />;
    case 'select':
      return <SelectOverlay visible={visible} options={options} onCapture={onCapture} />;
    case 'whisper':
      return <WhisperOverlay visible={visible} options={options} onCapture={onCapture} />;
    case 'thought':
      return <ThoughtOverlay visible={visible} options={options} onCapture={onCapture} />;
    case 'voice':
      return <VoiceOverlay visible={visible} options={options} onCapture={onCapture} />;
    default:
      return null;
  }
}
