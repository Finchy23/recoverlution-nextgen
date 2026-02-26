/**
 * NAVICUE MASTER RENDERER
 * 
 * Routes database records from v_figma_navicue_type_matrix to the correct
 * bespoke React component. Matches on form + mechanism + kbe_layer via a
 * normalised lookup map, with specific overrides for Identity Koan (typeId
 * prefix).
 *
 * WIRED: 50 bespoke + 1400 lab specimens (through The Atlas Seal)
 */

import React from 'react';
import { resolveTypeIdAlias } from './library/typeIdAliases';
import AtomicNaviCueRenderer from './library/AtomicNaviCueRenderer';
import { getAtomicSpecByTypeId } from '@/app/data/lab/atomicLibrary';

// ── Identity Koan series (named exports) ─────────────────────────────
import { Exposure_IdentityKoan_Integrate_B } from './implementations/Exposure_IdentityKoan_Integrate_B';
import { Metacognition_IdentityKoan_Integrate_E } from './implementations/Metacognition_IdentityKoan_Integrate_E';
import { SelfCompassion_IdentityKoan_Integrate_B } from './implementations/SelfCompassion_IdentityKoan_Integrate_B';
import { SelfCompassion_IdentityKoan_Integrate_E } from './implementations/SelfCompassion_IdentityKoan_Integrate_E';
import { ValuesClarification_IdentityKoan_Integrate_B } from './implementations/ValuesClarification_IdentityKoan_Integrate_B';

// ── Mirror series (default exports) ──────────────────────────────────
import Mirror_Integrate_BehavioralActivation_B from './implementations/Mirror_Integrate_BehavioralActivation_B';
import Mirror_Integrate_BehavioralActivation_E from './implementations/Mirror_Integrate_BehavioralActivation_E';
import Mirror_Integrate_Exposure_B from './implementations/Mirror_Integrate_Exposure_B';
import Mirror_Integrate_Exposure_E from './implementations/Mirror_Integrate_Exposure_E';
import Mirror_Integrate_Metacognition_B from './implementations/Mirror_Integrate_Metacognition_B';
import Mirror_Integrate_SelfCompassion_B from './implementations/Mirror_Integrate_SelfCompassion_B';
import Mirror_Integrate_SelfCompassion_E from './implementations/Mirror_Integrate_SelfCompassion_E';
import Mirror_Integrate_ValuesClarification_B from './implementations/Mirror_Integrate_ValuesClarification_B';
import Mirror_Integrate_ValuesClarification_E from './implementations/Mirror_Integrate_ValuesClarification_E';

// ── Parts Rollcall series (default exports) ──────────────────────────
import PartsRollcall_Integrate_BehavioralActivation_E from './implementations/PartsRollcall_Integrate_BehavioralActivation_E';
import PartsRollcall_Integrate_Exposure_B from './implementations/PartsRollcall_Integrate_Exposure_B';
import PartsRollcall_Integrate_Metacognition_B from './implementations/PartsRollcall_Integrate_Metacognition_B';
import PartsRollcall_Integrate_Metacognition_E from './implementations/PartsRollcall_Integrate_Metacognition_E';
import PartsRollcall_Integrate_SelfCompassion_B from './implementations/PartsRollcall_Integrate_SelfCompassion_B';
import PartsRollcall_Integrate_SelfCompassion_E from './implementations/PartsRollcall_Integrate_SelfCompassion_E';
import PartsRollcall_Integrate_ValuesClarification_E from './implementations/PartsRollcall_Integrate_ValuesClarification_E';

// ── Practice series (default exports) ───────────────────────────────
import Practice_Integrate_BehavioralActivation_B from './implementations/Practice_Integrate_BehavioralActivation_B';
import Practice_Integrate_BehavioralActivation_E from './implementations/Practice_Integrate_BehavioralActivation_E';
import Practice_Integrate_Exposure_E from './implementations/Practice_Integrate_Exposure_E';
import Practice_Integrate_Metacognition_B from './implementations/Practice_Integrate_Metacognition_B';
import Practice_Integrate_Metacognition_E from './implementations/Practice_Integrate_Metacognition_E';
import Practice_Integrate_SelfCompassion_B from './implementations/Practice_Integrate_SelfCompassion_B';
import Practice_Integrate_SelfCompassion_E from './implementations/Practice_Integrate_SelfCompassion_E';
import Practice_Integrate_ValuesClarification_E from './implementations/Practice_Integrate_ValuesClarification_E';

// ── Probe series (default exports) ───────────────────────────────────
import Probe_Integrate_BehavioralActivation_B from './implementations/Probe_Integrate_BehavioralActivation_B';
import Probe_Integrate_BehavioralActivation_E from './implementations/Probe_Integrate_BehavioralActivation_E';
import Probe_Integrate_Exposure_B from './implementations/Probe_Integrate_Exposure_B';
import Probe_Integrate_Exposure_E from './implementations/Probe_Integrate_Exposure_E';
import Probe_Integrate_Metacognition_E from './implementations/Probe_Integrate_Metacognition_E';
import Probe_Integrate_SelfCompassion_B from './implementations/Probe_Integrate_SelfCompassion_B';
import Probe_Integrate_ValuesClarification_B from './implementations/Probe_Integrate_ValuesClarification_B';

// ── Key series (default exports) ─────────────────────────────────────
import Key_Integrate_BehavioralActivation_B from './implementations/Key_Integrate_BehavioralActivation_B';
import Key_Integrate_BehavioralActivation_E from './implementations/Key_Integrate_BehavioralActivation_E';
import Key_Integrate_Exposure_E from './implementations/Key_Integrate_Exposure_E';
import Key_Integrate_Metacognition_B from './implementations/Key_Integrate_Metacognition_B';
import Key_Integrate_Metacognition_E from './implementations/Key_Integrate_Metacognition_E';
import Key_Integrate_SelfCompassion_B from './implementations/Key_Integrate_SelfCompassion_B';
import Key_Integrate_ValuesClarification_E from './implementations/Key_Integrate_ValuesClarification_E';

// ── Inventory Spark series (default exports) ─────────────────────────
import InventorySpark_Integrate_BehavioralActivation_B from './implementations/InventorySpark_Integrate_BehavioralActivation_B';
import InventorySpark_Integrate_Exposure_B from './implementations/InventorySpark_Integrate_Exposure_B';
import InventorySpark_Integrate_Exposure_E from './implementations/InventorySpark_Integrate_Exposure_E';
import InventorySpark_Integrate_Metacognition_E from './implementations/InventorySpark_Integrate_Metacognition_E';
import InventorySpark_Integrate_SelfCompassion_B from './implementations/InventorySpark_Integrate_SelfCompassion_B';
import InventorySpark_Integrate_SelfCompassion_E from './implementations/InventorySpark_Integrate_SelfCompassion_E';
import InventorySpark_Integrate_ValuesClarification_B from './implementations/InventorySpark_Integrate_ValuesClarification_B';

// ── Novice Collection (default exports) ──────────────────────────
import Novice_PatternGlitch from './implementations/Novice_PatternGlitch';
import Novice_SomaticSigh from './implementations/Novice_SomaticSigh';
import Novice_WitnessWindow from './implementations/Novice_WitnessWindow';
import Novice_PermissionSlip from './implementations/Novice_PermissionSlip';
import Novice_ParadoxKey from './implementations/Novice_ParadoxKey';
import Novice_RealityAnchor from './implementations/Novice_RealityAnchor';
import Novice_MicroProof from './implementations/Novice_MicroProof';
import Novice_ValueCompass from './implementations/Novice_ValueCompass';
import Novice_FutureSimulation from './implementations/Novice_FutureSimulation';
import Novice_ConnectionThread from './implementations/Novice_ConnectionThread';

// ── Alchemist Collection (default exports) ───────────────────────
import Alchemist_CravingSurf from './implementations/Alchemist_CravingSurf';
import Alchemist_StoryEdit from './implementations/Alchemist_StoryEdit';
import Alchemist_TimeTelescope from './implementations/Alchemist_TimeTelescope';
import Alchemist_ShadowHug from './implementations/Alchemist_ShadowHug';
import Alchemist_MeaningMine from './implementations/Alchemist_MeaningMine';
import Alchemist_EnergyTransmute from './implementations/Alchemist_EnergyTransmute';
import Alchemist_CouncilOfElders from './implementations/Alchemist_CouncilOfElders';
import Alchemist_FactChecker from './implementations/Alchemist_FactChecker';
import Alchemist_GratitudeSniper from './implementations/Alchemist_GratitudeSniper';
import Alchemist_IdentityVote from './implementations/Alchemist_IdentityVote';

// ── Architect Collection (default exports) ───────────────────────
import Architect_BoundaryBrick from './implementations/Architect_BoundaryBrick';
import Architect_ConnectionBridge from './implementations/Architect_ConnectionBridge';
import Architect_MicroYes from './implementations/Architect_MicroYes';
import Architect_EnvironmentSweep from './implementations/Architect_EnvironmentSweep';
import Architect_MirrorGaze from './implementations/Architect_MirrorGaze';
import Architect_FrictionRemover from './implementations/Architect_FrictionRemover';
import Architect_ValueStake from './implementations/Architect_ValueStake';
import Architect_VulnerabilityDrop from './implementations/Architect_VulnerabilityDrop';
import Architect_GenerosityLoop from './implementations/Architect_GenerosityLoop';
import Architect_IdentitySeal from './implementations/Architect_IdentitySeal';

// ── Navigator Collection (default exports) ───────────────────────
import Navigator_TempoDial from './implementations/Navigator_TempoDial';
import Navigator_FrictionConverter from './implementations/Navigator_FrictionConverter';
import Navigator_IntuitionPing from './implementations/Navigator_IntuitionPing';
import Navigator_RepairStitch from './implementations/Navigator_RepairStitch';
import Navigator_DriftCorrection from './implementations/Navigator_DriftCorrection';
import Navigator_SpotlightShift from './implementations/Navigator_SpotlightShift';
import Navigator_DoubtDetox from './implementations/Navigator_DoubtDetox';
import Navigator_JoySnap from './implementations/Navigator_JoySnap';
import Navigator_ValuesJam from './implementations/Navigator_ValuesJam';
import Navigator_FlowTrigger from './implementations/Navigator_FlowTrigger';

// ── Sage Collection (default exports) ────────────────────────────
import Sage_EgoZoom from './implementations/Sage_EgoZoom';
import Sage_GenerationalLens from './implementations/Sage_GenerationalLens';
import Sage_EmptyBoat from './implementations/Sage_EmptyBoat';
import Sage_SilenceSoak from './implementations/Sage_SilenceSoak';
import Sage_CompassionCore from './implementations/Sage_CompassionCore';
import Sage_MortalityCheck from './implementations/Sage_MortalityCheck';
import Sage_RippleWatch from './implementations/Sage_RippleWatch';
import Sage_UniversalBreath from './implementations/Sage_UniversalBreath';
import Sage_LoveBroadcast from './implementations/Sage_LoveBroadcast';
import Sage_LegacyStamp from './implementations/Sage_LegacyStamp';

// ── Mender Collection (default exports) ──────────────────────────
import Mender_KintsugiFile from './implementations/Mender_KintsugiFile';
import Mender_ShameScrum from './implementations/Mender_ShameScrum';
import Mender_DataHarvest from './implementations/Mender_DataHarvest';
import Mender_ForgivenessLoop from './implementations/Mender_ForgivenessLoop';
import Mender_ResetButton from './implementations/Mender_ResetButton';
import Mender_VulnerabilityVow from './implementations/Mender_VulnerabilityVow';
import Mender_DustOff from './implementations/Mender_DustOff';
import Mender_GuardrailBuild from './implementations/Mender_GuardrailBuild';
import Mender_BodyScanDamage from './implementations/Mender_BodyScanDamage';
import Mender_ReCommitment from './implementations/Mender_ReCommitment';

// ── Diplomat Collection (default exports) ────────────────────────
import Diplomat_MirrorShield from './implementations/Diplomat_MirrorShield';
import Diplomat_TruceTable from './implementations/Diplomat_TruceTable';
import Diplomat_PerspectiveSwap from './implementations/Diplomat_PerspectiveSwap';
import Diplomat_PeaceThread from './implementations/Diplomat_PeaceThread';
import Diplomat_Translator from './implementations/Diplomat_Translator';
import Diplomat_BoundaryDance from './implementations/Diplomat_BoundaryDance';
import Diplomat_EmpathyBridge from './implementations/Diplomat_EmpathyBridge';
import Diplomat_DeEscalation from './implementations/Diplomat_DeEscalation';
import Diplomat_CommonGround from './implementations/Diplomat_CommonGround';
import Diplomat_SanghaSearch from './implementations/Diplomat_SanghaSearch';

// ── Weaver Collection (default exports) ─────────────────────────
import Weaver_ThreadMap from './implementations/Weaver_ThreadMap';
import Weaver_StoryLoom from './implementations/Weaver_StoryLoom';
import Weaver_ContradictionHold from './implementations/Weaver_ContradictionHold';
import Weaver_PatternBreak from './implementations/Weaver_PatternBreak';
import Weaver_MeaningWeave from './implementations/Weaver_MeaningWeave';
import Weaver_IntegrationSpiral from './implementations/Weaver_IntegrationSpiral';
import Weaver_ComplexityBreath from './implementations/Weaver_ComplexityBreath';
import Weaver_BridgeOfOpposites from './implementations/Weaver_BridgeOfOpposites';
import Weaver_WitnessWeave from './implementations/Weaver_WitnessWeave';
import Weaver_TapestrySeal from './implementations/Weaver_TapestrySeal';

// ── Visionary Collection (default exports) ──────────────────────
import Visionary_HorizonScan from './implementations/Visionary_HorizonScan';
import Visionary_SeedVault from './implementations/Visionary_SeedVault';
import Visionary_PossibilityPrism from './implementations/Visionary_PossibilityPrism';
import Visionary_FearTelescope from './implementations/Visionary_FearTelescope';
import Visionary_DreamAudit from './implementations/Visionary_DreamAudit';
import Visionary_TimeCapsule from './implementations/Visionary_TimeCapsule';
import Visionary_ObstacleFlip from './implementations/Visionary_ObstacleFlip';
import Visionary_VisionBoard from './implementations/Visionary_VisionBoard';
import Visionary_CourageMap from './implementations/Visionary_CourageMap';
import Visionary_BecomingSeal from './implementations/Visionary_BecomingSeal';

// ── Luminary Collection (default exports) ───────────────────────
import Luminary_TorchPass from './implementations/Luminary_TorchPass';
import Luminary_RippleSeed from './implementations/Luminary_RippleSeed';
import Luminary_LegacyLetter from './implementations/Luminary_LegacyLetter';
import Luminary_GratitudeBroadcast from './implementations/Luminary_GratitudeBroadcast';
import Luminary_MentorMirror from './implementations/Luminary_MentorMirror';
import Luminary_ServiceCompass from './implementations/Luminary_ServiceCompass';
import Luminary_GenerosityEngine from './implementations/Luminary_GenerosityEngine';
import Luminary_PurposePulse from './implementations/Luminary_PurposePulse';
import Luminary_DarkLight from './implementations/Luminary_DarkLight';
import Luminary_ConstellationSeal from './implementations/Luminary_ConstellationSeal';

// ── Hacker Collection (default exports) ─────────────────────────
import Hacker_LabelPeeler from './implementations/Hacker_LabelPeeler';
import Hacker_StatusGlitch from './implementations/Hacker_StatusGlitch';
import Hacker_AlgorithmJammer from './implementations/Hacker_AlgorithmJammer';
import Hacker_MimeticCheck from './implementations/Hacker_MimeticCheck';
import Hacker_SunkCostCut from './implementations/Hacker_SunkCostCut';
import Hacker_ScriptBurn from './implementations/Hacker_ScriptBurn';
import Hacker_AttentionPaywall from './implementations/Hacker_AttentionPaywall';
import Hacker_RoleReject from './implementations/Hacker_RoleReject';
import Hacker_ShouldDeleter from './implementations/Hacker_ShouldDeleter';
import Hacker_SourceCode from './implementations/Hacker_SourceCode';

// ── Chrononaut Collection (default exports) ─────────────────────
import Chrononaut_MemoryRemix from './implementations/Chrononaut_MemoryRemix';
import Chrononaut_DeepTime from './implementations/Chrononaut_DeepTime';
import Chrononaut_SlowMotionDay from './implementations/Chrononaut_SlowMotionDay';
import Chrononaut_FutureVisitor from './implementations/Chrononaut_FutureVisitor';
import Chrononaut_PatienceMuscle from './implementations/Chrononaut_PatienceMuscle';
import Chrononaut_UrgencyDeleter from './implementations/Chrononaut_UrgencyDeleter';
import Chrononaut_RegretReversal from './implementations/Chrononaut_RegretReversal';
import Chrononaut_AncestralBlink from './implementations/Chrononaut_AncestralBlink';
import Chrononaut_LoopSpotter from './implementations/Chrononaut_LoopSpotter';
import Chrononaut_EternalInstant from './implementations/Chrononaut_EternalInstant';

// ── Mycelium Collection (default exports) ───────────────────────
import Mycelium_InvisibleThread from './implementations/Mycelium_InvisibleThread';
import Mycelium_HiveMind from './implementations/Mycelium_HiveMind';
import Mycelium_SymbiosisCheck from './implementations/Mycelium_SymbiosisCheck';
import Mycelium_RootShare from './implementations/Mycelium_RootShare';
import Mycelium_SignalPulse from './implementations/Mycelium_SignalPulse';
import Mycelium_MirrorNeuron from './implementations/Mycelium_MirrorNeuron';
import Mycelium_WideNet from './implementations/Mycelium_WideNet';
import Mycelium_CommonGround from './implementations/Mycelium_CommonGround';
import Mycelium_DunbarSorter from './implementations/Mycelium_DunbarSorter';
import Mycelium_MycelialMap from './implementations/Mycelium_MycelialMap';

// ── Aesthete Collection (default exports) ───────────────────────
import Aesthete_GoldenRatio from './implementations/Aesthete_GoldenRatio';
import Aesthete_ColorSoak from './implementations/Aesthete_ColorSoak';
import Aesthete_WabiSabi from './implementations/Aesthete_WabiSabi';
import Aesthete_NegativeSpace from './implementations/Aesthete_NegativeSpace';
import Aesthete_TextureTouch from './implementations/Aesthete_TextureTouch';
import Aesthete_DesignEdit from './implementations/Aesthete_DesignEdit';
import Aesthete_SoundBath from './implementations/Aesthete_SoundBath';
import Aesthete_LightSculpt from './implementations/Aesthete_LightSculpt';
import Aesthete_TasteSavor from './implementations/Aesthete_TasteSavor';
import Aesthete_MasterpieceFrame from './implementations/Aesthete_MasterpieceFrame';

// ── Elemental Collection (default exports) ──────────────────────
import Elemental_FireGaze from './implementations/Elemental_FireGaze';
import Elemental_WaterFloat from './implementations/Elemental_WaterFloat';
import Elemental_WindShear from './implementations/Elemental_WindShear';
import Elemental_StoneHold from './implementations/Elemental_StoneHold';
import Elemental_IceShock from './implementations/Elemental_IceShock';
import Elemental_RootDrop from './implementations/Elemental_RootDrop';
import Elemental_ThunderGap from './implementations/Elemental_ThunderGap';
import Elemental_RiverFlow from './implementations/Elemental_RiverFlow';
import Elemental_SaltCleanse from './implementations/Elemental_SaltCleanse';
import Elemental_ElementalistSeal from './implementations/Elemental_ElementalistSeal';

// ── Phenomenologist Collection (default exports) ────────────────
import Phenomenologist_RawData from './implementations/Phenomenologist_RawData';
import Phenomenologist_AudioZoom from './implementations/Phenomenologist_AudioZoom';
import Phenomenologist_BlindWalk from './implementations/Phenomenologist_BlindWalk';
import Phenomenologist_TasteExplode from './implementations/Phenomenologist_TasteExplode';
import Phenomenologist_TemperatureScan from './implementations/Phenomenologist_TemperatureScan';
import Phenomenologist_ProprioceptionCheck from './implementations/Phenomenologist_ProprioceptionCheck';
import Phenomenologist_ColorDeconstruct from './implementations/Phenomenologist_ColorDeconstruct';
import Phenomenologist_OlfactoryHunt from './implementations/Phenomenologist_OlfactoryHunt';
import Phenomenologist_MicroTexture from './implementations/Phenomenologist_MicroTexture';
import Phenomenologist_PerceptionSeal from './implementations/Phenomenologist_PerceptionSeal';

// ── Alchemist II Collection (default exports) ───────────────────
import AlchemistII_AngerForge from './implementations/AlchemistII_AngerForge';
import AlchemistII_GriefGarden from './implementations/AlchemistII_GriefGarden';
import AlchemistII_FearFuel from './implementations/AlchemistII_FearFuel';
import AlchemistII_EnvyMap from './implementations/AlchemistII_EnvyMap';
import AlchemistII_BoredomPortal from './implementations/AlchemistII_BoredomPortal';
import AlchemistII_AnxietyAnchor from './implementations/AlchemistII_AnxietyAnchor';
import AlchemistII_RegretCompost from './implementations/AlchemistII_RegretCompost';
import AlchemistII_ShameSolvent from './implementations/AlchemistII_ShameSolvent';
import AlchemistII_RejectionRicochet from './implementations/AlchemistII_RejectionRicochet';
import AlchemistII_AlchemySeal from './implementations/AlchemistII_AlchemySeal';

// ── Servant Leader Collection (default exports) ─────────────────
import ServantLeader_EgoCheck from './implementations/ServantLeader_EgoCheck';
import ServantLeader_PowerTransfer from './implementations/ServantLeader_PowerTransfer';
import ServantLeader_SilenceOfCommand from './implementations/ServantLeader_SilenceOfCommand';
import ServantLeader_PraiseLaser from './implementations/ServantLeader_PraiseLaser';
import ServantLeader_ResponsibilityTake from './implementations/ServantLeader_ResponsibilityTake';
import ServantLeader_VisionCast from './implementations/ServantLeader_VisionCast';
import ServantLeader_ServantBow from './implementations/ServantLeader_ServantBow';
import ServantLeader_ConflictDissolve from './implementations/ServantLeader_ConflictDissolve';
import ServantLeader_QuietMentor from './implementations/ServantLeader_QuietMentor';
import ServantLeader_LeaderSeal from './implementations/ServantLeader_LeaderSeal';

// ── Omega Point Collection (default exports) ────────────────────
import OmegaPoint_DotConnector from './implementations/OmegaPoint_DotConnector';
import OmegaPoint_BinaryBreaker from './implementations/OmegaPoint_BinaryBreaker';
import OmegaPoint_ReturnToZero from './implementations/OmegaPoint_ReturnToZero';
import OmegaPoint_Synthesis from './implementations/OmegaPoint_Synthesis';
import OmegaPoint_SystemView from './implementations/OmegaPoint_SystemView';
import OmegaPoint_ParadoxHold from './implementations/OmegaPoint_ParadoxHold';
import OmegaPoint_PatternMatch from './implementations/OmegaPoint_PatternMatch';
import OmegaPoint_FourthWall from './implementations/OmegaPoint_FourthWall';
import OmegaPoint_OmegaPulse from './implementations/OmegaPoint_OmegaPulse';
import OmegaPoint_ConvergenceSeal from './implementations/OmegaPoint_ConvergenceSeal';

// ── Source Collection (default exports) ─────────────────────────
import Source_IAm from './implementations/Source_IAm';
import Source_StardustCheck from './implementations/Source_StardustCheck';
import Source_FinalBreath from './implementations/Source_FinalBreath';
import Source_Unity from './implementations/Source_Unity';
import Source_InfiniteLoop from './implementations/Source_InfiniteLoop';
import Source_Awakening from './implementations/Source_Awakening';
import Source_Void from './implementations/Source_Void';
import Source_LightBody from './implementations/Source_LightBody';
import Source_UniversalHum from './implementations/Source_UniversalHum';
import Source_SourceSeal from './implementations/Source_SourceSeal';

// ── Stoic Collection (default exports) ──────────────────────────
import Stoic_CitadelVisualization from './implementations/Stoic_CitadelVisualization';
import Stoic_VoluntaryDiscomfort from './implementations/Stoic_VoluntaryDiscomfort';
import Stoic_ViewFromAbove from './implementations/Stoic_ViewFromAbove';
import Stoic_NegativeVisualization from './implementations/Stoic_NegativeVisualization';
import Stoic_ControlDichotomy from './implementations/Stoic_ControlDichotomy';
import Stoic_ObstacleFlip from './implementations/Stoic_ObstacleFlip';
import Stoic_MementoMori from './implementations/Stoic_MementoMori';
import Stoic_InnerCitadel from './implementations/Stoic_InnerCitadel';
import Stoic_AmorFati from './implementations/Stoic_AmorFati';
import Stoic_StoicSeal from './implementations/Stoic_StoicSeal';

// ── Lover Collection (default exports) ──────────────────────────
import Lover_ArmorDrop from './implementations/Lover_ArmorDrop';
import Lover_30SecondGaze from './implementations/Lover_30SecondGaze';
import Lover_DesireAudit from './implementations/Lover_DesireAudit';
import Lover_SacredTouch from './implementations/Lover_SacredTouch';
import Lover_ListeningEar from './implementations/Lover_ListeningEar';
import Lover_JealousyTransmute from './implementations/Lover_JealousyTransmute';
import Lover_SecretShare from './implementations/Lover_SecretShare';
import Lover_SexSpiritBridge from './implementations/Lover_SexSpiritBridge';
import Lover_PartnerBreath from './implementations/Lover_PartnerBreath';
import Lover_UnionSeal from './implementations/Lover_UnionSeal';

// ── Athlete Collection (default exports) ─────────────────────────
import Athlete_OxygenFlood from './implementations/Athlete_OxygenFlood';
import Athlete_FasciaRelease from './implementations/Athlete_FasciaRelease';
import Athlete_MovementSnack from './implementations/Athlete_MovementSnack';
import Athlete_SleepGate from './implementations/Athlete_SleepGate';
import Athlete_ColdShock from './implementations/Athlete_ColdShock';
import Athlete_FuelCheck from './implementations/Athlete_FuelCheck';
import Athlete_PostureReset from './implementations/Athlete_PostureReset';
import Athlete_PainCave from './implementations/Athlete_PainCave';
import Athlete_HeartCoherence from './implementations/Athlete_HeartCoherence';
import Athlete_VitalitySeal from './implementations/Athlete_VitalitySeal';

// ── Strategist Collection (default exports) ──────────────────────
import Strategist_ValueExchange from './implementations/Strategist_ValueExchange';
import Strategist_EssentialismFilter from './implementations/Strategist_EssentialismFilter';
import Strategist_CompoundInterest from './implementations/Strategist_CompoundInterest';
import Strategist_DeepWorkBunker from './implementations/Strategist_DeepWorkBunker';
import Strategist_NegotiationPause from './implementations/Strategist_NegotiationPause';
import Strategist_AbundanceScan from './implementations/Strategist_AbundanceScan';
import Strategist_LeverageLever from './implementations/Strategist_LeverageLever';
import Strategist_SpecificKnowledge from './implementations/Strategist_SpecificKnowledge';
import Strategist_PermissionlessBuild from './implementations/Strategist_PermissionlessBuild';
import Strategist_WealthSeal from './implementations/Strategist_WealthSeal';

// ── Wilding Collection (default exports) ─────────────────────────
import Wilding_ColdSwitch from './implementations/Wilding_ColdSwitch';
import Wilding_FireWatch from './implementations/Wilding_FireWatch';
import Wilding_PanoramicSoften from './implementations/Wilding_PanoramicSoften';
import Wilding_TerpeneInhale from './implementations/Wilding_TerpeneInhale';
import Wilding_LunarPull from './implementations/Wilding_LunarPull';
import Wilding_DarkAnchor from './implementations/Wilding_DarkAnchor';
import Wilding_BarefootStep from './implementations/Wilding_BarefootStep';
import Wilding_StormBreathe from './implementations/Wilding_StormBreathe';
import Wilding_FeralHowl from './implementations/Wilding_FeralHowl';
import Wilding_WildSeal from './implementations/Wilding_WildSeal';

// ── Guardian Collection (default exports) ────────────────────────
import Guardian_BigFeeling from './implementations/Guardian_BigFeeling';
import Guardian_CoRegulationBreath from './implementations/Guardian_CoRegulationBreath';
import Guardian_GoodEnough from './implementations/Guardian_GoodEnough';
import Guardian_RepairRitual from './implementations/Guardian_RepairRitual';
import Guardian_TransitionBuffer from './implementations/Guardian_TransitionBuffer';
import Guardian_BoundaryHug from './implementations/Guardian_BoundaryHug';
import Guardian_SafeContainer from './implementations/Guardian_SafeContainer';
import Guardian_GentleNo from './implementations/Guardian_GentleNo';
import Guardian_BedtimeBlessing from './implementations/Guardian_BedtimeBlessing';
import Guardian_GuardianSeal from './implementations/Guardian_GuardianSeal';

// ── Futurist Collection (default exports) ────────────────────────
import Futurist_NotificationNuke from './implementations/Futurist_NotificationNuke';
import Futurist_InputDiet from './implementations/Futurist_InputDiet';
import Futurist_HumanHandshake from './implementations/Futurist_HumanHandshake';
import Futurist_DoomscrollBrake from './implementations/Futurist_DoomscrollBrake';
import Futurist_AnalogSwitch from './implementations/Futurist_AnalogSwitch';
import Futurist_DeepRead from './implementations/Futurist_DeepRead';
import Futurist_PhantomCheck from './implementations/Futurist_PhantomCheck';
import Futurist_MonoTask from './implementations/Futurist_MonoTask';
import Futurist_ComparisonBlocker from './implementations/Futurist_ComparisonBlocker';
import Futurist_DisconnectSeal from './implementations/Futurist_DisconnectSeal';

// ── Mystic Collection (default exports) ──────────────────────────
import Mystic_NoSelf from './implementations/Mystic_NoSelf';
import Mystic_NowPoint from './implementations/Mystic_NowPoint';
import Mystic_Deathbed from './implementations/Mystic_Deathbed';
import Mystic_EntanglementCheck from './implementations/Mystic_EntanglementCheck';
import Mystic_WaveCollapse from './implementations/Mystic_WaveCollapse';
import Mystic_Hologram from './implementations/Mystic_Hologram';
import Mystic_FrequencyTune from './implementations/Mystic_FrequencyTune';
import Mystic_MayaVeil from './implementations/Mystic_MayaVeil';
import Mystic_UniversalHum from './implementations/Mystic_UniversalHum';
import Mystic_MysticSeal from './implementations/Mystic_MysticSeal';

// ── Infinite Player Collection (default exports) ─────────────────
import Infinite_CosmicJoke from './implementations/Infinite_CosmicJoke';
import Infinite_AbsurdityCheck from './implementations/Infinite_AbsurdityCheck';
import Infinite_GameReset from './implementations/Infinite_GameReset';
import Infinite_DanceBreak from './implementations/Infinite_DanceBreak';
import Infinite_BeginnersMind from './implementations/Infinite_BeginnersMind';
import Infinite_PureYes from './implementations/Infinite_PureYes';
import Infinite_WonderWalk from './implementations/Infinite_WonderWalk';
import Infinite_UnplannedHour from './implementations/Infinite_UnplannedHour';
import Infinite_LaughTrack from './implementations/Infinite_LaughTrack';
import Infinite_InfiniteSeal from './implementations/Infinite_InfiniteSeal';

// ── Reality Bender Collection (default exports) ──────────────────
import Bender_RealityDistortion from './implementations/Bender_RealityDistortion';
import Bender_TimelineJump from './implementations/Bender_TimelineJump';
import Bender_LuckSurface from './implementations/Bender_LuckSurface';
import Bender_AtmosphereEngineer from './implementations/Bender_AtmosphereEngineer';
import Bender_NarrativeOverride from './implementations/Bender_NarrativeOverride';
import Bender_FutureMemory from './implementations/Bender_FutureMemory';
import Bender_SilenceWeapon from './implementations/Bender_SilenceWeapon';
import Bender_InvisibleHand from './implementations/Bender_InvisibleHand';
import Bender_BeliefBridge from './implementations/Bender_BeliefBridge';
import Bender_BenderSeal from './implementations/Bender_BenderSeal';

// ── Magnet Collection (default exports) ──────────────────────────
import Magnet_ReverseOrbit from './implementations/Magnet_ReverseOrbit';
import Magnet_MysteryGap from './implementations/Magnet_MysteryGap';
import Magnet_WhisperFrequency from './implementations/Magnet_WhisperFrequency';
import Magnet_VelvetRope from './implementations/Magnet_VelvetRope';
import Magnet_SpecificPraise from './implementations/Magnet_SpecificPraise';
import Magnet_WarmthCompetence from './implementations/Magnet_WarmthCompetence';
import Magnet_LighthouseMode from './implementations/Magnet_LighthouseMode';
import Magnet_YesAndSpiral from './implementations/Magnet_YesAndSpiral';
import Magnet_DetachmentPower from './implementations/Magnet_DetachmentPower';
import Magnet_MagnetSeal from './implementations/Magnet_MagnetSeal';

// ── Oracle Collection (default exports) ──────────────────────────
import Oracle_PatternBeforePattern from './implementations/Oracle_PatternBeforePattern';
import Oracle_BodyCompass from './implementations/Oracle_BodyCompass';
import Oracle_FirstThreeSeconds from './implementations/Oracle_FirstThreeSeconds';
import Oracle_InformationFast from './implementations/Oracle_InformationFast';
import Oracle_SignalInNoise from './implementations/Oracle_SignalInNoise';
import Oracle_DangerBeautiful from './implementations/Oracle_DangerBeautiful';
import Oracle_QuestionUpgrade from './implementations/Oracle_QuestionUpgrade';
import Oracle_PreMortem from './implementations/Oracle_PreMortem';
import Oracle_ContrarianProof from './implementations/Oracle_ContrarianProof';
import Oracle_OracleSeal from './implementations/Oracle_OracleSeal';

// ── Maestro Collection (default exports) ─────────────────────────
import Maestro_Crescendo from './implementations/Maestro_Crescendo';
import Maestro_PauseAsCurrency from './implementations/Maestro_PauseAsCurrency';
import Maestro_EmotionalScore from './implementations/Maestro_EmotionalScore';
import Maestro_StagePresence from './implementations/Maestro_StagePresence';
import Maestro_TempoControl from './implementations/Maestro_TempoControl';
import Maestro_MirrorMatch from './implementations/Maestro_MirrorMatch';
import Maestro_Callback from './implementations/Maestro_Callback';
import Maestro_TensionArc from './implementations/Maestro_TensionArc';
import Maestro_StandingOvation from './implementations/Maestro_StandingOvation';
import Maestro_MaestroSeal from './implementations/Maestro_MaestroSeal';

