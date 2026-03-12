export type Vector = {
  x: number;
  y: number;
};

export type ArenaSize = {
  width: number;
  height: number;
};

export type GameEvent =
  | "none"
  | "launch"
  | "level-complete"
  | "crash"
  | "campaign-complete";

export type FlightStatus =
  | "ready"
  | "running"
  | "failed"
  | "landed"
  | "campaign-complete";

export type Pad = {
  height: number;
  label: string;
  side: "left" | "right";
  width: number;
  x: number;
  y: number;
};

export type RectObstacle = {
  height: number;
  id: string;
  kind: "hangar" | "tunnel";
  shape: "rect";
  width: number;
  x: number;
  y: number;
};

export type CircleObstacle = {
  id: string;
  kind: "rock";
  radius: number;
  shape: "circle";
  x: number;
  y: number;
};

export type Obstacle = RectObstacle | CircleObstacle;

export type Star = {
  alpha: number;
  depth: number;
  id: string;
  position: Vector;
  size: number;
};

export type Rocket = {
  angle: number;
  position: Vector;
  radius: number;
  thrusting: boolean;
  velocity: Vector;
};

export type Camera = {
  center: Vector;
  zoom: number;
};

export type LevelData = {
  accentColor: string;
  corridor: Vector[];
  goalPad: Pad;
  height: number;
  name: string;
  number: number;
  obstacles: Obstacle[];
  stars: Star[];
  startPad: Pad;
  width: number;
};

export type GameInput = {
  tap: boolean;
  thrust: boolean;
};

export type GameWorld = {
  arena: ArenaSize;
  camera: Camera;
  currentLevel: number;
  event: GameEvent;
  eventNonce: number;
  failureReason: string | null;
  gameOver: boolean;
  levelData: LevelData;
  maxLevel: number;
  rocket: Rocket;
  safeLandingSpeed: number;
  status: FlightStatus;
  time: number;
};
