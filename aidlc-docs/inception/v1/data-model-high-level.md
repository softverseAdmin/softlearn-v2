# Inception v1 high-level data model

## Conceptual entities

- User
- StudentProfile
- CompanyProfile
- CompanyMember
- Course
- Lesson
- Enrollment
- Progress
- Exam
- Question
- AnswerOption
- ExamAttempt
- Vacancy
- Skill
- LanguageLevel
- Application
- MatchResult
- Interview
- MeetingLink
- Notification
- ConsentLog
- AuditLog

## Relationship highlights

- A `User` may represent a student, company member, or admin depending on role mapping.
- `StudentProfile` holds learner-facing details, privacy preferences, and evidence of readiness.
- `CompanyProfile` and `CompanyMember` separate organization data from individual company users.
- `Course`, `Lesson`, `Enrollment`, and `Progress` model learning participation.
- `Exam`, `Question`, `AnswerOption`, and `ExamAttempt` model assessment.
- `Vacancy`, `Application`, `MatchResult`, and `Interview` support hiring workflows.
- `ConsentLog` and `AuditLog` preserve explainability and accountability for data visibility.
