// Token: 0x06004F6F RID: 20335 RVA: 0x0054F9A8 File Offset: 0x0054DBA8
public static Conversation.ID TargetConversation(int highestConversationSeen, int infections)
{
    Conversation.ID result = null;
    if (highestConversationSeen < PrinceBehavior.PrinceConversation.PrinceConversationToId(WatcherEnums.ConversationID.Prince_2))
    {
        result = WatcherEnums.ConversationID.Prince_2;
    }
    else if (infections > 4 && highestConversationSeen < PrinceBehavior.PrinceConversation.PrinceConversationToId(WatcherEnums.ConversationID.Prince_3))
    {
        result = WatcherEnums.ConversationID.Prince_3;
    }
    else if (infections > 6 && highestConversationSeen < PrinceBehavior.PrinceConversation.PrinceConversationToId(WatcherEnums.ConversationID.Prince_4))
    {
        result = WatcherEnums.ConversationID.Prince_4;
    }
    else if (infections > 8 && highestConversationSeen < PrinceBehavior.PrinceConversation.PrinceConversationToId(WatcherEnums.ConversationID.Prince_5))
    {
        result = WatcherEnums.ConversationID.Prince_5;
    }
    else if (infections > 10 && highestConversationSeen < PrinceBehavior.PrinceConversation.PrinceConversationToId(WatcherEnums.ConversationID.Prince_6))
    {
        result = WatcherEnums.ConversationID.Prince_6;
    }
    else if (infections > 12 && highestConversationSeen < PrinceBehavior.PrinceConversation.PrinceConversationToId(WatcherEnums.ConversationID.Prince_7))
    {
        result = WatcherEnums.ConversationID.Prince_7;
    }
    return result;
}