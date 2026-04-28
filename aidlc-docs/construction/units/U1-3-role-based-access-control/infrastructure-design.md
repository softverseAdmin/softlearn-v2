# Infrastructure design: U1-3-role-based-access-control

## Infrastructure impact

This unit does not provision infrastructure, but it defines authorization behavior that later backend runtime, audit logging, admin tooling, and deployment units must support consistently.

## Environment variables

- None required specifically for the RBAC model itself
- Later environments may need admin bootstrap or protected-role initialization settings, but those are not defined in this unit
- Logging and trace identifier settings later support audit-friendly authorization outcomes

## External services

- None required by the RBAC baseline itself
- Later audit, notification, or admin integrations may consume authorization outcomes but are not part of this unit

## Deployment impact

- Local-first and later AWS-compatible deployment must preserve the same authorization behavior across environments.
- Admin and company access controls should not depend on environment-specific manual exceptions.
- Later deployment hardening should protect privileged admin operations and audit data without changing the baseline role model.

## Database impact

- Authorization depends on the primary user identity model plus role, company membership, consent, privacy, and audit-related data.
- Later implementation will likely require role assignment, company membership, and privileged admin scope data in the relational model.
- Domain records should be designed so ownership and organization-boundary checks are enforceable.
