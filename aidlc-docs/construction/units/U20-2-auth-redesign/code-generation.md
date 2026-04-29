# Code generation: U20-2-auth-redesign

## Implementation plan

1. Create a shared auth-shell layout component.
2. Redesign login with the SaaS two-column structure and mobile fallback.
3. Redesign signup with role-first UX and company/student field variation.
4. Update any public-layout styling needed to support the new auth experience.

## Files to create or update

- `frontend/src/features/auth/`
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/pages/SignupPage.tsx`
- `frontend/src/layouts/PublicLayout.tsx`
- Supporting style files if needed

## Test plan

- `. .venv/bin/activate && cd backend && python manage.py check && python manage.py test`
- `cd frontend && npm run build && npm run lint`
- `chmod +x scripts/*.sh && ./scripts/aidlc-check.sh`

## Rollback plan

- Revert the auth-shell component and restore the previous simple auth pages.

## Review checklist

- Does the page explain product value quickly?
- Is signup role-first?
- Is the form still simple and low-friction?
- Does mobile collapse to a clean single-column layout?
