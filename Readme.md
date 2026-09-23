# Create the Vite Frontend and Proxy

This README explains, step by step, what was done to satisfy the prompt:

> Create `apps/frontend` as a React + TypeScript Vite application using `@vitejs/plugin-react`.
> Configure: dev server port 5173, proxy `/api` to `http://127.0.0.1:3001`.
> The frontend must call relative URLs such as `/api/work-orders` and `/api/dashboard/summary`.
> Do not add a state-management library or UI framework yet.

## 1. Inspected the existing workspace

The repo is an npm workspaces monorepo (`apps/*`, `packages/*`). Before creating anything,
the existing structure was checked:

- `apps/frontend` already existed as an empty stub, with just a `package.json` and
  `tsconfig.json` (no source code yet).
- `apps/backend` is a Fastify server that listens on `127.0.0.1:3001` (see
  `apps/backend/src/server.ts`) — this confirmed the exact proxy target to use.
- `tsconfig.base.json` at the root defines the shared strict TypeScript compiler options
  that every workspace package extends.

## 2. Filled in `apps/frontend/package.json`

Added the scripts and dependencies needed to run Vite with React:

- **scripts**: `dev` (`vite`), `build` (`vite build`), `preview` (`vite preview`)
- **dependencies**: `react`, `react-dom`, plus the existing internal `@equipment-hub/contract`
- **devDependencies**: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`,
  `@types/react-dom`

No UI framework (e.g. MUI, Chakra) or state-management library (e.g. Redux, Zustand) was
added, per the prompt.

## 3. Created `apps/frontend/vite.config.ts`

Configured:

```ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
      },
    },
  },
});
```

This makes the dev server run on port `5173` and forward any request starting with `/api`
to the backend at `127.0.0.1:3001`.

## 4. Created the minimal app source

- `index.html` — Vite entry HTML, loads `/src/main.tsx`
- `src/main.tsx` — mounts `<App />` into `#root` with `React.StrictMode`
- `src/App.tsx` — a minimal component that demonstrates calling the backend using a
  **relative** URL (`fetch("/api/dashboard/summary")`), exactly as the prompt requires —
  no hardcoded host/port, so it works through the Vite proxy in dev and behind any reverse
  proxy in production.
- `src/vite-env.d.ts` — Vite/TypeScript client type reference

## 5. Updated `apps/frontend/tsconfig.json`

Extended the shared `tsconfig.base.json` and added the settings a browser React app needs
that a Node backend doesn't:

- `module: "ESNext"`
- `lib: ["ES2022", "DOM", "DOM.Iterable"]`
- `jsx: "react-jsx"`
- `noEmit: true` (Vite handles bundling, TypeScript is only used for type-checking)

## 6. Installed dependencies and verified

From the repo root:

```bash
npm install
```

This resolved the new frontend dependencies into the workspace.

Then verified the setup actually works:

- `npm run build -w @equipment-hub/frontend` → production build succeeds.
- Started the dev server (`npx vite --port 5173`) and confirmed it responds with
  `HTTP 200` on `http://localhost:5173/`.

## Result

`apps/frontend` is now a working Vite + React + TypeScript app that:

- Runs on `http://localhost:5173` in dev mode.
- Proxies any `/api/*` request to the Fastify backend on `http://127.0.0.1:3001`.
- Talks to the backend exclusively through relative URLs (e.g. `/api/work-orders`,
  `/api/dashboard/summary`), so no CORS configuration or hardcoded backend URL is needed.
- Contains no state-management library or UI framework — just plain React — leaving those
  decisions for a later prompt.

## Running the app in Windows Terminal

The frontend needs the backend running at the same time (the Vite dev server only proxies
`/api` requests to it — it doesn't start it). Open **two** Windows Terminal tabs/panes from
the repo root:

**Tab 1 — start the backend (Fastify, port 3001):**

```powershell
npm run dev -w @equipment-hub/backend
```

**Tab 2 — start the frontend (Vite, port 5173):**

```powershell
npm run dev -w @equipment-hub/frontend
```

Then open **http://localhost:5173** in your browser. Requests the frontend makes to
`/api/...` are proxied to `http://127.0.0.1:3001` automatically.

> First time only: run `npm install` once from the repo root before starting either tab.
