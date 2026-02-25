/**
 * CONTENT TOKEN SYSTEM
 * 
 * Centralized content management for the RecoveryOS homepage
 * All copy, scene data, navigation elements, and component configurations
 * 
 * Design Philosophy:
 * - Nothing is hardcoded - everything pulls from here
 * - Single source of truth for all content
 * - Easy to update, maintain, and translate
 * - Type-safe with TypeScript
 * - Organized by section and component
 * 
 * Structure:
 * 1. Navigation Content
 * 2. Hero Section
 * 3. Bridge Sections
 * 4. Reel Scrollytelling Scenes
 * 5. Four Phases (NOTICE → EMBRACE → SHIFT → BECOME)
 * 6. Operating Truth Features
 * 7. Three Altitudes
 * 8. Target/Build/Receipt
 * 9. Sentient Baseline
 * 10. Footer Content
 * 11. Clinical Spine (13-Layer Framework)
 */

import { colors } from '@/design-tokens';
import type { LucideIcon } from 'lucide-react';
import { 
  Activity, GitBranch, Zap, Lock, Eye, Compass, Target, Shield, Brain, Gauge, Repeat,
  Calendar, Heart, Package, Music, Navigation, TrendingUp, Users, Flame, Layers
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

export interface Altitude {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  icon: LucideIcon;
}

export interface SentientPrinciple {
  title: string;
  description: string;
  icon: LucideIcon;
  assetFamily: string;
  assetVariant: string;
  assetMode: 'light' | 'dark';
}

export interface FooterLink {
  href: string;
  label: string;
}

// The 13 layers organized into 3 vertebrae
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
  description: string;
  layerIds: number[];
  color: string;
}

// ==========================================
// 1. NAVIGATION CONTENT
// ==========================================

