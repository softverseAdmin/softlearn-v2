# NFR requirements: U5-4-exam-taking-ui

## Security

- Exam-taking UI must enforce authenticated, student-approved access to the target exam.
- The interface must not expose correctness-sensitive metadata or protected management details.

## Privacy

- Active exam-taking state and later results must remain visible only to the authenticated student and approved internal contexts.
- The UI must not leak exam internals or hidden result information beyond what the student needs to take the exam.

## Performance

- Exam-taking screens should load and respond smoothly enough to support focused student assessment behavior.
- Question navigation and active-response interaction should remain predictably responsive.

## Reliability

- The same valid exam state should render consistently for an authorized student.
- Unavailable, interrupted, or inconsistent exam state should return stable user-facing outcomes rather than broken screens.

## Accessibility

- The exam-taking interface should support clear reading order, question navigation, and understandable interaction states.
- Timing, progress, and action controls should be presented clearly for keyboard and assistive-technology users.

## Maintainability

- Exam-taking UI should build on the shared frontend, routing, exam-domain, and session baselines.
- The unit should stay focused on presentation and navigation rather than absorbing submission, scoring, results, or retake logic.
