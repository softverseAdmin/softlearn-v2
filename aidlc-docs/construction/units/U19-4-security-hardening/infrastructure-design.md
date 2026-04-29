# Infrastructure design: U19-4-security-hardening

## Infrastructure impact

This unit does not provision new infrastructure, but it defines the baseline security hardening path that later implementation must support within the existing local-first, AWS-compatible direction.

## Environment variables

- Frontend build environment settings
- Backend runtime configuration settings
- Optional log-level, rate-limit, or pipeline-policy settings as applicable

## External services

- Existing GitHub Actions workflows remain relevant to this phase
- No deployment-host API integration is required for these documentation-only units

## Deployment impact

- Local-first development must support the protected workflow defined in this unit.
- Later AWS-compatible deployment should preserve the same authorization, privacy, audit, and deterministic behavior.
- Adjacent units must integrate with this baseline without redefining its core responsibilities.

## Database impact

- The baseline relies on protected use of **AuditLog** and **OperationalLogEvent** or equivalent records.
- Stored records should remain traceably linked to actor, workflow context, and audit history where applicable.
- The unit should not create unrelated records or schema expectations outside its narrow scope.
