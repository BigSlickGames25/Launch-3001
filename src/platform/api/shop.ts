import { requestHubApi } from "./client";
import type { HubShopItem } from "../types";

export const hubShopApi = {
  async buy(token: string, nPrice: number) {
    return requestHubApi({
      body: { nPrice },
      method: "POST",
      path: "/shop/buy",
      token
    });
  },
  async list(token: string) {
    return requestHubApi<HubShopItem[]>({
      method: "GET",
      path: "/shop",
      token
    });
  }
};
