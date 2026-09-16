# PitchLab — Full Handover — 16 September 2026

> **Purpose:** This document is the continuity note for a new ChatGPT chat. Read this before making any PitchLab change. It records the product philosophy, architecture, Gold rules, season-data pipeline, validated solutions, recent feature work, current state, known limitations and the next development direction.

---

## 1. Project identity

This project is **PitchLab**, the football event plotting / analytics / tactical-analysis application.

- Repository: `lufcdata/PitchLab`
- Production: `https://lufcdata.github.io/PitchLab/`
- Default branch: `main`
- Deployment: GitHub Pages via `.github/workflows/pages.yml`
- Current season dataset: `data/season/2026-27/`
- Current Leeds team ID in the season manifest: `19`

**Do not confuse PitchLab with LUFC Data V2.** LUFC Data V2 is the separate historical Leeds relational database project (`lufcdata/LUFC-Data-V2`). This handover is for PitchLab unless the user explicitly switches projects.

As of the latest verified production deployment on 16 September 2026, GitHub Pages run #367 completed successfully for the merge of PR #118 (`efefb6dad91b9a28381a83a4e45f257f714831e4`).

---

## 2. User working style — important

The user expects implementation, not prolonged design discussion.

When the user says **“keep going”, “let’s do it”, “can we add this”, “continue”, “create this”**, the default interpretation is: inspect the source of truth, implement the next safe increment, audit it, open/merge the PR and verify deployment where possible.

Working rules:

1. Inspect the current repository/source of truth before editing. Do not work from remembered stale code.
2. Use a feature/fix/docs branch and PR for meaningful changes.
3. Make the smallest safe change that solves the requested problem.
4. Audit the diff before merge.
5. Merge promptly when the change is clean and the user has already authorised the work.
6. Verify GitHub Pages after merge before calling a feature live.
7. Do not leave probe/debug files on `main`.
8. Do not ask unnecessary questions when the intent is clear.
9. The user gives final visual sign-off; do not keep redesigning something they have signed off.
10. Preserve existing production UI and Gold definitions unless the user explicitly asks to revisit them.
11. Updates should be concise and action-oriented.
12. **No image generation for PitchLab visuals.** The user explicitly rejected image generation. Use HTML/CSS/SVG/canvas and actual data. Do not invoke an image-generation workflow unless the user explicitly reverses this instruction.

The desired product character is:

> **Dense underneath, elegant on top.**

The analytics engine can be extremely detailed, but the visible report should be calm, visual, premium and understandable. Deep evidence belongs behind drilldowns rather than dumped onto the main surface.

---

## 3. The central Gold principle

The most important engineering rule is:

> **ONE METRIC → ONE AUTHORITATIVE DEFINITION → ALL RELEVANT SURFACES.**

Never create a second definition of a metric merely because a new page needs it. New surfaces should import/reuse the canonical predicate/engine. If a canonical engine does not expose enough evidence, extend it so the same underlying definition can be inspected; do not reimplement it in parallel.

Never alter a Gold definition just to make a visual easier to build.

New tactical modules may introduce **descriptive evidence scopes/proxies** where no Gold metric exists, but those must be labelled honestly and must not masquerade as Gold.

The product should distinguish:

- raw observed event evidence;
- canonical/Gold metrics;
- transparent derived proxies;
- tactical inference;
- narrative explanation.

Do not collapse these layers into one another.

---

## 4. Important Gold controls and known validation values

### PPDA

Gold control fixture `WS_1983552` — Nottingham Forest 0–1 Leeds:

- Nottingham Forest: **12.9**
- Leeds: **8.8**

PR #115 introduced a shared PPDA predicate/ratio source and routed the existing Matches Compared pressing surface through it, so Technical Report and existing surfaces share the same authoritative PPDA logic.

### Sequence controls

For Forest v Leeds `1983552`:

- 10+ Pass Sequences: Forest **6**, Leeds **7**
- Pressed Sequences: Forest **2**, Leeds **16**

The canonical sequence builder is exposed through `PitchLabSequences.buildSequences`. Technical Report must consume those exact sequence boundaries rather than inventing another possession-chain definition.

### Carry family

