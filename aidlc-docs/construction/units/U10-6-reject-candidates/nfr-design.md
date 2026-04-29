# NFR design: U10-6-reject-candidates

## How NFRs are addressed

- Security is addressed by requiring authenticated company authorization tied to owned vacancy contexts and protected rejection handling.
- Privacy is addressed by keeping rejection within approved company-visible and student-owned workflow boundaries.
- Performance is addressed by focusing on predictable terminal-state handling for repeated rejection attempts.
- Reliability is addressed through deterministic rejectable-state checks, authoritative status updates, and traceable history recording.
- Accessibility is addressed by requiring clear later representation of rejection outcomes and blocked conditions.
- Maintainability is addressed by keeping rejection separate from shortlist, notifications, and interview workflows while reusing the shared status-tracking model.

## Tradeoffs

- Treating rejection as an explicit terminal action improves auditability, but later teams must define how structured rejection reasons are captured without making the workflow opaque or inconsistent.
- Preventing repeated or conflicting rejection actions preserves lifecycle integrity, though later implementation must define precise behavior for attempts against already terminal applications.

## Monitoring

- Later implementation should monitor unauthorized rejection attempts, invalid terminal-state transitions, duplicate rejection events, and missing status-history records.
- Later notification and interview units should confirm they respect the rejected state defined here.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, company review, and status-tracking baselines.
- Check that rejection remains authorized, deterministic, and auditable.
- Check that invalid or repeated rejection requests are handled safely.
- Run `./scripts/aidlc-check.sh`.