// ── Shaman Collection (default exports) ──────────────────────────
import Shaman_AncestorCall from './implementations/Shaman_AncestorCall';
import Shaman_PlantMedicine from './implementations/Shaman_PlantMedicine';
import Shaman_DrumCircle from './implementations/Shaman_DrumCircle';
import Shaman_SacredFire from './implementations/Shaman_SacredFire';
import Shaman_BoneReading from './implementations/Shaman_BoneReading';
import Shaman_ShadowWalk from './implementations/Shaman_ShadowWalk';
import Shaman_WaterBlessing from './implementations/Shaman_WaterBlessing';
import Shaman_SpiritAnimal from './implementations/Shaman_SpiritAnimal';
import Shaman_VisionQuest from './implementations/Shaman_VisionQuest';
import Shaman_ShamanSeal from './implementations/Shaman_ShamanSeal';

// ── Stargazer Collection (default exports) ───────────────────────
import Stargazer_NorthStar from './implementations/Stargazer_NorthStar';
import Stargazer_OrbitCheck from './implementations/Stargazer_OrbitCheck';
import Stargazer_GravityAssist from './implementations/Stargazer_GravityAssist';
import Stargazer_Eclipse from './implementations/Stargazer_Eclipse';
import Stargazer_Constellation from './implementations/Stargazer_Constellation';
import Stargazer_EventHorizon from './implementations/Stargazer_EventHorizon';
import Stargazer_Supernova from './implementations/Stargazer_Supernova';
import Stargazer_DarkMatter from './implementations/Stargazer_DarkMatter';
import Stargazer_LightSpeed from './implementations/Stargazer_LightSpeed';
import Stargazer_StargazerSeal from './implementations/Stargazer_StargazerSeal';

// ── Myth Maker Collection (default exports) ──────────────────────
import MythMaker_Incantation from './implementations/MythMaker_Incantation';
import MythMaker_Retcon from './implementations/MythMaker_Retcon';
import MythMaker_HerosCall from './implementations/MythMaker_HerosCall';
import MythMaker_VillainsMask from './implementations/MythMaker_VillainsMask';
import MythMaker_PlotTwist from './implementations/MythMaker_PlotTwist';
import MythMaker_MentorSummon from './implementations/MythMaker_MentorSummon';
import MythMaker_ChekhovsGun from './implementations/MythMaker_ChekhovsGun';
import MythMaker_FourthWall from './implementations/MythMaker_FourthWall';
import MythMaker_Cliffhanger from './implementations/MythMaker_Cliffhanger';
import MythMaker_MythicSeal from './implementations/MythMaker_MythicSeal';

// ── Shape Shifter Collection (default exports) ───────────────────
import ShapeShifter_MirrorShift from './implementations/ShapeShifter_MirrorShift';
import ShapeShifter_SkinShed from './implementations/ShapeShifter_SkinShed';
import ShapeShifter_Camouflage from './implementations/ShapeShifter_Camouflage';
import ShapeShifter_Metamorphosis from './implementations/ShapeShifter_Metamorphosis';
import ShapeShifter_Doppelganger from './implementations/ShapeShifter_Doppelganger';
import ShapeShifter_Costume from './implementations/ShapeShifter_Costume';
import ShapeShifter_Chimera from './implementations/ShapeShifter_Chimera';
import ShapeShifter_Proteus from './implementations/ShapeShifter_Proteus';
import ShapeShifter_Chrysalis from './implementations/ShapeShifter_Chrysalis';
import ShapeShifter_ShifterSeal from './implementations/ShapeShifter_ShifterSeal';

// ── Dream Walker Collection (default exports) ───────────────────
import DreamWalker_LucidEntry from './implementations/DreamWalker_LucidEntry';
import DreamWalker_SleepArchitect from './implementations/DreamWalker_SleepArchitect';
import DreamWalker_NightTerrain from './implementations/DreamWalker_NightTerrain';
import DreamWalker_SleepParalysis from './implementations/DreamWalker_SleepParalysis';
import DreamWalker_RecurringDoor from './implementations/DreamWalker_RecurringDoor';
import DreamWalker_DreamJournal from './implementations/DreamWalker_DreamJournal';
import DreamWalker_Somnambulant from './implementations/DreamWalker_Somnambulant';
import DreamWalker_HypnagogicEdge from './implementations/DreamWalker_HypnagogicEdge';
import DreamWalker_DreamSymbol from './implementations/DreamWalker_DreamSymbol';
import DreamWalker_WalkerSeal from './implementations/DreamWalker_WalkerSeal';

// ── Magnum Opus Collection (default exports) ────────────────────
import MagnumOpus_PrimaMateria from './implementations/MagnumOpus_PrimaMateria';
import MagnumOpus_Crucible from './implementations/MagnumOpus_Crucible';
import MagnumOpus_LeadToGold from './implementations/MagnumOpus_LeadToGold';
import MagnumOpus_PhilosophersStone from './implementations/MagnumOpus_PhilosophersStone';
import MagnumOpus_Solve from './implementations/MagnumOpus_Solve';
import MagnumOpus_Coagula from './implementations/MagnumOpus_Coagula';
import MagnumOpus_Athanor from './implementations/MagnumOpus_Athanor';
import MagnumOpus_Tincture from './implementations/MagnumOpus_Tincture';
import MagnumOpus_Ouroboros from './implementations/MagnumOpus_Ouroboros';
import MagnumOpus_OpusSeal from './implementations/MagnumOpus_OpusSeal';

// ── Prism Collection (default exports) ───────────────────────────
import Prism_Refraction from './implementations/Prism_Refraction';
import Prism_Transparency from './implementations/Prism_Transparency';
import Prism_LaserFocus from './implementations/Prism_LaserFocus';
import Prism_Afterimage from './implementations/Prism_Afterimage';
import Prism_BlindSpot from './implementations/Prism_BlindSpot';
import Prism_FocalLength from './implementations/Prism_FocalLength';
import Prism_ShadowCast from './implementations/Prism_ShadowCast';
import Prism_Bioluminescence from './implementations/Prism_Bioluminescence';
import Prism_Infrared from './implementations/Prism_Infrared';
import Prism_PrismSeal from './implementations/Prism_PrismSeal';

// ── Graviton Collection (default exports) ────────────────────────
import Graviton_HeavyObject from './implementations/Graviton_HeavyObject';
import Graviton_EscapeVelocity from './implementations/Graviton_EscapeVelocity';
import Graviton_BinaryStar from './implementations/Graviton_BinaryStar';
import Graviton_BlackHole from './implementations/Graviton_BlackHole';
import Graviton_TidalForce from './implementations/Graviton_TidalForce';
import Graviton_InverseSquare from './implementations/Graviton_InverseSquare';
import Graviton_CenterOfMass from './implementations/Graviton_CenterOfMass';
import Graviton_RocheLimit from './implementations/Graviton_RocheLimit';
import Graviton_DarkStar from './implementations/Graviton_DarkStar';
import Graviton_GravitySeal from './implementations/Graviton_GravitySeal';

// ── Observer Collection (default exports) ────────────────────────
import Observer_SchrodingersBox from './implementations/Observer_SchrodingersBox';
import Observer_WaveCollapse from './implementations/Observer_WaveCollapse';
import Observer_SpookyAction from './implementations/Observer_SpookyAction';
import Observer_QuantumTunnel from './implementations/Observer_QuantumTunnel';
import Observer_UncertaintyBlur from './implementations/Observer_UncertaintyBlur';
import Observer_ManyWorlds from './implementations/Observer_ManyWorlds';
import Observer_Retrocausality from './implementations/Observer_Retrocausality';
import Observer_ZeroPoint from './implementations/Observer_ZeroPoint';
import Observer_DoubleSlit from './implementations/Observer_DoubleSlit';
import Observer_ObserverSeal from './implementations/Observer_ObserverSeal';

// ── TimeCapsule Collection (default exports) ─────────────────────
import TimeCapsule_OpenWhenSeal from './implementations/TimeCapsule_OpenWhenSeal';
import TimeCapsule_DriftBottle from './implementations/TimeCapsule_DriftBottle';
import TimeCapsule_RageVault from './implementations/TimeCapsule_RageVault';
import TimeCapsule_PredictionStake from './implementations/TimeCapsule_PredictionStake';
import TimeCapsule_SuccessJar from './implementations/TimeCapsule_SuccessJar';
import TimeCapsule_TenYearEcho from './implementations/TimeCapsule_TenYearEcho';
import TimeCapsule_CrisisKit from './implementations/TimeCapsule_CrisisKit';
import TimeCapsule_WineCellar from './implementations/TimeCapsule_WineCellar';
import TimeCapsule_DeadMansSwitch from './implementations/TimeCapsule_DeadMansSwitch';
import TimeCapsule_CapsuleSeal from './implementations/TimeCapsule_CapsuleSeal';

// ── LoopBreaker Collection (default exports) ─────────────────────
import LoopBreaker_IterationCounter from './implementations/LoopBreaker_IterationCounter';
import LoopBreaker_TriggerMap from './implementations/LoopBreaker_TriggerMap';
import LoopBreaker_GlitchInjection from './implementations/LoopBreaker_GlitchInjection';
import LoopBreaker_ExitRamp from './implementations/LoopBreaker_ExitRamp';
import LoopBreaker_RewardAudit from './implementations/LoopBreaker_RewardAudit';
import LoopBreaker_DoubleLoop from './implementations/LoopBreaker_DoubleLoop';
import LoopBreaker_SpiralCheck from './implementations/LoopBreaker_SpiralCheck';
import LoopBreaker_FrictionAdd from './implementations/LoopBreaker_FrictionAdd';
import LoopBreaker_NewGroove from './implementations/LoopBreaker_NewGroove';
import LoopBreaker_BreakerSeal from './implementations/LoopBreaker_BreakerSeal';

// ── RetroCausal Collection (default exports) ─────────────────────
import RetroCausal_MemoryRescore from './implementations/RetroCausal_MemoryRescore';
import RetroCausal_DeletedScene from './implementations/RetroCausal_DeletedScene';
import RetroCausal_Prequel from './implementations/RetroCausal_Prequel';
import RetroCausal_ColorGrade from './implementations/RetroCausal_ColorGrade';
import RetroCausal_NarrativeFlip from './implementations/RetroCausal_NarrativeFlip';
import RetroCausal_ForgivenessFilter from './implementations/RetroCausal_ForgivenessFilter';
import RetroCausal_TimeTravelRescue from './implementations/RetroCausal_TimeTravelRescue';
import RetroCausal_MetadataEdit from './implementations/RetroCausal_MetadataEdit';
import RetroCausal_AncestralCut from './implementations/RetroCausal_AncestralCut';
import RetroCausal_RetroSeal from './implementations/RetroCausal_RetroSeal';

// ── Threshold Collection (default exports) ──────────────────────────
import Threshold_Doorway from './implementations/Threshold_Doorway';
import Threshold_InBetween from './implementations/Threshold_InBetween';
import Threshold_DawnWatch from './implementations/Threshold_DawnWatch';
import Threshold_BreathGap from './implementations/Threshold_BreathGap';
import Threshold_ChrysalisWait from './implementations/Threshold_ChrysalisWait';
import Threshold_TidalZone from './implementations/Threshold_TidalZone';
import Threshold_QuestionMark from './implementations/Threshold_QuestionMark';
import Threshold_DuskWalk from './implementations/Threshold_DuskWalk';
import Threshold_HingePoint from './implementations/Threshold_HingePoint';
import Threshold_ThresholdSeal from './implementations/Threshold_ThresholdSeal';

// ── Soma Collection (default exports) ───────────────────────────────
import Soma_BodyRadar from './implementations/Soma_BodyRadar';
import Soma_GutSignal from './implementations/Soma_GutSignal';
import Soma_SkinMap from './implementations/Soma_SkinMap';
import Soma_PulseReader from './implementations/Soma_PulseReader';
import Soma_JointUnlock from './implementations/Soma_JointUnlock';
import Soma_FasciaWave from './implementations/Soma_FasciaWave';
import Soma_VoiceBox from './implementations/Soma_VoiceBox';
import Soma_BalancePoint from './implementations/Soma_BalancePoint';
import Soma_CellMemory from './implementations/Soma_CellMemory';
import Soma_SomaSeal from './implementations/Soma_SomaSeal';

// ── Frequency Collection (default exports) ──────────────���───────────
import Frequency_BaselineHum from './implementations/Frequency_BaselineHum';
import Frequency_DissonanceDetector from './implementations/Frequency_DissonanceDetector';
import Frequency_HarmonyMap from './implementations/Frequency_HarmonyMap';
import Frequency_OctaveJump from './implementations/Frequency_OctaveJump';
import Frequency_StandingWave from './implementations/Frequency_StandingWave';
import Frequency_InterferencePattern from './implementations/Frequency_InterferencePattern';
import Frequency_Overtone from './implementations/Frequency_Overtone';
import Frequency_PhaseLock from './implementations/Frequency_PhaseLock';
import Frequency_ResonantCavity from './implementations/Frequency_ResonantCavity';
import Frequency_FrequencySeal from './implementations/Frequency_FrequencySeal';

// ── Tuner Collection (default exports) ──────────────────────────────
import Tuner_DeltaDrop from './implementations/Tuner_DeltaDrop';
import Tuner_GammaSpike from './implementations/Tuner_GammaSpike';
import Tuner_HapticPacer from './implementations/Tuner_HapticPacer';
import Tuner_VagalHum from './implementations/Tuner_VagalHum';
import Tuner_IsochronicFocus from './implementations/Tuner_IsochronicFocus';
import Tuner_HeartCoherence from './implementations/Tuner_HeartCoherence';
import Tuner_BrownNoise from './implementations/Tuner_BrownNoise';
import Tuner_BilateralTap from './implementations/Tuner_BilateralTap';
import Tuner_Solfeggio528 from './implementations/Tuner_Solfeggio528';
import Tuner_TunerSeal from './implementations/Tuner_TunerSeal';

// ── Schrödinger Collection (default exports) ────────────────────────
import Schrodinger_MysteryBox from './implementations/Schrodinger_MysteryBox';
import Schrodinger_ParallelSelf from './implementations/Schrodinger_ParallelSelf';
import Schrodinger_DiceRoll from './implementations/Schrodinger_DiceRoll';
import Schrodinger_ManyWorldsMap from './implementations/Schrodinger_ManyWorldsMap';
import Schrodinger_QuantumCoin from './implementations/Schrodinger_QuantumCoin';
import Schrodinger_RandomAct from './implementations/Schrodinger_RandomAct';
import Schrodinger_Blur from './implementations/Schrodinger_Blur';
import Schrodinger_OracleDeck from './implementations/Schrodinger_OracleDeck';
import Schrodinger_DoubleSlit from './implementations/Schrodinger_DoubleSlit';
import Schrodinger_BoxSeal from './implementations/Schrodinger_BoxSeal';

// ── Glitch Collection (default exports) ─────────────────────────────
import Glitch_FourthWallBreak from './implementations/Glitch_FourthWallBreak';
import Glitch_WrongButton from './implementations/Glitch_WrongButton';
import Glitch_ReverseText from './implementations/Glitch_ReverseText';
import Glitch_LagSpike from './implementations/Glitch_LagSpike';
import Glitch_BlueScreen from './implementations/Glitch_BlueScreen';
import Glitch_FakeNotification from './implementations/Glitch_FakeNotification';
import Glitch_PixelatedSelf from './implementations/Glitch_PixelatedSelf';
import Glitch_LoopCrash from './implementations/Glitch_LoopCrash';
import Glitch_RealityTear from './implementations/Glitch_RealityTear';
import Glitch_GlitchSeal from './implementations/Glitch_GlitchSeal';

// ── Construct Collection (default exports) ──────────────────────────
import Construct_FoundationStone from './implementations/Construct_FoundationStone';
import Construct_GriefCairn from './implementations/Construct_GriefCairn';
import Construct_MemoryPalace from './implementations/Construct_MemoryPalace';
import Construct_ZenGarden from './implementations/Construct_ZenGarden';
import Construct_FearVault from './implementations/Construct_FearVault';
import Construct_CouncilTable from './implementations/Construct_CouncilTable';
import Construct_Lighthouse from './implementations/Construct_Lighthouse';
import Construct_Workbench from './implementations/Construct_Workbench';
import Construct_Greenhouse from './implementations/Construct_Greenhouse';
import Construct_ArchitectSeal from './implementations/Construct_ArchitectSeal';

// ── Biographer Collection (default exports) ─────────────────────────
import Biographer_OriginStory from './implementations/Biographer_OriginStory';
import Biographer_CharacterSheet from './implementations/Biographer_CharacterSheet';
import Biographer_ThirdPersonShift from './implementations/Biographer_ThirdPersonShift';
import Biographer_YetAppend from './implementations/Biographer_YetAppend';
import Biographer_AntagonistAudit from './implementations/Biographer_AntagonistAudit';
import Biographer_PlotTwist from './implementations/Biographer_PlotTwist';
import Biographer_FutureMemoir from './implementations/Biographer_FutureMemoir';
import Biographer_GenreSwitch from './implementations/Biographer_GenreSwitch';
import Biographer_SupportingCast from './implementations/Biographer_SupportingCast';
import Biographer_MythosSeal from './implementations/Biographer_MythosSeal';

// ── Optician Collection (default exports) ───────────────────────────
import Optician_PrescriptionCheck from './implementations/Optician_PrescriptionCheck';
import Optician_FrameCrop from './implementations/Optician_FrameCrop';
import Optician_FilterScrub from './implementations/Optician_FilterScrub';
import Optician_InversionGoggles from './implementations/Optician_InversionGoggles';
import Optician_FocusPull from './implementations/Optician_FocusPull';
import Optician_ContrastAdjust from './implementations/Optician_ContrastAdjust';
import Optician_PeripheralScan from './implementations/Optician_PeripheralScan';
import Optician_BrokenMirror from './implementations/Optician_BrokenMirror';
import Optician_NightVision from './implementations/Optician_NightVision';
import Optician_OpticianSeal from './implementations/Optician_OpticianSeal';

// ── Interpreter Collection (default exports) ────────────────────────
import Interpreter_SubtextScanner from './implementations/Interpreter_SubtextScanner';
import Interpreter_VillainDeMask from './implementations/Interpreter_VillainDeMask';
import Interpreter_LadderOfInference from './implementations/Interpreter_LadderOfInference';
import Interpreter_BenefitOfDoubt from './implementations/Interpreter_BenefitOfDoubt';
import Interpreter_TranslationEar from './implementations/Interpreter_TranslationEar';
import Interpreter_ThirdChair from './implementations/Interpreter_ThirdChair';
import Interpreter_PauseButton from './implementations/Interpreter_PauseButton';
import Interpreter_SteelMan from './implementations/Interpreter_SteelMan';
import Interpreter_MirrorNeurons from './implementations/Interpreter_MirrorNeurons';
import Interpreter_InterpreterSeal from './implementations/Interpreter_InterpreterSeal';

// ── Social Physics Collection (default exports) ──────���──────────────
import SocialPhysics_EnergyRedirect from './implementations/SocialPhysics_EnergyRedirect';
import SocialPhysics_StatusSeeSaw from './implementations/SocialPhysics_StatusSeeSaw';
import SocialPhysics_SilentMirror from './implementations/SocialPhysics_SilentMirror';
import SocialPhysics_ValuesCompass from './implementations/SocialPhysics_ValuesCompass';
import SocialPhysics_EmpathyBridge from './implementations/SocialPhysics_EmpathyBridge';
import SocialPhysics_BoundaryForcefield from './implementations/SocialPhysics_BoundaryForcefield';
import SocialPhysics_YesAndWeaver from './implementations/SocialPhysics_YesAndWeaver';
import SocialPhysics_TriggerDisarm from './implementations/SocialPhysics_TriggerDisarm';
import SocialPhysics_PerspectiveDrone from './implementations/SocialPhysics_PerspectiveDrone';
import SocialPhysics_DiplomatSeal from './implementations/SocialPhysics_DiplomatSeal';

// ── Tribalist Collection (default exports) ──────────────────────────
import Tribalist_SignalFire from './implementations/Tribalist_SignalFire';
import Tribalist_CircleAudit from './implementations/Tribalist_CircleAudit';
import Tribalist_GiftLoop from './implementations/Tribalist_GiftLoop';
import Tribalist_RoleCall from './implementations/Tribalist_RoleCall';
import Tribalist_VulnerabilityKey from './implementations/Tribalist_VulnerabilityKey';
import Tribalist_SocialBattery from './implementations/Tribalist_SocialBattery';
import Tribalist_EchoChamberBreak from './implementations/Tribalist_EchoChamberBreak';
import Tribalist_RitualMaker from './implementations/Tribalist_RitualMaker';
import Tribalist_GossipFirewall from './implementations/Tribalist_GossipFirewall';
import Tribalist_TribalSeal from './implementations/Tribalist_TribalSeal';

// ── Valuator Collection (default exports) ───────────────────────────
import Valuator_PriceTag from './implementations/Valuator_PriceTag';
import Valuator_SunkCostCut from './implementations/Valuator_SunkCostCut';
import Valuator_AssetAudit from './implementations/Valuator_AssetAudit';
import Valuator_InflationCheck from './implementations/Valuator_InflationCheck';
import Valuator_OpportunityCost from './implementations/Valuator_OpportunityCost';
import Valuator_EnergyLedger from './implementations/Valuator_EnergyLedger';
import Valuator_NegotiationTable from './implementations/Valuator_NegotiationTable';
import Valuator_ScarcityFlip from './implementations/Valuator_ScarcityFlip';
import Valuator_QualityControl from './implementations/Valuator_QualityControl';
import Valuator_GoldStandard from './implementations/Valuator_GoldStandard';

// ── Editor Collection (default exports) ─────────────────────────────
import Editor_NoiseGate from './implementations/Editor_NoiseGate';
import Editor_HeadlineRewrite from './implementations/Editor_HeadlineRewrite';
import Editor_AlgorithmAudit from './implementations/Editor_AlgorithmAudit';
import Editor_KillYourDarlings from './implementations/Editor_KillYourDarlings';
import Editor_ZoomOut from './implementations/Editor_ZoomOut';
import Editor_FactCheck from './implementations/Editor_FactCheck';
import Editor_ContinuityFix from './implementations/Editor_ContinuityFix';
import Editor_MuteButton from './implementations/Editor_MuteButton';
import Editor_ColorGrade from './implementations/Editor_ColorGrade';
import Editor_FinalCut from './implementations/Editor_FinalCut';

// ── Grandmaster Collection (default exports) ────────────────────────
import Grandmaster_MetaView from './implementations/Grandmaster_MetaView';
import Grandmaster_SecondOrder from './implementations/Grandmaster_SecondOrder';
import Grandmaster_LeveragePoint from './implementations/Grandmaster_LeveragePoint';
import Grandmaster_PositiveSum from './implementations/Grandmaster_PositiveSum';
import Grandmaster_SunkCostEject from './implementations/Grandmaster_SunkCostEject';
import Grandmaster_FogOfWar from './implementations/Grandmaster_FogOfWar';
import Grandmaster_TempoControl from './implementations/Grandmaster_TempoControl';
import Grandmaster_Inversion from './implementations/Grandmaster_Inversion';
import Grandmaster_Optionality from './implementations/Grandmaster_Optionality';
import Grandmaster_GrandmasterSeal from './implementations/Grandmaster_GrandmasterSeal';

// ── Catalyst Collection (default exports) ───────────────────────────
import Catalyst_ActivationEnergy from './implementations/Catalyst_ActivationEnergy';
import Catalyst_MirroringTune from './implementations/Catalyst_MirroringTune';
import Catalyst_TrojanHorse from './implementations/Catalyst_TrojanHorse';
import Catalyst_SilenceVacuum from './implementations/Catalyst_SilenceVacuum';
import Catalyst_LabelInception from './implementations/Catalyst_LabelInception';
import Catalyst_VulnerabilityDrop from './implementations/Catalyst_VulnerabilityDrop';
import Catalyst_ButToAnd from './implementations/Catalyst_ButToAnd';
import Catalyst_FuturePace from './implementations/Catalyst_FuturePace';
import Catalyst_QuestionHook from './implementations/Catalyst_QuestionHook';
import Catalyst_CatalystSeal from './implementations/Catalyst_CatalystSeal';

// ── Kinetic Collection (default exports) ────────────────────────────
import Kinetic_InertiaBreak from './implementations/Kinetic_InertiaBreak';
import Kinetic_MicroStep from './implementations/Kinetic_MicroStep';
import Kinetic_FlowTrigger from './implementations/Kinetic_FlowTrigger';
import Kinetic_BurnRate from './implementations/Kinetic_BurnRate';
import Kinetic_FrictionPolish from './implementations/Kinetic_FrictionPolish';
import Kinetic_Pivot from './implementations/Kinetic_Pivot';
import Kinetic_MomentumSave from './implementations/Kinetic_MomentumSave';
import Kinetic_GoodEnoughShip from './implementations/Kinetic_GoodEnoughShip';
import Kinetic_RestStop from './implementations/Kinetic_RestStop';
import Kinetic_KineticSeal from './implementations/Kinetic_KineticSeal';

// ── Adaptive Collection (default exports) ───────────────────────────
import Adaptive_ElasticSnap from './implementations/Adaptive_ElasticSnap';
import Adaptive_KintsugiRepair from './implementations/Adaptive_KintsugiRepair';
import Adaptive_ImmuneResponse from './implementations/Adaptive_ImmuneResponse';
import Adaptive_WaterMode from './implementations/Adaptive_WaterMode';
import Adaptive_ShockAbsorber from './implementations/Adaptive_ShockAbsorber';
import Adaptive_CompostBin from './implementations/Adaptive_CompostBin';
import Adaptive_ScarTissue from './implementations/Adaptive_ScarTissue';
import Adaptive_RootDeepen from './implementations/Adaptive_RootDeepen';
import Adaptive_PhoenixBurn from './implementations/Adaptive_PhoenixBurn';
import Adaptive_AdaptiveSeal from './implementations/Adaptive_AdaptiveSeal';

// ── Shadow Worker Collection (default exports) ──────────────────────
import Shadow_ProjectionCheck from './implementations/Shadow_ProjectionCheck';
import Shadow_GoldenShadow from './implementations/Shadow_GoldenShadow';
import Shadow_SecretOath from './implementations/Shadow_SecretOath';
import Shadow_MonsterFeed from './implementations/Shadow_MonsterFeed';
import Shadow_ShameCompass from './implementations/Shadow_ShameCompass';
import Shadow_InnerChildRescue from './implementations/Shadow_InnerChildRescue';
import Shadow_DreamDive from './implementations/Shadow_DreamDive';
import Shadow_TriggerTrace from './implementations/Shadow_TriggerTrace';
import Shadow_IntegrationDialogue from './implementations/Shadow_IntegrationDialogue';
import Shadow_ShadowSeal from './implementations/Shadow_ShadowSeal';

// ── Ancestor Collection (default exports) ───────────────────────────
import Ancestor_EpigeneticSwitch from './implementations/Ancestor_EpigeneticSwitch';
import Ancestor_LineageAudit from './implementations/Ancestor_LineageAudit';
import Ancestor_CouncilOfElders from './implementations/Ancestor_CouncilOfElders';
import Ancestor_TraumaBreaker from './implementations/Ancestor_TraumaBreaker';
import Ancestor_GiftInheritance from './implementations/Ancestor_GiftInheritance';
import Ancestor_NameReclaim from './implementations/Ancestor_NameReclaim';
import Ancestor_SevenGenerations from './implementations/Ancestor_SevenGenerations';
import Ancestor_BoneWisdom from './implementations/Ancestor_BoneWisdom';
import Ancestor_TorchPass from './implementations/Ancestor_TorchPass';
import Ancestor_AncestralSeal from './implementations/Ancestor_AncestralSeal';

// ── Trickster Collection (default exports) ──────────────────────
import Trickster_AbsurdityFilter from './implementations/Trickster_AbsurdityFilter';
import Trickster_WrongAnswersOnly from './implementations/Trickster_WrongAnswersOnly';
import Trickster_DanceBreak from './implementations/Trickster_DanceBreak';
import Trickster_RuleBreaker from './implementations/Trickster_RuleBreaker';
import Trickster_AvatarSwap from './implementations/Trickster_AvatarSwap';
import Trickster_MessMaker from './implementations/Trickster_MessMaker';
import Trickster_PrimalScream from './implementations/Trickster_PrimalScream';
import Trickster_YesLets from './implementations/Trickster_YesLets';
import Trickster_SandboxMode from './implementations/Trickster_SandboxMode';
import Trickster_TricksterSeal from './implementations/Trickster_TricksterSeal';

// ── Astronaut Collection (default exports) ──────────────────────
import Astronaut_OverviewEffect from './implementations/Astronaut_OverviewEffect';
import Astronaut_DeepTimeScroll from './implementations/Astronaut_DeepTimeScroll';
import Astronaut_FractalZoom from './implementations/Astronaut_FractalZoom';
import Astronaut_NatureBath from './implementations/Astronaut_NatureBath';
import Astronaut_SonicBoom from './implementations/Astronaut_SonicBoom';
import Astronaut_GalaxySpin from './implementations/Astronaut_GalaxySpin';
import Astronaut_OceanBreath from './implementations/Astronaut_OceanBreath';
import Astronaut_AltruismSpark from './implementations/Astronaut_AltruismSpark';
import Astronaut_DeathbedView from './implementations/Astronaut_DeathbedView';
import Astronaut_AstronautSeal from './implementations/Astronaut_AstronautSeal';

// ── Wonderer Collection (default exports) ───────────────────────
import Wonderer_WhatIfLever from './implementations/Wonderer_WhatIfLever';
import Wonderer_ShoshinReset from './implementations/Wonderer_ShoshinReset';
import Wonderer_FractalQuestion from './implementations/Wonderer_FractalQuestion';
import Wonderer_RabbitHole from './implementations/Wonderer_RabbitHole';
import Wonderer_TextureAudit from './implementations/Wonderer_TextureAudit';
import Wonderer_JigsawPivot from './implementations/Wonderer_JigsawPivot';
import Wonderer_ImpossibleList from './implementations/Wonderer_ImpossibleList';
import Wonderer_ColorThief from './implementations/Wonderer_ColorThief';
import Wonderer_MysteryDoor from './implementations/Wonderer_MysteryDoor';
import Wonderer_WonderSeal from './implementations/Wonderer_WonderSeal';

// ── Surfer Collection (default exports) ─────────────────────────
import Surfer_WuWeiSlide from './implementations/Surfer_WuWeiSlide';
import Surfer_RhythmGame from './implementations/Surfer_RhythmGame';
import Surfer_BreathSynchro from './implementations/Surfer_BreathSynchro';
import Surfer_FrictionRemover from './implementations/Surfer_FrictionRemover';
import Surfer_GoodEnoughRelease from './implementations/Surfer_GoodEnoughRelease';
import Surfer_CurrentCheck from './implementations/Surfer_CurrentCheck';
import Surfer_SoftEyes from './implementations/Surfer_SoftEyes';
import Surfer_MicroFlow from './implementations/Surfer_MicroFlow';
import Surfer_MomentumSave from './implementations/Surfer_MomentumSave';
import Surfer_SurferSeal from './implementations/Surfer_SurferSeal';

// ── Meaning Maker Collection (default exports) ──────────────────
import Meaning_SufferingAudit from './implementations/Meaning_SufferingAudit';
import Meaning_LegacyLetter from './implementations/Meaning_LegacyLetter';
import Meaning_TombstoneEdit from './implementations/Meaning_TombstoneEdit';
import Meaning_IkigaiIntersection from './implementations/Meaning_IkigaiIntersection';
import Meaning_WhyLadder from './implementations/Meaning_WhyLadder';
import Meaning_ServiceShift from './implementations/Meaning_ServiceShift';
import Meaning_GratitudeLens from './implementations/Meaning_GratitudeLens';
import Meaning_AlignmentCompass from './implementations/Meaning_AlignmentCompass';
import Meaning_CosmicJoke from './implementations/Meaning_CosmicJoke';
import Meaning_MeaningSeal from './implementations/Meaning_MeaningSeal';

// ── Servant Collection (default exports) ────────────────────────
import Servant_RippleEffect from './implementations/Servant_RippleEffect';
import Servant_OxygenMask from './implementations/Servant_OxygenMask';
import Servant_EmptyChair from './implementations/Servant_EmptyChair';
import Servant_GardenersPatience from './implementations/Servant_GardenersPatience';
import Servant_ListeningEar from './implementations/Servant_ListeningEar';
import Servant_KindnessBoomerang from './implementations/Servant_KindnessBoomerang';
import Servant_EgoDissolve from './implementations/Servant_EgoDissolve';
import Servant_MentorsHand from './implementations/Servant_MentorsHand';
import Servant_InvisibleThread from './implementations/Servant_InvisibleThread';
import Servant_ServantSeal from './implementations/Servant_ServantSeal';

// ── Synthesis Collection (default exports) ──────────────────────
import Synthesis_ParadoxHolder from './implementations/Synthesis_ParadoxHolder';
import Synthesis_EmotionBlender from './implementations/Synthesis_EmotionBlender';
import Synthesis_ShadowHug from './implementations/Synthesis_ShadowHug';
import Synthesis_TransmutationFire from './implementations/Synthesis_TransmutationFire';
import Synthesis_NarrativeStitch from './implementations/Synthesis_NarrativeStitch';
import Synthesis_EnergyExchange from './implementations/Synthesis_EnergyExchange';
import Synthesis_IdentityFluidity from './implementations/Synthesis_IdentityFluidity';
import Synthesis_ValuesAlloy from './implementations/Synthesis_ValuesAlloy';
import Synthesis_ChaosSurfer from './implementations/Synthesis_ChaosSurfer';
import Synthesis_SynthesisSeal from './implementations/Synthesis_SynthesisSeal';

// ── Future Weaver Collection (default exports) ──────────────────
import FutureWeaver_FutureMemory from './implementations/FutureWeaver_FutureMemory';
import FutureWeaver_RegretMinimization from './implementations/FutureWeaver_RegretMinimization';
import FutureWeaver_TimeCapsuleSend from './implementations/FutureWeaver_TimeCapsuleSend';
import FutureWeaver_PreHindsight from './implementations/FutureWeaver_PreHindsight';
import FutureWeaver_BranchPruner from './implementations/FutureWeaver_BranchPruner';
import FutureWeaver_LegacySeed from './implementations/FutureWeaver_LegacySeed';
import FutureWeaver_WorstCaseSimulator from './implementations/FutureWeaver_WorstCaseSimulator';
import FutureWeaver_OptimismBias from './implementations/FutureWeaver_OptimismBias';
import FutureWeaver_PromiseKeeper from './implementations/FutureWeaver_PromiseKeeper';
import FutureWeaver_WeaverSeal from './implementations/FutureWeaver_WeaverSeal';

