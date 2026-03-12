import { clamp } from "../theme";
import {
  ArenaSize,
  Camera,
  GameInput,
  GameWorld,
  LevelData,
  Obstacle,
  Rocket,
  Star,
  Vector
} from "./types";

const MAX_LEVEL = 30;
const ROCKET_RADIUS = 18;
const WORLD_MARGIN_TOP = 52;
const WORLD_MARGIN_BOTTOM = 52;
const BASE_FORWARD_SPEED = 210;
const FORWARD_SPEED_STEP = 8;
const GRAVITY = 720;
const THRUST_ACCELERATION = 1180;
const TAP_IMPULSE = 140;
const LAUNCH_UPWARD_VELOCITY = -208;
const CAMERA_SMOOTHING = 0.12;

const LEVEL_NAMES = [
  "Hangar Wake",
  "Blue Relay",
  "Stone Drift",
  "Echo Tunnel",
  "Ion Gate",
  "Chrome Throat",
  "Mag Rail",
  "Dust Arch",
  "Solar Spine",
  "Cold Grid"
] as const;

const LEVEL_ACCENTS = [
  "#5ef2ff",
  "#ff8f43",
  "#ff5d8f",
  "#8dfd6d",
  "#ffd95e"
] as const;

function createRng(seed: number) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = Math.imul(state ^ (state >>> 15), state | 1);

    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function randomBetween(rng: () => number, min: number, max: number) {
  return min + rng() * (max - min);
}

function distance(a: Vector, b: Vector) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function stampEvent(world: GameWorld, event: GameWorld["event"]) {
  return {
    ...world,
    event,
    eventNonce: world.eventNonce + 1
  };
}

function makeRocket(levelData: LevelData): Rocket {
  return {
    angle: -0.12,
    position: {
      x: levelData.startPad.x + levelData.startPad.width * 0.46,
      y: levelData.startPad.y - ROCKET_RADIUS - 4
    },
    radius: ROCKET_RADIUS,
    thrusting: false,
    velocity: {
      x: 0,
      y: 0
    }
  };
}

function nearestObstacleDistance(levelData: LevelData, rocket: Rocket) {
  let nearest = Number.POSITIVE_INFINITY;

  for (const obstacle of levelData.obstacles) {
    const edgeX =
      obstacle.shape === "rect"
        ? obstacle.x
        : obstacle.x - obstacle.radius;
    const nextDistance = edgeX - rocket.position.x;

    if (nextDistance >= -120) {
      nearest = Math.min(nearest, nextDistance);
    }
  }

  return nearest;
}

function targetCamera(
  arena: ArenaSize,
  levelData: LevelData,
  rocket: Rocket,
  status: GameWorld["status"]
) {
  if (!arena.width || !arena.height) {
    return {
      center: {
        x: rocket.position.x,
        y: rocket.position.y
      },
      zoom: 1
    };
  }

  const goalDistance = Math.max(0, levelData.goalPad.x - rocket.position.x);
  const obstacleDistance = nearestObstacleDistance(levelData, rocket);
  const velocityStress = clamp(Math.abs(rocket.velocity.y) / 360, 0, 1);
  const obstaclePressure =
    obstacleDistance === Number.POSITIVE_INFINITY
      ? 0
      : 1 - clamp(obstacleDistance / 560, 0, 1);
  const goalPressure = 1 - clamp(goalDistance / 720, 0, 1);
  const settlePressure =
    status === "ready" ? 0.4 : status === "running" ? 0 : 0.55;

  const zoom = clamp(
    1.08 -
      obstaclePressure * 0.24 -
      goalPressure * 0.18 -
      velocityStress * 0.14 -
      settlePressure * 0.22,
    0.66,
    1.08
  );
  const visibleWidth = arena.width / zoom;
  const visibleHeight = arena.height / zoom;
  const lookAhead =
    status === "ready"
      ? 300
      : status === "running"
        ? clamp(240 + Math.max(rocket.velocity.x, 0) * 0.55, 220, 380)
        : 180;
  const targetX =
    status === "ready"
      ? levelData.startPad.x + 340
      : status === "running"
        ? rocket.position.x + lookAhead
        : levelData.goalPad.x + levelData.goalPad.width * 0.2;
  const targetY =
    status === "ready"
      ? levelData.startPad.y - 24
      : status === "running"
        ? rocket.position.y + rocket.velocity.y * 0.12
        : levelData.goalPad.y - 8;

  return {
    center: {
      x: clamp(
        targetX,
        visibleWidth / 2 + 24,
        levelData.width - visibleWidth / 2 - 24
      ),
      y: clamp(
        targetY,
        visibleHeight / 2 + 24,
        levelData.height - visibleHeight / 2 - 24
      )
    },
    zoom
  };
}

