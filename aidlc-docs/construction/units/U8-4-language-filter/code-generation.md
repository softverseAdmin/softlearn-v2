# Code generation: U8-4-language-filter

## Implementation plan

1. Extend the student jobs API to accept structured language filter inputs based on vacancy language requirements.
2. Expose available visible-job language options to the student discovery UI.
3. Add language-filter controls to the student jobs page and combine them with search and skill filters.
4. Cover filtered-result and visibility behavior with backend tests.

## Files to create or update

- `backend/api/views.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentJobsPage.tsx`
- `aidlc-docs/construction/units/U8-4-language-filter/code-generation.md`
- `aidlc-docs/construction/units/U8-4-language-filter/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the structured language filtering in the student jobs API and page.
- Restore discovery to the prior non-language-filtered state.

## Review checklist

- Language filtering consumes structured vacancy language requirements
- Invalid language filters fail deterministically
- Filtered results preserve visible vacancy boundaries
- Student discovery exposes stable language options from visible jobs
