# Sequence family closure — 2026-08-28

This note closes the current sequence-metric definition audit on `metric-sync-audit-2026-08-27`. It preserves the already validated possession-chain engines rather than replacing them with ordinary event filters.

## Forest 0–1 Leeds (`whoscored:1983552`)

| Metric | Forest | Leeds | Status |
|---|---:|---:|---|
| PPDA | 12.9 | 8.8 | `GOLD_LOCKED` |
| 10+ Pass Sequences | 6 | 7 | `GOLD_LOCKED` |
| Pressed Sequences | 2 | 16 | `GOLD_LOCKED` |
| High Turnovers | 4 | 8 | `GOLD_LOCKED` |
| Shot-Ending High Turnovers | 1 | 1 | `GOLD_LOCKED` |

## High Turnovers

The authoritative implementation is the possession-switch engine in `ui-golden-metrics-v2.js`, not the older single-event approximation in `ui-extra-metrics.js`.

A High Turnover is an **open-play controlled possession switch** beginning no more than 40 metres from the opposition goal. On WhoScored's 0–100 x scale over a 105m pitch, the attacking threshold is `x >= 61.9048`.

The engine deliberately handles possession establishment rather than counting every defensive action in the zone. It:

- orders events chronologically;
- excludes restarts / restart-adjacent starts;
- recognises controlled possession from successful passes, recoveries, keeper pickups/claims and take-ons;
- admits tackles/interceptions only when subsequent event evidence establishes possession;
- handles same-timestamp paired `Tackle` / `Dispossessed` records without double counting;
- records only genuine team possession switches in the high zone.

Trusted Forest-Leeds control: **4–8**.

## Shot-Ending High Turnovers

This is a child sequence metric, not a shot qualifier and not an independent turnover event filter.

Starting from each Gold High Turnover, follow the same team's possession until a sequence boundary. It qualifies when that sequence reaches a shot (`Goal`, `MissedShots`, `SavedShot`, `ShotOnPost`) before a restart, foul, opposition re-establishment of possession, or equivalent sequence termination.

Trusted Forest-Leeds control: **1–1**.

## 10+ Pass Sequences

The dedicated engine in `ui-sequence-metrics.js` is authoritative. It counts pass attempts inside continuous team sequences and preserves the previously validated edge handling for incomplete administrative `OffsideGiven` records and short unsuccessful-pass/defensive-noise continuations.

Trusted Forest-Leeds control: **6–7**.

## Pressed Sequences

The Match Stats sequence calculator remains authoritative and is retained unchanged. It evaluates opposition possessions beginning deep, with at most three passes, and tests whether the possession is forced to finish within the defined deep-zone boundary while respecting restart and control boundaries.

Trusted Forest-Leeds control already carried by the team Metric Bible: **2–16**.

## PPDA

PPDA remains Match Stats-only and keeps its validated custom calculator. Trusted Forest-Leeds control: **12.9–8.8**.

## Runtime ownership finding

`ui-extra-metrics.js` still defines an older `highTurnover` predicate for the Pitch Events selector. That predicate is **not** the Gold sequence definition: it begins from individual `BallRecovery` / `Interception` / `Tackle` events and only looks a few events backwards. `ui-golden-metrics-v2.js` separately patches Match Stats with the audited possession-switch engine.

Therefore High Turnovers must be treated as a **team sequence metric / Match Stats metric**, consistent with the audit rules. The legacy Pitch Events `FILTERS.high_turnovers` ownership is stale and should be removed in the non-semantic fallback cleanup rather than promoted as canonical.

## Closure decision

The sequence-family semantic pass is closed:

- PPDA — Gold;
- 10+ Pass Sequences — Gold;
- Pressed Sequences — Gold;
- High Turnovers — Gold;
- Shot-Ending High Turnovers — Gold.

Do not simplify High Turnovers or Shot-Ending High Turnovers into ordinary event predicates. Any future refactor must preserve the validated possession-chain behaviour and controls above.