function resolveCamera(
  camera: Camera | undefined,
  arena: ArenaSize,
  levelData: LevelData,
  rocket: Rocket,
  status: GameWorld["status"]
): Camera {
  const target = targetCamera(arena, levelData, rocket, status);

  if (!camera) {
    return target;
  }

  return {
    center: {
      x:
        camera.center.x +
        (target.center.x - camera.center.x) * CAMERA_SMOOTHING,
      y:
        camera.center.y +
        (target.center.y - camera.center.y) * CAMERA_SMOOTHING
    },
    zoom: camera.zoom + (target.zoom - camera.zoom) * CAMERA_SMOOTHING
  };
}

function buildStars(
  rng: () => number,
  width: number,
  height: number,
  count: number
) {
  const stars: Star[] = [];

  for (let index = 0; index < count; index += 1) {
    stars.push({
      alpha: randomBetween(rng, 0.24, 0.95),
      depth: randomBetween(rng, 0.45, 1),
      id: `star-${index}`,
      position: {
        x: randomBetween(rng, 0, width),
        y: randomBetween(rng, WORLD_MARGIN_TOP * 0.5, height - WORLD_MARGIN_BOTTOM * 0.4)
      },
      size: randomBetween(rng, 1, 3.3)
    });
  }

  return stars;
}

function circleHitsRect(
  position: Vector,
  radius: number,
  obstacle: Extract<Obstacle, { shape: "rect" }>
) {
  const nearestX = clamp(position.x, obstacle.x, obstacle.x + obstacle.width);
  const nearestY = clamp(position.y, obstacle.y, obstacle.y + obstacle.height);

  return distance(position, { x: nearestX, y: nearestY }) <= radius;
}

function collidesWithObstacle(rocket: Rocket, obstacle: Obstacle) {
  if (obstacle.shape === "rect") {
    return circleHitsRect(rocket.position, rocket.radius, obstacle);
  }

  return (
    distance(rocket.position, { x: obstacle.x, y: obstacle.y }) <=
    rocket.radius + obstacle.radius
  );
}

