# Deploy Expo Web To S3 And CloudFront

This project should use a split hosting model:

- Frontend: S3 + CloudFront
- Backend API and sockets: EC2 + Nginx + PM2
- Data and realtime infrastructure: MongoDB + Redis on the backend host

Do not build the web frontend on the `t2.micro` backend instance. Export the site locally or in CI, then push only the generated static files to S3.

## 1. Configure frontend env

Create a local `.env` file from the checked-in example:

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

Required values:

- `EXPO_PUBLIC_APP_ENV=staging`
- `EXPO_PUBLIC_API_BASE_URL=https://staging.21-holdem.com`
- `EXPO_PUBLIC_SOCKET_BASE_URL=wss://staging.21-holdem.com`

These values are baked into the exported frontend bundle at build time.

## 2. Build the static site

```bash
npm run frontend:export
```

Expo writes the deployable site to `apps/frontend/web-build/`.

## 3. Upload the build to S3

Example AWS CLI sync:

```bash
aws s3 sync apps/frontend/web-build s3://YOUR_FRONTEND_BUCKET --delete
```

Recommended bucket usage:

- Keep the bucket dedicated to the frontend build.
- Upload the contents of `apps/frontend/web-build/` to the bucket root.
- Version through CloudFront invalidations or object hashes, not by mixing builds in the same prefix.

## 4. Put CloudFront in front of the bucket

Minimum CloudFront setup:

- Origin: the S3 bucket that contains the exported site
- Default root object: `index.html`
- Custom domain: your public web domain
- TLS certificate: ACM certificate for that web domain
- Viewer request function: `infra/cloudfront/viewer-request-rewrite.js`

Why the function matters:

- Expo web export emits files such as `index.html`, `settings.html`, and `how-to-play.html`
- Browsers request `/settings`, not `/settings.html`
- CloudFront should rewrite extensionless requests to the matching `.html` file

## 5. Route rewrite function

Use the function in `infra/cloudfront/viewer-request-rewrite.js`.

It handles:

- `/` -> `/index.html`
- `/settings` -> `/settings.html`
- `/how-to-play` -> `/how-to-play.html`
- `/folder/` -> `/folder/index.html`

## 6. Backend integration checklist

- Set `EXPO_PUBLIC_API_BASE_URL` to the Nginx-backed API origin
- Set `EXPO_PUBLIC_SOCKET_BASE_URL` to the secure websocket origin if sockets share that same host
- Allow the frontend origin in backend CORS configuration
- If websocket origin checks are enabled, allow the frontend domain there too

## 7. Verify after deploy

- Open the CloudFront-backed frontend root path
- Hard refresh direct routes like `/settings` and `/how-to-play`
- Confirm the app shows the expected backend target on the home screen
- Confirm API calls go to `https://staging.21-holdem.com`
- Confirm websocket connections use `wss://...` once multiplayer wiring is added
