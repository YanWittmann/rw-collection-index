import { PearlData } from '../types/types';
import { MiscProgRecord, ParseFileResult, SaveStateRecord } from '../types/SaveModel';
import UnlockManager from './unlockManager';
import { getEffectiveTranscriberName } from './transcriberUtils';

type PearlSource = 'base' | 'artificer' | 'spearmaster' | 'saint';

export interface WatcherState {
    maxRippleLevel: number;
    minRippleLevel: number;
    spinningTopEncounters: number[];
    spinningTopRot: boolean;
    visitBath: boolean;
    highestPrinceConversationSeen: number;
    numberOfPrinceEncounters: number;
    numberOfVoidWeaverEncounters: number;
    princeWeaverGrowthAcknowledgement: number;
    princeWeaverDialogProgression: number;
    rotInfectedRegionCount: number;
    physicalPearlTypes: Set<string>;
    visitedRooms: Set<string>;
}

export interface WatcherGlobal {
    beaten: boolean;
    beatenSpinningTop: boolean;
    beatenSentientRot: boolean;
    beatenVoidWeaver: boolean;
    watcherEndingID: number;
    beatenAscension: boolean;
}

const TRANSCRIBERS_FOR_SOURCE: Record<PearlSource, string[]> = {
    base:        ['LttM-post-collapse', 'LttM-gourmand', 'LttM-rivulet', 'FP'],
    artificer:   ['FP-artificer', 'artificer'],
    spearmaster: ['LttM-post-collapse', 'broadcast-pre-FP'],
    saint:       ['LttM-pre-collapse', 'LttM-saint', 'LttM-FP-saint'],
};

export interface SaveCollectibles {
    pearlSources: Map<string, Set<PearlSource>>;
    broadcastInternalIds: Set<string>;
    echoGhostIds: Set<string>;
    itemTypesDescribed: Set<string>;
    // Proxy-detected iterator pearl types (Misc, BroadcastMisc, PebblesPearl) that leave no
    // footprint in significantPearls — keys are internalIds, values are the transcriber context
    // names unlocked based on room visit evidence.
    iteratorPearlTranscribers: Map<string, Set<string>>;
    // True when all 70 arena challenges are marked complete; used to unlock dev commentary.
    allChallengesCompleted: boolean;
    oracleStates: Map<string, {
        moonEncounters: number;
        moonEncountersWithMark: number;
        fpConversations: number;
        moonRevived: boolean;
        altEnding: boolean;
        pebblesHelped: boolean;
        energyRailOff: boolean;
        looksToTheDoom: boolean;
        zeroPebbles: boolean;
        smPearlTagged: boolean;
    }>;
    watcherState: WatcherState | null;
    watcherGlobal: WatcherGlobal;
    watcherVisitedPearlProjector: boolean;
}

export interface SaveMatchSummary {
    pearls: number;
    broadcasts: number;
    echoes: number;
    oracles: number;
    total: number;
}

// --- Condition helpers ---

type Condition = (collectibles: SaveCollectibles) => boolean;

const and = (...conditions: Condition[]): Condition =>
    c => conditions.every(cond => cond(c));

const not = (condition: Condition): Condition =>
    c => !condition(c);

const or = (...conditions: Condition[]): Condition =>
    c => conditions.some(cond => cond(c));

const hasEcho = (ghostId: string): Condition =>
    c => c.echoGhostIds.has(ghostId);

const whenFP = (slugcat: string): Condition =>
    c => (c.oracleStates.get(slugcat)?.fpConversations ?? 0) > 0;

const fpAtLeast = (slugcat: string, n: number): Condition =>
    c => (c.oracleStates.get(slugcat)?.fpConversations ?? 0) >= n;

const whenLttM = (slugcat: string): Condition =>
    c => (c.oracleStates.get(slugcat)?.moonEncounters ?? 0) > 0;

const moonMarkAtLeast = (slugcat: string, n: number): Condition =>
    c => (c.oracleStates.get(slugcat)?.moonEncountersWithMark ?? 0) >= n;

const whenAnyFP: Condition =
    c => Array.from(c.oracleStates.values()).some(s => s.fpConversations > 0);

const whenAnyLttM: Condition =
    c => Array.from(c.oracleStates.values()).some(s => s.moonEncounters > 0);

const hasItem = (...gameTypes: string[]): Condition =>
    c => gameTypes.some(t => c.itemTypesDescribed.has(t));

const hasBroadcast = (id: string): Condition =>
    c => c.broadcastInternalIds.has(id);

const altEnding = (slugcat: string): Condition =>
    c => c.oracleStates.get(slugcat)?.altEnding ?? false;

const pebblesHelped = (slugcat: string): Condition =>
    c => c.oracleStates.get(slugcat)?.pebblesHelped ?? false;

