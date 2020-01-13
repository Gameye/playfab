import { PlayFabClient } from "playfab-sdk";

export async function createMatchOnGameye(matchKey, gameKey, locationKeys, templateKey, config) {
    const result = await new Promise(resolve => PlayFabClient.ExecuteCloudScript({
        FunctionName: "startGameyeServer",
        FunctionParameter: { matchKey, gameKey, locationKeys, templateKey, config },
        GeneratePlayStreamEvent: true,
    }, (_, { data }) => resolve(data))) as any;
    return result;
}

export async function pollForGameyeServer(matchKey) {
    let i = 0;
    while (i++ < 10) {
        const result = await new Promise(resolve => PlayFabClient.ExecuteCloudScript({
            FunctionName: "getServerInfo",
            FunctionParameter: { matchKey },
            GeneratePlayStreamEvent: true,
        }, (_, { data }) => resolve(data))) as any;

        if (!!result.FunctionResult.server) {
            return result.FunctionResult.server;
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}
