# NFR design: U0-5-data-model-high-level-design

## How NFRs are addressed

- Security is addressed by separating identity, role, consent, privacy, and audit concepts instead of burying them inside generic profile records.
- Privacy is addressed by modeling visibility, consent, and access-trace concerns explicitly.
- Performance is addressed by using shared taxonomies and clear domain boundaries that support later indexing, reporting, and matching logic.
- Reliability is addressed by giving later units a stable conceptual model with clear relationship intent.
- Accessibility is addressed indirectly by keeping the data model understandable and consistent across learner, company, and admin experiences.
- Maintainability is addressed by organizing the model into reusable domains rather than one flat list of disconnected entities.

## Tradeoffs

Conceptual clarity is prioritized over early storage optimization.
The model includes more entities than a minimal MVP schema because privacy, matching explainability, and operational auditability need to be visible early.

## Monitoring

Future schema units should reference this model and note any intentional divergence.
Future changes to taxonomies, consent handling, or matching records should be checked against this baseline to avoid concept drift.

## Testing approach

Review for domain completeness, privacy traceability, and relationship clarity.
Check that all major product workflows can be represented at the conceptual level without introducing application-code detail.
