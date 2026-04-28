# Functional design: U2-4-student-profile-skills

## Purpose

Define the baseline student skill-management flow so an authenticated student can maintain structured skills that support profile quality, vacancy fit, and rule-based matching.

## User story

As an authenticated student, I need to manage my skills in a structured way so the platform can represent my current abilities consistently across profile, search, and matching workflows.

## Functional requirements

### 1. Skills scope

- This unit covers student-owned skill records attached to the authenticated student profile.
- The baseline should support the core skill-management actions:
  - view current skills
  - add a skill
  - update a skill entry if profile structure allows editing
  - remove a skill
- Skills should remain separate from basic profile identity fields, education, experience, resume uploads, availability, and privacy controls.

### 2. Shared skill taxonomy

- Student skills should align with the shared **Skill** taxonomy defined in the conceptual data model.
- The baseline should prefer structured skill selection over fragmented free-text-only skill entry because later vacancy matching depends on reusable skill identifiers.
- Later implementation may support search or selection against the shared skill list, but this unit does not require a final UI widget choice.

### 3. Student skill record behavior

- Each skill entry should represent a structured skill claim owned by the authenticated student.
- The baseline should allow the platform to distinguish one student skill from another cleanly and avoid duplicate or conflicting entries for the same taxonomy skill.
- If later implementation includes extra attributes such as self-reported proficiency, recency, or note fields, they must remain consistent with matching and profile rules rather than becoming arbitrary unstructured text.

### 4. Read and update behavior

- Authenticated students must be able to view their own current skill list.
- Authenticated students must be able to add or remove skills in their own profile context.
- Validation failures such as invalid taxonomy values, duplicates, or malformed updates must return stable, user-presentable outcomes.
- Successful skill changes should be reflected predictably in the student profile experience and any later matching-related summaries that consume profile data.

### 5. Ownership and authorization

- Only the authenticated student may manage skills through this self-service flow.
- Company and admin visibility into student skills remains governed by separate privacy and access rules outside this unit.
- Student skill management must remain aligned with authenticated access, self-service ownership, and deny-by-default RBAC behavior.

### 6. Matching and downstream usage

- Student skills are a direct input to the later rule-based matching model and must therefore stay structured and consistent.
- This unit should support later comparisons against vacancy required skills and preferred skills without redefining the skill taxonomy independently inside each feature.
- Skills recorded here may also support future search, filtering, readiness explanations, and candidate summaries where policy allows.

### 7. Frontend behavior

- The student skills screen or subsection belongs inside the authenticated student route area and shared layout shell.
- Most editable skill-entry state should remain local to the skill-management feature rather than promoted to global state unless later cross-route reuse justifies it.
- Loading, empty, success, and validation-error states should be presented clearly.

### 8. Relationship to later units

- This unit defines baseline student skill management only.
- Education, experience, detailed language records, resume handling, availability, privacy visibility, vacancy skill requirements, and matching calculation logic remain separate units.

## Inputs

- Inception requirements baseline
- Inception high-level data model
- Inception security and compliance baseline
- Inception rule-based matching strategy
- U1-3 role-based access control
- U1-4 base API structure
- U1-5 frontend app initialization
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout
- U2-3 student profile basic

## Outputs

- Baseline student skill-management flow
- Structured skill taxonomy and ownership expectations
- Integration expectations across profile, protected routing, and later matching usage

## User flow

1. Authenticated student enters the student skills area from the protected student experience.
2. Frontend loads the student’s current structured skill list.
3. Student adds, edits, or removes skill entries within the allowed profile scope.
4. Backend validates the skill change against profile ownership and structured skill rules.
5. Frontend reflects the updated skill list and any validation or error outcomes clearly.

## Acceptance criteria

- Student skill-management behavior is documented clearly.
- The unit requires alignment with a shared skill taxonomy rather than fragmented free-text matching.
- Ownership, validation, and protected-route behavior are aligned with session auth and RBAC.
- Skill scope is separated from other student-profile-detail units and later matching logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Final UX widget choice for skill search or autocomplete
- Detailed evidence scoring, endorsements, or externally verified skill proof
- Education, experience, resume, availability, privacy, and vacancy-side skill requirement units
