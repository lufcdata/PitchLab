# PITCHLAB — SEASON PERFORMANCE MASTER HANDOVER
## Status: 9 September 2026
## Repository: `lufcdata/PitchLab`

This handover is the authoritative continuity note for the next ChatGPT session. It records the current production state, Golden Rules, architecture, season-data pipeline, Season Performance implementation, PNG export work, validation/deployment workflow, solved problems, and the exact unfinished task.

---

# 1. START HERE — NON-NEGOTIABLE

Before changing anything:

1. Inspect the current GitHub `main` branch and its exact HEAD. GitHub is the code source of truth; this handover is context, not a substitute for inspection.
2. Read this handover and inspect the files named below.
3. Verify the current GitHub Pages state before claiming anything is live.
4. Make the smallest safe change on a branch, inspect the diff, open a PR, merge only when satisfied, then verify the GitHub Pages deployment for the exact merge SHA.
5. Every browser-affecting change requires a cache-token bump in the relevant loaders. At handover, both `index.html` and `season-performance.html` use `metrics-109`.
6. Do not rewrite or simplify Gold metric definitions to make a visual or third-party number match.
7. Do not create a second analytics engine for Season Performance. Reuse the existing authoritative metric definitions, canonical timing, carry engine, pitch renderer and Gold families.
8. Derived sequences must never cross fixture boundaries.

Central architecture rule:

**ONE METRIC → ONE AUTHORITATIVE DEFINITION → ALL RELEVANT SURFACES.**

Season aggregation rule:

**RAW EVENTS MAY AGGREGATE ACROSS MATCHES; DERIVED SEQUENCES MUST CALCULATE MATCH-BY-MATCH FIRST, VALIDATE, THEN AGGREGATE.**

---

# 2. EXACT CURRENT PRODUCTION STATE AT HANDOVER

At the moment this handover branch was created, `main` HEAD was:

`5e3d6c9ebc1c8534dbbf7fdcb6ad7cd3dc2d9a8d`

Commit message:

`Match Season export strokes to live pitch`

Its parent is the previous Season export header/player-icon work:

`0b689622ba0b55504c51b0df595890f4c27de18b`

The current browser cache token is:

`metrics-109`

in both:

- `index.html`
- `season-performance.html`

Always re-fetch `main` before making the next change because it may have advanced after this note was written.

---

# 3. IMMEDIATE UNFINISHED TASK — DO THIS FIRST

The user compared the Season Performance PNG export against the live PitchLab event map and said the exported arrow/event strokes were still visually too thin.

A stroke-parity change has already landed in `main` at `5e3d6c9...`. The current export compositor reads the live SVG line stroke width and applies it to the 2× export SVG. However, after seeing the result, the user's latest instruction is explicitly:

> **Make the stroke slightly thicker for the arrow lines please.**

This is the first task for the next chat.

Important: do **not** broadly redesign the arrows. Make a small export-only visual adjustment. Preserve the live metric/event population and Gold logic. The likely change is a modest multiplier to the exported line stroke in `drawSvgOverlay()` in `ui-season-export-canvas.js`, on top of the correctly scaled live stroke. The current code effectively uses:

`line.setAttribute('stroke-width', String(stroke * EXPORT_SCALE));`

The user wants this **slightly thicker**, not dramatically heavier. Inspect the current file before editing and use a restrained multiplier. Bump the cache token after the browser change.

Do not image-generate anything. The user explicitly does not want image generation for this work.

---

# 4. GOLDEN WORKFLOW

The user expects a disciplined workflow and has repeatedly asked us to preserve it.

For every change:

1. Fetch current `main` HEAD.
2. Inspect the relevant implementation and data flow before editing.
3. Identify the authoritative implementation; do not duplicate logic.
4. Create a narrow branch from exact current `main`.
5. Make the smallest safe change.
6. Bump the browser cache token when browser-visible JS/CSS/HTML changes.
7. Open a PR.
8. Inspect changed filenames and/or patch. Confirm no accidental metric/data changes.
9. Merge.
10. Record the exact merge SHA.
11. Check the GitHub Pages workflow for that exact SHA.
12. Only say **live** after Pages succeeds for that exact SHA.
13. Where visual behavior cannot be independently inspected with available tools, ask the user to visually verify the deployed page rather than claiming a visual Gold pass.

User working preference: less commentary, more progress. When they say `KEEP GOING`, `GO GO GO`, etc., use tools and advance the work rather than narrating what could be done.

---

