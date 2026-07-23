# Deployment Guide

This guide covers deploying PetCare System's frontend, backend, and database to production, with step-by-step instructions for **Render**, **Railway**, and a **VPS**, plus an optional Docker path.

## Overview

| Component | Suggested Host | Notes |
|---|---|---|
| Frontend | Render (Static Site), Vercel, Netlify | Serves the Vite production build |
| Backend | Render (Web Service), Railway | Serves the Express REST API |
| Database | MongoDB Atlas | Managed MongoDB cluster |

**Recommended platform for this project: Render.** It hosts both a Node web service (backend) and a static site (frontend) under one account with a single `render.yaml` blueprint (included in this repo), has a straightforward persistent-disk add-on for the uploads-persistence issue described below, and its free tier is sufficient for a graduation demo. Railway is a solid alternative with a similar developer experience; a VPS gives full control but requires manually handling TLS, process management, and reverse-proxy configuration yourself.

---

## Before You Deploy: Repository Setup

1. Push the project to a GitHub repository (both `backend/` and `frontend/` in one repo, as in this project, or split into two repos — either works with the instructions below).
2. Confirm `.env` is **not** committed (`git status` should not show it) — both `backend/.gitignore` and `frontend/.gitignore` already exclude it.
3. Confirm `backend/.env.example` and `frontend/.env.example` are committed and up to date — they document every variable a deployer needs without exposing real values.

---

## 1. MongoDB Atlas

