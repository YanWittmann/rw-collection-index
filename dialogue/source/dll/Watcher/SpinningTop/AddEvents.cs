// Token: 0x06004FD6 RID: 20438 RVA: 0x00553B0C File Offset: 0x00551D0C
protected override void AddEvents()
{
    if (ModManager.Watcher && this.id == WatcherEnums.ConversationID.Ghost_ST_V1)
    {
        base.LoadEventsFromFile(200);
        return;
    }
    if (ModManager.Watcher && this.id == WatcherEnums.ConversationID.Ghost_ST_V2)
    {
        base.LoadEventsFromFile(201);
        return;
    }
    if (ModManager.Watcher && this.id == WatcherEnums.ConversationID.Ghost_ST_V3)
    {
        base.LoadEventsFromFile(202);
        return;
    }
    if (ModManager.Watcher && this.id == WatcherEnums.ConversationID.Ghost_ST_N1)
    {
        base.LoadEventsFromFile(203);
        return;
    }
    if (ModManager.Watcher && this.id == WatcherEnums.ConversationID.Ghost_ST_N2)
    {
        base.LoadEventsFromFile(204);
        return;
    }
    if (ModManager.Watcher && this.id == WatcherEnums.ConversationID.Ghost_ST_N3)
    {
        base.LoadEventsFromFile(205);
        return;
    }
    if (ModManager.Watcher && this.id == WatcherEnums.ConversationID.Ghost_ST_N4)
    {
        base.LoadEventsFromFile(206);
        return;
    }
    if (ModManager.Watcher && this.id == WatcherEnums.ConversationID.Ghost_ST_N5)
    {
        base.LoadEventsFromFile(211);
        return;
    }
    if (ModManager.Watcher && this.id == WatcherEnums.ConversationID.Ghost_ST_N6)
    {
        base.LoadEventsFromFile(212);
        return;
    }
    if (ModManager.Watcher && this.id == WatcherEnums.ConversationID.Ghost_ST_N7)
    {
        base.LoadEventsFromFile(213);
        return;
    }
    if (ModManager.Watcher && this.id == WatcherEnums.ConversationID.Ghost_ST_RIP1)
    {
        base.LoadEventsFromFile(207);
        return;
    }
    if (ModManager.Watcher && this.id == WatcherEnums.ConversationID.Ghost_ST_ROT1)
    {
        base.LoadEventsFromFile(208);
        return;
    }
    if (ModManager.Watcher && this.id == WatcherEnums.ConversationID.Ghost_ST_AU1)
    {
        base.LoadEventsFromFile(210);
        return;
    }
    if (ModManager.Watcher && this.id == WatcherEnums.ConversationID.Ghost_ST_AU2)
    {
        base.LoadEventsFromFile(209);
    }
}