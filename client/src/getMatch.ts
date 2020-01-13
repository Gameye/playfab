import { PlayFabMultiplayer } from "playfab-sdk";
import { QueueName } from "./constants";

export async function getMatch(matchId: string) {
    const result = await new Promise(resolve => PlayFabMultiplayer.GetMatch({
        EscapeObject: false,
        MatchId: matchId,
        QueueName,
        ReturnMemberAttributes: true,
    }, (_: any, res: any) => resolve(res.data))) as any;
    return result as any;
}
