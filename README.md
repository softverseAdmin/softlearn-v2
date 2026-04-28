# AI-DLC Learning & Career Matching Platform

This repository is an **AI-DLC-first** workspace for a learning and job-matching platform aimed at foreign IT engineers, Japanese learners, companies, and platform administrators. The product will be built **unit by unit**, and the final technology stack is **intentionally undecided** until the inception decision documents and ADR-001 are completed.

## What this repository contains

- AI-DLC operating rules, review gates, and change-management standards
- Inception documents for requirements, personas, feature decomposition, architecture, security, infrastructure, and technology selection
- Construction unit templates and initial unit folders
- Scripts for creating units, completing stages, opening change requests, syncing branches, and running repository checks
- GitHub workflow and template scaffolding for disciplined delivery

## Main users

- **Students / learners**
- **Companies**
- **Admins**

## Main domains

- Learning
- Exams
- Exam preparation
- Company vacancies
- Matching
- Interviews
- Privacy and permissions
- Admin management

## Working model

1. Complete inception and baseline documents.
2. Select the technology stack through documented comparison and ADR approval.
3. Implement construction units in small, reviewable branches and pull requests.
4. Track requirement changes through CHG records instead of silent edits.

## Quick start

1. Run:
   ```bash
   chmod +x scripts/*.sh
   ```
2. Run:
   ```bash
   ./scripts/aidlc-check.sh
   ```
3. Start a unit:
   ```bash
   ./scripts/aidlc-new-unit.sh U1-2-authentication-core
   ```
4. Complete a stage:
   ```bash
   ./scripts/aidlc-stage-complete.sh U1-2-authentication-core "Functional Design"
   ```
5. Create a change request:
   ```bash
   ./scripts/aidlc-change.sh "Change summary here"
   ```
6. Create PR:
   ```bash
   ./scripts/creating-pr.sh U1-2-authentication-core
   ```

## Important guardrail

Do **not** implement production application code until **U0-4 technology-selection-and-architecture** is completed and **`aidlc-docs/inception/v1/adr-001-technology-stack.md`** is accepted.
