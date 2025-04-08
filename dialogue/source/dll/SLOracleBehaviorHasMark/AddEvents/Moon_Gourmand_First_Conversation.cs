if (ModManager.MSC && this.id == MoreSlugcatsEnums.ConversationID.Moon_Gourmand_First_Conversation)
{
    switch (Mathf.Clamp(this.State.neuronsLeft, 0, 5))
    {
    case 1:
        this.events.Add(new Conversation.TextEvent(this, 40, "...", 10));
        return;
    case 2:
        this.events.Add(new Conversation.TextEvent(this, 30, this.Translate("Get... get away... round.... thing."), 10));
        this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Please... thiss all I have left."), 10));
        return;
    case 3:
        this.events.Add(new Conversation.TextEvent(this, 30, this.Translate("You!"), 10));
        this.events.Add(new Conversation.TextEvent(this, 60, this.Translate("...you ate... me. Please go away. I won't speak... to you.<LINE>I... CAN'T speak to you... because... you ate...me..."), 0));
        return;
    case 4:
        base.LoadEventsFromFile(35);
        base.LoadEventsFromFile(163);
        return;
    case 5:
        base.LoadEventsFromFile(162);
        return;
    default:
        return;
    }
}