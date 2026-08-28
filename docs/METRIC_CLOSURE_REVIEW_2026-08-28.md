# PitchLab Metric Closure Review — 2026-08-28

Purpose: drive the remaining metric audit to completion without silently preserving conflicting legacy definitions. This is a live closure ledger, not permission to Gold-lock anything without evidence.

## Rules

- One metric -> one authoritative definition -> all permitted surfaces.
- Trusted controls and raw events outrank provider assumptions.
- No fixture-specific correction factors.
- `GOLD_LOCKED` requires a trusted numerical control or equivalent signed-off evidence.
- `DERIVED_FROM_GOLD_COMPONENTS` is permitted when the metric is an exact disjoint composition/subtraction of already Gold components.
- `RAW_RECONCILED_PENDING_HEADLINE_CONTROL` and `DEFINITION_UNDER_INVESTIGATION` stay visibly provisional.
- Team-only metrics remain Match Stats-only.
- Retired `into_final_third` and `into_final_third_success` remain retired.

## Closed / secured families

### Core passing

- Total Passes `allpasses` — GOLD_LOCKED — Forest 411, Leeds 326.
- Successful Passes `successful` — GOLD_LOCKED — 321, 232.
- Unsuccessful Passes `unsuccessful` — GOLD_LOCKED — 90, 94.
- Pass Accuracy `pass_accuracy` — GOLD_LOCKED derived Match Stats metric — 78.1%, 71.2%.
- Final Third Passes `final_third_passes` — GOLD_LOCKED — 110, 92.
- Successful Final Third Passes `final_third_passes_success` — GOLD_LOCKED — 72, 38.
- Forward Passes `forward` — GOLD_LOCKED — 244, 211; independently corroborated by 59.4%, 64.7%.
- Long Balls `long_passes` — GOLD_LOCKED — 71, 58.
- Accurate Long Balls `accurate_long_passes` — GOLD_LOCKED — 28, 24.
- Inaccurate Long Balls `inaccurate_long_passes` — GOLD_LOCKED — 43, 34.
- Through Balls `through_balls` — GOLD_LOCKED — 2, 0.

### Cross family

- Total Crosses `crosses` — GOLD_LOCKED — 19, 8.
- Accurate Crosses `accurate_crosses` — GOLD_LOCKED — 4, 3.
- Inaccurate Crosses `inaccurate_crosses` — GOLD_LOCKED — 15, 5.
- Successful Set Play Crosses `set_play_crosses_success` — GOLD_LOCKED — 1, 1.
- Unsuccessful Set Play Crosses `set_play_crosses_unsuccess` — GOLD_LOCKED — 5, 2.
- Open-Play Crosses `open_play_crosses` — DERIVED_FROM_GOLD_COMPONENTS — 13, 5.
- Accurate Open-Play Crosses `accurate_open_play_crosses` — DERIVED_FROM_GOLD_COMPONENTS — 3, 2.
- Inaccurate Open-Play Crosses `inaccurate_open_play_crosses` — DERIVED_FROM_GOLD_COMPONENTS — 10, 3.

The open-play family is an exact remainder of Gold Crosses after removing the Gold set-play cross population. Raw Forest-Leeds event reconstruction agrees exactly, but these are intentionally not relabelled `GOLD_LOCKED` without an independent headline control.

### Throw-in family

Forest-Leeds raw reconstruction exactly matches the embedded Opta team throw-in statistics:

- Total Throw-Ins — embedded control 25, 12.
- Successful Throw-Ins `throwins_success` — GOLD_LOCKED — 21, 6.
- Unsuccessful Throw-Ins `throwins_unsuccess` — GOLD_LOCKED — 4, 6.
- Successful Final Third Throw-Ins `throwins_success_final_third` — RAW_RECONCILED_PENDING_HEADLINE_CONTROL — 4, 3.
- Successful Throw-Ins Into Penalty Box `throwins_success_box` — RAW_RECONCILED_PENDING_HEADLINE_CONTROL — 1, 2.
- Throw-Ins Into Penalty Box `throwins_box` — RAW_RECONCILED_PENDING_HEADLINE_CONTROL — 5, 4.

The Gold throw-in outcome family uses `Pass + ThrowIn` with the event outcome. Spatial variants retain the existing end-location geometry but are not Gold-locked without independent controls.

### Touch / shot / attacking family

- Touches — GOLD_LOCKED — 617, 500.
- Defensive-Third Touches `touch_def_third` — DERIVED_FROM_GOLD_COMPONENTS — 238, 162.
- Middle-Third Touches `touch_mid_third` — DERIVED_FROM_GOLD_COMPONENTS — 252, 240.
- Final-Third Touches `touch_final_third` — DERIVED_FROM_GOLD_COMPONENTS — 127, 98.
- Penalty Box Touches — GOLD_LOCKED — 22, 15.

The three territorial touch buckets form an exact, non-overlapping partition of Gold Touches: Forest 238+252+127=617 and Leeds 162+240+98=500.

