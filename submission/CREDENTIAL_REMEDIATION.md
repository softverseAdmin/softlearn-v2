# Credential remediation and reviewed cleanup

Prepared 2026-11-01. No secret value is recorded here. The exposed value was not displayed or tested.

## Provider action

The owner reports that the Google Cloud and AI Studio credentials have been deleted. This is an owner confirmation, not independent provider verification. Retain the project's non-secret identifier and deletion confirmation privately. Check provider usage/billing records for unexpected activity and update legitimate dependents if necessary. Do not paste replacement keys into Git, chat, issues, or the application form.

Google's instructions are at [Gemini leak response](https://ai.google.dev/gemini-api/docs/api-key#leak-response-checklist). Credentials are managed through [Google Cloud Credentials](https://console.cloud.google.com/apis/credentials) and [Google AI Studio](https://aistudio.google.com/).

## Verified isolated rehearsal

The rehearsal initially left the working repository and GitHub refs unchanged. A private scratch clone was created from local objects, with the three branch heads and eleven pull-request refs verified against GitHub's 2026-11-01 snapshot. No tags were found. The verified mapping has since been applied to the local `main` lineage, preserving all pending file edits. The remote update is pending at this snapshot.

`git-filter-repo` 2.47.0 replaced only the exact flagged value with a placeholder. It did not delete `.env.example`, squash commits, rebase feature work, or remove authorship. A temporary replacement-rule file was created with mode 0600 inside a mode-0700 scratch directory and deleted after use. It contained the value only for the local rewrite; no rule file was added to the repository.

Verification results:

- 219 reachable commits before and after, including all reviewed branch/PR histories; 218 are on the original `main` lineage.
- Author, committer, dates, messages, and parent relationships preserved, apart from mapping rewritten parent IDs.
- The only changed historical file path is `.env.example`; each changed blob equals the original with the exact flagged value replaced.
- Current file trees for all three branch tips are identical before and after cleanup.
- 205 commit IDs change. The tool removes signatures from 16 signed commits, as signatures cannot validate rewritten objects.
- Targeted scan: 4,367 reachable objects before cleanup, with one matching blob; 4,366 after cleanup, with no Google-key-pattern matches.
- Original refs and HEAD were verified unchanged. Temporary secret replacement rules were verified deleted.

A broader Gitleaks 8.30.1 scan was run locally on all reachable history in the cleaned clone, with default rules, 100% redaction, an empty ignore file, and inline allow comments disabled. Its two findings were inspected without printing candidate values: an explicit `YOUR_*` authorization placeholder in historical `DEPLOYMENT.md`, and a numeric relative-time expression assigned to `reset_token_expires_at` in historical `SECURITY_AUDIT_REPORT.md`. Both were confirmed non-credentials. No findings remain untriaged. A separate scan of a 408-file snapshot of tracked and non-ignored new working files found only that same authorization placeholder. No new allowlist or scanner suppression was added.

The scanner archive's SHA-256 was checked against the checksum file from the same official release. Scanner output and reports were kept in the private scratch directory with secret values redacted. These results describe the scanner's coverage and triage, not a guarantee that no possible secret exists.

Private local artifacts (temporary storage; not a published archive):

- Cleaned bare repository: `/private/tmp/softlearn-cleanup-zaencuc8/cleaned.git`.
- Detailed report: `/private/tmp/softlearn-cleanup-zaencuc8/report.json`.
- Commit/ref maps and first-changed-commit record: the cleaned repository's `filter-repo/` directory.
- Local preparation script: `/private/tmp/softlearn_prepare_cleanup.py` (contains the flagged blob ID and logic, not the secret value).
- Redacted scanner reports and triage: `gitleaks-redacted.json`, `working-files-redacted.json`, and `scan-triage.json` in the private artifact directory.

These temporary paths may be removed by the operating system. The original repository still contains the old history and must remain private until a coordinated cleanup is applied. The rehearsal's exact-value/object checks are not a guarantee that all possible secrets have been detected.

## Applied local cleanup and recovery

The owner requested completion of repository preparation after reviewing the cleanup. A mode-0700 private recovery directory preserves a complete copy of the original `.git` data, a binary tracked-changes patch, and copies/hashes of pending files. Its location is kept in the private local cleanup report, outside the repository. Do not share this recovery copy: it contains the original sensitive history.