// ── Composer Collection (default exports) ────────────────────────
import Composer_DiscordResolve from './implementations/Composer_DiscordResolve';
import Composer_TempoControl from './implementations/Composer_TempoControl';
import Composer_LeitmotifScan from './implementations/Composer_LeitmotifScan';
import Composer_RestNote from './implementations/Composer_RestNote';
import Composer_Counterpoint from './implementations/Composer_Counterpoint';
import Composer_VolumeKnob from './implementations/Composer_VolumeKnob';
import Composer_TuningFork from './implementations/Composer_TuningFork';
import Composer_EnsembleCheck from './implementations/Composer_EnsembleCheck';
import Composer_Improvisation from './implementations/Composer_Improvisation';
import Composer_ComposerSeal from './implementations/Composer_ComposerSeal';

// ── Zenith Collection (default exports) ──────────────────────────
import Zenith_Acclimatization from './implementations/Zenith_Acclimatization';
import Zenith_FalseSummit from './implementations/Zenith_FalseSummit';
import Zenith_LightLoad from './implementations/Zenith_LightLoad';
import Zenith_Anchor from './implementations/Zenith_Anchor';
import Zenith_View from './implementations/Zenith_View';
import Zenith_Descent from './implementations/Zenith_Descent';
import Zenith_SherpaMindset from './implementations/Zenith_SherpaMindset';
import Zenith_OxygenCheck from './implementations/Zenith_OxygenCheck';
import Zenith_Whiteout from './implementations/Zenith_Whiteout';
import Zenith_ZenithSeal from './implementations/Zenith_ZenithSeal';

// ── Multiverse Collection (default exports) ──────────────────────
import Multiverse_IdentityPrism from './implementations/Multiverse_IdentityPrism';
import Multiverse_BothAndBridge from './implementations/Multiverse_BothAndBridge';
import Multiverse_CostumeChange from './implementations/Multiverse_CostumeChange';
import Multiverse_FutureDraft from './implementations/Multiverse_FutureDraft';
import Multiverse_CommitteeMeeting from './implementations/Multiverse_CommitteeMeeting';
import Multiverse_GhostShip from './implementations/Multiverse_GhostShip';
import Multiverse_Shapeshifter from './implementations/Multiverse_Shapeshifter';
import Multiverse_ShadowDance from './implementations/Multiverse_ShadowDance';
import Multiverse_EmptyRoom from './implementations/Multiverse_EmptyRoom';
import Multiverse_MultiverseSeal from './implementations/Multiverse_MultiverseSeal';

// ── Ethicist Collection (default exports) ────────────────────────
import Ethicist_IntegrityGap from './implementations/Ethicist_IntegrityGap';
import Ethicist_EulogyTest from './implementations/Ethicist_EulogyTest';
import Ethicist_HardRight from './implementations/Ethicist_HardRight';
import Ethicist_TruthSerum from './implementations/Ethicist_TruthSerum';
import Ethicist_VirtueCard from './implementations/Ethicist_VirtueCard';
import Ethicist_Whisper from './implementations/Ethicist_Whisper';
import Ethicist_ResponsibilityWeight from './implementations/Ethicist_ResponsibilityWeight';
import Ethicist_GratitudeTithe from './implementations/Ethicist_GratitudeTithe';
import Ethicist_ApologyScript from './implementations/Ethicist_ApologyScript';
import Ethicist_EthicistSeal from './implementations/Ethicist_EthicistSeal';

// ── Elementalist Collection (default exports) ───────────────────
import Elementalist_EarthDrop from './implementations/Elementalist_EarthDrop';
import Elementalist_AirFilter from './implementations/Elementalist_AirFilter';
import Elementalist_FireStoke from './implementations/Elementalist_FireStoke';
import Elementalist_WaterFlow from './implementations/Elementalist_WaterFlow';
import Elementalist_StormEye from './implementations/Elementalist_StormEye';
import Elementalist_StoneStack from './implementations/Elementalist_StoneStack';
import Elementalist_ForestBath from './implementations/Elementalist_ForestBath';
import Elementalist_TideChart from './implementations/Elementalist_TideChart';
import Elementalist_LightningRod from './implementations/Elementalist_LightningRod';
import Elementalist_ElementalSeal from './implementations/Elementalist_ElementalSeal';

// ── Mentat Collection (default exports) ─────────────────────────
import Mentat_DeductionPalace from './implementations/Mentat_DeductionPalace';
import Mentat_SpeedRead from './implementations/Mentat_SpeedRead';
import Mentat_LogicGate from './implementations/Mentat_LogicGate';
import Mentat_BinaryChoice from './implementations/Mentat_BinaryChoice';
import Mentat_MemoryArchive from './implementations/Mentat_MemoryArchive';
import Mentat_FocusTunnel from './implementations/Mentat_FocusTunnel';
import Mentat_PatternMatch from './implementations/Mentat_PatternMatch';
import Mentat_DevilsAdvocate from './implementations/Mentat_DevilsAdvocate';
import Mentat_AlgorithmRewrite from './implementations/Mentat_AlgorithmRewrite';
import Mentat_MentatSeal from './implementations/Mentat_MentatSeal';

// ── Intuition Collection (default exports) ──────────────────────────
import Intuition_GutCheck from './implementations/Intuition_GutCheck';
import Intuition_CoinFlip from './implementations/Intuition_CoinFlip';
import Intuition_ShiverScan from './implementations/Intuition_ShiverScan';
import Intuition_SleepOnIt from './implementations/Intuition_SleepOnIt';
import Intuition_VibeCheck from './implementations/Intuition_VibeCheck';
import Intuition_SilenceVacuum from './implementations/Intuition_SilenceVacuum';
import Intuition_ResonanceTest from './implementations/Intuition_ResonanceTest';
import Intuition_FutureSelfConsult from './implementations/Intuition_FutureSelfConsult';
import Intuition_FearVsDanger from './implementations/Intuition_FearVsDanger';
import Intuition_OracleSeal from './implementations/Intuition_OracleSeal';

// ── Engineer Collection (default exports) ───────────────────────────
import Engineer_DefaultSetting from './implementations/Engineer_DefaultSetting';
import Engineer_FrictionSlider from './implementations/Engineer_FrictionSlider';
import Engineer_CommitmentDevice from './implementations/Engineer_CommitmentDevice';
import Engineer_BatchProcess from './implementations/Engineer_BatchProcess';
import Engineer_CheckEngineLight from './implementations/Engineer_CheckEngineLight';
import Engineer_Redundancy from './implementations/Engineer_Redundancy';
import Engineer_Constraint from './implementations/Engineer_Constraint';
import Engineer_FeedbackLoop from './implementations/Engineer_FeedbackLoop';
import Engineer_MaintenanceSchedule from './implementations/Engineer_MaintenanceSchedule';
import Engineer_EngineerSeal from './implementations/Engineer_EngineerSeal';

// ── AlchemistIV Collection (default exports) ────────────────────────
import AlchemistIV_AngerForge from './implementations/AlchemistIV_AngerForge';
import AlchemistIV_GriefGarden from './implementations/AlchemistIV_GriefGarden';
import AlchemistIV_FearCompass from './implementations/AlchemistIV_FearCompass';
import AlchemistIV_JoyReservoir from './implementations/AlchemistIV_JoyReservoir';
import AlchemistIV_ShameSolvent from './implementations/AlchemistIV_ShameSolvent';
import AlchemistIV_EnvyMirror from './implementations/AlchemistIV_EnvyMirror';
import AlchemistIV_SadnessRiver from './implementations/AlchemistIV_SadnessRiver';
import AlchemistIV_AnxietyEngine from './implementations/AlchemistIV_AnxietyEngine';
import AlchemistIV_LoveAmplifier from './implementations/AlchemistIV_LoveAmplifier';
import AlchemistIV_TransmutationSeal from './implementations/AlchemistIV_TransmutationSeal';

// ── Cognitive Collection (default exports) ──────────────────────────
import Cognitive_MemoryPalaceRepair from './implementations/Cognitive_MemoryPalaceRepair';
import Cognitive_FocusFortress from './implementations/Cognitive_FocusFortress';
import Cognitive_LogicLibrary from './implementations/Cognitive_LogicLibrary';
import Cognitive_PerspectiveBalcony from './implementations/Cognitive_PerspectiveBalcony';
import Cognitive_ValueVault from './implementations/Cognitive_ValueVault';
import Cognitive_DecisionBridge from './implementations/Cognitive_DecisionBridge';
import Cognitive_CreativityWorkshop from './implementations/Cognitive_CreativityWorkshop';
import Cognitive_DoubtDungeon from './implementations/Cognitive_DoubtDungeon';
import Cognitive_FutureObservatory from './implementations/Cognitive_FutureObservatory';
import Cognitive_ArchitectSeal from './implementations/Cognitive_ArchitectSeal';

// ── Sage Collection (default exports) ───────────────────────────────
import Sage_EmptyCup from './implementations/Sage_EmptyCup';
import Sage_Impermanence from './implementations/Sage_Impermanence';
import Sage_MiddleWay from './implementations/Sage_MiddleWay';
import Sage_ParadoxHolder from './implementations/Sage_ParadoxHolder';
import Sage_SilentAnswer from './implementations/Sage_SilentAnswer';
import Sage_ObserverSeat from './implementations/Sage_ObserverSeat';
import Sage_WuWei from './implementations/Sage_WuWei';
import Sage_MirrorOfProjection from './implementations/Sage_MirrorOfProjection';
import Sage_BeginnersMind from './implementations/Sage_BeginnersMind';
import Sage_SageSeal from './implementations/Sage_SageSeal';

// ── Gaia Collection (default exports) ───────────────────────────────
import Gaia_BreathExchange from './implementations/Gaia_BreathExchange';
import Gaia_MyceliumNetwork from './implementations/Gaia_MyceliumNetwork';
import Gaia_ZoomOut from './implementations/Gaia_ZoomOut';
import Gaia_WaterCycle from './implementations/Gaia_WaterCycle';
import Gaia_DeepTime from './implementations/Gaia_DeepTime';
import Gaia_SunSource from './implementations/Gaia_SunSource';
import Gaia_DiversityImmunity from './implementations/Gaia_DiversityImmunity';
import Gaia_OceanDepth from './implementations/Gaia_OceanDepth';
import Gaia_ButterflyEffect from './implementations/Gaia_ButterflyEffect';
import Gaia_GaiaSeal from './implementations/Gaia_GaiaSeal';

// ── Mystic Collection (default exports) ─────────────────────────────
import Mystic_CandleGaze from './implementations/Mystic_CandleGaze';
import Mystic_DropInOcean from './implementations/Mystic_DropInOcean';
import Mystic_Koan from './implementations/Mystic_Koan';
import Mystic_LightSource from './implementations/Mystic_LightSource';
import Mystic_SpaceBetween from './implementations/Mystic_SpaceBetween';
import Mystic_DanceOfShiva from './implementations/Mystic_DanceOfShiva';
import Mystic_GoldenThread from './implementations/Mystic_GoldenThread';
import Mystic_SilenceBell from './implementations/Mystic_SilenceBell';
import Mystic_NetOfIndra from './implementations/Mystic_NetOfIndra';
import Mystic_TranscendenceSeal from './implementations/Mystic_TranscendenceSeal';

// ── Gardener II Collection (default exports) ────────────────────────
import Gardener_SeedBank from './implementations/Gardener_SeedBank';
import Gardener_Composting from './implementations/Gardener_Composting';
import Gardener_PruningShears from './implementations/Gardener_PruningShears';
import Gardener_MycelialPulse from './implementations/Gardener_MycelialPulse';
import Gardener_HarvestTiming from './implementations/Gardener_HarvestTiming';
import Gardener_DroughtResilience from './implementations/Gardener_DroughtResilience';
import Gardener_Pollinator from './implementations/Gardener_Pollinator';
import Gardener_WinterRest from './implementations/Gardener_WinterRest';
import Gardener_EcosystemBalance from './implementations/Gardener_EcosystemBalance';
import Gardener_GardenerSeal from './implementations/Gardener_GardenerSeal';

// ── Ancestor II Collection (default exports) ────────────────────────
import AncestorII_100YearPlan from './implementations/AncestorII_100YearPlan';
import AncestorII_ChainLink from './implementations/AncestorII_ChainLink';
import AncestorII_WisdomCapsule from './implementations/AncestorII_WisdomCapsule';
import AncestorII_NameEtching from './implementations/AncestorII_NameEtching';
import AncestorII_TorchPass from './implementations/AncestorII_TorchPass';
import AncestorII_LibraryContribution from './implementations/AncestorII_LibraryContribution';
import AncestorII_RippleWatch from './implementations/AncestorII_RippleWatch';
import AncestorII_CouncilSeat from './implementations/AncestorII_CouncilSeat';
import AncestorII_InheritanceAudit from './implementations/AncestorII_InheritanceAudit';
import AncestorII_AncestorSeal from './implementations/AncestorII_AncestorSeal';

// ── Ascendant Collection (default exports) ──────────────────────────
import Ascendant_ChopWood from './implementations/Ascendant_ChopWood';
import Ascendant_Descent from './implementations/Ascendant_Descent';
import Ascendant_MarketplaceNoise from './implementations/Ascendant_MarketplaceNoise';
import Ascendant_DirtyHands from './implementations/Ascendant_DirtyHands';
import Ascendant_OrdinaryMiracle from './implementations/Ascendant_OrdinaryMiracle';
import Ascendant_BrokenBowl from './implementations/Ascendant_BrokenBowl';
import Ascendant_RippleMaker from './implementations/Ascendant_RippleMaker';
import Ascendant_HumanTouch from './implementations/Ascendant_HumanTouch';
import Ascendant_OpenDoor from './implementations/Ascendant_OpenDoor';
import Ascendant_AscendantSeal from './implementations/Ascendant_AscendantSeal';

// ── Broadcast Collection (default exports) ──────────────────────────
import Broadcast_CircadianTint from './implementations/Broadcast_CircadianTint';
import Broadcast_SubliminalPulse from './implementations/Broadcast_SubliminalPulse';
import Broadcast_HapticHeartbeat from './implementations/Broadcast_HapticHeartbeat';
import Broadcast_ColorBath from './implementations/Broadcast_ColorBath';
import Broadcast_SilentTimer from './implementations/Broadcast_SilentTimer';
import Broadcast_DigitalCandle from './implementations/Broadcast_DigitalCandle';
import Broadcast_PresenceRadar from './implementations/Broadcast_PresenceRadar';
import Broadcast_WeatherWindow from './implementations/Broadcast_WeatherWindow';
import Broadcast_RhythmBackground from './implementations/Broadcast_RhythmBackground';
import Broadcast_BroadcastSeal from './implementations/Broadcast_BroadcastSeal';

// ── Mastery Collection (default exports) ────────────────────────────
import Mastery_Distillation from './implementations/Mastery_Distillation';
import Mastery_PhoenixAsh from './implementations/Mastery_PhoenixAsh';
import Mastery_GoldStandard from './implementations/Mastery_GoldStandard';
import Mastery_MasterpieceReveal from './implementations/Mastery_MasterpieceReveal';
import Mastery_ChiselStrike from './implementations/Mastery_ChiselStrike';
import Mastery_FinalPolish from './implementations/Mastery_FinalPolish';
import Mastery_KeyTurn from './implementations/Mastery_KeyTurn';
import Mastery_CrownWeight from './implementations/Mastery_CrownWeight';
import Mastery_SilentNod from './implementations/Mastery_SilentNod';
import Mastery_MasterySeal from './implementations/Mastery_MasterySeal';

// ── Horizon Collection (default exports) ────────────────────────────
import Horizon_HorizonLine from './implementations/Horizon_HorizonLine';
import Horizon_NewMap from './implementations/Horizon_NewMap';
import Horizon_LevelUp from './implementations/Horizon_LevelUp';
import Horizon_OpenDoor from './implementations/Horizon_OpenDoor';
import Horizon_TorchRelay from './implementations/Horizon_TorchRelay';
import Horizon_Sunrise from './implementations/Horizon_Sunrise';
import Horizon_UnfinishedSymphony from './implementations/Horizon_UnfinishedSymphony';
import Horizon_Vastness from './implementations/Horizon_Vastness';
import Horizon_QuestionMark from './implementations/Horizon_QuestionMark';
import Horizon_InfiniteSeal from './implementations/Horizon_InfiniteSeal';

// ── Void Collection (default exports) ───────────────────────────────
import Void_SensoryDeprivation from './implementations/Void_SensoryDeprivation';
import Void_NothingBox from './implementations/Void_NothingBox';
import Void_SilenceVacuum from './implementations/Void_SilenceVacuum';
import Void_DarkMatter from './implementations/Void_DarkMatter';
import Void_EgoDeath from './implementations/Void_EgoDeath';
import Void_BreathHold from './implementations/Void_BreathHold';
import Void_UnNaming from './implementations/Void_UnNaming';
import Void_ResetButton from './implementations/Void_ResetButton';
import Void_StaticClear from './implementations/Void_StaticClear';
import Void_ZeroSeal from './implementations/Void_ZeroSeal';

// ── Unity Collection (default exports) ──────────────────────────────
import Unity_PrismReturn from './implementations/Unity_PrismReturn';
import Unity_Symphony from './implementations/Unity_Symphony';
import Unity_FractalZoom from './implementations/Unity_FractalZoom';
import Unity_Entanglement from './implementations/Unity_Entanglement';
import Unity_GoldenRatio from './implementations/Unity_GoldenRatio';
import Unity_TimeCollapse from './implementations/Unity_TimeCollapse';
import Unity_EventHorizon from './implementations/Unity_EventHorizon';
import Unity_MirrorOfTruth from './implementations/Unity_MirrorOfTruth';
import Unity_FinalExhale from './implementations/Unity_FinalExhale';
import Unity_AtlasSeal from './implementations/Unity_AtlasSeal';

// ── Ouroboros Collection (default exports) ──────────────────────────
import Ouroboros_FirstBreath from './implementations/Ouroboros_FirstBreath';
import Ouroboros_MirrorLoop from './implementations/Ouroboros_MirrorLoop';
import Ouroboros_SeedReturn from './implementations/Ouroboros_SeedReturn';
import Ouroboros_SnakeSkin from './implementations/Ouroboros_SnakeSkin';
import Ouroboros_CircleClose from './implementations/Ouroboros_CircleClose';
import Ouroboros_AshSprout from './implementations/Ouroboros_AshSprout';
import Ouroboros_EchoOrigin from './implementations/Ouroboros_EchoOrigin';
import Ouroboros_TailSwallow from './implementations/Ouroboros_TailSwallow';
import Ouroboros_AlphaOmega from './implementations/Ouroboros_AlphaOmega';
import Ouroboros_EternalSeal from './implementations/Ouroboros_EternalSeal';

// ── Projector Collection (default exports, S101) ────────────────────
import Projector_FilmSwap from './implementations/Projector_FilmSwap';
import Projector_BeamFocus from './implementations/Projector_BeamFocus';
import Projector_LensShift from './implementations/Projector_LensShift';
import Projector_RealityLag from './implementations/Projector_RealityLag';
import Projector_TuningFork from './implementations/Projector_TuningFork';
import Projector_SilentReel from './implementations/Projector_SilentReel';
import Projector_FourthWall from './implementations/Projector_FourthWall';
import Projector_SplicePoint from './implementations/Projector_SplicePoint';
import Projector_GhostLight from './implementations/Projector_GhostLight';
import Projector_ProjectorSeal from './implementations/Projector_ProjectorSeal';

// ── Chronomancer Collection (default exports, S102) ─────────────────
import Chronomancer_PastEdit from './implementations/Chronomancer_PastEdit';
import Chronomancer_FutureBorrow from './implementations/Chronomancer_FutureBorrow';
import Chronomancer_TimeDilation from './implementations/Chronomancer_TimeDilation';
import Chronomancer_AncestralLink from './implementations/Chronomancer_AncestralLink';
import Chronomancer_LegacyCast from './implementations/Chronomancer_LegacyCast';
import Chronomancer_RegretReversal from './implementations/Chronomancer_RegretReversal';
import Chronomancer_DejaVu from './implementations/Chronomancer_DejaVu';
import Chronomancer_Wormhole from './implementations/Chronomancer_Wormhole';
import Chronomancer_EternalNow from './implementations/Chronomancer_EternalNow';
import Chronomancer_ChronosSeal from './implementations/Chronomancer_ChronosSeal';

// ── Resonator Collection (default exports, S103) ────────────────────
import Resonator_NoiseCancellation from './implementations/Resonator_NoiseCancellation';
import Resonator_CarrierWave from './implementations/Resonator_CarrierWave';
import Resonator_ConstructiveInterference from './implementations/Resonator_ConstructiveInterference';
import Resonator_SympatheticResonance from './implementations/Resonator_SympatheticResonance';
import Resonator_FeedbackLoop from './implementations/Resonator_FeedbackLoop';
import Resonator_PureTone from './implementations/Resonator_PureTone';
import Resonator_VolumeKnob from './implementations/Resonator_VolumeKnob';
import Resonator_EchoChamber from './implementations/Resonator_EchoChamber';
import Resonator_FrequencyJammer from './implementations/Resonator_FrequencyJammer';
import Resonator_ResonatorSeal from './implementations/Resonator_ResonatorSeal';

// ── Materialist Collection (default exports, S104) ──────────────────
import Materialist_FirstBrick from './implementations/Materialist_FirstBrick';
import Materialist_BlueprintEdit from './implementations/Materialist_BlueprintEdit';
import Materialist_GravityWell from './implementations/Materialist_GravityWell';
import Materialist_FrictionTest from './implementations/Materialist_FrictionTest';
import Materialist_Scaffolding from './implementations/Materialist_Scaffolding';
import Materialist_ConcretePour from './implementations/Materialist_ConcretePour';
import Materialist_Keystone from './implementations/Materialist_Keystone';
import Materialist_Demolition from './implementations/Materialist_Demolition';
import Materialist_Inspection from './implementations/Materialist_Inspection';
import Materialist_MaterialistSeal from './implementations/Materialist_MaterialistSeal';

// ── Refractor Collection (default exports, S105) ─────────────────────
import Refractor_SpectrumSplit from './implementations/Refractor_SpectrumSplit';
import Refractor_FocalPoint from './implementations/Refractor_FocalPoint';
import Refractor_DistortionCheck from './implementations/Refractor_DistortionCheck';
import Refractor_ColorGrade from './implementations/Refractor_ColorGrade';
import Refractor_BlindSpot from './implementations/Refractor_BlindSpot';
import Refractor_Polarizer from './implementations/Refractor_Polarizer';
import Refractor_BlackBody from './implementations/Refractor_BlackBody';
import Refractor_Laser from './implementations/Refractor_Laser';
import Refractor_Darkroom from './implementations/Refractor_Darkroom';
import Refractor_PrismSeal from './implementations/Refractor_PrismSeal';

// ── Engine Collection (default exports, S106) ────────────────────────
import Engine_EntropyCheck from './implementations/Engine_EntropyCheck';
import Engine_HeatSink from './implementations/Engine_HeatSink';
import Engine_ClosedLoop from './implementations/Engine_ClosedLoop';
import Engine_Flywheel from './implementations/Engine_Flywheel';
import Engine_Insulation from './implementations/Engine_Insulation';
import Engine_Turbocharger from './implementations/Engine_Turbocharger';
import Engine_IdleState from './implementations/Engine_IdleState';
import Engine_FuelMix from './implementations/Engine_FuelMix';
import Engine_Governor from './implementations/Engine_Governor';
import Engine_EngineSeal from './implementations/Engine_EngineSeal';

// ── Catalyst S107 additions (ActivationEnergy + CatalystSeal already imported from Act 62 block)
import Catalyst_PhaseChange from './implementations/Catalyst_PhaseChange';
import Catalyst_Precipitate from './implementations/Catalyst_Precipitate';
import Catalyst_Compound from './implementations/Catalyst_Compound';
import Catalyst_Solvent from './implementations/Catalyst_Solvent';
import Catalyst_ChainReaction from './implementations/Catalyst_ChainReaction';
import Catalyst_Purification from './implementations/Catalyst_Purification';
import Catalyst_Titration from './implementations/Catalyst_Titration';
import Catalyst_InertGas from './implementations/Catalyst_InertGas';
import Catalyst_Enzyme from './implementations/Catalyst_Enzyme';
import Catalyst_Equilibrium from './implementations/Catalyst_Equilibrium';

// ── Quantum Architect Collection (default exports, S108/S124 updated) ──
import QuantumArchitect_Superposition from './implementations/QuantumArchitect_Superposition';
import QuantumArchitect_ProbabilityCloud from './implementations/QuantumArchitect_ProbabilityCloud';
import QuantumArchitect_ObserverEffect from './implementations/QuantumArchitect_ObserverEffect';
import QuantumArchitect_MultiverseBranch from './implementations/QuantumArchitect_MultiverseBranch';
import QuantumArchitect_QuantumTunneling from './implementations/QuantumArchitect_QuantumTunneling';
import QuantumArchitect_Entanglement from './implementations/QuantumArchitect_Entanglement';
import QuantumArchitect_WaveFunctionCollapse from './implementations/QuantumArchitect_WaveFunctionCollapse';
import QuantumArchitect_UncertaintyPrinciple from './implementations/QuantumArchitect_UncertaintyPrinciple';
import QuantumArchitect_VacuumFluctuation from './implementations/QuantumArchitect_VacuumFluctuation';
import QuantumArchitect_QuantumSeal from './implementations/QuantumArchitect_QuantumSeal';

// ── Transmuter Collection (default exports, S109) ────────────────────
import Transmuter_LeadWeight from './implementations/Transmuter_LeadWeight';
import Transmuter_Calcination from './implementations/Transmuter_Calcination';
import Transmuter_Distillation from './implementations/Transmuter_Distillation';
import Transmuter_Coagulation from './implementations/Transmuter_Coagulation';
import Transmuter_Fermentation from './implementations/Transmuter_Fermentation';
import Transmuter_Sublimation from './implementations/Transmuter_Sublimation';
import Transmuter_Amalgam from './implementations/Transmuter_Amalgam';
import Transmuter_UniversalSolvent from './implementations/Transmuter_UniversalSolvent';
import Transmuter_PhilosophersStone from './implementations/Transmuter_PhilosophersStone';
import Transmuter_TransmuterSeal from './implementations/Transmuter_TransmuterSeal';

// ── Cyberneticist Collection (default exports, S110) ─────────────────
import Cyberneticist_ErrorSignal from './implementations/Cyberneticist_ErrorSignal';
import Cyberneticist_NegativeFeedbackLoop from './implementations/Cyberneticist_NegativeFeedbackLoop';
import Cyberneticist_PositiveFeedbackLoop from './implementations/Cyberneticist_PositiveFeedbackLoop';
import Cyberneticist_LagTime from './implementations/Cyberneticist_LagTime';
import Cyberneticist_Gain from './implementations/Cyberneticist_Gain';
import Cyberneticist_SetPoint from './implementations/Cyberneticist_SetPoint';
import Cyberneticist_Feedforward from './implementations/Cyberneticist_Feedforward';
import Cyberneticist_Oscillation from './implementations/Cyberneticist_Oscillation';
import Cyberneticist_BlackBox from './implementations/Cyberneticist_BlackBox';
import Cyberneticist_NavigatorSeal from './implementations/Cyberneticist_NavigatorSeal';

// ── FieldArchitect Collection (default exports, S111) ────────────────
import FieldArchitect_PolarityCheck from './implementations/FieldArchitect_PolarityCheck';
import FieldArchitect_IronFilings from './implementations/FieldArchitect_IronFilings';
import FieldArchitect_StrangeAttractor from './implementations/FieldArchitect_StrangeAttractor';
import FieldArchitect_Shield from './implementations/FieldArchitect_Shield';
import FieldArchitect_InducedCurrent from './implementations/FieldArchitect_InducedCurrent';
import FieldArchitect_CompassNeedle from './implementations/FieldArchitect_CompassNeedle';
import FieldArchitect_ElectroMagnet from './implementations/FieldArchitect_ElectroMagnet';
import FieldArchitect_VoltageDrop from './implementations/FieldArchitect_VoltageDrop';
import FieldArchitect_Domain from './implementations/FieldArchitect_Domain';
import FieldArchitect_FieldSeal from './implementations/FieldArchitect_FieldSeal';

// ── Kineticist Collection (default exports, S112) ─────────────────────
import Kineticist_InertiaBreaker from './implementations/Kineticist_InertiaBreaker';
import Kineticist_GravityAssist from './implementations/Kineticist_GravityAssist';
import Kineticist_ElasticCollision from './implementations/Kineticist_ElasticCollision';
import Kineticist_TerminalVelocity from './implementations/Kineticist_TerminalVelocity';
import Kineticist_RocketEquation from './implementations/Kineticist_RocketEquation';
import Kineticist_Orbit from './implementations/Kineticist_Orbit';
import Kineticist_VectorAddition from './implementations/Kineticist_VectorAddition';
import Kineticist_MomentumSave from './implementations/Kineticist_MomentumSave';
import Kineticist_ImpactZone from './implementations/Kineticist_ImpactZone';
import Kineticist_KineticSeal from './implementations/Kineticist_KineticSeal';

// ── Crystal Collection (default exports, S113) ────────────────────────
import Crystal_Lattice from './implementations/Crystal_Lattice';
import Crystal_PiezoelectricSpark from './implementations/Crystal_PiezoelectricSpark';
import Crystal_FacetCut from './implementations/Crystal_FacetCut';
import Crystal_Inclusion from './implementations/Crystal_Inclusion';
import Crystal_ResonantFrequency from './implementations/Crystal_ResonantFrequency';
import Crystal_Annealing from './implementations/Crystal_Annealing';
import Crystal_Transparency from './implementations/Crystal_Transparency';
import Crystal_NucleationPoint from './implementations/Crystal_NucleationPoint';
import Crystal_PrismRefraction from './implementations/Crystal_PrismRefraction';
import Crystal_CrystalSeal from './implementations/Crystal_CrystalSeal';

// ── Hydrodynamicist Collection (default exports, S114) ────────────────
import Hydrodynamicist_LaminarFlow from './implementations/Hydrodynamicist_LaminarFlow';
import Hydrodynamicist_BuoyancyCheck from './implementations/Hydrodynamicist_BuoyancyCheck';
import Hydrodynamicist_PathOfLeastResistance from './implementations/Hydrodynamicist_PathOfLeastResistance';
import Hydrodynamicist_Erosion from './implementations/Hydrodynamicist_Erosion';
import Hydrodynamicist_HydraulicPress from './implementations/Hydrodynamicist_HydraulicPress';
import Hydrodynamicist_Vortex from './implementations/Hydrodynamicist_Vortex';
import Hydrodynamicist_SurfaceTension from './implementations/Hydrodynamicist_SurfaceTension';
import Hydrodynamicist_PhaseTransition from './implementations/Hydrodynamicist_PhaseTransition';
import Hydrodynamicist_OceanDepth from './implementations/Hydrodynamicist_OceanDepth';
import Hydrodynamicist_HydroSeal from './implementations/Hydrodynamicist_HydroSeal';

// ── Aviator Collection (default exports, S115) ────────────────────────
import Aviator_DragCheck from './implementations/Aviator_DragCheck';
import Aviator_AngleOfAttack from './implementations/Aviator_AngleOfAttack';
import Aviator_ThrustToWeightRatio from './implementations/Aviator_ThrustToWeightRatio';
import Aviator_CoffinCorner from './implementations/Aviator_CoffinCorner';
import Aviator_Headwind from './implementations/Aviator_Headwind';
import Aviator_TrimTab from './implementations/Aviator_TrimTab';
import Aviator_CenterOfGravity from './implementations/Aviator_CenterOfGravity';
import Aviator_GroundEffect from './implementations/Aviator_GroundEffect';
import Aviator_FeatheredProp from './implementations/Aviator_FeatheredProp';
import Aviator_AviatorSeal from './implementations/Aviator_AviatorSeal';

// ── Tensegrity Collection (default exports, S116) ─────────────────────
import Tensegrity_FloatingCompression from './implementations/Tensegrity_FloatingCompression';
import Tensegrity_PreStress from './implementations/Tensegrity_PreStress';
import Tensegrity_LoadDistribution from './implementations/Tensegrity_LoadDistribution';
import Tensegrity_OmniDirectional from './implementations/Tensegrity_OmniDirectional';
import Tensegrity_FascialRelease from './implementations/Tensegrity_FascialRelease';
import Tensegrity_SpaceFrame from './implementations/Tensegrity_SpaceFrame';
import Tensegrity_DynamicEquilibrium from './implementations/Tensegrity_DynamicEquilibrium';
import Tensegrity_YieldPoint from './implementations/Tensegrity_YieldPoint';
import Tensegrity_NetworkNode from './implementations/Tensegrity_NetworkNode';
import Tensegrity_TensegritySeal from './implementations/Tensegrity_TensegritySeal';

// ── Wayfinder Collection (default exports, S117) ──────────────────────
import Wayfinder_DeadReckoning from './implementations/Wayfinder_DeadReckoning';
import Wayfinder_SwellRead from './implementations/Wayfinder_SwellRead';
import Wayfinder_ZenithStar from './implementations/Wayfinder_ZenithStar';
import Wayfinder_BirdSign from './implementations/Wayfinder_BirdSign';
import Wayfinder_CloudStack from './implementations/Wayfinder_CloudStack';
import Wayfinder_Etak from './implementations/Wayfinder_Etak';
import Wayfinder_Phosphorescence from './implementations/Wayfinder_Phosphorescence';
import Wayfinder_StormDrift from './implementations/Wayfinder_StormDrift';
import Wayfinder_LandScent from './implementations/Wayfinder_LandScent';
import Wayfinder_WayfinderSeal from './implementations/Wayfinder_WayfinderSeal';

// ── Receiver Collection (default exports, S118) ───────────────────────
import Receiver_SignalToNoiseRatio from './implementations/Receiver_SignalToNoiseRatio';
import Receiver_FrequencyScan from './implementations/Receiver_FrequencyScan';
import Receiver_Squelch from './implementations/Receiver_Squelch';
import Receiver_AntennaGain from './implementations/Receiver_AntennaGain';
import Receiver_Modulation from './implementations/Receiver_Modulation';
import Receiver_InterferencePattern from './implementations/Receiver_InterferencePattern';
import Receiver_FeedbackLoop from './implementations/Receiver_FeedbackLoop';
import Receiver_Encryption from './implementations/Receiver_Encryption';
import Receiver_BroadcastPower from './implementations/Receiver_BroadcastPower';
import Receiver_ReceiverSeal from './implementations/Receiver_ReceiverSeal';

