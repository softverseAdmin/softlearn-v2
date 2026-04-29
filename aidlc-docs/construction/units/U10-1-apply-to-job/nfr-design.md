# NFR design: U10-1-apply-to-job

## How NFRs are addressed

- Security is addressed by requiring authenticated student ownership, visible vacancy targeting, and protected creation of application records.
- Privacy is addressed by limiting the apply flow to student-owned submission outcomes without exposing company-only workflow details.
- Performance is addressed by focusing on predictable request handling and duplicate-prevention behavior.
- Reliability is addressed through deterministic eligibility checks, stable initial status creation, and traceable status-history recording.
- Accessibility is addressed by requiring clear submission outcomes for later student interfaces.
- Maintainability is addressed by keeping application creation separate from later lifecycle and company-review actions while reusing shared platform rules.

## Tradeoffs

- Keeping apply-to-job narrowly scoped avoids mixing in later workflow actions, but later teams must document richer submission eligibility rules if new hiring policies are introduced.
- Duplicate-prevention improves data integrity, though later implementation must define whether reapplication is allowed after specific terminal states.

## Monitoring

- Later implementation should monitor duplicate application attempts, blocked vacancy submissions, malformed requests, and missing initial status-history creation.
- Later status-tracking units should confirm they consume the same initial submission baseline defined here.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, vacancy-visibility, and base API baselines.
- Check that application creation remains deterministic, protected, and separate from later lifecycle actions.
- Check that duplicate active applications and unavailable-vacancy submissions are handled safely.
- Run `./scripts/aidlc-check.sh`.
