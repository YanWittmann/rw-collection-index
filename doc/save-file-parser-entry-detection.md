# Save File Parser: Entry Detection

This document describes how every category of entry in the collection index is determined to be "found in save" after a user uploads their Rain World save file. It covers the save file data format, which fields drive each detection condition, the confidence level of each condition, and which entries cannot be detected at all.

The implementation lives in `site/src/app/utils/saveCollectibles.ts`. This document is the authoritative reference for the logic in that file and should be kept in sync with it.

Last updated: 2026-05-15 (revised)

---

## Save File Record Types

The WASM parser reads the raw save file and produces a list of typed records. Only two record types are relevant to collectible detection.

### MiscProgRecord

One per save file. Global across all slugcat campaigns. Key fields:

- `lorePearls`: array of pearl internalId strings read by Moon (LttM) during non-Saint, non-specialist campaigns
- `lorePearlsArtificer`: array of pearl internalIds read by Five Pebbles (FP) during Artificer's campaign, or any pearl with Artificer-specific FP dialogue
- `lorePearlsSpearmaster`: array of pearl internalIds Moon read during Spearmaster's campaign (note: this contains lore pearl IDs like `DM`, not the body pearl ID `Spearmasterpearl`)
- `lorePearlsSaint`: array of pearl internalIds Moon or FP read during Saint's campaign
- `broadcasts`: array of chatlog IDs collected by Watcher as region broadcasts
- `challengesCompleted`: a string of 70 characters (`0` or `1`), one per Arena multiplayer challenge slot
- `integersWatcher`: integer array for global Watcher campaign state; indices 0, 2, 3, 4, 5, and 9 record which endings have been completed

The save keys for the lorePearls fields are `LORE`, `LOREP`, `LOREDM`, `LOREFUT` respectively. The `challengesCompleted` field uses save key `CHCLEAR`. The global Watcher integers use save key `INTEGERSWATCHER`.

### SaveStateRecord

One per slugcat campaign. The slugcat name is stored as a string: `White`, `Yellow`, `Red`, `Gourmand`, `Artificer`, `Spear`, `Rivulet`, `Saint`, `Inv`, `Watcher`. Key sub-structures:

`deathPersistentData` survives death and is always present. Relevant fields:

- `chatLogs`: all chatlog IDs heard by this slugcat during their playthrough
- `prePebChatLogs`: chatlog IDs heard before reaching Five Pebbles (Spearmaster-specific)
- `ghosts`: array of `{ ghostId, count }` for Echo encounters; count of 0 means only approached, count of 1 or more means a full conversation occurred
- `altEnding`: boolean; meaning varies by slugcat (Artificer: killed Chieftain Scavenger; Rivulet: placed Rarefaction Cell at Moon; Spearmaster: completed alt-ending broadcast; Gourmand/Survivor/Monk: took the Outer Expanse path)
- `looksToTheDoom`: boolean; save key `LOOKSTOTHEDOOM`; true when Saint has ascended Moon in Rubicon
- `zeroPebbles`: boolean; save key `ZEROPEBBLES`; true when Saint has ascended FP in Rubicon
- `ascended`: boolean; save key `ASCENDED`; set after Saint's Rubicon conversations complete, after `looksToTheDoom` and `zeroPebbles` are already set
- `maxRippleLevel`: float; save key `MAXRIPPLELEVEL`; Watcher only; ceiling raised by Spinning Top encounters
- `minRippleLevel`: float; save key `MINRIPPLELEVEL`; Watcher only; floor enforced by story progress
- `spinningTopEncounters`: integer array; save key `SPINNINGTOPENCOUNTERS`; Watcher only; spawn identifier for each Spinning Top object interacted with
- `spinningTopRot`: boolean; save key `SPINNINGTOPROT`; Watcher only; Rot-region Spinning Top encounter seen
- `visitBath`: boolean; save key `VISITBATH`; Watcher only; Void Bath encounter at WAUA seen

`miscWorldData` holds world-level state and may be null for fresh saves. Relevant fields:

- `slaiState.integersArray[0]`: `playerEncounters`; total visits to Moon's chamber
- `slaiState.integersArray[1]`: `encountersWithMark`; visits to Moon after receiving the mark of communication; for Rivulet, boosted by 5 when the ending cutscene fires
- `slaiState.miscItemsDescribed`: array of game-type name strings for every item Moon has described to this slugcat; permanent record, never cleared
- `ssaiConversationsHad`: count of complete conversation sessions with Five Pebbles
- `ssaiThrowOuts`: FP throw-out count; set to 100 as a one-time sentinel when Artificer's chieftain pity dialogue fires
- `moonRevived`: boolean; save key `MOONHEART`; true when the Rarefaction Cell has been placed at Moon (Rivulet or Saint)
- `pebblesHelped`: boolean; save key `PEBBLESHELPED`; true when Hunter showed a green neuron fly to FP
- `energyRailOff`: boolean; save key `ENERGYRAILOFF`; true when Rivulet removed the Rarefaction Cell from FP's energy rail
- `smPearlTagged`: boolean; save key `SMPEARLTAGGED`; true when the DM oracle (Moon at Silent Construct) has completed the `Moon_Spearmaster_Pearl` dialogue and tagged Spearmaster's body pearl
- `rotInfectedRegions`: string array; region codes currently infected by the Sentient Rot (Watcher)
- `integersWatcher`: per-slugcat Watcher integer array (distinct from the global one in MiscProgRecord); holds Prince and Weaver encounter data; save key `IntegersWatcher`
- `objectTrackers`: persistent object tracker array; each entry has an `entity` field that may be a DataPearl

`regionStates` is an array of per-region state objects. Each has a `roomsVisited` string array and an `objects` array of saved physical items in that region.

At the top level of the `SaveStateRecord` state object, `swallowedItems`, `playerGrasps`, `objectTrackers`, and `objects` fields store physical items the slugcat is currently carrying or has placed in the world.

---

## Transcriber Unlocking

When a save match is found, the system determines which transcribers to unlock by evaluating per-transcriber `md-saveUnlock` DSL conditions on each transcriber. Only transcribers whose condition evaluates to true are unlocked. If a transcriber has no `md-saveUnlock`, all transcribers of that entry are unlocked (fallback).

A file is in **per-transcriber mode** when at least one transcriber carries `md-saveUnlock`. In this mode the entry-level `saveUnlock:` header field is ignored entirely by the evaluator. Files where every transcriber has `md-saveUnlock` must therefore not carry a top-level `saveUnlock:` line — it would be dead code that silently misleads. The 13 iterator dialogue files that are fully in per-transcriber mode carry no entry-level `saveUnlock:`: `LttM_Dialogue_survivor`, `LttM_Dialogue_survivor_monk`, `LttM_Dialogue_gourmand`, `LttM_Dialogue_hunter`, `LttM_Dialogue_rivulet`, `LttM_Dialogue_spearmaster`, `LttM_Dialogue_saint`, `LttM_short_Dialogue`, `FP_Dialogue_hunter`, `FP_Dialogue_artificer`, `FP_Dialogue_rivulet`, `FP_Dialogue_saint`, `FP_Dialogue_survivor`. The remaining files (`FP_Dialogue_monk`, `FP_Dialogue_gourmand`, `FP_Dialogue_spearmaster`, `FP_Dialogue_inv`, `FP_Dialogue_other`, `LttM_Dialogue_monk`) are not in per-transcriber mode and retain their entry-level `saveUnlock:`.

Named pearl transcriber conditions use source-specific DSL global accessors:

| DSL accessor | Meaning |
|---|---|
| `global { pearlBase.X }` | Pearl X is in `lorePearls` (base route) |
| `global { pearlArtificer.X }` | Pearl X is in `lorePearlsArtificer` |
| `global { pearlSpearmaster.X }` | Pearl X is in `lorePearlsSpearmaster` |
| `global { pearlSaint.X }` | Pearl X is in `lorePearlsSaint` |

The transcriber-to-accessor mapping used across the named pearl files:

| Transcriber | DSL accessor used |
|---|---|
| `LttM-post-collapse` | `pearlBase` |
| `LttM-gourmand` | `pearlBase` |
| `LttM-rivulet` | `pearlBase` |
| `FP` | `pearlBase` |
| `FP-artificer` | `pearlArtificer` |
| `broadcast-pre-FP` | `pearlSpearmaster` |
| `LttM-pre-collapse` | `pearlSaint` (general); `pearlSpearmaster` for MS and Spearmasterpearl |
| `LttM-saint` | `pearlSaint` |
| `LttM-FP-saint` | `pearlSaint` |
| `PearlReader` | `watcher { projector and physicalPearl.X }` |