# 5. CORE REPOSITORY ARCHITECTURE

Important files:

- `index.html` — primary PitchLab loader/cache token.
- `base.html` — legacy/core app, global fixture/event population and pitch renderer.
- `season-performance.html` — Season Performance loader and cache token.
- `ui-season-performance.js` — Season Performance orchestration/data population.
- `ui-season-performance.css` — Season Performance layout.
- `ui-season-multi-metrics.js` / `.css` — multi-metric selection and combined plotting.
- `ui-season-export-canvas.js` — 1080×1350 design compositor rendered at 2× for premium PNG export.
- `ui-season-validation.js` — season-level integrity/Gold gates.
- `ui-season-nav.js` — navigation between Pitch Events and Season Performance.
- `ui-canonical-time-window.js` — canonical period/time-window semantics.
- `ui-pitch-time-window.js` — Gold event filtering/rendering through canonical time.
- `ui-carry-metrics.js` — authoritative carry reconstruction.
- `ui-carry-canonical-window.js` — canonical carry window/filtering.
- `ui-heatmap.js` / `.css` — existing heatmap implementation reused by Season Performance.
- `ui-timings.js` — dynamic Match Timings implementation.
- `scripts/season_ingest.py` — deterministic season-pack ingest.
- `.github/workflows/season-ingest.yml` — cloud ingest/review workflow.
- `data/season/2026-27/manifest.json` — season manifest.
- `data/season/2026-27/<matchId>.json.gz` — compact per-match event packs.
- `assets/export/Full Canvas.png` — immutable export background/branding template.

The existing metric modules loaded by `season-performance.html` are the source of truth. Season Performance is a new surface over the same metric engine, not a fork.

---

# 6. SEASON PERFORMANCE — PRODUCT REQUIREMENTS AND CURRENT BEHAVIOR

Season Performance was created to visualise a player's or the whole team's events across multiple matches in the season while retaining the existing PitchLab metric definitions and pitch visuals.

Requirements implemented through the work:

- Season-wide date filtering.
- Match counter.
- Player selector, including Whole Team.
- Existing Match Period feature.
- Event Map / Heat Map modes.
- Metric selection is now **multi-select checkboxes**, not a single dropdown.
- `Clear All` exists for the metric selections.
- Metrics selector is underneath Player, half-page width, and tall enough to show all metrics without internal scrolling.
- Event Map / Heat Map controls were moved into the side controls near the Match selector.
- Pitch Events navigation was repaired after it stopped working.
- Multiple metrics can be plotted at once.
- Player/date/period changes keep the selected metric layers synchronized.
- PNG export understands combined selections.
- `Total Throw-Ins` was added to Season Performance using the existing Successful + Unsuccessful Throw-In Gold populations. Do not create a new conflicting throw-in definition.

The user wants the surface to remain useful both interactively and for high-quality social/analysis exports.

---

# 7. HOME/AWAY NORMALISATION — CRITICAL

Leeds is the subject, not `home` or `away`.

Every season match pack retains its true fixture identity. The season layer resolves Leeds by team identity/team ID and must work regardless of whether Leeds is home or away.

Gold mixed test set:

- Nottingham Forest 0–1 Leeds — Leeds away.
- Leeds 1–1 Brentford — Leeds home.
- Brighton 1–1 Leeds — Leeds away.

Leeds team ID is `19` in all three.

Raw team IDs:

- Forest `174`, Leeds `19`.
- Leeds `19`, Brentford `189`.
- Brighton `211`, Leeds `19`.

WhoScored coordinates in these raw files were already attack-normalised: Leeds shots in both home and away fixtures point toward the same attacking end. Do not introduce a home/away coordinate flip unless new source evidence proves one is required.

Gold validation should continue to consider:

- Leeds-home only.
- Leeds-away only.
- Mixed home/away.
- All selected fixtures.
- player population.
- ordinary event metrics.
- carries/progressive carries.
- heatmaps.
- Match Period.
- against metrics.

---

# 8. SEASON DATA ARCHITECTURE

Do not load an entire raw season as one giant analytics object and do not commit transfer raw JSONs to production.

Production architecture:

- Tiny manifest: `data/season/2026-27/manifest.json`.
- One compressed deterministic event pack per fixture: `data/season/2026-27/<matchId>.json.gz`.
- Browser loads only the packs needed for the selected date range.
- Future IndexedDB caching is optional, not required for correctness.

The three initial authoritative season fixtures are:

