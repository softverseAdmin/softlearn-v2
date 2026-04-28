# NFR design: U0-3-core-features-breakdown

## How NFRs are addressed

- Security is addressed by making authentication, roles, privacy, permissions, meeting-link validation, security hardening, and admin management explicit parts of the roadmap.
- Privacy is addressed by separating student visibility, company access control, result visibility, and consent-oriented work into dedicated areas instead of burying them inside unrelated features.
- Performance is addressed by isolating search, matching, dashboards, notifications, and production-readiness work so later optimization can happen without rewriting the roadmap.
- Reliability is addressed by sequencing foundational work before higher-level workflows and by keeping the phase structure predictable from identity through operations.
- Accessibility is addressed by organizing user-facing domains clearly enough that later accessibility requirements can be applied across each major journey.
- Maintainability is addressed by using domain-driven unit names and keeping the roadmap stack-neutral.

## Tradeoffs

- Early domain completeness is prioritized over exact implementation sequencing detail.
- Some units may later split or merge after technology and risk decisions, but the current breakdown favors clarity and traceability first.
- Keeping the roadmap technology-agnostic reduces implementation specificity now, but avoids premature stack bias.

## Monitoring

- Review future CHGs for changes to phase structure, unit scope, or missing domains.
- Compare later unit proposals against this feature map to prevent domain gaps or duplicated ownership.
- Revisit ordering only through explicit document updates when new dependencies become clear.

## Testing approach

- Check that each requested domain appears clearly in the roadmap:
  - authentication and roles
  - student profile
  - company profile
  - courses
  - lessons
  - learning progress
  - exams
  - exam preparation
  - vacancies
  - job search
  - matching
  - applications
  - company student review
  - interview scheduling
  - meeting URLs
  - notifications
  - privacy and permissions
  - admin management
  - dashboards
  - production readiness
- Confirm the roadmap remains phase-based, reviewable, and technology-agnostic.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.
