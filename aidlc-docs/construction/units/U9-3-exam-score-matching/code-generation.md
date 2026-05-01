# Code generation: U9-3-exam-score-matching

## Implementation plan

1. Reuse average student exam performance as deterministic readiness evidence.
2. Blend exam evidence with learning completion inside the readiness factor.
3. Expose exam-driven readiness strengths and gaps in match payloads.
4. Cover exam-backed match behavior through backend tests.

## Files to create or update

- `backend/api/views.py`
- `backend/api/tests.py`
- `aidlc-docs/construction/units/U9-3-exam-score-matching/code-generation.md`
- `aidlc-docs/construction/units/U9-3-exam-score-matching/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the exam-result contribution inside readiness scoring and restore the prior non-matching state.

## Review checklist

- Exam averages contribute deterministically to readiness
- Missing exam evidence is explained without causing silent failures
- Exam evidence and course evidence combine consistently
