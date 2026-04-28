# Review gates

## Required gates

- **aidlc-check**: validate required repository structure and unit files.
- **codex-review**: run repository review guidance when available.
- **human review**: confirm scope, clarity, and business alignment.
- **test execution**: run relevant tests for the chosen stack once it exists.
- **security review**: assess access control, validation, and data handling.
- **privacy review for student data**: confirm visibility, consent, and audit expectations.

## Gate expectations

- A PR should not merge if the repository structure is invalid.
- Design artifacts should be readable and traceable before code generation starts.
- Matching-related changes should be checked for explainability and auditability.