### 1983552 — Nottingham Forest 0–1 Leeds
- Date: 2026-08-22
- 1,419 events
- Leeds away, teamId 19
- pack: `data/season/2026-27/1983552.json.gz`
- gzip size at creation: 67,612 bytes
- compact payload SHA256: `4f381e8c808cdab3fbe6e5e21165d0fc40d2bda857168a083c69fc7d3f2275a2`
- gzip SHA256: `6cacc0bebef53a712686016639223a165d6210e9e750a0e8c4a268b2f6e61f90`

### 1983559 — Leeds 1–1 Brentford
- Date: 2026-08-30
- 1,542 events
- Leeds home, teamId 19
- pack: `data/season/2026-27/1983559.json.gz`
- gzip size: 73,820 bytes
- payload SHA256: `98bfc4480c9c992b5ba4c846476a4c696014c7a5eda90abb672b22bb321cf94a`
- gzip SHA256: `d6b7245b976f247316c796fe2ec5e4602933c3f89b4b39e6f9c33b4874afe3d3`

### 1983572 — Brighton 1–1 Leeds
- Date: 2026-09-05
- 1,442 events
- Leeds away, teamId 19
- pack: `data/season/2026-27/1983572.json.gz`
- gzip size: 69,831 bytes
- payload SHA256: `b6986d9c7ffc050f281e08a1fcccc9677f5d000deab4cf78ecfdb2d2efd05436`
- gzip SHA256: `155ee6d95e936198d37b93c90474c553d4f48b73acfea3641605fa5f31bf0b1a`

The temporary raw transfer files were deliberately removed after materialisation. Do not re-add them to `main`.

---

# 9. CLOUD INGEST PIPELINE

The permanent ingest foundation is already in production.

`scripts/season_ingest.py`:

- validates the raw JSON.
- validates Leeds is exactly one side and resolves its team ID.
- writes canonical manifest identity.
- produces deterministic gzip (`filename=''`, `mtime=0`, compression level 9).
- produces the compact pack schema.
- records/verifies SHA256 of compact uncompressed JSON.
- upserts the manifest.
- verifies the result.
- accepts `.json` or `.json.gz` input.

`.github/workflows/season-ingest.yml`:

- `workflow_dispatch`.
- takes a `source_ref` (normally `season-incoming`) and `raw_path`.
- checks out production code.
- fetches source ref and reads raw input into temporary local working space.
- runs ingest and validation.
- creates a review branch/PR.
- raw source is not committed to production `main`.

Infrastructure merges that established this included:

- PR #56 → `4cafe346431f9fe5d74abd1ce1d7aa8573b94612`
- PR #57 → `f96dbca560ef721fb2cece83c8aa7fcf039d7aa3`

The old temporary materialiser/staging branches and workflow experiments are obsolete. Do not resurrect them unless debugging a genuinely new ingest failure.

---

# 10. DERIVED-SEQUENCE BOUNDARY RULE

This is one of the most important learnings from Season Performance.

Ordinary independent events may be combined into a season population and then filtered/rendered.

Carries and any other sequence-derived metric **must not** be reconstructed from concatenated multi-match raw events. That can create impossible sequences spanning the end of one fixture and the start of another.

Correct flow:

1. Load fixture A.
2. Reconstruct its derived sequences using the canonical engine.
3. Validate sequence endpoints belong to fixture A.
4. Repeat for fixture B, C, etc.
5. Aggregate the already-derived results.
6. Apply season/player/time presentation filtering as appropriate.

Season carry validation checks include:

- expected per-match carry count equals tagged season carry count.
- every carry start/end event ID belongs to its originating pack.
- aggregate total equals the sum of per-match totals.
- failure throws rather than silently continuing.

Rule in short:

**CALCULATE PER MATCH → VALIDATE → AGGREGATE.**

---

# 11. CARRY ENGINE — PRESERVE THE GOLD WORK

Carry Engine V6 was merged earlier and user-confirmed working. Do not casually alter it while working on Season Performance UI/export.

V6 preserved the locked 5m carry/progressive thresholds and Forest Gold regression while recovering two validated Brighton patterns:

1. Defensive acquisition → foul carry allowed when exact elapsed gap is at least 2 seconds. This recovered Gudmundsson 28:53→28:56.
2. `looseFoulOrigin`: when the player's BallRecovery is preceded within <=3 seconds by an opponent unsuccessful BallTouch and the player is then fouled, use the normalized loose-ball location as origin. This recovered late Gudmundsson 86:54 loose touch → 86:57 foul.

