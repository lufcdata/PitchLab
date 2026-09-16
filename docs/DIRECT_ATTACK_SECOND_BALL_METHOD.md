# Direct attack and second-ball method

Status: attack progression speed is descriptive; progressive-pass distance reuses the existing Gold predicate; second-ball chains are provisional pending event/video validation.

## External reference points

- Wyscout defines an aerial duel as opposing players jumping to compete for the ball and awards the duel to the player who touches it first, irrespective of what happens next: <https://dataglossary.wyscout.com/aerial_duel/>
- Wyscout defines a loose-ball duel as a contest when neither team has clear possession: <https://dataglossary.wyscout.com/loose_ball_duel/>
- Wyscout defines a long pass as a ground pass over 45m or a high pass over 25m: <https://dataglossary.wyscout.com/long_pass/>
- Wyscout's public progressive-pass definition measures how much closer a pass moves the ball to goal, with thresholds determined by its start and end territory: <https://dataglossary.wyscout.com/progressive_pass/>
- Wyscout records a recovery where the new possession begins, rather than where the preceding loss began: <https://dataglossary.wyscout.com/recovery/>

These are conceptual references, not imported Wyscout event labels. PitchLab continues to calculate from its WhoScored/Opta-derived event packs and its existing canonical engines.

## PitchLab measures

### Attack progression speed

For every Leeds canonical pass sequence containing at least two passes:

`(last pass endX - first pass startX) × 1.05 / elapsed event seconds`

Only positive net progression over at least two seconds is included. The report shows the median in metres per second and the count at or above a descriptive 2.0m/s threshold. This is event-derived progression speed, not ball speed, sprint speed or tracking-derived direct speed.

### Gold progressive-pass distance

Eligible passes are selected only by `PitchLabPassingGolden.progressivePass`. For each eligible pass, distance gained is the reduction in Euclidean distance to the centre of the opposition goal on the calibrated 105m × 68m pitch. The report shows total and median goal-distance gain. It does not introduce a second progressive-pass definition.

### Provisional second-ball chain

An opportunity requires all of the following:

1. A pass with the pack's `Longball` qualifier and either restart/height evidence (`GoalKick`, `GoalKickTaken`, `FreekickTaken` or `Chipped`) or at least 25 percentage points of forward travel.
2. An `Aerial` event within eight seconds and 22 metres of the launch endpoint.
3. A successful controlled event within five seconds of the aerial event. Controlled events are passes, touches, take-ons, goalkeeper collections, recoveries, interceptions, tackles or clearances.

The team making that first controlled event is credited with the second-ball win. The outcome of the aerial event alone is not used as the second-ball winner. This intentionally separates first contact from subsequent control.

For Leeds wins, the report records whether Leeds retained control for five seconds and, before the first observed opponent control within ten seconds, made a forward pass, reached the final third, or shot. Contest locations are displayed in the Leeds attacking direction by third and broad lane.

### Player leader attribution

- **Contested:** credited to the Leeds player in the paired aerial-duel event.
- **Won:** credited to the Leeds player making the first successful controlled event after the aerial duel.
- **Lost:** credited to the Leeds aerial contestant when the opponent makes the first successful controlled event.

The leaderboard follows the report's match selector, so it can be read for one fixture or collectively. The three player totals reconcile separately to attributed contests, Leeds controls and opponent controls; they should not be interpreted as aerial-duel win totals.

## Current validation sample

Across the five-match 2026/27 manifest on 16 September 2026, the implementation finds 100 provisional opportunities and 37 Leeds wins. These are implementation-control totals, not a claim that the definition is final. The individual chains should be checked against video or a trusted event viewer before the label is promoted beyond provisional.
