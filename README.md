# New Game 01

A reusable Expo/React Native starter for shipping mobile-first games with a working gameplay shell instead of a blank app.

## Included

- File-based native navigation with an iOS-friendly modal settings flow.
- Safe-area aware layout for notches, status bars, and the home indicator.
- Runtime orientation control with portrait, landscape, and adaptive modes.
- Native haptics hooks for menus, pickups, hits, and gameplay actions.
- Touch-first HUD with a virtual joystick, boost hold button, and pulse action.
- A sample game loop you can replace while keeping the app shell intact.
- Persisted settings for handedness, haptics, keep-awake, and motion preferences.
- EAS build configuration for internal preview and production builds.

## Stack

- Expo SDK 54
- React Native 0.81
- Expo Router
- TypeScript
- Async Storage
- Expo Haptics
- Expo Screen Orientation
- Expo Keep Awake

## Project layout

- `app/`: navigation routes and screen entry points.
- `src/components/`: reusable shell, UI, and touch controls.
- `src/game/`: sample world state, update loop, and game rendering.
- `src/platform/`: shared hub integration for auth, profile, wallet, rewards, product catalog, and optional game adapters.
- `src/services/`: device services such as haptics and orientation.
- `src/store/`: persisted runtime settings.

## Platform starter

This workspace is the reusable client starter for the shared hub backend.

Shared platform responsibilities now include:

- auth and session bootstrap
- persisted hub token handling
- profile and player settings endpoints
- chips, transactions, and daily rewards endpoints
- optional game adapters such as poker tables or other realtime modes
- product catalog metadata for multiple games/apps

See `docs/architecture/platform-template-architecture.md` for the current shared-platform shape.

## Run it

From the project root:

```bash
npm start
npm run web
npm run check
```

## Frontend env

Copy `.env.example` to `.env` and point the frontend at the EC2 API.

Set:

- `EXPO_PUBLIC_APP_ENV=staging`
- `EXPO_PUBLIC_API_BASE_URL=https://staging.21-holdem.com`
- `EXPO_PUBLIC_SOCKET_BASE_URL=wss://staging.21-holdem.com`

## Deploy web to S3 + CloudFront

This frontend should be built locally or in CI and deployed as static files. Do not install or build the React toolchain on the `t2.micro` backend box.

Create the static export:

From the project root:

```bash
npm run export:web
```

That generates the site in `web-build/`.

Deployment steps:

1. Upload `web-build/` to an S3 bucket that is dedicated to the web app.
2. Put CloudFront in front of that bucket.
3. Attach the rewrite function in `infra/cloudfront/viewer-request-rewrite.js` so extensionless Expo routes like `/settings` resolve to `/settings.html`.
4. Point your frontend domain at CloudFront.
5. Keep the API on EC2 behind `https://staging.21-holdem.com`.

Detailed AWS notes live in `docs/frontend/deploy-web-aws.md`.

## GitHub quick start

```bash
git init
git add .
git commit -m "Initial mobile game template"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## What to replace for your game

1. Replace the sample entity logic in `src/game/world.ts`.
2. Replace the temporary UI copy in `app/index.tsx`, `app/settings.tsx`, and `app/how-to-play.tsx`.
3. Add your real app icon, splash art, fonts, sounds, and branding.
4. Update `app.config.ts` bundle identifiers, app name, slug, and scheme.
5. Replace `.env.example` values with your real API, socket, and environment settings.
6. Add analytics, saves, backend, and monetization only after the core loop is stable.

## Shipping checklist

1. Test safe areas, rotation, and touch controls on a physical iPhone and iPad.
2. Replace placeholder identifiers in `app.config.ts`.
3. Add App Store metadata, screenshots, privacy policy, and support URL.
4. Create an Expo project and connect EAS.
5. Run `eas build --platform ios --profile production`.
6. Validate the release build on-device before App Store submission.

## Notes

- `ios.requireFullScreen` is enabled so orientation locking remains reliable on iPad.
- The sample loop is intentionally simple. The template value is the mobile shell around it.
- If dependency versions drift, run `npx expo install --fix` to align with the current SDK.
- The recommended web topology is `CloudFront -> S3` for the frontend and `Nginx -> PM2 Node -> MongoDB/Redis` for the backend.
- Native features like haptics and device rotation behavior still need testing on a real iPhone or iPad.