Echo transcribers use the named-scope `echo` accessor (`slugcatEchoIds` per-slugcat). The `base-slugcats` transcriber explicitly lists all non-special slugcats: `White { echo.X } or Yellow { echo.X } or Red { echo.X } or Gourmand { echo.X } or Rivulet { echo.X } or Inv { echo.X } or Spear { echo.X }`. The `saint` transcriber uses `Saint { echo.X }`. The `artificer` transcriber uses `Artificer { echo.X }`.

For proxy pearl types (Misc, BroadcastMisc, PebblesPearl), transcribers use per-transcriber `md-save-unlock` conditions. See the section on iterator pearl proxies below for details.

---

## Summary Categorization

After matching, every detected entry is counted into one of four buckets for the save-file summary display. The bucket is determined by the entry's `type` metadata field.

| Bucket | `type` value | Examples |
|---|---|---|
| Transcriptions | `pearl` | Named pearls, Misc, BroadcastMisc, PebblesPearl, echo-type entries |
| Broadcasts | `broadcast` | Region chatlogs, LP story broadcasts, dev commentary |
| Echoes | `echo` | Ghost echo monologues |
| Various | anything else (`item`) | Oracle dialogues (FP/LttM), iterator item dialogues, Watcher encounters |

The implementation is in the `applyCollectibles` function in `saveCollectibles.ts`.

---

## Named Data Pearls

30 items. Detected via per-transcriber `md-save-unlock` DSL conditions in each pearl's txt file using the `pearlBase`, `pearlArtificer`, `pearlSpearmaster`, and `pearlSaint` global accessors. An entry is matched if any transcriber's condition evaluates to true.

The 30 internalIds and their corresponding collection index IDs:

| internalId         | Collection index ID         |
|--------------------|-----------------------------|
| `CC`               | `CC_GOLD`                   |
| `DM`               | `DM_LIGHT_YELLOW`           |
| `DS`               | `DS_BRIGHT_GREEN`           |
| `GW`               | `GW_VIRIDIAN`               |
| `HI`               | `HI_BRIGHT_BLUE`            |
| `LC`               | `LC_DEEP_GREEN`             |
| `LC_second`        | `LC_second_BRONZE`          |
| `LF_bottom`        | `LF_bottom_BRIGHT_RED`      |
| `LF_west`          | `LF_west_DEEP_PINK`         |
| `MS`               | `GW_DULL_YELLOW`            |
| `OE`               | `OE_LIGHT_PURPLE`           |
| `Red_stomach`      | `Red_stomach_AQUAMARINE`    |
| `Rivulet_stomach`  | `Rivulet_stomach_CELADON`   |
| `RM`               | `RM_MUSIC`                  |
| `SB_filtration`    | `SB_filtration_TEAL`        |
| `SB_ravine`        | `SB_ravine_DARK_MAGENTA`    |
| `SH`               | `SH_DEEP_MAGENTA`           |
| `SI_chat3`         | `SI_chat3_DARK_PURPLE`      |
| `SI_chat4`         | `SI_chat4_OLIVE_GREEN`      |
| `SI_chat5`         | `SI_chat5_DARK_MAGENTA`     |
| `SI_top`           | `SI_top_DARK_GREEN`         |
| `SI_west`          | `SI_west_DARK_BLUE`         |
| `SL_bridge`        | `SL_bridge_BRIGHT_PURPLE`   |
| `SL_chimney`       | `SL_chimney_BRIGHT_MAGENTA` |
| `SL_moon`          | `SL_moon_PALE_YELLOW`       |
| `Spearmasterpearl` | `Spearmasterpearl_DARK_RED` |
| `SU`               | `SU_LIGHT_BLUE`             |
| `SU_filt`          | `SU_filt_LIGHT_PINK`        |
| `UW`               | `UW_PALE_GREEN`             |
| `VS`               | `VS_DEEP_PURPLE`            |

