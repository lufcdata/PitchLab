# PitchLab Metric Catalogue & Synchronization Audit

Created: 2026-08-27  
Updated: 2026-08-28

## Preservation rule

The current Match Controls catalogue is a protected product surface.

- Do not remove, rename, hide or merge exposed metrics without explicit approval.
- Do not replace a working definition merely to simplify code.
- Golden event metrics should have one authoritative definition shared by Pitch Events, Match Stats and Metric Leaders where those surfaces are applicable.
- Team-only sequence metrics remain Match Stats-only.
- Legacy implementations may be retired only after equivalent canonical ownership is verified on every permitted surface.
- Existing **Possession Lost** is protected and must remain independent from **Dispossessed** and **Turnovers**.
- Retired `into_final_third` and `into_final_third_success` stay retired.

## Runtime architecture

The selector/runtime is assembled from base `index.html` definitions plus layered modules including `ui-extra-metrics.js`, the Carry engine, Golden sequence/possession modules, the Metric Bible synchronization layer, family-specific canonical definition modules, `ui-match-stats.js`, Match Stats synchronization, Metric Leaders and selector synchronization.

This layering means an early legacy `FILTERS` predicate can survive even when a later canonical module owns the actual metric. Cleanup must therefore be ownership-based and non-semantic.

## Secured controls and definitions

### Passing

Gold controls include Total Passes 411–326, Successful 321–232, Unsuccessful 90–94, Accuracy 78.1–71.2, Final Third Passes 110–92, Successful Final Third Passes 72–38, Forward Passes 244–211, Backward Passes 69–49, Long Balls 71–58 and Through Balls 2–0. Successful Forward and Successful Backward are derived from the Gold directional family; successful backward is 65–44.

Progressive Passes and Penalty-Box Passes have explicit spatial definitions but retain independent-control evidence debt.

### Touch / attacking / restart

Gold controls include Touches 617–500, Penalty Box Touches 22–15, Take-Ons 22–12, Crosses 19–8, Accurate Crosses 4–3, Inaccurate Crosses 15–5, Throw-In outcomes 21–6 / 4–6, Goal Kicks 6–10, validated shot/goal families, Chances Created, Big Chances, Big Chances Created and Assists.

### Defensive / duel

Gold controls include Ball Recoveries 47–43, Tackles 15–29, Tackles Won 8–19, Tackles Lost 7–10, Interceptions 2–15, Clearances 32–31, Dispossessed 9–3, Errors 1–0, Aerial Duels 55–55, Aerial Duels Won 30–25, Aerial Duels Lost 25–30, Blocks 13–8, Blocked Shots 6–1 and Blocked Crosses 7–7.

The former provisional ground-duel residual has now been corrected using the independent Forest–Leeds control **Ground Duels Won 31/72–41/72**. Canonical Ground Duels Lost is the losing-side partner population: `Challenge + unsuccessful TakeOn + unsuccessful non-aerial Foul + Dispossessed only when paired at the same provider clock/period with an opponent Tackle`.

Closed controls/statuses:

- Ground Duels Won **31–41** — `GOLD_LOCKED`
- Ground Duels Lost **41–31** — `DERIVED_FROM_GOLD_COMPONENTS`
- Total Ground Duels **72–72** — `GOLD_LOCKED`
- Duels Won **61–66** — `DERIVED_FROM_GOLD_COMPONENTS`
- Duels Lost **66–61** — `DERIVED_FROM_GOLD_COMPONENTS`
- Total Duels **127–127** — `DERIVED_FROM_GOLD_COMPONENTS`

The previous provisional values `34–28`, `65–69`, `59–58` and `120–124` are retired and must not be restored.

A second published Bournemouth–Leeds control reports Duels Won **48–64** and Aerial Duels Won **22–28**, implying Ground Duels Won **26–36**, Total Ground Duels **62–62** and Total Duels **112–112** under the same one-winner/one-loser duel structure.

**Blocked Passes 7–5** remains the only defensive residual in this set with explicit raw ownership but no independent headline control.

### Corners

Corner outcomes are Gold: total 3–2, successful 1–1, unsuccessful 2–1. The existing PitchLab Short / Near / Central / Far / Overhit delivery classes are intentionally preserved as spatial PitchLab definitions and must not be removed or replaced by provider `Zone=Center`.

### Carry family

The six signed-off Carry metrics remain owned by the shared carry engine and are closed. Do not rebuild them during synchronization cleanup.

### Team-only sequence family

Gold: Possession 56.3–43.7, PPDA 12.9–8.8, 10+ Pass Sequences 6–7, Pressed Sequences 2–16, High Turnovers 4–8 and Shot-Ending High Turnovers 1–1. High Turnovers remain possession-sequence calculations rather than ordinary event predicates.

### Penalty Area Entries

`GOLD_LOCKED` at **Forest 36–21 Leeds**. Definition: every Pass attempt starting outside the opposition penalty area and ending inside it, regardless of pass outcome. This is a separate metric from Penalty Box Touches 22–15 and both must remain available.

### Possession Lost / Dispossessed / Turnovers

They are independent metrics:

1. **Possession Lost** — protected existing working metric; untouched.
2. **Dispossessed** — Gold, raw `Dispossessed`, 9–3.
3. **Turnovers** — trusted Forest–Leeds full-match control 14–13; raw-reconciled from the marker-69 unsuccessful-BallTouch family with general duplicate-chain suppression. Second raw fixture Bournemouth–Leeds independently confirms that marker 69 maps exclusively to unsuccessful `BallTouch` there too (23/23; observed 16–7), while the unchanged duplicate detector suppresses zero Bournemouth candidates. Because no trusted Bournemouth headline Turnovers control is currently available, Turnovers remains provisional rather than Gold.

Forest–Leeds strict provider-period first half is 12–8. A nominal first-half UI window can show 12–9 because ordinary `minute` resets at the second half and the current shared time-window filter can leak the SecondHalf 45:48 Leeds event. That is a period-filter engineering bug, not a Turnovers semantic rule.

## Retired metrics

`into_final_third` and `into_final_third_success` are retired. They must not be resurrected by catalogue synchronization or legacy fallback cleanup.

## Remaining synchronization work

1. Preserve the visible catalogue while removing stale fallback ownership only after canonical coverage is proven.
2. Inspect `ui-extra-metrics.js` specifically for stale High Turnovers and defensive/duel predicates. High Turnovers' authoritative sequence implementation must remain intact.
3. Keep `ui-team-metric-bible.js` aligned with real calculator ownership; do not add registry keys pointing at nonexistent calculator functions.
4. Fix period/time-window filtering as a separate engineering change using provider-period / expanded-time semantics, then regression-test first-half, second-half and arbitrary time windows.
5. Run final Pitch Events / Metric Leaders / Match Stats synchronization checks before merge.
6. Do not promote evidence-debt metrics to Gold without the missing controls.

## Current audit position

Penalty Area Entries and the ground/total-duel family are closed. The duel correction is semantic and evidence-backed, not fixture-specific: only `Dispossessed` events paired to an opposition Tackle are added to the losing ground-duel population, while standalone Dispossessed remains independent. Turnovers' event family and Forest–Leeds full-match reconstruction are strongly resolved, with independent second-fixture raw-family validation; only the missing independent headline control and the documented first-half provenance issue prevent Gold promotion. The remaining work is principally integration/ownership cleanup, period-filter regression and explicit evidence debt for metrics such as Blocked Passes — not a broad metric-definition rebuild.
