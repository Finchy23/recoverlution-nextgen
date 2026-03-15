import { CHAPTERS } from '../surfaces/know-taxonomy';
import { SEEK_INSIGHTS } from '../seek/seek-insights';

export interface NeuralCluster {
  id: string;
  name: string;
  hardware: string;
  whisper: string;
  tags: string[];
  color: string;
  chapterWord: string;
}

export interface MindblockDot {
  id: string;
  label: string;
  schema: string;
  integration: number;
  offsetX: number;
  offsetY: number;
  radius: number;
  depth: number;
  sessions: number;
  phase: number;
}

export const CLUSTERS: NeuralCluster[] = [
  {
    id: 'emotional-regulation',
    name: 'Emotional Regulation',
    hardware: 'Prefrontal Cortex',
    whisper: 'Creating the quiet space between a heavy feeling and your reaction',
    tags: ['Self Awareness', 'Impulse Control', 'Window of Tolerance'],
    color: '#A8B5FF',
    chapterWord: 'CALM',
  },
  {
    id: 'stress-resilience',
    name: 'Stress Resilience',
    hardware: 'HPA Axis · Vagal Tone',
    whisper: 'Teaching your nervous system that it is safe to finally rest',
    tags: ['Nervous System', 'Vagal Tone', 'Stress Response'],
    color: '#80C8A0',
    chapterWord: 'ROOT',
  },
  {
    id: 'social-connectivity',
    name: 'Social Connectivity',
    hardware: 'Mirror Neuron System',
    whisper: 'Rebuilding the quiet bridges between yourself and the people around you',
    tags: ['Healthy Boundaries', 'Trust Building', 'Social Support'],
    color: '#FF8EC4',
    chapterWord: 'BOND',
  },
  {
    id: 'cognitive-reframing',
    name: 'Cognitive Reframing',
    hardware: 'Default Mode Network',
    whisper: 'Changing the lens on the heavy stories your mind is telling you',
    tags: ['Thought Patterns', 'Mental Flexibility', 'Perspective Shift'],
    color: '#FFB088',
    chapterWord: 'WIRE',
  },
  {
    id: 'identity-integration',
    name: 'Identity Integration',
    hardware: 'Medial Prefrontal Cortex',
    whisper: 'Remembering who you actually are underneath the noise of the panic',
    tags: ['Self Narrative', 'Core Values', 'Recovery Identity'],
    color: '#B8A0FF',
    chapterWord: 'SELF',
  },
  {
    id: 'decision-mastery',
    name: 'Decision Mastery',
    hardware: 'Anterior Cingulate Cortex',
    whisper: 'Finding the quiet, internal strength to choose what you actually want',
    tags: ['Executive Function', 'Values Alignment', 'Delayed Gratification'],
    color: '#2FE6A6',
    chapterWord: 'EDGE',
  },
];

function seedRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function buildClusterDots(
  cluster: NeuralCluster,
  kbeData: Map<string, { knowing: number; believing: number; sessions: number }>,
  userInsights: any[],
): MindblockDot[] {
  const dots: MindblockDot[] = [];
  const rng = seedRandom(
    cluster.id.charCodeAt(0) * 31 + cluster.id.charCodeAt(1) * 7 + cluster.id.length * 13,
  );

  const chapterInsights = SEEK_INSIGHTS.filter((insight) => {
    const map: Record<string, string> = {
      'inner-critic': 'SELF',
      enmeshment: 'EDGE',
    };
    const mapped = map[insight.id];
    if (mapped) return mapped === cluster.chapterWord;
    const idx = SEEK_INSIGHTS.indexOf(insight);
    return CHAPTERS[idx % CHAPTERS.length]?.word === cluster.chapterWord;
  });

  const dotCount = Math.max(7, chapterInsights.length + 3);
  const goldenAngle = (137.5 * Math.PI) / 180;

  for (let i = 0; i < dotCount; i += 1) {
    const insight = chapterInsights[i];
    const kbe = insight ? kbeData.get(insight.id) : undefined;

    const knowing = kbe?.knowing || 0;
    const believing = kbe?.believing || 0;
    const sessions = kbe?.sessions || 0;
    const integration = insight
      ? knowing * 0.3 + believing * 0.5 + Math.min(sessions / 10, 1) * 0.2
      : rng() * 0.1;

    const angle = i * goldenAngle + (rng() - 0.5) * 0.6;
    const minR = 14;
    const maxR = 68;
    const r = minR + rng() * (maxR - minR);

    dots.push({
      id: insight?.id || `${cluster.id}-ambient-${i}`,
      label: insight?.title || '',
      schema: insight?.schema || '',
      integration,
      offsetX: Math.cos(angle) * r,
      offsetY: Math.sin(angle) * r,
      radius: 1.5 + rng() * 2.5 + (integration > 0.3 ? 1.2 : 0),
      depth: 0.2 + rng() * 0.8,
      sessions,
      phase: rng() * Math.PI * 2,
    });
  }

  const laneMap: Record<string, string> = {
    pattern: 'WIRE',
    origin: 'ROOT',
    relationship: 'BOND',
    body: 'CALM',
    fear: 'EDGE',
    desire: 'SELF',
  };

  userInsights.forEach((rawInsight, idx) => {
    const insight = rawInsight.value || rawInsight;
    if (!insight?.id) return;
    if (laneMap[insight.lane] !== cluster.chapterWord) return;
    if (dots.find((dot) => dot.id === insight.id)) return;

    const angle = (dotCount + idx) * goldenAngle + rng() * 0.3;
    const r = 20 + rng() * 40;

    dots.push({
      id: insight.id,
      label: insight.title || insight.name || '',
      schema: insight.schema || insight.description || '',
      integration: (insight.intensity || 0) * 0.3,
      offsetX: Math.cos(angle) * r,
      offsetY: Math.sin(angle) * r,
      radius: 2.5 + rng() * 1.5,
      depth: 0.4 + rng() * 0.5,
      sessions: 1,
      phase: rng() * Math.PI * 2,
    });
  });

  return dots;
}
