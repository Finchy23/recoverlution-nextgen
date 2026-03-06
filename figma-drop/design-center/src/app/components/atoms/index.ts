/**
 * ATOM LIBRARY INDEX
 * ==================
 *
 * 700 interactive therapeutic atoms across 70 series.
 * This barrel exports types, registries, and the component lookup map.
 *
 * ZERO imports from outside this folder.
 *
 * Components are registered here as they are built. The ATOM_COMPONENTS
 * map starts empty — each atom is added when its component is complete.
 */

// ── Types ───────────────────────────────────────────────────────
export type {
  SeriesId,
  AtomId,
  RenderMode,
  InteractionSurface,
  AtomScale,
  ExitTriggerType,
  AtomPhase,
  AtomHapticEventId,
  DeviceRequirement,
  AtomProps,
  AtomMeta,
  SeriesMeta,
} from './types';

// ── Series Registry ─────────────────────────────────────────────
export {
  SERIES_CATALOG,
  SERIES_IDS,
  SERIES_COLORS,
} from './series-registry';

// ── Atom Registry ───────────────────────────────────────────────
export {
  ATOM_CATALOG,
  ATOM_IDS,
  ATOM_COLORS,
  DESIGNED_ATOM_COUNT,
  TOTAL_ATOM_COUNT,
} from './atom-registry';

// ── Shared Atom Utilities & Design Tokens ────────────────────
export {
  parseColor,
  lerpColor,
  rgba,
  easeOutExpo,
  easeOutCubic,
  easeSineInOut,
  easeInOutCubic,
  setupCanvas,
  advanceEntrance,
  roundedRect,
  desaturate,
  ATOM_BG_ALPHA,
  ENTRANCE_RATE_ENTER,
  ENTRANCE_RATE_ACTIVE,
  ELEMENT_ALPHA,
  EMPHASIS_ALPHA,
  motionScale,
  // ── Spatial tokens (Collection 2+ standard) ──
  px,
  GLOW,
  SIZE,
  FONT_SIZE,
  STROKE,
  DASH,
  PARTICLE_SIZE,
  PAD,
  drawAtmosphere,
} from './atom-utils';
export type { RGB } from './atom-utils';

// ── Component Lookup Map ─────────────────────────────────────
// Components are added here as atoms are built.
// The map is typed as Partial so consumers must handle missing components.