Carry-family documentation is in:

- `docs/CARRY_FAMILY_GOLDEN.md`
- `docs/CARRY_ENGINE_V6_BRIGHTON_AUDIT_2026-09-06.md`

Use the canonical carry engine. Carries are derived actions; do not add them to raw-event action totals unless the metric explicitly defines that behaviour.

### Action outcome / Successful Actions

Authoritative source: `ui-action-outcome-definition.js`.

Version established during the audit: `ACTION_OUTCOME_V3_2026-08-29`.

`successful_actions` is Gold-locked / PitchLab signed off. Each underlying event is counted at most once. Qualifiers can describe an event but do not create duplicate actions.

Ignored administrative types include start/end, formation set/change, substitutions, card, corner awarded, offside pass and offside provoked.

Key semantics established by forensic audit:

- Goal = successful unless OwnGoal.
- Big-chance missed/saved/post outcomes are handled by the classifier rules.
- Ball recovery, interception, clearance, blocked pass and save are successful.
- Tackle = successful; Challenge = unsuccessful.
- Dispossessed, Error and OffsideGiven = unsuccessful.
- Pass/Aerial/BallTouch/TakeOn/Foul/ShieldBallOpp follow event outcome.
- successful `Foul` means **Fouled / Fouls Won**.
- `Save + OutfielderBlock` means **Blocked Shot**.
- successful `BallTouch` means **Successful Touch**.
- raw Clearance can partition into canonical Clearances + Blocked Crosses.
- `SavedShot` corresponds to Shots on Target for the action reconciliation.
- set-piece qualifiers do not create extra actions.

Tarik Muharemović (`playerId=439533`) was the control audit for **336 Successful Actions** across the first five fixtures:

- Forest PL 44
- Forest League Cup 81
- Brentford 75
- Brighton 52
- Chelsea 84
- Total 336

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
- Total 336

Do not change the classifier to make a UI breakdown easier.

---

## 5. Application architecture

PitchLab is a static GitHub Pages application with a shared iframe shell.

### Main shell

`index.html` loads `base.html` in an iframe. Parent pages dynamically inject CSS and JS into the iframe. `base.html` contains shared UI/state and core event filtering structures.

Historically relevant shared state includes:

```js
let raw=null, events=[], carries=[];
```

and shared helpers such as `teamName`, `type`, `hasQ`, `FILTERS`.

### Cache/versioning

Feature pages use cache query strings such as `metrics-147`. When changing injected assets, bump the wrapper cache consistently so browsers do not keep stale scripts/styles.

### Team colours

Shared CSS variables:

- `--home-team-colour`
- `--away-team-colour`

Persisted in localStorage:

- `pitchlab-home-colour`
- `pitchlab-away-colour`

Change event:

- `pitchlab:team-colours-changed`

Visual modules should inherit these rather than hard-code team identity colours where the shared system applies.

### Navigation

`ui-season-nav.js` is the shared navigation layer. Current important top-level destinations include:

- Pitch Events
- Season Performance
- Matches Compared
- Player Stats
- Technical Report
- Set-Piece Analysis

Legacy Match / Player / Leaders buttons were intentionally removed from the shared-nav presentation. Do not accidentally restore them.

---

## 6. Current 2026/27 season data architecture

Canonical manifest:

`data/season/2026-27/manifest.json`

The manifest is the central fixture index. Pages should consume the manifest and its immutable gzip event packs rather than maintain page-specific fixture lists.

Known canonical fixtures currently in the manifest:

1. `1983552` — Nottingham Forest 0–1 Leeds — Premier League — 2026-08-22
2. `2020316` — Nottingham Forest 0–2 Leeds — League Cup — 2026-08-25
3. `1983559` — Leeds 1–1 Brentford — Premier League — 2026-08-30
4. `1983572` — Brighton 1–1 Leeds — Premier League — 2026-09-05
5. `2029484` — Chelsea 6–3 Leeds — League Cup — 2026-09-09

The browser loads gzip packs using `DecompressionStream('gzip')`. Typical pattern:

