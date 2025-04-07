// Token: 0x06002969 RID: 10601 RVA: 0x0030F690 File Offset: 0x0030D890
private void VanillaRegionSpinningTopEncounter()
{
    List<string> list = new List<string>();
    for (int i = 0; i < WatcherRoomSpecificScript.sentientRotVanillaRooms.Length; i++)
    {
        string text = WatcherRoomSpecificScript.sentientRotVanillaRooms[i];
        string text2 = text.Split(new char[]
        {
            '_'
        })[0].ToLowerInvariant();
        if (!list.Contains(text2))
        {
            if (!this.room.game.GetStorySession.saveState.miscWorldSaveData.extraSentientRotTicks.ContainsKey(text2))
            {
                this.room.game.GetStorySession.saveState.miscWorldSaveData.extraSentientRotTicks[text2] = 0;
            }
            Dictionary<string, int> extraSentientRotTicks = this.room.game.GetStorySession.saveState.miscWorldSaveData.extraSentientRotTicks;
            string key = text2;
            extraSentientRotTicks[key] += 20;
            list.Add(text2);
        }
        if (!this.room.game.GetStorySession.saveState.miscWorldSaveData.pendingSentientRotInfections.Contains(text))
        {
            this.room.game.GetStorySession.saveState.miscWorldSaveData.pendingSentientRotInfections.Add(text);
        }
    }
    this.vanillaEncounterEnded = true;
}