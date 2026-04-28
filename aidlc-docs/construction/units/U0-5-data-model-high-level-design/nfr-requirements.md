# NFR requirements: U0-5-data-model-high-level-design

## Security

- The model should support secure separation of identity, profile, permission, and audit data.
- Sensitive actions such as company access to student information and admin actions should have a clear audit path in the conceptual model.

## Privacy

- Consent, profile visibility, and exam-result visibility must be first-class concepts.
- The model must support privacy-aware sharing between students and companies.
- Privacy rules should be expressible without overloading generic profile entities.

## Performance

- The conceptual model should not preclude future scaling for learning, exams, matching, notifications, dashboards, and reporting.
- Shared taxonomies and relationship boundaries should reduce duplication that would later harm performance or reporting quality.

## Reliability

- Entity definitions should remain stable across early design phases and clear enough to anchor later schema work.
- Relationship intent should be deterministic enough to reduce ambiguity in later unit implementation.

## Accessibility

- A clear domain model should support accessible and understandable product behavior later by avoiding inconsistent data concepts across workflows.
- The model should not force fragmented user records that make role-specific experiences harder to reason about.

## Maintainability

- Names and boundaries should stay understandable across units.
- Shared entities, taxonomies, and workflow records should be reusable across learning, hiring, and admin domains.
- The model should remain conceptual and portable across local-first and AWS-compatible deployment directions.
