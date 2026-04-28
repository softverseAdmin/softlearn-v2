# Infrastructure design: U0-2-user-personas-definition

## Infrastructure impact

No runtime infrastructure is selected or changed in this unit. U0-2 only provides user-behavior inputs that later architecture, data-model, security, and workflow units must support.

## Environment variables

None. This unit must not define stack-specific configuration.

## External services

None are selected or required in this unit. Any future integrations implied by persona behavior, such as meeting platforms or notifications, remain conceptual only.

## Deployment impact

No deployment impact in this unit. The only downstream effect is that future environments must support the user behaviors identified here, especially learning, hiring, interview coordination, privacy control, and admin oversight.

## Database impact

No direct database design is created here. The personas inform future need for user-profile, permissions, learning-progress, vacancy, application, interview, and audit-related data concepts.