```js
async function gzipJson(url){
  const r=await fetch(url,{cache:'no-store'});
  if(!r.ok) throw new Error(`Could not load ${url}`);
  if(typeof DecompressionStream==='undefined'||!r.body)
    throw new Error('Compressed season packs are not supported by this browser.');
  return JSON.parse(await new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).text());
}
```

Consumers should tolerate the supported event-pack shapes where appropriate: direct array, `.events`, or `.matchCentreData.events`.

---

## 7. Season ingest pipeline — and the Newcastle decision

Canonical ingest code:

- `scripts/season_ingest.py`
- `.github/workflows/season-ingest.yml`
- `docs/CLOUD_SEASON_INGEST_2026-09-08.md`

The pipeline validates one raw WhoScored fixture, creates an immutable gzip season pack and upserts the fixture into the season manifest. It validates Leeds identity/home-away membership, Leeds team ID, match ID, date, event presence and pack decompression.

The raw JSON staging source is intentionally isolated from `main`. The workflow reads an `incoming/*.json` or `incoming/*.json.gz` file from a source ref, generates the canonical pack/manifest update and opens a review PR.

**Important latest decision:** The next Leeds fixture is WhoScored match `1983600`, Leeds 4–1 Newcastle. The user supplied the WhoScored match-report URL but does **not** have a raw JSON file.

The user explicitly instructed:

> **Do not go any further with the non-JSON ingest.**

Therefore:

- do not fabricate a partial fixture record;
- do not scrape/reconstruct and separately bolt the match onto individual pages;
- do not create a Newcastle-only data path;
- do not add the score to the manifest without the canonical event payload;
- do not continue work on a URL-to-ingest workaround unless the user explicitly reopens that task.

When a proper raw JSON is eventually available, ingest it **once** through the canonical season pipeline. That one manifest/pack update should then flow to Season Performance, Player Stats, Matches Compared, Technical Report, Set-Piece Analysis and every other season consumer. This is another application of the one-source-of-truth rule.

For now, **development features are the priority; Newcastle ingest is paused.**

---

## 8. Match Momentum — signed-off architecture

Match Momentum sits above Match Stats and uses:

- home pressure above baseline;
- away below;
- shared team colours;
- HT line and 0′/HT/FT labels;
- goal football markers;
- red-card markers;
- hover detail;
- responsive smooth curves.

A critical bug was fixed when administrative WhoScored PreMatch/PostGame events produced `NaN` canonical times and poisoned `Math.max`. `ui-match-playing-events.js` filters those administrative events before Match Stats/Momentum. Future cleanup may prefer local finite-time filtering rather than global mutation, but do not destabilise Gold stats while doing so.

Tiered Momentum V2 weights:

- Big Chance Created / Taken 12
- Shot on Target 6
- Woodwork 5
- Penalty Box Touch 4
- High Turnover (<40m from goal) 4
- Pass into Penalty Box 3.5
- Final Third Recovery 3
- Final Third Take-on 3
- Accurate Cross 1.5
- Final Third Pass 0.5

Only the highest-priority matching weight applies to an event; no stacking.

It reuses canonical predicates including big chances, shots on target, woodwork, box touches, box passes, recoveries, accurate crosses, final-third passes and `PitchLabGoldenV2.highStarts` for high turnovers.

Do not casually retune this without a new validation exercise.

---

## 9. Player Stats page

`player-stats.html` + `ui-player-stats.js` + `ui-player-stats.css` provide the season player leaderboard/export surface.

Core features:

- metric dropdown;
- date From/To;
- competition dropdown;
- dual match-range slider after date/competition filtering;
- Per 90 toggle for count metrics;
- white/yellow bar toggle;
- ranked horizontal bars;
- dynamic title/subtitle;
- PNG export;
- 1080×1350 logical export canvas;
- 2× 2160×2700 backing canvas for quality;
- final export downsamples to exact 1080×1350;
- existing metric predicates/registry are reused rather than duplicated.

Current visual details established in the signed-off iterations:

- dark canvas `#171928`;
- subtle row cards;
- centered editorial header;
- thin blue progress bars;
- footer/background asset `assets/export/Full Canvas.png`;
- Leeds crest `assets/leeds png.png`;
- mono-like player typography;
- rowX 88;
- portrait centre rowX+44;
- name x rowX+112;
- fitted name max width 300;
- metric value centre rowX+475;
- bar starts rowX+545;
- apps badge rowX+820;
- rows start 265, rowH 64, gap 10.

