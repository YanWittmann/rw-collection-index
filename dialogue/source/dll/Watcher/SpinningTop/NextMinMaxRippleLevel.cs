// Token: 0x06002968 RID: 10600 RVA: 0x0030F53C File Offset: 0x0030D73C
public static Vector2 NextMinMaxRippleLevel(Room room)
{
    float num;
    float x;
    if ((room.game.session as StoryGameSession).saveState.deathPersistentSaveData.maximumRippleLevel == 0f)
    {
        num = 0.25f;
        x = num;
    }
    else if ((room.game.session as StoryGameSession).saveState.deathPersistentSaveData.rippleLevel == 0.25f)
    {
        num = 0.5f;
        x = num;
    }
    else if ((room.game.session as StoryGameSession).saveState.deathPersistentSaveData.rippleLevel == 0.5f)
    {
        num = 1f;
        x = num;
    }
    else
    {
        num = Mathf.Min(5f, (room.game.session as StoryGameSession).saveState.deathPersistentSaveData.maximumRippleLevel + 0.5f);
        if ((room.game.session as StoryGameSession).saveState.deathPersistentSaveData.maximumRippleLevel >= 5f)
        {
            x = Mathf.Min(5f, (room.game.session as StoryGameSession).saveState.deathPersistentSaveData.minimumRippleLevel + 0.5f);
        }
        else
        {
            x = Mathf.Max(1f, num - 2f);
        }
    }
    return new Vector2(x, num);
}

// Token: 0x06002966 RID: 10598 RVA: 0x0030F3FC File Offset: 0x0030D5FC
public bool CanRaiseRippleLevel()
{
    return !this.Ascended && this.room.world.name.ToLowerInvariant() != "waua" && !Region.IsSentientRotRegion(this.room.world.name) && !this.SpecialData.rippleWarp;
}

// Token: 0x06002967 RID: 10599 RVA: 0x0030F45C File Offset: 0x0030D65C
public static void RaiseRippleLevel(Room room)
{
    Vector2 vector = Watcher.SpinningTop.NextMinMaxRippleLevel(room);
    (room.game.session as StoryGameSession).saveState.deathPersistentSaveData.minimumRippleLevel = vector.x;
    (room.game.session as StoryGameSession).saveState.deathPersistentSaveData.maximumRippleLevel = vector.y;
    (room.game.session as StoryGameSession).saveState.deathPersistentSaveData.rippleLevel = vector.y;
    room.game.cameras[0].hud.karmaMeter.UpdateGraphic();
    room.game.cameras[0].hud.karmaMeter.forceVisibleCounter = Mathf.Max(room.game.cameras[0].hud.karmaMeter.forceVisibleCounter, 120);
}