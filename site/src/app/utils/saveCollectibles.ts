import { PearlData } from '../types/types';
import { MiscProgRecord, ParseFileResult, SaveStateRecord } from '../types/SaveModel';
import UnlockManager from './unlockManager';
import { getEffectiveTranscriberName } from './transcriberUtils';
import { SaveUnlockEval } from './saveUnlockLoader';

type PearlSource = 'Base' | 'Artificer' | 'Spearmaster' | 'Saint';

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

export interface OracleState {
    moonEncounters: number;
    moonEncountersWithMark: number;
    lttmNeuronsLeft: number;
    lttmNeuronsGiven: number;
    fpConversations: number;
    moonRevived: boolean;
    altEnding: boolean;
    pebblesHelped: boolean;
    energyRailOff: boolean;
    looksToTheDoom: boolean;
    zeroPebbles: boolean;
    smPearlTagged: boolean;
    hasMark: boolean;
    lttmReadPearl: boolean;
    lttmDiscussedObject: boolean;
}

export interface SaveCollectibles {
    pearlSources: Map<string, Set<PearlSource>>;
    broadcastInternalIds: Set<string>;
    echoGhostIds: Set<string>;
    slugcatEchoIds: Map<string, Set<string>>;
    itemTypesDescribed: Set<string>;
    allChallengesCompleted: boolean;
    oracleStates: Map<string, OracleState>;
    slugcatVisitedRooms: Map<string, Set<string>>;
    broadcastMiscLttm: boolean;
    broadcastMiscFp: boolean;
    watcherState: WatcherState | null;
    watcherGlobal: WatcherGlobal;
}

export interface SaveMatchSummary {
    pearls: number;
    broadcasts: number;
    echoes: number;
    oracles: number;
    total: number;
}

// Per-slugcat BroadcastMisc pearl locations and which oracle room they read at.
// Spearmaster has no BroadcastMisc rooms.
const BROADCAST_MISC_SLUGCATS: Record<string, { rooms: readonly string[]; oracle: string; context: string }> = {
    White:     { rooms: ['HI_B02','GW_D01','GW_E02','GW_C04','DS_A11','DS_A19','SH_E05','VS_A05','CC_C11','CC_C04','SS_D08','SI_A07','SI_B02','SI_C07','SI_D05','LM_EDGE02','LM_B04','SL_EDGE02'], oracle: 'SL_AI', context: 'LttM-post-collapse' },
    Yellow:    { rooms: ['SU_A17','HI_B02','HI_A18','GW_D01','GW_E02','GW_C04','DS_A11','DS_A19','SH_B03','SH_E05','VS_A05','CC_C11','CC_C04','UW_J01','SS_D08','SI_A07','SI_B02','SI_C07','SI_D05','SI_B12','LF_D01','SB_C07','LM_EDGE02','LM_B04','SL_EDGE02'], oracle: 'SL_AI', context: 'LttM-post-collapse' },
    Red:       { rooms: ['GW_E02','GW_C04','DS_A11','SH_B03','SS_D08','SI_A07','SI_B02','SI_D05','LM_EDGE02','LM_B04'], oracle: 'SL_AI', context: 'LttM-post-collapse' },
    Gourmand:  { rooms: ['DS_A11','DS_A19','GW_E02','GW_C04','CC_C11','CC_C04','SS_D08','SI_A07','SI_B02','SI_D05','LM_EDGE02','LM_B04'], oracle: 'SL_AI', context: 'LttM-post-collapse' },
    Artificer: { rooms: ['SI_A07'], oracle: 'SS_AI', context: 'FP-artificer' },
    Rivulet:   { rooms: ['SU_A17','HI_B02','HI_A18','DS_A11','DS_A19','SH_B03','SH_E05','VS_A05','CC_C11','CC_C04','UW_J01','SS_D08','SI_A07','LF_D01','SB_C07','LM_EDGE02','LM_B04','SL_EDGE02','RM_D08'], oracle: 'SL_AI', context: 'LttM-post-collapse' },
    Saint:     { rooms: ['VS_A05','SI_A07','LM_B04'], oracle: 'SL_AI', context: 'LttM-post-collapse' },
    Inv:       { rooms: ['GW_E02','GW_C04','SL_EDGE02'], oracle: 'SL_AI', context: 'LttM-post-collapse' },
};


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

