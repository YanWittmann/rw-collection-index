// Token: 0x06002962 RID: 10594 RVA: 0x0030F17C File Offset: 0x0030D37C
public void PauseConversation(string s)
{
    int extraLinger = 10;
    if (!this.room.game.rainWorld.inGameTranslator.TryTranslate(s, out s))
    {
        s = "...";
        extraLinger = 0;
    }
    this.currentConversation.Interrupt(s, extraLinger);
    this.conversationActive = false;
    this.onScreenCounter = 0;
}