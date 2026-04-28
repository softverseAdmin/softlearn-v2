# Functional design: U4-4-lesson-creation

## Purpose

Define the baseline protected lesson-creation flow so authorized platform operators can attach structured lessons to a course in a stable, ordered way.

## User story

As an authorized platform operator, I need lesson creation so each course can contain structured learning units that later lesson-viewing and progress workflows can rely on.

## Functional requirements

### 1. Lesson-creation scope

- This unit covers creation of lesson records under an existing course.
- The baseline should support:
  - selecting or entering the parent course context
  - defining lesson metadata
  - validating the lesson definition
  - creating a structured lesson record attached to the course
- Lesson viewing, lesson editing, progress tracking, and completion remain separate later units.

### 2. Protected authoring access

- Lesson creation must remain a protected platform-management action.
- Students and company users must not create lessons through this baseline.
- The baseline should align with the same privileged authoring posture established for course creation.

### 3. Lesson data and ordering

- Lesson creation should produce a structured **Lesson** record linked to exactly one **Course** context.
- The baseline should support core lesson fields such as lesson title, summary, ordering or sequence position, and content-ready metadata needed for later viewing.
- Validation failures such as missing parent course, invalid order values, malformed input, or duplicate lesson identity conflicts within a course must return stable outcomes.

### 4. Relationship to the parent course

- Lessons must belong to a previously created course.
- Lesson creation should preserve a predictable sequence inside the course so later viewing and progress flows can rely on stable order.
- Course-level metadata and lesson-level metadata must stay distinct rather than being merged into one content record.

### 5. Frontend and route behavior

- Lesson creation belongs in the protected platform-management area rather than the student learning area.
- The flow should present clear success, validation-error, and unexpected-error states.
- Most lesson-authoring form state should remain local to the feature unless later reuse justifies broader state sharing.

### 6. Relationship to later units

- U4-3 course detail may surface lesson summaries, but it should not own lesson authoring.
- U4-5 lesson viewing should consume the structured lesson records created here.
- U4-7 lesson progress and U4-8 course completion should rely on the course-to-lesson structure defined here rather than inventing lesson sequencing independently.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- U1-2 authentication core
- U1-3 role-based access control
- U1-6 routing and navigation
- U1-7 global state management
- U1-8 base UI layout
- U4-1 course creation
- U4-3 course detail page

## Outputs

- Baseline protected lesson-creation flow
- Course-scoped lesson structure and ordering expectations
- Integration expectations for later lesson-viewing and progress units

## User flow

1. Authorized platform operator enters the protected lesson-creation area for a course.
2. Frontend presents the lesson-definition form in the chosen course context.
3. Operator enters lesson metadata and submits the new lesson.
4. Backend validates the request against course existence, lesson rules, and ordering constraints.
5. The new structured lesson becomes available for later detail display, student viewing, and progress tracking.

## Acceptance criteria

- Lesson-creation behavior is documented clearly.
- Protected lesson-authoring access is defined and aligned with course creation.
- Course-scoped lesson structure and ordering expectations are documented.
- The unit stays separate from lesson delivery, progress, and completion logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Lesson editing or deletion workflows
- Rich media processing pipelines
- Student lesson viewing
- Progress or completion calculations
