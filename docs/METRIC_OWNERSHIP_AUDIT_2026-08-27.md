# PitchLab Metric Ownership Audit — 2026-08-27

This audit records which runtime owns each validated metric family and how Pitch Events, Metric Leaders and Match Stats consume it. It is deliberately non-destructive: no metric definition is changed by this document.

## Synchronization rules

1. A Gold event metric should have one authoritative event predicate.
2. Pitch Events and Metric Leaders should consume that predicate through the Gold Metric Bible.
3. Match Stats should consume the same predicate or a shared family calculator; it must not silently maintain a second definition.
4. Team-only metrics must remain Match Stats-only.
5. Retired metrics must not reappear through base HTML, legacy FILTERS, selector reconstruction or Match Stats patching.
6. No fixture-specific +1/-1 correction is permitted.

## Current consumer architecture

### Pitch Events

The pitch renderer is still driven by `FILTERS`, but canonical Bible metrics install accessor-backed compatibility filters. Later Gold families extend the Bible and set compatibility FILTERS keys. This means canonical registry ownership can coexist with the legacy renderer while migration continues.

### Metric Leaders

`ui-leaders.js` prefers `PitchLabMetricBible.playerRows()` whenever the Bible is present. `playerRows()` uses canonical definitions for canonical keys and falls back to `FILTERS` only for unmigrated metrics. Carry metrics use the shared Carry engine.

**Finding:** Metric Leaders is already structurally close to the desired architecture. For migrated event metrics, it does not need its own independent calculation.

### Match Stats

`ui-match-stats.js` still contains a mixture of local calculators and FILTER-backed rows. `ui-match-stats-sync-v1.js` then patches a growing set of Gold/Bible rows from the shared Bible. This remains the largest source of duplicate ownership.

**Finding:** do not remove the base Match Stats calculators in one refactor. Retire them family-by-family only after the Bible-backed replacement is confirmed in the live UI.

## Gold / canonical event ownership

| Metric | Stable key | Authoritative owner | Pitch Events | Leaders | Match Stats | Status |
|---|---|---|---|---|---|---|
| Touches | `touches` | `ui-metric-bible-sync.js` | Bible compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Penalty Box Touches | `touch_box` | `ui-metric-bible-sync.js` | Bible compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Shots | `shots` | `ui-metric-bible-sync.js` | Bible compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Shots On-Target | `shots_on` | `ui-metric-bible-sync.js` | Bible compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Shots Off-Target | `shots_off` | `ui-metric-bible-sync.js` | Bible compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Blocked Shots | `shots_blocked` | `ui-metric-bible-sync.js` | Bible compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Woodwork Shots | `woodwork` | `ui-metric-bible-sync.js` | Bible compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Shots - Open Play | `shots_open` | `ui-metric-bible-sync.js` | Bible compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Shots - Fast Break | `shots_fastbreak` | `ui-metric-bible-sync.js` | Bible compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Shots from Set-Pieces | `shots_setpiece` | `ui-metric-bible-sync.js` | Bible compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Shots - From Free-Kicks | `shots_dfk` | `ui-metric-bible-sync.js` | Bible compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Shots - 6 Yard Box | `shots_6yd` | `ui-metric-bible-sync.js` | Bible compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Shots - Penalty Box | `shots_box` | `ui-metric-bible-sync.js` | Bible compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Shots - Penalty Area | `shots_penalty_area` | `ui-metric-bible-sync.js` | Bible compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Shots - Outside Box | `shots_outside` | `ui-metric-bible-sync.js` | Bible compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Shots - Right Foot | `shots_right` | `ui-metric-bible-sync.js` | Bible compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Shots - Left Foot | `shots_left` | `ui-metric-bible-sync.js` | Bible compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Shots - Head | `shots_head` | `ui-metric-bible-sync.js` | Bible compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Shots - Other | `shots_other` | `ui-metric-bible-sync.js` | Bible compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Headed set-piece shots | `shots_head_setpiece` | `ui-metric-bible-sync.js` | Bible compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Big Chances | `big_chances` | `ui-gold-attacking-family.js` | Gold compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Big Chances Created | `big_chances_created` | `ui-gold-attacking-family.js` | Gold compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Chances Created | `chances_created` | `ui-gold-attacking-family.js` | Gold compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Assists | `assists` | `ui-gold-attacking-family.js` | Gold compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Headed Clearances | `headed_clearances` | `ui-gold-attacking-family.js` | Gold compatibility filter | Bible `playerRows()` | Bible sync | GOLD |
| Final Third Entries | `final_third_entries` | `ui-final-third-entries-gold.js` | Gold compatibility filter | Bible `playerRows()` | Bible sync | GOLD |

