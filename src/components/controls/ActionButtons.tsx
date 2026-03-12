import { Pressable, StyleSheet, Text, View } from "react-native";

import type { HandPreference } from "../../types/settings";
import { theme } from "../../theme";

export function ActionButtons({
  boostActive,
  handPreference,
  onBoostChange,
  onPulse,
  showGuide,
  size
}: {
  boostActive: boolean;
  handPreference: HandPreference;
  onBoostChange: (value: boolean) => void;
  onPulse: () => void;
  showGuide?: boolean;
  size: number;
}) {
  return (
    <View
      style={[
        styles.wrapper,
        handPreference === "left" ? styles.leftAligned : styles.rightAligned
      ]}
    >
      <Pressable
        onPress={onPulse}
        style={({ pressed }) => [
          styles.pulseButton,
          {
            borderRadius: size / 2,
            height: size,
            width: size
          },
          pressed && styles.pulseButtonPressed
        ]}
      >
        <Text style={styles.primaryLabel}>Pulse</Text>
      </Pressable>
      <Pressable
        onPressIn={() => onBoostChange(true)}
        onPressOut={() => onBoostChange(false)}
        style={({ pressed }) => [
          styles.boostButton,
          boostActive && styles.boostButtonActive,
          pressed && styles.boostButtonPressed
        ]}
      >
        <Text style={styles.secondaryLabel}>Boost</Text>
      </Pressable>
      {showGuide ? <Text style={styles.caption}>Combat + mobility</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.sm
  },
  leftAligned: {
    alignItems: "flex-start"
  },
  rightAligned: {
    alignItems: "flex-end"
  },
  pulseButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    justifyContent: "center"
  },
  pulseButtonPressed: {
    backgroundColor: theme.colors.surfacePressed
  },
  primaryLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 17
  },
  boostButton: {
    alignItems: "center",
    backgroundColor: theme.colors.cardMuted,
    borderRadius: 999,
    justifyContent: "center",
    minWidth: 112,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md
  },
  boostButtonActive: {
    borderColor: theme.colors.accent,
    borderWidth: 1
  },
  boostButtonPressed: {
    opacity: 0.86
  },
  secondaryLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 15
  },
  caption: {
    color: theme.colors.subtleText,
    fontFamily: theme.fonts.label,
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: "uppercase"
  }
});