const energyRailOff = (slugcat: string): Condition =>
    c => c.oracleStates.get(slugcat)?.energyRailOff ?? false;

const looksToTheDoom = (slugcat: string): Condition =>
    c => c.oracleStates.get(slugcat)?.looksToTheDoom ?? false;

const zeroPebbles = (slugcat: string): Condition =>
    c => c.oracleStates.get(slugcat)?.zeroPebbles ?? false;

const smPearlTagged = (slugcat: string): Condition =>
    c => c.oracleStates.get(slugcat)?.smPearlTagged ?? false;

const anyPearlFromSource = (source: PearlSource): Condition =>
    c => Array.from(c.pearlSources.values()).some(s => s.has(source));

const pearlFromSource = (internalId: string, source: PearlSource): Condition =>
    c => c.pearlSources.get(internalId)?.has(source) ?? false;

// Watcher-specific condition helpers
const watcherMaxRipple = (min: number): Condition =>
    c => (c.watcherState?.maxRippleLevel ?? 0) >= min;

const watcherMinRipple = (min: number): Condition =>
    c => (c.watcherState?.minRippleLevel ?? 0) >= min;

const watcherSpinningTopRot: Condition =
    c => c.watcherState?.spinningTopRot ?? false;

const watcherVisitBath: Condition =
    c => c.watcherState?.visitBath ?? false;

const watcherSTCount = (min: number): Condition =>
    c => (c.watcherState?.spinningTopEncounters.length ?? 0) >= min;

const watcherSTIncludes = (spawnId: number): Condition =>
    c => c.watcherState?.spinningTopEncounters.includes(spawnId) ?? false;

const watcherPrinceSeen = (fileNum: number): Condition =>
    c => (c.watcherState?.highestPrinceConversationSeen ?? 0) >= fileNum;

const watcherPrinceEncounters = (min: number): Condition =>
    c => (c.watcherState?.numberOfPrinceEncounters ?? 0) >= min;

const watcherWeaverEncounters = (min: number): Condition =>
    c => (c.watcherState?.numberOfVoidWeaverEncounters ?? 0) >= min;

const watcherPrinceWeaverAck: Condition =
    c => (c.watcherState?.princeWeaverGrowthAcknowledgement ?? 0) === 1;

const watcherPrinceWeaverProg = (min: number): Condition =>
    c => (c.watcherState?.princeWeaverDialogProgression ?? 0) >= min;

const watcherAscensionEnding: Condition =
    c => c.watcherGlobal.watcherEndingID === 4;

// --- Collectible rules ---

type CollectibleRule = {
    ids: string[];
    unlocked: Condition;
};

