# PitchLab Passing Synchronization Audit — 2026-08-28

## Purpose

This audit records the current passing-family state on `metric-sync-audit-2026-08-27` after forensic reconciliation against Forest 0–1 Leeds raw WhoScored/Opta events and trusted controls.

## Governing rule

A metric is Gold-locked only when its event predicate is reconciled to a trusted control. Raw-derived observations remain explicitly provisional where no independent control exists. No fixture-specific correction factors are permitted.

## Authoritative statistical-pass population

The Golden passing engine remains `ui-passing-metrics-golden.js`.

```text
Pass
AND NOT Cross
AND NOT ThrowIn
AND NOT KeeperThrow
```

Forest–Leeds statistical-pass totals are Forest 411, Leeds 326.

## Canonical passing metrics

| Metric | Stable key | Forest–Leeds control | Status |
|---|---|---:|---|
| Total Passes | `allpasses` | 411–326 | GOLD_LOCKED |
| Successful Passes | `successful` | 321–232 | GOLD_LOCKED |
| Unsuccessful Passes | `unsuccessful` | 90–94 | GOLD_LOCKED |
| Final Third Passes | `final_third_passes` | 110–92 | GOLD_LOCKED |
| Successful Final Third Passes | `final_third_passes_success` | 72–38 | GOLD_LOCKED |
| Forward Passes | `forward` | 244–211 | GOLD_LOCKED |
| Total Long Balls | `long_passes` | 71–58 | GOLD_LOCKED |
| Accurate Long Balls | `accurate_long_passes` | 28–24 | GOLD_LOCKED |
| Inaccurate Long Balls | `inaccurate_long_passes` | 43–34 | GOLD_LOCKED |

Pass Accuracy is derived for Match Stats: 321/411 = 78.1%, 232/326 = 71.2%.

## Forward Pass — headline Opta metric

Trusted headline controls:

```text
Forward Passes: Forest 244, Leeds 211
Forward Pass %: Forest 59.4%, Leeds 64.7%
```

The percentages independently validate the population and denominator:

```text
244 / 411 = 59.37% -> 59.4%
211 / 326 = 64.72% -> 64.7%
```

Exact raw reconstruction:

```text
Gold statistical pass
AND endX > x
```

This is the broad forward half-plane / positive longitudinal movement definition. It is owned by `ui-forward-pass-definition.js` and is `GOLD_LOCKED`.

Applying successful outcome to this headline population gives the reproducible raw observation:

```text
Successful Forward Passes: Forest 164, Leeds 126
```

This is **not** Gold-locked because an independent Successful Forward Pass control has not been recovered.

## Separate four-way BBC/Opta directional presentation

BBC/in-depth reporting also exposes a distinct four-way directional distribution:

```text
Forest: Forward 149, Backward 69, Left 91, Right 102 = 411
Leeds:  Forward 135, Backward 49, Left 67, Right 75 = 326
```

These reconcile to the supplied percentages:

```text
Forest: Forward 36.3%, Backward 16.8%, Left 22.1%, Right 24.8%
Leeds:  Forward 41.4%, Backward 15.0%, Left 20.6%, Right 23.0%
```

The exact raw reconstruction uses full-precision coordinates on a 105m x 68m pitch:

```text
dx = (endX - x) * 1.05
dy = (endY - y) * 0.68
angle = atan2(dy, dx)

Forward:  -45 degrees <= angle < 45 degrees
Left:      45 degrees <= angle < 135 degrees
Backward: angle >= 135 degrees OR angle < -135 degrees
Right:     otherwise
```

This yields 149/69/91/102 and 135/49/67/75 exactly.

WhoScored qualifier 213 (`Angle`) is geometrically consistent but rounded; full-precision coordinates are required around sector boundaries.

### Important semantic separation

The four-way Forward value 149–135 is **not** PitchLab's headline Forward Pass metric. The headline control is 244–211 and is independently corroborated by 59.4%–64.7%.

The four-way Backward value 69–49 is strong forensic evidence but remains `DEFINITION_UNDER_INVESTIGATION` as a PitchLab headline metric until the intended provider/product semantic family is secured.

Applying successful outcome to the provisional four-way Backward population gives:

```text
Successful Backward Passes: Forest 60, Leeds 42
```

This remains an observation only. Do not Gold-lock it without an independent control and resolution of the parent Backward semantic family.

## Long Ball family — fully reconciled

