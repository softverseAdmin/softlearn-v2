# Infrastructure design: U6-5-readiness-score-calculation

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected backend evaluation behavior for deriving readiness scores from learning and exam evidence consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for readiness-rule refinements

## External services

- None required for the baseline readiness-score flow
- External AI services, analytics platforms, and model-serving systems are out of scope for this unit

## Deployment impact

- Local-first development must support protected readiness evaluation using learning and exam summary evidence.
- Later AWS-compatible deployment should preserve the same deterministic explainability posture, auditability expectations, and protected evidence boundaries.
- Readiness-score behavior must remain compatible with later matching, guidance, and privacy-sensitive visibility workflows.

## Database impact

- The baseline relies on structured **Enrollment**, **LessonProgress**, **CourseCompletion**, **ExamAttempt**, score, and pass/fail outcome evidence summarized into a **ReadinessScore** context.
- Later matching, guidance, and visibility features should consume the same readiness baseline rather than inventing parallel hidden readiness models.
- The unit should not create vacancy-match results or override privacy settings directly.
