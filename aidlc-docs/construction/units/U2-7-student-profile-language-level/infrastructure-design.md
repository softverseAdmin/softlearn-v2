# Infrastructure design: U2-7-student-profile-language-level

## Infrastructure impact

This unit does not provision infrastructure, but it defines authenticated student language-level management behavior that later backend runtime, frontend delivery, and shared taxonomy data support must handle consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Local origin and CSRF-related settings for protected student language-level updates
- Optional future feature flags if language-management UX is rolled out incrementally later

## External services

- None required for the baseline student language-level flow
- External language-testing or certificate-validation services are out of scope for this unit

## Deployment impact

- Local-first development must support authenticated student language-level reads and writes between frontend and backend.
- Later AWS-compatible deployment should preserve the same structured language-management behavior without changing the unit definition.
- Shared taxonomy data and protected student profile routes must remain available in every supported environment.

## Database impact

- The baseline relies on student-owned **StudentLanguageLevel** records tied to **StudentProfile** and a shared **LanguageLevel** taxonomy.
- The design should support structured language entries while preventing fragmented matching logic caused by inconsistent level identifiers.
- Later vacancy, matching, and filtering units should reuse the same underlying language taxonomy relationship rather than duplicating language models.