function buildOracleState(state: SaveStateRecord['state']): OracleState {
    const mwd = state.miscWorldData;
    return {
        moonEncounters:         mwd?.slaiState?.integersArray?.[0] ?? 0,
        moonEncountersWithMark: mwd?.slaiState?.integersArray?.[1] ?? 0,
        lttmNeuronsLeft:        mwd?.slaiState?.integersArray?.[2] ?? 0,
        lttmNeuronsGiven:       mwd?.slaiState?.integersArray?.[4] ?? 0,
        fpConversations:        mwd?.ssaiConversationsHad ?? 0,
        moonRevived:            mwd?.moonRevived ?? false,
        altEnding:              state.deathPersistentData.altEnding ?? false,
        pebblesHelped:          mwd?.pebblesHelped ?? false,
        energyRailOff:          mwd?.energyRailOff ?? false,
        looksToTheDoom:         state.deathPersistentData.looksToTheDoom ?? false,
        zeroPebbles:            state.deathPersistentData.zeroPebbles ?? false,
        smPearlTagged:          mwd?.smPearlTagged ?? false,
        hasMark:                state.deathPersistentData.hasTheMark ?? false,
        lttmReadPearl:          (mwd?.slaiState?.significantPearls?.length ?? 0) > 0,
        lttmDiscussedObject:    (mwd?.slaiState?.miscItemsDescribed?.length ?? 0) > 0,
    };
}

function buildWatcherState(record: SaveStateRecord): WatcherState {
    const { state } = record;
    const dpd = state.deathPersistentData;
    const mwdIW = state.miscWorldData?.integersWatcher ?? [];
    return {
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
        rotInfectedRegionCount:            state.miscWorldData?.rotInfectedRegions?.length ?? 0,
        physicalPearlTypes:                collectPhysicalPearlTypes(record),
        visitedRooms:                      buildVisitedRooms(state),
    };
}

export function extractCollectibles(result: ParseFileResult): SaveCollectibles {
    const pearlSources = new Map<string, Set<PearlSource>>();
    const broadcastInternalIds = new Set<string>();
    const echoGhostIds = new Set<string>();
    const slugcatEchoIds = new Map<string, Set<string>>();
    const itemTypesDescribed = new Set<string>();
    const oracleStates = new Map<string, OracleState>();
    const slugcatVisitedRooms = new Map<string, Set<string>>();
    let allChallengesCompleted = false;
    let watcherState: WatcherState | null = null;
    let watcherGlobal: WatcherGlobal = {
        beaten: false, beatenSpinningTop: false, beatenSentientRot: false,
        beatenVoidWeaver: false, watcherEndingID: 0, beatenAscension: false,
    };

    for (const record of result.model.records ?? []) {
        if (record.type === 'MiscProgRecord') {
            const d = (record as MiscProgRecord).data;
            (d.lorePearls ?? []).forEach(id => addPearlSource(pearlSources, id, 'Base'));
            (d.lorePearlsArtificer ?? []).forEach(id => addPearlSource(pearlSources, id, 'Artificer'));
            (d.lorePearlsSpearmaster ?? []).forEach(id => addPearlSource(pearlSources, id, 'Spearmaster'));
            (d.lorePearlsSaint ?? []).forEach(id => addPearlSource(pearlSources, id, 'Saint'));
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
            const rec = record as SaveStateRecord;
            const { state, slugcat } = rec;
            const chatLogs = state.deathPersistentData.chatLogs ?? [];
            const prePebChatLogs = state.deathPersistentData.prePebChatLogs ?? [];
            chatLogs.forEach(id => broadcastInternalIds.add(id));
            prePebChatLogs.forEach(id => broadcastInternalIds.add(id));

            const isLpToken = (id: string) => /^Chatlog_Broadcast\d+$/.test(id);
            const prePebCount = prePebChatLogs.filter(isLpToken).length;
            const postPebCount = chatLogs.filter(isLpToken).length - prePebCount;
            for (let i = 0; i < prePebCount; i++) broadcastInternalIds.add(`LP_${i}`);
            for (let i = 0; i < postPebCount; i++) broadcastInternalIds.add(`LP_${i}_PEB`);

            const echoIds = new Set<string>();
            (state.deathPersistentData.ghosts ?? []).forEach(g => {
                if (g.count >= 1) { echoGhostIds.add(g.ghostId); echoIds.add(g.ghostId); }
            });
            slugcatEchoIds.set(slugcat, echoIds);

            (state.miscWorldData?.slaiState?.miscItemsDescribed ?? []).forEach(gameType => itemTypesDescribed.add(gameType));

            oracleStates.set(slugcat, buildOracleState(state));
            slugcatVisitedRooms.set(slugcat, buildVisitedRooms(state));

            if (slugcat === 'Watcher') watcherState = buildWatcherState(rec);
        }
    }

    // BroadcastMisc: pre-compute reachability flags exposed as DSL globals.
    let broadcastMiscLttm = false;
    let broadcastMiscFp = false;
    for (const [slug, entry] of Object.entries(BROADCAST_MISC_SLUGCATS)) {
        const rooms = slugcatVisitedRooms.get(slug);
        if (rooms && entry.rooms.some(r => rooms.has(r)) && rooms.has(entry.oracle)) {
            if (entry.context === 'LttM-post-collapse') broadcastMiscLttm = true;
            if (entry.context === 'FP-artificer') broadcastMiscFp = true;
        }
    }

    return {
        pearlSources, broadcastInternalIds, echoGhostIds, slugcatEchoIds, itemTypesDescribed,
        allChallengesCompleted, oracleStates, slugcatVisitedRooms,
        broadcastMiscLttm, broadcastMiscFp,
        watcherState, watcherGlobal,
    };
}

