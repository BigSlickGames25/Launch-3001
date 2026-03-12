import { requestHubApi } from "./client";
import type {
  HubBoardPrototype,
  HubJoinBoardPayload,
  HubJoinBoardResponse,
  HubJoinPrivateBoardPayload
} from "../types";

export const hubPokerApi = {
  async createPrivateBoard(token: string, payload: HubJoinBoardPayload) {
    return requestHubApi<HubJoinBoardResponse>({
      body: payload,
      method: "POST",
      path: "/poker/private/create",
      token
    });
  },
  async joinBoard(token: string, payload: HubJoinBoardPayload) {
    return requestHubApi<HubJoinBoardResponse>({
      body: payload,
      method: "POST",
      path: "/poker/board/join",
      token
    });
  },
  async joinGuestBoard(token: string, payload: HubJoinBoardPayload) {
    return requestHubApi<HubJoinBoardResponse>({
      body: payload,
      method: "POST",
      path: "/poker/guest/board/join",
      token
    });
  },
  async joinPrivateBoard(token: string, payload: HubJoinPrivateBoardPayload) {
    return requestHubApi<HubJoinBoardResponse>({
      body: payload,
      method: "POST",
      path: "/poker/private/join",
      token
    });
  },
  async leaveBoard(token: string, isGuest = false) {
    return requestHubApi({
      method: "GET",
      path: isGuest ? "/poker/guest/board/leave" : "/poker/board/leave",
      token
    });
  },
  async listBoards(token: string) {
    return requestHubApi<HubBoardPrototype[]>({
      method: "GET",
      path: "/poker/board/list",
      token
    });
  }
};
