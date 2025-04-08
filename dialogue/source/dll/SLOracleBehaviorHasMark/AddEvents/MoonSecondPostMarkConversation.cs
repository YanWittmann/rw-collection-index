if (this.id == Conversation.ID.MoonSecondPostMarkConversation)
{
    switch (Mathf.Clamp(this.State.neuronsLeft, 0, 5))
    {
    case 0:
        break;
    case 1:
        this.events.Add(new Conversation.TextEvent(this, 40, "...", 10));
        return;
    case 2:
        this.events.Add(new Conversation.TextEvent(this, 80, this.Translate("...leave..."), 10));
        return;
    case 3:
        this.events.Add(new Conversation.TextEvent(this, 20, this.Translate("You..."), 10));
        this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Please don't... take... more from me... Go."), 0));
        return;
    case 4:
        if (this.State.GetOpinion == SLOrcacleState.PlayerOpinion.Dislikes)
        {
            this.events.Add(new Conversation.TextEvent(this, 30, this.Translate("Oh. You."), 0));
            return;
        }
        if (this.State.GetOpinion == SLOrcacleState.PlayerOpinion.Likes)
        {
            this.events.Add(new Conversation.TextEvent(this, 30, this.Translate("Hello there! You again!"), 0));
        }
        else
        {
            this.events.Add(new Conversation.TextEvent(this, 30, this.Translate("Hello there. You again!"), 0));
        }
        this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("I wonder what it is that you want?"), 0));
        if (this.State.GetOpinion != SLOrcacleState.PlayerOpinion.Dislikes && SlugcatStats.AtOrBeforeTimeline(this.myBehavior.oracle.room.game.TimelinePoint, SlugcatStats.Timeline.Saint))
        {
            this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("I have had scavengers come by before. Scavengers!<LINE>And they left me alive!<LINE>But... I have told you that already, haven't I?"), 0));
            this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("You must excuse me if I repeat myself. My memory is bad.<LINE>I used to have a pathetic five neurons... And then you ate one.<LINE>Maybe I've told you that before as well."), 0));
            return;
        }
        break;
    case 5:
        if (this.State.GetOpinion == SLOrcacleState.PlayerOpinion.Dislikes)
        {
            this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("You again."), 10));
            return;
        }
        if (this.State.GetOpinion == SLOrcacleState.PlayerOpinion.Likes)
        {
            this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Oh, hello!"), 10));
        }
        else
        {
            this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Oh, hello."), 10));
        }
        if (ModManager.MSC && this.myBehavior.oracle.room.game.StoryCharacter == MoreSlugcatsEnums.SlugcatStatsName.Saint)
        {
            if (this.State.GetOpinion != SLOrcacleState.PlayerOpinion.Dislikes)
            {
                this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Have you come back to see me again?"), 60));
                this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Ah, you remind me of an old creature who used to visit here often."), 0));
                this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("The passage of time has since taken them away, of course. That was a while ago."), 0));
                this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Stay as long as you'd like. But not too long."), 40));
                this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("This chamber is not very well insulated from the cold."), 30));
                return;
            }
        }
        else
        {
            this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("I wonder what it is that you want?"), 0));
            if (this.State.GetOpinion != SLOrcacleState.PlayerOpinion.Dislikes)
            {
                this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("There is nothing here. Not even my memories remain."), 0));
                this.events.Add(new Conversation.TextEvent(this, 30, this.Translate("Even the scavengers that come here from time to time leave with nothing. But... I have told you that already, haven't I?"), 0));
                if (this.State.GetOpinion == SLOrcacleState.PlayerOpinion.Likes)
                {
                    if (ModManager.MSC && this.myBehavior.CheckSlugpupsInRoom())
                    {
                        this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("I do enjoy the company though. You and your family are always welcome here."), 5));
                        return;
                    }
                    if (ModManager.MMF && this.myBehavior.CheckStrayCreatureInRoom() != CreatureTemplate.Type.StandardGroundCreature)
                    {
                        this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("I do enjoy the company of you and your friend though, <PlayerName>."), 5));
                        return;
                    }
                    this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("I do enjoy the company though. You're welcome to stay a while, quiet little thing."), 5));
                    return;
                }
            }
        }
        break;
    default:
        return;
    }
}