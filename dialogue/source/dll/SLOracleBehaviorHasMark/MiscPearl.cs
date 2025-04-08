// Token: 0x06004752 RID: 18258 RVA: 0x004E2C38 File Offset: 0x004E0E38
private void MiscPearl(bool miscPearl2)
{
    base.LoadEventsFromFile(38, true, (this.myBehavior is SLOracleBehaviorHasMark && (this.myBehavior as SLOracleBehaviorHasMark).holdingObject != null) ? (this.myBehavior as SLOracleBehaviorHasMark).holdingObject.abstractPhysicalObject.ID.RandomSeed : UnityEngine.Random.Range(0, 100000));
    SLOrcacleState state = this.State;
    int miscPearlCounter = state.miscPearlCounter;
    state.miscPearlCounter = miscPearlCounter + 1;
}