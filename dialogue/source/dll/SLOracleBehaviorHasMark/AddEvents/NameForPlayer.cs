// Token: 0x060019E1 RID: 6625 RVA: 0x001E9488 File Offset: 0x001E7688
protected string NameForPlayer(bool capitalized)
{
    string text = "creature";
    bool flag = this.DamagedMode && UnityEngine.Random.value < 0.5f;
    if (UnityEngine.Random.value > 0.3f)
    {
        if (base.State.GetOpinion == SLOrcacleState.PlayerOpinion.Likes)
        {
            if (base.State.totalPearlsBrought > 5 && !this.DamagedMode)
            {
                text = "archaeologist";
            }
            else
            {
                text = "friend";
            }
        }
        else if (base.State.GetOpinion == SLOrcacleState.PlayerOpinion.Dislikes)
        {
            text = "tormentor";
        }
        else
        {
            text = "creature";
        }
    }
    if (this.oracle.room.game.rainWorld.inGameTranslator.currentLanguage == InGameTranslator.LanguageID.Portuguese && (text == "friend" || text == "creature"))
    {
        string text2 = base.Translate(text);
        if (capitalized && InGameTranslator.LanguageID.UsesCapitals(this.oracle.room.game.rainWorld.inGameTranslator.currentLanguage))
        {
            text2 = char.ToUpper(text2[0]).ToString() + text2.Substring(1);
        }
        return text2;
    }
    string str = base.Translate(text);
    string text3 = base.Translate("little");
    if (capitalized && InGameTranslator.LanguageID.UsesCapitals(this.oracle.room.game.rainWorld.inGameTranslator.currentLanguage))
    {
        text3 = char.ToUpper(text3[0]).ToString() + text3.Substring(1);
    }
    return text3 + (flag ? "... " : " ") + str;
}