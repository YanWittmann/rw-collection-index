if (this.id == Conversation.ID.MoonRecieveSwarmer)
{
    if (this.myBehavior is SLOracleBehaviorHasMark)
    {
        if (this.State.neuronsLeft - 1 > 2 && (this.myBehavior as SLOracleBehaviorHasMark).respondToNeuronFromNoSpeakMode)
        {
            this.events.Add(new Conversation.TextEvent(this, 10, this.Translate("You... Strange thing. Now this?"), 10));
            this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("I will accept your gift..."), 10));
        }
        switch (this.State.neuronsLeft - 1)
        {
        case -1:
        case 0:
            break;
        case 1:
            this.events.Add(new Conversation.TextEvent(this, 40, "...", 10));
            this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("You!"), 10));
            this.events.Add(new Conversation.TextEvent(this, 10, this.Translate("...you...killed..."), 10));
            this.events.Add(new Conversation.TextEvent(this, 0, "...", 10));
            this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("...me"), 10));
            break;
        case 2:
            this.events.Add(new Conversation.TextEvent(this, 10, this.Translate("...thank you... better..."), 10));
            this.events.Add(new Conversation.TextEvent(this, 20, this.Translate("still, very... bad."), 10));
            break;
        case 3:
            this.events.Add(new Conversation.TextEvent(this, 20, this.Translate("Thank you... That is a little better. Thank you, creature."), 10));
            if (!(this.myBehavior as SLOracleBehaviorHasMark).respondToNeuronFromNoSpeakMode)
            {
                this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Maybe this is asking too much... But, would you bring me another one?"), 0));
            }
            break;
        default:
            if ((this.myBehavior as SLOracleBehaviorHasMark).respondToNeuronFromNoSpeakMode)
            {
                this.events.Add(new Conversation.TextEvent(this, 0, this.Translate("Thank you. I do wonder what you want."), 10));
            }
            else
            {
                if (this.State.neuronGiveConversationCounter == 0)
                {
                    Custom.Log(new string[]
                    {
                        "moon recieve first neuron. Has neurons:",
                        this.State.neuronsLeft.ToString()
                    });
                    if (this.State.neuronsLeft == 5)
                    {
                        base.LoadEventsFromFile(45);
                    }
                    else if (ModManager.MSC && (this.myBehavior.oracle.room.game.StoryCharacter == MoreSlugcatsEnums.SlugcatStatsName.Saint || this.myBehavior.oracle.room.game.StoryCharacter == MoreSlugcatsEnums.SlugcatStatsName.Rivulet))
                    {
                        base.LoadEventsFromFile(130);
                    }
                    else
                    {
                        base.LoadEventsFromFile(19);
                    }
                }
                else if (this.State.neuronGiveConversationCounter == 1)
                {
                    if (ModManager.MSC && (this.myBehavior.oracle.room.game.StoryCharacter == MoreSlugcatsEnums.SlugcatStatsName.Saint || this.myBehavior.oracle.room.game.StoryCharacter == MoreSlugcatsEnums.SlugcatStatsName.Rivulet))
                    {
                        base.LoadEventsFromFile(159);
                    }
                    else
                    {
                        this.events.Add(new Conversation.TextEvent(this, 30, this.Translate("You get these at Five Pebbles'?<LINE>Thank you so much. I'm sure he won't mind."), 10));
                        this.events.Add(new Conversation.TextEvent(this, 10, "...", 0));
                        this.events.Add(new Conversation.TextEvent(this, 10, this.Translate("Or actually I'm sure he would, but he has so many of these~<LINE>it doesn't do him any difference.<LINE>For me though, it does! Thank you, little creature!"), 0));
                    }
                }
                else
                {
                    switch (UnityEngine.Random.Range(0, 4))
                    {
                    case 0:
                        this.events.Add(new Conversation.TextEvent(this, 30, this.Translate("Thank you, again. I feel wonderful."), 10));
                        break;
                    case 1:
                        this.events.Add(new Conversation.TextEvent(this, 30, this.Translate("Thank you so very much!"), 10));
                        break;
                    case 2:
                        this.events.Add(new Conversation.TextEvent(this, 30, this.Translate("It is strange... I'm remembering myself, but also... him."), 10));
                        break;
                    default:
                        this.events.Add(new Conversation.TextEvent(this, 30, this.Translate("Thank you... Sincerely."), 10));
                        break;
                    }
                }
                SLOrcacleState state = this.State;
                int neuronGiveConversationCounter = state.neuronGiveConversationCounter;
                state.neuronGiveConversationCounter = neuronGiveConversationCounter + 1;
            }
            break;
        }
        (this.myBehavior as SLOracleBehaviorHasMark).respondToNeuronFromNoSpeakMode = false;
        return;
    }
}