# Code generation: U5-6-score-calculation

## Implementation plan

1. Score submitted single-choice attempts deterministically from active questions and correctness metadata.
2. Store the score on the exam attempt and reuse the shared result summary record for downstream views.
3. Keep scoring server-side and never expose correctness metadata in student flows.
4. Cover scored-attempt creation with backend tests.

## Files to create or update

- `backend/api/views.py`
- `backend/api/tests.py`
- `aidlc-docs/construction/units/U5-6-score-calculation/code-generation.md`
- `aidlc-docs/construction/units/U5-6-score-calculation/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert exam scoring logic and related tests.

## Review checklist

- Repeated scoring of the same submission is deterministic
- Scoring reuses structured exam and answer data
- Correctness metadata remains protected

