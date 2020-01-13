import { PlayFabMultiplayer } from "playfab-sdk";
import { QueueName, Timeout } from "./constants";

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
    }, (err, res) => err ? resolve(err) : resolve(res.data)));
    return ticket as {
        TicketId;
    };
}
