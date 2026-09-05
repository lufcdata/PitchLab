# PITCHLAB — MASTER CHATGPT HANDOVER
## Status: 5 September 2026
## Repository: `lufcdata/PitchLab`
## Authoritative branch: `main`

> **MANDATORY FIRST ACTION FOR THE NEXT CHAT:** Inspect the current GitHub `main` HEAD before changing anything. This handover records the state at the time it was written, but GitHub `main` is always the latest code source of truth.

At handover creation, `main` HEAD is `2cb6f17a1117d3e47ddc489899f6b5a60ae8f8cd` (`Load Brighton crest from uploaded asset`). The latest cache generation is `metrics-93`.

---

## 1. What PitchLab is

PitchLab is a football event plotting, match analysis and metric-validation application built primarily around raw WhoScored/Opta event data. It has evolved from a pitch-event visualiser into a multi-surface analytics application with:

- Pitch Events
- Metric Leaders
- Match Stats
- Pass Combinations
- Passing Network
- Positions
- Match Events
- a new Player database/leaderboard tab
- canonical time-window controls
- reconstructed carry trajectories
- forensic Gold metric definitions

The project has reached a stage where preserving validated metric definitions and keeping every UI surface numerically synchronized is more important than adding features quickly.

---

# 2. THE GOLDEN RULE — NON-NEGOTIABLE

## **ONE METRIC → ONE AUTHORITATIVE DEFINITION → ONE CANONICAL WINDOW → EVERY RELEVANT SURFACE.**

This is the central architecture rule.

A metric must not have one formula in Pitch Events, another in Match Stats and another in Metric Leaders. The canonical definition should live in the Metric Bible / appropriate Gold engine and every relevant surface should consume it.

For composite metrics, the rule becomes:

**Existing Gold component metrics → one canonical composite definition → every valid surface.**

Do not copy component predicates into a composite calculator. Sum the canonical component values.

---

# 3. GOLDEN DEVELOPMENT RULES

1. **Inspect current `main` before every change.** Never work from memory alone.
2. **Preserve Gold definitions unless new contradictory evidence exists.**
3. **Never assume a familiar Opta/stat-provider definition is the PitchLab definition.** Reverse-engineer from raw evidence and controls.
4. **Never introduce fixture-specific corrections.**
5. **Never introduce +1/-1 hacks to hit a target number.**
6. **Never combine semantic metric changes with architectural/performance cleanup in the same change unless unavoidable.**
7. **Never allow an old/legacy definition to silently override a Gold definition.**
8. **When a mismatch appears, investigate the raw events. Do not manufacture reconciliation.**
9. **Team-only metrics remain team-only until player attribution is genuinely proven.** Do not invent attribution merely to populate a leaderboard.
10. **Preserve full sequence context where inference requires it.** Example: pass-recipient inference must use the full event sequence; only the displayed/counting passes should be canonical-window filtered.
11. **Use one canonical time window.** `ui-canonical-time-window.js` patches Metric Bible timing/window methods at runtime and is the authority.
12. **Do not claim a deployment is live until the exact GitHub Pages workflow run for the merge SHA has completed successfully.**
13. **Small, evidence-backed PRs are preferred to giant refactors.**
14. **Do not rewrite a complete file from a truncated connector response.** If `fetch_file` is incomplete, use the blob SHA and `fetch_blob` first.
15. **User verification matters.** A code merge is not the same as a visually verified feature. When a UI fix matters, ask the user to inspect it before calling it locked.

---

# 4. FORENSIC METRIC WORKFLOW

For a disputed/new metric use this order:

1. Establish an official/control number where possible.
2. Inspect raw WhoScored/Opta candidate events.
3. Inspect event type, outcome and qualifiers.
4. Reconstruct the event family.
5. Check halves / teams / players where useful.
6. Derive a general definition — never a fixture-specific rule.
7. Regression-check against existing Golden fixtures.
8. Implement once in the authoritative layer.
9. Verify every relevant surface consumes that same definition.
10. Obtain user verification before Gold-locking UI behaviour.

