# NFR requirements: U2-4-student-profile-skills

## Security

- Student skill management must require an authenticated student session.
- Only the owning student may add, update, or remove self-service skill entries through this flow.
- Protected writes must validate structured skill references and reject unauthorized or malformed changes.

## Privacy

- Student skills are privacy-sensitive profile data and must be treated as protected information.
- This self-service flow should expose only the authenticated student’s own skills in the student context.
- Later company/admin visibility rules must consume these skill records through explicit policy rather than implicit access.

## Performance

- Skill-list read and update behavior should remain responsive for normal interactive profile use.
- The design should avoid unnecessary full-profile reload patterns when only skill records change.

## Reliability

- Skill add, edit, and remove outcomes should be predictable and consistent for the same input.
- Duplicate handling, invalid taxonomy values, and unexpected backend failures should surface stable outcomes.
- Student profile and app-shell state should remain coherent while skill updates are in progress.

## Accessibility

- Skill management should support clear form labeling, keyboard-friendly interaction, and understandable success and error feedback.
- Empty skill states should remain understandable and action-oriented rather than ambiguous.

## Maintainability

- Skill-management rules should reuse the shared skill taxonomy and existing auth, routing, and layout baselines.
- This unit should stay focused on student-owned skill records rather than absorbing unrelated profile subdomains.
- Later matching, vacancy, and privacy units should extend from this baseline instead of redefining skills independently.
