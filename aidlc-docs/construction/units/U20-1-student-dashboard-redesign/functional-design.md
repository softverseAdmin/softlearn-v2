# Functional design: U20-1-student-dashboard-redesign

## Purpose

Redesign the student dashboard from a generic summary page into an action-first product surface that tells the learner what to do next in the roadmap-based learning -> assessment -> hiring pipeline.

## User story

As a student, I need a dashboard that clearly tells me what to continue learning, whether I need to complete a topic or take an exam, how far I have progressed through my roadmap, and what that means for my hiring readiness.

## Functional requirements

### 1. Scope

- This unit covers the protected student dashboard only.
- The redesign must replace feature-first dashboard cards with a task-oriented flow centered on:
  - continue learning
  - next action
  - progress overview
  - roadmap preview
- The dashboard must help the student answer:
  - what am I learning now
  - what must I do next
  - what is unlocked or locked
  - how close am I to the next validation step

### 2. Primary dashboard actions

- The top of the dashboard must show a welcome header and one clear continuation path.
- A **Continue Learning** section must show:
  - active roadmap or course name
  - current topic or nearest learning unit
  - progress percent
  - one primary CTA to continue learning
- A **Next Action** section must show one deterministic next step using existing platform state:
  - complete topic when learning progress is still incomplete
  - take exam when learning completion requires score validation
  - continue to next topic when learning and validation are satisfied
- Exam-related actions must clearly state the gating rule that at least 90 percent is required to unlock the next topic.

### 3. Secondary dashboard sections

- A **Progress Overview** section must summarize:
  - completed topics
  - exam average
  - current level
- A **Roadmap Preview** section must show a compact node-based progression model with clearly differentiated states:
  - not started
  - in progress
  - completed
  - exam required
  - locked
- The preview must remain compact and must not become a full roadmap management screen in this unit.

### 4. Role, privacy, and behavior boundaries

- Only authenticated students may access this dashboard.
- The page must remain student-owned and must not reveal company-side review data or admin-only controls.
- All dashboard decisions must be deterministic and explainable.
- The redesign must not depend on external AI services or opaque recommendation logic.

### 5. UI structure

- The student dashboard UI should follow this structure:
  - Header
  - Continue Learning
  - Next Action
  - Progress Overview
  - Roadmap Preview
- Notifications, generic profile summaries, and unrelated metric tiles should not dominate the dashboard.
- The dashboard should reduce cognitive load by favoring one main action at a time.

### 6. Component hierarchy

- Expected component hierarchy:
  - `DashboardPage`
    - `StudentDashboardRedesign`
      - `ContinueLearning`
      - `NextAction`
      - `ProgressOverview`
      - `RoadmapPreview`
        - `RoadmapNode`
- Shared layout, auth context, and session restoration remain owned by earlier baseline units.

### 7. State flow

- The student route loads the protected dashboard response from `/api/v1/student/dashboard`.
- Frontend page state should handle:
  - loading
  - error
  - loaded dashboard data
- The page should derive presentation state from backend-provided roadmap/action data rather than recomputing hidden logic in multiple components.

### 8. API mapping

- The unit must map dashboard UI sections to a stable student dashboard API contract.
- The backend response should provide enough structured data for:
  - continue-learning summary
  - next-action summary
  - progress overview
  - roadmap preview nodes
- Existing deterministic learning, exam, skill, and interview signals may be reused, but the dashboard response shape should be optimized for the redesigned UX.

## Inputs

- Inception baseline and CHG-002 redesign decision
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U1-6 routing and navigation
- U1-8 base UI layout
- U6-1 student learning summary
- U6-2 student exam results summary
- U6-5 readiness score calculation
- U14-5 performance-tracking
- Existing dashboard backend and frontend implementation

## Outputs

- Redesigned protected student dashboard behavior
- Student dashboard UI structure and component hierarchy
- Deterministic next-action and roadmap-preview expectations
- Updated student dashboard API contract for the redesigned surface

## User flow

1. The student opens the protected dashboard.
2. The backend loads learning, exam, skill, and privacy-safe interview signals.
3. The backend returns a student dashboard payload centered on current progress and next action.
4. The frontend highlights the current learning step and the single most important next action.
5. The student continues learning, completes a topic, or takes an exam based on the dashboard prompt.

## Acceptance criteria

- The dashboard clearly tells the student what to do next.
- The page is minimal and action-first rather than metric-first.
- The experience is student-specific and role-safe.
- The design works well on desktop and remains readable on tablet and mobile.
- UI structure, component hierarchy, state flow, API mapping, and acceptance criteria are all documented.

## Out of scope

- Company dashboard redesign
- Admin dashboard redesign
- Auth page redesign
- Full roadmap learning workspace
- Premium purchase flow
- Mobile bottom navigation