The 5m threshold was **not** lowered.

A SofaScore map showed 11 Gudmundsson arrows, but forensic review found unsupported/suspicious movements. In particular:

- 9:37→9:41 reception movement was only 4.11m, below locked 5m threshold.
- 28:53→28:56 was a valid ~20.07m carry.
- 86:54→86:57 was a valid ~6.48m loose-ball-origin carry.
- a very long diagonal on the Sofa map did not correspond to a clean same-player WhoScored sequence.

Do not force PitchLab to match a third party by inventing unsupported carries.

---

# 12. CANONICAL TIME / STOPPAGE-TIME RULE

Period semantics must remain football-correct.

Examples:

- `45+3` belongs to the **first half**.
- minute `46` is the **second half**.
- `90+4` belongs to **second-half stoppage time**, not extra time.
- cup extra time begins after regulation and runs through 120 minutes.

The app has canonical time-window logic precisely to avoid treating stoppage notation as naïve elapsed-minute buckets. Do not replace this with simple numeric comparisons that turn `45+2` into minute 47 / second half or `90+8` into extra time.

Match Timings were previously fixed so the timing panel derives from the loaded fixture. Missing stripped details render `—`, not fake zeroes. Ball In Play is explicitly estimated only when the needed restart qualifiers exist.

---

# 13. PNG EXPORT — CURRENT DESIGN CONTRACT

The export is a major user priority. It is intended to look like a premium 1080×1350 social graphic while exporting at higher pixel density.

## Immutable background

`assets/export/Full Canvas.png`

- design dimensions: exactly 1080×1350.
- background: `#191b2a`.
- contains permanent bottom branding: Leeds rose left, `lufcdata` centred, `LUFCDATA.LAB` right.
- known authoritative source SHA256: `18815a6a7f98a2c390521d8897e2a87161da6fea11aae70ee5d45b4b6e0bd865`.
- repository file size when installed: 26,496 bytes.

**Do not modify or redraw Full Canvas.png.** Everything dynamic is overlaid on top.

## Export resolution

The compositor uses:

- design coordinate space: 1080×1350.
- `EXPORT_SCALE = 2`.
- output bitmap: **2160×2700** PNG.
- high-quality canvas image smoothing.

This was introduced because direct 1080×1350 rasterisation looked pixelated. Keep the 2× output unless the user explicitly requests another resolution.

## Current pitch placement

In `ui-season-export-canvas.js`:

`PITCH = { x:191, y:130, w:694, h:1074 }`

This was tuned to match the user's supplied reference layout. Do not casually shrink it back to the earlier export layout.

## Header contract

For Whole Team:

- title is `Leeds`.
- Leeds badge/icon.

For one player:

- title is the selected player name, e.g. `Anton Stach`.
- use a real player portrait where resolvable.
- do **not** incorrectly use the Leeds badge as the fallback for an individual player.
- current fallback is a clean circular initials badge if no real portrait resolves.

Current player image candidate logic checks option data fields, local `assets/player-images/<slug>.png`, local ID path, then a remote candidate. Inspect before changing.

The player/team icon was enlarged to 82px and moved slightly downward to match the reference.

Header second line is compact, e.g.:

`Premier League | Leeds | 0:00 - FT`

The gap between title and this second line was deliberately reduced.

Third line shows match count, e.g. `Whole 3 matches`.

Top-right event count shows the number and the label **EVENTS**. The old word `shown` must remain removed.

## Attacking Direction

Added to match the reference:

- vertical text: `Attacking Direction`.
- text colour: `#f5f6fa`.
- upward arrow colour: `#52eecf`.
- positioned immediately left of the pitch.

Preserve it.

## Legends

The legend was deliberately condensed.

Do **not** show a duplicate metric heading plus outcome labels.

Example for Total Passes:

- `Successful Passes`
- `Unsuccessful Passes`
- `Event Start`

Not:

- `TOTAL PASSES`
- `Successful`
- `Unsuccessful`
- `Event Start`

For a metric such as Duels Won, remove the first duplicated main title and retain the actual legend item `Duels Won`.

Legends were made larger, tighter and centre-aligned. Preserve the compact centred treatment.

---

# 14. EXPORT STROKE / ARROW QUALITY — CURRENT LEARNING

This is the active visual issue.

Earlier exports looked thinner than the live PitchLab event map. A first attempt simply multiplied the export strokes, but the user still observed a mismatch. The current implementation at `main` HEAD `5e3d6c9...` clones `#eventSvg`, reads each live line's computed `strokeWidth`, and scales it for the 2× export bitmap.