// ── Vector Collection (default exports, S119) ─────────────────────────
import Vector_ScalarVsVector from './implementations/Vector_ScalarVsVector';
import Vector_ResultantForce from './implementations/Vector_ResultantForce';
import Vector_UnitVector from './implementations/Vector_UnitVector';
import Vector_CrossProduct from './implementations/Vector_CrossProduct';
import Vector_DotProduct from './implementations/Vector_DotProduct';
import Vector_NullVector from './implementations/Vector_NullVector';
import Vector_AccelerationVector from './implementations/Vector_AccelerationVector';
import Vector_Decomposition from './implementations/Vector_Decomposition';
import Vector_FieldLine from './implementations/Vector_FieldLine';
import Vector_VectorSeal from './implementations/Vector_VectorSeal';

// ── Tuning Collection (default exports, S120) ─────────────────────────
import Tuning_TensionCheck from './implementations/Tuning_TensionCheck';
import Tuning_DissonanceResolve from './implementations/Tuning_DissonanceResolve';
import Tuning_FundamentalFrequency from './implementations/Tuning_FundamentalFrequency';
import Tuning_SympatheticVibration from './implementations/Tuning_SympatheticVibration';
import Tuning_BeatFrequency from './implementations/Tuning_BeatFrequency';
import Tuning_OvertoneSeries from './implementations/Tuning_OvertoneSeries';
import Tuning_DeadSpot from './implementations/Tuning_DeadSpot';
import Tuning_Amplifier from './implementations/Tuning_Amplifier';
import Tuning_FadeOut from './implementations/Tuning_FadeOut';
import Tuning_HarmonicSeal from './implementations/Tuning_HarmonicSeal';

// ── Fulcrum Collection (default exports, S121) ─────────────────────────
import Fulcrum_PivotPoint from './implementations/Fulcrum_PivotPoint';
import Fulcrum_LongLever from './implementations/Fulcrum_LongLever';
import Fulcrum_PulleySystem from './implementations/Fulcrum_PulleySystem';
import Fulcrum_GearRatio from './implementations/Fulcrum_GearRatio';
import Fulcrum_Wedge from './implementations/Fulcrum_Wedge';
import Fulcrum_Screw from './implementations/Fulcrum_Screw';
import Fulcrum_Counterweight from './implementations/Fulcrum_Counterweight';
import Fulcrum_Domino from './implementations/Fulcrum_Domino';
import Fulcrum_TippingPoint from './implementations/Fulcrum_TippingPoint';
import Fulcrum_FulcrumSeal from './implementations/Fulcrum_FulcrumSeal';

// ── Conductor Collection (default exports, S122) ───────────────────────
import Conductor_ResistanceCheck from './implementations/Conductor_ResistanceCheck';
import Conductor_GroundingWire from './implementations/Conductor_GroundingWire';
import Conductor_CircuitBreaker from './implementations/Conductor_CircuitBreaker';
import Conductor_Capacitor from './implementations/Conductor_Capacitor';
import Conductor_Transformer from './implementations/Conductor_Transformer';
import Conductor_ShortCircuit from './implementations/Conductor_ShortCircuit';
import Conductor_ParallelCircuit from './implementations/Conductor_ParallelCircuit';
import Conductor_Switch from './implementations/Conductor_Switch';
import Conductor_ACDC from './implementations/Conductor_ACDC';
import Conductor_ConductorSeal from './implementations/Conductor_ConductorSeal';

// ── Catalyst III Collection (default exports, S123) ────────────────────
import CatalystIII_PhaseChange from './implementations/CatalystIII_PhaseChange';
import CatalystIII_Precipitate from './implementations/CatalystIII_Precipitate';
import CatalystIII_ActivationEnergy from './implementations/CatalystIII_ActivationEnergy';
import CatalystIII_Compound from './implementations/CatalystIII_Compound';
import CatalystIII_Solvent from './implementations/CatalystIII_Solvent';
import CatalystIII_ChainReaction from './implementations/CatalystIII_ChainReaction';
import CatalystIII_Purification from './implementations/CatalystIII_Purification';
import CatalystIII_InertGas from './implementations/CatalystIII_InertGas';
import CatalystIII_Enzyme from './implementations/CatalystIII_Enzyme';
import CatalystIII_CatalystSeal from './implementations/CatalystIII_CatalystSeal';

// ── Simulator Collection (default exports, S125) ───────────────────────
import Simulator_MapVsTerritory from './implementations/Simulator_MapVsTerritory';
import Simulator_ResolutionUpgrade from './implementations/Simulator_ResolutionUpgrade';
import Simulator_FrameRate from './implementations/Simulator_FrameRate';
import Simulator_SandboxMode from './implementations/Simulator_SandboxMode';
import Simulator_AlgorithmAudit from './implementations/Simulator_AlgorithmAudit';
import Simulator_RenderingDistance from './implementations/Simulator_RenderingDistance';
import Simulator_Glitch from './implementations/Simulator_Glitch';
import Simulator_Compression from './implementations/Simulator_Compression';
import Simulator_UserInterface from './implementations/Simulator_UserInterface';
import Simulator_SimulatorSeal from './implementations/Simulator_SimulatorSeal';

// ── Editor Collection (default exports, S126) ──────────────────────────
import Editor_JumpCut from './implementations/Editor_JumpCut';
import Editor_SoundtrackSwap from './implementations/Editor_SoundtrackSwap';
import Editor_FlashbackEdit from './implementations/Editor_FlashbackEdit';
import Editor_Voiceover from './implementations/Editor_Voiceover';
import Editor_BRoll from './implementations/Editor_BRoll';
import Editor_PlotTwist from './implementations/Editor_PlotTwist';
import Editor_CharacterArc from './implementations/Editor_CharacterArc';
import Editor_Foley from './implementations/Editor_Foley';
import Editor_DirectorsCut from './implementations/Editor_DirectorsCut';
import Editor_EditorSeal from './implementations/Editor_EditorSeal';

// ── Scout Collection (default exports, S128) ───────────────────────────
import Scout_FogOfWar from './implementations/Scout_FogOfWar';
import Scout_Breadcrumbs from './implementations/Scout_Breadcrumbs';
import Scout_HighGround from './implementations/Scout_HighGround';
import Scout_NightVision from './implementations/Scout_NightVision';
import Scout_Edge from './implementations/Scout_Edge';
import Scout_Sample from './implementations/Scout_Sample';
import Scout_CompassBearing from './implementations/Scout_CompassBearing';
import Scout_FalsePeak from './implementations/Scout_FalsePeak';
import Scout_SignalFire from './implementations/Scout_SignalFire';
import Scout_ScoutSeal from './implementations/Scout_ScoutSeal';

// ── Weaver Pattern Collection (default exports, S129) ──────────────────
import WeaverPattern_ThreadPull from './implementations/WeaverPattern_ThreadPull';
import WeaverPattern_Knot from './implementations/WeaverPattern_Knot';
import WeaverPattern_Tapestry from './implementations/WeaverPattern_Tapestry';
import WeaverPattern_FractalZoom from './implementations/WeaverPattern_FractalZoom';
import WeaverPattern_SpidersWeb from './implementations/WeaverPattern_SpidersWeb';
import WeaverPattern_WarpAndWeft from './implementations/WeaverPattern_WarpAndWeft';
import WeaverPattern_Patchwork from './implementations/WeaverPattern_Patchwork';
import WeaverPattern_Cut from './implementations/WeaverPattern_Cut';
import WeaverPattern_InvisibleString from './implementations/WeaverPattern_InvisibleString';
import WeaverPattern_WeaverSeal from './implementations/WeaverPattern_WeaverSeal';

// ── Anchor Collection (default exports, S130) ──────────────────────────
import Anchor_HeavyStone from './implementations/Anchor_HeavyStone';
import Anchor_DeepRoot from './implementations/Anchor_DeepRoot';
import Anchor_Gyroscope from './implementations/Anchor_Gyroscope';
import Anchor_Keel from './implementations/Anchor_Keel';
import Anchor_FrictionBrake from './implementations/Anchor_FrictionBrake';
import Anchor_CenterOfMass from './implementations/Anchor_CenterOfMass';
import Anchor_DeadmanAnchor from './implementations/Anchor_DeadmanAnchor';
import Anchor_Lighthouse from './implementations/Anchor_Lighthouse';
import Anchor_Sediment from './implementations/Anchor_Sediment';
import Anchor_AnchorSeal from './implementations/Anchor_AnchorSeal';

// ── Strategist Collection (default exports, S131) ──────────────────────
import Strategist_FirstMover from './implementations/Strategist_FirstMover';
import Strategist_Sacrifice from './implementations/Strategist_Sacrifice';
import Strategist_TitForTat from './implementations/Strategist_TitForTat';
import Strategist_FogOfWar from './implementations/Strategist_FogOfWar';
import Strategist_Fork from './implementations/Strategist_Fork';
import Strategist_Zugzwang from './implementations/Strategist_Zugzwang';
import Strategist_Endgame from './implementations/Strategist_Endgame';
import Strategist_Stalemate from './implementations/Strategist_Stalemate';
import Strategist_Promotion from './implementations/Strategist_Promotion';
import Strategist_StrategistSeal from './implementations/Strategist_StrategistSeal';

// ── Network Collection (default exports, S132) ─────────────────────────
import Network_NodeStrength from './implementations/Network_NodeStrength';
import Network_WeakTie from './implementations/Network_WeakTie';
import Network_ViralCoefficient from './implementations/Network_ViralCoefficient';
import Network_EchoChamber from './implementations/Network_EchoChamber';
import Network_MetcalfesLaw from './implementations/Network_MetcalfesLaw';
import Network_PacketSwitching from './implementations/Network_PacketSwitching';
import Network_SignalBoost from './implementations/Network_SignalBoost';
import Network_Firewall from './implementations/Network_Firewall';
import Network_NeuralNet from './implementations/Network_NeuralNet';
import Network_NetworkSeal from './implementations/Network_NetworkSeal';

// ── Systems Architect Collection (default exports, S133) ────────────────
import Architect_Bottleneck from './implementations/Architect_Bottleneck';
import Architect_FeedbackDelay from './implementations/Architect_FeedbackDelay';
import Architect_Redundancy from './implementations/Architect_Redundancy';
import Architect_LeveragePoint from './implementations/Architect_LeveragePoint';
import Architect_StockAndFlow from './implementations/Architect_StockAndFlow';
import Architect_OscillationDamping from './implementations/Architect_OscillationDamping';
import Architect_Emergence from './implementations/Architect_Emergence';
import Architect_Scalability from './implementations/Architect_Scalability';
import Architect_BlackSwan from './implementations/Architect_BlackSwan';
import Architect_ArchitectSeal from './implementations/Architect_ArchitectSeal';

// ── Evolutionist Collection (default exports, S134) ─────────────────────
import Evolutionist_Mutation from './implementations/Evolutionist_Mutation';
import Evolutionist_SelectionPressure from './implementations/Evolutionist_SelectionPressure';
import Evolutionist_Niche from './implementations/Evolutionist_Niche';
import Evolutionist_Symbiosis from './implementations/Evolutionist_Symbiosis';
import Evolutionist_RedQueen from './implementations/Evolutionist_RedQueen';
import Evolutionist_ExtinctionEvent from './implementations/Evolutionist_ExtinctionEvent';
import Evolutionist_SexualSelection from './implementations/Evolutionist_SexualSelection';
import Evolutionist_Exaptation from './implementations/Evolutionist_Exaptation';
import Evolutionist_GeneDrive from './implementations/Evolutionist_GeneDrive';
import Evolutionist_EvolutionSeal from './implementations/Evolutionist_EvolutionSeal';

// ── Economist Collection (default exports, S135) ────────────────────────
import Economist_OpportunityCost from './implementations/Economist_OpportunityCost';
import Economist_SunkCost from './implementations/Economist_SunkCost';
import Economist_CompoundInterest from './implementations/Economist_CompoundInterest';
import Economist_SupplyAndDemand from './implementations/Economist_SupplyAndDemand';
import Economist_AsymmetricBet from './implementations/Economist_AsymmetricBet';
import Economist_UtilityFunction from './implementations/Economist_UtilityFunction';
import Economist_TimeHorizon from './implementations/Economist_TimeHorizon';
import Economist_Arbitrage from './implementations/Economist_Arbitrage';
import Economist_InvisibleHand from './implementations/Economist_InvisibleHand';
import Economist_EconomistSeal from './implementations/Economist_EconomistSeal';

// ── Politician Collection (default exports, S136) ───────────────────────
import Politician_Coalition from './implementations/Politician_Coalition';
import Politician_Optics from './implementations/Politician_Optics';
import Politician_FavorBank from './implementations/Politician_FavorBank';
import Politician_StrangeBedfellow from './implementations/Politician_StrangeBedfellow';
import Politician_SilentVote from './implementations/Politician_SilentVote';
import Politician_Compromise from './implementations/Politician_Compromise';
import Politician_Leverage from './implementations/Politician_Leverage';
import Politician_FallGuy from './implementations/Politician_FallGuy';
import Politician_LongGame from './implementations/Politician_LongGame';
import Politician_PoliticianSeal from './implementations/Politician_PoliticianSeal';

// ── Warrior II Collection (default exports, S137) ───────────────────────
import WarriorII_Formless from './implementations/WarriorII_Formless';
import WarriorII_HighGround from './implementations/WarriorII_HighGround';
import WarriorII_Retreat from './implementations/WarriorII_Retreat';
import WarriorII_Spy from './implementations/WarriorII_Spy';
import WarriorII_BurningBridge from './implementations/WarriorII_BurningBridge';
import WarriorII_SunAtYourBack from './implementations/WarriorII_SunAtYourBack';
import WarriorII_EmptyFort from './implementations/WarriorII_EmptyFort';
import WarriorII_FlankingManeuver from './implementations/WarriorII_FlankingManeuver';
import WarriorII_PeaceTreaty from './implementations/WarriorII_PeaceTreaty';
import WarriorII_WarriorSeal from './implementations/WarriorII_WarriorSeal';

// ── Sovereign Collection (default exports, S138) ────────────────────────
import Sovereign_Constitution from './implementations/Sovereign_Constitution';
import Sovereign_Court from './implementations/Sovereign_Court';
import Sovereign_Treasury from './implementations/Sovereign_Treasury';
import Sovereign_Border from './implementations/Sovereign_Border';
import Sovereign_Decree from './implementations/Sovereign_Decree';
import Sovereign_Succession from './implementations/Sovereign_Succession';
import Sovereign_DiplomaticImmunity from './implementations/Sovereign_DiplomaticImmunity';
import Sovereign_Infrastructure from './implementations/Sovereign_Infrastructure';
import Sovereign_Rebellion from './implementations/Sovereign_Rebellion';
import Sovereign_SovereignSeal from './implementations/Sovereign_SovereignSeal';

// ── Historian Collection (default exports, S139) ────────────────────────
import Historian_LindyEffect from './implementations/Historian_LindyEffect';
import Historian_Cycle from './implementations/Historian_Cycle';
import Historian_BlackSwan from './implementations/Historian_BlackSwan';
import Historian_Renaissance from './implementations/Historian_Renaissance';
import Historian_Ruins from './implementations/Historian_Ruins';
import Historian_Pendulum from './implementations/Historian_Pendulum';
import Historian_GoldenAge from './implementations/Historian_GoldenAge';
import Historian_FourthTurning from './implementations/Historian_FourthTurning';
import Historian_Zeitgeist from './implementations/Historian_Zeitgeist';
import Historian_HistorianSeal from './implementations/Historian_HistorianSeal';

// ── Game Designer Collection (default exports, S140) ────────────────────
import GameDesigner_InfiniteGame from './implementations/GameDesigner_InfiniteGame';
import GameDesigner_IncentiveStructure from './implementations/GameDesigner_IncentiveStructure';
import GameDesigner_Mod from './implementations/GameDesigner_Mod';
import GameDesigner_NPC from './implementations/GameDesigner_NPC';
import GameDesigner_LevelUp from './implementations/GameDesigner_LevelUp';
import GameDesigner_BossFight from './implementations/GameDesigner_BossFight';
import GameDesigner_SavePoint from './implementations/GameDesigner_SavePoint';
import GameDesigner_ExpansionPack from './implementations/GameDesigner_ExpansionPack';
import GameDesigner_GodMode from './implementations/GameDesigner_GodMode';
import GameDesigner_AtlasSeal from './implementations/GameDesigner_AtlasSeal';

// =====================================================================
// LOOKUP MAP — normalised form+mechanism+kbe → component
// =====================================================================

/**
 * Normalise a database string for lookup.
 * "Parts Rollcall" → "partsrollcall"
 * "Self-Compassion" → "selfcompassion"
 * "Behavioral Activation" → "behavioralactivation"
 */
function norm(s: string | undefined | null): string {
  if (!s) return '';
  return s.replace(/[\s\-_]/g, '').toLowerCase();
}

/**
 * Normalise KBE layer from DB full words to short codes.
 * DB stores "believing" / "embodying" / "knowing"
 * BESPOKE_MAP uses "B" / "E" / "K"
 */
function normKbe(kbe: string | undefined | null): string {
  if (!kbe) return '';
  const lower = kbe.toLowerCase().trim();
  if (lower === 'believing' || lower === 'b') return 'b';
  if (lower === 'embodying' || lower === 'e') return 'e';
  if (lower === 'knowing' || lower === 'k') return 'k';
  return norm(kbe); // fallback
}

function buildKey(form: string, mechanism: string, kbe: string): string {
  return `${norm(form)}|${norm(mechanism)}|${norm(kbe)}`;
}

/**
 * Build lookup key from DB record — uses normKbe for the kbe_layer field
 * because DB stores full words ("believing"/"embodying") but BESPOKE_MAP uses "B"/"E"
 */
function buildLookupKey(form: string, mechanism: string, kbe: string): string {
  return `${norm(form)}|${norm(mechanism)}|${normKbe(kbe)}`;
}

/**
 * Each entry maps to the default-exported component that accepts:
 *   { primary_prompt: string; cta_primary: string; onComplete?: () => void }
 */
const BESPOKE_MAP: Record<string, React.ComponentType<any>> = {
  // ── Mirror ──
  [buildKey('Mirror', 'Behavioral Activation', 'B')]: Mirror_Integrate_BehavioralActivation_B,
  [buildKey('Mirror', 'Behavioral Activation', 'E')]: Mirror_Integrate_BehavioralActivation_E,
  [buildKey('Mirror', 'Exposure', 'B')]: Mirror_Integrate_Exposure_B,
  [buildKey('Mirror', 'Exposure', 'E')]: Mirror_Integrate_Exposure_E,
  [buildKey('Mirror', 'Metacognition', 'B')]: Mirror_Integrate_Metacognition_B,
  [buildKey('Mirror', 'Self-Compassion', 'B')]: Mirror_Integrate_SelfCompassion_B,
  [buildKey('Mirror', 'Self-Compassion', 'E')]: Mirror_Integrate_SelfCompassion_E,
  [buildKey('Mirror', 'Values Clarification', 'B')]: Mirror_Integrate_ValuesClarification_B,
  [buildKey('Mirror', 'Values Clarification', 'E')]: Mirror_Integrate_ValuesClarification_E,

  // ── Parts Rollcall ──
  [buildKey('Parts Rollcall', 'Behavioral Activation', 'E')]: PartsRollcall_Integrate_BehavioralActivation_E,
  [buildKey('Parts Rollcall', 'Exposure', 'B')]: PartsRollcall_Integrate_Exposure_B,
  [buildKey('Parts Rollcall', 'Metacognition', 'B')]: PartsRollcall_Integrate_Metacognition_B,
  [buildKey('Parts Rollcall', 'Metacognition', 'E')]: PartsRollcall_Integrate_Metacognition_E,
  [buildKey('Parts Rollcall', 'Self-Compassion', 'B')]: PartsRollcall_Integrate_SelfCompassion_B,
  [buildKey('Parts Rollcall', 'Self-Compassion', 'E')]: PartsRollcall_Integrate_SelfCompassion_E,
  [buildKey('Parts Rollcall', 'Values Clarification', 'E')]: PartsRollcall_Integrate_ValuesClarification_E,

  // ── Practice ──
  [buildKey('Practice', 'Behavioral Activation', 'B')]: Practice_Integrate_BehavioralActivation_B,
  [buildKey('Practice', 'Behavioral Activation', 'E')]: Practice_Integrate_BehavioralActivation_E,
  [buildKey('Practice', 'Exposure', 'E')]: Practice_Integrate_Exposure_E,
  [buildKey('Practice', 'Metacognition', 'B')]: Practice_Integrate_Metacognition_B,
  [buildKey('Practice', 'Metacognition', 'E')]: Practice_Integrate_Metacognition_E,
  [buildKey('Practice', 'Self-Compassion', 'B')]: Practice_Integrate_SelfCompassion_B,
  [buildKey('Practice', 'Self-Compassion', 'E')]: Practice_Integrate_SelfCompassion_E,
  [buildKey('Practice', 'Values Clarification', 'E')]: Practice_Integrate_ValuesClarification_E,

  // ── Probe ──
  [buildKey('Probe', 'Behavioral Activation', 'B')]: Probe_Integrate_BehavioralActivation_B,
  [buildKey('Probe', 'Behavioral Activation', 'E')]: Probe_Integrate_BehavioralActivation_E,
  [buildKey('Probe', 'Exposure', 'B')]: Probe_Integrate_Exposure_B,
  [buildKey('Probe', 'Exposure', 'E')]: Probe_Integrate_Exposure_E,
  [buildKey('Probe', 'Metacognition', 'E')]: Probe_Integrate_Metacognition_E,
  [buildKey('Probe', 'Self-Compassion', 'B')]: Probe_Integrate_SelfCompassion_B,
  [buildKey('Probe', 'Values Clarification', 'B')]: Probe_Integrate_ValuesClarification_B,

  // ── Key ──
  [buildKey('Key', 'Behavioral Activation', 'B')]: Key_Integrate_BehavioralActivation_B,
  [buildKey('Key', 'Behavioral Activation', 'E')]: Key_Integrate_BehavioralActivation_E,
  [buildKey('Key', 'Exposure', 'E')]: Key_Integrate_Exposure_E,
  [buildKey('Key', 'Metacognition', 'B')]: Key_Integrate_Metacognition_B,
  [buildKey('Key', 'Metacognition', 'E')]: Key_Integrate_Metacognition_E,
  [buildKey('Key', 'Self-Compassion', 'B')]: Key_Integrate_SelfCompassion_B,
  [buildKey('Key', 'Values Clarification', 'E')]: Key_Integrate_ValuesClarification_E,

  // ── Inventory Spark ──
  [buildKey('Inventory Spark', 'Behavioral Activation', 'B')]: InventorySpark_Integrate_BehavioralActivation_B,
  [buildKey('Inventory Spark', 'Exposure', 'B')]: InventorySpark_Integrate_Exposure_B,
  [buildKey('Inventory Spark', 'Exposure', 'E')]: InventorySpark_Integrate_Exposure_E,
  [buildKey('Inventory Spark', 'Metacognition', 'E')]: InventorySpark_Integrate_Metacognition_E,
  [buildKey('Inventory Spark', 'Self-Compassion', 'B')]: InventorySpark_Integrate_SelfCompassion_B,
  [buildKey('Inventory Spark', 'Self-Compassion', 'E')]: InventorySpark_Integrate_SelfCompassion_E,
  [buildKey('Inventory Spark', 'Values Clarification', 'B')]: InventorySpark_Integrate_ValuesClarification_B,
};

// Count for debug
const BESPOKE_COUNT = Object.keys(BESPOKE_MAP).length;

// =====================================================================
// Identity Koan typeId → component map
// =====================================================================
const IDENTITY_KOAN_MAP: Record<string, React.ComponentType<any>> = {
  'nct__integrate__mirror_probe_reframe_practice_transfer_seal__identity_koan__exposure__b': Exposure_IdentityKoan_Integrate_B,
  'nct__integrate__mirror_probe_reframe_practice_transfer_seal__identity_koan__metacognition__e': Metacognition_IdentityKoan_Integrate_E,
  'nct__integrate__mirror_probe_reframe_practice_transfer_seal__identity_koan__self_compassion__b': SelfCompassion_IdentityKoan_Integrate_B,
  'nct__integrate__mirror_probe_reframe_practice_transfer_seal__identity_koan__self_compassion__e': SelfCompassion_IdentityKoan_Integrate_E,
  'nct__integrate__mirror_probe_reframe_practice_transfer_seal__identity_koan__values_clarification__b': ValuesClarification_IdentityKoan_Integrate_B,
};


// =====================================================================
// Novice Collection typeId → component map
// =====================================================================
const NOVICE_MAP: Record<string, React.ComponentType<any>> = {
  'lab__novice__pattern_glitch': Novice_PatternGlitch,
  'lab__novice__somatic_sigh': Novice_SomaticSigh,
  'lab__novice__witness_window': Novice_WitnessWindow,
  'lab__novice__permission_slip': Novice_PermissionSlip,
  'lab__novice__paradox_key': Novice_ParadoxKey,
  'lab__novice__reality_anchor': Novice_RealityAnchor,
  'lab__novice__micro_proof': Novice_MicroProof,
  'lab__novice__value_compass': Novice_ValueCompass,
  'lab__novice__future_simulation': Novice_FutureSimulation,
  'lab__novice__connection_thread': Novice_ConnectionThread,
};

// =====================================================================
// Alchemist Collection typeId → component map
// =====================================================================
const ALCHEMIST_MAP: Record<string, React.ComponentType<any>> = {
  'lab__alchemist__craving_surf': Alchemist_CravingSurf,
  'lab__alchemist__story_edit': Alchemist_StoryEdit,
  'lab__alchemist__time_telescope': Alchemist_TimeTelescope,
  'lab__alchemist__shadow_hug': Alchemist_ShadowHug,
  'lab__alchemist__meaning_mine': Alchemist_MeaningMine,
  'lab__alchemist__energy_transmute': Alchemist_EnergyTransmute,
  'lab__alchemist__council_of_elders': Alchemist_CouncilOfElders,
  'lab__alchemist__fact_checker': Alchemist_FactChecker,
  'lab__alchemist__gratitude_sniper': Alchemist_GratitudeSniper,
  'lab__alchemist__identity_vote': Alchemist_IdentityVote,
};

// =====================================================================
// Architect Collection typeId → component map
// =====================================================================
const ARCHITECT_MAP: Record<string, React.ComponentType<any>> = {
  'lab__architect__boundary_brick': Architect_BoundaryBrick,
  'lab__architect__connection_bridge': Architect_ConnectionBridge,
  'lab__architect__micro_yes': Architect_MicroYes,
  'lab__architect__environment_sweep': Architect_EnvironmentSweep,
  'lab__architect__mirror_gaze': Architect_MirrorGaze,
  'lab__architect__friction_remover': Architect_FrictionRemover,
  'lab__architect__value_stake': Architect_ValueStake,
  'lab__architect__vulnerability_drop': Architect_VulnerabilityDrop,
  'lab__architect__generosity_loop': Architect_GenerosityLoop,
  'lab__architect__identity_seal': Architect_IdentitySeal,
};

// =====================================================================
// Navigator Collection typeId → component map
// =====================================================================
const NAVIGATOR_MAP: Record<string, React.ComponentType<any>> = {
  'lab__navigator__tempo_dial': Navigator_TempoDial,
  'lab__navigator__friction_converter': Navigator_FrictionConverter,
  'lab__navigator__intuition_ping': Navigator_IntuitionPing,
  'lab__navigator__repair_stitch': Navigator_RepairStitch,
  'lab__navigator__drift_correction': Navigator_DriftCorrection,
  'lab__navigator__spotlight_shift': Navigator_SpotlightShift,
  'lab__navigator__doubt_detox': Navigator_DoubtDetox,
  'lab__navigator__joy_snap': Navigator_JoySnap,
  'lab__navigator__values_jam': Navigator_ValuesJam,
  'lab__navigator__flow_trigger': Navigator_FlowTrigger,
};

// =====================================================================
// Sage Collection typeId → component map
// =====================================================================
const SAGE_MAP: Record<string, React.ComponentType<any>> = {
  'lab__sage__ego_zoom': Sage_EgoZoom,
  'lab__sage__generational_lens': Sage_GenerationalLens,
  'lab__sage__empty_boat': Sage_EmptyBoat,
  'lab__sage__silence_soak': Sage_SilenceSoak,
  'lab__sage__compassion_core': Sage_CompassionCore,
  'lab__sage__mortality_check': Sage_MortalityCheck,
  'lab__sage__ripple_watch': Sage_RippleWatch,
  'lab__sage__universal_breath': Sage_UniversalBreath,
  'lab__sage__love_broadcast': Sage_LoveBroadcast,
  'lab__sage__legacy_stamp': Sage_LegacyStamp,
};

// =====================================================================
// Mender Collection typeId → component map
// =====================================================================
const MENDER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__mender__kintsugi_file': Mender_KintsugiFile,
  'lab__mender__shame_scrum': Mender_ShameScrum,
  'lab__mender__data_harvest': Mender_DataHarvest,
  'lab__mender__forgiveness_loop': Mender_ForgivenessLoop,
  'lab__mender__reset_button': Mender_ResetButton,
  'lab__mender__vulnerability_vow': Mender_VulnerabilityVow,
  'lab__mender__dust_off': Mender_DustOff,
  'lab__mender__guardrail_build': Mender_GuardrailBuild,
  'lab__mender__body_scan_damage': Mender_BodyScanDamage,
  'lab__mender__re_commitment': Mender_ReCommitment,
};

// =====================================================================
// Diplomat Collection typeId → component map
// =====================================================================
const DIPLOMAT_MAP: Record<string, React.ComponentType<any>> = {
  'lab__diplomat__mirror_shield': Diplomat_MirrorShield,
  'lab__diplomat__truce_table': Diplomat_TruceTable,
  'lab__diplomat__perspective_swap': Diplomat_PerspectiveSwap,
  'lab__diplomat__peace_thread': Diplomat_PeaceThread,
  'lab__diplomat__translator': Diplomat_Translator,
  'lab__diplomat__boundary_dance': Diplomat_BoundaryDance,
  'lab__diplomat__empathy_bridge': Diplomat_EmpathyBridge,
  'lab__diplomat__de_escalation': Diplomat_DeEscalation,
  'lab__diplomat__common_ground': Diplomat_CommonGround,
  'lab__diplomat__sangha_search': Diplomat_SanghaSearch,
};

// =====================================================================
// Weaver Collection typeId → component map
// =====================================================================
const WEAVER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__weaver__thread_map': Weaver_ThreadMap,
  'lab__weaver__story_loom': Weaver_StoryLoom,
  'lab__weaver__contradiction_hold': Weaver_ContradictionHold,
  'lab__weaver__pattern_break': Weaver_PatternBreak,
  'lab__weaver__meaning_weave': Weaver_MeaningWeave,
  'lab__weaver__integration_spiral': Weaver_IntegrationSpiral,
  'lab__weaver__complexity_breath': Weaver_ComplexityBreath,
  'lab__weaver__bridge_of_opposites': Weaver_BridgeOfOpposites,
  'lab__weaver__witness_weave': Weaver_WitnessWeave,
  'lab__weaver__tapestry_seal': Weaver_TapestrySeal,
};

// =====================================================================
// Visionary Collection typeId → component map
// =====================================================================
const VISIONARY_MAP: Record<string, React.ComponentType<any>> = {
  'lab__visionary__horizon_scan': Visionary_HorizonScan,
  'lab__visionary__seed_vault': Visionary_SeedVault,
  'lab__visionary__possibility_prism': Visionary_PossibilityPrism,
  'lab__visionary__fear_telescope': Visionary_FearTelescope,
  'lab__visionary__dream_audit': Visionary_DreamAudit,
  'lab__visionary__time_capsule': Visionary_TimeCapsule,
  'lab__visionary__obstacle_flip': Visionary_ObstacleFlip,
  'lab__visionary__vision_board': Visionary_VisionBoard,
  'lab__visionary__courage_map': Visionary_CourageMap,
  'lab__visionary__becoming_seal': Visionary_BecomingSeal,
};

// =====================================================================
// Luminary Collection typeId → component map
// =====================================================================
const LUMINARY_MAP: Record<string, React.ComponentType<any>> = {
  'lab__luminary__torch_pass': Luminary_TorchPass,
  'lab__luminary__ripple_seed': Luminary_RippleSeed,
  'lab__luminary__legacy_letter': Luminary_LegacyLetter,
  'lab__luminary__gratitude_broadcast': Luminary_GratitudeBroadcast,
  'lab__luminary__mentor_mirror': Luminary_MentorMirror,
  'lab__luminary__service_compass': Luminary_ServiceCompass,
  'lab__luminary__generosity_engine': Luminary_GenerosityEngine,
  'lab__luminary__purpose_pulse': Luminary_PurposePulse,
  'lab__luminary__dark_light': Luminary_DarkLight,
  'lab__luminary__constellation_seal': Luminary_ConstellationSeal,
};

// =====================================================================
// Hacker Collection typeId → component map
// =====================================================================
const HACKER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__hacker__label_peeler': Hacker_LabelPeeler,
  'lab__hacker__status_glitch': Hacker_StatusGlitch,
  'lab__hacker__algorithm_jammer': Hacker_AlgorithmJammer,
  'lab__hacker__mimetic_check': Hacker_MimeticCheck,
  'lab__hacker__sunk_cost_cut': Hacker_SunkCostCut,
  'lab__hacker__script_burn': Hacker_ScriptBurn,
  'lab__hacker__attention_paywall': Hacker_AttentionPaywall,
  'lab__hacker__role_reject': Hacker_RoleReject,
  'lab__hacker__should_deleter': Hacker_ShouldDeleter,
  'lab__hacker__source_code': Hacker_SourceCode,
};

// =====================================================================
// Chrononaut Collection typeId → component map
// =====================================================================
const CHRONONAUT_MAP: Record<string, React.ComponentType<any>> = {
  'lab__chrononaut__memory_remix': Chrononaut_MemoryRemix,
  'lab__chrononaut__deep_time': Chrononaut_DeepTime,
  'lab__chrononaut__slow_motion_day': Chrononaut_SlowMotionDay,
  'lab__chrononaut__future_visitor': Chrononaut_FutureVisitor,
  'lab__chrononaut__patience_muscle': Chrononaut_PatienceMuscle,
  'lab__chrononaut__urgency_deleter': Chrononaut_UrgencyDeleter,
  'lab__chrononaut__regret_reversal': Chrononaut_RegretReversal,
  'lab__chrononaut__ancestral_blink': Chrononaut_AncestralBlink,
  'lab__chrononaut__loop_spotter': Chrononaut_LoopSpotter,
  'lab__chrononaut__eternal_instant': Chrononaut_EternalInstant,
};

