# PitchLab — Full Chat Handover

**Handover date:** 2026-09-16  
**Repository:** `lufcdata/PitchLab`  
**Production:** `https://lufcdata.github.io/PitchLab/`  
**Default branch:** `main`  
**Main SHA at handover start:** `7ab51c35f2bd1fe84fe88220c5b92456d518a7a0`  
**Current Technical Report cache:** `metrics-146`  
**Latest production deployment checked:** GitHub Pages run `35042433742` / run #366 — success.

This note is the source-of-truth handover for the next ChatGPT conversation. It records the product philosophy, engineering rules, canonical data architecture, Gold-definition discipline, solved bugs, implemented features, current tactical-analysis work, and the exact point from which development should continue.

---

## 1. Project identity

PitchLab is a football event-data analysis application. It is **not** the separate LUFC Data V2 historical database project.

PitchLab is evolving from an event plotting/statistics app into a professional tactical analysis engine. The intended analytical chain is:

> **events → possessions/sequences → phases → spatial structures → recurring patterns → tactical changes → evidence-backed insights**

The product principle is:

> **Enormous analytical depth underneath → beautifully simple tactical intelligence on the surface.**

And the analytical method is:

> **Discover → quantify → compare → explain → prove.**

The interface should feel like a premium analyst dossier, not a spreadsheet: visually calm, highly legible, with detail available through evidence/drilldown rather than dumped onto the first view.

---

## 2. Non-negotiable working rules

1. **Inspect the source of truth before editing.** Never guess an existing definition, file path, metric or data shape.
2. **One metric → one authoritative definition → all relevant surfaces.** Never duplicate a Gold definition merely to make a new UI easier.
3. **Do not change signed-off Gold metrics unless the user explicitly requests a definition change.** New analysis should consume the existing engines.
4. **Minimal safe changes.** Prefer additive modules and shared helpers over rewrites of working production code.
5. **Use feature branches and PRs.** Audit the diff, ensure it is mergeable, merge promptly, then verify GitHub Pages.
6. **No debug/probe files on `main`.**
7. **Do not call a feature live until deployment is verified when verification is available.**
8. **User gives final visual sign-off.** Do not repeatedly redesign something already signed off unless asked.
9. **No image generation for PitchLab visuals.** The user explicitly rejected image generation. Use HTML/CSS/SVG/canvas/data-driven graphics only unless the user explicitly reverses this instruction.
10. **Do not confuse PitchLab with LUFC Data V2.**
11. **Do not overclaim event data.** Formation, team shape, defensive line and pressure concepts must be labelled estimates/proxies when tracking data is absent.
12. **Evidence before prose.** Natural-language tactical conclusions should be produced only after structured, inspectable evidence exists.
13. **Preserve production UI and existing visual language.** Reuse team colours, pitch styling and interaction patterns where practical.
14. When the user says “keep going”, “create this”, or “continue”, they normally expect actual implementation, not only a design discussion.

---

## 3. Repository / shell architecture

The app is a static GitHub Pages application. `index.html` and specialist pages load `base.html` in an iframe, then inject page-specific CSS/JS into that iframe. This architecture is deliberate and should be respected unless there is a planned migration.

Important shared state in `base.html` includes raw event data and helpers such as `FILTERS`. Many newer pages load the season manifest directly rather than depending on one currently selected raw fixture.

Shared navigation is controlled by `ui-season-nav.js`. Current specialist pages include:

- Pitch Events / main match view
- Season Performance
- Matches Compared
- Player Stats
- Technical Report
- Set-Piece Analysis

Legacy Match / Player / Leaders buttons were removed from the shared season navigation. Do not accidentally restore them.

Team colour system:

- CSS: `--home-team-colour`, `--away-team-colour`
- localStorage: `pitchlab-home-colour`, `pitchlab-away-colour`
- event: `pitchlab:team-colours-changed`

---

## 4. Canonical 2026/27 season data architecture

The central season source is:

`data/season/2026-27/manifest.json`

At this handover it contains five canonical fixture packs:

- `1983552` — Nottingham Forest 0–1 Leeds — Premier League — 2026-08-22
- `2020316` — Nottingham Forest 0–2 Leeds — League Cup — 2026-08-25
- `1983559` — Leeds 1–1 Brentford — Premier League — 2026-08-30
- `1983572` — Brighton 1–1 Leeds — Premier League — 2026-09-05
- `2029484` — Chelsea 6–3 Leeds — League Cup — 2026-09-09

