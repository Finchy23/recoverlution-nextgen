import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import type { TalkCorridorPhase } from '@recoverlution/types';

export interface TalkTheme {
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary?: string;
  surfaceBase: string;
  positiveAccent?: string;
  dangerAccent?: string;
  fontPrimary: string;
  fontSecondary: string;
  fontMono: string;
}

export interface TalkActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  theme: TalkTheme;
}

export interface TalkPillProps {
  children: ReactNode;
  theme: TalkTheme;
  accent?: string;
  active?: boolean;
}

export interface TalkPanelProps {
  eyebrow: string;
  title: string;
  theme: TalkTheme;
  children: ReactNode;
}

export interface TalkPhaseChip {
  id: string;
  label: string;
  active?: boolean;
}

export interface TalkCandidateCard {
  id: string;
  overline: string;
  title: string;
  body: string;
  active?: boolean;
  onSelect?: () => void;
}

export interface TalkMoveOption {
  id: string;
  label: string;
  active?: boolean;
  onSelect?: () => void;
}

export interface TalkMatrixFamilyCard {
  move: string;
  voiceFamily: string;
  safetyBand: string;
  routeTarget?: string | null;
  copy: string;
  optionalPrompt?: string | null;
  editorialNotes?: string | null;
  runtimeBridgeLabel?: string | null;
}

export interface TalkActionItem {
  id: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}

export interface TalkSealedEntryCard {
  id: string;
  lane: string;
  orientation: string;
  routeTarget?: string | null;
  title: string;
  excerpt: string;
}

export interface TalkStableNodeChip {
  id: string;
  label: string;
  active?: boolean;
}

export interface TalkCorridorPanelProps {
  theme: TalkTheme;
  title: string;
  phaseBody: string;
  phaseChips: TalkPhaseChip[];
  candidates: TalkCandidateCard[];
  entryDraft: string;
  entryPlaceholder: string;
  onEntryDraftChange: (value: string) => void;
  canSeal: boolean;
  onSeal: () => void;
  onRest: () => void;
  onReset: () => void;
  isResting?: boolean;
}

export interface TalkResponseMatrixPanelProps {
  theme: TalkTheme;
  title: string;
  moveOptions: TalkMoveOption[];
  family: TalkMatrixFamilyCard | null;
  notes?: string[];
  primaryActions?: TalkActionItem[];
  secondaryActions?: TalkActionItem[];
}

export interface TalkThreadTopologyPanelProps {
  theme: TalkTheme;
  title: string;
  summary: string;
  entries: TalkSealedEntryCard[];
  stableNodes: TalkStableNodeChip[];
}

export interface TalkDeviceScreenProps {
  theme: TalkTheme;
  phase?: TalkCorridorPhase;
  phaseTitle: string;
  candidateTitle: string;
  candidateBody: string;
  entryText: string;
  responseLine?: string | null;
  dispatchTitle?: string | null;
  dispatchRoute?: string | null;
  opener?: string;
  preamble?: string | null;
  promptOptions?: TalkDevicePromptOption[];
  inputModes?: TalkDeviceInputModeOption[];
}

export interface TalkDevicePromptOption {
  id: string;
  title: string;
  body?: string;
  overline?: string;
  accent?: string;
  active?: boolean;
  onSelect?: () => void;
}

export interface TalkDeviceInputModeOption {
  id: 'pen' | 'voice';
  label: string;
  hint?: string;
  active?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

function withOpacity(color: string, opacity: number): string {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const normalized =
      hex.length === 3
        ? hex
            .split('')
            .map((char) => char + char)
            .join('')
        : hex;

    if (normalized.length === 6) {
      const r = Number.parseInt(normalized.slice(0, 2), 16);
      const g = Number.parseInt(normalized.slice(2, 4), 16);
      const b = Number.parseInt(normalized.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }

  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
  }

  if (color.startsWith('rgba(')) {
    return color.replace(/rgba\(([^)]+),\s*[\d.]+\)/, `rgba($1, ${opacity})`);
  }

  return color;
}

function resolveTextTertiary(theme: TalkTheme) {
  return theme.textTertiary ?? withOpacity(theme.textPrimary, 0.46);
}

function charDelayMs(character: string) {
  if (/[.…,;:!?]/.test(character)) return 120;
  if (character === ' ') return 42;
  if (/[aeiou]/i.test(character)) return 34;
  return 24;
}