Trusted controls:

```text
Total Long Balls:      Forest 71, Leeds 58
Accurate Long Balls:   Forest 28, Leeds 24
Inaccurate Long Balls: Forest 43, Leeds 34
```

Raw forensic reconstruction found all Pass events carrying the `Longball` qualifier at 90–67. Applying the established Gold statistical-pass exclusions reduces this exactly to the trusted 71–58 population.

Canonical definitions:

```text
Total Long Ball = Gold statistical pass + Longball qualifier
Accurate Long Ball = Total Long Ball + successful outcome
Inaccurate Long Ball = Total Long Ball + unsuccessful outcome
```

The successful split reconstructs the independently supplied 28–24 control exactly. The unsuccessful split is 43–34 and reconciles both directly from raw outcomes and arithmetically from total minus accurate.

All three Long Ball metrics are `GOLD_LOCKED` in `ui-long-pass-definition.js` and routed through Pitch Events, Metric Leaders and Match Stats.

## Progressive Pass

Authoritative definition:

```text
Completed statistical pass
AND start x >= 33.333333
AND end distance to centre of opposition goal <= 75% of start distance
```

Physical-pitch calculation:

```text
startDistance = hypot((100 - x) * 1.05, (50 - y) * 0.68)
endDistance   = hypot((100 - endX) * 1.05, (50 - endY) * 0.68)
progressive   = endDistance <= startDistance * 0.75
```

The old absolute 9.144m-gain rule is retired. The current definition remains pending a trusted numerical control and must not be Gold-locked yet.

Forest–Leeds raw observation under the authoritative definition is Forest 27, Leeds 8. This is not a trusted control.

## Current canonical load path

```text
ui-passing-metrics-golden.js
        |
        v
ui-metric-bible-sync.js
        |
        +--> ui-gold-passing-family.js
        +--> ui-forward-pass-definition.js
        +--> ui-long-pass-definition.js
        +--> ui-progressive-pass-definition.js
        v
PitchLabMetricBible.canonicalRegistry
        |
        +--> Pitch Events compatibility FILTERS
        +--> Metric Leaders
        +--> Match Stats
```

Canonical registry definitions take precedence over legacy FILTERS for metric consumers.

## Directional family status

### Gold-locked

- `forward` — 244–211; broad positive longitudinal movement (`endX > x`)

### Raw reconciled / pending control

- `forward_success` — 164–126

### Definition under investigation

- `backward` — four-way compass candidate 69–49
- `backward_success` — provisional raw observation 60–42
- `side`
- `side_success`

The four-way 149–135 Forward field is retained as forensic evidence for a separate directional-distribution family and must not overwrite `forward`.

## Passing metrics not yet approved for Gold

- `progressive` — authoritative definition, trusted numerical control pending
- `forward_success` — raw 164–126, independent control pending
- `backward` — semantic family unresolved
- `backward_success` — raw 60–42, parent unresolved and independent control pending
- `side`
- `side_success`
- `box_passes`
- `box_passes_success`
- `open_play_crosses`
- `accurate_open_play_crosses`

Cross-family metrics already canonicalized elsewhere retain their existing ownership.

## Retired metrics — remain retired

- `into_final_third`
- `into_final_third_success`

`Final Third Entries` remains a separate Gold metric and must never be aliased to the retired pass metrics.

## Recommended next passing work

1. Validate Total Long Balls on a second raw fixture; Bournemouth 2–2 Leeds has an external 62–49 control available for testing.
2. Seek a trusted Progressive Pass control and test the authoritative 25%-closer definition.
3. Keep Successful Forward 164–126 and Successful Backward 60–42 provisional until independent controls exist.
4. Resolve whether 69–49 should become a product-facing four-way Backward metric or remain separate from PitchLab headline directional metrics.
5. Investigate other qualifier-led passing metrics such as Through Balls, where Opta explicitly records a pass qualifier and raw reconstruction can be audited cleanly.
6. Keep retired final-third metrics absent.

## Safety conclusion

The current branch distinguishes two different directional presentations rather than forcing them into one definition. Headline Forward Passes are secured at 244–211; the separate four-way Forward/Backward distribution is preserved for forensic analysis. The Long Ball family is fully reconciled and Gold-locked at 71–58 total, 28–24 accurate and 43–34 inaccurate. Successful directional metrics remain deliberately provisional where trusted controls are absent.