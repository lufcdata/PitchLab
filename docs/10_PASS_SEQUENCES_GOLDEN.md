# 10+ Pass Sequences — Golden Definition v1

Status: LOCKED for production/audit use.

Golden control fixture: WhoScored match 1983552, Nottingham Forest 0–1 Leeds, 22 August 2026.

Expected full-match result:
- Nottingham Forest: 6
- Leeds: 7

## Production rules

A 10+ Pass Sequence is a continuous team sequence containing at least 10 pass attempts before the sequence is closed.

Sequence boundaries are possession/control aware rather than a simple `unsuccessful pass = stop` rule.

1. Count pass attempts by the active team.
2. A sequence qualifies once it reaches 10 or more passes before closure.
3. Genuine stoppages, period boundaries and established opposition control close the sequence.
4. `OffsideGiven` records with no second-level timestamp are treated as administrative/mirror records and do not automatically close a sequence.
5. An unsuccessful pass may remain inside the same sequence only when the same team resumes with the next pass within 5 seconds and the intervening record(s) are defensive noise rather than established opposition possession.
6. Defensive noise currently includes clearances, blocked passes, challenges and aerial events.
7. Established opposition control includes controlled ball recoveries/touches/take-ons/keeper pickups/smothers and subsequent opposition passing.
8. No team-, player- or match-specific correction is permitted in the engine.

## Forest–Leeds audit checks

The previous production implementation returned Forest 6 / Leeds 5 because it closed every sequence on `OffsideGiven` and every unsuccessful pass.

Two Leeds sequences were therefore lost:
- 08:42–09:07: an incomplete `OffsideGiven` administrative event split a 10-pass Leeds sequence.
- 57:25–57:52: an unsuccessful Leeds pass was followed by a Forest clearance and an immediate Leeds continuation; Forest never established controlled possession before Leeds resumed.

The locked Golden v1 engine returns Nottingham Forest 6 / Leeds 7 on the original 1,419-event WS_1983552 raw file.

Any future change to this metric must be regression-tested against this fixture and must preserve 6–7 unless the definition is deliberately versioned.
