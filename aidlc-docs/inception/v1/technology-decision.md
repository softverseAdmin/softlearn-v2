# Inception v1 technology decision

## Status

Pending comparison. No final stack has been selected yet.

## Decision method

Evaluate each category against the same criteria before selecting a combined stack.

## Scoring criteria

| Criterion | Weight | Notes |
| --- | --- | --- |
| Speed of development | 5 | |
| Scalability | 4 | |
| Maintainability | 5 | |
| Security | 5 | |
| AI feature support | 4 | |
| Cost | 3 | |
| Hiring/team skill availability | 3 | |
| Deployment complexity | 3 | |

## Backend comparison template

| Option | Speed | Scale | Maintainability | Security | AI support | Cost | Hiring | Deployment | Total | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ruby on Rails | | | | | | | | | | |
| Node.js / NestJS | | | | | | | | | | |
| Python / Django | | | | | | | | | | |
| Python / FastAPI | | | | | | | | | | |
| Java / Spring Boot | | | | | | | | | | |

## Frontend comparison template

| Option | Speed | Scale | Maintainability | Security | AI support | Cost | Hiring | Deployment | Total | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| React + Vite | | | | | | | | | | |
| Next.js | | | | | | | | | | |
| Vue / Nuxt | | | | | | | | | | |

## Database comparison template

| Option | Speed | Scale | Maintainability | Security | AI support | Cost | Hiring | Deployment | Total | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PostgreSQL | | | | | | | | | | |
| MySQL | | | | | | | | | | |
| MongoDB | | | | | | | | | | |

## Authentication comparison template

| Option | Speed | Scale | Maintainability | Security | AI support | Cost | Hiring | Deployment | Total | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Custom JWT/session | | | | | | | | | | |
| Auth0 | | | | | | | | | | |
| AWS Cognito | | | | | | | | | | |
| Firebase Auth | | | | | | | | | | |

## Infrastructure comparison template

| Option | Speed | Scale | Maintainability | Security | AI support | Cost | Hiring | Deployment | Total | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AWS | | | | | | | | | | |
| GCP | | | | | | | | | | |
| Render / Fly.io | | | | | | | | | | |
| Vercel + managed backend | | | | | | | | | | |

## AI and matching approach template

| Option | When to use | Explainability | Operational complexity | Notes |
| --- | --- | --- | --- | --- |
| Rule-based matching first | Initial release | High | Low | |
| Weighted scoring | Initial release | High | Low to medium | |
| Embedding / vector search later | Enhancement phase | Medium | Medium | |
| LLM-assisted recommendation later | Enhancement phase | Medium | Medium to high | |