Portrait assets for Jean-Matteo Bahoya and Melvin Bard were corrected by repointing canonical/`Icon` filenames to the user-uploaded blobs. If portraits appear blank, suspect browser cache or the current `loadImage()` redraw/fallback behaviour before assuming the assets are wrong.

---

## 10. Actions Map / Heatmap — signed off

Pitch map modes include:

- Event Map
- Heat Map
- Actions Map

Actions Map authoritative visual behaviour:

- positive blue `#20B9F2`;
- negative red `#FF525B`;
- clean translucent convex-hull fills;
- dotted outlines;
- no blur;
- no dark wash over the whole pitch;
- event plots remain full opacity;
- polygon SVG sits above event plots.

Clustering uses a dominant-cluster approach and convex hulls. Polarity comes from `PitchLabActionOutcomeDefinition.classifyAction(e)` first.

The user explicitly signed off the final appearance: **“That’s perfect and looks amazing.”** Do not revisit the styling unless requested.

PNG export bug/solution: cloned Actions Map paths initially lost non-scaling stroke behaviour, making dotted strokes huge. The fix explicitly applies:

```js
path.setAttribute('vector-effect','non-scaling-stroke');
```

Preserve that exporter behaviour.

---

## 11. Season Performance action breakdown

`ui-season-action-breakdown.js` provides the small breakdown window for Successful/Unsuccessful Actions only.

It follows one-event-one-category reconciliation and preserves the Gold action-outcome classifier. Do not let descriptive subcategories sum beyond the Gold total through qualifier duplication.

---

## 12. Tactical Analysis Engine — product vision

The major current development direction is turning PitchLab into an evidence-backed tactical analysis engine.

Target pipeline:

> **events → possessions → phases → spatial structures → recurring patterns → tactical changes → evidence-backed insights**

Guiding principle:

> **Discover → quantify → compare → explain → prove.**

The desired report should identify, with evidence:

- how Leeds play;
- how their approach changes during matches and across matches;
- build-up and progression routes;
- defensive engagement / block behaviour;
- left/centre/right progression;
- balance of play;
- transitions;
- recurring combinations;
- tactical anomalies;
- set-piece patterns;
- strengths and weaknesses;
- game-state changes after goals, substitutions, cards and half-time.

### Crucial evidence caveat

Event data is **not tracking data**. True formation, literal defensive-line height and exact off-ball shape cannot be claimed from WhoScored/Opta events alone.

Therefore use language such as:

- “estimated event-derived structure”;
- “defensive engagement-height proxy”;
- “structural change candidate”;
- “observed progression evidence”.

Do **not** silently upgrade these to “formation changed”, “back line was X metres high”, “high press”, “counterattack”, etc. unless a validated classifier/evidence layer supports that label.

The LLM/narrative layer should come **last**. It should translate structured verified facts into prose, not invent tactical facts from the raw match.

---

## 13. Technical Report — implementation history and current state

Page: `technical-report.html`.

The report has evolved from a placeholder into multiple evidence layers. The current production cache after PR #118 is `metrics-147`.

### A. Passing channels

Leeds pass origins are split into five vertical lanes:

- Left: y < 20
- Left half-space: 20–40
- Centre: 40–60
- Right half-space: 60–80
- Right: >=80

This is descriptive event evidence, not tactical intent.

### B. Territorial structure / Match evolution

Pass origins are split into defensive/middle/final thirds. Match Evolution currently includes 15-minute evidence windows and broad Left/Centre/Right channel balance.

Defensive engagement height is calculated from the mean x-position of Leeds defensive events from this family:

- tackle
- interception
- challenge
- ball recovery
- clearance
- blocked pass
- foul

It is explicitly a proxy, not literal back-line position.

### C. Gold territorial progression

Technical Report reuses:

- `PitchLabFinalThirdEntriesGold.finalThirdEntry`
- `PitchLabPenaltyAreaEntriesGold.penaltyAreaEntry`

