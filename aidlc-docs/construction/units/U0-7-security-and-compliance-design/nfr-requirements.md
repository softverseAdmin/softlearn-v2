# NFR requirements: U0-7-security-and-compliance-design

## Security

Least privilege, authentication, authorization, validation, auditability, and privileged-admin protection are mandatory.
Security rules must be strong enough for protected student data, exams, applications, and interviews.

## Privacy

Student data access must be consent-aware and reviewable.
Privacy rules must clearly separate what students can see, what companies can see, and what admins can access.
Matching and company-review flows must not bypass student visibility rules.

## Performance

Security controls should be compatible with later scale and audit needs.
Validation, audit, and access-control rules should remain practical for local-first development and later AWS-compatible deployment.

## Reliability

Security decisions should produce consistent behavior across units.
Protected actions should have deterministic authorization outcomes and traceable audit behavior.

## Accessibility

Security-related user flows should remain understandable and usable.
Privacy and permission decisions should be explainable enough for product and support flows later.

## Maintainability

Rules should be explicit enough to apply consistently across the repository.
The baseline should separate authentication, authorization, visibility, consent, and audit concerns so later units can implement them clearly.
