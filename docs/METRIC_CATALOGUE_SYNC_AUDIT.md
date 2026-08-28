# PitchLab Metric Catalogue & Synchronization Audit

Created: 2026-08-27  
Updated: 2026-08-28

## Preservation rule

The current Match Controls catalogue is a protected product surface. Metrics are removed only with explicit approval. On 2026-08-28 the user explicitly approved retirement of standalone **Blocked Passes** after confirming WhoScored exposes Blocked Shots and Blocked Crosses, not Blocked Passes.

- One metric -> one authoritative definition -> all permitted surfaces.
- Team-only sequence metrics remain Match Stats-only.
- Existing **Possession Lost** remains independent from **Dispossessed** and **Turnovers**.
- Retired `into_final_third`, `into_final_third_success`, and `blocked_passes` must not be resurrected by legacy fallback or catalogue synchronization.

## Secured controls and definitions

### Passing
Gold controls include Total Passes 411–326, Successful 321–232, Unsuccessful 90–94, Accuracy 78.1–71.2, Final Third Passes 110–92, Successful Final Third Passes 72–38, Forward Passes 244–211, Backward Passes 69–49, Long Balls 71–58 and Through Balls 2–0. Progressive Passes and Penalty-Box Passes retain independent-control evidence debt.

### Touch / attacking / restart
Gold controls include Touches 617–500, Penalty Box Touches 22–15, Take-Ons 22–12, Crosses 19–8, Accurate Crosses 4–3, Inaccurate Crosses 15–5, Throw-In outcomes 21–6 / 4–6, Goal Kicks 6–10, validated shot/goal families, Chances Created, Big Chances, Big Chances Created and Assists.

### Defensive / duel
Gold controls include Ball Recoveries 47–43, Tackles 15–29, Tackles Won 8–19, Tackles Lost 7–10, Interceptions 2–15, Clearances 32–31, Dispossessed 9–3, Errors 1–0, Aerial Duels 55–55, Aerial Duels Won 30–25, Aerial Duels Lost 25–30, Blocks 13–8, Blocked Shots 6–1 and Blocked Crosses 7–7.

Ground Duels Won **31–41** and Total Ground Duels **72–72** are Gold. Ground Duels Lost **41–31**, Duels Lost **66–61**, and Total Duels **127–127** are derived from closed Gold components. The superseded values `34–28`, `65–69`, `59–58` and `120–124` are retired.

**Blocked Passes is retired as a standalone user-facing metric.** The raw `BlockedPass` event remains an internal primitive because Gold **Blocked Crosses 7–7** requires it: Forest `7 BlockedPass + 0 Clearance+BlockedCross`; Leeds `5 BlockedPass + 2 Clearance+BlockedCross`. Do not expose `blocked_passes` in Pitch Events, Metric Leaders, Match Stats or selectors.

### Carry family
The six signed-off Carry metrics remain owned by the shared carry engine and are closed. Do not rebuild them.

### Team-only sequence family
Gold: Possession 56.3–43.7, PPDA 12.9–8.8, 10+ Pass Sequences 6–7, Pressed Sequences 2–16, High Turnovers 4–8 and Shot-Ending High Turnovers 1–1.

### Penalty Area Entries
`GOLD_LOCKED` at **Forest 36–21 Leeds**: every Pass attempt starting outside the opposition penalty area and ending inside it, regardless of outcome.

### Possession Lost / Dispossessed / Turnovers
They remain independent. Possession Lost is protected; Dispossessed is Gold at 9–3; Turnovers remains provisional pending independent headline evidence.

## Retired metrics

- `into_final_third`
- `into_final_third_success`
- `blocked_passes`

Retirement means removal from all user-facing metric catalogues and canonical registry ownership. It does **not** mean deleting raw event semantics needed internally by another Gold metric.

## Remaining synchronization work

1. Remove stale runtime fallback ownership only after canonical coverage is proven.
2. Fix period/time-window filtering separately and regression-test all surfaces.
3. Resolve evidence debt for Progressive Passes, Penalty-Box Passes, throw-in spatial variants, free-kick variants and corner residuals.
4. Run final Pitch Events / Metric Leaders / Match Stats synchronization checks before merge.

## Current audit position

Penalty Area Entries and the ground/total-duel family are closed. Blocked Passes no longer carries evidence debt because it is deliberately retired as a standalone metric; its raw event type survives only inside the Gold Blocked Crosses reconstruction. Remaining work is integration/ownership cleanup, period-filter regression and the explicitly documented evidence-debt metrics above.