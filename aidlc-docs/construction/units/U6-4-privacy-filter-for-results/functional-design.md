# Functional design: U6-4-privacy-filter-for-results

## Purpose

Define the baseline privacy-filter flow for student results so company-facing result access is limited to the subset of learning and exam evidence that is allowed by student privacy settings, consent records, and policy context.

## User story

As a platform team and as a student, I need explicit result filtering so company users see only the student result data they are allowed to see and hidden evidence stays protected.

## Functional requirements

### 1. Result-filter scope

- This unit covers privacy-aware filtering of student result data for company-facing access only.
- The baseline should support:
  - evaluating whether a company-side request may see a category of student result data
  - filtering structured learning-summary and exam-results-summary evidence before it is returned to company users
  - returning a stable visible, hidden, partially visible, or no-data outcome where appropriate
  - preserving explainable filtering outcomes for support and audit use
- Student-facing summaries, company-view UI details, and readiness scoring remain separate later units.

### 2. Privacy and consent inputs

- Result filtering must operate on student privacy settings, applicable consent state, role and organization context, and approved policy rules together.
- The baseline must support exam-result visibility controls defined by the student privacy-settings unit.
- The baseline should also support policy-governed filtering of learning-result evidence so later company views do not assume that all learning evidence is broadly visible.
- If later policy introduces defaults, overrides, or workflow-based exceptions, those behaviors must still remain explainable and auditable.

### 3. Filter behavior and stable outcomes

- Result filtering should consume structured learning-summary and exam-results-summary evidence and apply category-appropriate visibility decisions before company presentation.
- The baseline should support hiding entire result categories, returning only approved summary subsets, or withholding sensitive details while still providing a stable response shape.
- Invalid company context, missing consent posture, ambiguous policy inputs, or inconsistent result categories must return stable outcomes rather than exposing conflicting or unauthorized records.
- Filtering should preserve the distinction between:
  - student-owned source result data
  - company-visible filtered result data
  - the consent and policy basis for the filtering outcome

### 4. Authorization and audit posture

- Privacy filtering must work with the RBAC and company-boundary baselines rather than replacing them.
- Authentication and authorization still evaluate identity, role, organization boundary, and workflow context before privacy filtering is applied.
- Result-filter decisions affecting company access to protected student evidence should remain auditable and explainable during support, review, or incident investigation.
- The baseline should avoid silent overexposure by defaulting to restricted outcomes when visibility requirements are not satisfied clearly.

### 5. API and integration alignment

- The final API or service boundaries for result filtering may be detailed later, but they must remain consistent with the existing versioned REST baseline and standard error envelopes.
- Company-view student-results flows should consume filtered result data rather than bypassing the privacy filter and applying ad hoc client-side visibility rules.
- Matching, candidate-review, and later result-sharing units must reuse the same filter logic or filtered outputs rather than inventing competing visibility decisions.

### 6. Relationship to later units

- U6-3 company view student results should depend on this filtering baseline for the exact subset of result evidence returned to company users.
- U6-5 readiness score calculation may consume protected learning and exam evidence internally, but any company-facing use of readiness-related outputs must not bypass the result privacy posture defined here.
- Later company candidate-review, matching, and result-sharing units must preserve the same consent-aware visibility logic.
- Student-facing summary units remain the source baselines for unfiltered student-owned evidence and must not be reinterpreted here as public data.

## Inputs

- Inception requirements baseline
- Inception security and compliance baseline
- Inception high-level data model
- Inception architecture baseline
- U1-3 role-based access control
- U1-4 base API structure
- U2-10 student profile privacy settings
- U6-1 student learning summary
- U6-2 student exam results summary
- U6-3 company view student results

## Outputs

- Baseline privacy-filter flow for result sharing
- Consent-aware filtering, authorization, and audit expectations
- Integration expectations for later company-view and readiness-sensitive units

## User flow

1. A company-side workflow requests student result evidence in an approved context.
2. Backend checks identity, organization boundary, student privacy settings, applicable consent state, and policy inputs.
3. The platform filters the learning and exam result data according to those visibility rules.
4. The company-facing flow receives only the permitted filtered result subset or a stable hidden-data outcome.
5. Later company-review and readiness-sensitive units build on the same filtered visibility posture.

## Acceptance criteria

- Result privacy-filter behavior is documented clearly.
- Consent-aware filtering, authorization, and audit boundaries are defined.
- Structured visible, hidden, and partial-visibility expectations are documented.
- The unit is kept separate from company-view UI detail and readiness scoring logic.
- No application code is produced in this unit.

## Out of scope

- Concrete frontend or backend implementation code
- Student-facing summary generation
- Company-view UI implementation detail
- Readiness-score calculation
- Final per-field visibility matrix
- Detailed admin override implementation
