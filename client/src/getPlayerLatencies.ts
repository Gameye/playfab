import * as dgram from "dgram";
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

        const socket = dgram.createSocket("udp4");

        const now = new Date().getTime();
        const buffer = Buffer.alloc(8);
        buffer.writeUInt8(0xff, 0);
        buffer.writeUInt8(0xff, 1);
        buffer.writeIntLE(now, 2, 6);

        const waiter = new Promise(resolve => socket.on("message", (msg, _) => {
            const returned = msg.readIntLE(2, 6);
            const delta = new Date().getTime() - returned;
            resolve(delta);
        }));

        // This is from Playfab's example code
        socket.send(new Uint8Array(buffer), 3075, server.ServerUrl);

        const latency = await Promise.race([
            waiter,
            new Promise(resolve => setTimeout(resolve, 3000)),
        ]) as number | undefined;

        if (!!latency) {
            latencies.push({ region: server.Region, latency });
        } else {
            // tslint:disable-next-line: no-console
            console.error(`${server.ServerUrl} failed to respond in the timeout`);
        }

        socket.close();
    }));
    return latencies;
}