Useful forensic documents already in `docs/` include:

- `CANONICAL_METRIC_REGISTRY.md`
- `CARRY_FAMILY_GOLDEN.md`
- `ACTION_OUTCOME_GOLD_2026-08-28.md`
- `DEFENSIVE_DUELS_CLOSURE_2026-08-28.md`
- `FOREST_LEEDS_GOLDEN_AUDIT_V2.md`
- `FOREST_MATCH_TIMING_CONTROL_2026-08-28.md`
- `FREE_KICK_FORENSIC_AUDIT_2026-08-28.md`
- `METRIC_CATALOGUE_SYNC_AUDIT.md`
- `METRIC_CLOSURE_REVIEW_2026-08-28.md`
- `METRIC_OWNERSHIP_AUDIT_2026-08-27.md`
- `PASSING_SYNC_AUDIT_2026-08-28.md`
- `10_PASS_SEQUENCES_GOLDEN.md`
- `GOLD_VALIDATION_FIXTURES.json`

Read those rather than reconstructing old reasoning from scratch.

---

# 5. GOLD / LOCKED METRIC FAMILIES

## 5.1 Carry Engine — GOLD LOCKED

Authoritative file: `ui-carry-metrics.js`

Known version from the forensic work: `carry-engine-v5-2026-08-28`.

Core rules include:

- minimum movement: 5m
- event gap: <10 seconds
- no arbitrary maximum carry distance
- progressive carry: net x forward >=5m
- provider companion/control rules are part of the reconstruction

Canonical metric family includes:

- `carries_custom`
- `carrying_distance_custom`
- `avg_carrying_distance_custom`
- `progressive_carries_custom`
- `progressive_carrying_distance_custom`
- `avg_progressive_carrying_distance_custom`

The full supplied Forest–Leeds outfield player control reconciled across carry count, carry distance, progressive count and progressive distance.

**Do not change Carry Engine semantics without new contradictory evidence and an explicit reopening.**

### Important UI lesson
Carries are synthetic reconstructed trajectories. Generic event filters/renderers cannot be allowed to overwrite their trajectory renderer.

`ui-carry-canonical-window.js` was fixed so carry metrics delegate to the canonical carry renderer. Later, carries/progressive carries were again found blank and fixed/deployed. The user visually confirmed: **Carries and Progressive Carries now display correctly.** Treat that rendering behaviour as protected.

---

## 5.2 Action family — GOLD LOCKED

Forest–Leeds control:

- Leeds Successful Actions: 434
- Leeds Unsuccessful Actions: 190
- Leeds Total Actions: 624
- 624 unique raw event IDs; zero duplicate IDs
- exact reconciliation with the 500-touch audit after ignored/non-touch action accounting

Derived duel metrics do not create extra Actions.

Important classification notes:

- `Dispossessed` = unsuccessful Action
- ordinary `BallTouch` follows outcome
- Turnovers remain a separate canonical metric
- action definitions must not be reopened without contradictory evidence and explicit user approval

---

## 5.3 Touches

Current authoritative behaviour:

`isTouch === true` AND finite x/y coordinates.

Forest–Leeds control:

- Forest 617
- Leeds 500

---

## 5.4 Duels / defensive residual family

Known controls for Forest–Leeds:

- Tackles Won: 8–19
- Ground Duels Won: 31–41
- Aerial Duels Won: 30–25
- Duels Won: 61–66

Important Gold logic from the forensic work:

- recovery family includes BallRecovery / KeeperPickup / Claim
- tackle won = Tackle
- Ground Duel Won includes Tackle, successful TakeOn and successful non-AerialFoul Foul
- Aerial Duel Won includes successful Aerial or successful Foul with AerialFoul qualifier
- Duels Won = Ground Won OR Aerial Won

Defensive residual Ground Duels Lost was reconstructed carefully. Standalone `Dispossessed` is not automatically a Ground Duel Lost; pairing/context matters.

