// Token: 0x17000172 RID: 370
// (get) Token: 0x06000A77 RID: 2679 RVA: 0x00086354 File Offset: 0x00084554
public int remainingRegionsForSentientRotEnding
{
    get
    {
        return Mathf.Max(0, 18 - this.regionsInfectedBySentientRotSpread.Count);
    }
}

// Token: 0x17000173 RID: 371
// (get) Token: 0x06000A78 RID: 2680 RVA: 0x0008636A File Offset: 0x0008456A
public bool SentientRotEndingConditionsMet
{
    get
    {
        return this.remainingRegionsForSentientRotEnding == 0 && !this.lockedOuterRimProgressionFlag && this.highestPrinceConversationSeen > PrinceBehavior.PrinceConversation.PrinceConversationToId(WatcherEnums.ConversationID.Prince_1);
    }
}