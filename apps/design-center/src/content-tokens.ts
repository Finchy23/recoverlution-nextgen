/**
 * CONTENT TOKEN SYSTEM
 * 
 * Centralized content management for the RecoveryOS homepage
 * All copy, scene data, navigation elements, and component configurations
 */

import { colors } from '@/design-tokens';
import type { LucideIcon } from 'lucide-react';
import type { AtomId } from '@/app/components/atoms/types';
import type {
  BreathPatternId,
  ChronoContext,
  ColorSignatureId,
  EntranceArchitectureId,
  ExitTransitionId,
  HeatBand,
  NarrativeDensity,
  ResponseProfileId,
  SchemaTarget,
  VisualEngineId,
  VoiceLaneId,
} from '@/navicue-types';
import { 
  Activity, GitBranch, Zap, Lock, Eye, Compass, Target, Shield, Brain, Gauge, Repeat, CheckCircle2,
  Calendar, Heart, Package, Music, Navigation, TrendingUp, Users, Flame, Layers,
  Radio, BookOpen, MousePointer, Settings, MessageSquare
} from 'lucide-react';

// ==========================================
// TYPES
// ==========================================

export interface NavLink {
  href: string;
  label: string;
}

export interface HeroContent {
  eyebrow: string;
  headline: string | React.ReactNode;
  subheadline: string;
  backgroundAsset: {
    name: string;
    variant: string;
    theme: 'light' | 'dark';
  };
}

export interface BridgeContent {
  eyebrow: string;
  headline: string;
  subtext: string;
  theme: 'purple' | 'green' | 'amber' | 'cyan' | 'neutral';
}

export interface ReelScene {
  id: number;
  eyebrow: string;
  headline: string;
  subheadline: string;
  body: string;
  assetFamily: string;
  assetVariant: string;
  assetMode: 'light' | 'dark';
}

