// Token: 0x06004753 RID: 18259 RVA: 0x004E2CB0 File Offset: 0x004E0EB0
private void PebblesPearl()
{
    switch (UnityEngine.Random.Range(0, 5))
    {
    case 0:
        this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("You would like me to read this?"), 10));
        this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("It's still warm... this was in use recently."), 10));
        break;
    case 1:
        this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("A pearl... This one is crystal clear - it was used just recently."), 10));
        break;
    case 2:
        this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Would you like me to read this pearl?"), 10));
        this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Strange... it seems to have been used not too long ago."), 10));
        break;
    case 3:
        this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("This pearl has been written to just now!"), 10));
        break;
    default:
        this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Let's see... A pearl..."), 10));
        this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("And this one is fresh! It was not long ago this data was written to it!"), 10));
        break;
    }
    base.LoadEventsFromFile((ModManager.MSC && this.myBehavior.oracle.ID == MoreSlugcatsEnums.OracleID.DM) ? 168 : 40, true, (this.myBehavior is SLOracleBehaviorHasMark && (this.myBehavior as SLOracleBehaviorHasMark).holdingObject != null) ? (this.myBehavior as SLOracleBehaviorHasMark).holdingObject.abstractPhysicalObject.ID.RandomSeed : UnityEngine.Random.Range(0, 100000));
}