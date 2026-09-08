# PitchLab Cloud Season Ingest

## Objective
Adding a future match must be a data operation, not a Season Performance code change, and must not require a local Python/Terminal workflow.

## Cloud pipeline
1. A raw WhoScored JSON is placed under `incoming/` on a dedicated staging ref/branch (default: `season-incoming`).
2. Run **Season Performance — Cloud Ingest** from GitHub Actions and provide both the staging ref and repository path.
3. The workflow checks out `main` as the production foundation, then reads the raw JSON from the staging ref into a temporary runner-only location. The raw file is never added to `main` or the generated ingest PR.
4. GitHub's runner validates the JSON and confirms Leeds appears on exactly one fixture side with the season's canonical Leeds team ID.
5. `scripts/season_ingest.py` creates a deterministic gzip match pack under `data/season/<season>/`.
6. The season manifest is upserted by `matchId`; rerunning the same fixture replaces its manifest record rather than duplicating it.
7. The generated pack is decompressed and checked for events and matching `matchId` before any commit is made.
8. The workflow creates a dedicated `season-ingest-*` branch containing only generated season data and opens a PR to `main`.
9. The PR is reviewed and merged using the normal PitchLab Golden Workflow. GitHub Pages then deploys from `main`.

## Safety rules
- Raw source is not concatenated into a season-wide raw file.
- Raw staging files are never committed to `main` by the ingest workflow.
- One fixture = one immutable browser pack.
- Leeds identity is resolved independently from home/away position before season aggregation.
- Existing Gold metric definitions are not recalculated or rewritten by ingestion.
- Carries and other derived sequences remain match-boundary-safe in Season Performance: calculate within each fixture, then aggregate.
- The workflow never pushes generated season data directly to `main`; it always opens a PR.
- A missing/invalid event population, missing teams/date/match ID, ambiguous Leeds side, conflicting Leeds team ID, or non-Leeds fixture fails the job.

## Current V1 upload step
GitHub Actions cannot receive an arbitrary local file through `workflow_dispatch`, so V1 uses a dedicated staging branch/ref for the browser upload step. The user's computer only supplies the raw JSON; validation, compression, manifest updates and PR creation happen in GitHub's cloud runner.

This deliberately keeps the raw upload separate from production history while preserving the review gate. A later PitchLab Admin upload surface can replace the staging-branch upload without changing the manifest/pack architecture.

## Bootstrap note
The workflow and `scripts/season_ingest.py` must exist on the default branch before the first production dispatch. This isolated foundation PR supplies that bootstrap without including the unfinished Season Performance browser UI.