export interface Phase {
  id: string;
  letter: string;
  title: string;
  tagline: string;
  features: string[];
  featureIcons: Array<typeof Eye>;
  watermark: string;
  closer: string;
  actions: string[];
  color: string;
  icon: LucideIcon;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface SubFeature {
  name: string;
  description: string;
}

export interface OperatingTruthFeature {
  id: number;
  shortName: string;
  icon: LucideIcon;
  layer: string;
  name: string;
  label: string;
  promise: string;
  whyItMatters: string;
  subFeatures: SubFeature[];
  accentColor: string;
  backgroundAsset: {
    collection: string;
    name: string;
    variant: 'light' | 'dark';
  };
}

export interface OperatingTruthGridItem {
  id: string;
  featureId: number;
  size: 'large' | 'small';
  expandable?: boolean;
}

export interface OperatingTruthExperienceScene {
  id: string;
  phase: 'experience' | 'recognize' | 'align';
  eyebrow: string;
  title: string;
  body: string;
  receipt: string;
  remapLabel: string;
  featureIds: number[];
  activeLayerIds: number[];
  atomId: AtomId;
  schemaTarget: SchemaTarget;
  heatBand: HeatBand;
  chronoContext: ChronoContext;
  colorSignature: ColorSignatureId;
  visualEngine: VisualEngineId;
  responseProfile: ResponseProfileId;
  breathPattern: BreathPatternId;
  voiceLane: VoiceLaneId;
  entrance: EntranceArchitectureId;
  exit: ExitTransitionId;
  narrativeDensity: NarrativeDensity;
}

export interface Altitude {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  icon: LucideIcon;
}

export interface SentientPrinciple {
  id: number;
  title: string;
  statement: string;
  supporting: string;
  proof: string;
  color: string;
  icon: LucideIcon;
  assetFamily: string;
  assetVariant: string;
  assetMode: 'light' | 'dark';
}

export interface FooterLink {
  href: string;
  label: string;
}

export interface ClinicalLayer {
  id: number;
  name: string;
  tag: string;
  tagline: string;
  question: string;
  contents: string[];
  color: string;
  icon: LucideIcon;
}

export interface Vertebra {
  id: string;
  name: string;
  displayName: string;
  subtitle: string;
  description: string;
  layerIds: number[];
  color: string;
  motionPattern: 'helix' | 'network' | 'orbit';
}

// ==========================================
// 1. NAVIGATION CONTENT
// ==========================================

export const navigation = {
  logoUrl: 'https://wzeqlkbmqxlsjryidagf.supabase.co/storage/v1/object/public/marketing-assets/Logo/wide/svg/recoverlution_logo_wide_light.svg',
  logoText: 'RecoveryOS',
  links: [
    { href: '/design-center', label: 'Design Center' },
    { href: '/atoms', label: 'Atoms' },
    { href: '/player', label: 'Player' },
    { href: '/showcase', label: 'Showcase' },
  ] as NavLink[],
  startButton: {
    label: 'Start',
  },
} as const;

// ==========================================
// 2. HERO SECTION
// ==========================================

export const hero: HeroContent = {
  eyebrow: 'neuroadaptiveOS',
  headline: 'Recovery. Redefined.',
  subheadline: 'a living operating system for lasting change',
  backgroundAsset: {
    name: 'neuralflower',
    variant: 'plasticity',
    theme: 'light',
  },
} as const;

// ==========================================
// 3. BRIDGE SECTIONS
// ==========================================

export const bridges = {
  installation: {
    eyebrow: 'THE INSTALLATION',
    headline: 'New default',
    subtext: 'Change holds when it can be run.',
    theme: 'purple',
  } as BridgeContent,

  deliverySystem: {
    eyebrow: 'the delivery system',
    headline: 'Neuroadaptive precision',
    subtext: 'New pathways wire through lived experience',
    theme: 'green',
  } as BridgeContent,

  framework: {
    eyebrow: 'the framework',
    headline: 'Nervous system',
    subtext: 'One prediction. One heat band. One primitive.',
    theme: 'purple',
  } as BridgeContent,

  operatingTruth: {
    eyebrow: 'A new default',
    headline: 'Operating truth',
    subtext: 'When life gets hard, we get simple.',
    theme: 'green',
  } as BridgeContent,

  threeAltitudes: {
    eyebrow: 'symbiotic synchronicity',
    headline: 'Three altitudes',
    subtext: "because recovery doesn't live in one place",
    theme: 'purple',
  } as BridgeContent,

  alwaysRunning: {
    eyebrow: 'the operating loop',
    headline: 'Always running',
    subtext: 'designed to transfer, built to hold',
    theme: 'green',
  } as BridgeContent,

  sentientBaseline: {
    eyebrow: 'ONE TRUTH',
    headline: 'Sentient baseline',
    subtext: 'Continuity you can stand behind',
    theme: 'amber',
  } as BridgeContent,
} as const;

// ==========================================
// 4. REEL SCROLLYTELLING SCENES
// ==========================================

export const reelScenes: ReelScene[] = [
  { id: 0, eyebrow: 'IN THE MOMENTS THAT MATTER', headline: 'Recovery slips', subheadline: 'or strengthens', body: 'Good intentions. Good sessions. Good care.', assetFamily: 'evolvingforms', assetVariant: 'realign', assetMode: 'light' },
  { id: 1, eyebrow: 'WHEN LIFE DISRUPTS THE PLAN', headline: 'and creates', subheadline: 'the gap', body: 'Intent is quiet. Stress is loud. The moment decides.', assetFamily: 'evolvingforms', assetVariant: 'synconicity', assetMode: 'light' },
  { id: 2, eyebrow: 'UNDER HEAT, THE BRAIN DEFAULTS', headline: 'Biology', subheadline: '+ neuroscience', body: 'Old paths fire. Choice comes later.', assetFamily: 'evolvingforms', assetVariant: 'regrowth', assetMode: 'light' },
  { id: 3, eyebrow: 'OUR LEARNED NEURAL PATHWAYS', headline: 'patterns repeat', subheadline: 'until rewired', body: 'Change is cognitive. Continuity builds certainty.', assetFamily: 'flowstate', assetVariant: 'transition', assetMode: 'dark' },
  { id: 4, eyebrow: 'SO WE MAKE RECOVERY RUNNABLE', headline: 'a cognitive', subheadline: 'change engine', body: 'That runs all day. For you. With you.', assetFamily: 'flowstate', assetVariant: 'blossoming', assetMode: 'light' },
  { id: 5, eyebrow: 'TRUSTED CONTINUITY, BY DEFAULT', headline: 'next moment', subheadline: 'your move', body: 'Your window. We place the step', assetFamily: 'evolvingforms', assetVariant: 'skypattern', assetMode: 'light' },
  { id: 6, eyebrow: 'DOWNLOADED IN REAL TIME', headline: 'thousands of', subheadline: 'tiny rewires', body: 'Until behaviour feels like you.', assetFamily: 'mindblock', assetVariant: 'dynamic', assetMode: 'light' },
];

// ==========================================
// 5. FOUR PHASES
// ==========================================

export const phases: Phase[] = [
  { id: 'sense', letter: 'N', title: 'NOTICE / Sense', tagline: 'Opens the window', features: ['Heat', 'Friction', 'Noise', 'Time'], featureIcons: [Eye, Gauge, Shield], watermark: 'NOTICE', closer: 'Experience opens the window.', actions: ['recognise', 'learn', 'name'], color: colors.accent.cyan.primary, icon: Activity, position: 'top-left' },
  { id: 'map', letter: 'E', title: 'EMBRACE / Map', tagline: 'Aligns to you', features: ['Right move', 'Right dose', 'Right prediction', 'Right timing'], featureIcons: [Compass, Brain, Target], watermark: 'EMBRACE', closer: 'Recognition creates choice in real time.', actions: ['test', 'reframe', 'integrate'], color: colors.brand.purple.light, icon: GitBranch, position: 'top-right' },
  { id: 'deliver', letter: 'S', title: 'SHIFT / Deliver', tagline: 'Runs the move', features: ['JOURNEY / baseline builds', 'NAVICUE / moment moves', 'SOUNDBITE / identity sparks', 'STUDIO / state rituals'], featureIcons: [Target, Repeat, Eye], watermark: 'SHIFT', closer: 'Alignment repeats until reflex.', actions: ['act', 'transfer', 'prove'], color: colors.status.amber.bright, icon: Zap, position: 'bottom-right' },
  { id: 'seal', letter: 'B', title: 'BECOME / Seal', tagline: 'Holds in real life', features: ['Install', 'Save', 'Replay', 'Reload'], featureIcons: [Repeat, Shield, Brain], watermark: 'BECOME', closer: 'Proof consolidates the new pathway.', actions: ['cognitive shift', 'identity integration'], color: colors.status.green.bright, icon: Lock, position: 'bottom-left' },
];

// ==========================================
// 6. OPERATING TRUTH FEATURES
// ==========================================

export const operatingTruthFeatures: OperatingTruthFeature[] = [
  { id: 1, shortName: 'JOURNEYS', icon: Calendar, layer: 'The Baseline Layer', name: 'Journeys', label: 'architecture of becoming', promise: 'Weekly experiential chapters that move change off the screen and into life.', whyItMatters: 'The system needs lived repetition, not abstract intention.', subFeatures: [{ name: 'Experience', description: 'Catch the pull in real time.' }, { name: 'Recognize', description: 'Look under the reflex without judgment.' }, { name: 'Align', description: 'Run a new variable in the wild.' }, { name: 'Anchor', description: 'Stack one more straw of proof.' }], accentColor: colors.accent.blue.primary, backgroundAsset: { collection: 'evolvingforms', name: 'skypattern', variant: 'light' } },
  { id: 2, shortName: 'NAVICUES', icon: Compass, layer: 'The Moment Layer', name: 'NaviCues', label: 'physics of feeling', promise: 'Apple-grade therapeutic ceremonies that let the body solve the moment before story takes over.', whyItMatters: 'Fast regulation needs friction, light, breath, and agency on the glass.', subFeatures: [{ name: 'Living Atmosphere', description: 'The screen breathes before the words arrive.' }, { name: 'Narrative Canopy', description: 'The guide appears only as long as it helps.' }, { name: 'Hero Physics', description: 'The mindblock becomes something you can move.' }, { name: 'Threshold Morph', description: 'Resolution becomes a felt identity shift.' }], accentColor: colors.status.amber.bright, backgroundAsset: { collection: 'mindblock', name: 'integration', variant: 'light' } },
  { id: 3, shortName: 'STUDIO', icon: Heart, layer: 'The Regulation Layer', name: 'Studio', label: 'cinematic sanctuary', promise: 'Poster-first, regulation-first film that arrives when the body needs a counterweight.', whyItMatters: 'The nervous system sets the ceiling for what the mind can absorb.', subFeatures: [{ name: 'Breathwork', description: 'Fast autonomic reset.' }, { name: 'Meditation', description: 'Stillness as architecture.' }, { name: 'Yoga', description: 'A somatic bridge into pace.' }, { name: 'Fitness', description: 'Kinetic cortisol release.' }, { name: 'Nourishment', description: 'Fuel as calm ritual.' }], accentColor: colors.status.green.mid, backgroundAsset: { collection: 'evolvingforms', name: 'transition', variant: 'light' } },
  { id: 4, shortName: 'PLAY', icon: Music, layer: 'The Identity Layer', name: 'Play', label: 'soundtrack of becoming', promise: 'Identity installation through rhythm, story, and beat-driven narrative.', whyItMatters: 'When the inner soundtrack changes, the day changes with it.', subFeatures: [{ name: 'Sparks', description: '10-second truth shots.' }, { name: 'Flames', description: 'Beat-led reframes for the live friction.' }, { name: 'Embers', description: 'Long-form therapeutic chapters.' }, { name: 'Beat Mode', description: 'Pure voice or a regulating mix.' }], accentColor: colors.status.amber.mid, backgroundAsset: { collection: 'evolvingforms', name: 'balance', variant: 'dark' } },
  { id: 5, shortName: 'TALK', icon: MessageSquare, layer: 'The Corridor Layer', name: 'Talk', label: 'guided corridor', promise: 'A bounded conversational corridor that listens deeply, maps the backstory, and leads to the next right move.', whyItMatters: 'People need to be received and then orchestrated forward, not trapped in endless chat.', subFeatures: [{ name: 'Unspooling', description: 'Drop the backstory safely.' }, { name: 'Reception', description: 'Hold the live storm without noise.' }, { name: 'Translation', description: 'Map the geometry behind the moment.' }, { name: 'Dynamic Prompt', description: 'Route into the next embodied move.' }], accentColor: colors.brand.purple.light, backgroundAsset: { collection: 'mindblock', name: 'skyline', variant: 'light' } },
  { id: 6, shortName: 'INSIGHTS', icon: TrendingUp, layer: 'The Pattern Layer', name: 'Insights', label: 'interactive documentary', promise: 'Scrollytelling documentaries that turn lifelong pain into visible, mechanical truth.', whyItMatters: 'The shame starts to break the moment the invisible becomes legible.', subFeatures: [{ name: 'Z-Axis Scroll', description: 'Descend into the root of the concept.' }, { name: 'Living Typography', description: 'Clinical truth staged with emotional weight.' }, { name: 'Morphing Atmosphere', description: 'The environment tells the story too.' }, { name: 'Somatic Anchors', description: 'The scroll stops until the body joins in.' }], accentColor: colors.status.green.bright, backgroundAsset: { collection: 'flowstate', name: 'blossoming', variant: 'light' } },
  { id: 7, shortName: 'READ', icon: BookOpen, layer: 'The Wisdom Layer', name: 'Read', label: 'the calm line', promise: 'An infinite book that blends premium reading, narration, and soft-breathing environments.', whyItMatters: 'The Knowing phase only lands when the nervous system can absorb it slowly.', subFeatures: [{ name: 'Read & Listen', description: 'Kindle meets Audible in one surface.' }, { name: 'Ambient Environment', description: 'No harsh white web pages.' }, { name: 'Infinite Thread', description: 'The next page is always context-aware.' }, { name: 'Calm Line', description: 'Pure knowledge without digital noise.' }], accentColor: colors.accent.cyan.light, backgroundAsset: { collection: 'mindblock', name: 'microspheres+defusion', variant: 'light' } },
  { id: 8, shortName: 'PRACTICES', icon: Target, layer: 'The Agency Layer', name: 'Practices', label: 'instruments of alchemy', promise: 'Portable somatic instruments that turn insight into action anywhere the body needs it.', whyItMatters: 'At some point the reading stops and the breath, posture, and motion have to take over.', subFeatures: [{ name: 'Somatic & Breath', description: 'Direct vagal regulation.' }, { name: 'Energetic & Spatial', description: 'Boundaries rendered through physics.' }, { name: 'Therapeutic & Cognitive', description: 'Clinical moves wrapped in poetry.' }, { name: 'Relational & Social', description: 'Embodied scripts for the real room.' }], accentColor: colors.accent.cyan.primary, backgroundAsset: { collection: 'neuralflower', name: 'blossom', variant: 'light' } },
  { id: 9, shortName: 'NAVIGATE', icon: Navigation, layer: 'The Infrastructure Layer', name: 'Navigate', label: 'symbiotic infrastructure', promise: 'A quiet operating spine that plugs into life, people, practitioners, and context without breaking flow.', whyItMatters: 'Healing has to travel across rooms, relationships, and real-world rhythms.', subFeatures: [{ name: 'Compass', description: 'A feed with purpose.' }, { name: 'Context', description: 'Calendar, sleep, wearables, and rhythm.' }, { name: 'Network', description: 'Safety as default.' }, { name: 'Shared Room', description: 'Clinical guidance carried into the day.' }], accentColor: colors.brand.purple.light, backgroundAsset: { collection: 'evolvingforms', name: 'convergence', variant: 'light' } },
  { id: 10, shortName: 'SIGNAL', icon: Radio, layer: 'The Proof Layer', name: 'Signal', label: 'architecture of proof', promise: 'Soft telemetry that watches Energy, Clarity, and Anchorage until identity has enough evidence to update.', whyItMatters: 'Belief is fragile. Proof is what survives the hard days.', subFeatures: [{ name: 'Soft Signals', description: 'Energy, Clarity, Anchorage.' }, { name: 'Micro-Receipt', description: 'Every real-world move becomes evidence.' }, { name: 'Boundaries', description: 'Consent, cadence, and quiet hours by default.' }, { name: 'Identity Update', description: 'The new pathway becomes the obvious truth.' }], accentColor: colors.status.green.bright, backgroundAsset: { collection: 'neuralflow', name: 'flourish', variant: 'light' } },
];

export const operatingTruthFinalCard = {
  eyebrow: 'ONE NERVOUS SYSTEM',
  headline: 'See the system.',
  subheadline: 'Runnable.',
  body: 'The 13-layer spine remaps as the glass proves how change actually transfers.',
  backgroundAsset: { collection: 'flowstate', name: 'accelerate', variant: 'light' as const },
};

export const operatingTruthExperienceScenes: OperatingTruthExperienceScene[] = [
  {
    id: 'experience',
    phase: 'experience',
    eyebrow: 'EXPERIENCE',
    title: 'Catch the pull before autopilot hardens.',
    body: 'Journeys open the corridor, Talk receives the weight, and Signal quietly notices the exact second the old pattern begins to wake up.',
    receipt: 'Experience opens the window.',
    remapLabel: 'Install reorganizes around the live signal.',
    featureIds: [1, 5, 10],
    activeLayerIds: [1, 2, 3, 4, 5],
    atomId: 'centrifuge-engine',
    schemaTarget: 'self-sacrifice',
    heatBand: 2,
    chronoContext: 'work',
    colorSignature: 'quiet-authority',
    visualEngine: 'gradient-mesh',
    responseProfile: 'witness',
    breathPattern: 'calm',
    voiceLane: 'mirror',
    entrance: 'the-gathering',
    exit: 'dissolve',
    narrativeDensity: 'core',
  },
  {
    id: 'recognize',
    phase: 'recognize',
    eyebrow: 'RECOGNIZE',
    title: 'Turn the invisible architecture into geometry.',
    body: 'NaviCues, Insights, and Read translate the human condition into something observable, movable, and finally believable on the glass.',
    receipt: 'Recognition creates choice in real time.',
    remapLabel: 'Run lights up the active geometry.',
    featureIds: [2, 6, 7],
    activeLayerIds: [3, 5, 6, 7, 10, 11],
    atomId: 'empathy-bridge',
    schemaTarget: 'abandonment',
    heatBand: 3,
    chronoContext: 'social',
    colorSignature: 'neural-reset',
    visualEngine: 'constellation',
    responseProfile: 'resonance',
    breathPattern: 'simple',
    voiceLane: 'companion',
    entrance: 'the-dissolution',
    exit: 'emerge',
    narrativeDensity: 'full',
  },
  {
    id: 'align',
    phase: 'align',
    eyebrow: 'ALIGN',
    title: 'Shrink the move until the body can run it.',
    body: 'Studio, Play, Practices, and Navigate orchestrate the next right move so the new response can actually survive contact with real life.',
    receipt: 'Alignment repeats until reflex.',
    remapLabel: 'Hold consolidates the receipt into memory.',
    featureIds: [3, 4, 8, 9],
    activeLayerIds: [6, 7, 8, 9, 11, 12, 13],
    atomId: 'micro-step-shrink',
    schemaTarget: 'unrelenting-standards',
    heatBand: 2,
    chronoContext: 'morning',
    colorSignature: 'verdant-calm',
    visualEngine: 'liquid-pool',
    responseProfile: 'immersion',
    breathPattern: 'energize',
    voiceLane: 'coach',
    entrance: 'the-emergence',
    exit: 'burn-in',
    narrativeDensity: 'minimal',
  },
];

export const operatingTruthGridItems: OperatingTruthGridItem[] = [
  { id: 'journeys', featureId: 1, size: 'large', expandable: true },
  { id: 'cues', featureId: 2, size: 'large' },
  { id: 'studio', featureId: 3, size: 'small' },
  { id: 'play', featureId: 4, size: 'small' },
  { id: 'talk', featureId: 5, size: 'small' },
  { id: 'insights', featureId: 6, size: 'small' },
  { id: 'read', featureId: 7, size: 'small' },
  { id: 'practices', featureId: 8, size: 'small' },
];

// ==========================================
// 7. THREE ALTITUDES
// ==========================================

export const threeAltitudes: Altitude[] = [
  { id: 'micro', title: 'Micro', subtitle: 'In-the-moment', description: 'When stress spikes, the system responds. Real-time navigation for the moments that matter.', color: colors.accent.cyan.primary, icon: Target },
  { id: 'meso', title: 'Meso', subtitle: 'Week-to-week', description: 'Journeys guide your rhythm. Small completions compound into lasting change.', color: colors.brand.purple.light, icon: Compass },
  { id: 'macro', title: 'Macro', subtitle: 'Over time', description: 'Your patterns shift. Your baseline updates. The operating truth rewrites.', color: colors.status.green.bright, icon: Layers },
];

export const threeAltitudesContent = {
  sectionTitle: 'Operating at three scales',
  sectionSubtitle: 'Your recovery moves at different speeds. So does the system.',
  backgroundAsset: { family: 'mindblock', variant: 'tower', mode: 'dark' as const },
};

// ==========================================
// 8. TARGET/BUILD/RECEIPT
// ==========================================

export const alwaysRunningContent = {
  sectionTitle: 'The Loop',
  sectionSubtitle: 'Always running. Built to transfer.',
  phases: [
    {
      id: 'target',
      title: 'Target',
      subtitle: 'The moment is the input.',
      description: 'The system locates the live gap between intent and action.',
      icon: Target,
      color: colors.accent.cyan.primary,
      items: [
        { text: 'Signal', icon: Radio },
        { text: 'Story', icon: BookOpen },
        { text: 'Rhythm', icon: Activity },
      ],
      nextTransition: 'the framework targets',
    },
    {
      id: 'build',
      title: 'Build',
      subtitle: 'The move is the output.',
      description: 'Micro-experiences lay the wire through repetition and friction.',
      icon: Zap,
      color: colors.status.amber.bright,
      items: [
        { text: 'Modalities', icon: Layers },
        { text: 'Interaction', icon: MousePointer },
        { text: 'Mechanics', icon: Settings },
      ],
      nextTransition: 'the engine delivers',
    },
    {
      id: 'receipt',
      title: 'Receipt',
      subtitle: 'The return is the transfer.',
      description: 'Real conditions prove the change and consolidate the update.',
      icon: Shield,
      color: colors.status.green.bright,
      items: [
        { text: 'Knowing', icon: Brain },
        { text: 'Believing', icon: Heart },
        { text: 'Embodying', icon: Zap },
      ],
      nextTransition: 'the mindblock updates',
    },
  ],
  backgroundAsset: { family: 'flowstate', variant: 'bloom', mode: 'light' as const },
};

// ==========================================
// 9. SENTIENT BASELINE
// ==========================================

export const sentientBaselinePrinciples: SentientPrinciple[] = [
  {
    id: 0,
    title: 'Autonomy',
    statement: 'Control stays with the person',
    supporting: 'Trust requires agency. Always.',
    proof: 'Trust is designed.',
    color: colors.status.amber.bright,
    icon: Shield,
    assetFamily: 'mindblock',
    assetVariant: 'integration',
    assetMode: 'light',
  },
  {
    id: 1,
    title: 'Infrastructure',
    statement: 'Consent. Cadence. Protocol.',
    supporting: 'Quietly holding the gaps.',
    proof: 'Proof is default.',
    color: colors.accent.cyan.primary,
    icon: Lock,
    assetFamily: 'neuralflow',
    assetVariant: 'flourish',
    assetMode: 'light',
  },
  {
    id: 2,
    title: 'Continuity',
    statement: 'A baseline you can stand behind',
    supporting: 'Because showing up builds certainty.',
    proof: 'Sentient by design.',
    color: colors.status.green.bright,
    icon: CheckCircle2,
    assetFamily: 'flowstate',
    assetVariant: 'blossoming',
    assetMode: 'light',
  },
];

export const sentientBaselineContent = {
  sectionTitle: 'Sentient Baseline',
  sectionSubtitle: 'A system that knows you. And grows with you.',
  closingStatement: 'This is recovery. Redefined.',
};

// ==========================================
// 10. FOOTER CONTENT
// ==========================================

export const footer = {
  legalLinks: [
    { href: '#privacy', label: 'Privacy' },
    { href: '#terms', label: 'Terms' },
    { href: '#cookies', label: 'Cookies' },
  ] as FooterLink[],
  copyright: {
    year: new Date().getFullYear(),
    company: 'RecoveryOS',
    text: (year: number, company: string) => `\u00A9 ${year} ${company}. All rights reserved.`,
  },
  socialLinks: [] as FooterLink[],
} as const;

// ==========================================
// 11. CLINICAL SPINE (13-Layer Framework)
// ==========================================

export const clinicalLayers: ClinicalLayer[] = [
  { id: 1, name: 'BASELINE', tag: 'source code', tagline: 'Before we personalise anything, we have to understand what\'s running.', question: 'What drives the defaults?', contents: ['survive', 'belong', 'avoid pain', 'seek reward', 'conserve energy'], color: colors.accent.blue.primary, icon: Layers },
  { id: 2, name: 'PILLARS', tag: 'architectural stability', tagline: 'Pillars keep the architecture stable.', question: 'Where in the human system are we building capacity?', contents: ['Emotional Regulation', 'Stress Resilience', 'Social Connectivity', 'Cognitive Reframing', 'Identity Integration', 'Decision Mastery'], color: colors.brand.purple.light, icon: Shield },
  { id: 3, name: 'CONCEPTS', tag: 'scientific reality', tagline: 'Concepts keep the science real.', question: 'What internal system are we changing?', contents: ['Arousal Regulation', 'Interoception & Affect Labeling', 'Attention & Orienting', 'Inhibitory Control', 'Reward & Time Horizon', 'Cognitive Defusion', 'Meaning & Values Orientation', 'Self-Compassion & Shame Soothing', 'Co-Regulation & Attachment Safety', 'Boundary Mechanics', 'Narrative Integration', 'Repair & Reconnection'], color: colors.accent.cyan.dark, icon: Brain },
  { id: 4, name: 'THEMES', tag: 'skills installation', tagline: 'Themes make it installable.', question: 'What do we practice repeatedly that produces change?', contents: ['Downshift Under Load', 'Name the Pattern', 'Create Choice Space', 'Urge Surf & Delay', 'Reframe in Motion', 'Values Anchor', 'Self-Compassion in Heat', 'Boundary Micro-Reps', 'Connection Micro-Acts', 'Repair the Moment', 'Proof Capture', 'Transfer Testing'], color: colors.status.green.mid, icon: Repeat },
  { id: 5, name: 'SCHEMA', tag: 'tuned understanding', tagline: 'Schemas make it specific.', question: 'Why does this keep happening, and what sequence rewires it?', contents: ['Recognition (K)', 'Belief Work (B)', 'Release (B/E)', 'Repair (E)'], color: colors.brand.purple.light, icon: GitBranch },
  { id: 6, name: 'MODALITIES', tag: 'evidence credibility', tagline: 'Modalities make it executable.', question: 'Which proven method best matches this targeted moment?', contents: ['IFS', 'ACT', 'DBT', 'CBT', 'Somatic Experiencing', 'Motivational Interviewing', 'EFT'], color: colors.status.amber.mid, icon: Activity },
  { id: 7, name: 'INTERACTIONS', tag: 'accessible execution', tagline: 'Interactions make it doable.', question: 'What can actually hold right now?', contents: ['Glance', 'Seed', 'Thread', 'Journey', '+ depth toggles'], color: colors.accent.cyan.primary, icon: Zap },
  { id: 8, name: 'SOMATICS', tag: 'regulation alignment', tagline: 'Somatics make it land.', question: 'What does the body need to shift before the mind can follow?', contents: ['breath', 'body scanning', 'grounding', 'discharge', 'nervous system state'], color: colors.status.amber.bright, icon: Heart },
  { id: 9, name: 'RELATIONAL REPAIRS', tag: 'restorative responsibility', tagline: 'Repair makes it stick.', question: 'What needs to be repaired for momentum to hold?', contents: ['rupture \u2192 repair', 'boundaries', 'amends', 'trust micro-tests', 'clean apology'], color: colors.brand.purple.light, icon: Users },
  { id: 10, name: 'CONTEMPLATIONS', tag: 'meaningful inquiry', tagline: 'Wisdom makes it true.', question: 'What perspective unlocks meaning and softens the old story?', contents: ['koans', 'council wisdom', 'parables', 'contemplative practices'], color: colors.accent.cyan.light, icon: Compass },
  { id: 11, name: 'PROOF', tag: 'recognizable returns', tagline: 'Proof makes it believable.', question: 'What receipt can we capture now so progress transfers?', contents: ['micro-wins', 'pre/post', 'vault', 'review', 'timeline'], color: colors.status.green.bright, icon: Eye },
  { id: 12, name: 'MECHANICS', tag: 'repeatable motion', tagline: 'Mechanics make it powerful.', question: 'What higher-order tool rewires the model, not just the moment?', contents: ['future-self', 'simulation', 'pattern interrupts', 'narrative edits'], color: colors.status.amber.dark, icon: Target },
  { id: 13, name: 'MINDBLOCKS', tag: 'neurological change', tagline: 'Mindblocks make it executable.', question: 'What is the smallest prediction we can rewrite, prove, and transfer into real life?', contents: ['When X, I predict Y \u2014 so I do Z.'], color: colors.status.green.dark, icon: Lock },
];

export const clinicalVertebrae: Vertebra[] = [
  {
    id: 'core',
    name: 'CORE',
    displayName: 'Install',
    subtitle: 'Operating Truth',
    description: 'Foundational architecture of change',
    layerIds: [1, 2, 3, 4, 5],
    color: colors.accent.blue.primary,
    motionPattern: 'helix',
  },
  {
    id: 'run',
    name: 'RUN',
    displayName: 'Run',
    subtitle: 'Cognition Engine',
    description: 'Active execution layer',
    layerIds: [6, 7, 8, 9],
    color: colors.status.amber.bright,
    motionPattern: 'network',
  },
  {
    id: 'memory',
    name: 'MEMORY',
    displayName: 'Hold',
    subtitle: 'Living Continuity',
    description: 'Integration and proof',
    layerIds: [10, 11, 12, 13],
    color: colors.status.green.bright,
    motionPattern: 'orbit',
  },
];

export const contentMetadata = {
  version: '1.0.0',
  lastUpdated: '2026-02-05',
  language: 'en-US',
  author: 'RecoveryOS Content Team',
  description: 'Centralized content token system for RecoveryOS homepage',
} as const;
