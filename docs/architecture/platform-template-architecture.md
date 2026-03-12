# Platform Template Architecture

This template is being upgraded from a single demo game shell into a reusable client starter for the shared Big Slick hub network.

## Goal

Every new game or app should be able to:

- keep its own frontend files, routes, art, and branding
- reuse the same backend auth and session model
- reuse the same Mongo-backed player profile and wallet data
- optionally reuse shared Redis-backed realtime infrastructure when that game actually needs it
- deploy as a separate frontend while pointing at the same hub backend

## Shared frontend platform layer

The shared layer now lives in `apps/frontend/src/platform/`.

Current responsibilities:

- `api/`: typed REST wrappers for auth, profile, shop, rewards, transactions, analytics, and optional game adapters
- `auth/`: token persistence, guest device identity, session bootstrap, and product selection
- `catalog/`: the list of games/apps that can share the hub
- `types.ts`: shared data shapes extracted from the 21 Hold'em backend contract

The platform core should stay game-agnostic.

Core shared services:

- auth
- profile
- wallet
- transactions
- rewards
- analytics
- product selection and session bootstrap

Optional game adapters:

- poker table discovery and joins
- socket-driven realtime state sync
- any future game-specific controller layer

## Extracted backend contract

The original contract was extracted from a read-only backend reference before the baseline was copied into `apps/backend`:

- `Game-Backend/app/routers/game/auth`
- `Game-Backend/app/routers/game/profile`
- `Game-Backend/app/routers/game/shop`
- `Game-Backend/app/routers/game/daily_rewards`
- `Game-Backend/app/routers/game/transaction`
- `Game-Backend/app/routers/game/analytics`
- `Game-Backend/app/routers/game/poker`
- `Game-Backend/app/sockets/root`

Shared REST base:

- `/api/v1`

Shared auth header:

- `authorization`

Shared socket handshake auth:

- `authorization` via socket headers/auth/query

## What a new game should change

For each new game/app created from this template:

1. Add or update the product entry in `apps/frontend/src/platform/catalog/products.ts`
2. Replace gameplay code and routes
3. Add only the game adapters that product actually needs
4. Replace assets and branding
5. Keep the shared platform modules unless the backend contract changes
6. Point the frontend env at the correct staging or production hub backend

In this monorepo, the practical paths are:

- frontend: `apps/frontend`
- backend: `apps/backend`

## Next layer to add

The remaining platform work is mainly feature UI, not backend discovery:

- authenticated screens for login, profile, wallet, and rewards
- a launcher flow that chooses between multiple games/apps
- optional adapter layers for poker, arcade multiplayer, social features, or other game types
- a socket client wrapper once `socket.io-client` is added to this repo for products that need realtime sync
- per-product branding config so the same codebase can emit multiple branded builds
