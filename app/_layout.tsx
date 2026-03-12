import "react-native-reanimated";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";

import { AppProviders } from "../src/providers/AppProviders";
import { theme } from "../src/theme";

void SystemUI.setBackgroundColorAsync(theme.colors.background);

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: theme.colors.background
          },
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: theme.colors.background
          },
          headerTintColor: theme.colors.text,
          gestureEnabled: true
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ title: "Auth" }} />
        <Stack.Screen name="profile" options={{ title: "Profile" }} />
        <Stack.Screen name="wallet" options={{ title: "Wallet" }} />
        <Stack.Screen name="rewards" options={{ title: "Rewards" }} />
        <Stack.Screen name="launcher" options={{ title: "Launcher" }} />
        <Stack.Screen
          name="game"
          options={{ gestureEnabled: false, headerShown: false }}
        />
      </Stack>
    </AppProviders>
  );
}
