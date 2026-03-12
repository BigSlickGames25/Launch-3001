import { Href, router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { HubAccessGate } from "../components/platform/HubAccessGate";
import { HubNotice } from "../components/platform/HubNotice";
import { HubPanel } from "../components/platform/HubPanel";
import { HubTextField } from "../components/platform/HubTextField";
import { ScreenContainer } from "../components/layout/ScreenContainer";
import { GameButton } from "../components/ui/GameButton";
import { useHubSession } from "../platform/auth/session";
import { formatChipCount, getErrorMessage } from "../platform/lib/format";
import { theme } from "../theme";

export function ProfileScreen() {
  const {
    logout,
    profile,
    refreshProfile,
    status,
    token,
    updatePlayerSettings,
    updateProfile
  } = useHubSession();
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    setUsername(profile?.sUserName ?? "");
    setAvatar(profile?.sAvatar ?? "");
    setMusicEnabled(profile?.bMusicEnabled ?? true);
    setSoundEnabled(profile?.bSoundEnabled ?? true);
    setVibrationEnabled(profile?.bVibrationEnabled ?? true);
  }, [profile]);

  if (!token) {
    return (
      <ScreenContainer contentContainerStyle={styles.centered}>
        <HubAccessGate message="Sign in or create a guest session before opening the shared profile screen." />
      </ScreenContainer>
    );
  }

  async function handleProfileSave() {
    setError(null);
    setSuccess(null);
    setIsSavingProfile(true);

    try {
      await updateProfile({
        sAvatar: avatar.trim() || undefined,
        sUserName: username.trim() || undefined
      });
      setSuccess("Profile updated.");
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleSettingsSave() {
    setError(null);
    setSuccess(null);
    setIsSavingSettings(true);

    try {
      await updatePlayerSettings({
        bMusicEnabled: musicEnabled,
        bSoundEnabled: soundEnabled,
        bVibrationEnabled: vibrationEnabled
      });
      setSuccess("Player settings synced.");
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsSavingSettings(false);
    }
  }

  const isGuest = status === "guest";

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      <HubPanel
        subtitle="This screen maps onto `/api/v1/profile` from the shared backend."
        title="Profile"
      >
        <View style={styles.identityGrid}>
          <IdentityCard label="User type" value={profile?.eUserType ?? "unknown"} />
          <IdentityCard label="Username" value={profile?.sUserName ?? "unset"} />
          <IdentityCard label="Email" value={profile?.sEmail ?? "guest"} />
          <IdentityCard
            label="Chip balance"
            value={formatChipCount(profile?.nChips)}
          />
        </View>
        {isGuest ? (
          <HubNotice message="Guest sessions can load profile state, but profile updates, wallet actions, and daily rewards require a verified user account." />
        ) : null}
        {error ? <HubNotice message={error} tone="error" /> : null}
        {success ? <HubNotice message={success} tone="success" /> : null}
      </HubPanel>

      <HubPanel
        subtitle="Shared editable fields for every game/app profile."
        title="Public identity"
      >
        <HubTextField
          autoCapitalize="none"
          label="Username"
          onChangeText={setUsername}
          placeholder="bigslick_player"
          value={username}
        />
        <HubTextField
          autoCapitalize="none"
          label="Avatar URL"
          onChangeText={setAvatar}
          placeholder="https://..."
          value={avatar}
        />
        <GameButton
          disabled={isGuest || isSavingProfile}
          label="Save Profile"
          onPress={() => {
            void handleProfileSave();
          }}
          subtitle="Update username and avatar on the hub backend"
          tone="primary"
        />
      </HubPanel>

      <HubPanel
        subtitle="These flags map onto the backend player settings endpoint."
        title="Player settings"
      >
        <ToggleRow
          label="Music enabled"
          onValueChange={setMusicEnabled}
          value={musicEnabled}
        />
        <ToggleRow
          label="Sound enabled"
          onValueChange={setSoundEnabled}
          value={soundEnabled}
        />
        <ToggleRow
          label="Vibration enabled"
          onValueChange={setVibrationEnabled}
          value={vibrationEnabled}
        />
        <GameButton
          disabled={isGuest || isSavingSettings}
          label="Sync Player Settings"
          onPress={() => {
            void handleSettingsSave();
          }}
          subtitle="Persist the shared audio and vibration flags"
          tone="primary"
        />
      </HubPanel>

      <HubPanel
        subtitle="Common account operations used across all future frontends."
        title="Session actions"
      >
        <View style={styles.actionStack}>
          <GameButton
            label="Refresh Profile"
            onPress={() => {
              void refreshProfile();
            }}
            subtitle="Reload current profile data from the backend"
            tone="primary"
          />
          <GameButton
            label="Open Wallet"
            onPress={() => {
              router.push("/wallet" as Href);
            }}
            subtitle="Inspect chips, shop items, and transaction history"
          />
          <GameButton
            label="Logout"
            onPress={() => {
              void logout();
            }}
            subtitle="Clear the current hub token"
          />
        </View>
      </HubPanel>
    </ScreenContainer>
  );
}

function IdentityCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.identityCard}>
      <Text style={styles.identityLabel}>{label}</Text>
      <Text style={styles.identityValue}>{value}</Text>
    </View>
  );
}

function ToggleRow({
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
  actionStack: {
    gap: theme.spacing.md
  },
  centered: {
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg
  },
  content: {
    gap: theme.spacing.lg,
    marginHorizontal: "auto",
    maxWidth: 980,
    paddingBottom: theme.spacing.xxxl + 32,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl
  },
  identityCard: {
    backgroundColor: theme.colors.cardMuted,
    borderRadius: theme.radius.lg,
    gap: 6,
    minWidth: 180,
    padding: theme.spacing.md
  },
  identityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md
  },
  identityLabel: {
    color: theme.colors.subtleText,
    fontFamily: theme.fonts.label,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  identityValue: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16
  },
  toggleLabel: {
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    marginRight: theme.spacing.md
  },
  toggleRow: {
    alignItems: "center",
    backgroundColor: theme.colors.cardMuted,
    borderRadius: theme.radius.lg,
    flexDirection: "row",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md
  }
});