- Shot family in the Metric Bible — GOLD_LOCKED, including total, on-target, off-target, blocked, woodwork, phase/location/body-part subfamilies and headed set-piece shots.
- Big Chances — GOLD_LOCKED — Bournemouth-Leeds 4, 1.
- Big Chances Created — GOLD_LOCKED — Bournemouth-Leeds 4, 0.
- Chances Created — GOLD_LOCKED — Bournemouth-Leeds 14, 7; authoritative event predicate is the `KeyPass` qualifier, not the Gold statistical-pass subset.
- Assists — GOLD_LOCKED — Bournemouth-Leeds 2, 0.
- Headed Clearances — GOLD_LOCKED — Bournemouth-Leeds 10, 38.

### Take-On family

The Forest-Leeds raw `TakeOn` population exactly matches embedded Opta `dribblesAttempted`, `dribblesWon` and `dribblesLost` team stats:

- Total Take-Ons `takeons` — GOLD_LOCKED — 22, 12.
- Successful Take-Ons `takeons_success` — GOLD_LOCKED — 10, 7.
- Unsuccessful Take-Ons `takeons_unsuccess` — GOLD_LOCKED — 12, 5.

### Corner outcome family

Embedded Opta corner totals and raw `CornerTaken` events agree exactly:

- Corners `corners` — GOLD_LOCKED — 3, 2.
- Successful Corners `corners_success` — GOLD_LOCKED — 1, 1.
- Unsuccessful Corners `corners_unsuccess` — GOLD_LOCKED — 2, 1.

Corner delivery subtypes (short, near, central, far, overhit, 6-yard, chances created and corner assists) remain in the review queue because they require separate semantic/spatial validation; they are not implied by the outcome controls above.

### Defensive / duel / restart family

- Ball Recoveries — GOLD_LOCKED — 47, 43.
- Tackles Won — GOLD_LOCKED — 8, 19.
- Ground Duels Won — GOLD_LOCKED — 31, 41.
- Aerial Duels Won — GOLD_LOCKED — 30, 25.
- Duels Won — DERIVED_FROM_GOLD_COMPONENTS.
- Interceptions — GOLD_LOCKED — 2, 15.
- Goal Kicks — GOLD_LOCKED — 6, 10.
- Fouls — GOLD_LOCKED — 15, 14.
- Fouled — GOLD_LOCKED — 14, 15.
- Final Third Entries — GOLD_LOCKED — Forest-Leeds 60, 63; Bournemouth-Leeds 71, 53.

### Team-only Match Stats

- Possession — validated Forest-Leeds 56.3%, 43.7%; keep Match Stats-only.
- PPDA — GOLD_LOCKED — 12.9, 8.8.
- 10+ Pass Sequences — GOLD_LOCKED — 6, 7.
- Pressed Sequences — currently declared Gold in the team registry; provenance/control should be rechecked during the sequence-family pass before final closure.
- High Turnovers and Shot-Ending High Turnovers remain sequence-engine metrics and must not be simplified into ordinary event predicates.

## Intentionally unresolved / provisional

- Successful Forward Passes `forward_success` — RAW_RECONCILED_PENDING_HEADLINE_CONTROL — raw Forest 164, Leeds 126.
- Backward Passes `backward` — DEFINITION_UNDER_INVESTIGATION — 69, 49 is the separate four-way BBC/compass field and must not be silently promoted to the headline Opta family.
- Successful Backward Passes `backward_success` — DEFINITION_UNDER_INVESTIGATION — raw provisional 60, 42.
- Progressive Passes `progressive` — AUTHORITATIVE_DEFINITION_PENDING_GOLD_CONTROL — exact 25%-closer-to-goal rule implemented; raw Forest 27, Leeds 8.
- Successful Through Balls `through_balls_success` — RAW_RECONCILED_PENDING_HEADLINE_CONTROL — raw 1, 0.
- Throw-in spatial variants — raw reconciled as above, pending independent controls.
- Corner delivery/location variants — not yet closed.
- Penalty Area Entries — unresolved.
- Turnovers / Loss of Possession — unresolved.

## Remaining catalogue review queue

These are the families that still require an explicit current-code review before the metric audit can be declared complete. Existing definitions must be inspected first; no rebuilding from memory.

1. Goal family: total, open play, fast break, set piece, corner, free-kick, penalty, own goals, location and body-part variants.
2. Corner delivery family: short, near/central/far/overhit, 6-yard, chances created, assists from corners.
3. Free-kick family: total, accurate, final-third.
4. Defensive residuals: total/lost tackles, blocks, blocked passes, blocked crosses, clearances, errors.
5. Duel residuals: lost/total ground and aerial duels, attacking/defensive aerial splits, dispossessed.
6. Carry family: carries, progressive carries, carries into final third, average carry length and related spatial entries. Preserve the shared carry engine unless evidence requires a definition change.
7. Sequence family: High Turnovers, Shot-Ending High Turnovers, Pressed Sequences and any other sequence metrics. Preserve possession-chain logic.
8. Passing residuals: side passes / successful side passes, penalty-box passes, successful penalty-box passes, and any remaining non-retired selector metrics.
9. Unresolved Penalty Area Entries and Turnovers/Loss Possession last, because they currently lack a clean signed-off reconstruction.

## Closure condition

The audit is complete only when every user-facing metric is in one of these explicit states:

- `GOLD_LOCKED`
- `DERIVED_FROM_GOLD_COMPONENTS`
- deliberately retained provisional state with documented reason/control needed
- retired and removed from every user-facing surface

No metric should remain merely because a legacy `FILTERS` function happens to exist.
