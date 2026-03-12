export type OrientationPreference = "adaptive" | "portrait" | "landscape";
export type HapticsLevel = "off" | "subtle" | "full";
export type HandPreference = "left" | "right";

export interface GameSettings {
  orientation: OrientationPreference;
  haptics: HapticsLevel;
  handPreference: HandPreference;
  keepAwake: boolean;
  showTouchGuide: boolean;
  reducedMotion: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
  orientation: "adaptive",
  haptics: "full",
  handPreference: "right",
  keepAwake: true,
  showTouchGuide: true,
  reducedMotion: false
};

