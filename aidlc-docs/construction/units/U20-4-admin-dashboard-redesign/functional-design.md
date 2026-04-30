# Functional design: U20-4-admin-dashboard-redesign

## Purpose

Redesign the admin dashboard from a broad summary page into a compact operations view that helps platform admins understand system state quickly and act from a clean control surface.

## User story

As an admin, I need a dashboard that shows the platform's current operating picture, recent activity, and status signals without forcing me through dense charts or scattered widgets.

## Functional requirements

### 1. Scope

- This unit covers the protected admin dashboard only.
- The redesign must replace the old metric-heavy summary with:
  - system stats
  - recent activity log
  - system status
- The dashboard must help the admin answer:
  - how many users and companies are active on the platform
  - whether hiring activity is progressing
  - whether there are unread platform updates
  - which recent events deserve attention

### 2. Primary dashboard actions

- The top of the page must show a compact admin header and operations-focused message.
- A **System Stats** section must show:
  - total users
  - active students
  - companies
  - revenue state
- Revenue must remain explicit about being unavailable until a real billing source exists.

### 3. Secondary dashboard sections

- A **Recent Activity Log** section must show a concise list of recent platform events such as:
  - user joins
  - interview updates
  - admin notifications
- A **System Status** section must show a compact operational snapshot with items such as:
  - unread platform updates
  - live vacancies
  - active interviews
  - completed interviews
- The redesign must stay compact and avoid large charts.

### 4. Role and behavior boundaries

- Only authenticated admins may access this dashboard.
- The page must remain admin-owned and must not expose actions reserved to company or student workflows.
- The redesign must not use external analytics or AI services.
- All displayed status signals must derive from existing deterministic platform data.

### 5. UI structure

- The admin dashboard UI should follow this structure:
  - Header
  - System Stats
  - Recent Activity Log
  - System Status
- The page should feel compact, operational, and easy to scan.

### 6. Component hierarchy

- Expected component hierarchy:
  - `DashboardPage`
    - `AdminDashboardRedesign`

### 7. State flow

- The admin route loads the protected dashboard response from `/api/v1/admin/dashboard`.
- Frontend page state should handle:
  - loading
  - error
  - loaded dashboard data
- The backend should provide already-structured activity items and status summaries so the frontend remains presentation-focused.

### 8. API mapping

- The unit must map dashboard UI sections to a stable admin dashboard API contract.
- The backend response should provide enough structured data for:
  - system-stats cards
  - recent-activity log rows
  - compact status rows
- Missing revenue data must be represented honestly rather than inferred.

## Inputs

- Inception baseline and CHG-002 redesign decision
- U1-2 authentication core
- U1-3 role-based access control
- U1-4 base API structure
- U1-6 routing and navigation
- U1-8 base UI layout
- U17-3 admin dashboard baseline
- Existing admin dashboard backend and frontend implementation

## Outputs

- Redesigned protected admin dashboard behavior
- Admin dashboard UI structure and compact operations layout
- Updated admin dashboard API contract for stats, activity log, and status sections

## User flow

1. The admin opens the protected dashboard.
2. The backend loads aggregate user, company, vacancy, interview, and notification signals.
3. The backend returns a compact operations payload with stats, activity items, and status indicators.
4. The frontend highlights the current platform picture in a concise layout.
5. The admin moves to deeper management pages as needed.

## Acceptance criteria

- The dashboard feels compact and operations-focused.
- The page is role-safe and minimal.
- Revenue is shown honestly as unavailable until billing exists.
- The design works well on desktop and remains readable on tablet and mobile.
- UI structure, state flow, API mapping, and acceptance criteria are all documented.

## Out of scope

- Billing implementation
- Detailed analytics charts
- Admin CRUD redesigns
- Auth or company/student dashboard redesigns
