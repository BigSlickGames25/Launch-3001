import { requestHubApi } from "./client";
import type { HubTransactionList } from "../types";

interface HubTransactionQuery {
  eMode?: string;
  eStatus?: string;
  eType?: string;
  orderBy?: "ASC" | "DESC";
  pageNumber?: number;
  search?: string;
  size?: number;
  sort?: string;
}

export const hubTransactionsApi = {
  async list(token: string, query: HubTransactionQuery = {}) {
    return requestHubApi<HubTransactionList[]>({
      method: "GET",
      path: "/transaction",
      query: query as Record<string, boolean | number | string | null | undefined>,
      token
    });
  }
};
