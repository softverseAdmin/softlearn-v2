# Functional design: U0-3-core-features-breakdown

## Purpose

Define the platform's full feature breakdown as a clear, domain-based AI-DLC unit map so later work can proceed in small, reviewable increments without choosing a final technology stack.

## User story

As the product and delivery team, we need a full feature breakdown that organizes platform scope into clear domains and phased units so requirements, design, and implementation can be planned safely and traced over time.

## Functional requirements

### 1. Breakdown structure

- Group the product into phases that move from inception through production readiness.
- Name units clearly by business outcome rather than implementation mechanism.
- Keep units small enough for later review, ownership, and pull-request scoping.

### 2. Required feature domains

The breakdown must cover the following domains explicitly:

- authentication and roles
- student profile
- company profile
- courses
- lessons
- learning progress
- exams
- exam preparation
- vacancies
- job search
- matching
- applications
- company student review
- interview scheduling
- meeting URLs
- notifications
- privacy and permissions
- admin management
- dashboards
- production readiness

### 3. Domain-to-phase mapping

#### Foundation and platform setup

- **Phase 0** establishes inception baseline work:
  - requirements
  - personas
  - core feature breakdown
  - technology selection and architecture
  - data model
  - AI matching strategy
  - security and compliance
  - deployment and infrastructure strategy
- **Phase 1** establishes project foundations:
  - authentication and roles
  - base API structure
  - frontend initialization
  - routing, state, and base layout

#### Student identity and profile

- **Phase 2** covers the student profile domain:
  - registration and login
  - profile basics
  - skills
  - education
  - experience
  - language level
  - resume management
  - availability
  - privacy settings

#### Company identity and company profile

- **Phase 3** covers the company profile domain:
  - company registration and login
  - company basics and description
  - hiring preferences
  - company user management

#### Learning domain

- **Phase 4** covers courses, lessons, and learning progress:
  - course creation, listing, and detail
  - lesson creation and lesson viewing
  - course enrollment
  - lesson progress tracking
  - course completion tracking

#### Exams and exam preparation

- **Phase 5** covers the exam domain:
  - exam creation
  - question and answer-option management
  - exam taking
  - answer submission
  - scoring and pass/fail logic
  - exam history and retake policy
- **Phase 14** covers exam preparation:
  - exam categories
  - practice question bank
  - mock exams
  - study plan
  - performance tracking

#### Learning evidence and privacy-aware visibility

- **Phase 6** covers student learning and exam summaries plus company visibility controls:
  - student learning summary
  - student exam results summary
  - company view of allowed student results
  - privacy filters for results
  - readiness score calculation

#### Vacancy and job search domains

- **Phase 7** covers vacancies:
  - vacancy creation, edit, delete, list, and detail
  - skill tags
  - language requirements
  - location settings
- **Phase 8** covers job search:
  - job list page
  - search bar
  - skill, language, location, and salary filters
  - bookmarks

#### Matching domain

- **Phase 9** covers student-company matching:
  - skill matching
  - course completion matching
  - exam score matching
  - language-level matching
  - location/work-style matching
  - match score calculation
  - matched student and matched job views

#### Application and company review domains

- **Phase 10** covers applications:
  - apply
  - status tracking
  - withdrawal
  - company application review
  - shortlist and reject actions
- **Phase 11** covers company student review:
  - student profile preview for companies
  - learning record view
  - exam-result view
  - shortlist support
  - candidate notes

#### Interview scheduling and meeting URLs

- **Phase 12** covers interview scheduling:
  - interview request
  - availability selection
  - schedule confirmation
  - reschedule
  - cancellation
  - status tracking
- **Phase 13** covers meeting URLs:
  - meeting-link input
  - Zoom support
  - Google Meet support
  - Microsoft Teams support
  - custom URL support
  - meeting-link validation

#### Notifications, privacy, dashboards, admin, and production readiness

- **Phase 15** covers notifications:
  - notification core
  - application notifications
  - interview notifications
  - exam-result notifications
  - email notification service
- **Phase 16** covers privacy and permissions:
  - role permissions
  - student visibility settings
  - company access control
  - data consent system
- **Phase 17** covers dashboards:
  - student dashboard
  - company dashboard
  - admin dashboard
  - analytics summary
- **Phase 18** covers admin management:
  - manage users
  - manage companies
  - manage courses
  - manage exams
  - manage vacancies
- **Phase 19** covers production readiness:
  - logging
  - error handling
  - performance optimization
  - security hardening
  - CI/CD finalization

## Inputs

- Requirements baseline
- Persona definitions
- Existing inception feature map

## Outputs

- Domain-based feature breakdown for the full platform
- Phase-based unit roadmap for later design and implementation
- Clear traceability between user-facing domains and later construction units

## User flow

1. Group platform capabilities into stable product domains.
2. Break each domain into reviewable units.
3. Sequence those units into phases from foundation to production readiness.
4. Check the roadmap for gaps in privacy, matching, admin, and operational quality.

## Acceptance criteria

- The feature breakdown covers all requested domains.
- The phase list is complete through Phase 19.
- Units are named clearly enough for later PR scoping and review.
- Privacy, permissions, admin, and production-readiness work are represented explicitly instead of being implied.
- No final technology stack is selected.
- No application code is introduced.

## Out of scope

- Exact implementation estimates
- Staffing plans
- Stack-specific module design
- Detailed architecture decisions
- Production application code
