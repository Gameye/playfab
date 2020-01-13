import { PlayFabMultiplayer } from "playfab-sdk";
import { QueueName } from "./constants";

export async function getMatch(matchId) {
    const result = await new Promise(resolve => PlayFabMultiplayer.GetMatch({
        EscapeObject: false,
        MatchId: matchId,
        QueueName,
        ReturnMemberAttributes: true,
    }, (_, { data }) => resolve(data))) as any;
    return result as any;
}
