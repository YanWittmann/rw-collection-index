// Token: 0x060019FB RID: 6651 RVA: 0x001ED4AC File Offset: 0x001EB6AC
public void CreatureJokeDialog()
{
    CreatureTemplate.Type a = base.CheckStrayCreatureInRoom();
    if (a == CreatureTemplate.Type.Vulture || a == CreatureTemplate.Type.KingVulture || a == CreatureTemplate.Type.BigEel || a == CreatureTemplate.Type.MirosBird || a == DLCSharedEnums.CreatureTemplateType.MirosVulture)
    {
        this.dialogBox.NewMessage(this.Translate("Your friend is very large, how did you fit them in here?"), 10);
        return;
    }
    if (a == CreatureTemplate.Type.Deer)
    {
        this.dialogBox.NewMessage(this.Translate("How did you bring that in here... I think it is as surprised as I am!"), 10);
        return;
    }
    if (a == CreatureTemplate.Type.DaddyLongLegs || a == CreatureTemplate.Type.BrotherLongLegs || a == DLCSharedEnums.CreatureTemplateType.TerrorLongLegs)
    {
        this.dialogBox.NewMessage(this.Translate("Oh no."), 10);
        return;
    }
    if (a == CreatureTemplate.Type.RedCentipede)
    {
        this.dialogBox.NewMessage(this.Translate("Oh, that is not a friend..."), 10);
        return;
    }
    if (a == CreatureTemplate.Type.TempleGuard)
    {
        this.dialogBox.NewMessage(this.Translate("What did you do!?"), 10);
    }
}