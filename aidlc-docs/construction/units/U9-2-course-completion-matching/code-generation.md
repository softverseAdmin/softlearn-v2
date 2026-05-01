# Code generation: U9-2-course-completion-matching

## Implementation plan

1. Reuse student learning-summary data as part of deterministic readiness scoring.
2. Reward completed and in-progress learning records without adding separate hidden signals.
3. Surface readiness-derived strengths and gaps in matching responses.
4. Cover the readiness contribution through backend match tests.

## Files to create or update

- `backend/api/views.py`
- `backend/api/tests.py`
- `aidlc-docs/construction/units/U9-2-course-completion-matching/code-generation.md`
- `aidlc-docs/construction/units/U9-2-course-completion-matching/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the learning-summary contribution inside readiness scoring and restore the prior non-matching state.

## Review checklist

- Course completion contributes deterministically to readiness
- In-progress coursework contributes partial credit only
- Readiness explanations stay visible in match payloads
