import { StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "../components/layout/ScreenContainer";
import { useDeviceProfile } from "../hooks/useDeviceProfile";
import { theme } from "../theme";

export function HowToPlayScreen() {
  const device = useDeviceProfile();
  const isWide = device.isLandscape || device.width >= 860;
  const isCompact = device.width < 390;

  return (
    <ScreenContainer
      scroll
      contentContainerStyle={[styles.content, isWide && styles.contentWide]}
    >
      <InfoCard
        body="Each sector starts on a left launch pad. The rocket auto-drifts right, gravity keeps pulling down, and your job is to manage altitude until you reach the landing pad on the far side."
        compact={isCompact}
        title="Flight Loop"
        wide={isWide}
      />
      <InfoCard
        body="Tap and hold anywhere on the playfield to burn upward. The rocket will tilt with its momentum, so you read climb and descent from the sprite itself."
        compact={isCompact}
        title="Controls"
        wide={isWide}
      />
      <InfoCard
        body="Pads only count if the touchdown is soft. Clip a wall, hit a rock, miss the pad, or land too hard and the entire campaign restarts from Sector 1."
        compact={isCompact}
        title="No Saves"
        wide={isWide}
      />
      <InfoCard
        body="The camera zooms and looks ahead as danger builds. Tight tunnels and landing approaches pull the frame wider so you can read more of the sector."
        compact={isCompact}
        title="Camera"
        wide={isWide}
      />
      <InfoCard
        body="Current presentation is a placeholder neon pass aimed at 80s sci-fi. Background plates, parallax art, sound, and stronger pad/obstacle identities are the next production layer."
        compact={isCompact}
        title="Art Direction"
        wide={isWide}
      />
      <InfoCard
        body="The shell still keeps safe areas, orientation handling, settings, haptics, and the shared hub routes intact. Gameplay now lives in src/game and can keep evolving without rebuilding the app frame."
        compact={isCompact}
        title="Shell"
        wide={isWide}
      />
    </ScreenContainer>
  );
}

function InfoCard({
  body,
  compact,
  title,
  wide
}: {
  body: string;
  compact?: boolean;
  title: string;
  wide?: boolean;
}) {
  return (
    <View
      style={[
        styles.card,
        wide && styles.cardWide,
        compact && styles.cardCompact
      ]}
    >
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.lg,
    marginHorizontal: "auto",
    maxWidth: 1180,
    paddingBottom: theme.spacing.xxxl + 96,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl
  },
  contentWide: {
    alignItems: "flex-start"
  },
  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    width: "100%"
  },
  cardCompact: {
    padding: theme.spacing.md
  },
  cardWide: {
    minWidth: "48%",
    width: "48%"
  },
  cardTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 20
  },
  cardBody: {
    color: theme.colors.subtleText,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    lineHeight: 22
  }
});
