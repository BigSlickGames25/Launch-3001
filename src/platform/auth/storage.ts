import AsyncStorage from "@react-native-async-storage/async-storage";

import { defaultHubProduct, getHubProduct } from "../catalog/products";

const SESSION_STORAGE_KEY = "mobile-game-template/hub-session";
const GUEST_DEVICE_ID_STORAGE_KEY = "mobile-game-template/hub-guest-device-id";

interface PersistedHubSession {
  currentProductId: string;
  token: string | null;
}

export async function clearPersistedHubSession() {
  await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
}

export async function getOrCreateGuestDeviceId() {
  const existing = await AsyncStorage.getItem(GUEST_DEVICE_ID_STORAGE_KEY);

  if (existing) {
    return existing;
  }

  const generated = `guest-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;

  await AsyncStorage.setItem(GUEST_DEVICE_ID_STORAGE_KEY, generated);

  return generated;
}

export async function loadPersistedHubSession(): Promise<PersistedHubSession> {
  const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);

  if (!raw) {
    return {
      currentProductId: defaultHubProduct.id,
      token: null
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedHubSession>;

    return {
      currentProductId: getHubProduct(parsed.currentProductId).id,
      token: typeof parsed.token === "string" ? parsed.token : null
    };
  } catch {
    return {
      currentProductId: defaultHubProduct.id,
      token: null
    };
  }
}

export async function savePersistedHubSession(session: PersistedHubSession) {
  await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}
