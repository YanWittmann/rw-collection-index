// Token: 0x0600282F RID: 10287 RVA: 0x002FF9F0 File Offset: 0x002FDBF0
private void InitateConversation()
{
    int count = this.prince.room.game.GetStorySession.saveState.miscWorldSaveData.regionsInfectedBySentientRotSpread.Count;
    this.conversationAfterHello = null;
    this.currentConversation = new PrinceBehavior.PrinceConversation(this, WatcherEnums.ConversationID.Prince_1, this.dialogBox);
    int highestPrinceConversationSeen = this.prince.room.game.GetStorySession.saveState.miscWorldSaveData.highestPrinceConversationSeen;
    Conversation.ID id = PrinceBehavior.PrinceConversation.TargetConversation(highestPrinceConversationSeen, count);
    if (id != null)
    {
        this.prince.room.game.GetStorySession.saveState.miscWorldSaveData.highestPrinceConversationSeen = Mathf.Max(highestPrinceConversationSeen, PrinceBehavior.PrinceConversation.PrinceConversationToId(id));
        this.conversationAfterHello = id;
    }
}