# Infrastructure design: U2-6-student-profile-experience

## Infrastructure impact

This unit does not provision infrastructure, but it defines authenticated student experience-management behavior that later backend runtime and frontend delivery must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Local origin and CSRF-related settings for protected student experience updates
- Optional future feature flags if experience-profile UX is rolled out incrementally later

## External services

- None required for the baseline student experience-management flow
- External employer-verification or portfolio-validation services are out of scope for this unit

## Deployment impact

- Local-first development must support authenticated student experience reads and writes between frontend and backend.
- Later AWS-compatible deployment should preserve the same structured experience-management behavior without changing the unit definition.
- Protected student profile routes and data writes must remain available in every supported environment.

## Database impact

- The baseline relies on a student-owned **StudentExperience** relationship tied to **StudentProfile**.
- The design should support multiple experience entries per student while keeping ownership and update boundaries explicit.
- Later resume, privacy, and company-review units should reuse the same profile ownership model rather than duplicating experience data elsewhere.
