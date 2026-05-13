export type SaveFieldFloat = { value: number; raw?: string }

export interface GhostEntry {
    ghostId: string
    count: number
}

export interface SLOrcacleState {
    integersArray: number[]
    miscBools: boolean[]
    significantPearls: string[]
    miscItemsDescribed: string[]
    likesPlayer: string
    itemsAlreadyTalkedAbout: string[]
    talkedPebblesDeath: boolean
    shownEnergyCell: boolean
    unrecognizedTokens: string[]
}

export interface PlayerGuideState {
    integersArray: number[]
    itemTypes: string[]
    creatureTypes: string[]
    likesPlayer: string
    handHolding: string
    imagesShown: string[]
    forcedDirsGiven: string[]
    unrecognizedTokens: string[]
}

export type SaveFieldDouble = { value: number; raw?: string }

export interface ExtractedEnvelope {
    prefix: string
    checksum: string
    suffix: string
}

export interface ParseFileResult {
    checksumOk: boolean
    model: ParsedSaveFile
}

export type ProgressionRecord =
    | SaveStateRecord
    | MiscProgRecord
    | MapRecord
    | MapUpdateRecord
    | UnknownRecord

export interface SaveStateRecord {
    type: 'SaveStateRecord'
    slugcat: string
    state: SaveState
}

export interface MiscProgRecord {
    type: 'MiscProgRecord'
    data: MiscProgressionData
}

export interface MapRecord {
    type: 'MapRecord'
    slugcat: string | null
    region: string
    base64Png: string
}

export interface MapUpdateRecord {
    type: 'MapUpdateRecord'
    slugcat: string | null
    region: string
    timestamp: string
}

export interface UnknownRecord {
    type: 'UnknownRecord'
    rawToken: string
}

export interface ParsedSaveFile {
    envelope: ExtractedEnvelope
    records: ProgressionRecord[]
}

export interface SaveState {
    slugcat: string
    timeline: string | null
    seed: number
    gameVersion: number
    initVersion: number
    worldVersion: number
    denPosition: string
    lastVanillaDen: string
    cycleNumber: number
    food: number
    nextIssuedId: number
    hasNeuronGlow: boolean
    guideOverseerDead: boolean
    respawnCreatures: number[]
    waitRespawnCreatures: number[]
    communities: FactionEntry[] | null
    regionStates: RegionState[]
    swallowedItems: PhysicalObject[]
    unrecognizedSwallowed: string[]
    playerGrasps: SavedEntity[]
    unrecognizedPlayerGrasps: string[]
    deathPersistentData: DeathPersistentSaveData
    miscWorldData: MiscWorldSaveData | null
    dreamsState: DreamsState | null
    totalFood: number
    totalTimeSeconds: number
    cyclesInCurrentWorldVersion: number
    kills: KillRecord[]
    hunterExtraCycles: boolean
    justBeatGame: boolean
    hasCitizenDrone: boolean
    isWearingCloak: boolean
    karmaDream: boolean
    forcePupsNextCycle: number | null
    objectTrackers: ObjectTracker[]
    objects: PhysicalObject[]
    friends: string[]
    oeEncounters: string[]
    warpPointTarget: string | null
    transferWarpObjects: string[]
    transferWarpCreatures: string[]
    importantTransfers: string[]
    transferWarpFatigue: number | null
    unrecognizedTokens: string[]
}

export interface DeathPersistentSaveData {
    redsDeath: boolean
    ascended: boolean
    reinforcedKarma: number
    karma: number
    karmaCap: number
    hasTheMark: boolean
    flowerPosition: string | null
    ghosts: GhostEntry[] | null
    songPlayRecords: SongPlayRecord[] | null
    sessionRecords: SessionRecord[] | null
    winState: EndgameRecord[] | null
    consumedFlowers: string[]
    tutorialMessages: string[] | null
    metersShown: string[] | null
    foodRepBonus: number
    ddWorldVersion: number
    deaths: number
    survives: number
    quits: number
    phirkc: boolean
    unlockedGates: string[]
    deathPositions: RoomPosition[]
    altEnding: boolean
    zeroPebbles: boolean
    looksToTheDoom: boolean
    slSiren: boolean
    deathTime: number | null
    friendSaveBonus: number
    chatLogs: string[] | null
    prePebChatLogs: string[] | null
    tips: number | null
    tipSeed: number | null
    rippleLevel: SaveFieldFloat | null
    minRippleLevel: SaveFieldFloat | null
    maxRippleLevel: SaveFieldFloat | null
    spinningTopEncounters: number[]
    spinningTopRot: boolean
    visitBath: boolean
    warpPoints: string[]
    newWarpPoints: string[]
    unrecognizedTokens: string[]
}