// =====================================================================
// Mycelium Collection typeId → component map
// =====================================================================
const MYCELIUM_MAP: Record<string, React.ComponentType<any>> = {
  'lab__mycelium__invisible_thread': Mycelium_InvisibleThread,
  'lab__mycelium__hive_mind': Mycelium_HiveMind,
  'lab__mycelium__symbiosis_check': Mycelium_SymbiosisCheck,
  'lab__mycelium__root_share': Mycelium_RootShare,
  'lab__mycelium__signal_pulse': Mycelium_SignalPulse,
  'lab__mycelium__mirror_neuron': Mycelium_MirrorNeuron,
  'lab__mycelium__wide_net': Mycelium_WideNet,
  'lab__mycelium__common_ground': Mycelium_CommonGround,
  'lab__mycelium__dunbar_sorter': Mycelium_DunbarSorter,
  'lab__mycelium__mycelial_map': Mycelium_MycelialMap,
};

// =====================================================================
// Aesthete Collection typeId → component map
// =====================================================================
const AESTHETE_MAP: Record<string, React.ComponentType<any>> = {
  'lab__aesthete__golden_ratio': Aesthete_GoldenRatio,
  'lab__aesthete__color_soak': Aesthete_ColorSoak,
  'lab__aesthete__wabi_sabi': Aesthete_WabiSabi,
  'lab__aesthete__negative_space': Aesthete_NegativeSpace,
  'lab__aesthete__texture_touch': Aesthete_TextureTouch,
  'lab__aesthete__design_edit': Aesthete_DesignEdit,
  'lab__aesthete__sound_bath': Aesthete_SoundBath,
  'lab__aesthete__light_sculpt': Aesthete_LightSculpt,
  'lab__aesthete__taste_savor': Aesthete_TasteSavor,
  'lab__aesthete__masterpiece_frame': Aesthete_MasterpieceFrame,
};

// =====================================================================
// Elemental Collection typeId → component map
// =====================================================================
const ELEMENTAL_MAP: Record<string, React.ComponentType<any>> = {
  'lab__elemental__fire_gaze': Elemental_FireGaze,
  'lab__elemental__water_float': Elemental_WaterFloat,
  'lab__elemental__wind_shear': Elemental_WindShear,
  'lab__elemental__stone_hold': Elemental_StoneHold,
  'lab__elemental__ice_shock': Elemental_IceShock,
  'lab__elemental__root_drop': Elemental_RootDrop,
  'lab__elemental__thunder_gap': Elemental_ThunderGap,
  'lab__elemental__river_flow': Elemental_RiverFlow,
  'lab__elemental__salt_cleanse': Elemental_SaltCleanse,
  'lab__elemental__elementalist_seal': Elemental_ElementalistSeal,
};

// =====================================================================
// Phenomenologist Collection typeId → component map
// =====================================================================
const PHENOMENOLOGIST_MAP: Record<string, React.ComponentType<any>> = {
  'lab__phenomenologist__raw_data': Phenomenologist_RawData,
  'lab__phenomenologist__audio_zoom': Phenomenologist_AudioZoom,
  'lab__phenomenologist__blind_walk': Phenomenologist_BlindWalk,
  'lab__phenomenologist__taste_explode': Phenomenologist_TasteExplode,
  'lab__phenomenologist__temperature_scan': Phenomenologist_TemperatureScan,
  'lab__phenomenologist__proprioception_check': Phenomenologist_ProprioceptionCheck,
  'lab__phenomenologist__color_deconstruct': Phenomenologist_ColorDeconstruct,
  'lab__phenomenologist__olfactory_hunt': Phenomenologist_OlfactoryHunt,
  'lab__phenomenologist__micro_texture': Phenomenologist_MicroTexture,
  'lab__phenomenologist__perception_seal': Phenomenologist_PerceptionSeal,
};

// =====================================================================
// Alchemist II Collection typeId → component map
// =====================================================================
const ALCHEMISTII_MAP: Record<string, React.ComponentType<any>> = {
  'lab__alchemistii__anger_forge': AlchemistII_AngerForge,
  'lab__alchemistii__grief_garden': AlchemistII_GriefGarden,
  'lab__alchemistii__fear_fuel': AlchemistII_FearFuel,
  'lab__alchemistii__envy_map': AlchemistII_EnvyMap,
  'lab__alchemistii__boredom_portal': AlchemistII_BoredomPortal,
  'lab__alchemistii__anxiety_anchor': AlchemistII_AnxietyAnchor,
  'lab__alchemistii__regret_compost': AlchemistII_RegretCompost,
  'lab__alchemistii__shame_solvent': AlchemistII_ShameSolvent,
  'lab__alchemistii__rejection_ricochet': AlchemistII_RejectionRicochet,
  'lab__alchemistii__alchemy_seal': AlchemistII_AlchemySeal,
};

// =====================================================================
// Servant Leader Collection typeId → component map
// =====================================================================
const SERVANTLEADER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__servantleader__ego_check': ServantLeader_EgoCheck,
  'lab__servantleader__power_transfer': ServantLeader_PowerTransfer,
  'lab__servantleader__silence_of_command': ServantLeader_SilenceOfCommand,
  'lab__servantleader__praise_laser': ServantLeader_PraiseLaser,
  'lab__servantleader__responsibility_take': ServantLeader_ResponsibilityTake,
  'lab__servantleader__vision_cast': ServantLeader_VisionCast,
  'lab__servantleader__servant_bow': ServantLeader_ServantBow,
  'lab__servantleader__conflict_dissolve': ServantLeader_ConflictDissolve,
  'lab__servantleader__quiet_mentor': ServantLeader_QuietMentor,
  'lab__servantleader__leader_seal': ServantLeader_LeaderSeal,
};

// =====================================================================
// Omega Point Collection typeId → component map
// =====================================================================
const OMEGAPOINT_MAP: Record<string, React.ComponentType<any>> = {
  'lab__omegapoint__dot_connector': OmegaPoint_DotConnector,
  'lab__omegapoint__binary_breaker': OmegaPoint_BinaryBreaker,
  'lab__omegapoint__return_to_zero': OmegaPoint_ReturnToZero,
  'lab__omegapoint__synthesis': OmegaPoint_Synthesis,
  'lab__omegapoint__system_view': OmegaPoint_SystemView,
  'lab__omegapoint__paradox_hold': OmegaPoint_ParadoxHold,
  'lab__omegapoint__pattern_match': OmegaPoint_PatternMatch,
  'lab__omegapoint__fourth_wall': OmegaPoint_FourthWall,
  'lab__omegapoint__omega_pulse': OmegaPoint_OmegaPulse,
  'lab__omegapoint__convergence_seal': OmegaPoint_ConvergenceSeal,
};

// =====================================================================
// Source Collection typeId → component map
// =====================================================================
const SOURCE_MAP: Record<string, React.ComponentType<any>> = {
  'lab__source__i_am': Source_IAm,
  'lab__source__stardust_check': Source_StardustCheck,
  'lab__source__final_breath': Source_FinalBreath,
  'lab__source__unity': Source_Unity,
  'lab__source__infinite_loop': Source_InfiniteLoop,
  'lab__source__awakening': Source_Awakening,
  'lab__source__void': Source_Void,
  'lab__source__light_body': Source_LightBody,
  'lab__source__universal_hum': Source_UniversalHum,
  'lab__source__source_seal': Source_SourceSeal,
};

// =====================================================================
// Stoic Collection typeId → component map
// =====================================================================
const STOIC_MAP: Record<string, React.ComponentType<any>> = {
  'lab__stoic__citadel_visualization': Stoic_CitadelVisualization,
  'lab__stoic__voluntary_discomfort': Stoic_VoluntaryDiscomfort,
  'lab__stoic__view_from_above': Stoic_ViewFromAbove,
  'lab__stoic__negative_visualization': Stoic_NegativeVisualization,
  'lab__stoic__control_dichotomy': Stoic_ControlDichotomy,
  'lab__stoic__obstacle_flip': Stoic_ObstacleFlip,
  'lab__stoic__memento_mori': Stoic_MementoMori,
  'lab__stoic__inner_citadel': Stoic_InnerCitadel,
  'lab__stoic__amor_fati': Stoic_AmorFati,
  'lab__stoic__stoic_seal': Stoic_StoicSeal,
};

// =====================================================================
// Lover Collection typeId → component map
// =====================================================================
const LOVER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__lover__armor_drop': Lover_ArmorDrop,
  'lab__lover__30_second_gaze': Lover_30SecondGaze,
  'lab__lover__desire_audit': Lover_DesireAudit,
  'lab__lover__sacred_touch': Lover_SacredTouch,
  'lab__lover__listening_ear': Lover_ListeningEar,
  'lab__lover__jealousy_transmute': Lover_JealousyTransmute,
  'lab__lover__secret_share': Lover_SecretShare,
  'lab__lover__sex_spirit_bridge': Lover_SexSpiritBridge,
  'lab__lover__partner_breath': Lover_PartnerBreath,
  'lab__lover__union_seal': Lover_UnionSeal,
};

// =====================================================================
// Athlete Collection typeId → component map
// =====================================================================
const ATHLETE_MAP: Record<string, React.ComponentType<any>> = {
  'lab__athlete__oxygen_flood': Athlete_OxygenFlood,
  'lab__athlete__fascia_release': Athlete_FasciaRelease,
  'lab__athlete__movement_snack': Athlete_MovementSnack,
  'lab__athlete__sleep_gate': Athlete_SleepGate,
  'lab__athlete__cold_shock': Athlete_ColdShock,
  'lab__athlete__fuel_check': Athlete_FuelCheck,
  'lab__athlete__posture_reset': Athlete_PostureReset,
  'lab__athlete__pain_cave': Athlete_PainCave,
  'lab__athlete__heart_coherence': Athlete_HeartCoherence,
  'lab__athlete__vitality_seal': Athlete_VitalitySeal,
};

// =====================================================================
// Strategist Collection typeId → component map
// =====================================================================
const STRATEGIST_MAP: Record<string, React.ComponentType<any>> = {
  'lab__strategist__value_exchange': Strategist_ValueExchange,
  'lab__strategist__essentialism_filter': Strategist_EssentialismFilter,
  'lab__strategist__compound_interest': Strategist_CompoundInterest,
  'lab__strategist__deep_work_bunker': Strategist_DeepWorkBunker,
  'lab__strategist__negotiation_pause': Strategist_NegotiationPause,
  'lab__strategist__abundance_scan': Strategist_AbundanceScan,
  'lab__strategist__leverage_lever': Strategist_LeverageLever,
  'lab__strategist__specific_knowledge': Strategist_SpecificKnowledge,
  'lab__strategist__permissionless_build': Strategist_PermissionlessBuild,
  'lab__strategist__wealth_seal': Strategist_WealthSeal,
};

// =====================================================================
// Wilding Collection typeId → component map
// =====================================================================
const WILDING_MAP: Record<string, React.ComponentType<any>> = {
  'lab__wilding__cold_switch': Wilding_ColdSwitch,
  'lab__wilding__fire_watch': Wilding_FireWatch,
  'lab__wilding__panoramic_soften': Wilding_PanoramicSoften,
  'lab__wilding__terpene_inhale': Wilding_TerpeneInhale,
  'lab__wilding__lunar_pull': Wilding_LunarPull,
  'lab__wilding__dark_anchor': Wilding_DarkAnchor,
  'lab__wilding__barefoot_step': Wilding_BarefootStep,
  'lab__wilding__storm_breathe': Wilding_StormBreathe,
  'lab__wilding__feral_howl': Wilding_FeralHowl,
  'lab__wilding__wild_seal': Wilding_WildSeal,
};

// =====================================================================
// Guardian Collection typeId → component map
// =====================================================================
const GUARDIAN_MAP: Record<string, React.ComponentType<any>> = {
  'lab__guardian__big_feeling': Guardian_BigFeeling,
  'lab__guardian__co_regulation_breath': Guardian_CoRegulationBreath,
  'lab__guardian__good_enough': Guardian_GoodEnough,
  'lab__guardian__repair_ritual': Guardian_RepairRitual,
  'lab__guardian__transition_buffer': Guardian_TransitionBuffer,
  'lab__guardian__boundary_hug': Guardian_BoundaryHug,
  'lab__guardian__safe_container': Guardian_SafeContainer,
  'lab__guardian__gentle_no': Guardian_GentleNo,
  'lab__guardian__bedtime_blessing': Guardian_BedtimeBlessing,
  'lab__guardian__guardian_seal': Guardian_GuardianSeal,
};

// =====================================================================
// Futurist Collection typeId → component map
// =====================================================================
const FUTURIST_MAP: Record<string, React.ComponentType<any>> = {
  'lab__futurist__notification_nuke': Futurist_NotificationNuke,
  'lab__futurist__input_diet': Futurist_InputDiet,
  'lab__futurist__human_handshake': Futurist_HumanHandshake,
  'lab__futurist__doomscroll_brake': Futurist_DoomscrollBrake,
  'lab__futurist__analog_switch': Futurist_AnalogSwitch,
  'lab__futurist__deep_read': Futurist_DeepRead,
  'lab__futurist__phantom_check': Futurist_PhantomCheck,
  'lab__futurist__mono_task': Futurist_MonoTask,
  'lab__futurist__comparison_blocker': Futurist_ComparisonBlocker,
  'lab__futurist__disconnect_seal': Futurist_DisconnectSeal,
};

// =====================================================================
// Mystic Collection typeId → component map
// =====================================================================
const MYSTIC_MAP: Record<string, React.ComponentType<any>> = {
  'lab__mystic__no_self': Mystic_NoSelf,
  'lab__mystic__now_point': Mystic_NowPoint,
  'lab__mystic__deathbed': Mystic_Deathbed,
  'lab__mystic__entanglement_check': Mystic_EntanglementCheck,
  'lab__mystic__wave_collapse': Mystic_WaveCollapse,
  'lab__mystic__hologram': Mystic_Hologram,
  'lab__mystic__frequency_tune': Mystic_FrequencyTune,
  'lab__mystic__maya_veil': Mystic_MayaVeil,
  'lab__mystic__universal_hum': Mystic_UniversalHum,
  'lab__mystic__mystic_seal': Mystic_MysticSeal,
};

// =====================================================================
// Infinite Player Collection typeId → component map
// =====================================================================
const INFINITE_MAP: Record<string, React.ComponentType<any>> = {
  'lab__infinite__cosmic_joke': Infinite_CosmicJoke,
  'lab__infinite__absurdity_check': Infinite_AbsurdityCheck,
  'lab__infinite__game_reset': Infinite_GameReset,
  'lab__infinite__dance_break': Infinite_DanceBreak,
  'lab__infinite__beginners_mind': Infinite_BeginnersMind,
  'lab__infinite__pure_yes': Infinite_PureYes,
  'lab__infinite__wonder_walk': Infinite_WonderWalk,
  'lab__infinite__unplanned_hour': Infinite_UnplannedHour,
  'lab__infinite__laugh_track': Infinite_LaughTrack,
  'lab__infinite__infinite_seal': Infinite_InfiniteSeal,
};

// =====================================================================
// Reality Bender Collection typeId → component map
// =====================================================================
const BENDER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__bender__reality_distortion': Bender_RealityDistortion,
  'lab__bender__timeline_jump': Bender_TimelineJump,
  'lab__bender__luck_surface': Bender_LuckSurface,
  'lab__bender__atmosphere_engineer': Bender_AtmosphereEngineer,
  'lab__bender__narrative_override': Bender_NarrativeOverride,
  'lab__bender__future_memory': Bender_FutureMemory,
  'lab__bender__silence_weapon': Bender_SilenceWeapon,
  'lab__bender__invisible_hand': Bender_InvisibleHand,
  'lab__bender__belief_bridge': Bender_BeliefBridge,
  'lab__bender__bender_seal': Bender_BenderSeal,
};

// =====================================================================
// Magnet Collection typeId → component map
// =====================================================================
const MAGNET_MAP: Record<string, React.ComponentType<any>> = {
  'lab__magnet__reverse_orbit': Magnet_ReverseOrbit,
  'lab__magnet__mystery_gap': Magnet_MysteryGap,
  'lab__magnet__whisper_frequency': Magnet_WhisperFrequency,
  'lab__magnet__velvet_rope': Magnet_VelvetRope,
  'lab__magnet__specific_praise': Magnet_SpecificPraise,
  'lab__magnet__warmth_competence': Magnet_WarmthCompetence,
  'lab__magnet__lighthouse_mode': Magnet_LighthouseMode,
  'lab__magnet__yes_and_spiral': Magnet_YesAndSpiral,
  'lab__magnet__detachment_power': Magnet_DetachmentPower,
  'lab__magnet__magnet_seal': Magnet_MagnetSeal,
};

// =====================================================================
// Oracle Collection typeId → component map
// =====================================================================
const ORACLE_MAP: Record<string, React.ComponentType<any>> = {
  'lab__oracle__pattern_before_pattern': Oracle_PatternBeforePattern,
  'lab__oracle__body_compass': Oracle_BodyCompass,
  'lab__oracle__first_three_seconds': Oracle_FirstThreeSeconds,
  'lab__oracle__information_fast': Oracle_InformationFast,
  'lab__oracle__signal_in_noise': Oracle_SignalInNoise,
  'lab__oracle__danger_beautiful': Oracle_DangerBeautiful,
  'lab__oracle__question_upgrade': Oracle_QuestionUpgrade,
  'lab__oracle__pre_mortem': Oracle_PreMortem,
  'lab__oracle__contrarian_proof': Oracle_ContrarianProof,
  'lab__oracle__oracle_seal': Oracle_OracleSeal,
};

// =====================================================================
// Maestro Collection typeId → component map
// =====================================================================
const MAESTRO_MAP: Record<string, React.ComponentType<any>> = {
  'lab__maestro__crescendo': Maestro_Crescendo,
  'lab__maestro__pause_as_currency': Maestro_PauseAsCurrency,
  'lab__maestro__emotional_score': Maestro_EmotionalScore,
  'lab__maestro__stage_presence': Maestro_StagePresence,
  'lab__maestro__tempo_control': Maestro_TempoControl,
  'lab__maestro__mirror_match': Maestro_MirrorMatch,
  'lab__maestro__callback': Maestro_Callback,
  'lab__maestro__tension_arc': Maestro_TensionArc,
  'lab__maestro__standing_ovation': Maestro_StandingOvation,
  'lab__maestro__maestro_seal': Maestro_MaestroSeal,
};

// =====================================================================
// Shaman Collection typeId → component map
// =====================================================================
const SHAMAN_MAP: Record<string, React.ComponentType<any>> = {
  'lab__shaman__ancestor_call': Shaman_AncestorCall,
  'lab__shaman__plant_medicine': Shaman_PlantMedicine,
  'lab__shaman__drum_circle': Shaman_DrumCircle,
  'lab__shaman__sacred_fire': Shaman_SacredFire,
  'lab__shaman__bone_reading': Shaman_BoneReading,
  'lab__shaman__shadow_walk': Shaman_ShadowWalk,
  'lab__shaman__water_blessing': Shaman_WaterBlessing,
  'lab__shaman__spirit_animal': Shaman_SpiritAnimal,
  'lab__shaman__vision_quest': Shaman_VisionQuest,
  'lab__shaman__shaman_seal': Shaman_ShamanSeal,
};

// =====================================================================
// Stargazer Collection typeId → component map
// =====================================================================
const STARGAZER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__stargazer__north_star': Stargazer_NorthStar,
  'lab__stargazer__orbit_check': Stargazer_OrbitCheck,
  'lab__stargazer__gravity_assist': Stargazer_GravityAssist,
  'lab__stargazer__eclipse': Stargazer_Eclipse,
  'lab__stargazer__constellation': Stargazer_Constellation,
  'lab__stargazer__event_horizon': Stargazer_EventHorizon,
  'lab__stargazer__supernova': Stargazer_Supernova,
  'lab__stargazer__dark_matter': Stargazer_DarkMatter,
  'lab__stargazer__light_speed': Stargazer_LightSpeed,
  'lab__stargazer__stargazer_seal': Stargazer_StargazerSeal,
};

// =====================================================================
// Myth Maker Collection typeId → component map
// =====================================================================
const MYTHMAKER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__mythmaker__incantation': MythMaker_Incantation,
  'lab__mythmaker__retcon': MythMaker_Retcon,
  'lab__mythmaker__heros_call': MythMaker_HerosCall,
  'lab__mythmaker__villains_mask': MythMaker_VillainsMask,
  'lab__mythmaker__plot_twist': MythMaker_PlotTwist,
  'lab__mythmaker__mentor_summon': MythMaker_MentorSummon,
  'lab__mythmaker__chekhovs_gun': MythMaker_ChekhovsGun,
  'lab__mythmaker__fourth_wall': MythMaker_FourthWall,
  'lab__mythmaker__cliffhanger': MythMaker_Cliffhanger,
  'lab__mythmaker__mythic_seal': MythMaker_MythicSeal,
};

// =====================================================================
// Shape Shifter Collection typeId → component map
// =====================================================================
const SHAPESHIFTER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__shapeshifter__mirror_shift': ShapeShifter_MirrorShift,
  'lab__shapeshifter__skin_shed': ShapeShifter_SkinShed,
  'lab__shapeshifter__camouflage': ShapeShifter_Camouflage,
  'lab__shapeshifter__metamorphosis': ShapeShifter_Metamorphosis,
  'lab__shapeshifter__doppelganger': ShapeShifter_Doppelganger,
  'lab__shapeshifter__costume': ShapeShifter_Costume,
  'lab__shapeshifter__chimera': ShapeShifter_Chimera,
  'lab__shapeshifter__proteus': ShapeShifter_Proteus,
  'lab__shapeshifter__chrysalis': ShapeShifter_Chrysalis,
  'lab__shapeshifter__shifter_seal': ShapeShifter_ShifterSeal,
};

// =====================================================================
// Dream Walker Collection typeId → component map
// =====================================================================
const DREAMWALKER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__dreamwalker__lucid_entry': DreamWalker_LucidEntry,
  'lab__dreamwalker__sleep_architect': DreamWalker_SleepArchitect,
  'lab__dreamwalker__night_terrain': DreamWalker_NightTerrain,
  'lab__dreamwalker__sleep_paralysis': DreamWalker_SleepParalysis,
  'lab__dreamwalker__recurring_door': DreamWalker_RecurringDoor,
  'lab__dreamwalker__dream_journal': DreamWalker_DreamJournal,
  'lab__dreamwalker__somnambulant': DreamWalker_Somnambulant,
  'lab__dreamwalker__hypnagogic_edge': DreamWalker_HypnagogicEdge,
  'lab__dreamwalker__dream_symbol': DreamWalker_DreamSymbol,
  'lab__dreamwalker__walker_seal': DreamWalker_WalkerSeal,
};

// =====================================================================
// Magnum Opus Collection typeId → component map
// =====================================================================
const MAGNUMOPUS_MAP: Record<string, React.ComponentType<any>> = {
  'lab__magnumopus__prima_materia': MagnumOpus_PrimaMateria,
  'lab__magnumopus__crucible': MagnumOpus_Crucible,
  'lab__magnumopus__lead_to_gold': MagnumOpus_LeadToGold,
  'lab__magnumopus__philosophers_stone': MagnumOpus_PhilosophersStone,
  'lab__magnumopus__solve': MagnumOpus_Solve,
  'lab__magnumopus__coagula': MagnumOpus_Coagula,
  'lab__magnumopus__athanor': MagnumOpus_Athanor,
  'lab__magnumopus__tincture': MagnumOpus_Tincture,
  'lab__magnumopus__ouroboros': MagnumOpus_Ouroboros,
  'lab__magnumopus__opus_seal': MagnumOpus_OpusSeal,
};

// =====================================================================
// Prism Collection typeId → component map
// =====================================================================
const PRISM_MAP: Record<string, React.ComponentType<any>> = {
  'lab__prism__refraction': Prism_Refraction,
  'lab__prism__transparency': Prism_Transparency,
  'lab__prism__laser_focus': Prism_LaserFocus,
  'lab__prism__afterimage': Prism_Afterimage,
  'lab__prism__blind_spot': Prism_BlindSpot,
  'lab__prism__focal_length': Prism_FocalLength,
  'lab__prism__shadow_cast': Prism_ShadowCast,
  'lab__prism__bioluminescence': Prism_Bioluminescence,
  'lab__prism__infrared': Prism_Infrared,
  'lab__prism__prism_seal': Prism_PrismSeal,
};

// =====================================================================
// Graviton Collection typeId → component map
// =====================================================================
const GRAVITON_MAP: Record<string, React.ComponentType<any>> = {
  'lab__graviton__heavy_object': Graviton_HeavyObject,
  'lab__graviton__escape_velocity': Graviton_EscapeVelocity,
  'lab__graviton__binary_star': Graviton_BinaryStar,
  'lab__graviton__black_hole': Graviton_BlackHole,
  'lab__graviton__tidal_force': Graviton_TidalForce,
  'lab__graviton__inverse_square': Graviton_InverseSquare,
  'lab__graviton__center_of_mass': Graviton_CenterOfMass,
  'lab__graviton__roche_limit': Graviton_RocheLimit,
  'lab__graviton__dark_star': Graviton_DarkStar,
  'lab__graviton__gravity_seal': Graviton_GravitySeal,
};

// =====================================================================
// Observer Collection typeId → component map
// =====================================================================
const OBSERVER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__observer__schrodingers_box': Observer_SchrodingersBox,
  'lab__observer__wave_collapse': Observer_WaveCollapse,
  'lab__observer__spooky_action': Observer_SpookyAction,
  'lab__observer__quantum_tunnel': Observer_QuantumTunnel,
  'lab__observer__uncertainty_blur': Observer_UncertaintyBlur,
  'lab__observer__many_worlds': Observer_ManyWorlds,
  'lab__observer__retrocausality': Observer_Retrocausality,
  'lab__observer__zero_point': Observer_ZeroPoint,
  'lab__observer__double_slit': Observer_DoubleSlit,
  'lab__observer__observer_seal': Observer_ObserverSeal,
};

// =====================================================================
// TimeCapsule Collection typeId → component map
// =====================================================================
const TIMECAPSULE_MAP: Record<string, React.ComponentType<any>> = {
  'lab__timecapsule__open_when_seal': TimeCapsule_OpenWhenSeal,
  'lab__timecapsule__drift_bottle': TimeCapsule_DriftBottle,
  'lab__timecapsule__rage_vault': TimeCapsule_RageVault,
  'lab__timecapsule__prediction_stake': TimeCapsule_PredictionStake,
  'lab__timecapsule__success_jar': TimeCapsule_SuccessJar,
  'lab__timecapsule__ten_year_echo': TimeCapsule_TenYearEcho,
  'lab__timecapsule__crisis_kit': TimeCapsule_CrisisKit,
  'lab__timecapsule__wine_cellar': TimeCapsule_WineCellar,
  'lab__timecapsule__dead_mans_switch': TimeCapsule_DeadMansSwitch,
  'lab__timecapsule__capsule_seal': TimeCapsule_CapsuleSeal,
};

// =====================================================================
// LoopBreaker Collection typeId → component map
// =====================================================================
const LOOPBREAKER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__loopbreaker__iteration_counter': LoopBreaker_IterationCounter,
  'lab__loopbreaker__trigger_map': LoopBreaker_TriggerMap,
  'lab__loopbreaker__glitch_injection': LoopBreaker_GlitchInjection,
  'lab__loopbreaker__exit_ramp': LoopBreaker_ExitRamp,
  'lab__loopbreaker__reward_audit': LoopBreaker_RewardAudit,
  'lab__loopbreaker__double_loop': LoopBreaker_DoubleLoop,
  'lab__loopbreaker__spiral_check': LoopBreaker_SpiralCheck,
  'lab__loopbreaker__friction_add': LoopBreaker_FrictionAdd,
  'lab__loopbreaker__new_groove': LoopBreaker_NewGroove,
  'lab__loopbreaker__breaker_seal': LoopBreaker_BreakerSeal,
};

// =====================================================================
// RetroCausal Collection typeId → component map
// =====================================================================
const RETROCAUSAL_MAP: Record<string, React.ComponentType<any>> = {
  'lab__retrocausal__memory_rescore': RetroCausal_MemoryRescore,
  'lab__retrocausal__deleted_scene': RetroCausal_DeletedScene,
  'lab__retrocausal__prequel': RetroCausal_Prequel,
  'lab__retrocausal__color_grade': RetroCausal_ColorGrade,
  'lab__retrocausal__narrative_flip': RetroCausal_NarrativeFlip,
  'lab__retrocausal__forgiveness_filter': RetroCausal_ForgivenessFilter,
  'lab__retrocausal__time_travel_rescue': RetroCausal_TimeTravelRescue,
  'lab__retrocausal__metadata_edit': RetroCausal_MetadataEdit,
  'lab__retrocausal__ancestral_cut': RetroCausal_AncestralCut,
  'lab__retrocausal__retro_seal': RetroCausal_RetroSeal,
};

// =====================================================================
// Threshold Collection typeId → component map
// =====================================================================
const THRESHOLD_MAP: Record<string, React.ComponentType<any>> = {
  'lab__threshold__doorway': Threshold_Doorway,
  'lab__threshold__in_between': Threshold_InBetween,
  'lab__threshold__dawn_watch': Threshold_DawnWatch,
  'lab__threshold__breath_gap': Threshold_BreathGap,
  'lab__threshold__chrysalis_wait': Threshold_ChrysalisWait,
  'lab__threshold__tidal_zone': Threshold_TidalZone,
  'lab__threshold__question_mark': Threshold_QuestionMark,
  'lab__threshold__dusk_walk': Threshold_DuskWalk,
  'lab__threshold__hinge_point': Threshold_HingePoint,
  'lab__threshold__threshold_seal': Threshold_ThresholdSeal,
};

// =====================================================================
// Soma Collection typeId → component map
// =====================================================================
const SOMA_MAP: Record<string, React.ComponentType<any>> = {
  'lab__soma__body_radar': Soma_BodyRadar,
  'lab__soma__gut_signal': Soma_GutSignal,
  'lab__soma__skin_map': Soma_SkinMap,
  'lab__soma__pulse_reader': Soma_PulseReader,
  'lab__soma__joint_unlock': Soma_JointUnlock,
  'lab__soma__fascia_wave': Soma_FasciaWave,
  'lab__soma__voice_box': Soma_VoiceBox,
  'lab__soma__balance_point': Soma_BalancePoint,
  'lab__soma__cell_memory': Soma_CellMemory,
  'lab__soma__soma_seal': Soma_SomaSeal,
};

// =====================================================================
// Frequency Collection typeId → component map
// =====================================================================
const FREQUENCY_MAP: Record<string, React.ComponentType<any>> = {
  'lab__frequency__baseline_hum': Frequency_BaselineHum,
  'lab__frequency__dissonance_detector': Frequency_DissonanceDetector,
  'lab__frequency__harmony_map': Frequency_HarmonyMap,
  'lab__frequency__octave_jump': Frequency_OctaveJump,
  'lab__frequency__standing_wave': Frequency_StandingWave,
  'lab__frequency__interference_pattern': Frequency_InterferencePattern,
  'lab__frequency__overtone': Frequency_Overtone,
  'lab__frequency__phase_lock': Frequency_PhaseLock,
  'lab__frequency__resonant_cavity': Frequency_ResonantCavity,
  'lab__frequency__frequency_seal': Frequency_FrequencySeal,
};

// =====================================================================
// Tuner Collection typeId → component map
// =====================================================================
const TUNER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__tuner__delta_drop': Tuner_DeltaDrop,
  'lab__tuner__gamma_spike': Tuner_GammaSpike,
  'lab__tuner__haptic_pacer': Tuner_HapticPacer,
  'lab__tuner__vagal_hum': Tuner_VagalHum,
  'lab__tuner__isochronic_focus': Tuner_IsochronicFocus,
  'lab__tuner__heart_coherence': Tuner_HeartCoherence,
  'lab__tuner__brown_noise': Tuner_BrownNoise,
  'lab__tuner__bilateral_tap': Tuner_BilateralTap,
  'lab__tuner__solfeggio_528': Tuner_Solfeggio528,
  'lab__tuner__tuner_seal': Tuner_TunerSeal,
};

// =====================================================================
// Broadcast Collection typeId → component map
// =====================================================================
const BROADCAST_MAP: Record<string, React.ComponentType<any>> = {
  'lab__broadcast__circadian_tint': Broadcast_CircadianTint,
  'lab__broadcast__subliminal_pulse': Broadcast_SubliminalPulse,
  'lab__broadcast__haptic_heartbeat': Broadcast_HapticHeartbeat,
  'lab__broadcast__color_bath': Broadcast_ColorBath,
  'lab__broadcast__silent_timer': Broadcast_SilentTimer,
  'lab__broadcast__digital_candle': Broadcast_DigitalCandle,
  'lab__broadcast__presence_radar': Broadcast_PresenceRadar,
  'lab__broadcast__weather_window': Broadcast_WeatherWindow,
  'lab__broadcast__rhythm_background': Broadcast_RhythmBackground,
  'lab__broadcast__broadcast_seal': Broadcast_BroadcastSeal,
};

// =====================================================================
// Schrödinger Collection typeId → component map
// =====================================================================
const SCHRODINGER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__schrodinger__mystery_box': Schrodinger_MysteryBox,
  'lab__schrodinger__parallel_self': Schrodinger_ParallelSelf,
  'lab__schrodinger__dice_roll': Schrodinger_DiceRoll,
  'lab__schrodinger__many_worlds_map': Schrodinger_ManyWorldsMap,
  'lab__schrodinger__quantum_coin': Schrodinger_QuantumCoin,
  'lab__schrodinger__random_act': Schrodinger_RandomAct,
  'lab__schrodinger__blur': Schrodinger_Blur,
  'lab__schrodinger__oracle_deck': Schrodinger_OracleDeck,
  'lab__schrodinger__double_slit': Schrodinger_DoubleSlit,
  'lab__schrodinger__box_seal': Schrodinger_BoxSeal,
};

// =====================================================================
// Glitch Collection typeId → component map
// =====================================================================
const GLITCH_MAP: Record<string, React.ComponentType<any>> = {
  'lab__glitch__fourth_wall_break': Glitch_FourthWallBreak,
  'lab__glitch__wrong_button': Glitch_WrongButton,
  'lab__glitch__reverse_text': Glitch_ReverseText,
  'lab__glitch__lag_spike': Glitch_LagSpike,
  'lab__glitch__blue_screen': Glitch_BlueScreen,
  'lab__glitch__fake_notification': Glitch_FakeNotification,
  'lab__glitch__pixelated_self': Glitch_PixelatedSelf,
  'lab__glitch__loop_crash': Glitch_LoopCrash,
  'lab__glitch__reality_tear': Glitch_RealityTear,
  'lab__glitch__glitch_seal': Glitch_GlitchSeal,
};

