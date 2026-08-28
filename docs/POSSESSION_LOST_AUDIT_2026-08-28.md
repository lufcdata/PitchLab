# Possession Lost / Dispossessed / Turnovers clarification — 2026-08-28

## Taxonomy correction

`Possession Lost`, `Dispossessed`, and `Turnovers` are **three independent PitchLab metrics**.

The existing **Possession Lost** metric is already working correctly and is protected. It must remain standalone and **must not be renamed, recalculated, regrouped, or modified by this audit**.

The previous attempt to reconstruct a new 147–129 `Possession Lost` definition is retired. It was auditing the wrong semantic target and must not drive implementation changes.

There is no parent/category label called `Possession Lost` for the Dispossessed / Turnovers work.

## Trusted controls — Forest 0–1 Leeds (`whoscored:1983552`)

| Metric | First half | Full match | Status |
|---|---:|---:|---|
| Dispossessed | Forest 4 – 3 Leeds | Forest 9 – 3 Leeds | `GOLD_LOCKED` |
| Turnovers | Forest 12 – 9 Leeds | Forest 14 – 13 Leeds | `RAW_RECONCILED_PENDING_INDEPENDENT_HEADLINE_CONTROL` |

## Dispossessed

Authoritative definition remains the raw `Dispossessed` event population. Full-match control is 9–3 and first-half control is 4–3. Do not alter this definition while solving Turnovers.

## Turnovers — provider event-family identification

The raw Turnovers candidate family is not merely inferred from the event name. In Forest–Leeds every candidate carries WhoScored/Opta `satisfiedEventsTypes` marker **69**:

- Forest: 16 marker-69 events.
- Leeds: 13 marker-69 events.
- All 29 marker-69 events are `BallTouch` + `Unsuccessful`.
- No other event type in the fixture carries marker 69.

This exact structural relationship independently reproduces in Bournemouth 2–2 Leeds (`whoscored:1903384`):

- Bournemouth: 16 marker-69 events.
- Leeds: 7 marker-69 events.
- All 23 marker-69 events are again `BallTouch` + `Unsuccessful`.
- No other event type in the fixture carries marker 69.

The Bournemouth fixture therefore provides a genuine second-fixture raw validation of the underlying provider event family. It does **not** by itself provide an independent published Turnovers headline control, so it is structural validation rather than permission to Gold-lock the metric.

## Forest–Leeds event-chain reconstruction

Raw marker-69 unsuccessful `BallTouch` is the base event family:

- Forest: 16 full match; 12 events explicitly tagged `FirstHalf`.
- Leeds: 13 full match; 8 events explicitly tagged `FirstHalf`.

The full-match Forest overcount is explained by two event-chain duplicates rather than a fixture correction:

1. **68:36 Forest unsuccessful BallTouch** occurs after Forest have already lost possession: Forest successful TakeOn (68:32) -> Forest unsuccessful Pass (68:33) -> Leeds successful Interception (68:34) -> Forest unsuccessful BallTouch (68:36). Opposition control is already established before the BallTouch, so the BallTouch is not a new turnover.
2. **88:37 Forest unsuccessful BallTouch** is part of a blocked-delivery chain: Forest successful BallTouch (88:35) -> Forest unsuccessful BallTouch at `(79.4,65.1)` (88:37) -> Leeds Clearance (88:38) + Forest successful `BlockedPass` at the identical `(79.4,65.1)` coordinates (88:38). The unsuccessful BallTouch is therefore not an independent possession-loss turnover.

A generalized detector — (a) suppress marker-69 unsuccessful BallTouch after an opposition successful interception when no same-team control has been re-established, and (b) suppress a marker-69 unsuccessful BallTouch immediately followed by a same-team successful `BlockedPass` at the same coordinates — flags **only those two Forest candidates** in the 29-event marker-69 population. No fixture IDs or timestamps are needed. Applying those exclusions gives **Forest 14 – 13 Leeds**, exactly matching the trusted full-match control.

