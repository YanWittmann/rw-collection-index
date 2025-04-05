// Token: 0x0600284B RID: 10315 RVA: 0x00300980 File Offset: 0x002FEB80
public override void HitByWeapon(Weapon weapon)
{
    base.HitByWeapon(weapon);
    this.behavior.Pain();
}

// Token: 0x06002833 RID: 10291 RVA: 0x002FFCCC File Offset: 0x002FDECC
public virtual void Pain()
{
    if (this.painCooldown > 0 || this.paralyzed)
    {
        return;
    }
    int num = UnityEngine.Random.Range(0, 4);
    if (num == 0)
    {
        this.dialogBox.Interrupt(this.Translate("Ah! So spirited!"), 60);
    }
    else if (num == 1)
    {
        this.dialogBox.Interrupt(this.Translate("So vital! Hah ha!"), 60);
    }
    else if (num == 2)
    {
        this.dialogBox.Interrupt(this.Translate("It is a joy to see you play!"), 60);
    }
    else if (num == 3)
    {
        this.dialogBox.Interrupt(this.Translate("Forgive me if I cannot respond in kind. This body is so limited..."), 60);
    }
    this.painCooldown = 400;
}