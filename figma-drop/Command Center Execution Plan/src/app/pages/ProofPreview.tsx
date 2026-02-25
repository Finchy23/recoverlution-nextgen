/**
 * PROOF PREVIEW
 * =============
 *
 * Test harness for the Second Millennium series:
 *   S101 Projector  (Theater form, 1001-1010)  -- 10 specimens
 *   S102 Chronomancer (Cosmos form, 1011-1020) -- 10 specimens
 *   S103 Resonator   (Ocean form, 1021-1030)   -- 10 specimens
 *   S104 Materialist  (Ember form, 1031-1040)  -- 10 specimens
 *   S105 Refractor   (Stellar form, 1041-1050)  -- 10 specimens
 *   S106 Engine      (Circuit form, 1051-1060)  -- 10 specimens
 *   S107 Catalyst    (Glacier form, 1061-1070) -- 10 specimens
 *   S108 Quantum Architect (Tide form, 1071-1080) -- 10 specimens
 *   S109 Transmuter  (Ember form, 1081-1090)  -- 10 specimens
 *   S110 Cyberneticist (Circuit form, 1091-1100) -- 10 specimens
 *   S111 FieldArchitect (Stellar form, 1101-1110) -- 10 specimens
 *   S112 Kineticist (Storm form, 1111-1120) -- 10 specimens
 *   S113 Crystal (Glacier form, 1121-1130) -- 10 specimens
 *   S114 Hydrodynamicist (Tide form, 1131-1140) -- 10 specimens
 *   S115 Aviator (Drift form, 1141-1150) -- 10 specimens
 *   S116 Tensegrity (Lattice form, 1151-1160) -- 10 specimens
 *   S117 Wayfinder (Compass form, 1161-1170) -- 10 specimens
 *   S118 Receiver (Pulse form, 1171-1180) -- 10 specimens
 *   S119 Vector (Drift form, 1181-1190) -- 10 specimens
 *   S120 Tuning (Echo form, 1191-1200) -- 10 specimens
 *
 * Cycles through each specimen to validate that the compositor-driven
 * system (scene, atmosphere mode, entry choreography, color temperature,
 * typography mood, transition style) works end-to-end.
 *
 * Route: /proof-preview
 *
 * The compositor output is shown in a debug panel so we can verify
 * the seeded PRNG is producing the expected variety across all 80 specimens.
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { surfaces, fonts } from '@/design-tokens';
import {
  composeNaviCue,
  type CompositorInput,
} from '@/app/design-system/navicue-compositor';
import { NaviCueLabProvider } from '@/app/components/navicue/NaviCueLabContext';

// ── S101 Projector specimens ─────────────────────────────────────
import Projector_FilmSwap from '@/app/components/navicue/implementations/Projector_FilmSwap';
import Projector_BeamFocus from '@/app/components/navicue/implementations/Projector_BeamFocus';
import Projector_LensShift from '@/app/components/navicue/implementations/Projector_LensShift';
import Projector_RealityLag from '@/app/components/navicue/implementations/Projector_RealityLag';
import Projector_TuningFork from '@/app/components/navicue/implementations/Projector_TuningFork';
import Projector_SilentReel from '@/app/components/navicue/implementations/Projector_SilentReel';
import Projector_FourthWall from '@/app/components/navicue/implementations/Projector_FourthWall';
import Projector_SplicePoint from '@/app/components/navicue/implementations/Projector_SplicePoint';
import Projector_GhostLight from '@/app/components/navicue/implementations/Projector_GhostLight';
import Projector_ProjectorSeal from '@/app/components/navicue/implementations/Projector_ProjectorSeal';

// ── S102 Chronomancer specimens ──────────────────────────────────
import Chronomancer_PastEdit from '@/app/components/navicue/implementations/Chronomancer_PastEdit';
import Chronomancer_FutureBorrow from '@/app/components/navicue/implementations/Chronomancer_FutureBorrow';
import Chronomancer_TimeDilation from '@/app/components/navicue/implementations/Chronomancer_TimeDilation';
import Chronomancer_AncestralLink from '@/app/components/navicue/implementations/Chronomancer_AncestralLink';
import Chronomancer_LegacyCast from '@/app/components/navicue/implementations/Chronomancer_LegacyCast';
import Chronomancer_RegretReversal from '@/app/components/navicue/implementations/Chronomancer_RegretReversal';
import Chronomancer_DejaVu from '@/app/components/navicue/implementations/Chronomancer_DejaVu';
import Chronomancer_Wormhole from '@/app/components/navicue/implementations/Chronomancer_Wormhole';
import Chronomancer_EternalNow from '@/app/components/navicue/implementations/Chronomancer_EternalNow';
import Chronomancer_ChronosSeal from '@/app/components/navicue/implementations/Chronomancer_ChronosSeal';

// ── S103 Resonator specimens ────────────────────────────────────
import Resonator_NoiseCancellation from '@/app/components/navicue/implementations/Resonator_NoiseCancellation';
import Resonator_CarrierWave from '@/app/components/navicue/implementations/Resonator_CarrierWave';
import Resonator_ConstructiveInterference from '@/app/components/navicue/implementations/Resonator_ConstructiveInterference';
import Resonator_SympatheticResonance from '@/app/components/navicue/implementations/Resonator_SympatheticResonance';
import Resonator_FeedbackLoop from '@/app/components/navicue/implementations/Resonator_FeedbackLoop';
import Resonator_PureTone from '@/app/components/navicue/implementations/Resonator_PureTone';
import Resonator_VolumeKnob from '@/app/components/navicue/implementations/Resonator_VolumeKnob';
import Resonator_EchoChamber from '@/app/components/navicue/implementations/Resonator_EchoChamber';
import Resonator_FrequencyJammer from '@/app/components/navicue/implementations/Resonator_FrequencyJammer';
import Resonator_ResonatorSeal from '@/app/components/navicue/implementations/Resonator_ResonatorSeal';

// ── S104 Materialist specimens ─────────��─────────────────────────
import Materialist_FirstBrick from '@/app/components/navicue/implementations/Materialist_FirstBrick';
import Materialist_BlueprintEdit from '@/app/components/navicue/implementations/Materialist_BlueprintEdit';
import Materialist_GravityWell from '@/app/components/navicue/implementations/Materialist_GravityWell';
import Materialist_FrictionTest from '@/app/components/navicue/implementations/Materialist_FrictionTest';
import Materialist_Scaffolding from '@/app/components/navicue/implementations/Materialist_Scaffolding';
import Materialist_ConcretePour from '@/app/components/navicue/implementations/Materialist_ConcretePour';
import Materialist_Keystone from '@/app/components/navicue/implementations/Materialist_Keystone';
import Materialist_Demolition from '@/app/components/navicue/implementations/Materialist_Demolition';
import Materialist_Inspection from '@/app/components/navicue/implementations/Materialist_Inspection';
import Materialist_MaterialistSeal from '@/app/components/navicue/implementations/Materialist_MaterialistSeal';

// ── S105 Refractor specimens ────────────────────────────────────
import Refractor_SpectrumSplit from '@/app/components/navicue/implementations/Refractor_SpectrumSplit';
import Refractor_FocalPoint from '@/app/components/navicue/implementations/Refractor_FocalPoint';
import Refractor_DistortionCheck from '@/app/components/navicue/implementations/Refractor_DistortionCheck';
import Refractor_ColorGrade from '@/app/components/navicue/implementations/Refractor_ColorGrade';
import Refractor_BlindSpot from '@/app/components/navicue/implementations/Refractor_BlindSpot';
import Refractor_Polarizer from '@/app/components/navicue/implementations/Refractor_Polarizer';
import Refractor_BlackBody from '@/app/components/navicue/implementations/Refractor_BlackBody';
import Refractor_Laser from '@/app/components/navicue/implementations/Refractor_Laser';
import Refractor_Darkroom from '@/app/components/navicue/implementations/Refractor_Darkroom';
import Refractor_PrismSeal from '@/app/components/navicue/implementations/Refractor_PrismSeal';

// ── S106 Engine specimens ───────────────────────────────────────
import Engine_EntropyCheck from '@/app/components/navicue/implementations/Engine_EntropyCheck';
import Engine_HeatSink from '@/app/components/navicue/implementations/Engine_HeatSink';
import Engine_ClosedLoop from '@/app/components/navicue/implementations/Engine_ClosedLoop';
import Engine_Flywheel from '@/app/components/navicue/implementations/Engine_Flywheel';
import Engine_Insulation from '@/app/components/navicue/implementations/Engine_Insulation';
import Engine_Turbocharger from '@/app/components/navicue/implementations/Engine_Turbocharger';
import Engine_IdleState from '@/app/components/navicue/implementations/Engine_IdleState';
import Engine_FuelMix from '@/app/components/navicue/implementations/Engine_FuelMix';
import Engine_Governor from '@/app/components/navicue/implementations/Engine_Governor';
import Engine_EngineSeal from '@/app/components/navicue/implementations/Engine_EngineSeal';

// ── S107 Catalyst specimens ─────────────────────────────────────
import Catalyst_PhaseChange from '@/app/components/navicue/implementations/Catalyst_PhaseChange';
import Catalyst_Precipitate from '@/app/components/navicue/implementations/Catalyst_Precipitate';
import Catalyst_Titration from '@/app/components/navicue/implementations/Catalyst_Titration';
import Catalyst_Compound from '@/app/components/navicue/implementations/Catalyst_Compound';
import Catalyst_Solvent from '@/app/components/navicue/implementations/Catalyst_Solvent';
import Catalyst_ChainReaction from '@/app/components/navicue/implementations/Catalyst_ChainReaction';
import Catalyst_Purification from '@/app/components/navicue/implementations/Catalyst_Purification';
import Catalyst_InertGas from '@/app/components/navicue/implementations/Catalyst_InertGas';
import Catalyst_Enzyme from '@/app/components/navicue/implementations/Catalyst_Enzyme';
import Catalyst_Equilibrium from '@/app/components/navicue/implementations/Catalyst_Equilibrium';

// ── S108 Quantum Architect specimens ────────────────────────────
import QuantumArchitect_Superposition from '@/app/components/navicue/implementations/QuantumArchitect_Superposition';
import QuantumArchitect_ProbabilityCloud from '@/app/components/navicue/implementations/QuantumArchitect_ProbabilityCloud';
import QuantumArchitect_ObserverEffect from '@/app/components/navicue/implementations/QuantumArchitect_ObserverEffect';
import QuantumArchitect_MultiverseBranch from '@/app/components/navicue/implementations/QuantumArchitect_MultiverseBranch';
import QuantumArchitect_QuantumTunneling from '@/app/components/navicue/implementations/QuantumArchitect_QuantumTunneling';
import QuantumArchitect_Entanglement from '@/app/components/navicue/implementations/QuantumArchitect_Entanglement';
import QuantumArchitect_WaveFunctionCollapse from '@/app/components/navicue/implementations/QuantumArchitect_WaveFunctionCollapse';
import QuantumArchitect_UncertaintyPrinciple from '@/app/components/navicue/implementations/QuantumArchitect_UncertaintyPrinciple';
import QuantumArchitect_VacuumFluctuation from '@/app/components/navicue/implementations/QuantumArchitect_VacuumFluctuation';
import QuantumArchitect_QuantumSeal from '@/app/components/navicue/implementations/QuantumArchitect_QuantumSeal';

// ── S109 Transmuter specimens ───────────────────────────────────
import Transmuter_LeadWeight from '@/app/components/navicue/implementations/Transmuter_LeadWeight';
import Transmuter_Calcination from '@/app/components/navicue/implementations/Transmuter_Calcination';
import Transmuter_Distillation from '@/app/components/navicue/implementations/Transmuter_Distillation';
import Transmuter_Coagulation from '@/app/components/navicue/implementations/Transmuter_Coagulation';
import Transmuter_Fermentation from '@/app/components/navicue/implementations/Transmuter_Fermentation';
import Transmuter_Sublimation from '@/app/components/navicue/implementations/Transmuter_Sublimation';
import Transmuter_Amalgam from '@/app/components/navicue/implementations/Transmuter_Amalgam';
import Transmuter_UniversalSolvent from '@/app/components/navicue/implementations/Transmuter_UniversalSolvent';
import Transmuter_PhilosophersStone from '@/app/components/navicue/implementations/Transmuter_PhilosophersStone';
import Transmuter_TransmuterSeal from '@/app/components/navicue/implementations/Transmuter_TransmuterSeal';

// ── S110 Cyberneticist specimens ────────────────────────────────
import Cyberneticist_ErrorSignal from '@/app/components/navicue/implementations/Cyberneticist_ErrorSignal';
import Cyberneticist_NegativeFeedbackLoop from '@/app/components/navicue/implementations/Cyberneticist_NegativeFeedbackLoop';
import Cyberneticist_PositiveFeedbackLoop from '@/app/components/navicue/implementations/Cyberneticist_PositiveFeedbackLoop';
import Cyberneticist_LagTime from '@/app/components/navicue/implementations/Cyberneticist_LagTime';
import Cyberneticist_Gain from '@/app/components/navicue/implementations/Cyberneticist_Gain';
import Cyberneticist_SetPoint from '@/app/components/navicue/implementations/Cyberneticist_SetPoint';
import Cyberneticist_Feedforward from '@/app/components/navicue/implementations/Cyberneticist_Feedforward';
import Cyberneticist_Oscillation from '@/app/components/navicue/implementations/Cyberneticist_Oscillation';
import Cyberneticist_BlackBox from '@/app/components/navicue/implementations/Cyberneticist_BlackBox';
import Cyberneticist_NavigatorSeal from '@/app/components/navicue/implementations/Cyberneticist_NavigatorSeal';

// ── S111 FieldArchitect specimens ───────────────────────────────
import FieldArchitect_PolarityCheck from '@/app/components/navicue/implementations/FieldArchitect_PolarityCheck';
import FieldArchitect_IronFilings from '@/app/components/navicue/implementations/FieldArchitect_IronFilings';
import FieldArchitect_StrangeAttractor from '@/app/components/navicue/implementations/FieldArchitect_StrangeAttractor';
import FieldArchitect_Shield from '@/app/components/navicue/implementations/FieldArchitect_Shield';
import FieldArchitect_InducedCurrent from '@/app/components/navicue/implementations/FieldArchitect_InducedCurrent';
import FieldArchitect_CompassNeedle from '@/app/components/navicue/implementations/FieldArchitect_CompassNeedle';
import FieldArchitect_ElectroMagnet from '@/app/components/navicue/implementations/FieldArchitect_ElectroMagnet';
import FieldArchitect_VoltageDrop from '@/app/components/navicue/implementations/FieldArchitect_VoltageDrop';
import FieldArchitect_Domain from '@/app/components/navicue/implementations/FieldArchitect_Domain';
import FieldArchitect_FieldSeal from '@/app/components/navicue/implementations/FieldArchitect_FieldSeal';

// ── S112 Kineticist specimens ───────────────────────────────────
import Kineticist_InertiaBreaker from '@/app/components/navicue/implementations/Kineticist_InertiaBreaker';
import Kineticist_GravityAssist from '@/app/components/navicue/implementations/Kineticist_GravityAssist';
import Kineticist_ElasticCollision from '@/app/components/navicue/implementations/Kineticist_ElasticCollision';
import Kineticist_TerminalVelocity from '@/app/components/navicue/implementations/Kineticist_TerminalVelocity';
import Kineticist_RocketEquation from '@/app/components/navicue/implementations/Kineticist_RocketEquation';
import Kineticist_Orbit from '@/app/components/navicue/implementations/Kineticist_Orbit';
import Kineticist_VectorAddition from '@/app/components/navicue/implementations/Kineticist_VectorAddition';
import Kineticist_MomentumSave from '@/app/components/navicue/implementations/Kineticist_MomentumSave';
import Kineticist_ImpactZone from '@/app/components/navicue/implementations/Kineticist_ImpactZone';
import Kineticist_KineticSeal from '@/app/components/navicue/implementations/Kineticist_KineticSeal';

// ── S113 Crystal specimens ──────────────────────────────────────
import Crystal_Lattice from '@/app/components/navicue/implementations/Crystal_Lattice';
import Crystal_PiezoelectricSpark from '@/app/components/navicue/implementations/Crystal_PiezoelectricSpark';
import Crystal_FacetCut from '@/app/components/navicue/implementations/Crystal_FacetCut';
import Crystal_Inclusion from '@/app/components/navicue/implementations/Crystal_Inclusion';
import Crystal_ResonantFrequency from '@/app/components/navicue/implementations/Crystal_ResonantFrequency';
import Crystal_Annealing from '@/app/components/navicue/implementations/Crystal_Annealing';
import Crystal_Transparency from '@/app/components/navicue/implementations/Crystal_Transparency';
import Crystal_NucleationPoint from '@/app/components/navicue/implementations/Crystal_NucleationPoint';
import Crystal_PrismRefraction from '@/app/components/navicue/implementations/Crystal_PrismRefraction';
import Crystal_CrystalSeal from '@/app/components/navicue/implementations/Crystal_CrystalSeal';

// ── S114 Hydrodynamicist specimens ──────────────────────────────
import Hydrodynamicist_LaminarFlow from '@/app/components/navicue/implementations/Hydrodynamicist_LaminarFlow';
import Hydrodynamicist_BuoyancyCheck from '@/app/components/navicue/implementations/Hydrodynamicist_BuoyancyCheck';
import Hydrodynamicist_PathOfLeastResistance from '@/app/components/navicue/implementations/Hydrodynamicist_PathOfLeastResistance';
import Hydrodynamicist_Erosion from '@/app/components/navicue/implementations/Hydrodynamicist_Erosion';
import Hydrodynamicist_HydraulicPress from '@/app/components/navicue/implementations/Hydrodynamicist_HydraulicPress';
import Hydrodynamicist_Vortex from '@/app/components/navicue/implementations/Hydrodynamicist_Vortex';
import Hydrodynamicist_SurfaceTension from '@/app/components/navicue/implementations/Hydrodynamicist_SurfaceTension';
import Hydrodynamicist_PhaseTransition from '@/app/components/navicue/implementations/Hydrodynamicist_PhaseTransition';
import Hydrodynamicist_OceanDepth from '@/app/components/navicue/implementations/Hydrodynamicist_OceanDepth';
import Hydrodynamicist_HydroSeal from '@/app/components/navicue/implementations/Hydrodynamicist_HydroSeal';

// ── S115 Aviator specimens ──────────────────────────────────────
import Aviator_DragCheck from '@/app/components/navicue/implementations/Aviator_DragCheck';
import Aviator_AngleOfAttack from '@/app/components/navicue/implementations/Aviator_AngleOfAttack';
import Aviator_ThrustToWeightRatio from '@/app/components/navicue/implementations/Aviator_ThrustToWeightRatio';
import Aviator_CoffinCorner from '@/app/components/navicue/implementations/Aviator_CoffinCorner';
import Aviator_Headwind from '@/app/components/navicue/implementations/Aviator_Headwind';
import Aviator_TrimTab from '@/app/components/navicue/implementations/Aviator_TrimTab';
import Aviator_CenterOfGravity from '@/app/components/navicue/implementations/Aviator_CenterOfGravity';
import Aviator_GroundEffect from '@/app/components/navicue/implementations/Aviator_GroundEffect';
import Aviator_FeatheredProp from '@/app/components/navicue/implementations/Aviator_FeatheredProp';
import Aviator_AviatorSeal from '@/app/components/navicue/implementations/Aviator_AviatorSeal';

// ── S116 Tensegrity specimens ───────────────────────────────────
import Tensegrity_FloatingCompression from '@/app/components/navicue/implementations/Tensegrity_FloatingCompression';
import Tensegrity_PreStress from '@/app/components/navicue/implementations/Tensegrity_PreStress';
import Tensegrity_LoadDistribution from '@/app/components/navicue/implementations/Tensegrity_LoadDistribution';
import Tensegrity_OmniDirectional from '@/app/components/navicue/implementations/Tensegrity_OmniDirectional';
import Tensegrity_FascialRelease from '@/app/components/navicue/implementations/Tensegrity_FascialRelease';
import Tensegrity_SpaceFrame from '@/app/components/navicue/implementations/Tensegrity_SpaceFrame';
import Tensegrity_DynamicEquilibrium from '@/app/components/navicue/implementations/Tensegrity_DynamicEquilibrium';
import Tensegrity_YieldPoint from '@/app/components/navicue/implementations/Tensegrity_YieldPoint';
import Tensegrity_NetworkNode from '@/app/components/navicue/implementations/Tensegrity_NetworkNode';
import Tensegrity_TensegritySeal from '@/app/components/navicue/implementations/Tensegrity_TensegritySeal';

// ── S117 Wayfinder specimens ────────────────────────────────────
import Wayfinder_DeadReckoning from '@/app/components/navicue/implementations/Wayfinder_DeadReckoning';
import Wayfinder_SwellRead from '@/app/components/navicue/implementations/Wayfinder_SwellRead';
import Wayfinder_ZenithStar from '@/app/components/navicue/implementations/Wayfinder_ZenithStar';
import Wayfinder_BirdSign from '@/app/components/navicue/implementations/Wayfinder_BirdSign';
import Wayfinder_CloudStack from '@/app/components/navicue/implementations/Wayfinder_CloudStack';
import Wayfinder_Etak from '@/app/components/navicue/implementations/Wayfinder_Etak';
import Wayfinder_Phosphorescence from '@/app/components/navicue/implementations/Wayfinder_Phosphorescence';
import Wayfinder_StormDrift from '@/app/components/navicue/implementations/Wayfinder_StormDrift';
import Wayfinder_LandScent from '@/app/components/navicue/implementations/Wayfinder_LandScent';
import Wayfinder_WayfinderSeal from '@/app/components/navicue/implementations/Wayfinder_WayfinderSeal';

// ── S118 Receiver specimens ─────────────────────────────────────
import Receiver_SignalToNoiseRatio from '@/app/components/navicue/implementations/Receiver_SignalToNoiseRatio';
import Receiver_FrequencyScan from '@/app/components/navicue/implementations/Receiver_FrequencyScan';
import Receiver_Squelch from '@/app/components/navicue/implementations/Receiver_Squelch';
import Receiver_AntennaGain from '@/app/components/navicue/implementations/Receiver_AntennaGain';
import Receiver_Modulation from '@/app/components/navicue/implementations/Receiver_Modulation';
import Receiver_InterferencePattern from '@/app/components/navicue/implementations/Receiver_InterferencePattern';
import Receiver_FeedbackLoop from '@/app/components/navicue/implementations/Receiver_FeedbackLoop';
import Receiver_Encryption from '@/app/components/navicue/implementations/Receiver_Encryption';
import Receiver_BroadcastPower from '@/app/components/navicue/implementations/Receiver_BroadcastPower';
import Receiver_ReceiverSeal from '@/app/components/navicue/implementations/Receiver_ReceiverSeal';

// ── S119 Vector specimens ───────────────────────────────────────
import Vector_ScalarVsVector from '@/app/components/navicue/implementations/Vector_ScalarVsVector';
import Vector_ResultantForce from '@/app/components/navicue/implementations/Vector_ResultantForce';
import Vector_UnitVector from '@/app/components/navicue/implementations/Vector_UnitVector';
import Vector_CrossProduct from '@/app/components/navicue/implementations/Vector_CrossProduct';
import Vector_DotProduct from '@/app/components/navicue/implementations/Vector_DotProduct';
import Vector_NullVector from '@/app/components/navicue/implementations/Vector_NullVector';
import Vector_AccelerationVector from '@/app/components/navicue/implementations/Vector_AccelerationVector';
import Vector_Decomposition from '@/app/components/navicue/implementations/Vector_Decomposition';
import Vector_FieldLine from '@/app/components/navicue/implementations/Vector_FieldLine';
import Vector_VectorSeal from '@/app/components/navicue/implementations/Vector_VectorSeal';

// ── S120 Tuning specimens ───────────────────────────────────────
import Tuning_TensionCheck from '@/app/components/navicue/implementations/Tuning_TensionCheck';
import Tuning_DissonanceResolve from '@/app/components/navicue/implementations/Tuning_DissonanceResolve';
import Tuning_FundamentalFrequency from '@/app/components/navicue/implementations/Tuning_FundamentalFrequency';
import Tuning_SympatheticVibration from '@/app/components/navicue/implementations/Tuning_SympatheticVibration';
import Tuning_BeatFrequency from '@/app/components/navicue/implementations/Tuning_BeatFrequency';
import Tuning_OvertoneSeries from '@/app/components/navicue/implementations/Tuning_OvertoneSeries';
import Tuning_DeadSpot from '@/app/components/navicue/implementations/Tuning_DeadSpot';
import Tuning_Amplifier from '@/app/components/navicue/implementations/Tuning_Amplifier';
import Tuning_FadeOut from '@/app/components/navicue/implementations/Tuning_FadeOut';
import Tuning_HarmonicSeal from '@/app/components/navicue/implementations/Tuning_HarmonicSeal';

// ── Types ────────────────────────────────────────────────────────

interface SpecimenEntry {
  id: number;
  name: string;
  file: string;
  component: React.ComponentType<{ data?: any; onComplete?: () => void }>;
  compositorInput: CompositorInput;
}

interface SeriesGroup {
  key: string;
  label: string;
  seriesNumber: number;
  form: string;
  accentColor: string;
  specimens: SpecimenEntry[];
}

// ── S101 Projector ───────────────────────────────────────────────

const S101_SPECIMENS: SpecimenEntry[] = [
  {
    id: 1001, name: 'The Film Swap', file: 'Projector_FilmSwap',
    component: Projector_FilmSwap,
    compositorInput: { signature: 'sensory_cinema', form: 'Theater', chrono: 'work', kbe: 'believing', hook: 'drag', specimenSeed: 1001, isSeal: false },
  },
  {
    id: 1002, name: 'The Beam Focus', file: 'Projector_BeamFocus',
    component: Projector_BeamFocus,
    compositorInput: { signature: 'science_x_soul', form: 'Theater', chrono: 'work', kbe: 'embodying', hook: 'drag', specimenSeed: 1002, isSeal: false },
  },
  {
    id: 1003, name: 'The Lens Shift', file: 'Projector_LensShift',
    component: Projector_LensShift,
    compositorInput: { signature: 'poetic_precision', form: 'Theater', chrono: 'morning', kbe: 'knowing', hook: 'type', specimenSeed: 1003, isSeal: false },
  },
  {
    id: 1004, name: 'The Reality Lag', file: 'Projector_RealityLag',
    component: Projector_RealityLag,
    compositorInput: { signature: 'koan_paradox', form: 'Theater', chrono: 'social', kbe: 'believing', hook: 'hold', specimenSeed: 1004, isSeal: false },
  },
  {
    id: 1005, name: 'The Tuning Fork', file: 'Projector_TuningFork',
    component: Projector_TuningFork,
    compositorInput: { signature: 'sensory_cinema', form: 'Theater', chrono: 'night', kbe: 'embodying', hook: 'observe', specimenSeed: 1005, isSeal: false },
  },
  {
    id: 1006, name: 'The Silent Reel', file: 'Projector_SilentReel',
    component: Projector_SilentReel,
    compositorInput: { signature: 'witness_ritual', form: 'Theater', chrono: 'night', kbe: 'embodying', hook: 'draw', specimenSeed: 1006, isSeal: false },
  },
  {
    id: 1007, name: 'The Fourth Wall', file: 'Projector_FourthWall',
    component: Projector_FourthWall,
    compositorInput: { signature: 'pattern_glitch', form: 'Theater', chrono: 'social', kbe: 'believing', hook: 'tap', specimenSeed: 1007, isSeal: false },
  },
  {
    id: 1008, name: 'The Splice Point', file: 'Projector_SplicePoint',
    component: Projector_SplicePoint,
    compositorInput: { signature: 'science_x_soul', form: 'Theater', chrono: 'work', kbe: 'knowing', hook: 'tap', specimenSeed: 1008, isSeal: false },
  },
  {
    id: 1009, name: 'The Ghost Light', file: 'Projector_GhostLight',
    component: Projector_GhostLight,
    compositorInput: { signature: 'relational_ghost', form: 'Theater', chrono: 'morning', kbe: 'believing', hook: 'observe', specimenSeed: 1009, isSeal: false },
  },
  {
    id: 1010, name: 'The Projector Seal', file: 'Projector_ProjectorSeal',
    component: Projector_ProjectorSeal,
    compositorInput: { signature: 'sacred_ordinary', form: 'Theater', chrono: 'night', kbe: 'embodying', hook: 'hold', specimenSeed: 1010, isSeal: true },
  },
];

// ── S102 Chronomancer ────────────────────────────────────────────

const S102_SPECIMENS: SpecimenEntry[] = [
  {
    id: 1011, name: 'The Past Edit', file: 'Chronomancer_PastEdit',
    component: Chronomancer_PastEdit,
    compositorInput: { signature: 'poetic_precision', form: 'Cosmos', chrono: 'night', kbe: 'knowing', hook: 'tap', specimenSeed: 1011, isSeal: false },
  },
  {
    id: 1012, name: 'The Future Borrow', file: 'Chronomancer_FutureBorrow',
    component: Chronomancer_FutureBorrow,
    compositorInput: { signature: 'science_x_soul', form: 'Cosmos', chrono: 'morning', kbe: 'believing', hook: 'tap', specimenSeed: 1012, isSeal: false },
  },
  {
    id: 1013, name: 'The Time Dilation', file: 'Chronomancer_TimeDilation',
    component: Chronomancer_TimeDilation,
    compositorInput: { signature: 'sensory_cinema', form: 'Cosmos', chrono: 'night', kbe: 'embodying', hook: 'observe', specimenSeed: 1013, isSeal: false },
  },
  {
    id: 1014, name: 'The Ancestral Link', file: 'Chronomancer_AncestralLink',
    component: Chronomancer_AncestralLink,
    compositorInput: { signature: 'sacred_ordinary', form: 'Cosmos', chrono: 'morning', kbe: 'believing', hook: 'hold', specimenSeed: 1014, isSeal: false },
  },
  {
    id: 1015, name: 'The Legacy Cast', file: 'Chronomancer_LegacyCast',
    component: Chronomancer_LegacyCast,
    compositorInput: { signature: 'witness_ritual', form: 'Cosmos', chrono: 'social', kbe: 'knowing', hook: 'tap', specimenSeed: 1015, isSeal: false },
  },
  {
    id: 1016, name: 'The Regret Reversal', file: 'Chronomancer_RegretReversal',
    component: Chronomancer_RegretReversal,
    compositorInput: { signature: 'koan_paradox', form: 'Cosmos', chrono: 'night', kbe: 'believing', hook: 'drag', specimenSeed: 1016, isSeal: false },
  },
  {
    id: 1017, name: 'The Deja Vu', file: 'Chronomancer_DejaVu',
    component: Chronomancer_DejaVu,
    compositorInput: { signature: 'pattern_glitch', form: 'Cosmos', chrono: 'work', kbe: 'knowing', hook: 'tap', specimenSeed: 1017, isSeal: false },
  },
  {
    id: 1018, name: 'The Wormhole', file: 'Chronomancer_Wormhole',
    component: Chronomancer_Wormhole,
    compositorInput: { signature: 'science_x_soul', form: 'Cosmos', chrono: 'work', kbe: 'embodying', hook: 'hold', specimenSeed: 1018, isSeal: false },
  },
  {
    id: 1019, name: 'The Eternal Now', file: 'Chronomancer_EternalNow',
    component: Chronomancer_EternalNow,
    compositorInput: { signature: 'sacred_ordinary', form: 'Cosmos', chrono: 'night', kbe: 'embodying', hook: 'observe', specimenSeed: 1019, isSeal: false },
  },
  {
    id: 1020, name: 'The Chronos Seal', file: 'Chronomancer_ChronosSeal',
    component: Chronomancer_ChronosSeal,
    compositorInput: { signature: 'science_x_soul', form: 'Cosmos', chrono: 'night', kbe: 'embodying', hook: 'hold', specimenSeed: 1020, isSeal: true },
  },
];

// ── S103 Resonator ───────────────────────────────────────────────

const S103_SPECIMENS: SpecimenEntry[] = [
  {
    id: 1021, name: 'The Noise Cancellation', file: 'Resonator_NoiseCancellation',
    component: Resonator_NoiseCancellation,
    compositorInput: { signature: 'sensory_cinema', form: 'Ocean', chrono: 'work', kbe: 'e', hook: 'hold', specimenSeed: 1021, isSeal: false },
  },
  {
    id: 1022, name: 'The Carrier Wave', file: 'Resonator_CarrierWave',
    component: Resonator_CarrierWave,
    compositorInput: { signature: 'poetic_precision', form: 'Ocean', chrono: 'morning', kbe: 'b', hook: 'type', specimenSeed: 1022, isSeal: false },
  },
  {
    id: 1023, name: 'The Constructive Interference', file: 'Resonator_ConstructiveInterference',
    component: Resonator_ConstructiveInterference,
    compositorInput: { signature: 'science_x_soul', form: 'Ocean', chrono: 'work', kbe: 'k', hook: 'drag', specimenSeed: 1023, isSeal: false },
  },
  {
    id: 1024, name: 'The Sympathetic Resonance', file: 'Resonator_SympatheticResonance',
    component: Resonator_SympatheticResonance,
    compositorInput: { signature: 'relational_ghost', form: 'Ocean', chrono: 'social', kbe: 'b', hook: 'tap', specimenSeed: 1024, isSeal: false },
  },
  {
    id: 1025, name: 'The Feedback Loop', file: 'Resonator_FeedbackLoop',
    component: Resonator_FeedbackLoop,
    compositorInput: { signature: 'pattern_glitch', form: 'Ocean', chrono: 'work', kbe: 'e', hook: 'drag', specimenSeed: 1025, isSeal: false },
  },
  {
    id: 1026, name: 'The Pure Tone', file: 'Resonator_PureTone',
    component: Resonator_PureTone,
    compositorInput: { signature: 'witness_ritual', form: 'Ocean', chrono: 'morning', kbe: 'e', hook: 'hold', specimenSeed: 1026, isSeal: false },
  },
  {
    id: 1027, name: 'The Volume Knob', file: 'Resonator_VolumeKnob',
    component: Resonator_VolumeKnob,
    compositorInput: { signature: 'sacred_ordinary', form: 'Ocean', chrono: 'social', kbe: 'k', hook: 'tap', specimenSeed: 1027, isSeal: false },
  },
  {
    id: 1028, name: 'The Echo Chamber', file: 'Resonator_EchoChamber',
    component: Resonator_EchoChamber,
    compositorInput: { signature: 'koan_paradox', form: 'Ocean', chrono: 'night', kbe: 'b', hook: 'type', specimenSeed: 1028, isSeal: false },
  },
  {
    id: 1029, name: 'The Frequency Jammer', file: 'Resonator_FrequencyJammer',
    component: Resonator_FrequencyJammer,
    compositorInput: { signature: 'pattern_glitch', form: 'Ocean', chrono: 'work', kbe: 'k', hook: 'tap', specimenSeed: 1029, isSeal: false },
  },
  {
    id: 1030, name: 'The Resonator Seal', file: 'Resonator_ResonatorSeal',
    component: Resonator_ResonatorSeal,
    compositorInput: { signature: 'sensory_cinema', form: 'Ocean', chrono: 'night', kbe: 'e', hook: 'hold', specimenSeed: 1030, isSeal: true },
  },
];

// ── S104 Materialist ─────────────────────────────────────────────

const S104_SPECIMENS: SpecimenEntry[] = [
  {
    id: 1031, name: 'The First Brick', file: 'Materialist_FirstBrick',
    component: Materialist_FirstBrick,
    compositorInput: { signature: 'sacred_ordinary', form: 'Ember', chrono: 'morning', kbe: 'embodying', hook: 'tap', specimenSeed: 1031, isSeal: false },
  },
  {
    id: 1032, name: 'The Blueprint Edit', file: 'Materialist_BlueprintEdit',
    component: Materialist_BlueprintEdit,
    compositorInput: { signature: 'poetic_precision', form: 'Ember', chrono: 'work', kbe: 'knowing', hook: 'type', specimenSeed: 1032, isSeal: false },
  },
  {
    id: 1033, name: 'The Gravity Well', file: 'Materialist_GravityWell',
    component: Materialist_GravityWell,
    compositorInput: { signature: 'science_x_soul', form: 'Ember', chrono: 'social', kbe: 'believing', hook: 'drag', specimenSeed: 1033, isSeal: false },
  },
  {
    id: 1034, name: 'The Friction Test', file: 'Materialist_FrictionTest',
    component: Materialist_FrictionTest,
    compositorInput: { signature: 'witness_ritual', form: 'Ember', chrono: 'work', kbe: 'believing', hook: 'hold', specimenSeed: 1034, isSeal: false },
  },
  {
    id: 1035, name: 'The Scaffolding', file: 'Materialist_Scaffolding',
    component: Materialist_Scaffolding,
    compositorInput: { signature: 'koan_paradox', form: 'Ember', chrono: 'social', kbe: 'knowing', hook: 'tap', specimenSeed: 1035, isSeal: false },
  },
  {
    id: 1036, name: 'The Concrete Pour', file: 'Materialist_ConcretePour',
    component: Materialist_ConcretePour,
    compositorInput: { signature: 'sensory_cinema', form: 'Ember', chrono: 'night', kbe: 'embodying', hook: 'hold', specimenSeed: 1036, isSeal: false },
  },
  {
    id: 1037, name: 'The Keystone', file: 'Materialist_Keystone',
    component: Materialist_Keystone,
    compositorInput: { signature: 'poetic_precision', form: 'Ember', chrono: 'morning', kbe: 'knowing', hook: 'tap', specimenSeed: 1037, isSeal: false },
  },
  {
    id: 1038, name: 'The Demolition', file: 'Materialist_Demolition',
    component: Materialist_Demolition,
    compositorInput: { signature: 'pattern_glitch', form: 'Ember', chrono: 'work', kbe: 'believing', hook: 'drag', specimenSeed: 1038, isSeal: false },
  },
  {
    id: 1039, name: 'The Inspection', file: 'Materialist_Inspection',
    component: Materialist_Inspection,
    compositorInput: { signature: 'science_x_soul', form: 'Ember', chrono: 'work', kbe: 'knowing', hook: 'draw', specimenSeed: 1039, isSeal: false },
  },
  {
    id: 1040, name: 'The Materialist Seal', file: 'Materialist_MaterialistSeal',
    component: Materialist_MaterialistSeal,
    compositorInput: { signature: 'sacred_ordinary', form: 'Ember', chrono: 'night', kbe: 'embodying', hook: 'hold', specimenSeed: 1040, isSeal: true },
  },
];

// ── S105 Refractor ───────────────────────────────────────────────

const S105_SPECIMENS: SpecimenEntry[] = [
  {
    id: 1041, name: 'The Spectrum Split', file: 'Refractor_SpectrumSplit',
    component: Refractor_SpectrumSplit,
    compositorInput: { signature: 'science_x_soul', form: 'Stellar', chrono: 'morning', kbe: 'k', hook: 'tap', specimenSeed: 1041, isSeal: false },
  },
  {
    id: 1042, name: 'The Focal Point', file: 'Refractor_FocalPoint',
    component: Refractor_FocalPoint,
    compositorInput: { signature: 'sensory_cinema', form: 'Stellar', chrono: 'work', kbe: 'e', hook: 'hold', specimenSeed: 1042, isSeal: false },
  },
  {
    id: 1043, name: 'The Distortion Check', file: 'Refractor_DistortionCheck',
    component: Refractor_DistortionCheck,
    compositorInput: { signature: 'koan_paradox', form: 'Stellar', chrono: 'social', kbe: 'k', hook: 'tap', specimenSeed: 1043, isSeal: false },
  },
  {
    id: 1044, name: 'The Color Grade', file: 'Refractor_ColorGrade',
    component: Refractor_ColorGrade,
    compositorInput: { signature: 'poetic_precision', form: 'Stellar', chrono: 'night', kbe: 'b', hook: 'drag', specimenSeed: 1044, isSeal: false },
  },
  {
    id: 1045, name: 'The Blind Spot', file: 'Refractor_BlindSpot',
    component: Refractor_BlindSpot,
    compositorInput: { signature: 'witness_ritual', form: 'Stellar', chrono: 'morning', kbe: 'k', hook: 'observe', specimenSeed: 1045, isSeal: false },
  },
  {
    id: 1046, name: 'The Polarizer', file: 'Refractor_Polarizer',
    component: Refractor_Polarizer,
    compositorInput: { signature: 'pattern_glitch', form: 'Stellar', chrono: 'work', kbe: 'e', hook: 'drag', specimenSeed: 1046, isSeal: false },
  },
  {
    id: 1047, name: 'The Black Body', file: 'Refractor_BlackBody',
    component: Refractor_BlackBody,
    compositorInput: { signature: 'relational_ghost', form: 'Stellar', chrono: 'social', kbe: 'b', hook: 'tap', specimenSeed: 1047, isSeal: false },
  },
  {
    id: 1048, name: 'The Laser', file: 'Refractor_Laser',
    component: Refractor_Laser,
    compositorInput: { signature: 'science_x_soul', form: 'Stellar', chrono: 'work', kbe: 'e', hook: 'drag', specimenSeed: 1048, isSeal: false },
  },
  {
    id: 1049, name: 'The Darkroom', file: 'Refractor_Darkroom',
    component: Refractor_Darkroom,
    compositorInput: { signature: 'sacred_ordinary', form: 'Stellar', chrono: 'night', kbe: 'b', hook: 'hold', specimenSeed: 1049, isSeal: false },
  },
  {
    id: 1050, name: 'The Prism Seal', file: 'Refractor_PrismSeal',
    component: Refractor_PrismSeal,
    compositorInput: { signature: 'science_x_soul', form: 'Stellar', chrono: 'night', kbe: 'e', hook: 'hold', specimenSeed: 1050, isSeal: true },
  },
];

// ── S106 Engine ─────────────────────────────────────────────────

const S106_SPECIMENS: SpecimenEntry[] = [
  {
    id: 1051, name: 'The Entropy Check', file: 'Engine_EntropyCheck',
    component: Engine_EntropyCheck,
    compositorInput: { signature: 'sacred_ordinary', form: 'Circuit', chrono: 'morning', kbe: 'b', hook: 'drag', specimenSeed: 1051, isSeal: false },
  },
  {
    id: 1052, name: 'The Heat Sink', file: 'Engine_HeatSink',
    component: Engine_HeatSink,
    compositorInput: { signature: 'sensory_cinema', form: 'Circuit', chrono: 'work', kbe: 'e', hook: 'hold', specimenSeed: 1052, isSeal: false },
  },
  {
    id: 1053, name: 'The Closed Loop', file: 'Engine_ClosedLoop',
    component: Engine_ClosedLoop,
    compositorInput: { signature: 'pattern_glitch', form: 'Circuit', chrono: 'work', kbe: 'k', hook: 'tap', specimenSeed: 1053, isSeal: false },
  },
  {
    id: 1054, name: 'The Flywheel', file: 'Engine_Flywheel',
    component: Engine_Flywheel,
    compositorInput: { signature: 'science_x_soul', form: 'Circuit', chrono: 'work', kbe: 'b', hook: 'tap', specimenSeed: 1054, isSeal: false },
  },
  {
    id: 1055, name: 'The Insulation', file: 'Engine_Insulation',
    component: Engine_Insulation,
    compositorInput: { signature: 'relational_ghost', form: 'Circuit', chrono: 'social', kbe: 'k', hook: 'tap', specimenSeed: 1055, isSeal: false },
  },
  {
    id: 1056, name: 'The Turbocharger', file: 'Engine_Turbocharger',
    component: Engine_Turbocharger,
    compositorInput: { signature: 'koan_paradox', form: 'Circuit', chrono: 'social', kbe: 'b', hook: 'drag', specimenSeed: 1056, isSeal: false },
  },
  {
    id: 1057, name: 'The Idle State', file: 'Engine_IdleState',
    component: Engine_IdleState,
    compositorInput: { signature: 'witness_ritual', form: 'Circuit', chrono: 'night', kbe: 'e', hook: 'drag', specimenSeed: 1057, isSeal: false },
  },
  {
    id: 1058, name: 'The Fuel Mix', file: 'Engine_FuelMix',
    component: Engine_FuelMix,
    compositorInput: { signature: 'science_x_soul', form: 'Circuit', chrono: 'morning', kbe: 'k', hook: 'type', specimenSeed: 1058, isSeal: false },
  },
  {
    id: 1059, name: 'The Governor', file: 'Engine_Governor',
    component: Engine_Governor,
    compositorInput: { signature: 'poetic_precision', form: 'Circuit', chrono: 'night', kbe: 'b', hook: 'drag', specimenSeed: 1059, isSeal: false },
  },
  {
    id: 1060, name: 'The Engine Seal', file: 'Engine_EngineSeal',
    component: Engine_EngineSeal,
    compositorInput: { signature: 'science_x_soul', form: 'Circuit', chrono: 'night', kbe: 'e', hook: 'hold', specimenSeed: 1060, isSeal: true },
  },
];

// ── S107 Catalyst ───────────────────────────────────────────────

const S107_SPECIMENS: SpecimenEntry[] = [
  {
    id: 1061, name: 'The Phase Change', file: 'Catalyst_PhaseChange',
    component: Catalyst_PhaseChange,
    compositorInput: { signature: 'sacred_ordinary', form: 'Glacier', chrono: 'morning', kbe: 'b', hook: 'hold', specimenSeed: 1061, isSeal: false },
  },
  {
    id: 1062, name: 'The Precipitate', file: 'Catalyst_Precipitate',
    component: Catalyst_Precipitate,
    compositorInput: { signature: 'science_x_soul', form: 'Glacier', chrono: 'work', kbe: 'k', hook: 'tap', specimenSeed: 1062, isSeal: false },
  },
  {
    id: 1063, name: 'The Titration', file: 'Catalyst_Titration',
    component: Catalyst_Titration,
    compositorInput: { signature: 'poetic_precision', form: 'Glacier', chrono: 'work', kbe: 'e', hook: 'tap', specimenSeed: 1063, isSeal: false },
  },
  {
    id: 1064, name: 'The Compound', file: 'Catalyst_Compound',
    component: Catalyst_Compound,
    compositorInput: { signature: 'koan_paradox', form: 'Glacier', chrono: 'social', kbe: 'believing', hook: 'hold', specimenSeed: 1064, isSeal: false },
  },
  {
    id: 1065, name: 'The Solvent', file: 'Catalyst_Solvent',
    component: Catalyst_Solvent,
    compositorInput: { signature: 'pattern_glitch', form: 'Glacier', chrono: 'night', kbe: 'b', hook: 'drag', specimenSeed: 1065, isSeal: false },
  },
  {
    id: 1066, name: 'The Chain Reaction', file: 'Catalyst_ChainReaction',
    component: Catalyst_ChainReaction,
    compositorInput: { signature: 'witness_ritual', form: 'Glacier', chrono: 'morning', kbe: 'k', hook: 'tap', specimenSeed: 1066, isSeal: false },
  },
  {
    id: 1067, name: 'The Purification', file: 'Catalyst_Purification',
    component: Catalyst_Purification,
    compositorInput: { signature: 'poetic_precision', form: 'Glacier', chrono: 'work', kbe: 'b', hook: 'hold', specimenSeed: 1067, isSeal: false },
  },
  {
    id: 1068, name: 'The Inert Gas', file: 'Catalyst_InertGas',
    component: Catalyst_InertGas,
    compositorInput: { signature: 'relational_ghost', form: 'Glacier', chrono: 'social', kbe: 'e', hook: 'tap', specimenSeed: 1068, isSeal: false },
  },
  {
    id: 1069, name: 'The Enzyme', file: 'Catalyst_Enzyme',
    component: Catalyst_Enzyme,
    compositorInput: { signature: 'science_x_soul', form: 'Glacier', chrono: 'night', kbe: 'k', hook: 'tap', specimenSeed: 1069, isSeal: false },
  },
  {
    id: 1070, name: 'The Equilibrium', file: 'Catalyst_Equilibrium',
    component: Catalyst_Equilibrium,
    compositorInput: { signature: 'koan_paradox', form: 'Glacier', chrono: 'social', kbe: 'e', hook: 'drag', specimenSeed: 1070, isSeal: false },
  },
];

// ── S108 Quantum Architect ──────────────────────────────────────

const S108_SPECIMENS: SpecimenEntry[] = [
  {
    id: 1071, name: 'The Superposition', file: 'QuantumArchitect_Superposition',
    component: QuantumArchitect_Superposition,
    compositorInput: { signature: 'koan_paradox', form: 'Tide', chrono: 'night', kbe: 'b', hook: 'tap', specimenSeed: 1071, isSeal: false },
  },
  {
    id: 1072, name: 'The Probability Cloud', file: 'QuantumArchitect_ProbabilityCloud',
    component: QuantumArchitect_ProbabilityCloud,
    compositorInput: { signature: 'science_x_soul', form: 'Tide', chrono: 'work', kbe: 'k', hook: 'draw', specimenSeed: 1072, isSeal: false },
  },
  {
    id: 1073, name: 'The Observer Effect', file: 'QuantumArchitect_ObserverEffect',
    component: QuantumArchitect_ObserverEffect,
    compositorInput: { signature: 'witness_ritual', form: 'Tide', chrono: 'morning', kbe: 'e', hook: 'tap', specimenSeed: 1073, isSeal: false },
  },
  {
    id: 1074, name: 'The Multiverse Branch', file: 'QuantumArchitect_MultiverseBranch',
    component: QuantumArchitect_MultiverseBranch,
    compositorInput: { signature: 'sacred_ordinary', form: 'Tide', chrono: 'social', kbe: 'b', hook: 'tap', specimenSeed: 1074, isSeal: false },
  },
  {
    id: 1075, name: 'The Quantum Tunneling', file: 'QuantumArchitect_QuantumTunneling',
    component: QuantumArchitect_QuantumTunneling,
    compositorInput: { signature: 'sensory_cinema', form: 'Tide', chrono: 'work', kbe: 'e', hook: 'hold', specimenSeed: 1075, isSeal: false },
  },
  {
    id: 1076, name: 'The Entanglement', file: 'QuantumArchitect_Entanglement',
    component: QuantumArchitect_Entanglement,
    compositorInput: { signature: 'relational_ghost', form: 'Tide', chrono: 'night', kbe: 'b', hook: 'tap', specimenSeed: 1076, isSeal: false },
  },
  {
    id: 1077, name: 'The Wave Function Collapse', file: 'QuantumArchitect_WaveFunctionCollapse',
    component: QuantumArchitect_WaveFunctionCollapse,
    compositorInput: { signature: 'poetic_precision', form: 'Tide', chrono: 'work', kbe: 'k', hook: 'tap', specimenSeed: 1077, isSeal: false },
  },
  {
    id: 1078, name: 'The Uncertainty Principle', file: 'QuantumArchitect_UncertaintyPrinciple',
    component: QuantumArchitect_UncertaintyPrinciple,
    compositorInput: { signature: 'pattern_glitch', form: 'Tide', chrono: 'morning', kbe: 'k', hook: 'tap', specimenSeed: 1078, isSeal: false },
  },
  {
    id: 1079, name: 'The Vacuum Fluctuation', file: 'QuantumArchitect_VacuumFluctuation',
    component: QuantumArchitect_VacuumFluctuation,
    compositorInput: { signature: 'sacred_ordinary', form: 'Tide', chrono: 'night', kbe: 'e', hook: 'observe', specimenSeed: 1079, isSeal: false },
  },
  {
    id: 1080, name: 'The Quantum Seal', file: 'QuantumArchitect_QuantumSeal',
    component: QuantumArchitect_QuantumSeal,
    compositorInput: { signature: 'science_x_soul', form: 'Tide', chrono: 'night', kbe: 'e', hook: 'hold', specimenSeed: 1080, isSeal: true },
  },
];

// ── S109 Transmuter ─────────────────────────────────────────────

const S109_SPECIMENS: SpecimenEntry[] = [
  {
    id: 1081, name: 'The Lead Weight', file: 'Transmuter_LeadWeight',
    component: Transmuter_LeadWeight,
    compositorInput: { signature: 'witness_ritual', form: 'Ember', chrono: 'work', kbe: 'b', hook: 'drag', specimenSeed: 1081, isSeal: false },
  },
  {
    id: 1082, name: 'The Calcination', file: 'Transmuter_Calcination',
    component: Transmuter_Calcination,
    compositorInput: { signature: 'sacred_ordinary', form: 'Ember', chrono: 'morning', kbe: 'k', hook: 'tap', specimenSeed: 1082, isSeal: false },
  },
  {
    id: 1083, name: 'The Distillation', file: 'Transmuter_Distillation',
    component: Transmuter_Distillation,
    compositorInput: { signature: 'poetic_precision', form: 'Ember', chrono: 'work', kbe: 'k', hook: 'hold', specimenSeed: 1083, isSeal: false },
  },
  {
    id: 1084, name: 'The Coagulation', file: 'Transmuter_Coagulation',
    component: Transmuter_Coagulation,
    compositorInput: { signature: 'science_x_soul', form: 'Ember', chrono: 'social', kbe: 'e', hook: 'tap', specimenSeed: 1084, isSeal: false },
  },
  {
    id: 1085, name: 'The Fermentation', file: 'Transmuter_Fermentation',
    component: Transmuter_Fermentation,
    compositorInput: { signature: 'koan_paradox', form: 'Ember', chrono: 'night', kbe: 'b', hook: 'observe', specimenSeed: 1085, isSeal: false },
  },
  {
    id: 1086, name: 'The Sublimation', file: 'Transmuter_Sublimation',
    component: Transmuter_Sublimation,
    compositorInput: { signature: 'sensory_cinema', form: 'Ember', chrono: 'work', kbe: 'e', hook: 'drag', specimenSeed: 1086, isSeal: false },
  },
  {
    id: 1087, name: 'The Amalgam', file: 'Transmuter_Amalgam',
    component: Transmuter_Amalgam,
    compositorInput: { signature: 'pattern_glitch', form: 'Ember', chrono: 'social', kbe: 'k', hook: 'drag', specimenSeed: 1087, isSeal: false },
  },
  {
    id: 1088, name: 'The Universal Solvent', file: 'Transmuter_UniversalSolvent',
    component: Transmuter_UniversalSolvent,
    compositorInput: { signature: 'relational_ghost', form: 'Ember', chrono: 'night', kbe: 'e', hook: 'hold', specimenSeed: 1088, isSeal: false },
  },
  {
    id: 1089, name: 'The Philosopher\'s Stone', file: 'Transmuter_PhilosophersStone',
    component: Transmuter_PhilosophersStone,
    compositorInput: { signature: 'sacred_ordinary', form: 'Ember', chrono: 'morning', kbe: 'b', hook: 'tap', specimenSeed: 1089, isSeal: false },
  },
  {
    id: 1090, name: 'The Transmuter Seal', file: 'Transmuter_TransmuterSeal',
    component: Transmuter_TransmuterSeal,
    compositorInput: { signature: 'science_x_soul', form: 'Ember', chrono: 'night', kbe: 'e', hook: 'observe', specimenSeed: 1090, isSeal: true },
  },
];

// ── S110 Cyberneticist ──────────────────────────────────────────

const S110_SPECIMENS: SpecimenEntry[] = [
  {
    id: 1091, name: 'The Error Signal', file: 'Cyberneticist_ErrorSignal',
    component: Cyberneticist_ErrorSignal,
    compositorInput: { signature: 'witness_ritual', form: 'Circuit', chrono: 'morning', kbe: 'k', hook: 'tap', specimenSeed: 1091, isSeal: false },
  },
  {
    id: 1092, name: 'The Negative Feedback Loop', file: 'Cyberneticist_NegativeFeedbackLoop',
    component: Cyberneticist_NegativeFeedbackLoop,
    compositorInput: { signature: 'science_x_soul', form: 'Circuit', chrono: 'work', kbe: 'b', hook: 'tap', specimenSeed: 1092, isSeal: false },
  },
  {
    id: 1093, name: 'The Positive Feedback Loop', file: 'Cyberneticist_PositiveFeedbackLoop',
    component: Cyberneticist_PositiveFeedbackLoop,
    compositorInput: { signature: 'pattern_glitch', form: 'Circuit', chrono: 'social', kbe: 'e', hook: 'tap', specimenSeed: 1093, isSeal: false },
  },
  {
    id: 1094, name: 'The Lag Time', file: 'Cyberneticist_LagTime',
    component: Cyberneticist_LagTime,
    compositorInput: { signature: 'koan_paradox', form: 'Circuit', chrono: 'night', kbe: 'b', hook: 'hold', specimenSeed: 1094, isSeal: false },
  },
  {
    id: 1095, name: 'The Gain', file: 'Cyberneticist_Gain',
    component: Cyberneticist_Gain,
    compositorInput: { signature: 'sensory_cinema', form: 'Circuit', chrono: 'work', kbe: 'e', hook: 'drag', specimenSeed: 1095, isSeal: false },
  },
  {
    id: 1096, name: 'The Set Point', file: 'Cyberneticist_SetPoint',
    component: Cyberneticist_SetPoint,
    compositorInput: { signature: 'sacred_ordinary', form: 'Circuit', chrono: 'morning', kbe: 'k', hook: 'drag', specimenSeed: 1096, isSeal: false },
  },
  {
    id: 1097, name: 'The Feedforward', file: 'Cyberneticist_Feedforward',
    component: Cyberneticist_Feedforward,
    compositorInput: { signature: 'poetic_precision', form: 'Circuit', chrono: 'social', kbe: 'b', hook: 'tap', specimenSeed: 1097, isSeal: false },
  },
  {
    id: 1098, name: 'The Oscillation', file: 'Cyberneticist_Oscillation',
    component: Cyberneticist_Oscillation,
    compositorInput: { signature: 'witness_ritual', form: 'Circuit', chrono: 'work', kbe: 'e', hook: 'drag', specimenSeed: 1098, isSeal: false },
  },
  {
    id: 1099, name: 'The Black Box', file: 'Cyberneticist_BlackBox',
    component: Cyberneticist_BlackBox,
    compositorInput: { signature: 'pattern_glitch', form: 'Circuit', chrono: 'night', kbe: 'k', hook: 'type', specimenSeed: 1099, isSeal: false },
  },
  {
    id: 1100, name: 'The Navigator Seal', file: 'Cyberneticist_NavigatorSeal',
    component: Cyberneticist_NavigatorSeal,
    compositorInput: { signature: 'science_x_soul', form: 'Circuit', chrono: 'night', kbe: 'e', hook: 'observe', specimenSeed: 1100, isSeal: true },
  },
];

// ── S111 FieldArchitect ─────────────────────────────────────────

const S111_SPECIMENS: SpecimenEntry[] = [
  {
    id: 1101, name: 'The Polarity Check', file: 'FieldArchitect_PolarityCheck',
    component: FieldArchitect_PolarityCheck,
    compositorInput: { signature: 'witness_ritual', form: 'Stellar', chrono: 'morning', kbe: 'k', hook: 'tap', specimenSeed: 1101, isSeal: false },
  },
  {
    id: 1102, name: 'The Iron Filings', file: 'FieldArchitect_IronFilings',
    component: FieldArchitect_IronFilings,
    compositorInput: { signature: 'science_x_soul', form: 'Stellar', chrono: 'work', kbe: 'b', hook: 'tap', specimenSeed: 1102, isSeal: false },
  },
  {
    id: 1103, name: 'The Strange Attractor', file: 'FieldArchitect_StrangeAttractor',
    component: FieldArchitect_StrangeAttractor,
    compositorInput: { signature: 'pattern_glitch', form: 'Stellar', chrono: 'social', kbe: 'e', hook: 'hold', specimenSeed: 1103, isSeal: false },
  },
  {
    id: 1104, name: 'The Shield', file: 'FieldArchitect_Shield',
    component: FieldArchitect_Shield,
    compositorInput: { signature: 'koan_paradox', form: 'Stellar', chrono: 'night', kbe: 'b', hook: 'tap', specimenSeed: 1104, isSeal: false },
  },
  {
    id: 1105, name: 'The Induced Current', file: 'FieldArchitect_InducedCurrent',
    component: FieldArchitect_InducedCurrent,
    compositorInput: { signature: 'sensory_cinema', form: 'Stellar', chrono: 'work', kbe: 'e', hook: 'drag', specimenSeed: 1105, isSeal: false },
  },
  {
    id: 1106, name: 'The Compass Needle', file: 'FieldArchitect_CompassNeedle',
    component: FieldArchitect_CompassNeedle,
    compositorInput: { signature: 'sacred_ordinary', form: 'Stellar', chrono: 'morning', kbe: 'k', hook: 'tap', specimenSeed: 1106, isSeal: false },
  },
  {
    id: 1107, name: 'The Electro-Magnet', file: 'FieldArchitect_ElectroMagnet',
    component: FieldArchitect_ElectroMagnet,
    compositorInput: { signature: 'poetic_precision', form: 'Stellar', chrono: 'social', kbe: 'e', hook: 'tap', specimenSeed: 1107, isSeal: false },
  },
  {
    id: 1108, name: 'The Voltage Drop', file: 'FieldArchitect_VoltageDrop',
    component: FieldArchitect_VoltageDrop,
    compositorInput: { signature: 'pattern_glitch', form: 'Stellar', chrono: 'work', kbe: 'k', hook: 'tap', specimenSeed: 1108, isSeal: false },
  },
  {
    id: 1109, name: 'The Domain', file: 'FieldArchitect_Domain',
    component: FieldArchitect_Domain,
    compositorInput: { signature: 'witness_ritual', form: 'Stellar', chrono: 'night', kbe: 'b', hook: 'drag', specimenSeed: 1109, isSeal: false },
  },
  {
    id: 1110, name: 'The Field Seal', file: 'FieldArchitect_FieldSeal',
    component: FieldArchitect_FieldSeal,
    compositorInput: { signature: 'science_x_soul', form: 'Stellar', chrono: 'night', kbe: 'e', hook: 'observe', specimenSeed: 1110, isSeal: true },
  },
];

// ── S112 Kineticist ─────────────────────────────────────────────

const S112_SPECIMENS: SpecimenEntry[] = [
  {
    id: 1111, name: 'The Inertia Breaker', file: 'Kineticist_InertiaBreaker',
    component: Kineticist_InertiaBreaker,
    compositorInput: { signature: 'witness_ritual', form: 'Storm', chrono: 'morning', kbe: 'e', hook: 'tap', specimenSeed: 1111, isSeal: false },
  },
  {
    id: 1112, name: 'The Gravity Assist', file: 'Kineticist_GravityAssist',
    component: Kineticist_GravityAssist,
    compositorInput: { signature: 'science_x_soul', form: 'Storm', chrono: 'work', kbe: 'k', hook: 'drag', specimenSeed: 1112, isSeal: false },
  },
  {
    id: 1113, name: 'The Elastic Collision', file: 'Kineticist_ElasticCollision',
    component: Kineticist_ElasticCollision,
    compositorInput: { signature: 'pattern_glitch', form: 'Storm', chrono: 'social', kbe: 'b', hook: 'tap', specimenSeed: 1113, isSeal: false },
  },
  {
    id: 1114, name: 'The Terminal Velocity', file: 'Kineticist_TerminalVelocity',
    component: Kineticist_TerminalVelocity,
    compositorInput: { signature: 'koan_paradox', form: 'Storm', chrono: 'night', kbe: 'b', hook: 'tap', specimenSeed: 1114, isSeal: false },
  },
  {
    id: 1115, name: 'The Rocket Equation', file: 'Kineticist_RocketEquation',
    component: Kineticist_RocketEquation,
    compositorInput: { signature: 'sacred_ordinary', form: 'Storm', chrono: 'work', kbe: 'k', hook: 'tap', specimenSeed: 1115, isSeal: false },
  },
  {
    id: 1116, name: 'The Orbit', file: 'Kineticist_Orbit',
    component: Kineticist_Orbit,
    compositorInput: { signature: 'sensory_cinema', form: 'Storm', chrono: 'morning', kbe: 'e', hook: 'drag', specimenSeed: 1116, isSeal: false },
  },
  {
    id: 1117, name: 'The Vector Addition', file: 'Kineticist_VectorAddition',
    component: Kineticist_VectorAddition,
    compositorInput: { signature: 'poetic_precision', form: 'Storm', chrono: 'social', kbe: 'k', hook: 'drag', specimenSeed: 1117, isSeal: false },
  },
  {
    id: 1118, name: 'The Momentum Save', file: 'Kineticist_MomentumSave',
    component: Kineticist_MomentumSave,
    compositorInput: { signature: 'witness_ritual', form: 'Storm', chrono: 'work', kbe: 'e', hook: 'tap', specimenSeed: 1118, isSeal: false },
  },
  {
    id: 1119, name: 'The Impact Zone', file: 'Kineticist_ImpactZone',
    component: Kineticist_ImpactZone,
    compositorInput: { signature: 'pattern_glitch', form: 'Storm', chrono: 'night', kbe: 'b', hook: 'drag', specimenSeed: 1119, isSeal: false },
  },
  {
    id: 1120, name: 'The Kinetic Seal', file: 'Kineticist_KineticSeal',
    component: Kineticist_KineticSeal,
    compositorInput: { signature: 'science_x_soul', form: 'Storm', chrono: 'night', kbe: 'e', hook: 'observe', specimenSeed: 1120, isSeal: true },
  },
];

// ── S113 Crystal ────────────────────────────────────────────────

const S113_SPECIMENS: SpecimenEntry[] = [
  {
    id: 1121, name: 'The Lattice', file: 'Crystal_Lattice',
    component: Crystal_Lattice,
    compositorInput: { signature: 'witness_ritual', form: 'Glacier', chrono: 'morning', kbe: 'k', hook: 'tap', specimenSeed: 1121, isSeal: false },
  },
  {
    id: 1122, name: 'The Piezoelectric Spark', file: 'Crystal_PiezoelectricSpark',
    component: Crystal_PiezoelectricSpark,
    compositorInput: { signature: 'science_x_soul', form: 'Glacier', chrono: 'work', kbe: 'b', hook: 'hold', specimenSeed: 1122, isSeal: false },
  },
  {
    id: 1123, name: 'The Facet Cut', file: 'Crystal_FacetCut',
    component: Crystal_FacetCut,
    compositorInput: { signature: 'sensory_cinema', form: 'Glacier', chrono: 'work', kbe: 'e', hook: 'hold', specimenSeed: 1123, isSeal: false },
  },
  {
    id: 1124, name: 'The Inclusion', file: 'Crystal_Inclusion',
    component: Crystal_Inclusion,
    compositorInput: { signature: 'koan_paradox', form: 'Glacier', chrono: 'social', kbe: 'b', hook: 'tap', specimenSeed: 1124, isSeal: false },
  },
  {
    id: 1125, name: 'The Resonant Frequency', file: 'Crystal_ResonantFrequency',
    component: Crystal_ResonantFrequency,
    compositorInput: { signature: 'sacred_ordinary', form: 'Glacier', chrono: 'social', kbe: 'e', hook: 'hold', specimenSeed: 1125, isSeal: false },
  },
  {
    id: 1126, name: 'The Annealing', file: 'Crystal_Annealing',
    component: Crystal_Annealing,
    compositorInput: { signature: 'pattern_glitch', form: 'Glacier', chrono: 'night', kbe: 'k', hook: 'tap', specimenSeed: 1126, isSeal: false },
  },
  {
    id: 1127, name: 'The Transparency', file: 'Crystal_Transparency',
    component: Crystal_Transparency,
    compositorInput: { signature: 'witness_ritual', form: 'Glacier', chrono: 'morning', kbe: 'b', hook: 'drag', specimenSeed: 1127, isSeal: false },
  },
  {
    id: 1128, name: 'The Nucleation Point', file: 'Crystal_NucleationPoint',
    component: Crystal_NucleationPoint,
    compositorInput: { signature: 'science_x_soul', form: 'Glacier', chrono: 'work', kbe: 'k', hook: 'tap', specimenSeed: 1128, isSeal: false },
  },
  {
    id: 1129, name: 'The Prism Refraction', file: 'Crystal_PrismRefraction',
    component: Crystal_PrismRefraction,
    compositorInput: { signature: 'poetic_precision', form: 'Glacier', chrono: 'night', kbe: 'b', hook: 'tap', specimenSeed: 1129, isSeal: false },
  },
  {
    id: 1130, name: 'The Crystal Seal', file: 'Crystal_CrystalSeal',
    component: Crystal_CrystalSeal,
    compositorInput: { signature: 'science_x_soul', form: 'Glacier', chrono: 'night', kbe: 'e', hook: 'observe', specimenSeed: 1130, isSeal: true },
  },
];

// ── S114 Hydrodynamicist ────────────────────────────────────────

const S114_SPECIMENS: SpecimenEntry[] = [
  {
    id: 1131, name: 'The Laminar Flow', file: 'Hydrodynamicist_LaminarFlow',
    component: Hydrodynamicist_LaminarFlow,
    compositorInput: { signature: 'sensory_cinema', form: 'Tide', chrono: 'morning', kbe: 'e', hook: 'drag', specimenSeed: 1131, isSeal: false },
  },
  {
    id: 1132, name: 'The Buoyancy Check', file: 'Hydrodynamicist_BuoyancyCheck',
    component: Hydrodynamicist_BuoyancyCheck,
    compositorInput: { signature: 'koan_paradox', form: 'Tide', chrono: 'social', kbe: 'b', hook: 'tap', specimenSeed: 1132, isSeal: false },
  },
  {
    id: 1133, name: 'The Path of Least Resistance', file: 'Hydrodynamicist_PathOfLeastResistance',
    component: Hydrodynamicist_PathOfLeastResistance,
    compositorInput: { signature: 'poetic_precision', form: 'Tide', chrono: 'work', kbe: 'k', hook: 'draw', specimenSeed: 1133, isSeal: false },
  },
  {
    id: 1134, name: 'The Erosion', file: 'Hydrodynamicist_Erosion',
    component: Hydrodynamicist_Erosion,
    compositorInput: { signature: 'witness_ritual', form: 'Tide', chrono: 'night', kbe: 'b', hook: 'hold', specimenSeed: 1134, isSeal: false },
  },
  {
    id: 1135, name: 'The Hydraulic Press', file: 'Hydrodynamicist_HydraulicPress',
    component: Hydrodynamicist_HydraulicPress,
    compositorInput: { signature: 'science_x_soul', form: 'Tide', chrono: 'work', kbe: 'k', hook: 'tap', specimenSeed: 1135, isSeal: false },
  },
  {
    id: 1136, name: 'The Vortex', file: 'Hydrodynamicist_Vortex',
    component: Hydrodynamicist_Vortex,
    compositorInput: { signature: 'sacred_ordinary', form: 'Tide', chrono: 'morning', kbe: 'e', hook: 'drag', specimenSeed: 1136, isSeal: false },
  },
  {
    id: 1137, name: 'The Surface Tension', file: 'Hydrodynamicist_SurfaceTension',
    component: Hydrodynamicist_SurfaceTension,
    compositorInput: { signature: 'pattern_glitch', form: 'Tide', chrono: 'social', kbe: 'b', hook: 'tap', specimenSeed: 1137, isSeal: false },
  },
  {
    id: 1138, name: 'The Phase Transition', file: 'Hydrodynamicist_PhaseTransition',
    component: Hydrodynamicist_PhaseTransition,
    compositorInput: { signature: 'witness_ritual', form: 'Tide', chrono: 'night', kbe: 'e', hook: 'drag', specimenSeed: 1138, isSeal: false },
  },
  {
    id: 1139, name: 'The Ocean Depth', file: 'Hydrodynamicist_OceanDepth',
    component: Hydrodynamicist_OceanDepth,
    compositorInput: { signature: 'sensory_cinema', form: 'Tide', chrono: 'night', kbe: 'e', hook: 'drag', specimenSeed: 1139, isSeal: false },
  },
  {
    id: 1140, name: 'The Hydro Seal', file: 'Hydrodynamicist_HydroSeal',
    component: Hydrodynamicist_HydroSeal,
    compositorInput: { signature: 'science_x_soul', form: 'Tide', chrono: 'night', kbe: 'e', hook: 'observe', specimenSeed: 1140, isSeal: true },
  },
];

// ── S115 Aviator ────────────────────────────────────────────────

const S115_SPECIMENS: SpecimenEntry[] = [
  {
    id: 1141, name: 'The Drag Check', file: 'Aviator_DragCheck',
    component: Aviator_DragCheck,
    compositorInput: { signature: 'pattern_glitch', form: 'Drift', chrono: 'morning', kbe: 'k', hook: 'tap', specimenSeed: 1141, isSeal: false },
  },
  {
    id: 1142, name: 'The Angle of Attack', file: 'Aviator_AngleOfAttack',
    component: Aviator_AngleOfAttack,
    compositorInput: { signature: 'science_x_soul', form: 'Drift', chrono: 'work', kbe: 'b', hook: 'drag', specimenSeed: 1142, isSeal: false },
  },
  {
    id: 1143, name: 'The Thrust-to-Weight Ratio', file: 'Aviator_ThrustToWeightRatio',
    component: Aviator_ThrustToWeightRatio,
    compositorInput: { signature: 'koan_paradox', form: 'Drift', chrono: 'work', kbe: 'k', hook: 'tap', specimenSeed: 1143, isSeal: false },
  },
  {
    id: 1144, name: 'The Coffin Corner', file: 'Aviator_CoffinCorner',
    component: Aviator_CoffinCorner,
    compositorInput: { signature: 'witness_ritual', form: 'Drift', chrono: 'social', kbe: 'b', hook: 'tap', specimenSeed: 1144, isSeal: false },
  },
  {
    id: 1145, name: 'The Headwind', file: 'Aviator_Headwind',
    component: Aviator_Headwind,
    compositorInput: { signature: 'poetic_precision', form: 'Drift', chrono: 'work', kbe: 'k', hook: 'tap', specimenSeed: 1145, isSeal: false },
  },
  {
    id: 1146, name: 'The Trim Tab', file: 'Aviator_TrimTab',
    component: Aviator_TrimTab,
    compositorInput: { signature: 'sensory_cinema', form: 'Drift', chrono: 'morning', kbe: 'e', hook: 'drag', specimenSeed: 1146, isSeal: false },
  },
  {
    id: 1147, name: 'The Center of Gravity', file: 'Aviator_CenterOfGravity',
    component: Aviator_CenterOfGravity,
    compositorInput: { signature: 'sacred_ordinary', form: 'Drift', chrono: 'night', kbe: 'k', hook: 'drag', specimenSeed: 1147, isSeal: false },
  },
  {
    id: 1148, name: 'The Ground Effect', file: 'Aviator_GroundEffect',
    component: Aviator_GroundEffect,
    compositorInput: { signature: 'witness_ritual', form: 'Drift', chrono: 'night', kbe: 'e', hook: 'hold', specimenSeed: 1148, isSeal: false },
  },
  {
    id: 1149, name: 'The Feathered Prop', file: 'Aviator_FeatheredProp',
    component: Aviator_FeatheredProp,
    compositorInput: { signature: 'science_x_soul', form: 'Drift', chrono: 'social', kbe: 'b', hook: 'tap', specimenSeed: 1149, isSeal: false },
  },
  {
    id: 1150, name: 'The Aviator Seal', file: 'Aviator_AviatorSeal',
    component: Aviator_AviatorSeal,
    compositorInput: { signature: 'science_x_soul', form: 'Drift', chrono: 'night', kbe: 'e', hook: 'observe', specimenSeed: 1150, isSeal: true },
  },
];

// ── S116 Tensegrity ─────────────────────────────────────────────

const S116_SPECIMENS: SpecimenEntry[] = [
  {
    id: 1151, name: 'The Floating Compression', file: 'Tensegrity_FloatingCompression',
    component: Tensegrity_FloatingCompression,
    compositorInput: { signature: 'science_x_soul', form: 'Lattice', chrono: 'morning', kbe: 'k', hook: 'tap', specimenSeed: 1151, isSeal: false },
  },
  {
    id: 1152, name: 'The Pre-Stress', file: 'Tensegrity_PreStress',
    component: Tensegrity_PreStress,
    compositorInput: { signature: 'sensory_cinema', form: 'Lattice', chrono: 'morning', kbe: 'e', hook: 'drag', specimenSeed: 1152, isSeal: false },
  },
  {
    id: 1153, name: 'The Load Distribution', file: 'Tensegrity_LoadDistribution',
    component: Tensegrity_LoadDistribution,
    compositorInput: { signature: 'sacred_ordinary', form: 'Lattice', chrono: 'social', kbe: 'b', hook: 'tap', specimenSeed: 1153, isSeal: false },
  },
  {
    id: 1154, name: 'The Omni-Directional', file: 'Tensegrity_OmniDirectional',
    component: Tensegrity_OmniDirectional,
    compositorInput: { signature: 'koan_paradox', form: 'Lattice', chrono: 'work', kbe: 'k', hook: 'tap', specimenSeed: 1154, isSeal: false },
  },
  {
    id: 1155, name: 'The Fascial Release', file: 'Tensegrity_FascialRelease',
    component: Tensegrity_FascialRelease,
    compositorInput: { signature: 'witness_ritual', form: 'Lattice', chrono: 'night', kbe: 'e', hook: 'drag', specimenSeed: 1155, isSeal: false },
  },
  {
    id: 1156, name: 'The Space Frame', file: 'Tensegrity_SpaceFrame',
    component: Tensegrity_SpaceFrame,
    compositorInput: { signature: 'poetic_precision', form: 'Lattice', chrono: 'work', kbe: 'k', hook: 'tap', specimenSeed: 1156, isSeal: false },
  },
  {
    id: 1157, name: 'The Dynamic Equilibrium', file: 'Tensegrity_DynamicEquilibrium',
    component: Tensegrity_DynamicEquilibrium,
    compositorInput: { signature: 'pattern_glitch', form: 'Lattice', chrono: 'morning', kbe: 'e', hook: 'tap', specimenSeed: 1157, isSeal: false },
  },
  {
    id: 1158, name: 'The Yield Point', file: 'Tensegrity_YieldPoint',
    component: Tensegrity_YieldPoint,
    compositorInput: { signature: 'science_x_soul', form: 'Lattice', chrono: 'social', kbe: 'b', hook: 'hold', specimenSeed: 1158, isSeal: false },
  },
  {
    id: 1159, name: 'The Network Node', file: 'Tensegrity_NetworkNode',
    component: Tensegrity_NetworkNode,
    compositorInput: { signature: 'sacred_ordinary', form: 'Lattice', chrono: 'work', kbe: 'k', hook: 'tap', specimenSeed: 1159, isSeal: false },
  },
  {
    id: 1160, name: 'The Tensegrity Seal', file: 'Tensegrity_TensegritySeal',
    component: Tensegrity_TensegritySeal,
    compositorInput: { signature: 'science_x_soul', form: 'Lattice', chrono: 'night', kbe: 'e', hook: 'observe', specimenSeed: 1160, isSeal: true },
  },
];

// ── S117 Wayfinder ──────────────────────────────────────────────

const S117_SPECIMENS: SpecimenEntry[] = [
  {
    id: 1161, name: 'The Dead Reckoning', file: 'Wayfinder_DeadReckoning',
    component: Wayfinder_DeadReckoning,
    compositorInput: { signature: 'sacred_ordinary', form: 'Compass', chrono: 'morning', kbe: 'b', hook: 'tap', specimenSeed: 1161, isSeal: false },
  },
  {
    id: 1162, name: 'The Swell Read', file: 'Wayfinder_SwellRead',
    component: Wayfinder_SwellRead,
    compositorInput: { signature: 'sensory_cinema', form: 'Compass', chrono: 'morning', kbe: 'e', hook: 'drag', specimenSeed: 1162, isSeal: false },
  },
  {
    id: 1163, name: 'The Zenith Star', file: 'Wayfinder_ZenithStar',
    component: Wayfinder_ZenithStar,
    compositorInput: { signature: 'koan_paradox', form: 'Compass', chrono: 'night', kbe: 'k', hook: 'tap', specimenSeed: 1163, isSeal: false },
  },
  {
    id: 1164, name: 'The Bird Sign', file: 'Wayfinder_BirdSign',
    component: Wayfinder_BirdSign,
    compositorInput: { signature: 'witness_ritual', form: 'Compass', chrono: 'social', kbe: 'b', hook: 'tap', specimenSeed: 1164, isSeal: false },
  },
  {
    id: 1165, name: 'The Cloud Stack', file: 'Wayfinder_CloudStack',
    component: Wayfinder_CloudStack,
    compositorInput: { signature: 'pattern_glitch', form: 'Compass', chrono: 'work', kbe: 'k', hook: 'tap', specimenSeed: 1165, isSeal: false },
  },
  {
    id: 1166, name: 'The Etak', file: 'Wayfinder_Etak',
    component: Wayfinder_Etak,
    compositorInput: { signature: 'science_x_soul', form: 'Compass', chrono: 'work', kbe: 'k', hook: 'tap', specimenSeed: 1166, isSeal: false },
  },
  {
    id: 1167, name: 'The Phosphorescence', file: 'Wayfinder_Phosphorescence',
    component: Wayfinder_Phosphorescence,
    compositorInput: { signature: 'sensory_cinema', form: 'Compass', chrono: 'night', kbe: 'e', hook: 'drag', specimenSeed: 1167, isSeal: false },
  },
  {
    id: 1168, name: 'The Storm Drift', file: 'Wayfinder_StormDrift',
    component: Wayfinder_StormDrift,
    compositorInput: { signature: 'sacred_ordinary', form: 'Compass', chrono: 'social', kbe: 'b', hook: 'tap', specimenSeed: 1168, isSeal: false },
  },
  {
    id: 1169, name: 'The Land Scent', file: 'Wayfinder_LandScent',
    component: Wayfinder_LandScent,
    compositorInput: { signature: 'witness_ritual', form: 'Compass', chrono: 'morning', kbe: 'e', hook: 'tap', specimenSeed: 1169, isSeal: false },
  },
  {
    id: 1170, name: 'The Wayfinder Seal', file: 'Wayfinder_WayfinderSeal',
    component: Wayfinder_WayfinderSeal,
    compositorInput: { signature: 'science_x_soul', form: 'Compass', chrono: 'night', kbe: 'k', hook: 'observe', specimenSeed: 1170, isSeal: true },
  },
];

// ── S118 Receiver ───────────────────────────────────────────────

const S118_SPECIMENS: SpecimenEntry[] = [
  {
    id: 1171, name: 'The Signal-to-Noise Ratio', file: 'Receiver_SignalToNoiseRatio',
    component: Receiver_SignalToNoiseRatio,
    compositorInput: { signature: 'science_x_soul', form: 'Pulse', chrono: 'work', kbe: 'k', hook: 'tap', specimenSeed: 1171, isSeal: false },
  },
  {
    id: 1172, name: 'The Frequency Scan', file: 'Receiver_FrequencyScan',
    component: Receiver_FrequencyScan,
    compositorInput: { signature: 'sensory_cinema', form: 'Pulse', chrono: 'morning', kbe: 'e', hook: 'drag', specimenSeed: 1172, isSeal: false },
  },
  {
    id: 1173, name: 'The Squelch', file: 'Receiver_Squelch',
    component: Receiver_Squelch,
    compositorInput: { signature: 'sacred_ordinary', form: 'Pulse', chrono: 'morning', kbe: 'b', hook: 'tap', specimenSeed: 1173, isSeal: false },
  },
  {
    id: 1174, name: 'The Antenna Gain', file: 'Receiver_AntennaGain',
    component: Receiver_AntennaGain,
    compositorInput: { signature: 'witness_ritual', form: 'Pulse', chrono: 'social', kbe: 'e', hook: 'tap', specimenSeed: 1174, isSeal: false },
  },
  {
    id: 1175, name: 'The Modulation', file: 'Receiver_Modulation',
    component: Receiver_Modulation,
    compositorInput: { signature: 'koan_paradox', form: 'Pulse', chrono: 'work', kbe: 'k', hook: 'tap', specimenSeed: 1175, isSeal: false },
  },
  {
    id: 1176, name: 'The Interference Pattern', file: 'Receiver_InterferencePattern',
    component: Receiver_InterferencePattern,
    compositorInput: { signature: 'pattern_glitch', form: 'Pulse', chrono: 'work', kbe: 'k', hook: 'drag', specimenSeed: 1176, isSeal: false },
  },
  {
    id: 1177, name: 'The Feedback Loop', file: 'Receiver_FeedbackLoop',
    component: Receiver_FeedbackLoop,
    compositorInput: { signature: 'sensory_cinema', form: 'Pulse', chrono: 'night', kbe: 'e', hook: 'tap', specimenSeed: 1177, isSeal: false },
  },
  {
    id: 1178, name: 'The Encryption', file: 'Receiver_Encryption',
    component: Receiver_Encryption,
    compositorInput: { signature: 'sacred_ordinary', form: 'Pulse', chrono: 'social', kbe: 'b', hook: 'tap', specimenSeed: 1178, isSeal: false },
  },
  {
    id: 1179, name: 'The Broadcast Power', file: 'Receiver_BroadcastPower',
    component: Receiver_BroadcastPower,
    compositorInput: { signature: 'witness_ritual', form: 'Pulse', chrono: 'morning', kbe: 'e', hook: 'hold', specimenSeed: 1179, isSeal: false },
  },
  {
    id: 1180, name: 'The Receiver Seal', file: 'Receiver_ReceiverSeal',
    component: Receiver_ReceiverSeal,
    compositorInput: { signature: 'science_x_soul', form: 'Pulse', chrono: 'night', kbe: 'k', hook: 'observe', specimenSeed: 1180, isSeal: true },
  },
];

// ── S119 Vector ─────────────────────────────────────────────────

const S119_SPECIMENS: SpecimenEntry[] = [
  {
    id: 1181, name: 'The Scalar vs. Vector', file: 'Vector_ScalarVsVector',
    component: Vector_ScalarVsVector,
    compositorInput: { signature: 'science_x_soul', form: 'Drift', chrono: 'work', kbe: 'k', hook: 'tap', specimenSeed: 1181, isSeal: false },
  },
  {
    id: 1182, name: 'The Resultant Force', file: 'Vector_ResultantForce',
    component: Vector_ResultantForce,
    compositorInput: { signature: 'sacred_ordinary', form: 'Drift', chrono: 'morning', kbe: 'b', hook: 'tap', specimenSeed: 1182, isSeal: false },
  },
  {
    id: 1183, name: 'The Unit Vector', file: 'Vector_UnitVector',
    component: Vector_UnitVector,
    compositorInput: { signature: 'witness_ritual', form: 'Drift', chrono: 'morning', kbe: 'e', hook: 'tap', specimenSeed: 1183, isSeal: false },
  },
  {
    id: 1184, name: 'The Cross Product', file: 'Vector_CrossProduct',
    component: Vector_CrossProduct,
    compositorInput: { signature: 'pattern_glitch', form: 'Drift', chrono: 'work', kbe: 'k', hook: 'tap', specimenSeed: 1184, isSeal: false },
  },
  {
    id: 1185, name: 'The Dot Product', file: 'Vector_DotProduct',
    component: Vector_DotProduct,
    compositorInput: { signature: 'koan_paradox', form: 'Drift', chrono: 'work', kbe: 'b', hook: 'tap', specimenSeed: 1185, isSeal: false },
  },
  {
    id: 1186, name: 'The Null Vector', file: 'Vector_NullVector',
    component: Vector_NullVector,
    compositorInput: { signature: 'sensory_cinema', form: 'Drift', chrono: 'night', kbe: 'e', hook: 'tap', specimenSeed: 1186, isSeal: false },
  },
  {
    id: 1187, name: 'The Acceleration Vector', file: 'Vector_AccelerationVector',
    component: Vector_AccelerationVector,
    compositorInput: { signature: 'sensory_cinema', form: 'Drift', chrono: 'social', kbe: 'e', hook: 'hold', specimenSeed: 1187, isSeal: false },
  },
  {
    id: 1188, name: 'The Decomposition', file: 'Vector_Decomposition',
    component: Vector_Decomposition,
    compositorInput: { signature: 'science_x_soul', form: 'Drift', chrono: 'work', kbe: 'k', hook: 'tap', specimenSeed: 1188, isSeal: false },
  },
  {
    id: 1189, name: 'The Field Line', file: 'Vector_FieldLine',
    component: Vector_FieldLine,
    compositorInput: { signature: 'witness_ritual', form: 'Drift', chrono: 'morning', kbe: 'b', hook: 'drag', specimenSeed: 1189, isSeal: false },
  },
  {
    id: 1190, name: 'The Vector Seal', file: 'Vector_VectorSeal',
    component: Vector_VectorSeal,
    compositorInput: { signature: 'science_x_soul', form: 'Drift', chrono: 'night', kbe: 'k', hook: 'observe', specimenSeed: 1190, isSeal: true },
  },
];

// ── S120 Tuning ─────────────────────────────────────────────────

const S120_SPECIMENS: SpecimenEntry[] = [
  {
    id: 1191, name: 'The Tension Check', file: 'Tuning_TensionCheck',
    component: Tuning_TensionCheck,
    compositorInput: { signature: 'sensory_cinema', form: 'Echo', chrono: 'morning', kbe: 'e', hook: 'tap', specimenSeed: 1191, isSeal: false },
  },
  {
    id: 1192, name: 'The Dissonance Resolve', file: 'Tuning_DissonanceResolve',
    component: Tuning_DissonanceResolve,
    compositorInput: { signature: 'sacred_ordinary', form: 'Echo', chrono: 'work', kbe: 'b', hook: 'tap', specimenSeed: 1192, isSeal: false },
  },
  {
    id: 1193, name: 'The Fundamental Frequency', file: 'Tuning_FundamentalFrequency',
    component: Tuning_FundamentalFrequency,
    compositorInput: { signature: 'science_x_soul', form: 'Echo', chrono: 'work', kbe: 'k', hook: 'tap', specimenSeed: 1193, isSeal: false },
  },
  {
    id: 1194, name: 'The Sympathetic Vibration', file: 'Tuning_SympatheticVibration',
    component: Tuning_SympatheticVibration,
    compositorInput: { signature: 'witness_ritual', form: 'Echo', chrono: 'social', kbe: 'e', hook: 'hold', specimenSeed: 1194, isSeal: false },
  },
  {
    id: 1195, name: 'The Beat Frequency', file: 'Tuning_BeatFrequency',
    component: Tuning_BeatFrequency,
    compositorInput: { signature: 'pattern_glitch', form: 'Echo', chrono: 'morning', kbe: 'e', hook: 'tap', specimenSeed: 1195, isSeal: false },
  },
  {
    id: 1196, name: 'The Overtone Series', file: 'Tuning_OvertoneSeries',
    component: Tuning_OvertoneSeries,
    compositorInput: { signature: 'koan_paradox', form: 'Echo', chrono: 'night', kbe: 'k', hook: 'tap', specimenSeed: 1196, isSeal: false },
  },
  {
    id: 1197, name: 'The Dead Spot', file: 'Tuning_DeadSpot',
    component: Tuning_DeadSpot,
    compositorInput: { signature: 'sensory_cinema', form: 'Echo', chrono: 'night', kbe: 'e', hook: 'drag', specimenSeed: 1197, isSeal: false },
  },
  {
    id: 1198, name: 'The Amplifier', file: 'Tuning_Amplifier',
    component: Tuning_Amplifier,
    compositorInput: { signature: 'science_x_soul', form: 'Echo', chrono: 'work', kbe: 'k', hook: 'tap', specimenSeed: 1198, isSeal: false },
  },
  {
    id: 1199, name: 'The Fade Out', file: 'Tuning_FadeOut',
    component: Tuning_FadeOut,
    compositorInput: { signature: 'witness_ritual', form: 'Echo', chrono: 'night', kbe: 'e', hook: 'observe', specimenSeed: 1199, isSeal: false },
  },
  {
    id: 1200, name: 'The Harmonic Seal', file: 'Tuning_HarmonicSeal',
    component: Tuning_HarmonicSeal,
    compositorInput: { signature: 'science_x_soul', form: 'Echo', chrono: 'night', kbe: 'k', hook: 'observe', specimenSeed: 1200, isSeal: true },
  },
];

// ── Series groups ────────────────────────────────────────────────

const SERIES_GROUPS: SeriesGroup[] = [
  {
    key: 's101',
    label: 'S101 Projector',
    seriesNumber: 101,
    form: 'Theater',
    accentColor: 'hsla(45, 30%, 42%, 0.8)',
    specimens: S101_SPECIMENS,
  },
  {
    key: 's102',
    label: 'S102 Chronomancer',
    seriesNumber: 102,
    form: 'Cosmos',
    accentColor: 'hsla(230, 22%, 40%, 0.8)',
    specimens: S102_SPECIMENS,
  },
  {
    key: 's103',
    label: 'S103 Resonator',
    seriesNumber: 103,
    form: 'Ocean',
    accentColor: 'hsla(180, 22%, 40%, 0.8)',
    specimens: S103_SPECIMENS,
  },
  {
    key: 's104',
    label: 'S104 Materialist',
    seriesNumber: 104,
    form: 'Ember',
    accentColor: 'hsla(32, 28%, 42%, 0.8)',
    specimens: S104_SPECIMENS,
  },
  {
    key: 's105',
    label: 'S105 Refractor',
    seriesNumber: 105,
    form: 'Stellar',
    accentColor: 'hsla(260, 28%, 45%, 0.8)',
    specimens: S105_SPECIMENS,
  },
  {
    key: 's106',
    label: 'S106 Engine',
    seriesNumber: 106,
    form: 'Circuit',
    accentColor: 'hsla(205, 26%, 42%, 0.8)',
    specimens: S106_SPECIMENS,
  },
  {
    key: 's107',
    label: 'S107 Catalyst',
    seriesNumber: 107,
    form: 'Glacier',
    accentColor: 'hsla(190, 24%, 42%, 0.8)',
    specimens: S107_SPECIMENS,
  },
  {
    key: 's108',
    label: 'S108 Quantum Architect',
    seriesNumber: 108,
    form: 'Tide',
    accentColor: 'hsla(170, 26%, 42%, 0.8)',
    specimens: S108_SPECIMENS,
  },
  {
    key: 's109',
    label: 'S109 Transmuter',
    seriesNumber: 109,
    form: 'Ember',
    accentColor: 'hsla(25, 45%, 42%, 0.8)',
    specimens: S109_SPECIMENS,
  },
  {
    key: 's110',
    label: 'S110 Cyberneticist',
    seriesNumber: 110,
    form: 'Circuit',
    accentColor: 'hsla(205, 30%, 42%, 0.8)',
    specimens: S110_SPECIMENS,
  },
  {
    key: 's111',
    label: 'S111 FieldArchitect',
    seriesNumber: 111,
    form: 'Stellar',
    accentColor: 'hsla(260, 28%, 44%, 0.8)',
    specimens: S111_SPECIMENS,
  },
  {
    key: 's112',
    label: 'S112 Kineticist',
    seriesNumber: 112,
    form: 'Storm',
    accentColor: 'hsla(25, 32%, 44%, 0.8)',
    specimens: S112_SPECIMENS,
  },
  {
    key: 's113',
    label: 'S113 Crystal',
    seriesNumber: 113,
    form: 'Glacier',
    accentColor: 'hsla(195, 30%, 48%, 0.8)',
    specimens: S113_SPECIMENS,
  },
  {
    key: 's114',
    label: 'S114 Hydrodynamicist',
    seriesNumber: 114,
    form: 'Tide',
    accentColor: 'hsla(205, 32%, 48%, 0.8)',
    specimens: S114_SPECIMENS,
  },
  {
    key: 's115',
    label: 'S115 Aviator',
    seriesNumber: 115,
    form: 'Drift',
    accentColor: 'hsla(212, 25%, 48%, 0.8)',
    specimens: S115_SPECIMENS,
  },
  {
    key: 's116',
    label: 'S116 Tensegrity',
    seriesNumber: 116,
    form: 'Lattice',
    accentColor: 'hsla(176, 24%, 44%, 0.8)',
    specimens: S116_SPECIMENS,
  },
  {
    key: 's117',
    label: 'S117 Wayfinder',
    seriesNumber: 117,
    form: 'Compass',
    accentColor: 'hsla(220, 24%, 46%, 0.8)',
    specimens: S117_SPECIMENS,
  },
  {
    key: 's118',
    label: 'S118 Receiver',
    seriesNumber: 118,
    form: 'Pulse',
    accentColor: 'hsla(200, 24%, 42%, 0.8)',
    specimens: S118_SPECIMENS,
  },
  {
    key: 's119',
    label: 'S119 Vector',
    seriesNumber: 119,
    form: 'Drift',
    accentColor: 'hsla(240, 22%, 44%, 0.8)',
    specimens: S119_SPECIMENS,
  },
  {
    key: 's120',
    label: 'S120 Tuning',
    seriesNumber: 120,
    form: 'Echo',
    accentColor: 'hsla(30, 24%, 44%, 0.8)',
    specimens: S120_SPECIMENS,
  },
];

// ── Component ────────────────────────────────────────────────────

export default function ProofPreview() {
  const [activeSeriesIdx, setActiveSeriesIdx] = useState(0);
  const [activeSpecimenIdx, setActiveSpecimenIdx] = useState(0);
  const [showDebug, setShowDebug] = useState(true);
  const [remountKey, setRemountKey] = useState(0);

  const series = SERIES_GROUPS[activeSeriesIdx];
  const specimen = series.specimens[activeSpecimenIdx];
  const SpecimenComponent = specimen.component;

  const composition = useMemo(
    () => composeNaviCue(specimen.compositorInput),
    [specimen.id],
  );

  const handleComplete = useCallback(() => {
    // Auto-advance to next specimen within series
    if (activeSpecimenIdx < series.specimens.length - 1) {
      setTimeout(() => {
        setActiveSpecimenIdx(i => i + 1);
        setRemountKey(k => k + 1);
      }, 1500);
    }
  }, [activeSpecimenIdx, series.specimens.length]);

  const goToSpecimen = useCallback((idx: number) => {
    setActiveSpecimenIdx(idx);
    setRemountKey(k => k + 1);
  }, []);

  const goToSeries = useCallback((idx: number) => {
    setActiveSeriesIdx(idx);
    setActiveSpecimenIdx(0);
    setRemountKey(k => k + 1);
  }, []);

  const totalCount = SERIES_GROUPS.reduce((sum, g) => sum + g.specimens.length, 0);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: surfaces.solid.base,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: fonts.primary,
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        zIndex: 10,
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 11,
            fontFamily: fonts.mono,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.05em',
          }}>
            PROOF PREVIEW
          </span>
          <span style={{
            fontSize: 11,
            fontFamily: fonts.mono,
            color: 'rgba(255,255,255,0.15)',
          }}>
            {totalCount} specimens across {SERIES_GROUPS.length} series
          </span>
          <span style={{
            fontSize: 11,
            fontFamily: fonts.mono,
            color: series.accentColor,
          }}>
            {specimen.id} / {specimen.name}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setShowDebug(!showDebug)}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 4,
              color: showDebug ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
              fontSize: 11,
              fontFamily: fonts.mono,
              padding: '4px 8px',
              cursor: 'pointer',
              transition: 'color 0.2s, border-color 0.2s',
            }}
          >
            {showDebug ? 'hide debug' : 'show debug'}
          </button>
        </div>
      </div>

      {/* Series selector tabs */}
      <div style={{
        display: 'flex',
        gap: 0,
        padding: '0 20px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        zIndex: 10,
        position: 'relative',
      }}>
        {SERIES_GROUPS.map((g, i) => (
          <button
            key={g.key}
            onClick={() => goToSeries(i)}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: i === activeSeriesIdx
                ? `2px solid ${g.accentColor}`
                : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'border-color 0.3s',
            }}
          >
            <span style={{
              fontSize: 11,
              fontFamily: fonts.mono,
              letterSpacing: '0.03em',
              color: i === activeSeriesIdx
                ? g.accentColor
                : 'rgba(255,255,255,0.2)',
              transition: 'color 0.3s',
            }}>
              S{g.seriesNumber}
            </span>
            <span style={{
              fontSize: 11,
              fontFamily: fonts.secondary,
              fontStyle: 'italic',
              color: i === activeSeriesIdx
                ? 'rgba(255,255,255,0.45)'
                : 'rgba(255,255,255,0.15)',
              transition: 'color 0.3s',
            }}>
              {g.form}
            </span>
            <span style={{
              fontSize: 9,
              fontFamily: fonts.mono,
              color: 'rgba(255,255,255,0.12)',
            }}>
              {g.specimens.length}
            </span>
          </button>
        ))}
      </div>

      {/* Debug panel */}
      <AnimatePresence>
        {showDebug && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              overflow: 'hidden',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              zIndex: 10,
              position: 'relative',
            }}
          >
            <div style={{
              padding: '12px 20px',
              display: 'flex',
              gap: 32,
              flexWrap: 'wrap',
            }}>
              {/* Compositor output */}
              <div style={{
                fontSize: 11,
                fontFamily: fonts.mono,
                color: 'rgba(255,255,255,0.35)',
                lineHeight: 1.6,
                minWidth: 200,
              }}>
                <div style={{ color: 'rgba(255,255,255,0.2)', marginBottom: 4 }}>compositor output:</div>
                <div>scene: <span style={{ color: series.accentColor }}>{composition.scene}</span></div>
                <div>atmosphere: <span style={{ color: series.accentColor }}>{composition.atmosphereMode}</span></div>
                <div>entry: <span style={{ color: series.accentColor }}>{composition.entryPattern}</span></div>
                <div>shape: <span style={{ color: series.accentColor }}>{composition.interactionShape}</span></div>
                <div>color temp: <span style={{ color: series.accentColor }}>{composition.colorTemperature}</span></div>
                <div>typography: <span style={{ color: series.accentColor }}>{composition.typographyMood}</span></div>
                <div>transition: <span style={{ color: series.accentColor }}>{composition.transitionStyle}</span></div>
              </div>

              {/* Input context */}
              <div style={{
                fontSize: 11,
                fontFamily: fonts.mono,
                color: 'rgba(255,255,255,0.2)',
                lineHeight: 1.6,
                minWidth: 200,
              }}>
                <div style={{ color: 'rgba(255,255,255,0.12)', marginBottom: 4 }}>input context:</div>
                <div>signature: {specimen.compositorInput.signature}</div>
                <div>form: {specimen.compositorInput.form}</div>
                <div>hook: {specimen.compositorInput.hook}</div>
                <div>chrono: {specimen.compositorInput.chrono}</div>
                <div>kbe: {specimen.compositorInput.kbe}</div>
                <div>seed: {specimen.compositorInput.specimenSeed}</div>
                <div>seal: {String(specimen.compositorInput.isSeal)}</div>
              </div>

              {/* File reference */}
              <div style={{
                fontSize: 11,
                fontFamily: fonts.mono,
                color: 'rgba(255,255,255,0.15)',
                lineHeight: 1.6,
                minWidth: 200,
              }}>
                <div style={{ color: 'rgba(255,255,255,0.12)', marginBottom: 4 }}>file:</div>
                <div>{specimen.file}.tsx</div>
                <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.1)' }}>
                  {series.label} [{activeSpecimenIdx + 1}/{series.specimens.length}]
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Specimen selector */}
      <div style={{
        display: 'flex',
        gap: 2,
        padding: '8px 20px',
        zIndex: 10,
        position: 'relative',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        {series.specimens.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goToSpecimen(i)}
            style={{
              minWidth: 44,
              padding: '6px 4px',
              background: i === activeSpecimenIdx ? 'rgba(255,255,255,0.06)' : 'transparent',
              border: i === activeSpecimenIdx ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
              borderRadius: 4,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              flexShrink: 0,
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            <span style={{
              fontSize: 10,
              fontFamily: fonts.mono,
              color: i === activeSpecimenIdx ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
            }}>
              {String(s.id).slice(-2)}
            </span>
            <span style={{
              fontSize: 9,
              fontFamily: fonts.secondary,
              fontStyle: 'italic',
              color: i === activeSpecimenIdx ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)',
            }}>
              {s.compositorInput.hook}
            </span>
            {s.compositorInput.isSeal && (
              <div style={{
                width: 3,
                height: 3,
                borderRadius: '50%',
                background: i === activeSpecimenIdx ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)',
                marginTop: 1,
              }} />
            )}
          </button>
        ))}
      </div>

      {/* Specimen viewport */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        minHeight: 0,
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${specimen.id}-${remountKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <NaviCueLabProvider>
              <SpecimenComponent onComplete={handleComplete} />
            </NaviCueLabProvider>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}