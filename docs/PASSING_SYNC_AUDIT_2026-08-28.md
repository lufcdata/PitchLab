# PitchLab Passing Synchronization Audit — 2026-08-28

## Closure state

The Passing family is now definition-complete on `metric-sync-audit-2026-08-27`.

`GOLD_LOCKED` is reserved for independently controlled provider metrics. Exact outcome subsets of secured populations are `DERIVED_FROM_GOLD_COMPONENTS`. Metrics whose product definition is authoritative but whose independent numerical control has not yet been recovered remain `AUTHORITATIVE_DEFINITION_PENDING_GOLD_CONTROL`. No fixture-specific correction factors are used.

## Canonical statistical-pass population

```text
Pass
AND NOT Cross
AND NOT ThrowIn
AND NOT KeeperThrow
```

Forest 0–1 Leeds: Forest 411, Leeds 326.

## Core pass family

| Metric | Key | Forest–Leeds | Status |
|---|---|---:|---|
| Total Passes | `allpasses` | 411–326 | GOLD_LOCKED |
| Successful Passes | `successful` | 321–232 | GOLD_LOCKED |
| Unsuccessful Passes | `unsuccessful` | 90–94 | GOLD_LOCKED |
| Pass Accuracy | `pass_accuracy` | 78.1–71.2% | GOLD_LOCKED derived Match Stats |
| Final Third Passes | `final_third_passes` | 110–92 | GOLD_LOCKED |
| Successful Final Third Passes | `final_third_passes_success` | 72–38 | GOLD_LOCKED |
| Unsuccessful Final Third Passes | `final_third_passes_unsuccess` | 38–54 | DERIVED_FROM_GOLD_COMPONENTS |

Checksums: Forest 72+38=110; Leeds 38+54=92.

## Headline Forward Pass family

Trusted controls:

```text
Forward Passes: Forest 244, Leeds 211
Forward Pass %: Forest 59.4%, Leeds 64.7%
```

Canonical predicate:

```text
Gold statistical pass AND endX > x
```

Outcome split from raw `outcomeType`:

| Metric | Key | Forest–Leeds | Status |
|---|---|---:|---|
| Forward Passes | `forward` | 244–211 | GOLD_LOCKED |
| Successful Forward Passes | `forward_success` | 164–126 | DERIVED_FROM_GOLD_COMPONENTS |
| Unsuccessful Forward Passes | `forward_unsuccess` | 80–85 | DERIVED_FROM_GOLD_COMPONENTS |

Checksums: Forest 164+80=244; Leeds 126+85=211.

## Separate directional taxonomy

This is deliberately separate from headline Forward Passes. Full-precision coordinates are converted to physical 105m x 68m displacement before applying +/-45 degree sectors.

```text
dx = (endX - x) * 1.05
dy = (endY - y) * 0.68
angle = atan2(dy, dx)

Directional Forward: -45 <= angle < 45
Sideways:              45 <= angle < 135 OR -135 <= angle < -45
Backward:              angle >= 135 OR angle < -135
```

Exact partition:

```text
Forest: 149 directional forward + 193 sideways + 69 backward = 411
Leeds:  135 directional forward + 142 sideways + 49 backward = 326
```

User-facing Sideways/Backward family:

| Metric | Key | Forest–Leeds | Status |
|---|---|---:|---|
| Side Passes | `side` | 193–142 | GOLD_LOCKED |
| Successful Side Passes | `side_success` | 171–120 | DERIVED_FROM_GOLD_COMPONENTS |
| Unsuccessful Side Passes | `side_unsuccess` | 22–22 | DERIVED_FROM_GOLD_COMPONENTS |
| Backward Passes | `backward` | 69–49 | GOLD_LOCKED |
| Successful Backward Passes | `backward_success` | 65–44 | DERIVED_FROM_GOLD_COMPONENTS |
| Unsuccessful Backward Passes | `backward_unsuccess` | 4–5 | DERIVED_FROM_GOLD_COMPONENTS |

Checksums: Side 171+22=193 / 120+22=142; Backward 65+4=69 / 44+5=49.

WhoScored stored `Angle` is rounded and differs at two Forest boundary events; full-precision coordinate geometry is the canonical reconstruction.

