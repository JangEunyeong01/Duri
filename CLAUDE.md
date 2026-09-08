# CLAUDE.md

This file records the project conventions applied when using an AI coding assistant on this repository — response envelope handling, routing rules, auth rules, and design-token usage.

## Repo layout

This repository holds the frontend only. It was originally the `frontend/` folder of a larger monorepo (sibling dirs: a Spring MVC backend, a recommendation/ingest engine, and API spec docs), split out here as a standalone, single-owner snapshot. The backend endpoint contract it was built against is summarized below; no backend source lives in this repo.

## Commands

```bash
npm run dev       # start Vite dev server
npm run build      # production build
npm run preview     # preview a production build locally
npm test          # run unit tests once (Vitest)
npm run test:watch # run unit tests in watch mode
```

Tests: Vitest + `@vue/test-utils`, configured inside `vite.config.js` (not a separate config file) with `environment: 'jsdom'` and `include: ['src/**/*.spec.js']`. Spec files live next to the code they cover (`src/api/response.spec.js`, `src/composables/useTheme.spec.js`, ...). Follow that colocation when adding tests.

There is no lint setup (no ESLint/Prettier config) — don't assume `npm run lint` exists.

## Architecture

Vue 3 (`<script setup>`) + Vite + Vue Router + Pinia. No UI framework — all styling is hand-written CSS using design tokens.

- `src/main.js` — app entry; registers Pinia and the router, imports `src/assets/styles/tokens.css` globally.
- `src/router/index.js` — single flat route table (no nested/lazy routes). All views are eagerly imported. Static paths are listed before sibling dynamic `:id` paths by convention (e.g. `/cards/register` before `/cards/:id`) — preserve this ordering when adding routes.
  - **Auth guard**: protected routes declare `meta: { requiresAuth: true }`; a single `router.beforeEach` redirects to `/auth/login` when `useAuthStore().isLogin()` is false. Add the `meta` flag to a new route rather than checking auth inside the view.
  - Public routes (no flag), two groups:
    - Auth/onboarding: `/auth/terms`, `/auth/signup`, `/auth/login`, `/auth/password-change`, `/onboarding`.
    - **The five bottom-nav tabs**: `/home`, `/cards`, `/payment`, `/points`, `/settings`. These are deliberately public — each view branches on `isLogin`, skips its data fetches when logged out, and renders a "로그인이 필요합니다 / 로그인 후 이용할 수 있어요" prompt instead. Guarding them makes that logged-out UI unreachable dead code and breaks the "나중에 하기" buttons on login/signup, which push to `/home`. Their *sub*-routes (`/cards/register`, `/cards/:id`, `/settings/account`, ...) stay guarded.
  - Unknown paths hit the `/:pathMatch(.*)*` catch-all and redirect to `/home` (no 404 view).
- `src/api/` — one file per backend domain (`authApi.js`, `walletApi.js`, `memberApi.js`, ...), each exporting plain functions that call the shared `axios.js` instance. `axios.js` hardcodes `baseURL: 'http://localhost:8080'` (dev-only; no env-based config yet).
  - `axios.js` also owns auth plumbing: a request interceptor attaches the stored `Bearer` token, and a response interceptor retries once on 401 after calling `POST /api/auth/token`. Concurrent 401s are queued and replayed with the new token; if the refresh itself fails it logs out and redirects to `/auth/login`. Don't add per-call token handling.
  - **A 401 with no stored token is not an expired session** — it's a logged-out visitor on a public tab. The interceptor returns that 401 as-is instead of attempting a refresh, so don't remove that check: without it every public tab bounces to `/auth/login` (via the "로그인이 만료되었습니다" redirect) a moment after it renders. An *expired* token still has its string in `localStorage`, so the normal refresh path is unaffected.
  - `src/api/response.js` — `unwrapResponse()` is the ONLY place the success/failure envelope is unwrapped; `src/utils/apiError.js` — `getErrorMessage()` is the only place a user-facing error string is chosen. Route new API calls through both rather than reading `response.data.data` directly.
- `src/stores/` — Pinia stores using the setup-function style (`defineStore('name', () => {...})`), not the options style. Naming is inconsistent across the codebase (`authStore.js`/`cardStore.js`/`tutorialStore.js` vs `payment.js`/`personalization.js`) — check existing file names before adding a new store.
- `src/views/` — route-level components, grouped by domain (`auth/`, `main/`, `card/`, `payment/`, `transaction/`, `point/`, `settings/`, `notification/`, `onboarding/`, `design/`).
- `src/components/` — grouped by the same domains as `views/`, plus `common/` (generic UI primitives: `AppButton`, `AppInput`, `BaseCard`, `ConfirmModal`, `SkeletonLoader`, `EmptyStateCard`, etc.) and `layout/` (`BottomNavigation`, etc.).
- `src/assets/styles/tokens.css` — CSS custom properties (colors, typography, spacing, radius, transitions, z-index) imported globally in `main.js`. Components should consume `var(--...)` tokens rather than hardcoding colors/sizes; check this file before introducing a new value.
- Auth state (`stores/authStore.js`) persists `token`/`user` to `localStorage` manually (no auto-sync plugin); `setLogin`/`logout`/`updateUser` are the only mutation points — call these rather than writing to `localStorage` directly.

## Backend API contract

The full endpoint specs (member/card/payment/transaction/point domains, plus the recommendation/benefit-calculation engine) lived in the original monorepo's `docs/` folder and aren't included here. Key conventions this frontend was built against when wiring up `src/api/*`:

- **Response envelope**: success responses are `{ success: true, code: "SUCCESS", data: {...}, message: null }`; failures are `{ success: false, code, message, errors: [] }`. Branch on `code`, not on `message` text.
- **Auth**: all endpoints require `Authorization: Bearer <JWT>`; the member id is derived from the token server-side, never sent in the request body.
- **Fields**: API JSON is camelCase (backend converts from snake_case DB columns).
- **Money**: integers, in KRW (원); no decimals.
- **Ownership**: requesting another user's resource returns `404 NOT_FOUND`, not `403`.
- **Labeling**: recommendation/benefit-explanation UI copy should read "추천 결과/추천 근거", not "AI 추천/AI 브리핑" — the engine computes the numbers, the LLM only phrases them.
