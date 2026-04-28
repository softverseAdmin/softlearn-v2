# NFR design: U0-7-security-and-compliance-design

## How NFRs are addressed

- Security is addressed by defining protected data, protected actions, least-privilege rules, and explicit admin-protection expectations.
- Privacy is addressed by making visibility, consent, and company access control first-class concerns.
- Performance is addressed by keeping the security model structured and practical enough for later implementation without excessive complexity.
- Reliability is addressed by requiring deterministic access and audit outcomes for sensitive actions.
- Accessibility is addressed by requiring understandable privacy, consent, and visibility behavior.
- Maintainability is addressed by separating authentication, authorization, audit, and validation rules clearly.

## Tradeoffs

Early security conservatism may slow some features, but it protects platform trust.
Explicit consent and audit rules add complexity, but they reduce the risk of unsafe data exposure and unclear review behavior later.

## Monitoring

Use review gates and future logging units to verify that controls stay visible.
Later implementation units should confirm that exam-result visibility, company access, admin actions, and meeting-link validation remain aligned with this baseline.

## Testing approach

Review for coverage of authentication, authorization, privacy visibility, consent, audit, exam integrity, meeting-link validation, and admin protection expectations.
Run `./scripts/aidlc-check.sh`.
