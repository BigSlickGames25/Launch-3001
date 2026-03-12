import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "../../theme";

export function OptionGroup({
  onChange,
  options,
  selectedValue
}: {
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  selectedValue: string;
}) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selected = option.value === selectedValue;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.option,
              selected && styles.optionSelected,
              pressed && styles.optionPressed
            ]}
          >
            <Text style={styles.optionLabel}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  option: {
    backgroundColor: theme.colors.cardMuted,
    borderRadius: 999,
    minWidth: 0,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  optionSelected: {
    backgroundColor: theme.colors.surface
  },
  optionPressed: {
    opacity: 0.85
  },
  optionLabel: {
    color: theme.colors.text,
    flexShrink: 1,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 14,
    textAlign: "center"
  }
});
