# Code generation: U9-5-location-preference-matching

## Implementation plan

1. Compare student preferred work location against vacancy location and work style.
2. Give remote and hybrid vacancies partial flexibility credit instead of binary match failure.
3. Return location-alignment strengths and gaps in both match APIs.
4. Cover location-driven ranking behavior in backend tests.

## Files to create or update

- `backend/api/views.py`
- `backend/api/tests.py`
- `aidlc-docs/construction/units/U9-5-location-preference-matching/code-generation.md`
- `aidlc-docs/construction/units/U9-5-location-preference-matching/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the location/work-style matching logic and restore the prior non-matching state.

## Review checklist

- Exact location matches are rewarded deterministically
- Remote and hybrid roles provide explicit partial-credit behavior
- Location explanations stay consistent across match views