It shows Gold Final Third Entries, Gold Penalty Area Entries, Gold 10+ Pass Sequences and Left/Centre/Right destination splits.

Do not create a parallel entry definition.

### D. Canonical possession-chain evidence — PR #111

PR #111 exposed exact canonical pass-sequence boundaries to Technical Report instead of reimplementing them.

The report shows:

- pass-sequence count;
- 5+ pass sequences;
- Gold 10+ pass sequences;
- average passes per sequence;
- sequences entering final third;
- sequences entering box;
- start-channel → final-third-entry matrix;
- longest canonical pass sequences with match/time evidence.

Important limitation: these are canonical **pass-chain** boundaries, not yet a complete possession reconstruction including every non-pass action.

### E. Build-up & transition evidence — PR #112

`ui-technical-report-transitions.js` added:

- pass-chain start territory;
- defensive-third chains reaching final third;
- defensive-third chains reaching box;
- middle-third chains reaching final third;
- median first-pass → final-third time;
- progression-speed bands;
- regain-linked pass chains;
- regain → final-third timing;
- regain → box timing;
- fastest evidence examples.

The regain bridge uses successful ball recoveries/interceptions/tackles within 8 seconds before the first pass and rejects the link if the opponent has a controlled action in between.

This 8-second bridge is **descriptive**, not a canonical counterattack definition. The UI deliberately does not call these “counterattacks”, “fast attacks” or “patient build-up” yet.

### F. Attacking-half visual evidence — PR #114

`ui-technical-report-pitches.js` introduced the 50% attacking-pitch visual language.

It includes:

- final-third movement: Leeds passes originating in final third;
- Left/Centre/Right attacking-third share;
- Gold penalty-area entries as origin → destination arrows;
- match selector controls all-season or individual-match pitch views.

Pitch is drawn in SVG/code, not generated imagery.

Current half-pitch mapping uses a `68 × 52.5` viewBox. Origins outside the attacking half can be clipped to the halfway edge **for display only**; underlying events are not changed.

Arrow styling was aligned with Pitch Events: 1.3 stroke, rounded line caps and matching arrowheads.

### G. Pressing & Defensive Structure — PR #115

PR #115 added an evidence-first pressing/defensive module:

- full-pitch defensive engagement map;
- mean engagement-height proxy;
- shared Gold PPDA;
- first-half PPDA;
- second-half PPDA;
- high-engagement counts;
- final-third engagement counts.

It also created one shared PPDA predicate/ratio source and routed Matches Compared through it.

The module explicitly distinguishes **defensive structure / engagement height** from actual pressure intensity/effectiveness. A higher engagement line and a lower PPDA are evidence signals, not by themselves proof of an effective high press.

### H. Shape in Each Phase — PR #116

PR #116 added phase tabs:

- Build-up
- Progression
- Final Third
- Defensive Block
- Press

The module shows:

- estimated player locations;
- inferred successful-pass connections for in-possession phases;
- observed width/depth;
- left-right asymmetry;
- most-involved players.

Evidence discipline:

- explicitly labelled **estimated event-derived structure**;
- never presented as tracking-derived positioning;
- width/depth use 10th–90th percentile event locations to reduce outlier distortion;
- pass connections use a transparent next-controlled-action inference within 12 seconds and the same period;
- Defensive Block and Press use the same 65m engagement threshold already exposed in the pressing module.

No Gold metric definitions were changed.

### I. Tactical Change Timeline — PR #117

PR #117 added automatic structural-change candidates.

Algorithm/evidence behaviour:

- scans each match at five-minute checkpoints;
- compares 10-minute before/after windows;
- measures Left/Centre/Right pass-origin distribution;
- measures territorial pass-origin distribution;
- measures defensive engagement height;
- suppresses nearby weaker candidates;
- displays a visual 0–90 timeline and before/after evidence cards for selected fixtures;
- season view shows the strongest candidate per fixture.

These are labelled **structural change candidates**. Do not call them formation changes or coaching intent without stronger evidence.

### J. Playing Style · Evidence Fingerprint — PR #118

PR #118 is the latest verified production feature and deployed successfully in Pages run #367.

It adds four transparent axes:

