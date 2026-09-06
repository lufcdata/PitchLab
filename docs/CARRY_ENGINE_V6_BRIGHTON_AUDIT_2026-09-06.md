# Carry Engine V6 — Brighton v Leeds forensic audit

Date: 2026-09-06
Fixture: Brighton 1–1 Leeds, WhoScored match 1983572
Audit player: Gabriel Gudmundsson (`playerId=330549`, Leeds `teamId=19`)
Status: research/audit only — do not treat as merged production definition.

## Protected rule

The existing 5.0 metre minimum carry movement remains locked. Tests against the Nottingham Forest–Leeds Gold control show that lowering the global threshold contaminates the validated population:

- 5.0m baseline: 177 carries
- 4.5m: 191 carries
- 4.0m: 216 carries
- 3.5m: 241 carries

A reception-only 4.0m tolerance also changes many Forest player rows and is rejected.

## Current V5 Gudmundsson population — 7 carries

| # | Start | End | Start event | End event | Distance | Forward | Progressive? |
|---|---|---|---|---|---:|---:|---|
| 1 | 20:53 | 21:01 | teammate pass reception | Pass | 19.8m | +17.4m | yes |
| 2 | 29:42 | 29:47 | teammate pass reception | TakeOn | 12.5m | +12.5m | yes |
| 3 | 46:04 | 46:04 | BallRecovery | TakeOn | 10.8m | +10.3m | yes |
| 4 | 46:04 | 46:06 | TakeOn | Pass | 8.0m | +7.2m | yes |
| 5 | 51:50 | 51:54 | teammate pass reception | Pass | 10.1m | +9.6m | yes |
| 6 | 57:34 | 57:37 | BallRecovery | Dispossessed | 26.3m | +24.7m | yes |
| 7 | 93:11 | 93:14 | BallRecovery | Pass | 12.8m | +12.8m | yes |

V5 Gudmundsson totals: 7 carries, ~100.3m carrying distance, 7 progressive carries, ~94.5m net forward carry distance.

## Legitimate >=5m V6 candidates

### 28:53 → 28:56 — recovery ending in a foul

- `eventId 188`: Gudmundsson BallRecovery at `(6.7,93.6)`
- `eventId 189`: Gudmundsson successful Foul/being fouled at `(25.6,98.0)`
- movement: ~20.1m
- forward movement: ~+19.8m
- progressive under the existing >=5m forward rule: **yes**

V5 rejects this solely because of the blanket `acquisition -> foul` suppression. Audit candidate: retain suppression only for immediate defensive-foul companions; allow a defensive acquisition to terminate in a foul when at least two seconds of controlled movement have elapsed.

Forest Gold regression result for this rule: **177 carries, zero player-row differences** across count, carrying distance, progressive count and net forward distance.

### 86:54/56 → 86:57 — loose touch followed by delayed recovery marker and foul

Raw sequence:

- 86:54 Brighton unsuccessful BallTouch at `(83.4,14.6)`
- normalised into Leeds attacking frame: `(16.6,85.4)`
- 86:56 Gudmundsson BallRecovery at `(13.8,92.0)`
- 86:57 Gudmundsson successful Foul/being fouled at `(13.8,93.9)`

The delayed BallRecovery marker alone makes the movement only ~1.3m. Using the immediately preceding opposition unsuccessful loose touch as the possession-acquisition origin gives ~6.5m of movement.

- total movement: ~6.5m
- forward movement: ~-2.9m
- progressive: **no**

Audit candidate: for a successful foul endpoint, permit an immediately preceding same-player BallRecovery to act as delayed confirmation of possession when it is preceded within four seconds by an opposition unsuccessful BallTouch, with no intervening established opponent control or teammate possession. Normalise the opposition loose-touch coordinate into the carrier team's frame.

Forest Gold regression result for the combined delayed-loose-touch + two-second defensive-foul candidate: **177 carries, zero player-row differences** across count, carrying distance, progressive count and net forward distance.

## SofaScore 11-arrow reconciliation

Pixel/coordinate matching of the supplied SofaScore carry map gives a strong 10+1 pattern:

- 7 arrows correspond to the existing V5 PitchLab carries above.
- 1 arrow corresponds to 9:37 → 9:41.
- 1 arrow corresponds to 28:53 → 28:56.
- 1 arrow corresponds to 86:54/56 → 86:57.
- 1 remaining arrow is the very long diagonal trajectory.

### 9:37 → 9:41 is below the protected PitchLab threshold

- teammate pass endpoint / reception: approximately `(95.3,76.8)`
- Gudmundsson Pass at 9:41: `(97.5,71.8)`
- calibrated movement: ~4.1m

SofaScore appears to count this movement, but it is below PitchLab's protected 5.0m carry minimum. It must not be admitted by lowering the global threshold.

### Very long SofaScore diagonal — suspicious/unverified

The long diagonal has no plausible chronological Gudmundsson movement in the WhoScored sequence within the carry time window. Its displayed geometry numerically resembles coordinates belonging to different raw passages / paired opposition-coordinate representations. It should therefore be treated as **suspicious and unverified**, not used as evidence to manufacture a PitchLab carry.

Do not claim the SofaScore arrow is definitively wrong unless an independent SofaScore event payload or other authoritative source confirms its underlying start/end coordinates.

## Provisional V6 Gudmundsson result

If both >=5m reconstruction candidates are accepted:

- Carries: **7 -> 9**
- Carrying distance: **~100.3m -> ~126.9m**
- Progressive Carries: **7 -> 8**
- Net forward carry distance under the existing engine: **~94.5m -> ~111.4m**

The 9:37 movement remains excluded at ~4.1m. The long SofaScore diagonal remains unverified and excluded.

## Golden rule

Do not target SofaScore's count of 11. The objective is one general carry definition applied to authoritative event populations. Any V6 change must preserve the Forest Gold control across the entire carry family, not merely total carries.
