# Softlearn frontend

React 18 and TypeScript application built with Vite. Routes cover public pages and student, teacher, company, and administrator workspaces.

## Local development

Start Django on port 8000, then run:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Vite serves the application on port 5173 and proxies `/api` and `/media` to Django. `VITE_API_BASE_URL` defaults to `/api/v1`. Browser authentication uses Django sessions and CSRF protection.

## Checks

```bash
npm run build
npm run lint
```

The build runs TypeScript checks and produces `dist/`. `npm run preview` serves that build locally.

## Source layout

- `src/router/`: routes, navigation, and access guards.
- `src/features/`: feature pages and related components.
- `src/components/`: shared interface components.
- `src/auth/`: session state.
- `src/lib/`: API helpers and utilities.

See the repository README for backend setup and application preparation documents.
