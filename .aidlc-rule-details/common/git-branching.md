# Git branching

## Branch model

- `main`: stable branch
- `dev`: integration branch for local development
- `feature/<unit-name>`: unit development
- `fix/<issue-name>`: fixes
- `chg/<chg-id>`: change requests

## Rules

- Prefer one feature branch per unit.
- Rebase or merge carefully; do not force-push shared branches.
- Keep PR scope aligned to the named unit or change request.