// prettier-ignore
const COLLECTIBLE_RULES: CollectibleRule[] = [

    // Echoes
    { ids: ['Echo_Monologue_CC'], unlocked: hasEcho('CC') },
    { ids: ['Echo_Monologue_SH'], unlocked: hasEcho('SH') },
    { ids: ['Echo_Monologue_SI'], unlocked: hasEcho('SI') },
    { ids: ['Echo_Monologue_LF'], unlocked: hasEcho('LF') },
    { ids: ['Echo_Monologue_UW'], unlocked: hasEcho('UW') },
    { ids: ['Echo_Monologue_SB'], unlocked: hasEcho('SB') },
    { ids: ['Echo_Monologue_MS'], unlocked: hasEcho('MS') },
    { ids: ['Echo_Monologue_UG'], unlocked: hasEcho('UG') },
    { ids: ['Echo_Monologue_SL'], unlocked: hasEcho('SL') },
    { ids: ['Echo_Monologue_LC'], unlocked: hasEcho('LC') },

    // Five Pebbles dialogues
    {
        ids: ['FP_Dialogue_survivor_First_encounter', 'FP_Dialogue_survivor_Common_Dialogue'],
        unlocked: whenFP('White'),
    },
    {
        ids: ['FP_Dialogue_monk_First_encounter'],
        unlocked: whenFP('Yellow'),
    },
    {
        ids: ['FP_Dialogue_hunter_Lingering'],
        unlocked: whenFP('Red'),
    },
    {
        ids: ['FP_Dialogue_hunter_With_Green_Neuron'],
        unlocked: and(whenFP('Red'), pebblesHelped('Red')),
    },
    {
        ids: ['FP_Dialogue_hunter_Without_Green_Neuron'],
        unlocked: and(whenFP('Red'), not(pebblesHelped('Red'))),
    },
    {
        ids: ['FP_Dialogue_gourmand_First_encounter'],
        unlocked: whenFP('Gourmand'),
    },
    {
        ids: ['FP_Dialogue_artificer_First_encounter', 'FP_Dialogue_artificer_Lingering_Too_Long', 'FP_Dialogue_artificer_Hitting_with_a_rock_or_spear'],
        unlocked: whenFP('Artificer'),
    },
    {
        ids: ['FP_Dialogue_artificer_Visiting_Multiple_Times'],
        unlocked: fpAtLeast('Artificer', 3),
    },
    {
        ids: ['FP_Dialogue_artificer_Pebbles_Pearl'],
        unlocked: anyPearlFromSource('artificer'),
    },
    {
        ids: ['FP_Dialogue_artificer_Killing_Chieftain_Scavenger'],
        unlocked: altEnding('Artificer'),
    },
    {
        ids: ['FP_Dialogue_inv_First_encounter'],
        unlocked: whenFP('Inv'),
    },
    {
        ids: ['FP_Dialogue_spearmaster_First_encounter'],
        unlocked: whenFP('Spear'),
    },
    {
        ids: ['FP_Dialogue_rivulet_First_encounter', 'FP_Dialogue_rivulet_Neuron', 'FP_Dialogue_rivulet_Music', 'FP_Dialogue_rivulet_Proto_Long_Legs_Death'],
        unlocked: whenFP('Rivulet'),
    },
    {
        ids: ['FP_Dialogue_rivulet_Returning'],
        unlocked: and(altEnding('Rivulet'), fpAtLeast('Rivulet', 1)),
    },
    {
        ids: ['FP_Dialogue_rivulet_Subsequent_meetings'],
        unlocked: and(altEnding('Rivulet'), fpAtLeast('Rivulet', 2)),
    },
    {
        ids: ['FP_Dialogue_saint_First_encounter', 'FP_Dialogue_saint_Following_encounters', 'FP_Dialogue_saint_Interrupts'],
        unlocked: whenFP('Saint'),
    },
    {
        ids: ['FP_Dialogue_saint_Rubicon'],
        unlocked: zeroPebbles('Saint'),
    },
    {
        ids: ['FP_Dialogue_other_Throwing_Singularity_Bomb'],
        unlocked: whenAnyFP,
    },

    // Looks to the Moon dialogues
    {
        ids: ['LttM_Dialogue_survivor_First_encounter', 'LttM_Dialogue_survivor_Following_Encounters', 'LttM_Dialogue_survivor_Slugcat_Naming_Convention'],
        unlocked: whenLttM('White'),
    },
    {
        ids: ['LttM_Dialogue_monk_Moon_Yellow_First_Conversation'],
        unlocked: whenLttM('Yellow'),
    },
    {
        ids: ['LttM_Dialogue_survivor_monk_Second_encounter'],
        unlocked: or(moonMarkAtLeast('White', 1), moonMarkAtLeast('Yellow', 1)),
    },
    {
        ids: ['LttM_Dialogue_hunter_Moon_Red_First_Conversation'],
        unlocked: whenLttM('Red'),
    },
    {
        ids: ['LttM_Dialogue_hunter_Moon_Red_Second_Conversation'],
        unlocked: moonMarkAtLeast('Red', 1),
    },
    {
        ids: ['LttM_Dialogue_gourmand_First_encounter'],
        unlocked: whenLttM('Gourmand'),
    },
    {
        ids: ['LttM_Dialogue_spearmaster_First_encounter', 'LttM_Dialogue_spearmaster_Second_encounter', 'LttM_Dialogue_spearmaster_Following_encounters'],
        unlocked: whenLttM('Spear'),
    },
    {
        ids: ['LttM_Dialogue_spearmaster_Spearmaster_Pearl'],
        unlocked: smPearlTagged('Spear'),
    },
    {
        ids: ['LttM_Dialogue_spearmaster_Ending_Broadcast'],
        unlocked: hasBroadcast('Chatlog_SI9'),
    },
    {
        ids: ['LttM_Dialogue_rivulet_First_encounter', 'LttM_Dialogue_rivulet_Interruptions'],
        unlocked: whenLttM('Rivulet'),
    },
    {
        ids: ['LttM_Dialogue_rivulet_Returning_after_taking_the_Rarefaction_Cell'],
        unlocked: energyRailOff('Rivulet'),
    },
    {
        ids: ['LttM_Dialogue_rivulet_Returning_after_placing_the_Rarefaction_Cell'],
        unlocked: and(altEnding('Rivulet'), moonMarkAtLeast('Rivulet', 5)),
    },
    {
        ids: ['LttM_Dialogue_rivulet_Ending_Broadcast'],
        unlocked: hasBroadcast('Chatlog_LM7'),
    },
    {
        ids: ['LttM_Dialogue_rivulet_Returning_after_ending'],
        unlocked: and(altEnding('Rivulet'), moonMarkAtLeast('Rivulet', 6)),
    },
    {
        ids: [
            'LttM_Dialogue_saint_First_encounter',
            'LttM_Dialogue_saint_Second_Encounter',
            'LttM_Dialogue_saint_Third_Encounter',
            'LttM_Dialogue_saint_Blizzard_approaching',
            'LttM_SAINT_ANY_OTHER',
        ],
        unlocked: whenLttM('Saint'),
    },
    {
        ids: ['LttM_Dialogue_saint_Rubicon'],
        unlocked: looksToTheDoom('Saint'),
    },
    {
        ids: [
            'LttM_short_Dialogue_Receiving_an_object',
            'LttM_short_Dialogue_Commenting_already_discussed_object',
            'LttM_short_Dialogue_Take_back_while_commenting',
            'LttM_short_Dialogue_Receiving_a_pearl',
            'LttM_short_Dialogue_Seeing_Slugcat_bringing_a_Neuron_Fly',
            'LttM_short_Dialogue_Receiving_Neuron_Fly',
            'LttM_short_Dialogue_Interruptions',
            'LttM_short_Dialogue_Resuming_conversation_interruption',
            'LttM_short_Dialogue_Annoyed_Jumping',
            'LttM_short_Dialogue_Rain_Coming',
            'LttM_short_Dialogue_Slugcat_Death',
        ],
        unlocked: whenAnyLttM,
    },

    // Iterator item dialogues (Moon's reactions to shown items)
    { ids: ['Iterator_Dialogue_Items_Rock'],             unlocked: hasItem('Rock') },
    { ids: ['Iterator_Dialogue_Items_Spear'],            unlocked: hasItem('Spear') },
    { ids: ['Iterator_Dialogue_Items_Explosive_Spear'],  unlocked: hasItem('ExplosiveSpear') },
    { ids: ['Iterator_Dialogue_Items_Fire_Spear'],       unlocked: hasItem('HellSpear') },
    { ids: ['Iterator_Dialogue_Items_Electric_Spear'],   unlocked: hasItem('ElectricSpear') },
    { ids: ['Iterator_Dialogue_Items_Flashbang'],        unlocked: hasItem('FlareBomb') },
    { ids: ['Iterator_Dialogue_Items_Bubble_Fruit'],     unlocked: hasItem('WaterNut') },
    { ids: ['Iterator_Dialogue_Items_Blue_Fruit'],       unlocked: hasItem('DangleFruit') },
    { ids: ['Iterator_Dialogue_Items_Karma_Flower'],     unlocked: hasItem('KarmaFlower') },
    { ids: ['Iterator_Dialogue_Items_Jellyfish'],        unlocked: hasItem('JellyFish') },
    { ids: ['Iterator_Dialogue_Items_Lantern'],          unlocked: hasItem('Lantern') },
    { ids: ['Iterator_Dialogue_Items_Mushroom'],         unlocked: hasItem('Mushroom') },
    { ids: ['Iterator_Dialogue_Items_Slime_Mold'],       unlocked: hasItem('SlimeMold') },
    { ids: ['Iterator_Dialogue_Items_Spore_Puff'],       unlocked: hasItem('SporePlant') },
    { ids: ['Iterator_Dialogue_Items_Bubble_Weed'],      unlocked: hasItem('BubbleGrass') },
    { ids: ['Iterator_Dialogue_Items_Singularity_Bomb'], unlocked: hasItem('SingularityBomb') },
    { ids: ['Iterator_Dialogue_Items_Seed'],             unlocked: hasItem('Seed') },
    { ids: ['Iterator_Dialogue_Items_Fire_Egg'],         unlocked: hasItem('FireEgg') },
    { ids: ['Iterator_Dialogue_Items_Gooieduck'],        unlocked: hasItem('GooieDuck') },
    { ids: ['Iterator_Dialogue_Items_Lilypuck'],         unlocked: hasItem('LillyPuck') },
    { ids: ['Iterator_Dialogue_Items_Glow_Weed'],        unlocked: hasItem('GlowWeed') },
    { ids: ['Iterator_Dialogue_Items_Dandelion_Peach'],  unlocked: hasItem('DandelionPeach') },
    { ids: ['Iterator_Dialogue_Items_Cloak'],            unlocked: hasItem('MoonCloak') },
    { ids: ['Iterator_Dialogue_Items_Noodlefly_Egg'],    unlocked: hasItem('NeedleEgg') },
    { ids: ['Iterator_Dialogue_Items_Rarefaction_Cell'], unlocked: hasItem('EnergyCell') },
    { ids: ['Iterator_Dialogue_Items_Joke_Creatures'],   unlocked: hasItem('JokeRifle') },
    { ids: ['Iterator_Dialogue_Items_Spearmaster_Needle'], unlocked: hasItem('SpearmasterSpear') },
    { ids: ['Iterator_Dialogue_Items_Cherrybomb', 'Iterator_Dialogue_Items_Grenade'],         unlocked: hasItem('ScavengerBomb') },
    { ids: ['Iterator_Dialogue_Items_Overseer_Eye', 'Iterator_Dialogue_Items_Inspector_Eye'], unlocked: hasItem('OverseerCarcass') },
    { ids: ['Iterator_Dialogue_Items_Vulture_Mask', 'Iterator_Dialogue_Items_Chieftain_Scavenger_Mask', 'Iterator_Dialogue_Items_Elite_Scavenger_Mask'], unlocked: hasItem('VultureMask') },
    { ids: ['Iterator_Dialogue_Items_Slugpup'],          unlocked: hasItem('SlugNPC', 'Slugpup') },

    // Watcher — Spinning Top encounters (vanilla series)
    { ids: ['Watcher_ST_Decisiontree', 'Watcher_vanillaEncounter_1'], unlocked: watcherMaxRipple(0.25) },
    { ids: ['Watcher_vanillaEncounter_2'],                            unlocked: watcherMaxRipple(0.5) },
    { ids: ['Watcher_vanillaEncounter_3'],                            unlocked: watcherMaxRipple(1.0) },

    // Watcher — Spinning Top N-series (maxRippleLevel-gated)
    { ids: ['Watcher_ST_Echo_Ghost_ST_N1'], unlocked: watcherMaxRipple(1.5) },
    { ids: ['Watcher_ST_Echo_Ghost_ST_N5'], unlocked: watcherMaxRipple(3.0) },
    { ids: ['Watcher_ST_Echo_Ghost_ST_N2'], unlocked: watcherMaxRipple(4.5) },

    // Watcher — Spinning Top N-series (minRippleLevel-gated)
    { ids: ['Watcher_ST_Echo_Ghost_ST_N3'], unlocked: watcherMinRipple(3.0) },
    { ids: ['Watcher_ST_Echo_Ghost_ST_N6'], unlocked: watcherMinRipple(4.0) },
    {
        ids: ['Watcher_ST_Echo_Ghost_ST_N7'],
        unlocked: c => (
            (c.watcherState?.minRippleLevel ?? 0) >= 4.5 && !watcherSTIncludes(0)(c)
        ) || (c.watcherState?.minRippleLevel ?? 0) >= 5.0,
    },

    // Watcher — Spinning Top special encounters
    { ids: ['Watcher_ST_Echo_Ghost_ST_ROT1'],  unlocked: watcherSpinningTopRot },
    { ids: ['Watcher_ST_Other_WAUA'],          unlocked: watcherVisitBath },
    { ids: ['Watcher_ST_Other_WARA'],          unlocked: and(watcherMaxRipple(1.0), watcherSTCount(4)) },
    { ids: ['Watcher_ST_Echo_Ghost_ST_N4'],    unlocked: watcherSTIncludes(0) },
    { ids: ['Watcher_ST_Other_toys'],          unlocked: watcherMaxRipple(4.5) },

    // Watcher — Prince: Karma Sigil conversations (pre-awakening)
    { ids: ['Watcher_Prince_KarmaSigils_Prince_KS_1'],   unlocked: watcherPrinceSeen(214) },
    { ids: ['Watcher_Prince_KarmaSigils_Prince_KS_2'],   unlocked: watcherPrinceSeen(218) },

    // Watcher — Prince: awakened chamber dialogues
    { ids: ['Watcher_Prince_Dialogue_Prince_1_2'],       unlocked: watcherPrinceSeen(222) },
    { ids: ['Watcher_Prince_Dialogue_Prince_3'],         unlocked: watcherPrinceSeen(224) },
    { ids: ['Watcher_Prince_Dialogue_Prince_4'],         unlocked: watcherPrinceSeen(225) },
    { ids: ['Watcher_Prince_Dialogue_Prince_5'],         unlocked: watcherPrinceSeen(226) },
    { ids: ['Watcher_Prince_Dialogue_Prince_6'],         unlocked: watcherPrinceSeen(227) },
    { ids: ['Watcher_Prince_Dialogue_Prince_7'],         unlocked: watcherPrinceSeen(228) },

    // Watcher — Prince: runtime events (best available proxy)
    {
        ids: [
            'Watcher_Prince_Events_AcknowledgePlayerGift',
            'Watcher_Prince_Events_TalkToDeadPlayer',
            'Watcher_Prince_Events_Pain',
            'Watcher_Prince_Events_AcknowledgePlayerCamouflage',
        ],
        unlocked: watcherPrinceEncounters(1),
    },

    // Watcher — Void Weaver encounters
    { ids: ['Watcher_Weaver_Dialogue_Weaver_1'], unlocked: watcherWeaverEncounters(1) },
    { ids: ['Watcher_Weaver_Dialogue_Weaver_2'], unlocked: watcherWeaverEncounters(2) },
    { ids: ['Watcher_Weaver_Dialogue_Weaver_3'], unlocked: watcherWeaverEncounters(3) },
    { ids: ['Watcher_Weaver_Dialogue_Weaver_4'], unlocked: watcherWeaverEncounters(4) },

    // Watcher — Prince × Weaver arc
    { ids: ['Watcher_Prince_Weaver_Prince_Weaver_1'],  unlocked: watcherPrinceWeaverAck },
    { ids: ['Watcher_Prince_Weaver_Prince_Weaver_2'],  unlocked: watcherPrinceWeaverProg(1) },
    { ids: ['Watcher_Prince_Weaver_Prince_Ascension'], unlocked: watcherAscensionEnding },

];

