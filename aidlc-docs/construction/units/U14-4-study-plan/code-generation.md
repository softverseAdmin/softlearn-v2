# Code generation: U14-4-study-plan

## Implementation plan

1. Derive study-plan items from category coverage, course progress, practice attempt volume, and latest mock scores.
2. Return deterministic next-step guidance from the preparation summary API.
3. Render the study plan in the student preparation workspace.
4. Keep the plan student-owned and separate from official exam decisions.

## Files to create or update

- `backend/api/views.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentPreparationPage.tsx`
- `aidlc-docs/construction/units/U14-4-study-plan/code-generation.md`
- `aidlc-docs/construction/units/U14-4-study-plan/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert study-plan serialization and the preparation UI sections that depend on it.

## Review checklist

- Study-plan items come from deterministic evidence only
- Study-plan summaries stay student-owned
- Study guidance does not mutate official exam state
