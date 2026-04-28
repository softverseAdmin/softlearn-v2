# Functional design: U4-1-course-creation

## Purpose

Define the baseline protected course-creation flow so authorized platform operators can create structured learning offerings that later listing, detail, enrollment, and lesson units can consume consistently.

## User story

As an authorized platform operator, I need course creation so the platform can publish structured learning offerings for students without relying on ad hoc content records.

## Functional requirements

### 1. Course-creation scope

- This unit covers creation of course records only.
- The baseline should support:
  - opening a protected course-creation flow
  - entering required course information
  - validating the submitted course definition
  - creating a structured course record with a stable outcome
- Course listing, detail viewing, lesson authoring, enrollment, progress, and completion remain separate later units.

### 2. Protected authoring access

- Course creation must be treated as a protected platform-management action.
- Students and company users must not create courses through this baseline.
- The baseline should assume admin or similarly authorized internal content-management access, aligned with secure-by-default admin rules.

### 3. Course data and validation

- Course creation should produce a structured **Course** record rather than an untyped content blob.
- The baseline should support core course fields such as title, summary or description, category or learning domain, level, and visibility-ready metadata where needed.
- Validation failures such as missing required fields, malformed values, or duplicate course identity conflicts must return stable outcomes.
- Newly created courses should support a controlled non-public state until later visibility and publication rules are confirmed.

### 4. Ownership and visibility posture

- Course authoring must remain separate from student-owned learning state.
- Course creation should define enough course metadata for later listing and detail units without forcing immediate student visibility.
- Public or student-facing visibility should depend on later approved discovery and publication behavior rather than being assumed automatically at creation time.

### 5. Frontend and API alignment

- The protected course-creation flow belongs in a protected platform-management route area rather than the student learning area.
- The final API shape for course creation may be detailed later, but it must remain consistent with the existing versioned REST baseline and standard validation envelopes.
- Most form state for course creation should remain local to the feature rather than promoted to global state unless reuse is justified later.

### 6. Relationship to later units

- U4-2 course listing should consume only appropriately visible course records.
- U4-3 course detail should build on the same course record created here.
- U4-4 lesson creation should attach structured lesson records to an existing course.
- Later admin course-management units may expand editing, moderation, and publication controls without redefining the creation baseline.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout

## Outputs

- Baseline protected course-creation flow
- Course-authoring access and validation expectations
- Integration expectations for later course-listing, detail, and lesson units

## User flow

1. Authorized platform operator enters the protected course-creation area.
2. Frontend presents the required course-creation form.
3. Operator provides course metadata and submits the course definition.
4. Backend validates the request and creates a structured course record with a stable outcome.
5. The new course becomes available for later lesson authoring and, when allowed, later listing and detail visibility.

## Acceptance criteria

- Course-creation behavior is documented clearly.
- Protected authoring access is defined and separated from student and company actions.
- Structured course-record expectations and validation outcomes are documented.
- The unit is kept separate from listing, detail, lesson viewing, enrollment, and progress logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Course editing or deletion workflows
- Lesson creation or lesson ordering
- Student course enrollment
- Publishing moderation or review workflows beyond the baseline protected posture
