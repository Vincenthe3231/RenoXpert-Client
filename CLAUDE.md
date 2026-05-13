# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**RenoXpert-Client** = monorepo (Turborepo + pnpm) with 2 Next.js 16 apps sharing UI patterns. Both apps communicate w/ Laravel backend via Next.js API routes (proxy pattern). Currently on branch `feature/staff-roles`.

### Apps
- **staff-portal** (port 3001): Staff management — role-based access control (CASL), audit trail, onboarding workflows
- **client-app** (port 3000): Public client interface
- **website** (mentioned in docs, status unclear)

### Tech Stack
- **Frontend**: React 19, Next.js 16, TypeScript 5, Tailwind CSS 4, Radix UI
- **Routing**: TanStack Router (mentioned in root README, but Next.js App Router used in practice)
- **State**: React Query (server state) + Context API (client state)
- **Build**: Turborepo + pnpm + Turbopack (enabled)
- **Validation**: Zod
- **Backend**: Laravel (separate repo) via `LARAVEL_API_URL` env var

---

## Commands

### Development
```bash
pnpm dev                                # Start both apps (3000, 3001)
pnpm --filter staff-portal dev          # Staff portal only (port 3001)
pnpm --filter client-app dev            # Client app only (port 3000)
```

### Build & Test
```bash
pnpm build                              # Build all via Turbo
pnpm --filter staff-portal build        # Build staff-portal only
pnpm --filter staff-portal test         # Run tests (watch: add --watch)
pnpm lint                               # Lint all
pnpm format                             # Prettier format
```

### Docker
```bash
# Build images (multi-stage: Node → nginx)
docker build -t renoxpert/staff-portal -f apps/staff-portal/Dockerfile .
docker build -t renoxpert/client-app -f apps/client-app/Dockerfile .

# Run (nginx on container port 80)
docker run --rm -p 3001:80 -e VITE_API_URL=http://localhost:8000 renoxpert/staff-portal
docker run --rm -p 3000:80 -e VITE_API_URL=http://localhost:8000 renoxpert/client-app
```

---

## Architecture Essentials

### Three-Layer API Pattern
1. **Frontend** → calls `/api/*` (relative URLs via axios)
2. **Next.js API Routes** → proxy layer; forwards cookies; transforms camelCase ↔ snake_case
3. **Laravel Backend** → at `LARAVEL_API_URL/api/v1/*`

**Why**: Hide backend URL from frontend. Auth state flows via cookies. Data transforms automatic (axios interceptors).

### Example Data Flow (Onboarding)
```
Component (useOnboardings hook)
  → src/lib/api/onboarding/onboarding.ts (axios.get('/api/onboarding'))
  → src/app/api/onboarding/route.ts (extract cookies, forward to Laravel)
  → Laravel GET /api/v1/onboarding
  → Response (snake_case) → transform → camelCase response
  → Component (Zod-validated typed data)
```

### Layouts & State Persistence
- **Root layout** (`src/app/layout.tsx`): Server Component — global providers (Query, Theme, Auth)
- **Dashboard layout** (`src/app/(DashboardLayout)/layout.tsx`): Client Component (stateful) — sidebar, header state persists across nav
- **Context + localStorage**: CustomizerContext persists layout prefs, theme

### Staff-Portal Specific
- **CASL integration** (`@casl/react`, `@casl/ability`) — role-based access control (Already wired — check auth middleware for `defineAbility`)
- **Audit trail**: AuditTable component in app; see `apps/staff-portal/docs/` for audit implementation notes
- **Onboarding flows**: Multi-step workflows w/ approval chains
- **Department management**: Short codes, deleted dept fallbacks (recent work per git log)

---

## Key Files & Patterns

### staff-portal Structure
```
src/app/
  (auth)/login/             ← Public login
  (DashboardLayout)/        ← Main layout (stateful Client Component)
    onboarding/             ← Onboarding workflows
    users/                  ← User management w/ roles
    departments/            ← Department CRUD (recent feature)
  api/                      ← Proxy routes (auth, onboarding, etc.)

src/lib/api/                ← Frontend API functions
  auth/
    auth.ts                 ← Login, logout, refresh
    auth.schemas.ts         ← Zod validation
    auth.hooks.ts           ← useAuth(), useLogin() etc.
  onboarding/
    onboarding.ts           ← getOnboardings(), approveOnboarding()
    onboarding.schemas.ts
    onboarding.hooks.ts
  axios.ts                  ← Axios config + interceptors (camelCase transform)

src/components/             ← UI (Radix + shadcn)
  ui/                       ← shadcn components
  
src/providers/
  AuthProvider.tsx          ← Auth context (session, login/logout)
```