import type { AtomId, AtomProps } from './types';
import type React from 'react';
import ChronoKineticAtom from './series-1-physics/chrono-kinetic';
import PhaseShiftAtom from './series-1-physics/phase-shift';
import ZAxisParallaxAtom from './series-1-physics/z-axis-parallax';
import SomaticResonanceAtom from './series-1-physics/somatic-resonance';
import ConstructiveDestructiveAtom from './series-1-physics/constructive-destructive';
import CryptographicAtom from './series-1-physics/cryptographic';
import SymbioticAtom from './series-1-physics/symbiotic';
import OpticalAtom from './series-1-physics/optical';
import EquilibriumAtom from './series-1-physics/equilibrium';
import ThermodynamicAtom from './series-1-physics/thermodynamic';
import WaveCollapseAtom from './series-2-quantum/wave-collapse';
import SchrodingerBoxAtom from './series-2-quantum/schrodinger-box';
import DoubleSlitAtom from './series-2-quantum/double-slit';
import ManyWorldsAtom from './series-2-quantum/many-worlds';
import EntanglementAtom from './series-2-quantum/entanglement';
import UncertaintyBlurAtom from './series-2-quantum/uncertainty-blur';
import QuantumTunnelAtom from './series-2-quantum/quantum-tunnel';
import ZeroPointFieldAtom from './series-2-quantum/zero-point-field';
import RetrocausalAtom from './series-2-quantum/retrocausal';
import HolographicAtom from './series-2-quantum/holographic';
import LSystemBranchingAtom from './series-3-biomimetic/l-system-branching';
import BoidsFlockingAtom from './series-3-biomimetic/boids-flocking';
import CompostingAtom from './series-3-biomimetic/composting';
import MycelialRoutingAtom from './series-3-biomimetic/mycelial-routing';
import SymbiosisAtom from './series-3-biomimetic/symbiosis';
import PruningAtom from './series-3-biomimetic/pruning';
import DormancyAtom from './series-3-biomimetic/dormancy';
import EcosystemBalancerAtom from './series-3-biomimetic/ecosystem-balancer';
import PollinationAtom from './series-3-biomimetic/pollination';
import ErosionAtom from './series-3-biomimetic/erosion';
import SensoryDeprivationAtom from './series-4-via-negativa/sensory-deprivation';
import UnNamingAtom from './series-4-via-negativa/un-naming';
import FigureGroundReversalAtom from './series-4-via-negativa/figure-ground-reversal';
import VacuumSealAtom from './series-4-via-negativa/vacuum-seal';
import DarkMatterAtom from './series-4-via-negativa/dark-matter';
import StaticClearAtom from './series-4-via-negativa/static-clear';
import ApneicPauseAtom from './series-4-via-negativa/apneic-pause';
import FormatResetAtom from './series-4-via-negativa/format-reset';
import NoiseGateAtom from './series-4-via-negativa/noise-gate';
import SingularityAtom from './series-4-via-negativa/singularity';
import PhaseLockAtom from './series-5-chrono-acoustic/phase-lock';
import VagalResonanceAtom from './series-5-chrono-acoustic/vagal-resonance';
import IsochronicPacerAtom from './series-5-chrono-acoustic/isochronic-pacer';
import CymaticCoherenceAtom from './series-5-chrono-acoustic/cymatic-coherence';
import AudioZoomAtom from './series-5-chrono-acoustic/audio-zoom';
import BrownNoiseAtom from './series-5-chrono-acoustic/brown-noise';
import TempoOverrideAtom from './series-5-chrono-acoustic/tempo-override';
import CrescendoAtom from './series-5-chrono-acoustic/crescendo';
import StandingWaveAtom from './series-5-chrono-acoustic/standing-wave';
import SilentRestAtom from './series-5-chrono-acoustic/silent-rest';
import FourthWallBreakAtom from './series-6-meta-glitch/fourth-wall-break';
import LagSpikeAtom from './series-6-meta-glitch/lag-spike';
import PhantomAlertAtom from './series-6-meta-glitch/phantom-alert';
import KernelPanicAtom from './series-6-meta-glitch/kernel-panic';
import AlgorithmJammerAtom from './series-6-meta-glitch/algorithm-jammer';
import RealityTearAtom from './series-6-meta-glitch/reality-tear';
import MuscleMemoryAtom from './series-6-meta-glitch/muscle-memory';
import PixelationAtom from './series-6-meta-glitch/pixelation';
import AttentionPaywallAtom from './series-6-meta-glitch/attention-paywall';
import SemanticCrashAtom from './series-6-meta-glitch/semantic-crash';
import AudioRescoreAtom from './series-7-retro-causal/audio-rescore';
import ChromaticGradeAtom from './series-7-retro-causal/chromatic-grade';
import NarrativeFlipAtom from './series-7-retro-causal/narrative-flip';
import SplicingTimelineAtom from './series-7-retro-causal/splicing-timeline';
import PrequelContextAtom from './series-7-retro-causal/prequel-context';
import MetadataRewriteAtom from './series-7-retro-causal/metadata-rewrite';
import ForgivenessFilterAtom from './series-7-retro-causal/forgiveness-filter';
import AncestralCutAtom from './series-7-retro-causal/ancestral-cut';
import TimeTravelRescueAtom from './series-7-retro-causal/time-travel-rescue';
import ThirdPersonShiftAtom from './series-7-retro-causal/third-person-shift';
import OverviewEffectAtom from './series-8-kinematic-topology/overview-effect';
import FractalZoomAtom from './series-8-kinematic-topology/fractal-zoom';
import DeepTimeAtom from './series-8-kinematic-topology/deep-time';
import SystemicZoomAtom from './series-8-kinematic-topology/systemic-zoom';
import EgoZoomAtom from './series-8-kinematic-topology/ego-zoom';
import MicroStepAtom from './series-8-kinematic-topology/micro-step';
import VastnessExpansionAtom from './series-8-kinematic-topology/vastness-expansion';
import HorizonInfiniteAtom from './series-8-kinematic-topology/horizon-infinite';
import StardustDissolveAtom from './series-8-kinematic-topology/stardust-dissolve';
import HolographicDropAtom from './series-8-kinematic-topology/holographic-drop';
import CrucibleFireAtom from './series-9-shadow-crucible/crucible-fire';
import ShadowHugAtom from './series-9-shadow-crucible/shadow-hug';
import ProjectionMirrorAtom from './series-9-shadow-crucible/projection-mirror';
import SolveCoagulaAtom from './series-9-shadow-crucible/solve-coagula';
import ParadoxTensionAtom from './series-9-shadow-crucible/paradox-tension';
import MonsterTamingAtom from './series-9-shadow-crucible/monster-taming';
import ShameCompassAtom from './series-9-shadow-crucible/shame-compass';
import AngerForgeAtom from './series-9-shadow-crucible/anger-forge';
import InnerChildAtom from './series-9-shadow-crucible/inner-child';
import PhoenixAshAtom from './series-9-shadow-crucible/phoenix-ash';
import AtmosphereWeatherAtom from './series-10-reality-bender/atmosphere-weather';
import DistortionGridAtom from './series-10-reality-bender/distortion-grid';
import BeliefBridgeAtom from './series-10-reality-bender/belief-bridge';
import FutureMemoryAtom from './series-10-reality-bender/future-memory';
import LuckSurfaceAtom from './series-10-reality-bender/luck-surface';
import PossibilityPrismAtom from './series-10-reality-bender/possibility-prism';
import ArchitectStoneAtom from './series-10-reality-bender/architect-stone';
import NarrativeOverrideAtom from './series-10-reality-bender/narrative-override';
import PureYesAtom from './series-10-reality-bender/pure-yes';
import InfiniteOuroborosAtom from './series-10-reality-bender/infinite-ouroboros';
// ── Collection 2: The Telemetric Navigator ─────────────────────
import CentrifugeEngineAtom from './series-11-epistemic/centrifuge-engine';
import LadderOfInferenceAtom from './series-11-epistemic/ladder-of-inference';
import LogicGateAtom from './series-11-epistemic/logic-gate';
import SteelManAtom from './series-11-epistemic/steel-man';
import BlindSpotAtom from './series-11-epistemic/blind-spot';
import SunkCostSeveranceAtom from './series-11-epistemic/sunk-cost-severance';
import AbsurdityDeflationAtom from './series-11-epistemic/absurdity-deflation';
import FirstPrinciplesAtom from './series-11-epistemic/first-principles';
import EchoCancellationAtom from './series-11-epistemic/echo-cancellation';
import AxiomaticSealAtom from './series-11-epistemic/axiomatic-seal';
// ── Series 12: Friction Mechanics ──────────────────────────────
import InertiaBreakAtom from './series-12-friction/inertia-break';
import MicroStepShrinkAtom from './series-12-friction/micro-step-shrink';
import UlyssesPactAtom from './series-12-friction/ulysses-pact';
import FrictionInjectionAtom from './series-12-friction/friction-injection';
import FlywheelAtom from './series-12-friction/flywheel';
import GoodEnoughAtom from './series-12-friction/good-enough';
import BurnRateAtom from './series-12-friction/burn-rate';
import VectorPivotAtom from './series-12-friction/vector-pivot';
import FrictionPolishAtom from './series-12-friction/friction-polish';
import KineticSealAtom from './series-12-friction/kinetic-seal';
// ── Series 13: Semantic Translators ────────────────────────────
import SubtextScannerAtom from './series-13-semantic/subtext-scanner';
import TranslatorPeelAtom from './series-13-semantic/translator-peel';
import YetAppendAtom from './series-13-semantic/yet-append';
import ConjunctionShiftAtom from './series-13-semantic/conjunction-shift';
import HeadlineRewriteAtom from './series-13-semantic/headline-rewrite';
import LabelInceptionAtom from './series-13-semantic/label-inception';
import MeaningMineAtom from './series-13-semantic/meaning-mine';
import AbsurdityFilterAtom from './series-13-semantic/absurdity-filter';
import SilentMirrorAtom from './series-13-semantic/silent-mirror';
import InterpreterSealAtom from './series-13-semantic/interpreter-seal';
// ── Series 14: Social Physics ──────────────────────────────────
import ReverseOrbitAtom from './series-14-social/reverse-orbit';
import ForcefieldAtom from './series-14-social/forcefield';
import StatusSeesawAtom from './series-14-social/status-seesaw';
import EmpathyBridgeAtom from './series-14-social/empathy-bridge';
import AikidoRedirectAtom from './series-14-social/aikido-redirect';
import SocialBatteryAtom from './series-14-social/social-battery';
import GossipFirewallAtom from './series-14-social/gossip-firewall';
import LighthouseAtom from './series-14-social/lighthouse';
import RocheLimitAtom from './series-14-social/roche-limit';
import DiplomatSealAtom from './series-14-social/diplomat-seal';
// ── Series 15: Time Capsule & Future Weaving ───────────────────
import OpenWhenAtom from './series-15-timecapsule/open-when';
import RageVaultAtom from './series-15-timecapsule/rage-vault';
import PredictionStakeAtom from './series-15-timecapsule/prediction-stake';
import DeadMansSwitchAtom from './series-15-timecapsule/dead-mans-switch';
import RegretMinimizationAtom from './series-15-timecapsule/regret-minimization';
import PreHindsightAtom from './series-15-timecapsule/pre-hindsight';
import BranchPrunerAtom from './series-15-timecapsule/branch-pruner';
import WorstCaseSimulatorAtom from './series-15-timecapsule/worst-case-simulator';
import TenYearEchoAtom from './series-15-timecapsule/ten-year-echo';
import CapsuleSealAtom from './series-15-timecapsule/capsule-seal';
// ── Series 16: Soma & Perception ───────────────────────────────
import SkinMapAtom from './series-16-soma/skin-map';
import PulseReaderAtom from './series-16-soma/pulse-reader';
import FasciaWaveAtom from './series-16-soma/fascia-wave';
import ProprioceptionAtom from './series-16-soma/proprioception';
import MicroTextureAtom from './series-16-soma/micro-texture';
import VoiceBoxAtom from './series-16-soma/voice-box';
import BlindWalkAtom from './series-16-soma/blind-walk';
import TemperatureScanAtom from './series-16-soma/temperature-scan';
import GutSignalAtom from './series-16-soma/gut-signal';
import SomaSealAtom from './series-16-soma/soma-seal';
// ── Series 17: Diplomat & Empathy ──────────────────────────────
import MirrorShieldAtom from './series-17-diplomat/mirror-shield';
import TruceTableAtom from './series-17-diplomat/truce-table';
import PerspectiveSwapAtom from './series-17-diplomat/perspective-swap';
import TranslationEarAtom from './series-17-diplomat/translation-ear';
import BoundaryDanceAtom from './series-17-diplomat/boundary-dance';
import ThirdChairAtom from './series-17-diplomat/third-chair';
import SteelManBuildAtom from './series-17-diplomat/steel-man-build';
import DeEscalationAtom from './series-17-diplomat/de-escalation';
import MirrorNeuronAtom from './series-17-diplomat/mirror-neuron';
import CommonGroundSealAtom from './series-17-diplomat/common-ground-seal';
// ── Series 18: Visionary & Strategist ──────────────────────────
import EssentialismAtom from './series-18-visionary/essentialism';
import CompoundInterestAtom from './series-18-visionary/compound-interest';
import DeepWorkAtom from './series-18-visionary/deep-work';
import LeverageEngineAtom from './series-18-visionary/leverage-engine';
import HorizonScanAtom from './series-18-visionary/horizon-scan';
import ObstacleFlipAtom from './series-18-visionary/obstacle-flip';
import CourageMapAtom from './series-18-visionary/courage-map';
import AbundanceScanAtom from './series-18-visionary/abundance-scan';
import PermissionlessAtom from './series-18-visionary/permissionless';
import BecomingSealAtom from './series-18-visionary/becoming-seal';
// ── Series 19: Mystic & Infinite Player ────────────────────────
import MayaVeilAtom from './series-19-mystic/maya-veil';
import NoSelfAtom from './series-19-mystic/no-self';
import CosmicJokeAtom from './series-19-mystic/cosmic-joke';
import SpaceBetweenAtom from './series-19-mystic/space-between';
import BeginnersMindAtom from './series-19-mystic/beginners-mind';
import DanceOfShivaAtom from './series-19-mystic/dance-of-shiva';
import UnplannedHourAtom from './series-19-mystic/unplanned-hour';
import WonderWalkAtom from './series-19-mystic/wonder-walk';
import LightSourceAtom from './series-19-mystic/light-source';
import MysticSealAtom from './series-19-mystic/mystic-seal';
// ── Series 20: The Omega & Integration ─────────────────────────
import PrismReturnAtom from './series-20-omega/prism-return';
import GoldenSpiralAtom from './series-20-omega/golden-spiral';
import TimeCollapseAtom from './series-20-omega/time-collapse';
import MirrorOfTruthAtom from './series-20-omega/mirror-of-truth';
import EventHorizonAtom from './series-20-omega/event-horizon';
import AlphaOmegaAtom from './series-20-omega/alpha-omega';
import CircleCloseAtom from './series-20-omega/circle-close';
import FinalExhaleAtom from './series-20-omega/final-exhale';
import TailSwallowAtom from './series-20-omega/tail-swallow';
import AtlasSealAtom from './series-20-omega/atlas-seal';

// ── Collection 3: The Transcendent Witness ──────────────────
// ── Series 21: Metacognitive Mirror ───────────────────────
import TheaterLensAtom from './series-21-metacognitive-mirror/theater-lens';
import FocalGlassAtom from './series-21-metacognitive-mirror/focal-glass';
import SyntacticSeveranceAtom from './series-21-metacognitive-mirror/syntactic-severance';
import TrafficObserverAtom from './series-21-metacognitive-mirror/traffic-observer';
import SkyAndCloudsAtom from './series-21-metacognitive-mirror/sky-and-clouds';
import EmptyBoatAtom from './series-21-metacognitive-mirror/empty-boat';
import GlassWallAtom from './series-21-metacognitive-mirror/glass-wall';
import EchomakerAtom from './series-21-metacognitive-mirror/echomaker';
import HolographicParallaxAtom from './series-21-metacognitive-mirror/holographic-parallax';
import ObserverSealAtom from './series-21-metacognitive-mirror/observer-seal';