Notes:
- The `MS` pearl has internalId `MS`, not `GW`. These are two different items.
- `Spearmasterpearl` (Spearmaster's body pearl) can appear in `lorePearls` when Moon reads it after Spearmaster delivers it. Do not confuse with the `smPearlTagged` field, which tracks the DM oracle (collapsed FP) tagging event at Silent Construct.

---

## Region Chatlog Broadcasts

18 items. Each broadcast txt file carries `save-unlock: global { broadcast.X }` where X is its internalId. The `broadcast` accessor checks the `broadcastInternalIds` set, which is accumulated from:
- `MiscProgRecord.broadcasts` (Watcher's region broadcasts)
- All `chatLogs` arrays across every SaveStateRecord
- All `prePebChatLogs` arrays across every SaveStateRecord

The chatlog ID is stored verbatim in the save, so matching is exact.

The 18 internalIds: `Chatlog_CC0`, `Chatlog_DM0`, `Chatlog_DM1`, `Chatlog_DS0`, `Chatlog_GW0`, `Chatlog_GW1`, `Chatlog_GW2`, `Chatlog_HI0`, `Chatlog_LM0`, `Chatlog_LM1`, `Chatlog_SB0`, `Chatlog_SH0`, `Chatlog_SI0`, `Chatlog_SI1`, `Chatlog_SI2`, `Chatlog_SI3`, `Chatlog_SI4`, `Chatlog_SI5`.

---

## LP Story Broadcasts (Spearmaster)

17 items. These are Spearmaster's Looks to the Past collectibles, divided into white broadcasts (pre-FP) and gray broadcasts (post-FP).

Critical subtlety: the save stores broadcast token location IDs such as `Chatlog_Broadcast0` or `Chatlog_Broadcast5`, not content IDs. The game plays broadcast content sequentially regardless of which specific token was picked up. The first token encountered plays content number 1, the second plays content number 2, and so on. Only the count of collected tokens matters, not which specific locations were visited.

Detection logic:

Pre-FP count: count entries in `prePebChatLogs` matching the pattern `Chatlog_Broadcast` followed by one or more digits. Call this `prePebCount`. This unlocks synthetic IDs `LP_0` through `LP_{prePebCount - 1}`.

Post-FP count: count entries in `chatLogs` matching the same pattern, then subtract `prePebCount`. Call this `postPebCount`. This unlocks synthetic IDs `LP_0_PEB` through `LP_{postPebCount - 1}_PEB`.

These synthetic IDs are then matched against `pearl.metadata.internalId` exactly like region chatlog IDs.

There are only 7 white broadcast dialogue files (LP_0 through LP_6). Gray broadcasts extend to LP_9_PEB. There is no LP_7, LP_8, or LP_9 without the `_PEB` suffix.

| Collection index ID | internalId | Condition          |
|---------------------|------------|--------------------|
| `LP_0_WHITE_1`      | `LP_0`     | prePebCount >= 1   |
| `LP_1_WHITE_2`      | `LP_1`     | prePebCount >= 2   |
| `LP_2_WHITE_3`      | `LP_2`     | prePebCount >= 3   |
| `LP_3_WHITE_4`      | `LP_3`     | prePebCount >= 4   |
| `LP_4_WHITE_5`      | `LP_4`     | prePebCount >= 5   |
| `LP_5_WHITE_6`      | `LP_5`     | prePebCount >= 6   |
| `LP_6_WHITE_7`      | `LP_6`     | prePebCount >= 7   |
| `LP_0_PEB_GRAY_1`   | `LP_0_PEB` | postPebCount >= 1  |
| `LP_1_PEB_GRAY_2`   | `LP_1_PEB` | postPebCount >= 2  |
| `LP_2_PEB_GRAY_3`   | `LP_2_PEB` | postPebCount >= 3  |
| `LP_3_PEB_GRAY_4`   | `LP_3_PEB` | postPebCount >= 4  |
| `LP_4_PEB_GRAY_5`   | `LP_4_PEB` | postPebCount >= 5  |
| `LP_5_PEB_GRAY_6`   | `LP_5_PEB` | postPebCount >= 6  |
| `LP_6_PEB_GRAY_7`   | `LP_6_PEB` | postPebCount >= 7  |
| `LP_7_PEB_GRAY_8`   | `LP_7_PEB` | postPebCount >= 8  |
| `LP_8_PEB_GRAY_9`   | `LP_8_PEB` | postPebCount >= 9  |
| `LP_9_PEB_GRAY_10`  | `LP_9_PEB` | postPebCount >= 10 |

---

## Echoes

10 items. Detected via per-transcriber `md-save-unlock` DSL conditions using the named-scope `echo` accessor, which checks `slugcatEchoIds` (a per-slugcat Map built from `deathPersistentData.ghosts`). An echo is considered found for a slugcat when its `count >= 1`. A count of exactly 0 means the player approached the echo but did not complete a conversation.

The ghost region code matches the last underscore-separated segment of the collection index ID: `Echo_Monologue_CC` uses ghostId `CC`.

Ghost IDs: `CC`, `SH`, `SI`, `LF`, `UW`, `SB`, `MS`, `UG`, `SL`, `LC`.

Transcriber conditions: `saint` → `Saint { echo.X }`. `artificer` → `Artificer { echo.X }`. `base-slugcats` → explicit list: `White { echo.X } or Yellow { echo.X } or Red { echo.X } or Gourmand { echo.X } or Rivulet { echo.X } or Inv { echo.X } or Spear { echo.X }`. Note: MS, UG, and SL only have a `saint` transcriber (Saint-exclusive regions). SH only has `base-slugcats`.

Note: `MS` is also the internalId of the `GW_DULL_YELLOW` data pearl. These are matched through entirely separate code paths and do not conflict.

---

## Five Pebbles Dialogues

26 items. The game does not store which specific FP dialogue triggered during a visit. Most entries are therefore detected coarsely: any slugcat whose `ssaiConversationsHad` is greater than 0 is considered to have experienced all FP dialogues for that slugcat's token.

The slugcat-to-token mapping used by entry IDs: `White` = survivor, `Yellow` = monk, `Red` = hunter, `Gourmand` = gourmand, `Artificer` = artificer, `Spear` = spearmaster, `Rivulet` = rivulet, `Saint` = saint, `Inv` = inv.

Several entries have more precise conditions:

`FP_Dialogue_artificer_Killing_Chieftain_Scavenger`: fires exactly once when Artificer returns to FP after killing the Chieftain Scavenger and completing the Metropolis ending sequence. The code checks `altEnding == true` and `ssaiThrowOuts < 100`, then sets `ssaiThrowOuts = 100` as a sentinel so it only fires once. Detection: `deathPersistentData.altEnding == true` for slugcat `Artificer`. Confidence: exact.

`FP_Dialogue_artificer_Visiting_Multiple_Times`: the repeat-visit dialogue lines only trigger on the third conversation and beyond. Detection: `ssaiConversationsHad >= 3` for `Artificer`. Confidence: exact.

`FP_Dialogue_artificer_Pebbles_Pearl`: fires when Artificer brings a pearl during a sleepover. Detection: any pearl appears in `lorePearlsArtificer`. Confidence: approximate; confirms pearl-reading occurred but this entry also groups Artificer's first-encounter reactions.

`FP_Dialogue_hunter_With_Green_Neuron`: fires when Hunter visits FP while carrying a neuron fly and the flag `pebblesSeenGreenNeuron` has not been set yet. Detection: `ssaiConversationsHad >= 1` AND `miscWorldData.pebblesHelped == true` for `Red`. Confidence: exact.

`FP_Dialogue_hunter_Without_Green_Neuron`: the mutually exclusive complement. Detection: `ssaiConversationsHad >= 1` AND `miscWorldData.pebblesHelped == false` for `Red`. Confidence: exact. These two entries are mutually exclusive in any given save.

`FP_Dialogue_inv_First_encounter`: Inv (Sofanthiel) is Artificer's alt campaign and has a separate SaveStateRecord under slugcat name `Inv`. Detection: `ssaiConversationsHad >= 1` for `Inv`, not `Artificer`. Confidence: exact.

`FP_Dialogue_rivulet_Returning`: fires on Rivulet's first return visit to FP after the Rarefaction Cell has been placed at Moon. Detection: `altEnding == true` AND `ssaiConversationsHad >= 1` for `Rivulet`. Confidence: exact.

`FP_Dialogue_rivulet_Subsequent_meetings`: fires on later return visits. Detection: `altEnding == true` AND `ssaiConversationsHad >= 2` for `Rivulet`. Confidence: exact.

`FP_Dialogue_saint_Rubicon`: fires during Saint's Rubicon ascension of FP. Detection: `deathPersistentData.zeroPebbles == true` for `Saint`. The `zeroPebbles` field (save key `ZEROPEBBLES`, game name `ripPebbles`) is set during the encounter, before full ascension completes. Confidence: exact.

`FP_Dialogue_other_Throwing_Singularity_Bomb`: fires when any slugcat detonates a singularity bomb in FP's chamber. Detection: any slugcat has `ssaiConversationsHad > 0`. Confidence: approximate (FP being present is confirmed; the specific bomb event is runtime-only).

Several FP files are in per-transcriber mode; every transcriber in those files carries its own `md-saveUnlock`. For entries where no finer save signal exists (lingering, runtime interrupts, death, blizzard, weapon hits), the per-transcriber condition is the coarse `SlugcatName { fp }`, which is equivalent to the entry-level fallback. The specific conditions are listed below and in `doc/research/iterator-unlock-audit.md`.

`FP_Dialogue_hunter_Lingering`: frame-counter event; undetectable. Detection: `Red { fp }`. Confidence: approximate.

`FP_Dialogue_artificer_First_encounter`: Detection: `Artificer { fp }`. Confidence: exact.
`FP_Dialogue_artificer_Lingering_Too_Long`: frame-counter event. Detection: `Artificer { fp }`. Confidence: approximate.
`FP_Dialogue_artificer_Hitting_with_a_rock_or_spear`: runtime weapon event. Detection: `Artificer { fp }`. Confidence: approximate.

`FP_Dialogue_rivulet_First_encounter`: five save-distinguishable variants exist. "Delivered RC to Moon before visiting FP": `Rivulet { fp and altEnding }`. "Has RC but not yet delivered" (three mechanically identical variants): `Rivulet { fp and !altEnding and energyRailOff }`. "Does not have RC": `Rivulet { fp and !altEnding and !energyRailOff }`. The three "has RC" variants are save-indistinguishable from each other. Confidence: exact per group.
`FP_Dialogue_rivulet_Neuron` and `FP_Dialogue_rivulet_Proto_Long_Legs_Death`: runtime events. Detection: `Rivulet { fp }`. Confidence: approximate.

`FP_Dialogue_rivulet_Music` (×2): two transcribers with different conditions. The first is a runtime event with no precise save field; Detection: `Rivulet { fp }`. Confidence: approximate. The second transcriber detects Artificer having brought the RM music pearl to FP: Detection: `global { pearlArtificer.RM }`. Confidence: exact for that specific interaction.

`FP_Dialogue_saint_First_encounter` and `FP_Dialogue_saint_Following_encounters`: Detection: `Saint { fp }`. Confidence: exact.
`FP_Dialogue_saint_Interrupts` (all four: Saint's death, Attacked, Stealing Music Pearl, Blizzard): runtime events. Detection: `Saint { fp }`. Confidence: approximate.

---

## Looks to the Moon Dialogues

35 items. All LttM dialogue entries are now in per-transcriber mode; every transcriber carries its own `md-saveUnlock` condition using `lttmMark` rather than `lttm`.

**`lttmMark` vs `lttm`:** `lttm` = `playerEncounters > 0` = any Moon chamber visit including pre-mark visits handled by `SLOracleBehaviorNoMark`. `lttmMark` = `playerEncountersWithMark` = visits where `SLOracleBehaviorHasMark` was the active class. `SLOracleBehaviorHasMark` is instantiated only when `theMark == true` or the story character is Saint (`Oracle.cs` lines 173-175). Pre-mark visits never increment `playerEncountersWithMark`. `lttmMark` is therefore the reliable post-mark gate; `lttm` is not used for LttM unlock conditions.

**Counter increment is post-dialogue.** `playerEncountersWithMark` is incremented at `SLOracleBehaviorHasMark.cs` line 205, after `InitiateConversation()` returns at line 197. The routing logic therefore reads the pre-increment (saved) value when selecting which conversation file to load. The mapping from save value to dialogue event is:

| moonMark value in save before visit | Dialogue that fires during that visit | moonMark value saved after visit |
|---|---|---|
| 0 | First post-mark conversation (MoonFirstPostMarkConversation or slugcat equivalent) | 1 |
| 1 | Second post-mark conversation | 2 |
| >= 2 | ThirdAndUpGreeting (Following_Encounters) | increments by 1 |

Detection thresholds therefore follow: `lttmMark >= 1` detects first conversation happened; `lttmMark >= 2` detects second conversation happened; `lttmMark >= 3` detects ThirdAndUpGreeting has fired at least once.

**Hunter special case.** `SLOracleWakeUpProcedure.cs` line 300 resets `playerEncountersWithMark = 0` during the GetMark phase before the wake-up completes. Normal dialogue routing then fires `Moon_Red_First_Conversation` (file 50.txt) with the counter at 0, saving it as 1. `lttmMark >= 1` correctly detects Hunter's first (wake-up) conversation; `lttmMark >= 2` correctly detects the second.

Several entries have additional precise conditions beyond the moonMark threshold:

`LttM_Dialogue_rivulet_First_encounter`: two save-distinguishable variants exist. "Already taken the Rarefaction Cell" fires when `energyRailOff == true` on first Moon visit; detection: `Rivulet { lttmMark >= 1 and energyRailOff }`. "Not yet taken" is the complement; detection: `Rivulet { lttmMark >= 1 and !energyRailOff and !altEnding }`. Confidence: exact for both.

`LttM_Dialogue_rivulet_Interruptions`: three transcribers (Eating/Taking Neuron Fly, Attacking) are runtime events with no save field. Detection: `Rivulet { lttmMark >= 1 }` for all three. Confidence: approximate.

Note on `LttM_Dialogue_rivulet_Returning_after_taking_the_Rarefaction_Cell`: `pebblesEnergyTaken` (`energyRailOff`) is set when Rivulet grabs the Energy Cell at `RM_CORE`, which is independent of Moon's chamber. Rivulet can have `energyRailOff == true` with `lttmMark == 0` (took the cell before ever visiting Moon). Strictly, `lttmMark >= 2 and energyRailOff` would be exact for "has returned to Moon after taking the cell", since by definition a return visit means at least two visits happened. The current condition `Rivulet { energyRailOff }` is an accepted approximation: any Rivulet save with the cell taken is in the relevant story state, and whether the player has already visited Moon is treated as a non-critical edge case.

`LttM_Dialogue_rivulet_Returning_after_taking_the_Rarefaction_Cell`: fires when Rivulet has removed the cell from FP but not yet placed it at Moon. Two sub-variants exist in source (file 124 for return visits, file 125 for first post-mark visit with cell taken), both covered by this entry. Detection: `miscWorldData.energyRailOff == true` AND `altEnding == false` for `Rivulet`. Confidence: exact.

`LttM_Dialogue_rivulet_Returning_after_placing_the_Rarefaction_Cell`: this dialogue fires during the Rarefaction Cell placement cutscene itself, not on a subsequent return visit. The `SLOracleRivuletEnding` class boosts `encountersWithMark` by exactly 5 when the ending sequence fires. Detection: `altEnding == true` AND `encountersWithMark >= 5` for `Rivulet`. Confidence: exact.

`LttM_Dialogue_rivulet_Ending_Broadcast`: Moon's broadcast after regaining communications. The three chatlog IDs `Chatlog_LM7`, `Chatlog_LM8`, `Chatlog_LM9` are written to `chatLogs` when the ending fires. Detection: `Chatlog_LM7` present in the global broadcast ID set (all chatLogs are swept globally). Confidence: exact.

`LttM_Dialogue_rivulet_Returning_after_ending`: fires on post-ending Moon visits. The ending cutscene adds exactly 5 to `encountersWithMark`; any value above 5 means at least one additional post-ending visit occurred. Detection: `altEnding == true` AND `encountersWithMark >= 6` for `Rivulet`. Confidence: approximate (relies on the ending's +5 boost being the only non-visit source of increment).

`LttM_Dialogue_hunter_Moon_Red_First_Conversation`: fires on Hunter's first post-mark Moon visit (the wake-up cutscene). The wake-up procedure resets the counter to 0 before routing, so this conversation fires with counter=0 and saves as moonMark=1. Detection: `Red { lttmMark >= 1 }`. Confidence: exact.

`LttM_Dialogue_hunter_Moon_Red_Second_Conversation`: fires on Hunter's second post-mark Moon visit. The counter is 1 at the start of that visit (set by the first), saves as 2 after. Detection: `Red { lttmMark >= 2 }`. Confidence: exact.

`LttM_Dialogue_survivor_monk_Second_encounter`: fires on the second post-mark Moon visit for Survivor or Monk. Counter is 1 at the start of that visit, saves as 2. Detection: `lttmMark >= 2` for `White` or `Yellow`. Confidence: exact.

`LttM_Dialogue_spearmaster_First_encounter`: two save-distinguishable variants. "Already delivered message": `Spear { lttmMark >= 1 and smPearlTagged }`. "Not yet delivered": `Spear { lttmMark >= 1 and !smPearlTagged }`. Confidence: exact for both.
`LttM_Dialogue_spearmaster_Second_encounter`: fires on the second post-mark DM oracle visit. Detection: `Spear { lttmMark >= 2 }`. Confidence: exact.
`LttM_Dialogue_spearmaster_Following_encounters`: fires on the third and subsequent visits. Detection: `Spear { lttmMark >= 3 }`. Confidence: exact.

`LttM_Dialogue_spearmaster_Spearmaster_Pearl`: Moon (operating as the DM oracle at Silent Construct) reads and tags Spearmaster's body pearl. This fires at the DM oracle, not at Moon's Shoreline chamber, despite the collection entry being attributed to Moon's persona. The field `miscWorldData.smPearlTagged` is set exclusively by the `Moon_Spearmaster_Pearl` dialogue completing at the DM oracle, 120 frames after the `"tag"` event fires in the conversation file. Detection: `smPearlTagged == true` for `Spear`. Confidence: exact. Important: `lorePearlsSpearmaster` does NOT contain `Spearmasterpearl`; it contains lore pearl IDs such as `DM` that Moon read. Using `lorePearlsSpearmaster` to detect this entry is incorrect and will never match.

`LttM_Dialogue_spearmaster_Ending_Broadcast`: fires when Spearmaster completes the alt ending at the Farm Arrays communications array, triggering chatlog `Chatlog_SI9`. Detection: `Chatlog_SI9` present in the global broadcast ID set. Confidence: exact.

`LttM_Dialogue_saint_Rubicon` and `FP_Dialogue_saint_Rubicon`: both entries contain three transcribers representing the three Rubicon scenarios. Each transcriber has its own per-transcriber `md-save-unlock` condition based on `looksToTheDoom` (Moon killed by Saint's ascension burst, save key `LOOKSTOTHEDOOM`) and `zeroPebbles` (FP killed, save key `ZEROPEBBLES`) for the `Saint` slugcat scope.

| Transcriber | Condition | Scenario |
|---|---|---|
| `LttM-FP-saint` | `zeroPebbles and looksToTheDoom` | Both killed |
| `FP` | `zeroPebbles and !looksToTheDoom` | Only FP killed |
| `LttM-saint` | `looksToTheDoom and !zeroPebbles` | Only Moon killed |

Both files use identical conditions; they represent the same scenarios and are detected together.

Neuron-count variant transcribers (entries with names like "If 1 neuron left", "If 2 neurons left", etc.): these variants branch on `lttmNeuronsLeft` (`slaiState.integersArray[2]`) at the time of the conversation.
`lttmNeuronsLeft` reflects Moon's current health state in the save and can both increase (player delivers swarmers to Moon) and decrease (player eats a swarmer, permanently removing it from Moon's pool).
The DSL field `lttmNeuronsLeft` is available in named-scope conditions (e.g. `White { lttmMark >= 1 and lttmNeuronsLeft == 3 }`), exposing Moon's current neuron count.
This unlocks the transcriber matching the player's current save state rather than the historically exact first-encounter state, which is unrecoverable.
Confidence for neuron-count transcribers: approximate (current state, not historical).

`LttM_Dialogue_saint_First_encounter`: first post-mark Moon visit for Saint. Detection: `Saint { lttmMark >= 1 } or Saint { visited.SL_AI } or Saint { echo.SL }`. The two additional OR branches serve as broader proxies — having visited SL_AI or completed the SL echo conversation are plausible proxies for having met Moon. Confidence: approximate due to the extra branches.
`LttM_Dialogue_saint_Second_Encounter`: Detection: `Saint { lttmMark >= 1 }`. Note: this threshold is intentionally one step lower than the second-visit threshold (which would be `>= 2`) — it unlocks as soon as the first visit is confirmed, treating a second encounter as probable once any visit has occurred. Confidence: approximate.
`LttM_Dialogue_saint_Third_Encounter`: Detection: `Saint { lttmMark >= 2 }`. Same rationale: threshold is one step below the strict third-visit gate (`>= 3`). Confidence: approximate.
`LttM_Dialogue_saint_Blizzard_approaching`: runtime weather event; no save field. Detection: `Saint { lttmMark >= 1 }` (best available proxy). Confidence: approximate.

`LttM_short_Dialogue_*`: all blocks are runtime events; conditions are approximate.
`Receiving_an_object` (both transcribers — speaking terms / not speaking terms): `any { lttmMark >= 1 and lttmDiscussedObject }`.
`Commenting_already_discussed_object (Other object)`: `any { lttmMark >= 1 and lttmDiscussedObject }`.
`Commenting_already_discussed_object (Pearl)`: `any { lttmMark >= 1 and lttmReadPearl }`.
`Take_back_while_commenting`: `any { lttmMark >= 1 and lttmDiscussedObject } or any { lttmMark >= 1 and lttmReadPearl }` — covers both non-pearl and pearl take-backs.
`Receiving_a_pearl` (Five Pebbles' pearls and Misc/colored): `any { lttmMark >= 1 and lttmReadPearl }`.
All nine remaining blocks (Seeing_Slugcat_bringing_a_Neuron_Fly, Interruptions ×3, Resuming_conversation_interruption, Annoyed_Jumping, Rain_Coming, Slugcat_Death): `any { lttmMark >= 1 }`.
The two `Receiving_Neuron_Fly` transcribers retain their precise `lttmNeuronsGiven >= 1` conditions.

`LttM_short_Dialogue_Receiving_Neuron_Fly`: fires when Moon receives a neuron swarmer. Detection: `slaiState.integersArray[4]` (`totNeuronsGiven`) >= 1 for the relevant slugcat. The `LttM-rivulet` transcriber checks `Rivulet`; the `LttM-post-collapse` transcriber checks any slugcat. Confidence: exact.

`LttM_SAINT_ANY_OTHER`: matched by `Saint { lttm }`. For Saint, `SLOracleBehaviorHasMark` is always active, so `moonEncounters` and `moonEncountersWithMark` increment together and `lttm` is functionally equivalent to `lttmMark >= 1`.

---

## Iterator Item Dialogues

35 items. These are Moon's reactions when the player shows her specific item types. Detected via `slaiState.miscItemsDescribed`, which stores game-type name strings for every item Moon has described. This is a permanent per-slugcat record swept across all SaveStateRecords.

Some game types map to multiple collection index entries because the save cannot distinguish variants.

| Game type name in miscItemsDescribed | Collection index IDs                                                                                                                           |
|--------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| `Rock`                               | `Iterator_Dialogue_Items_Rock`                                                                                                                 |
| `Spear`                              | `Iterator_Dialogue_Items_Spear`                                                                                                                |
| `ExplosiveSpear`                     | `Iterator_Dialogue_Items_Explosive_Spear`                                                                                                      |
| `HellSpear`                          | `Iterator_Dialogue_Items_Fire_Spear`                                                                                                           |
| `ElectricSpear`                      | `Iterator_Dialogue_Items_Electric_Spear`                                                                                                       |
| `FlareBomb`                          | `Iterator_Dialogue_Items_Flashbang`                                                                                                            |
| `WaterNut`                           | `Iterator_Dialogue_Items_Bubble_Fruit`                                                                                                         |
| `DangleFruit`                        | `Iterator_Dialogue_Items_Blue_Fruit`                                                                                                           |
| `KarmaFlower`                        | `Iterator_Dialogue_Items_Karma_Flower`                                                                                                         |
| `JellyFish`                          | `Iterator_Dialogue_Items_Jellyfish`                                                                                                            |
| `Lantern`                            | `Iterator_Dialogue_Items_Lantern`                                                                                                              |
| `Mushroom`                           | `Iterator_Dialogue_Items_Mushroom`                                                                                                             |
| `SlimeMold`                          | `Iterator_Dialogue_Items_Slime_Mold`                                                                                                           |
| `SporePlant`                         | `Iterator_Dialogue_Items_Spore_Puff`                                                                                                           |
| `BubbleGrass`                        | `Iterator_Dialogue_Items_Bubble_Weed`                                                                                                          |
| `SingularityBomb`                    | `Iterator_Dialogue_Items_Singularity_Bomb`                                                                                                     |
| `Seed`                               | `Iterator_Dialogue_Items_Seed`                                                                                                                 |
| `FireEgg`                            | `Iterator_Dialogue_Items_Fire_Egg`                                                                                                             |
| `GooieDuck`                          | `Iterator_Dialogue_Items_Gooieduck`                                                                                                            |
| `LillyPuck`                          | `Iterator_Dialogue_Items_Lilypuck`                                                                                                             |
| `GlowWeed`                           | `Iterator_Dialogue_Items_Glow_Weed`                                                                                                            |
| `DandelionPeach`                     | `Iterator_Dialogue_Items_Dandelion_Peach`                                                                                                      |
| `MoonCloak`                          | `Iterator_Dialogue_Items_Cloak`                                                                                                                |
| `NeedleEgg`                          | `Iterator_Dialogue_Items_Noodlefly_Egg`                                                                                                        |
| `EnergyCell`                         | `Iterator_Dialogue_Items_Rarefaction_Cell`                                                                                                     |
| `JokeRifle`                          | `Iterator_Dialogue_Items_Joke_Creatures`                                                                                                       |
| `SpearmasterSpear`                   | `Iterator_Dialogue_Items_Spearmaster_Needle`                                                                                                   |
| `ScavengerBomb`                      | `Iterator_Dialogue_Items_Cherrybomb` AND `Iterator_Dialogue_Items_Grenade`                                                                     |
| `OverseerCarcass`                    | `Iterator_Dialogue_Items_Overseer_Eye` AND `Iterator_Dialogue_Items_Inspector_Eye`                                                             |
| `VultureMask`                        | `Iterator_Dialogue_Items_Vulture_Mask`, `Iterator_Dialogue_Items_Chieftain_Scavenger_Mask`, AND `Iterator_Dialogue_Items_Elite_Scavenger_Mask` |
| `SlugNPC` or `Slugpup`               | `Iterator_Dialogue_Items_Slugpup`                                                                                                              |

Notes:
- `SlugNPC` and `Slugpup` both map to the same entry to cover whichever internal type name the game version uses.
- `SeedCob` (Popcorn Plant) exists in the game's item registry but has no corresponding collection index entry.
- `ScavengerBomb` covers both Cherrybomb and Grenade because both share this game-type name.
- All three VultureMask variants share the same type name and cannot be individually detected.

---

## Iterator Pearl Dialogues (Misc, BroadcastMisc, PebblesPearl)

These three pearl types are explicitly excluded from `significantPearls` tracking by the game source code. In `SLOracleBehaviorHasMark`, the handler for `Misc`, `Misc2`, `BroadcastMisc`, and `PebblesPearl` sets a conversation and returns before reaching the code that writes to `significantPearls` and calls `SetPearlDeciphered`. No entry for these types ever appears in any lorePearls list.

Detection must therefore use room visit records from `regionStates[*].roomsVisited` as the closest available proxy.

Because individual entries within each pearl type cannot be distinguished, the proxy detects only that a specific transcriber context is plausible. Only dialogue entries whose transcriber context appears in the inferred set are unlocked.

The revived Moon at room `RM_AI` (Memory Conflux), handled by `SSOracleRotBehavior`, does NOT read any DataPearl type. It only accepts HalcyonPearl and EnergyCell. Rivulet's visit to `RM_AI` is irrelevant for Misc and BroadcastMisc detection.

### PebblesPearl

FP's gray marble pearls, readable by Moon at `SL_AI`.

`LttM-post-collapse` context: any slugcat that has visited both `SS_AI` (FP's chamber, where the pearls can be picked up) and `SL_AI` (Moon's chamber, where they can be read).

`LttM-rivulet` context: `Rivulet` specifically, having visited both `RM_AI` (the revived Moon's chamber, where FP pearls are accessible after the Rivulet timeline events) and `SL_AI`.

Some dialogue indices exist in both contexts. An entry is unlocked if either condition is met.

Confidence: approximate (room visits are necessary but not sufficient; the player may have visited both rooms without performing the pearl exchange).

### Misc (white pearls)

Generic unmarked DataPearls, readable by Moon and by FP for Artificer.

`LttM-post-collapse` context: any slugcat that has visited `SL_AI` AND has the mark of communication (`hasMark`). DSL: `any { visited.SL_AI and hasMark }`. Artificer is excluded in practice because room settings filter objects prevent Artificer from seeing white pearl spawns at most locations; the `any` scope includes all slugcats but Artificer's equivalent interaction is attributed to FP instead.

`FP-artificer` context: `Artificer` has visited `SS_AI` AND has the mark. DSL: `Artificer { visited.SS_AI and hasMark }`. In the evaluator, `hasMark` always evaluates to `true` for Saint and Rivulet regardless of the save field; for all other slugcats it reads `deathPersistentData.hasTheMark`.

Confidence: approximate.

### BroadcastMisc

Broadcast node relic pearls, readable by Moon or FP (Artificer only). Each room settings file carries a slugcat Filter controlling which campaigns see the pearl. Per-slugcat availability is documented in `doc/research/broadcast-misc-locations.md`.

Detection uses two pre-computed boolean flags (`broadcastMiscLttm`, `broadcastMiscFp`) derived at parse time from `slugcatVisitedRooms`. For each slugcat in the table, the check is: did they visit any of their available BroadcastMisc rooms AND their oracle room?

`LttM-post-collapse` context (`broadcastMiscLttm`): White, Yellow, Red, Gourmand, Rivulet, Saint, or Inv visited at least one of their campaign-specific BroadcastMisc rooms AND visited `SL_AI`. Spearmaster has no BroadcastMisc rooms. Watcher is excluded (does not interact with Moon via this dialogue path).

`FP-artificer` context (`broadcastMiscFp`): Artificer visited `SI_A07` (their only BroadcastMisc room) AND visited `SS_AI` (FP's chamber, where they read the pearl).

The conditions are expressed in the dialogue file as `global { broadcastMiscLttm }` and `global { broadcastMiscFp }` on each transcriber. The `BROADCAST_MISC_SLUGCATS` table in `saveCollectibles.ts` is the authoritative per-slugcat room mapping.

BroadcastMisc pearls have no individual tracking. All entries share internalId `BroadcastMisc` and are unlocked together.

Confidence: approximate (room visit is necessary but not sufficient).

### Note on BroadcastMisc and arena challenges

An earlier claim exists that completing all 70 arena multiplayer challenges unlocks BroadcastMisc pearls. This is false. BroadcastMisc is explicitly excluded from `CollectionsMenu.GetCollectionReadablePearls()` (the hardcoded list of 30 collectible pearl types) and from `regionDataPearls` tracking. No code path connects arena challenge completion to any BroadcastMisc unlock. The `challengesCompleted` field (save key `CHCLEAR`) is used in this project only as a proxy for dev commentary, not for BroadcastMisc.

---

## Watcher DLC

The Watcher campaign uses a substantially different save structure from other slugcats. There is no `lorePearlsWatcher` field and Watcher pearl interactions are not tracked in any of the four lorePearls lists. Watcher-specific data comes from per-slugcat fields in the Watcher `SaveStateRecord` and from global indices in `MiscProgRecord.integersWatcher`.

### Spinning Top Encounters

The Spinning Top is a ghost-like entity encountered across the game world. Each encounter may or may not advance the ripple level system. The relevant save fields are described below.

`maxRippleLevel` (float, save key `MAXRIPPLELEVEL`): the ceiling raised by each RL-advancing encounter. Absent from the save when zero. Vanilla encounter 1 raises it to 0.25, encounter 2 to 0.50, encounter 3 to 1.0. Each subsequent RL-advancing encounter adds 0.5 up to a cap of 5.0.

`minRippleLevel` (float, save key `MINRIPPLELEVEL`): the floor enforced by story progress. Trails `maxRippleLevel` by 2 in steady-state progression. Monotonically non-decreasing: deaths reduce `rippleLevel` (the current value) but never `minRippleLevel`.

`spinningTopEncounters` (integer array, save key `SPINNINGTOPENCOUNTERS`): spawn identifier integers for each Spinning Top object interacted with. This list includes every encounter type, including bath encounters at WAUA, Rot-region encounters, and post-ending encounters, none of which advance the ripple levels. A save with many entries but low `minRippleLevel` indicates most encounters were of the non-RL type.

The conversation selected by the game's `StartConversation` is based on the prospective levels that will result from the encounter, computed before `RaiseRippleLevel` runs. This means finding `maxRippleLevel >= X` in the save confirms the encounter that would raise max to X has already occurred.

Only encounters in RL-raising regions advance the levels: bath encounters (WAUA BATH), Rot-region encounters, and post-ending encounters all add to `spinningTopEncounters` without raising the levels.

Detection table for vanilla and N-series dialogues:

| Entry                                      | Field          | Threshold | Confidence |
|--------------------------------------------|----------------|-----------|------------|
| `Watcher_ST_Decisiontree`                  | maxRippleLevel | >= 0.25   | Exact      |
| `Watcher_vanillaEncounter_1` (Ghost_ST_V1) | maxRippleLevel | >= 0.25   | Exact      |
| `Watcher_vanillaEncounter_2` (Ghost_ST_V2) | maxRippleLevel | >= 0.5    | Exact      |
| `Watcher_vanillaEncounter_3` (Ghost_ST_V3) | maxRippleLevel | >= 1.0    | Exact      |
| `Watcher_ST_Echo_Ghost_ST_N1`              | maxRippleLevel | >= 1.5    | Exact      |
| `Watcher_ST_Echo_Ghost_ST_N5`              | maxRippleLevel | >= 3.0    | Exact      |
| `Watcher_ST_Echo_Ghost_ST_N2`              | maxRippleLevel | >= 4.5    | Exact      |
| `Watcher_ST_Echo_Ghost_ST_N3`              | minRippleLevel | >= 3.0    | Exact      |
| `Watcher_ST_Echo_Ghost_ST_N6`              | minRippleLevel | >= 4.0    | Exact      |
| `Watcher_ST_Echo_Ghost_ST_N7`              | see below      |           | Exact      |

`Watcher_ST_Decisiontree` is a reference entry describing the Spinning Top's selection logic tree rather than a specific in-game dialogue. It is unlocked whenever any Spinning Top encounter has occurred.

`Watcher_ST_Echo_Ghost_ST_N7` fires via two paths. Path A: target min is 4.5 when spawn ID 0 (the Desolate Tract encounter) has not yet occurred. Path B: target min is 5.0 in the main chain. Detection: `(minRippleLevel >= 4.5 AND spawn ID 0 is NOT in spinningTopEncounters) OR minRippleLevel >= 5.0`.

Note on N6 and N7 in SpinningTop-ending saves: a player completing the SpinningTop ending after 12 RL-advancing encounters will have `minRippleLevel` around 3.5. N6 (requiring minRippleLevel >= 4.0) and N7 would never have fired. The detection is correct; the ending simply came before those dialogues could trigger.

Special encounter entries:

`Watcher_ST_Echo_Ghost_ST_ROT1` (Ghost_ST_ROT1): fires when the Spinning Top is encountered inside a Rot-infected region. Ripple level is not advanced. Detection: `spinningTopRot == true`. Confidence: exact.

`Watcher_ST_Other_WAUA` (Ghost_ST_AU1): fires in room WAUA BATH, the Void Bath. Overrides all standard ripple logic. Detection: `visitBath == true`. Confidence: exact.

`Watcher_ST_Other_WARA` (Ghost_ST_RIP1): fires in room WARA P09 (Shattered Terrace) where the Spinning Top object has `rippleWarp = true` (spawnIdentifier 1). This property is set in the level editor and is unrelated to the player's accumulated ripple level or encounter count. After the conversation completes, `MarkSpinningTopEncountered()` adds spawnIdentifier 1 to `spinningTopEncounters`. Detection: spawnIdentifier 1 is present in `spinningTopEncounters`. DSL: `watcher { stSpawn.1 }`. Confidence: exact.

`Watcher_ST_Echo_Ghost_ST_N4` (Desolate Tract, WTDB): fires at spawn ID 0 in the Desolate Tract. The encounter defers whatever standard ripple-level conversation would have fired; that deferred conversation plays at the next encounter instead. Detection: spawn ID 0 is present in `spinningTopEncounters`. Confidence: approximate (the identity of spawn ID 0 as the WTDB encounter cannot be verified from the save alone without cross-referencing game data).

`Watcher_ST_Other_toys` (Ghost_ST_AU2): fires in room WAUA TOYS (Ancient Urban, toys room). No dedicated save flag exists. Detection: `maxRippleLevel >= 4.5` as a precondition only, since WAUA requires high ripple level to reach. Confidence: approximate.

Runtime-only Spinning Top events with no save detection: `DieAtSpinningTop1`, `DieAtSpinningTop2`, `DieAtSpinningTop3`, `LeaveSpinningTop1`, `LeaveSpinningTop2`, `Watcher_ST_Echo_ellipsis` (the fallback dialogue that fires when no other condition matches).

### Rot Prince Dialogues

The Rot Prince is an iterator encountered in Watcher's campaign. His dialogues are tracked via `miscWorldData.integersWatcher[12]`, named `highestPrinceConversationSeen`, which stores the file number of the most recently loaded Prince conversation file. This single field covers the full range of Prince interactions with exact detection.

Pre-awakening karma sigil conversations occur in the WORA THRONE rooms before the Prince fully awakens. Files 214 through 217 form the first sigil set; files 218 through 221 form the second.

Awakened chamber conversations fire on visits to the Prince's chamber (WORA AI room). The dialogue selected branches on `rotInfectedRegions.length` at the time of the visit: 5 or more infected regions triggers file 224, 7 or more triggers 225, 9 or more triggers 226, 11 or more triggers 227, and 13 or more triggers 228. Files 222 and 223 are the first encounter (first and second paragraphs, grouped under `Prince_1_2`).

| Entry                                    | Detection                            | Confidence |
|------------------------------------------|--------------------------------------|------------|
| `Watcher_Prince_KarmaSigils_Prince_KS_1` | highestPrinceConversationSeen >= 214 | Exact      |
| `Watcher_Prince_KarmaSigils_Prince_KS_2` | highestPrinceConversationSeen >= 218 | Exact      |
| `Watcher_Prince_Dialogue_Prince_1_2`     | highestPrinceConversationSeen >= 222 | Exact      |
| `Watcher_Prince_Dialogue_Prince_3`       | highestPrinceConversationSeen >= 224 | Exact      |
| `Watcher_Prince_Dialogue_Prince_4`       | highestPrinceConversationSeen >= 225 | Exact      |
| `Watcher_Prince_Dialogue_Prince_5`       | highestPrinceConversationSeen >= 226 | Exact      |
| `Watcher_Prince_Dialogue_Prince_6`       | highestPrinceConversationSeen >= 227 | Exact      |
| `Watcher_Prince_Dialogue_Prince_7`       | highestPrinceConversationSeen >= 228 | Exact      |

`highestPrinceConversationSeen` lives in the per-slugcat `integersWatcher` array (save key `IntegersWatcher`), not in the global `MiscProgRecord.integersWatcher`.

Runtime-only Prince events use `numberOfPrinceEncounters >= 1` (from `integersWatcher[6]`) as the best available proxy:

| Entry                                               | Detection                     | Confidence  |
|-----------------------------------------------------|-------------------------------|-------------|
| `Watcher_Prince_Events_AcknowledgePlayerGift`       | numberOfPrinceEncounters >= 1 | Approximate |
| `Watcher_Prince_Events_TalkToDeadPlayer`            | numberOfPrinceEncounters >= 1 | Approximate |
| `Watcher_Prince_Events_Pain`                        | numberOfPrinceEncounters >= 1 | Approximate |
| `Watcher_Prince_Events_AcknowledgePlayerCamouflage` | numberOfPrinceEncounters >= 1 | Approximate |

### Void Weaver Dialogues

The Void Weaver can be encountered multiple times. The encounter count is tracked at `miscWorldData.integersWatcher[4]` (`numberOfVoidWeaverEncounters`). The fourth encounter grants the sealing ability.

| Entry                              | Condition                         | Confidence |
|------------------------------------|-----------------------------------|------------|
| `Watcher_Weaver_Dialogue_Weaver_1` | numberOfVoidWeaverEncounters >= 1 | Exact      |
| `Watcher_Weaver_Dialogue_Weaver_2` | numberOfVoidWeaverEncounters >= 2 | Exact      |
| `Watcher_Weaver_Dialogue_Weaver_3` | numberOfVoidWeaverEncounters >= 3 | Exact      |
| `Watcher_Weaver_Dialogue_Weaver_4` | numberOfVoidWeaverEncounters >= 4 | Exact      |

### Prince and Weaver Arc Dialogues

After Watcher gains the Void Weaver ability, the Prince reacts and a new dialogue arc begins.

`Watcher_Prince_Weaver_Prince_Weaver_1`: the Prince's first acknowledgement of the player's Weaver ability. Fires when `princeWeaverGrowthAcknowledgement == 0` and the player visits the Prince after gaining the ability, then sets the field to 1. Detection: `integersWatcher[14] == 1` (confirms the acknowledgement has been delivered). Confidence: exact.

`Watcher_Prince_Weaver_Prince_Weaver_2`: the second Weaver-related Prince conversation. Fires when `princeWeaverDialogProgression >= 1`. Detection: `integersWatcher[13] >= 1`. Confidence: exact.

`Watcher_Prince_Weaver_Prince_Ascension`: the Prince's final conversation during Watcher's ascension. Two source variants exist in the dialogue files (file 235 standard, file 242 when the Mark of Communication is already obtained), both grouped under this single entry. Detection: global `MiscProgRecord.integersWatcher[5] == 4` (watcherEndingID value 4 corresponds to the Ascension ending). Confidence: exact.

### Watcher Endings

Ending detection uses the global `MiscProgRecord.integersWatcher`, not the per-slugcat array.

| Ending               | Detection                                                                                                          |
|----------------------|--------------------------------------------------------------------------------------------------------------------|
| Any ending completed | integersWatcher[0] == 1                                                                                            |
| Spinning Top ending  | integersWatcher[2] == 1                                                                                            |
| Sentient Rot ending  | integersWatcher[3] == 1                                                                                            |
| Void Weaver ending   | integersWatcher[4] == 1                                                                                            |
| Ending ID value      | integersWatcher[5]: 1=SpinningTop, 2=SentientRot, 3=VoidWeaver, 4=Ascension                                        |
| Ascension ending     | integersWatcher[9] == 1 (index 9 is absent from the array until this ending is reached; guard with a length check) |

### Watcher Pearl Projections

The WAUA region contains pearl projector rooms where Watcher can view recorded content. The game's `PearlReader` class is a purely runtime object with no save interaction. There is no `lorePearlsWatcher` field. No save data records which specific projections have been viewed.

The common gate condition across all projection entry types is whether Watcher has visited the projector room, detected from `regionStates[*].roomsVisited` by checking for room name `WAUA_PEARL`. This is the `projector` boolean in the DSL watcher scope. Most entry types additionally require a physical item scan confirming the pearl was saved somewhere in the world or inventory.

Physical item scan: DataPearl items persist across cycle boundaries if the player carried them into a shelter or left them in the world. When saved, a DataPearl's type string appears in the `extraFields` array of the saved item. The scan checks five locations within the Watcher `SaveStateRecord`: `swallowedItems` (items in stomach), `playerGrasps` (held items), `objectTrackers` (persistent world objects), top-level `objects`, and `objects` within each `regionStates` entry. A DataPearl with a matching type string confirms the pearl is or was in the player's possession or in the world at save time, but does not confirm the projector was used.

**Named data pearl projections**: standard named data pearls from non-Watcher regions (CC, HI, SU, and others) also have a `PearlReader` transcriber for Watcher's projector. These are housed within the named pearl's existing collection entry rather than as standalone entries. Detection: `watcher { projector and physicalPearl.X }` where X is the pearl's internalId (e.g. `physicalPearl.CC` for the CC pearl). Confidence: approximate.

**Named text projections**: five pearls with text content found in Watcher regions, physically carried to the projector. Detection: `watcher { projector and physicalPearl.X }` where X is the pearl's in-save type string. The type strings differ from the region codes used as file names:

| File | internalId | `physicalPearl` key |
|------|-----------|----------------------|
| `WARB.txt` | `TEXT_SECRET` | `physicalPearl.TEXT_SECRET` |
| `WARC.txt` | `TEXT_CONTEMPT` | `physicalPearl.TEXT_CONTEMPT` |
| `WARD.txt` | `TEXT_STARDUST` | `physicalPearl.TEXT_STARDUST` |
| `WMPA.txt` | `TEXT_NOTIONOFSELF` | `physicalPearl.TEXT_NOTIONOFSELF` |
| `WVWA.txt` | `TEXT_KITESDAY` | `physicalPearl.TEXT_KITESDAY` |

Confidence: approximate.

**Fixed-location projections** (WAUA, WORA, DRONE, ABSTRACT): world-placed pearls at fixed positions. Despite being "fixed", detection still uses `watcher { projector and physicalPearl.X }` — the physical scan covers world-placed objects in `regionStates[*].objects`, so a pearl left in its original location is detected as long as it has been saved as a world object. Note: ABSTRACT uses type string `Abstract` (lowercase `a`). Confidence: approximate.

**Audio pearl files** (`watcher_pearls/audio/`): each carries `save-unlock: watcher { projector and physicalPearl.ID }` where ID is the pearl's internalId (e.g. `physicalPearl.AUDIO_JAM1`). Confidence: approximate.

**Misc image projections** (`Watcher_Pearl_Misc_Projection_*`): in-place image sequences with no carry mechanic. The entry-level `save-unlock` is `watcher { projector }` only — no `physicalPearl` check, because these projections are viewed in-place at the projector room and are never physically carried. Confidence: approximate.

---

## Entries With No Save-Detectable Condition

The following entries cannot be detected from any save file data. They are either always locked or handled by a separate design-level decision.

| Entry                                                            | Reason                                                                              |
|------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| `DieAtSpinningTop1`, `DieAtSpinningTop2`, `DieAtSpinningTop3`    | Runtime death event during Spinning Top encounter                                   |
| `LeaveSpinningTop1`, `LeaveSpinningTop2`                         | Runtime leave event during Spinning Top encounter                                   |
| `Watcher_ST_Echo_ellipsis`                                       | Runtime fallback dialogue; fires when no specific condition matches                 |
| `Watcher_Prince_Events_AcknowledgePlayerGift`                    | Item dropped in Prince's chamber; runtime event                                     |
| `Watcher_Prince_Events_TalkToDeadPlayer`                         | Player died in or near Prince's chamber; runtime death                              |
| `Watcher_Prince_Events_Pain`                                     | Weapon thrown at the Prince; runtime combat event                                   |
| `Watcher_Prince_Events_AcknowledgePlayerCamouflage`              | Camouflage used in specific room; runtime event                                     |
| `FP_Dialogue_artificer_Lingering_Too_Long`                       | Frame counter not saved between sessions                                            |
| `FP_Dialogue_rivulet_Proto_Long_Legs_Death`                      | Cause of death not saved                                                            |
| `FP_Dialogue_rivulet_Neuron`                                     | Item consumption in room not saved                                                  |
| `FP_Dialogue_rivulet_Music` (first transcriber only)             | Item grab in room not saved; second transcriber IS detectable via `pearlArtificer.RM` |
| `FP_Dialogue_other_Throwing_Singularity_Bomb`                    | Item use in specific room not saved                                                 |
| `LttM_Dialogue_saint_Blizzard_approaching`                       | Runtime weather event timing not saved                                              |
| `BroadcastMisc_1` through `BroadcastMisc_32`                     | All 32 entries share internalId `BroadcastMisc`; individual tracking does not exist |
| `Misc_WHITE_PEARLS_1` through `Misc_WHITE_PEARLS_73`             | All share internalId `Misc`; generic white pearls have no individual tracking       |
| `PebblesPearl_1` through `PebblesPearl_18`                       | All share internalId `PebblesPearl`; FP's gray marbles have no individual tracking  |
| `DevComm_*`                                                      | Developer commentary stored only in `localoptions.txt`, not in the save file        |
| Watcher projection viewing (text/image/audio pearls)             | Viewing a projection leaves no save record; physicalPearl confirms possession, not viewing |

Note on dev commentary: the `allChallengesCompleted` proxy (all 70 `challengesCompleted` slots set to 1) is used to unlock `DevComm_*` entries as a design choice, since the actual dev commentary state lives in `localoptions.txt` outside the save file. This has no connection to BroadcastMisc pearls.

---

## Save Field Quick Reference

### MiscProgRecord

| Field                   | Save key          | Used for                                             |
|-------------------------|-------------------|------------------------------------------------------|
| `lorePearls`            | `LORE`            | Named pearl matching, base transcribers              |
| `lorePearlsArtificer`   | `LOREP`           | Named pearl matching, Artificer/FP transcribers      |
| `lorePearlsSpearmaster` | `LOREDM`          | Named pearl matching, Spearmaster transcribers       |
| `lorePearlsSaint`       | `LOREFUT`         | Named pearl matching, Saint transcribers             |
| `broadcasts`            | (varies)          | Region chatlog broadcast matching                    |
| `challengesCompleted`   | `CHCLEAR`         | Dev commentary proxy (all 70 chars must be `1`)      |
| `integersWatcher[0]`    | `INTEGERSWATCHER` | beaten_Watcher (any ending)                          |
| `integersWatcher[2]`    |                   | beaten_Watcher_SpinningTop                           |
| `integersWatcher[3]`    |                   | beaten_Watcher_SentientRot                           |
| `integersWatcher[4]`    |                   | beaten_Watcher_VoidWeaver                            |
| `integersWatcher[5]`    |                   | watcherEndingID (1=ST, 2=Rot, 3=Weaver, 4=Ascension) |
| `integersWatcher[9]`    |                   | beaten_Watcher_Ascension (absent until reached)      |

### SaveStateRecord.deathPersistentData

| Field                   | Save key                | Used for                                                     |
|-------------------------|-------------------------|--------------------------------------------------------------|
| `chatLogs`              |                         | Broadcast ID accumulation, Chatlog_SI9, Chatlog_LM7          |
| `prePebChatLogs`        |                         | LP pre-FP count (Spearmaster)                                |
| `ghosts[*].count`       |                         | Echo detection                                               |
| `hasTheMark`            | `HASTHEMARK`            | `hasMark` DSL boolean; true when the slugcat has the mark of communication |
| `altEnding`             | `ALTENDING`             | Artificer chieftain, Rivulet cell placed, Spearmaster ending |
| `looksToTheDoom`        | `LOOKSTOTHEDOOM`        | Saint Rubicon (Moon ascended)                                |
| `zeroPebbles`           | `ZEROPEBBLES`           | Saint Rubicon (FP ascended)                                  |
| `maxRippleLevel.value`  | `MAXRIPPLELEVEL`        | Watcher Spinning Top vanilla and N-series (max)              |
| `minRippleLevel.value`  | `MINRIPPLELEVEL`        | Watcher Spinning Top N-series (min)                          |
| `spinningTopEncounters` | `SPINNINGTOPENCOUNTERS` | Watcher encounter list; N7 path A; WARA (spawnId 1, exact); WTDB (spawnId 0, approximate) |
| `spinningTopRot`        | `SPINNINGTOPROT`        | Watcher ROT1 encounter                                       |
| `visitBath`             | `VISITBATH`             | Watcher WAUA Bath encounter                                  |

### SaveStateRecord.miscWorldData

| Field                          | Save key               | Used for                                                       |
|--------------------------------|------------------------|----------------------------------------------------------------|
| `slaiState.integersArray[0]`   | (SLAISTATE index 0)    | playerEncounters; LttM detection                               |
| `slaiState.integersArray[1]`   | (SLAISTATE index 1)    | encountersWithMark; Hunter 2nd visit, Rivulet ending precision |
| `slaiState.integersArray[2]`   | (SLAISTATE index 2)    | lttmNeuronsLeft; Moon's current neuron count (health); neuron-count variant detection |
| `slaiState.integersArray[4]`   | (SLAISTATE index 4)    | totNeuronsGiven; neuron fly receiving dialogue detection        |
| `slaiState.significantPearls`  |                        | Named pearls Moon has read; `lttmReadPearl` boolean (length > 0) |
| `slaiState.miscItemsDescribed` |                        | Non-pearl item types Moon has described; `lttmDiscussedObject` boolean (length > 0) |
| `ssaiConversationsHad`         | `SSaiConversationsHad` | FP dialogue detection                                          |
| `moonRevived`                  | `MOONHEART`            | Rivulet/Saint ending state                                     |
| `pebblesHelped`                | `PEBBLESHELPED`        | Hunter green neuron split                                      |
| `energyRailOff`                | `ENERGYRAILOFF`        | Rivulet pre-ending Moon dialogue                               |
| `smPearlTagged`                | `SMPEARLTAGGED`        | Spearmaster body pearl tagging at DM oracle                    |
| `integersWatcher[4]`           | `IntegersWatcher`      | numberOfVoidWeaverEncounters (Watcher)                         |
| `integersWatcher[6]`           |                        | numberOfPrinceEncounters (Watcher)                             |
| `integersWatcher[12]`          |                        | highestPrinceConversationSeen (Watcher)                        |
| `integersWatcher[13]`          |                        | princeWeaverDialogProgression (Watcher)                        |
| `integersWatcher[14]`          |                        | princeWeaverGrowthAcknowledgement (Watcher)                    |
| `rotInfectedRegions.length`    | `ROTINFECTEDREGIONS`   | Watcher Rot state (secondary reference)                        |

### SaveStateRecord region and physical item fields

| Field                                                         | Used for                                                    |
|---------------------------------------------------------------|-------------------------------------------------------------|
| `regionStates[*].roomsVisited`                                | Room visit proxies: `SS_AI`, `SL_AI`, `RM_AI`, `WAUA_PEARL`, BroadcastMisc rooms |
| `regionStates[*].objects`                                     | Physical pearl scan (Watcher named pearls)                  |
| `swallowedItems`, `playerGrasps`, `objectTrackers`, `objects` | Physical pearl scan                                         |

### DSL global set accessors (named pearl sources)

These accessors take a pearl internalId as the key and check the corresponding `pearlSources` Map entry.

| DSL accessor | Meaning |
|---|---|
| `global { pearl.X }` | Pearl X was found via any source |
| `global { pearlBase.X }` | Pearl X is in `lorePearls` (base route) |
| `global { pearlArtificer.X }` | Pearl X is in `lorePearlsArtificer` |
| `global { pearlSpearmaster.X }` | Pearl X is in `lorePearlsSpearmaster` |
| `global { pearlSaint.X }` | Pearl X is in `lorePearlsSaint` |
| `global { pearlSource.Base }` | Any pearl has been read via the base route |
| `global { pearlSource.Artificer }` | Any pearl has been read in an Artificer save |
| `global { pearlSource.Spearmaster }` | Any pearl has been read in a Spearmaster save |
| `global { pearlSource.Saint }` | Any pearl has been read in a Saint save |

### Precomputed flags (not raw save fields)

These are derived from save data in `extractCollectibles` and exposed as DSL globals.

| Flag | DSL accessor | Derivation |
|---|---|---|
| `broadcastMiscLttm` | `global { broadcastMiscLttm }` | Any LttM-eligible slugcat visited a campaign-specific BroadcastMisc room AND `SL_AI`. Source table: `BROADCAST_MISC_SLUGCATS` in `saveCollectibles.ts`. |
| `broadcastMiscFp` | `global { broadcastMiscFp }` | Artificer visited `SI_A07` AND `SS_AI`. |
