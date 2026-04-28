# NFR requirements: U2-7-student-profile-language-level

## Security

- Student language-level management must require an authenticated student session.
- Only the owning student may add, update, or remove self-service language entries through this flow.
- Protected writes must validate structured language references and reject unauthorized or malformed changes.

## Privacy

- Student Japanese and English levels are protected profile data and must be treated as privacy-sensitive information.
- This self-service flow should expose only the authenticated student’s own language records in the student context.
- Later company/admin visibility rules must consume these records through explicit policy rather than implicit access.

## Performance

- Language-record read and update behavior should remain responsive for normal interactive profile use.
- The design should avoid unnecessary full-profile reload patterns when only language records change.

## Reliability

- Language add, set, edit, and remove outcomes should be predictable and consistent for the same input.
- Invalid taxonomy values, unsupported language entries, and unexpected backend failures should surface stable outcomes.
- Basic-profile language summaries and detailed language records should remain coherent rather than drifting independently.

## Accessibility

- Language-level management should support clear field labeling, understandable language and level selection, and accessible success and error feedback.
- Empty language states should remain understandable and action-oriented rather than ambiguous.

## Maintainability

- Language-management rules should reuse the shared language taxonomy and existing auth, routing, and layout baselines.
- This unit should stay focused on student-owned language records rather than absorbing unrelated profile subdomains.
- Later vacancy-language, matching, and privacy units should extend from this baseline instead of redefining language levels independently.
