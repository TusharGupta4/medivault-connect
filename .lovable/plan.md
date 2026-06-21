
## MediVault Frontend — Foundation Pass

Goal: lay a clean, production-quality scaffold the rest of the feature pages can plug into without rework. Uses react-router-dom (per your choice) inside this Vite project, talking to the existing Django backend via Axios.

Note: this Lovable workspace is a TanStack Start template. Forcing react-router-dom means I'll remove the TanStack routing layer and replace it with a standard Vite + React entry. The Lovable preview will still render the SPA, but server-side rendering and TanStack file-based routing are dropped — your call, as confirmed.

### Folder structure

```text
src/
├── api/
│   └── client.ts              Axios instance + interceptors
├── services/
│   ├── auth.ts                login, register, refresh, me
│   ├── patients.ts            (stubs, wired in next pass)
│   ├── doctors.ts
│   ├── accessRequests.ts
│   ├── emergencyContacts.ts
│   ├── reports.ts
│   └── prescriptions.ts
├── context/
│   └── AuthContext.tsx        user, token, role, login/logout
├── hooks/
│   ├── useAuth.ts
│   └── use-mobile.tsx         (kept)
├── routes/
│   ├── AppRouter.tsx          BrowserRouter + route tree
│   ├── ProtectedRoute.tsx     auth + role guard
│   └── PublicOnlyRoute.tsx    redirects logged-in users to their dashboard
├── layouts/
│   ├── AuthLayout.tsx         centered card for login/register
│   ├── PatientLayout.tsx      sidebar + topbar + <Outlet/>
│   └── DoctorLayout.tsx       sidebar + topbar + <Outlet/>
├── components/
│   ├── ui/                    (existing shadcn primitives kept)
│   ├── Sidebar.tsx
│   ├── Topbar.tsx
│   ├── DashboardCard.tsx
│   ├── PageHeader.tsx
│   ├── EmptyState.tsx
│   ├── LoadingState.tsx
│   └── ErrorState.tsx
├── pages/
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── patient/
│   │   ├── Dashboard.tsx
│   │   └── (Profile/Doctors/AccessRequests/EmergencyContacts/Reports/Prescriptions → next pass, placeholder stubs now so routes resolve)
│   └── doctor/
│       ├── Dashboard.tsx
│       └── (Profile/Patients/AccessHistory/Reports/Prescriptions → placeholder stubs)
├── utils/
│   ├── token.ts               localStorage get/set/clear for access + refresh
│   └── roles.ts               role constants + helpers
├── main.tsx                   new Vite entry (replaces TanStack bootstrap)
└── styles.css                 (kept, Tailwind v4)
```

### Tech & conventions

- Routing: `react-router-dom` v6, `BrowserRouter`, nested routes via `<Outlet/>`.
- HTTP: single Axios instance, `baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/"`.
- Auth storage: access + refresh tokens in `localStorage` (matches docs' JWT flow). Request interceptor injects `Authorization: Bearer <access>`. Response interceptor on 401 tries `/auth/refresh/`; on failure, clears tokens and redirects to `/login`.
- Role redirects post-login: `PATIENT → /patient/dashboard`, `DOCTOR → /doctor/dashboard`.
- `ProtectedRoute` accepts `allowedRoles` and renders `<Navigate to="/login" />` (unauth) or `/unauthorized` (wrong role).
- State: React Context for auth; TanStack Query stays installed for data fetching in feature pages (already in template), but no SSR.
- Forms: react-hook-form + zod (already installed).
- Toasts: sonner (already installed).
- Styling: existing Tailwind v4 tokens in `src/styles.css`; refine palette to a calm clinical theme (deep teal primary, soft slate neutrals, white surfaces, success green, warning amber, danger red). No hard-coded hex in components — tokens only.

### Routing map

```text
/                              → redirect based on auth/role
/login                         (PublicOnly) AuthLayout
/register                      (PublicOnly) AuthLayout
/unauthorized                  standalone

/patient                       (Protected: PATIENT) PatientLayout
  /dashboard
  /profile
  /doctors
  /access-requests
  /emergency-contacts
  /reports
  /prescriptions

/doctor                        (Protected: DOCTOR) DoctorLayout
  /dashboard
  /profile
  /patients
  /access-history
  /reports
  /prescriptions

*                              → 404 page
```

### Auth flow (this pass)

1. `Login.tsx` posts to the auth login endpoint from `MEDIVAULT_API_DOCS.md`, stores tokens, fetches `me` to get role, then navigates to the role's dashboard.
2. `Register.tsx` posts to register, then either auto-logs in or routes to `/login` depending on what the docs return (I'll match the documented response shape exactly — no invented fields).
3. `AuthContext` hydrates on mount from stored tokens by calling `me`; while loading, app shows a splash to avoid route flicker.
4. Logout clears tokens, resets context, navigates to `/login`.

### Dashboards (this pass)

Both dashboards render a welcome header, the user's name/role, and a grid of `DashboardCard` quick-links to the feature pages. Real metrics get wired when each feature page lands.

### What's stubbed vs built now

Built and wired end-to-end:
- Axios client + interceptors
- Auth context, login, register, logout, refresh
- Protected + public-only routes, role redirects
- Patient and Doctor layouts (sidebar + topbar, responsive: drawer on mobile)
- Patient dashboard, Doctor dashboard
- Shared UI: PageHeader, DashboardCard, LoadingState, EmptyState, ErrorState
- 404 + Unauthorized pages

Stub pages (route resolves, renders a "Coming soon" placeholder using PageHeader) so navigation works today and feature passes can drop content in without route work:
- Patient: Profile, Doctors, Access Requests, Emergency Contacts, Reports, Prescriptions
- Doctor: Profile, Patients, Access History, Reports, Prescriptions

### Technical details

- Remove TanStack routing: delete `src/router.tsx`, `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/routeTree.gen.ts`, `src/server.ts`, `src/start.ts`. Replace with `src/main.tsx` mounting `<AppRouter/>`.
- `bun add react-router-dom axios @fontsource/inter`. Keep existing Tailwind, shadcn, sonner, react-hook-form, zod, @tanstack/react-query (used later for data fetching).
- `vite.config.ts`: drop the TanStack/Lovable TanStack plugin, keep `@vitejs/plugin-react`, alias `@ → src`. Project will no longer SSR; Lovable preview serves the SPA.
- `index.html`: add root div + main.tsx script.
- Env: `.env.example` documents `VITE_API_BASE_URL`. Default falls back to `http://localhost:8000/api/`.
- Endpoint URLs come strictly from `MEDIVAULT_API_DOCS.md`. I will read the relevant sections (Authentication for this pass) before implementing each call and won't invent fields.

### Run locally

```bash
bun install
echo 'VITE_API_BASE_URL=http://localhost:8000/api/' > .env
bun run dev
```

### Out of scope this pass

Feature pages' real CRUD (profiles, doctor search, access requests, emergency contacts, reports upload/list, prescriptions). Those are the next pass — each becomes one focused delivery built on this foundation.
