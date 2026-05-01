# Code generation: U14-5-performance-tracking

## Implementation plan

1. Aggregate preparation-only metrics from practice attempts and mock attempts.
2. Return category-level performance summaries and recent preparation activity.
3. Render preparation metrics in the student preparation workspace.
4. Keep preparation metrics separate from company visibility and official exam averages.

## Files to create or update

- `backend/api/views.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentPreparationPage.tsx`
- `aidlc-docs/construction/units/U14-5-performance-tracking/code-generation.md`
- `aidlc-docs/construction/units/U14-5-performance-tracking/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert preparation-performance aggregation and the UI sections that expose it.

## Review checklist

- Preparation metrics come only from practice and mock evidence
- Student-owned performance remains separate from official exam history
- Category summaries remain deterministic and auditable
