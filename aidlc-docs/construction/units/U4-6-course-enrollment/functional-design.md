# Functional design: U4-6-course-enrollment

## Purpose

Define the baseline course-enrollment flow so a student can formally join a course and establish the learning-state context used by later lesson progress and completion units.

## User story

As a student, I need course enrollment so the platform can recognize that I joined a course and can track my learning state consistently afterward.

## Functional requirements

### 1. Course-enrollment scope

- This unit covers creation and viewing of the baseline student-owned enrollment state for a course.
- The baseline should support:
  - initiating enrollment from an approved course context
  - validating whether the student can enroll
  - creating a structured **Enrollment** record
  - returning stable outcomes for success, duplicate, or invalid enrollment attempts
- Lesson progress, course completion, and rich learning dashboards remain separate later units.

### 2. Ownership and authorization posture

- Only an authenticated student may create their own enrollment through this baseline.
- A student must not create enrollments on behalf of another student.
- Company users must not create or manage student course enrollments.
- Admin or operator intervention in enrollments, if ever required later, must remain a separate privileged workflow.

### 3. Enrollment validation behavior

- Enrollment must target a valid, student-visible course.
- Duplicate enrollment for the same student and course should return a stable, non-confusing outcome rather than creating conflicting records.
- Validation failures such as unavailable course, unauthorized access, malformed input, or ineligible enrollment must return stable outcomes.

### 4. Relationship to learning access

- Enrollment should create the formal student-course relationship used by later learning units.
- The enrollment outcome should be compatible with later lesson-viewing access decisions and later progress tracking.
- Enrollment should remain separate from course listing or course-detail presentation logic even though those flows may lead into enrollment.

### 5. Frontend and API alignment

- The enrollment action should integrate naturally from the course-detail experience.
- The baseline should align with the learning API contract already defined in U1-4 for enrollment creation and enrollment reads.
- Enrollment state that is specific to one course interaction should remain local unless broader reuse is justified later.

### 6. Relationship to later units

- U4-5 lesson viewing may depend on the course access context created here.
- U4-7 lesson progress should attach progress state to the enrollment created here.
- U4-8 course completion should derive course-level completion outcomes from enrollment-linked progress rather than redefining the student-course relationship.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U1-5 frontend app initialization
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout
- U4-3 course detail page
- U4-5 lesson viewing

## Outputs

- Baseline course-enrollment flow
- Student-owned enrollment and validation expectations
- Integration expectations for later lesson-progress and completion units

## User flow

1. Authenticated student reaches an approved enrollment action from a course context.
2. Frontend submits the enrollment request for that student and course.
3. Backend validates course visibility, student ownership, and duplicate-enrollment conditions.
4. Backend creates a structured enrollment record or returns a stable validation outcome.
5. Frontend reflects the resulting enrollment state and prepares the student for later lesson and progress flows.

## Acceptance criteria

- Course-enrollment behavior is documented clearly.
- Student ownership and authorization boundaries are defined.
- Duplicate and invalid enrollment outcomes are documented.
- The unit stays separate from lesson progress and completion logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Course listing or detail rendering
- Unenrollment or refund policy
- Lesson progress writes
- Course completion calculations