function useTypewriterReveal(text: string, active: boolean, seedKey: string) {
  const [visibleCount, setVisibleCount] = useState(active ? 0 : text.length);

  useEffect(() => {
    if (!active) {
      setVisibleCount(text.length);
      return;
    }

    setVisibleCount(0);
    let timer: ReturnType<typeof setTimeout> | null = null;
    let index = 0;

    const tick = () => {
      index += 1;
      setVisibleCount(index);
      if (index < text.length) {
        timer = setTimeout(tick, charDelayMs(text[index]));
      }
    };

    timer = setTimeout(tick, 120);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [active, seedKey, text]);

  return {
    visibleText: text.slice(0, visibleCount),
    complete: visibleCount >= text.length,
  };
}

function TalkPromptCeremony({
  theme,
  opener = 'something is here',
  preamble,
  options,
}: {
  theme: TalkTheme;
  opener?: string;
  preamble?: string | null;
  options: TalkDevicePromptOption[];
}) {
  const promptKey = options.map((option) => option.id).join(':');

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 18,
        paddingTop: 8,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          fontFamily: theme.fontMono,
          fontSize: 8,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: theme.textPrimary,
          opacity: 0.26,
        }}
      >
        {opener}
      </div>

      {preamble ? (
        <div
          style={{
            textAlign: 'center',
            fontFamily: theme.fontSecondary,
            fontSize: 14,
            lineHeight: 1.55,
            letterSpacing: '-0.01em',
            color: theme.textPrimary,
            opacity: 0.58,
            padding: '0 8px',
          }}
        >
          {preamble}
        </div>
      ) : null}

      <div
        style={{
          position: 'relative',
          display: 'grid',
          gap: 12,
          justifyItems: 'center',
          padding: '10px 0 4px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 10,
            bottom: 10,
            left: '50%',
            width: 1,
            transform: 'translateX(-50%)',
            background: `linear-gradient(180deg, transparent 0%, ${withOpacity(theme.accent, 0.16)} 18%, ${withOpacity(theme.accent, 0.14)} 82%, transparent 100%)`,
          }}
        />
        {options.map((option, index) => (
          <TalkPromptSeedCard
            key={option.id}
            option={option}
            theme={theme}
            promptKey={promptKey}
            delayIndex={index}
          />
        ))}
      </div>
    </div>
  );
}

function TalkPromptSeedCard({
  option,
  theme,
  promptKey,
  delayIndex,
}: {
  option: TalkDevicePromptOption;
  theme: TalkTheme;
  promptKey: string;
  delayIndex: number;
}) {
  const [armed, setArmed] = useState(false);
  const seedKey = `${promptKey}:${option.id}`;
  const { visibleText, complete } = useTypewriterReveal(option.title, armed, seedKey);
  const accent = option.accent ?? theme.accent;

  useEffect(() => {
    setArmed(false);
    const timer = setTimeout(() => setArmed(true), 240 + delayIndex * 280);
    return () => clearTimeout(timer);
  }, [delayIndex, promptKey]);

  return (
    <button
      type="button"
      onClick={option.onSelect}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 248,
        padding: '10px 16px 12px',
        border: 'none',
        background: 'transparent',
        color: theme.textPrimary,
        cursor: option.onSelect ? 'pointer' : 'default',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          minHeight: 8,
          marginBottom: 4,
          fontFamily: theme.fontMono,
          fontSize: 7,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: accent,
          opacity: complete ? 0.34 : 0,
          transition: 'opacity 420ms ease',
        }}
      >
        {option.overline ?? 'corridor'}
      </div>

      <div
        style={{
          fontFamily: theme.fontSecondary,
          fontSize: 18,
          lineHeight: 1.3,
          letterSpacing: '-0.02em',
          fontStyle: 'italic',
          color: theme.textPrimary,
          opacity: option.active ? 0.94 : 0.76,
          textShadow: option.active ? `0 0 18px ${withOpacity(accent, 0.18)}` : 'none',
          transition: 'opacity 220ms ease, text-shadow 220ms ease',
        }}
      >
        {visibleText}
        {!complete ? (
          <span
            style={{
              display: 'inline-block',
              width: 1,
              height: '0.9em',
              marginLeft: 3,
              background: withOpacity(theme.textPrimary, 0.55),
              verticalAlign: 'text-bottom',
            }}
          />
        ) : null}
      </div>

      {option.body ? (
        <div
          style={{
            marginTop: 8,
            fontFamily: theme.fontPrimary,
            fontSize: 11,
            lineHeight: 1.5,
            color: theme.textSecondary,
            opacity: complete ? 0.7 : 0,
            transition: 'opacity 520ms ease',
          }}
        >
          {option.body}
        </div>
      ) : null}
    </button>
  );
}

