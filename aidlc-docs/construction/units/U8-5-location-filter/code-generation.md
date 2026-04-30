# Code generation: U8-5-location-filter

## Implementation plan

1. Extend the student jobs API to accept structured location and work-style filters based on vacancy metadata.
2. Expose available visible-job locations and work styles to the student discovery UI.
3. Add location and work-style filter controls to the student jobs page.
4. Cover filtered-result and visibility behavior with backend tests.

## Files to create or update

- `backend/api/views.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentJobsPage.tsx`
- `aidlc-docs/construction/units/U8-5-location-filter/code-generation.md`
- `aidlc-docs/construction/units/U8-5-location-filter/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the structured location/work-style filtering in the student jobs API and page.
- Restore discovery to the prior non-location-filtered state.

## Review checklist

- Location filtering consumes structured vacancy location metadata
- Work-style filtering stays consistent with vacancy authoring settings
- Filtered results preserve visible vacancy boundaries
- Student discovery exposes stable location and work-style options from visible jobs
