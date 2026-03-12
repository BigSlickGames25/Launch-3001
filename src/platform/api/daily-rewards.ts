import { requestHubApi } from "./client";
import type { HubDailyRewardsState } from "../types";

export const hubDailyRewardsApi = {
  async claim(token: string) {
    return requestHubApi({
      method: "POST",
      path: "/daily_rewards/claim",
      token
    });
  },
  async get(token: string) {
    return requestHubApi<HubDailyRewardsState>({
      method: "GET",
      path: "/daily_rewards",
      token
    });
  }
};
