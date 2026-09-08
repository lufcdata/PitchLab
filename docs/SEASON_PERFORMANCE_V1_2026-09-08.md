# Season Performance V1 — architecture note

Date: 8 September 2026

Season Performance is a new PitchLab surface. It does not define a second metric engine.

## Authoritative flow

1. The season manifest identifies fixture packs and their metadata.
2. Date filtering selects the fixture population.
3. Ordinary event metrics aggregate the selected raw event populations and continue through the existing Gold Metric Bible.
4. Derived sequence metrics such as Carries are reconstructed **inside each match boundary first**, then aggregated.
5. Player, Match Period and metric filters are applied to the season population.
6. The same pitch renderer is used for the visual surface.
7. A dedicated 1080 x 1350 canvas renderer exports the selected view to PNG.

## V1 season controls

- Date From / Date To
- Player (Whole Team + every Leeds player in the selected fixtures)
- Metric
- Match Period / time window
- Match counter
- Event counter
- Event Map / Heat Map where supported

Default window: 8 August 2026 to 8 September 2026.

## V1 fixture manifest

- 22 Aug 2026 — Nottingham Forest 0-1 Leeds
- 30 Aug 2026 — Leeds 1-1 Brentford
- 5 Sep 2026 — Brighton 1-1 Leeds

The target hosted format is one gzip-compressed event pack per fixture. Until those packs are committed, the page has a multi-file **Load Season JSONs…** fallback so the full raw WhoScored JSONs can be selected together and processed in-browser without changing metric definitions.

## Carry boundary guardrail

Never run `PitchLabCarry.reconstruct()` over events from more than one fixture in a single call.

Correct:
`reconstruct(match A) + reconstruct(match B) + reconstruct(match C)`

Incorrect:
`reconstruct(match A events + match B events + match C events)`

This prevents a terminal action in one match from being paired to an origin/action in another match.

## Export

PNG exports are deterministic 1080 x 1350 canvases and include the selected metric and player, one-match fixture identity when exactly one match is selected (otherwise Leeds United + match count), date range, competition, pitch visual, event/match count and LUFCDATA.LAB footer.

Exact additional watermark artwork can be wired into the export once the final asset filenames are confirmed in the repository.
