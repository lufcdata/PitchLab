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
| Forward Passes | `forward` | 149–135 | GOLD_LOCKED |
| Backward Passes | `backward` | 69–49 | GOLD_LOCKED |

`Pass Accuracy` is a derived Match Stats metric: successful / allpasses, Forest–Leeds control 78.1%–71.2%.

`Successful Forward Passes` and `Successful Backward Passes` are synchronized from the validated directional populations plus successful outcome. Forest–Leeds raw observations are 85–68 and 60–42 respectively. They remain `DERIVED_FROM_GOLD_COMPONENTS_PENDING_HEADLINE_CONTROL` until independent trusted headline controls are supplied or recovered.

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

## Directional passes — corrected and validated 2026-08-28

The earlier 244–211 interpretation of `Forward Passes` was incorrect. That result is the count of Gold statistical passes with positive longitudinal movement (`endX > x`), not the Opta headline Forward Pass metric. It is explicitly superseded and must not be restored as `forward`.

The trusted Opta/BBC controls for Forest 0–1 Leeds are:

```text
Forward Passes:  Forest 149, Leeds 135
Backward Passes: Forest 69,  Leeds 49
```

These also reconcile to the supplied directional shares:

```text
Forest: Forward 36.3%, Backward 16.8%, Left 22.1%, Right 24.8%
Leeds:  Forward 41.4%, Backward 15.0%, Left 20.6%, Right 23.0%
```

The exact raw reconstruction uses the Gold statistical-pass population and full-precision event coordinates on the physical 105m × 68m pitch:

```text
dx = (endX - x) * 1.05
dy = (endY - y) * 0.68
angle = atan2(dy, dx)
```

The four exclusive 90-degree sectors are:

```text
Forward:  -45° <= angle < 45°
Left:      45° <= angle < 135°
Backward: angle >= 135° OR angle < -135°
Right:     otherwise
```

This yields exactly:

```text
Forest: Forward 149, Backward 69, Left 91, Right 102 = 411
Leeds:  Forward 135, Backward 49, Left 67, Right 75 = 326
```

WhoScored/Opta qualifier 213 (`Angle`) is geometrically consistent but rounded. It moves two Forest boundary events into the wrong sector, so full-precision coordinates are authoritative for exact directional boundary reconstruction.

Implementation ownership is `ui-forward-pass-definition.js`. `forward` and `backward` are `GOLD_LOCKED` and routed through Pitch Events, Metric Leaders and Match Stats.

### Successful directional observations

Applying successful outcome to the Gold directional populations gives:

```text
Successful Forward Passes:  Forest 85, Leeds 68
Successful Backward Passes: Forest 60, Leeds 42
```

These are reproducible raw observations, not independent headline controls. They remain pending Gold promotion.

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
        +--> validated Forward 149–135 / Backward 69–49
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

## Directional family status

### Solved

- `forward` — Forest 149, Leeds 135 — `GOLD_LOCKED`
- `backward` — Forest 69, Leeds 49 — `GOLD_LOCKED`

### Derived pending independent controls

- `forward_success` — raw-derived 85–68
- `backward_success` — raw-derived 60–42

### Not promoted as PitchLab headline metrics

The Left/Right sector counts are valuable reconciliation evidence for the four-way directional partition, but they must not silently replace any separately defined PitchLab `side` metric. Existing `side` / `side_success` semantics remain under investigation until the intended product definition and trusted controls are confirmed.

## Legacy directional definitions — superseded

The base runtime historically classified direction as:

```text
d = endX - x
forward  if d >= 2
backward if d <= -2
side     otherwise
```

That heuristic is not the canonical Opta directional definition and must not be promoted to Gold.

A later investigation temporarily identified `endX > x` / the broad forward half-plane with the headline Forward Pass metric because it reproduced a 244–211 candidate control. Independent Opta/BBC headline evidence disproved that interpretation. The 244–211 result is retained only as forensic history and must not be used as `forward`.

## Passing metrics not yet approved for Gold migration

- `progressive` — authoritative definition synchronized; Gold control pending
- `forward_success` — synchronized derived metric; independent control pending
- `backward_success` — synchronized derived metric; independent control pending
- `side`
- `side_success`
- `box_passes`
- `box_passes_success`
- `crosses`
- `open_play_crosses`
- `accurate_open_play_crosses`
- `long_passes`
- `accurate_long_passes`
- `inaccurate_long_passes`

Cross-family metrics already canonicalized elsewhere, such as `accurate_crosses` and `inaccurate_crosses`, continue to use their existing canonical family.

## Retired Progressive Pass implementation

The base runtime formerly required a progressive pass to be successful, non-restart, start at x >= 100/3, and reduce physical distance to goal by at least 9.144m.

Historical commit `584d61a74a37fbdf67cc9cd7fcf99b3de77d5e97` confirms an earlier real-event prototype used the same absolute-distance family. This is historical implementation evidence only, not a Gold control. It must not be restored.

## Surface-routing verification

Canonical event predicates are resolved through `PitchLabMetricBible.canonicalRegistry` before legacy `FILTERS`. Directional and Progressive compatibility FILTERS are also installed by their definition modules, keeping Pitch Events aligned with Leaders and Match Stats after module load.

This is architectural equivalence; numerical Gold status remains metric-specific.

## Retired metrics — remain retired

- `into_final_third` — Passes Into Final Third
- `into_final_third_success` — Successful Passes Into Final Third

`Final Third Entries` remains a separate Gold metric and must not be used as an alias.

## Recommended next passing work

1. Validate Forward and Backward directional boundaries on a second fixture with independent controls.
2. Obtain/recover independent Successful Forward / Successful Backward controls and compare against raw 85–68 / 60–42.
3. Reconcile Progressive Passes against trusted team/player controls.
4. Establish the intended product semantics for any `side` metric before changing it.
5. Continue the remaining passing family one metric at a time.
6. Keep retired final-third metrics absent.

## Safety conclusion

The passing family now contains seven validated Gold event metrics including Forward Passes at 149–135 and Backward Passes at 69–49, one derived Gold Pass Accuracy metric, two synchronized successful-direction metrics pending independent headline controls, and one authoritative Progressive Pass definition pending numerical Gold control.

The previously recorded 244–211 Forward Pass interpretation is explicitly superseded. The current directional controls are reconciled simultaneously to independent headline figures, supplied directional percentages, and the raw coordinate geometry.