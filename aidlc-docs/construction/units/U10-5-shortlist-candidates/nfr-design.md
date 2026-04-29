# NFR design: U10-5-shortlist-candidates

## How NFRs are addressed

- Security is addressed by requiring authenticated company authorization tied to owned vacancy contexts and protected shortlist-state creation.
- Privacy is addressed by keeping shortlist within approved company-visible candidate contexts.
- Performance is addressed by focusing on predictable shortlist handling and duplicate-prevention behavior.
- Reliability is addressed through deterministic eligibility checks, controlled shortlist-state creation, and traceable lifecycle updates.
- Accessibility is addressed by requiring clear later representation of shortlist success and already-shortlisted states.
- Maintainability is addressed by keeping shortlist action separate from later shortlist-view and note-management units.

## Tradeoffs

- Treating shortlist as an explicit action improves auditability, but later teams must ensure shortlist-view experiences do not silently create or alter shortlist state.
- Reusing the shared application status model preserves consistency, though later implementation must document whether all shortlisted contexts require a visible status transition.

## Monitoring

- Later implementation should monitor unauthorized shortlist attempts, duplicate shortlist requests, invalid lifecycle transitions, and missing shortlist-entry or history creation.
- Later shortlist-view and interview units should confirm they consume shortlist state created here rather than redefining it.

## Testing approach

- Review the unit against the requirements, security, data-model, architecture, company review, and status-tracking baselines.
- Check that shortlist action remains authorized, deterministic, and auditable.
- Check that duplicate shortlist state and invalid transitions are handled safely.
- Run `./scripts/aidlc-check.sh`.