export interface MiscWorldSaveData {
    ssaiConversationsHad: number
    ssaiThrowOuts: number
    slaiState: SLOrcacleState | null
    playerGuideState: PlayerGuideState | null
    moonRevived: boolean
    pebblesHelped: boolean
    memoryFrolick: boolean
    cyclesSinceSSai: number
    energyRailOff: boolean
    energySeenState: number
    moonHeart: boolean
    moonRobe: boolean
    smPearlTagged: boolean
    halcyonTalk: boolean
    halcyonStole: boolean
    pebRivPost: boolean
    hrMelt: boolean
    cyclesSinceSlugpup: number
    integersWatcher: number[]
    outerRimLock: boolean
    visitShop: boolean
    deferredDream: string | null
    deferredStc: string | null
    seenRotDream: boolean
    seenStDream: boolean
    seenTerraceDream: boolean
    warpPoints: string[]
    weaverSeals: string[]
    voidWeaverSeals: string[]
    rotInfectedRegions: string[]
    rotSpreadRegions: string[]
    pendingRotSpreads: string[]
    extraRotSpreads: string[]
    rippleEggsCollected: number
    rippleEggsToRespawn: string[]
    unrecognizedTokens: string[]
}

export interface ShelterList {
    slugcat: string
    shelters: string[]
}

export interface CampaignTime {
    slugcat: string
    undeterminedFreeTime: SaveFieldDouble
    completedFreeTime: SaveFieldDouble
    lostFreeTime: SaveFieldDouble
    undeterminedFixedTime: SaveFieldDouble
    completedFixedTime: SaveFieldDouble
    lostFixedTime: SaveFieldDouble
}

export interface CustomColors {
    slugcat: string
    colorFlag: number
    colors: string[]
}

export interface RegionVisit {
    region: string
    firstSlugcat: string
}

export interface MiscProgressionData {
    currentSlugcat: string
    shelterLists: ShelterList[]
    conditionalShelterData: string | null
    levelTokens: string[]
    sandboxTokens: string[]
    classTokens: string[]
    safariTokens: string[]
    saintStomach: string | null
    playedArenas: string[]
    cloakTimeline: string | null
    lorePearls: string[]
    lorePearlsArtificer: string[]
    lorePearlsSpearmaster: string[]
    lorePearlsSaint: string[]
    hasDoneSaintFezEnding: number
    broadcasts: string[]
    challengeArenas: string[]
    challengesCompleted: string | null
    challengeCompleteTimes: number[]
    customChallenges: string[]
    customColors: CustomColors[]
    campaignTimes: CampaignTime[]
    regionsVisited: RegionVisit[] | null
    integers: number[]
    integersMMF: number[]
    integersMSC: number[]
    integersWatcher: number[]
    hunterPermadeathLocation: string | null
    menuRegion: string | null
    unrecognizedTokens: string[]
}

export interface RegionState {
    regionName: string
    lastCycleUpdated: number
    swarmRooms: SwarmRoom[]
    lineages: LineageEntry[] | null
    objects: PhysicalObject[]
    population: CreatureEntry[]
    sticks: StickRelation[]
    consumedItems: RoomPosition[]
    roomsVisited: string[]
    rippleRegions: string | null
    sentientRot: RotEntry[] | null
    collectedRippleEggs: string | null
    showRippleThreshold: number | null
    respawnRippleSpider: string | null
    unrecognizedTokens: string[]
    rawBlob: string | null
}

export interface KillRecord {
    type: string
    variant: number
    count: number
}

export interface EndgameRecord {
    campaign: string
    completed: number
    progressData: string
}

export interface SongPlayRecord {
    songName: string
    playCount: number
}

export interface SessionRecord {
    a: number
    b: number
}

export interface FactionEntry {
    faction: string
    rawValue: string
}

export interface StickRelation {
    cycle: number
    type: string
    holderId: string
    stuckId: string
    bit1: number
    bit2: number
}

export interface RoomPosition {
    room: string
    fields: number[]
}

export interface SwarmRoom {
    room: string
    state: number
}

export interface LineageEntry {
    room: string
    x: number
    y: number
    lineageIndex: number
    stage: number
}

export interface RotEntry {
    room: string
    rawLevel: string
}

export interface ObjectTracker {
    parts: string[]
    entity: {
        id: string
        subtype: string | null
        type: string
        room: string
        extraFields: string[]
    } | null
}

export interface DreamsState {
    integersArray: number[]
    unrecognizedTokens: string[]
}

export interface PhysicalObject {
    id: string
    subtype: string | null
    type: string
    room: string
    extraFields: string[]
}

export interface CreatureEntry {
    type: string
    id: string
    room: string
    tailParts: string[]
}

export type SavedEntity =
    | (PhysicalObject & { kind: 'PhysicalObject' })
    | (CreatureEntry & { kind: 'CreatureEntry' })