// =====================================================================
// Construct Collection typeId → component map
// =====================================================================
const CONSTRUCT_MAP: Record<string, React.ComponentType<any>> = {
  'lab__construct__foundation_stone': Construct_FoundationStone,
  'lab__construct__grief_cairn': Construct_GriefCairn,
  'lab__construct__memory_palace': Construct_MemoryPalace,
  'lab__construct__zen_garden': Construct_ZenGarden,
  'lab__construct__fear_vault': Construct_FearVault,
  'lab__construct__council_table': Construct_CouncilTable,
  'lab__construct__lighthouse': Construct_Lighthouse,
  'lab__construct__workbench': Construct_Workbench,
  'lab__construct__greenhouse': Construct_Greenhouse,
  'lab__construct__architect_seal': Construct_ArchitectSeal,
};

// =====================================================================
// Biographer Collection typeId → component map
// =====================================================================
const BIOGRAPHER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__biographer__origin_story': Biographer_OriginStory,
  'lab__biographer__character_sheet': Biographer_CharacterSheet,
  'lab__biographer__third_person_shift': Biographer_ThirdPersonShift,
  'lab__biographer__yet_append': Biographer_YetAppend,
  'lab__biographer__antagonist_audit': Biographer_AntagonistAudit,
  'lab__biographer__plot_twist': Biographer_PlotTwist,
  'lab__biographer__future_memoir': Biographer_FutureMemoir,
  'lab__biographer__genre_switch': Biographer_GenreSwitch,
  'lab__biographer__supporting_cast': Biographer_SupportingCast,
  'lab__biographer__mythos_seal': Biographer_MythosSeal,
};

// =====================================================================
// Optician Collection typeId → component map
// =====================================================================
const OPTICIAN_MAP: Record<string, React.ComponentType<any>> = {
  'lab__optician__prescription_check': Optician_PrescriptionCheck,
  'lab__optician__frame_crop': Optician_FrameCrop,
  'lab__optician__filter_scrub': Optician_FilterScrub,
  'lab__optician__inversion_goggles': Optician_InversionGoggles,
  'lab__optician__focus_pull': Optician_FocusPull,
  'lab__optician__contrast_adjust': Optician_ContrastAdjust,
  'lab__optician__peripheral_scan': Optician_PeripheralScan,
  'lab__optician__broken_mirror': Optician_BrokenMirror,
  'lab__optician__night_vision': Optician_NightVision,
  'lab__optician__optician_seal': Optician_OpticianSeal,
};

// =====================================================================
// Interpreter Collection typeId → component map
// =====================================================================
const INTERPRETER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__interpreter__subtext_scanner': Interpreter_SubtextScanner,
  'lab__interpreter__villain_de_mask': Interpreter_VillainDeMask,
  'lab__interpreter__ladder_of_inference': Interpreter_LadderOfInference,
  'lab__interpreter__benefit_of_doubt': Interpreter_BenefitOfDoubt,
  'lab__interpreter__translation_ear': Interpreter_TranslationEar,
  'lab__interpreter__third_chair': Interpreter_ThirdChair,
  'lab__interpreter__pause_button': Interpreter_PauseButton,
  'lab__interpreter__steel_man': Interpreter_SteelMan,
  'lab__interpreter__mirror_neurons': Interpreter_MirrorNeurons,
  'lab__interpreter__interpreter_seal': Interpreter_InterpreterSeal,
};

// =====================================================================
// Social Physics Collection typeId → component map
// =====================================================================
const SOCIALPHYSICS_MAP: Record<string, React.ComponentType<any>> = {
  'lab__socialphysics__energy_redirect': SocialPhysics_EnergyRedirect,
  'lab__socialphysics__status_see_saw': SocialPhysics_StatusSeeSaw,
  'lab__socialphysics__silent_mirror': SocialPhysics_SilentMirror,
  'lab__socialphysics__values_compass': SocialPhysics_ValuesCompass,
  'lab__socialphysics__empathy_bridge': SocialPhysics_EmpathyBridge,
  'lab__socialphysics__boundary_forcefield': SocialPhysics_BoundaryForcefield,
  'lab__socialphysics__yes_and_weaver': SocialPhysics_YesAndWeaver,
  'lab__socialphysics__trigger_disarm': SocialPhysics_TriggerDisarm,
  'lab__socialphysics__perspective_drone': SocialPhysics_PerspectiveDrone,
  'lab__socialphysics__diplomat_seal': SocialPhysics_DiplomatSeal,
};

// =====================================================================
// Tribalist Collection typeId → component map
// =====================================================================
const TRIBALIST_MAP: Record<string, React.ComponentType<any>> = {
  'lab__tribalist__signal_fire': Tribalist_SignalFire,
  'lab__tribalist__circle_audit': Tribalist_CircleAudit,
  'lab__tribalist__gift_loop': Tribalist_GiftLoop,
  'lab__tribalist__role_call': Tribalist_RoleCall,
  'lab__tribalist__vulnerability_key': Tribalist_VulnerabilityKey,
  'lab__tribalist__social_battery': Tribalist_SocialBattery,
  'lab__tribalist__echo_chamber_break': Tribalist_EchoChamberBreak,
  'lab__tribalist__ritual_maker': Tribalist_RitualMaker,
  'lab__tribalist__gossip_firewall': Tribalist_GossipFirewall,
  'lab__tribalist__tribal_seal': Tribalist_TribalSeal,
};

// =====================================================================
// Valuator Collection typeId → component map
// =====================================================================
const VALUATOR_MAP: Record<string, React.ComponentType<any>> = {
  'lab__valuator__price_tag': Valuator_PriceTag,
  'lab__valuator__sunk_cost_cut': Valuator_SunkCostCut,
  'lab__valuator__asset_audit': Valuator_AssetAudit,
  'lab__valuator__inflation_check': Valuator_InflationCheck,
  'lab__valuator__opportunity_cost': Valuator_OpportunityCost,
  'lab__valuator__energy_ledger': Valuator_EnergyLedger,
  'lab__valuator__negotiation_table': Valuator_NegotiationTable,
  'lab__valuator__scarcity_flip': Valuator_ScarcityFlip,
  'lab__valuator__quality_control': Valuator_QualityControl,
  'lab__valuator__gold_standard': Valuator_GoldStandard,
};

// =====================================================================
// Editor Collection typeId → component map
// =====================================================================
const EDITOR_MAP: Record<string, React.ComponentType<any>> = {
  'lab__editor__noise_gate': Editor_NoiseGate,
  'lab__editor__headline_rewrite': Editor_HeadlineRewrite,
  'lab__editor__algorithm_audit': Editor_AlgorithmAudit,
  'lab__editor__kill_your_darlings': Editor_KillYourDarlings,
  'lab__editor__zoom_out': Editor_ZoomOut,
  'lab__editor__fact_check': Editor_FactCheck,
  'lab__editor__continuity_fix': Editor_ContinuityFix,
  'lab__editor__mute_button': Editor_MuteButton,
  'lab__editor__color_grade': Editor_ColorGrade,
  'lab__editor__final_cut': Editor_FinalCut,
};

// =====================================================================
// Grandmaster Collection typeId → component map
// =====================================================================
const GRANDMASTER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__grandmaster__meta_view': Grandmaster_MetaView,
  'lab__grandmaster__second_order': Grandmaster_SecondOrder,
  'lab__grandmaster__leverage_point': Grandmaster_LeveragePoint,
  'lab__grandmaster__positive_sum': Grandmaster_PositiveSum,
  'lab__grandmaster__sunk_cost_eject': Grandmaster_SunkCostEject,
  'lab__grandmaster__fog_of_war': Grandmaster_FogOfWar,
  'lab__grandmaster__tempo_control': Grandmaster_TempoControl,
  'lab__grandmaster__inversion': Grandmaster_Inversion,
  'lab__grandmaster__optionality': Grandmaster_Optionality,
  'lab__grandmaster__grandmaster_seal': Grandmaster_GrandmasterSeal,
};

// =====================================================================
// Catalyst Collection typeId → component map
// =====================================================================
const CATALYST_MAP: Record<string, React.ComponentType<any>> = {
  'lab__catalyst__activation_energy': Catalyst_ActivationEnergy,
  'lab__catalyst__mirroring_tune': Catalyst_MirroringTune,
  'lab__catalyst__trojan_horse': Catalyst_TrojanHorse,
  'lab__catalyst__silence_vacuum': Catalyst_SilenceVacuum,
  'lab__catalyst__label_inception': Catalyst_LabelInception,
  'lab__catalyst__vulnerability_drop': Catalyst_VulnerabilityDrop,
  'lab__catalyst__but_to_and': Catalyst_ButToAnd,
  'lab__catalyst__future_pace': Catalyst_FuturePace,
  'lab__catalyst__question_hook': Catalyst_QuestionHook,
  'lab__catalyst__catalyst_seal': Catalyst_CatalystSeal,
  // S107 additions (The Chemistry Collection)
  'lab__catalyst__phase_change': Catalyst_PhaseChange,
  'lab__catalyst__precipitate': Catalyst_Precipitate,
  'lab__catalyst__titration': Catalyst_Titration,
  'lab__catalyst__compound': Catalyst_Compound,
  'lab__catalyst__solvent': Catalyst_Solvent,
  'lab__catalyst__chain_reaction': Catalyst_ChainReaction,
  'lab__catalyst__purification': Catalyst_Purification,
  'lab__catalyst__inert_gas': Catalyst_InertGas,
  'lab__catalyst__enzyme': Catalyst_Enzyme,
  'lab__catalyst__equilibrium': Catalyst_Equilibrium,
};

// =====================================================================
// Kinetic Collection typeId → component map
// =====================================================================
const KINETIC_MAP: Record<string, React.ComponentType<any>> = {
  'lab__kinetic__inertia_break': Kinetic_InertiaBreak,
  'lab__kinetic__micro_step': Kinetic_MicroStep,
  'lab__kinetic__flow_trigger': Kinetic_FlowTrigger,
  'lab__kinetic__burn_rate': Kinetic_BurnRate,
  'lab__kinetic__friction_polish': Kinetic_FrictionPolish,
  'lab__kinetic__pivot': Kinetic_Pivot,
  'lab__kinetic__momentum_save': Kinetic_MomentumSave,
  'lab__kinetic__good_enough_ship': Kinetic_GoodEnoughShip,
  'lab__kinetic__rest_stop': Kinetic_RestStop,
  'lab__kinetic__kinetic_seal': Kinetic_KineticSeal,
};

// =====================================================================
// Adaptive Collection typeId → component map
// =====================================================================
const ADAPTIVE_MAP: Record<string, React.ComponentType<any>> = {
  'lab__adaptive__elastic_snap': Adaptive_ElasticSnap,
  'lab__adaptive__kintsugi_repair': Adaptive_KintsugiRepair,
  'lab__adaptive__immune_response': Adaptive_ImmuneResponse,
  'lab__adaptive__water_mode': Adaptive_WaterMode,
  'lab__adaptive__shock_absorber': Adaptive_ShockAbsorber,
  'lab__adaptive__compost_bin': Adaptive_CompostBin,
  'lab__adaptive__scar_tissue': Adaptive_ScarTissue,
  'lab__adaptive__root_deepen': Adaptive_RootDeepen,
  'lab__adaptive__phoenix_burn': Adaptive_PhoenixBurn,
  'lab__adaptive__adaptive_seal': Adaptive_AdaptiveSeal,
};

// =====================================================================
// Shadow Worker Collection typeId → component map
// =====================================================================
const SHADOW_MAP: Record<string, React.ComponentType<any>> = {
  'lab__shadow__projection_check': Shadow_ProjectionCheck,
  'lab__shadow__golden_shadow': Shadow_GoldenShadow,
  'lab__shadow__secret_oath': Shadow_SecretOath,
  'lab__shadow__monster_feed': Shadow_MonsterFeed,
  'lab__shadow__shame_compass': Shadow_ShameCompass,
  'lab__shadow__inner_child_rescue': Shadow_InnerChildRescue,
  'lab__shadow__dream_dive': Shadow_DreamDive,
  'lab__shadow__trigger_trace': Shadow_TriggerTrace,
  'lab__shadow__integration_dialogue': Shadow_IntegrationDialogue,
  'lab__shadow__shadow_seal': Shadow_ShadowSeal,
};

// =====================================================================
// Ancestor Collection typeId → component map
// =====================================================================
const ANCESTOR_MAP: Record<string, React.ComponentType<any>> = {
  'lab__ancestor__epigenetic_switch': Ancestor_EpigeneticSwitch,
  'lab__ancestor__lineage_audit': Ancestor_LineageAudit,
  'lab__ancestor__council_of_elders': Ancestor_CouncilOfElders,
  'lab__ancestor__trauma_breaker': Ancestor_TraumaBreaker,
  'lab__ancestor__gift_inheritance': Ancestor_GiftInheritance,
  'lab__ancestor__name_reclaim': Ancestor_NameReclaim,
  'lab__ancestor__seven_generations': Ancestor_SevenGenerations,
  'lab__ancestor__bone_wisdom': Ancestor_BoneWisdom,
  'lab__ancestor__torch_pass': Ancestor_TorchPass,
  'lab__ancestor__ancestral_seal': Ancestor_AncestralSeal,
};

// =====================================================================
// Trickster Collection typeId → component map
// =====================================================================
const TRICKSTER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__trickster__absurdity_filter': Trickster_AbsurdityFilter,
  'lab__trickster__wrong_answers_only': Trickster_WrongAnswersOnly,
  'lab__trickster__dance_break': Trickster_DanceBreak,
  'lab__trickster__rule_breaker': Trickster_RuleBreaker,
  'lab__trickster__avatar_swap': Trickster_AvatarSwap,
  'lab__trickster__mess_maker': Trickster_MessMaker,
  'lab__trickster__primal_scream': Trickster_PrimalScream,
  'lab__trickster__yes_lets': Trickster_YesLets,
  'lab__trickster__sandbox_mode': Trickster_SandboxMode,
  'lab__trickster__trickster_seal': Trickster_TricksterSeal,
};

// =====================================================================
// Astronaut Collection typeId → component map
// =====================================================================
const ASTRONAUT_MAP: Record<string, React.ComponentType<any>> = {
  'lab__astronaut__overview_effect': Astronaut_OverviewEffect,
  'lab__astronaut__deep_time_scroll': Astronaut_DeepTimeScroll,
  'lab__astronaut__fractal_zoom': Astronaut_FractalZoom,
  'lab__astronaut__nature_bath': Astronaut_NatureBath,
  'lab__astronaut__sonic_boom': Astronaut_SonicBoom,
  'lab__astronaut__galaxy_spin': Astronaut_GalaxySpin,
  'lab__astronaut__ocean_breath': Astronaut_OceanBreath,
  'lab__astronaut__altruism_spark': Astronaut_AltruismSpark,
  'lab__astronaut__deathbed_view': Astronaut_DeathbedView,
  'lab__astronaut__astronaut_seal': Astronaut_AstronautSeal,
};

// =====================================================================
// Wonderer Collection typeId → component map
// =====================================================================
const WONDERER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__wonderer__what_if_lever': Wonderer_WhatIfLever,
  'lab__wonderer__shoshin_reset': Wonderer_ShoshinReset,
  'lab__wonderer__fractal_question': Wonderer_FractalQuestion,
  'lab__wonderer__rabbit_hole': Wonderer_RabbitHole,
  'lab__wonderer__texture_audit': Wonderer_TextureAudit,
  'lab__wonderer__jigsaw_pivot': Wonderer_JigsawPivot,
  'lab__wonderer__impossible_list': Wonderer_ImpossibleList,
  'lab__wonderer__color_thief': Wonderer_ColorThief,
  'lab__wonderer__mystery_door': Wonderer_MysteryDoor,
  'lab__wonderer__wonder_seal': Wonderer_WonderSeal,
};

// =====================================================================
// Surfer Collection typeId → component map
// =====================================================================
const SURFER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__surfer__wu_wei_slide': Surfer_WuWeiSlide,
  'lab__surfer__rhythm_game': Surfer_RhythmGame,
  'lab__surfer__breath_synchro': Surfer_BreathSynchro,
  'lab__surfer__friction_remover': Surfer_FrictionRemover,
  'lab__surfer__good_enough_release': Surfer_GoodEnoughRelease,
  'lab__surfer__current_check': Surfer_CurrentCheck,
  'lab__surfer__soft_eyes': Surfer_SoftEyes,
  'lab__surfer__micro_flow': Surfer_MicroFlow,
  'lab__surfer__momentum_save': Surfer_MomentumSave,
  'lab__surfer__surfer_seal': Surfer_SurferSeal,
};

// =====================================================================
// Meaning Maker Collection typeId → component map
// =====================================================================
const MEANING_MAP: Record<string, React.ComponentType<any>> = {
  'lab__meaning__suffering_audit': Meaning_SufferingAudit,
  'lab__meaning__legacy_letter': Meaning_LegacyLetter,
  'lab__meaning__tombstone_edit': Meaning_TombstoneEdit,
  'lab__meaning__ikigai_intersection': Meaning_IkigaiIntersection,
  'lab__meaning__why_ladder': Meaning_WhyLadder,
  'lab__meaning__service_shift': Meaning_ServiceShift,
  'lab__meaning__gratitude_lens': Meaning_GratitudeLens,
  'lab__meaning__alignment_compass': Meaning_AlignmentCompass,
  'lab__meaning__cosmic_joke': Meaning_CosmicJoke,
  'lab__meaning__meaning_seal': Meaning_MeaningSeal,
};

// =====================================================================
// Servant Collection typeId → component map
// =====================================================================
const SERVANT_MAP: Record<string, React.ComponentType<any>> = {
  'lab__servant__ripple_effect': Servant_RippleEffect,
  'lab__servant__oxygen_mask': Servant_OxygenMask,
  'lab__servant__empty_chair': Servant_EmptyChair,
  'lab__servant__gardeners_patience': Servant_GardenersPatience,
  'lab__servant__listening_ear': Servant_ListeningEar,
  'lab__servant__kindness_boomerang': Servant_KindnessBoomerang,
  'lab__servant__ego_dissolve': Servant_EgoDissolve,
  'lab__servant__mentors_hand': Servant_MentorsHand,
  'lab__servant__invisible_thread': Servant_InvisibleThread,
  'lab__servant__servant_seal': Servant_ServantSeal,
};

// =====================================================================
// Synthesis Collection typeId → component map
// =====================================================================
const SYNTHESIS_MAP: Record<string, React.ComponentType<any>> = {
  'lab__synthesis__paradox_holder': Synthesis_ParadoxHolder,
  'lab__synthesis__emotion_blender': Synthesis_EmotionBlender,
  'lab__synthesis__shadow_hug': Synthesis_ShadowHug,
  'lab__synthesis__transmutation_fire': Synthesis_TransmutationFire,
  'lab__synthesis__narrative_stitch': Synthesis_NarrativeStitch,
  'lab__synthesis__energy_exchange': Synthesis_EnergyExchange,
  'lab__synthesis__identity_fluidity': Synthesis_IdentityFluidity,
  'lab__synthesis__values_alloy': Synthesis_ValuesAlloy,
  'lab__synthesis__chaos_surfer': Synthesis_ChaosSurfer,
  'lab__synthesis__synthesis_seal': Synthesis_SynthesisSeal,
};

// =====================================================================
// Future Weaver Collection typeId → component map
// =====================================================================
const FUTUREWEAVER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__futureweaver__future_memory': FutureWeaver_FutureMemory,
  'lab__futureweaver__regret_minimization': FutureWeaver_RegretMinimization,
  'lab__futureweaver__time_capsule_send': FutureWeaver_TimeCapsuleSend,
  'lab__futureweaver__pre_hindsight': FutureWeaver_PreHindsight,
  'lab__futureweaver__branch_pruner': FutureWeaver_BranchPruner,
  'lab__futureweaver__legacy_seed': FutureWeaver_LegacySeed,
  'lab__futureweaver__worst_case_simulator': FutureWeaver_WorstCaseSimulator,
  'lab__futureweaver__optimism_bias': FutureWeaver_OptimismBias,
  'lab__futureweaver__promise_keeper': FutureWeaver_PromiseKeeper,
  'lab__futureweaver__weaver_seal': FutureWeaver_WeaverSeal,
};

// =====================================================================
// Composer Collection typeId → component map
// =====================================================================
const COMPOSER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__composer__discord_resolve': Composer_DiscordResolve,
  'lab__composer__tempo_control': Composer_TempoControl,
  'lab__composer__leitmotif_scan': Composer_LeitmotifScan,
  'lab__composer__rest_note': Composer_RestNote,
  'lab__composer__counterpoint': Composer_Counterpoint,
  'lab__composer__volume_knob': Composer_VolumeKnob,
  'lab__composer__tuning_fork': Composer_TuningFork,
  'lab__composer__ensemble_check': Composer_EnsembleCheck,
  'lab__composer__improvisation': Composer_Improvisation,
  'lab__composer__composer_seal': Composer_ComposerSeal,
};

// =====================================================================
// Zenith Collection typeId → component map
// =====================================================================
const ZENITH_MAP: Record<string, React.ComponentType<any>> = {
  'lab__zenith__acclimatization': Zenith_Acclimatization,
  'lab__zenith__false_summit': Zenith_FalseSummit,
  'lab__zenith__light_load': Zenith_LightLoad,
  'lab__zenith__anchor': Zenith_Anchor,
  'lab__zenith__view': Zenith_View,
  'lab__zenith__descent': Zenith_Descent,
  'lab__zenith__sherpa_mindset': Zenith_SherpaMindset,
  'lab__zenith__oxygen_check': Zenith_OxygenCheck,
  'lab__zenith__whiteout': Zenith_Whiteout,
  'lab__zenith__zenith_seal': Zenith_ZenithSeal,
};

// =====================================================================
// Multiverse Collection typeId → component map
// =====================================================================
const MULTIVERSE_MAP: Record<string, React.ComponentType<any>> = {
  'lab__multiverse__identity_prism': Multiverse_IdentityPrism,
  'lab__multiverse__both_and_bridge': Multiverse_BothAndBridge,
  'lab__multiverse__costume_change': Multiverse_CostumeChange,
  'lab__multiverse__future_draft': Multiverse_FutureDraft,
  'lab__multiverse__committee_meeting': Multiverse_CommitteeMeeting,
  'lab__multiverse__ghost_ship': Multiverse_GhostShip,
  'lab__multiverse__shapeshifter': Multiverse_Shapeshifter,
  'lab__multiverse__shadow_dance': Multiverse_ShadowDance,
  'lab__multiverse__empty_room': Multiverse_EmptyRoom,
  'lab__multiverse__multiverse_seal': Multiverse_MultiverseSeal,
};

// =====================================================================
// Ethicist Collection typeId → component map
// =====================================================================
const ETHICIST_MAP: Record<string, React.ComponentType<any>> = {
  'lab__ethicist__integrity_gap': Ethicist_IntegrityGap,
  'lab__ethicist__eulogy_test': Ethicist_EulogyTest,
  'lab__ethicist__hard_right': Ethicist_HardRight,
  'lab__ethicist__truth_serum': Ethicist_TruthSerum,
  'lab__ethicist__virtue_card': Ethicist_VirtueCard,
  'lab__ethicist__whisper': Ethicist_Whisper,
  'lab__ethicist__responsibility_weight': Ethicist_ResponsibilityWeight,
  'lab__ethicist__gratitude_tithe': Ethicist_GratitudeTithe,
  'lab__ethicist__apology_script': Ethicist_ApologyScript,
  'lab__ethicist__ethicist_seal': Ethicist_EthicistSeal,
};

// =====================================================================
// Elementalist Collection typeId → component map
// =====================================================================
const ELEMENTALIST_MAP: Record<string, React.ComponentType<any>> = {
  'lab__elementalist__earth_drop': Elementalist_EarthDrop,
  'lab__elementalist__air_filter': Elementalist_AirFilter,
  'lab__elementalist__fire_stoke': Elementalist_FireStoke,
  'lab__elementalist__water_flow': Elementalist_WaterFlow,
  'lab__elementalist__storm_eye': Elementalist_StormEye,
  'lab__elementalist__stone_stack': Elementalist_StoneStack,
  'lab__elementalist__forest_bath': Elementalist_ForestBath,
  'lab__elementalist__tide_chart': Elementalist_TideChart,
  'lab__elementalist__lightning_rod': Elementalist_LightningRod,
  'lab__elementalist__elemental_seal': Elementalist_ElementalSeal,
};

// =====================================================================
// Mentat Collection typeId → component map
// =====================================================================
const MENTAT_MAP: Record<string, React.ComponentType<any>> = {
  'lab__mentat__deduction_palace': Mentat_DeductionPalace,
  'lab__mentat__speed_read': Mentat_SpeedRead,
  'lab__mentat__logic_gate': Mentat_LogicGate,
  'lab__mentat__binary_choice': Mentat_BinaryChoice,
  'lab__mentat__memory_archive': Mentat_MemoryArchive,
  'lab__mentat__focus_tunnel': Mentat_FocusTunnel,
  'lab__mentat__pattern_match': Mentat_PatternMatch,
  'lab__mentat__devils_advocate': Mentat_DevilsAdvocate,
  'lab__mentat__algorithm_rewrite': Mentat_AlgorithmRewrite,
  'lab__mentat__mentat_seal': Mentat_MentatSeal,
};

// =====================================================================
// Intuition Collection typeId → component map
// =====================================================================
const INTUITION_MAP: Record<string, React.ComponentType<any>> = {
  'lab__intuition__gut_check': Intuition_GutCheck,
  'lab__intuition__coin_flip': Intuition_CoinFlip,
  'lab__intuition__shiver_scan': Intuition_ShiverScan,
  'lab__intuition__sleep_on_it': Intuition_SleepOnIt,
  'lab__intuition__vibe_check': Intuition_VibeCheck,
  'lab__intuition__silence_vacuum': Intuition_SilenceVacuum,
  'lab__intuition__resonance_test': Intuition_ResonanceTest,
  'lab__intuition__future_self_consult': Intuition_FutureSelfConsult,
  'lab__intuition__fear_vs_danger': Intuition_FearVsDanger,
  'lab__intuition__oracle_seal': Intuition_OracleSeal,
};

// =====================================================================
// Engineer Collection typeId → component map
// =====================================================================
const ENGINEER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__engineer__default_setting': Engineer_DefaultSetting,
  'lab__engineer__friction_slider': Engineer_FrictionSlider,
  'lab__engineer__commitment_device': Engineer_CommitmentDevice,
  'lab__engineer__batch_process': Engineer_BatchProcess,
  'lab__engineer__check_engine_light': Engineer_CheckEngineLight,
  'lab__engineer__redundancy': Engineer_Redundancy,
  'lab__engineer__constraint': Engineer_Constraint,
  'lab__engineer__feedback_loop': Engineer_FeedbackLoop,
  'lab__engineer__maintenance_schedule': Engineer_MaintenanceSchedule,
  'lab__engineer__engineer_seal': Engineer_EngineerSeal,
};

// =====================================================================
// AlchemistIV Collection typeId → component map
// =====================================================================
const ALCHEMISTIV_MAP: Record<string, React.ComponentType<any>> = {
  'lab__alchemistiv__anger_forge': AlchemistIV_AngerForge,
  'lab__alchemistiv__grief_garden': AlchemistIV_GriefGarden,
  'lab__alchemistiv__fear_compass': AlchemistIV_FearCompass,
  'lab__alchemistiv__joy_reservoir': AlchemistIV_JoyReservoir,
  'lab__alchemistiv__shame_solvent': AlchemistIV_ShameSolvent,
  'lab__alchemistiv__envy_mirror': AlchemistIV_EnvyMirror,
  'lab__alchemistiv__sadness_river': AlchemistIV_SadnessRiver,
  'lab__alchemistiv__anxiety_engine': AlchemistIV_AnxietyEngine,
  'lab__alchemistiv__love_amplifier': AlchemistIV_LoveAmplifier,
  'lab__alchemistiv__transmutation_seal': AlchemistIV_TransmutationSeal,
};

// =====================================================================
// Cognitive Collection typeId → component map
// =====================================================================
const COGNITIVE_MAP: Record<string, React.ComponentType<any>> = {
  'lab__cognitive__memory_palace_repair': Cognitive_MemoryPalaceRepair,
  'lab__cognitive__focus_fortress': Cognitive_FocusFortress,
  'lab__cognitive__logic_library': Cognitive_LogicLibrary,
  'lab__cognitive__perspective_balcony': Cognitive_PerspectiveBalcony,
  'lab__cognitive__value_vault': Cognitive_ValueVault,
  'lab__cognitive__decision_bridge': Cognitive_DecisionBridge,
  'lab__cognitive__creativity_workshop': Cognitive_CreativityWorkshop,
  'lab__cognitive__doubt_dungeon': Cognitive_DoubtDungeon,
  'lab__cognitive__future_observatory': Cognitive_FutureObservatory,
  'lab__cognitive__architect_seal': Cognitive_ArchitectSeal,
};

// =====================================================================
// Sage Wisdom Collection typeId → component map (Series 90)
// =====================================================================
const SAGE_WISDOM_MAP: Record<string, React.ComponentType<any>> = {
  'lab__sage__empty_cup': Sage_EmptyCup,
  'lab__sage__impermanence': Sage_Impermanence,
  'lab__sage__middle_way': Sage_MiddleWay,
  'lab__sage__paradox_holder': Sage_ParadoxHolder,
  'lab__sage__silent_answer': Sage_SilentAnswer,
  'lab__sage__observer_seat': Sage_ObserverSeat,
  'lab__sage__wu_wei': Sage_WuWei,
  'lab__sage__mirror_of_projection': Sage_MirrorOfProjection,
  'lab__sage__beginners_mind': Sage_BeginnersMind,
  'lab__sage__sage_seal': Sage_SageSeal,
};

// =====================================================================
// Gaia Collection typeId → component map
// =====================================================================
const GAIA_MAP: Record<string, React.ComponentType<any>> = {
  'lab__gaia__breath_exchange': Gaia_BreathExchange,
  'lab__gaia__mycelium_network': Gaia_MyceliumNetwork,
  'lab__gaia__zoom_out': Gaia_ZoomOut,
  'lab__gaia__water_cycle': Gaia_WaterCycle,
  'lab__gaia__deep_time': Gaia_DeepTime,
  'lab__gaia__sun_source': Gaia_SunSource,
  'lab__gaia__diversity_immunity': Gaia_DiversityImmunity,
  'lab__gaia__ocean_depth': Gaia_OceanDepth,
  'lab__gaia__butterfly_effect': Gaia_ButterflyEffect,
  'lab__gaia__gaia_seal': Gaia_GaiaSeal,
};

// =====================================================================
// Mystic Transcendence Collection typeId → component map (Series 92)
// =====================================================================
const MYSTIC_TRANS_MAP: Record<string, React.ComponentType<any>> = {
  'lab__mystic__candle_gaze': Mystic_CandleGaze,
  'lab__mystic__drop_in_ocean': Mystic_DropInOcean,
  'lab__mystic__koan': Mystic_Koan,
  'lab__mystic__light_source': Mystic_LightSource,
  'lab__mystic__space_between': Mystic_SpaceBetween,
  'lab__mystic__dance_of_shiva': Mystic_DanceOfShiva,
  'lab__mystic__golden_thread': Mystic_GoldenThread,
  'lab__mystic__silence_bell': Mystic_SilenceBell,
  'lab__mystic__net_of_indra': Mystic_NetOfIndra,
  'lab__mystic__transcendence_seal': Mystic_TranscendenceSeal,
};

// =====================================================================
// Ascendant Collection typeId → component map
// =====================================================================
const ASCENDANT_MAP: Record<string, React.ComponentType<any>> = {
  'lab__ascendant__chop_wood': Ascendant_ChopWood,
  'lab__ascendant__descent': Ascendant_Descent,
  'lab__ascendant__marketplace_noise': Ascendant_MarketplaceNoise,
  'lab__ascendant__dirty_hands': Ascendant_DirtyHands,
  'lab__ascendant__ordinary_miracle': Ascendant_OrdinaryMiracle,
  'lab__ascendant__broken_bowl': Ascendant_BrokenBowl,
  'lab__ascendant__ripple_maker': Ascendant_RippleMaker,
  'lab__ascendant__human_touch': Ascendant_HumanTouch,
  'lab__ascendant__open_door': Ascendant_OpenDoor,
  'lab__ascendant__ascendant_seal': Ascendant_AscendantSeal,
};

// =====================================================================
// Gardener II Collection typeId → component map (Series 94)
// =====================================================================
const GARDENER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__gardener__seed_bank': Gardener_SeedBank,
  'lab__gardener__composting': Gardener_Composting,
  'lab__gardener__pruning_shears': Gardener_PruningShears,
  'lab__gardener__mycelial_pulse': Gardener_MycelialPulse,
  'lab__gardener__harvest_timing': Gardener_HarvestTiming,
  'lab__gardener__drought_resilience': Gardener_DroughtResilience,
  'lab__gardener__pollinator': Gardener_Pollinator,
  'lab__gardener__winter_rest': Gardener_WinterRest,
  'lab__gardener__ecosystem_balance': Gardener_EcosystemBalance,
  'lab__gardener__gardener_seal': Gardener_GardenerSeal,
};

// =====================================================================
// Ancestor II Legacy Collection typeId → component map (Series 95)
// =====================================================================
const ANCESTOR_LEGACY_MAP: Record<string, React.ComponentType<any>> = {
  'lab__ancestorii__100_year_plan': AncestorII_100YearPlan,
  'lab__ancestorii__chain_link': AncestorII_ChainLink,
  'lab__ancestorii__wisdom_capsule': AncestorII_WisdomCapsule,
  'lab__ancestorii__name_etching': AncestorII_NameEtching,
  'lab__ancestorii__torch_pass': AncestorII_TorchPass,
  'lab__ancestorii__library_contribution': AncestorII_LibraryContribution,
  'lab__ancestorii__ripple_watch': AncestorII_RippleWatch,
  'lab__ancestorii__council_seat': AncestorII_CouncilSeat,
  'lab__ancestorii__inheritance_audit': AncestorII_InheritanceAudit,
  'lab__ancestorii__ancestor_seal': AncestorII_AncestorSeal,
};