### State Patterns
- **Server State**: React Query hooks (caching, refetch, stale time)
- **Client State**: Context + useState for UI toggles, filters
- **Persistence**: localStorage for theme, layout prefs; cookies for auth tokens

### API Layer Conventions
- Frontend calls `/api/*` routes (relative)
- Routes forward to `process.env.LARAVEL_API_URL/api/v1/*`
- All responses validated w/ Zod before returning to component
- Cookies auto-forwarded; CSRF token from Sanctum

---

## Monorepo Notes

### Turborepo Task Deps
- `build` depends on `^build` (deps must build first)
- `start` depends on `build`
- `dev` + `lint` have no dependencies (can run in parallel)

### Workspace Layout
```
packages/                   ← Shared (currently empty in repo; @repo/ui not yet extracted)
apps/staff-portal/
apps/client-app/
pnpm-workspace.yaml         ← Defines workspace roots
turbo.json                  ← Task configs
```

Shared code currently lives in each app; future: extract to `packages/` if needed.

---

## Environment Setup

### Required `.env` Files
```bash
# apps/staff-portal/.env
LARAVEL_API_URL=http://localhost:8000

# apps/client-app/.env
LARAVEL_API_URL=http://localhost:8000
```

### Node/pnpm Versions
- Node.js: v18+
- pnpm: 8.15.6+ (configured in root package.json)

---

## Documentation Pointers

**staff-portal** has detailed docs:
- `docs/ARCHITECTURE.md` — System design, layer diagram, patterns (comprehensive)
- `docs/AUDIT_TRAIL_IMPLEMENTATION_GUIDE.md` — Audit log setup
- `docs/DATA_FLOW.md` — Onboarding data flow
- `docs/TO_DO.md` — Known tasks
- `docs/CHECKLIST.md` — Feature checklist

**client-app**:
- `USER_CONTEXT_GUIDE.md` — User auth context, hooks, examples

---

## Common Workflows

### Add New API Endpoint
1. Create `src/lib/api/feature/feature.ts` — axios calls relative `/api/feature`
2. Create `src/lib/api/feature/feature.schemas.ts` — Zod validation (request + response)
3. Create `src/lib/api/feature/feature.hooks.ts` — React Query hooks
4. Create `src/app/api/feature/route.ts` — Proxy: forward to `/api/v1/feature` on Laravel, transform response
5. Use hook in component: `const { data } = useFeature()`

### Add New Page
1. Create `src/app/(DashboardLayout)/feature/page.tsx`
2. Use React Query hooks for data
3. Components automatically get layout, sidebar, auth guard via layout hierarchy

### Modify UI Component
- Copy shadcn component to `src/components/ui/` (if not present) — customize variants, styling
- Use in pages/components with CVA (class-variance-authority) for variants

### Run Single Test
```bash
pnpm --filter staff-portal test -- path/to/test.test.ts
```

---

## Notes on Current Branch (`feature/staff-roles`)

Per git log:
- Recent: staff-portal dept management improvements (short code display, deleted dept fallbacks, AuditTable enhancements)
- Auth & roles framework in place (CASL ready)
- Likely: adding staff role permissions or department-level access control

---

## Security & Best Practices

1. **Backend URL**: Only in `.env` (server-side). Never expose `LARAVEL_API_URL` to client.
2. **Cookies**: Forwarded by proxy routes; Sanctum handles CSRF.
3. **Validation**: All API responses validated w/ Zod before use.
4. **Types**: Full TypeScript — use Zod schemas as single source of truth for API contracts.
5. **Avoid**: Don't call Laravel API directly from frontend — use proxy routes.

---

## Troubleshooting

**Build fails**: `pnpm install` to ensure deps; check `turbo.json` task order.  
**Port conflict**: `pnpm dev` runs on 3000 (client) + 3001 (staff-portal); ensure free.  
**Auth loop**: Check `LARAVEL_API_URL` is correct; verify backend is running.  
**Zod validation error**: API response doesn't match schema — check Laravel response format, backend version.  
**localStorage not persisting**: Browser private mode blocks — test in normal mode.

---

## IDE Setup

- VS Code workspace config: `renoxpert-client.code-workspace`
- Both apps + root folder open side-by-side
- ESLint + Prettier configured; format on save recommended