function pearlTypeInItem(item: { type: string; extraFields?: string[] | null } | null): string | null {
    return item?.type === 'DataPearl' ? (item.extraFields?.[2] ?? null) : null;
}

function collectPhysicalPearlTypes(record: SaveStateRecord): Set<string> {
    const types = new Set<string>();
    const { state } = record;
    for (const item of state.swallowedItems ?? []) {
        const t = pearlTypeInItem(item); if (t) types.add(t);
    }
    for (const item of state.playerGrasps ?? []) {
        const t = pearlTypeInItem(item); if (t) types.add(t);
    }
    for (const tracker of state.objectTrackers ?? []) {
        const t = pearlTypeInItem(tracker.entity); if (t) types.add(t);
    }
    for (const obj of state.objects ?? []) {
        const t = pearlTypeInItem(obj); if (t) types.add(t);
    }
    for (const region of state.regionStates ?? []) {
        for (const obj of region.objects ?? []) {
            const t = pearlTypeInItem(obj); if (t) types.add(t);
        }
    }
    return types;
}

function buildVisitedRooms(state: SaveStateRecord['state']): Set<string> {
    const rooms = new Set<string>();
    for (const region of state.regionStates ?? []) {
        for (const room of region.roomsVisited ?? []) rooms.add(room);
    }
    return rooms;
}

