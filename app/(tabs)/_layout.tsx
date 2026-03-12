import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDeviceProfile } from "../../src/hooks/useDeviceProfile";
import { fireHaptic } from "../../src/services/haptics";
import { useGameSettings } from "../../src/store/game-settings";
import { theme } from "../../src/theme";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const device = useDeviceProfile();
  const { settings } = useGameSettings();
  const isCompact = device.width < 390;
  const tabBarBottomPadding = Math.max(insets.bottom, 8);
  const tabBarHeight = (isCompact ? 65 : 69) + tabBarBottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: theme.colors.background
        },
        tabBarActiveTintColor: theme.colors.surface,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: theme.colors.subtleText,
        tabBarAllowFontScaling: false,
        tabBarIconStyle: styles.tabBarIcon,
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelPosition: "below-icon",
        tabBarLabelStyle: [
          styles.tabBarLabel,
          isCompact && styles.tabBarLabelCompact
        ],
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingBottom: tabBarBottomPadding,
            paddingTop: isCompact ? 3 : 5
          }
        ]
      }}
    >
      <Tabs.Screen
        listeners={{
          tabPress: () => {
            void fireHaptic(settings.haptics, "tap");
          }
        }}
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              color={color}
              name={focused ? "view-grid" : "view-grid-outline"}
              size={focused ? 24 : 22}
            />
          )
        }}
      />
      <Tabs.Screen
        listeners={{
          tabPress: () => {
            void fireHaptic(settings.haptics, "tap");
          }
        }}
        name="hub"
        options={{
          title: "Hub",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              color={color}
              name={focused ? "account-network" : "account-network-outline"}
              size={focused ? 24 : 22}
            />
          )
        }}
      />
      <Tabs.Screen
        listeners={{
          tabPress: () => {
            void fireHaptic(settings.haptics, "tap");
          }
        }}
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              color={color}
              name={focused ? "tune-variant" : "tune"}
              size={focused ? 24 : 22}
            />
          )
        }}
      />
      <Tabs.Screen
        listeners={{
          tabPress: () => {
            void fireHaptic(settings.haptics, "tap");
          }
        }}
        name="how-to-play"
        options={{
          title: "Guide",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              color={color}
              name={
                focused
                  ? "controller-classic"
                  : "controller-classic-outline"
              }
              size={focused ? 24 : 22}
            />
          )
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "rgba(7, 17, 31, 0.96)",
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    elevation: 0,
    paddingHorizontal: theme.spacing.sm
  },
  tabBarIcon: {
    marginBottom: 1,
    marginTop: 1
  },
  tabBarItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 1
  },
  tabBarLabel: {
    fontFamily: theme.fonts.label,
    fontSize: 10,
    letterSpacing: 0.3,
    lineHeight: 12,
    paddingBottom: 0,
    textAlign: "center"
  },
  tabBarLabelCompact: {
    fontSize: 9,
    lineHeight: 11
  }
});
