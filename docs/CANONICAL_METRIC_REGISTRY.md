# PitchLab Canonical Metric Registry

Created: 2026-08-27

## Governing rule

Match Controls / Pitch Events is the master catalogue for event/player metrics.

Every migrated event metric has exactly one canonical definition in `ui-metric-bible-sync.js`. The same qualifying event set is consumed by:

1. Pitch Events / Match Controls — plot the canonical events.
2. Metric Leaders — group those canonical events by player.
3. Match Stats — group those canonical events by team.

No migrated event metric may have a second independent statistical definition in a downstream surface.

Team-derived metrics such as Possession, PPDA, 10+ Pass Sequences and Pressed Sequences are intentionally separate and may be Match Stats only.

## Canonical definition contract

Each canonical event metric stores together:

- stable metric key
- display label
- metric kind (`event`)
- allowed surfaces (`pitch`, `leaders`, `matchStats`)
- Forest-Leeds Golden control
- one event filter

The canonical registry takes precedence over legacy `FILTERS`. Migrated `FILTERS` keys are compatibility accessors backed by the canonical function; later attempts to overwrite those keys are ignored.

## First migrated family

The first canonical migration is the signed-off Touch + Shot family.

### Touches

- `touches` — Touches — Golden 617-500
- `touch_box` — Penalty Box Touches — Golden 22-15

### Shots

- `shots` — Shots — Golden 12-11
- `shots_on` — Shots On-Target — Golden 2-3
- `shots_off` — Shots Off-Target — Golden 8-2
- `shots_blocked` — Blocked Shots — Golden 2-6
- `woodwork` — Woodwork Shots — Golden 1-0
- `shots_open` — Shots - Open Play — Golden 4-4
- `shots_fastbreak` — Shots - Fast Break — Golden 0-0
- `shots_setpiece` — Shots from Set-Pieces — Golden 8-7
- `shots_dfk` — Shots - From Free-Kicks — Golden 1-2
- `shots_6yd` — Shots - 6 Yard Box — Golden 1-1
- `shots_box` — Shots - Penalty Box excluding six-yard box — Golden 5-5
- `shots_penalty_area` — Shots - Penalty Area including six-yard box — Golden 6-6
- `shots_outside` — Shots - Outside Box — Golden 6-5
- `shots_right` — Shots - Right Foot — Golden 6-5
- `shots_left` — Shots - Left Foot — Golden 1-3
- `shots_head` — Shots - Head — Golden 5-3
- `shots_other` — Shots - Other — Golden 0-0
- `shots_head_setpiece` — Shots - Head from set-pieces — Golden 5-3

## Shot-family validation invariants

Forest-Leeds full match:

- On-Target + Off-Target + Blocked = Total Shots
  - Forest: 2 + 8 + 2 = 12
  - Leeds: 3 + 2 + 6 = 11
- Penalty Area + Outside Box = Total Shots
  - Forest: 6 + 6 = 12
  - Leeds: 6 + 5 = 11
- Six-yard Box + Penalty Box = Penalty Area
  - Forest: 1 + 5 = 6
  - Leeds: 1 + 5 = 6
- Right Foot + Left Foot + Head + Other = Total Shots
  - Forest: 6 + 1 + 5 + 0 = 12
  - Leeds: 5 + 3 + 3 + 0 = 11
- Open Play + Set-Pieces = Total Shots
  - Forest: 4 + 8 = 12
  - Leeds: 4 + 7 = 11

## Migration procedure for every later family

1. Preserve every existing Match Controls option.
2. Review and approve the definition/control metric-by-metric.
3. Add the approved metrics to the canonical registry with scope and Golden control.
4. Back legacy `FILTERS` keys with the canonical definition.
5. Make Match Stats consume the canonical metric rather than calculate its own version.
6. Metric Leaders must use canonical `playerRows` for event metrics.
7. Verify Pitch Events plots the same canonical event set.
8. Only then retire or ignore the old duplicate implementation.
9. Do not migrate a metric marked FLAGGED / REVIEW LATER.

## Deliberately not migrated yet

All other metric families remain in their existing implementation until individually reviewed. This includes passing, goals, carries, crosses, duels, defensive metrics, corners, take-ons, and set-piece families.

Penalty Area Entries and Turnovers / Loss of Possession remain unresolved and must not be forced into the canonical registry until their definitions are approved.
