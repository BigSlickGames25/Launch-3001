import * as ScreenOrientation from "expo-screen-orientation";

import type { OrientationPreference } from "../types/settings";

const ORIENTATION_LOCKS: Record<
  OrientationPreference,
  ScreenOrientation.OrientationLock
> = {
  adaptive: ScreenOrientation.OrientationLock.DEFAULT,
  portrait: ScreenOrientation.OrientationLock.PORTRAIT_UP,
  landscape: ScreenOrientation.OrientationLock.LANDSCAPE
};

export async function applyOrientationPreference(
  preference: OrientationPreference
) {
  try {
    await ScreenOrientation.lockAsync(ORIENTATION_LOCKS[preference]);
  } catch {
    // Ignore unsupported orientation transitions on simulators or web.
  }
}

