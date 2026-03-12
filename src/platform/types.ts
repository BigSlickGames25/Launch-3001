export type HubUserType = "user" | "admin" | "bot" | "guest";
export type HubProductKind = "game" | "app";

export interface HubApiEnvelope<TData = unknown> {
  data: TData;
  message: string;
}

export interface HubApiResponse<TData = unknown> {
  body: HubApiEnvelope<TData>;
  headers: Headers;
  status: number;
}

export interface HubRegisterPayload {
  sEmail: string;
  sPassword: string;
  sUserName: string;
}

export interface HubLoginPayload {
  sEmail: string;
  sPassword: string;
}

export interface HubForgotPasswordPayload {
  sEmail: string;
}

export interface HubResetPasswordPayload {
  sPassword: string;
  sToken: string;
}

export interface HubGuestLoginPayload {
  sDeviceId: string;
  sPushToken?: string;
}

export interface HubProfileUpdatePayload {
  sAvatar?: string;
  sUserName?: string;
}

export interface HubPlayerSettingsPayload {
  bMusicEnabled?: boolean;
  bSoundEnabled?: boolean;
  bVibrationEnabled?: boolean;
}

export interface HubUser {
  _id?: string;
  aPokerBoard?: string[];
  bMusicEnabled?: boolean;
  bSoundEnabled?: boolean;
  bVibrationEnabled?: boolean;
  dLastRewardClaimDate?: string | null;
  eStatus?: "y" | "n" | "d";
  eUserType: HubUserType;
  nChips?: number;
  nDailyRewardStreak?: number;
  nGameLost?: number;
  nGamePlayed?: number;
  nGameWon?: number;
  sAvatar?: string;
  sDeviceId?: string;
  sEmail?: string;
  sPrivateCode?: string;
  sRootSocket?: string;
  sToken?: string;
  sUserName?: string;
}

export interface HubAvatarCatalog {
  aAvatar?: string[];
}

export interface HubProfile extends HubUser {
  aAvatar?: HubAvatarCatalog | null;
}

export interface HubTransaction {
  _id?: string;
  dCreatedDate?: string;
  eMode?: "admin" | "user" | "game" | "IAP" | "DR" | "manual" | "square";
  eStatus?: "Pending" | "Success" | "Failed";
  eType?: "debit" | "credit" | "failed";
  nAmount?: number;
  sDescription?: string;
  sSquareTransactionId?: string;
}

export interface HubTransactionList {
  count: Array<{ totalData: number }>;
  transactions: HubTransaction[];
}

export interface HubShopItem {
  [key: string]: unknown;
  nChips?: number;
  nPrice?: number;
}

export interface HubDailyRewardsState {
  bTodayRewardClaimed: boolean;
  eligibleDay: number;
  rewards: number[];
}

export interface HubAnalyticsPayload {
  nInAppTime?: number;
  nInGameTime?: number;
}

export interface HubBoardPrototype {
  _id: string;
  nMaxPlayer: number;
  nMinBet: number;
  nMinBuyIn: number;
  sName: string;
}

export interface HubJoinBoardPayload {
  iProtoId: string;
}

export interface HubJoinPrivateBoardPayload {
  sPrivateCode: string;
}

export interface HubJoinBoardResponse {
  [key: string]: unknown;
  bGameIsFinished?: boolean;
  eBoardType?: string;
  eState?: string;
  iBoardId?: string;
  messages?: string;
  nChips?: number;
  nTotalParticipant?: number;
  sPrivateCode?: string;
}

export interface HubProduct {
  capabilities: string[];
  description: string;
  id: string;
  kind: HubProductKind;
  slug: string;
  title: string;
}
