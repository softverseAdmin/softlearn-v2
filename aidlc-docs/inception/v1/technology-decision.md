# Inception v1 technology decision

## Status

Comparison completed. A recommended stack is proposed and documented below, but formal acceptance still depends on ADR-001 approval. The recommendation now assumes **local-first development** with **AWS compatibility for later deployment**.

## Decision method

- Scoring scale: **1 (weak) to 5 (strong)**
- Weighted criteria:

| Criterion | Weight | Why it matters for this platform |
| --- | --- | --- |
| Development speed | 5 | The product will be built unit by unit, so time-to-value matters. |
| Scalability | 4 | The platform must support growing learners, companies, exams, and matching volume. |
| Maintainability | 5 | The system will evolve across many units and needs clear long-term operability. |
| Security | 5 | Student data, exam evidence, admin powers, and company access all require strong controls. |
| AI/matching support | 4 | Matching starts as explainable scoring and may evolve into ML-assisted ranking later. |
| Cost | 3 | The initial delivery must remain practical. |
| Hiring/team skill availability | 3 | The stack should be realistic to staff and support. |
| Deployment complexity | 3 | Early delivery benefits from understandable operations. |

## Platform needs that influence the decision

- Strong role separation between students, company users, and admins
- Privacy-sensitive visibility rules and auditable access
- Structured domains with relational data: profiles, courses, lessons, exams, vacancies, applications, interviews, and consent
- Admin-heavy operational workflows
- Explainable matching first, with room for future AI enhancement
- A delivery model that benefits from a modular monolith before optional service extraction
- A local-first workflow so the product can be built and validated before cloud costs become necessary

## Backend comparison

| Option | Speed | Scale | Maintainability | Security | AI support | Cost | Hiring | Deployment | Total | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ruby on Rails | 5 | 4 | 4 | 4 | 3 | 4 | 3 | 4 | 126 | Excellent CRUD speed and admin ergonomics, but weaker fit for Python-first AI work and smaller hiring pool in many teams. |
| Node.js / NestJS | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 128 | Strong TypeScript structure and hiring market; good choice for all-JS teams. |
| Python / Django | 4 | 4 | 5 | 5 | 5 | 4 | 4 | 4 | 142 | Best balance for a privacy-sensitive, admin-heavy, data-rich platform with future AI integration. |
| Python / FastAPI | 4 | 4 | 3 | 3 | 5 | 4 | 4 | 4 | 122 | Excellent for lightweight APIs and ML integration, but requires more assembly for admin, auth, and workflow-heavy business logic. |
| Java / Spring Boot | 3 | 5 | 5 | 5 | 4 | 3 | 4 | 3 | 131 | Enterprise-grade and durable, but slower for early delivery and heavier operationally. |

### Backend recommendation

**Recommended: Python / Django**

**Why**

- Strong fit for a modular monolith with rich business workflows
- Mature built-in admin and security foundations
- Natural fit for future matching, analytics, and ML integration
- Good balance between early delivery speed and long-term maintainability

## Frontend comparison

| Option | Speed | Scale | Maintainability | Security | AI support | Cost | Hiring | Deployment | Total | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| React + Vite | 5 | 4 | 4 | 4 | 4 | 5 | 5 | 5 | 142 | Best fit for a separate application frontend with fast iteration, broad hiring availability, and clean pairing with an API backend. |
| Next.js | 4 | 5 | 4 | 4 | 4 | 4 | 5 | 4 | 135 | Strong framework, but adds an extra server-side application layer that is not required for this primarily authenticated platform. |
| Vue / Nuxt | 4 | 4 | 4 | 4 | 3 | 5 | 3 | 4 | 124 | Productive and pleasant to develop, but typically has a smaller hiring pool and fewer cross-team defaults. |

### Frontend recommendation

**Recommended: React + Vite**

**Why**

- Fast development loop for an authenticated product application
- Clear separation from the backend API layer
- Strong hiring pool and ecosystem depth
- Avoids unnecessary SSR complexity for a platform whose main value is inside logged-in workflows

## Database comparison

| Option | Speed | Scale | Maintainability | Security | AI support | Cost | Hiring | Deployment | Total | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PostgreSQL | 4 | 5 | 5 | 5 | 5 | 4 | 4 | 4 | 146 | Best fit for relational workflows, reporting, auditability, and future vector/analytics extensions. |
| MySQL | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 124 | Stable and widely understood, but less attractive for future advanced matching and analytics needs. |
| MongoDB | 4 | 4 | 3 | 3 | 4 | 4 | 4 | 4 | 118 | Flexible, but weaker fit for highly relational, permission-heavy workflows and audit-oriented reporting. |

### Database recommendation

**Recommended: PostgreSQL**

**Why**