function addPearlSource(map: Map<string, Set<PearlSource>>, id: string, source: PearlSource) {
    if (!map.has(id)) map.set(id, new Set());
    map.get(id)!.add(source);
}

export function extractCollectibles(result: ParseFileResult): SaveCollectibles {
    const pearlSources = new Map<string, Set<PearlSource>>();
    const broadcastInternalIds = new Set<string>();
    const echoGhostIds = new Set<string>();
    const itemTypesDescribed = new Set<string>();
    const slugcatVisitedRooms = new Map<string, Set<string>>();
    let allChallengesCompleted = false;
    const oracleStates = new Map<string, {
        moonEncounters: number;
        moonEncountersWithMark: number;
        fpConversations: number;
        moonRevived: boolean;
        altEnding: boolean;
        pebblesHelped: boolean;
        energyRailOff: boolean;
        looksToTheDoom: boolean;
        zeroPebbles: boolean;
        smPearlTagged: boolean;
    }>();
    let watcherState: WatcherState | null = null;
    let watcherGlobal: WatcherGlobal = {
        beaten: false, beatenSpinningTop: false, beatenSentientRot: false,
        beatenVoidWeaver: false, watcherEndingID: 0, beatenAscension: false,
    };
    let watcherVisitedPearlProjector = false;

    for (const record of result.model.records ?? []) {
        if (record.type === 'MiscProgRecord') {
            const d = (record as MiscProgRecord).data;
            (d.lorePearls ?? []).forEach(id => addPearlSource(pearlSources, id, 'base'));
            (d.lorePearlsArtificer ?? []).forEach(id => addPearlSource(pearlSources, id, 'artificer'));
            (d.lorePearlsSpearmaster ?? []).forEach(id => addPearlSource(pearlSources, id, 'spearmaster'));
            (d.lorePearlsSaint ?? []).forEach(id => addPearlSource(pearlSources, id, 'saint'));
            (d.broadcasts ?? []).forEach(id => broadcastInternalIds.add(id));

            const cc = d.challengesCompleted;
            if (typeof cc === 'string' && cc.length >= 70 && !cc.includes('0')) {
                allChallengesCompleted = true;
            }

            const iw = d.integersWatcher ?? [];
            watcherGlobal = {
                beaten:            iw[0] === 1,
                beatenSpinningTop: iw[2] === 1,
                beatenSentientRot: iw[3] === 1,
                beatenVoidWeaver:  iw[4] === 1,
                watcherEndingID:   iw[5] ?? 0,
                beatenAscension:   iw.length > 9 && iw[9] === 1,
            };
        }
        if (record.type === 'SaveStateRecord') {
            const { state, slugcat } = record as SaveStateRecord;
            const chatLogs = state.deathPersistentData.chatLogs ?? [];
            const prePebChatLogs = state.deathPersistentData.prePebChatLogs ?? [];
            chatLogs.forEach(id => broadcastInternalIds.add(id));
            prePebChatLogs.forEach(id => broadcastInternalIds.add(id));

            const isLpToken = (id: string) => /^Chatlog_Broadcast\d+$/.test(id);
            const prePebCount = prePebChatLogs.filter(isLpToken).length;
            const postPebCount = chatLogs.filter(isLpToken).length - prePebCount;
            for (let i = 0; i < prePebCount; i++) broadcastInternalIds.add(`LP_${i}`);
            for (let i = 0; i < postPebCount; i++) broadcastInternalIds.add(`LP_${i}_PEB`);

            (state.deathPersistentData.ghosts ?? []).forEach(g => {
                if (g.count >= 1) echoGhostIds.add(g.ghostId);
            });

            const mwd = state.miscWorldData;
            (mwd?.slaiState?.miscItemsDescribed ?? []).forEach(gameType => itemTypesDescribed.add(gameType));

            oracleStates.set(slugcat, {
                moonEncounters:         mwd?.slaiState?.integersArray?.[0] ?? 0,
                moonEncountersWithMark: mwd?.slaiState?.integersArray?.[1] ?? 0,
                fpConversations:        mwd?.ssaiConversationsHad ?? 0,
                moonRevived:            mwd?.moonRevived ?? false,
                altEnding:              state.deathPersistentData.altEnding ?? false,
                pebblesHelped:          mwd?.pebblesHelped ?? false,
                energyRailOff:          mwd?.energyRailOff ?? false,
                looksToTheDoom:         state.deathPersistentData.looksToTheDoom ?? false,
                zeroPebbles:            state.deathPersistentData.zeroPebbles ?? false,
                smPearlTagged:          mwd?.smPearlTagged ?? false,
            });

            slugcatVisitedRooms.set(slugcat, buildVisitedRooms(state));

            if (slugcat === 'Watcher') {
                const dpd = state.deathPersistentData;
                const mwdIW = mwd?.integersWatcher ?? [];
                watcherState = {
                    maxRippleLevel:                    dpd.maxRippleLevel?.value ?? 0,
                    minRippleLevel:                    dpd.minRippleLevel?.value ?? 0,
                    spinningTopEncounters:             dpd.spinningTopEncounters ?? [],
                    spinningTopRot:                    dpd.spinningTopRot ?? false,
                    visitBath:                         dpd.visitBath ?? false,
                    highestPrinceConversationSeen:     mwdIW[12] ?? 0,
                    numberOfPrinceEncounters:          mwdIW[6] ?? 0,
                    numberOfVoidWeaverEncounters:      mwdIW[4] ?? 0,
                    princeWeaverGrowthAcknowledgement: mwdIW[14] ?? 0,
                    princeWeaverDialogProgression:     mwdIW[13] ?? 0,
                    rotInfectedRegionCount:            mwd?.rotInfectedRegions?.length ?? 0,
                    physicalPearlTypes:                collectPhysicalPearlTypes(record as SaveStateRecord),
                    visitedRooms:                      buildVisitedRooms(state),
                };
                watcherVisitedPearlProjector = watcherState.visitedRooms.has('WAUA_PEARL');
            }
        }
    }

    // --- Iterator pearl proxy detection (Misc, BroadcastMisc, PebblesPearl) ---
    // These types are excluded from significantPearls tracking by the game engine; detection
    // uses room visit records as the closest available proxy.
    const iteratorPearlTranscribers = new Map<string, Set<string>>();

    // PebblesPearl: FP's gray marbles, readable by Moon at SL_AI or revived Moon at RM_AI
    {
        const ctx = new Set<string>();
        // LttM-post-collapse: any slugcat that visited both SS_AI (picked up FP pearl) and SL_AI
        if (Array.from(slugcatVisitedRooms.values()).some(rooms => rooms.has('SS_AI') && rooms.has('SL_AI'))) {
            ctx.add('LttM-post-collapse');
        }
        // LttM-rivulet: Rivulet brings a pearl from RM_AI (revived Moon's chamber) to SL_AI
        const riv = slugcatVisitedRooms.get('Rivulet');
        if (riv?.has('RM_AI') && riv?.has('SL_AI')) ctx.add('LttM-rivulet');
        if (ctx.size > 0) iteratorPearlTranscribers.set('PebblesPearl', ctx);
    }

    // Misc (white pearls): generic unmarked DataPearls read by Moon or FP (Artificer only)
    {
        const ctx = new Set<string>();
        // LttM-post-collapse: any non-Artificer slugcat that reached Moon's chamber
        if (Array.from(slugcatVisitedRooms.entries()).some(([slug, rooms]) => slug !== 'Artificer' && rooms.has('SL_AI'))) {
            ctx.add('LttM-post-collapse');
        }
        // FP-artificer: Artificer reads white pearls at FP's chamber instead
        if (slugcatVisitedRooms.get('Artificer')?.has('SS_AI')) ctx.add('FP-artificer');
        if (ctx.size > 0) iteratorPearlTranscribers.set('Misc', ctx);
    }

    // BroadcastMisc: broadcast node relics readable by Moon; Spear and Artificer are excluded
    // from pearl spawns in room settings, so only LttM-post-collapse is reachable in practice
    {
        const ctx = new Set<string>();
        if (Array.from(slugcatVisitedRooms.entries()).some(([slug, rooms]) =>
            slug !== 'Spear' && slug !== 'Artificer' && rooms.has('SL_AI')
        )) {
            ctx.add('LttM-post-collapse');
        }
        if (ctx.size > 0) iteratorPearlTranscribers.set('BroadcastMisc', ctx);
    }

    return { pearlSources, broadcastInternalIds, echoGhostIds, itemTypesDescribed, iteratorPearlTranscribers, allChallengesCompleted, oracleStates, watcherState, watcherGlobal, watcherVisitedPearlProjector };
}

