function normalizeUrl(
  value: string | undefined,
  allowedProtocols: readonly string[]
) {
  if (!value) {
    return null;
  }

  const candidate = value.trim();

  if (!candidate) {
    return null;
  }

  try {
    const url = new URL(candidate);

    if (!allowedProtocols.includes(url.protocol)) {
      return null;
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function getHostLabel(value: string | null) {
  if (!value) {
    return "Not configured";
  }

  try {
    return new URL(value).host;
  } catch {
    return value;
  }
}

const appEnv = process.env.EXPO_PUBLIC_APP_ENV?.trim() || "development";
const apiBaseUrl = normalizeUrl(process.env.EXPO_PUBLIC_API_BASE_URL, [
  "http:",
  "https:"
]);
const socketBaseUrl = normalizeUrl(process.env.EXPO_PUBLIC_SOCKET_BASE_URL, [
  "ws:",
  "wss:"
]);

export const runtimeConfig = {
  appEnv,
  apiBaseUrl,
  apiHostLabel: getHostLabel(apiBaseUrl),
  backendLabel: apiBaseUrl ? `${appEnv}: ${getHostLabel(apiBaseUrl)}` : "Not configured",
  socketBaseUrl
};

export function buildApiUrl(path: string) {
  if (!apiBaseUrl) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL is not configured.");
  }

  return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
