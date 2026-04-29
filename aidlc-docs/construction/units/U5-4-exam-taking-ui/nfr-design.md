# NFR design: U5-4-exam-taking-ui

## How NFRs are addressed

- Security is addressed by requiring authenticated student access, exam-availability checks, and protection against exposing correctness-sensitive metadata.
- Privacy is addressed by keeping the active exam-taking experience separate from later results visibility and management contexts.
- Performance is addressed by focusing on responsive exam loading, question navigation, and active interaction behavior.
- Reliability is addressed through stable rendering expectations and predictable handling of unavailable or inconsistent exam state.
- Accessibility is addressed by requiring clear reading order, navigation structure, timing cues, and understandable interaction states.
- Maintainability is addressed by keeping exam-taking UI separate from submission, scoring, results, and retake policy while reusing existing frontend and exam baselines.

## Tradeoffs

- Keeping the UI baseline high-level preserves flexibility for later implementation, but later teams must define concrete timer, autosave, and interruption behaviors explicitly.
- Treating most active exam state as local UI state simplifies feature ownership, though later submission flows must document how transient state becomes durable attempt data.

## Monitoring

- Later implementation should monitor unauthorized exam-access attempts, failed exam-loading states, route-entry failures, and unusual interruption patterns.
- Later submission and scoring units should confirm they operate on controlled submitted-attempt data rather than transient UI state.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, frontend, routing, and exam-integrity baselines.
- Check that exam-taking UI remains protected, student-facing, and separate from submission and scoring behavior.
- Check that correctness-sensitive metadata is not exposed through the presentation baseline.
- Run `./scripts/aidlc-check.sh`.