---

## 5.5 Turnovers

Forest–Leeds controls:

- Possession Lost: 25–16
- Dispossessed: 9–3
- Turnovers: 16–13

The raw Turnovers fingerprint was identified around unsuccessful BallTouch + marker 69.

**High Turnovers remains team-only.** Do not invent player attribution.

---

## 5.6 Passing family

Forest–Leeds controls include:

- Statistical Passes: 411–326
- Successful Passes: 321–232
- Unsuccessful Passes: 90–94
- Final Third Entries: 60–63
- Progressive Passes: 23–6

`Passes Into Final Third` was retired in favour of the correct canonical family.

Passing metrics have dedicated Gold definition files. Inspect them before modifying passing semantics.

---

# 6. FREE-KICK FAMILY — IMPORTANT RECENT FORENSIC CORRECTION

Leeds–Brentford exposed a conceptual error.

The old `Free-Kicks` implementation was actually counting free-kick restart passes, producing Leeds 11–5 Brentford. The user's control was 13–5.

Raw forensic audit established:

- **Free-Kicks awarded:** Leeds 13, Brentford 5
- **actual Leeds restarts:** 12 free-kick passes + 1 direct free-kick shot = 13
- **Brentford actual restarts:** 5 free-kick passes = 5
- the earlier 11–5 reconstruction remained a valid narrower restart-pass statistic under its corrected identity

Canonical conceptual split:

### Free-Kicks
Count the **award**. The successful Foul event belongs to the team awarded the free kick.

### Free-Kick Passes
The restart-pass family remains separate. Do not conflate it with awards.

### Direct free-kick shots
Remain part of the shot family and must not be added to Free-Kicks awarded as an extra count — the shot is a way of taking an already-awarded free kick.

### Pitch Events rendering rule — USER VERIFIED AND LOCKED
Do **not** draw the Foul event itself as a trajectory. That produced bogus lines from the corner flag because the award event is not a pass.

Correct rendering architecture:

**award event owns the count → paired actual restart owns the trajectory.**

The first matching same-team free-kick restart following the award supplies the actual start/end coordinates. This can be a pass or a direct free-kick shot. Legitimate indirect free-kick restarts are allowed when genuinely paired to an award; stray/unpaired restart events must not inflate the award total.

The user visually confirmed this is fixed.

---

# 7. CANONICAL TIME / MATCH PERIOD

Canonical time is a protected layer.

Known version from the work: `CANONICAL_TIME_V6_2026-08-29`.

Important history:

- a zero-boundary bug previously manufactured roughly +1% of timeline when both handles were at zero
- V6 preserves exact `0:00–0:00`
- crossed handles are normalized
- V4 introduced epsilon handling so second-half 45:00 does not leak into the first half

Forest timing control included:

- FirstHalf End raw 47:01
- SecondHalf End raw 93:20
- Anton Stach goal raw 87:07
- internal full timeline approximately 95:21.001

The authoritative window bridge is important: `ui-canonical-time-window.js` patches Metric Bible methods such as timeline second, bounds and window events. Other surfaces should prefer Metric Bible's canonical window rather than inventing local minute logic.

---

# 8. PERFORMANCE / SYNC ARCHITECTURE LEARNINGS

The project has undergone careful performance cleanup without changing Gold semantics.

Examples:

- Match Stats reuses one event window per sync.
- Match Stats metric counts are cached within a render.
- Metric Leaders were changed to reuse the already-windowed canonical source instead of recalculating the window for every metric.
- Pass Combinations now prefers the Metric Bible canonical window for displayed/counting passes.
- Pass-recipient inference must retain the **full event sequence** so a receiver just outside the selected display window is not lost.

General rule:

**full sequence for contextual inference → canonical window for displayed/counting events.**

Do not truncate sequence context before recipient inference.

---

# 9. COMPOSITE METRICS — DEFENSIVE ACTIONS / ATTACKING ACTIONS

