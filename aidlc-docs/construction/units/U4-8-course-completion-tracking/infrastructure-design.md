# Infrastructure design: U4-8-course-completion-tracking

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected course-completion persistence or derivation behavior that later backend learning-state services and student-facing routes must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for completion-rule refinements

## External services

- None required for the baseline course-completion flow
- Certificate services, badge providers, or analytics platforms are out of scope for this unit

## Deployment impact

- Local-first development must support protected course-completion reads and any required evaluation paths between frontend and backend.
- Later AWS-compatible deployment should preserve the same deterministic completion posture and protected-access rules.
- Completion status must remain compatible with the shared student learning architecture and later privacy controls.

## Database impact

- The baseline relies on structured **CourseCompletion** outcomes tied to **Enrollment** and informed by **LessonProgress**.
- Later readiness, matching, or summary features should consume completion outcomes as downstream evidence rather than recomputing conflicting definitions independently.
- The unit should not create company-visibility or certificate records directly.
