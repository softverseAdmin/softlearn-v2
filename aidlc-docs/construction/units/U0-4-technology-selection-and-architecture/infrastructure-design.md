# Infrastructure design: U0-4-technology-selection-and-architecture

## Infrastructure impact

This unit selects a target infrastructure direction, but does not yet provision runtime infrastructure. The current recommendation is to build locally first and keep AWS as the long-term deployment environment for the platform.

## Environment variables

None at this stage. Detailed configuration is deferred until later units.

## External services

No concrete cloud providers are integrated in this unit, but the recommended direction assumes:

- Django-native auth during the local-first phase
- AWS-managed deployment and data services later
- provider-based notifications and email later
- meeting-link handling and validation later

## Deployment impact

The recommended deployment direction is local-first development now and AWS later. This unit does not create infrastructure-as-code or environment definitions yet.

## Database impact

The database recommendation is PostgreSQL. Later database design units should assume relational, audit-friendly, and reporting-capable storage needs, while keeping future vector-style extensions optional.
