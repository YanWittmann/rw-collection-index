// Token: 0x06002960 RID: 10592 RVA: 0x0030EAD8 File Offset: 0x0030CCD8
public override void Update(bool eu)
{
    if (!base.slatedForDeletetion)
    {
        for (int i = 0; i < this.room.warpPoints.Count; i++)
        {
            CosmeticRipple ripple = this.room.warpPoints[i].ripple;
            if (ripple != null)
            {
                ripple.RemoveFromRoom();
            }
            WarpTear warpTear = this.room.warpPoints[i].warpTear;
            if (warpTear != null)
            {
                warpTear.RemoveFromRoom();
            }
            WarpPoint warpPoint = this.room.warpPoints[i];
            if (warpPoint != null)
            {
                warpPoint.RemoveFromRoom();
            }
        }
    }
    if (this.fadeOutTransition != null && this.fadeOutTransition.IsDoneFading())
    {
        this.FadeOutTransitionCompleted();
    }
    if (!this.Ascended)
    {
        this.timeSinceLastTauntLaugh++;
        if (this.SpecialData.rippleWarp && this.room.game.ActiveRippleLayer != 1 && this.room.ViewedByAnyCamera(this.pos, 0f) && UnityEngine.Random.value < 0.005f && this.timeSinceLastTauntLaugh >= 160)
        {
            this.room.PlaySound((UnityEngine.Random.value < 0.5f) ? WatcherEnums.WatcherSoundID.Spinning_Top_Laugh_S : WatcherEnums.WatcherSoundID.Spinning_Top_Laugh_L);
            this.room.AddObject(new ReverseShockwave(this.pos, 300f, UnityEngine.Random.Range(0.2f, 0.45f), UnityEngine.Random.Range(80, 120), false));
            this.timeSinceLastTauntLaugh = 0;
        }
    }
    if ((this.conversationFinished || this.Ascended) && !this.vanillaEncounterEnded)
    {
        this.MarkSpinningTopEncountered();
        if (this.justMarkedEncountered || !this.room.game.GetStorySession.saveState.deathPersistentSaveData.spinningTopEncounters.Contains(this.SpecialData.spawnIdentifier))
        {
            if (this.BedroomScene)
            {
                if (!this.Ascended)
                {
                    this.room.PlaySound(WatcherEnums.WatcherSoundID.Spinning_Top_Vanish);
                }
                this.DespawnEcho();
            }
            else if (this.BathScene)
            {
                bool flag = false;
                if (this.candlesToMonitorInBathScene == null)
                {
                    UrbanCandle.SetRoomTargetBurnRate(this.room, 2.5f);
                    this.candlesToMonitorInBathScene = new List<UrbanCandle>();
                    for (int j = 0; j < this.room.updateList.Count; j++)
                    {
                        UrbanCandle urbanCandle = this.room.updateList[j] as UrbanCandle;
                        if (urbanCandle != null)
                        {
                            this.candlesToMonitorInBathScene.Add(urbanCandle);
                        }
                    }
                    flag = true;
                }
                else
                {
                    for (int k = 0; k < this.candlesToMonitorInBathScene.Count; k++)
                    {
                        if (this.candlesToMonitorInBathScene[k].height > 0f)
                        {
                            flag = true;
                            break;
                        }
                    }
                }
                if (!flag && this.fadeOutTransition == null)
                {
                    this.fadeOutFinishedCounter = 0;
                    this.fadeOutTransition = new FadeOut(this.room, Color.black, 200f, false);
                    this.room.AddObject(this.fadeOutTransition);
                }
            }
            else
            {
                if (this.CanRaiseRippleLevel() && !this.vanillaToRippleEncounter)
                {
                    Watcher.SpinningTop.RaiseRippleLevel(this.room);
                }
                if (this.vanillaEncounter)
                {
                    this.VanillaRegionSpinningTopEncounter();
                }
                else
                {
                    this.SpawnWarpPoint();
                    this.DespawnEcho();
                    if (!this.Ascended)
                    {
                        this.room.PlaySound(WatcherEnums.WatcherSoundID.Spinning_Top_Vanish);
                    }
                }
            }
        }
    }
    base.Update(eu);
    bool flag2 = false;
    bool flag3 = false;
    if (this.room.game.Players.Count > 0 && this.room.game.Players[0].realizedCreature != null)
    {
        flag3 = (this.room.game.Players[0].realizedCreature.room == this.room);
        flag2 = this.room.game.Players[0].realizedCreature.dead;
    }
    if (!this.vanillaEncounter)
    {
        this.fadeOut = 0f;
    }
    if (this.conversationStartedButPlayerLeftCounter > 0 && !flag3 && !flag2 && this.currentConversation.events.Count > 1)
    {
        this.PauseConversation("LeaveSpinningTop" + this.InterjectionAppend());
    }
    this.conversationStartedButPlayerLeftCounter = 0;
    if (!this.conversationActive && this.currentConversation != null && this.onScreenCounter > 80 && !flag2)
    {
        this.ResumeConversation("ReturnToSpinningTop" + this.InterjectionAppend());
    }
    if (this.conversationActive && !this.conversationFinished && this.currentConversation != null && flag2)
    {
        this.PauseConversation("DieAtSpinningTop" + this.InterjectionAppend());
    }
}