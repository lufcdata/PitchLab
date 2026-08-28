# Defensive + duel closure — 2026-08-28

This note closes the **definition audit** for the defensive and duel families on `metric-sync-audit-2026-08-27`. It preserves previously signed-off Gold definitions and records the independent control that corrected the former provisional ground/total-duel residuals.

## Forest 0–1 Leeds (`whoscored:1983552`)

### Defensive family

| Metric | Authoritative definition | Forest | Leeds | Status |
|---|---|---:|---:|---|
| Tackles Won | `Tackle` | 8 | 19 | `GOLD_LOCKED` |
| Tackles Lost | `Challenge` | 7 | 10 | `GOLD_LOCKED` |
| Tackles | `Tackle OR Challenge` | 15 | 29 | `GOLD_LOCKED` |
| Clearances | `Clearance AND NOT BlockedCross` | 32 | 31 | `GOLD_LOCKED` |
| Blocked Shots | `Save + OutfielderBlock` | 6 | 1 | `GOLD_LOCKED` |
| Blocked Crosses | `BlockedPass OR (Clearance + BlockedCross)` | 7 | 7 | `GOLD_LOCKED` |
| Blocks | Blocked Shots OR Blocked Crosses | 13 | 8 | `GOLD_LOCKED` |
| Blocked Passes | raw `BlockedPass` subtype | 7 | 5 | `RAW_RECONCILED_PENDING_HEADLINE_CONTROL` |
| Dispossessed | `Dispossessed` | 9 | 3 | `GOLD_LOCKED` |
| Errors | `Error` | 1 | 0 | `GOLD_LOCKED` |

The corrected trusted Opta Clearances control is **32–31**, not 32–21. Raw Clearance is 32–33; Leeds has two `Clearance + BlockedCross` events, producing 32–31 after the semantic exclusion. The supplied Bournemouth–Leeds Clearances control is **24–62** and remains a second-fixture validation target.

`BlockedPass` remains a distinct raw event population. It must not be promoted merely because those events participate in the Gold Blocked Crosses reconstruction.

### Aerial duel family

Canonical aerial population is `Aerial` plus `Foul + AerialFoul`. Provider `Offensive` / `Defensive` qualifiers define the attacking/defensive split; pitch x-coordinate is not used as a substitute.

| Metric | Forest | Leeds | Status |
|---|---:|---:|---|
| Aerial Duels Won | 30 | 25 | `GOLD_LOCKED` |
| Aerial Duels Lost | 25 | 30 | `GOLD_LOCKED` |
| Total Aerial Duels | 55 | 55 | `GOLD_LOCKED` |
| Attacking Aerial Duels | 27 | 28 | `GOLD_LOCKED` |
| Defensive Aerial Duels | 28 | 27 | `GOLD_LOCKED` |
| Attacking Aerial Won / Lost | 13 / 14 | 11 / 17 | `DERIVED_FROM_GOLD_COMPONENTS` |
| Defensive Aerial Won / Lost | 17 / 11 | 14 / 13 | `DERIVED_FROM_GOLD_COMPONENTS` |

### Ground and total duel family — corrected control

The signed-off Ground Duels Won population remains unchanged:

`Tackle OR successful TakeOn OR successful non-aerial Foul`

It remains **31 Forest – 41 Leeds**.

An independent 365Scores match control displays Ground Duels Won as **31/72 Forest** and **41/72 Leeds**. This disproves the earlier provisional 65–69 Ground Duel total and closes the authoritative team total at **72–72**.

The losing-side event attribution is the exact partner population of those wins:

`Challenge OR unsuccessful TakeOn OR unsuccessful non-aerial Foul OR tackle-paired Dispossessed`

A `Dispossessed` event is included only when it shares the provider clock and period with an opposition `Tackle`. Standalone `Dispossessed` remains the independent Dispossessed metric and is not silently added to duel losses.

This relationship explains the former residual precisely:

- Forest: provisional 34 losses + **7 tackle-paired Dispossessed** = **41**.
- Leeds: provisional 28 losses + **3 tackle-paired Dispossessed** = **31**.
- The two other Forest `Dispossessed` events are standalone and are not Ground Duel losses.

| Metric | Forest | Leeds | Status |
|---|---:|---:|---|
| Ground Duels Won | 31 | 41 | `GOLD_LOCKED` |
| Ground Duels Lost | 41 | 31 | `DERIVED_FROM_GOLD_COMPONENTS` |
| Total Ground Duels | 72 | 72 | `GOLD_LOCKED` |
| Duels Won | 61 | 66 | `DERIVED_FROM_GOLD_COMPONENTS` |
| Duels Lost | 66 | 61 | `DERIVED_FROM_GOLD_COMPONENTS` |
| Total Duels | 127 | 127 | `DERIVED_FROM_GOLD_COMPONENTS` |

Total Duels is now definition-closed rather than provisional: Gold Total Ground Duels **72–72** plus Gold Total Aerial Duels **55–55** gives **127–127**. Duels Lost is the corresponding remainder against Duels Won **61–66**, giving **66–61**.

### Second-fixture control — Bournemouth 2–2 Leeds (`whoscored:1903384`)

Independent published figures report **Duels Won 48–64** and **Aerial Duels Won 22–28**. Therefore Ground Duels Won is **26–36**. Because each ground duel has one winner and one loser, that independently implies:

- Ground Duels Lost: **36–26**
- Total Ground Duels: **62–62**
- Total Aerial Duels: **50–50**
- Total Duels: **112–112**

This second fixture supports the same symmetric duel structure; no fixture-specific correction is used by the implementation.

## Runtime ownership

`ui-extra-metrics.js` still loads before the canonical modules and contains legacy fallback duel predicates. The later canonical `ui-defensive-residual-definition.js` overwrites those keys at runtime. The canonical module is authoritative; removal of the old fallbacks remains a separate non-semantic cleanup task.

The corrected canonical implementation is `DEFENSIVE_RESIDUAL_V8_2026-08-28`.

## Closure decision

The ground/total-duel evidence debt is now closed:

- **Total Ground Duels 72–72: GOLD_LOCKED**
- **Ground Duels Lost 41–31: DERIVED_FROM_GOLD_COMPONENTS** with event-level losing-player attribution
- **Total Duels 127–127: DERIVED_FROM_GOLD_COMPONENTS**
- **Duels Lost 66–61: DERIVED_FROM_GOLD_COMPONENTS**

The only metric from this residual set still awaiting an independent headline control is **Blocked Passes 7–5**.

Do not restore the former `34–28`, `65–69`, `59–58` or `120–124` values. Do not count every `Dispossessed` as a duel loss. Do not introduce fixture-specific exceptions.