Leeds canonical `clubTeamId` is `19`.

Each fixture points to an immutable gzip event pack:

`data/season/2026-27/<matchId>.json.gz`

Browser-side season pages fetch the manifest, fetch the gzip packs, and use `DecompressionStream('gzip')` to decode them.

### Season ingest pipeline

Canonical ingest is implemented by:

- `scripts/season_ingest.py`
- `.github/workflows/season-ingest.yml`

The Python ingest validates one raw WhoScored fixture, verifies Leeds identity/team ID, builds the compact immutable gzip pack, computes a SHA-256 digest, upserts the fixture into the season manifest, and verifies the generated pack. The cloud workflow reads raw JSON from an isolated staging ref, runs the ingest, validates the season data, creates an ingest branch and opens a review PR. The raw staging JSON is not intended to be added to production `main`.

### IMPORTANT HOLD: Leeds 4–1 Newcastle, WhoScored match 1983600

The user supplied the WhoScored match-report URL for Leeds 4–1 Newcastle, match ID `1983600`, but **does not have the JSON file**.

The user then explicitly instructed:

> **Do not go any further with the non-JSON ingest.**

Therefore:

- **Do not scrape/reconstruct/approximate a replacement event pack from the webpage.**
- **Do not create a partial manifest entry from scoreline metadata alone.**
- **Do not add Newcastle separately to individual pages/widgets.**
- When/if a valid raw WhoScored JSON is supplied later, it must go through the existing canonical season-ingest pipeline so every season-driven page/widget receives the same fixture automatically.

Until that happens, continue with **new development features**, not Newcastle ingest.

---

## 5. Gold metric discipline and known signed-off values

Central rule:

> **ONE METRIC → ONE AUTHORITATIVE DEFINITION → ALL RELEVANT SURFACES.**

Do not silently create near-duplicate predicates in new report modules.

Known Gold fixture checks for `WS_1983552` Nottingham Forest 0–1 Leeds:

- PPDA: Nottingham Forest `12.9`, Leeds `8.8`
- 10+ Pass Sequences: Forest `6`, Leeds `7`
- Pressed Sequences: Forest `2`, Leeds `16`

Carry-family documentation:

`docs/CARRY_FAMILY_GOLDEN.md`

Canonical engines used by Technical Report include:

- `ui-final-third-entries-gold.js`
- `ui-penalty-area-entries-gold.js`
- `ui-sequence-metrics.js`
- `ui-ppda-gold.js`
- action-outcome and defensive-residual definition modules

If a required canonical engine is unavailable, the preferred behaviour is to show that it is unavailable rather than invent a substitute definition.

---

## 6. Successful Actions — signed-off reconciliation

Authoritative source:

`ui-action-outcome-definition.js`

Version previously audited:

`ACTION_OUTCOME_V3_2026-08-29`

`successful_actions` is `GOLD_LOCKED`, source `PITCHLAB_SIGNED_OFF`.

Important semantics:

- Each underlying event is counted at most once.
- Qualifiers do not create duplicate actions.
- Carries are derived and are not added to the action total.
- successful `Foul` = Fouled / Fouls Won.
- `Save + OutfielderBlock` = Blocked Shot.
- successful `BallTouch` = Successful Touch.
- raw Clearances can partition into canonical Clearances + Blocked Crosses.
- `SavedShot` = Shot on Target.
- Throw-ins/corners/free-kicks/goal-kicks may have set-piece display labels but still represent one underlying action.
- Key pass / chance created / assist are labels on the same underlying pass, not extra actions.

Tarik Muharemović (`playerId=439533`) Gold audit total = **336 Successful Actions** across the five current fixtures:

- Forest PL 44
- Forest Cup 81
- Brentford 75
- Brighton 52
- Chelsea 84

Human-readable reconciliation:

- Successful Passes 233
- Clearances 30
- Ball Recoveries 18
- Aerial Duels Won 13
- Successful Touches 9
- Interceptions 7
- Blocked Shots 6
- Tackles Won 6
- Successful Take-ons 4
- Fouled 3
- Blocked Crosses 2
- Shots on Target 2
- Blocked Passes 1
- Shield Ball from Opponent 1
- Goals 1
- **TOTAL 336**

Do not change the Gold classifier to make a new breakdown easier.

