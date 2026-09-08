# PitchLab Cloud Season Ingest

## Objective
Adding a future match must be a data operation, not a Season Performance code change, and must not require a local Python/Terminal workflow.

## Cloud pipeline
1. A raw WhoScored JSON is placed under `incoming/` in the repository.
2. Run **Season Performance — Cloud Ingest** from GitHub Actions and provide that repository path.
3. GitHub's runner validates the JSON and confirms Leeds is one of the teams.
4. `scripts/season_ingest.py` creates a deterministic gzip match pack under `data/season/<season>/`.
5. The season manifest is upserted by `matchId`; rerunning the same fixture replaces its manifest record rather than duplicating it.
6. The generated pack is decompressed and checked before any commit is made.
7. The workflow creates a dedicated `season-ingest-*` branch and opens a PR to `main`.
8. The PR is reviewed and merged using the normal PitchLab Golden Workflow. GitHub Pages then deploys from `main`.

## Safety rules
- Raw source is not concatenated into a season-wide raw file.
- One fixture = one immutable browser pack.
- Existing Gold metric definitions are not recalculated or rewritten by ingestion.
- Carries and other derived sequences remain match-boundary-safe in Season Performance: calculate within each fixture, then aggregate.
- The workflow never pushes generated season data directly to `main`; it always opens a PR.
- A missing/invalid event population, missing teams/date/match ID, or non-Leeds fixture fails the job.

## Current V1 upload step
GitHub Actions cannot receive an arbitrary local file through `workflow_dispatch`, so V1 expects the raw JSON to be uploaded to the repository's `incoming/` folder first. This upload happens in the browser/GitHub cloud; the user's computer performs no processing.

A later PitchLab Admin upload surface can replace this one browser upload step without changing the manifest/pack architecture.
