/**
 * ATLAS SERIES METADATA
 * 
 * Compact series-level metadata for the Atlas Dashboard.
 * 1000 specimens across 95 narrative acts + Foundation.
 * 
 * Centuries:
 *   Foundation (Series I-XIII, 50 specimens)
 *   1st Century: Acts 0-9  (Series 6-15,  ~97 specimens)
 *   2nd Century: Acts 10-19 (Series 16-25, 100 specimens)
 *   3rd Century: Acts 20-29 (Series 26-35, 100 specimens)
 *   4th Century: Acts 30-39 (Series 36-45, 100 specimens)
 *   5th Century: Acts 40-49 (Series 46-55, 100 specimens)
 *   6th Century: Acts 50-59 (Series 56-65, 100 specimens)
 *   7th Century: Acts 60-69 (Series 66-75, 100 specimens)
 *   8th Century: Acts 70-79 (Series 76-85, 100 specimens)
 *   9th Century: Acts 80-94 (Series 86-100, 152 specimens)
 */

export interface SeriesMeta {
  seriesNumber: number;
  name: string;
  collection: string;
  prefix: string;
  actLabel: string;
  century: number;
  specimenCount: number;
  magicSignature: string;
  accentHue: string; // hsla color
}

// ── Foundation Series (I-XIII) ───────────────────────────────
const FOUNDATION_SERIES: SeriesMeta[] = [
  { seriesNumber: 0, name: 'FOUNDATION', collection: 'The Original 5', prefix: 'Foundation_', actLabel: 'Foundation', century: 0, specimenCount: 5, magicSignature: 'sacred_ordinary', accentHue: 'hsla(35, 60%, 60%, 0.7)' },
  { seriesNumber: 1, name: 'ACT I', collection: 'Metacognition Focus', prefix: 'ActI_', actLabel: 'Act I', century: 0, specimenCount: 4, magicSignature: 'witness_ritual', accentHue: 'hsla(210, 40%, 55%, 0.7)' },
  { seriesNumber: 2, name: 'ACT II', collection: 'Exposure + Activation', prefix: 'ActII_', actLabel: 'Act II', century: 0, specimenCount: 4, magicSignature: 'sensory_cinema', accentHue: 'hsla(15, 55%, 52%, 0.7)' },
  { seriesNumber: 3, name: 'ACT III', collection: 'Self-Compassion', prefix: 'ActIII_', actLabel: 'Act III', century: 0, specimenCount: 2, magicSignature: 'sacred_ordinary', accentHue: 'hsla(280, 30%, 58%, 0.7)' },
  { seriesNumber: 4, name: 'ACT IV', collection: 'Values + Activation', prefix: 'ActIV_', actLabel: 'Act IV', century: 0, specimenCount: 3, magicSignature: 'poetic_precision', accentHue: 'hsla(10, 45%, 50%, 0.7)' },
  { seriesNumber: 5, name: 'ACT V', collection: 'Identity Koans', prefix: 'ActV_', actLabel: 'Act V', century: 0, specimenCount: 2, magicSignature: 'koan_paradox', accentHue: 'hsla(240, 45%, 55%, 0.7)' },
  { seriesNumber: 50, name: 'ACT VI', collection: 'The Deepening', prefix: 'ActVI_', actLabel: 'Act VI', century: 0, specimenCount: 3, magicSignature: 'science_x_soul', accentHue: 'hsla(330, 35%, 52%, 0.7)' },
  { seriesNumber: 51, name: 'ACT VII', collection: 'The Moving', prefix: 'ActVII_', actLabel: 'Act VII', century: 0, specimenCount: 3, magicSignature: 'sacred_ordinary', accentHue: 'hsla(120, 35%, 45%, 0.7)' },
  { seriesNumber: 52, name: 'ACT VIII', collection: 'The Facing', prefix: 'ActVIII_', actLabel: 'Act VIII', century: 0, specimenCount: 2, magicSignature: 'sensory_cinema', accentHue: 'hsla(225, 40%, 50%, 0.7)' },
  { seriesNumber: 53, name: 'ACT IX', collection: 'The Knowing', prefix: 'ActIX_', actLabel: 'Act IX', century: 0, specimenCount: 2, magicSignature: 'witness_ritual', accentHue: 'hsla(270, 40%, 52%, 0.7)' },
  { seriesNumber: 54, name: 'ACT X', collection: 'The Tender Deepening', prefix: 'ActX_', actLabel: 'Act X', century: 0, specimenCount: 5, magicSignature: 'sacred_ordinary', accentHue: 'hsla(60, 40%, 52%, 0.7)' },
  { seriesNumber: 55, name: 'ACT XI', collection: 'The Second Sight', prefix: 'ActXI_', actLabel: 'Act XI', century: 0, specimenCount: 5, magicSignature: 'witness_ritual', accentHue: 'hsla(205, 45%, 48%, 0.7)' },
  { seriesNumber: 56, name: 'ACT XII', collection: 'The Gathering', prefix: 'ActXII_', actLabel: 'Act XII', century: 0, specimenCount: 5, magicSignature: 'poetic_precision', accentHue: 'hsla(18, 55%, 50%, 0.7)' },
  { seriesNumber: 57, name: 'ACT XIII', collection: 'The Homecoming', prefix: 'ActXIII_', actLabel: 'Act XIII', century: 0, specimenCount: 5, magicSignature: 'sacred_ordinary', accentHue: 'hsla(262, 32%, 50%, 0.7)' },
];

