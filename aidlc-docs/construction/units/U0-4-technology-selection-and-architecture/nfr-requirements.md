# NFR requirements: U0-4-technology-selection-and-architecture

## Security

- Candidate stacks must support strong authentication, authorization, auditability, and safe admin operations.
- The selected stack must be credible for privacy-sensitive student data and permission-controlled company access.

## Privacy

- Technology choices must support consent-aware access control, secure data handling, and traceable company access to student information.
- The recommendation must not weaken privacy by favoring speed alone.

## Performance

- The evaluation must consider scaling for learning, exams, matching, search, dashboards, and notifications.
- The selected architecture should support phased growth without requiring premature microservices.

## Reliability

- Architecture direction should support resilient operation across environments and stable long-term maintenance.
- The decision should favor technologies with mature operational patterns and good failure-handling defaults.

## Accessibility

- Frontend candidates should be suitable for accessible, role-rich product experiences.
- The stack should not create unnecessary UI complexity for a platform whose core value is inside logged-in workflows.

## Maintainability

- The chosen stack must fit unit-by-unit delivery, clear domain boundaries, and long-term support.
- The recommendation should favor a maintainable application shape for a multi-domain platform, not only the fastest short-term option.
