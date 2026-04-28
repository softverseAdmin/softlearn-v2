# NFR requirements: U0-2-user-personas-definition

## Security

- Personas must make trust boundaries visible, especially between learners, company users, and admins.
- Company recruiter and company engineer reviewer personas must reflect different access expectations and responsibilities.
- Platform admin persona must reflect the need for stronger protection around privileged actions.

## Privacy

- Learner personas must surface consent, visibility, and anxiety around personal data and exam-result sharing.
- Company-side personas must reflect that access to student information is permission-controlled rather than automatic.
- Admin persona must reflect privacy oversight and auditability responsibilities.

## Performance

- This unit has no runtime target, but personas should be clear and concise enough to support fast reference in later design work.
- Usage scenarios should identify workflows likely to need responsive experiences later, such as course browsing, matching, vacancy review, and interview coordination.

## Reliability

- Persona definitions must be stable enough to guide later inception and construction units.
- Personas should represent durable user behavior patterns rather than temporary assumptions tied to one workflow detail.

## Accessibility

- Personas should acknowledge differences in language ability, confidence, and experience level.
- Learner personas should reflect the need for understandable, structured flows.
- Persona descriptions should avoid excluding users who rely on simpler navigation or clearer guidance.

## Maintainability

- Persona descriptions should be easy to reference from later units such as features, privacy, matching, and admin design.
- Persona definitions must stay technology-agnostic so they remain valid after ADR-001.
- Future refinements should happen through explicit document updates rather than silent reinterpretation.
