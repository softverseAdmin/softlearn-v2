# Third-party and generated-material review

Inventory date: 2026-11-01. This records available provenance; it is not a complete rights clearance or a license-compatibility opinion.

## Owner statements

The owner confirms that Softlearn is a solo personal project and reports generating the five hero illustrations and seeded lesson text/questions using AI. The owner identified Gemini in response to the service question. Asset-specific creation records, account terms at generation time, and any reference inputs have not been supplied, so this is not independent clearance for every asset.

The current [Gemini API terms](https://ai.google.dev/gemini-api/terms#use-of-generated-content) say Google does not claim ownership of original generated content and that users remain responsible for its use. This does not establish rights in reference inputs or confirm which terms applied to each asset when created. Keep creation/source evidence privately and retain applicable third-party notices.

## Retained upstream notices

Copies of notices from the installed frontend packages are retained verbatim under `third_party/licenses/`. Package versions are recorded below so future upgrades can refresh them.

| Material | Installed version / declared license | Notice |
| --- | --- | --- |
| Geist variable font | `@fontsource-variable/geist` 5.2.8; OFL-1.1 | `third_party/licenses/geist-LICENSE.txt` |
| Lucide icons, including Feather-derived notices | `lucide-react` 1.14.0; ISC plus included MIT notices | `third_party/licenses/lucide-LICENSE.txt` |
| shadcn package | `shadcn` 4.6.0; MIT | `third_party/licenses/shadcn-LICENSE.txt` |
| React | `react` 18.3.1; MIT | `third_party/licenses/react-LICENSE.txt` |
| Vite build tooling | `vite` 5.4.21; MIT | `third_party/licenses/vite-LICENSE.txt` |

These copies do not establish that every UI component came from the corresponding package; verify copied/generated component provenance separately. The npm lockfile contains license metadata for 780 dependency entries, including transitive/build packages. This inventory and these five notices are not exhaustive distribution notices.

The installed Python `psycopg` 3.3.6 dependency declares LGPL-3.0-only. This is the dependency's declaration, not a replacement for Softlearn's MIT license. The supplied program's interpretation of dependencies under its extra-approval rule has not been confirmed. Other installed dependency metadata includes Django (BSD-3-Clause), Pillow (MIT-CMU), and MIT/BSD-licensed service libraries. Backend requirements use ranges, so future resolutions may differ.

## Outstanding provenance records

| Material | Current evidence | Owner follow-up |
| --- | --- | --- |
| `frontend/public/assets/*-hero-illustration.png` and `frontend/src/assets/hero.png` (five PNGs) | Owner reports AI generation and identifies Gemini; asset-specific records not supplied | Retain creation records, applicable terms, and any reference-image permissions. |
| Seed lesson text and questions in `backend/users/management/commands/seed_demo_data.py` | Owner reports AI generation and identifies Gemini | Retain generation/source records and permissions for any reference material used. |
| Sample YouTube embed used by the seed command; transcript fetching service | External video link and transcript capability exist | Identify the video's owner and any permission for copied transcripts/material; use owner-created material if permissions are unavailable. No video or transcript was fetched during this audit. |
| `frontend/public/icons.svg`, React/Vite SVGs, and favicon | Symbols/brand assets without a repository provenance record | Record upstream sources and applicable notices; review actual usage. |
| `frontend/src/components/ui/` | shadcn-style components; shadcn package installed | Confirm origin/version of copied/generated component source and retain relevant notices. |

All inspected commits use the author name `softverseAdmin`. An author name alone does not establish ownership, eliminate other claims, or grant permission for external content. No owner rights have been inferred from that observation.