These are **not new event definitions**. They are arithmetic composites of existing authoritative metrics.

## Defensive Actions

**Defensive Actions =**

- Tackles Won
- + Tackles Lost
- + Interceptions
- + Clearances
- + Blocked Shots
- + Ball Recoveries
- + Ground Duels Won
- + Defensive Aerial Duels Won
- + Defensive Aerial Duels Lost

## Attacking Actions

**Attacking Actions =**

- Shots
- + Final Third Passes
- + Successful Take-Ons
- + Unsuccessful Take-Ons
- + Progressive Passes
- + Through Balls
- + Attacking Aerial Duels Won
- + Attacking Aerial Duels Lost
- + High Turnovers

### Critical semantic rule
These are sums of component metrics. **Do not deduplicate overlapping raw events.** If a tackle legitimately contributes to Tackles Won and Ground Duels Won, both requested components contribute to the composite.

### Scope
Because High Turnovers is team-only, Attacking Actions is currently safely authoritative at team level. Do not invent player High Turnover attribution merely to create a player leaderboard.

### Match Stats visibility bug and fix
The composites were initially correctly defined and calculated but did not appear in Match Stats. Root cause: `ui-match-stats-selector.js` only admitted canonical event metrics and team metrics; its observer hid composite rows as legacy/non-Bible rows.

Fix: selector now also consumes `bible.compositeRegistry`, labels these rows `COMPOSITE`, and automatically selects newly introduced Bible keys without resetting existing saved choices.

No component definitions or composite arithmetic were changed by that fix.

---

# 10. PLAYER TAB / PLAYER DATABASE LEADERBOARD

A new Player database leaderboard was added to the top-level **Player** tab.

Design requirement from the user: it must use the **same existing PitchLab UI style**, not a generic data-grid style.

Current V1 includes:

- search bar
- team filter
- Position Group filter: GK / DF / MF / FW
- Match Position filter (DC, DL, MC, AML, etc.)
- Per 90 toggle
- sortable columns by clicking headers
- frozen Player column while metric columns horizontally scroll
- match minutes derived from substitution timing
- standard 90-minute denominator for per-90 values

Important correction during implementation: WhoScored `expandedMinute` contains accumulated stoppage and is not a suitable standard per-90 denominator. Full-match players are capped at 90 for conventional per-90 calculations; substitutions use the actual substitution event clock.

Substitutes inherit the match position of the player they replaced for filtering, rather than being dumped into a generic SUB position.

Initial Gold-backed columns include core passing, attacking, defensive, duel and carry metrics such as:

- Touches
- Successful Passes
- Total Passes
- Progressive Passes
- Final Third Passes
- Through Balls
- Carries
- Progressive Carries
- Shots
- Chances Created
- Take-Ons
- Ball Recoveries
- Tackles Won
- Interceptions
- Clearances
- duel metrics

The Player table must continue to reuse Metric Bible predicates / Carry Engine values. **Do not create a separate player-database formula for a metric.**

UI styling is scoped to the Player database to prevent leakage into Pitch Events/Match Stats.

---

# 11. MATCH DATA / CURRENT TEST FIXTURES

Several fixtures have been used as controls. Important recent ones:

- Nottingham Forest vs Leeds — major Golden audit/control fixture (`1983552` in the raw work)
- Bournemouth vs Leeds — secondary regression/control fixture
- Leeds vs Brentford — critical recent control for Free-Kicks and new UI work
- Brighton vs Leeds — newly loaded/tested fixture, WhoScored match ID **1983572**

Recent WhoScored URL supplied for Brighton–Leeds:

`https://www.whoscored.com/matches/1983572/live/england-premier-league-2026-2027-brighton-leeds`

The user asked to download/use JSON for this fixture. Preserve raw provenance when adding match data. Do not silently transform away the raw source.

---

# 12. BRIGHTON CREST — LATEST CHANGE AT THIS HANDOVER