// ── Series 22: The Predictive Override ─────────────────────────
import SemanticStrippingAtom from './series-22-predictive-override/semantic-stripping';
import RawDataAtom from './series-22-predictive-override/raw-data';
import ColorDeconstructAtom from './series-22-predictive-override/color-deconstruct';
import TasteExplodeAtom from './series-22-predictive-override/taste-explode';
import AcousticUnnamingAtom from './series-22-predictive-override/acoustic-unnaming';
import TabulaRasaAtom from './series-22-predictive-override/tabula-rasa';
import WabiSabiAtom from './series-22-predictive-override/wabi-sabi';
import SomaticTrustAtom from './series-22-predictive-override/somatic-trust';
import TextureTouchAtom from './series-22-predictive-override/texture-touch';
import PerceptionSealAtom from './series-22-predictive-override/perception-seal';

// ── Series 23: Fluidity Mechanics ──────────────────────────────
import BinaryBreakerAtom from './series-23-fluidity-mechanics/binary-breaker';
import WaterModeAtom from './series-23-fluidity-mechanics/water-mode';
import IdentityFluidityAtom from './series-23-fluidity-mechanics/identity-fluidity';
import HarmonicSynthesisAtom from './series-23-fluidity-mechanics/harmonic-synthesis';
import WuWeiAtom from './series-23-fluidity-mechanics/wu-wei';
import ThawingAtom from './series-23-fluidity-mechanics/thawing';
import ProteusAtom from './series-23-fluidity-mechanics/proteus';
import OceanDepthAtom from './series-23-fluidity-mechanics/ocean-depth';
import ComplexityBreathAtom from './series-23-fluidity-mechanics/complexity-breath';
import ShifterSealAtom from './series-23-fluidity-mechanics/shifter-seal';

// ── Series 24: Net of Indra ────────────────────────────────────
import IndraNodeAtom from './series-24-net-of-indra/indra-node';
import MutualRespirationAtom from './series-24-net-of-indra/mutual-respiration';
import MyceliumNetworkAtom from './series-24-net-of-indra/mycelium-network';
import DmnDeactivationAtom from './series-24-net-of-indra/dmn-deactivation';
import EchoChamberAtom from './series-24-net-of-indra/echo-chamber';
import MurmurationAtom from './series-24-net-of-indra/murmuration';
import GravityWellAtom from './series-24-net-of-indra/gravity-well';
import ButterflyEffectAtom from './series-24-net-of-indra/butterfly-effect';
import InterferencePatternAtom from './series-24-net-of-indra/interference-pattern';
import CosmicTapestrySealAtom from './series-24-net-of-indra/cosmic-tapestry-seal';

// ── Series 25: The Dialectical Engine ──────────────────────────
import TensegrityAtom from './series-25-dialectical-engine/tensegrity';
import BothAndAtom from './series-25-dialectical-engine/both-and';
import ZenKoanAtom from './series-25-dialectical-engine/zen-koan';
import ComplementaryColorAtom from './series-25-dialectical-engine/complementary-color';
import PendulumArrestAtom from './series-25-dialectical-engine/pendulum-arrest';
import MagneticSuspensionAtom from './series-25-dialectical-engine/magnetic-suspension';
import AcceptanceChangeAtom from './series-25-dialectical-engine/acceptance-change';
import MobiusStripAtom from './series-25-dialectical-engine/mobius-strip';
import WeightOfOppositesAtom from './series-25-dialectical-engine/weight-of-opposites';
import DialecticalSealAtom from './series-25-dialectical-engine/dialectical-seal';

// ── Series 26: Identity Decoupling ─────────────────────────────
import MatryoshkaAtom from './series-26-identity-decoupling/matryoshka';
import ArmorDropAtom from './series-26-identity-decoupling/armor-drop';
import PredicateEraserAtom from './series-26-identity-decoupling/predicate-eraser';
import CostumeClosetAtom from './series-26-identity-decoupling/costume-closet';
import TimeLapseMirrorAtom from './series-26-identity-decoupling/time-lapse-mirror';
import ResumeBurnerAtom from './series-26-identity-decoupling/resume-burner';
import SpaceContainerAtom from './series-26-identity-decoupling/space-container';
import NobodyAtom from './series-26-identity-decoupling/nobody';
import ReEntryAtom from './series-26-identity-decoupling/re-entry';
import SoulSealAtom from './series-26-identity-decoupling/soul-seal';

// ── Series 27: The Cosmic Play ─────────────────────────────────
import DestinationOverrideAtom from './series-27-cosmic-play/destination-override';
import SandMandalaAtom from './series-27-cosmic-play/sand-mandala';
import ToyBoxAtom from './series-27-cosmic-play/toy-box';
import SisyphusSmileAtom from './series-27-cosmic-play/sisyphus-smile';
import ImprovisationAtom from './series-27-cosmic-play/improvisation';
import StakesFreeAtom from './series-27-cosmic-play/stakes-free';
import CharacterDropAtom from './series-27-cosmic-play/character-drop';
import JugglerAtom from './series-27-cosmic-play/juggler';
import InfiniteCanvasAtom from './series-27-cosmic-play/infinite-canvas';
import LilaSealAtom from './series-27-cosmic-play/lila-seal';

// ── Series 28: The Impermanence Engine ─────────────────────────
import OpenPalmAtom from './series-28-impermanence-engine/open-palm';
import EvaporationAtom from './series-28-impermanence-engine/evaporation';
import AutumnLeafAtom from './series-28-impermanence-engine/autumn-leaf';
import WaveDecayAtom from './series-28-impermanence-engine/wave-decay';
import EbbTideAtom from './series-28-impermanence-engine/ebb-tide';
import MetamorphosisAtom from './series-28-impermanence-engine/metamorphosis';
import ExhaleCycleAtom from './series-28-impermanence-engine/exhale-cycle';
import KintsugiAtom from './series-28-impermanence-engine/kintsugi';
import SunsetAtom from './series-28-impermanence-engine/sunset';
import AniccaSealAtom from './series-28-impermanence-engine/anicca-seal';

// ── Series 29: The Interoceptive Anchor ────────────────────────
import BioMirrorAtom from './series-29-interoceptive-anchor/bio-mirror';
import RespirationPendulumAtom from './series-29-interoceptive-anchor/respiration-pendulum';
import PlumbLineAtom from './series-29-interoceptive-anchor/plumb-line';
import CymaticResonanceAtom from './series-29-interoceptive-anchor/cymatic-resonance';
import FocalCollapseAtom from './series-29-interoceptive-anchor/focal-collapse';
import TectonicDropAtom from './series-29-interoceptive-anchor/tectonic-drop';
import MicroTremorAtom from './series-29-interoceptive-anchor/micro-tremor';
import ThermalBoundaryAtom from './series-29-interoceptive-anchor/thermal-boundary';
import WeightOfWorldAtom from './series-29-interoceptive-anchor/weight-of-world';
import AnchorSealAtom from './series-29-interoceptive-anchor/anchor-seal';

// ── Series 30: The Loving Awareness ────────────────────────────
import ShadowEmbraceAtom from './series-30-loving-awareness/shadow-embrace';
import MettaRadianceAtom from './series-30-loving-awareness/metta-radiance';
import GoldenThreadAtom from './series-30-loving-awareness/golden-thread';
import AltarAtom from './series-30-loving-awareness/altar';
import NamasteLensAtom from './series-30-loving-awareness/namaste-lens';
import KarmicSeveranceAtom from './series-30-loving-awareness/karmic-severance';
import InfiniteHeartAtom from './series-30-loving-awareness/infinite-heart';
import IAmAtom from './series-30-loving-awareness/i-am';
import OceanDropAtom from './series-30-loving-awareness/ocean-drop';
import AtlasOmegaAtom from './series-30-loving-awareness/atlas-omega';

// ── Collection 4: The Alchemical Synthesizer ────────────────
// ── Series 31: The Particle Collider ────────────────────────
import SynthesisStrikeAtom from './series-31-particle-collider/synthesis-strike';
import MagneticParadoxAtom from './series-31-particle-collider/magnetic-paradox';
import OrbitalDecayAtom from './series-31-particle-collider/orbital-decay';
import AsymmetricSmashAtom from './series-31-particle-collider/asymmetric-smash';
import VelocityThresholdAtom from './series-31-particle-collider/velocity-threshold';
import FragmentationEngineAtom from './series-31-particle-collider/fragmentation-engine';
import ElasticSnapbackAtom from './series-31-particle-collider/elastic-snapback';
import GlancingBlowAtom from './series-31-particle-collider/glancing-blow';
import TriangulationAtom from './series-31-particle-collider/triangulation';
import AbsoluteZeroAtom from './series-31-particle-collider/absolute-zero';

// ── Series 32: The Cymatic Engine ───────────────────────────
import BaseFrequencyAtom from './series-32-cymatic-engine/base-frequency';
import DissonantChordAtom from './series-32-cymatic-engine/dissonant-chord';
import ResonantShatterAtom from './series-32-cymatic-engine/resonant-shatter';
import SilenceGapAtom from './series-32-cymatic-engine/silence-gap';
import HarmonicStackAtom from './series-32-cymatic-engine/harmonic-stack';
import SubBassDropAtom from './series-32-cymatic-engine/sub-bass-drop';
import AmplitudeSurgeAtom from './series-32-cymatic-engine/amplitude-surge';
import NoiseFilterAtom from './series-32-cymatic-engine/noise-filter';
import ChladniOrganizationAtom from './series-32-cymatic-engine/chladni-organization';
import CymaticLinkAtom from './series-32-cymatic-engine/cymatic-link';

