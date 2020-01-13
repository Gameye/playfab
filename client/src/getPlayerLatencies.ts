import * as ping from "ping";
import { PlayFabMultiplayer } from "playfab-sdk";

export async function getPlayerLatencies() {
    const result = await new Promise(resolve =>
        PlayFabMultiplayer.ListQosServers({}, (err, res) => err ? resolve(err) : resolve(res.data)),
    ) as any;

    const latencies = [];
    await Promise.all(result.QosServers.map(async (server) => {
        const pingResult = await ping.promise.probe(server.ServerUrl);
        latencies.push({ region: server.Region, latency: pingResult.avg });
    }));
    return latencies.filter(item => item.latency !== "unknown");
}
