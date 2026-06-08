# نادي النخبة — لوحة التحكم

Arabic RTL admin-only web app for a summer camp called "نادي النخبة". Private management dashboard for the founder/admin to manage camp participants.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/admin-dashboard run dev` — run the frontend (port 22133)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, Wouter routing, TanStack Query
- Arabic RTL UI, Tajawal Google font, dark green + gold palette
- API: Express 5 + express-session (cookie-based auth)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/participants.ts` — participants table schema
- `artifacts/api-server/src/routes/` — auth, participants, stats routes
- `artifacts/api-server/src/middlewares/requireAuth.ts` — session auth middleware
- `artifacts/admin-dashboard/src/pages/` — Login, Dashboard, Participants, ParticipantForm
- `artifacts/admin-dashboard/src/components/Layout.tsx` — sidebar layout

## Architecture decisions

- Cookie-based session auth using `express-session` + `SESSION_SECRET`; credentials checked against `ADMIN_USERNAME`/`ADMIN_PASSWORD` env vars — no user table in DB
- Participant `status` (نشط/منتهي) is computed at query time by comparing `end_date` to today, never stored
- Orval generates `z.coerce.date()` for OpenAPI `format: date` fields → routes convert `Date` objects to `YYYY-MM-DD` strings with a `toDateStr()` helper before inserting into Drizzle
- CORS configured with `credentials: true` so session cookies are forwarded from the Vite dev proxy to the Express API

## Product

- صفحة تسجيل الدخول — secure admin login, no public signup
- لوحة التحكم — stats cards: total participants, paid amounts, remaining amounts, active/expired counts
- جدول المشتركين — searchable + filterable participant table with CSV export and print
- إضافة / تعديل مشترك — full Arabic form with validation, Saudi phone format, grade level + duration dropdowns
- حذف مشترك — confirmation dialog before delete

## User preferences

- Entire interface in Arabic, RTL layout
- Colors: dark green (#1a4731), gold (#c9a227), light beige (#faf7f0)
- Arabic-friendly Tajawal Google font
- No emojis anywhere in the UI

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- After changing `lib/db/src/schema/`, run `pnpm run typecheck:libs` before checking the API server
- Orval generates `z.coerce.date()` for date fields — the route layer must convert Date → string before DB writes
- `express-session` cookie is `httpOnly: true, secure: true` in production — ensure HTTPS on deploy

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- 8 sample participants are pre-seeded in the database (mix of active/expired statuses)
