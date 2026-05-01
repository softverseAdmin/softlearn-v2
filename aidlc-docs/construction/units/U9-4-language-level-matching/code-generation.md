# Code generation: U9-4-language-level-matching

## Implementation plan

1. Normalize student language levels and compare them against structured vacancy language requirements.
2. Score required language baselines more heavily than preferred language baselines.
3. Return explainable language strengths and gaps in both match APIs.
4. Cover language-backed ranking behavior in backend tests.

## Files to create or update

- `backend/api/views.py`
- `backend/api/tests.py`
- `aidlc-docs/construction/units/U9-4-language-level-matching/code-generation.md`
- `aidlc-docs/construction/units/U9-4-language-level-matching/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the language normalization and language-factor matching logic.

## Review checklist

- Japanese and English levels normalize consistently
- Required language requirements score more heavily than preferred ones
- Language explanations remain visible and deterministic
