# Nottingham Forest 0–1 Leeds — trusted match timing controls

Date recorded: 2026-08-28
Fixture: WhoScored match 1983552, Nottingham Forest 0–1 Leeds United
Status: TRUSTED_USER_CONTROL

## Authoritative headline timing values

- Match Duration: 100:15
- Allocated Time: 98:18
- Added Time: 10:15

These are trusted external controls supplied by the user and must not be replaced by values inferred from the raw WhoScored event clock.

## Important separation of timing concepts

PitchLab has two distinct timing domains:

1. **Metric/event clock** — used to decide whether an event belongs inside a selected time window. This must follow the event period plus event minute/second and remain period-aware so first-half stoppage time cannot collide with second-half 45:xx events.
2. **Match Timings analytics** — Match Duration, Allocated Time, Added Time, Ball In Play, Ball Out of Play, Game Stops, etc. These are provider/headline timing statistics and are not derivable by simply taking the final event timestamp.

The raw event clock and the headline Match Duration are therefore not interchangeable.

## Current event-clock evidence

For the Forest–Leeds raw event feed, the provider-period event endpoints are approximately:

- First-half event endpoint: 47:01
- Second-half football-clock endpoint: 93:20

These values define event-window boundaries only. They must **not** be surfaced as Match Duration.

## Arithmetic relationship in the trusted headline controls

- 100:15 − 90:00 = 10:15 total added time.
- 100:15 − 98:18 = 1:57.

The UI must preserve the supplied headline values exactly rather than force the event-window clock to reconcile with them.

## Regression requirement

For the Anton Stach goal at 87:07:

- 87:06: excluded from Pitch Events / Metric Leaders / Match Stats.
- 87:07: included on all relevant surfaces.

This event-level behaviour is independent of the headline Match Duration control of 100:15.
