# Code generation: U8-3-skill-filter

## Implementation plan

1. Extend the student jobs API to accept structured skill filter inputs based on vacancy skill tags.
2. Expose available visible-job skill options to the student discovery UI.
3. Add skill-filter controls to the student jobs page and combine them with search.
4. Cover filtered-result and visibility behavior with backend tests.

## Files to create or update

- `backend/api/views.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentJobsPage.tsx`
- `aidlc-docs/construction/units/U8-3-skill-filter/code-generation.md`
- `aidlc-docs/construction/units/U8-3-skill-filter/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the structured skill filtering in the student jobs API and page.
- Restore discovery to the prior non-skill-filtered state.

## Review checklist

- Skill filtering consumes structured vacancy skill requirements
- Invalid skill filters fail deterministically
- Filtered results preserve visible vacancy boundaries
- Student discovery exposes stable skill options from visible jobs
