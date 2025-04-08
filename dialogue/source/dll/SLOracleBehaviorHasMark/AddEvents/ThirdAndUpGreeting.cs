// Token: 0x060019E7 RID: 6631 RVA: 0x001EAE28 File Offset: 0x001E9028
private void ThirdAndUpGreeting()
{
    switch (base.State.neuronsLeft)
    {
    case 0:
        break;
    case 1:
        this.dialogBox.Interrupt("...", 40);
        return;
    case 2:
        this.dialogBox.Interrupt(this.Translate("...leave..."), 20);
        return;
    case 3:
        this.dialogBox.Interrupt(this.Translate("...you."), 10);
        this.dialogBox.NewMessage(this.Translate("...leave me alone..."), 10);
        return;
    default:
        if (base.State.GetOpinion == SLOrcacleState.PlayerOpinion.Dislikes)
        {
            switch (UnityEngine.Random.Range(0, 4))
            {
            case 0:
                this.dialogBox.Interrupt(this.Translate("Here again."), 10);
                break;
            case 1:
                this.dialogBox.Interrupt(this.Translate("You."), 10);
                this.dialogBox.NewMessage(this.Translate("I wish you would stop coming here."), 10);
                break;
            case 2:
                this.dialogBox.Interrupt(this.Translate("You again."), 10);
                this.dialogBox.NewMessage(this.Translate("Please leave me alone."), 10);
                break;
            default:
                this.dialogBox.Interrupt(this.Translate("Oh, it's you, <PlayerName>."), 10);
                break;
            }
            if (ModManager.MSC && base.CheckSlugpupsInRoom())
            {
                this.dialogBox.NewMessage(this.Translate("Take your offspring with you when you go."), 10);
            }
            else if (ModManager.MMF && base.CheckStrayCreatureInRoom() != CreatureTemplate.Type.StandardGroundCreature)
            {
                this.dialogBox.NewMessage(this.Translate("Please do not bring more wildlife into my chamber."), 10);
            }
        }
        else
        {
            bool flag = base.State.GetOpinion == SLOrcacleState.PlayerOpinion.Likes;
            switch (UnityEngine.Random.Range(0, 5))
            {
            case 0:
                this.dialogBox.Interrupt(this.Translate("Hello again, <PlayerName>" + (flag ? "!" : ".")), 10);
                break;
            case 1:
                this.dialogBox.Interrupt(this.Translate("Hello, <PlayerName>" + (flag ? "!" : ".")), 10);
                this.dialogBox.NewMessage(this.Translate(flag ? "How have you been?" : "You're here again."), 10);
                break;
            case 2:
                this.dialogBox.Interrupt(this.Translate("Oh, <PlayerName>. Hello" + (flag ? "!" : ".")), 10);
                break;
            case 3:
                this.dialogBox.Interrupt(this.Translate(flag ? "It's you, <PlayerName>. Hello." : "It's you, <PlayerName>!  Hello!"), 10);
                break;
            case 4:
                this.dialogBox.Interrupt(this.Translate("Ah... <PlayerName>, you're here again" + (flag ? "!" : ".")), 10);
                break;
            default:
                this.dialogBox.Interrupt(this.Translate("Ah... <PlayerName>, you're back" + (flag ? "!" : ".")), 10);
                break;
            }
            if (ModManager.MSC && base.CheckSlugpupsInRoom())
            {
                if (flag)
                {
                    this.dialogBox.NewMessage(this.Translate("How cute, you brought your family, <PlayerName>?"), 10);
                }
                else
                {
                    this.dialogBox.NewMessage(this.Translate("Have you brought your family here?"), 10);
                }
            }
            else if (ModManager.MMF && base.CheckStrayCreatureInRoom() != CreatureTemplate.Type.StandardGroundCreature)
            {
                this.dialogBox.NewMessage(this.Translate("Is this your friend, <PlayerName>?"), 10);
            }
        }
        if (ModManager.MMF)
        {
            this.CreatureJokeDialog();
        }
        break;
    }
}