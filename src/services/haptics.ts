import * as Haptics from "expo-haptics";

import type { HapticsLevel } from "../types/settings";

export type HapticCue =
  | "tap"
  | "confirm"
  | "collect"
  | "damage"
  | "pause"
  | "boost";

export async function fireHaptic(level: HapticsLevel, cue: HapticCue) {
  if (level === "off") {
    return;
  }

  try {
    switch (cue) {
      case "tap":
        await Haptics.selectionAsync();
        break;
      case "confirm":
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        break;
      case "collect":
        await Haptics.impactAsync(
          level === "full"
            ? Haptics.ImpactFeedbackStyle.Medium
            : Haptics.ImpactFeedbackStyle.Light
        );
        break;
      case "damage":
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case "pause":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "boost":
        await Haptics.impactAsync(
          level === "full"
            ? Haptics.ImpactFeedbackStyle.Heavy
            : Haptics.ImpactFeedbackStyle.Light
        );
        break;
    }
  } catch {
    // Ignore unsupported haptics hardware or blocked device states.
  }
}

