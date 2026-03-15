import { FORM_PRACTICES } from '../form/form-practices';
import { signal } from '../design-system/surface-tokens';

export interface Battery {
  id: string;
  label: string;
  color: string;
  value: number;
}

export interface PlotFormNudge {
  practice: string;
  reason: string;
  id: string;
}

export const DEFAULT_BATTERIES: Battery[] = [
  { id: 'energy', label: 'ENERGY', color: signal.energy, value: 0.5 },
  { id: 'clarity', label: 'CLARITY', color: signal.clarity, value: 0.5 },
  { id: 'balance', label: 'BALANCE', color: signal.anchor, value: 0.5 },
];

const WHISPERS: Record<string, { at: number; text: string }[]> = {
  energy: [
    { at: 0, text: 'The tank is empty' },
    { at: 0.08, text: 'Running on reserves' },
    { at: 0.22, text: 'Some fuel remaining' },
    { at: 0.38, text: 'A steady supply' },
    { at: 0.55, text: 'Well fueled' },
    { at: 0.75, text: 'Fully charged' },
  ],
  clarity: [
    { at: 0, text: 'Deep in the fog' },
    { at: 0.08, text: 'Signal is faint' },
    { at: 0.22, text: 'Shapes beginning to form' },
    { at: 0.38, text: 'The view is clearing' },
    { at: 0.55, text: 'Sharp signal' },
    { at: 0.75, text: 'Crystal clear' },
  ],
  balance: [
    { at: 0, text: 'The ground is shifting' },
    { at: 0.08, text: 'Searching for footing' },
    { at: 0.22, text: 'Some steadiness returning' },
    { at: 0.38, text: 'Finding center' },
    { at: 0.55, text: 'Well anchored' },
    { at: 0.75, text: 'Deeply rooted' },
  ],
};

export function getPlotWhisper(id: string, value: number): string {
  const whispers = WHISPERS[id];
  if (!whispers) return '';

  let result = whispers[0].text;
  for (const whisper of whispers) {
    if (value >= whisper.at) {
      result = whisper.text;
    }
  }
  return result;
}

export function recommendPlotNudge(batteries: Battery[]): PlotFormNudge | null {
  const critical = batteries.find((battery) => battery.value < 0.2);
  if (!critical) return null;

  const map: Record<string, { pillar: string; reason: string }> = {
    clarity: {
      pillar: 'rewire',
      reason: 'The fog is heavy. Defusion may create some clearing.',
    },
    energy: {
      pillar: 'bridge',
      reason: 'The reserves are low. Rhythm can carry what effort cannot.',
    },
    balance: {
      pillar: 'baseline',
      reason: 'The ground feels distant. The body can become the anchor.',
    },
  };

  const suggestion = map[critical.id];
  if (!suggestion) return null;

  const matched = FORM_PRACTICES.find((practice) => practice.pillar === suggestion.pillar);
  if (!matched) return null;

  return {
    practice: matched.name,
    reason: suggestion.reason,
    id: matched.id,
  };
}
