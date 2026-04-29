# NFR design: U10-2-application-status-tracking

## How NFRs are addressed

- Security is addressed by treating application status as protected workflow state with authorized access only.
- Privacy is addressed by keeping status visibility within student-owned and company-authorized boundaries.
- Performance is addressed by focusing on predictable current-state retrieval and ordered history access.
- Reliability is addressed through one authoritative current status, deterministic transition rules, and traceable status-history recording.
- Accessibility is addressed by requiring clear and consistent status vocabulary for later interfaces.
- Maintainability is addressed by keeping lifecycle tracking separate from the action units that cause transitions.

## Tradeoffs

- A tightly controlled status vocabulary improves consistency, but later teams must extend it carefully when interview and offer workflows are added.
- Requiring traceable history for every transition increases record volume, though it is important for auditability and user trust.

## Monitoring

- Later implementation should monitor unsupported status transitions, missing history entries, duplicate transition events, and inconsistent student versus company status views.
- Later application workflow units should confirm they reuse this shared lifecycle model instead of inventing separate status rules.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, and apply-to-job baselines.
- Check that application status tracking remains deterministic, auditable, and separated from action-specific workflow behavior.
- Check that unauthorized users cannot access or mutate lifecycle state.
- Run `./scripts/aidlc-check.sh`.
