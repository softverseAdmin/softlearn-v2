# ADR-001: Technology stack

## Status

Accepted

## Context

The platform needs a stack that supports AI-DLC unit-by-unit delivery, strong privacy controls, explainable matching, admin-heavy workflows, and long-term maintainability. The product combines learning management, exams, hiring workflows, interview scheduling, and permission-controlled company access to student data. The stack therefore needs to work well for:

- rich relational business logic
- auditability and privacy-aware authorization
- structured admin operations
- future AI-assisted matching without requiring AI-first architecture on day one

## Options

### Backend candidates

- Ruby on Rails
- Node.js / NestJS
- Python / Django
- Python / FastAPI
- Java / Spring Boot

### Frontend candidates

- React + Vite
- Next.js
- Vue / Nuxt

### Database candidates

- PostgreSQL
- MySQL
- MongoDB

### Authentication candidates

- Custom session / JWT
- Auth0
- AWS Cognito
- Firebase Auth

### Deployment candidates

- AWS
- GCP
- Render / Fly.io
- Vercel + managed backend

### AI and matching approach candidates

- Rule-based matching first
- Weighted scoring
- Embedding / vector search later
- LLM-assisted recommendation later

## Decision

Recommend the following stack for v1:

- **Backend:** Python / Django
- **Frontend:** React + Vite
- **Database:** PostgreSQL
- **Authentication:** Django-native session-based auth
- **Deployment:** local development first, AWS later when deployment is needed
- **Matching approach:** Rule-based and weighted scoring first; vector search and LLM assistance later only if justified

## Decision rationale

### Why Django

- Best balance of delivery speed, maintainability, security, and future AI integration
- Strong fit for admin-heavy and workflow-heavy products
- Better out-of-the-box foundation than FastAPI for this specific domain complexity

### Why React + Vite

- Fast development for authenticated product workflows
- Strong ecosystem and hiring availability
- Cleaner fit than Next.js for a separate frontend paired with a capable backend

### Why PostgreSQL

- Best fit for relational, auditable, reporting-friendly business workflows
- Strong future path for analytics and optional vector capabilities

### Why Django-native session auth

- Better fit for local-first development and lower early cost
- Works well for a browser-based, privacy-sensitive product with strong server-side control
- Avoids recurring hosted-auth cost before the product has real customer traction
- Keeps the option open to introduce hosted identity later if requirements grow

### Why AWS

- Strongest long-term fit for secure operations, managed data services, monitoring, and future AI expansion
- Better strategic fit than lighter hosting options for a platform expected to grow in complexity
- Can be adopted later without forcing cloud cost during the current local-first stage

## Consequences

### Positive

- Strong foundation for privacy-sensitive and role-rich workflows
- Good long-term fit for auditability and maintainable domain logic
- Python backend improves future flexibility for matching and analytics work
- React frontend keeps client-side product development fast and well-supported

### Negative

- Django-native auth requires more in-application ownership than hosted identity
- AWS increases operational complexity compared with simpler hosting platforms once deployment begins
- React + Django creates a two-application model instead of a single full-stack framework

## Risks

- If identity requirements become more complex than expected, Django-native auth may need to be upgraded later
- If the delivery team is strongly TypeScript-first, Django may reduce immediate familiarity
- If the product later requires heavy public SEO pages, React + Vite may need an additional content/frontdoor strategy

## Mitigations

- Introduce hosted identity later if security, federation, or operational needs outgrow native session auth
- Use a modular monolith to keep operational overhead reasonable in early phases
- Keep the architecture AWS-compatible while building locally first

## Revisit date

Revisit after Phase 1 foundational units are complete, or sooner if cost, team capability, or compliance requirements change materially.