// ── Numbered Series (6-99) ──────────────────────────────────
const NUMBERED_SERIES: SeriesMeta[] = [
  // 1st Century — Acts 0-9
  { seriesNumber: 6,  name: 'THE NOVICE',         collection: 'The Awakening Collection',     prefix: 'Novice_',        actLabel: 'Act 0',  century: 1, specimenCount: 10, magicSignature: 'pattern_glitch',    accentHue: 'hsla(250, 55%, 62%, 0.7)' },
  { seriesNumber: 7,  name: 'THE ALCHEMIST',      collection: 'The Transmutation Collection', prefix: 'Alchemist_',     actLabel: 'Act 1',  century: 1, specimenCount: 10, magicSignature: 'science_x_soul',    accentHue: 'hsla(200, 45%, 55%, 0.7)' },
  { seriesNumber: 8,  name: 'THE ARCHITECT',       collection: 'The Identity Collection',      prefix: 'Architect_',     actLabel: 'Act 2',  century: 1, specimenCount: 10, magicSignature: 'sacred_ordinary',   accentHue: 'hsla(35, 55%, 55%, 0.7)' },
  { seriesNumber: 9,  name: 'THE NAVIGATOR',       collection: 'The Flow Collection',          prefix: 'Navigator_',     actLabel: 'Act 3',  century: 1, specimenCount: 10, magicSignature: 'poetic_precision',  accentHue: 'hsla(200, 40%, 52%, 0.7)' },
  { seriesNumber: 10, name: 'THE SAGE',            collection: 'The Wisdom Collection',        prefix: 'Sage_',          actLabel: 'Act 4',  century: 1, specimenCount: 10, magicSignature: 'witness_ritual',    accentHue: 'hsla(30, 28%, 50%, 0.7)' },
  { seriesNumber: 11, name: 'THE MENDER',          collection: 'The Repair Collection',        prefix: 'Mender_',        actLabel: 'Act 5',  century: 1, specimenCount: 10, magicSignature: 'sacred_ordinary',   accentHue: 'hsla(45, 55%, 55%, 0.7)' },
  { seriesNumber: 12, name: 'THE DIPLOMAT',         collection: 'The Bridge Collection',        prefix: 'Diplomat_',      actLabel: 'Act 6',  century: 1, specimenCount: 10, magicSignature: 'relational_ghost',  accentHue: 'hsla(30, 30%, 50%, 0.7)' },
  { seriesNumber: 13, name: 'THE WEAVER',           collection: 'The Pattern Collection',       prefix: 'Weaver_',        actLabel: 'Act 7',  century: 1, specimenCount: 10, magicSignature: 'poetic_precision',  accentHue: 'hsla(270, 30%, 50%, 0.7)' },
  { seriesNumber: 14, name: 'THE VISIONARY',        collection: 'The Possibility Collection',   prefix: 'Visionary_',     actLabel: 'Act 8',  century: 1, specimenCount: 10, magicSignature: 'science_x_soul',    accentHue: 'hsla(200, 40%, 52%, 0.7)' },
  { seriesNumber: 15, name: 'THE LUMINARY',         collection: 'The Light Collection',         prefix: 'Luminary_',      actLabel: 'Act 9',  century: 1, specimenCount: 10, magicSignature: 'sacred_ordinary',   accentHue: 'hsla(42, 50%, 52%, 0.7)' },

  // 2nd Century — Acts 10-19
  { seriesNumber: 16, name: 'THE HACKER',           collection: 'The De-Conditioning Collection', prefix: 'Hacker_',       actLabel: 'Act 10', century: 2, specimenCount: 10, magicSignature: 'pattern_glitch',    accentHue: 'hsla(160, 45%, 42%, 0.7)' },
  { seriesNumber: 17, name: 'THE CHRONONAUT',       collection: 'The Time Collection',           prefix: 'Chrononaut_',   actLabel: 'Act 11', century: 2, specimenCount: 10, magicSignature: 'science_x_soul',    accentHue: 'hsla(260, 40%, 50%, 0.7)' },
  { seriesNumber: 18, name: 'THE MYCELIUM',         collection: 'The Network Collection',        prefix: 'Mycelium_',     actLabel: 'Act 12', century: 2, specimenCount: 10, magicSignature: 'relational_ghost',  accentHue: 'hsla(90, 30%, 45%, 0.7)' },
  { seriesNumber: 19, name: 'THE AESTHETE',         collection: 'The Beauty Collection',         prefix: 'Aesthete_',     actLabel: 'Act 13', century: 2, specimenCount: 10, magicSignature: 'sensory_cinema',    accentHue: 'hsla(42, 45%, 55%, 0.7)' },
  { seriesNumber: 20, name: 'THE ELEMENTAL',        collection: 'The Elements Collection',       prefix: 'Elemental_',    actLabel: 'Act 14', century: 2, specimenCount: 10, magicSignature: 'sensory_cinema',    accentHue: 'hsla(25, 70%, 50%, 0.7)' },
  { seriesNumber: 21, name: 'THE PHENOMENOLOGIST',  collection: 'The Perception Collection',     prefix: 'Phenom_',       actLabel: 'Act 15', century: 2, specimenCount: 10, magicSignature: 'sensory_cinema',    accentHue: 'hsla(220, 25%, 50%, 0.7)' },
  { seriesNumber: 22, name: 'THE ALCHEMIST II',     collection: 'The Dark Alchemy Collection',   prefix: 'AlchemistII_',  actLabel: 'Act 16', century: 2, specimenCount: 10, magicSignature: 'science_x_soul',    accentHue: 'hsla(5, 55%, 45%, 0.7)' },
  { seriesNumber: 23, name: 'THE SERVANT LEADER',   collection: 'The Authority Collection',      prefix: 'ServantLeader_', actLabel: 'Act 17', century: 2, specimenCount: 10, magicSignature: 'sacred_ordinary',   accentHue: 'hsla(220, 20%, 45%, 0.7)' },
  { seriesNumber: 24, name: 'THE OMEGA POINT',      collection: 'The Convergence Collection',    prefix: 'OmegaPoint_',   actLabel: 'Act 18', century: 2, specimenCount: 10, magicSignature: 'koan_paradox',      accentHue: 'hsla(270, 30%, 48%, 0.7)' },
  { seriesNumber: 25, name: 'THE SOURCE',           collection: 'The Consciousness Collection',  prefix: 'Source_',       actLabel: 'Act 19', century: 2, specimenCount: 10, magicSignature: 'sacred_ordinary',   accentHue: 'hsla(45, 35%, 55%, 0.7)' },

  // 3rd Century — Acts 20-29
  { seriesNumber: 26, name: 'THE STOIC',            collection: 'The Fortress Collection',       prefix: 'Stoic_',        actLabel: 'Act 20', century: 3, specimenCount: 10, magicSignature: 'poetic_precision',  accentHue: 'hsla(140, 12%, 35%, 0.7)' },
  { seriesNumber: 27, name: 'THE LOVER',            collection: 'The Intimacy Collection',       prefix: 'Lover_',        actLabel: 'Act 21', century: 3, specimenCount: 10, magicSignature: 'relational_ghost',  accentHue: 'hsla(15, 25%, 50%, 0.7)' },
  { seriesNumber: 28, name: 'THE ATHLETE',          collection: 'The Vitality Collection',       prefix: 'Athlete_',      actLabel: 'Act 22', century: 3, specimenCount: 10, magicSignature: 'sensory_cinema',    accentHue: 'hsla(200, 30%, 50%, 0.7)' },
  { seriesNumber: 29, name: 'THE STRATEGIST',       collection: 'The Wealth Collection',         prefix: 'Strategist_',   actLabel: 'Act 23', century: 3, specimenCount: 10, magicSignature: 'science_x_soul',    accentHue: 'hsla(42, 22%, 48%, 0.7)' },
  { seriesNumber: 30, name: 'THE WILDING',          collection: 'The Wild Collection',           prefix: 'Wilding_',      actLabel: 'Act 24', century: 3, specimenCount: 10, magicSignature: 'sensory_cinema',    accentHue: 'hsla(200, 25%, 55%, 0.7)' },
  { seriesNumber: 31, name: 'THE GUARDIAN',         collection: 'The Protection Collection',     prefix: 'Guardian_',     actLabel: 'Act 25', century: 3, specimenCount: 10, magicSignature: 'sacred_ordinary',   accentHue: 'hsla(210, 18%, 50%, 0.7)' },
  { seriesNumber: 32, name: 'THE FUTURIST',         collection: 'The Disconnect Collection',     prefix: 'Futurist_',     actLabel: 'Act 26', century: 3, specimenCount: 10, magicSignature: 'pattern_glitch',    accentHue: 'hsla(0, 45%, 45%, 0.7)' },
  { seriesNumber: 33, name: 'THE MYSTIC',           collection: 'The Nondual Collection',        prefix: 'Mystic_',       actLabel: 'Act 27', century: 3, specimenCount: 10, magicSignature: 'koan_paradox',      accentHue: 'hsla(260, 20%, 42%, 0.7)' },
  { seriesNumber: 34, name: 'THE INFINITE PLAYER',  collection: 'The Play Collection',           prefix: 'Infinite_',     actLabel: 'Act 28', century: 3, specimenCount: 10, magicSignature: 'sacred_ordinary',   accentHue: 'hsla(45, 22%, 48%, 0.7)' },
  { seriesNumber: 35, name: 'THE REALITY BENDER',   collection: 'The Perception Collection',     prefix: 'Bender_',       actLabel: 'Act 29', century: 3, specimenCount: 10, magicSignature: 'koan_paradox',      accentHue: 'hsla(220, 12%, 48%, 0.7)' },

  // 4th Century — Acts 30-39
  { seriesNumber: 36, name: 'THE MAGNET',           collection: 'The Attraction Collection',     prefix: 'Magnet_',       actLabel: 'Act 30', century: 4, specimenCount: 10, magicSignature: 'relational_ghost',  accentHue: 'hsla(270, 15%, 42%, 0.7)' },
  { seriesNumber: 37, name: 'THE ORACLE',           collection: 'The Foresight Collection',      prefix: 'Oracle_',       actLabel: 'Act 31', century: 4, specimenCount: 10, magicSignature: 'witness_ritual',    accentHue: 'hsla(250, 18%, 42%, 0.7)' },
  { seriesNumber: 38, name: 'THE MAESTRO',          collection: 'The Performance Collection',    prefix: 'Maestro_',      actLabel: 'Act 32', century: 4, specimenCount: 10, magicSignature: 'poetic_precision',  accentHue: 'hsla(45, 25%, 38%, 0.7)' },
  { seriesNumber: 39, name: 'THE SHAMAN',           collection: 'The Earth Collection',          prefix: 'Shaman_',       actLabel: 'Act 33', century: 4, specimenCount: 10, magicSignature: 'sensory_cinema',    accentHue: 'hsla(28, 22%, 38%, 0.7)' },
  { seriesNumber: 40, name: 'THE STARGAZER',        collection: 'The Cosmos Collection',         prefix: 'Stargazer_',    actLabel: 'Act 34', century: 4, specimenCount: 10, magicSignature: 'science_x_soul',    accentHue: 'hsla(230, 18%, 38%, 0.7)' },
  { seriesNumber: 41, name: 'THE MYTH MAKER',       collection: 'The Story Collection',          prefix: 'MythMaker_',    actLabel: 'Act 35', century: 4, specimenCount: 10, magicSignature: 'poetic_precision',  accentHue: 'hsla(270, 20%, 42%, 0.7)' },
  { seriesNumber: 42, name: 'THE SHAPE SHIFTER',    collection: 'The Identity Collection',       prefix: 'ShapeShifter_', actLabel: 'Act 36', century: 4, specimenCount: 10, magicSignature: 'pattern_glitch',    accentHue: 'hsla(280, 22%, 45%, 0.7)' },
  { seriesNumber: 43, name: 'THE DREAM WALKER',     collection: 'The Unconscious Collection',    prefix: 'DreamWalker_',  actLabel: 'Act 37', century: 4, specimenCount: 10, magicSignature: 'sensory_cinema',    accentHue: 'hsla(250, 20%, 40%, 0.7)' },
  { seriesNumber: 44, name: 'THE MAGNUM OPUS',      collection: 'The Great Work Collection',     prefix: 'MagnumOpus_',   actLabel: 'Act 38', century: 4, specimenCount: 10, magicSignature: 'science_x_soul',    accentHue: 'hsla(42, 40%, 50%, 0.7)' },
  { seriesNumber: 45, name: 'THE PRISM',            collection: 'The Light Collection',          prefix: 'Prism_',        actLabel: 'Act 39', century: 4, specimenCount: 10, magicSignature: 'sensory_cinema',    accentHue: 'hsla(280, 30%, 50%, 0.7)' },

  // 5th Century — Acts 40-49
  { seriesNumber: 46, name: 'THE GRAVITON',         collection: 'The Force Collection',          prefix: 'Graviton_',     actLabel: 'Act 40', century: 5, specimenCount: 10, magicSignature: 'science_x_soul',    accentHue: 'hsla(220, 15%, 40%, 0.7)' },
  { seriesNumber: 47, name: 'THE OBSERVER',         collection: 'The Quantum Collection',        prefix: 'Observer_',     actLabel: 'Act 41', century: 5, specimenCount: 10, magicSignature: 'koan_paradox',      accentHue: 'hsla(260, 18%, 42%, 0.7)' },
  { seriesNumber: 48, name: 'THE TIME CAPSULE',     collection: 'The Temporal Collection',       prefix: 'TimeCapsule_',  actLabel: 'Act 42', century: 5, specimenCount: 10, magicSignature: 'poetic_precision',  accentHue: 'hsla(35, 28%, 45%, 0.7)' },
  { seriesNumber: 49, name: 'THE LOOP BREAKER',     collection: 'The Pattern Break Collection',  prefix: 'LoopBreaker_',  actLabel: 'Act 43', century: 5, specimenCount: 10, magicSignature: 'pattern_glitch',    accentHue: 'hsla(160, 30%, 42%, 0.7)' },
  { seriesNumber: 50, name: 'THE RETRO-CAUSAL',     collection: 'The Memory Edit Collection',    prefix: 'RetroCausal_',  actLabel: 'Act 44', century: 5, specimenCount: 10, magicSignature: 'science_x_soul',    accentHue: 'hsla(45, 25%, 42%, 0.7)' },
  { seriesNumber: 51, name: 'THE THRESHOLD',        collection: 'The Liminal Collection',        prefix: 'Threshold_',    actLabel: 'Act 45', century: 5, specimenCount: 10, magicSignature: 'sacred_ordinary',   accentHue: 'hsla(30, 22%, 42%, 0.7)' },
  { seriesNumber: 52, name: 'THE SOMA',             collection: 'The Body Intelligence Collection', prefix: 'Soma_',      actLabel: 'Act 46', century: 5, specimenCount: 10, magicSignature: 'sensory_cinema',    accentHue: 'hsla(0, 28%, 45%, 0.7)' },
  { seriesNumber: 53, name: 'THE FREQUENCY',        collection: 'The Resonance Collection',      prefix: 'Frequency_',    actLabel: 'Act 47', century: 5, specimenCount: 10, magicSignature: 'science_x_soul',    accentHue: 'hsla(260, 25%, 45%, 0.7)' },
  { seriesNumber: 54, name: 'THE TUNER',            collection: 'The Calibration Collection',    prefix: 'Tuner_',        actLabel: 'Act 48', century: 5, specimenCount: 10, magicSignature: 'sensory_cinema',    accentHue: 'hsla(200, 22%, 42%, 0.7)' },
  { seriesNumber: 55, name: 'THE BROADCAST',        collection: 'The Ambient Collection',        prefix: 'Broadcast_',    actLabel: 'Act 49', century: 5, specimenCount: 10, magicSignature: 'sensory_cinema',    accentHue: 'hsla(220, 18%, 45%, 0.7)' },

  // 6th Century — Acts 50-59
  { seriesNumber: 56, name: 'THE SCHRODINGER',      collection: 'The Uncertainty Collection',    prefix: 'Schrodinger_',  actLabel: 'Act 50', century: 6, specimenCount: 10, magicSignature: 'koan_paradox',      accentHue: 'hsla(270, 22%, 45%, 0.7)' },
  { seriesNumber: 57, name: 'THE GLITCH',           collection: 'The Error Collection',          prefix: 'Glitch_',       actLabel: 'Act 51', century: 6, specimenCount: 10, magicSignature: 'pattern_glitch',    accentHue: 'hsla(120, 45%, 45%, 0.7)' },
  { seriesNumber: 58, name: 'THE CONSTRUCT',        collection: 'The Inner Architecture Collection', prefix: 'Construct_', actLabel: 'Act 52', century: 6, specimenCount: 10, magicSignature: 'science_x_soul',    accentHue: 'hsla(200, 18%, 42%, 0.7)' },
  { seriesNumber: 59, name: 'THE BIOGRAPHER',       collection: 'The Narrative Collection',      prefix: 'Biographer_',   actLabel: 'Act 53', century: 6, specimenCount: 10, magicSignature: 'poetic_precision',  accentHue: 'hsla(30, 25%, 42%, 0.7)' },
  { seriesNumber: 60, name: 'THE OPTICIAN',         collection: 'The Perception Lens Collection', prefix: 'Optician_',    actLabel: 'Act 54', century: 6, specimenCount: 10, magicSignature: 'sensory_cinema',    accentHue: 'hsla(200, 20%, 45%, 0.7)' },
  { seriesNumber: 61, name: 'THE INTERPRETER',      collection: 'The Translation Collection',    prefix: 'Interpreter_',  actLabel: 'Act 55', century: 6, specimenCount: 10, magicSignature: 'relational_ghost',  accentHue: 'hsla(42, 22%, 42%, 0.7)' },
  { seriesNumber: 62, name: 'THE SOCIAL PHYSICIST', collection: 'The Social Dynamics Collection', prefix: 'SocialPhysics_', actLabel: 'Act 56', century: 6, specimenCount: 10, magicSignature: 'science_x_soul',    accentHue: 'hsla(200, 20%, 42%, 0.7)' },
  { seriesNumber: 63, name: 'THE TRIBALIST',        collection: 'The Community Collection',      prefix: 'Tribalist_',    actLabel: 'Act 57', century: 6, specimenCount: 10, magicSignature: 'relational_ghost',  accentHue: 'hsla(25, 22%, 42%, 0.7)' },
  { seriesNumber: 64, name: 'THE VALUATOR',         collection: 'The Worth Collection',          prefix: 'Valuator_',     actLabel: 'Act 58', century: 6, specimenCount: 10, magicSignature: 'poetic_precision',  accentHue: 'hsla(42, 28%, 45%, 0.7)' },
  { seriesNumber: 65, name: 'THE EDITOR',           collection: 'The Curation Collection',       prefix: 'Editor_',       actLabel: 'Act 59', century: 6, specimenCount: 10, magicSignature: 'poetic_precision',  accentHue: 'hsla(0, 0%, 42%, 0.7)' },

  // 7th Century — Acts 60-69
  { seriesNumber: 66, name: 'THE GRANDMASTER',      collection: 'The Strategic Collection',      prefix: 'Grandmaster_',  actLabel: 'Act 60', century: 7, specimenCount: 10, magicSignature: 'science_x_soul',    accentHue: 'hsla(220, 15%, 40%, 0.7)' },
  { seriesNumber: 67, name: 'THE CATALYST',         collection: 'The Activation Collection',     prefix: 'Catalyst_',     actLabel: 'Act 61', century: 7, specimenCount: 10, magicSignature: 'relational_ghost',  accentHue: 'hsla(35, 22%, 42%, 0.7)' },
  { seriesNumber: 68, name: 'THE KINETIC',          collection: 'The Momentum Collection',       prefix: 'Kinetic_',      actLabel: 'Act 62', century: 7, specimenCount: 10, magicSignature: 'sensory_cinema',    accentHue: 'hsla(200, 25%, 45%, 0.7)' },
  { seriesNumber: 69, name: 'THE ADAPTIVE',         collection: 'The Resilience Collection',     prefix: 'Adaptive_',     actLabel: 'Act 63', century: 7, specimenCount: 10, magicSignature: 'sacred_ordinary',   accentHue: 'hsla(160, 25%, 42%, 0.7)' },
  { seriesNumber: 70, name: 'THE SHADOW WORKER',    collection: 'The Shadow Collection',         prefix: 'Shadow_',       actLabel: 'Act 64', century: 7, specimenCount: 10, magicSignature: 'koan_paradox',      accentHue: 'hsla(270, 18%, 38%, 0.7)' },
  { seriesNumber: 71, name: 'THE ANCESTOR',         collection: 'The Lineage Collection',        prefix: 'Ancestor_',     actLabel: 'Act 65', century: 7, specimenCount: 10, magicSignature: 'witness_ritual',    accentHue: 'hsla(28, 22%, 38%, 0.7)' },
  { seriesNumber: 72, name: 'THE TRICKSTER',        collection: 'The Chaos Collection',          prefix: 'Trickster_',    actLabel: 'Act 66', century: 7, specimenCount: 10, magicSignature: 'pattern_glitch',    accentHue: 'hsla(45, 35%, 48%, 0.7)' },
  { seriesNumber: 73, name: 'THE ASTRONAUT',        collection: 'The Overview Collection',       prefix: 'Astronaut_',    actLabel: 'Act 67', century: 7, specimenCount: 10, magicSignature: 'science_x_soul',    accentHue: 'hsla(220, 25%, 45%, 0.7)' },
  { seriesNumber: 74, name: 'THE WONDERER',         collection: 'The Curiosity Collection',      prefix: 'Wonderer_',     actLabel: 'Act 68', century: 7, specimenCount: 10, magicSignature: 'sacred_ordinary',   accentHue: 'hsla(35, 28%, 45%, 0.7)' },
  { seriesNumber: 75, name: 'THE SURFER',           collection: 'The Flow State Collection',     prefix: 'Surfer_',       actLabel: 'Act 69', century: 7, specimenCount: 10, magicSignature: 'sensory_cinema',    accentHue: 'hsla(200, 22%, 45%, 0.7)' },

  // 8th Century — Acts 70-79
  { seriesNumber: 76, name: 'THE MEANING MAKER',    collection: 'The Purpose Collection',        prefix: 'Meaning_',      actLabel: 'Act 70', century: 8, specimenCount: 10, magicSignature: 'poetic_precision',  accentHue: 'hsla(260, 22%, 45%, 0.7)' },
  { seriesNumber: 77, name: 'THE SERVANT',          collection: 'The Service Collection',        prefix: 'Servant_',      actLabel: 'Act 71', century: 8, specimenCount: 10, magicSignature: 'sacred_ordinary',   accentHue: 'hsla(42, 25%, 45%, 0.7)' },
  { seriesNumber: 78, name: 'THE SYNTHESIS',        collection: 'The Integration Collection',    prefix: 'Synthesis_',    actLabel: 'Act 72', century: 8, specimenCount: 10, magicSignature: 'science_x_soul',    accentHue: 'hsla(280, 22%, 45%, 0.7)' },
  { seriesNumber: 79, name: 'THE FUTURE WEAVER',    collection: 'The Temporal Craft Collection', prefix: 'FutureWeaver_', actLabel: 'Act 73', century: 8, specimenCount: 10, magicSignature: 'poetic_precision',  accentHue: 'hsla(200, 22%, 45%, 0.7)' },
  { seriesNumber: 80, name: 'THE COMPOSER',         collection: 'The Harmony Collection',        prefix: 'Composer_',     actLabel: 'Act 74', century: 8, specimenCount: 10, magicSignature: 'sensory_cinema',    accentHue: 'hsla(260, 20%, 42%, 0.7)' },
  { seriesNumber: 81, name: 'THE ZENITH',           collection: 'The Summit Collection',         prefix: 'Zenith_',       actLabel: 'Act 75', century: 8, specimenCount: 10, magicSignature: 'sacred_ordinary',   accentHue: 'hsla(200, 15%, 45%, 0.7)' },
  { seriesNumber: 82, name: 'THE MULTIVERSE',       collection: 'The Identity Prism Collection', prefix: 'Multiverse_',   actLabel: 'Act 76', century: 8, specimenCount: 10, magicSignature: 'koan_paradox',      accentHue: 'hsla(280, 25%, 48%, 0.7)' },
  { seriesNumber: 83, name: 'THE ETHICIST',         collection: 'The Integrity Collection',      prefix: 'Ethicist_',     actLabel: 'Act 77', century: 8, specimenCount: 10, magicSignature: 'poetic_precision',  accentHue: 'hsla(200, 18%, 42%, 0.7)' },
  { seriesNumber: 84, name: 'THE ELEMENTALIST',     collection: 'The Elemental Mastery Collection', prefix: 'Elementalist_', actLabel: 'Act 78', century: 8, specimenCount: 10, magicSignature: 'sensory_cinema', accentHue: 'hsla(140, 22%, 42%, 0.7)' },
  { seriesNumber: 85, name: 'THE MENTAT',           collection: 'The Pure Reason Collection',    prefix: 'Mentat_',       actLabel: 'Act 79', century: 8, specimenCount: 10, magicSignature: 'science_x_soul',    accentHue: 'hsla(200, 18%, 42%, 0.7)' },

  // 9th Century — Acts 80-93 (The Final Century)
  { seriesNumber: 86, name: 'THE INTUITION',        collection: 'The Inner Oracle Collection',   prefix: 'Intuition_',    actLabel: 'Act 80', century: 9, specimenCount: 10, magicSignature: 'witness_ritual',    accentHue: 'hsla(270, 22%, 48%, 0.7)' },
  { seriesNumber: 87, name: 'THE ENGINEER',         collection: 'The Systems Collection',        prefix: 'Engineer_',     actLabel: 'Act 81', century: 9, specimenCount: 10, magicSignature: 'science_x_soul',    accentHue: 'hsla(200, 18%, 42%, 0.7)' },
  { seriesNumber: 88, name: 'THE ALCHEMIST IV',     collection: 'The Emotion Mastery Collection', prefix: 'AlchemistIV_', actLabel: 'Act 82', century: 9, specimenCount: 10, magicSignature: 'science_x_soul',    accentHue: 'hsla(280, 22%, 48%, 0.7)' },
  { seriesNumber: 89, name: 'THE COGNITIVE',        collection: 'The Mind Architecture Collection', prefix: 'Cognitive_', actLabel: 'Act 83', century: 9, specimenCount: 10, magicSignature: 'science_x_soul',    accentHue: 'hsla(200, 20%, 45%, 0.7)' },
  { seriesNumber: 90, name: 'THE SAGE (WISDOM)',    collection: 'The Deep Wisdom Collection',    prefix: 'Sage_',         actLabel: 'Act 84', century: 9, specimenCount: 10, magicSignature: 'koan_paradox',      accentHue: 'hsla(30, 18%, 40%, 0.7)' },
  { seriesNumber: 91, name: 'THE GAIA',             collection: 'The Earth System Collection',   prefix: 'Gaia_',         actLabel: 'Act 85', century: 9, specimenCount: 10, magicSignature: 'sacred_ordinary',   accentHue: 'hsla(140, 25%, 42%, 0.7)' },
  { seriesNumber: 92, name: 'THE MYSTIC (TRANS)',   collection: 'The Transcendence Collection',  prefix: 'Mystic_',       actLabel: 'Act 86', century: 9, specimenCount: 10, magicSignature: 'koan_paradox',      accentHue: 'hsla(270, 18%, 40%, 0.7)' },
  { seriesNumber: 93, name: 'THE ASCENDANT',        collection: 'The Return Collection',         prefix: 'Ascendant_',    actLabel: 'Act 87', century: 9, specimenCount: 10, magicSignature: 'sacred_ordinary',   accentHue: 'hsla(42, 28%, 48%, 0.7)' },
  { seriesNumber: 94, name: 'THE GARDENER II',      collection: 'The Cultivation Collection',    prefix: 'Gardener_',     actLabel: 'Act 88', century: 9, specimenCount: 10, magicSignature: 'sacred_ordinary',   accentHue: 'hsla(120, 22%, 40%, 0.7)' },
  { seriesNumber: 95, name: 'THE ANCESTOR II',      collection: 'The Legacy Collection',         prefix: 'AncestorII_',   actLabel: 'Act 89', century: 9, specimenCount: 10, magicSignature: 'witness_ritual',    accentHue: 'hsla(28, 22%, 40%, 0.7)' },
  { seriesNumber: 96, name: 'THE MASTERY',          collection: 'The Crown Collection',          prefix: 'Mastery_',      actLabel: 'Act 90', century: 9, specimenCount: 10, magicSignature: 'sacred_ordinary',   accentHue: 'hsla(42, 35%, 50%, 0.7)' },
  { seriesNumber: 97, name: 'THE HORIZON',          collection: 'The Infinite Collection',       prefix: 'Horizon_',      actLabel: 'Act 91', century: 9, specimenCount: 10, magicSignature: 'sacred_ordinary',   accentHue: 'hsla(200, 22%, 48%, 0.7)' },
  { seriesNumber: 98, name: 'THE ZERO POINT',       collection: 'The Void Collection',           prefix: 'Void_',         actLabel: 'Act 92', century: 9, specimenCount: 10, magicSignature: 'koan_paradox',      accentHue: 'hsla(270, 8%, 20%, 0.7)' },
  { seriesNumber: 99, name: 'THE OMEGA',            collection: 'The Unity Collection',          prefix: 'Unity_',        actLabel: 'Act 93', century: 9, specimenCount: 10, magicSignature: 'sacred_ordinary',   accentHue: 'hsla(42, 35%, 48%, 0.7)' },
  { seriesNumber: 100, name: 'THE OUROBOROS',      collection: 'The Eternal Return Collection', prefix: 'Ouroboros_',    actLabel: 'Act 94', century: 9, specimenCount: 10, magicSignature: 'sacred_ordinary',   accentHue: 'hsla(160, 28%, 42%, 0.7)' },
];

