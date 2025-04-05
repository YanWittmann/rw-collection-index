// Token: 0x06002830 RID: 10288 RVA: 0x002FFAB4 File Offset: 0x002FDCB4
public void TalkToDeadPlayer()
{
    if (!this.deadTalk && this.prince.room.ViewedByAnyCamera(this.prince.firstChunk.pos, 0f) && !this.paralyzed)
    {
        if (this.timeSincePlayerGrabbedByTentacles < 200)
        {
            int num = UnityEngine.Random.Range(0, 2);
            if (num == 0)
            {
                this.dialogBox.Interrupt(this.Translate("How I have wished for this day. My dear friend, welcome."), 60);
            }
            else if (num == 1)
            {
                this.dialogBox.Interrupt(this.Translate("Delight! For you will be exalted in this new kingdom!"), 60);
            }
        }
        else
        {
            int num2 = UnityEngine.Random.Range(0, 2);
            if (num2 == 0)
            {
                this.dialogBox.Interrupt(this.Translate("Oh such enthusiasm! I am honored!"), 60);
            }
            else if (num2 == 1)
            {
                this.dialogBox.Interrupt(this.Translate("Never again will you be alone."), 60);
            }
        }
        this.deadTalk = true;
    }
}