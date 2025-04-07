// Token: 0x06002961 RID: 10593 RVA: 0x0030EF6C File Offset: 0x0030D16C
protected override void StartConversation()
{
    Conversation.ID id = Conversation.ID.None;
    Vector2 vector = Watcher.SpinningTop.NextMinMaxRippleLevel(this.room);
    float y = vector.y;
    float x = vector.x;
    if (this.BathScene)
    {
        id = WatcherEnums.ConversationID.Ghost_ST_AU1;
        if (this.room.shortCutsReady)
        {
            this.room.shortcuts[0].shortCutType = ShortcutData.Type.DeadEnd;
        }
    }
    else if (this.BedroomScene)
    {
        id = WatcherEnums.ConversationID.Ghost_ST_AU2;
    }
    else if (Region.IsVanillaSentientRotRegion(this.room.world.name))
    {
        id = WatcherEnums.ConversationID.Ghost_ST_ROT1;
    }
    else if (!Region.IsAncientUrbanRegion(this.room.world.name))
    {
        if (this.SpecialData != null && this.SpecialData.rippleWarp)
        {
            id = WatcherEnums.ConversationID.Ghost_ST_RIP1;
        }
        else if (y == 0.25f)
        {
            id = WatcherEnums.ConversationID.Ghost_ST_V1;
        }
        else if (y == 0.5f)
        {
            id = WatcherEnums.ConversationID.Ghost_ST_V2;
        }
        else if (y == 1f)
        {
            id = WatcherEnums.ConversationID.Ghost_ST_V3;
        }
        else if (y == 1.5f)
        {
            id = WatcherEnums.ConversationID.Ghost_ST_N1;
        }
        else if (y == 3f)
        {
            id = WatcherEnums.ConversationID.Ghost_ST_N5;
        }
        else if (y == 3.5f)
        {
            id = WatcherEnums.ConversationID.Ghost_ST_N4;
        }
        else if (y == 4.5f)
        {
            id = WatcherEnums.ConversationID.Ghost_ST_N2;
        }
        else if (x == 3f)
        {
            id = WatcherEnums.ConversationID.Ghost_ST_N3;
        }
        else if (x == 4f)
        {
            id = WatcherEnums.ConversationID.Ghost_ST_N6;
        }
        else if (x == 5f)
        {
            id = WatcherEnums.ConversationID.Ghost_ST_N7;
        }
    }
    if (this.room.game.cameras[0].hud.dialogBox == null)
    {
        this.room.game.cameras[0].hud.InitDialogBox();
    }
    this.currentConversation = new SpinningTop.SpinningTopConversation(id, this, this.room.game.cameras[0].hud.dialogBox);
    if (id == Conversation.ID.None)
    {
        this.currentConversation.events.Add(new Conversation.TextEvent(this.currentConversation, 0, "...", 300));
    }
}