function hasPerTranscriberUnlocks(pearl: PearlData): boolean {
    return pearl.transcribers.some(t => typeof t.metadata.saveUnlock === 'string');
}

function matchesToSave(pearl: PearlData, collectibles: SaveCollectibles, evaluator: SaveUnlockEval): boolean {
    // Per-transcriber saveUnlock: any transcriber whose condition passes unlocks the entry.
    if (hasPerTranscriberUnlocks(pearl)) {
        return pearl.transcribers.some(t => {
            const expr = t.metadata.saveUnlock;
            return typeof expr === 'string' ? evaluator.evaluate(expr, { collectibles }) : false;
        });
    }

    // Entry-level saveUnlock expressions (multiple lines = OR).
    const exprs = pearl.metadata.saveUnlock;
    if (exprs && exprs.length > 0) {
        return exprs.some(expr => evaluator.evaluate(expr, { collectibles }));
    }

    return false;
}

function getTranscribersToUnlock(pearl: PearlData, collectibles: SaveCollectibles, evaluator: SaveUnlockEval): Set<string> {
    if (hasPerTranscriberUnlocks(pearl)) {
        const result = new Set<string>();
        pearl.transcribers.forEach((t, idx) => {
            const expr = t.metadata.saveUnlock;
            if (typeof expr === 'string' && evaluator.evaluate(expr, { collectibles })) {
                result.add(getEffectiveTranscriberName(pearl.transcribers, t.transcriber, idx));
            }
        });
        return result;
    }

    return new Set(pearl.transcribers.map((t, idx) =>
        getEffectiveTranscriberName(pearl.transcribers, t.transcriber, idx)
    ));
}

export function applyCollectibles(
    pearls: PearlData[],
    collectibles: SaveCollectibles,
    unlockMode: string,
    evaluator: SaveUnlockEval
): { foundData: Map<string, Set<string>>; summary: SaveMatchSummary } {
    const foundData = new Map<string, Set<string>>();
    let pearls_c = 0, broadcasts = 0, echoes = 0, oracles = 0;

    for (const pearl of pearls) {
        if (!matchesToSave(pearl, collectibles, evaluator)) continue;

        const transcribers = getTranscribersToUnlock(pearl, collectibles, evaluator);
        foundData.set(pearl.id, transcribers);

        if (unlockMode === 'unlock') {
            UnlockManager.unlockPearl(pearl);
            transcribers.forEach(name => UnlockManager.unlockTranscription(pearl, name));
        }

        const type = pearl.metadata.type;
        if (type === 'echo') echoes++;
        else if (type === 'broadcast') broadcasts++;
        else if (type === 'pearl') pearls_c++;
        else oracles++;
    }

    return {
        foundData,
        summary: { pearls: pearls_c, broadcasts, echoes, oracles, total: foundData.size },
    };
}