// ── Series 33: The Catalyst Web ─────────────────────────────
import CentralNodeAtom from './series-33-catalyst-web/central-node';
import ConstellationLinkAtom from './series-33-catalyst-web/constellation-link';
import GravityInversionAtom from './series-33-catalyst-web/gravity-inversion';
import TangledThreadAtom from './series-33-catalyst-web/tangled-thread';
import MagneticSnapAtom from './series-33-catalyst-web/magnetic-snap';
import NeuralPruningAtom from './series-33-catalyst-web/neural-pruning';
import RippleEffectAtom from './series-33-catalyst-web/ripple-effect';
import AlignmentGridAtom from './series-33-catalyst-web/alignment-grid';
import DominoVectorAtom from './series-33-catalyst-web/domino-vector';
import OrbitStabilizerAtom from './series-33-catalyst-web/orbit-stabilizer';

// ── Series 34: The Chaos Loom ───────────────────────────────
import LoomAnchorAtom from './series-34-chaos-loom/loom-anchor';
import SpindleFocusAtom from './series-34-chaos-loom/spindle-focus';
import FabricTearAtom from './series-34-chaos-loom/fabric-tear';
import BraidedCordAtom from './series-34-chaos-loom/braided-cord';
import TensionSnapAtom from './series-34-chaos-loom/tension-snap';
import WarpAndWeftAtom from './series-34-chaos-loom/warp-and-weft';
import SutureMendAtom from './series-34-chaos-loom/suture-mend';
import WebSpinnerAtom from './series-34-chaos-loom/web-spinner';
import KnotReleaseAtom from './series-34-chaos-loom/knot-release';
import TapestryIntegrationAtom from './series-34-chaos-loom/tapestry-integration';

// ── Series 35: The Pressure Vessel ──────────────────────────
import CompressionDiamondAtom from './series-35-pressure-vessel/compression-diamond';
import VacuumChamberAtom from './series-35-pressure-vessel/vacuum-chamber';
import HydraulicPressAtom from './series-35-pressure-vessel/hydraulic-press';
import PressureCookAtom from './series-35-pressure-vessel/pressure-cook';
import CarbonLayerAtom from './series-35-pressure-vessel/carbon-layer';
import FaultLineReleaseAtom from './series-35-pressure-vessel/fault-line-release';
import DepthPressureAtom from './series-35-pressure-vessel/depth-pressure';
import ImplosionCoreAtom from './series-35-pressure-vessel/implosion-core';
import SpringTemperAtom from './series-35-pressure-vessel/spring-temper';
import ForgeSealAtom from './series-35-pressure-vessel/forge-seal';

// ── Series 36: The Friction Spark ─────────────────────────
import FlintStrikeAtom from './series-36-friction-spark/flint-strike';
import PistonPumpAtom from './series-36-friction-spark/piston-pump';
import HandCrankAtom from './series-36-friction-spark/hand-crank';
import VelocitySledAtom from './series-36-friction-spark/velocity-sled';
import BowstringDrawAtom from './series-36-friction-spark/bowstring-draw';
import DynamoSpinAtom from './series-36-friction-spark/dynamo-spin';
import HeatSinkAtom from './series-36-friction-spark/heat-sink';
import ResonanceCascadeAtom from './series-36-friction-spark/resonance-cascade';
import KineticBatteryAtom from './series-36-friction-spark/kinetic-battery';
import BellowsBreathAtom from './series-36-friction-spark/bellows-breath';

// ── Series 37: The Conduit Flow ─────────────────────────────
import LightningRodAtom from './series-37-conduit-flow/lightning-rod';
import AqueductChannelAtom from './series-37-conduit-flow/aqueduct-channel';
import PrismSpectrumAtom from './series-37-conduit-flow/prism-spectrum';
import TransformerCoilAtom from './series-37-conduit-flow/transformer-coil';
import CapillaryActionAtom from './series-37-conduit-flow/capillary-action';
import FiberOpticAtom from './series-37-conduit-flow/fiber-optic';
import VenturiEffectAtom from './series-37-conduit-flow/venturi-effect';
import SuperconductorAtom from './series-37-conduit-flow/superconductor';
import TeslaCoilAtom from './series-37-conduit-flow/tesla-coil';
import CircuitCompleteAtom from './series-37-conduit-flow/circuit-complete';

// ── Series 38: The Magnetic Sieve ───────────────────────────
import GravityDropAtom from './series-38-magnetic-sieve/gravity-drop';
import PolarityShiftAtom from './series-38-magnetic-sieve/polarity-shift';
import CentrifugeSpinAtom from './series-38-magnetic-sieve/centrifuge-spin';
import WinnowingWindAtom from './series-38-magnetic-sieve/winnowing-wind';
import NoiseThresholdAtom from './series-38-magnetic-sieve/noise-threshold';
import DecantPourAtom from './series-38-magnetic-sieve/decant-pour';
import MagneticPullAtom from './series-38-magnetic-sieve/magnetic-pull';
import EvaporationPatienceAtom from './series-38-magnetic-sieve/evaporation-patience';
import GoldPanAtom from './series-38-magnetic-sieve/gold-pan';
import SingularityFocusAtom from './series-38-magnetic-sieve/singularity-focus';

// ── Series 39: The Momentum Wheel ───────────────────────────
import HeavyFlywheelAtom from './series-39-momentum-wheel/heavy-flywheel';
import PendulumSwingAtom from './series-39-momentum-wheel/pendulum-swing';
import GearMeshAtom from './series-39-momentum-wheel/gear-mesh';
import GyroscopeBalanceAtom from './series-39-momentum-wheel/gyroscope-balance';
import SnowballRollAtom from './series-39-momentum-wheel/snowball-roll';
import LeverAdvantageAtom from './series-39-momentum-wheel/lever-advantage';
import SiphonTransferAtom from './series-39-momentum-wheel/siphon-transfer';
import EscapementTickAtom from './series-39-momentum-wheel/escapement-tick';
import SlingshotOrbitAtom from './series-39-momentum-wheel/slingshot-orbit';
import PerpetualMotionAtom from './series-39-momentum-wheel/perpetual-motion';

// ── Series 40: The Synthesis Forge ──────────────────────────
import CrucibleHeatAtom from './series-40-synthesis-forge/crucible-heat';
import AlloyFusionAtom from './series-40-synthesis-forge/alloy-fusion';
import CastingMoldAtom from './series-40-synthesis-forge/casting-mold';
import QuenchHardenAtom from './series-40-synthesis-forge/quench-harden';
import AnnealingReliefAtom from './series-40-synthesis-forge/annealing-relief';
import SlagSkimAtom from './series-40-synthesis-forge/slag-skim';
import ArcWeldAtom from './series-40-synthesis-forge/arc-weld';
import HammerForgeAtom from './series-40-synthesis-forge/hammer-forge';
import PolishRefineAtom from './series-40-synthesis-forge/polish-refine';
import MasterForgeAtom from './series-40-synthesis-forge/master-forge';

// ── Collection 7: The Fluid Tactician ─────────────────────
// ── Series 61: The Aikido Redirect ─────────────────────────────
import LinearStrikeRedirectAtom from './series-61-aikido-redirect/linear-strike-redirect';
import HeavyMomentumThrowAtom from './series-61-aikido-redirect/heavy-momentum-throw';
import CornerTrapPivotAtom from './series-61-aikido-redirect/corner-trap-pivot';
import EscalationCoolAtom from './series-61-aikido-redirect/escalation-cool';
import KineticReturnCurveAtom from './series-61-aikido-redirect/kinetic-return-curve';
import RigidStanceSidestepAtom from './series-61-aikido-redirect/rigid-stance-sidestep';
import MultipleFrontsFlowAtom from './series-61-aikido-redirect/multiple-fronts-flow';
import FalseTargetMatadorAtom from './series-61-aikido-redirect/false-target-matador';
import FrictionlessPlaneAtom from './series-61-aikido-redirect/frictionless-plane';
import KineticConversionTurbineAtom from './series-61-aikido-redirect/kinetic-conversion-turbine';

// ── Series 62: The Bezier Curve ────────────────────────────────
import SharpCornerHandleAtom from './series-62-bezier-curve/sharp-corner-handle';
import SawtoothSplineAtom from './series-62-bezier-curve/sawtooth-spline';
import BinaryForkMergeAtom from './series-62-bezier-curve/binary-fork-merge';
import ForcedDetourArcAtom from './series-62-bezier-curve/forced-detour-arc';
import TangentHandleRetractAtom from './series-62-bezier-curve/tangent-handle-retract';
import AsymptoteCollisionAtom from './series-62-bezier-curve/asymptote-collision';
import UTurnSlingshotAtom from './series-62-bezier-curve/u-turn-slingshot';
import IntersectionOverpassAtom from './series-62-bezier-curve/intersection-overpass';
import TensionCatenaryAtom from './series-62-bezier-curve/tension-catenary';
import MasterSplineSmoothAtom from './series-62-bezier-curve/master-spline-smooth';

