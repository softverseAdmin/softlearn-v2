# NFR design: U0-1-platform-requirements-definition

## How NFRs are addressed

- Security is addressed by making protected actors, privileged actions, and sensitive data categories explicit in the baseline requirements instead of leaving them implicit for later units.
- Privacy is addressed by requiring consent-aware visibility rules for student profiles, learning evidence, exam results, and matching exposure from the beginning.
- Performance is addressed by identifying future high-traffic and latency-sensitive product areas without committing to stack-specific solutions.
- Reliability is addressed by defining the requirement baseline as a stable, reviewable source for later units and by requiring deterministic permission and visibility behavior later.
- Accessibility is addressed by explicitly keeping learner, company, and admin experiences usable for varied language ability and navigation needs.
- Maintainability is addressed by structuring the requirements by actor and domain so future units can extend the design without changing the baseline silently.

## Tradeoffs

- Broad platform coverage is favored over premature technical detail.
- Privacy and explainability are prioritized even if they increase later implementation complexity.
- This unit intentionally avoids measurable runtime targets because those depend on later architecture and stack decisions.
- The requirements stay conceptual enough to remain stack-neutral, which reduces implementation guidance in the short term but preserves decision quality.

## Monitoring

- Monitor future changes to baseline requirements through PR review and CHG records after the inception baseline is accepted.
- Check later units against this baseline to ensure student privacy, company permissions, matching explainability, and admin protection are not diluted.
- Use unit reviews to confirm that later designs do not grant company access broader than what the baseline allows.

## Testing approach

- Review the completed requirement documents for completeness across all required domains:
  - students / learners
  - companies
  - admins
  - courses
  - exams
  - exam preparation
  - vacancies
  - matching
  - interview scheduling
  - meeting URLs
  - privacy and permissions
- Confirm the documents stay technology-agnostic and avoid application-code detail.
- Confirm the requirements are internally consistent with the inception baseline and AI-DLC rules.
- Use `./scripts/aidlc-check.sh` to verify repository and unit-document completeness.
