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
| Turnovers | Forest 12 – 9 Leeds | Forest 14 – 13 Leeds | `DEFINITION_UNDER_INVESTIGATION` |

## Dispossessed

Authoritative definition remains the raw `Dispossessed` event population. Full-match control is 9–3 and first-half control is 4–3. Do not alter this definition while solving Turnovers.

## Turnovers — current forensic finding

Raw unsuccessful `BallTouch` is the strongest event-family candidate:

- Forest: 16 full match; 12 events explicitly tagged `FirstHalf`.
- Leeds: 13 full match; 8 events explicitly tagged `FirstHalf`.

Against the trusted Turnovers controls:

- Forest full match: candidate 16 vs control 14 (two-event overcount).
- Forest first half: candidate 12 vs control 12 (exact).
- Leeds full match: candidate 13 vs control 13 (exact).
- Leeds first half: candidate 8 vs control 9 (one-event residual).

This is strong evidence that Turnovers are closely related to unsuccessful `BallTouch`, but it is **not sufficient to canonicalize `Turnovers = unsuccessful BallTouch`**. The Forest full-match overcount and Leeds first-half residual must be explained by a general semantic or period-boundary rule rather than fixture-specific correction.

One timing detail is potentially important: the raw feed marks Leeds' unsuccessful BallTouch at 45:48 as `SecondHalf`, while the fixture's first period ends at expanded minute 47. This must be resolved against the application's existing period/window semantics before using the first-half residual to alter the event definition.

## Protected implementation rule

While this investigation continues:

1. Do not touch the existing standalone Possession Lost metric.
2. Keep Dispossessed as its own Gold metric.
3. Implement/canonicalize Turnovers only after the 14–13 full-match and 12–9 first-half controls are simultaneously explained.
4. Do not sum Dispossessed + Turnovers and call the result Possession Lost.
5. Do not expose a `Possession Lost` parent label for these two metrics.
