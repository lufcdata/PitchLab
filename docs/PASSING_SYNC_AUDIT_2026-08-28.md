# PitchLab Passing Synchronization Audit — 2026-08-28

## Purpose

This audit records the passing-family state after canonical synchronization work on `metric-sync-audit-2026-08-27`.

## Governing rule

Validated passing definitions may be moved into canonical Gold Metric Bible ownership without changing their event predicates.

Passing metrics that have not yet been independently reconciled to trusted controls must not be labelled `GOLD_LOCKED` merely because their formula appears plausible.

No fixture-specific corrections are permitted.

## Canonicalized Gold passing metrics

The following event metrics are attached to the live `PitchLabMetricBible.canonicalRegistry` and consumed by Pitch Events, Metric Leaders and Match Stats:

| Metric | Stable key | Forest–Leeds control | Status |
|---|---|---:|---|
| Total Passes | `allpasses` | 411–326 | GOLD_LOCKED |
| Successful Passes | `successful` | 321–232 | GOLD_LOCKED |
| Unsuccessful Passes | `unsuccessful` | 90–94 | GOLD_LOCKED via validated total/success split |
| Final Third Passes | `final_third_passes` | 110–92 | GOLD_LOCKED |
| Successful Final Third Passes | `final_third_passes_success` | 72–38 | GOLD_LOCKED |
| Forward Passes | `forward` | 244–211 | GOLD_LOCKED |

`Pass Accuracy` is a derived Match Stats metric: successful / allpasses, Forest–Leeds control 78.1%–71.2%.

`Successful Forward Passes` is synchronized from the validated Forward predicate plus successful outcome. Forest–Leeds raw observation is 164–126, but this remains `DERIVED_FROM_GOLD_COMPONENTS_PENDING_HEADLINE_CONTROL` until an independent trusted headline control is supplied/recovered.

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

## Forward Pass — validated 2026-08-28

The legacy fixed ±2 x-unit directional heuristic is superseded for `forward`.

The uploaded raw Forest 0–1 Leeds fixture exposes Opta qualifier 213 (`Angle`) on the pass population. Reconciliation against the trusted Opta Forward Pass control established the natural forward half-plane boundary:

```text
Statistical pass
AND Opta Angle is within ±90 degrees of attacking direction
```

In the raw 0–2π representation:

```text
angle < π/2 OR angle > 3π/2
```

The exact coordinate fallback is:

```text
endX > x
```

This reproduces the trusted Forest–Leeds Forward Pass control exactly:

```text
Forest 244
Leeds  211
```

Implementation ownership is `ui-forward-pass-definition.js`. Qualifier 213 is preferred when present; coordinate geometry is the transparent fallback. The definition is `GOLD_LOCKED` and routed through Pitch Events, Metric Leaders and Match Stats.

The same raw fixture yields Successful Forward Passes 164–126 from this Forward population, but those counts are not promoted to an independent Gold control without a trusted headline reference.

## Progressive Pass — authoritative definition updated 2026-08-28

The previous legacy absolute-distance definition is superseded.

A **Progressive Pass** is:

```text
Completed statistical pass
AND start x >= 33.333333
AND end distance to centre of opposition goal <= 75% of start distance
```

Distance is calculated on PitchLab's physical 105m × 68m pitch:

```text
startDistance = hypot((100 - x) * 1.05, (50 - y) * 0.68)
endDistance   = hypot((100 - endX) * 1.05, (50 - endY) * 0.68)
progressive   = endDistance <= startDistance * 0.75
```

This does not add an Open Play / restart exclusion. The old 9.144m absolute-gain rule and its restart exclusions are retired.

Implementation ownership is `ui-progressive-pass-definition.js`. It is synchronized across surfaces but remains `AUTHORITATIVE_DEFINITION_PENDING_GOLD_CONTROL` until a trusted numerical control is reconciled.

## Current canonical path

```text
ui-passing-metrics-golden.js
        |
        v
ui-gold-passing-family.js
        |
        +--> validated Gold passing family
        v
ui-forward-pass-definition.js
        |
        +--> validated Forward Pass 244–211
        v
ui-progressive-pass-definition.js
        |
        +--> authoritative Progressive Pass definition
        v
PitchLabMetricBible.canonicalRegistry
        |
        +--> Pitch Events compatibility FILTERS
        +--> Metric Leaders / playerRows()
        +--> Match Stats / metricEvents()
```

