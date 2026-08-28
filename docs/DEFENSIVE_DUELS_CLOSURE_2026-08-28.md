# Defensive + duel closure — 2026-08-28

This note closes the **definition audit** for the defensive and duel families on `metric-sync-audit-2026-08-27`. It does not promote metrics to `GOLD_LOCKED` without an independent trusted control.

## Forest 0–1 Leeds (`whoscored:1983552`)

### Defensive family

| Metric | Authoritative definition | Forest | Leeds | Status |
|---|---|---:|---:|---|
| Tackles Won | `Tackle` | 8 | 19 | `GOLD_LOCKED` |
| Tackles Lost | `Challenge` | 7 | 10 | `GOLD_LOCKED` |
| Tackles | `Tackle OR Challenge` | 15 | 29 | `GOLD_LOCKED` |
| Clearances | `Clearance AND NOT BlockedCross` | 32 | 31 | `GOLD_LOCKED` |
| Blocked Shots | `Save + OutfielderBlock` | 6 | 1 | `GOLD_LOCKED` |
| Blocked Crosses | `BlockedPass OR (Clearance + BlockedCross)` | 7 | 7 | `GOLD_LOCKED` |
| Blocks | Blocked Shots OR Blocked Crosses | 13 | 8 | `GOLD_LOCKED` |
| Blocked Passes | raw `BlockedPass` subtype | 7 | 5 | `RAW_RECONCILED_PENDING_HEADLINE_CONTROL` |
| Dispossessed | `Dispossessed` | 9 | 3 | `GOLD_LOCKED` |
| Errors | `Error` | 1 | 0 | `GOLD_LOCKED` |

The corrected trusted Opta Clearances control is **32–31**, not 32–21. Raw Clearance is 32–33; Leeds has two `Clearance + BlockedCross` events, producing 32–31 after the semantic exclusion. The supplied Bournemouth–Leeds Clearances control is **24–62** and remains a second-fixture validation target because the repository raw file is currently too large for the GitHub connector to return as usable event JSON.

`BlockedPass` is retained as a distinct raw event population, but it must not be presented as independently Gold merely because those events participate in the Gold Blocked Crosses reconstruction.

### Aerial duel family

Canonical aerial population is `Aerial` plus `Foul + AerialFoul`. Provider `Offensive` / `Defensive` qualifiers define the attacking/defensive split; pitch x-coordinate is not used as a substitute.

| Metric | Forest | Leeds | Status |
|---|---:|---:|---|
| Aerial Duels Won | 30 | 25 | `GOLD_LOCKED` |
| Aerial Duels Lost | 25 | 30 | `GOLD_LOCKED` |
| Total Aerial Duels | 55 | 55 | `GOLD_LOCKED` |
| Attacking Aerial Duels | 27 | 28 | `GOLD_LOCKED` |
| Defensive Aerial Duels | 28 | 27 | `GOLD_LOCKED` |
| Attacking Aerial Won / Lost | 13 / 14 | 11 / 17 | `DERIVED_FROM_GOLD_COMPONENTS` |
| Defensive Aerial Won / Lost | 17 / 11 | 14 / 13 | `DERIVED_FROM_GOLD_COMPONENTS` |

### Ground and total duel family

The signed-off Ground Duels Won population is:

`Tackle OR successful TakeOn OR successful non-aerial Foul`

Its exact outcome-symmetric lost population is:

`Challenge OR unsuccessful TakeOn OR unsuccessful non-aerial Foul`

This produces:

| Metric | Forest | Leeds | Status |
|---|---:|---:|---|
| Ground Duels Won | 31 | 41 | `GOLD_LOCKED` |
| Ground Duels Lost | 34 | 28 | `RAW_RECONCILED_PENDING_HEADLINE_CONTROL` |
| Total Ground Duels | 65 | 69 | `RAW_RECONCILED_PENDING_HEADLINE_CONTROL` |
| Duels Won | 61 | 66 | `DERIVED_FROM_GOLD_COMPONENTS` |
| Duels Lost | 59 | 58 | `RAW_RECONCILED_PENDING_HEADLINE_CONTROL` |
| Total Duels | 120 | 124 | `RAW_RECONCILED_PENDING_HEADLINE_CONTROL` |

The four provisional residuals above are **definition-complete**. Their remaining debt is evidence/status only: an independent trusted headline control is required before promotion to Gold. No new event logic should be invented merely to remove that status.

## Runtime ownership

`ui-extra-metrics.js` loads before the canonical metric modules and still contains legacy fallback predicates for several defensive/duel keys. The later canonical modules overwrite those predicates at runtime, so the current preview resolves to the audited definitions. Removing the stale fallback ownership is a separate cleanup task and must not be mixed with semantic changes.

## Closure decision

The defensive/duel **semantic-definition pass is closed**. Remaining work in these families is limited to:

- Bournemouth second-fixture execution for Clearances when raw events can be read locally;
- independent headline controls for Blocked Passes and the four ground/total-duel residuals;
- removal of legacy fallback predicate ownership from `ui-extra-metrics.js` in a separate non-semantic cleanup commit.

Do not reopen the signed-off definitions without contradictory trusted evidence.