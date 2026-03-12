import { Href, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { HubNotice } from "../components/platform/HubNotice";
import { HubPanel } from "../components/platform/HubPanel";
import { HubTextField } from "../components/platform/HubTextField";
import { ScreenContainer } from "../components/layout/ScreenContainer";
import { GameButton } from "../components/ui/GameButton";
import { OptionGroup } from "../components/ui/OptionGroup";
import { useHubSession } from "../platform/auth/session";
import { getErrorMessage } from "../platform/lib/format";
import { theme } from "../theme";

type AuthMode = "guest" | "login" | "register";

const authModeOptions = [
  { label: "Login", value: "login" },
  { label: "Register", value: "register" },
  { label: "Guest", value: "guest" }
] as const;

export function AuthScreen() {
  const {
    guestDeviceId,
    login,
    logout,
    profile,
    register,
    startGuestSession,
    status
  } = useHubSession();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await login({
          sEmail: email.trim(),
          sPassword: password
        });
        setSuccess("User session loaded.");
        router.replace("/profile" as Href);
        return;
      }

      if (mode === "register") {
        const message = await register({
          sEmail: email.trim(),
          sPassword: password,
          sUserName: username.trim()
        });
        setSuccess(
          message || "Registration request accepted. Verify email before login."
        );
        return;
      }

      await startGuestSession();
      setSuccess("Guest session created.");
      router.replace("/profile" as Href);
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      <HubPanel
        subtitle="The same auth flow should be reused by every game or app created from this starter."
        title="Auth"
      >
        <OptionGroup
          onChange={(value) => {
            setMode(value as AuthMode);
            setError(null);
            setSuccess(null);
          }}
          options={authModeOptions.map((option) => ({
            label: option.label,
            value: option.value
          }))}
          selectedValue={mode}
        />

        {mode !== "guest" ? (
          <HubTextField
            autoCapitalize="none"
            keyboardType="email-address"
            label={mode === "login" ? "Email or username" : "Email"}
            onChangeText={setEmail}
            placeholder={
              mode === "login"
                ? "player@bigslick.games or username"
                : "player@bigslick.games"
            }
            value={email}
          />
        ) : null}

        {mode === "register" ? (
          <HubTextField
            autoCapitalize="none"
            label="Username"
            onChangeText={setUsername}
            placeholder="bigslick_player"
            value={username}
          />
        ) : null}

        {mode !== "guest" ? (
          <HubTextField
            autoCapitalize="none"
            label="Password"
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
            value={password}
          />
        ) : null}

        {mode === "guest" ? (
          <HubNotice
            message={`Guest login uses the persisted device identity: ${guestDeviceId ?? "loading..."}`}
          />
        ) : null}

        {error ? <HubNotice message={error} tone="error" /> : null}
        {success ? <HubNotice message={success} tone="success" /> : null}

        <GameButton
          disabled={isSubmitting}
          label={
            mode === "login"
              ? "Login"
              : mode === "register"
                ? "Register"
                : "Continue as Guest"
          }
          onPress={() => {
            void handleSubmit();
          }}
          subtitle={
            mode === "login"
              ? "Load an existing hub user"
              : mode === "register"
                ? "Create a shared account on the hub backend"
                : "Create a disposable guest token"
          }
          tone="primary"
        />

        {isSubmitting ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.colors.accent} />
            <Text style={styles.loadingText}>Submitting to hub backend...</Text>
          </View>
        ) : null}
      </HubPanel>

      <HubPanel
        subtitle="This panel confirms what is currently loaded from session bootstrap."
        title="Current session"
      >
        <View style={styles.sessionGrid}>
          <SessionStat label="Status" value={status} />
          <SessionStat
            label="User"
            value={profile?.sUserName ?? "No active profile"}
          />
          <SessionStat
            label="Email"
            value={profile?.sEmail ?? "Guest or anonymous"}
          />
        </View>
        <View style={styles.buttonRow}>
          <GameButton
            disabled={!profile}
            label="Open Profile"
            onPress={() => {
              router.push("/profile" as Href);
            }}
            subtitle="Inspect and edit shared user data"
          />
          <GameButton
            label="Clear Session"
            onPress={() => {
              void logout();
            }}
            subtitle="Remove the saved token"
          />
        </View>
      </HubPanel>
    </ScreenContainer>
  );
}

function SessionStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.sessionStat}>
      <Text style={styles.sessionLabel}>{label}</Text>
      <Text style={styles.sessionValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    gap: theme.spacing.md
  },
  content: {
    gap: theme.spacing.lg,
    marginHorizontal: "auto",
    maxWidth: 960,
    paddingBottom: theme.spacing.xxxl + 32,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl
  },
  loadingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm
  },
  loadingText: {
    color: theme.colors.subtleText,
    fontFamily: theme.fonts.body,
    fontSize: 14
  },
  sessionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md
  },
  sessionLabel: {
    color: theme.colors.subtleText,
    fontFamily: theme.fonts.label,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  sessionStat: {
    backgroundColor: theme.colors.cardMuted,
    borderRadius: theme.radius.lg,
    gap: 6,
    minWidth: 180,
    padding: theme.spacing.md
  },
  sessionValue: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 15
  }
});
