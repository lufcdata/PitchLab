# Possession Lost / Dispossessed / Turnovers clarification — 2026-08-28

## Taxonomy correction

`Possession Lost`, `Dispossessed`, and `Turnovers` are **three independent PitchLab metrics**.

The existing **Possession Lost** metric is already working correctly and is protected. It must remain standalone and **must not be renamed, recalculated, regrouped, or modified by this audit**.

The previous attempt to reconstruct a new 147–129 `Possession Lost` definition is retired. It was auditing the wrong semantic target and must not drive implementation changes.

There is no parent/category label called `Possession Lost` for the Dispossessed / Turnovers work.

## Trusted controls — Forest 0–1 Leeds (`whoscored:1983552`)

| Metric | First half | Full match | Status |
|---|---:|---:|---|
| Dispossessed | Forest 4 – 3 Leeds | Forest 9 – 3 Leeds | `GOLD_LOCKED` |
| Turnovers | Forest 12 – 9 Leeds | Forest 14 – 13 Leeds | `RAW_RECONCILED_PENDING_SECOND_FIXTURE` |

## Dispossessed

Authoritative definition remains the raw `Dispossessed` event population. Full-match control is 9–3 and first-half control is 4–3. Do not alter this definition while solving Turnovers.

## Turnovers — event-chain reconstruction

Raw unsuccessful `BallTouch` is the base event family:

- Forest: 16 full match; 12 events explicitly tagged `FirstHalf`.
- Leeds: 13 full match; 8 events explicitly tagged `FirstHalf`.

The full-match Forest overcount is explained by two event-chain duplicates rather than a fixture correction:

1. **68:36 Forest unsuccessful BallTouch** occurs after Forest have already lost possession: Forest successful TakeOn (68:32) -> Forest unsuccessful Pass (68:33) -> Leeds successful Interception (68:34) -> Forest unsuccessful BallTouch (68:36). Opposition control is already established before the BallTouch, so the BallTouch is not a new turnover.
2. **88:37 Forest unsuccessful BallTouch** is part of a blocked-delivery chain: Forest successful BallTouch (88:35) -> Forest unsuccessful BallTouch at `(79.4,65.1)` (88:37) -> Leeds Clearance (88:38) + Forest successful `BlockedPass` at the identical `(79.4,65.1)` coordinates (88:38). The unsuccessful BallTouch is therefore not an independent possession-loss turnover.

Excluding those two chain duplicates gives **Forest 14 – 13 Leeds**, exactly matching the trusted full-match control.

### First-half boundary

The trusted first-half control is Forest 12 – 9 Leeds. Forest has 12 qualifying unsuccessful BallTouches in the first period and therefore matches directly. Leeds has eight events tagged `FirstHalf`, plus an unsuccessful BallTouch at **45:48** that is tagged `SecondHalf` in the raw feed even though it occurs inside the fixture's first-half elapsed-time window. Counting by the match's real first-half time boundary rather than the anomalous raw period tag produces **12 – 9**, matching the trusted control.

### Candidate general rule

`Turnover` is an unsuccessful `BallTouch` representing a genuine loss of controlled possession, excluding BallTouch records that are merely secondary records inside an already-resolved possession-loss/defensive-action chain. Period filtering must use PitchLab's established real match-period boundary semantics rather than trusting a contradictory individual event period tag.

This rule reconstructs both trusted controls simultaneously:

- First half: **Forest 12 – 9 Leeds**
- Full match: **Forest 14 – 13 Leeds**

It is not yet `GOLD_LOCKED`: the semantic rule is now raw-reconciled on the Forest–Leeds fixture but requires a second fixture or equivalent independent control before Gold promotion.

## Protected implementation rule

1. Do not touch the existing standalone Possession Lost metric.
2. Keep Dispossessed as its own Gold metric.
3. Keep Turnovers independent from both metrics.
4. Do not sum Dispossessed + Turnovers and call the result Possession Lost.
5. Do not expose a `Possession Lost` parent label for these two metrics.
6. Do not implement fixture-specific event IDs/timestamps as exclusions; implementation must express the general chain rule above.