## Bournemouth–Leeds second-fixture chain test

The same generalized suppression detector was run unchanged against all **23** marker-69 events in Bournemouth–Leeds. It flags **zero** events.

That is useful independent evidence rather than a failure: the detector is not mechanically subtracting events simply because a marker-69 touch exists. The Bournemouth marker-69 population consists of normal turnover-like loss chains and none matches either Forest exclusion archetype. Therefore the Forest 68:36 / 88:37 suppressions remain event-chain predicates rather than fixture-specific corrections.

Under the current candidate rule, the Bournemouth–Leeds raw reconstruction is therefore **Bournemouth 16 – 7 Leeds**. This is an observed raw reconstruction only; it must not be represented as an Opta headline control until an independent trusted source confirms the match Turnovers figure.

## First-half boundary — correction after period-engine audit

The trusted first-half control is Forest 12 – 9 Leeds. The provider-period event population itself is **Forest 12 – 8 Leeds**: Leeds' extra marker-69 unsuccessful BallTouch at **45:48** is unequivocally tagged `SecondHalf` and has `expandedMinute: 48`. The raw fixture declares the first-period end at expanded minute 47.

The previous audit text incorrectly treated 45:48 as being inside the provider first half. That statement is retired.

PitchLab currently has a separate timing/window bug that can explain why a UI first-half window can nevertheless show 12–9. `ui-period.js` derives the HT endpoint from first-period events, but the shared event-window functions compare only `minute * 60 + second`. Because WhoScored resets ordinary `minute` to 45 at the start of the second half, second-half events between local 45:00 and the first-half stoppage-time endpoint can leak into a nominal first-half slider window. The 45:48 Leeds BallTouch is one such event.

This UI-window behaviour **must not be promoted into the Turnovers definition**. Period-aware filtering should eventually use provider period / expanded-time semantics. Therefore the first-half turnover control remains a genuine evidence residual until its provenance is confirmed or a period-correct candidate population explains 12–9 independently.

## Candidate authoritative rule

`Turnover` is strongly supported as a provider marker-69 unsuccessful `BallTouch` representing a genuine fresh loss of controlled possession, excluding marker-69 BallTouch records that are secondary records inside an already-resolved possession-loss/defensive-action chain.

Current evidence:

- Forest–Leeds full match: **Forest 14 – 13 Leeds** — raw-reconciled exactly with a general two-part chain-suppression rule.
- Forest–Leeds provider-period first half: **Forest 12 – 8 Leeds** from the same rule/base family.
- Current PitchLab elapsed-minute first-half window can show **12 – 9** because of a separate period-window contamination issue.
- Trusted Forest–Leeds first-half headline control remains **12 – 9** and is not yet semantically explained without relying on that UI bug.
- Bournemouth–Leeds: the marker-69 event-family identification reproduces exactly across **23/23** candidates; the unchanged chain-suppression detector finds **0** exclusions and therefore reconstructs **16 – 7** as an observed raw candidate result.

Turnovers is therefore **not `GOLD_LOCKED` yet**. The raw definition now has second-fixture structural validation; the remaining Gold blocker is an independent Turnovers headline control and/or explicit confirmation of the first-half 12–9 control provenance.

## Protected implementation rule

1. Do not touch the existing standalone Possession Lost metric.
2. Keep Dispossessed as its own Gold metric.
3. Keep Turnovers independent from both metrics.
4. Do not sum Dispossessed + Turnovers and call the result Possession Lost.
5. Do not expose a `Possession Lost` parent label for these two metrics.
6. Do not implement fixture-specific event IDs/timestamps as exclusions; implementation must express the general chain rule above.
7. Do not use the current elapsed-minute period-window leak as a metric-definition rule.
8. Do not label Bournemouth 16–7 as a trusted Opta headline control unless a separate authoritative source confirms it.