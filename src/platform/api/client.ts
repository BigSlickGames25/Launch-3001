import { buildApiUrl } from "../../config/runtime";
import type { HubApiEnvelope, HubApiResponse } from "../types";

type QueryValue = boolean | number | string | null | undefined;

interface RequestHubApiOptions {
  body?: unknown;
  headers?: Record<string, string>;
  method?: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
  path: string;
  query?: Record<string, QueryValue>;
  token?: string | null;
}

export class HubApiError extends Error {
  body?: unknown;
  status: number;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "HubApiError";
    this.status = status;
    this.body = body;
  }
}

function buildQueryString(query?: Record<string, QueryValue>) {
  if (!query) {
    return "";
  }

  const parts = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    );

  return parts.length ? `?${parts.join("&")}` : "";
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function extractErrorMessage(body: unknown, status: number) {
  if (
    body &&
    typeof body === "object" &&
    "message" in body &&
    typeof body.message === "string"
  ) {
    return body.message;
  }

  return `Hub API request failed with status ${status}.`;
}

export async function requestHubApi<TData = unknown>({
  body,
  headers,
  method = "GET",
  path,
  query,
  token
}: RequestHubApiOptions): Promise<HubApiResponse<TData>> {
  const response = await fetch(
    buildApiUrl(`/api/v1${normalizePath(path)}${buildQueryString(query)}`),
    {
      body:
        body === undefined || method === "GET"
          ? undefined
          : JSON.stringify(body),
      headers: {
        Accept: "application/json",
        ...(body === undefined || method === "GET"
          ? {}
          : { "Content-Type": "application/json" }),
        ...(token ? { authorization: token } : {}),
        ...(headers ?? {})
      },
      method
    }
  );

  let parsedBody: HubApiEnvelope<TData> | null = null;

  try {
    parsedBody = (await response.json()) as HubApiEnvelope<TData>;
  } catch {
    parsedBody = null;
  }

  if (!response.ok) {
    throw new HubApiError(
      extractErrorMessage(parsedBody, response.status),
      response.status,
      parsedBody
    );
  }

  return {
    body:
      parsedBody ??
      ({
        data: null,
        message: ""
      } as HubApiEnvelope<TData>),
    headers: response.headers,
    status: response.status
  };
}

export function extractAuthorizationToken(result: HubApiResponse<unknown>) {
  const headerToken =
    result.headers.get("authorization") ?? result.headers.get("Authorization");

  if (headerToken) {
    return headerToken;
  }

  const data = result.body.data;

  if (!data || typeof data !== "object") {
    return null;
  }

  if ("authorization" in data && typeof data.authorization === "string") {
    return data.authorization;
  }

  if ("sToken" in data && typeof data.sToken === "string") {
    return data.sToken;
  }

  return null;
}
