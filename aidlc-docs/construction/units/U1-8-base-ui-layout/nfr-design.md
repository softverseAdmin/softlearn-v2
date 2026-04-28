# NFR design: U1-8-base-ui-layout

## How NFRs are addressed

- Security is addressed by requiring role-aware shell behavior for navigation and major workflow entry points while keeping backend authorization authoritative.
- Privacy is addressed by ensuring the base layout does not reveal restricted workflow areas outside the current user’s allowed context.
- Performance is addressed by defining a reusable shell that separates stable layout chrome from changing page content.
- Reliability is addressed through consistent public/authenticated shell selection and predictable cross-app state presentation.
- Accessibility is addressed by requiring clear structural regions and understandable shared feedback areas.
- Maintainability is addressed by keeping the base layout generic, reusable, and separate from feature-specific page logic.

## Tradeoffs

- A shared base layout improves consistency and reuse, but later teams must resist creating one-off page shells unless clearly justified.
- Defining layout structure now reduces drift, but detailed visual design and component decisions are intentionally deferred.
- One unified shell across roles keeps the app simpler, though it still requires disciplined role-aware variation in navigation and emphasis.

## Monitoring

- Later implementation should monitor recurring layout-level errors, broken navigation framing, and role-mismatch presentation issues.
- Later frontend units should map their pages onto this shared shell instead of creating separate app structures by default.
- Any proposal to split the frontend into multiple shells or separate apps should be reviewed explicitly.

## Testing approach

- Review the unit against frontend initialization, routing, and state-management baselines.
- Check that public and authenticated shells are both covered.
- Check that role-aware layout behavior and shared page conventions are documented.
- Run `./scripts/aidlc-check.sh`.
