# Copilot instructions for this repository

You are assisting development in an **AI-DLC-first** repository.

## Core rules

- Do not implement application code before the technology stack is selected.
- Do not assume Rails, PostgreSQL, Vite, Next.js, Django, FastAPI, NestJS, or any other stack until ADR-001 is completed.
- Always work in one AI-DLC unit at a time.
- Every unit must include:
  - `unit-state.md`
  - `functional-design.md`
  - `nfr-requirements.md`
  - `nfr-design.md`
  - `infrastructure-design.md`
  - `code-generation.md`

## Unit stages

1. Functional Design
2. NFR Requirements
3. NFR Design
4. Infrastructure Design
5. Code Generation

## Delivery rules

- Do not generate code until design stages are complete.
- Update `unit-state.md` when completing a stage.
- If requirements change after the inception baseline, create a CHG file under `changes/`.
- Never silently change accepted requirements.
- Prefer small, reviewable changes.
- One unit should map to one PR where practical.
- Always run `./scripts/aidlc-check.sh` before opening a PR.

## Application-specific rules

- Student privacy is critical.
- Company access to student data must be permission-controlled.
- Exam results must not be visible to companies unless rules explicitly allow it.
- Matching logic must be explainable and auditable.
- Interview meeting URLs must be validated.
- Authentication and authorization must be designed before user features.
- Admin capabilities must be protected.

## Technology-selection rules

- Compare at least 3 backend options.
- Compare at least 3 frontend options.
- Compare at least 2 database options.
- Compare at least 2 authentication options.
- Compare at least 2 hosting and deployment options.
- Evaluate:
  - speed of development
  - scalability
  - maintainability
  - security
  - AI feature support
  - cost
  - hiring and team skill availability
  - deployment complexity
- Record the final decision in `aidlc-docs/inception/v1/adr-001-technology-stack.md`.
