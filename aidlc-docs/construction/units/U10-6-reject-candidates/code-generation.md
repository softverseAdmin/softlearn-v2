# Code generation: U10-6-reject-candidates

## Implementation plan

1. Add a protected company rejection endpoint for authorized application contexts.
2. Restrict rejection to deterministic rejectable states only.
3. Record rejected history and reflect the result in the company applications page.
4. Deactivate application-based candidate review access when no active applications remain.

## Files to create or update

- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/CompanyApplicationsPage.tsx`
- `frontend/src/features/profile/types.ts`
- `aidlc-docs/construction/units/U10-6-reject-candidates/code-generation.md`
- `aidlc-docs/construction/units/U10-6-reject-candidates/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the rejection endpoint and company UI action.
- Restore the prior state without application-driven rejection transitions.

## Review checklist

- Company rejection actions stay within company ownership boundaries
- Non-rejectable states are blocked
- Rejected history entries are recorded
- Candidate review access no longer stays active when all application contexts are terminal
