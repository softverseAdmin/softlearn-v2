# Code generation: U5-7-pass-fail-logic

## Implementation plan

1. Classify scored attempts using the exam’s explicit passing-score threshold.
2. Persist pass/fail on both the structured attempt and the shared result summary record.
3. Keep pass/fail evaluation deterministic and backend-owned.
4. Cover pass/fail outcomes with backend tests.

## Files to create or update

- `backend/api/views.py`
- `backend/api/tests.py`
- `aidlc-docs/construction/units/U5-7-pass-fail-logic/code-generation.md`
- `aidlc-docs/construction/units/U5-7-pass-fail-logic/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert pass/fail classification logic and related tests.

## Review checklist

- Pass/fail uses explicit exam thresholds
- Classification is deterministic and traceable
- Result history consumes the same outcome state

