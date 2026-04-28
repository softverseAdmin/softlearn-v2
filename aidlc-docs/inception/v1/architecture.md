# Inception v1 architecture

## Goal

Describe the recommended target architecture for the platform based on the current technology comparison, while keeping implementation work out of scope for this unit and preserving a local-first development model.

## Recommended architecture summary

- **Frontend:** React + Vite
- **Backend:** Django
- **Database:** PostgreSQL
- **Authentication:** Django-native session-based auth, with application-side authorization and privacy logic
- **Deployment target:** local development first; AWS later when deployment is needed
- **Matching approach:** rule-based and weighted scoring first, with optional vector and LLM enhancements later

## Architecture style

### Recommended application shape

Use a **modular monolith** architecture first:

- one primary backend application with clear domain boundaries
- one primary frontend application for students, company users, and admins
- one relational system of record
- asynchronous/background processing where needed for notifications, scoring, and reporting

This is the best fit for the current product stage because the platform has many tightly related domains and shared permission rules. Starting as services too early would increase coordination cost and slow delivery.

### Development posture

Build and validate the product locally first:

- local backend runtime
- local frontend runtime
- local PostgreSQL database
- local environment configuration

Cloud deployment is intentionally deferred until it is needed, but the architecture should remain compatible with later AWS deployment.

## Logical layers

### 1. Experience layer

- React + Vite web application
- Role-aware experience for:
  - students / learners
  - company users
  - admins
- Frontend focuses on authenticated product workflows rather than SEO-heavy public pages

### 2. Identity and access layer

- Django manages primary user identity concerns such as login, session lifecycle, and session-based browser authentication
- Django remains the system of record for:
  - platform roles
  - permissions
  - consent-aware visibility rules
  - company access checks
  - audit-oriented access decisions

This approach favors lower cost and lower operational dependency while the platform is still in its local-first stage.

### 3. Application layer

Recommended Django domain modules:

- identity and authorization
- student profile and privacy
- company profile and company membership
- courses and lessons
- learning progress
- exams and scoring
- exam preparation
- vacancies and job search
- matching and readiness scoring
- applications and company review
- interview scheduling and meeting-link handling
- notifications
- admin management
- dashboards and analytics summaries
- audit and consent logging

### 4. Data layer

- PostgreSQL as the primary transactional database
- Structured relational model for users, profiles, courses, lessons, exams, vacancies, applications, interviews, consent, and audit data
- Reporting-friendly schema design over time for dashboard and analytics needs
- Optional future extension to support vector search if matching evolves beyond rule-based scoring

### 5. Integration layer

- email and notification providers later
- meeting-link validation and provider-specific patterns later
- file storage later if resumes or attachments are supported
- optional future AI services for richer recommendation or explanation

Hosted identity can still be introduced later if federation, enterprise login, or operational requirements justify it.

### 6. Operations layer

- local development environment as the current operating model
- AWS-hosted deployment target for later production deployment
- managed relational database
- object storage where needed later
- centralized logging, monitoring, and backup strategy
- CI/CD and security hardening added as later units mature

## Why this architecture fits the platform

### Strong fit for complex business workflows

The platform combines learning, testing, hiring, privacy, consent, and admin management in a tightly connected domain model. A modular monolith keeps those workflows coherent while still allowing clean internal boundaries.

### Good fit for privacy and permissions

Student data visibility is not a simple role check. It depends on privacy settings, allowed company access, exam-result visibility, and auditability. A single backend with clear authorization and consent logic reduces inconsistency risk.

### Good fit for explainable matching

Python and PostgreSQL support a clean path from deterministic scoring to richer data science support later. Matching can remain explainable first, then become more sophisticated without changing the whole platform shape.

### Good fit for admin and audit

The platform has significant operational and administrative scope. Django fits well for structured business workflows, internal management interfaces, mature security patterns, and local-first product iteration.

## Key architectural principles

- Prefer a modular monolith first; extract services only when justified by scale or operational isolation needs
- Keep authentication separate from application authorization and privacy policy enforcement
- Use PostgreSQL as the system of record for structured and auditable workflows
- Treat matching as explainable business logic first, not as opaque AI-first ranking
- Keep the frontend independent from backend rendering to simplify client workflows and team boundaries
- Build locally first, but keep infrastructure assumptions portable to AWS later

## Near-term evolution path

### Phase 1 to early construction

- Establish backend, frontend, database, and auth foundations in local development first
- Build identity, profile, learning, exam, and vacancy workflows in the modular monolith

### Mid-stage evolution

- Add background processing, reporting views, and more mature dashboarding
- Improve matching sophistication with weighted scoring and richer signals

### Later-stage evolution

- Introduce vector search or specialized AI services only if justified by data volume and recommendation quality needs
- Consider service extraction only for clear operational reasons such as independent scaling or isolation of heavy workloads

## Out of scope for this unit

- Application code
- Framework bootstrapping
- API contract design
- Concrete infrastructure-as-code
- Exact service-level topology
