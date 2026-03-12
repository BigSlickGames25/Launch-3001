import { useState } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";

import { theme } from "../../theme";

type Vector = {
  x: number;
  y: number;
};

export function VirtualJoystick({
  label,
  onChange,
  onEngage,
  showGuide,
  size
}: {
  label: string;
  onChange: (vector: Vector) => void;
  onEngage?: () => void;
  showGuide?: boolean;
  size: number;
}) {
  const knobSize = size * 0.42;
  const maxDistance = size * 0.28;
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  function updateKnob(dx: number, dy: number) {
    const distance = Math.min(Math.hypot(dx, dy), maxDistance);
    const angle = Math.atan2(dy, dx);
    const x = distance * Math.cos(angle);
    const y = distance * Math.sin(angle);

    setKnob({ x, y });
    onChange({
      x: x / maxDistance,
      y: y / maxDistance
    });
  }

  function resetKnob() {
    setKnob({ x: 0, y: 0 });
    onChange({ x: 0, y: 0 });
  }

  const responder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      onEngage?.();
    },
    onPanResponderMove: (_, gestureState) => {
      updateKnob(gestureState.dx, gestureState.dy);
    },
    onPanResponderRelease: resetKnob,
    onPanResponderTerminate: resetKnob,
    onPanResponderTerminationRequest: () => false
  });

  return (
    <View style={styles.wrapper}>
      <View
        {...responder.panHandlers}
        style={[
          styles.base,
          {
            borderRadius: size / 2,
            height: size,
            width: size
          }
        ]}
      >
        <View
          style={[
            styles.knob,
            {
              borderRadius: knobSize / 2,
              height: knobSize,
              transform: [{ translateX: knob.x }, { translateY: knob.y }],
              width: knobSize
            }
          ]}
        />
      </View>
      {showGuide ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    gap: theme.spacing.sm
  },
  base: {
    alignItems: "center",
    backgroundColor: theme.colors.joystickBase,
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    justifyContent: "center"
  },
  knob: {
    backgroundColor: theme.colors.joystickKnob,
    opacity: 0.92,
    position: "absolute"
  },
  label: {
    color: theme.colors.subtleText,
    fontFamily: theme.fonts.label,
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: "uppercase"
  }
});

