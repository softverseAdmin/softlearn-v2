# Infrastructure design: U2-5-student-profile-education

## Infrastructure impact

This unit does not provision infrastructure, but it defines authenticated student education-management behavior that later backend runtime and frontend delivery must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Local origin and CSRF-related settings for protected student education updates
- Optional future feature flags if education-profile UX is rolled out incrementally later

## External services

- None required for the baseline student education-management flow
- External credential verification or document-validation services are out of scope for this unit

## Deployment impact

- Local-first development must support authenticated student education reads and writes between frontend and backend.
- Later AWS-compatible deployment should preserve the same structured education-management behavior without changing the unit definition.
- Protected student profile routes and data writes must remain available in every supported environment.

## Database impact

- The baseline relies on a student-owned **StudentEducation** relationship tied to **StudentProfile**.
- The design should support multiple education entries per student while keeping ownership and update boundaries explicit.
- Later resume, experience, privacy, and company-review units should reuse the same profile ownership model rather than duplicating education data elsewhere.