Current logic in `drawSvgOverlay()`:

- clone live SVG.
- set clone raster size to pitch size × `EXPORT_SCALE`.
- pair live and cloned `line` elements.
- read `getComputedStyle(source).strokeWidth`.
- fall back to line's `stroke-width` or 1.5.
- set export line stroke width based on live stroke × export scale.
- rasterise the SVG at 2× and composite it onto the 2× canvas.

This solved the structural scaling problem, but the user's latest visual comparison still asks for the exported arrow lines to be **slightly thicker**.

Next change should be deliberately small and export-only. Do not alter the live page stroke just to make the PNG heavier.

Also remember arrowheads/markers can visually influence perceived thickness. Inspect the rendered result after changing line width; do not accidentally create oversized arrowheads or blobs.

---

# 15. PLAYER PORTRAITS — CURRENT STATUS

The export previously showed the Leeds badge even when an individual player such as Anton Stach was selected. That was wrong.

The export now attempts to resolve an individual portrait from:

1. selected option `data-image`.
2. `data-photo`.
3. `data-portrait`.
4. local slug path `assets/player-images/<player-slug>.png`.
5. local ID path `assets/player-images/<player-id>.png`.
6. remote player-image candidate.
7. if all fail, circular initials fallback.

The user supplied a screenshot showing an `AS` initials fallback after the fix, so the wrong Leeds badge problem was solved, but a real Anton Stach portrait still was not resolved in that screenshot. If portrait completeness becomes the next request, inspect the existing player database/image architecture first rather than adding another disconnected image source.

---

# 16. HEATMAP

The existing heatmap implementation was previously tightened and the unwanted dark overlay removed. The user was happy with that state.

Season Performance reuses the existing heatmap rather than maintaining a second heatmap engine.

Export logic distinguishes heatmap vs event SVG and composites the existing heatmap canvas when appropriate.

Do not regress the signed-off heatmap while adjusting export arrows.

---

# 17. THROW-INS

Season Performance now includes `Total Throw-Ins` in addition to successful and unsuccessful populations.

This must remain a composition of the existing authoritative successful + unsuccessful throw-in definitions. Do not introduce a separate raw-event interpretation that can disagree with the Gold throw-in family.

The relevant existing module is `ui-throw-in-touch-territory-definition.js` plus the Gold metric wiring already loaded by the app.

---

# 18. MULTI-METRIC UI

The user explicitly rejected the old single Metric dropdown for Season Performance.

Current desired behavior:

- checkbox-style metric selector.
- choose several metrics simultaneously.
- `Clear All` button.
- selector directly underneath Player.
- half-width of the page.
- tall enough to see the full metric list without an internal scrollbar.

Do not revert to a single-select `<select>` UI.

The export legend and filename/metric label logic must continue to understand multiple selected metrics.

---

# 19. NAVIGATION / CONTROLS

Current desired control layout:

- Event Map / Heat Map toggle controls live in the side/control panel near Match selector rather than floating in the old location.
- Pitch Events navigation must continue to work from Season Performance.

Pitch Events broke once during these UI changes and was repaired. When changing shared navigation/control DOM, explicitly test both surfaces.

---

# 20. SEASON VALIDATION MODULE

`ui-season-validation.js` is a protective layer, not decorative logging.

It has included checks for:

- independent Leeds player population parity.
- fixture-boundary integrity.
- manifest event-count parity.
- duplicate match IDs.
- duplicate pack paths.
- internal matchId mismatch.
- wrong event tags.
- aggregate parity.
- Leeds identity.
- player population.
- orientation.
- carry validation.

Validation should fail loudly on structural contamination rather than quietly presenting plausible-looking numbers.

---

# 21. IMPORTANT MERGED SEASON PERFORMANCE MILESTONES

Useful continuity points:

