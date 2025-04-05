// Token: 0x06002832 RID: 10290 RVA: 0x002FFC48 File Offset: 0x002FDE48
public void AcknowledgePlayerGift()
{
    if (!this.giftTalk && !this.paralyzed)
    {
        this.dialogBox.Interrupt(this.Translate("Oh, you have brought sundries?"), 60);
        this.dialogBox.NewMessage(this.Translate("You can leave them here if you wish, as a contribution."), 60);
        this.dialogBox.NewMessage(this.Translate("My processes will dissolve them to their base components and those components will be added to the mass."), 60);
        this.dialogBox.NewMessage(this.Translate("Nothing to waste, every bit counts!"), 60);
        this.giftTalk = true;
    }
}