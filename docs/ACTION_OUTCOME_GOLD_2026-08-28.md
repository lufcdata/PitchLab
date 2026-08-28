# Successful / Unsuccessful Actions — Gold definition

Date: 2026-08-28

## Status

`Successful Actions` and `Unsuccessful Actions` are PitchLab-created metrics. They do not attempt to reproduce a provider headline metric and therefore have no external Opta/WhoScored benchmark. Their Gold authority is the signed-off PitchLab semantic definition plus raw-fixture reconciliation.

Both metrics are `GOLD_LOCKED` and available on:

- Pitch Events
- Metric Leaders
- Match Stats

Colours on Pitch Events:

- Successful Actions: `#43FAD5`
- Unsuccessful Actions: `#FF1C6B`

## Core invariant

Every genuine underlying player event is classified at most once as either `successful`, `unsuccessful`, or deliberately `ignore`.

Metric labels attached to the same underlying event are not additive. A successful pass that is also progressive, a chance created, a big chance created and an assist remains **one Successful Action**. A missed big chance remains **one Unsuccessful Action**, not an unsuccessful shot plus a second big-chance-missed action.

## Successful Actions

Successful includes:

- successful / accurate passes, crosses, long balls, throw-ins, corners and free-kicks
- successful ordinary `BallTouch`
- goals, except own goals
- successful take-ons / dribbles
- assists, chances created and big chances created as semantic labels on the underlying successful event
- progressive passes, which are already completion-only in the canonical progressive-pass definition
- fouled / foul won
- ball recoveries
- tackles won
- interceptions
- blocks / blocked passes
- clearances
- ground and aerial duels won
- shots on target, except a non-goal Big Chance because that is a missed big chance
- saves
- successful claims
- successful keeper pickups
- successful keeper sweeper actions
- successful punches
- successful shield-ball actions

## Unsuccessful Actions

Unsuccessful includes:

- unsuccessful / inaccurate passes, crosses, long balls, throw-ins, corners and free-kicks
- unsuccessful ordinary `BallTouch`
- unsuccessful take-ons / dribbles
- dribbled past / `Challenge`
- offsides, attributed only through `OffsideGiven`
- fouls committed
- dispossessed
- errors
- blocked shots
- shots off target
- woodwork shots
- any non-goal Big Chance, including a saved/on-target Big Chance, because it is a missed big chance
- own goals
- ground and aerial duels lost
- failed punches, claims, keeper pickups and keeper sweeper actions

## Explicit exclusions

The following do not count as player actions in this metric:

- `CornerAwarded`
- standalone Possession Lost metric
- `OffsidePass`
- `OffsideProvoked`
- cards
- substitutions
- formation records
- period Start / End records
- any record with no player attribution

Only `OffsideGiven` is charged as the unsuccessful offside action so one offside is not counted twice.

Possession Lost is protected and excluded because the underlying failed action is already classified. Dispossessed and turnover-type BallTouch events are likewise not added as duplicate metric labels; their underlying raw player event is classified once.

## Overlap precedence

The classifier uses semantic precedence where provider `outcomeType` conflicts with PitchLab meaning:

1. Own Goal -> Unsuccessful.
2. Any non-goal shot carrying `BigChance` -> Unsuccessful, even if technically on target.
3. MissedShots / ShotOnPost -> Unsuccessful.
4. SavedShot + Blocked / OutfielderBlock -> Unsuccessful.
5. Other SavedShot -> Successful shot on target.
6. IntentionalGoalAssist / BigChanceCreated / KeyPass -> Successful underlying action.
7. Gold defensive / duel semantics then apply.
8. Remaining direct action families use their explicit provider outcome.

## Raw fixture reconciliation

These are observed outputs of the signed-off classifier, not external controls.

### Nottingham Forest 0–1 Leeds (`whoscored:1983552`)

- Successful Actions: Forest **535**, Leeds **434**
- Unsuccessful Actions: Forest **207**, Leeds **190**

### Bournemouth 2–2 Leeds (`whoscored:1903384`)

- Successful Actions: Bournemouth **584**, Leeds **489**
- Unsuccessful Actions: Bournemouth **223**, Leeds **174**

The Bournemouth fixture contains an Own Goal and a saved/on-target `BigChance`, providing useful raw coverage of two important semantic-overlap cases.

## Canonical implementation

Authoritative implementation: `ui-action-outcome-definition.js`.

Canonical keys:

- `successful_actions`
- `unsuccessful_actions`

No separate additive sum of existing metric totals should be used to reconstruct either metric.