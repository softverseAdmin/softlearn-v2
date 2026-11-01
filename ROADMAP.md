# Proposed development roadmap

Purpose: improve the existing application through reviewable engineering work. This is planned work, not completed hours or a promise of program eligibility. Estimates total **32–45 hours**; record actual work and evidence separately. Preparation documents are not counted as development delivered.

| Work | Hours | Acceptance evidence |
| --- | --- | --- |
| Browser integration coverage for student enrollment, assessment submission, and application flow | 8–10 | Repeatable tests against an isolated backend and synthetic fixtures; verify saved state after reload and meaningful error paths. |
| Authorization and privacy regression coverage | 6–9 | Cross-account and cross-role negative tests for resumes, messages, exam results, candidate visibility, and exports; fix verified gaps. |
| Matching explanations and regression cases | 5–7 | Inspect current scoring, expose or improve understandable reasons where missing, and test missing skills, ties, and visibility filtering. |
| Assessment generation resilience | 5–7 | Mock provider timeout, malformed output, and disabled configuration; improve actionable UI errors and ensure failures do not save invalid assessments. |
| Accessibility and usability of core forms | 5–7 | Keyboard and screen-reader review of signup, profile, and application flows; fix verified labels, focus, and error-announcement issues. |
| Reproducible local demonstration | 3–5 | Safe synthetic seed workflow, documented reset boundaries, and a repeatable browser walkthrough without third-party credentials. |
| **Total** | **32–45** | Linked changes and recorded validation. |

Start each item by inspecting existing behavior and tests to avoid duplicating completed work. Follow repository unit/design rules, record requirement changes through CHG, and split work into reviewable commits. No deployment, public release, or history rewrite is authorized by this plan.

Open decisions: confirm the specific BYOP program and current requirements, permitted AI assistance, actual user-data status, ownership and licensing, and which improvement to prioritize. Schedule only after those constraints are known.
