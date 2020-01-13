import { PlayFabMultiplayer } from "playfab-sdk";
import { QueueName, Timeout } from "./constants";

export interface MatchMakingResult {
    TicketId: string;
}

export async function createMatchmakingTicket(userId: any, latencies: any) {
    const ticket = await new Promise((resolve) => PlayFabMultiplayer.CreateMatchmakingTicket({
        Creator: {
            Entity: userId.Entity,
            Attributes: {
                DataObject: {
                    Latencies: !!latencies ? latencies : undefined,
                },
            },
        },
        GiveUpAfterSeconds: Timeout,
        QueueName,
    }, (err: any, res: any) => err ? resolve(err) : resolve(res.data)));
    return ticket as MatchMakingResult;
}
