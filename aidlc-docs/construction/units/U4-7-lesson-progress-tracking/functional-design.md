# Functional design: U4-7-lesson-progress-tracking

## Purpose

Define the baseline lesson-progress flow so the platform can track a student’s advancement through lessons in a course using structured, protected learning-state records.

## User story

As a student, I need lesson progress tracking so the platform can remember what I have started or completed inside an enrolled course.

## Functional requirements

### 1. Lesson-progress scope

- This unit covers protected lesson-level progress state for a student inside a course enrollment.
- The baseline should support:
  - establishing progress in relation to a specific enrollment and lesson
  - updating progress as a student advances through a lesson
  - representing stable lesson-level progress outcomes
  - returning clear outcomes for valid and invalid progress changes
- Course-level completion, readiness scoring, and analytics remain separate later units.

### 2. Ownership and protected-state posture

- Lesson progress is student-owned protected learning data.
- Only the authenticated student who owns the enrollment may update or view their lesson-progress state through the standard student flow.
- Company users must not access or modify lesson progress unless a later approved visibility rule explicitly allows derived outcomes.
- Admin access to lesson-progress records, if needed later, must remain purposeful, policy-bound, and auditable.

### 3. Progress model expectations

- A **LessonProgress** record should belong to exactly one **Enrollment** and one **Lesson**.
- The baseline should support stable progress states such as not started, in progress, and completed, or an equivalent deterministic progression model.
- Duplicate or conflicting lesson-progress records for the same student, enrollment, and lesson should be prevented.
- Invalid state transitions or malformed progress updates must return stable outcomes.

### 4. Relationship to lesson viewing

- Lesson progress should build on the lesson-viewing experience rather than redefine lesson access rules.
- Progress updates may be triggered by later implementation from lesson interactions, but this unit defines the progress state itself rather than UI mechanics alone.
- The platform should be able to reflect lesson progress back to the student in a way that remains consistent with the lesson sequence.

### 5. Relationship to course completion

- Lesson progress should be the main input to later course-completion logic.
- This unit should not determine course completion by itself.
- Later readiness and matching units may use derived course-completion evidence, but they must build on the protected progress baseline defined here.

### 6. Frontend and route behavior

- Lesson-progress behavior belongs in the student learning area and should align with the shared route and layout baselines.
- Learning-state UI should represent loading, success, validation-error, and unexpected-error states clearly.
- Local feature state should be preferred unless later reuse justifies broader shared state.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- U1-2 authentication core
- U1-3 role-based access control
- U1-5 frontend app initialization
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout
- U4-5 lesson viewing
- U4-6 course enrollment

## Outputs

- Baseline lesson-progress flow
- Protected student-owned lesson-progress expectations
- Integration expectations for later course-completion and learning-summary units

## User flow

1. Authenticated student accesses an authorized lesson inside an enrolled course.
2. The platform loads any existing lesson-progress state for that enrollment and lesson.
3. As the student advances, the platform records a stable lesson-progress update.
4. Backend validates ownership, enrollment linkage, lesson linkage, and progress-state rules.
5. Updated lesson-progress state becomes available for later student feedback and course-completion calculation.

## Acceptance criteria

- Lesson-progress behavior is documented clearly.
- Student ownership and protected-state boundaries are defined.
- Enrollment-linked lesson-progress structure and state expectations are documented.
- The unit stays separate from course-completion calculation and analytics logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Enrollment creation
- Lesson authoring
- Course-completion calculation
- Learning analytics and recommendations
