if (this.id == Conversation.ID.MoonFirstPostMarkConversation)
{
    switch (Mathf.Clamp(this.State.neuronsLeft, 0, 5))
    {
    case 0:
        break;
    case 1:
        this.events.Add(new Conversation.TextEvent(this, 40, "...", 10));
        return;
    case 2:
        this.events.Add(new Conversation.TextEvent(this, 30, this.Translate("Get... get away... white.... thing."), 10));
        this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Please... thiss all I have left."), 10));
        return;
    case 3:
        this.events.Add(new Conversation.TextEvent(this, 30, this.Translate("You!"), 10));
        this.events.Add(new Conversation.TextEvent(this, 60, this.Translate("...you ate... me. Please go away. I won't speak... to you.<LINE>I... CAN'T speak to you... because... you ate...me..."), 0));
        return;
    case 4:
        base.LoadEventsFromFile(35);
        base.LoadEventsFromFile(37);
        this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("I'm still angry at you, but it is good to have someone to talk to after all this time.<LINE>The scavengers aren't exactly good listeners. They do bring me things though, occasionally..."), 0));
        return;
    case 5:
        this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Hello <PlayerName>."), 0));
        this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("What are you? If I had my memories I would know..."), 0));
        if (this.State.playerEncounters > 0 && this.State.playerEncountersWithMark == 0)
        {
            this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Perhaps... I saw you before?"), 0));
        }
        this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("You must be very brave to have made it all the way here. But I'm sorry to say your journey here is in vain."), 5));
        this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("As you can see, I have nothing for you. Not even my memories."), 0));
        this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Or did I say that already?"), 5));
        base.LoadEventsFromFile(37);
        this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("It is good to have someone to talk to after all this time!<LINE>The scavengers aren't exactly good listeners. They do bring me things though, occasionally..."), 0));
        return;
    default:
        return;
    }
}