Season Performance has a small Successful/Unsuccessful Actions breakdown in `ui-season-action-breakdown.js`; it must reconcile one event to one category.

---

## 7. Match Momentum — solved state

Match Momentum sits above Match Stats. It uses home pressure above the baseline and away pressure below, inherits team colours, includes HT / 0′ / FT, goal football markers, red-card markers, hover details and smooth curves.

### Important solved bug

A blank chart was caused by PreMatch/PostGame administrative events producing `NaN` through canonical time handling; `Math.max(...events.map(evtSec))` was then poisoned. PR #87 introduced `ui-match-playing-events.js` to filter those administrative events before Match Stats/Momentum.

### Tiered momentum model

PR #89 introduced the tiered model. Event priority weights:

- Big Chance Created / Taken = 12
- Shot on Target = 6
- Woodwork = 5
- Penalty Box Touch = 4
- High Turnover (<40m from goal) = 4
- Pass into Penalty Box = 3.5
- Final Third Recovery = 3
- Final Third Take-on = 3
- Accurate Cross = 1.5
- Final Third Pass = 0.5

Only the highest-priority matching weight is applied to an event; no stacking.

Potential future cleanup: `ui-match-playing-events.js` globally mutates `events`; a cleaner future approach would use local finite-time filtering in Momentum. Do not change Match Stats Gold definitions while doing that cleanup.

---

## 8. Player Stats page

Player Stats is a dedicated season page with:

- 1080×1350 export canvas
- 2160×2700 2× backing canvas for quality
- metric dropdown
- From/To date controls
- competition dropdown
- dual match-range slider after date/competition filtering
- Per 90 toggle for count metrics
- white/yellow bar toggle
- PNG export
- ranked horizontal bars
- dynamic title/subtitle
- dark PitchLab styling
- reranking on filter change
- existing metric definitions reused rather than copied

Export downsamples to exact 1080×1350.

Canvas/footer source is `assets/export/Full Canvas.png`.

Portrait fixes were completed through PR #99. Canonical uploaded Bahoya/Bard images were repointed to the expected filenames. If portraits appear blank in a browser, investigate cache/load-redraw behaviour before replacing assets. `loadImage()` historically did not force a redraw after async load/error; cache-busting + redraw/fallback is the safe direction.

Do not disturb signed-off Player Stats spacing/typography unless requested.

---

## 9. Actions Map / Heat Map — signed-off visual

Pitch modes include Event Map, Heat Map and Actions Map.

Authoritative Actions Map visual after PR #104:

- blue positive overlay `#20B9F2`
- red negative overlay `#FF525B`
- clean translucent fills
- dotted outlines
- no blur
- **no dark wash over the whole pitch**
- event plots remain full opacity
- hull SVG is above event plots

Dominant clusters use a 22 radius, minimum `max(3, ceil(points.length*.08))`, refinement and convex hulls. Positive and negative hulls are separate.

PNG export stroke scaling was fixed in PR #106 by preserving `vector-effect="non-scaling-stroke"` on cloned paths. This is signed off by the user as perfect. Do not revisit unless requested.

---

## 10. Set-Piece Analysis

PR #113 created the dedicated `set-piece-analysis.html` page and navigation item. It is code/SVG only — no generated imagery.

Current V1 structure:

- match selector: all season or individual fixture
- side toggle: For Leeds / Against Leeds
- categories:
  - Corners
  - Free-kicks · final third
  - Throw-ins · final third
- 50% attacking-half SVG pitch
- restart origin → destination lines
- successful delivery mint `#43ece0`
- unsuccessful grey `#8e96a3`
- shot markers and goal markers
- KPI/share/evidence panel

Observed scope:

- corners reuse existing `FILTERS.corners` where available
- final-third free-kicks and throw-ins use restart origin `x >= 66.67`
- these final-third restart scopes are **descriptive observed scopes, not new Gold definitions**

Current V1 limitations to remember:

- generic free-kick `SetPiece` shot attribution is qualifier-based rather than tightly possession-linked
- chances created are `KeyPass` qualifiers on restart deliveries
- into-box is destination-coordinate based
- no xG, first-contact, second-ball, near/far-post zone, routine clustering, taker profile, aerial outcome or possession-retention model yet
- do not label a routine/tactical pattern until repeated evidence supports it

