if (this.id == Conversation.ID.Moon_Misc_Item)
{
    if (ModManager.MMF && this.myBehavior.isRepeatedDiscussion)
    {
        this.events.Add(new Conversation.TextEvent(this, 0, this.myBehavior.AlreadyDiscussedItemString(false), 10));
    }
    if (this.describeItem == SLOracleBehaviorHasMark.MiscItemType.Spear)
    {
        if (ModManager.MSC && this.currentSaveFile == MoreSlugcatsEnums.SlugcatStatsName.Saint)
        {
            this.events.Add(new Conversation.TextEvent(this, 10, this.Translate("It's a piece of sharpened rebar... What is it you want to know?<LINE>I don't wish to offend, but you seem too frail to use this effectively."), 0));
            return;
        }
        this.events.Add(new Conversation.TextEvent(this, 10, this.Translate("It's a piece of sharpened rebar... What is it you want to know?<LINE>You seem proficient enough at using it."), 0));
        return;
    }
    else
    {
        if (this.describeItem == SLOracleBehaviorHasMark.MiscItemType.FireSpear)
        {
            this.events.Add(new Conversation.TextEvent(this, 10, this.Translate("It's a weapon made with fire powder. Did the scavengers give this to you?<LINE>Be very careful if you have to use it!"), 0));
            return;
        }
        if (this.describeItem == SLOracleBehaviorHasMark.MiscItemType.Rock)
        {
            this.events.Add(new Conversation.TextEvent(this, 10, this.Translate("It's a rock. Thank you, I suppose, little creature."), 0));
            return;
        }
        if (this.describeItem == SLOracleBehaviorHasMark.MiscItemType.KarmaFlower)
        {
            base.LoadEventsFromFile(25);
            return;
        }
        if (this.describeItem == SLOracleBehaviorHasMark.MiscItemType.WaterNut)
        {
            this.events.Add(new Conversation.TextEvent(this, 10, this.Translate("It's a delicious plant. You should have it!"), 0));
            return;
        }
        if (this.describeItem == SLOracleBehaviorHasMark.MiscItemType.DangleFruit)
        {
            base.LoadEventsFromFile(26);
            return;
        }
        if (this.describeItem == SLOracleBehaviorHasMark.MiscItemType.FlareBomb)
        {
            base.LoadEventsFromFile(27);
            return;
        }
        if (this.describeItem == SLOracleBehaviorHasMark.MiscItemType.VultureMask)
        {
            base.LoadEventsFromFile(28);
            return;
        }
        if (this.describeItem == SLOracleBehaviorHasMark.MiscItemType.PuffBall)
        {
            base.LoadEventsFromFile(29);
            return;
        }
        if (this.describeItem == SLOracleBehaviorHasMark.MiscItemType.JellyFish)
        {
            base.LoadEventsFromFile(30);
            return;
        }
        if (this.describeItem == SLOracleBehaviorHasMark.MiscItemType.Lantern)
        {
            base.LoadEventsFromFile(31);
            return;
        }
        if (this.describeItem == SLOracleBehaviorHasMark.MiscItemType.Mushroom)
        {
            base.LoadEventsFromFile(32);
            return;
        }
        if (this.describeItem == SLOracleBehaviorHasMark.MiscItemType.FirecrackerPlant)
        {
            base.LoadEventsFromFile(33);
            return;
        }
        if (this.describeItem == SLOracleBehaviorHasMark.MiscItemType.SlimeMold)
        {
            base.LoadEventsFromFile(34);
            return;
        }
        if (this.describeItem == SLOracleBehaviorHasMark.MiscItemType.ScavBomb)
        {
            base.LoadEventsFromFile(44);
            return;
        }
        if (this.describeItem == SLOracleBehaviorHasMark.MiscItemType.OverseerRemains)
        {
            if (ModManager.MSC && this.myBehavior.oracle.room.game.IsMoonHeartActive())
            {
                base.LoadEventsFromFile(169);
                return;
            }
            base.LoadEventsFromFile(52);
            return;
        }
        else
        {
            if (this.describeItem == SLOracleBehaviorHasMark.MiscItemType.BubbleGrass)
            {
                base.LoadEventsFromFile(53);
                return;
            }
            if (ModManager.MSC)
            {
                if (this.describeItem == MoreSlugcatsEnums.MiscItemType.SingularityGrenade)
                {
                    base.LoadEventsFromFile(127);
                    return;
                }
                if (this.describeItem == MoreSlugcatsEnums.MiscItemType.EnergyCell)
                {
                    this.State.shownEnergyCell = true;
                    base.LoadEventsFromFile(110);
                    return;
                }
                if (this.describeItem == MoreSlugcatsEnums.MiscItemType.ElectricSpear)
                {
                    base.LoadEventsFromFile(112);
                    return;
                }
                if (this.describeItem == MoreSlugcatsEnums.MiscItemType.InspectorEye)
                {
                    base.LoadEventsFromFile(113);
                    return;
                }
                if (this.describeItem == MoreSlugcatsEnums.MiscItemType.GooieDuck)
                {
                    base.LoadEventsFromFile(114);
                    return;
                }
                if (this.describeItem == MoreSlugcatsEnums.MiscItemType.NeedleEgg)
                {
                    base.LoadEventsFromFile(116);
                    return;
                }
                if (this.describeItem == MoreSlugcatsEnums.MiscItemType.LillyPuck)
                {
                    base.LoadEventsFromFile(117);
                    return;
                }
                if (this.describeItem == MoreSlugcatsEnums.MiscItemType.GlowWeed)
                {
                    base.LoadEventsFromFile(118);
                    return;
                }
                if (this.describeItem == MoreSlugcatsEnums.MiscItemType.DandelionPeach)
                {
                    base.LoadEventsFromFile(122);
                    return;
                }
                if (this.describeItem == MoreSlugcatsEnums.MiscItemType.MoonCloak)
                {
                    base.LoadEventsFromFile(123);
                    return;
                }
                if (this.describeItem == MoreSlugcatsEnums.MiscItemType.EliteMask)
                {
                    base.LoadEventsFromFile(136);
                    return;
                }
                if (this.describeItem == MoreSlugcatsEnums.MiscItemType.KingMask)
                {
                    base.LoadEventsFromFile(137);
                    return;
                }
                if (this.describeItem == MoreSlugcatsEnums.MiscItemType.FireEgg)
                {
                    base.LoadEventsFromFile(164);
                    return;
                }
                if (this.describeItem == MoreSlugcatsEnums.MiscItemType.SpearmasterSpear)
                {
                    base.LoadEventsFromFile(166);
                    return;
                }
                if (this.describeItem == MoreSlugcatsEnums.MiscItemType.Seed)
                {
                    base.LoadEventsFromFile(167);
                    return;
                }
            }
        }
    }
}