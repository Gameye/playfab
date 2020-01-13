import * as ping from "ping";
import { PlayFabMultiplayer } from "playfab-sdk";

export interface Latency {
    latency: number;
    region: string;
}

export async function getPlayerLatencies() {
    const result = await new Promise(resolve =>
        PlayFabMultiplayer.ListQosServers({}, (err: any, res: any) => err ? resolve(err) : resolve(res.data)),
    ) as any;

    const latencies: Latency[] = [];
    await Promise.all(result.QosServers.map(async (server: any) => {
        const pingResult = await ping.promise.probe(server.ServerUrl);
        if (pingResult.avg !== "unknown") {
            latencies.push({ region: server.Region, latency: parseFloat(pingResult.avg) });
        }
    }));
    return latencies;
}
