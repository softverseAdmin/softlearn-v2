# Code generation: U1-1-project-initialization

## Implementation plan

Repository scaffolding only. Do not add production application code before ADR-001 is accepted.

## Files to create or update

- Root README and `.gitignore`
- `.github/*`
- `.aidlc-rule-details/*`
- `aidlc-docs/*`
- `changes/*`
- `templates/unit/*`
- `scripts/*`

## Test plan

Make scripts executable and run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the repository bootstrap if it conflicts with the accepted AI-DLC model.

## Review checklist

- Scaffold supports unit lifecycle
- Scripts validate inputs
- No stack-specific app code introduced
