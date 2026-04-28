# Infrastructure design: U0-1-platform-requirements-definition

## Infrastructure impact

No runtime infrastructure is selected or provisioned in this unit. The output of U0-1 is a requirement baseline that later infrastructure and architecture units must satisfy.

## Environment variables

None. This unit must not define stack-specific configuration.

## External services

None are selected in this unit. However, the requirement baseline establishes future need for categories such as:

- identity and access control support
- storage for learning and exam data
- notification delivery
- interview meeting-link handling
- audit and logging support

These remain conceptual only until later units.

## Deployment impact

No deployment change is made in U0-1. The main deployment implication is that later environments must support:

- protected student data handling
- permission-controlled company access
- exam and interview workflows
- auditable access to sensitive information

Deployment patterns and providers remain intentionally undecided.

## Database impact

No database technology or schema is chosen here. This unit informs later high-level data modeling by establishing the need for future support of:

- student and company identities
- learner profiles and privacy settings
- courses, lessons, and progress
- exams, attempts, and results
- vacancies and applications
- matching outcomes
- interviews and meeting links
- consent and audit records