// ── Second Millennium Series (101-110) ──────────────────────────
const SECOND_MILLENNIUM_SERIES: SeriesMeta[] = [
  { seriesNumber: 101, name: 'THE PROJECTOR',      collection: 'The Projection Collection',     prefix: 'Projector_',      actLabel: 'Act 95',  century: 10, specimenCount: 10, magicSignature: 'sensory_cinema',    accentHue: 'hsla(45, 30%, 42%, 0.7)' },
  { seriesNumber: 102, name: 'THE CHRONOMANCER',   collection: 'The Time Collection',           prefix: 'Chronomancer_',   actLabel: 'Act 96',  century: 10, specimenCount: 10, magicSignature: 'science_x_soul',    accentHue: 'hsla(230, 22%, 40%, 0.7)' },
  { seriesNumber: 103, name: 'THE RESONATOR',      collection: 'The Resonance Collection',      prefix: 'Resonator_',      actLabel: 'Act 97',  century: 10, specimenCount: 10, magicSignature: 'sensory_cinema',    accentHue: 'hsla(160, 15%, 35%, 0.7)' },
  { seriesNumber: 104, name: 'THE MATERIALIST',    collection: 'The Matter Collection',         prefix: 'Materialist_',    actLabel: 'Act 98',  century: 10, specimenCount: 10, magicSignature: 'sacred_ordinary',   accentHue: 'hsla(32, 28%, 42%, 0.7)' },
];

