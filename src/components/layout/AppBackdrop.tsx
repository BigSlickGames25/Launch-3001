import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

import { theme } from "../../theme";

export function AppBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[
          theme.colors.background,
          theme.colors.backgroundAlt,
          theme.colors.background
        ]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.orbA} />
      <View style={styles.orbB} />
    </View>
  );
}

const styles = StyleSheet.create({
  orbA: {
    backgroundColor: "rgba(56, 189, 248, 0.16)",
    borderRadius: 220,
    height: 220,
    left: -40,
    position: "absolute",
    top: 48,
    width: 220
  },
  orbB: {
    backgroundColor: "rgba(249, 115, 22, 0.14)",
    borderRadius: 260,
    bottom: 40,
    height: 260,
    position: "absolute",
    right: -60,
    width: 260
  }
});

