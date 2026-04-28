# NFR design: U0-4-technology-selection-and-architecture

## How NFRs are addressed

- Security is addressed by scoring identity, authorization, and deployment options with strong weight and by favoring a stack that supports auditability and protected admin workflows.
- Privacy is addressed by preferring technologies that support permission-heavy, relational business logic and clear access boundaries.
- Performance is addressed by selecting an architecture that supports growth in matching, search, dashboards, and notifications without forcing early distributed complexity.
- Reliability is addressed by preferring mature frameworks and infrastructure options with strong operational patterns.
- Accessibility is addressed by preferring a frontend architecture well-suited to authenticated, role-aware product flows.
- Maintainability is addressed by favoring a modular monolith shape and technologies with good long-term developer ergonomics.

## Tradeoffs

- Django is not the fastest possible choice for teams that are purely TypeScript-oriented, but it provides a stronger balance for this platform's workflow and AI-adjacent needs.
- Auth0 improves early security and delivery speed, but introduces vendor cost and dependency.
- AWS is strategically strong, but more operationally complex than Render/Fly.io for the very earliest stages.
- React + Vite is a better fit than Next.js for the current product shape, but it gives up some built-in SSR conveniences if strong public SEO requirements emerge later.

## Monitoring

- Track the technology recommendation through `technology-decision.md`, `architecture.md`, and ADR-001 review.
- Revisit the recommendation if team capability, cost constraints, or compliance requirements change materially.
- Validate later units against this decision so stack drift does not occur silently.

## Testing approach

- Review whether every required category and evaluation criterion is covered.
- Check that the recommendation is justified against the platform's privacy, matching, admin, and workflow needs.
- Confirm the resulting architecture stays implementation-free in this unit.
- Run `./scripts/aidlc-check.sh`.