Good future extensions: delivery zones, taker breakdown, short-v-delivered corner, direct-v-second-phase outcomes, For/Against comparison, match trends, evidence drilldown.

---

## 11. Technical Report — core philosophy

This is the main development frontier.

The report is intended to answer:

- How do Leeds play?
- How does their style evolve?
- Where/how do they progress?
- What is their defensive engagement structure?
- How do they build up, press and transition?
- What recurring patterns and combinations exist?
- What changes after goals, substitutions, cards and half-time?
- What are repeated strengths and vulnerabilities?

Tracking caveat is crucial: true formation, exact team shape and literal defensive-line height require tracking data. Event-data outputs must say **estimated event-derived structure**, **engagement-height proxy**, **structural-change candidate**, etc. Never write as though event coordinates are continuous player tracking.

### Canonical architecture direction

1. Possession / sequence engine
2. Rolling spatial model
3. Change-point detector
4. Shape / role inference
5. Pattern engine
6. Pressing + transition engine
7. Strength / weakness detector
8. Set-piece pattern engine
9. Evidence / confidence layer
10. Natural-language tactical report

The LLM/narrative layer belongs at the end, not at the beginning.

---

## 12. Technical Report — implemented layers through PR #117

### A. Passing Channels

Leeds pass origins are split into five lanes:

- Left: y < 20
- Left half-space: 20–40
- Centre: 40–60
- Right half-space: 60–80
- Right: >=80

Displays lane percentages, attempts and success. It is descriptive event evidence, not tactical-intent inference.

### B. Territorial Structure

Pass origins are split into defensive/middle/final thirds. This is an observed territory view.

### C. Territorial Progression

Uses existing Gold predicates:

- Final Third Entries
- Penalty Area Entries
- 10+ Pass Sequences

Shows L/C/R destination routes. It must continue to consume the Gold engines rather than recreate them.

### D. Possession-Chain Evidence

Uses `PitchLabSequences.buildSequences` and canonical Gold entry predicates. Sequence records are built per match — **never across fixtures**.

Displays:

- pass sequence count
- 5+ pass sequences
- Gold 10+ pass sequences
- average passes/sequence
- sequences entering final third
- sequences entering box
- start-channel → final-third-entry-channel matrix
- longest canonical pass sequences

This is currently pass-chain evidence, not a complete possession reconstruction containing every non-pass action.

### E. Build-up & Transition Evidence — PR #112

`ui-technical-report-transitions.js`

Uses canonical sequences and Gold progression predicates.

Measures:

- chains starting defensive third
- defensive-third chains reaching final third/box
- middle-third chains reaching final third
- median first-pass → final-third time
- progression speed bands: ≤10s, 11–20s, 21–40s, 40s+
- regain-linked chains and regain → final-third/box timing

Regain link is a transparent descriptive bridge:

- regain types: ball recovery, interception, tackle
- successful/not-unsuccessful regain
- within 8 seconds before first pass
- rejected if opponent performs a controlled action in between

Do **not** automatically call these counterattacks, fast attacks or patient build-up. Those labels need stronger classification evidence.

### F. 50% attacking-half visual evidence — PR #114

`ui-technical-report-pitches.js`

This established the user’s desired half-pitch visual language in Technical Report:

- Attacking-third movement: Leeds passes originating in final third
- Penalty-area entries: existing Gold box-entry events
- origin → destination arrows
- same clean event-arrow visual language
- Left/Centre/Right attacking share
- match selector controls the pitch views

Origins outside the displayed attacking half may be clipped to the halfway edge **for display only**; underlying event coordinates/Gold definitions remain unchanged.

### G. Pressing & Defensive Structure — PR #115

Merged SHA: `09beb04457fc8acdfc7aac49c92dbcca28483ee1`.

Added:

- full-pitch defensive engagement map
- mean engagement-height proxy
- shared Gold PPDA
- first-half PPDA
- second-half PPDA
- high engagement counts
- final-third engagement counts

A shared PPDA predicate/ratio source was introduced and the existing Matches Compared pressing surface was routed through it, preserving the one-definition principle.

Critical interpretation:

> A higher engagement line or lower PPDA does **not** automatically prove effective pressure/intensity.

The UI must distinguish defensive structure from actual pressing effectiveness. Engagement height is event-derived, not literal back-line height.

### H. Shape in Each Phase — PR #116

Merged SHA: `dfe1115fd136b8edcf2bdfb1aa8c0fdaff4e2dd7`.

