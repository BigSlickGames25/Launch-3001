import { requestHubApi } from "./client";
import type {
  HubPlayerSettingsPayload,
  HubProfile,
  HubProfileUpdatePayload
} from "../types";

export const hubProfileApi = {
  async addCash(token: string, nChips: number) {
    return requestHubApi({
      body: { nChips },
      method: "POST",
      path: "/profile/addCash",
      token
    });
  },
  async deleteAccount(token: string) {
    return requestHubApi({
      method: "GET",
      path: "/profile/delete/account",
      token
    });
  },
  async getProfile(token: string) {
    return requestHubApi<HubProfile>({
      method: "GET",
      path: "/profile",
      token
    });
  },
  async logout(token: string) {
    return requestHubApi({
      method: "GET",
      path: "/profile/logout",
      token
    });
  },
  async updateProfile(token: string, payload: HubProfileUpdatePayload) {
    return requestHubApi({
      body: payload,
      method: "POST",
      path: "/profile/update",
      token
    });
  },
  async updateSettings(token: string, payload: HubPlayerSettingsPayload) {
    return requestHubApi({
      body: payload,
      method: "POST",
      path: "/profile/setting",
      token
    });
  }
};