## Gold event metrics not yet fully centralized

The following validated metrics still retain legacy or family-specific ownership and should be migrated carefully rather than rewritten:

| Metric / family | Current authoritative logic | Main synchronization risk |
|---|---|---|
| Ball Recoveries | `ui-golden-metrics-v2.js` / FILTERS bridge | Match Stats still has separate patch ownership |
| Tackles Won | `ui-golden-metrics-v2.js` / FILTERS bridge | Match Stats duplicate path |
| Ground Duels Won | `ui-golden-metrics-v2.js` / FILTERS bridge | Match Stats duplicate path |
| Aerial Duels Won | `ui-golden-metrics-v2.js` / FILTERS bridge | Match Stats duplicate path |
| Fouls | Golden V2 plus Bible `fouls_committed` | Duplicate naming/ownership must be collapsed carefully |
| Goal Kicks | Bible helper definition | Not yet marked as a canonical `eventDef` |
| Corners / set-play crosses / crosses | Bible helper definitions | Definitions are shared via FILTERS, but not all are canonical-locked |
| Passing family | `ui-passing-metrics-golden.js` | Match Stats still mixes local/filter calculations |
| Carry family | `ui-carry-metrics.js` | Strong shared engine; avoid unnecessary migration |
| High Turnovers | `ui-golden-metrics-v2.js` possession engine | Sequence metric, not a simple event predicate |
| Shot-Ending High Turnovers | Golden V2 possession engine | Sequence dependency must remain intact |

## Team-only Gold metrics

`ui-team-metric-bible.js` correctly declares these as Match Stats-only:

| Metric | Bible key | Match Stats calculator key | Pitch Events | Leaders |
|---|---|---|---|---|
| Possession | `possession` | `possession` | No | No |
| PPDA | `ppda` | `ppda_custom` | No | No |
| 10+ Pass Sequences | `ten_pass_sequences` | `ten_pass_sequences_custom` | No | No |
| Pressed Sequences | `pressed_sequences` | `pressed_sequences_custom` | No | No |

These must never be injected into Pitch Events or Metric Leaders merely to make the catalogue uniform.

## Retirement audit — Passes Into Final Third

The user explicitly retired:

- `into_final_third` — Passes Into Final Third
- `into_final_third_success` — Successful Passes Into Final Third

`ui-final-third-entries-gold.js` now deletes both legacy FILTERS and removes both selector options. `ui-match-stats-sync-v1.js` also removes any legacy Match Stats rows with these labels. The surviving Gold metric is `final_third_entries`.

**Remaining technical debt:** the base `index.html` and base Match Stats source still contain legacy declarations. Runtime cleanup prevents them being exposed, but a later low-risk cleanup should delete those dead declarations at source once the synchronization branch is regression-checked. This is cleanup only; it must not alter the Final Third Entries definition.

## Next migration order

1. **Goal Kicks + Fouls/Fouled + Corners/Crosses** — simple event predicates already represented in the Bible; promote to canonical event definitions and remove duplicate Match Stats ownership only after regression checks.
2. **Recovery and duel family** — migrate the already locked Golden V2 predicates into canonical Bible ownership without changing their predicates.
3. **Passing family** — centralize the already validated statistical-pass definitions; preserve Total Passes, Successful Passes, Pass Accuracy, Final Third Passes and Successful Final Third Passes controls.
4. **Sequence metrics** — leave High Turnovers and Shot-Ending High Turnovers until ordinary event metrics are stable.
5. **Penalty Area Entries / Turnovers-Loss of Possession** — remain out of scope until the synchronization pass is complete.

## Regression controls that must not change

Primary Forest–Leeds controls remain the baseline, with Bournemouth–Leeds providing the second fixture for the new attacking family and Final Third Entries. Any migration that changes a locked control must be rejected unless the metric definition itself is deliberately reopened for forensic validation.