## Long Ball family

Canonical predicate: Gold statistical pass + `Longball` qualifier.

| Metric | Key | Forest–Leeds | Status |
|---|---|---:|---|
| Total Long Balls | `long_passes` | 71–58 | GOLD_LOCKED |
| Accurate Long Balls | `accurate_long_passes` | 28–24 | GOLD_LOCKED |
| Inaccurate Long Balls | `inaccurate_long_passes` | 43–34 | GOLD_LOCKED |

Checksums: 28+43=71; 24+34=58.

## Through Ball family

Canonical predicate: Gold statistical pass + `Throughball` qualifier.

| Metric | Key | Forest–Leeds | Status |
|---|---|---:|---|
| Through Balls | `through_balls` | 2–0 | GOLD_LOCKED |
| Successful Through Balls | `through_balls_success` | 1–0 | DERIVED_FROM_GOLD_COMPONENTS |
| Unsuccessful Through Balls | `through_balls_unsuccess` | 1–0 | DERIVED_FROM_GOLD_COMPONENTS |

## Penalty-box pass family

Canonical opposition penalty-area geometry matches PitchLab touch geometry:

```text
83 <= endX <= 100
21.1 <= endY <= 78.9
```

The population is restricted to Gold statistical passes.

| Metric | Key | Forest–Leeds raw reconstruction | Status |
|---|---|---:|---|
| Passes Into Penalty Box | `box_passes` | 22–15 | AUTHORITATIVE_DEFINITION_PENDING_GOLD_CONTROL |
| Successful Passes Into Penalty Box | `box_passes_success` | 9–3 | AUTHORITATIVE_DEFINITION_PENDING_GOLD_CONTROL |
| Unsuccessful Passes Into Penalty Box | `box_passes_unsuccess` | 13–12 | AUTHORITATIVE_DEFINITION_PENDING_GOLD_CONTROL |

Checksums: Forest 9+13=22; Leeds 3+12=15.

The 22–15 total happens to equal the trusted Penalty Box Touches control for this fixture; that coincidence is not used as validation because touches and passes are different metric families.

## Progressive Pass

PitchLab's authoritative definition is:

```text
Completed Gold statistical pass
AND start x >= 33.333333
AND finishes at least 25% closer to centre of opposition goal
```

Physical distance:

```text
startDistance = hypot((100-x)*1.05, (50-y)*0.68)
endDistance   = hypot((100-endX)*1.05, (50-endY)*0.68)
progressive   = endDistance <= startDistance * 0.75
```

Forest–Leeds reconstruction: Forest 27, Leeds 8. Status remains `AUTHORITATIVE_DEFINITION_PENDING_GOLD_CONTROL`; the old absolute 9.144m rule is retired.

## Cross family ownership

Cross metrics use their dedicated canonical modules and are not forced through the Gold statistical-pass population because Cross is intentionally excluded from headline passes.

Secured controls include Total Crosses 19–8, Accurate Crosses 4–3, Inaccurate Crosses 15–5, Set-Play Cross success 1–1 and Set-Play Cross unsuccessful 5–2. Open-play Cross variants are derived from the secured cross components and keep their dedicated ownership.

## Retired metrics

The following remain retired and must never be resurrected or aliased:

- `into_final_third`
- `into_final_third_success`

`Final Third Entries` is a distinct Gold metric.

## Canonical load path

```text
ui-passing-metrics-golden.js
ui-metric-bible-sync.js
ui-gold-passing-family.js
ui-forward-pass-definition.js
ui-long-pass-definition.js
ui-through-ball-definition.js
ui-progressive-pass-definition.js
ui-penalty-box-pass-definition.js
```

All consumer surfaces resolve canonical Metric Bible definitions before legacy FILTERS.

## Closure conclusion

The Passing family is definition-complete. There are no unresolved semantic collisions between headline Forward and the separate directional taxonomy, no retired final-third pass metrics have been restored, and every active passing metric has a canonical owner and evidence status.

Remaining evidence debt is limited to obtaining independent numerical controls for the already-authoritative Progressive Pass and Penalty-box Pass definitions. Those controls may upgrade status later but do not require another metric-definition redesign.
