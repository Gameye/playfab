import { PlayFabClient } from "playfab-sdk";

async function getGroupData(groupId) {
    const result = await new Promise(resolve => PlayFabClient.GetSharedGroupData({
        SharedGroupId: groupId,
    }, (_, { data }) => resolve(data))) as any;

    return result;
}

export async function pollForGroupData(matchId, key) {
    let i = 0;
    while (i++ < 10) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const { Data } = await getGroupData(matchId);

        if (Data[key]) {
            return Data[key].Value;
        }
    }
}
