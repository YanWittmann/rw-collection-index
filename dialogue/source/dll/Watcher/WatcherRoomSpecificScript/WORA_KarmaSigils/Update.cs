// Token: 0x06004E48 RID: 20040 RVA: 0x005413AC File Offset: 0x0053F5AC
public override void Update(bool eu)
{
    base.Update(eu);
    AbstractCreature firstAlivePlayer = this.room.game.FirstAlivePlayer;
    if (firstAlivePlayer == null)
    {
        return;
    }
    if (this.player == null && this.room.game.Players.Count > 0 && firstAlivePlayer.realizedCreature != null && firstAlivePlayer.realizedCreature.room == this.room)
    {
        this.player = (firstAlivePlayer.realizedCreature as Player);
    }
    if (this.player != null && this.player.room != this.room)
    {
        this.player = null;
    }
    bool flag = this.room.abstractRoom.name.ToLowerInvariant() == "wora_ai";
    bool flag2 = this.room.abstractRoom.name.ToLowerInvariant() == "wora_throne02";
    if (this.player != null && !this.room.game.GetStorySession.saveState.miscWorldSaveData.SentientRotEndingConditionsMet && (this.room.game.GetStorySession.saveState.miscWorldSaveData.numberOfPrinceEncounters > 2 || (this.room.game.GetStorySession.saveState.miscWorldSaveData.numberOfPrinceEncounters == 0 && flag) || (this.room.game.GetStorySession.saveState.miscWorldSaveData.numberOfPrinceEncounters == 1 && this.room.game.GetStorySession.saveState.miscWorldSaveData.highestPrinceConversationSeen >= PrinceBehavior.PrinceConversation.PrinceConversationToId(WatcherEnums.ConversationID.Prince_KS_1_4)) || (this.room.game.GetStorySession.saveState.miscWorldSaveData.numberOfPrinceEncounters == 2 && this.room.game.GetStorySession.saveState.miscWorldSaveData.highestPrinceConversationSeen >= PrinceBehavior.PrinceConversation.PrinceConversationToId(WatcherEnums.ConversationID.Prince_KS_2_4))))
    {
        this.room.game.GetStorySession.saveState.miscWorldSaveData.lockedOuterRimProgressionFlag = true;
    }
    if (this.room.shortCutsReady && flag2)
    {
        int num = -1;
        if (this.room.game.GetStorySession.saveState.miscWorldSaveData.numberOfPrinceEncounters == 0)
        {
            num = 4;
        }
        else if (this.room.game.GetStorySession.saveState.miscWorldSaveData.numberOfPrinceEncounters == 1)
        {
            num = 3;
        }
        else if (this.room.game.GetStorySession.saveState.miscWorldSaveData.numberOfPrinceEncounters == 2)
        {
            num = 2;
        }
        if (num >= 0)
        {
            if (!this.room.game.GetStorySession.saveState.miscWorldSaveData.lockedOuterRimProgressionFlag)
            {
                this.room.shortcuts[num].shortCutType = ShortcutData.Type.DeadEnd;
            }
            else
            {
                this.room.shortcuts[num].shortCutType = ShortcutData.Type.RoomExit;
            }
        }
    }
    float num2 = (float)this.room.game.GetStorySession.saveState.miscWorldSaveData.numberOfPrinceEncounters;
    if (this.room.game.rainWorld.progression.miscProgressionData.beaten_Watcher_SentientRot || this.room.game.GetStorySession.saveState.miscWorldSaveData.SentientRotEndingConditionsMet)
    {
        num2 = 0f;
    }
    if (!this.updatedTrigger)
    {
        for (int i = this.room.roomSettings.triggers.Count - 1; i >= 0; i--)
        {
            if (this.room.roomSettings.triggers[i].tEvent is MusicEvent)
            {
                ActiveTriggerChecker activeTriggerChecker = null;
                for (int j = 0; j < this.room.updateList.Count; j++)
                {
                    if (this.room.updateList[j] is ActiveTriggerChecker && (this.room.updateList[j] as ActiveTriggerChecker).eventTrigger == this.room.roomSettings.triggers[i])
                    {
                        activeTriggerChecker = (this.room.updateList[j] as ActiveTriggerChecker);
                    }
                }
                if (num2 == 2f)
                {
                    (this.room.roomSettings.triggers[i].tEvent as MusicEvent).songName = "RW_122 - Speaking Systems 2";
                }
                else if (num2 >= 3f)
                {
                    (this.room.roomSettings.triggers[i].tEvent as MusicEvent).songName = "RW_123 - Speaking Systems 3";
                }
                else
                {
                    this.room.roomSettings.triggers.RemoveAt(i);
                    if (activeTriggerChecker != null)
                    {
                        this.room.RemoveObject(activeTriggerChecker);
                    }
                }
                this.updatedTrigger = true;
            }
        }
    }
    if (this.omni == null && this.player != null)
    {
        for (int k = 0; k < this.room.roomSettings.ambientSounds.Count; k++)
        {
            if (this.room.roomSettings.ambientSounds[k].type == AmbientSound.Type.Omnidirectional && this.room.roomSettings.ambientSounds[k].sample.ToLowerInvariant() == "rwtw_sigil.ogg")
            {
                this.omni = (this.room.roomSettings.ambientSounds[k] as OmniDirectionalSound);
                this.omni.volume = 0f;
                break;
            }
        }
        if (this.omni == null)
        {
            this.omni = new OmniDirectionalSound("RWTW_Sigil.ogg", false);
            this.omni.volume = 0f;
            this.room.roomSettings.ambientSounds.Add(this.omni);
        }
    }
    if (this.player != null)
    {
        Conversation.ID[] array = new Conversation.ID[0];
        Vector2[] array2 = new Vector2[0];
        if (!this.room.game.GetStorySession.saveState.miscWorldSaveData.lockedOuterRimProgressionFlag)
        {
            if (flag)
            {
                if (num2 == 1f)
                {
                    array = new Conversation.ID[]
                    {
                        WatcherEnums.ConversationID.Prince_KS_1_3,
                        WatcherEnums.ConversationID.Prince_KS_1_4
                    };
                }
                else if (num2 == 2f)
                {
                    array = new Conversation.ID[]
                    {
                        WatcherEnums.ConversationID.Prince_KS_2_3,
                        WatcherEnums.ConversationID.Prince_KS_2_4
                    };
                }
                array2 = new Vector2[]
                {
                    new Vector2(2630f, -1f),
                    new Vector2(1810f, -1f)
                };
            }
            else if (flag2)
            {
                if (num2 == 1f)
                {
                    array = new Conversation.ID[]
                    {
                        WatcherEnums.ConversationID.Prince_KS_1_1,
                        WatcherEnums.ConversationID.Prince_KS_1_2
                    };
                }
                else if (num2 == 2f)
                {
                    array = new Conversation.ID[]
                    {
                        WatcherEnums.ConversationID.Prince_KS_2_1,
                        WatcherEnums.ConversationID.Prince_KS_2_2
                    };
                }
                array2 = new Vector2[]
                {
                    new Vector2(680f, 940f),
                    new Vector2(415f, 2980f),
                    new Vector2(543f, 2980f),
                    new Vector2(790f, 2980f)
                };
            }
        }
        float num3 = -1f;
        int num4 = -1;
        for (int l = 0; l < array2.Length; l++)
        {
            float num5;
            if (array2[l].y < 0f)
            {
                num5 = Mathf.Abs(this.player.mainBodyChunk.pos.x - array2[l].x);
            }
            else
            {
                num5 = Vector2.Distance(this.player.mainBodyChunk.pos, array2[l]);
            }
            if (num3 == -1f || num5 < num3)
            {
                num3 = num5;
                if (array2[l].y < 0f)
                {
                    num4 = (int)array2[l].x;
                }
            }
        }
        if (array.Length != 0)
        {
            int num6 = -1;
            Conversation.ID id = null;
            if (flag)
            {
                for (int m = 0; m < array.Length; m++)
                {
                    if (this.player.mainBodyChunk.pos.x <= array2[m].x)
                    {
                        int num7 = PrinceBehavior.PrinceConversation.PrinceConversationToId(array[m]);
                        if (this.room.game.GetStorySession.saveState.miscWorldSaveData.highestPrinceConversationSeen < num7)
                        {
                            num6 = num7;
                            id = array[m];
                            break;
                        }
                    }
                }
            }
            else if (flag2)
            {
                for (int n = 0; n < array.Length; n++)
                {
                    if (this.player.mainBodyChunk.pos.y >= array2[n].y)
                    {
                        bool flag3 = false;
                        if (n == 0 && this.player.mainBodyChunk.pos.x >= array2[n].x && this.player.mainBodyChunk.pos.x <= 940f)
                        {
                            flag3 = true;
                        }
                        else if (n == 1 && (this.player.mainBodyChunk.pos.x <= 415f || (this.player.mainBodyChunk.pos.x >= 515f && this.player.mainBodyChunk.pos.x <= 570f) || (this.player.mainBodyChunk.pos.x >= 750f && this.player.mainBodyChunk.pos.x <= 830f)))
                        {
                            flag3 = true;
                        }
                        if (flag3)
                        {
                            int num8 = PrinceBehavior.PrinceConversation.PrinceConversationToId(array[n]);
                            if (this.room.game.GetStorySession.saveState.miscWorldSaveData.highestPrinceConversationSeen < num8)
                            {
                                num6 = num8;
                                id = array[n];
                                break;
                            }
                        }
                    }
                }
            }
            if (num6 >= 0 && this.currentConversation == null && this.room.game.GetStorySession.saveState.miscWorldSaveData.highestPrinceConversationSeen < num6)
            {
                this.currentConversation = new WatcherRoomSpecificScript.WORA_KarmaSigils.KarmaSigilConversation(id, this, this.dialogBox);
                this.room.game.GetStorySession.saveState.miscWorldSaveData.highestPrinceConversationSeen = num6;
                this.player.Stun(80);
            }
        }
        if (num2 == 1f || num2 == 2f)
        {
            this.omniTargetVolume = 0.025f + Mathf.InverseLerp(500f, 0f, num3) * 0.275f;
        }
        else
        {
            this.omniTargetVolume = 0f;
        }
        if (this.room.game.GetStorySession.saveState.miscWorldSaveData.lockedOuterRimProgressionFlag)
        {
            this.omniTargetVolume = 0f;
        }
        if (this.currentConversation != null)
        {
            if (this.spasmer == null && num4 >= 0)
            {
                this.spasmer = new PrinceSpasmer(this.player, true, num4 - 150, true, num4 + 150);
            }
            if (this.spasmer != null)
            {
                this.spasmer.Update(eu);
            }
            this.player.warpFatigueEffect = Mathf.Lerp(this.player.warpFatigueEffect, 0.35f, 0.08f);
            this.omniTargetVolume = 0.65f;
        }
        else
        {
            if (this.spasmer != null)
            {
                this.spasmer.Destroy();
                this.spasmer = null;
            }
            this.player.warpFatigueEffect = Mathf.Lerp(this.player.warpFatigueEffect, 0f, 0.16f);
            if (this.player.warpFatigueEffect < 0.02f)
            {
                this.player.warpFatigueEffect = 0f;
            }
        }
    }
    if (this.omni != null)
    {
        this.omni.volume = Mathf.Lerp(this.omni.volume, this.omniTargetVolume, 0.08f);
    }
    if (this.currentConversation != null)
    {
        this.currentConversation.Update();
        if (this.currentConversation.slatedForDeletion)
        {
            this.currentConversation = null;
        }
    }
}