// =====================================================================
// Mastery Collection typeId → component map (Series 96)
// =====================================================================
const MASTERY_MAP: Record<string, React.ComponentType<any>> = {
  'lab__mastery__distillation': Mastery_Distillation,
  'lab__mastery__phoenix_ash': Mastery_PhoenixAsh,
  'lab__mastery__gold_standard': Mastery_GoldStandard,
  'lab__mastery__masterpiece_reveal': Mastery_MasterpieceReveal,
  'lab__mastery__chisel_strike': Mastery_ChiselStrike,
  'lab__mastery__final_polish': Mastery_FinalPolish,
  'lab__mastery__key_turn': Mastery_KeyTurn,
  'lab__mastery__crown_weight': Mastery_CrownWeight,
  'lab__mastery__silent_nod': Mastery_SilentNod,
  'lab__mastery__mastery_seal': Mastery_MasterySeal,
};

// =====================================================================
// Horizon Collection typeId → component map (Series 97)
// =====================================================================
const HORIZON_MAP: Record<string, React.ComponentType<any>> = {
  'lab__horizon__horizon_line': Horizon_HorizonLine,
  'lab__horizon__new_map': Horizon_NewMap,
  'lab__horizon__level_up': Horizon_LevelUp,
  'lab__horizon__open_door': Horizon_OpenDoor,
  'lab__horizon__torch_relay': Horizon_TorchRelay,
  'lab__horizon__sunrise': Horizon_Sunrise,
  'lab__horizon__unfinished_symphony': Horizon_UnfinishedSymphony,
  'lab__horizon__vastness': Horizon_Vastness,
  'lab__horizon__question_mark': Horizon_QuestionMark,
  'lab__horizon__infinite_seal': Horizon_InfiniteSeal,
};

// =====================================================================
// Void Collection typeId → component map (Series 98)
// =====================================================================
const VOID_MAP: Record<string, React.ComponentType<any>> = {
  'lab__void__sensory_deprivation': Void_SensoryDeprivation,
  'lab__void__nothing_box': Void_NothingBox,
  'lab__void__silence_vacuum': Void_SilenceVacuum,
  'lab__void__dark_matter': Void_DarkMatter,
  'lab__void__ego_death': Void_EgoDeath,
  'lab__void__breath_hold': Void_BreathHold,
  'lab__void__un_naming': Void_UnNaming,
  'lab__void__reset_button': Void_ResetButton,
  'lab__void__static_clear': Void_StaticClear,
  'lab__void__zero_seal': Void_ZeroSeal,
};

// =====================================================================
// Unity Collection typeId → component map (Series 99)
// =====================================================================
const UNITY_MAP: Record<string, React.ComponentType<any>> = {
  'lab__unity__prism_return': Unity_PrismReturn,
  'lab__unity__symphony': Unity_Symphony,
  'lab__unity__fractal_zoom': Unity_FractalZoom,
  'lab__unity__entanglement': Unity_Entanglement,
  'lab__unity__golden_ratio': Unity_GoldenRatio,
  'lab__unity__time_collapse': Unity_TimeCollapse,
  'lab__unity__event_horizon': Unity_EventHorizon,
  'lab__unity__mirror_of_truth': Unity_MirrorOfTruth,
  'lab__unity__final_exhale': Unity_FinalExhale,
  'lab__unity__atlas_seal': Unity_AtlasSeal,
};

// =====================================================================
// Ouroboros Collection typeId → component map (Series 100)
// =====================================================================
const OUROBOROS_MAP: Record<string, React.ComponentType<any>> = {
  'lab__ouroboros__first_breath': Ouroboros_FirstBreath,
  'lab__ouroboros__mirror_loop': Ouroboros_MirrorLoop,
  'lab__ouroboros__seed_return': Ouroboros_SeedReturn,
  'lab__ouroboros__snake_skin': Ouroboros_SnakeSkin,
  'lab__ouroboros__circle_close': Ouroboros_CircleClose,
  'lab__ouroboros__ash_sprout': Ouroboros_AshSprout,
  'lab__ouroboros__echo_origin': Ouroboros_EchoOrigin,
  'lab__ouroboros__tail_swallow': Ouroboros_TailSwallow,
  'lab__ouroboros__alpha_omega': Ouroboros_AlphaOmega,
  'lab__ouroboros__eternal_seal': Ouroboros_EternalSeal,
};

// =====================================================================
// Projector Collection typeId -> component map (Series 101)
// =====================================================================
const PROJECTOR_MAP: Record<string, React.ComponentType<any>> = {
  'lab__projector__film_swap': Projector_FilmSwap,
  'lab__projector__beam_focus': Projector_BeamFocus,
  'lab__projector__lens_shift': Projector_LensShift,
  'lab__projector__reality_lag': Projector_RealityLag,
  'lab__projector__tuning_fork': Projector_TuningFork,
  'lab__projector__silent_reel': Projector_SilentReel,
  'lab__projector__fourth_wall': Projector_FourthWall,
  'lab__projector__splice_point': Projector_SplicePoint,
  'lab__projector__ghost_light': Projector_GhostLight,
  'lab__projector__projector_seal': Projector_ProjectorSeal,
};

// =====================================================================
// Chronomancer Collection typeId -> component map (Series 102)
// =====================================================================
const CHRONOMANCER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__chronomancer__past_edit': Chronomancer_PastEdit,
  'lab__chronomancer__future_borrow': Chronomancer_FutureBorrow,
  'lab__chronomancer__time_dilation': Chronomancer_TimeDilation,
  'lab__chronomancer__ancestral_link': Chronomancer_AncestralLink,
  'lab__chronomancer__legacy_cast': Chronomancer_LegacyCast,
  'lab__chronomancer__regret_reversal': Chronomancer_RegretReversal,
  'lab__chronomancer__deja_vu': Chronomancer_DejaVu,
  'lab__chronomancer__wormhole': Chronomancer_Wormhole,
  'lab__chronomancer__eternal_now': Chronomancer_EternalNow,
  'lab__chronomancer__chronos_seal': Chronomancer_ChronosSeal,
};

// =====================================================================
// Resonator Collection typeId -> component map (Series 103)
// =====================================================================
const RESONATOR_MAP: Record<string, React.ComponentType<any>> = {
  'lab__resonator__noise_cancellation': Resonator_NoiseCancellation,
  'lab__resonator__carrier_wave': Resonator_CarrierWave,
  'lab__resonator__constructive_interference': Resonator_ConstructiveInterference,
  'lab__resonator__sympathetic_resonance': Resonator_SympatheticResonance,
  'lab__resonator__feedback_loop': Resonator_FeedbackLoop,
  'lab__resonator__pure_tone': Resonator_PureTone,
  'lab__resonator__volume_knob': Resonator_VolumeKnob,
  'lab__resonator__echo_chamber': Resonator_EchoChamber,
  'lab__resonator__frequency_jammer': Resonator_FrequencyJammer,
  'lab__resonator__resonator_seal': Resonator_ResonatorSeal,
};

// =====================================================================
// Materialist Collection typeId -> component map (Series 104)
// =====================================================================
const MATERIALIST_MAP: Record<string, React.ComponentType<any>> = {
  'lab__materialist__first_brick': Materialist_FirstBrick,
  'lab__materialist__blueprint_edit': Materialist_BlueprintEdit,
  'lab__materialist__gravity_well': Materialist_GravityWell,
  'lab__materialist__friction_test': Materialist_FrictionTest,
  'lab__materialist__scaffolding': Materialist_Scaffolding,
  'lab__materialist__concrete_pour': Materialist_ConcretePour,
  'lab__materialist__keystone': Materialist_Keystone,
  'lab__materialist__demolition': Materialist_Demolition,
  'lab__materialist__inspection': Materialist_Inspection,
  'lab__materialist__materialist_seal': Materialist_MaterialistSeal,
};

// =====================================================================
// Refractor Collection typeId -> component map (Series 105)
// =====================================================================
const REFRACTOR_MAP: Record<string, React.ComponentType<any>> = {
  'lab__refractor__spectrum_split': Refractor_SpectrumSplit,
  'lab__refractor__focal_point': Refractor_FocalPoint,
  'lab__refractor__distortion_check': Refractor_DistortionCheck,
  'lab__refractor__color_grade': Refractor_ColorGrade,
  'lab__refractor__blind_spot': Refractor_BlindSpot,
  'lab__refractor__polarizer': Refractor_Polarizer,
  'lab__refractor__black_body': Refractor_BlackBody,
  'lab__refractor__laser': Refractor_Laser,
  'lab__refractor__darkroom': Refractor_Darkroom,
  'lab__refractor__prism_seal': Refractor_PrismSeal,
};

// =====================================================================
// Engine Collection typeId -> component map (Series 106)
// =====================================================================
const ENGINE_MAP: Record<string, React.ComponentType<any>> = {
  'lab__engine__entropy_check': Engine_EntropyCheck,
  'lab__engine__heat_sink': Engine_HeatSink,
  'lab__engine__closed_loop': Engine_ClosedLoop,
  'lab__engine__flywheel': Engine_Flywheel,
  'lab__engine__insulation': Engine_Insulation,
  'lab__engine__turbocharger': Engine_Turbocharger,
  'lab__engine__idle_state': Engine_IdleState,
  'lab__engine__fuel_mix': Engine_FuelMix,
  'lab__engine__governor': Engine_Governor,
  'lab__engine__engine_seal': Engine_EngineSeal,
};

// =====================================================================
// Quantum Architect Collection typeId -> component map (S108/S124 updated)
// =====================================================================
const QUANTUM_ARCHITECT_MAP: Record<string, React.ComponentType<any>> = {
  'lab__quantumarchitect__superposition': QuantumArchitect_Superposition,
  'lab__quantumarchitect__probability_cloud': QuantumArchitect_ProbabilityCloud,
  'lab__quantumarchitect__observer_effect': QuantumArchitect_ObserverEffect,
  'lab__quantumarchitect__multiverse_branch': QuantumArchitect_MultiverseBranch,
  'lab__quantumarchitect__quantum_tunneling': QuantumArchitect_QuantumTunneling,
  'lab__quantumarchitect__entanglement': QuantumArchitect_Entanglement,
  'lab__quantumarchitect__wave_function_collapse': QuantumArchitect_WaveFunctionCollapse,
  'lab__quantumarchitect__uncertainty_principle': QuantumArchitect_UncertaintyPrinciple,
  'lab__quantumarchitect__vacuum_fluctuation': QuantumArchitect_VacuumFluctuation,
  'lab__quantumarchitect__quantum_seal': QuantumArchitect_QuantumSeal,
};

// =====================================================================
// Transmuter Collection typeId → component map
// =====================================================================
const TRANSMUTER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__transmuter__lead_weight': Transmuter_LeadWeight,
  'lab__transmuter__calcination': Transmuter_Calcination,
  'lab__transmuter__distillation': Transmuter_Distillation,
  'lab__transmuter__coagulation': Transmuter_Coagulation,
  'lab__transmuter__fermentation': Transmuter_Fermentation,
  'lab__transmuter__sublimation': Transmuter_Sublimation,
  'lab__transmuter__amalgam': Transmuter_Amalgam,
  'lab__transmuter__universal_solvent': Transmuter_UniversalSolvent,
  'lab__transmuter__philosophers_stone': Transmuter_PhilosophersStone,
  'lab__transmuter__transmuter_seal': Transmuter_TransmuterSeal,
};

// =====================================================================
// Cyberneticist Collection typeId → component map
// =====================================================================
const CYBERNETICIST_MAP: Record<string, React.ComponentType<any>> = {
  'lab__cyberneticist__error_signal': Cyberneticist_ErrorSignal,
  'lab__cyberneticist__negative_feedback_loop': Cyberneticist_NegativeFeedbackLoop,
  'lab__cyberneticist__positive_feedback_loop': Cyberneticist_PositiveFeedbackLoop,
  'lab__cyberneticist__lag_time': Cyberneticist_LagTime,
  'lab__cyberneticist__gain': Cyberneticist_Gain,
  'lab__cyberneticist__set_point': Cyberneticist_SetPoint,
  'lab__cyberneticist__feedforward': Cyberneticist_Feedforward,
  'lab__cyberneticist__oscillation': Cyberneticist_Oscillation,
  'lab__cyberneticist__black_box': Cyberneticist_BlackBox,
  'lab__cyberneticist__navigator_seal': Cyberneticist_NavigatorSeal,
};

// =====================================================================
// FieldArchitect Collection typeId → component map
// =====================================================================
const FIELD_ARCHITECT_MAP: Record<string, React.ComponentType<any>> = {
  'lab__fieldarchitect__polarity_check': FieldArchitect_PolarityCheck,
  'lab__fieldarchitect__iron_filings': FieldArchitect_IronFilings,
  'lab__fieldarchitect__strange_attractor': FieldArchitect_StrangeAttractor,
  'lab__fieldarchitect__shield': FieldArchitect_Shield,
  'lab__fieldarchitect__induced_current': FieldArchitect_InducedCurrent,
  'lab__fieldarchitect__compass_needle': FieldArchitect_CompassNeedle,
  'lab__fieldarchitect__electro_magnet': FieldArchitect_ElectroMagnet,
  'lab__fieldarchitect__voltage_drop': FieldArchitect_VoltageDrop,
  'lab__fieldarchitect__domain': FieldArchitect_Domain,
  'lab__fieldarchitect__field_seal': FieldArchitect_FieldSeal,
};

// =====================================================================
// Kineticist Collection typeId → component map
// =====================================================================
const KINETICIST_MAP: Record<string, React.ComponentType<any>> = {
  'lab__kineticist__inertia_breaker': Kineticist_InertiaBreaker,
  'lab__kineticist__gravity_assist': Kineticist_GravityAssist,
  'lab__kineticist__elastic_collision': Kineticist_ElasticCollision,
  'lab__kineticist__terminal_velocity': Kineticist_TerminalVelocity,
  'lab__kineticist__rocket_equation': Kineticist_RocketEquation,
  'lab__kineticist__orbit': Kineticist_Orbit,
  'lab__kineticist__vector_addition': Kineticist_VectorAddition,
  'lab__kineticist__momentum_save': Kineticist_MomentumSave,
  'lab__kineticist__impact_zone': Kineticist_ImpactZone,
  'lab__kineticist__kinetic_seal': Kineticist_KineticSeal,
};

// =====================================================================
// Crystal Collection typeId → component map
// =====================================================================
const CRYSTAL_MAP: Record<string, React.ComponentType<any>> = {
  'lab__crystal__lattice': Crystal_Lattice,
  'lab__crystal__piezoelectric_spark': Crystal_PiezoelectricSpark,
  'lab__crystal__facet_cut': Crystal_FacetCut,
  'lab__crystal__inclusion': Crystal_Inclusion,
  'lab__crystal__resonant_frequency': Crystal_ResonantFrequency,
  'lab__crystal__annealing': Crystal_Annealing,
  'lab__crystal__transparency': Crystal_Transparency,
  'lab__crystal__nucleation_point': Crystal_NucleationPoint,
  'lab__crystal__prism_refraction': Crystal_PrismRefraction,
  'lab__crystal__crystal_seal': Crystal_CrystalSeal,
};

// =====================================================================
// Hydrodynamicist Collection typeId → component map
// =====================================================================
const HYDRODYNAMICIST_MAP: Record<string, React.ComponentType<any>> = {
  'lab__hydrodynamicist__laminar_flow': Hydrodynamicist_LaminarFlow,
  'lab__hydrodynamicist__buoyancy_check': Hydrodynamicist_BuoyancyCheck,
  'lab__hydrodynamicist__path_of_least_resistance': Hydrodynamicist_PathOfLeastResistance,
  'lab__hydrodynamicist__erosion': Hydrodynamicist_Erosion,
  'lab__hydrodynamicist__hydraulic_press': Hydrodynamicist_HydraulicPress,
  'lab__hydrodynamicist__vortex': Hydrodynamicist_Vortex,
  'lab__hydrodynamicist__surface_tension': Hydrodynamicist_SurfaceTension,
  'lab__hydrodynamicist__phase_transition': Hydrodynamicist_PhaseTransition,
  'lab__hydrodynamicist__ocean_depth': Hydrodynamicist_OceanDepth,
  'lab__hydrodynamicist__hydro_seal': Hydrodynamicist_HydroSeal,
};

// =====================================================================
// Aviator Collection typeId → component map
// =====================================================================
const AVIATOR_MAP: Record<string, React.ComponentType<any>> = {
  'lab__aviator__drag_check': Aviator_DragCheck,
  'lab__aviator__angle_of_attack': Aviator_AngleOfAttack,
  'lab__aviator__thrust_to_weight_ratio': Aviator_ThrustToWeightRatio,
  'lab__aviator__coffin_corner': Aviator_CoffinCorner,
  'lab__aviator__headwind': Aviator_Headwind,
  'lab__aviator__trim_tab': Aviator_TrimTab,
  'lab__aviator__center_of_gravity': Aviator_CenterOfGravity,
  'lab__aviator__ground_effect': Aviator_GroundEffect,
  'lab__aviator__feathered_prop': Aviator_FeatheredProp,
  'lab__aviator__aviator_seal': Aviator_AviatorSeal,
};

// =====================================================================
// Tensegrity Collection typeId → component map
// =====================================================================
const TENSEGRITY_MAP: Record<string, React.ComponentType<any>> = {
  'lab__tensegrity__floating_compression': Tensegrity_FloatingCompression,
  'lab__tensegrity__pre_stress': Tensegrity_PreStress,
  'lab__tensegrity__load_distribution': Tensegrity_LoadDistribution,
  'lab__tensegrity__omni_directional': Tensegrity_OmniDirectional,
  'lab__tensegrity__fascial_release': Tensegrity_FascialRelease,
  'lab__tensegrity__space_frame': Tensegrity_SpaceFrame,
  'lab__tensegrity__dynamic_equilibrium': Tensegrity_DynamicEquilibrium,
  'lab__tensegrity__yield_point': Tensegrity_YieldPoint,
  'lab__tensegrity__network_node': Tensegrity_NetworkNode,
  'lab__tensegrity__tensegrity_seal': Tensegrity_TensegritySeal,
};

// =====================================================================
// Wayfinder Collection typeId → component map
// =====================================================================
const WAYFINDER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__wayfinder__dead_reckoning': Wayfinder_DeadReckoning,
  'lab__wayfinder__swell_read': Wayfinder_SwellRead,
  'lab__wayfinder__zenith_star': Wayfinder_ZenithStar,
  'lab__wayfinder__bird_sign': Wayfinder_BirdSign,
  'lab__wayfinder__cloud_stack': Wayfinder_CloudStack,
  'lab__wayfinder__etak': Wayfinder_Etak,
  'lab__wayfinder__phosphorescence': Wayfinder_Phosphorescence,
  'lab__wayfinder__storm_drift': Wayfinder_StormDrift,
  'lab__wayfinder__land_scent': Wayfinder_LandScent,
  'lab__wayfinder__wayfinder_seal': Wayfinder_WayfinderSeal,
};

// =====================================================================
// Receiver Collection typeId → component map
// =====================================================================
const RECEIVER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__receiver__signal_to_noise_ratio': Receiver_SignalToNoiseRatio,
  'lab__receiver__frequency_scan': Receiver_FrequencyScan,
  'lab__receiver__squelch': Receiver_Squelch,
  'lab__receiver__antenna_gain': Receiver_AntennaGain,
  'lab__receiver__modulation': Receiver_Modulation,
  'lab__receiver__interference_pattern': Receiver_InterferencePattern,
  'lab__receiver__feedback_loop': Receiver_FeedbackLoop,
  'lab__receiver__encryption': Receiver_Encryption,
  'lab__receiver__broadcast_power': Receiver_BroadcastPower,
  'lab__receiver__receiver_seal': Receiver_ReceiverSeal,
};

// =====================================================================
// Vector Collection typeId → component map
// =====================================================================
const VECTOR_MAP: Record<string, React.ComponentType<any>> = {
  'lab__vector__scalar_vs_vector': Vector_ScalarVsVector,
  'lab__vector__resultant_force': Vector_ResultantForce,
  'lab__vector__unit_vector': Vector_UnitVector,
  'lab__vector__cross_product': Vector_CrossProduct,
  'lab__vector__dot_product': Vector_DotProduct,
  'lab__vector__null_vector': Vector_NullVector,
  'lab__vector__acceleration_vector': Vector_AccelerationVector,
  'lab__vector__decomposition': Vector_Decomposition,
  'lab__vector__field_line': Vector_FieldLine,
  'lab__vector__vector_seal': Vector_VectorSeal,
};

// =====================================================================
// Tuning Collection typeId → component map
// =====================================================================
const TUNING_MAP: Record<string, React.ComponentType<any>> = {
  'lab__tuning__tension_check': Tuning_TensionCheck,
  'lab__tuning__dissonance_resolve': Tuning_DissonanceResolve,
  'lab__tuning__fundamental_frequency': Tuning_FundamentalFrequency,
  'lab__tuning__sympathetic_vibration': Tuning_SympatheticVibration,
  'lab__tuning__beat_frequency': Tuning_BeatFrequency,
  'lab__tuning__overtone_series': Tuning_OvertoneSeries,
  'lab__tuning__dead_spot': Tuning_DeadSpot,
  'lab__tuning__amplifier': Tuning_Amplifier,
  'lab__tuning__fade_out': Tuning_FadeOut,
  'lab__tuning__harmonic_seal': Tuning_HarmonicSeal,
};

// =====================================================================
// S121: THE FULCRUM (The Leverage Collection)
// =====================================================================
const FULCRUM_MAP: Record<string, React.ComponentType<any>> = {
  'lab__fulcrum__pivot_point': Fulcrum_PivotPoint,
  'lab__fulcrum__long_lever': Fulcrum_LongLever,
  'lab__fulcrum__pulley_system': Fulcrum_PulleySystem,
  'lab__fulcrum__gear_ratio': Fulcrum_GearRatio,
  'lab__fulcrum__wedge': Fulcrum_Wedge,
  'lab__fulcrum__screw': Fulcrum_Screw,
  'lab__fulcrum__counterweight': Fulcrum_Counterweight,
  'lab__fulcrum__domino': Fulcrum_Domino,
  'lab__fulcrum__tipping_point': Fulcrum_TippingPoint,
  'lab__fulcrum__fulcrum_seal': Fulcrum_FulcrumSeal,
};

// =====================================================================
// S122: THE CONDUCTOR (The Flow Collection)
// =====================================================================
const CONDUCTOR_MAP: Record<string, React.ComponentType<any>> = {
  'lab__conductor__resistance_check': Conductor_ResistanceCheck,
  'lab__conductor__grounding_wire': Conductor_GroundingWire,
  'lab__conductor__circuit_breaker': Conductor_CircuitBreaker,
  'lab__conductor__capacitor': Conductor_Capacitor,
  'lab__conductor__transformer': Conductor_Transformer,
  'lab__conductor__short_circuit': Conductor_ShortCircuit,
  'lab__conductor__parallel_circuit': Conductor_ParallelCircuit,
  'lab__conductor__switch': Conductor_Switch,
  'lab__conductor__ac_dc': Conductor_ACDC,
  'lab__conductor__conductor_seal': Conductor_ConductorSeal,
};

// =====================================================================
// S123: THE CATALYST III (The Reaction Collection)
// =====================================================================
const CATALYST_III_MAP: Record<string, React.ComponentType<any>> = {
  'lab__catalystiii__phase_change': CatalystIII_PhaseChange,
  'lab__catalystiii__precipitate': CatalystIII_Precipitate,
  'lab__catalystiii__activation_energy': CatalystIII_ActivationEnergy,
  'lab__catalystiii__compound': CatalystIII_Compound,
  'lab__catalystiii__solvent': CatalystIII_Solvent,
  'lab__catalystiii__chain_reaction': CatalystIII_ChainReaction,
  'lab__catalystiii__purification': CatalystIII_Purification,
  'lab__catalystiii__inert_gas': CatalystIII_InertGas,
  'lab__catalystiii__enzyme': CatalystIII_Enzyme,
  'lab__catalystiii__catalyst_seal': CatalystIII_CatalystSeal,
};

// =====================================================================
// S125: THE SIMULATOR (The Mental Model Collection)
// =====================================================================
const SIMULATOR_MAP: Record<string, React.ComponentType<any>> = {
  'lab__simulator__map_vs_territory': Simulator_MapVsTerritory,
  'lab__simulator__resolution_upgrade': Simulator_ResolutionUpgrade,
  'lab__simulator__frame_rate': Simulator_FrameRate,
  'lab__simulator__sandbox_mode': Simulator_SandboxMode,
  'lab__simulator__algorithm_audit': Simulator_AlgorithmAudit,
  'lab__simulator__rendering_distance': Simulator_RenderingDistance,
  'lab__simulator__glitch': Simulator_Glitch,
  'lab__simulator__compression': Simulator_Compression,
  'lab__simulator__user_interface': Simulator_UserInterface,
  'lab__simulator__simulator_seal': Simulator_SimulatorSeal,
};

// =====================================================================
// S126: THE EDITOR (The Narrative Collection)
// =====================================================================
const EDITOR_NARRATIVE_MAP: Record<string, React.ComponentType<any>> = {
  'lab__editor__jump_cut': Editor_JumpCut,
  'lab__editor__soundtrack_swap': Editor_SoundtrackSwap,
  'lab__editor__flashback_edit': Editor_FlashbackEdit,
  'lab__editor__voiceover': Editor_Voiceover,
  'lab__editor__b_roll': Editor_BRoll,
  'lab__editor__plot_twist': Editor_PlotTwist,
  'lab__editor__character_arc': Editor_CharacterArc,
  'lab__editor__foley': Editor_Foley,
  'lab__editor__directors_cut': Editor_DirectorsCut,
  'lab__editor__editor_seal': Editor_EditorSeal,
};

// =====================================================================
// S128: THE SCOUT (The Horizon Collection)
// =====================================================================
const SCOUT_MAP: Record<string, React.ComponentType<any>> = {
  'lab__scout__fog_of_war': Scout_FogOfWar,
  'lab__scout__breadcrumbs': Scout_Breadcrumbs,
  'lab__scout__high_ground': Scout_HighGround,
  'lab__scout__night_vision': Scout_NightVision,
  'lab__scout__edge': Scout_Edge,
  'lab__scout__sample': Scout_Sample,
  'lab__scout__compass_bearing': Scout_CompassBearing,
  'lab__scout__false_peak': Scout_FalsePeak,
  'lab__scout__signal_fire': Scout_SignalFire,
  'lab__scout__scout_seal': Scout_ScoutSeal,
};

// =====================================================================
// S129: THE WEAVER (The Pattern Collection)
// =====================================================================
const WEAVER_PATTERN_MAP: Record<string, React.ComponentType<any>> = {
  'lab__weaverpattern__thread_pull': WeaverPattern_ThreadPull,
  'lab__weaverpattern__knot': WeaverPattern_Knot,
  'lab__weaverpattern__tapestry': WeaverPattern_Tapestry,
  'lab__weaverpattern__fractal_zoom': WeaverPattern_FractalZoom,
  'lab__weaverpattern__spiders_web': WeaverPattern_SpidersWeb,
  'lab__weaverpattern__warp_and_weft': WeaverPattern_WarpAndWeft,
  'lab__weaverpattern__patchwork': WeaverPattern_Patchwork,
  'lab__weaverpattern__cut': WeaverPattern_Cut,
  'lab__weaverpattern__invisible_string': WeaverPattern_InvisibleString,
  'lab__weaverpattern__weaver_seal': WeaverPattern_WeaverSeal,
};

// =====================================================================
// S130: THE ANCHOR (The Stability Collection)
// =====================================================================
const ANCHOR_MAP: Record<string, React.ComponentType<any>> = {
  'lab__anchor__heavy_stone': Anchor_HeavyStone,
  'lab__anchor__deep_root': Anchor_DeepRoot,
  'lab__anchor__gyroscope': Anchor_Gyroscope,
  'lab__anchor__keel': Anchor_Keel,
  'lab__anchor__friction_brake': Anchor_FrictionBrake,
  'lab__anchor__center_of_mass': Anchor_CenterOfMass,
  'lab__anchor__deadman_anchor': Anchor_DeadmanAnchor,
  'lab__anchor__lighthouse': Anchor_Lighthouse,
  'lab__anchor__sediment': Anchor_Sediment,
  'lab__anchor__anchor_seal': Anchor_AnchorSeal,
};

// =====================================================================
// S131: THE STRATEGIST (The Game Theory Collection)
// =====================================================================
const GAME_STRATEGIST_MAP: Record<string, React.ComponentType<any>> = {
  'lab__strategist__first_mover': Strategist_FirstMover,
  'lab__strategist__sacrifice': Strategist_Sacrifice,
  'lab__strategist__titfortat': Strategist_TitForTat,
  'lab__strategist__fog_of_war': Strategist_FogOfWar,
  'lab__strategist__fork': Strategist_Fork,
  'lab__strategist__zugzwang': Strategist_Zugzwang,
  'lab__strategist__endgame': Strategist_Endgame,
  'lab__strategist__stalemate': Strategist_Stalemate,
  'lab__strategist__promotion': Strategist_Promotion,
  'lab__strategist__strategist_seal': Strategist_StrategistSeal,
};

// =====================================================================
// S132: THE NETWORK (The Connection Collection)
// =====================================================================
const NETWORK_MAP: Record<string, React.ComponentType<any>> = {
  'lab__network__node_strength': Network_NodeStrength,
  'lab__network__weak_tie': Network_WeakTie,
  'lab__network__viral_coefficient': Network_ViralCoefficient,
  'lab__network__echo_chamber': Network_EchoChamber,
  'lab__network__metcalfes_law': Network_MetcalfesLaw,
  'lab__network__packet_switching': Network_PacketSwitching,
  'lab__network__signal_boost': Network_SignalBoost,
  'lab__network__firewall': Network_Firewall,
  'lab__network__neural_net': Network_NeuralNet,
  'lab__network__network_seal': Network_NetworkSeal,
};

// =====================================================================
// S133: THE ARCHITECT (The Systems Collection)
// =====================================================================
const SYSTEMS_ARCHITECT_MAP: Record<string, React.ComponentType<any>> = {
  'lab__systemsarchitect__bottleneck': Architect_Bottleneck,
  'lab__systemsarchitect__feedback_delay': Architect_FeedbackDelay,
  'lab__systemsarchitect__redundancy': Architect_Redundancy,
  'lab__systemsarchitect__leverage_point': Architect_LeveragePoint,
  'lab__systemsarchitect__stock_and_flow': Architect_StockAndFlow,
  'lab__systemsarchitect__oscillation_damping': Architect_OscillationDamping,
  'lab__systemsarchitect__emergence': Architect_Emergence,
  'lab__systemsarchitect__scalability': Architect_Scalability,
  'lab__systemsarchitect__black_swan': Architect_BlackSwan,
  'lab__systemsarchitect__architect_seal': Architect_ArchitectSeal,
};

// =====================================================================
// S134: THE EVOLUTIONIST (The Adaptation Collection)
// =====================================================================
const EVOLUTIONIST_MAP: Record<string, React.ComponentType<any>> = {
  'lab__evolutionist__mutation': Evolutionist_Mutation,
  'lab__evolutionist__selection_pressure': Evolutionist_SelectionPressure,
  'lab__evolutionist__niche': Evolutionist_Niche,
  'lab__evolutionist__symbiosis': Evolutionist_Symbiosis,
  'lab__evolutionist__red_queen': Evolutionist_RedQueen,
  'lab__evolutionist__extinction_event': Evolutionist_ExtinctionEvent,
  'lab__evolutionist__sexual_selection': Evolutionist_SexualSelection,
  'lab__evolutionist__exaptation': Evolutionist_Exaptation,
  'lab__evolutionist__gene_drive': Evolutionist_GeneDrive,
  'lab__evolutionist__evolution_seal': Evolutionist_EvolutionSeal,
};

// =====================================================================
// S135: THE ECONOMIST (The Value Collection)
// =====================================================================
const ECONOMIST_MAP: Record<string, React.ComponentType<any>> = {
  'lab__economist__opportunity_cost': Economist_OpportunityCost,
  'lab__economist__sunk_cost': Economist_SunkCost,
  'lab__economist__compound_interest': Economist_CompoundInterest,
  'lab__economist__supply_and_demand': Economist_SupplyAndDemand,
  'lab__economist__asymmetric_bet': Economist_AsymmetricBet,
  'lab__economist__utility_function': Economist_UtilityFunction,
  'lab__economist__time_horizon': Economist_TimeHorizon,
  'lab__economist__arbitrage': Economist_Arbitrage,
  'lab__economist__invisible_hand': Economist_InvisibleHand,
  'lab__economist__economist_seal': Economist_EconomistSeal,
};

// =====================================================================
// S136: THE POLITICIAN (The Power Collection)
// =====================================================================
const POLITICIAN_MAP: Record<string, React.ComponentType<any>> = {
  'lab__politician__coalition': Politician_Coalition,
  'lab__politician__optics': Politician_Optics,
  'lab__politician__favor_bank': Politician_FavorBank,
  'lab__politician__strange_bedfellow': Politician_StrangeBedfellow,
  'lab__politician__silent_vote': Politician_SilentVote,
  'lab__politician__compromise': Politician_Compromise,
  'lab__politician__leverage': Politician_Leverage,
  'lab__politician__fall_guy': Politician_FallGuy,
  'lab__politician__long_game': Politician_LongGame,
  'lab__politician__politician_seal': Politician_PoliticianSeal,
};

// =====================================================================
// S137: THE WARRIOR II (The Conflict Collection)
// =====================================================================
const WARRIOR_II_MAP: Record<string, React.ComponentType<any>> = {
  'lab__warriorii__formless': WarriorII_Formless,
  'lab__warriorii__high_ground': WarriorII_HighGround,
  'lab__warriorii__retreat': WarriorII_Retreat,
  'lab__warriorii__spy': WarriorII_Spy,
  'lab__warriorii__burning_bridge': WarriorII_BurningBridge,
  'lab__warriorii__sun_at_your_back': WarriorII_SunAtYourBack,
  'lab__warriorii__empty_fort': WarriorII_EmptyFort,
  'lab__warriorii__flanking_maneuver': WarriorII_FlankingManeuver,
  'lab__warriorii__peace_treaty': WarriorII_PeaceTreaty,
  'lab__warriorii__warrior_seal': WarriorII_WarriorSeal,
};

// =====================================================================
// S138: THE SOVEREIGN (The Governance Collection)
// =====================================================================
const SOVEREIGN_MAP: Record<string, React.ComponentType<any>> = {
  'lab__sovereign__constitution': Sovereign_Constitution,
  'lab__sovereign__court': Sovereign_Court,
  'lab__sovereign__treasury': Sovereign_Treasury,
  'lab__sovereign__border': Sovereign_Border,
  'lab__sovereign__decree': Sovereign_Decree,
  'lab__sovereign__succession': Sovereign_Succession,
  'lab__sovereign__diplomaticimmunity': Sovereign_DiplomaticImmunity,
  'lab__sovereign__infrastructure': Sovereign_Infrastructure,
  'lab__sovereign__rebellion': Sovereign_Rebellion,
  'lab__sovereign__sovereign_seal': Sovereign_SovereignSeal,
};

