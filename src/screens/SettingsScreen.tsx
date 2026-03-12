import { StyleSheet, Switch, Text, View } from "react-native";

import { ScreenContainer } from "../components/layout/ScreenContainer";
import { OptionGroup } from "../components/ui/OptionGroup";
import { useDeviceProfile } from "../hooks/useDeviceProfile";
import { useGameSettings } from "../store/game-settings";
import {
  GameSettings,
  HandPreference,
  HapticsLevel,
  OrientationPreference
} from "../types/settings";
import { theme } from "../theme";

const orientationOptions: { label: string; value: OrientationPreference }[] = [
  { label: "Adaptive", value: "adaptive" },
  { label: "Portrait", value: "portrait" },
  { label: "Landscape", value: "landscape" }
];

const hapticsOptions: { label: string; value: HapticsLevel }[] = [
  { label: "Off", value: "off" },
  { label: "Subtle", value: "subtle" },
  { label: "Full", value: "full" }
];

const handOptions: { label: string; value: HandPreference }[] = [
  { label: "Left", value: "left" },
  { label: "Right", value: "right" }
];

export function SettingsScreen() {
  const device = useDeviceProfile();
  const { settings, resetSettings, updateSetting } = useGameSettings();
  const isWide = device.isLandscape || device.width >= 860;
  const isCompact = device.width < 390;

  return (
    <ScreenContainer
      scroll
      contentContainerStyle={[styles.content, isWide && styles.contentWide]}
    >
      <View
        style={[
          styles.section,
          isWide && styles.sectionWide,
          isCompact && styles.sectionCompact
        ]}
      >
        <Text style={styles.sectionTitle}>Device posture</Text>
        <Text style={styles.sectionText}>
          Rotation is applied app-wide so the game shell and menus stay
          consistent with your chosen play mode.
        </Text>
        <OptionGroup
          onChange={(value) =>
            updateSetting("orientation", value as GameSettings["orientation"])
          }
          options={orientationOptions}
          selectedValue={settings.orientation}
        />
      </View>

      <View
        style={[
          styles.section,
          isWide && styles.sectionWide,
          isCompact && styles.sectionCompact
        ]}
      >
        <Text style={styles.sectionTitle}>Feedback</Text>
        <Text style={styles.sectionText}>
          Tune system haptics for menus, pickups, hits, and state changes.
        </Text>
        <OptionGroup
          onChange={(value) =>
            updateSetting("haptics", value as GameSettings["haptics"])
          }
          options={hapticsOptions}
          selectedValue={settings.haptics}
        />
      </View>

      <View
        style={[
          styles.section,
          isWide && styles.sectionWide,
          isCompact && styles.sectionCompact
        ]}
      >
        <Text style={styles.sectionTitle}>Touch layout</Text>
        <Text style={styles.sectionText}>
          Swap the joystick and action cluster for left-handed or right-handed
          play.
        </Text>
        <OptionGroup
          onChange={(value) =>
            updateSetting(
              "handPreference",
              value as GameSettings["handPreference"]
            )
          }
          options={handOptions}
          selectedValue={settings.handPreference}
        />
      </View>

      <View
        style={[
          styles.section,
          isWide && styles.sectionWide,
          isCompact && styles.sectionCompact
        ]}
      >
        <Text style={styles.sectionTitle}>Runtime options</Text>
        <SettingToggle
          label="Keep screen awake during gameplay"
          onValueChange={(value) => updateSetting("keepAwake", value)}
          value={settings.keepAwake}
        />
        <SettingToggle
          label="Show touch guide labels"
          onValueChange={(value) => updateSetting("showTouchGuide", value)}
          value={settings.showTouchGuide}
        />
        <SettingToggle
          label="Reduce motion"
          onValueChange={(value) => updateSetting("reducedMotion", value)}
          value={settings.reducedMotion}
        />
      </View>

      <View
        style={[
          styles.section,
          isWide && styles.sectionWide,
          isCompact && styles.sectionCompact
        ]}
      >
        <Text style={styles.sectionTitle}>Reset</Text>
        <Text style={styles.sectionText}>
          Restore template defaults before you branch this into a specific game.
        </Text>
        <Text onPress={resetSettings} style={styles.resetButton}>
          Reset settings
        </Text>
      </View>
    </ScreenContainer>
  );
}

function SettingToggle({
  label,
  onValueChange,
  value
}: {
  label: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        onValueChange={onValueChange}
        thumbColor={value ? theme.colors.surface : "#9CA3AF"}
        trackColor={{
          false: "#38465b",
          true: theme.colors.accent
        }}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.lg,
    marginHorizontal: "auto",
    maxWidth: 1180,
    paddingBottom: theme.spacing.xxxl + 96,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl
  },
  contentWide: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap"
  },
  section: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    width: "100%"
  },
  sectionCompact: {
    padding: theme.spacing.md
  },
  sectionWide: {
    minWidth: "48%",
    width: "48%"
  },
  sectionTitle: {
    color: theme.colors.text,
    flexShrink: 1,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 20
  },
  sectionText: {
    color: theme.colors.subtleText,
    flexShrink: 1,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    lineHeight: 22
  },
  toggleRow: {
    alignItems: "flex-start",
    backgroundColor: theme.colors.cardMuted,
    borderRadius: theme.radius.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    minWidth: 0,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md
  },
  toggleLabel: {
    color: theme.colors.text,
    flex: 1,
    flexShrink: 1,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    lineHeight: 21,
    marginRight: theme.spacing.md,
    minWidth: 0
  },
  resetButton: {
    color: theme.colors.warning,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 15
  }
});
