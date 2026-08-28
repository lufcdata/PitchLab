# PitchLab Metric Closure Review — 2026-08-28

Purpose: final closure ledger for the metric synchronization audit. Current `main` remains untouched; this document describes the audit branch only.

## Rules
- One metric -> one authoritative definition -> all permitted surfaces.
- No fixture-specific corrections.
- Gold requires trusted numerical control or equivalent signed-off evidence.
- Team-only metrics remain Match Stats-only.
- Retired metrics must not reappear through legacy fallback.

## Closed / secured families

### Passing
Gold: Total Passes 411–326; Successful 321–232; Unsuccessful 90–94; Pass Accuracy 78.1–71.2; Final Third Passes 110–92; Successful Final Third Passes 72–38; Forward Passes 244–211; Backward Passes 69–49; Long Balls 71–58; Accurate Long Balls 28–24; Inaccurate Long Balls 43–34; Through Balls 2–0; **Progressive Passes 23–6**; **Passes Into Penalty Box 22–15**, Successful 9–3, Unsuccessful 13–12.

### Cross / throw-in / restart
Gold: Crosses 19–8; Accurate 4–3; Inaccurate 15–5; Successful Set-Play Crosses 1–1; Unsuccessful Set-Play Crosses 5–2; Successful Throw-Ins 21–6; Unsuccessful Throw-Ins 4–6; Goal Kicks 6–10; free-kick pass family.

Throw-in spatial family is closed as derivatives of the Gold throw-in population. `Successful Final Third Throw-Ins` is defined by throw origin in the attacking final third (`x >= 66.6667`), not destination: Forest–Leeds 6–2; Bournemouth–Leeds 4–3. `Throw-Ins Into Penalty Box`: Forest–Leeds 5–4; Bournemouth–Leeds 6–7. Successful subset: Forest–Leeds 1–2; Bournemouth–Leeds 0–3. These are `DERIVED_FROM_GOLD_COMPONENTS`; they are not labelled as Opta `Long Throw-Ins`, which require a separate minimum-length condition.

### Touch / attacking / goal
Gold: Touches 617–500; Penalty Box Touches 22–15; Take-Ons 22–12 / successful 10–7 / unsuccessful 12–5; shot family; Big Chances; Big Chances Created; Chances Created; Assists; goal family.

### Defensive / duel family
Gold: Ball Recoveries 47–43; Tackles 15–29; Tackles Won 8–19; Tackles Lost 7–10; Interceptions 2–15; Clearances 32–31; Dispossessed 9–3; **Turnovers 16–13**; Errors 1–0; Aerial Duels 55–55; Aerial Duels Won 30–25; Aerial Duels Lost 25–30; Total Ground Duels 72–72; Blocked Shots 6–1; Blocked Crosses 7–7; Blocks 13–8.

Ground Duels Won is 31–41. Ground Duels Lost is derived at 41–31. Duels Won is 61–66, Duels Lost 66–61 and Total Duels 127–127. Superseded residuals 34–28, 65–69, 59–58 and 120–124 are retired.

**Blocked Passes has been deliberately retired as a standalone metric by explicit user approval on 2026-08-28.** Raw `BlockedPass` remains an internal event primitive where required to reconstruct Gold metrics and must not appear as a standalone public metric.

### Carry family
Closed and preserved. Do not rebuild the shared carry engine.

### Sequence / team-only family
Gold: Possession 56.3–43.7; PPDA 12.9–8.8; 10+ Pass Sequences 6–7; Pressed Sequences 2–16; High Turnovers 4–8; Shot-Ending High Turnovers 1–1.

### Penalty Area Entries
`GOLD_LOCKED` — Forest **36–21** Leeds. All Pass attempts, regardless of outcome, starting outside the opposition penalty area and ending inside it.

### Possession Lost / Dispossessed / Turnovers
Trusted Forest–Leeds headline: **Possession Lost 25–16**, with breakdown **Dispossessed 9–3 + Turnovers 16–13**. Turnovers is the provider marker-69 unsuccessful BallTouch population. The earlier 14–13 chain-suppression candidate is retired. Turnovers remains separate from team-only High Turnovers.

## Retired metrics
- `into_final_third`
- `into_final_third_success`
- `blocked_passes`

## Remaining engineering / evidence debt
1. Shared period-window contamination fix and regression.
2. Stale runtime fallback ownership cleanup without semantic changes.
3. Independent corner residual controls where still genuinely provisional.
4. Final Pitch Events / Metric Leaders / Match Stats synchronization regression.
5. Final UI regression, branch-vs-main review and merge-ready checkpoint.

## Closure condition
A user-facing metric must be Gold, derived from Gold components, explicitly provisional, protected, or deliberately retired. Raw event primitives may remain internal when required to reconstruct a Gold metric.
