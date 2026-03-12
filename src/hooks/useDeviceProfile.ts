import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { clamp } from "../theme";

export function useDeviceProfile() {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const shortSide = Math.min(width, height);
  const orientation = width > height ? "landscape" : "portrait";

  return {
    width,
    height,
    insets,
    orientation,
    isLandscape: orientation === "landscape",
    controlScale: clamp(shortSide / 390, 0.92, 1.24),
    textScale: clamp(shortSide / 390, 0.94, 1.16)
  };
}

