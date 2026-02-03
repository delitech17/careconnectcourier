# Deploy to Render — CareConnectCourier

This file contains the exact steps and environment variables to deploy the app to Render and verify admin authentication.

## 1) Create a Web Service on Render
- Connect your GitHub repository `careconnectcourier` to Render.
- Create a new **Web Service** (Node environment).
- Region: pick nearest (e.g., `oregon`).
- Plan: `free` or higher as needed.

## 2) Build & Start Commands
Render will run these commands (configured in `render.yaml`):
- Build command:

```bash
cd node_server && npm install
```

- Start command:

```bash
cd node_server && npm start
```

`server.js` serves static files from `../frontend` so a single service is sufficient.

## 3) Required Environment Variables (set these in Render Dashboard → Environment)
- `NODE_ENV=production`
- `PORT=3000` (Render sets a port automatically; keep this if needed)
- `APP_URL=https://<your-render-host>` (Render will provide the host)
- `ADMIN_TOKEN=<secure-admin-token>`  ← **replace demo-token-12345**
- `JWT_SECRET=<secure-jwt-secret>`
- `ALLOWED_ORIGINS=https://<your-render-host>` (use your app domain)
- `EMAIL_USER=<your-email@gmail.com>`
- `EMAIL_PASS=<gmail-app-password>`
- `RATE_LIMIT_MAX=200`
- `JSON_LIMIT=100kb`

Optional for debugging:
- `DEBUG_AUTH=true`

Important:
- Do NOT use `demo-token-12345` in production.
- Use long random strings for `ADMIN_TOKEN` and `JWT_SECRET`.

## 4) Quick Env Generation (locally)
Generate secure tokens:

```bash
# secure admin token (64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# jwt secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 5) Admin Auth Options (how it works after deploy)
- Legacy method: The app accepts the raw `ADMIN_TOKEN` in the Authorization header.
  - Example header: `Authorization: Bearer <ADMIN_TOKEN>`

- Recommended (JWT): Use the admin login endpoint to exchange `ADMIN_TOKEN` for a signed JWT:

1. Request JWT (send `ADMIN_TOKEN` in body):

```bash
curl -X POST -H "Content-Type: application/json" -d '{"token":"<ADMIN_TOKEN>"}' https://<your-render-host>/admin/login
```

Response:

```json
{ "ok": true, "token": "<JWT>", "expiresIn": "12h" }
```

2. Use returned JWT for subsequent admin requests:

```bash
curl -H "Authorization: Bearer <JWT>" https://<your-render-host>/admin/shipments
```

`adminAuth` middleware accepts either the raw `ADMIN_TOKEN` or a signed JWT which contains `{ admin: true }`.

## 6) Frontend API Base
- If frontend is served by the same Render service (recommended), `API_BASE` will default to relative path and no change is needed.
- If hosting frontend separately, update `frontend/admin/js/admin-shipments-list.js` to set `API_BASE` to your Render URL or set `window.__API_BASE__` before loading scripts.

Example to inject when hosting separately (in HTML head):

```html
<script>
  window.__API_BASE__ = 'https://<your-render-host>';
</script>
```

## 7) Testing After Deploy
- Quick curl test (use ADMIN_TOKEN or JWT):

```bash
# Using ADMIN_TOKEN (not recommended long term)
curl -i -H "Authorization: Bearer <ADMIN_TOKEN>" https://<your-render-host>/admin/shipments

# Using JWT
# 1) get jwt
curl -X POST -H "Content-Type: application/json" -d '{"token":"<ADMIN_TOKEN>"}' https://<your-render-host>/admin/login
# 2) call endpoint
curl -i -H "Authorization: Bearer <JWT>" https://<your-render-host>/admin/shipments
```

- Browser test (if frontend served by same origin):

Open your admin page, login with `ADMIN_TOKEN` at `/admin/index.html` (the app will store token in `localStorage`), then visit `/admin/shipments-list.html`.

## 8) Post-deploy: tighten CORS
- After confirming everything works, set `ALLOWED_ORIGINS` to the exact origin(s) used (no `*`).
- Disable `DEBUG_AUTH`.

## 9) Rollback & Troubleshooting
- If you get `401 Unauthorized`:
  - Ensure `ADMIN_TOKEN` and `JWT_SECRET` match the values you used for login/test.
  - Temporarily enable `DEBUG_AUTH=true` to print incoming Authorization headers to Render logs.
  - Verify `ALLOWED_ORIGINS` includes your frontend origin.

## 10) Checklist (before switching to production)
- [ ] `ADMIN_TOKEN` set to a secure random token
- [ ] `JWT_SECRET` set securely
- [ ] `ALLOWED_ORIGINS` configured to exact domain
- [ ] `EMAIL_USER`/`EMAIL_PASS` configured and tested
- [ ] `DEBUG_AUTH` disabled

---

If you want I can:
- Update HTML to inject `window.__API_BASE__` automatically, or
- Add a tiny admin UI to request a JWT (so you don't need curl/Postman).