1. **Attacking width** — wide share of Gold final-third-entry destinations.
2. **Defensive engagement height** — mean x-position of the existing Technical Report defensive-event family.
3. **Progression tempo** — share of canonical pass chains reaching the final third within 10 seconds.
4. **Pass-chain length** — share of canonical pass chains containing 5+ passes.

Each axis includes a **Why?** evidence drilldown exposing the raw counts/values behind the marker.

This is intentionally an **evidence fingerprint**, not an arbitrary style score. It avoids unsupported labels such as “possession team”, “direct team”, “low block” or “high press”.

This pattern should be copied for future style axes: transparent input → visible marker → Why? evidence → only then, if validated, higher-level classification.

---

## 14. Set-Piece Analysis — current state

Page: `set-piece-analysis.html`.

Introduced in PR #113 and visually aligned further in PR #114.

Current controls:

- match selector: all season or individual fixture;
- side: For Leeds / Against Leeds;
- category tabs:
  - Corners
  - Free-kicks · final third
  - Throw-ins · final third

Current visual:

- responsive two-column layout;
- left: code-drawn 50% attacking pitch;
- right: KPI/share/evidence panel;
- restart origin → destination paths;
- successful delivery mint `#43ece0`;
- unsuccessful grey `#8e96a3`;
- shot dots red-ish `#ff6b72`;
- goals yellow `#FAD119`;
- SVG `viewBox="0 0 68 52.5"`;
- no generated image assets.

Current V1 restart scopes:

- Corners reuse existing `FILTERS.corners` where available, with `CornerTaken` qualifier fallback.
- Final-third free kicks are observed `FreeKickTaken` restarts with origin `x >= 66.67`.
- Final-third throw-ins are observed `ThrowIn` restarts with origin `x >= 66.67`.

Those final-third FK/throw-in scopes are **not new Gold definitions**.

Current KPIs:

- Restarts
- Delivery success %
- Into box
- Chances created (`KeyPass` on delivery)
- Shots
- Goals

Known limitations to preserve in wording:

- free-kick shot attribution can rely on provider set-piece qualifiers rather than a possession-linked restart chain;
- “Chances created” is currently `KeyPass` on the restart delivery, not every chance later in a second phase;
- “Into box” is destination-coordinate based;
- no xG, first-contact, second-ball, near/far-post classification, routine clustering, taker analysis, aerial outcome or possession-retention model yet;
- do not claim a tactical set-piece routine until repeated-pattern evidence supports it.

Good next set-piece extensions, if requested:

- delivery start zones;
- near/central/far destination zones;
- short vs delivered corners;
- taker breakdown;
- sequence-linked first/second phase;
- direct vs second-phase shots;
- match-by-match trend;
- For vs Against comparison;
- evidence drilldown;
- inswing/outwing only if provider data genuinely supports it.

---

## 15. Visual design direction

The user wants a professional analyst-dossier feel, not a metric dump.

Strong current visual language:

- dark PitchLab surfaces;
- restrained borders/cards;
- strong typography hierarchy;
- code/SVG pitches;
- 50% attacking pitch where it improves density;
- full pitch where defensive structure needs context;
- concise KPIs beside visual evidence;
- tabs for phases rather than stacking everything;
- tooltips / Why? / View Evidence for depth;
- match selector should drive all relevant modules on the page;
- evidence should be interactive but the default state should remain calm.

The user especially liked reference directions involving:

- pressing/defensive action maps with engagement-height lines;
- playing-style fingerprints;
- exits/progression under pressure;
- phase-shape maps;
- half-pitch attacking-third visuals;
- set-piece analysis for and against.

Do not copy unsupported labels from reference graphics. Reproduce the **visual communication idea**, but preserve PitchLab evidence discipline.

---

## 16. Tactical-analysis principles learned so far

### Structure is not pressure

Do not equate a high defensive engagement line with pressing intensity. Use multiple signals such as PPDA, high engagements/turnovers, final-third recoveries and engagement height, and keep the evidence separate where appropriate.

### Formation is not directly observable from events

Event-derived average positions can suggest structure. They do not prove a formation. Phase maps must remain labelled estimated event-derived structure.

### Fixed windows are evidence views, not tactical periods

