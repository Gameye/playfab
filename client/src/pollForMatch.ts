import { PlayFabMultiplayer } from "playfab-sdk";
import { QueueName } from "./constants";

export async function pollForMatch(ticketId: string) {
    let result = {};
    while (true) {
        const ticket = await new Promise(resolve => PlayFabMultiplayer.GetMatchmakingTicket({
            EscapeObject: false,
            TicketId: ticketId,
            QueueName,
        }, (err: any, res: any) => err ? resolve(err) : resolve(res.data))) as any;
        if (!ticket.Status) {
            break;
        }
        if (ticket.Status === "Matched" || ticket.Status === "Canceled") {
            result = { ...ticket };
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    return result as any;
}
