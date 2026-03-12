import { extractAuthorizationToken, requestHubApi } from "./client";
import type {
  HubForgotPasswordPayload,
  HubGuestLoginPayload,
  HubLoginPayload,
  HubRegisterPayload,
  HubResetPasswordPayload,
  HubUser
} from "../types";

export const hubAuthApi = {
  async changePassword(
    token: string,
    payload: { sNewPassword: string; sOldPassword: string }
  ) {
    return requestHubApi({
      body: payload,
      method: "POST",
      path: "/auth/change-password",
      token
    });
  },
  async forgotPassword(payload: HubForgotPasswordPayload) {
    return requestHubApi({
      body: payload,
      method: "POST",
      path: "/auth/forgot-password"
    });
  },
  async guestLogin(payload: HubGuestLoginPayload) {
    const response = await requestHubApi<HubUser>({
      body: payload,
      method: "POST",
      path: "/auth/guestLogin"
    });

    return {
      response,
      token: extractAuthorizationToken(response)
    };
  },
  async login(payload: HubLoginPayload) {
    const response = await requestHubApi<{ authorization?: string }>({
      body: payload,
      method: "POST",
      path: "/auth/login"
    });

    return {
      response,
      token: extractAuthorizationToken(response)
    };
  },
  async refreshToken(token: string) {
    const response = await requestHubApi({
      method: "POST",
      path: "/auth/token/refresh",
      token
    });

    return {
      response,
      token: extractAuthorizationToken(response)
    };
  },
  async register(payload: HubRegisterPayload) {
    return requestHubApi({
      body: payload,
      method: "POST",
      path: "/auth/register"
    });
  },
  async resetPassword(payload: HubResetPasswordPayload) {
    return requestHubApi({
      body: {
        sPassword: payload.sPassword
      },
      method: "POST",
      path: `/auth/reset-password/${payload.sToken}`
    });
  },
  async verifyForgotPasswordLink(token: string) {
    return requestHubApi({
      method: "POST",
      path: `/auth/verify-forgotpassword-maillink/${token}`
    });
  }
};
