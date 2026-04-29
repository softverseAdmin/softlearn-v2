# NFR requirements: U10-1-apply-to-job

## Security

- Application creation must require authenticated student access and protect against unauthorized vacancy targeting.
- Application records and initial status-history entries must be created in a protected, auditable context.

## Privacy

- Apply-to-job behavior must not expose company-only workflow data to students.
- Student application creation must respect vacancy visibility and protected student ownership boundaries.

## Performance

- Application creation should complete responsively enough for student submission workflows.
- Submission handling should avoid unstable duplicate-creation behavior under repeated requests.

## Reliability

- The same valid application request should produce a stable submission outcome.
- Duplicate active applications and conflicting initial states should be prevented.

## Accessibility

- Later student-facing application submission outcomes should be representable clearly, including success, duplicate, blocked, and unavailable-vacancy states.

## Maintainability

- The unit should build on shared authentication, visibility, audit, and application-domain baselines.
- The unit should stay focused on application creation rather than absorbing status-tracking or company-review logic.