// =====================================================================
// S139: THE HISTORIAN (The Time Collection)
// =====================================================================
const HISTORIAN_MAP: Record<string, React.ComponentType<any>> = {
  'lab__historian__lindyeffect': Historian_LindyEffect,
  'lab__historian__cycle': Historian_Cycle,
  'lab__historian__blackswan': Historian_BlackSwan,
  'lab__historian__renaissance': Historian_Renaissance,
  'lab__historian__ruins': Historian_Ruins,
  'lab__historian__pendulum': Historian_Pendulum,
  'lab__historian__goldenage': Historian_GoldenAge,
  'lab__historian__fourthturning': Historian_FourthTurning,
  'lab__historian__zeitgeist': Historian_Zeitgeist,
  'lab__historian__historian_seal': Historian_HistorianSeal,
};

// =====================================================================
// S140: THE GAME DESIGNER (The Meta Collection)
// =====================================================================
const GAME_DESIGNER_MAP: Record<string, React.ComponentType<any>> = {
  'lab__gamedesigner__infinitegame': GameDesigner_InfiniteGame,
  'lab__gamedesigner__incentivestructure': GameDesigner_IncentiveStructure,
  'lab__gamedesigner__mod': GameDesigner_Mod,
  'lab__gamedesigner__npc': GameDesigner_NPC,
  'lab__gamedesigner__levelup': GameDesigner_LevelUp,
  'lab__gamedesigner__bossfight': GameDesigner_BossFight,
  'lab__gamedesigner__savepoint': GameDesigner_SavePoint,
  'lab__gamedesigner__expansionpack': GameDesigner_ExpansionPack,
  'lab__gamedesigner__godmode': GameDesigner_GodMode,
  'lab__gamedesigner__atlas_seal': GameDesigner_AtlasSeal,
};

// =====================================================================
// MASTER RENDERER
// =====================================================================

interface NaviCueMasterRendererProps {
  navicueTypeData: any; // Row from v_figma_navicue_type_matrix
  onResponse: (response: any) => void;
  previewMode?: 'mobile' | 'desktop';
}

export function NaviCueMasterRenderer({
  navicueTypeData,
  onResponse,
  previewMode = 'mobile',
}: NaviCueMasterRendererProps) {
  const typeId = resolveTypeIdAlias(navicueTypeData?.navicue_type_id);
  const typeName = navicueTypeData?.navicue_type_name;
  const form = navicueTypeData?.form;
  const mechanism = navicueTypeData?.mechanism;
  const kbe = navicueTypeData?.kbe_layer;

  // Build normalised lookup key from the database record's fields
  const lookupKey = buildLookupKey(form || '', mechanism || '', kbe || '');

  // Condensed debug log (one line, not a wall)
  console.log(
    `[MasterRenderer] id=${typeId?.slice(-40)} form=${form} mech=${mechanism} kbe=${kbe} key=${lookupKey}`,
  );

  // ── 1. Identity Koan — match on exact typeId ──────────────────────
  if (typeId && IDENTITY_KOAN_MAP[typeId]) {
    const IKComponent = IDENTITY_KOAN_MAP[typeId];
    return (
      <IKComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1b. Novice Collection — match on exact typeId ─────────────────
  if (typeId && NOVICE_MAP[typeId]) {
    const NoviceComponent = NOVICE_MAP[typeId];
    return (
      <NoviceComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1c. Alchemist Collection — match on exact typeId ──────────────
  if (typeId && ALCHEMIST_MAP[typeId]) {
    const AlchemistComponent = ALCHEMIST_MAP[typeId];
    return (
      <AlchemistComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1d. Architect Collection — match on exact typeId ──────────────
  if (typeId && ARCHITECT_MAP[typeId]) {
    const ArchitectComponent = ARCHITECT_MAP[typeId];
    return (
      <ArchitectComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1e. Navigator Collection — match on exact typeId ──────────────
  if (typeId && NAVIGATOR_MAP[typeId]) {
    const NavigatorComponent = NAVIGATOR_MAP[typeId];
    return (
      <NavigatorComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1f. Sage Collection — match on exact typeId ──────────────
  if (typeId && SAGE_MAP[typeId]) {
    const SageComponent = SAGE_MAP[typeId];
    return (
      <SageComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1g. Mender Collection — match on exact typeId ──────────────
  if (typeId && MENDER_MAP[typeId]) {
    const MenderComponent = MENDER_MAP[typeId];
    return (
      <MenderComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1h. Diplomat Collection — match on exact typeId ──────────────
  if (typeId && DIPLOMAT_MAP[typeId]) {
    const DiplomatComponent = DIPLOMAT_MAP[typeId];
    return (
      <DiplomatComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1i. Weaver Collection — match on exact typeId ──────────────
  if (typeId && WEAVER_MAP[typeId]) {
    const WeaverComponent = WEAVER_MAP[typeId];
    return (
      <WeaverComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1j. Visionary Collection — match on exact typeId ──────────────
  if (typeId && VISIONARY_MAP[typeId]) {
    const VisionaryComponent = VISIONARY_MAP[typeId];
    return (
      <VisionaryComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1k. Luminary Collection — match on exact typeId ──────────────
  if (typeId && LUMINARY_MAP[typeId]) {
    const LuminaryComponent = LUMINARY_MAP[typeId];
    return (
      <LuminaryComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1l. Hacker Collection — match on exact typeId ──────────────
  if (typeId && HACKER_MAP[typeId]) {
    const HackerComponent = HACKER_MAP[typeId];
    return (
      <HackerComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1m. Chrononaut Collection — match on exact typeId ──────────────
  if (typeId && CHRONONAUT_MAP[typeId]) {
    const ChrononautComponent = CHRONONAUT_MAP[typeId];
    return (
      <ChrononautComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1n. Mycelium Collection — match on exact typeId ──────────────
  if (typeId && MYCELIUM_MAP[typeId]) {
    const MyceliumComponent = MYCELIUM_MAP[typeId];
    return (
      <MyceliumComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1o. Aesthete Collection — match on exact typeId ──────────────
  if (typeId && AESTHETE_MAP[typeId]) {
    const AestheteComponent = AESTHETE_MAP[typeId];
    return (
      <AestheteComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1p. Elemental Collection — match on exact typeId ──────────────
  if (typeId && ELEMENTAL_MAP[typeId]) {
    const ElementalComponent = ELEMENTAL_MAP[typeId];
    return (
      <ElementalComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1q. Phenomenologist Collection — match on exact typeId ──────────────
  if (typeId && PHENOMENOLOGIST_MAP[typeId]) {
    const PhenomenologistComponent = PHENOMENOLOGIST_MAP[typeId];
    return (
      <PhenomenologistComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1r. Alchemist II Collection — match on exact typeId ��─────────────
  if (typeId && ALCHEMISTII_MAP[typeId]) {
    const AlchemistIIComponent = ALCHEMISTII_MAP[typeId];
    return (
      <AlchemistIIComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1s. Servant Leader Collection — match on exact typeId ──────────────
  if (typeId && SERVANTLEADER_MAP[typeId]) {
    const ServantLeaderComponent = SERVANTLEADER_MAP[typeId];
    return (
      <ServantLeaderComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1t. Omega Point Collection — match on exact typeId ──────────────
  if (typeId && OMEGAPOINT_MAP[typeId]) {
    const OmegaPointComponent = OMEGAPOINT_MAP[typeId];
    return (
      <OmegaPointComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1u. Source Collection — match on exact typeId ──────────────
  if (typeId && SOURCE_MAP[typeId]) {
    const SourceComponent = SOURCE_MAP[typeId];
    return (
      <SourceComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1v. Stoic Collection — match on exact typeId ──────────────
  if (typeId && STOIC_MAP[typeId]) {
    const StoicComponent = STOIC_MAP[typeId];
    return (
      <StoicComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1w. Lover Collection — match on exact typeId ───────���──────
  if (typeId && LOVER_MAP[typeId]) {
    const LoverComponent = LOVER_MAP[typeId];
    return (
      <LoverComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1x. Athlete Collection — match on exact typeId ─────────────
  if (typeId && ATHLETE_MAP[typeId]) {
    const AthleteComponent = ATHLETE_MAP[typeId];
    return (
      <AthleteComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1y. Strategist Collection — match on exact typeId ──────────
  if (typeId && STRATEGIST_MAP[typeId]) {
    const StrategistComponent = STRATEGIST_MAP[typeId];
    return (
      <StrategistComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1z. Wilding Collection — match on exact typeId ─────────────
  if (typeId && WILDING_MAP[typeId]) {
    const WildingComponent = WILDING_MAP[typeId];
    return (
      <WildingComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1aa. Guardian Collection — match on exact typeId ───────────
  if (typeId && GUARDIAN_MAP[typeId]) {
    const GuardianComponent = GUARDIAN_MAP[typeId];
    return (
      <GuardianComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ab. Futurist Collection — match on exact typeId ──────────
  if (typeId && FUTURIST_MAP[typeId]) {
    const FuturistComponent = FUTURIST_MAP[typeId];
    return (
      <FuturistComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ac. Mystic Collection — match on exact typeId ─────────────
  if (typeId && MYSTIC_MAP[typeId]) {
    const MysticComponent = MYSTIC_MAP[typeId];
    return (
      <MysticComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ad. Infinite Player Collection — match on exact typeId ────
  if (typeId && INFINITE_MAP[typeId]) {
    const InfiniteComponent = INFINITE_MAP[typeId];
    return (
      <InfiniteComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ae. Reality Bender Collection — match on exact typeId ─────
  if (typeId && BENDER_MAP[typeId]) {
    const BenderComponent = BENDER_MAP[typeId];
    return (
      <BenderComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1af. Magnet Collection — match on exact typeId ──────────────
  if (typeId && MAGNET_MAP[typeId]) {
    const MagnetComponent = MAGNET_MAP[typeId];
    return (
      <MagnetComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ag. Oracle Collection — match on exact typeId ─────────────
  if (typeId && ORACLE_MAP[typeId]) {
    const OracleComponent = ORACLE_MAP[typeId];
    return (
      <OracleComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ah. Maestro Collection — match on exact typeId ────────────
  if (typeId && MAESTRO_MAP[typeId]) {
    const MaestroComponent = MAESTRO_MAP[typeId];
    return (
      <MaestroComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ai. Shaman Collection — match on exact typeId ──────────────
  if (typeId && SHAMAN_MAP[typeId]) {
    const ShamanComponent = SHAMAN_MAP[typeId];
    return (
      <ShamanComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1aj. Stargazer Collection — match on exact typeId ─────────────
  if (typeId && STARGAZER_MAP[typeId]) {
    const StargazerComponent = STARGAZER_MAP[typeId];
    return (
      <StargazerComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ak. Myth Maker Collection — match on exact typeId ─────────────
  if (typeId && MYTHMAKER_MAP[typeId]) {
    const MythMakerComponent = MYTHMAKER_MAP[typeId];
    return (
      <MythMakerComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1al. Shape Shifter Collection — match on exact typeId ──────────
  if (typeId && SHAPESHIFTER_MAP[typeId]) {
    const ShapeShifterComponent = SHAPESHIFTER_MAP[typeId];
    return (
      <ShapeShifterComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1am. Dream Walker Collection — match on exact typeId ───────────
  if (typeId && DREAMWALKER_MAP[typeId]) {
    const DreamWalkerComponent = DREAMWALKER_MAP[typeId];
    return (
      <DreamWalkerComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1an. Magnum Opus Collection — match on exact typeId ────────────
  if (typeId && MAGNUMOPUS_MAP[typeId]) {
    const MagnumOpusComponent = MAGNUMOPUS_MAP[typeId];
    return (
      <MagnumOpusComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ao. Prism Collection — match on exact typeId ─────────────────
  if (typeId && PRISM_MAP[typeId]) {
    const PrismComponent = PRISM_MAP[typeId];
    return (
      <PrismComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ap. Graviton Collection — match on exact typeId ──────────────
  if (typeId && GRAVITON_MAP[typeId]) {
    const GravitonComponent = GRAVITON_MAP[typeId];
    return (
      <GravitonComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1aq. Observer Collection — match on exact typeId ──────────────
  if (typeId && OBSERVER_MAP[typeId]) {
    const ObserverComponent = OBSERVER_MAP[typeId];
    return (
      <ObserverComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ar. TimeCapsule Collection — match on exact typeId ───────────
  if (typeId && TIMECAPSULE_MAP[typeId]) {
    const TimeCapsuleComponent = TIMECAPSULE_MAP[typeId];
    return (
      <TimeCapsuleComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1as. LoopBreaker Collection — match on exact typeId ───────────
  if (typeId && LOOPBREAKER_MAP[typeId]) {
    const LoopBreakerComponent = LOOPBREAKER_MAP[typeId];
    return (
      <LoopBreakerComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1at. RetroCausal Collection — match on exact typeId ───────────
  if (typeId && RETROCAUSAL_MAP[typeId]) {
    const RetroCausalComponent = RETROCAUSAL_MAP[typeId];
    return (
      <RetroCausalComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1au. Threshold Collection — match on exact typeId ──────────────
  if (typeId && THRESHOLD_MAP[typeId]) {
    const ThresholdComponent = THRESHOLD_MAP[typeId];
    return (
      <ThresholdComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1av. Soma Collection — match on exact typeId ──────────────────
  if (typeId && SOMA_MAP[typeId]) {
    const SomaComponent = SOMA_MAP[typeId];
    return (
      <SomaComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1aw. Frequency Collection — match on exact typeId ─────────────
  if (typeId && FREQUENCY_MAP[typeId]) {
    const FrequencyComponent = FREQUENCY_MAP[typeId];
    return (
      <FrequencyComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ax. Tuner Collection — match on exact typeId ─────────────────
  if (typeId && TUNER_MAP[typeId]) {
    const TunerComponent = TUNER_MAP[typeId];
    return (
      <TunerComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ay. Broadcast Collection — match on exact typeId ─────────────
  if (typeId && BROADCAST_MAP[typeId]) {
    const BroadcastComponent = BROADCAST_MAP[typeId];
    return (
      <BroadcastComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1az. Schrödinger Collection — match on exact typeId ───────────
  if (typeId && SCHRODINGER_MAP[typeId]) {
    const SchrodingerComponent = SCHRODINGER_MAP[typeId];
    return (
      <SchrodingerComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ba. Glitch Collection — match on exact typeId ────────────────
  if (typeId && GLITCH_MAP[typeId]) {
    const GlitchComponent = GLITCH_MAP[typeId];
    return (
      <GlitchComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1bb. Construct Collection — match on exact typeId ─────────────
  if (typeId && CONSTRUCT_MAP[typeId]) {
    const ConstructComponent = CONSTRUCT_MAP[typeId];
    return (
      <ConstructComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1bc. Biographer Collection — match on exact typeId ────────────
  if (typeId && BIOGRAPHER_MAP[typeId]) {
    const BiographerComponent = BIOGRAPHER_MAP[typeId];
    return (
      <BiographerComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1bd. Optician Collection — match on exact typeId ──────────────
  if (typeId && OPTICIAN_MAP[typeId]) {
    const OpticianComponent = OPTICIAN_MAP[typeId];
    return (
      <OpticianComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1be. Interpreter Collection — match on exact typeId ───────────
  if (typeId && INTERPRETER_MAP[typeId]) {
    const InterpreterComponent = INTERPRETER_MAP[typeId];
    return (
      <InterpreterComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1bf. Social Physics Collection — match on exact typeId ─────────
  if (typeId && SOCIALPHYSICS_MAP[typeId]) {
    const SPComponent = SOCIALPHYSICS_MAP[typeId];
    return (
      <SPComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1c0. Tribalist Collection — match on exact typeId ─────────────
  if (typeId && TRIBALIST_MAP[typeId]) {
    const TribalistComponent = TRIBALIST_MAP[typeId];
    return (
      <TribalistComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1c1. Valuator Collection — match on exact typeId ──────────────
  if (typeId && VALUATOR_MAP[typeId]) {
    const ValuatorComponent = VALUATOR_MAP[typeId];
    return (
      <ValuatorComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1c2. Editor Collection — match on exact typeId ────────────────
  if (typeId && EDITOR_MAP[typeId]) {
    const EditorComponent = EDITOR_MAP[typeId];
    return (
      <EditorComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1c3. Grandmaster Collection — match on exact typeId ───────────
  if (typeId && GRANDMASTER_MAP[typeId]) {
    const GrandmasterComponent = GRANDMASTER_MAP[typeId];
    return (
      <GrandmasterComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1c4. Catalyst Collection — match on exact typeId ──────────────
  if (typeId && CATALYST_MAP[typeId]) {
    const CatalystComponent = CATALYST_MAP[typeId];
    return (
      <CatalystComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1c5. Kinetic Collection — match on exact typeId ───────────────
  if (typeId && KINETIC_MAP[typeId]) {
    const KineticComponent = KINETIC_MAP[typeId];
    return (
      <KineticComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1c6. Adaptive Collection — match on exact typeId ──────────────
  if (typeId && ADAPTIVE_MAP[typeId]) {
    const AdaptiveComponent = ADAPTIVE_MAP[typeId];
    return (
      <AdaptiveComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1c7. Shadow Worker Collection — match on exact typeId ─────────
  if (typeId && SHADOW_MAP[typeId]) {
    const ShadowComponent = SHADOW_MAP[typeId];
    return (
      <ShadowComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1c8. Ancestor Collection — match on exact typeId ──────────────
  if (typeId && ANCESTOR_MAP[typeId]) {
    const AncestorComponent = ANCESTOR_MAP[typeId];
    return (
      <AncestorComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1c9. Trickster Collection — match on exact typeId ─────────────
  if (typeId && TRICKSTER_MAP[typeId]) {
    const TricksterComponent = TRICKSTER_MAP[typeId];
    return (
      <TricksterComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ca. Astronaut Collection — match on exact typeId ─────────────
  if (typeId && ASTRONAUT_MAP[typeId]) {
    const AstronautComponent = ASTRONAUT_MAP[typeId];
    return (
      <AstronautComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1cb. Wonderer Collection — match on exact typeId ──────────────
  if (typeId && WONDERER_MAP[typeId]) {
    const WondererComponent = WONDERER_MAP[typeId];
    return (
      <WondererComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1cc. Surfer Collection — match on exact typeId ────────────────
  if (typeId && SURFER_MAP[typeId]) {
    const SurferComponent = SURFER_MAP[typeId];
    return (
      <SurferComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1cd. Meaning Maker Collection — match on exact typeId ─────────
  if (typeId && MEANING_MAP[typeId]) {
    const MeaningComponent = MEANING_MAP[typeId];
    return (
      <MeaningComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ce. Servant Collection — match on exact typeId ───────────────
  if (typeId && SERVANT_MAP[typeId]) {
    const ServantComponent = SERVANT_MAP[typeId];
    return (
      <ServantComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1cf. Synthesis Collection — match on exact typeId ─────────────
  if (typeId && SYNTHESIS_MAP[typeId]) {
    const SynthesisComponent = SYNTHESIS_MAP[typeId];
    return (
      <SynthesisComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1d0. Future Weaver Collection — match on exact typeId ─────────
  if (typeId && FUTUREWEAVER_MAP[typeId]) {
    const FutureWeaverComponent = FUTUREWEAVER_MAP[typeId];
    return (
      <FutureWeaverComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1d1. Composer Collection — match on exact typeId ──────────────
  if (typeId && COMPOSER_MAP[typeId]) {
    const ComposerComponent = COMPOSER_MAP[typeId];
    return (
      <ComposerComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1d2. Zenith Collection — match on exact typeId ────────────────
  if (typeId && ZENITH_MAP[typeId]) {
    const ZenithComponent = ZENITH_MAP[typeId];
    return (
      <ZenithComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1d3. Multiverse Collection — match on exact typeId ─────────
  if (typeId && MULTIVERSE_MAP[typeId]) {
    const MultiverseComponent = MULTIVERSE_MAP[typeId];
    return (
      <MultiverseComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1d7. Elementalist Collection — match on exact typeId ───────────
  if (typeId && ELEMENTALIST_MAP[typeId]) {
    const ElementalistComponent = ELEMENTALIST_MAP[typeId];
    return (
      <ElementalistComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1d8. Mentat Collection — match on exact typeId ────────────────
  if (typeId && MENTAT_MAP[typeId]) {
    const MentatComponent = MENTAT_MAP[typeId];
    return (
      <MentatComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1d9. Intuition Collection — match on exact typeId ─────────────
  if (typeId && INTUITION_MAP[typeId]) {
    const IntuitionComponent = INTUITION_MAP[typeId];
    return (
      <IntuitionComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1da. Engineer Collection — match on exact typeId ──────────────
  if (typeId && ENGINEER_MAP[typeId]) {
    const EngineerComponent = ENGINEER_MAP[typeId];
    return (
      <EngineerComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1db. AlchemistIV Collection — match on exact typeId ───────────
  if (typeId && ALCHEMISTIV_MAP[typeId]) {
    const AlchemistIVComponent = ALCHEMISTIV_MAP[typeId];
    return (
      <AlchemistIVComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1dc. Cognitive Collection — match on exact typeId ─────────────
  if (typeId && COGNITIVE_MAP[typeId]) {
    const CognitiveComponent = COGNITIVE_MAP[typeId];
    return (
      <CognitiveComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1dd. Sage Wisdom Collection — match on exact typeId ────────
  if (typeId && SAGE_WISDOM_MAP[typeId]) {
    const SageWisdomComponent = SAGE_WISDOM_MAP[typeId];
    return (
      <SageWisdomComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1de. Gaia Collection — match on exact typeId ──────────────
  if (typeId && GAIA_MAP[typeId]) {
    const GaiaComponent = GAIA_MAP[typeId];
    return (
      <GaiaComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1df. Mystic Transcendence Collection — match on exact typeId
  if (typeId && MYSTIC_TRANS_MAP[typeId]) {
    const MysticTransComponent = MYSTIC_TRANS_MAP[typeId];
    return (
      <MysticTransComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1dg. Ascendant Collection — match on exact typeId ─────────
  if (typeId && ASCENDANT_MAP[typeId]) {
    const AscendantComponent = ASCENDANT_MAP[typeId];
    return (
      <AscendantComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1dh. Gardener II Collection — match on exact typeId ───────
  if (typeId && GARDENER_MAP[typeId]) {
    const GardenerComponent = GARDENER_MAP[typeId];
    return (
      <GardenerComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1di. Ancestor II Legacy Collection — match on exact typeId ─
  if (typeId && ANCESTOR_LEGACY_MAP[typeId]) {
    const AncestorIIComponent = ANCESTOR_LEGACY_MAP[typeId];
    return (
      <AncestorIIComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1dj. Mastery Collection — match on exact typeId ─────────────
  if (typeId && MASTERY_MAP[typeId]) {
    const MasteryComponent = MASTERY_MAP[typeId];
    return (
      <MasteryComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1dk. Horizon Collection — match on exact typeId ────────────
  if (typeId && HORIZON_MAP[typeId]) {
    const HorizonComponent = HORIZON_MAP[typeId];
    return (
      <HorizonComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1dl. Void Collection — match on exact typeId ────────────────
  if (typeId && VOID_MAP[typeId]) {
    const VoidComponent = VOID_MAP[typeId];
    return (
      <VoidComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1dm. Unity Collection — match on exact typeId ──────────────
  if (typeId && UNITY_MAP[typeId]) {
    const UnityComponent = UNITY_MAP[typeId];
    return (
      <UnityComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1dn. Ouroboros Collection — match on exact typeId ──────────
  if (typeId && OUROBOROS_MAP[typeId]) {
    const OuroborosComponent = OUROBOROS_MAP[typeId];
    return (
      <OuroborosComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1d4. Ethicist Collection — match on exact typeId ──────────────
  if (typeId && ETHICIST_MAP[typeId]) {
    const EthicistComponent = ETHICIST_MAP[typeId];
    return (
      <EthicistComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1dp. Projector Collection -- match on exact typeId ──────────────
  if (typeId && PROJECTOR_MAP[typeId]) {
    const ProjectorComponent = PROJECTOR_MAP[typeId];
    return (
      <ProjectorComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1dq. Chronomancer Collection -- match on exact typeId ─────────
  if (typeId && CHRONOMANCER_MAP[typeId]) {
    const ChronomancerComponent = CHRONOMANCER_MAP[typeId];
    return (
      <ChronomancerComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1dq2. Resonator Collection -- match on exact typeId ────────────
  if (typeId && RESONATOR_MAP[typeId]) {
    const ResonatorComponent = RESONATOR_MAP[typeId];
    return (
      <ResonatorComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1dr. Materialist Collection -- match on exact typeId ──────────
  if (typeId && MATERIALIST_MAP[typeId]) {
    const MaterialistComponent = MATERIALIST_MAP[typeId];
    return (
      <MaterialistComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ds. Refractor Collection -- match on exact typeId ─────────────
  if (typeId && REFRACTOR_MAP[typeId]) {
    const RefractorComponent = REFRACTOR_MAP[typeId];
    return (
      <RefractorComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1dt. Engine Collection -- match on exact typeId ────────────────
  if (typeId && ENGINE_MAP[typeId]) {
    const EngineComponent = ENGINE_MAP[typeId];
    return (
      <EngineComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1dv. Quantum Architect Collection -- match on exact typeId ─────
  if (typeId && QUANTUM_ARCHITECT_MAP[typeId]) {
    const QAComponent = QUANTUM_ARCHITECT_MAP[typeId];
    return (
      <QAComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1dw. Transmuter Collection -- match on exact typeId ────────────
  if (typeId && TRANSMUTER_MAP[typeId]) {
    const TransmuterComponent = TRANSMUTER_MAP[typeId];
    return (
      <TransmuterComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1dx. Cyberneticist Collection -- match on exact typeId ─────────
  if (typeId && CYBERNETICIST_MAP[typeId]) {
    const CyberneticistComponent = CYBERNETICIST_MAP[typeId];
    return (
      <CyberneticistComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1dy. FieldArchitect Collection -- match on exact typeId ────────
  if (typeId && FIELD_ARCHITECT_MAP[typeId]) {
    const FieldArchitectComponent = FIELD_ARCHITECT_MAP[typeId];
    return (
      <FieldArchitectComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1dz. Kineticist Collection -- match on exact typeId ────────────
  if (typeId && KINETICIST_MAP[typeId]) {
    const KineticistComponent = KINETICIST_MAP[typeId];
    return (
      <KineticistComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ea. Crystal Collection -- match on exact typeId ───────────────
  if (typeId && CRYSTAL_MAP[typeId]) {
    const CrystalComponent = CRYSTAL_MAP[typeId];
    return (
      <CrystalComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1eb. Hydrodynamicist Collection -- match on exact typeId ───────
  if (typeId && HYDRODYNAMICIST_MAP[typeId]) {
    const HydroComponent = HYDRODYNAMICIST_MAP[typeId];
    return (
      <HydroComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ec. Aviator Collection -- match on exact typeId ───────────────
  if (typeId && AVIATOR_MAP[typeId]) {
    const AviatorComponent = AVIATOR_MAP[typeId];
    return (
      <AviatorComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ed. Tensegrity Collection -- match on exact typeId ────────────
  if (typeId && TENSEGRITY_MAP[typeId]) {
    const TensegrityComponent = TENSEGRITY_MAP[typeId];
    return (
      <TensegrityComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ee. Wayfinder Collection -- match on exact typeId ─────────────
  if (typeId && WAYFINDER_MAP[typeId]) {
    const WayfinderComponent = WAYFINDER_MAP[typeId];
    return (
      <WayfinderComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ef. Receiver Collection -- match on exact typeId ──────────────
  if (typeId && RECEIVER_MAP[typeId]) {
    const ReceiverComponent = RECEIVER_MAP[typeId];
    return (
      <ReceiverComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1eg. Vector Collection -- match on exact typeId ────────────────
  if (typeId && VECTOR_MAP[typeId]) {
    const VectorComponent = VECTOR_MAP[typeId];
    return (
      <VectorComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1eh. Tuning Collection -- match on exact typeId ───────────────
  if (typeId && TUNING_MAP[typeId]) {
    const TuningComponent = TUNING_MAP[typeId];
    return (
      <TuningComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ei. Fulcrum Collection -- match on exact typeId ────────────────
  if (typeId && FULCRUM_MAP[typeId]) {
    const FulcrumComponent = FULCRUM_MAP[typeId];
    return (
      <FulcrumComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ej. Conductor Collection -- match on exact typeId ────────────────
  if (typeId && CONDUCTOR_MAP[typeId]) {
    const ConductorComponent = CONDUCTOR_MAP[typeId];
    return (
      <ConductorComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ek. Catalyst III Collection -- match on exact typeId ─────────────
  if (typeId && CATALYST_III_MAP[typeId]) {
    const CatalystComponent = CATALYST_III_MAP[typeId];
    return (
      <CatalystComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1em. Simulator Collection -- match on exact typeId ────────────────
  if (typeId && SIMULATOR_MAP[typeId]) {
    const SimulatorComponent = SIMULATOR_MAP[typeId];
    return (
      <SimulatorComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1en. Editor Narrative Collection -- match on exact typeId ──────────
  if (typeId && EDITOR_NARRATIVE_MAP[typeId]) {
    const EditorComponent = EDITOR_NARRATIVE_MAP[typeId];
    return (
      <EditorComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1eo. Scout Collection -- match on exact typeId ────────────────────
  if (typeId && SCOUT_MAP[typeId]) {
    const ScoutComponent = SCOUT_MAP[typeId];
    return (
      <ScoutComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ep. Weaver Pattern Collection -- match on exact typeId ───────────
  if (typeId && WEAVER_PATTERN_MAP[typeId]) {
    const WPComponent = WEAVER_PATTERN_MAP[typeId];
    return (
      <WPComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1eq. Anchor Collection -- match on exact typeId ───────────────────
  if (typeId && ANCHOR_MAP[typeId]) {
    const AnchorComponent = ANCHOR_MAP[typeId];
    return (
      <AnchorComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1er. S131 Game Strategist Collection -- match on exact typeId ──────
  if (typeId && GAME_STRATEGIST_MAP[typeId]) {
    const StratComponent = GAME_STRATEGIST_MAP[typeId];
    return (
      <StratComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1es. Network Collection -- match on exact typeId ──────────────────
  if (typeId && NETWORK_MAP[typeId]) {
    const NetComponent = NETWORK_MAP[typeId];
    return (
      <NetComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1et. Systems Architect Collection -- match on exact typeId ────────
  if (typeId && SYSTEMS_ARCHITECT_MAP[typeId]) {
    const SysArchComponent = SYSTEMS_ARCHITECT_MAP[typeId];
    return (
      <SysArchComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1eu. Evolutionist Collection -- match on exact typeId ─────────────
  if (typeId && EVOLUTIONIST_MAP[typeId]) {
    const EvoComponent = EVOLUTIONIST_MAP[typeId];
    return (
      <EvoComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ev. Economist Collection -- match on exact typeId ────────────────
  if (typeId && ECONOMIST_MAP[typeId]) {
    const EconComponent = ECONOMIST_MAP[typeId];
    return (
      <EconComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ew. Politician Collection -- match on exact typeId ───────────────
  if (typeId && POLITICIAN_MAP[typeId]) {
    const PolComponent = POLITICIAN_MAP[typeId];
    return (
      <PolComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ex. Warrior II Collection -- match on exact typeId ───────────────
  if (typeId && WARRIOR_II_MAP[typeId]) {
    const W2Component = WARRIOR_II_MAP[typeId];
    return (
      <W2Component
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ey. Sovereign Collection -- match on exact typeId ────────────────
  if (typeId && SOVEREIGN_MAP[typeId]) {
    const SovComponent = SOVEREIGN_MAP[typeId];
    return (
      <SovComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1ez. Historian Collection -- match on exact typeId ────────────────
  if (typeId && HISTORIAN_MAP[typeId]) {
    const HistComponent = HISTORIAN_MAP[typeId];
    return (
      <HistComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1fa. Game Designer Collection -- match on exact typeId ────────────
  if (typeId && GAME_DESIGNER_MAP[typeId]) {
    const GDComponent = GAME_DESIGNER_MAP[typeId];
    return (
      <GDComponent
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 1fb. Atomic Library Collection -- generated by specimen ranges ─────
  const atomicSpec = getAtomicSpecByTypeId(typeId);
  if (atomicSpec) {
    return (
      <AtomicNaviCueRenderer
        spec={atomicSpec}
        data={navicueTypeData}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 2. Bespoke implementations — match on form+mechanism+kbe ──────
  const BespokeComponent = BESPOKE_MAP[lookupKey];
  if (BespokeComponent) {
    return (
      <BespokeComponent
        data={navicueTypeData}
        primary_prompt={navicueTypeData?.primary_prompt || navicueTypeData?.navicue_type_name || 'Reflect...'}
        cta_primary={navicueTypeData?.cta_primary || 'Continue'}
        onComplete={() => onResponse({ completed: true })}
      />
    );
  }

  // ── 3. Fallback ──────────────────────────────────────────────────
  return <NaviCueFallback navicueTypeData={navicueTypeData} bespokeCount={BESPOKE_COUNT} />;
}


// =====================================================================
// FALLBACK (shows what's missing)
// =====================================================================

function NaviCueFallback({
  navicueTypeData,
  bespokeCount,
}: {
  navicueTypeData: any;
  bespokeCount: number;
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '32px',
        color: 'rgba(255, 255, 255, 0.6)',
      }}
    >
      <div>
        <div style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.8 }}>
          NaviCue Component Not Yet Built
        </div>
        <div style={{ fontSize: '12px', opacity: 0.5, fontFamily: 'monospace' }}>
          {navicueTypeData?.navicue_type_name || 'Unknown Type'}
        </div>
        <div style={{ fontSize: '11px', opacity: 0.4, marginTop: '16px', lineHeight: 1.6 }}>
          Form: {navicueTypeData?.form || 'N/A'}
          <br />
          Intent: {navicueTypeData?.intent || 'N/A'}
          <br />
          Mechanism: {navicueTypeData?.mechanism || 'N/A'}
          <br />
          KBE: {navicueTypeData?.kbe_layer || 'N/A'}
        </div>
        <div
          style={{
            fontSize: '10px',
            opacity: 0.25,
            marginTop: '20px',
            fontFamily: 'monospace',
          }}
        >
          {bespokeCount + 5 + 80} implementations wired
        </div>
      </div>
    </div>
  );
}