`metricEvents()` resolves the live public canonical registry before legacy `FILTERS`, so canonical definitions are authoritative.

## Directional family investigation

### What is solved

`forward` is solved and Gold-locked at 244–211.

### What remains unresolved

- `forward_success` — raw-derived 164–126; independent headline control pending
- `side` — trusted control pending
- `side_success` — trusted control pending
- `backward` — trusted control pending
- `backward_success` — trusted control pending

The uploaded raw fixture contains qualifier 213 Angle for the statistical-pass population, so these metrics can be investigated geometrically without relying on the legacy ±2 rule.

A public OPTA-based research methodology describes Sidewards Pass as 75°–105° (and the mirrored negative sector), but that convention must NOT be silently adopted as PitchLab Gold: applying a published analytical convention is not equivalent to reconciling the exact Opta headline metric required by this project. Trusted Backward/Side controls remain the promotion gate.

### Raw remainder after validated Forward split

Using the exact Gold statistical-pass base and `endX > x` Forward boundary, the non-forward remainder in the uploaded fixture is:

```text
Forest: 167
Leeds:  115
```

This remainder must not be labelled wholly Backward or arbitrarily split into Backward/Side without controls. One Forest pass has exactly zero longitudinal displacement in the raw coordinates; boundary behavior therefore needs explicit handling once trusted Side/Backward controls are available.

## Passing metrics not yet approved for Gold migration

- `progressive` — authoritative definition synchronized; Gold control pending
- `forward_success` — synchronized derived metric; independent control pending
- `side`
- `side_success`
- `backward`
- `backward_success`
- `box_passes`
- `box_passes_success`
- `crosses`
- `open_play_crosses`
- `accurate_open_play_crosses`
- `long_passes`
- `accurate_long_passes`
- `inaccurate_long_passes`

Cross-family metrics already canonicalized elsewhere, such as `accurate_crosses` and `inaccurate_crosses`, continue to use their existing canonical family.

## Legacy directional definitions — superseded for Forward

The base runtime historically classified direction as:

```text
d = endX - x
forward  if d >= 2
backward if d <= -2
side     otherwise
```

The `forward` portion of this heuristic is now superseded by the validated qualifier-213 / `endX > x` definition. The legacy Side and Backward portions remain implementation details only and must not be promoted to Gold.

## Retired Progressive Pass implementation

The base runtime formerly required a progressive pass to be successful, non-restart, start at x >= 100/3, and reduce physical distance to goal by at least 9.144m.

Historical commit `584d61a74a37fbdf67cc9cd7fcf99b3de77d5e97` confirms an earlier real-event prototype used the same absolute-distance family. This is historical implementation evidence only, not a Gold control. It must not be restored.

## Surface-routing verification

Canonical event predicates are resolved through `PitchLabMetricBible.canonicalRegistry` before legacy `FILTERS`. Forward and Progressive compatibility FILTERS are also installed by their definition modules, keeping Pitch Events aligned with Leaders and Match Stats after module load.

This is architectural equivalence; numerical Gold status remains metric-specific.

## Retired metrics — remain retired

- `into_final_third` — Passes Into Final Third
- `into_final_third_success` — Successful Passes Into Final Third

`Final Third Entries` remains a separate Gold metric and must not be used as an alias.

## Recommended next passing work

1. Obtain/recover trusted controls for Backward Passes and Side Passes.
2. Reconcile their angle boundaries against the uploaded raw Forest–Leeds fixture; do not force a split.
3. Obtain/recover a trusted Successful Forward Pass control and compare against raw 164–126.
4. Reconcile Progressive Passes against trusted team/player controls.
5. Validate the directional definitions on a second fixture before expanding Gold status beyond the currently controlled Forward metric.
6. Keep retired final-third metrics absent.

## Safety conclusion

The passing family now contains six validated Gold event metrics including Forward Passes at the exact trusted 244–211 control, one derived Gold Pass Accuracy metric, one synchronized Successful Forward metric pending independent headline control, and one authoritative Progressive Pass definition pending numerical Gold control.

Backward and Side remain deliberately unresolved rather than being inferred from the Forward result.