function matchesToSave(pearl: PearlData, collectibles: SaveCollectibles): boolean {
    const internalId = pearl.metadata.internalId;
    if (internalId) {
        if (collectibles.pearlSources.has(internalId) || collectibles.broadcastInternalIds.has(internalId)) {
            return true;
        }
        // Misc / BroadcastMisc / PebblesPearl: not tracked in significantPearls, detected via room visits.
        // Only match if the individual pearl entry has at least one transcriber in the unlocked context set.
        const proxyContexts = collectibles.iteratorPearlTranscribers.get(internalId);
        if (proxyContexts && pearl.transcribers.some(t => proxyContexts.has(t.transcriber))) {
            return true;
        }
        // Watcher projector pearl with a physical pearl type tracked in the save
        if (collectibles.watcherVisitedPearlProjector && (collectibles.watcherState?.physicalPearlTypes.has(internalId) ?? false)) {
            return true;
        }
        return false;
    }
    // Dev commentary nodes: unlocked by completing all 70 arena challenges
    if (collectibles.allChallengesCompleted && pearl.id.startsWith('DevComm_')) {
        return true;
    }
    // Watcher misc projections have no top-level internalId; gated on WAUA visit
    if (collectibles.watcherVisitedPearlProjector && pearl.id.startsWith('Watcher_Pearl_Misc_Projection_')) {
        return true;
    }
    return COLLECTIBLE_RULES.some(rule => rule.ids.includes(pearl.id) && rule.unlocked(collectibles));
}

