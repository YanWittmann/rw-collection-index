// Token: 0x06002831 RID: 10289 RVA: 0x002FFB9C File Offset: 0x002FDD9C
public void AcknowledgePlayerCamouflage()
{
    if (this.paralyzed)
    {
        return;
    }
    if (this.player.rippleLevel >= 5f)
    {
        int num = UnityEngine.Random.Range(0, 2);
        if (num == 0)
        {
            this.dialogBox.Interrupt(this.Translate("Ahh yes! The paths! How wonderous!"), 60);
            return;
        }
        if (num == 1)
        {
            this.dialogBox.Interrupt(this.Translate("How auspicious it was, our meeting..."), 60);
            return;
        }
    }
    else
    {
        int num2 = UnityEngine.Random.Range(0, 2);
        if (num2 == 0)
        {
            this.dialogBox.Interrupt(this.Translate("Marvelous!"), 60);
            return;
        }
        if (num2 == 1)
        {
            this.dialogBox.Interrupt(this.Translate("Oh, show me again!"), 60);
        }
    }
}
