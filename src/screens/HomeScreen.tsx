import { Href, router } from "expo-router";
import { startTransition } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "../components/layout/ScreenContainer";
import { GameButton } from "../components/ui/GameButton";
import { runtimeConfig } from "../config/runtime";
import { useDeviceProfile } from "../hooks/useDeviceProfile";
import { coreHubCapabilities } from "../platform/catalog/products";
import { useHubSession } from "../platform/auth/session";
import { fireHaptic } from "../services/haptics";
import { useGameSettings } from "../store/game-settings";
import { clamp, theme } from "../theme";

export function HomeScreen() {
  const device = useDeviceProfile();
  const { settings } = useGameSettings();
  const { currentProduct, hasToken, profile, status } = useHubSession();
  const isWide = device.isLandscape || device.width >= 860;
  const isCompact = device.width < 390;
  const titleFontSize = Math.round(clamp(34 * device.textScale, 28, 38));
  const sessionLabel = profile?.sUserName
    ? `${profile.sUserName}${typeof profile.nChips === "number" ? ` | ${profile.nChips} chips` : ""}`
    : status === "guest"
      ? "Guest pilot profile ready"
      : hasToken
        ? "Stored hub session"
        : "No session yet";

  function goToGame() {
    void fireHaptic(settings.haptics, "confirm");
    startTransition(() => {
      router.push("/game" as Href);
    });
  }

  function goToLauncher() {
    void fireHaptic(settings.haptics, "tap");
    router.navigate("/launcher" as Href);
  }

  function goToHub() {
    void fireHaptic(settings.haptics, "tap");
    router.navigate("/hub" as Href);
  }

  function goToSettings() {
    void fireHaptic(settings.haptics, "tap");
    router.navigate("/settings" as Href);
  }

  function goToHowToPlay() {
    void fireHaptic(settings.haptics, "tap");
    router.navigate("/how-to-play" as Href);
  }

  return (
    <ScreenContainer
      scroll
      contentContainerStyle={[styles.content, isWide && styles.contentWide]}
    >
      <View style={[styles.topRow, isWide && styles.topRowWide]}>
        <View
          style={[
            styles.heroCard,
            isWide && styles.splitPanel,
            isCompact && styles.compactCard
          ]}
        >
          <Text style={styles.kicker}>Big Slick Games</Text>
          <Text
            style={[
              styles.title,
              {
                fontSize: titleFontSize,
                lineHeight: titleFontSize + 4
              }
            ]}
          >
            Launch through 30 no-save sectors.
          </Text>
          <Text style={styles.description}>
            Launch is an 80s sci-fi rocket run. Lift off from the left pad, tap
            and hold to burn upward against gravity, cut through hangars,
            tunnels, and rocks, then land softly on the right-side pad before
            the campaign resets you.
          </Text>
        </View>

        <View
          style={[
            styles.notesCard,
            isWide && styles.splitPanel,
            isCompact && styles.compactCard
          ]}
        >
          <Text style={styles.notesTitle}>Prototype Status</Text>
          <Text style={styles.notesText}>
            The current build already has generated sectors, dynamic camera
            zoom, soft-landing rules, and full-run restart stakes. Background
            plates and final sound design can layer on top of this loop next.
          </Text>
          <Text style={styles.notesMeta}>
            Active product: {currentProduct.title}
          </Text>
          <Text style={styles.notesMeta}>
            Flight mode: tap-to-thrust side-scroller
          </Text>
          <Pressable
            onPress={goToGame}
            style={({ pressed }) => [
              styles.inlineAction,
              pressed && styles.inlineActionPressed
            ]}
          >
            <Text style={styles.inlineActionText}>Start the run</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.bottomRow, isWide && styles.bottomRowWide]}>
        <View style={[styles.featureGrid, isWide && styles.bottomPanel]}>
          <FeatureChip compact={isCompact} label="Run" value="30 linked sectors" wide={isWide} />
          <FeatureChip
            compact={isCompact}
            label="Controls"
            value="Tap and hold to burn"
            wide={isWide}
          />
          <FeatureChip
            compact={isCompact}
            label="Camera"
            value="Dynamic zoom + lookahead"
            wide={isWide}
          />
          <FeatureChip
            compact={isCompact}
            label="Stakes"
            value="Crash once, back to 1"
            wide={isWide}
          />
          <FeatureChip
            compact={isCompact}
            label="Art"
            value="80s sci-fi placeholder pass"
            wide={isWide}
          />
          <FeatureChip
            compact={isCompact}
            label="Session"
            value={sessionLabel}
            wide={isWide}
          />
          <FeatureChip
            compact={isCompact}
            label="Hub"
            value={`${coreHubCapabilities.length} shared services`}
            wide={isWide}
          />
          <FeatureChip
            compact={isCompact}
            label="Backend"
            value={runtimeConfig.backendLabel}
            wide={isWide}
          />
        </View>

        <View style={[styles.buttonStack, isWide && styles.bottomPanel]}>
          <GameButton
            label="Launcher"
            onPress={goToLauncher}
            subtitle="Choose the active product identity for this build"
            tone="primary"
          />
          <GameButton
            label="Hub Console"
            onPress={goToHub}
            subtitle="Open auth, profile, wallet, and rewards routes"
          />
          <GameButton
            label="Start Launch"
            onPress={goToGame}
            subtitle="Enter the current rocket-landing prototype"
          />
          <GameButton
            label="Settings"
            onPress={goToSettings}
            subtitle={`Orientation ${settings.orientation}, haptics ${settings.haptics}`}
          />
          <GameButton
            label="Flight Guide"
            onPress={goToHowToPlay}
            subtitle="Run rules, controls, and current production direction"
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