export const ALL_SERIES: SeriesMeta[] = [...FOUNDATION_SERIES, ...NUMBERED_SERIES, ...SECOND_MILLENNIUM_SERIES];

// ── Derived stats ─────────────────────────────────────────────────
export const TOTAL_SPECIMENS = ALL_SERIES.reduce((sum, s) => sum + s.specimenCount, 0);
export const TOTAL_ACTS = 99; // Acts 0-98 (Foundation + 95 numbered + 4 Second Millennium)
export const TOTAL_CENTURIES = 10;

// ── Century metadata ──────────────────────────────────────────────
export interface CenturyMeta {
  number: number;
  name: string;
  actRange: string;
  seriesRange: string;
  specimenCount: number;
  seriesCount: number;
}

export function getCenturyMetadata(): CenturyMeta[] {
  const centuryMap = new Map<number, { series: SeriesMeta[] }>();
  
  for (const s of [...NUMBERED_SERIES, ...SECOND_MILLENNIUM_SERIES]) {
    const existing = centuryMap.get(s.century) || { series: [] };
    existing.series.push(s);
    centuryMap.set(s.century, existing);
  }

  const centuryNames = [
    '', // 0 = Foundation
    'The First Century',
    'The Second Century', 
    'The Third Century',
    'The Fourth Century',
    'The Fifth Century',
    'The Sixth Century',
    'The Seventh Century',
    'The Eighth Century',
    'The Ninth Century',
    'The Second Millennium',
  ];

  const results: CenturyMeta[] = [];
  for (let c = 1; c <= 10; c++) {
    const data = centuryMap.get(c);
    if (!data) continue;
    const sorted = data.series.sort((a, b) => a.seriesNumber - b.seriesNumber);
    results.push({
      number: c,
      name: centuryNames[c],
      actRange: `${sorted[0].actLabel} - ${sorted[sorted.length - 1].actLabel}`,
      seriesRange: `Series ${sorted[0].seriesNumber} - ${sorted[sorted.length - 1].seriesNumber}`,
      specimenCount: sorted.reduce((sum, s) => sum + s.specimenCount, 0),
      seriesCount: sorted.length,
    });
  }
  return results;
}