The Brighton crest was not loading in the PitchLab header for Brighton–Leeds.

The user uploaded a new repository asset named:

`assets/Brighton.png`

Current `main` HEAD at handover maps both `Brighton` and `Brighton & Hove Albion` to this asset in `ui-header.js`.

The cache was bumped from `metrics-92` to `metrics-93`.

Commit at handover:

`2cb6f17a1117d3e47ddc489899f6b5a60ae8f8cd` — `Load Brighton crest from uploaded asset`

No metric or data logic was changed in that crest fix.

---

# 13. FRONTEND / SCRIPT ARCHITECTURE

`index.html` loads `base.html` in an iframe and injects the UI CSS/JS stack with a cache version string. When changing served JS/CSS, remember the cache bump if required.

Important scripts include:

- `ui-header.js`
- `ui-carry-metrics.js`
- `ui-timings.js`
- `ui-extra-metrics.js`
- `ui-golden-metrics-v2.js`
- `ui-possession-golden.js`
- `ui-period.js`
- `ui-touch-metrics-fix.js`
- `ui-passing-metrics-golden.js`
- `ui-metric-bible-sync.js`
- `ui-gold-passing-family.js`
- `ui-forward-pass-definition.js`
- `ui-long-pass-definition.js`
- `ui-through-ball-definition.js`
- `ui-progressive-pass-definition.js`
- `ui-penalty-box-pass-definition.js`
- `ui-penalty-area-entries-gold.js`
- `ui-gold-simple-event-family.js`
- `ui-open-play-cross-definition.js`
- `ui-throw-in-touch-territory-definition.js`
- `ui-takeon-corner-definition.js`
- `ui-corner-delivery-definition.js`
- `ui-goal-family-definition.js`
- `ui-defensive-residual-definition.js`
- `ui-free-kick-definition.js`
- `ui-gold-recovery-duels-family.js`
- `ui-gold-attacking-family.js`
- `ui-final-third-entries-gold.js`
- `ui-action-outcome-definition.js`
- `ui-pitch-event-rendering-fix.js`
- `ui-combined-outcome-surfaces.js`
- `ui-small-action-touch-dots.js`
- `ui-team-metric-bible.js`
- `ui-canonical-time-window.js`
- `ui-pitch-time-window.js`
- `ui-carry-canonical-window.js`
- `ui-leaders.js`
- `ui-match-stats.js`
- `ui-match-stats-sync-v1.js`
- `ui-match-stats-selector.js`
- `ui-sequence-metrics.js`
- `ui-pass-combinations.js`
- `ui-positions.js`
- `ui-passing-network.js`
- `ui-match-events.js`
- `ui-team-colours.js`
- `ui-polish.js`
- `ui-match-switcher.js`
- `ui-v31-fixes.js`
- `ui-view-tabs-fix.js`
- `ui-time-label-sync.js`
- `ui-surface-polish-2026-08-29.js`
- `ui-player-database.js`

Do not assume the list above is eternally current — inspect `index.html` on current `main`.

---

# 14. UI DESIGN RULES

The user wants a consistent premium PitchLab UI.

Preserve the existing design language:

- dark application background / panels
- mint/aqua accent
- existing Space Grotesk / Urbanist typography
- existing control styling
- existing border/radius language
- compact metric labels
- consistent spacing/density

Do not bolt on generic Bootstrap/data-grid styling.

New UI CSS should be scoped so it does not leak into signed-off surfaces.

---

# 15. GITHUB / DEPLOYMENT WORKFLOW

Preferred workflow:

1. Fetch exact current `main` HEAD.
2. Inspect relevant files and existing docs.
3. Create a narrowly named branch from exact HEAD.
4. Make the smallest evidence-backed change.
5. Inspect the exact PR diff.
6. Ensure no unrelated metric semantics changed.
7. Merge PR.
8. Fetch GitHub Pages Actions run for `main`.
9. Confirm the run's `head_sha` equals the merge SHA.
10. Wait for `status=completed` and `conclusion=success`.
11. Only then say it is deployed/live.
12. Ask the user to visually verify UI-sensitive changes.

