# Infrastructure design: U2-4-student-profile-skills

## Infrastructure impact

This unit does not provision infrastructure, but it defines authenticated student skill-management behavior that later backend runtime, frontend delivery, and shared taxonomy data support must handle consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Local origin and CSRF-related settings for protected student skill updates
- Optional future feature flags if skill-management UX is rolled out incrementally later

## External services

- None required for the baseline student skill-management flow
- External enrichment, skill inference, or third-party validation services are out of scope for this unit

## Deployment impact

- Local-first development must support authenticated student skill reads and writes between frontend and backend.
- Later AWS-compatible deployment should preserve the same structured skill-management behavior without changing the unit definition.
- Shared taxonomy data and protected student profile routes must remain available in every supported environment.

## Database impact

- The baseline relies on a student-owned **StudentSkill** relationship tied to **StudentProfile** and a shared **Skill** taxonomy.
- The design should support multiple structured skill entries per student while preventing fragmented matching logic caused by duplicate or inconsistent taxonomy use.
- Later vacancy, matching, and filtering units should reuse the same underlying skill taxonomy relationship rather than duplicating skill models.
