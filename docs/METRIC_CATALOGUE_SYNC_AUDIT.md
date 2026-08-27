# PitchLab Metric Catalogue & Synchronization Audit

Created: 2026-08-27

## Preservation rule

The current Match Controls metric catalogue is a protected product surface. During synchronization cleanup:

- Do **not** remove, rename, hide or merge any currently exposed metric without explicit approval.
- Do **not** replace a working metric definition merely to simplify code.
- Golden metrics must have one authoritative calculation path shared by Pitch Events, Match Stats and Metric Leaders.
- Legacy implementations may be retired only after their visible metric has been mapped to an equivalent authoritative definition.
- Penalty Area Entries and Turnovers / Loss of Possession remain under audit and must not be forced.

## Why this audit is required

The selector and metric engine are currently assembled from multiple runtime sources:

1. `index.html` — base metric catalogue and legacy `FILTERS`.
2. `ui-extra-metrics.js` — additional attacking, set-piece, passing, defensive and duel metrics, plus some `FILTERS` overrides.
3. `ui-carry-metrics.js` — six Carry Family metrics.
4. `ui-passing-metrics-golden.js` — Golden statistical-pass family overrides.
5. `ui-golden-metrics-v2.js` — Golden recovery/duel/final-third/high-turnover definitions plus Match Stats patching.
6. `ui-possession-golden.js` — Golden Possession calculation plus Match Stats patching.
7. `ui-sequence-metrics.js` — Golden 10+ Pass Sequences calculation plus Match Stats patching.
8. `ui-touch-metrics-fix.js` + `ui-forest-touch-map.js` — touch filtering / Forest validation fixture touch flags.
9. `ui-metric-bible-sync.js` — shared Metric Bible definitions and helpers.
10. `ui-match-stats.js` + `ui-match-stats-sync-v1.js` — Match Stats rendering and Bible synchronization.
11. `ui-leaders.js` — Metric Leaders consumer.

This means a metric can currently exist in the selector, be overridden later by another script, and still have a separate Match Stats patcher. The cleanup goal is to preserve the catalogue while eliminating ambiguous ownership.

## Protected visible catalogue — base metrics

### Passing

- `successful` — Successful Passes
- `unsuccessful` — Unsuccessful Passes
- `allpasses` — Total Passes
- `progressive` — Open-Play Progressive Passes
- `forward` — Forward Passes
- `forward_success` — Successful Forward Passes
- `side` — Side Passes
- `side_success` — Successful Side Passes
- `backward` — Backward Passes
- `backward_success` — Successful Backward Passes
- `into_final_third` — Passes into Final Third
- `into_final_third_success` — Successful Passes into Final Third
- `final_third_passes` — Final Third Passes
- `final_third_passes_success` — Successful Final Third Passes
- `box_passes` — Passes in Penalty Box
- `box_passes_success` — Successful Passes in Penalty Box
- `crosses` — Crosses
- `accurate_crosses` — Accurate Crosses
- `open_play_crosses` — Open-Play Crosses
- `accurate_open_play_crosses` — Accurate Open-Play Crosses
- `long_passes` — Long Passes
- `accurate_long_passes` — Accurate Long Passes

### Throw-Ins

- `throwins_success` — Successful Throw-Ins
- `throwins_unsuccess` — Unsuccessful Throw-Ins
- `throwins_success_final_third` — Successful Final Third Throw-Ins
- `throwins_success_box` — Successful Throw-Ins Into Penalty Box
- `throwins_box` — Throw-Ins Into Penalty Box

### Touches

- `touches` — Touches
- `touch_def_third` — Defensive-Third Touches
- `touch_mid_third` — Middle-Third Touches
- `touch_final_third` — Final-Third Touches
- `touch_box` — Penalty Box Touches

### Attacking

