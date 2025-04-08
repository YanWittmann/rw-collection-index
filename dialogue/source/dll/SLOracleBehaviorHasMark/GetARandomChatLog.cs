// Token: 0x06004754 RID: 18260 RVA: 0x004E2E64 File Offset: 0x004E1064
public int GetARandomChatLog(bool whichPearl)
{
    List<int> list = new List<int>
    {
        0,
        1,
        2,
        3,
        4
    };
    UnityEngine.Random.State state = UnityEngine.Random.state;
    UnityEngine.Random.InitState((this.myBehavior.oracle.room.game.session as StoryGameSession).saveState.seed);
    int num = list[UnityEngine.Random.Range(0, list.Count)];
    list.Remove(num);
    int num2 = list[UnityEngine.Random.Range(0, list.Count)];
    UnityEngine.Random.state = state;
    if (whichPearl)
    {
        return 20 + num;
    }
    return 20 + num2;
}