Useful connector lesson: if a PR is initially reported `mergeable=false`, refetch it; GitHub may still be calculating mergeability.

Do not delete branches unless the user asks.

---

# 16. REPOSITORY CONFUSION — IMPORTANT WARNING

There are multiple football projects under the user's GitHub account, including `PitchLab` and `MatchLab-Studio-Local`.

A previous conversation briefly switched into MatchLab by mistake because GitHub Desktop was showing that repository. This was caught.

**For this handover, the correct repository is `lufcdata/PitchLab`.**

Always verify the repository name before writing. Do not port PitchLab metric code into MatchLab merely because the user has GitHub Desktop open there.

---

# 17. CURRENT STATE / RECENT ACHIEVEMENTS

By this handover, the project has achieved all of the following:

- major metric forensic audit and Gold locking
- Carry Engine reconstructed and Gold locked
- Carries / Progressive Carries visually restored in Pitch Events and user verified
- Action family audited and Gold locked
- canonical time-window architecture hardened
- Match Stats performance improved without semantic change
- Metric Leaders canonical-window reuse implemented
- Pass Combinations canonical-window reuse implemented while preserving full-sequence receiver inference
- Free-Kicks corrected from restart-pass count to awards
- Free-Kick Passes retained as a distinct valid family
- Free-Kick Pitch Events rendering paired awards to real pass/shot restart trajectories; user verified
- Defensive Actions and Attacking Actions added as canonical composite metrics
- Match Stats selector fixed to expose composite metrics
- new Player database leaderboard built in the existing PitchLab style
- sortable Player database columns
- frozen Player column
- search and position filters
- per-90 toggle with conventional minutes logic
- Brighton–Leeds added as a current test fixture
- Brighton crest mapped to the newly uploaded `assets/Brighton.png`

---

# 18. WHAT NOT TO REOPEN CASUALLY

Unless the user provides new contradictory evidence or explicitly asks to reopen them, do not casually rewrite:

- Carry Engine semantics
- Action outcome definitions
- canonical time semantics
- validated duel residual logic
- Gold passing predicates
- Free-Kick award vs restart distinction
- Free-Kick trajectory pairing architecture
- team-only High Turnover attribution

UI bugs should normally be fixed at the UI/surface layer without changing Gold numbers.

---

# 19. IMMEDIATE CONTINUATION FOR THE NEXT CHAT

The next ChatGPT chat should begin by saying it has inherited this handover, then:

1. Inspect `lufcdata/PitchLab` current `main` and compare HEAD with the handover SHA.
2. Read this file plus the existing Gold docs relevant to the next task.
3. Verify the current deployed UI if the task concerns frontend behaviour.
4. Preserve `metrics-93`/later cache state as found on current `main`; do not blindly reset it.
5. Continue from the exact repository state rather than rebuilding old fixes.

Likely immediate areas of work after handover:

- continue validating Brighton–Leeds (`1983572`) against raw JSON and current Gold metrics
- continue expanding/refining the Player database leaderboard while reusing canonical metrics
- verify Defensive Actions / Attacking Actions visually in Match Stats if not already user-confirmed after the selector fix
- continue fixture-by-fixture metric controls without altering Gold definitions merely to fit one match
- add new club crest mappings cleanly as new fixtures are loaded

---

# 20. FINAL CONTINUITY MANTRA

**Do not rebuild what is already Gold.**

**Do not create a second calculator because a new surface needs a number.**

**Do not fix a visual bug by changing the underlying statistic.**

**Do not truncate sequence context when inference needs the surrounding events.**

**Do not call something deployed until the exact SHA succeeds on GitHub Pages.**

And above all:

# **ONE METRIC → ONE AUTHORITATIVE DEFINITION → ONE CANONICAL WINDOW → EVERY RELEVANT SURFACE.**