export const navigation = {
  logoUrl: 'https://wzeqlkbmqxlsjryidagf.supabase.co/storage/v1/object/public/marketing-assets/Logo/wide/svg/recoverlution_logo_wide_light.svg',
  logoText: 'RecoveryOS',
  links: [
    { href: '/command-center', label: 'Command Center' },
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
  
  // Removed old clinicalSpine bridge - replaced by framework bridge above
  
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
  {
    id: 0,
    eyebrow: 'IN THE MOMENTS THAT MATTER',
    headline: 'Recovery slips',
    subheadline: 'or strengthens',
    body: 'Good intentions. Good sessions. Good care.',
    assetFamily: 'evolvingforms',
    assetVariant: 'realign',
    assetMode: 'light',
  },
  {
    id: 1,
    eyebrow: 'WHEN LIFE DISRUPTS THE PLAN',
    headline: 'and creates',
    subheadline: 'the gap',
    body: 'Intent is quiet. Stress is loud. The moment decides.',
    assetFamily: 'evolvingforms',
    assetVariant: 'synconicity',
    assetMode: 'light',
  },
  {
    id: 2,
    eyebrow: 'UNDER HEAT, THE BRAIN DEFAULTS',
    headline: 'Biology',
    subheadline: '+ neuroscience',
    body: 'Old paths fire. Choice comes later.',
    assetFamily: 'evolvingforms',
    assetVariant: 'regrowth',
    assetMode: 'light',
  },
  {
    id: 3,
    eyebrow: 'OUR LEARNED NEURAL PATHWAYS',
    headline: 'patterns repeat',
    subheadline: 'until rewired',
    body: 'Change is cognitive. Continuity builds certainty.',
    assetFamily: 'flowstate',
    assetVariant: 'transition',
    assetMode: 'dark',
  },
  {
    id: 4,
    eyebrow: 'SO WE MAKE RECOVERY RUNNABLE',
    headline: 'a cognitive',
    subheadline: 'change engine',
    body: 'That runs all day. For you. With you.',
    assetFamily: 'flowstate',
    assetVariant: 'blossoming',
    assetMode: 'light',
  },
  {
    id: 5,
    eyebrow: 'TRUSTED CONTINUITY, BY DEFAULT',
    headline: 'next moment',
    subheadline: 'your move',
    body: 'Your window. We place the step',
    assetFamily: 'evolvingforms',
    assetVariant: 'skypattern',
    assetMode: 'light',
  },
  {
    id: 6,
    eyebrow: 'DOWNLOADED IN REAL TIME',
    headline: 'thousands of',
    subheadline: 'tiny rewires',
    body: 'Until behaviour feels like you.',
    assetFamily: 'mindblock',
    assetVariant: 'dynamic',
    assetMode: 'light',
  },
];

// ==========================================
// 5. FOUR PHASES (NOTICE → EMBRACE → SHIFT → BECOME)
// ==========================================

export const phases: Phase[] = [
  {
    id: 'sense',
    letter: 'N',
    title: 'NOTICE / Sense',
    tagline: 'Opens the window',
    features: ['Heat', 'Friction', 'Noise', 'Time'], // Updated to match Scene 1
    featureIcons: [Eye, Gauge, Shield],
    watermark: 'NOTICE',
    closer: 'Experience opens the window.',
    actions: ['recognise', 'learn', 'name'],
    color: colors.accent.cyan.primary,
    icon: Activity,
    position: 'top-left',
  },
  {
    id: 'map', // Changed from 'route' to 'map'
    letter: 'E',
    title: 'EMBRACE / Map',
    tagline: 'Aligns to you',
    features: ['Right move', 'Right dose', 'Right prediction', 'Right timing'], // Updated to match Scene 2
    featureIcons: [Compass, Brain, Target],
    watermark: 'EMBRACE',
    closer: 'Recognition creates choice in real time.',
    actions: ['test', 'reframe', 'integrate'],
    color: colors.brand.purple.light,
    icon: GitBranch,
    position: 'top-right',
  },
  {
    id: 'deliver',
    letter: 'S',
    title: 'SHIFT / Deliver',
    tagline: 'Runs the move',
    features: ['JOURNEY / baseline builds', 'NAVICUE / moment moves', 'SOUNDBITE / identity sparks', 'STUDIO / state rituals'], // Updated to match Scene 3
    featureIcons: [Target, Repeat, Eye],
    watermark: 'SHIFT',
    closer: 'Alignment repeats until reflex.',
    actions: ['act', 'transfer', 'prove'],
    color: colors.status.amber.bright,
    icon: Zap,
    position: 'bottom-right',
  },
  {
    id: 'seal',
    letter: 'B',
    title: 'BECOME / Seal',
    tagline: 'Holds in real life',
    features: ['Install', 'Save', 'Replay', 'Reload'], // Updated to match Scene 4
    featureIcons: [Repeat, Shield, Brain],
    watermark: 'BECOME',
    closer: 'Proof consolidates the new pathway.',
    actions: ['cognitive shift', 'identity integration'],
    color: colors.status.green.bright,
    icon: Lock,
    position: 'bottom-left',
  },
];

// ==========================================
// 6. OPERATING TRUTH FEATURES (13 Layers)
// ==========================================

export const operatingTruthFeatures: OperatingTruthFeature[] = [
  {
    id: 1,
    shortName: 'JOURNEYS',
    icon: Calendar,
    layer: 'The Baseline Layer',
    name: 'Journeys',
    label: 'Your weekly rhythm',
    promise: 'The story shifts as behaviour repeats.',
    whyItMatters: 'Consistency is how defaults change.',
    subFeatures: [
      { name: 'A weekly chapter', description: 'One focus to install.' },
      { name: 'Guided experiences', description: 'You feel. You recognise.' },
      { name: 'A cadence', description: 'A rhythm you can trust.' },
      { name: 'Insight roots', description: 'Proven in the wild.' },
      { name: 'A change', description: 'One small adjustment.' },
      { name: 'Baseline, updated.', description: 'Mindblock calibrated.' },
    ],
    accentColor: colors.accent.blue.primary,
    backgroundAsset: { collection: 'evolvingforms', name: 'skypattern', variant: 'light' },
  },
  {
    id: 2,
    shortName: 'CUES',
    icon: Compass,
    layer: 'The Moment Layer',
    name: 'NaviCues',
    label: 'Your momentum',
    promise: 'Tiny experiences. Real conditions.',
    whyItMatters: 'Small completions rewire faster than big plans.',
    subFeatures: [
      { name: 'Sparks', description: 'Quick cognitive shifts' },
      { name: 'Bridges', description: 'Pattern-to-choice transitions' },
      { name: 'Scans', description: 'Body-first resets' },
      { name: 'Threads', description: 'Values and meaning prompts' },
      { name: 'Mirrors', description: 'Statement reflection' },
      { name: 'Keys', description: 'Paradox and perspective unlocks' },
      { name: 'Stamps', description: 'Proof markers' },
    ],
    accentColor: colors.status.amber.bright,
    backgroundAsset: { collection: 'mindblock', name: 'integration', variant: 'light' },
  },
  {
    id: 3,
    shortName: 'SENSE',
    icon: Activity,
    layer: 'The Signals Layer',
    name: 'Sense Check',
    label: 'Three Signals',
    promise: 'The system maps to you.',
    whyItMatters: "The right step depends on what's available.",
    subFeatures: [
      { name: 'Energy', description: 'What you have' },
      { name: 'Clarity', description: 'What you see' },
      { name: 'Anchorage', description: 'What holds you' },
    ],
    accentColor: colors.accent.cyan.primary,
    backgroundAsset: { collection: 'neuralflower', name: 'blossom', variant: 'light' },
  },
  {
    id: 4,
    shortName: 'STUDIO',
    icon: Heart,
    layer: 'The Body Layer',
    name: 'Wellbeing Studio',
    label: 'Regulation First',
    promise: 'Find your flow.',
    whyItMatters: 'The nervous system sets the ceiling.',
    subFeatures: [
      { name: 'Guided Sessions', description: 'Deliberate series, not a content dump' },
      { name: 'Your Rhythm', description: 'Schedule what steadies you' },
      { name: 'Foundations', description: 'Breath, movement, stillness, nourishment' },
    ],
    accentColor: colors.status.green.mid,
    backgroundAsset: { collection: 'evolvingforms', name: 'transition', variant: 'light' },
  },
  {
    id: 5,
    shortName: 'TOOLKIT',
    icon: Package,
    layer: 'The Meaning Layer',
    name: 'Toolkit',
    label: 'Depth on Demand',
    promise: 'Context you can carry.',
    whyItMatters: 'Meaning lands when capacity is there.',
    subFeatures: [
      { name: 'Articles', description: 'The calm line' },
      { name: 'Insights', description: 'The deeper why' },
      { name: 'Practices', description: 'Standalone components' },
      { name: 'Bag', description: 'Keep what becomes yours' },
    ],
    accentColor: colors.accent.cyan.light,
    backgroundAsset: { collection: 'mindblock', name: 'microspheres+defusion', variant: 'light' },
  },
  {
    id: 6,
    shortName: 'PLAY',
    icon: Music,
    layer: 'The Story Layer',
    name: 'Play',
    label: 'change the narrative',
    promise: 'The soundtrack to your recovery.',
    whyItMatters: 'Identity installation. Not ideology.',
    subFeatures: [
      { name: 'Your Story', description: 'You download. We Play.' },
      { name: 'Library', description: 'Curated spiritual soundbites' },
      { name: 'Sparks', description: 'Power affirmations' },
      { name: 'Flames', description: 'Contextual depth' },
      { name: 'Embers', description: 'Therapeutic flow' },
      { name: 'Beat Mode', description: 'Raw or tuned to the moment' },
    ],
    accentColor: colors.status.amber.mid,
    backgroundAsset: { collection: 'evolvingforms', name: 'balance', variant: 'dark' },
  },
  {
    id: 7,
    shortName: 'NAVIGATE',
    icon: Navigation,
    layer: 'The Direction Layer',
    name: 'Navigate',
    label: 'course correction',
    promise: 'Your map updates as you change.',
    whyItMatters: 'Recovery isn\'t linear. Your system shouldn\'t pretend it is.',
    subFeatures: [
      { name: 'Journey Map', description: 'See where you are' },
      { name: 'Pattern Tracker', description: 'What repeats, what shifts' },
      { name: 'Momentum View', description: 'Feel the progress' },
      { name: 'Pivot Points', description: 'When to adjust' },
    ],
    accentColor: colors.brand.purple.light,
    backgroundAsset: { collection: 'mindblock', name: 'skyline', variant: 'light' },
  },
  {
    id: 8,
    shortName: 'INSIGHTS',
    icon: TrendingUp,
    layer: 'The Pattern Layer',
    name: 'Insights',
    label: 'earned understanding',
    promise: 'Data becomes wisdom. Patterns become proof.',
    whyItMatters: 'You need to see it to believe it.',
    subFeatures: [
      { name: 'Pattern Recognition', description: 'What triggers, what soothes' },
      { name: 'Momentum Metrics', description: 'Progress you can feel' },
      { name: 'Baseline Shifts', description: 'The default, updating' },
      { name: 'Transfer Evidence', description: 'Proof in the wild' },
    ],
    accentColor: colors.status.green.bright,
    backgroundAsset: { collection: 'flowstate', name: 'blossoming', variant: 'light' },
  },
  {
    id: 9,
    shortName: 'CONNECT',
    icon: Users,
    layer: 'The Social Layer',
    name: 'Connect',
    label: 'shared humanity',
    promise: 'Recovery is personal. But not alone.',
    whyItMatters: 'Belonging accelerates everything.',
    subFeatures: [
      { name: 'Circles', description: 'Your trusted few' },
      { name: 'Shared Journeys', description: 'Parallel paths' },
      { name: 'Check-ins', description: 'The accountability that feels good' },
      { name: 'Celebrations', description: 'Wins, witnessed' },
    ],
    accentColor: colors.accent.cyan.primary,
    backgroundAsset: { collection: 'evolvingforms', name: 'convergence', variant: 'light' },
  },
  {
    id: 10,
    shortName: 'REFLECT',
    icon: Flame,
    layer: 'The Integration Layer',
    name: 'Reflect',
    label: 'consolidation',
    promise: 'Experience becomes wisdom.',
    whyItMatters: 'The system learns what your nervous system discovers.',
    subFeatures: [
      { name: 'Weekly Review', description: 'What landed, what shifted' },
      { name: 'Pattern Journal', description: 'Your evolving map' },
      { name: 'Integration Prompts', description: 'Seal the learning' },
      { name: 'Wisdom Archive', description: 'What becomes yours' },
    ],
    accentColor: colors.status.amber.bright,
    backgroundAsset: { collection: 'neuralflow', name: 'flourish', variant: 'light' },
  },
];

// Add final card data (outside the features array)
export const operatingTruthFinalCard = {
  eyebrow: 'ONE NERVOUS SYSTEM',
  headline: 'Your recovery.',
  subheadline: 'Runnable.',
  body: 'All 13 layers. One truth. Always running.',
  backgroundAsset: {
    collection: 'flowstate',
    name: 'accelerate',
    variant: 'light' as const,
  },
};

// ==========================================
// 7. THREE ALTITUDES
// ==========================================

export const threeAltitudes: Altitude[] = [
  {
    id: 'micro',
    title: 'Micro',
    subtitle: 'In-the-moment',
    description: 'When stress spikes, the system responds. Real-time navigation for the moments that matter.',
    color: colors.accent.cyan.primary,
    icon: Target,
  },
  {
    id: 'meso',
    title: 'Meso',
    subtitle: 'Week-to-week',
    description: 'Journeys guide your rhythm. Small completions compound into lasting change.',
    color: colors.brand.purple.light,
    icon: Compass,
  },
  {
    id: 'macro',
    title: 'Macro',
    subtitle: 'Over time',
    description: 'Your patterns shift. Your baseline updates. The operating truth rewrites.',
    color: colors.status.green.bright,
    icon: Layers,
  },
];

export const threeAltitudesContent = {
  sectionTitle: 'Operating at three scales',
  sectionSubtitle: 'Your recovery moves at different speeds. So does the system.',
  backgroundAsset: {
    family: 'mindblock',
    variant: 'tower',
    mode: 'dark' as const,
  },
};

// ==========================================
// 8. TARGET/BUILD/RECEIPT (Always Running Loop)
// ==========================================

export const alwaysRunningContent = {
  sectionTitle: 'The Loop',
  sectionSubtitle: 'Always running. Built to transfer.',
  phases: [
    {
      id: 'target',
      title: 'Target',
      subtitle: 'We find the gap',
      description: 'The system identifies the moment between intent and action. The window opens.',
      icon: Target,
      color: colors.accent.cyan.primary,
    },
    {
      id: 'build',
      title: 'Build',
      subtitle: 'You lay the wire',
      description: 'Micro-experiences create new pathways. Small completions compound into certainty.',
      icon: Zap,
      color: colors.status.amber.bright,
    },
    {
      id: 'receipt',
      title: 'Receipt',
      subtitle: 'Life proves it',
      description: 'Real conditions test the new pattern. Evidence consolidates the change.',
      icon: Shield,
      color: colors.status.green.bright,
    },
  ],
  backgroundAsset: {
    family: 'flowstate',
    variant: 'bloom',
    mode: 'light' as const,
  },
};

// ==========================================
// 9. SENTIENT BASELINE
// ==========================================

export const sentientBaselinePrinciples: SentientPrinciple[] = [
  {
    title: 'Decide',
    description: 'The system responds to what you need, not what it thinks you should want.',
    icon: Compass,
    assetFamily: 'flowstate',
    assetVariant: 'decide',
    assetMode: 'light',
  },
  {
    title: 'Flow',
    description: 'Change compounds when momentum feels natural, not forced.',
    icon: Activity,
    assetFamily: 'flowstate',
    assetVariant: 'chain+flow',
    assetMode: 'dark',
  },
  {
    title: 'Commit',
    description: "Trust builds through continuity. The system runs even when you can't.",
    icon: Shield,
    assetFamily: 'flowstate',
    assetVariant: 'commit',
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
    text: (year: number, company: string) => `© ${year} ${company}. All rights reserved.`,
  },
  socialLinks: [] as FooterLink[], // Add social links when needed
} as const;

// ==========================================
// 11. CLINICAL SPINE (13-Layer Framework)
// ==========================================

// The 13 layers organized into 3 vertebrae
export const clinicalLayers: ClinicalLayer[] = [
  // CORE: Layers 1-5
  {
    id: 1,
    name: 'BASELINE',
    tag: 'source code',
    tagline: 'Before we personalise anything, we have to understand what\'s running.',
    question: 'What drives the defaults?',
    contents: [
      'survive',
      'belong',
      'avoid pain',
      'seek reward',
      'conserve energy',
    ],
    color: colors.accent.blue.primary,
    icon: Layers,
  },
  {
    id: 2,
    name: 'PILLARS',
    tag: 'architectural stability',
    tagline: 'Pillars keep the architecture stable.',
    question: 'Where in the human system are we building capacity?',
    contents: [
      'Emotional Regulation',
      'Stress Resilience',
      'Social Connectivity',
      'Cognitive Reframing',
      'Identity Integration',
      'Decision Mastery',
    ],
    color: colors.brand.purple.light,
    icon: Shield,
  },
  {
    id: 3,
    name: 'CONCEPTS',
    tag: 'scientific reality',
    tagline: 'Concepts keep the science real.',
    question: 'What internal system are we changing?',
    contents: [
      'Arousal Regulation',
      'Interoception & Affect Labeling',
      'Attention & Orienting',
      'Inhibitory Control',
      'Reward & Time Horizon',
      'Cognitive Defusion',
      'Meaning & Values Orientation',
      'Self-Compassion & Shame Soothing',
      'Co-Regulation & Attachment Safety',
      'Boundary Mechanics',
      'Narrative Integration',
      'Repair & Reconnection',
    ],
    color: colors.accent.cyan.dark,
    icon: Brain,
  },
  {
    id: 4,
    name: 'THEMES',
    tag: 'skills installation',
    tagline: 'Themes make it installable.',
    question: 'What do we practice repeatedly that produces change?',
    contents: [
      'Downshift Under Load',
      'Name the Pattern',
      'Create Choice Space',
      'Urge Surf & Delay',
      'Reframe in Motion',
      'Values Anchor',
      'Self-Compassion in Heat',
      'Boundary Micro-Reps',
      'Connection Micro-Acts',
      'Repair the Moment',
      'Proof Capture',
      'Transfer Testing',
    ],
    color: colors.status.green.mid,
    icon: Repeat,
  },
  {
    id: 5,
    name: 'SCHEMA',
    tag: 'tuned understanding',
    tagline: 'Schemas make it specific.',
    question: 'Why does this keep happening, and what sequence rewires it?',
    contents: [
      'Recognition (K)',
      'Belief Work (B)',
      'Release (B/E)',
      'Repair (E)',
    ],
    color: colors.brand.purple.light,
    icon: GitBranch,
  },
  // RUN: Layers 6-9
  {
    id: 6,
    name: 'MODALITIES',
    tag: 'evidence credibility',
    tagline: 'Modalities make it executable.',
    question: 'Which proven method best matches this targeted moment?',
    contents: [
      'IFS',
      'ACT',
      'DBT',
      'CBT',
      'Somatic Experiencing',
      'Motivational Interviewing',
      'EFT',
    ],
    color: colors.status.amber.mid,
    icon: Activity,
  },
  {
    id: 7,
    name: 'INTERACTIONS',
    tag: 'accessible execution',
    tagline: 'Interactions make it doable.',
    question: 'What can actually hold right now?',
    contents: [
      'Glance',
      'Seed',
      'Thread',
      'Journey',
      '+ depth toggles',
    ],
    color: colors.accent.cyan.primary,
    icon: Zap,
  },
  {
    id: 8,
    name: 'SOMATICS',
    tag: 'regulation alignment',
    tagline: 'Somatics make it land.',
    question: 'What does the body need to shift before the mind can follow?',
    contents: [
      'breath',
      'body scanning',
      'grounding',
      'discharge',
      'nervous system state',
    ],
    color: colors.status.amber.bright,
    icon: Heart,
  },
  {
    id: 9,
    name: 'RELATIONAL REPAIRS',
    tag: 'restorative responsibility',
    tagline: 'Repair makes it stick.',
    question: 'What needs to be repaired for momentum to hold?',
    contents: [
      'rupture → repair',
      'boundaries',
      'amends',
      'trust micro-tests',
      'clean apology',
    ],
    color: colors.brand.purple.light,
    icon: Users,
  },
  // MEMORY: Layers 10-13
  {
    id: 10,
    name: 'CONTEMPLATIONS',
    tag: 'meaningful inquiry',
    tagline: 'Wisdom makes it true.',
    question: 'What perspective unlocks meaning and softens the old story?',
    contents: [
      'koans',
      'council wisdom',
      'parables',
      'contemplative practices',
    ],
    color: colors.accent.cyan.light,
    icon: Compass,
  },
  {
    id: 11,
    name: 'PROOF',
    tag: 'recognizable returns',
    tagline: 'Proof makes it believable.',
    question: 'What receipt can we capture now so progress transfers?',
    contents: [
      'micro-wins',
      'pre/post',
      'vault',
      'review',
      'timeline',
    ],
    color: colors.status.green.bright,
    icon: Eye,
  },
  {
    id: 12,
    name: 'MECHANICS',
    tag: 'repeatable motion',
    tagline: 'Mechanics make it powerful.',
    question: 'What higher-order tool rewires the model, not just the moment?',
    contents: [
      'future-self',
      'simulation',
      'pattern interrupts',
      'narrative edits',
    ],
    color: colors.status.amber.dark,
    icon: Target,
  },
  {
    id: 13,
    name: 'MINDBLOCKS',
    tag: 'neurological change',
    tagline: 'Mindblocks make it executable.',
    question: 'What is the smallest prediction we can rewrite, prove, and transfer into real life?',
    contents: [
      'When X, I predict Y — so I do Z.',
    ],
    color: colors.status.green.dark,
    icon: Lock,
  },
];

// The 3 vertebrae that organize the layers
export const clinicalVertebrae: Vertebra[] = [
  {
    id: 'core',
    name: 'CORE',
    description: 'Foundational architecture of change',
    layerIds: [1, 2, 3, 4, 5],
    color: colors.accent.blue.primary,
  },
  {
    id: 'run',
    name: 'RUN',
    description: 'Active execution layer',
    layerIds: [6, 7, 8, 9],
    color: colors.status.amber.bright,
  },
  {
    id: 'memory',
    name: 'MEMORY',
    description: 'Integration and proof',
    layerIds: [10, 11, 12, 13],
    color: colors.status.green.bright,
  },
];

// ==========================================
// CONTENT METADATA
// ==========================================

export const contentMetadata = {
  version: '1.0.0',
  lastUpdated: '2026-02-05',
  language: 'en-US',
  author: 'RecoveryOS Content Team',
  description: 'Centralized content token system for RecoveryOS homepage',
} as const;