function FeatureChip({
  compact,
  label,
  value,
  wide
}: {
  compact?: boolean;
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <View
      style={[
        styles.featureChip,
        wide && styles.featureChipWide,
        compact && styles.featureChipCompact
      ]}
    >
      <Text style={styles.featureLabel}>{label}</Text>
      <Text style={styles.featureValue}>{value}</Text>
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
    gap: theme.spacing.xl
  },
  topRow: {
    gap: theme.spacing.lg
  },
  topRowWide: {
    flexDirection: "row"
  },
  bottomRow: {
    gap: theme.spacing.lg
  },
  bottomRowWide: {
    alignItems: "flex-start",
    flexDirection: "row"
  },
  splitPanel: {
    flex: 1
  },
  bottomPanel: {
    flex: 1
  },
  heroCard: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.xl
  },
  compactCard: {
    padding: theme.spacing.lg
  },
  kicker: {
    color: theme.colors.accent,
    fontFamily: theme.fonts.label,
    fontSize: 12,
    letterSpacing: 1.6,
    textTransform: "uppercase"
  },
  title: {
    color: theme.colors.text,
    flexShrink: 1,
    fontFamily: theme.fonts.display,
    fontSize: 34,
    lineHeight: 38
  },
  description: {
    color: theme.colors.subtleText,
    flexShrink: 1,
    fontFamily: theme.fonts.body,
    fontSize: 16,
    lineHeight: 24
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md
  },
  featureChip: {
    backgroundColor: theme.colors.cardMuted,
    borderRadius: theme.radius.lg,
    gap: 6,
    minWidth: "47%",
    padding: theme.spacing.md
  },
  featureChipWide: {
    minWidth: "31%"
  },
  featureChipCompact: {
    minWidth: "100%"
  },
  featureLabel: {
    color: theme.colors.subtleText,
    fontFamily: theme.fonts.label,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  featureValue: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 15
  },
  buttonStack: {
    gap: theme.spacing.md
  },
  notesCard: {
    backgroundColor: theme.colors.cardMuted,
    borderRadius: theme.radius.xl,
    gap: theme.spacing.md,
    padding: theme.spacing.lg
  },
  notesTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 20
  },
  notesText: {
    color: theme.colors.subtleText,
    flexShrink: 1,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    lineHeight: 23
  },
  notesMeta: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 0.3
  },
  inlineAction: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  inlineActionPressed: {
    opacity: 0.8
  },
  inlineActionText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 14
  }
});
