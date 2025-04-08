// Token: 0x060019D1 RID: 6609 RVA: 0x001E7C78 File Offset: 0x001E5E78
public bool SingularityProtest()
{
    if (this.dangerousSingularity == null || this.dangerousSingularity.slatedForDeletetion || this.oracle.glowers <= 0)
    {
        if (this.wasScaredBySingularity && this.oracle.glowers > 0)
        {
            if (this is SLOracleBehaviorHasMark)
            {
                if (UnityEngine.Random.value < 0.24f)
                {
                    this.dialogBox.Interrupt(this.Translate("Why would you do that!?"), 7);
                }
                else if (UnityEngine.Random.value < 0.24f)
                {
                    this.dialogBox.Interrupt(this.Translate("WHY!?"), 7);
                }
                else if (UnityEngine.Random.value < 0.24f)
                {
                    this.dialogBox.Interrupt(this.Translate("Why would you try doing that!?"), 7);
                }
                else if (UnityEngine.Random.value < 0.24f)
                {
                    this.dialogBox.Interrupt(this.Translate("What came over you!?"), 7);
                }
                else
                {
                    this.dialogBox.Interrupt(this.Translate("WHY!? Why would you do something so dangerous!?"), 7);
                }
            }
            this.holdKnees = true;
        }
        this.dangerousSingularity = null;
        this.wasScaredBySingularity = false;
        return false;
    }
    this.wasScaredBySingularity = true;
    this.protest = true;
    this.holdKnees = false;
    this.oracle.bodyChunks[0].vel += Custom.RNV() * this.oracle.health * UnityEngine.Random.value;
    this.oracle.bodyChunks[1].vel += Custom.RNV() * this.oracle.health * UnityEngine.Random.value * 2f;
    this.protestCounter += 0.045454547f;
    this.lookPoint = this.oracle.bodyChunks[0].pos + Custom.PerpendicularVector(this.oracle.bodyChunks[1].pos, this.oracle.bodyChunks[0].pos) * Mathf.Sin(this.protestCounter * 3.1415927f * 2f) * 145f;
    if (UnityEngine.Random.value < 0.033333335f)
    {
        this.armsProtest = !this.armsProtest;
    }
    return true;
}