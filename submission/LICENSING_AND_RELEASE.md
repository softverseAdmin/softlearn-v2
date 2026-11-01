# Licensing and release decisions

The project uses the MIT License in the root `LICENSE` file, selected by the owner. The copyright notice uses `softverseAdmin`, the configured Git author name. MIT is listed as accepted without extra approval in the supplied BYOP requirements. Repository possession and commit authorship alone do not establish rights to license every contribution or asset.

Before sharing publicly, the owner must review personal, collaborator, employer, and third-party rights; dependency notices; fonts and image assets; course materials; video/transcript sources; and generated content terms. Record provenance and required attribution. Third-party dependencies and materials retain their respective licenses.

On 2026-11-01 the owner confirmed that Softlearn is a solo personal project and that development has used only deliberately fictional sample data. The owner also reported generating the illustrations and seeded lesson text/questions using AI and identified Gemini as the service. These are owner statements; Git author names do not independently establish ownership. Asset-specific creation/source records remain to be retained. See `THIRD_PARTY_REVIEW.md` for the known dependency notices and outstanding asset sources.

Use a separate database with fictional records for application demonstrations. The planned product handles profiles, resumes, messages, and assessment results; ask BYOP whether that planned scope is permitted when development has never processed real people's data. A draft question is in `PROGRAM_QUESTIONS.md`.

Authenticated GitHub checks on 2026-11-01 found the repository to be private. The remote default branch at `c78e43e` contains MIT and the documentation from before this follow-up. New local edits are not yet on GitHub. The public-repository requirement is therefore not met yet; do not publish the exposed history.

Resolve the historical credential exposure described in `REVIEW.md` before sharing Git history. Ignoring files does not remove tracked files or historical objects. Even an archive of current files needs review for sensitive content and third-party material.

The owner reports deleting the Google credentials. The verified cleanup is now applied to the local `main` lineage, with a private recovery copy preserving original Git data and pending edits; the remote branch update is now complete and verified. Eight retained GitHub PR refs/caches still need follow-up. Remaining release decisions belong to the owner: repository visibility, demonstration content, publication, deployment, and application submission. The retired hosting integration is removed, the remaining repository deployment workflow is manual-only, and root/frontend Vercel configurations disable automatic Git deployments. Maintenance commits use Render's deployment-skip marker. No publication, deliberate deployment, or application submission has occurred.
