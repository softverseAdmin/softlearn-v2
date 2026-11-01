# Proposed development roadmap

The next work should make existing learning and hiring flows easier to verify and maintain. The proposed work is estimated at **32–45 hours**. Record actual time, commits, and validation results with each change.

## Existing baseline

The application already has Django tests, privacy-aware matching explanations, Gemini failure/fallback tests, and a synthetic demo seed command. Those are foundations for further work, not features to describe as missing. The frontend package currently provides development, build, lint, and preview commands, with no browser-test command configured. `backend/api/views.py` contains over 10,000 lines despite the existing role-specific view modules.

## Planned work

| Work package | Estimate | Scope and acceptance evidence |
| --- | --- | --- |
| Browser integration tests | 8–11 hours | Configure a browser test runner against an isolated Django test environment. Cover login/session restoration, course enrollment and assessment submission, and a job application. Use synthetic fixtures and authored or mocked assessments, verify saved state after reload, and cover failed validation and unauthorized access. Provide one documented command that can run without external API credentials. |
| Regression-protected backend modularization | 10–14 hours | Map dependencies in `backend/api/views.py`, then extract two cohesive groups of helpers, such as matching calculations and response serializers, into focused modules. Add characterization cases for affected API responses and permission boundaries before moving code. Preserve routes, response shapes, scoring, and access behavior; keep existing and new regression tests passing. Review each extraction separately rather than attempting to split the entire file at once. |
| Measured matching performance | 7–10 hours | Measure queries and elapsed time for student matching and company synchronization using fixed synthetic datasets of increasing size. Investigate the current student/vacancy loops in `backend/api/matching_views.py`; optimize demonstrated query or repeated-calculation costs. Record reproducible before/after measurements and add regression bounds for the chosen workloads. Verify scores, tie-breaking, explanations, and visibility filtering remain unchanged. |
| Accessible core forms | 7–10 hours | Review signup, profile editing, and job application flows using keyboard navigation and a screen reader. Fix observed label associations, dialog/focus behavior, and validation/error announcements. Add focused automated assertions where useful and record the manual scenarios checked. Scope the result to these flows without claiming application-wide accessibility certification. |
| **Total** | **32–45 hours** | Reviewable implementation commits, reproducible checks, and recorded results for each package. |

Start with browser coverage, then use the protected flows and backend regressions to support modularization. Measure matching before selecting an optimization. Confirm the scope after inspecting existing coverage so work already completed is not counted again. Keep all fixtures and demonstrations fictional.

## Development practice

Use isolated fictional fixtures for the planned work and record actual effort and validation with each change.
