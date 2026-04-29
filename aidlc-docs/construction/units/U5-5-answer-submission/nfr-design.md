# NFR design: U5-5-answer-submission

## How NFRs are addressed

- Security is addressed by requiring authenticated student ownership, controlled attempt finalization, and traceable submission handling.
- Privacy is addressed by keeping submitted answer data protected and separate from later score and result visibility behavior.
- Performance is addressed by focusing on responsive submission handling and predictable submission-status feedback.
- Reliability is addressed through stable attempt outcomes, duplicate-prevention expectations, and validation of exam-linked identifiers.
- Accessibility is addressed by requiring clear confirmation, error, and interrupted-submission feedback.
- Maintainability is addressed by keeping answer submission separate from scoring, results, and retake policy while reusing existing frontend and exam baselines.

## Tradeoffs

- Keeping submission behavior high-level preserves flexibility for later implementation, but later teams must define exact draft-save, retry, and interruption semantics explicitly.
- Treating answer submission as the boundary between transient UI state and durable attempt data improves clarity, though it requires later teams to document state transitions carefully.

## Monitoring

- Later implementation should monitor failed submission validations, duplicate-finalization attempts, unauthorized submission attempts, and unusual interruption or retry patterns.
- Later scoring and history units should confirm they consume controlled submitted-attempt data rather than transient exam-taking state.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, frontend, API, and exam-integrity baselines.
- Check that answer submission remains protected, student-owned, traceable, and separate from scoring and result behavior.
- Check that correctness-sensitive details are not exposed through submission outcomes.
- Run `./scripts/aidlc-check.sh`.
