# PitchLab Metric Closure Review — 2026-08-28

Purpose: final closure ledger for the metric synchronization audit. Current `main` remains untouched; this document describes the audit branch only.

## Rules

- One metric -> one authoritative definition -> all permitted surfaces.
- Trusted controls and raw events outrank assumptions.
- No fixture-specific correction factors or event IDs.
- `GOLD_LOCKED` requires a trusted numerical control or equivalent signed-off evidence.
- `DERIVED_FROM_GOLD_COMPONENTS` is allowed only for exact compositions of Gold components.
- Evidence-debt metrics remain visibly provisional.
- Team-only metrics remain Match Stats-only.
- Retired `into_final_third` and `into_final_third_success` stay retired.
- Existing standalone **Possession Lost** is protected and is not a parent/category for Dispossessed or Turnovers.

## Closed / secured families

### Passing

Gold: Total Passes 411–326; Successful 321–232; Unsuccessful 90–94; Pass Accuracy 78.1–71.2; Final Third Passes 110–92; Successful Final Third Passes 72–38; Forward Passes 244–211; Backward Passes 69–49; Long Balls 71–58; Accurate Long Balls 28–24; Inaccurate Long Balls 43–34; Through Balls 2–0.

Derived from the Gold directional family: Successful Forward Passes and Successful Backward Passes. Correct Forest–Leeds successful-backward reconstruction is **65–44**.

Evidence debt only: Progressive Passes 27–8 and Penalty-Box Passes 22–15 (successful 9–3, unsuccessful 13–12) retain their explicit spatial definitions pending independent headline controls.

### Cross / throw-in / restart

Gold: Crosses 19–8; Accurate 4–3; Inaccurate 15–5; Successful Set-Play Crosses 1–1; Unsuccessful Set-Play Crosses 5–2; Successful Throw-Ins 21–6; Unsuccessful Throw-Ins 4–6; Goal Kicks 6–10.

Open-play cross variants are exact derived remainders. Throw-in spatial variants remain raw-reconciled pending independent controls. Free-kick family has an explicit raw definition (`Pass + FreekickTaken`, excluding corners, throw-ins, goal kicks and penalties) and remains pending controls.

### Touch / attacking / goal

Gold: Touches 617–500; Penalty Box Touches 22–15; Take-Ons 22–12 / successful 10–7 / unsuccessful 12–5; shot family; Big Chances; Big Chances Created; Chances Created; Assists; goal family and validated body-part/location/phase families.

Territorial touch buckets are exact derived partitions of Gold Touches.

### Corner family

Gold outcome family: Corners 3–2; Successful 1–1; Unsuccessful 2–1.

The established PitchLab spatial delivery classes **Short / Near / Central / Far / Overhit** are preserved as `PITCHLAB_DERIVED_SPATIAL_DEFINITION`; they are not replaced by provider `Zone=Center`. 6-yard corners, corner chances and corner assists remain pending independent controls.

### Defensive / duel family

Gold: Ball Recoveries 47–43; Tackles 15–29; Tackles Won 8–19; Tackles Lost 7–10; Interceptions 2–15; Clearances 32–31; Dispossessed 9–3; Errors 1–0; Aerial Duels 55–55; Aerial Duels Won 30–25; Aerial Duels Lost 25–30; Attacking Aerial Duels 27–28; Defensive Aerial Duels 28–27; Blocked Shots 6–1; Blocked Crosses 7–7; Blocks 13–8.

Attacking/defensive aerial won/lost splits are derived from Gold components. Ground Duels Lost 34–28, Total Ground Duels 65–69, Duels Lost 59–58, Total Duels 120–124 and Blocked Passes 7–5 have explicit raw definitions but await independent headline controls.

Clearances are `Clearance && !BlockedCross`. Blocks are the exact union of Gold Blocked Shots (`Save + OutfielderBlock`) and Gold Blocked Crosses (`BlockedPass OR Clearance+BlockedCross`).

### Carry family

Closed and preserved. Carries, Carrying Distance, Avg Carrying Distance, Progressive Carries, Progressive Carrying Distance and Avg Progressive Carrying Distance use the signed-off shared carry engine: >=5m same-player movement on 105×68m geometry, forward-x >=5m for progressive carries, with established continuity/OffsideGiven handling. Do not rebuild this family.

### Sequence / team-only family

Gold: Possession 56.3–43.7; PPDA 12.9–8.8; 10+ Pass Sequences 6–7; Pressed Sequences 2–16; High Turnovers 4–8; Shot-Ending High Turnovers 1–1.

High Turnovers and Shot-Ending High Turnovers remain sequence-engine metrics; they must not be simplified into ordinary event predicates.

### Penalty Area Entries

`GOLD_LOCKED` — Forest **36–21** Leeds. Authoritative definition: **all Pass attempts**, regardless of outcome, starting outside the opposition penalty area and ending inside it. This is separate from Penalty Box Touches 22–15 and must coexist with that metric in Match Stats.

### Possession Lost / Dispossessed / Turnovers

These are three independent metrics.

- **Possession Lost** — existing working metric; protected and untouched by this audit.
- **Dispossessed** — `GOLD_LOCKED`, raw `Dispossessed`, Forest 9–3 Leeds; provider-period first half 4–3.
- **Turnovers** — definition strongly raw-reconciled but not Gold. Forest–Leeds marker-69 unsuccessful `BallTouch` base is 16–13; two general possession-chain duplicate suppressions give the trusted full-match **14–13** exactly. Bournemouth–Leeds independently reproduces the marker-69 family: 23/23 marker-69 events are unsuccessful `BallTouch`, observed 16–7, and the unchanged duplicate detector suppresses zero events there. No trusted Bournemouth headline Turnovers control is currently available, so 16–7 is validation evidence, not a Gold control.

Forest–Leeds provider-period first-half Turnovers are **12–8**. The trusted/displayed 12–9 can be produced by the separate elapsed-minute period-window contamination that includes Leeds' SecondHalf 45:48 event. That UI bug must not become part of the metric definition.

## Remaining evidence / engineering debt

The semantic audit is now largely closed. Remaining work is deliberately narrow:

1. Turnovers: obtain an independent trusted headline control if possible before `GOLD_LOCKED`; retain the documented first-half provenance distinction.
2. Fix the shared period-window contamination separately, using provider-period / expanded-time semantics and regression-testing all affected metrics.
3. Remove stale runtime fallback ownership only where a later canonical module is proven to cover every user-facing surface; especially inspect `ui-extra-metrics.js` High Turnovers and defensive/duel fallbacks without changing semantics.
4. Resolve independent headline-control debt for Progressive Passes, Penalty-Box Passes, throw-in spatial variants, free-kick variants, corner residuals, ground/total duel residuals and Blocked Passes.
5. Run a final surface/load-order regression before any merge to `main`.

## Closure condition

A user-facing metric must be `GOLD_LOCKED`, `DERIVED_FROM_GOLD_COMPONENTS`, explicitly provisional with its evidence debt documented, a protected pre-existing metric, or deliberately retired. No metric is considered authoritative merely because a legacy `FILTERS` predicate still exists.
