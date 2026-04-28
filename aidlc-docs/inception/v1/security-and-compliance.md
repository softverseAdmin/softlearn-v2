# Inception v1 security and compliance

## Goal

Define the baseline security, privacy, consent, authorization, audit, exam-integrity, and operational protection rules for the platform before application implementation begins.

## Core security principles

- **Least privilege by default**
- **Authentication before protected actions**
- **Authorization on every protected read and write**
- **Privacy-aware visibility rules for student data**
- **Auditability for sensitive access**
- **Explicit consent handling**
- **No automated hiring decisions**
- **Secure-by-default admin operations**

## Protected data categories

The platform should treat the following as protected or privacy-sensitive:

- user identity and account data
- student profile details
- student skills, education, and experience
- Japanese and English language levels
- resume metadata and uploaded files if enabled later
- learning progress and course completion data
- exam results and exam-attempt history
- job applications and interview data
- meeting URLs
- consent and audit records

## Authentication rules

- All protected user actions require authenticated identity.
- Students, company users, and admins must authenticate separately but through a consistent identity model.
- Authentication establishes identity only; it does not automatically grant broad access to student data.
- Logout and session invalidation must be supported in the implementation stage.
- JWT or session implementation details may vary later, but protected endpoints must always enforce authenticated access.

## Authorization rules

### Student access

- Students may access and update their own profile data, privacy settings, learning records, exam results, applications, interviews, and notifications.
- Students may not access other students’ private information.
- Students may not perform company-only or admin-only actions.

### Company access

- Company users may manage their own company profile, vacancies, company-side applications, candidate review workflow, interviews, and notifications.
- Company users may only access student data that is explicitly allowed by visibility and consent rules.
- Company users may not access another company’s private data.
- Company users may not access student profile or exam-result data outside allowed contexts.

### Admin access

- Admin access must be tightly scoped and treated as privileged access.
- Admin capabilities must be role-based and reviewable.
- Admins may manage platform entities, but access to sensitive student data should still be purposeful, logged, and policy-bound.
- Admin actions affecting users, permissions, exams, or privacy-sensitive records should create audit entries.

## Privacy and consent rules

- Student privacy settings must control what profile and result data may be visible to companies.
- Exam results must not be exposed to companies unless the applicable rules allow it.
- Matching outputs must not reveal hidden student data beyond allowed visibility.
- Consent-related decisions should be recorded and traceable.
- Privacy decisions should be explainable during support, review, or incident investigation.

### Consent events that should be recorded

- a student enabling company visibility of profile data
- a student enabling company visibility of exam data
- a student changing privacy settings
- any policy-based override or administrative action affecting visibility

## Audit logging rules

Audit logging should capture sensitive or privileged actions such as:

- company access to protected student information
- admin access to sensitive records
- privacy-setting changes
- consent changes
- interview meeting-link updates
- vacancy publication changes if they affect candidate visibility
- exam configuration changes

### Minimum audit fields

- actor identity
- actor role
- target entity
- action type
- timestamp
- outcome
- request or trace identifier if available

## Exam integrity rules

- Students should only be allowed to attempt exams through authenticated access.
- Exam attempts, submitted answers, scores, and pass/fail outcomes must be traceable.
- Result visibility rules must be enforced consistently.
- Exam configuration changes should be controlled and auditable.
- The platform must avoid exposing answer correctness or exam internals in ways that compromise assessment integrity.

## Meeting URL validation rules

- Meeting URLs must be validated before storage or presentation.
- Allowed patterns should support recognized providers such as Zoom, Google Meet, Microsoft Teams, and validated custom URLs.
- Malformed, unsafe, or unexpected URL formats must be rejected.
- Meeting links should only be visible to participants with appropriate access to the interview workflow.

## File and upload safety direction

If resumes or attachments are enabled later:

- file uploads must be authenticated
- allowed file types and size limits must be enforced
- storage access must be restricted
- file metadata access must respect privacy rules

## Compliance and governance direction

- Keep consent and auditability explicit in design and implementation.
- Keep student data visibility explainable.
- Treat matching as recommendation support only; final hiring decisions belong to students and companies.
- Keep security and privacy review as explicit gates in later units.

## Local-first and deployment notes

- The current project direction is local-first development.
- Security design must still remain compatible with later AWS deployment.
- Secrets, audit logging, backup, and runtime protection should be designed so they can mature without reworking the core rules.

## Out of scope

- framework-specific security middleware configuration
- provider-specific IAM or cloud policy configuration
- production incident response procedures
- detailed legal or regional compliance mapping
