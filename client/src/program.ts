import * as ping from "ping";
import { PlayFab, PlayFabAdmin, PlayFabClient, PlayFabGroups, PlayFabMultiplayer } from "playfab-sdk";

PlayFabClient.settings.developerSecretKey = process.env.PLAYFAB_SECRET;
PlayFab.settings.developerSecretKey = process.env.PLAYFAB_SECRET;

const QueueName = "matchqueue";
const Timeout = 30;
const BuildVersion = 1;
let lastTime = new Date();

main();

function measureTime(message = "Time:", previous = lastTime) {
    const currentTime = new Date();
    const delta = currentTime.getTime() - previous.getTime();
    console.log(`${delta / 1000} - ${message}`);
    lastTime = currentTime;
}

async function main() {
    const initialStart = new Date();

    const { EntityToken, PlayFabId } = await login();
    measureTime("Login");

    const latencies = await getPlayerRegion(PlayFabId);

    const { TicketId } = await createTicket(EntityToken, latencies);
    measureTime("Created ticket");

    const { MatchId, CancellationReasonString } = await pollForMatch(TicketId);
    measureTime("Tickets Matched");

    if (!!MatchId) {
        const { } = await getMatch(MatchId);
        measureTime("Got Match");

        const creator = await pollForValue(MatchId, "Creator");
        measureTime("Got Creator");

        // If i should create the server
        if (creator === TicketId) {
            await createMatchOnGameye(MatchId, "csgo-dem", ["frankfurt"], "bots", { maxRounds: 2 });
            measureTime("Started Gameye Server");
        }

        const server = await pollForGameyeServer(MatchId);
        measureTime("Got Gameye Server");
        measureTime("Finished", initialStart);
    }
}

async function login() {
    PlayFab.settings.titleId = "2D263";
    const playerId = process.argv[2] || 0;
    console.log(`Starting as player ${playerId}`);
    const loginRequest = {
        // Currently, you need to look up the correct format for this object in the API reference for LoginWithCustomID.
        TitleId: PlayFab.settings.titleId,
        CustomId: `${playerId}`,
        CreateAccount: true,
        LoginTitlePlayerAccountEntity: true,
    };

    const loginResult = await new Promise((resolve) => {
        PlayFabClient.LoginWithCustomID(loginRequest, (_, { data }) => resolve(data));
    });

    console.log(`Login: ${JSON.stringify(loginResult)}`);

    return loginResult as any;
}

async function getPlayerRegion(PlayFabId) {
    const result = await new Promise(resolve => PlayFabMultiplayer.ListQosServers({
    }, (err, res) => err ? resolve(err) : resolve(res.data))) as any;

    const latencies = [];

    await Promise.all(result.QosServers.map(async server => {
        const pingResult = await ping.promise.probe(server.ServerUrl);
        latencies.push({ region: server.Region, latency: pingResult.avg });
    }));

    console.log(`Player Region Result: ${JSON.stringify(latencies)}`);

    return latencies.filter(item => item.latency !== "unknown");
}

async function createTicket(userId: any, latencies: any) {
    const ticket = await new Promise((resolve) => PlayFabMultiplayer.CreateMatchmakingTicket({
        Creator: {
            Entity: userId.Entity,
            Attributes: {
                DataObject: {
                    Latencies: latencies,
                },
            },
        },
        GiveUpAfterSeconds: Timeout,
        QueueName,
    }, (err, res) => err ? resolve(err) : resolve(res.data)));

    return ticket as { TicketId };
}

async function pollForMatch(ticketId) {
    let result = {};
    while (true) {
        const ticket = await new Promise(resolve => PlayFabMultiplayer.GetMatchmakingTicket({
            EscapeObject: false,
            TicketId: ticketId,
            QueueName,
        }, (err, res) => err ? resolve(err) : resolve(res.data))) as any;

        if (!ticket.Status) {
            break;
        }

        if (ticket.Status === "Matched" || ticket.Status === "Canceled") {
            result = { ...ticket };
            break;
        }

        await new Promise(resolve => setTimeout(resolve, 5000));
    }
    console.log(`Ticket Result: ${JSON.stringify(result)}`);

    return result as any;
}

async function getGroupData(groupId) {
    const result = await new Promise(resolve => PlayFabClient.GetSharedGroupData({
        SharedGroupId: groupId,
    }, (_, { data }) => resolve(data))) as any;

    console.log(`Group Data Result: ${JSON.stringify(result)}`);
    return result;
}

async function createMatchOnGameye(matchKey, gameKey, locationKeys, templateKey, config) {
    const result = await new Promise(resolve => PlayFabClient.ExecuteCloudScript({
        FunctionName: "startGameyeServer",
        FunctionParameter: { matchKey, gameKey, locationKeys, templateKey, config },
        GeneratePlayStreamEvent: true,
    }, (_, { data }) => resolve(data))) as any;
}

async function pollForValue(matchId, key) {
    let i = 0;
    while (i++ < 10) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const { Data } = await getGroupData(matchId);

        if (Data[key]) {
            return Data[key].Value;
        }
    }
}

async function pollForGameyeServer(matchKey) {
    let i = 0;
    while (i++ < 10) {
        const result = await new Promise(resolve => PlayFabClient.ExecuteCloudScript({
            FunctionName: "getServerInfo",
            FunctionParameter: { matchKey },
            GeneratePlayStreamEvent: true,
        }, (_, { data }) => resolve(data))) as any;

        console.log(`Got gameserver: ${JSON.stringify(result.FunctionResult)}`);

        if (!!result.FunctionResult.server) {
            return result.FunctionResult.server;
        }
    }
}

async function getMatch(matchId) {
    const result = await new Promise(resolve => PlayFabMultiplayer.GetMatch({
        EscapeObject: false,
        MatchId: matchId,
        QueueName,
        ReturnMemberAttributes: true,
    }, (_, { data }) => resolve(data))) as any;

    console.log(`Match Result: ${JSON.stringify(result)}`);

    return result as any;
}
