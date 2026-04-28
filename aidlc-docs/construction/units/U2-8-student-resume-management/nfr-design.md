# NFR design: U2-8-student-resume-management

## How NFRs are addressed

- Security is addressed by authenticated self-service ownership, protected-write validation, and explicit file-safety controls if uploads are enabled.
- Privacy is addressed by treating resume metadata and files as protected student data and limiting this unit to the student’s own management flow.
- Performance is addressed by keeping resume-management scope narrow and by requiring understandable progress or completion behavior if uploads are introduced.
- Reliability is addressed through stable handling of malformed metadata, file-constraint failures, and predictable resume presence indicators.
- Accessibility is addressed by requiring understandable resume status, validation feedback, and accessible upload or replacement interactions where applicable.
- Maintainability is addressed by keeping resume handling separate from privacy-policy detail, company review, and final storage implementation choices.

## Tradeoffs

- Allowing resume metadata support even before full file uploads keeps the unit useful early, but it requires later implementations to define clearly what counts as a present resume.
- Deferring final storage-provider and serving mechanics keeps this unit technology-safe, though later infrastructure units must complete those operational details explicitly.
- Treating resume completeness as a profile-quality signal is useful for matching, but it requires careful separation from company visibility and consent rules.

## Monitoring

- Later implementation should monitor failed resume updates, repeated file-validation errors, and mismatches between stored resume state and profile-completeness indicators.
- Later privacy reviews should confirm company/admin access to resume metadata or files is policy-gated and auditable where required.
- Later storage implementation should confirm restricted access and safe file-serving behavior remain aligned with this baseline.

## Testing approach

- Review the unit against the data-model, security, matching, architecture, RBAC, frontend foundation, routing, state, and layout baselines.
- Check that resume management remains structured, self-service, and separate from privacy-policy and company-review logic.
- Check that optional upload safety expectations are documented clearly.
- Run `./scripts/aidlc-check.sh`.
