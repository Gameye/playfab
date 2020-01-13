import { PlayFab, PlayFabClient } from "playfab-sdk";
import { TitleId } from "./constants";

export async function login(playerId) {
    PlayFab.settings.titleId = TitleId;
    const loginRequest = {
        TitleId,
        CustomId: `${playerId}`,
        CreateAccount: true,
        LoginTitlePlayerAccountEntity: true,
    };
    const loginResult = await new Promise((resolve) => {
        PlayFabClient.LoginWithCustomID(loginRequest, (_, { data }) => resolve(data));
    });
    return loginResult as any;
}