- Strong fit for relational domains and reporting needs
- Good support for structured permissions, audit, and analytics queries
- Best path for future AI support if vector search becomes useful later

## Authentication comparison

| Option | Speed | Scale | Maintainability | Security | AI support | Cost | Hiring | Deployment | Total | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Custom session / JWT | 4 | 4 | 4 | 4 | 3 | 5 | 4 | 4 | 127 | Lowest vendor cost and strongest control, but more in-house auth responsibility. Best interpreted as framework-native auth, not bespoke crypto. |
| Auth0 | 5 | 5 | 5 | 5 | 3 | 2 | 4 | 4 | 137 | Fastest secure start with strong hosted identity features, but higher recurring cost and vendor dependence. |
| AWS Cognito | 3 | 5 | 3 | 4 | 3 | 4 | 3 | 2 | 109 | Scalable and AWS-aligned, but adds product and operational complexity. |
| Firebase Auth | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 124 | Fast to adopt, but weaker fit for a platform centered on complex enterprise-like permissions and future backend ownership. |

### Authentication recommendation

**Recommended: framework-native session-based auth**

**Why**

- Best fit for local-first development and lowest early operating cost
- Works well with Django for a server-controlled, privacy-sensitive application
- Keeps identity and session management under direct application control while the product is still being shaped locally
- Avoids immediate hosted-auth vendor cost before real customer traction exists

**Operational note**

- JWT should stay optional and limited to future API, mobile, or machine-to-machine needs rather than being the default browser-auth model.

## Deployment comparison

| Option | Speed | Scale | Maintainability | Security | AI support | Cost | Hiring | Deployment | Total | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AWS | 4 | 5 | 4 | 5 | 5 | 3 | 4 | 3 | 135 | Best long-term fit for privacy-sensitive workloads, managed data services, analytics, and future AI expansion. |
| GCP | 4 | 4 | 4 | 4 | 5 | 3 | 3 | 3 | 123 | Strong data and AI capabilities, but less natural fit here than AWS for broad platform operations. |
| Render / Fly.io | 5 | 3 | 4 | 4 | 3 | 4 | 4 | 5 | 128 | Very attractive for initial simplicity, but weaker long-term fit for stricter compliance, deeper operations, and scale. |
| Vercel + managed backend | 5 | 4 | 3 | 4 | 4 | 3 | 4 | 4 | 125 | Good frontend experience, but less cohesive for a backend-heavy, workflow-rich product. |

### Deployment recommendation

**Recommended: local development first, AWS later**

**Why**

- Matches the current product stage: build and validate locally before paying for always-on cloud resources
- Keeps the team focused on product design and workflow quality instead of deployment overhead
- Preserves AWS as the long-term target for secure and scalable production deployment

**Operational note**

- AWS remains the target cloud environment once deployment is needed, but no cloud runtime should be required during the current local-first phase.

## AI and matching approach recommendation

| Option | When to use | Explainability | Operational complexity | Notes |
| --- | --- | --- | --- | --- |
| Rule-based matching first | Initial release | High | Low | Recommended starting point because it is reviewable, privacy-aware, and easy to explain. |
| Weighted scoring | Initial release | High | Low to medium | Recommended as the main evolution of the initial matching engine. |
| Embedding / vector search later | Enhancement phase | Medium | Medium | Optional enhancement for discovery once enough data exists. |
| LLM-assisted recommendation later | Enhancement phase | Medium | Medium to high | Optional and should remain secondary to auditable scoring. |

## Recommended stack

| Layer | Recommendation |
| --- | --- |
| Backend | Python / Django |
| Frontend | React + Vite |
| Database | PostgreSQL |
| Authentication | Framework-native session-based auth |
| Deployment | Local development first; AWS-compatible for later deployment |
| Matching strategy | Rule-based + weighted scoring first; vector search and LLM assistance later |

## Why this stack is the best fit

This platform is not just content delivery or a simple job board. It combines structured learning, exams, privacy-sensitive student data, explainable matching, company review workflows, and admin-heavy operations. That combination favors a **relational, workflow-friendly, security-conscious backend** with room for future AI integration.

The recommended stack balances **delivery speed**, **maintainability**, **security**, **cost control**, and **future matching capability** better than the alternatives for the current stage. Django and PostgreSQL provide a strong foundation for complex domain logic and auditability. React + Vite gives a fast, widely understood frontend model. Framework-native session auth keeps the early platform simple and inexpensive while still fitting a privacy-sensitive application. AWS remains the intended later deployment target once real cloud hosting is needed.

## Runner-up alternatives

- **Alternative if the team is strongly TypeScript-centered:** NestJS + React + PostgreSQL + Auth0 + AWS
- **Alternative if hosted auth becomes necessary earlier than expected:** Django + React + PostgreSQL + Auth0 + AWS