- `shots` — Shots
- `shots_on` — Shots On-Target
- `shots_off` — Shots Off-Target
- `shots_blocked` — Blocked Shots
- `woodwork` — Shots / Woodwork
- `shots_open` — Shots - Open Play
- `shots_fastbreak` — Shots - Fast Break
- `shots_setpiece` — Shots from Set-Pieces
- `shots_dfk` — Shots - Direct Free-Kick
- `shots_6yd` — Shots - 6 Yard Box
- `shots_box` — Shots - Penalty Area
- `shots_outside` — Shots - Outside Box
- `shots_right` — Shots - Right Foot
- `shots_left` — Shots - Left Foot
- `shots_head` — Shots - Head / Headed Shots
- `shots_other` — Shots - Other
- `goals` — Goals
- `goals_open` — Goals - Open Play
- `goals_fastbreak` — Goals - Fastbreak
- `goals_setpiece` — Goals - Set Pieces
- `goals_corner` — Goals - Corners
- `goals_freekick` — Goals - Free-Kicks
- `goals_penalty` — Goals - Penalties
- `own_goals` — Goals - Own Goals
- `goals_6yd` — Goals - 6-yard Box
- `goals_box` — Goals - Penalty Area
- `goals_outside` — Goals - Outside Box
- `goals_right` — Goals - Right Foot
- `goals_left` — Goals - Left Foot
- `goals_head` — Goals - Head
- `goals_other` — Goals - Other Body Part
- `takeons` — Total Take-Ons
- `takeons_success` — Successful Take-Ons
- `takeons_unsuccess` — Unsuccessful Take-Ons
- `chances_created` — Chances Created
- `assists` — Assists
- `bigchances` — Big Chances Created

`keypasses` remains a legacy internal binding but is intentionally removed from the current visible selector by `ui-extra-metrics.js`; it is not part of the protected visible catalogue unless deliberately restored.

### Corners

- `corners` — Corners
- `corners_success` — Successful Corners
- `corners_unsuccess` — Unsuccessful Corners
- `corners_short` — Short Corners
- `corners_near` — Near Post Corners
- `corners_central` — Central Corners
- `corners_far` — Far Post Corners
- `corners_overhit` — Overhit Corners
- `corners_6yd` — Corners - 6 Yard Box
- `corner_chances` — Corner - Chances Created

### Defensive

- `tackles` — Tackles
- `tackles_won` — Tackles Won
- `tackles_lost` — Tackles Lost
- `interceptions` — Interceptions
- `blocks` — Blocks
- `recoveries` — Ball Recoveries
- `clearances` — Clearances
- `headed_clearances` — Headed Clearances
- `dribbled_past` — Dribbled Past

## Protected visible catalogue — runtime additions

### Added by `ui-extra-metrics.js`

- `shots_head_setpiece` — Shots - Head from set-pieces
- `assists_corners` — Assists - From corners
- `assists_setpieces` — Assists - From set-pieces
- `high_turnovers` — High Turnovers
- `free_kicks` — Free-Kicks
- `free_kicks_accurate` — Accurate Free-Kicks
- `free_kicks_final_third` — Free-Kicks In the Final Third
- `inaccurate_crosses` — Inaccurate Crosses
- `inaccurate_long_passes` — Inaccurate Long Passes
- `blocked_passes` — Blocked Passes
- `blocked_crosses` — Blocked Crosses
- `errors` — Errors
- `duels_won` — Duels Won
- `duels_lost` — Duels Lost
- `total_duels` — Total Duels
- `ground_duels_won` — Ground Duels Won
- `ground_duels_lost` — Ground Duels Lost
- `aerial_duels_won` — Aerial Duels Won
- `aerial_duels_lost` — Aerial Duels Lost
- `def_aerial_duels_won` — Defensive Aerial Duels Won
- `def_aerial_duels_lost` — Defensive Aerial Duels Lost
- `att_aerial_duels_won` — Attacking Aerial Duels Won
- `att_aerial_duels_lost` — Attacking Aerial Duels Lost
- `dispossessed` — Dispossessed

### Added by Carry Family

- `carries_custom` — Carries
- `carrying_distance_custom` — Carrying Distance (m)
- `avg_carrying_distance_custom` — Avg Carrying Distance (m)
- `progressive_carries_custom` — Progressive Carries
- `progressive_carrying_distance_custom` — Progressive Carrying Distance (m)
- `avg_progressive_carrying_distance_custom` — Avg Progressive Carrying Distance (m)

