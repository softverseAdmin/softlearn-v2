# NFR design: U10-3-withdraw-application

## How NFRs are addressed

- Security is addressed by requiring authenticated student ownership and protected transition handling.
- Privacy is addressed by limiting the flow to student-visible withdrawal outcomes without exposing company-only workflow details.
- Performance is addressed by focusing on predictable terminal-state handling for repeated withdrawal attempts.
- Reliability is addressed through deterministic withdrawable-state checks, authoritative status updates, and traceable history recording.
- Accessibility is addressed by requiring clear success and blocked-withdrawal outcomes for later interfaces.
- Maintainability is addressed by keeping withdrawal separate from company-side workflow actions while reusing the shared status-tracking model.

## Tradeoffs

- Allowing only approved withdrawable states preserves workflow consistency, but later teams must document the exact non-withdrawable states carefully.
- Idempotent handling of repeated withdrawal attempts reduces confusion, though later implementation must decide whether duplicate requests return a terminal success or a stable blocked response.

## Monitoring

- Later implementation should monitor unauthorized withdrawal attempts, invalid terminal-state transitions, duplicate withdrawal events, and missing status-history records.
- Later company-review units should confirm they respect the withdrawn state defined here.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, apply-to-job, and status-tracking baselines.
- Check that withdrawal remains deterministic, student-owned, and auditable.
- Check that unauthorized or non-withdrawable requests are handled safely.
- Run `./scripts/aidlc-check.sh`.
