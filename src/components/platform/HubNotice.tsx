import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../theme";

type HubNoticeTone = "error" | "info" | "success";

export function HubNotice({
  message,
  tone = "info"
}: {
  message: string;
  tone?: HubNoticeTone;
}) {
  return (
    <View style={[styles.notice, tone === "error" && styles.error, tone === "success" && styles.success]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    backgroundColor: "rgba(251, 113, 133, 0.14)",
    borderColor: "rgba(251, 113, 133, 0.35)"
  },
  notice: {
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    borderColor: "rgba(56, 189, 248, 0.28)",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  success: {
    backgroundColor: "rgba(52, 211, 153, 0.12)",
    borderColor: "rgba(52, 211, 153, 0.3)"
  },
  text: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 20
  }
});
