# Penalty Area Entries closure — 2026-08-28

## Trusted control

Nottingham Forest 0–1 Leeds United (`whoscored:1983552`):

- Nottingham Forest: **36 Penalty Area Entries**
- Leeds United: **21 Penalty Area Entries**

## Raw-event reconstruction

The control is reproduced exactly by a simple spatial pass-boundary rule:

> Count every `Pass` event whose start location is outside the opposition penalty area and whose end location is inside the opposition penalty area. Pass outcome is not part of the definition.

PitchLab uses the same 105m × 68m penalty-area geometry already established for Penalty Box Touches:

- attacking x threshold: `x >= ((105 - 16.5) / 105) * 100` = **84.285714...**
- y range: **21.1 to 78.9**

A pass qualifies when:

1. event type is `Pass`;
2. start coordinates are valid and are **not** inside the opposition penalty area;
3. end coordinates are valid and **are** inside the opposition penalty area;
4. both successful and unsuccessful pass outcomes count.

Raw reconstruction:

| Team | All qualifying entries | Successful | Unsuccessful |
|---|---:|---:|---:|
| Nottingham Forest | **36** | 13 | 23 |
| Leeds United | **21** | 6 | 15 |

The outcome split is useful evidence that this metric is an **entry-attempt / boundary-crossing metric**, not a successful-reception metric. Requiring a successful pass would produce only 13–6 and therefore cannot be the Opta definition represented by the trusted 36–21 control.

The qualifying population naturally includes open-play passes/crosses and pass-coded restarts when they cross the penalty-area boundary. No fixture-specific exclusions are required.

## Semantic separation

`Penalty Area Entries` is distinct from:

- `Penalty Box Touches` — touches occurring inside the box;
- `Passes in Penalty Box` — pass events whose relevant location is already inside the box;
- `Final Third Entries` — pass attempts crossing the final-third boundary;
- `Throw-Ins Into Penalty Box` — a specific restart subtype.

Do not merge or substitute these metrics.

## Canonical implementation

Authoritative module: `ui-penalty-area-entries-gold.js`

Stable metric key: `penalty_area_entries`

Allowed surfaces:

- Pitch Events
- Metric Leaders
- Match Stats

Status: **`GOLD_LOCKED`**

The trusted 36–21 control is matched exactly by the general raw-event rule with no correction factor.
