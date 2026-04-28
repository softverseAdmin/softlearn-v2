# NFR requirements: U0-3-core-features-breakdown

## Security

- Security-sensitive work must appear explicitly in the feature map rather than being left as implicit follow-up work.
- Authentication, authorization, privacy, meeting-link validation, and production hardening must be visible as distinct units or domains.
- Admin and company access boundaries must remain clear in the roadmap.

## Privacy

- Privacy-sensitive capabilities should be separated enough to review clearly, especially where company access to student data is involved.
- Privacy and permissions work must be represented as first-class domains, not hidden inside profile or matching units.
- The breakdown must preserve space for consent, visibility rules, and auditability later.

## Performance

- The roadmap should support incremental delivery without oversized units that are hard to review or validate.
- Performance-sensitive areas such as search, matching, dashboards, and production readiness should appear clearly enough to guide later optimization work.
- The phase structure should avoid bundling unrelated high-complexity features into the same unit.

## Reliability

- Unit naming and phasing should be stable enough for planning continuity across inception and construction.
- Feature sequencing should support predictable dependency flow from foundation to operational hardening.
- The roadmap should avoid ambiguity that would make later unit ownership or completion hard to judge.

## Accessibility

- User-facing units should leave room for accessibility and usability requirements later.
- The roadmap should cover the major user-facing journeys in a way that supports later accessibility review across learning, hiring, and admin experiences.

## Maintainability

- Units should be small, understandable, and traceable back to product domains.
- The breakdown should remain technology-agnostic so it stays useful after ADR-001.
- Domain and phase names should be consistent enough for later documentation, PRs, and review gates.
