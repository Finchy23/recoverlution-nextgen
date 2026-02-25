/**
 * SIMULATOR #5 -- 1245. The Algorithm Audit
 * "Rewrite the function. Silence is not danger anymore."
 * INTERACTION: Type/tap to edit the code -- replace Panic with Peace
 * STEALTH KBE: Cognitive Restructuring -- Neuroplasticity Agency (K)
 *
 * COMPOSITOR: poetic_precision / Circuit / morning / knowing / type / 1245
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const CODE_LINES = [
  { prefix: 'function', text: 'respond(input) {', editable: false },
  { prefix: '  if', text: '(input === "silence") {', editable: false },
  { prefix: '    return', text: '"panic"', editable: true, replacement: '"peace"' },
  { prefix: '  }', text: '', editable: false },
  { prefix: '}', text: '', editable: false },
];

export default function Simulator_AlgorithmAudit({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Circuit',
        chrono: 'morning',
        kbe: 'k',
        hook: 'type',
        specimenSeed: 1245,
        isSeal: false,
      }}
      arrivalText="Old code. Written when you were five."
      prompt="You are running a script written when you were five years old. It is outdated. Rewrite the function. Silence is not danger anymore."
      resonantText="Cognitive restructuring. You audited the algorithm and found a childhood bug. You replaced panic with peace. Neuroplasticity agency is the knowledge that the code can be rewritten at any age."
      afterglowCoda="Rewrite the function."
      onComplete={onComplete}
    >
      {(verse) => <AlgorithmAuditInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function AlgorithmAuditInteraction({ verse }: { verse: any }) {
  const [editing, setEditing] = useState(false);
  const [rewritten, setRewritten] = useState(false);
  const [done, setDone] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [typeProgress, setTypeProgress] = useState(0);

  const handleEdit = () => {
    if (editing) return;
    setEditing(true);

    // Animate deletion of "panic"
    const deleteSteps = '"panic"'.length;
    let step = 0;
    const deleteInterval = setInterval(() => {
      step++;
      setDeleteProgress(step);
      if (step >= deleteSteps) {
        clearInterval(deleteInterval);
        // Animate typing "peace"
        let tStep = 0;
        const typeInterval = setInterval(() => {
          tStep++;
          setTypeProgress(tStep);
          if (tStep >= '"peace"'.length) {
            clearInterval(typeInterval);
            setRewritten(true);
            setDone(true);
            setTimeout(() => verse.advance(), 2800);
          }
        }, 100);
      }
    }, 80);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const SCENE_W = 280;
  const SCENE_H = 130;

  const oldText = '"panic"';
  const newText = '"peace"';

  // Cursor blink
  useState(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 500);
    return () => clearInterval(interval);
  });

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Age indicator */}
      <motion.span
        style={{ ...navicueType.micro, color: verse.palette.textFaint }}
        animate={{ opacity: 0.4 }}
      >
        {rewritten ? 'updated today' : 'written: age 5 / last modified: never'}
      </motion.span>

      <div style={{
        position: 'relative', width: SCENE_W, padding: '12px 16px',
        borderRadius: 8,
        border: `1px solid`,
        borderColor: rewritten
          ? verse.palette.accent + '30'
          : verse.palette.primary + '15',
      }}>
        {CODE_LINES.map((line, i) => {
          const isEditableLine = line.editable;
          let displayText = line.text;

          if (isEditableLine && editing) {
            if (!rewritten) {
              // Deleting phase
              if (deleteProgress < oldText.length) {
                displayText = oldText.slice(0, oldText.length - deleteProgress);
              } else {
                // Typing phase
                displayText = newText.slice(0, typeProgress);
              }
            } else {
              displayText = newText;
            }
          }

          return (
            <div key={i} style={{
              display: 'flex', gap: 8, alignItems: 'center',
              minHeight: 22,
              fontFamily: 'monospace',
              fontSize: 13,
              lineHeight: '22px',
            }}>
              {/* Line number */}
              <span style={{
                ...navicueType.micro,
                color: verse.palette.textFaint,
                width: 16,
                textAlign: 'right',
                opacity: 0.3,
              }}>
                {i + 1}
              </span>

              {/* Prefix (keyword) */}
              <span style={{
                color: verse.palette.textFaint,
                opacity: 0.5,
              }}>
                {line.prefix}
              </span>

              {/* Code */}
              <motion.span
                style={{
                  color: isEditableLine
                    ? rewritten
                      ? verse.palette.accent
                      : editing
                        ? verse.palette.shadow
                        : verse.palette.text
                    : verse.palette.text,
                  opacity: isEditableLine ? 0.8 : 0.5,
                }}
                animate={isEditableLine && editing && !rewritten
                  ? { opacity: [0.5, 0.8, 0.5] }
                  : {}
                }
              >
                {displayText}
                {/* Cursor */}
                {isEditableLine && editing && !rewritten && (
                  <span style={{
                    display: 'inline-block',
                    width: 1,
                    height: 14,
                    backgroundColor: verse.palette.accent,
                    marginLeft: 1,
                    opacity: cursorVisible ? 0.7 : 0,
                    verticalAlign: 'text-bottom',
                  }} />
                )}
              </motion.span>

              {/* Highlight for editable line */}
              {isEditableLine && !editing && (
                <motion.span
                  style={{
                    ...navicueType.micro,
                    color: verse.palette.shadow,
                    marginLeft: 8,
                  }}
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {'<-- bug'}
                </motion.span>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit button */}
      {!editing && (
        <motion.button
          style={btn.base}
          whileTap={btn.active}
          onClick={handleEdit}
        >
          rewrite the function
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'silence = peace'
          : editing
            ? 'rewriting...'
            : 'if silence then panic. outdated.'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          neuroplasticity agency
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'cognitive restructuring' : 'audit the algorithm'}
      </div>
    </div>
  );
}