Tabs:

- Build-up
- Progression
- Final Third
- Defensive Block
- Press

Displays:

- estimated player locations
- inferred successful-pass connections for in-possession phases
- observed width/depth
- left-right asymmetry
- most-involved players

Evidence discipline:

- explicitly labelled **estimated event-derived structure**
- never tracking-derived positioning
- width/depth use 10th–90th percentile event locations to reduce outlier distortion
- pass connections use a transparent next-controlled-action inference within 12 seconds and the same period
- Defensive Block and Press use the same 65m engagement threshold already exposed by the pressing module
- no Gold definitions changed

### I. Tactical Change Timeline / change-point evidence — PR #117

Current main SHA: `7ab51c35f2bd1fe84fe88220c5b92456d518a7a0`.

The module:

- scans each match at five-minute checkpoints
- compares 10-minute before/after windows
- measures Left/Centre/Right pass-origin distribution
- measures territorial pass-origin distribution
- measures defensive engagement height
- suppresses nearby weaker candidates
- shows a visual 0–90 timeline
- shows before/after evidence cards for selected fixtures
- in season view, shows the strongest candidate per fixture

Critical language:

- these are **structural change candidates**
- they are **not automatically formation changes**
- they are **not claims about coaching intent**

Current Technical Report wrapper is cache `metrics-146` and loads:

- `ui-technical-report.js`
- `ui-technical-report-transitions.js`
- `ui-technical-report-pitches.js`
- `ui-technical-report-pressing.js`
- `ui-technical-report-phase-shape.js`
- `ui-technical-report-change-points.js`
- canonical time, final-third, penalty-area, sequence and PPDA engines

GitHub Pages run #366 for the PR #117 main SHA completed successfully.

---

## 13. Match Evolution evidence

The base Technical Report also has fixed 15-minute evidence windows:

- 0–15
- 15–30
- 30–45
- 45–60
- 60–75
- 75–90

For each window it displays broad Left/Centre/Right channel balance, pass-origin thirds and defensive engagement-height proxy.

Defensive engagement proxy is the mean x-position of selected defensive events such as tackles, interceptions, challenges, recoveries, clearances, blocked passes and fouls. It is not literal defensive-line height.

The newer automatic change-point timeline should increasingly become the more useful tactical segmentation layer, but the fixed windows remain useful evidence/context and should not be deleted casually.

---

## 14. Visual direction already agreed

The user likes the professional analytical style of:

- pitch maps with clean evidence overlays
- 50% attacking-half layouts where appropriate
- sparse KPI panels beside visuals
- tactical timelines
- phase tabs
- style fingerprints/sliders only when the score has transparent evidence
- “Why?” / “View Evidence” drilldowns
- confidence language such as `HIGH CONFIDENCE · 4 supporting signals · View Evidence` once a genuine confidence model exists

Potential Playing Style fingerprint dimensions:

- Possession-based ↔ Direct
- Low Block ↔ High Press
- Conservative ↔ Risk-taking
- Central Play ↔ Wide Play
- later: Slow ↔ Fast Build-up, Patient ↔ Vertical, Compact ↔ Expansive, Passive ↔ Aggressive without ball

But do **not** create arbitrary black-box slider scores. Each dimension must be backed by transparent components such as sequence length, progression speed, long-pass %, passes/sequence, PPDA, high turnovers, engagement height, final-third recoveries, progressive actions, forward-pass %, route share, etc.

Every derived tactical label should be inspectable.

---

## 15. Best next development steps

The user has explicitly paused Newcastle ingest and wants to return to development.

Recommended continuation order from the current codebase:

1. **Evidence/confidence framework for Technical Report.** Give each candidate insight its supporting signals, sample size, match coverage and confidence; do not jump straight to prose.
2. **Game-state trigger layer.** Compare before/after goals, substitutions, red cards and half-time, using canonical time and match-scoped data. Connect those triggers to the existing structural-change candidates.
3. **Pattern & combination engine.** Detect repeated pass-chain routes, player combinations, overloads and recurring final-third entry patterns. Require recurrence before calling something a pattern.
4. **Transition classification upgrade.** Build from the existing regain-linked evidence into defensible counterattack/counterpress classifications, with explicit rules and evidence.
5. **Strengths / weaknesses detector.** Compare repeated signals against suitable baselines; require multiple supporting signals and enough samples. Avoid one-match overclaiming.
6. **Set-piece V2.** Add richer restart zones, takers, first/second phase and repeated routine evidence without changing Gold definitions.
7. **Playing Style fingerprint.** Only after component metrics are canonical and explainable.
8. **Natural-language tactical report.** Last layer: convert verified structured findings into concise prose and always provide evidence drilldown.

