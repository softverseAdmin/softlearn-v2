# NFR requirements: U2-10-student-profile-privacy-settings

## Security

- Student privacy-settings management must require an authenticated student session.
- Only the owning student may change self-service privacy settings through this flow unless a later approved override policy is defined explicitly.
- Protected writes must reject unauthorized, malformed, or policy-invalid privacy changes.
- Company and admin access to privacy-related records must remain policy-bound and auditable.

## Privacy

- Privacy settings exist specifically to govern visibility of protected student data and must be treated as privacy-sensitive records themselves.
- Changes to profile or exam-result visibility must be explicit, understandable, and traceable.
- Company access to student data must respect current effective privacy and consent rules consistently.

## Performance

- Privacy-state read and update behavior should remain responsive for normal interactive use.
- Changes should take effect predictably without requiring broad profile re-entry or unnecessary full-profile reload behavior.

## Reliability

- The same privacy input should produce the same effective visibility outcome consistently.
- Consent-event recording, current privacy state, and later access-control behavior should remain coherent rather than drifting independently.
- Unexpected backend failures should surface stable outcomes without implying a privacy change succeeded when it did not.

## Accessibility

- Privacy controls should use clear, understandable language so students can make informed decisions.
- Success, warning, and validation feedback should be accessible and unambiguous.
- The privacy screen should help users understand the effect of their choices without requiring legal or technical expertise.

## Maintainability

- Privacy-setting rules should reuse the existing security, consent, RBAC, routing, and layout baselines.
- This unit should stay focused on student-controlled visibility configuration rather than absorbing all later company-review policy detail.
- Later company-visibility, exam-result-sharing, and audit units should extend from this baseline instead of redefining privacy ownership separately.
