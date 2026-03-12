import { Platform } from "react-native";

export const theme = {
  colors: {
    background: "#07111f",
    backgroundAlt: "#0f1f36",
    card: "rgba(10, 20, 37, 0.84)",
    cardMuted: "rgba(20, 34, 54, 0.9)",
    border: "rgba(135, 173, 255, 0.18)",
    surface: "#f97316",
    surfacePressed: "#ea580c",
    accent: "#38bdf8",
    text: "#eff6ff",
    subtleText: "#9fb2ca",
    warning: "#fb7185",
    joystickBase: "rgba(255, 255, 255, 0.12)",
    joystickKnob: "#e2e8f0",
    player: "#38bdf8",
    orb: "#f97316",
    hazard: "#fb7185"
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 22,
    xl: 28,
    xxl: 36,
    xxxl: 52
  },
  radius: {
    md: 16,
    lg: 22,
    xl: 30
  },
  fonts: {
    display: Platform.select({
      ios: "AvenirNext-Bold",
      android: "sans-serif-condensed",
      default: "System"
    }),
    body: Platform.select({
      ios: "Avenir Next",
      android: "sans-serif",
      default: "System"
    }),
    bodyBold: Platform.select({
      ios: "AvenirNext-DemiBold",
      android: "sans-serif-medium",
      default: "System"
    }),
    label: Platform.select({
      ios: "AvenirNext-DemiBold",
      android: "sans-serif-medium",
      default: "System"
    })
  }
} as const;

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

