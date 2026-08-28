# Possession Lost / Dispossessed / Turnovers closure — 2026-08-28

## Authoritative taxonomy

`Possession Lost`, `Dispossessed`, and `Turnovers` remain distinct named PitchLab metrics, with the trusted Nottingham Forest–Leeds headline relationship now explicitly controlled:

- **Possession Lost:** Forest **25** – **16** Leeds.
- **Dispossessed:** Forest **9** – **3** Leeds.
- **Turnovers:** Forest **16** – **13** Leeds.
- Headline checksum: **9 + 16 = 25**; **3 + 13 = 16**.

This checksum is a trusted fixture control. It does not permit PitchLab to replace any metric with an arbitrary sum or to reuse the separate High Turnovers sequence definition.

## Dispossessed — GOLD LOCKED

Authoritative definition remains the raw `Dispossessed` event population.

Forest–Leeds full match: **9–3**.

Do not alter this definition while maintaining Turnovers.

## Turnovers — GOLD LOCKED

The trusted full-match control is **Forest 16 – 13 Leeds**.

The provider event-family fingerprint is exact in the raw Forest–Leeds fixture:

- Forest: 16 events carrying WhoScored/Opta `satisfiedEventsTypes` marker **69**.
- Leeds: 13 marker-69 events.
- All 29 are `BallTouch` + `Unsuccessful`.
- No other event type in the fixture carries marker 69.

The same structural fingerprint independently reproduces in Bournemouth 2–2 Leeds (`whoscored:1903384`):

- Bournemouth: 16 marker-69 events.
- Leeds: 7 marker-69 events.
- All 23 are again `BallTouch` + `Unsuccessful`.
- No other event type in that fixture carries marker 69.

Therefore the authoritative PitchLab Turnover predicate is the raw provider turnover family: **unsuccessful `BallTouch` carrying satisfied-event marker 69**. The earlier chain-suppression experiment that reduced Forest from 16 to 14 is retired; it was solving against an incorrect 14–13 control and must not be implemented.

Bournemouth 16–7 remains a second-fixture structural reconstruction, not an independently published headline control.

## Possession Lost — trusted control

The trusted Forest–Leeds headline is **25–16**, with the supplied breakdown **Dispossessed 9–3 + Turnovers 16–13**. This relationship is retained as a regression checksum for this fixture.

The existing standalone Possession Lost implementation remains protected unless a later implementation audit demonstrates that its current predicate differs from the trusted 25–16 headline. No broad possession-loss rewrite is authorised by this document.

## First-half provenance

Previous first-half Turnovers analysis was contaminated by uncertainty over period-window filtering. It is not needed to define the full-match Gold population now that the trusted full-match headline is 16–13.

The period-window issue remains an engineering regression item: provider period / expanded-time semantics must be used so second-half events cannot leak into first-half windows. Do not add event exceptions to Turnovers to compensate for a timing bug.

## Separation from High Turnovers

`Turnovers` and `High Turnovers` are different metrics:

- `Turnovers`: player/event metric based on the provider marker-69 unsuccessful BallTouch population.
- `High Turnovers`: team-only possession-sequence metric describing possessions won high up the pitch.

Neither definition may be substituted for the other.

## Protected implementation rules

1. Keep `Dispossessed` at its Gold raw-event definition.
2. Keep `Turnovers` as marker-69 unsuccessful BallTouch; do not apply the retired chain-suppression exclusions.
3. Preserve the trusted Forest–Leeds controls: Possession Lost 25–16, Dispossessed 9–3, Turnovers 16–13.
4. Preserve the fixture checksum 9+16=25 and 3+13=16 as regression evidence, not as permission for fixture-specific logic.
5. Keep `High Turnovers` semantically and architecturally separate.
6. Fix period-window contamination in the shared timing layer, never in the Turnovers predicate.