15-minute windows are useful diagnostics. The change-point engine is the move toward automatically detected structural periods. Even then, call them candidates until enough evidence supports a tactical interpretation.

### Sequences are foundational

Canonical pass sequences unlock:

- progression origin;
- progression route;
- pass-chain length;
- tempo to final third;
- build-up start territory;
- repeatable route matrices.

But pass chains are not yet full possessions. Be precise about that distinction.

### Tactical labels require validation

Do not automatically call a regain-linked quick progression a “counterattack”. Do not call a slow long sequence “patient possession” merely because it is slow/long. First expose the measurable features; later create and validate classification rules.

### Confidence/evidence should be first-class

Longer-term narrative findings should look like:

> **HIGH CONFIDENCE · 4 supporting signals · View Evidence**

The confidence system itself must eventually be defined transparently, not invented ad hoc by prose generation.

---

## 17. Recommended engine roadmap from here

Much of the original roadmap is now partially implemented. The next chat should inspect current source before choosing the next increment, but the logical remaining direction is:

1. **Fuller possession model** — extend beyond pass-chain boundaries to controlled non-pass actions without breaking the canonical 10+ pass engine.
2. **Spatial role engine** — infer role/zone tendencies by phase and time segment, with event-derived caveat.
3. **Change-point enrichment** — connect structural candidates to goals, substitutions, cards, half-time and role/shape evidence.
4. **Pattern engine** — recurring passing/carrying routes and player combinations.
5. **Pressing/transition enrichment** — pressure escape, counterpress proxies, regain outcomes, with validated definitions before tactical labels.
6. **Strength/weakness detector** — compare repeated signals against suitable baselines; require multiple supporting signals.
7. **Set-piece pattern engine** — first/second phases, zones, takers, repeated routines, For/Against.
8. **Evidence/confidence layer** — every tactical conclusion linked to its supporting events/metrics.
9. **Natural-language report** — only after structured evidence is stable.

A particularly valuable next visual module is **progression / escaping pressure**, but only call something “under pressure” if a defensible pressure signal exists. Safe measurable components include progression by pass/carry/long ball, short goal-kick share, sequences escaping defensive third, sequences reaching final third and time to progress.

---

## 18. Recent PR chronology — continuity map

Key recent merges:

- #87 — filter administrative events to fix blank Match Momentum.
- #88 — smooth Momentum curves + marker hover.
- #89 — tiered Momentum V2.
- #93–#96 — Player Stats typography, export quality, portrait/name spacing.
- #97 — remove legacy nav tabs.
- #99 — correct Bahoya/Bard portrait assets.
- #104 — signed-off Actions Map visual overlay.
- #105/#106 — Actions Map PNG export and non-scaling-stroke fix.
- #108 — first real Technical Report channel engine.
- #109 — Match Evolution evidence.
- #111 — canonical possession-chain evidence.
- #112 — build-up and transition evidence.
- #113 — Set-Piece Analysis with half-pitch visuals.
- #114 — Technical Report attacking-half visuals + aligned arrow styling.
- #115 — Pressing & Defensive Structure + shared PPDA source.
- #116 — Shape in Each Phase.
- #117 — Tactical Change Timeline / structural-change candidates.
- #118 — Playing Style · Evidence Fingerprint.

Latest verified production deployment at handover time: PR #118 / Pages run #367 / success.

---

## 19. Repository workflow for the next chat

For each development change:

1. Fetch current `main` / relevant files. Never assume this handover is newer than the repository.
2. Identify the authoritative metric/engine before writing UI logic.
3. Search for an existing predicate or Gold definition before creating a new one.
4. Create a feature branch from current `main`.
5. Implement the smallest coherent increment.
6. Keep new descriptive thresholds/constants explicit and documented.
7. Do not modify unrelated Gold files.
8. Compare/audit the branch diff.
9. Open a PR with an evidence-discipline summary.
10. Confirm mergeability.
11. Merge promptly when clean.
12. Check the GitHub Pages workflow for the merge SHA.
13. Only say “live” after deployment succeeds.
14. Give the user a short implementation summary and what is logically next.

