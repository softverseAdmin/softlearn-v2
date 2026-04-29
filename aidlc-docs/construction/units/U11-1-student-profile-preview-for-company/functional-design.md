        # Functional design: U11-1-student-profile-preview-for-company

        ## Purpose

        Define the baseline company-side student-profile preview so authorized company users can inspect a permission-controlled student summary in approved candidate-review contexts.

        ## User story

        As an authorized company user, I need a permission-controlled preview of a student's profile so I can review candidate fit without seeing hidden or unrelated student data.

        ## Functional requirements

        ### 1. Student-profile-preview-for-company scope

        - This unit covers student profile preview for company only.
        - The baseline should support:
          - opening a protected student preview from an approved match, application, or shortlist context
  - showing a company-safe subset of identity, skills, education, availability, and summary profile information
  - returning stable outcomes when the student is hidden, unavailable, or only partially visible
  - preserving a consistent preview shape for later shortlist, notes, and interview workflows
        - full learning-record review, full exam-result review, shortlist management, candidate-note workflows, and interview actions remain separate later units.

        ### 2. Authorization and visibility behavior

        - Only authenticated company users with an approved company relationship may open the preview.
- Company users must not browse arbitrary student profiles outside approved match, application, or shortlist contexts.
- Student privacy settings, consent posture, and company-boundary rules must be applied before preview data is returned.
- Preview access should remain auditable for later support and compliance review.

        ### 3. Preview behavior

        - The preview should provide a concise, company-safe subset of the student profile rather than the full student-owned record.
- Sensitive fields such as private contact details, hidden resume content, protected learning evidence, or disallowed exam outcomes must remain withheld unless later policy explicitly allows them.
- The preview should surface stable summary states when data is partially visible, unavailable, or hidden by policy.
- The preview must not mutate student data or imply company ownership of the student profile.

        ### 4. Frontend and API alignment

        - The capability belongs in protected company-side routes aligned with the shared session, routing, and app-shell baselines.
- API interactions should remain consistent with `/api/v1/`, session-based auth, and CSRF protection for state-changing browser requests where applicable.
- Most candidate-review state should stay local to the feature while shared session and shell context continues to use the global baselines.
- Deterministic, explainable, and auditable review outcomes should be preserved.

        ### 5. Relationship to later units

        - U9-7 matched student list for company and U10-4 company view applications should surface the contexts from which preview is opened.
- U11-2 and U11-3 remain separate deeper result-review units and must not be collapsed into this preview.
- U11-4 candidate shortlist may build on the same preview context without redefining visibility rules.
- Later privacy and consent units must refine the same visibility posture rather than bypassing it.

        ## Inputs

        - Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-3 role-based access control
- U1-4 base API structure
- U2-3 student profile basic
- U2-4 student profile skills
- U2-5 student profile education
- U2-9 student availability management
- U2-10 student profile privacy settings
- U9-7 matched-student-list-for-company
- U10-4 company-view-applications

        ## Outputs

        - Baseline protected company-side student profile preview
- Visibility and consent expectations for company candidate review
- Integration expectations for later shortlist, notes, and interview units

        ## User flow

        1. An authorized company user opens a student preview from an approved candidate-review context.
2. Backend verifies session, company ownership, context legitimacy, and applicable visibility rules.
3. The platform builds the company-safe subset of the student profile.
4. The company user receives the allowed preview or a stable restricted or no-data outcome.
5. Later review workflows reuse the same protected preview posture.

        ## Acceptance criteria

        - Student profile preview for company behavior is documented clearly.
        - Authorization, privacy, and role boundaries are defined where applicable.
        - Structured data, lifecycle, and integration expectations are documented.
        - The unit stays separate from Concrete frontend or backend implementation code, Full learning-record presentation, and Full exam-result presentation.
        - No application code is produced in this unit.

        ## Out of scope

        - Concrete frontend or backend implementation code
- Full learning-record presentation
- Full exam-result presentation
- Candidate shortlist actions
- Candidate notes
- Interview scheduling