function getTranscribersToUnlock(pearl: PearlData, collectibles: SaveCollectibles): Set<string> {
    const internalId = pearl.metadata.internalId;

    // Proxy-detected types: unlock only the transcriber contexts inferred from room visits
    if (internalId) {
        const proxyContexts = collectibles.iteratorPearlTranscribers.get(internalId);
        if (proxyContexts) {
            const result = new Set<string>();
            pearl.transcribers.forEach((t, idx) => {
                if (proxyContexts.has(t.transcriber)) {
                    result.add(getEffectiveTranscriberName(pearl.transcribers, t.transcriber, idx));
                }
            });
            return result;
        }
    }

    const sources = internalId ? collectibles.pearlSources.get(internalId) : undefined;

    if (!sources) {
        return new Set(pearl.transcribers.map((t, idx) =>
            getEffectiveTranscriberName(pearl.transcribers, t.transcriber, idx)
        ));
    }

    const allowed = new Set<string>();
    sources.forEach(src => TRANSCRIBERS_FOR_SOURCE[src].forEach(t => allowed.add(t)));

    const result = new Set<string>();
    pearl.transcribers.forEach((t, idx) => {
        if (allowed.has(t.transcriber)) {
            result.add(getEffectiveTranscriberName(pearl.transcribers, t.transcriber, idx));
        }
    });
    return result;
}

export function applyCollectibles(
    pearls: PearlData[],
    collectibles: SaveCollectibles,
    unlockMode: string
): { foundData: Map<string, Set<string>>; summary: SaveMatchSummary } {
    const foundData = new Map<string, Set<string>>();
    let pearls_c = 0, broadcasts = 0, echoes = 0, oracles = 0;

    for (const pearl of pearls) {
        if (!matchesToSave(pearl, collectibles)) continue;

        const transcribers = getTranscribersToUnlock(pearl, collectibles);
        foundData.set(pearl.id, transcribers);

        if (unlockMode === 'unlock') {
            UnlockManager.unlockPearl(pearl);
            transcribers.forEach(name => UnlockManager.unlockTranscription(pearl, name));
        }

        const type = pearl.metadata.type;
        if (type === 'echo') echoes++;
        else if (type === 'broadcast') broadcasts++;
        else if (pearl.id.startsWith('FP_Dialogue_') || pearl.id.startsWith('LttM_')) oracles++;
        else pearls_c++;
    }

    return {
        foundData,
        summary: { pearls: pearls_c, broadcasts, echoes, oracles, total: foundData.size },
    };
}
