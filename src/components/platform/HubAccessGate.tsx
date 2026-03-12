import { Href, router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../theme";
import { GameButton } from "../ui/GameButton";

export function HubAccessGate({
  ctaLabel = "Open Auth",
  message
}: {
  ctaLabel?: string;
  message: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Hub session required</Text>
      <Text style={styles.body}>{message}</Text>
      <GameButton
        label={ctaLabel}
        onPress={() => {
          router.push("/auth" as Href);
        }}
        subtitle="Create a user session or continue as guest"
        tone="primary"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: theme.colors.subtleText,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    lineHeight: 22
  },
  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.lg
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 20
  }
});