- PR #55 — initial Season Performance V1 surface, eventually merged and deployed.
- PR #56 — cloud season-ingest foundation, merge `4cafe346431f9fe5d74abd1ce1d7aa8573b94612`.
- PR #57 — ingest follow-up, merge `f96dbca560ef721fb2cece83c8aa7fcf039d7aa3`.
- PR #58 — Total Throw-Ins + multi-metric checkboxes, merge `68d204deac4dce183fab41091f98b1201d4372d1`.
- PR #59 — Clear All + Event/Heat controls move + Pitch Events navigation repair, merge `9c32594085cdf8601e67b4723bcababa38240c38`.
- PR #60 — metrics selector under Player, half-width, no internal scroll, merge `f303965c43bf2fc8298832feba3637589ea42b14`.
- PR #61 — major PNG export composition rebuild around supplied 1080×1350 reference, merge `19c174fda4b3ef04f9079c1492935d04340bc088`.
- PR #62 — 2× premium PNG export, larger/tighter centred legends, larger icon, merge `c50ff908338aea8a5e384c17008f82475694a98a`.
- PR #63 — condensed export legends, merge `eaed0bd7dcaa4b5c35cb85bfef4baec059cb77c8`.
- PR #64 — Attacking Direction, tighter header spacing, icon positioning, player portrait/fallback correction, initial stroke adjustment, merge `0b689622ba0b55504c51b0df595890f4c27de18b`.
- Latest `main` at handover: `5e3d6c9ebc1c8534dbbf7fdcb6ad7cd3dc2d9a8d` — `Match Season export strokes to live pitch`.

Do not assume these are still the latest after 9 September; inspect GitHub first.

---

# 22. DEPLOYMENT DISCIPLINE

PitchLab is deployed with GitHub Pages via `.github/workflows/pages.yml`.

Past workflow discipline that worked well:

- merge PR.
- capture exact merge SHA.
- locate Pages run whose `head_sha` is exactly that SHA.
- wait for successful completion.
- only then tell the user the change is live.

Do not equate `mergeable`, `merged`, or an empty combined-status result with a successful Pages deployment.

Cache busting is important because the user often checks the live front end immediately after a merge. If they cannot see a change, first verify Pages completion and the cache token before assuming the code failed.

---

# 23. USER'S VISUAL REFERENCE / DESIGN INTENT

The export should feel like the user's supplied Anton Stach / James Justin references:

- dark premium 4:5 canvas.
- player/team identity at top.
- compact competition/team/time subtitle.
- match count beneath.
- event count top-right above pitch.
- dominant tall pitch.
- attacking-direction indicator on left.
- event arrows/points with live-site visual weight.
- compact centred legends immediately beneath pitch.
- permanent Leeds rose / `lufcdata` / `LUFCDATA.LAB` branding at bottom from Full Canvas.png.

The user is now very close to signing this off. Prefer surgical visual refinements over redesigns.

---

# 24. THINGS NOT TO DO

- Do not change `Full Canvas.png` unless the user explicitly asks.
- Do not use image generation for these UI/export amendments.
- Do not modify Gold metric populations to solve a visual problem.
- Do not lower carry thresholds to match SofaScore.
- Do not concatenate multi-match raw events and reconstruct carries across them.
- Do not assume Leeds is always home or always away.
- Do not naïvely turn `45+2` into second-half minute 47 or `90+8` into extra time.
- Do not reintroduce raw season transfer JSONs to `main`.
- Do not create duplicate Season Performance metric definitions.
- Do not revert the metric checkboxes to a dropdown.
- Do not show duplicated legend headings.
- Do not show the Leeds badge for an individual player when a portrait is unavailable; use the established player fallback logic.
- Do not claim a deployment is live until exact-SHA Pages success is confirmed.

---

# 25. RECOMMENDED NEXT SESSION OPENING

The next ChatGPT should say, in effect:

> I have inherited the 9 September 2026 PitchLab Season Performance handover. I will inspect the current `lufcdata/PitchLab` `main` branch and `docs/HANDOVER_SEPT_9TH_2026_SEASON_PERFORMANCE.md` before changing anything. GitHub is the source of truth. The immediate unfinished task is a small export-only increase to the Season Performance arrow-line stroke weight, preserving live metrics, Gold definitions, Full Canvas.png, 2× premium export, and the existing Season Performance architecture.

Then actually inspect GitHub before editing.

---

# 26. FINAL STATE SUMMARY

Season Performance is now a genuine multi-match PitchLab surface rather than a prototype. It reuses the Gold metric engine, handles Leeds across home and away fixtures, loads compact per-match season packs, calculates derived sequences safely per fixture, supports player/whole-team and multi-metric plotting, reuses canonical Match Period and heatmap behavior, and produces a premium 2× PNG over the immutable Full Canvas template.

The export layout is close to sign-off. The active final visual refinement is simple:

**Make the exported event arrow lines slightly thicker than the current `5e3d6c9...` result while leaving the live page and all metric/data logic untouched.**

Protect everything else that is already working.