# Functional design: U2-7-student-profile-language-level

## Purpose

Define the baseline student language-level management flow so an authenticated student can maintain structured language records that support profile quality and rule-based vacancy matching.

## User story

As an authenticated student, I need to manage my language levels clearly so the platform can represent my Japanese and English readiness consistently across profile and matching workflows.

## Functional requirements

### 1. Language-level scope

- This unit covers student-owned language-level records attached to the authenticated student profile.
- The baseline should support the core language-management actions:
  - view current language entries
  - add or set a language entry
  - update a language entry
  - remove a language entry where product rules allow
- Language-level management should remain separate from skills, education, experience, resume files, availability, and privacy controls.

### 2. Shared language taxonomy

- Student language levels should align with the shared **LanguageLevel** taxonomy defined in the conceptual data model.
- The baseline should prefer structured language-level selection over fragmented free-text-only entry because later vacancy matching depends on reusable language identifiers.
- Japanese and English are the primary baseline languages implied by the inception requirements and matching design, though the model should not preclude later expansion if approved.

### 3. Relationship to basic profile summary

- U2-3 basic profile includes summary fields for Japanese level and English level.
- This unit defines the more detailed language-record baseline and should be treated as the authoritative profile subdomain for language-level management.
- Later implementation should keep any basic-profile language summary fields aligned with the structured language-level records defined here rather than allowing them to drift independently.

### 4. Student language record behavior

- Each language entry should represent a structured language claim owned by the authenticated student.
- The baseline should allow the platform to distinguish language type and associated shared level cleanly.
- If later implementation includes optional supporting attributes such as certification name, test score, or evidence note, they must remain aligned with structured language ownership rather than replacing the shared level taxonomy.

### 5. Read and update behavior

- Authenticated students must be able to view their own current language records.
- Authenticated students must be able to set or update their own language levels in their profile context.
- Validation failures such as invalid taxonomy values, unsupported language types, or malformed updates must return stable, user-presentable outcomes.
- Successful language changes should be reflected predictably in the student profile experience and in later matching-related summaries that consume profile data.

### 6. Ownership and authorization

- Only the authenticated student may manage language records through this self-service flow.
- Company and admin visibility into student language levels remains governed by separate privacy and access rules outside this unit.
- Student language-level management must remain aligned with authenticated access, self-service ownership, and deny-by-default RBAC behavior.

### 7. Matching and downstream usage

- Student language levels are a direct input to the later rule-based matching model and must therefore stay structured and consistent.
- This unit should support later comparison against vacancy language requirements without redefining language levels independently inside each feature.
- Language records defined here may also support future search, filtering, readiness explanations, and candidate summaries where policy allows.

### 8. Frontend behavior

- The student language-level screen or subsection belongs inside the authenticated student route area and shared layout shell.
- Most editable language-entry state should remain local to the feature rather than promoted to global state unless later cross-route reuse justifies it.
- Loading, empty, success, and validation-error states should be presented clearly.

### 9. Relationship to later units

- This unit defines baseline student language-level management only.
- Resume handling, availability, privacy visibility, vacancy language requirements, and matching calculation logic remain separate units.

## Inputs

- Inception requirements baseline
- Inception high-level data model
- Inception security and compliance baseline
- Inception rule-based matching strategy
- U1-3 role-based access control
- U1-5 frontend app initialization
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout
- U2-3 student profile basic

## Outputs

- Baseline student language-level management flow
- Shared language-taxonomy and summary-alignment expectations
- Integration expectations across protected routing, profile structure, and later matching usage

## User flow

1. Authenticated student enters the student language-level area from the protected student experience.
2. Frontend loads the student’s current structured language records.
3. Student adds, sets, updates, or removes allowed language entries within the profile scope.
4. Backend validates the change against profile ownership and structured language rules.
5. Frontend reflects the updated language records and any validation or error outcomes clearly.

## Acceptance criteria

- Student language-level management behavior is documented clearly.
- The unit requires alignment with a shared language taxonomy rather than fragmented free-text matching.
- The relationship between detailed language records and the basic-profile language summary is documented.
- Ownership, validation, and protected-route behavior are aligned with session auth and RBAC.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Final UX widget choice for language selection
- Detailed certification-verification workflows
- Resume, availability, privacy, vacancy-language, and matching-calculation units