A useful immediate product goal is to connect the new change-point timeline to game-state triggers and phase-shape panels so clicking a candidate segment can update the relevant pitch/shape/evidence views.

---

## 16. Engineering workflow for the next chat

For each new feature:

1. Fetch current `main` and verify the latest SHA.
2. Inspect the relevant existing files/Gold definitions first.
3. State internally which definitions are authoritative and which new calculations are only descriptive/proxy calculations.
4. Create a narrowly named feature branch.
5. Make the smallest coherent implementation.
6. Reuse canonical engines; do not fork their logic.
7. Audit the diff for accidental Gold/UI changes.
8. Open a PR with evidence discipline and caveats documented.
9. Check mergeability.
10. Merge promptly when clean.
11. Verify GitHub Pages workflow success.
12. Report the exact merged SHA and what changed, concisely.

When changing a specialist page, bump the relevant cache version consistently across its injected CSS/JS references.

---

## 17. Historical PR landmarks worth knowing

- #87 — fixed blank Momentum chart by excluding administrative PreMatch/PostGame events
- #88 — smooth Momentum curves + goal/red-card hover
- #89 — tiered Momentum V2
- #93–#99 — Player Stats typography/export/portrait refinements
- #97 — shared navigation cleanup
- #104 — signed-off Actions Map clean blue/red overlay
- #105/#106 — Actions Map export and non-scaling dotted-stroke fix
- #108 — first real Technical Report channel engine
- #109 — Match Evolution layer
- #111 — canonical progression + possession-chain evidence
- #112 — build-up & transition evidence
- #113 — Set-Piece Analysis with 50% attacking pitch
- #114 — Technical Report attacking-half pitch visuals
- #115 — pressing & defensive structure + shared Gold PPDA source
- #116 — phase structure visual
- #117 — tactical structural-change timeline

---

## 18. Things NOT to do

- Do not resume the Leeds 4–1 Newcastle non-JSON ingest unless the user explicitly changes the instruction and a valid source is available.
- Do not manually insert Newcastle into the manifest without a canonical event pack.
- Do not update individual pages separately for a new match; season data must flow from the central manifest/packs.
- Do not alter Gold metric definitions to make Technical Report outputs look more plausible.
- Do not call event-derived average locations “tracking data”.
- Do not call structural-change candidates “formation changes” without stronger evidence.
- Do not call every regain-linked fast sequence a counterattack.
- Do not equate low PPDA/high engagement with effective pressing without supporting evidence.
- Do not generate decorative AI images for PitchLab.
- Do not put a dark wash over the signed-off Actions Map pitch.
- Do not duplicate metric logic across pages.
- Do not build prose-first tactical conclusions.

---

## 19. Definition of success for PitchLab

PitchLab should eventually be able to make statements such as:

- Leeds shifted their progression route after a specific point in the match.
- Their defensive engagement moved higher/lower, while pressure efficiency changed differently.
- A particular player occupied a materially different event-derived zone after a tactical segment boundary.
- Build-up repeatedly progressed through a particular channel/player combination.
- A repeated set-piece or transition pattern created a measurable advantage or vulnerability.

But every statement must be traceable to the events, sequences, time window, spatial model and supporting signals that produced it.

The target is not merely more metrics. It is **trustworthy tactical intelligence with beautiful evidence**.

---

## 20. Exact pickup point

At the end of the previous chat:

- current production `main` is PR #117 at `7ab51c35f2bd1fe84fe88220c5b92456d518a7a0`
- GitHub Pages deployment for that SHA succeeded
- Technical Report cache is `metrics-146`
- Technical Report now includes canonical progression/sequences, transitions, attacking-half visuals, pressing/defensive structure, phase-shape estimates and automatic structural-change candidates
- Set-Piece Analysis V1 is present
- the Newcastle 4–1 fixture is **on hold because no raw JSON is available**
- the user explicitly wants to **resume new development features**

Start by inspecting current `main`, then continue the evidence-first Technical Report roadmap. Preserve the Gold architecture and the signed-off visuals.
