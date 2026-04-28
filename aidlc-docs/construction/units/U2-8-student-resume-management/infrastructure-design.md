# Infrastructure design: U2-8-student-resume-management

## Infrastructure impact

This unit does not choose a final storage implementation, but it defines authenticated student resume-management behavior that later backend runtime, frontend delivery, and optional protected file storage must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Local origin and CSRF-related settings for protected student resume updates
- Optional future file-storage configuration if uploads are enabled later
- Optional future feature flags if resume upload capability is rolled out incrementally

## External services

- None required for the metadata-only baseline
- File storage may be required later if resume uploads are enabled, but provider selection remains out of scope for this unit

## Deployment impact

- Local-first development must support authenticated student resume-state reads and writes between frontend and backend.
- If uploads are enabled later, deployment must support restricted file storage and controlled file access without changing the unit’s ownership rules.
- Later AWS-compatible deployment should preserve the same resume-management behavior while allowing storage choices to mature separately.

## Database impact

- The baseline relies on student-owned **Resume** records tied to **StudentProfile**.
- The design should support structured resume metadata and a stable notion of whether a current resume is present.
- If file support is enabled later, stored file references and metadata must remain bound to the same student-owned resume model rather than creating disconnected attachment logic.
