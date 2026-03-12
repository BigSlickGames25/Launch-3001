import { requestHubApi } from "./client";
import type { HubAnalyticsPayload } from "../types";

export const hubAnalyticsApi = {
  async track(token: string, payload: HubAnalyticsPayload) {
    return requestHubApi({
      method: "GET",
      path: "/analytics",
      query: payload as Record<string, boolean | number | string | null | undefined>,
      token
    });
  }
};
