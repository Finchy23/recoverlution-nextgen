/**
 * EDITOR #9 -- 1259. The Director's Cut
 * "Release your own version of the truth."
 * INTERACTION: Toggle between Theatrical and Director's Cut of the same day
 * STEALTH KBE: Authenticity -- Internal Locus of Evaluation (B)
 *
 * COMPOSITOR: witness_ritual / Drift / night / believing / tap / 1259
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const SCENES = [
  { theatrical: 'got yelled at by boss', directors: 'set a boundary I never had before' },
  { theatrical: 'ate lunch alone', directors: 'chose stillness over noise' },
  { theatrical: 'could not sleep', directors: 'sat with something that needed feeling' },
];

export default function Editor_DirectorsCut({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Drift',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1259,
        isSeal: false,
      }}
      arrivalText="Today. Two versions."
      prompt="The studio wants the tragedy. The Director knows the vision. Release your own version of the truth."
      resonantText="Authenticity. You chose the version that carries meaning. Internal locus of evaluation is the Director's authority. The studio can market the tragedy. You know the real story."
      afterglowCoda="Release your version."
      onComplete={onComplete}
    >
      {(verse) => <DirectorsCutInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function DirectorsCutInteraction({ verse }: { verse: any }) {
  const [version, setVersion] = useState<'theatrical' | 'directors'>('theatrical');
  const [saved, setSaved] = useState(false);
  const [done, setDone] = useState(false);

  const handleSwitch = () => {
    if (saved) return;
    setVersion(version === 'theatrical' ? 'directors' : 'theatrical');
  };

  const handleSave = () => {
    if (version !== 'directors' || saved) return;
    setSaved(true);
    setDone(true);
    setTimeout(() => verse.advance(), 3000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const isDirectors = version === 'directors';
  const SCENE_W = 280;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Version toggle */}
      <div style={{
        display: 'flex', gap: 0,
        borderRadius: 6,
        border: `1px solid ${verse.palette.primary}15`,
        overflow: 'hidden',
      }}>
        {(['theatrical', 'directors'] as const).map(v => (
          <motion.button
            key={v}
            onClick={saved ? undefined : handleSwitch}
            style={{
              padding: '6px 16px',
              border: 'none',
              cursor: saved ? 'default' : 'pointer',
              backgroundColor: 'transparent',
              ...navicueType.micro,
              color: version === v
                ? (v === 'directors' ? verse.palette.accent : verse.palette.text)
                : verse.palette.textFaint,
            }}
            animate={{
              opacity: version === v ? 0.8 : 0.3,
              backgroundColor: version === v
                ? (v === 'directors' ? verse.palette.accent + '12' : verse.palette.primary + '08')
                : 'transparent',
            }}
          >
            {v === 'theatrical' ? 'theatrical' : "director's cut"}
          </motion.button>
        ))}
      </div>

      {/* Scenes list */}
      <div style={{
        width: SCENE_W,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {SCENES.map((scene, i) => (
          <motion.div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px',
              borderRadius: 6,
              border: `1px solid ${isDirectors ? verse.palette.accent : verse.palette.primary}${isDirectors ? '15' : '08'}`,
            }}
            layout
          >
            {/* Time marker */}
            <span style={{
              ...navicueType.micro,
              color: verse.palette.textFaint,
              opacity: 0.3,
              minWidth: 20,
            }}>
              {i + 1}.
            </span>

            {/* Scene text */}
            <AnimatePresence mode="wait">
              <motion.span
                key={`${version}-${i}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 0.6, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                style={{
                  ...navicueType.choice,
                  color: isDirectors ? verse.palette.accent : verse.palette.text,
                  flex: 1,
                }}
              >
                {isDirectors ? scene.directors : scene.theatrical}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Film reel label */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint, opacity: 0.3 }}>
          {isDirectors ? 'what it meant' : 'what happened'}
        </span>
      </div>

      {/* Save button (only in director's cut) */}
      {isDirectors && !saved && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={btn.base}
          whileTap={btn.active}
          onClick={handleSave}
        >
          save this version
        </motion.button>
      )}

      {!isDirectors && !saved && (
        <motion.span
          style={{ ...navicueType.micro, color: verse.palette.textFaint }}
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          switch to see your version
        </motion.span>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? "you released your version"
          : isDirectors
            ? 'this is the truth you know'
            : 'this is the studio version'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          internal locus of evaluation
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'authenticity' : 'whose version?'}
      </div>
    </div>
  );
}
