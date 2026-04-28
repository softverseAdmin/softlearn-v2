# Functional design: U1-4-base-api-structure

## Purpose

Define a practical REST API contract for the platform so backend and frontend implementation can proceed consistently across authentication, learner workflows, company workflows, matching, applications, interviews, and notifications.

## User story

As a delivery team, we need a stable API design so the backend and frontend can implement the product in a consistent, versioned, and secure way without inventing endpoint behavior unit by unit.

## Functional requirements

### 1. API design principles

- Use a RESTful structure under **`/api/v1/`**
- Use JSON for request and response bodies
- Use standard HTTP methods:
  - `GET` for fetch
  - `POST` for create or action
  - `PUT` for full update
- Use server-managed session authentication for protected browser API access
- Use a standard error response format
- Keep request and response shapes consistent across domains

### 2. Authentication model

- Protected endpoints require an authenticated browser session.
- State-changing protected endpoints require CSRF protection.
- Public endpoints:
  - signup
  - login
- Logout invalidates the current session/token according to the implementation approach chosen later

### 3. Error handling format

All errors should follow this shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Profile name is required.",
    "details": {
      "name": ["This field is required."]
    },
    "request_id": "req_123456"
  }
}
```

### 4. Auth APIs

#### POST /api/v1/auth/signup

**Purpose**

Create a new student or company user account and establish an authenticated browser session when allowed by the final implementation flow.

**Sample request**

```json
{
  "role": "student",
  "email": "student@example.com",
  "password": "SecurePass123!",
  "name": "Rabin"
}
```

**Sample response**

```json
{
  "data": {
    "user_id": 101,
    "role": "student",
    "email": "student@example.com",
    "authenticated": true
  }
}
```

#### POST /api/v1/auth/login

**Purpose**

Authenticate a user and establish an authenticated browser session.

**Sample request**

```json
{
  "email": "student@example.com",
  "password": "SecurePass123!"
}
```

**Sample response**

```json
{
  "data": {
    "user_id": 101,
    "role": "student",
    "authenticated": true
  }
}
```

#### POST /api/v1/auth/logout

**Purpose**

Log out the current user.

**Sample response**

```json
{
  "data": {
    "message": "Logged out successfully."
  }
}
```

### 5. Student profile APIs

#### GET /api/v1/student/profile

**Purpose**

Return the authenticated student’s profile.

**Authorization**

- student only

**Sample response**

```json
{
  "data": {
    "student_id": 10,
    "name": "Rabin Adhikari",
    "desired_job_type": "backend",
    "desired_work_location": "Tokyo",
    "japanese_level": "N3",
    "english_level": "B2",
    "resume_complete": true
  }
}
```

#### PUT /api/v1/student/profile

**Purpose**

Update the authenticated student’s profile.

**Sample request**

```json
{
  "name": "Rabin Adhikari",
  "desired_job_type": "backend",
  "desired_work_location": "Tokyo",
  "japanese_level": "N3",
  "english_level": "B2",
  "resume_complete": true
}
```

**Sample response**

```json
{
  "data": {
    "student_id": 10,
    "updated": true
  }
}
```

### 6. Company profile APIs

#### GET /api/v1/company/profile

**Purpose**

Return the authenticated company profile.

**Authorization**

- company only

**Sample response**

```json
{
  "data": {
    "company_id": 20,
    "name": "Softverse",
    "description": "Hiring software engineers in Japan.",
    "profile_complete": true
  }
}
```

#### PUT /api/v1/company/profile

**Purpose**

Update the authenticated company profile.

**Sample request**

```json
{
  "name": "Softverse",
  "description": "Hiring software engineers in Japan.",
  "profile_complete": true
}
```

**Sample response**

```json
{
  "data": {
    "company_id": 20,
    "updated": true
  }
}
```

### 7. Learning APIs

#### GET /api/v1/courses

**Purpose**

Return the course catalog.

**Sample response**

```json
{
  "data": [
    {
      "id": 1,
      "title": "Backend Fundamentals",
      "level": "beginner"
    }
  ],
  "meta": {
    "page": 1,
    "total": 1
  }
}
```

#### GET /api/v1/courses/:id

**Purpose**

Return a single course detail.

**Sample response**

```json
{
  "data": {
    "id": 1,
    "title": "Backend Fundamentals",
    "description": "Introductory backend course",
    "lessons_count": 12
  }
}
```

#### POST /api/v1/enrollments

**Purpose**

Enroll the authenticated student in a course.

**Authorization**

- student only

**Sample request**

```json
{
  "course_id": 1
}
```

**Sample response**

```json
{
  "data": {
    "enrollment_id": 501,
    "course_id": 1,
    "status": "enrolled"
  }
}
```

#### GET /api/v1/enrollments

**Purpose**

Return the authenticated student’s course enrollments.

**Authorization**

- student only

**Sample response**

```json
{
  "data": [
    {
      "enrollment_id": 501,
      "course_id": 1,
      "progress_percent": 40
    }
  ]
}
```

### 8. Exam APIs

#### GET /api/v1/exams

**Purpose**

Return available exams.

**Sample response**

```json
{
  "data": [
    {
      "id": 11,
      "title": "Backend Readiness Test"
    }
  ]
}
```

#### POST /api/v1/exams/:id/attempt

**Purpose**

Start or submit an exam attempt depending on the later implementation mode.

**Authorization**

- student only

**Sample request**

```json
{
  "answers": [
    {
      "question_id": 1001,
      "answer_option_id": 2002
    }
  ]
}
```

**Sample response**

```json
{
  "data": {
    "exam_attempt_id": 9001,
    "exam_id": 11,
    "score": 78,
    "status": "submitted"
  }
}
```

#### GET /api/v1/exam-attempts

**Purpose**

Return the authenticated student’s exam history.

**Authorization**

- student only

**Sample response**

```json
{
  "data": [
    {
      "exam_attempt_id": 9001,
      "exam_id": 11,
      "score": 78,
      "passed": true
    }
  ]
}
```

### 9. Job APIs

#### GET /api/v1/jobs

**Purpose**

Return visible jobs for job search.

**Sample response**

```json
{
  "data": [
    {
      "id": 301,
      "title": "Junior Backend Engineer",
      "location": "Tokyo",
      "employment_type": "full-time"
    }
  ]
}
```

#### GET /api/v1/jobs/:id

**Purpose**

Return a single job detail.

**Sample response**

```json
{
  "data": {
    "id": 301,
    "title": "Junior Backend Engineer",
    "required_skills": ["Python", "SQL"],
    "preferred_skills": ["Django"],
    "location": "Tokyo",
    "employment_type": "full-time"
  }
}
```

#### POST /api/v1/jobs

**Purpose**

Create a job posting.

**Authorization**

- company only

**Sample request**

```json
{
  "title": "Junior Backend Engineer",
  "required_skills": ["Python", "SQL"],
  "preferred_skills": ["Django"],
  "location": "Tokyo",
  "employment_type": "full-time",
  "experience_level": "junior"
}
```

**Sample response**

```json
{
  "data": {
    "job_id": 301,
    "created": true
  }
}
```

### 10. Matching APIs (rule-based)

#### GET /api/v1/jobs/matches

**Purpose**

Return rule-based job matches for the authenticated student.

**Authorization**

- student only

**Sample response**

```json
{
  "data": [
    {
      "job_id": 301,
      "score": 84,
      "match_level": "Strong Match",
      "explanations": [
        "You match 4 of 5 required skills",
        "Your Japanese level meets the job requirement"
      ]
    }
  ]
}
```

#### GET /api/v1/jobs/matches/:jobId

**Purpose**

Return a detailed rule-based match explanation for one job.

**Authorization**

- student only

**Sample response**

```json
{
  "data": {
    "job_id": 301,
    "score": 84,
    "match_level": "Strong Match",
    "matched_skills": ["Python", "SQL", "Git", "REST"],
    "missing_skills": ["Docker"],
    "explanations": [
      "You match 4 of 5 required skills",
      "Your preferred location matches this job",
      "Complete your profile to improve your score"
    ],
    "calculated_at": "2026-04-28T22:00:00Z"
  }
}
```

### 11. Application APIs

#### POST /api/v1/applications

**Purpose**

Create a job application.

**Authorization**

- student only

**Sample request**

```json
{
  "job_id": 301
}
```

**Sample response**

```json
{
  "data": {
    "application_id": 7001,
    "job_id": 301,
    "status": "submitted"
  }
}
```

#### GET /api/v1/applications

**Purpose**

Return applications for the authenticated user context.

**Authorization**

- student: own applications
- company: applications to company jobs

**Sample response**

```json
{
  "data": [
    {
      "application_id": 7001,
      "job_id": 301,
      "status": "submitted"
    }
  ]
}
```

### 12. Interview APIs

#### POST /api/v1/interviews

**Purpose**

Create an interview request or schedule entry.

**Authorization**

- company only for initial scheduling
- later rescheduling rules can expand based on product decisions

**Sample request**

```json
{
  "application_id": 7001,
  "scheduled_at": "2026-05-10T09:00:00Z",
  "meeting_url": "https://meet.google.com/example"
}
```

**Sample response**

```json
{
  "data": {
    "interview_id": 8001,
    "status": "scheduled"
  }
}
```

#### GET /api/v1/interviews

**Purpose**

Return interviews visible to the authenticated user.

**Sample response**

```json
{
  "data": [
    {
      "interview_id": 8001,
      "application_id": 7001,
      "status": "scheduled",
      "scheduled_at": "2026-05-10T09:00:00Z"
    }
  ]
}
```

### 13. Notification APIs

#### GET /api/v1/notifications

**Purpose**

Return notifications for the authenticated user.

**Sample response**

```json
{
  "data": [
    {
      "id": 9901,
      "type": "application_status",
      "title": "Application updated",
      "read": false
    }
  ]
}
```

#### PUT /api/v1/notifications/:id/read

**Purpose**

Mark a notification as read.

**Sample response**

```json
{
  "data": {
    "id": 9901,
    "read": true
  }
}
```

### 14. Authorization rules

#### Student access

- Can access own auth, own profile, own enrollments, own exam attempts, own matches, own applications, own interviews, and own notifications
- Cannot create jobs
- Cannot update company profiles
- Cannot view other students’ private data

#### Company access

- Can access own auth, own company profile, own jobs, company-side applications, company-side interviews, and own notifications
- Can create jobs
- Cannot update student profiles
- Cannot access student data outside privacy and application rules

#### Admin access

- Admin endpoints are intentionally not defined in this base API unit
- Admin APIs should be designed later under admin management units

### 15. Standard success envelope

Prefer a consistent success response shape:

```json
{
  "data": {},
  "meta": {},
  "message": "Optional message"
}
```

## Inputs

- U0-3 core feature breakdown
- U0-4 architecture direction
- U0-5 high-level data model
- U0-6 rule-based matching strategy

## Outputs

- Base REST API contract
- JSON request/response examples
- Authorization and error-handling rules
- A backend-ready starting point for later implementation units

## User flow

1. Define versioned REST API conventions.
2. Define endpoint groups by domain.
3. Add request and response examples.
4. Define access rules and consistent error handling.

## Acceptance criteria

- Required endpoint groups are documented.
- Versioning, session auth, JSON format, and error handling are documented.
- Student and company authorization rules are explicit.
- Matching APIs are explicitly rule-based.
- The contract is practical and consistent for later backend implementation.

## Out of scope

- Controller code
- Database queries
- Admin API detail
- Session timeout and remember-me implementation detail
- Final pagination and filtering conventions beyond this baseline
