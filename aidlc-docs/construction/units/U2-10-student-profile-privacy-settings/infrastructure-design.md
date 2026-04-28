# Infrastructure design: U2-10-student-profile-privacy-settings

## Infrastructure impact

This unit does not provision infrastructure, but it defines authenticated privacy-setting behavior that later backend runtime, frontend delivery, consent storage, and audit recording must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Local origin and CSRF-related settings for protected privacy-setting updates
- Optional future audit or retention configuration if later implementation exposes operational controls

## External services

- None required for the baseline student privacy-settings flow
- External compliance, IAM, or legal-policy systems are out of scope for this unit

## Deployment impact

- Local-first development must support authenticated privacy-setting reads and writes between frontend and backend.
- Later AWS-compatible deployment should preserve the same privacy, consent, and auditability behavior without changing the unit definition.
- Consent and audit records must remain available to later operational workflows where policy permits.

## Database impact

- The baseline relies on **StudentPrivacySetting** records tied to **StudentProfile**.
- Privacy-setting changes and visibility decisions should create or update related **ConsentLog** records, with sensitive access later captured by **AuditLog** records where required.
- The design should preserve a stable distinction between effective privacy configuration and the event history of consent or visibility changes.