function buildLevel(level: number, arena: ArenaSize): LevelData {
  const seed =
    level * 97 +
    Math.round(arena.width * 3.1) +
    Math.round(arena.height * 7.3);
  const rng = createRng(seed);
  const width = Math.round(
    clamp(Math.max(arena.width * 2.8, 1700) + level * 140, 1700, 5200)
  );
  const height = Math.round(
    clamp(Math.max(arena.height * 1.18, 680), 680, 960)
  );
  const startPadY = Math.round(
    randomBetween(rng, height * 0.34, height * 0.7)
  );
  const goalPadY = Math.round(
    clamp(
      startPadY + randomBetween(rng, -height * 0.22, height * 0.22),
      132,
      height - 132
    )
  );
  const startPad = {
    height: 18,
    label: "LAUNCH",
    side: "left" as const,
    width: 168,
    x: 92,
    y: startPadY
  };
  const goalPad = {
    height: 18,
    label: "PAD",
    side: "right" as const,
    width: Math.round(clamp(156 - level * 2.2, 104, 156)),
    x: width - 220,
    y: goalPadY
  };
  const corridor: Vector[] = [];
  const obstacles: Obstacle[] = [];
  const waypointCount = 7 + Math.floor(level / 3);
  const startX = startPad.x + startPad.width + 56;
  const endX = goalPad.x - 88;
  let pathY = startPad.y - 54;

  for (let index = 0; index < waypointCount; index += 1) {
    const progress =
      waypointCount <= 1 ? 0 : index / (waypointCount - 1);

    if (index === 0) {
      corridor.push({
        x: startX,
        y: pathY
      });
      continue;
    }

    if (index === waypointCount - 1) {
      corridor.push({
        x: endX,
        y: goalPad.y - 54
      });
      continue;
    }

    pathY = clamp(
      pathY + randomBetween(rng, -height * 0.18, height * 0.18),
      138,
      height - 138
    );

    corridor.push({
      x:
        startX +
        (endX - startX) * progress +
        randomBetween(rng, -68, 68),
      y: pathY
    });
  }

  const gapBase = clamp(356 - level * 5.4, 190, 356);

  for (let index = 1; index < corridor.length - 1; index += 1) {
    const point = corridor[index];
    const obstacleWidth = Math.round(
      clamp(102 + level * 3.2 + randomBetween(rng, 0, 54), 96, 190)
    );
    const gap = clamp(gapBase + randomBetween(rng, -42, 42), 178, 372);
    const topEnd = point.y - gap / 2;
    const bottomStart = point.y + gap / 2;
    const createTop = topEnd - WORLD_MARGIN_TOP > 74;
    const createBottom =
      height - WORLD_MARGIN_BOTTOM - bottomStart > 74;
    const paired = index % 2 === 1 || rng() > 0.45;

    if (createTop && (paired || rng() > 0.35)) {
      obstacles.push({
        height: Math.round(topEnd - WORLD_MARGIN_TOP),
        id: `top-${index}`,
        kind: paired ? "tunnel" : "hangar",
        shape: "rect",
        width: obstacleWidth,
        x: point.x - obstacleWidth * 0.5,
        y: WORLD_MARGIN_TOP
      });
    }

    if (createBottom && (paired || rng() > 0.35)) {
      obstacles.push({
        height: Math.round(height - WORLD_MARGIN_BOTTOM - bottomStart),
        id: `bottom-${index}`,
        kind: paired ? "tunnel" : "hangar",
        shape: "rect",
        width: obstacleWidth,
        x: point.x - obstacleWidth * 0.45,
        y: bottomStart
      });
    }
  }

  const rockCount = 1 + Math.floor(level / 4);

  for (let index = 0; index < rockCount; index += 1) {
    const anchor =
      corridor[1 + Math.floor(rng() * Math.max(1, corridor.length - 2))] ??
      corridor[Math.max(0, corridor.length - 1)];
    const radius = Math.round(
      clamp(24 + level * 0.4 + randomBetween(rng, 0, 14), 22, 42)
    );
    const yOffset =
      (rng() > 0.5 ? 1 : -1) * gapBase * randomBetween(rng, 0.22, 0.34);

    obstacles.push({
      id: `rock-${index}`,
      kind: "rock",
      radius,
      shape: "circle",
      x: clamp(
        anchor.x + randomBetween(rng, -64, 64),
        startPad.x + 300,
        goalPad.x - 140
      ),
      y: clamp(
        anchor.y + yOffset,
        WORLD_MARGIN_TOP + radius + 16,
        height - WORLD_MARGIN_BOTTOM - radius - 16
      )
    });
  }

  return {
    accentColor: LEVEL_ACCENTS[(level - 1) % LEVEL_ACCENTS.length],
    corridor,
    goalPad,
    height,
    name: LEVEL_NAMES[(level - 1) % LEVEL_NAMES.length],
    number: level,
    obstacles,
    stars: buildStars(rng, width, height, 46 + Math.floor(level / 2)),
    startPad,
    width
  };
}

