# Code generation: U9-6-match-score-calculation

## Implementation plan

1. Aggregate deterministic skill, language, location, readiness, and profile factors into a shared weighted match score.
2. Define recommendation thresholds and match-level labels for ranked outputs.
3. Reuse the same aggregate scorer across student and company match APIs.
4. Cover ordering and threshold behavior with backend tests.

## Files to create or update

- `backend/api/views.py`
- `backend/api/tests.py`
- `backend/api/urls.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentMatchesPage.tsx`
- `frontend/src/features/profile/CompanyVacancyMatchesPage.tsx`
- `aidlc-docs/construction/units/U9-6-match-score-calculation/code-generation.md`
- `aidlc-docs/construction/units/U9-6-match-score-calculation/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the aggregate scorer, thresholds, factor breakdown payloads, and dependent UI rendering.

## Review checklist

- All factor weights are applied through one shared scorer
- Match levels and recommendation threshold are explicit
- Factor breakdowns align with the aggregate score returned to the UI
