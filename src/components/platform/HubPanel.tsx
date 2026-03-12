import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { theme } from "../../theme";

export function HubPanel({
  children,
  style,
  subtitle,
  title
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  subtitle?: string;
  title: string;
}) {
  return (
    <View style={[styles.panel, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.lg
  },
  header: {
    gap: 6
  },
  subtitle: {
    color: theme.colors.subtleText,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 20
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 20
  }
});