function createCrashWorld(world: GameWorld, reason: string) {
  return stampEvent(
    {
      ...world,
      failureReason: reason,
      gameOver: true,
      rocket: {
        ...world.rocket,
        angle: Math.min(world.rocket.angle + 0.32, 1.18),
        thrusting: false,
        velocity: {
          x: 0,
          y: 0
        }
      },
      status: "failed"
    },
    "crash"
  );
}

export function createWorld(arena: ArenaSize, level = 1): GameWorld {
  const currentLevel = clamp(Math.round(level), 1, MAX_LEVEL);
  const levelData = buildLevel(currentLevel, arena);
  const rocket = makeRocket(levelData);
  const safeLandingSpeed = Math.round(
    clamp(186 - currentLevel * 1.8, 124, 186)
  );

  return {
    arena,
    camera: resolveCamera(undefined, arena, levelData, rocket, "ready"),
    currentLevel,
    event: "none",
    eventNonce: 0,
    failureReason: null,
    gameOver: false,
    levelData,
    maxLevel: MAX_LEVEL,
    rocket,
    safeLandingSpeed,
    status: "ready",
    time: 0
  };
}

export function resizeWorld(world: GameWorld, arena: ArenaSize): GameWorld {
  return {
    ...world,
    arena,
    camera: resolveCamera(
      world.camera,
      arena,
      world.levelData,
      world.rocket,
      world.status
    )
  };
}

