import { LinearGradient } from "expo-linear-gradient";
import { Href, router } from "expo-router";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBackdrop } from "../components/layout/AppBackdrop";
import { useGameLoop } from "../engine/useGameLoop";
import { useDeviceProfile } from "../hooks/useDeviceProfile";
import { fireHaptic } from "../services/haptics";
import { useGameSettings } from "../store/game-settings";
import { clamp, theme } from "../theme";
import { GameInput, GameWorld, Obstacle, Pad, Vector } from "./types";
import { createWorld, resizeWorld, updateWorld } from "./world";

const RAD_TO_DEG = 57.2958;

export function GameExperience() {
  const device = useDeviceProfile();
  const { settings } = useGameSettings();
  const [arenaSize, setArenaSize] = useState({ width: 0, height: 0 });
  const [world, setWorld] = useState<GameWorld | null>(null);
  const [paused, setPaused] = useState(false);
  const [thrustPressed, setThrustPressed] = useState(false);
  const inputRef = useRef<GameInput>({
    tap: false,
    thrust: false
  });

  useEffect(() => {
    if (settings.keepAwake) {
      void activateKeepAwakeAsync("game-session");
    } else {
      void deactivateKeepAwake("game-session");
    }

    return () => {
      void deactivateKeepAwake("game-session");
    };
  }, [settings.keepAwake]);

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    const { body, documentElement } = document;
    const previousHtmlOverflow = documentElement.style.overflow;
    const previousHtmlOverscroll = documentElement.style.overscrollBehavior;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscroll = body.style.overscrollBehavior;
    const previousBodyTouchAction = body.style.touchAction;
    const previousBodyPosition = body.style.position;
    const previousBodyInset = body.style.inset;
    const previousBodyWidth = body.style.width;

    const preventTouchDefault = (event: Event) => {
      event.preventDefault();
    };

    documentElement.style.overflow = "hidden";
    documentElement.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    body.style.touchAction = "none";
    body.style.position = "fixed";
    body.style.inset = "0";
    body.style.width = "100%";
    window.scrollTo(0, 0);
    document.addEventListener("touchmove", preventTouchDefault, {
      passive: false
    });

    return () => {
      documentElement.style.overflow = previousHtmlOverflow;
      documentElement.style.overscrollBehavior = previousHtmlOverscroll;
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousBodyOverscroll;
      body.style.touchAction = previousBodyTouchAction;
      body.style.position = previousBodyPosition;
      body.style.inset = previousBodyInset;
      body.style.width = previousBodyWidth;
      document.removeEventListener("touchmove", preventTouchDefault);
    };
  }, []);

  useEffect(() => {
    if (!arenaSize.width || !arenaSize.height) {
      return;
    }

    setWorld((current) =>
      current ? resizeWorld(current, arenaSize) : createWorld(arenaSize)
    );
  }, [arenaSize.height, arenaSize.width]);

  useEffect(() => {
    if (!world || world.event === "none") {
      return;
    }

    switch (world.event) {
      case "launch":
        void fireHaptic(settings.haptics, "boost");
        break;
      case "level-complete":
      case "campaign-complete":
        void fireHaptic(settings.haptics, "confirm");
        break;
      case "crash":
        void fireHaptic(settings.haptics, "damage");
        break;
    }
  }, [settings.haptics, world?.event, world?.eventNonce]);

  useEffect(() => {
    if (!paused && !world?.gameOver) {
      return;
    }

    inputRef.current = {
      tap: false,
      thrust: false
    };
    setThrustPressed(false);
  }, [paused, world?.gameOver]);

  useGameLoop(Boolean(world) && !paused && !world?.gameOver, (deltaSeconds) => {
    setWorld((current) => {
      if (!current) {
        return current;
      }

      return updateWorld(current, inputRef.current, deltaSeconds);
    });

    if (inputRef.current.tap) {
      inputRef.current = {
        ...inputRef.current,
        tap: false
      };
    }
  });

  function handleArenaLayout(event: LayoutChangeEvent) {
    const { height, width } = event.nativeEvent.layout;

    setArenaSize((current) => {
      if (current.width === width && current.height === height) {
        return current;
      }

      return {
        width,
        height
      };
    });
  }

  function resetInputState() {
    inputRef.current = {
      tap: false,
      thrust: false
    };
    setThrustPressed(false);
  }

  function handlePauseToggle() {
    void fireHaptic(settings.haptics, "pause");
    setPaused((current) => !current);
  }

  function handlePrimaryAction() {
    if (!world) {
      return;
    }

    if (paused && !world.gameOver) {
      setPaused(false);
      return;
    }

    if (!arenaSize.width || !arenaSize.height) {
      return;
    }

    const nextLevel =
      world.status === "landed" ? world.currentLevel + 1 : 1;

    void fireHaptic(settings.haptics, "confirm");
    setPaused(false);
    resetInputState();
    setWorld(createWorld(arenaSize, nextLevel));
  }

  function leaveGame() {
    resetInputState();
    void fireHaptic(settings.haptics, "tap");
    router.replace("/" as Href);
  }

  function handleThrustStart() {
    if (!world || paused || world.gameOver) {
      return;
    }

    setThrustPressed(true);
    inputRef.current = {
      tap: true,
      thrust: true
    };
  }

  function handleThrustEnd() {
    setThrustPressed(false);
    inputRef.current = {
      ...inputRef.current,
      thrust: false
    };
  }

  const distanceToPad = world
    ? Math.max(0, Math.round((world.levelData.goalPad.x - world.rocket.position.x) / 10))
    : 0;
  const verticalSpeed = world ? Math.round(Math.abs(world.rocket.velocity.y)) : 0;
  const isWide = device.isLandscape || device.width >= 960;
  const arenaHeight = Math.round(clamp(device.height * 0.72, 420, 860));
  const accentColor = world?.levelData.accentColor ?? theme.colors.accent;

  return (
    <View style={styles.root}>
      <AppBackdrop />
      <SafeAreaView
        edges={["top", "bottom", "left", "right"]}
        style={styles.safeArea}
      >
        <View style={styles.shell}>
          <View style={[styles.header, isWide && styles.headerWide]}>
            <View style={styles.metricsRow}>
              <MetricCard label="Sector" value={world ? `${world.currentLevel}/30` : "--"} />
              <MetricCard label="Distance" value={world ? `${distanceToPad}m` : "--"} />
              <MetricCard label="V-Speed" value={world ? `${verticalSpeed}` : "--"} />
              <MetricCard
                accentColor={accentColor}
                label="Safe Burn"
                value={world ? `${world.safeLandingSpeed}` : "--"}
              />
            </View>
            <View style={styles.headerButtons}>
              <HeaderButton label="Menu" onPress={leaveGame} />
              <HeaderButton
                label={paused ? "Resume" : "Pause"}
                onPress={handlePauseToggle}
              />
            </View>
          </View>

          <View
            onLayout={handleArenaLayout}
            style={[styles.arenaShell, { minHeight: arenaHeight }]}
          >
            {world ? (
              <>
                <FlightArena thrustPressed={thrustPressed} world={world} />
                <Pressable
                  disabled={paused || world.gameOver}
                  onPressIn={handleThrustStart}
                  onPressOut={handleThrustEnd}
                  style={styles.touchSurface}
                >
                  <View style={styles.touchSurfaceFill} />
                </Pressable>
                {!paused && !world.gameOver ? (
                  <View pointerEvents="none" style={styles.touchHint}>
                    <Text style={styles.touchHintTitle}>
                      {world.status === "ready"
                        ? "Tap and hold to launch."
                        : "Tap and hold anywhere to burn upward."}
                    </Text>
                    <Text style={[styles.touchHintBody, { color: accentColor }]}>
                      {world.levelData.name}
                    </Text>
                  </View>
                ) : null}
              </>
            ) : null}

            {paused || world?.gameOver ? (
              <GameOverlay
                onLeave={leaveGame}
                onPrimaryAction={handlePrimaryAction}
                paused={paused}
                world={world}
              />
            ) : null}
          </View>

          <View style={[styles.footer, isWide && styles.footerWide]}>
            <Text style={styles.footerTitle}>
              80s sci-fi run. No saves. Thirty sectors.
            </Text>
            <Text style={styles.footerText}>
              {world?.status === "ready"
                ? "Launch from the left pad, ride the camera, thread the hangars, and land softly. Any crash or hard touchdown sends the whole campaign back to Sector 1."
                : world?.status === "running"
                  ? "The rocket auto-drifts right. Your only job is vertical control and a soft final descent."
                  : world?.status === "landed"
                    ? "Sector cleared. The next launch starts immediately from a new left-side pad."
                    : world?.status === "campaign-complete"
                      ? "You cleared all 30 sectors in one run."
                      : "Campaign lost. Restart from Sector 1."}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function MetricCard({
  accentColor,
  label,
  value
}: {
  accentColor?: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={[styles.metricLabel, accentColor ? { color: accentColor } : null]}>
        {label}
      </Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function HeaderButton({
  label,
  onPress
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.headerButton,
        pressed && styles.headerButtonPressed
      ]}
    >
      <Text style={styles.headerButtonLabel}>{label}</Text>
    </Pressable>
  );
}

function GameOverlay({
  onLeave,
  onPrimaryAction,
  paused,
  world
}: {
  onLeave: () => void;
  onPrimaryAction: () => void;
  paused: boolean;
  world: GameWorld | null;
}) {
  const title = paused
    ? "Paused"
    : world?.status === "landed"
      ? `Sector ${world.currentLevel} Clear`
      : world?.status === "campaign-complete"
        ? "Run Complete"
        : "Campaign Lost";
  const body = paused
    ? "The burn is frozen. Resume when you are ready."
    : world?.status === "landed"
      ? `Clean touchdown on ${world.levelData.name}. Continue to Sector ${
          world.currentLevel + 1
        }.`
      : world?.status === "campaign-complete"
        ? "All 30 sectors cleared in a single run. Restart to fly the full campaign again."
        : `${world?.failureReason ?? "Hull breach."} The next run restarts at Sector 1.`;
  const primaryLabel = paused
    ? "Resume"
    : world?.status === "landed"
      ? "Next Sector"
      : "Restart Run";

  return (
    <View style={styles.overlay}>
      <Text style={styles.overlayTitle}>{title}</Text>
      <Text style={styles.overlayBody}>{body}</Text>
      <View style={styles.overlayButtons}>
        <Pressable onPress={onPrimaryAction} style={styles.overlayPrimary}>
          <Text style={styles.overlayPrimaryText}>{primaryLabel}</Text>
        </Pressable>
        <Pressable onPress={onLeave} style={styles.overlaySecondary}>
          <Text style={styles.overlaySecondaryText}>Menu</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FlightArena({
  thrustPressed,
  world
}: {
  thrustPressed: boolean;
  world: GameWorld;
}) {
  const { camera, levelData, rocket } = world;
  const stageTranslateX =
    world.arena.width / 2 -
    camera.center.x * camera.zoom +
    ((camera.zoom - 1) * levelData.width) / 2;
  const stageTranslateY =
    world.arena.height / 2 -
    camera.center.y * camera.zoom +
    ((camera.zoom - 1) * levelData.height) / 2;
  const gridRows = [0.16, 0.32, 0.5, 0.68, 0.84];
  const gridColumns = [0.14, 0.3, 0.46, 0.62, 0.78, 0.94];

  return (
    <View style={styles.viewport}>
      <LinearGradient
        colors={["#02050b", "#081223", "#101d39", "#050a12"]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.viewportOverlay} />
      <View
        style={[
          styles.stage,
          {
            height: levelData.height,
            transform: [
              { translateX: stageTranslateX },
              { translateY: stageTranslateY },
              { scale: camera.zoom }
            ],
            width: levelData.width
          }
        ]}
      >
        <LinearGradient
          colors={["#060913", "#08172d", "#050810"]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={StyleSheet.absoluteFill}
        />

        {gridRows.map((ratio) => (
          <View
            key={`row-${ratio}`}
            style={[
              styles.stageGridRow,
              {
                top: levelData.height * ratio
              }
            ]}
          />
        ))}
        {gridColumns.map((ratio) => (
          <View
            key={`column-${ratio}`}
            style={[
              styles.stageGridColumn,
              {
                left: levelData.width * ratio
              }
            ]}
          />
        ))}

        {levelData.stars.map((star) => (
          <View
            key={star.id}
            style={[
              styles.star,
              {
                height: star.size * star.depth,
                left: star.position.x,
                opacity: star.alpha,
                top: star.position.y,
                width: star.size * star.depth
              }
            ]}
          />
        ))}

        <View style={styles.boundaryTop} />
        <View style={styles.boundaryBottom} />

        <CorridorGuide accentColor={levelData.accentColor} points={levelData.corridor} />
        <PadSprite accentColor={levelData.accentColor} levelWidth={levelData.width} pad={levelData.startPad} />
        <PadSprite accentColor={levelData.accentColor} levelWidth={levelData.width} pad={levelData.goalPad} />

        {levelData.obstacles.map((obstacle) => (
          <ObstacleSprite
            accentColor={levelData.accentColor}
            key={obstacle.id}
            obstacle={obstacle}
          />
        ))}

        <View style={styles.stageLabel}>
          <Text style={[styles.stageLabelText, { color: levelData.accentColor }]}>
            SECTOR {world.currentLevel.toString().padStart(2, "0")} / {levelData.name.toUpperCase()}
          </Text>
        </View>

        <RocketSprite accentColor={levelData.accentColor} rocket={rocket} thrustPressed={thrustPressed} />
      </View>
    </View>
  );
}

function CorridorGuide({
  accentColor,
  points
}: {
  accentColor: string;
  points: Vector[];
}) {
  return (
    <>
      {points.map((point, index) => (
        <View
          key={`beacon-${index}`}
          style={[
            styles.corridorBeacon,
            {
              backgroundColor: accentColor,
              left: point.x - 3,
              opacity: 0.35,
              top: point.y - 3
            }
          ]}
        />
      ))}
      {points.slice(1).map((point, index) => {
        const previous = points[index];
        const deltaX = point.x - previous.x;
        const deltaY = point.y - previous.y;
        const length = Math.hypot(deltaX, deltaY);
        const angle = Math.atan2(deltaY, deltaX) * RAD_TO_DEG;

        return (
          <View
            key={`beam-${index}`}
            style={[
              styles.corridorBeam,
              {
                backgroundColor: accentColor,
                left: previous.x + deltaX / 2 - length / 2,
                opacity: 0.13,
                top: previous.y + deltaY / 2,
                transform: [{ rotate: `${angle}deg` }],
                width: length
              }
            ]}
          />
        );
      })}
    </>
  );
}

function PadSprite({
  accentColor,
  levelWidth,
  pad
}: {
  accentColor: string;
  levelWidth: number;
  pad: Pad;
}) {
  return (
    <>
      <View
        style={[
          styles.padSupport,
          {
            left: pad.side === "left" ? 0 : pad.x,
            top: pad.y + pad.height - 4,
            width:
              pad.side === "left" ? pad.x + pad.width : levelWidth - pad.x
          }
        ]}
      />
      <View
        style={[
          styles.pad,
          {
            borderColor: accentColor,
            left: pad.x,
            top: pad.y,
            width: pad.width
          }
        ]}
      />
      <Text
        style={[
          styles.padLabel,
          {
            color: accentColor,
            left: pad.x,
            top: pad.y - 24
          }
        ]}
      >
        {pad.label}
      </Text>
    </>
  );
}

function ObstacleSprite({
  accentColor,
  obstacle
}: {
  accentColor: string;
  obstacle: Obstacle;
}) {
  if (obstacle.shape === "circle") {
    return (
      <View
        style={[
          styles.rockObstacle,
          {
            borderColor: accentColor,
            borderRadius: obstacle.radius,
            height: obstacle.radius * 2,
            left: obstacle.x - obstacle.radius,
            top: obstacle.y - obstacle.radius,
            width: obstacle.radius * 2
          }
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.rectObstacle,
        obstacle.kind === "hangar" ? styles.hangarObstacle : styles.tunnelObstacle,
        {
          borderColor: accentColor,
          height: obstacle.height,
          left: obstacle.x,
          top: obstacle.y,
          width: obstacle.width
        }
      ]}
    >
      <View style={styles.obstacleStripe} />
      <View style={styles.obstacleStripe} />
      <View style={styles.obstacleStripe} />
    </View>
  );
}

function RocketSprite({
  accentColor,
  rocket,
  thrustPressed
}: {
  accentColor: string;
  rocket: GameWorld["rocket"];
  thrustPressed: boolean;
}) {
  const size = rocket.radius * 2;
  const rotate = `${rocket.angle * RAD_TO_DEG}deg`;

  return (
    <View
      style={[
        styles.rocketFrame,
        {
          height: size,
          left: rocket.position.x - rocket.radius,
          top: rocket.position.y - rocket.radius,
          transform: [{ rotate }],
          width: size
        }
      ]}
    >
      {rocket.thrusting || thrustPressed ? (
        <>
          <View
            style={[
              styles.engineGlow,
              {
                backgroundColor: accentColor
              }
            ]}
          />
          <View style={styles.engineCore} />
        </>
      ) : null}
      <View style={styles.rocketShadow} />
      <View style={styles.rocketBody}>
        <View style={styles.rocketWindow} />
      </View>
      <View style={[styles.rocketNose, { borderBottomColor: accentColor }]} />
      <View style={[styles.rocketFinLeft, { borderTopColor: accentColor }]} />
      <View style={[styles.rocketFinRight, { borderTopColor: accentColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.colors.background,
    flex: 1,
    overflow: "hidden",
    overscrollBehavior: "none",
    touchAction: "none"
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: theme.spacing.md
  },
  shell: {
    flex: 1,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    paddingTop: theme.spacing.sm
  },
  header: {
    alignItems: "flex-start",
    gap: theme.spacing.sm,
    justifyContent: "space-between"
  },
  headerWide: {
    alignItems: "center",
    flexDirection: "row"
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  metricCard: {
    backgroundColor: "rgba(8, 15, 26, 0.84)",
    borderColor: "rgba(136, 216, 255, 0.14)",
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    minWidth: 88,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  metricLabel: {
    color: theme.colors.subtleText,
    fontFamily: theme.fonts.label,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  metricValue: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 20
  },
  headerButtons: {
    flexDirection: "row",
    gap: theme.spacing.sm
  },
  headerButton: {
    backgroundColor: "rgba(12, 22, 38, 0.92)",
    borderColor: theme.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  headerButtonPressed: {
    opacity: 0.82
  },
  headerButtonLabel: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 14
  },
  arenaShell: {
    backgroundColor: "rgba(6, 10, 18, 0.92)",
    borderColor: "rgba(143, 214, 255, 0.2)",
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    flex: 1,
    minHeight: 420,
    overflow: "hidden",
    position: "relative"
  },
  viewport: {
    flex: 1,
    overflow: "hidden"
  },
  viewportOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.14)",
    ...StyleSheet.absoluteFillObject
  },
  stage: {
    left: 0,
    overflow: "hidden",
    position: "absolute",
    top: 0
  },
  stageGridRow: {
    backgroundColor: "rgba(108, 157, 255, 0.06)",
    height: 1,
    left: 0,
    position: "absolute",
    right: 0
  },
  stageGridColumn: {
    backgroundColor: "rgba(108, 157, 255, 0.05)",
    bottom: 0,
    position: "absolute",
    top: 0,
    width: 1
  },
  star: {
    backgroundColor: "#f8fbff",
    borderRadius: 999,
    position: "absolute"
  },
  boundaryTop: {
    backgroundColor: "rgba(18, 48, 92, 0.5)",
    borderBottomColor: "rgba(94, 242, 255, 0.28)",
    borderBottomWidth: 1,
    height: 52,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  boundaryBottom: {
    backgroundColor: "rgba(18, 48, 92, 0.5)",
    borderTopColor: "rgba(94, 242, 255, 0.28)",
    borderTopWidth: 1,
    bottom: 0,
    height: 52,
    left: 0,
    position: "absolute",
    right: 0
  },
  corridorBeam: {
    height: 1,
    position: "absolute"
  },
  corridorBeacon: {
    borderRadius: 999,
    height: 6,
    position: "absolute",
    width: 6
  },
  padSupport: {
    backgroundColor: "rgba(75, 102, 135, 0.34)",
    height: 8,
    position: "absolute"
  },
  pad: {
    backgroundColor: "rgba(5, 12, 22, 0.9)",
    borderRadius: 4,
    borderWidth: 2,
    height: 18,
    position: "absolute"
  },
  padLabel: {
    fontFamily: theme.fonts.label,
    fontSize: 12,
    letterSpacing: 1.4,
    position: "absolute",
    textTransform: "uppercase"
  },
  rectObstacle: {
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    position: "absolute"
  },
  tunnelObstacle: {
    backgroundColor: "rgba(18, 29, 48, 0.92)"
  },
  hangarObstacle: {
    backgroundColor: "rgba(29, 20, 38, 0.9)"
  },
  obstacleStripe: {
    backgroundColor: "rgba(255, 255, 255, 0.09)",
    borderRadius: 999,
    height: 3
  },
  rockObstacle: {
    backgroundColor: "rgba(35, 42, 58, 0.96)",
    borderWidth: 1.5,
    position: "absolute"
  },
  stageLabel: {
    left: 34,
    position: "absolute",
    top: 28
  },
  stageLabelText: {
    fontFamily: theme.fonts.label,
    fontSize: 13,
    letterSpacing: 1.6,
    textTransform: "uppercase"
  },
  rocketFrame: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute"
  },
  engineGlow: {
    borderRadius: 999,
    bottom: -16,
    height: 24,
    opacity: 0.26,
    position: "absolute",
    width: 12
  },
  engineCore: {
    backgroundColor: "#ffdca8",
    borderRadius: 999,
    bottom: -12,
    height: 16,
    position: "absolute",
    width: 6
  },
  rocketShadow: {
    backgroundColor: "rgba(0, 0, 0, 0.32)",
    borderRadius: 999,
    height: 20,
    opacity: 0.4,
    position: "absolute",
    top: 8,
    width: 12
  },
  rocketBody: {
    alignItems: "center",
    backgroundColor: "#f4f7ff",
    borderRadius: 10,
    height: 24,
    justifyContent: "center",
    width: 14
  },
  rocketWindow: {
    backgroundColor: "#091225",
    borderRadius: 999,
    height: 6,
    width: 6
  },
  rocketNose: {
    borderLeftColor: "transparent",
    borderLeftWidth: 7,
    borderRightColor: "transparent",
    borderRightWidth: 7,
    borderBottomWidth: 10,
    position: "absolute",
    top: -9
  },
  rocketFinLeft: {
    borderLeftColor: "transparent",
    borderLeftWidth: 1,
    borderRightColor: "transparent",
    borderRightWidth: 6,
    borderTopWidth: 12,
    bottom: 2,
    left: 1,
    position: "absolute"
  },
  rocketFinRight: {
    borderLeftColor: "transparent",
    borderLeftWidth: 6,
    borderRightColor: "transparent",
    borderRightWidth: 1,
    borderTopWidth: 12,
    bottom: 2,
    position: "absolute",
    right: 1
  },
  touchSurface: {
    ...StyleSheet.absoluteFillObject
  },
  touchSurfaceFill: {
    flex: 1
  },
  touchHint: {
    alignItems: "flex-start",
    bottom: theme.spacing.md,
    left: theme.spacing.md,
    position: "absolute",
    right: theme.spacing.md
  },
  touchHintTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16
  },
  touchHintBody: {
    fontFamily: theme.fonts.label,
    fontSize: 12,
    letterSpacing: 1.4,
    marginTop: 4,
    textTransform: "uppercase"
  },
  overlay: {
    alignItems: "center",
    backgroundColor: "rgba(4, 8, 14, 0.8)",
    gap: theme.spacing.md,
    inset: 0,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
    position: "absolute"
  },
  overlayTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 32,
    textAlign: "center"
  },
  overlayBody: {
    color: theme.colors.subtleText,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 520,
    textAlign: "center"
  },
  overlayButtons: {
    flexDirection: "row",
    gap: theme.spacing.sm
  },
  overlayPrimary: {
    backgroundColor: theme.colors.surface,
    borderRadius: 999,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md
  },
  overlayPrimaryText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 15
  },
  overlaySecondary: {
    backgroundColor: "rgba(17, 28, 46, 0.96)",
    borderColor: theme.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md
  },
  overlaySecondaryText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 15
  },
  footer: {
    gap: 4
  },
  footerWide: {
    maxWidth: 920
  },
  footerTitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bodyBold,
    fontSize: 16
  },
  footerText: {
    color: theme.colors.subtleText,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 21
  }
});