function TalkInputGateway({
  theme,
  options,
}: {
  theme: TalkTheme;
  options: TalkDeviceInputModeOption[];
}) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 10,
      }}
    >
      <div
        style={{
          fontFamily: theme.fontMono,
          fontSize: 8,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: theme.textPrimary,
          opacity: 0.22,
          textAlign: 'center',
        }}
      >
        choose a vessel
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
          gap: 10,
        }}
      >
        {options.map((option) => (
          <button
            type="button"
            key={option.id}
            onClick={option.onSelect}
            disabled={option.disabled}
            style={{
              borderRadius: 20,
              border: `1px solid ${option.active ? withOpacity(theme.accent, 0.22) : withOpacity(theme.textPrimary, 0.06)}`,
              background: option.active ? withOpacity(theme.accent, 0.12) : withOpacity(theme.textPrimary, 0.03),
              padding: '12px 10px 14px',
              color: theme.textPrimary,
              cursor: option.disabled ? 'not-allowed' : 'pointer',
              opacity: option.disabled ? 0.42 : option.active ? 0.92 : 0.72,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: theme.fontSecondary,
                fontSize: 16,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                fontStyle: 'italic',
                marginBottom: option.hint ? 6 : 0,
              }}
            >
              {option.label}
            </div>
            {option.hint ? (
              <div
                style={{
                  fontFamily: theme.fontPrimary,
                  fontSize: 11,
                  lineHeight: 1.45,
                  color: theme.textSecondary,
                }}
              >
                {option.hint}
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function panelStyle(theme: TalkTheme): CSSProperties {
  return {
    borderRadius: 22,
    border: `1px solid ${withOpacity(theme.textPrimary, 0.05)}`,
    background: `linear-gradient(180deg, ${withOpacity(theme.textPrimary, 0.04)} 0%, ${withOpacity(theme.textPrimary, 0.02)} 100%)`,
    padding: 22,
  };
}

export function TalkPanel({ eyebrow, title, theme, children }: TalkPanelProps) {
  return (
    <div style={panelStyle(theme)}>
      <div
        style={{
          fontFamily: theme.fontMono,
          fontSize: 10,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: theme.textPrimary,
          opacity: 0.24,
          marginBottom: 12,
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          fontFamily: theme.fontSecondary,
          fontSize: 24,
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          color: theme.textPrimary,
          opacity: 0.88,
          marginBottom: 18,
          maxWidth: 620,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

export function TalkActionButton({
  children,
  onClick,
  active = false,
  disabled = false,
  theme,
}: TalkActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        border: `1px solid ${active ? withOpacity(theme.accent, 0.3) : withOpacity(theme.textPrimary, 0.08)}`,
        background: active ? withOpacity(theme.accent, 0.14) : withOpacity(theme.textPrimary, 0.035),
        color: disabled ? withOpacity(theme.textPrimary, 0.28) : theme.textPrimary,
        padding: '10px 14px',
        borderRadius: 14,
        fontFamily: theme.fontPrimary,
        fontSize: 12,
        letterSpacing: '0.02em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : active ? 0.92 : 0.72,
      }}
    >
      {children}
    </button>
  );
}

export function TalkPill({
  children,
  theme,
  accent,
  active = false,
}: TalkPillProps) {
  const tone = accent ?? theme.accent;
  return (
    <div
      style={{
        padding: '7px 12px',
        borderRadius: 999,
        background: active ? withOpacity(tone, 0.16) : withOpacity(theme.textPrimary, 0.04),
        border: `1px solid ${active ? withOpacity(tone, 0.28) : withOpacity(theme.textPrimary, 0.06)}`,
        color: theme.textPrimary,
        fontFamily: theme.fontPrimary,
        fontSize: 11,
        letterSpacing: '0.02em',
        opacity: active ? 0.86 : 0.58,
      }}
    >
      {children}
    </div>
  );
}

export function TalkCorridorPanel({
  theme,
  title,
  phaseBody,
  phaseChips,
  candidates,
  entryDraft,
  entryPlaceholder,
  onEntryDraftChange,
  canSeal,
  onSeal,
  onRest,
  onReset,
  isResting = false,
}: TalkCorridorPanelProps) {
  return (
    <TalkPanel eyebrow="corridor" title={title} theme={theme}>
      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {phaseChips.map((chip) => (
            <TalkPill key={chip.id} theme={theme} active={chip.active}>
              {chip.label}
            </TalkPill>
          ))}
        </div>

        <div
          style={{
            color: theme.textSecondary,
            fontFamily: theme.fontPrimary,
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          {phaseBody}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
          {candidates.map((candidate) => (
            <button
              type="button"
              key={candidate.id}
              onClick={candidate.onSelect}
              style={{
                textAlign: 'left',
                padding: 16,
                borderRadius: 18,
                border: `1px solid ${candidate.active ? withOpacity(theme.accent, 0.24) : withOpacity(theme.textPrimary, 0.05)}`,
                background: candidate.active ? withOpacity(theme.accent, 0.11) : withOpacity(theme.textPrimary, 0.03),
                cursor: 'pointer',
                color: theme.textPrimary,
              }}
            >
              <div
                style={{
                  fontFamily: theme.fontMono,
                  fontSize: 9,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  opacity: 0.24,
                  marginBottom: 8,
                }}
              >
                {candidate.overline}
              </div>
              <div
                style={{
                  fontFamily: theme.fontSecondary,
                  fontSize: 18,
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                  opacity: 0.86,
                  marginBottom: 10,
                }}
              >
                {candidate.title}
              </div>
              <div
                style={{
                  fontFamily: theme.fontPrimary,
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: theme.textSecondary,
                }}
              >
                {candidate.body}
              </div>
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          <div
            style={{
              fontFamily: theme.fontMono,
              fontSize: 10,
              opacity: 0.22,
              color: theme.textPrimary,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}
          >
            page
          </div>
          <textarea
            value={entryDraft}
            onChange={(event) => onEntryDraftChange(event.target.value)}
            placeholder={entryPlaceholder}
            style={{
              width: '100%',
              minHeight: 188,
              padding: '18px 18px 20px',
              borderRadius: 20,
              border: `1px solid ${withOpacity(theme.textPrimary, 0.08)}`,
              background: `linear-gradient(180deg, ${withOpacity(theme.textPrimary, 0.04)} 0%, ${withOpacity(theme.textPrimary, 0.02)} 100%)`,
              color: theme.textPrimary,
              fontFamily: theme.fontSecondary,
              fontSize: 18,
              lineHeight: 1.55,
              letterSpacing: '-0.01em',
              resize: 'vertical',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <TalkActionButton theme={theme} onClick={onSeal} disabled={!canSeal}>
              seal into thread
            </TalkActionButton>
            <TalkActionButton theme={theme} onClick={onRest} disabled={isResting}>
              rest the room
            </TalkActionButton>
            <TalkActionButton theme={theme} onClick={onReset}>
              reset corridor
            </TalkActionButton>
          </div>
        </div>
      </div>
    </TalkPanel>
  );
}

export function TalkResponseMatrixPanel({
  theme,
  title,
  moveOptions,
  family,
  notes = [],
  primaryActions = [],
  secondaryActions = [],
}: TalkResponseMatrixPanelProps) {
  return (
    <TalkPanel eyebrow="response matrix" title={title} theme={theme}>
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {moveOptions.map((move) => (
            <TalkActionButton
              key={move.id}
              theme={theme}
              active={move.active}
              onClick={move.onSelect}
            >
              {move.label}
            </TalkActionButton>
          ))}
        </div>

        {family ? (
          <div
            style={{
              borderRadius: 20,
              border: `1px solid ${withOpacity(theme.accent, 0.18)}`,
              background: withOpacity(theme.accent, 0.08),
              padding: 18,
              display: 'grid',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <TalkPill theme={theme} active>
                {family.move}
              </TalkPill>
              <TalkPill theme={theme}>{family.voiceFamily}</TalkPill>
              <TalkPill theme={theme}>{family.safetyBand}</TalkPill>
              {family.routeTarget ? <TalkPill theme={theme}>{family.routeTarget}</TalkPill> : null}
            </div>
            <div
              style={{
                fontFamily: theme.fontSecondary,
                fontSize: 24,
                lineHeight: 1.32,
                letterSpacing: '-0.02em',
                color: theme.textPrimary,
                opacity: 0.9,
              }}
            >
              {family.copy}
            </div>
            {family.optionalPrompt ? (
              <div
                style={{
                  fontFamily: theme.fontPrimary,
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: theme.textSecondary,
                }}
              >
                Optional prompt: {family.optionalPrompt}
              </div>
            ) : null}
            {family.editorialNotes ? (
              <div
                style={{
                  fontFamily: theme.fontPrimary,
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: resolveTextTertiary(theme),
                }}
              >
                {family.editorialNotes}
              </div>
            ) : null}

            {family.runtimeBridgeLabel ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <TalkPill theme={theme} active>
                  {family.runtimeBridgeLabel}
                </TalkPill>
                {primaryActions.map((action) => (
                  <TalkActionButton
                    key={action.id}
                    theme={theme}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    active={action.active}
                  >
                    {action.label}
                  </TalkActionButton>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div
            style={{
              fontFamily: theme.fontPrimary,
              fontSize: 13,
              color: theme.textSecondary,
              lineHeight: 1.55,
            }}
          >
            No approved family fits this turn. That is a governance signal, not a prompt to improvise.
          </div>
        )}

        {notes.length > 0 ? (
          <div style={{ display: 'grid', gap: 8 }}>
            {notes.map((note) => (
              <div
                key={note}
                style={{
                  fontFamily: theme.fontPrimary,
                  fontSize: 12,
                  color: resolveTextTertiary(theme),
                }}
              >
                {note}
              </div>
            ))}
          </div>
        ) : null}

        {secondaryActions.length > 0 ? (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {secondaryActions.map((action) => (
              <TalkActionButton
                key={action.id}
                theme={theme}
                onClick={action.onClick}
                disabled={action.disabled}
                active={action.active}
              >
                {action.label}
              </TalkActionButton>
            ))}
          </div>
        ) : null}
      </div>
    </TalkPanel>
  );
}

export function TalkThreadTopologyPanel({
  theme,
  title,
  summary,
  entries,
  stableNodes,
}: TalkThreadTopologyPanelProps) {
  return (
    <TalkPanel eyebrow="thread topology" title={title} theme={theme}>
      <div style={{ display: 'grid', gap: 14 }}>
        <div
          style={{
            fontFamily: theme.fontPrimary,
            fontSize: 13,
            color: theme.textSecondary,
            lineHeight: 1.55,
          }}
        >
          {summary}
        </div>

        {entries.length > 0 ? (
          <>
            <div style={{ display: 'grid', gap: 8 }}>
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    borderRadius: 16,
                    background: withOpacity(theme.textPrimary, 0.03),
                    border: `1px solid ${withOpacity(theme.textPrimary, 0.05)}`,
                    padding: 14,
                    display: 'grid',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <TalkPill theme={theme}>{entry.lane}</TalkPill>
                    <TalkPill theme={theme}>{entry.orientation}</TalkPill>
                    {entry.routeTarget ? <TalkPill theme={theme}>{entry.routeTarget}</TalkPill> : null}
                  </div>
                  <div
                    style={{
                      fontFamily: theme.fontSecondary,
                      fontSize: 16,
                      lineHeight: 1.35,
                      letterSpacing: '-0.015em',
                      color: theme.textPrimary,
                      opacity: 0.82,
                    }}
                  >
                    {entry.title}
                  </div>
                  <div
                    style={{
                      fontFamily: theme.fontPrimary,
                      fontSize: 12,
                      lineHeight: 1.5,
                      color: theme.textSecondary,
                    }}
                  >
                    {entry.excerpt}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <div
                style={{
                  fontFamily: theme.fontMono,
                  fontSize: 9,
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: theme.textPrimary,
                  opacity: 0.22,
                }}
              >
                stable nodes
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {stableNodes.map((node) => (
                  <TalkPill key={node.id} theme={theme} active={node.active}>
                    {node.label}
                  </TalkPill>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </TalkPanel>
  );
}

export function TalkDeviceScreen({
  theme,
  phase = 'arriving',
  phaseTitle,
  candidateTitle,
  candidateBody,
  entryText,
  responseLine,
  dispatchTitle,
  dispatchRoute,
  opener = 'something is here',
  preamble = null,
  promptOptions = [],
  inputModes = [],
}: TalkDeviceScreenProps) {
  const showPromptCeremony = phase === 'prompting' && promptOptions.length > 0;
  const showGateway = phase === 'writing' && inputModes.length > 0;
  const pageMinHeight = showGateway ? 208 : 260;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(180deg, ${theme.surfaceBase} 0%, ${withOpacity(theme.accent, 0.08)} 100%)`,
        color: theme.textPrimary,
        padding: '58px 22px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          style={{
            fontFamily: theme.fontMono,
            fontSize: 9,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            opacity: 0.24,
          }}
        >
          talk corridor
        </div>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: theme.accent,
            boxShadow: `0 0 12px ${withOpacity(theme.accent, 0.5)}`,
          }}
        />
      </div>

      {showPromptCeremony ? (
        <div
          style={{
            flex: 1,
            borderRadius: 28,
            border: `1px solid ${withOpacity(theme.textPrimary, 0.04)}`,
            background: `radial-gradient(circle at 50% 16%, ${withOpacity(theme.accent, 0.08)} 0%, ${withOpacity(theme.textPrimary, 0.025)} 34%, transparent 74%)`,
            padding: '18px 14px 22px',
            overflow: 'hidden',
          }}
        >
          <TalkPromptCeremony
            theme={theme}
            opener={opener}
            preamble={preamble}
            options={promptOptions}
          />
        </div>
      ) : (
        <div
          style={{
            borderRadius: 22,
            border: `1px solid ${withOpacity(theme.textPrimary, 0.06)}`,
            background: withOpacity(theme.textPrimary, 0.04),
            padding: '16px 16px 18px',
            display: 'grid',
            gap: 10,
          }}
        >
          <div
            style={{
              fontFamily: theme.fontMono,
              fontSize: 8,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              opacity: 0.22,
            }}
          >
            {phaseTitle}
          </div>
          <div
            style={{
              fontFamily: theme.fontSecondary,
              fontSize: 16,
              lineHeight: 1.4,
              letterSpacing: '-0.01em',
              opacity: 0.88,
            }}
          >
            {candidateTitle}
          </div>
          <div
            style={{
              fontFamily: theme.fontPrimary,
              fontSize: 12,
              lineHeight: 1.55,
              color: theme.textSecondary,
            }}
          >
            {candidateBody}
          </div>
        </div>
      )}

      <div
        style={{
          flex: showPromptCeremony ? 0 : 1,
          minHeight: pageMinHeight,
          borderRadius: 26,
          border: `1px solid ${withOpacity(theme.textPrimary, 0.05)}`,
          background: `linear-gradient(180deg, ${withOpacity(theme.textPrimary, 0.045)} 0%, ${withOpacity(theme.textPrimary, 0.02)} 100%)`,
          padding: '18px 18px 22px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 18,
        }}
      >
        <div
          style={{
            fontFamily: theme.fontSecondary,
            fontSize: 18,
            lineHeight: 1.45,
            letterSpacing: '-0.012em',
            opacity: 0.88,
          }}
        >
          {entryText}
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {showGateway ? (
            <TalkInputGateway theme={theme} options={inputModes} />
          ) : null}
          {responseLine ? (
            <div
              style={{
                fontFamily: theme.fontPrimary,
                fontSize: 12,
                lineHeight: 1.5,
                color: theme.textSecondary,
              }}
            >
              {responseLine}
            </div>
          ) : null}
          {dispatchTitle && dispatchRoute ? (
            <div
              style={{
                borderRadius: 16,
                background: withOpacity(theme.accent, 0.08),
                border: `1px solid ${withOpacity(theme.accent, 0.16)}`,
                padding: '10px 12px',
              }}
            >
              <div
                style={{
                  fontFamily: theme.fontMono,
                  fontSize: 8,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  opacity: 0.24,
                  marginBottom: 6,
                }}
              >
                routed
              </div>
              <div
                style={{
                  fontFamily: theme.fontPrimary,
                  fontSize: 12,
                  lineHeight: 1.45,
                  color: theme.textSecondary,
                }}
              >
                {dispatchTitle} {'->'} {dispatchRoute}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
