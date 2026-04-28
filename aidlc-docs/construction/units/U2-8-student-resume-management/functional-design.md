# Functional design: U2-8-student-resume-management

## Purpose

Define the baseline student resume-management flow so an authenticated student can maintain resume metadata and, when enabled, protected resume files inside the student profile.

## User story

As an authenticated student, I need to manage my resume so the platform can track whether I have a usable CV for employability workflows and later company-facing review contexts.

## Functional requirements

### 1. Resume scope

- This unit covers student-owned resume records attached to the authenticated student profile.
- The baseline should support the core resume-management actions:
  - view current resume status or entries
  - add a resume record
  - replace or update a resume record
  - remove a resume record where product rules allow
- Resume management should remain separate from basic profile fields, skills, education, experience, language levels, availability, and privacy controls.

### 2. Resume record model

- Resume support should begin with structured resume metadata owned by the authenticated student.
- The baseline may include metadata such as filename or display name, upload timestamp, source or type, and active/current status where useful.
- The conceptual data model allows multiple **Resume** records per **StudentProfile**, so the unit should not force a permanently single-record model even if later implementations choose a simpler first UX.

### 3. File-handling posture

- Resume files are optional from an architecture perspective and should be treated as a controlled capability if enabled later.
- If file upload support is enabled, resume uploads must be authenticated, restricted to allowed file types and size limits, and stored with restricted access.
- If file upload support is not enabled in an early implementation, the resume-management unit may still support metadata or readiness status that indicates whether a usable resume is present through an approved path.

### 4. Read and update behavior

- Authenticated students must be able to view their own resume-management state.
- Authenticated students must be able to add, replace, or remove resume records in their own profile context.
- Validation failures such as unsupported file type, excessive size, malformed metadata, or unauthorized updates must return stable, user-presentable outcomes.
- Successful resume changes should update profile and matching-related completeness indicators predictably.

### 5. Ownership and authorization

- Only the authenticated student may manage resume records through this self-service flow.
- Company and admin visibility into resumes or resume metadata remains governed by separate privacy and access rules outside this unit.
- Resume management must remain aligned with authenticated access, self-service ownership, and deny-by-default RBAC behavior.

### 6. Matching and downstream usage

- Resume presence is a profile-completeness input in the later rule-based matching model, so resume management should support a stable notion of whether a resume is present or current.
- This unit should support later candidate-review and application workflows without assuming that every resume is immediately visible to company users.
- Resume completeness indicators should remain explainable and should not bypass later consent or visibility controls.

### 7. Frontend behavior

- The student resume-management screen or subsection belongs inside the authenticated student route area and shared layout shell.
- Most editable resume state should remain local to the feature rather than promoted to global state unless later cross-route reuse justifies it.
- Loading, empty, success, upload-progress if supported later, and validation-error states should be presented clearly.

### 8. Relationship to later units

- This unit defines baseline student resume management only.
- Availability, privacy visibility, company-side review, application attachment rules, and final storage implementation details remain separate units.

## Inputs

- Inception high-level data model
- Inception security and compliance baseline
- Inception rule-based matching strategy
- Recommended architecture
- U1-3 role-based access control
- U1-5 frontend app initialization
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout
- U2-3 student profile basic
- U2-7 student profile language level

## Outputs

- Baseline student resume-management flow
- Resume metadata and optional file-handling expectations
- Integration expectations across protected routing, profile completeness, and later controlled visibility usage

## User flow

1. Authenticated student enters the student resume-management area from the protected student experience.
2. Frontend loads the student’s current resume-management state.
3. Student adds, replaces, or removes a resume record within the allowed profile scope.
4. Backend validates the change against profile ownership and resume rules, including file constraints if upload support is enabled.
5. Frontend reflects the updated resume state and any validation or error outcomes clearly.

## Acceptance criteria

- Student resume-management behavior is documented clearly.
- The unit defines resume metadata ownership and optional protected file-handling posture.
- Resume presence is linked to profile-completeness behavior without bypassing later privacy and visibility controls.
- Ownership, validation, and protected-route behavior are aligned with session auth and RBAC.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Final storage provider selection or file-serving implementation
- Company-side resume review permissions
- Privacy and consent policy detail for company access
