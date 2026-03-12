import { Href, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HubNotice } from "../components/platform/HubNotice";
import { HubPanel } from "../components/platform/HubPanel";
import { ScreenContainer } from "../components/layout/ScreenContainer";
import { GameButton } from "../components/ui/GameButton";
import { useHubSession } from "../platform/auth/session";
import { theme } from "../theme";

export function LauncherScreen() {
  const { currentProduct, products, selectProduct, status } = useHubSession();

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      <HubPanel
        subtitle="Choose which frontend product this build is operating as. The selected product is persisted with the session and drives shell branding."
        title="Launcher"
      >
        <HubNotice
          message={`Current mode: ${currentProduct.title}. Session state: ${status}.`}
          tone="info"
        />
        <View style={styles.grid}>
          {products.map((product) => {
            const selected = currentProduct.id === product.id;

            return (
              <Pressable
                key={product.id}
                onPress={() => {
                  selectProduct(product.id);
                }}
                style={({ pressed }) => [
                  styles.card,
                  selected && styles.cardSelected,
                  pressed && styles.cardPressed
                ]}
              >
                <Text style={styles.kicker}>{product.kind}</Text>
                <Text style={styles.title}>{product.title}</Text>
                <Text style={styles.description}>{product.description}</Text>
                <View style={styles.capabilityRow}>
                  {product.capabilities.slice(0, 4).map((capability) => (
                    <View key={capability} style={styles.capabilityPill}>
                      <Text style={styles.capabilityText}>{capability}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.selectionText}>
                  {selected ? "Active product" : "Tap to activate"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </HubPanel>

      <HubPanel
        subtitle="Launch is now wired into the gameplay route, while the shell still supports switching product identity, shared auth, and future game variants."
        title="Next action"
      >
        <View style={styles.actions}>
          <GameButton
            label="Open Hub Console"
            onPress={() => {
              router.push("/hub" as Href);
            }}
            subtitle="Check auth, profile, wallet, and rewards screens"
            tone="primary"
          />
          <GameButton
            label="Start Launch"
            onPress={() => {
              router.push("/game" as Href);
            }}
            subtitle="Open the current rocket-landing run"
          />
        </View>
      </HubPanel>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: theme.spacing.md
  },
  capabilityPill: {
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    borderRadius: 999,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6
  },
  capabilityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  capabilityText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12
  },
  card: {
    backgroundColor: theme.colors.cardMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    flex: 1,
    gap: theme.spacing.md,
    minWidth: 260,
    padding: theme.spacing.lg
  },
  cardPressed: {
    opacity: 0.88
  },
  cardSelected: {
    borderColor: theme.colors.surface,
    borderWidth: 2
  },
  content: {
    gap: theme.spacing.lg,
    marginHorizontal: "auto",
    maxWidth: 1180,
    paddingBottom: theme.spacing.xxxl + 32,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl
  },
  description: {
    color: theme.colors.subtleText,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    lineHeight: 22
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md
  },
  kicker: {
    color: theme.colors.accent,
    fontFamily: theme.fonts.label,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  selectionText: {
    color: theme.colors.surface,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 14
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 22
  }
});
