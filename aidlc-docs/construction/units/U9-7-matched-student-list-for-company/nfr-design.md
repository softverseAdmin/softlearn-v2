# NFR design: U9-7-matched-student-list-for-company

## How NFRs are addressed

- Security is addressed by requiring authorized company access tied to company-visible vacancies and protected student result handling.
- Privacy is addressed by applying consent-aware visibility and explanation shaping before any matched-student data is shown.
- Performance is addressed by focusing on predictable ranked retrieval for recruiter-facing review flows.
- Reliability is addressed through stable ranking consumption, duplicate-prevention expectations, and deterministic visibility behavior.
- Accessibility is addressed by requiring match explanations and masked states to remain clearly representable.
- Maintainability is addressed by keeping company-side matched presentation separate from aggregate scoring and downstream hiring workflows.

## Tradeoffs

- Privacy-safe explanations reduce the amount of student detail visible to companies, but this protects student data and keeps recommendation use within approved boundaries.
- Keeping company matched views separate from score calculation preserves clarity, though later teams must ensure both layers remain synchronized on explanation vocabulary.

## Monitoring

- Later implementation should monitor unauthorized access attempts, privacy-filter rejections, stale match entries, and unusual recruiter-side ranking discrepancies.
- Later shortlist and outreach units should confirm they only consume company-visible match results produced under this baseline.

## Testing approach

- Review the unit against the requirements, security, authorization, privacy-filter, and aggregate-scoring baselines.
- Check that company matched-student presentation remains deterministic, privacy-safe, and separate from aggregate scoring logic.
- Check that protected student data cannot leak through list entries or explanations.
- Run `./scripts/aidlc-check.sh`.
