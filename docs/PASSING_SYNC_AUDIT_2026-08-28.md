# PitchLab Passing Synchronization Audit — 2026-08-28

## Purpose

This audit records the passing-family state after the first canonical synchronization batch on `metric-sync-audit-2026-08-27`.

It is deliberately non-destructive. It does not redefine any passing metric.

## Governing rule

Validated passing definitions may be moved into canonical Gold Metric Bible ownership without changing their event predicates.

Passing metrics that have not yet been independently reconciled to trusted controls must remain in their current legacy/family implementation and must not be labelled `GOLD_LOCKED` merely because their formula appears plausible.

No fixture-specific corrections are permitted.

## Canonicalized passing metrics

The following event metrics are now attached to the live `PitchLabMetricBible.canonicalRegistry` by `ui-gold-passing-family.js` and are consumed by Pitch Events, Metric Leaders and the Match Stats synchronization layer:

| Metric | Stable key | Forest–Leeds control | Status |
|---|---|---:|---|
| Total Passes | `allpasses` | 411–326 | GOLD_LOCKED |
| Successful Passes | `successful` | 321–232 | GOLD_LOCKED |
| Unsuccessful Passes | `unsuccessful` | 90–94 | GOLD_LOCKED via validated total/success split |
| Final Third Passes | `final_third_passes` | 110–92 | GOLD_LOCKED |
| Successful Final Third Passes | `final_third_passes_success` | 72–38 | GOLD_LOCKED |

`Pass Accuracy` is registered as a derived Match Stats metric using:

- numerator: `successful`
- denominator: `allpasses`
- Forest–Leeds control: 78.1%–71.2%

## Authoritative statistical-pass predicate

The established Golden pass-family engine remains `ui-passing-metrics-golden.js`.

A statistical pass is:

```text
Pass
AND NOT Cross
AND NOT ThrowIn
AND NOT KeeperThrow
```

The synchronization work must preserve this predicate. Do not replace it with generic `Pass` merely to simplify the registry.

## Current canonical path

```text
ui-passing-metrics-golden.js
        |
        | established statistical-pass predicate
        v
ui-gold-passing-family.js
        |
        v
PitchLabMetricBible.canonicalRegistry
        |
        +--> Pitch Events compatibility FILTERS
        +--> Metric Leaders / playerRows()
        +--> Match Stats / metricEvents()
```

`metricEvents()` resolves the live public canonical registry before legacy `FILTERS`, so the canonical definitions are authoritative.

## Passing metrics NOT yet approved for canonical Gold migration

The following visible passing metrics remain outside this first Gold batch:

- `progressive` — Open-Play Progressive Passes
- `forward` — Forward Passes
- `forward_success` — Successful Forward Passes
- `side` — Side Passes
- `side_success` — Successful Side Passes
- `backward` — Backward Passes
- `backward_success` — Successful Backward Passes
- `box_passes` — Passes in Penalty Box
- `box_passes_success` — Successful Passes in Penalty Box
- `crosses` — Crosses
- `open_play_crosses` — Open-Play Crosses
- `accurate_open_play_crosses` — Accurate Open-Play Crosses
- `long_passes` — Long Passes
- `accurate_long_passes` — Accurate Long Passes
- `inaccurate_long_passes` — Inaccurate Long Passes

Cross-family metrics already canonicalized elsewhere, such as `accurate_crosses` and `inaccurate_crosses`, should continue to use their existing canonical family rather than being duplicated here.

## Legacy directional definitions observed

The base runtime currently classifies direction using only longitudinal change:

```text
d = endX - x
forward  if d >= 2
backward if d <= -2
side     otherwise
```

These definitions are currently legacy implementation details, not newly approved Gold definitions.

Do not promote them to `GOLD_LOCKED` until trusted team/player controls have been reconciled.

## Legacy progressive-pass definition observed

The base runtime currently requires a progressive pass to be:

- a successful Pass,
- not a FreeKickTaken / CornerTaken / ThrowIn / GoalKickTaken / PenaltyTaken restart,
- starting at x >= 100/3,
- reducing Euclidean distance to the opposition-goal centre by at least 9.144 metres after PitchLab coordinate scaling.

This is an existing implementation, not a newly approved Gold definition.

Do not rewrite or canonicalize it solely from its name. Validate it against trusted controls first.

## Retired metrics — remain retired

The following must not return during passing-family work:

- `into_final_third` — Passes Into Final Third
- `into_final_third_success` — Successful Passes Into Final Third

`Final Third Entries` remains a separate Gold metric and must not be used as an alias for either retired metric.

## Recommended next passing work

1. Regression-check the five newly canonicalized passing metrics on Forest–Leeds.
2. Confirm Bournemouth Successful Final Third Passes remains 123–55.
3. Verify Pitch Events, Metric Leaders and Match Stats consume the same event sets for those canonical keys.
4. Verify no protected selector metric disappeared and the two retired final-third metrics remain absent at runtime.
5. Obtain/recover trusted controls for Forward Passes, Successful Forward Passes, Backward Passes, Successful Backward Passes and Progressive Passes.
6. Reconcile those controls against the existing predicates before any canonical migration.
7. Keep Side Passes and the remaining pass subfamilies unmigrated until separately reviewed.

## Safety conclusion

The current passing synchronization batch should be treated as **five validated event metrics plus one derived Pass Accuracy metric**, not as approval of the entire passing catalogue.

Architecture may be cleaned up around those validated definitions. The unvalidated directional/progressive formulas must not be changed or promoted merely for architectural uniformity.
