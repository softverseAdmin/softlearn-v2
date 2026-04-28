# Infrastructure design: U1-1-project-initialization

## Infrastructure impact

Repository automation only. No runtime service or environment is provisioned.

## Environment variables

Optional: `STRICT_CODEX=1` for strict codex-review behavior.

## External services

- GitHub Actions
- Optional GitHub CLI for PR creation
- Optional Codex CLI for repository review

## Deployment impact

Adds repository validation and PR workflow automation only.

## Database impact

None.
