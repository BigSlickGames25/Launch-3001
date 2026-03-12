import type { HubProduct } from "../types";

export const coreHubCapabilities = [
  "auth",
  "profiles",
  "wallet",
  "transactions",
  "daily rewards",
  "leaderboard-ready analytics"
] as const;

export const realtimeHubCapabilities = [
  "socket transport",
  "realtime state sync"
] as const;

export const pokerHubCapabilities = [
  "poker board discovery",
  "poker table joins"
] as const;

export const hubProducts: HubProduct[] = [
  {
    id: "21-holdem",
    slug: "21-holdem",
    title: "21 Hold'em",
    kind: "game",
    description: "Multiplayer poker game wired into the shared account and chip network.",
    capabilities: [
      ...coreHubCapabilities,
      ...realtimeHubCapabilities,
      ...pokerHubCapabilities
    ]
  },
  {
    id: "21-stackem",
    slug: "21-stackem",
    title: "21 Stack'em",
    kind: "game",
    description: "Shared-platform card game client with its own rules and frontend.",
    capabilities: [...coreHubCapabilities, ...realtimeHubCapabilities]
  },
  {
    id: "21-sinkem",
    slug: "21-sinkem",
    title: "21 Sink'em",
    kind: "game",
    description: "Another branded game client running on the same account and wallet platform.",
    capabilities: [...coreHubCapabilities, ...realtimeHubCapabilities]
  },
  {
    id: "pokeropoly",
    slug: "pokeropoly",
    title: "PokerOpoly",
    kind: "game",
    description: "Themed poker experience that shares auth, wallets, and profiles.",
    capabilities: [
      ...coreHubCapabilities,
      ...realtimeHubCapabilities,
      ...pokerHubCapabilities
    ]
  },
  {
    id: "deck-realms",
    slug: "deck-realms",
    title: "Deck Realms",
    kind: "game",
    description: "Shared-platform fantasy game shell with its own branding and frontend routes.",
    capabilities: [...coreHubCapabilities, ...realtimeHubCapabilities]
  },
  {
    id: "neon-rush",
    slug: "neon-rush",
    title: "Neon Rush",
    kind: "game",
    description: "Fast action game client that still plugs into the common hub network.",
    capabilities: [...coreHubCapabilities, ...realtimeHubCapabilities]
  },
  {
    id: "launch3001",
    slug: "launch3001",
    title: "Launch3001",
    kind: "app",
    description: "Launcher-style app that can route players into multiple games.",
    capabilities: [
      ...coreHubCapabilities
    ]
  }
];

export const defaultHubProduct = hubProducts[0];

export function getHubProduct(productId?: string | null) {
  return hubProducts.find((product) => product.id === productId) ?? defaultHubProduct;
}
