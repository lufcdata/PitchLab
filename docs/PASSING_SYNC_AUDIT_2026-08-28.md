# PitchLab Passing Synchronization Audit — 2026-08-28

## Purpose

This audit records the passing-family state after the first canonical synchronization batch on `metric-sync-audit-2026-08-27`.

## Governing rule

Validated passing definitions may be moved into canonical Gold Metric Bible ownership without changing their event predicates.

Passing metrics that have not yet been independently reconciled to trusted controls must not be labelled `GOLD_LOCKED` merely because their formula appears plausible.

No fixture-specific corrections are permitted.

## Canonicalized Gold passing metrics

The following event metrics are attached to the live `PitchLabMetricBible.canonicalRegistry` by `ui-gold-passing-family.js` and are consumed by Pitch Events, Metric Leaders and the Match Stats synchronization layer:

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

## Progressive Pass — authoritative definition updated 2026-08-28

The previous legacy absolute-distance definition is superseded.

A **Progressive Pass** is now defined as:

```text
Completed statistical pass
AND start x >= 33.333333
AND end distance to the centre of the opposition goal <= 75% of start distance
```

In words: a completed pass in the attacking two-thirds of the pitch that moves the ball at least 25% closer to the centre of the opposition goal.

Distance is calculated on PitchLab's physical 105m × 68m pitch, using the WhoScored coordinate conversion:

```text
startDistance = hypot((100 - x) * 1.05, (50 - y) * 0.68)
endDistance   = hypot((100 - endX) * 1.05, (50 - endY) * 0.68)
progressive   = endDistance <= startDistance * 0.75
```

This definition does **not** add an Open Play / restart exclusion. The old 9.144m absolute-gain rule and its restart exclusions are retired.

Implementation ownership is `ui-progressive-pass-definition.js`. The metric is attached to the canonical registry for consistent consumption across Pitch Events, Metric Leaders and Match Stats, but it is **not yet `GOLD_LOCKED`** because a trusted numerical control has not yet been reconciled. Runtime status is `AUTHORITATIVE_DEFINITION_PENDING_GOLD_CONTROL`.

The visible label is **Progressive Passes**, replacing the misleading legacy label **Open Play Progressive Passes**.

## Current canonical path

```text
ui-passing-metrics-golden.js
        |
        | established statistical-pass predicate
        v
ui-gold-passing-family.js
        |
        +--> validated Gold passing family
        |
        v
ui-progressive-pass-definition.js
        |
        +--> authoritative 25% Progressive Pass definition
        v
PitchLabMetricBible.canonicalRegistry
        |
        +--> Pitch Events compatibility FILTERS
        +--> Metric Leaders / playerRows()
        +--> Match Stats / metricEvents()
```

`metricEvents()` resolves the live public canonical registry before legacy `FILTERS`, so the canonical definitions are authoritative.

## Passing metrics NOT yet approved for canonical Gold migration

The following visible passing metrics remain outside the Gold batch:

- `progressive` — Progressive Passes — authoritative definition synchronized, Gold control pending
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

## Retired Progressive Pass implementation

The base runtime formerly required a progressive pass to be successful, non-restart, start at x >= 100/3, and reduce physical distance to goal by at least 9.144m.

That implementation is now superseded by the authoritative 25% relative-distance definition above and must not be restored.

## Retired metrics — remain retired

The following must not return during passing-family work:

- `into_final_third` — Passes Into Final Third
- `into_final_third_success` — Successful Passes Into Final Third

`Final Third Entries` remains a separate Gold metric and must not be used as an alias for either retired metric.

## Recommended next passing work

1. Regression-check the five Gold passing metrics on Forest–Leeds.
2. Confirm Bournemouth Successful Final Third Passes remains 123–55.
3. Reconcile the new 25% Progressive Pass definition against trusted team and player controls, then promote it to `GOLD_LOCKED` only if those controls agree.
4. Verify Pitch Events, Metric Leaders and Match Stats consume the same Progressive Pass event set.
5. Verify no protected selector metric disappeared and the two retired final-third metrics remain absent at runtime.
6. Obtain/recover trusted controls for Forward Passes, Successful Forward Passes, Backward Passes and Successful Backward Passes.
7. Keep Side Passes and the remaining pass subfamilies unmigrated until separately reviewed.

## Safety conclusion

The current passing synchronization state is **five validated Gold event metrics, one derived Gold Pass Accuracy metric, and one authoritative Progressive Pass definition pending numerical Gold control**.

Architecture may consume the Progressive Pass definition consistently now, but its Gold status must remain pending until trusted controls are reconciled.
