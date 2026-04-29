# NFR design: U10-4-company-view-applications

## How NFRs are addressed

- Security is addressed by tying application visibility to authenticated company membership and vacancy ownership boundaries.
- Privacy is addressed by applying consent-aware candidate-data shaping before company-side presentation.
- Performance is addressed by focusing on predictable retrieval of authorized application lists and status data.
- Reliability is addressed through stable company-boundary filtering and reuse of authoritative application status.
- Accessibility is addressed by requiring clear status labels and understandable masked-data states.
- Maintainability is addressed by keeping company review separate from the later workflow actions it enables.

## Tradeoffs

- Privacy-safe review reduces recruiter-visible detail, but it protects student data and keeps company review within approved policy boundaries.
- Keeping this unit passive avoids state confusion, though later teams must ensure shortlist and rejection actions integrate cleanly from the same application list surface.

## Monitoring

- Later implementation should monitor cross-company access attempts, privacy-filter denials, stale application entries, and unexpected discrepancies between company and student application status views.
- Later action units should confirm they consume the same authorized application context defined here.

## Testing approach

- Review the unit against the requirements, security, company-authorization, privacy-filter, and application lifecycle baselines.
- Check that company-side application review remains authorized, privacy-safe, and separate from state-changing workflow behavior.
- Check that cross-company data and protected student details cannot leak through the review view.
- Run `./scripts/aidlc-check.sh`.
