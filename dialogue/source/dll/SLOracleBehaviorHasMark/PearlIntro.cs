// Token: 0x06004751 RID: 18257 RVA: 0x004E27F4 File Offset: 0x004E09F4
private void PearlIntro()
{
    if (this.myBehavior.isRepeatedDiscussion)
    {
        this.events.Add(new Conversation.TextEvent(this, 0, this.myBehavior.AlreadyDiscussedItemString(true), 10));
        return;
    }
    if (this.myBehavior.oracle.ID != Oracle.OracleID.SS)
    {
        switch (this.State.totalPearlsBrought + this.State.miscPearlCounter)
        {
        case 0:
            this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Ah, you would like me to read this?"), 10));
            this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("It's a bit dusty, but I will do my best. Hold on..."), 10));
            return;
        case 1:
            this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Another pearl! You want me to read this one too? Just a moment..."), 10));
            return;
        case 2:
            this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("And yet another one! I will read it to you."), 10));
            return;
        case 3:
            if (ModManager.MSC && this.myBehavior.oracle.ID == MoreSlugcatsEnums.OracleID.DM)
            {
                this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Another? Let us see... to be honest, I'm as curious to see it as you are."), 10));
                return;
            }
            this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Another? You're no better than the scavengers!"), 10));
            if (this.State.GetOpinion == SLOrcacleState.PlayerOpinion.Likes)
            {
                this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Let us see... to be honest, I'm as curious to see it as you are."), 10));
                return;
            }
            break;
        default:
            switch (UnityEngine.Random.Range(0, 5))
            {
            case 0:
                break;
            case 1:
                if (ModManager.MSC && this.myBehavior.oracle.ID == MoreSlugcatsEnums.OracleID.DM)
                {
                    this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Oh? What have you found this time? Let's see what it says..."), 10));
                    return;
                }
                this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("The scavengers must be jealous of you, finding all these"), 10));
                return;
            case 2:
                this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Here we go again, little archeologist. Let's read your pearl."), 10));
                return;
            case 3:
                this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("... You're getting quite good at this you know. A little archeologist beast.<LINE>Now, let's see what it says."), 10));
                return;
            default:
                this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("And yet another one! I will read it to you."), 10));
                return;
            }
            break;
        }
    }
    else
    {
        switch (this.State.totalPearlsBrought + this.State.miscPearlCounter)
        {
        case 0:
            this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Ah, you have found me something to read?"), 10));
            return;
        case 1:
            this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Have you found something else for me to read?"), 10));
            this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Let us take a look."), 10));
            return;
        case 2:
            this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("I am surprised you have found so many of these."), 10));
            return;
        case 3:
            this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Where do you find all of these?"), 10));
            this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("I wonder, just how much time has passed since some of these were written."), 10));
            return;
        default:
            switch (UnityEngine.Random.Range(0, 5))
            {
            case 0:
                this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Let us see what you have found."), 10));
                return;
            case 1:
                this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Ah. Have you found something new?"), 10));
                return;
            case 2:
                this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("What is this?"), 10));
                return;
            case 3:
                this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Is that something new? Allow me to see."), 10));
                return;
            default:
                this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Let us see if there is anything important written on this."), 10));
                break;
            }
            break;
        }
    }
}