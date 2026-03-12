import { Href, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HubNotice } from "../components/platform/HubNotice";
import { HubPanel } from "../components/platform/HubPanel";
import { ScreenContainer } from "../components/layout/ScreenContainer";
import { GameButton } from "../components/ui/GameButton";
import { runtimeConfig } from "../config/runtime";
import { useHubSession } from "../platform/auth/session";
import { formatChipCount } from "../platform/lib/format";
import { theme } from "../theme";

export function HubScreen() {
  const {
    currentProduct,
    guestDeviceId,
    logout,
    profile,
    startGuestSession,
    status
  } = useHubSession();

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      <HubPanel
        subtitle="Use this as the operator panel for shared auth, wallets, rewards, and product routing."
        title="Hub Console"
      >
        <View style={styles.heroGrid}>
          <StatBlock label="Current product" value={currentProduct.title} />
          <StatBlock label="Session" value={status} />
          <StatBlock
            label="Chip balance"
            value={formatChipCount(profile?.nChips)}
          />
          <StatBlock label="Backend" value={runtimeConfig.apiHostLabel} />
        </View>
        {status === "anonymous" ? (
          <HubNotice message="No hub session is active yet. Start with guest access or sign into a shared user account." />
        ) : null}
        {status === "guest" ? (
          <HubNotice
            message="Guest mode is connected. Profile, wallet, and rewards routes can now be tested, but wallet and rewards require a verified user account."
            tone="success"
          />
        ) : null}
        {status === "authenticated" ? (
          <HubNotice
            message="Authenticated session loaded. This build can now exercise the shared backend contract instead of using placeholder-only frontend state."
            tone="success"
          />
        ) : null}
      </HubPanel>

      <HubPanel
        subtitle="These are the reusable screens future games and apps should inherit from the template."
        title="Shared routes"
      >
        <View style={styles.actionStack}>
          <GameButton
            label="Launcher"
            onPress={() => {
              router.push("/launcher" as Href);
            }}
            subtitle="Pick the active game or app from the shared catalog"
            tone="primary"
          />
          <GameButton
            label="Auth"
            onPress={() => {
              router.push("/auth" as Href);
            }}
            subtitle="Login, register, or create a guest session"
          />
          <GameButton
            label="Profile"
            onPress={() => {
              router.push("/profile" as Href);
            }}
            subtitle="Edit the shared user record and player settings"
          />
          <GameButton
            label="Wallet"
            onPress={() => {
              router.push("/wallet" as Href);
            }}
            subtitle="Inspect chips, transactions, and shop products"
          />
          <GameButton
            label="Rewards"
            onPress={() => {
              router.push("/rewards" as Href);
            }}
            subtitle="Fetch and claim daily rewards from the shared backend"
          />
        </View>
      </HubPanel>

      <HubPanel
        subtitle="Useful session actions while wiring new games against the hub backend."
        title="Quick actions"
      >
        <View style={styles.quickRow}>
          <Pressable
            onPress={() => {
              void startGuestSession();
            }}
            style={({ pressed }) => [
              styles.quickAction,
              pressed && styles.quickActionPressed
            ]}
          >
            <Text style={styles.quickActionLabel}>Start guest session</Text>
            <Text style={styles.quickActionBody}>
              Device ID: {guestDeviceId ?? "pending"}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              void logout();
            }}
            style={({ pressed }) => [
              styles.quickAction,
              pressed && styles.quickActionPressed
            ]}
          >
            <Text style={styles.quickActionLabel}>Clear local session</Text>
            <Text style={styles.quickActionBody}>
              Remove the saved token and return the app to anonymous mode.
            </Text>
          </Pressable>
        </View>
      </HubPanel>
    </ScreenContainer>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actionStack: {
    gap: theme.spacing.md
  },
  content: {
    gap: theme.spacing.lg,
    marginHorizontal: "auto",
    maxWidth: 1180,
    paddingBottom: theme.spacing.xxxl + 96,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl
  },
  heroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md
  },
  quickAction: {
    backgroundColor: theme.colors.cardMuted,
    borderRadius: theme.radius.lg,
    flex: 1,
    gap: 6,
    minWidth: 220,
    padding: theme.spacing.md
  },
  quickActionBody: {
    color: theme.colors.subtleText,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 20
  },
  quickActionLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16
  },
  quickActionPressed: {
    opacity: 0.85
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md
  },
  stat: {
    backgroundColor: theme.colors.cardMuted,
    borderRadius: theme.radius.lg,
    gap: 6,
    minWidth: 180,
    padding: theme.spacing.md
  },
  statLabel: {
    color: theme.colors.subtleText,
    fontFamily: theme.fonts.label,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  statValue: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16
  }
});