export function updateWorld(
  world: GameWorld,
  input: GameInput,
  deltaSeconds: number
): GameWorld {
  if (world.status === "failed" || world.status === "landed") {
    return world;
  }

  if (world.status === "campaign-complete") {
    return {
      ...world,
      camera: resolveCamera(
        world.camera,
        world.arena,
        world.levelData,
        world.rocket,
        world.status
      )
    };
  }

  let nextWorld: GameWorld = {
    ...world,
    event: "none",
    failureReason: null,
    rocket: {
      ...world.rocket,
      thrusting: input.thrust
    },
    time: world.time + deltaSeconds
  };

  if (nextWorld.status === "ready" && (input.tap || input.thrust)) {
    nextWorld = stampEvent(
      {
        ...nextWorld,
        rocket: {
          ...nextWorld.rocket,
          angle: -0.42,
          thrusting: input.thrust,
          velocity: {
            x: BASE_FORWARD_SPEED + nextWorld.currentLevel * FORWARD_SPEED_STEP * 0.6,
            y: LAUNCH_UPWARD_VELOCITY
          }
        },
        status: "running"
      },
      "launch"
    );
  }

  if (nextWorld.status !== "running") {
    return {
      ...nextWorld,
      camera: resolveCamera(
        nextWorld.camera,
        nextWorld.arena,
        nextWorld.levelData,
        nextWorld.rocket,
        nextWorld.status
      )
    };
  }

  const targetForwardSpeed =
    BASE_FORWARD_SPEED + nextWorld.currentLevel * FORWARD_SPEED_STEP;
  const verticalImpulse = input.tap ? TAP_IMPULSE : 0;
  const velocityX =
    nextWorld.rocket.velocity.x +
    (targetForwardSpeed + (input.thrust ? 22 : 0) - nextWorld.rocket.velocity.x) *
      Math.min(1, 2.8 * deltaSeconds);
  const velocityY = clamp(
    nextWorld.rocket.velocity.y +
      GRAVITY * deltaSeconds -
      (input.thrust ? THRUST_ACCELERATION * deltaSeconds : 0) -
      verticalImpulse,
    -520,
    520
  );
  const position = {
    x: nextWorld.rocket.position.x + velocityX * deltaSeconds,
    y: nextWorld.rocket.position.y + velocityY * deltaSeconds
  };
  const targetAngle = clamp(
    velocityY / 360 + (input.thrust ? -0.58 : 0.22),
    -1.06,
    1.08
  );

  nextWorld = {
    ...nextWorld,
    rocket: {
      ...nextWorld.rocket,
      angle:
        nextWorld.rocket.angle +
        (targetAngle - nextWorld.rocket.angle) * Math.min(1, 7 * deltaSeconds),
      position,
      thrusting: input.thrust,
      velocity: {
        x: velocityX,
        y: velocityY
      }
    }
  };

  const topLimit = WORLD_MARGIN_TOP + nextWorld.rocket.radius;
  const bottomLimit =
    nextWorld.levelData.height - WORLD_MARGIN_BOTTOM - nextWorld.rocket.radius;

  if (nextWorld.rocket.position.y <= topLimit) {
    nextWorld = createCrashWorld(nextWorld, "You clipped the upper corridor.");
  } else if (nextWorld.rocket.position.y >= bottomLimit) {
    nextWorld = createCrashWorld(nextWorld, "Gravity pulled you into the lower wall.");
  }

  if (!nextWorld.gameOver) {
    const collided = nextWorld.levelData.obstacles.find((obstacle) =>
      collidesWithObstacle(nextWorld.rocket, obstacle)
    );

    if (collided) {
      nextWorld = createCrashWorld(
        nextWorld,
        collided.kind === "rock"
          ? "You sheared into a rock shelf."
          : "You clipped the hangar wall."
      );
    }
  }

  if (!nextWorld.gameOver) {
    const { goalPad } = nextWorld.levelData;
    const insidePadX =
      nextWorld.rocket.position.x >= goalPad.x - nextWorld.rocket.radius &&
      nextWorld.rocket.position.x <=
        goalPad.x + goalPad.width + nextWorld.rocket.radius;
    const touchingPadSurface =
      nextWorld.rocket.position.y + nextWorld.rocket.radius >= goalPad.y - 4 &&
      nextWorld.rocket.position.y - nextWorld.rocket.radius <=
        goalPad.y + goalPad.height + 12;

    if (insidePadX && touchingPadSurface) {
      if (
        nextWorld.rocket.position.x >= goalPad.x + 10 &&
        nextWorld.rocket.position.x <= goalPad.x + goalPad.width - 10 &&
        Math.abs(nextWorld.rocket.velocity.y) <= nextWorld.safeLandingSpeed
      ) {
        nextWorld = stampEvent(
          {
            ...nextWorld,
            gameOver: true,
            rocket: {
              ...nextWorld.rocket,
              angle: 0,
              position: {
                x: clamp(
                  nextWorld.rocket.position.x,
                  goalPad.x + 18,
                  goalPad.x + goalPad.width - 18
                ),
                y: goalPad.y - nextWorld.rocket.radius - 2
              },
              thrusting: false,
              velocity: {
                x: 0,
                y: 0
              }
            },
            status:
              nextWorld.currentLevel >= nextWorld.maxLevel
                ? "campaign-complete"
                : "landed"
          },
          nextWorld.currentLevel >= nextWorld.maxLevel
            ? "campaign-complete"
            : "level-complete"
        );
      } else {
        nextWorld = createCrashWorld(
          nextWorld,
          Math.abs(nextWorld.rocket.velocity.y) > nextWorld.safeLandingSpeed
            ? `Touchdown speed ${Math.round(
                Math.abs(nextWorld.rocket.velocity.y)
              )} was too hard.`
            : "You reached the pad off-center."
        );
      }
    }
  }

  if (
    !nextWorld.gameOver &&
    nextWorld.rocket.position.x - nextWorld.rocket.radius >
      nextWorld.levelData.goalPad.x + nextWorld.levelData.goalPad.width + 96
  ) {
    nextWorld = createCrashWorld(nextWorld, "You flew past the landing pad.");
  }

  return {
    ...nextWorld,
    camera: resolveCamera(
      nextWorld.camera,
      nextWorld.arena,
      nextWorld.levelData,
      nextWorld.rocket,
      nextWorld.status
    )
  };
}
