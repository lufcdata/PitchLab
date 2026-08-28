# Possession Lost Audit — 2026-08-28

## Trusted control

Nottingham Forest 0–1 Leeds United (`whoscored:1983552`):

- Nottingham Forest: **147 Possession Lost**
- Leeds United: **129 Possession Lost**

Source status: concrete Opta control supplied during the metric audit. Treat this as authoritative numerical evidence for the Possession Lost metric.

## Important semantic separation

`Possession Lost` must NOT be assumed to be the same metric as the existing unresolved `Turnovers / Loss Possession` control of 16–13. The magnitudes are plainly different and the two concepts remain separate until independently reconstructed.

## Raw-event audit

| Component | Forest | Leeds |
|---|---:|---:|
| Raw unsuccessful `Pass` events | 109 | 105 |
| Unsuccessful `BallTouch` events | 16 | 13 |
| Unsuccessful `TakeOn` events | 12 | 5 |
| `Dispossessed` events | 9 | 3 |
| **Naive candidate total** | **146** | **126** |
| **Trusted Opta Possession Lost** | **147** | **129** |
| **Residual** | **+1** | **+3** |

The near-match is useful but is NOT sufficient to define the metric. No fixture-specific correction is permitted.

## New residual finding: offsides are highly informative

The raw fixture contains exactly **3 `OffsideGiven` events for Forest and 3 for Leeds**.

Adding all three offsides to the naive candidate population produces:

- Forest: 146 + 3 = **149**, which is **2 too high**.
- Leeds: 126 + 3 = **129**, an **exact match** to the trusted Opta control.

This is a strong clue that an offside can count as Possession Lost, but it also proves that the correct rule is NOT simply `add every OffsideGiven event`.

The next forensic target is therefore the three Forest offside chains. Only **one net additional Forest loss** is needed to reach 147, while all three Leeds offside chains are consistent with the control. We must inspect whether some Forest offsides already have their loss represented by an unsuccessful pass or another candidate event, while the Leeds chains are not double-counted. The likely solution is event-chain de-duplication rather than a flat event-type sum.

Forest also has one `Error` event, but it must not be added merely because the residual is +1: the Error is successful at event level and requires chain-level evidence before inclusion.

## Satisfied-event evidence

The WhoScored feed exposes dedicated classifications for the relevant event families:

- Gold/statistical inaccurate passes: 90–94 after normal pass exclusions.
- Raw unsuccessful passes: 109–105 when crosses/restarts are retained.
- Unsuccessful `BallTouch`: 16–13.
- `Dispossessed`: 9–3.
- Unsuccessful `TakeOn`: 12–5.
- `OffsideGiven`: 3–3.

This supports a broad possession-ending concept, but exact chain-level de-duplication remains unresolved.

## Status

`Possession Lost`: **DEFINITION_UNDER_INVESTIGATION**

Trusted control is secured at **147–129**. Leeds can now be reconstructed exactly by the current candidate components plus its three offsides, while Forest demonstrates why naive summation is unsafe. Do not canonicalize until the Forest offside chains explain the two-event overcount and the rule generalizes.

## Next validation tests

1. Inspect all six offside chains and identify whether a preceding unsuccessful pass already records the same possession loss.
2. Determine why Leeds requires all three offside losses while Forest requires only one net additional loss.
3. Test the Forest `Error` only through possession-chain evidence, not residual fitting.
4. Obtain half/player Possession Lost controls if available.
5. Validate the resulting chain/de-duplication rule on a second fixture before Gold-locking.
6. Keep the separate 16–13 Turnovers control unresolved until its own semantics are proved.
