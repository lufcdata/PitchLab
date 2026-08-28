# Throw-In Forensic Audit — 2026-08-28

## Scope
This audit closes the PitchLab throw-in family without changing `main`.

## Event primitive
WhoScored represents throw-ins as `Pass` events carrying the Opta `ThrowIn` qualifier. Opta's public event definitions explicitly state that throw-ins do **not** count as Passes in Opta's statistical Pass population, so PitchLab keeps throw-ins as a separate event family even though the WhoScored transport event type is `Pass`.

## Gold base controls
Nottingham Forest vs Leeds (1983552):
- Total throw-ins: 25–12
- Successful throw-ins: 21–6
- Unsuccessful throw-ins: 4–6
- Checksum: 21+4=25; 6+6=12

Bournemouth vs Leeds (1903384) regression fixture:
- Total throw-ins: 27–19
- Successful throw-ins: 16–9
- Unsuccessful throw-ins: 11–10
- Checksum: 16+11=27; 9+10=19

`Successful Throw-Ins` and `Unsuccessful Throw-Ins` remain `GOLD_LOCKED`.

## Final-third throw-ins
The previous candidate classified `Successful Final Third Throw-Ins` by **destination** (`endX >= 66.6667`). That is semantically wrong.

Opta Analyst material distinguishes throw-ins *taken in the final third* from the subset subsequently thrown into the penalty area. Therefore final-third territory is defined by the throw-in origin.

Authoritative PitchLab definition:
- base event = Gold successful throw-in
- final-third threshold = origin `x >= 200/3` (66.6667 on the normalized 0–100 pitch)

Reconstructed counts:
- Forest–Leeds: 6–2
- Bournemouth–Leeds: 4–3

Status: `DERIVED_FROM_GOLD_COMPONENTS`.

## Throw-ins into the opposition penalty area
PitchLab keeps two explicit spatial metrics:
- `Throw-Ins Into Penalty Box`
- `Successful Throw-Ins Into Penalty Box`

Authoritative geometry:
- destination `endX` 83–100
- destination `endY` 21.1–78.9

Reconstructed counts:
- Forest–Leeds total: 5–4
- Forest–Leeds successful: 1–2
- Bournemouth–Leeds total: 6–7
- Bournemouth–Leeds successful: 0–3

Boundary sensitivity was tested with `x=83` vs `83.333333` and `y=21.1` vs physical-equivalent `21.0526`; none of the four fixture results changed.

These are spatial derivatives of the Gold throw-in population and therefore carry status `DERIVED_FROM_GOLD_COMPONENTS` rather than pretending to be independently controlled Opta headline metrics.

## Important non-equivalence: long throws
Do **not** rename `Throw-Ins Into Penalty Box` to `Long Throw-Ins`.

Opta Analyst defines a long throw for its published analysis as a throw-in aimed into the opposition penalty area **and at least 20 metres in length before the next touch**. PitchLab's `Throw-Ins Into Penalty Box` deliberately has no 20m minimum because it is a pure destination-zone metric.

## Closure verdict
Throw-in family is closed:
- successful throw-ins: Gold
- unsuccessful throw-ins: Gold
- successful final-third throw-ins: derived from Gold, corrected to origin territory
- successful throw-ins into penalty box: derived from Gold
- throw-ins into penalty box: derived from Gold

No fixture-specific corrections, event-ID exceptions, rounding hacks, or +1/-1 adjustments are used.