Local `main` now descends from `3a93c5c39111ec51bbc1adf4e67c6c5af0967dd3`, the verified replacement for `c78e43e531ffed758905bc88bb9a67a1369a0e0e`. All 21 pending file states at the time of application were verified unchanged. Old remote-tracking refs and reflogs must be cleaned only after the remote update is verified; the private recovery copy preserves rollback data.

Maintenance commits on the two secondary branches preserve their individual histories while removing the retired deployment integration and adding Vercel Git-deployment guards. Their new tips are `fcbb902fc5cb8c79e90fcdf456fcce6ae1a6d394` (`dev`) and `feb3e5a15fa885cf0972f710b96770284604aa50` (`copilot/favicon-main-sync`). Maintenance commit messages include Render's supported auto-deploy skip marker and a CI skip marker. Local tests are recorded separately.

The final remote update must use explicit expected-old-value leases for exactly the three reviewed branches. Never force-update unrelated refs or overwrite newer remote work. GitHub PR refs remain a separate support/coordination task.

## Historical baseline mapping

This table records the rehearsal's baseline mapping, before the new maintenance commits described above. It is not the final push manifest. Revalidate the old IDs immediately before updating anything remotely. If any branch advanced, preserve that work and regenerate the rehearsal. Do not use a blanket mirror push that could overwrite or delete unrelated refs.

| Branch | Expected current commit | Prepared replacement |
| --- | --- | --- |
| `main` | `c78e43e531ffed758905bc88bb9a67a1369a0e0e` | `3a93c5c39111ec51bbc1adf4e67c6c5af0967dd3` |
| `dev` | `ffd01fadc391bf7f4ac016c18d843c5d1e5fedd8` | `814dc65294689be3a95c0304d8e588a70c2e0c61` |
| `copilot/favicon-main-sync` | `a1739af6fcb4567aaf800045c68e67ed0c740c56` | `0146d6f08fe67f471b0a4b63fed6bea8a8805b99` |

Pending local edits, including removed deployment integration files, documentation, and third-party notices, are not part of that baseline manifest. Preserve and apply those edits onto cleaned history before their later commit/push, and update the manifest accordingly.

## Remaining remote cleanup

1. Confirm the owner-reported deletion and preserve a controlled private recovery copy. Coordinate a pause in writes with anyone who has a clone; identify any forks.
2. Preserve the pending removal of the retired hosting integration when applying cleaned history. The remaining repository deployment workflow is manual-only. Confirm that any external hosting integration will not auto-deploy a push before updating branch heads; unpushed local removals have not changed GitHub yet.
3. Preserve uncommitted local changes. Recheck all live branch/tag/PR refs against the rehearsal snapshot. Inspect open PRs and branch protections before changing any setting.
4. After explicit approval of the reviewed update, replace only affected branch refs with explicit expected-old-value leases, preferably atomically. No remote update is run by this preparation.
5. GitHub pull-request refs are read-only. Eight affected refs remain to address: PRs 1, 2, 5, 6, 7, 9, 10, and 11. Follow GitHub's sensitive-data-removal process for PR refs, cached views, and retained objects. GitHub Support decides whether it can purge the remaining data; revocation may affect support eligibility.
6. Clean/reclone other copies and replace the original working history without losing local edits. Never merge old history back into the cleaned branches. Recheck reachable refs and run redacted secret scanning before public release.

GitHub's procedure and limitations are documented in [Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).

## GitHub Support request draft

Not sent. Use only after branch updates and collaboration steps are complete.

Repository: `softverseAdmin/softlearn-v2` (currently private). A Google credential was accidentally committed; the owner reports deleting it. We prepared a targeted sensitive-data removal preserving the commit graph. Eight PR head refs are affected: 1, 2, 5, 6, 7, 9, 10, 11. The rehearsal's first changed commit maps from `4d64f806354b4a186a8e0372d7b79d57ba29442f` to `c628094f2fe957a92426c4ea523b641372c68cd7`; recheck the final tool report after applying the update. Please advise whether retained PR refs/cached views and sensitive objects can be purged under your policy. No secret value is included in this request.
