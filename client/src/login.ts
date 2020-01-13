import { PlayFabClient } from "playfab-sdk";
import { TitleId } from "./constants";

export interface LoginResult {
    EntityToken: {
        Entity: any;
    };
}

export async function login(playerId: string) {
    const loginRequest = {
        TitleId,
        CustomId: `${playerId}`,
        CreateAccount: true,
        LoginTitlePlayerAccountEntity: true,
    };
    const loginResult = await new Promise((resolve) => {
        PlayFabClient.LoginWithCustomID(loginRequest, (_: any, res: any) => resolve(res.data));
    });

    return loginResult as LoginResult;
}
