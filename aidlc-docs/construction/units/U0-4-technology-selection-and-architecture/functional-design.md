# Functional design: U0-4-technology-selection-and-architecture

## Purpose

Evaluate the required technology options, select a justified recommended stack, and capture the corresponding target architecture direction without writing application code.

## User story

As the product and delivery team, we need a documented and reviewable technology decision so the platform can move forward with a justified stack rather than assumptions.

## Functional requirements

### 1. Required comparison categories

- Compare backend, frontend, database, auth, and deployment options.
- Compare the matching approach separately so the platform does not assume opaque AI too early.

### 2. Required evaluation criteria

- development speed
- scalability
- maintainability
- security
- AI/matching support
- cost
- hiring/team skill availability
- deployment complexity

### 3. Required outputs

- A scored comparison table for every requested category
- A clear recommended stack if the evidence justifies one
- An updated conceptual architecture aligned to the recommended stack
- ADR-001 updated from placeholder to a proposed decision

### 4. Recommendation outcome

Based on the comparison, the recommended stack for this platform is:

- **Backend:** Python / Django
- **Frontend:** React + Vite
- **Database:** PostgreSQL
- **Authentication:** framework-native session-based auth
- **Deployment:** local development first, AWS later when deployment is needed
- **Matching:** rule-based and weighted scoring first, with vector search or LLM-assisted enhancements later only if justified

## Inputs

- Requirements baseline
- Persona and feature breakdown outputs
- Platform domains that emphasize privacy, workflow complexity, and future matching logic

## Outputs

- Completed technology decision document
- Updated architecture recommendation
- ADR-001 proposed for acceptance
- A local-first, AWS-compatible stack recommendation that can guide later units while application code remains blocked until formal approval

## User flow

1. Define weighted evaluation criteria.
2. Compare the required options in each category.
3. Select the best-fit stack for this platform if the comparison is decisive.
4. Record the recommendation and architecture in the inception documents and ADR.

## Acceptance criteria

- All required categories are compared.
- The comparison is tied to the requested evaluation criteria.
- The recommendation is justified clearly against platform needs.
- The architecture document reflects the selected direction.
- No application code is introduced.

## Out of scope

Production-ready framework setup, application bootstrapping, and application code generation.
