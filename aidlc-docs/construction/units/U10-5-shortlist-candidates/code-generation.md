# Code generation: U10-5-shortlist-candidates

## Implementation plan

1. Add a protected company shortlist endpoint for authorized application contexts.
2. Reuse or create application-based candidate review access for the shortlisted student.
3. Create shortlist state without duplicating shortlist entries on repeated requests.
4. Update application status and history to the shared shortlisted lifecycle state.

## Files to create or update

- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/CompanyApplicationsPage.tsx`
- `frontend/src/features/profile/types.ts`
- `aidlc-docs/construction/units/U10-5-shortlist-candidates/code-generation.md`
- `aidlc-docs/construction/units/U10-5-shortlist-candidates/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the shortlist endpoint and company UI action.
- Restore the prior state without application-driven shortlist transitions.

## Review checklist

- Company shortlist actions stay within company ownership boundaries
- Duplicate shortlist entries are prevented
- Shortlist actions update shared application status history
- Existing shortlist and candidate review surfaces can consume the new state
