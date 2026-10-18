# StudyFlow Backend

Backend API for the StudyFlow Student Study Planner frontend. Express +
TypeScript on top of Supabase (PostgreSQL + Auth). This package contains
**backend only** — no frontend files were touched or included.

## Stack

- **Runtime:** Node.js 18+, Express, TypeScript
- **Auth & DB:** Supabase (GoTrue auth, Postgres, Row Level Security)
- **Validation:** Zod

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run the files in `sql/` **in order**:
   1. `001_schema.sql` — tables: `profiles`, `subjects`, `tasks`
   2. `002_rls_policies.sql` — Row Level Security policies
   3. `003_functions_triggers.sql` — `updated_at` triggers, auto-profile creation, `completed_at` stamping
   4. `004_dashboard_view.sql` — `task_dashboard_stats` / `subject_progress_stats` views
3. In **Settings → API**, copy your Project URL, `anon` public key, and
   `service_role` secret key.

By default Supabase requires email confirmation for new signups. You can
toggle this under **Authentication → Providers → Email** if you want
instant login during development.

## 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
and set `CORS_ORIGIN` to the URL(s) your frontend runs on. **Never** expose
`SUPABASE_SERVICE_ROLE_KEY` to the frontend — it bypasses Row Level
Security and must stay server-side only.

## 3. Install & run

```bash
npm install
npm run dev     # local dev server with hot reload, http://localhost:4000
npm run build   # compile to dist/
npm start       # run compiled build
```

## How auth works

- The frontend calls `POST /api/auth/signup` or `/api/auth/login`, gets
  back a Supabase `session` (`access_token` + `refresh_token`).
- The frontend stores the tokens and sends the access token on every
  subsequent request: `Authorization: Bearer <access_token>`.
- `requireAuth` middleware verifies that token with Supabase on each
  request and attaches a **request-scoped** Supabase client authenticated
  as that user — so every DB query automatically obeys Row Level Security
  and can only touch that user's own rows.
- When the access token expires, call `POST /api/auth/refresh` with the
  stored `refreshToken` to get a new session.

## API Reference

All routes are prefixed with `/api`. Routes marked 🔒 require
`Authorization: Bearer <access_token>`.

### Auth

| Method | Route                    | Description                          |
| ------ | ------------------------ | ------------------------------------- |
| POST   | `/auth/signup`            | `{ email, password, fullName? }`     |
| POST   | `/auth/login`              | `{ email, password }`                |
| POST   | `/auth/refresh`            | `{ refreshToken }`                   |
| POST   | `/auth/forgot-password`    | `{ email, redirectTo? }`             |
| POST   | `/auth/logout` 🔒          | —                                     |
| GET    | `/auth/me` 🔒               | Current user                         |

### Subjects 🔒 (all routes)

| Method | Route             | Body / Notes                                           |
| ------ | ------------------ | ------------------------------------------------------- |
| GET    | `/subjects`         | List the user's subjects                                 |
| POST   | `/subjects`         | `{ code?, name, instructor?, credits?, color? }`         |
| GET    | `/subjects/:id`     | One subject                                              |
| PATCH  | `/subjects/:id`     | Partial update, any of the create fields                 |
| DELETE | `/subjects/:id`     | Deletes subject; its tasks get `subject_id = null`        |

### Tasks 🔒 (all routes)

| Method | Route                | Body / Query                                                                 |
| ------ | --------------------- | ------------------------------------------------------------------------------ |
| GET    | `/tasks`               | Query: `subjectId, priority, completed, dueBefore, dueAfter, search, sortBy, sortDir, limit, offset` |
| POST   | `/tasks`               | `{ subjectId?, title, notes?, priority?, dueDate?, dueTime?, durationMinutes?, reminderEnabled? }` |
| GET    | `/tasks/:id`           | One task (with subject joined)                                                 |
| PATCH  | `/tasks/:id`           | Partial update, any of the create fields                                       |
| PATCH  | `/tasks/:id/complete`  | `{ isCompleted: boolean }` — dedicated checkbox endpoint                       |
| DELETE | `/tasks/:id`           | Deletes the task                                                                |

### Dashboard 🔒 (all routes)

| Method | Route                          | Description                                                  |
| ------ | -------------------------------- | -------------------------------------------------------------- |
| GET    | `/dashboard/stats`                | Counts: due today, overdue, due this week, completed this week, open high-priority |
| GET    | `/dashboard/subject-progress`     | Per-subject task counts & completion %                       |
| GET    | `/dashboard/upcoming`             | Incomplete tasks due in the next 7 days                       |
| GET    | `/dashboard/overdue`              | Incomplete tasks past their due date                           |

## Data model

- **subjects**: `code`, `name`, `instructor`, `credits`, `color` (hex, drives
  the card accent bar in the UI), owned by `user_id`.
- **tasks**: `title`, `notes`, `priority` (`low | medium | high`), `due_date`,
  `due_time`, `duration_minutes`, `reminder_enabled`, `is_completed` +
  auto-managed `completed_at`, optional `subject_id`, owned by `user_id`.

## Security notes

- Every table has Row Level Security enabled; policies restrict all
  select/insert/update/delete to rows where `user_id = auth.uid()`.
- Task writes additionally verify (via RLS policy) that any `subject_id`
  being set belongs to the same user — you can't attach your task to
  someone else's subject.
- Route handlers use a **per-request Supabase client** built from the
  caller's access token (see `src/config/supabase.ts`), so RLS is enforced
  by Postgres itself, not just application code — the API can't
  accidentally leak another user's data even with a bug in a query.
- The `service_role` admin client is never used in request handlers.