// ── Series 63: The Elastic Yield ───────────────────────────────
import TrampolineReboundAtom from './series-63-elastic-yield/trampoline-rebound';
import BowedReedAtom from './series-63-elastic-yield/bowed-reed';
import SlingshotComebackAtom from './series-63-elastic-yield/slingshot-comeback';
import ViscoelasticCreepAtom from './series-63-elastic-yield/viscoelastic-creep';
import TensionNetWeaveAtom from './series-63-elastic-yield/tension-net-weave';
import ShockAbsorberSpongeAtom from './series-63-elastic-yield/shock-absorber-sponge';
import ShapeMemoryRecallAtom from './series-63-elastic-yield/shape-memory-recall';
import ImpactRadiusReleaseAtom from './series-63-elastic-yield/impact-radius-release';
import NonNewtonianFloorAtom from './series-63-elastic-yield/non-newtonian-floor';
import InvincibleMembraneAtom from './series-63-elastic-yield/invincible-membrane';

// ── Series 64: The Momentum Theft ──────────────────────────────
import KineticSiphonTransferAtom from './series-64-momentum-theft/kinetic-siphon-transfer';
import GravityAssistSlingshotAtom from './series-64-momentum-theft/gravity-assist-slingshot';
import InelasticLatchFuseAtom from './series-64-momentum-theft/inelastic-latch-fuse';
import GearReversalFlipAtom from './series-64-momentum-theft/gear-reversal-flip';
import TrebuchetCounterweightAtom from './series-64-momentum-theft/trebuchet-counterweight';
import ValveRedirectThrustAtom from './series-64-momentum-theft/valve-redirect-thrust';
import WhipCrackPropagationAtom from './series-64-momentum-theft/whip-crack-propagation';
import AngularTheftStabilizeAtom from './series-64-momentum-theft/angular-theft-stabilize';
import SlipstreamDraftAtom from './series-64-momentum-theft/slipstream-draft';
import AbsoluteRobberyAtom from './series-64-momentum-theft/absolute-robbery';

// ── Series 65: The Slipstream ──────────────────────────────────
import AerodynamicDraftAtom from './series-65-slipstream/aerodynamic-draft';
import LaminarFlowSmoothAtom from './series-65-slipstream/laminar-flow-smooth';
import ThermalUpdraftLiftAtom from './series-65-slipstream/thermal-updraft-lift';
import PathLeastResistanceAtom from './series-65-slipstream/path-least-resistance';
import BowWaveSurfAtom from './series-65-slipstream/bow-wave-surf';
import WakeRidePioneerAtom from './series-65-slipstream/wake-ride-pioneer';
import CapillaryActionRiseAtom from './series-65-slipstream/capillary-action-rise';
import PhaseAlignmentGateAtom from './series-65-slipstream/phase-alignment-gate';
import BuoyantAscentReleaseAtom from './series-65-slipstream/buoyant-ascent-release';
import ZeroDragTeardropAtom from './series-65-slipstream/zero-drag-teardrop';

// ─ Series 66: The Centrifuge ──────────────────────────────────
import RotationalBoundaryAtom from './series-66-centrifuge/rotational-boundary';
import AngularVelocityShedAtom from './series-66-centrifuge/angular-velocity-shed';
import VortexCoreStillnessAtom from './series-66-centrifuge/vortex-core-stillness';
import GyroscopicStabilizerAtom from './series-66-centrifuge/gyroscopic-stabilizer';
import ParticleSeparationAtom from './series-66-centrifuge/particle-separation';
import OrbitalDeflectionAtom from './series-66-centrifuge/orbital-deflection';
import FlywheelMomentumAtom from './series-66-centrifuge/flywheel-momentum';
import ExpandingRadiusAtom from './series-66-centrifuge/expanding-radius';
import TetherSnapReleaseAtom from './series-66-centrifuge/tether-snap-release';
import ApexCentrifugeAtom from './series-66-centrifuge/apex-centrifuge';

// ── Series 67: Harmonious Friction ─────────────────────────────
import BlackIceGripAtom from './series-67-harmonious-friction/black-ice-grip';
import BrakeCaliperStopAtom from './series-67-harmonious-friction/brake-caliper-stop';
import GrindstoneEdgeAtom from './series-67-harmonious-friction/grindstone-edge';
import IgnitionSparkStrikeAtom from './series-67-harmonious-friction/ignition-spark-strike';
import MeshedGearsLockAtom from './series-67-harmonious-friction/meshed-gears-lock';
import TractionLossGritAtom from './series-67-harmonious-friction/traction-loss-grit';
import CleavingWedgeBreakAtom from './series-67-harmonious-friction/cleaving-wedge-break';
import SoundingBoardRicochetAtom from './series-67-harmonious-friction/sounding-board-ricochet';
import MicroAdjustmentSteerAtom from './series-67-harmonious-friction/micro-adjustment-steer';
import ApexCarveSlalomAtom from './series-67-harmonious-friction/apex-carve-slalom';

// ── Series 68: The Counter-Balance ─────────────────────────────
import PendulumDampenerAtom from './series-68-counter-balance/pendulum-dampener';
import CounterSteerSkidAtom from './series-68-counter-balance/counter-steer-skid';
import BallastDropGravityAtom from './series-68-counter-balance/ballast-drop-gravity';
import MicroWeightCalibrateAtom from './series-68-counter-balance/micro-weight-calibrate';
import SlacklineBalanceAtom from './series-68-counter-balance/slackline-balance';
import OutriggerExpandAtom from './series-68-counter-balance/outrigger-expand';
import PhaseCancellationWaveAtom from './series-68-counter-balance/phase-cancellation-wave';
import DelayedShiftWaitAtom from './series-68-counter-balance/delayed-shift-wait';
import TensionStrutTensegrityAtom from './series-68-counter-balance/tension-strut-tensegrity';
import ApexEquilibriumAtom from './series-68-counter-balance/apex-equilibrium';

// ── Series 69: Minimum Effective Dose ──────────────────────────
import ArchimedesLeverAtom from './series-69-minimum-effective-dose/archimedes-lever';
import OnePixelTapAtom from './series-69-minimum-effective-dose/one-pixel-tap';
import LeadDominoCascadeAtom from './series-69-minimum-effective-dose/lead-domino-cascade';
import ResonantFrequencyShatterAtom from './series-69-minimum-effective-dose/resonant-frequency-shatter';
import UnfilledSpaceSilenceAtom from './series-69-minimum-effective-dose/unfilled-space-silence';
import KeystoneRemovalAtom from './series-69-minimum-effective-dose/keystone-removal';
import BoilingPointDegreeAtom from './series-69-minimum-effective-dose/boiling-point-degree';
import AcupunctureNeedleAtom from './series-69-minimum-effective-dose/acupuncture-needle';
import TrimTabCorrectionAtom from './series-69-minimum-effective-dose/trim-tab-correction';
import ApexEconomyAtom from './series-69-minimum-effective-dose/apex-economy';

// ── Series 70: The Wu Wei Master ───────────────────────────────
import MuddyWaterSettleAtom from './series-70-wu-wei-master/muddy-water-settle';
import ChineseFingerTrapAtom from './series-70-wu-wei-master/chinese-finger-trap';
import UnfedFireStarveAtom from './series-70-wu-wei-master/unfed-fire-starve';
import MutualAnnihilationAtom from './series-70-wu-wei-master/mutual-annihilation';
import FalseAlarmIgnoreAtom from './series-70-wu-wei-master/false-alarm-ignore';
import PermeableMembraneAtom from './series-70-wu-wei-master/permeable-membrane';
import TangledKnotSlackAtom from './series-70-wu-wei-master/tangled-knot-slack';
import VacuumPullMagnetismAtom from './series-70-wu-wei-master/vacuum-pull-magnetism';
import GhostNodeDisidentifyAtom from './series-70-wu-wei-master/ghost-node-disidentify';
import ApexWuWeiAtom from './series-70-wu-wei-master/apex-wu-wei';