// ── Signature distribution ────────────────────────────────────────
export const VALID_SIGNATURES = [
  'sacred_ordinary',
  'witness_ritual',
  'poetic_precision',
  'science_x_soul',
  'koan_paradox',
  'pattern_glitch',
  'sensory_cinema',
  'relational_ghost',
] as const;

export type MagicSignature = typeof VALID_SIGNATURES[number];

export function getSignatureDistribution(): { signature: string; count: number; percentage: number }[] {
  const counts = new Map<string, number>();
  for (const sig of VALID_SIGNATURES) counts.set(sig, 0);
  
  for (const s of ALL_SERIES) {
    const current = counts.get(s.magicSignature) || 0;
    counts.set(s.magicSignature, current + s.specimenCount);
  }

  const total = ALL_SERIES.reduce((sum, s) => sum + s.specimenCount, 0);
  return Array.from(counts.entries()).map(([signature, count]) => ({
    signature,
    count,
    percentage: Math.round((count / total) * 100),
  }));
}

// ── Signature display info ───────────────────────────────────────
export const SIGNATURE_DISPLAY: Record<string, { label: string; color: string; icon: string }> = {
  sacred_ordinary:   { label: 'Sacred Ordinary',   color: 'hsla(35, 60%, 60%, 0.8)',  icon: 'sparkles' },
  witness_ritual:    { label: 'Witness Ritual',    color: 'hsla(30, 25%, 50%, 0.8)',  icon: 'eye' },
  poetic_precision:  { label: 'Poetic Precision',  color: 'hsla(200, 35%, 45%, 0.8)', icon: 'pen-tool' },
  science_x_soul:    { label: 'Science x Soul',    color: 'hsla(260, 40%, 55%, 0.8)', icon: 'atom' },
  koan_paradox:      { label: 'Koan Paradox',      color: 'hsla(20, 50%, 50%, 0.8)',  icon: 'infinity' },
  pattern_glitch:    { label: 'Pattern Glitch',    color: 'hsla(250, 50%, 58%, 0.8)', icon: 'zap' },
  sensory_cinema:    { label: 'Sensory Cinema',    color: 'hsla(180, 35%, 45%, 0.8)', icon: 'film' },
  relational_ghost:  { label: 'Relational Ghost',  color: 'hsla(340, 30%, 50%, 0.8)', icon: 'users' },
};