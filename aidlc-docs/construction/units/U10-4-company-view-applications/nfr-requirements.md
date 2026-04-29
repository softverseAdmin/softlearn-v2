# NFR requirements: U10-4-company-view-applications

## Security

- Company-side application review must require authenticated authorized company access.
- Cross-company vacancy and application data must not be exposed.

## Privacy

- Application review must respect student visibility, consent, and privacy-filter rules.
- Candidate details shown to company users must remain limited to approved company-visible data.

## Performance

- Company application retrieval should complete responsively enough for recruiter review workflows.
- List rendering should remain stable with later sorting or filtering refinements.

## Reliability

- The same authorized company context and application set should produce the same visible records and status posture.
- Stale, duplicate, or cross-company application entries should be prevented.

## Accessibility

- Status labels, timestamps, and masked-data states should be representable clearly in company-facing review interfaces.

## Maintainability

- The unit should build on shared authorization, privacy-filter, vacancy, and lifecycle baselines.
- The unit should stay focused on passive application review rather than absorbing state-changing actions.