export const ATOM_COMPONENTS: Partial<Record<AtomId, React.ComponentType<AtomProps>>> = {
  'chrono-kinetic': ChronoKineticAtom,
  'phase-shift': PhaseShiftAtom,
  'z-axis-parallax': ZAxisParallaxAtom,
  'somatic-resonance': SomaticResonanceAtom,
  'constructive-destructive': ConstructiveDestructiveAtom,
  'cryptographic': CryptographicAtom,
  'symbiotic': SymbioticAtom,
  'optical': OpticalAtom,
  'equilibrium': EquilibriumAtom,
  'thermodynamic': ThermodynamicAtom,
  'wave-collapse': WaveCollapseAtom,
  'schrodinger-box': SchrodingerBoxAtom,
  'double-slit': DoubleSlitAtom,
  'many-worlds': ManyWorldsAtom,
  'entanglement': EntanglementAtom,
  'uncertainty-blur': UncertaintyBlurAtom,
  'quantum-tunnel': QuantumTunnelAtom,
  'zero-point-field': ZeroPointFieldAtom,
  'retrocausal': RetrocausalAtom,
  'holographic': HolographicAtom,
  'l-system-branching': LSystemBranchingAtom,
  'boids-flocking': BoidsFlockingAtom,
  'composting': CompostingAtom,
  'mycelial-routing': MycelialRoutingAtom,
  'symbiosis': SymbiosisAtom,
  'pruning': PruningAtom,
  'dormancy': DormancyAtom,
  'ecosystem-balancer': EcosystemBalancerAtom,
  'pollination': PollinationAtom,
  'erosion': ErosionAtom,
  'sensory-deprivation': SensoryDeprivationAtom,
  'un-naming': UnNamingAtom,
  'figure-ground-reversal': FigureGroundReversalAtom,
  'vacuum-seal': VacuumSealAtom,
  'dark-matter': DarkMatterAtom,
  'static-clear': StaticClearAtom,
  'apneic-pause': ApneicPauseAtom,
  'format-reset': FormatResetAtom,
  'noise-gate': NoiseGateAtom,
  'singularity': SingularityAtom,
  'phase-lock': PhaseLockAtom,
  'vagal-hum': VagalResonanceAtom,
  'isochronic-pacer': IsochronicPacerAtom,
  'cymatic-coherence': CymaticCoherenceAtom,
  'audio-zoom': AudioZoomAtom,
  'brown-noise': BrownNoiseAtom,
  'tempo-override': TempoOverrideAtom,
  'crescendo': CrescendoAtom,
  'standing-wave': StandingWaveAtom,
  'silent-rest': SilentRestAtom,
  'fourth-wall-break': FourthWallBreakAtom,
  'lag-spike': LagSpikeAtom,
  'phantom-alert': PhantomAlertAtom,
  'kernel-panic': KernelPanicAtom,
  'algorithm-jammer': AlgorithmJammerAtom,
  'reality-tear': RealityTearAtom,
  'muscle-memory': MuscleMemoryAtom,
  'pixelation': PixelationAtom,
  'attention-paywall': AttentionPaywallAtom,
  'semantic-crash': SemanticCrashAtom,
  'audio-rescore': AudioRescoreAtom,
  'chromatic-grade': ChromaticGradeAtom,
  'narrative-flip': NarrativeFlipAtom,
  'splicing-timeline': SplicingTimelineAtom,
  'prequel-context': PrequelContextAtom,
  'metadata-rewrite': MetadataRewriteAtom,
  'forgiveness-filter': ForgivenessFilterAtom,
  'ancestral-cut': AncestralCutAtom,
  'time-travel-rescue': TimeTravelRescueAtom,
  'third-person-shift': ThirdPersonShiftAtom,
  'overview-effect': OverviewEffectAtom,
  'fractal-zoom': FractalZoomAtom,
  'deep-time': DeepTimeAtom,
  'systemic-zoom': SystemicZoomAtom,
  'ego-zoom': EgoZoomAtom,
  'micro-step': MicroStepAtom,
  'vastness-expansion': VastnessExpansionAtom,
  'horizon-infinite': HorizonInfiniteAtom,
  'stardust-dissolve': StardustDissolveAtom,
  'holographic-drop': HolographicDropAtom,
  'crucible-fire': CrucibleFireAtom,
  'shadow-hug': ShadowHugAtom,
  'projection-mirror': ProjectionMirrorAtom,
  'solve-coagula': SolveCoagulaAtom,
  'paradox-tension': ParadoxTensionAtom,
  'monster-taming': MonsterTamingAtom,
  'shame-compass': ShameCompassAtom,
  'anger-forge': AngerForgeAtom,
  'inner-child': InnerChildAtom,
  'phoenix-ash': PhoenixAshAtom,
  'atmosphere-weather': AtmosphereWeatherAtom,
  'distortion-grid': DistortionGridAtom,
  'belief-bridge': BeliefBridgeAtom,
  'future-memory': FutureMemoryAtom,
  'luck-surface': LuckSurfaceAtom,
  'possibility-prism': PossibilityPrismAtom,
  'architect-stone': ArchitectStoneAtom,
  'narrative-override': NarrativeOverrideAtom,
  'pure-yes': PureYesAtom,
  'infinite-ouroboros': InfiniteOuroborosAtom,
  // ── Collection 2: The Telemetric Navigator ───────────────
  'centrifuge-engine': CentrifugeEngineAtom,
  'ladder-of-inference': LadderOfInferenceAtom,
  'logic-gate': LogicGateAtom,
  'steel-man': SteelManAtom,
  'blind-spot': BlindSpotAtom,
  'sunk-cost-severance': SunkCostSeveranceAtom,
  'absurdity-deflation': AbsurdityDeflationAtom,
  'first-principles': FirstPrinciplesAtom,
  'echo-cancellation': EchoCancellationAtom,
  'axiomatic-seal': AxiomaticSealAtom,
  // ── Series 12: Friction Mechanics ──────────────────────────
  'inertia-break': InertiaBreakAtom,
  'micro-step-shrink': MicroStepShrinkAtom,
  'ulysses-pact': UlyssesPactAtom,
  'friction-injection': FrictionInjectionAtom,
  'flywheel': FlywheelAtom,
  'good-enough': GoodEnoughAtom,
  'burn-rate': BurnRateAtom,
  'vector-pivot': VectorPivotAtom,
  'friction-polish': FrictionPolishAtom,
  'kinetic-seal': KineticSealAtom,
  // ── Series 13: Semantic Translators ────────────────────────
  'subtext-scanner': SubtextScannerAtom,
  'translator-peel': TranslatorPeelAtom,
  'yet-append': YetAppendAtom,
  'conjunction-shift': ConjunctionShiftAtom,
  'headline-rewrite': HeadlineRewriteAtom,
  'label-inception': LabelInceptionAtom,
  'meaning-mine': MeaningMineAtom,
  'absurdity-filter': AbsurdityFilterAtom,
  'silent-mirror': SilentMirrorAtom,
  'interpreter-seal': InterpreterSealAtom,
  // ── Series 14: Social Physics ──────────────────────────────
  'reverse-orbit': ReverseOrbitAtom,
  'forcefield': ForcefieldAtom,
  'status-seesaw': StatusSeesawAtom,
  'empathy-bridge': EmpathyBridgeAtom,
  'aikido-redirect': AikidoRedirectAtom,
  'social-battery': SocialBatteryAtom,
  'gossip-firewall': GossipFirewallAtom,
  'lighthouse': LighthouseAtom,
  'roche-limit': RocheLimitAtom,
  'diplomat-seal': DiplomatSealAtom,
  // ── Series 15: Time Capsule & Future Weaving ───────────────
  'open-when': OpenWhenAtom,
  'rage-vault': RageVaultAtom,
  'prediction-stake': PredictionStakeAtom,
  'dead-mans-switch': DeadMansSwitchAtom,
  'regret-minimization': RegretMinimizationAtom,
  'pre-hindsight': PreHindsightAtom,
  'branch-pruner': BranchPrunerAtom,
  'worst-case-simulator': WorstCaseSimulatorAtom,
  'ten-year-echo': TenYearEchoAtom,
  'capsule-seal': CapsuleSealAtom,
  // ── Series 16: Soma & Perception ───────────────────────────
  'skin-map': SkinMapAtom,
  'pulse-reader': PulseReaderAtom,
  'fascia-wave': FasciaWaveAtom,
  'proprioception': ProprioceptionAtom,
  'micro-texture': MicroTextureAtom,
  'voice-box': VoiceBoxAtom,
  'blind-walk': BlindWalkAtom,
  'temperature-scan': TemperatureScanAtom,
  'gut-signal': GutSignalAtom,
  'soma-seal': SomaSealAtom,
  // ── Series 17: Diplomat & Empathy ──────────────────────────
  'mirror-shield': MirrorShieldAtom,
  'truce-table': TruceTableAtom,
  'perspective-swap': PerspectiveSwapAtom,
  'translation-ear': TranslationEarAtom,
  'boundary-dance': BoundaryDanceAtom,
  'third-chair': ThirdChairAtom,
  'steel-man-build': SteelManBuildAtom,
  'de-escalation': DeEscalationAtom,
  'mirror-neuron': MirrorNeuronAtom,
  'common-ground-seal': CommonGroundSealAtom,
  // ── Series 18: Visionary & Strategist ─────────────────────
  'essentialism': EssentialismAtom,
  'compound-interest': CompoundInterestAtom,
  'deep-work': DeepWorkAtom,
  'leverage-engine': LeverageEngineAtom,
  'horizon-scan': HorizonScanAtom,
  'obstacle-flip': ObstacleFlipAtom,
  'courage-map': CourageMapAtom,
  'abundance-scan': AbundanceScanAtom,
  'permissionless': PermissionlessAtom,
  'becoming-seal': BecomingSealAtom,
  // ── Series 19: Mystic & Infinite Player ────────────────────
  'maya-veil': MayaVeilAtom,
  'no-self': NoSelfAtom,
  'cosmic-joke': CosmicJokeAtom,
  'space-between': SpaceBetweenAtom,
  'beginners-mind': BeginnersMindAtom,
  'dance-of-shiva': DanceOfShivaAtom,
  'unplanned-hour': UnplannedHourAtom,
  'wonder-walk': WonderWalkAtom,
  'light-source': LightSourceAtom,
  'mystic-seal': MysticSealAtom,
  // ── Series 20: The Omega & Integration ─────────────────────
  'prism-return': PrismReturnAtom,
  'golden-spiral': GoldenSpiralAtom,
  'time-collapse': TimeCollapseAtom,
  'mirror-of-truth': MirrorOfTruthAtom,
  'event-horizon': EventHorizonAtom,
  'alpha-omega': AlphaOmegaAtom,
  'circle-close': CircleCloseAtom,
  'final-exhale': FinalExhaleAtom,
  'tail-swallow': TailSwallowAtom,
  'atlas-seal': AtlasSealAtom,
  // ── Collection 3: The Transcendent Witness ────────────────
  // ── Series 21: Metacognitive Mirror ────────────────────────
  'theater-lens': TheaterLensAtom,
  'focal-glass': FocalGlassAtom,
  'syntactic-severance': SyntacticSeveranceAtom,
  'traffic-observer': TrafficObserverAtom,
  'sky-and-clouds': SkyAndCloudsAtom,
  'empty-boat': EmptyBoatAtom,
  'glass-wall': GlassWallAtom,
  'echomaker': EchomakerAtom,
  'holographic-parallax': HolographicParallaxAtom,
  'observer-seal': ObserverSealAtom,
  // ── Series 22: The Predictive Override ───────────────────────
  'semantic-stripping': SemanticStrippingAtom,
  'raw-data': RawDataAtom,
  'color-deconstruct': ColorDeconstructAtom,
  'taste-explode': TasteExplodeAtom,
  'acoustic-unnaming': AcousticUnnamingAtom,
  'tabula-rasa': TabulaRasaAtom,
  'wabi-sabi': WabiSabiAtom,
  'somatic-trust': SomaticTrustAtom,
  'texture-touch': TextureTouchAtom,
  'perception-seal': PerceptionSealAtom,
  // ── Series 23: Fluidity Mechanics ──────────────────────────────
  'binary-breaker': BinaryBreakerAtom,
  'water-mode': WaterModeAtom,
  'identity-fluidity': IdentityFluidityAtom,
  'harmonic-synthesis': HarmonicSynthesisAtom,
  'wu-wei': WuWeiAtom,
  'thawing': ThawingAtom,
  'proteus': ProteusAtom,
  'ocean-depth': OceanDepthAtom,
  'complexity-breath': ComplexityBreathAtom,
  'shifter-seal': ShifterSealAtom,
  // ── Series 24: Net of Indra ────────────────────────────────────
  'indra-node': IndraNodeAtom,
  'mutual-respiration': MutualRespirationAtom,
  'mycelium-network': MyceliumNetworkAtom,
  'dmn-deactivation': DmnDeactivationAtom,
  'echo-chamber': EchoChamberAtom,
  'murmuration': MurmurationAtom,
  'gravity-well': GravityWellAtom,
  'butterfly-effect': ButterflyEffectAtom,
  'interference-pattern': InterferencePatternAtom,
  'cosmic-tapestry-seal': CosmicTapestrySealAtom,
  // ── Series 25: The Dialectical Engine ──────────────────────────
  'tensegrity': TensegrityAtom,
  'both-and': BothAndAtom,
  'zen-koan': ZenKoanAtom,
  'complementary-color': ComplementaryColorAtom,
  'pendulum-arrest': PendulumArrestAtom,
  'magnetic-suspension': MagneticSuspensionAtom,
  'acceptance-change': AcceptanceChangeAtom,
  'mobius-strip': MobiusStripAtom,
  'weight-of-opposites': WeightOfOppositesAtom,
  'dialectical-seal': DialecticalSealAtom,
  // ── Series 26: Identity Decoupling ─────────────────────────────
  'matryoshka': MatryoshkaAtom,
  'armor-drop': ArmorDropAtom,
  'predicate-eraser': PredicateEraserAtom,
  'costume-closet': CostumeClosetAtom,
  'time-lapse-mirror': TimeLapseMirrorAtom,
  'resume-burner': ResumeBurnerAtom,
  'space-container': SpaceContainerAtom,
  'nobody': NobodyAtom,
  're-entry': ReEntryAtom,
  'soul-seal': SoulSealAtom,
  // ── Series 27: The Cosmic Play ─────────────────────────────────
  'destination-override': DestinationOverrideAtom,
  'sand-mandala': SandMandalaAtom,
  'toy-box': ToyBoxAtom,
  'sisyphus-smile': SisyphusSmileAtom,
  'improvisation': ImprovisationAtom,
  'stakes-free': StakesFreeAtom,
  'character-drop': CharacterDropAtom,
  'juggler': JugglerAtom,
  'infinite-canvas': InfiniteCanvasAtom,
  'lila-seal': LilaSealAtom,
  // ── Series 28: The Impermanence Engine ─────────────────────────
  'open-palm': OpenPalmAtom,
  'evaporation': EvaporationAtom,
  'autumn-leaf': AutumnLeafAtom,
  'wave-decay': WaveDecayAtom,
  'ebb-tide': EbbTideAtom,
  'metamorphosis': MetamorphosisAtom,
  'exhale-cycle': ExhaleCycleAtom,
  'kintsugi': KintsugiAtom,
  'sunset': SunsetAtom,
  'anicca-seal': AniccaSealAtom,
  // ── Series 29: The Interoceptive Anchor ────────────────────────
  'bio-mirror': BioMirrorAtom,
  'respiration-pendulum': RespirationPendulumAtom,
  'plumb-line': PlumbLineAtom,
  'cymatic-resonance': CymaticResonanceAtom,
  'focal-collapse': FocalCollapseAtom,
  'tectonic-drop': TectonicDropAtom,
  'micro-tremor': MicroTremorAtom,
  'thermal-boundary': ThermalBoundaryAtom,
  'weight-of-world': WeightOfWorldAtom,
  'anchor-seal': AnchorSealAtom,
  // ── Series 30: The Loving Awareness ────────────────────────────
  'shadow-embrace': ShadowEmbraceAtom,
  'metta-radiance': MettaRadianceAtom,
  'golden-thread': GoldenThreadAtom,
  'altar': AltarAtom,
  'namaste-lens': NamasteLensAtom,
  'karmic-severance': KarmicSeveranceAtom,
  'infinite-heart': InfiniteHeartAtom,
  'i-am': IAmAtom,
  'ocean-drop': OceanDropAtom,
  'atlas-omega': AtlasOmegaAtom,
  // ── Collection 4: The Alchemical Synthesizer ────────────────
  // ── Series 31: The Particle Collider ────────────────────────
  'synthesis-strike': SynthesisStrikeAtom,
  'magnetic-paradox': MagneticParadoxAtom,
  'orbital-decay': OrbitalDecayAtom,
  'asymmetric-smash': AsymmetricSmashAtom,
  'velocity-threshold': VelocityThresholdAtom,
  'fragmentation-engine': FragmentationEngineAtom,
  'elastic-snapback': ElasticSnapbackAtom,
  'glancing-blow': GlancingBlowAtom,
  'triangulation': TriangulationAtom,
  'absolute-zero': AbsoluteZeroAtom,
  // ── Series 32: The Cymatic Engine ───────────────────────────
  'base-frequency': BaseFrequencyAtom,
  'dissonant-chord': DissonantChordAtom,
  'resonant-shatter': ResonantShatterAtom,
  'silence-gap': SilenceGapAtom,
  'harmonic-stack': HarmonicStackAtom,
  'sub-bass-drop': SubBassDropAtom,
  'amplitude-surge': AmplitudeSurgeAtom,
  'noise-filter': NoiseFilterAtom,
  'chladni-organization': ChladniOrganizationAtom,
  'cymatic-link': CymaticLinkAtom,
  // ── Series 33: The Catalyst Web ─────────────────────────────
  'central-node': CentralNodeAtom,
  'constellation-link': ConstellationLinkAtom,
  'gravity-inversion': GravityInversionAtom,
  'tangled-thread': TangledThreadAtom,
  'magnetic-snap': MagneticSnapAtom,
  'neural-pruning': NeuralPruningAtom,
  'ripple-effect': RippleEffectAtom,
  'alignment-grid': AlignmentGridAtom,
  'domino-vector': DominoVectorAtom,
  'orbit-stabilizer': OrbitStabilizerAtom,
  // ── Series 34: The Chaos Loom ───────────────────────────────
  'loom-anchor': LoomAnchorAtom,
  'spindle-focus': SpindleFocusAtom,
  'fabric-tear': FabricTearAtom,
  'braided-cord': BraidedCordAtom,
  'tension-snap': TensionSnapAtom,
  'warp-and-weft': WarpAndWeftAtom,
  'suture-mend': SutureMendAtom,
  'web-spinner': WebSpinnerAtom,
  'knot-release': KnotReleaseAtom,
  'tapestry-integration': TapestryIntegrationAtom,
  // ── Series 35: The Pressure Vessel ──────────────────────────
  'compression-diamond': CompressionDiamondAtom,
  'vacuum-chamber': VacuumChamberAtom,
  'hydraulic-press': HydraulicPressAtom,
  'pressure-cook': PressureCookAtom,
  'carbon-layer': CarbonLayerAtom,
  'fault-line-release': FaultLineReleaseAtom,
  'depth-pressure': DepthPressureAtom,
  'implosion-core': ImplosionCoreAtom,
  'steam-valve': SpringTemperAtom,
  'crystal-lattice': ForgeSealAtom,
  // ── Series 36: The Friction Spark ─────────────────────────
  'flint-strike': FlintStrikeAtom,
  'piston-pump': PistonPumpAtom,
  'hand-crank': HandCrankAtom,
  'velocity-sled': VelocitySledAtom,
  'bowstring-draw': BowstringDrawAtom,
  'dynamo-spin': DynamoSpinAtom,
  'heat-sink': HeatSinkAtom,
  'resonance-cascade': ResonanceCascadeAtom,
  'kinetic-battery': KineticBatteryAtom,
  'bellows-breath': BellowsBreathAtom,
  // ── Series 37: The Conduit Flow ───────────────────────────
  'lightning-rod': LightningRodAtom,
  'aqueduct-channel': AqueductChannelAtom,
  'prism-spectrum': PrismSpectrumAtom,
  'transformer-coil': TransformerCoilAtom,
  'capillary-action': CapillaryActionAtom,
  'fiber-optic': FiberOpticAtom,
  'venturi-effect': VenturiEffectAtom,
  'superconductor': SuperconductorAtom,
  'tesla-coil': TeslaCoilAtom,
  'circuit-complete': CircuitCompleteAtom,
  // ── Series 38: The Magnetic Sieve ───────────────────────────
  'gravity-drop': GravityDropAtom,
  'polarity-shift': PolarityShiftAtom,
  'centrifuge-spin': CentrifugeSpinAtom,
  'winnowing-wind': WinnowingWindAtom,
  'noise-threshold': NoiseThresholdAtom,
  'decant-pour': DecantPourAtom,
  'magnetic-pull': MagneticPullAtom,
  'evaporation-patience': EvaporationPatienceAtom,
  'gold-pan': GoldPanAtom,
  'singularity-focus': SingularityFocusAtom,
  // ── Series 39: The Momentum Wheel ───────────────────────────
  'heavy-flywheel': HeavyFlywheelAtom,
  'pendulum-swing': PendulumSwingAtom,
  'gear-mesh': GearMeshAtom,
  'gyroscope-balance': GyroscopeBalanceAtom,
  'snowball-roll': SnowballRollAtom,
  'lever-advantage': LeverAdvantageAtom,
  'siphon-transfer': SiphonTransferAtom,
  'escapement-tick': EscapementTickAtom,
  'slingshot-orbit': SlingshotOrbitAtom,
  'perpetual-motion': PerpetualMotionAtom,
  // ── Series 40: The Synthesis Forge ──────────────────────────
  'crucible-heat': CrucibleHeatAtom,
  'alloy-fusion': AlloyFusionAtom,
  'casting-mold': CastingMoldAtom,
  'quench-harden': QuenchHardenAtom,
  'annealing-relief': AnnealingReliefAtom,
  'slag-skim': SlagSkimAtom,
  'arc-weld': ArcWeldAtom,
  'hammer-forge': HammerForgeAtom,
  'polish-refine': PolishRefineAtom,
  'master-forge': MasterForgeAtom,
  // ── Collection 7: The Fluid Tactician ─────────────────────
  // ── Series 61: Aikido Redirect ──────────────────────────────
  'linear-strike-redirect': LinearStrikeRedirectAtom,
  'heavy-momentum-throw': HeavyMomentumThrowAtom,
  'corner-trap-pivot': CornerTrapPivotAtom,
  'escalation-cool': EscalationCoolAtom,
  'kinetic-return-curve': KineticReturnCurveAtom,
  'rigid-stance-sidestep': RigidStanceSidestepAtom,
  'multiple-fronts-flow': MultipleFrontsFlowAtom,
  'false-target-matador': FalseTargetMatadorAtom,
  'frictionless-plane': FrictionlessPlaneAtom,
  'kinetic-conversion-turbine': KineticConversionTurbineAtom,
  // ── Series 62: Bezier Curve ─────────────────────────────────
  'sharp-corner-handle': SharpCornerHandleAtom,
  'sawtooth-spline': SawtoothSplineAtom,
  'binary-fork-merge': BinaryForkMergeAtom,
  'forced-detour-arc': ForcedDetourArcAtom,
  'tangent-handle-retract': TangentHandleRetractAtom,
  'asymptote-collision': AsymptoteCollisionAtom,
  'u-turn-slingshot': UTurnSlingshotAtom,
  'intersection-overpass': IntersectionOverpassAtom,
  'tension-catenary': TensionCatenaryAtom,
  'master-spline-smooth': MasterSplineSmoothAtom,
  // ── Series 63: Elastic Yield ───────────────────────────────
  'trampoline-rebound': TrampolineReboundAtom,
  'bowed-reed': BowedReedAtom,
  'slingshot-comeback': SlingshotComebackAtom,
  'viscoelastic-creep': ViscoelasticCreepAtom,
  'tension-net-weave': TensionNetWeaveAtom,
  'shock-absorber-sponge': ShockAbsorberSpongeAtom,
  'shape-memory-recall': ShapeMemoryRecallAtom,
  'impact-radius-release': ImpactRadiusReleaseAtom,
  'non-newtonian-floor': NonNewtonianFloorAtom,
  'invincible-membrane': InvincibleMembraneAtom,
  // ── Series 64: Momentum Theft ───────────────────────────────
  'kinetic-siphon-transfer': KineticSiphonTransferAtom,
  'gravity-assist-slingshot': GravityAssistSlingshotAtom,
  'inelastic-latch-fuse': InelasticLatchFuseAtom,
  'gear-reversal-flip': GearReversalFlipAtom,
  'trebuchet-counterweight': TrebuchetCounterweightAtom,
  'valve-redirect-thrust': ValveRedirectThrustAtom,
  'whip-crack-propagation': WhipCrackPropagationAtom,
  'angular-theft-stabilize': AngularTheftStabilizeAtom,
  'slipstream-draft': SlipstreamDraftAtom,
  'absolute-robbery': AbsoluteRobberyAtom,
  // ── Series 65: The Slipstream ──────────────────────────────
  'aerodynamic-draft': AerodynamicDraftAtom,
  'laminar-flow-smooth': LaminarFlowSmoothAtom,
  'thermal-updraft-lift': ThermalUpdraftLiftAtom,
  'path-least-resistance': PathLeastResistanceAtom,
  'bow-wave-surf': BowWaveSurfAtom,
  'wake-ride-pioneer': WakeRidePioneerAtom,
  'capillary-action-rise': CapillaryActionRiseAtom,
  'phase-alignment-gate': PhaseAlignmentGateAtom,
  'buoyant-ascent-release': BuoyantAscentReleaseAtom,
  'zero-drag-teardrop': ZeroDragTeardropAtom,
  // ── Series 66: The Centrifuge ──────────────────────────────
  'rotational-boundary': RotationalBoundaryAtom,
  'angular-velocity-shed': AngularVelocityShedAtom,
  'vortex-core-stillness': VortexCoreStillnessAtom,
  'gyroscopic-stabilizer': GyroscopicStabilizerAtom,
  'particle-separation': ParticleSeparationAtom,
  'orbital-deflection': OrbitalDeflectionAtom,
  'flywheel-momentum': FlywheelMomentumAtom,
  'expanding-radius': ExpandingRadiusAtom,
  'tether-snap-release': TetherSnapReleaseAtom,
  'apex-centrifuge': ApexCentrifugeAtom,
  // ── Series 67: Harmonious Friction ──────────────────────────
  'black-ice-grip': BlackIceGripAtom,
  'brake-caliper-stop': BrakeCaliperStopAtom,
  'grindstone-edge': GrindstoneEdgeAtom,
  'ignition-spark-strike': IgnitionSparkStrikeAtom,
  'meshed-gears-lock': MeshedGearsLockAtom,
  'traction-loss-grit': TractionLossGritAtom,
  'cleaving-wedge-break': CleavingWedgeBreakAtom,
  'sounding-board-ricochet': SoundingBoardRicochetAtom,
  'micro-adjustment-steer': MicroAdjustmentSteerAtom,
  'apex-carve-slalom': ApexCarveSlalomAtom,
  // ── Series 68: The Counter-Balance ──────────────────────────
  'pendulum-dampener': PendulumDampenerAtom,
  'counter-steer-skid': CounterSteerSkidAtom,
  'ballast-drop-gravity': BallastDropGravityAtom,
  'micro-weight-calibrate': MicroWeightCalibrateAtom,
  'slackline-balance': SlacklineBalanceAtom,
  'outrigger-expand': OutriggerExpandAtom,
  'phase-cancellation-wave': PhaseCancellationWaveAtom,
  'delayed-shift-wait': DelayedShiftWaitAtom,
  'tension-strut-tensegrity': TensionStrutTensegrityAtom,
  'apex-equilibrium': ApexEquilibriumAtom,
  // ── Series 69: Minimum Effective Dose ───────────────────────
  'archimedes-lever': ArchimedesLeverAtom,
  'one-pixel-tap': OnePixelTapAtom,
  'lead-domino-cascade': LeadDominoCascadeAtom,
  'resonant-frequency-shatter': ResonantFrequencyShatterAtom,
  'unfilled-space-silence': UnfilledSpaceSilenceAtom,
  'keystone-removal': KeystoneRemovalAtom,
  'boiling-point-degree': BoilingPointDegreeAtom,
  'acupuncture-needle': AcupunctureNeedleAtom,
  'trim-tab-correction': TrimTabCorrectionAtom,
  'apex-economy': ApexEconomyAtom,
  // ── Series 70: The Wu Wei Master ────────────────────────────
  'muddy-water-settle': MuddyWaterSettleAtom,
  'chinese-finger-trap': ChineseFingerTrapAtom,
  'unfed-fire-starve': UnfedFireStarveAtom,
  'mutual-annihilation': MutualAnnihilationAtom,
  'false-alarm-ignore': FalseAlarmIgnoreAtom,
  'permeable-membrane': PermeableMembraneAtom,
  'tangled-knot-slack': TangledKnotSlackAtom,
  'vacuum-pull-magnetism': VacuumPullMagnetismAtom,
  'ghost-node-disidentify': GhostNodeDisidentifyAtom,
  'apex-wu-wei': ApexWuWeiAtom,
};