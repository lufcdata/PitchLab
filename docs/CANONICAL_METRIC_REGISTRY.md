# Gold Metric Bible

Created: 2026-08-27

## Governing rule

The **Gold Metric Bible** is PitchLab's single authoritative metric-governance system.

For event/player metrics, Match Controls / Pitch Events is the master catalogue. Every migrated event metric has exactly one canonical definition. The same qualifying event set is consumed by:

1. Pitch Events / Match Controls — plot the canonical events.
2. Metric Leaders — group those canonical events by player.
3. Match Stats — group those canonical events by team.

No Gold event metric may have a second independent statistical definition in a downstream surface.

Team Metrics are explicitly different: they describe team/match performance and are available in Match Stats only. They must not appear in Pitch Events / Match Controls or Metric Leaders.

## Gold definition contract

Every Gold metric must store or declare:

- stable metric key
- display label
- metric type (`event` or `team`)
- allowed surfaces
- Golden control where approved
- one authoritative event filter or team calculator reference
- Gold status

The canonical registry takes precedence over legacy `FILTERS` for migrated Event Metrics. Migrated `FILTERS` keys are compatibility accessors backed by the canonical function; later attempts to overwrite those keys are ignored.

## Gold Team Metrics — LOCKED

These four metrics are now explicitly classified as **TEAM METRIC** and **Match Stats only** in `ui-team-metric-bible.js`:

- `possession` — Possession — TEAM METRIC — Match Stats only
- `ppda` — PPDA — TEAM METRIC — Match Stats only — Golden Forest 12.9 / Leeds 8.8
- `ten_pass_sequences` — 10+ Pass Sequences — TEAM METRIC — Match Stats only — Golden Forest 6 / Leeds 7
- `pressed_sequences` — Pressed Sequences — TEAM METRIC — Match Stats only — Golden Forest 2 / Leeds 16

Possession retains its existing approved Match Stats calculation; its Team Metric classification/scope is locked here without replacing that calculator.

## First Gold Event migration family

The first canonical Event Metric migration is the signed-off Touch + Shot family.

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

- On-Target + Off-Target + Blocked = Total Shots: Forest 2 + 8 + 2 = 12; Leeds 3 + 2 + 6 = 11.
- Penalty Area + Outside Box = Total Shots: Forest 6 + 6 = 12; Leeds 6 + 5 = 11.
- Six-yard Box + Penalty Box = Penalty Area: Forest 1 + 5 = 6; Leeds 1 + 5 = 6.
- Right Foot + Left Foot + Head + Other = Total Shots: Forest 6 + 1 + 5 + 0 = 12; Leeds 5 + 3 + 3 + 0 = 11.
- Open Play + Set-Pieces = Total Shots: Forest 4 + 8 = 12; Leeds 4 + 7 = 11.

## Bournemouth-Leeds attacking/defensive validation fixture — APPROVED CONTROLS

Fixture: Bournemouth 2-2 Leeds, WhoScored match `1903384`.

These controls have been reconciled against the raw event payload. They are recorded here before runtime migration so that legacy naming can be untangled without changing the approved statistical meaning.

- **Big Chances** — Bournemouth 4 / Leeds 1 — shot-family events carrying `BigChance`.
- **Big Chances Created** — Bournemouth 4 / Leeds 0 — events carrying `BigChanceCreated`.
  - Bournemouth creators: Eli Junior Kroupi 1, Marcus Tavernier 1, Marcos Senesi 1, Tyler Adams 1.
- **Chances Created** — Bournemouth 14 / Leeds 7 — events carrying `KeyPass`.
- **Assists** — Bournemouth 2 / Leeds 0 — `IntentionalGoalAssist` control.
  - Bournemouth: Marcos Senesi 1, Tyler Adams 1.
- **Headed Clearances** — Bournemouth 10 / Leeds 38 — `Clearance` + `Head` (with the existing blocked-cross exclusion retained in the UI definition).

### Naming protection

`Big Chances` and `Big Chances Created` are separate Gold metrics and must never share one key or definition.

The legacy Pitch Events key `bigchances` currently tests `BigChanceCreated`; therefore it semantically represents **Big Chances Created**, not Big Chances. Do not silently reinterpret that key as Big Chances during migration. Introduce/retain distinct stable keys and migrate surfaces only after their labels and consumers are verified.

### Final-third protection

`Final Third Entries`, `Passes Into Final Third`, `Final Third Passes`, and `Successful Final Third Passes` remain distinct metrics. The Bournemouth-Leeds trusted controls currently include Final Third Entries 71-53 and Passes Into Final Third 67-53. Final Third Entries is a derived metric still under investigation and must not be equated to the simple pass boundary-crossing filter.

## Migration procedure for every later family

1. Preserve every existing Match Controls option.
2. Review and approve the definition/control metric-by-metric.
3. Explicitly classify the metric as EVENT METRIC or TEAM METRIC.
4. Add the approved metric to the Gold Metric Bible with scope and Golden control.
5. For Event Metrics, back legacy `FILTERS` keys with the Gold definition.
6. Make Match Stats consume the Gold metric rather than calculate an independent version.
7. Metric Leaders must use the Gold event set for Event Metrics.
8. Verify Pitch Events plots that same Gold event set.
9. TEAM METRICS must remain Match Stats only.
10. Only then retire or ignore the old duplicate implementation.
11. Do not migrate a metric marked FLAGGED / REVIEW LATER.

## Deliberately not migrated yet

All other metric families remain in their existing implementation until individually reviewed. This includes passing, goals, carries, crosses, duels, defensive metrics, corners, take-ons, and set-piece families.

Penalty Area Entries and Turnovers / Loss of Possession remain unresolved and must not be forced into the Gold Metric Bible until their definitions are approved.