For data changes, use the canonical ingest pipeline. Do not manually create page-specific copies of fixture data.

---

## 20. Things NOT to do

- Do not use image generation for PitchLab visuals.
- Do not confuse PitchLab with LUFC Data V2.
- Do not duplicate Gold metric logic in a new page.
- Do not change Gold thresholds because a chart is awkward.
- Do not count qualifiers as separate actions when the underlying event is one action.
- Do not call event-derived shape “tracking data”.
- Do not call engagement height literal defensive-line height.
- Do not call structural-change candidates confirmed formation changes.
- Do not call regain-linked chains counterattacks until a validated classifier exists.
- Do not infer pressure/loss-under-pressure without a defensible pressure signal.
- Do not add Newcastle 4–1 from the WhoScored URL without the canonical raw JSON unless the user explicitly reopens that work.
- Do not add a match separately to widgets/pages; ingest once centrally.
- Do not declare a deployment successful without checking it when verification is available.
- Do not undo visuals the user has explicitly signed off.

---

## 21. Source files worth inspecting first

Depending on the next request, start with these rather than guessing:

### Season/data
- `data/season/2026-27/manifest.json`
- `scripts/season_ingest.py`
- `.github/workflows/season-ingest.yml`
- `docs/CLOUD_SEASON_INGEST_2026-09-08.md`

### Gold / metrics
- `docs/CANONICAL_METRIC_REGISTRY.md`
- `docs/GOLD_VALIDATION_FIXTURES.json`
- `docs/10_PASS_SEQUENCES_GOLDEN.md`
- `docs/CARRY_FAMILY_GOLDEN.md`
- `ui-action-outcome-definition.js`
- `ui-sequence-metrics.js`
- `ui-final-third-entries-gold.js`
- `ui-penalty-area-entries-gold.js`
- current shared PPDA source introduced by PR #115 — search current `main` before editing.

### Technical Report
- `technical-report.html`
- `ui-technical-report.js`
- `ui-technical-report.css`
- `ui-technical-report-transitions.js`
- `ui-technical-report-transitions.css`
- `ui-technical-report-pitches.js`
- `ui-technical-report-pitches.css`
- pressing/phase/change-point/style-fingerprint modules added by PRs #115–#118 — inspect their current filenames from `technical-report.html` before modifying.

### Set pieces
- `set-piece-analysis.html`
- `ui-set-piece-analysis.js`
- `ui-set-piece-analysis.css`

### Other surfaces
- `player-stats.html`
- `ui-player-stats.js`
- `ui-player-stats.css`
- `ui-actions-map.js`
- `ui-heatmap.css`
- `ui-season-export-canvas.js`
- `ui-season-nav.js`

---

## 22. Immediate continuation state

The last attempted topic was adding **Leeds 4–1 Newcastle, WhoScored match 1983600** without a JSON file. That work is now explicitly **paused** by the user. Do not continue non-JSON ingest.

The user then said to return to **new development features**.

Therefore the next chat should begin from the current production Technical Report / Set-Piece Analysis state, inspect current `main`, and continue building the tactical-analysis engine using the rules above.

The most recent major feature is the **Playing Style · Evidence Fingerprint** (PR #118), after the sequence:

**attacking-half visuals → pressing/defensive structure → phase structure → structural-change timeline → evidence fingerprint.**

A strong next step is to connect these modules more deeply rather than add decorative cards: pattern recognition, pressure/progression evidence, richer phase comparisons, or evidence-backed strengths/weaknesses. Whichever is chosen, preserve the architecture:

> **raw events → canonical definitions → structured evidence → visual explanation → tactical inference → narrative**

and the product philosophy:

> **Enormous analytical depth underneath → beautifully simple tactical intelligence on the surface.**

---

## 23. Final instruction to the next ChatGPT chat

Treat this document as a continuity map, **not as permission to skip repository inspection**. The repository is the final source of truth.

Before making the next change:

- fetch current `main`;
- inspect the relevant live modules;
- identify existing canonical definitions;
- preserve Gold;
- implement through a branch/PR;
- verify deployment;
- keep the UI visually beautiful and evidence-first.

The user wants momentum. Once the source is inspected and the next feature is clear, **build it**.