1. Create a free or paid cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Under **Database Access**, create a database user with a strong, unique password.
3. Under **Network Access**, add the IP address(es) of your backend host. Render and Railway use dynamic outbound IPs on most plans — if you can't pin a static IP, allow `0.0.0.0/0` (all IPs) and rely on the database username/password for access control; a fixed IP allowlist is safer wherever your plan supports it.
4. Under **Database → Collections**, confirm the collections and indexes match `docs/DATABASE_DOCUMENTATION.md` (Mongoose creates indexes automatically on first connection based on the schema definitions — no manual index creation is required).
5. Copy the connection string from **Connect → Drivers**:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/petcare_system
   ```
   This becomes your `MONGO_URI`.

---

## 2. Render Deployment

This repo includes a ready-to-use `render.yaml` blueprint at the project root, defining both services below declaratively — in the Render dashboard, choose **New → Blueprint** and point it at this repository to create both services in one step. Or configure them manually as follows.

### Backend (Web Service)
- **Root Directory**: `backend`
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables** (Dashboard → Environment):
  ```
  NODE_ENV=production
  PORT=5000
  MONGO_URI=<your Atlas connection string>
  JWT_SECRET=<a long random string>
  JWT_ACCESS_EXPIRES_IN=15m
  JWT_EXPIRES_IN=7d
  JWT_REFRESH_EXPIRES_DAYS=30
  CLIENT_URL=<your deployed frontend URL, e.g. https://petcare-frontend.onrender.com>
  SMTP_HOST=
  SMTP_PORT=587
  SMTP_USER=
  SMTP_PASS=
  EMAIL_FROM="PetCare System <no-reply@yourdomain.com>"
  GOOGLE_CLIENT_ID=<your Google OAuth Client ID>
  EMAIL_VERIFICATION_EXPIRES_HOURS=24
  PASSWORD_RESET_EXPIRES_MINUTES=60
  RESEND_VERIFICATION_COOLDOWN_MINUTES=2
  ```
- **Persistent Disk** (important): under the service's **Disks** tab, add a disk mounted at `/opt/render/project/src/backend/uploads` (already declared in `render.yaml`). Without this, every redeploy wipes uploaded product/pet/avatar images, since Render's default filesystem is ephemeral.

### Frontend (Static Site)
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
  ```
  VITE_API_BASE_URL=<your deployed backend URL, e.g. https://petcare-backend.onrender.com/api>
  VITE_GOOGLE_CLIENT_ID=<same Google OAuth Client ID as the backend>
  ```
- **Redirect/Rewrite rule**: add a rewrite from `/*` to `/index.html` (already declared in `render.yaml`) so client-side routes don't 404 on refresh.

---

## 3. Railway Deployment

1. Create a new project, then **Add Service → GitHub Repo**, once for the backend and once for the frontend (or use two separate Railway projects).
2. **Backend service**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - Add the same environment variables listed in the Render section above (Railway's Variables tab).
   - Railway's default filesystem is also ephemeral — attach a **Volume** mounted at `/app/uploads/products` if you need uploaded images to persist across redeploys.
3. **Frontend service**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: serve the `dist/` folder (Railway can auto-detect Vite, or use a static-file server like `serve -s dist`)
   - Set `VITE_API_BASE_URL` and `VITE_GOOGLE_CLIENT_ID` as build-time variables.
4. Railway auto-assigns a public domain per service — use the backend's domain for `CLIENT_URL`/`VITE_API_BASE_URL` cross-references, the same way as the Render instructions above.

---

## 4. VPS Deployment (Ubuntu example)

1. Provision a VPS (e.g. DigitalOcean, Linode, a cloud VM) and install Node.js ≥ 18, and either PM2 or systemd for process management.
2. Clone the repository and install dependencies:
   ```bash
   git clone <repository-url>
   cd petcare-system/backend && npm install
   cd ../frontend && npm install && npm run build
   ```
3. Create `backend/.env` with production values (same variables as above).
4. Run the backend as a persistent process:
   ```bash
   npm install -g pm2
   pm2 start server.js --name petcare-backend
   pm2 save && pm2 startup
   ```
5. Serve the frontend's `dist/` folder with nginx, and reverse-proxy `/api` to the Node process. Example nginx config:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       root /path/to/petcare-system/frontend/dist;
       index index.html;
       location / { try_files $uri $uri/ /index.html; }

       location /api/ {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
       location /uploads/ {
           proxy_pass http://localhost:5000;
       }
   }
   ```
6. Add HTTPS with Let's Encrypt (`certbot --nginx`) — required for the production cookie settings (`Secure`, `SameSite=None`) to work at all.
7. On a VPS, uploads on local disk persist naturally across app restarts (unlike Render/Railway's ephemeral containers) as long as you don't wipe the server's disk — still worth including the `uploads/` directory in your backup routine.

### Docker (optional, works on a VPS or any Docker host)

This repo includes a `docker-compose.yml` at the project root plus a `Dockerfile` in each of `backend/` and `frontend/`.

```bash
# from the project root, with a .env file providing the variables
# referenced in docker-compose.yml (JWT_SECRET, CLIENT_URL, SMTP_*, etc.)
docker compose up -d --build
```

This starts MongoDB, the backend, and an nginx-served frontend build together, with a named volume for both MongoDB data and uploaded images so they survive container restarts. For Render/Railway, use their native service configuration instead (above) — `docker-compose.yml` is intended for VPS/local use.

---

## Domain Configuration (optional)

1. Point your frontend domain (e.g. `www.yourdomain.com`) at your static host per its DNS instructions.
2. Point a subdomain (e.g. `api.yourdomain.com`) at your backend host.
3. Update `CLIENT_URL` on the backend and `VITE_API_BASE_URL` on the frontend to match the final domains.
4. Update the authorized origins/redirect URIs for your Google OAuth Client ID in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) to include the final production domain.

---

## Common Errors and Solutions

| Symptom | Cause | Solution |
|---|---|---|
| Frontend loads but every API call fails with a CORS error | `CLIENT_URL` on the backend doesn't exactly match the frontend's real deployed URL | Set `CLIENT_URL` to the exact frontend origin (including `https://`, no trailing slash) |
| Login succeeds but the user appears logged out after a refresh, or sessions never persist | Refresh-token cookie isn't being accepted cross-site | Confirm `NODE_ENV=production` is set on the backend (this project sets `sameSite: 'none'` + `secure: true` only when `NODE_ENV=production` — see `controllers/auth.controller.js`) and that both frontend and backend are served over HTTPS |
| Uploaded images return 404 or disappear after a redeploy | Uploads live on local disk, which is ephemeral on most PaaS platforms | Attach a persistent disk/volume mounted at the backend's `uploads/products` path (see the Render/Railway sections above) |
| Product/pet images show as broken images specifically on HTTPS pages, or a browser console "mixed content" warning appears | Backend not configured to trust the platform's reverse proxy, so generated image URLs use `http://` instead of `https://` | Confirm `app.set('trust proxy', 1)` is present in `server.js` (it is, as of this project's Step 21 deployment prep) |
| `MongoServerSelectionError` / connection timeout on boot | IP not whitelisted in Atlas Network Access, or wrong credentials in `MONGO_URI` | Double-check the Atlas Network Access list and the username/password in the connection string |
| Google Login button errors immediately when clicked | `VITE_GOOGLE_CLIENT_ID` (frontend) or `GOOGLE_CLIENT_ID` (backend) missing or mismatched, or the deployed domain isn't an authorized origin in Google Cloud Console | Set both to the same Client ID and add the production domain to the OAuth client's authorized origins |
| Verification/reset emails never arrive, but no error is shown | SMTP variables not configured — this is a deliberate fallback, not a bug (see `utils/email.js`) | Fill in `SMTP_HOST`/`PORT`/`USER`/`PASS` for real email delivery, or check server logs for the logged verification link in the meantime |
| Frontend shows a blank page on any route except `/` after a hard refresh | Static host isn't configured to fall back to `index.html` for unmatched routes (this is a client-side-routed SPA) | Add the rewrite/redirect rule described in the Render/nginx sections above |

---

## Post-Deployment Checklist

- [ ] Backend boots without error and connects to MongoDB Atlas
- [ ] Frontend loads and can reach the backend API (check the browser console for CORS errors)
- [ ] Register → verification email arrives (or check SMTP configuration if not)
- [ ] Login, Google login, and Admin login all work
- [ ] A test checkout completes successfully
- [ ] Image upload works and persists across a restart (persistent disk/volume attached)
- [ ] All environment variables are set on the actual hosting platform, not just locally
- [ ] `trust proxy` is enabled and generated image URLs use `https://`