### Added by Metric Bible synchronization

- `goal_kicks` — Goal Kicks
- `set_play_crosses_success` — Successful Set Play Crosses
- `set_play_crosses_unsuccess` — Unsuccessful Set Play Crosses
- `fouls_committed` — Fouls
- `fouled` — Fouled

## Current Golden controls that must survive cleanup

Forest 0-1 Leeds (`1983552`) controls currently documented/locked include:

- Ball Recoveries 47-43
- Tackles Won 8-19
- Interceptions 2-15
- Goal Kicks 6-10
- Ground Duels Won 31-41
- Aerial Duels Won 30-25
- Fouls 15-14
- Fouled 14-15
- Final Third Entries 60-63
- High Turnovers 4-8
- Shot-Ending High Turnovers 1-1
- Possession 56.3%-43.7%
- PPDA 12.9-8.8
- 10+ Pass Sequences 6-7
- Touches 617-500
- Penalty Box Touches 22-15
- Total Passes 411-326
- Successful Passes 321-232
- Pass Accuracy 78.1%-71.2%
- Final Third Passes 110-92
- Successful Final Third Passes 72-38
- Shots Off-Target 8-2
- Blocked Shots 2-6
- Shots Inside Box 6-6
- Shots Outside Box 6-5
- Shots From Set-Pieces 8-7
- Set-Piece Goals 0-1
- Headed Shots 5-3
- Woodwork Shots 1-0
- Throw Ins 25-12
- Clearances 32-31
- Successful Take-Ons 10-7
- Dispossessed 9-3
- Corners 3-2
- Successful Set Play Crosses 1-1
- Unsuccessful Set Play Crosses 5-2
- Accurate Crosses 4-3
- Inaccurate Crosses 15-5
- Total Crosses 19-8

## Unresolved / deliberately excluded from synchronization changes

- Penalty Area Entries — control 36-21 supplied; raw-event definition still to be audited.
- Turnovers / Loss of Possession — control 16-13 supplied; definition still to be audited.

## Synchronization status — initial findings

| Family | Pitch Events source | Match Stats source | Metric Leaders source | Initial status |
|---|---|---|---|---|
| Base legacy metrics | `index.html` FILTERS | `ui-match-stats.js` | FILTERS / Leaders | Needs inventory |
| Golden pass family | `ui-passing-metrics-golden.js` overrides FILTERS | base Match Stats consuming filters for many rows | FILTERS | Partially centralized |
| Carry family | `ui-carry-metrics.js` | dedicated Carry summary | shared player summaries | Strong shared engine |
| Recovery / duel / final-third Golden V2 | `ui-golden-metrics-v2.js` overrides FILTERS | separate Golden V2 patch loop | FILTERS | Duplicate Match Stats path — cleanup candidate |
| Possession | separate `ui-possession-golden.js` engine | separate patch loop | not yet unified through Bible | Duplicate path — cleanup candidate |
| 10+ Pass Sequences | `ui-sequence-metrics.js` engine | separate patch loop | not standard FILTERS metric | Dedicated sequence engine; preserve |
| Touch family | base FILTERS + touch-fix + Forest fixture touch-map + Bible | Bible sync patch | Bible/FILTERS | Multiple layers; audit required before changes |
| Clarified shot/foul/corner/cross metrics | Metric Bible | `ui-match-stats-sync-v1.js` | Bible/FILTERS | New shared path; preserve |

## Required next steps

1. Enumerate every visible runtime selector option and compare it with this protected catalogue.
2. Build a metric-key ownership table: base / extra / Golden engine / Metric Bible.
3. Verify which Match Stats rows are independently calculated instead of consuming the authoritative engine.
4. Verify Metric Leaders uses the same source for every Golden metric.
5. Add missing recently validated metrics to any surface where they are absent — without deleting existing metrics.
6. Only after the map is complete, retire redundant patchers one family at a time with regression checks.
7. Do not begin Penalty Area Entries or Turnovers until this synchronization pass is stable.
