# Possession Lost Audit — 2026-08-28

## Trusted control

Nottingham Forest 0–1 Leeds United (`whoscored:1983552`):

- Nottingham Forest: **147 Possession Lost**
- Leeds United: **129 Possession Lost**

Source status: concrete Opta control supplied during the metric audit. Treat this as authoritative numerical evidence for the Possession Lost metric.

## Important semantic separation

`Possession Lost` must NOT be assumed to be the same metric as the existing unresolved `Turnovers / Loss Possession` control of 16–13. The magnitudes are plainly different and the two concepts remain separate until independently reconstructed.

## Raw-event audit

The uploaded WhoScored raw fixture contains these obvious possession-loss candidate actions:

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

### Satisfied-event evidence

The current WhoScored feed also exposes satisfied-event classifications consistent with the component families above:

- Gold/statistical inaccurate passes: 90–94 after the normal pass exclusions.
- Raw unsuccessful passes: 109–105 when crosses/restarts are retained.
- Unsuccessful touch/turnover-style events: 16–13.
- Dispossessed: 9–3.
- Unsuccessful take-ons: 12–5.

This strongly suggests Opta Possession Lost is broader than the Gold statistical-pass population and likely includes multiple ways of surrendering the ball. However, the exact inclusion/exclusion rule is still unresolved.

## Other candidate events requiring forensic inspection

Events that may explain the residual, but must not be added merely to force the control:

- Offside events / `OffsidePass`: 3 per team in this fixture.
- Forest `Error`: 1.
- Restart-specific unsuccessful passes (corners, throw-ins, goal kicks, free-kicks).
- Event-chain cases where an action is recorded as successful at event level but immediately ends team possession.

A simple addition of all offsides does not solve both teams simultaneously, so offsides cannot currently be promoted as the missing rule.

## Status

`Possession Lost`: **DEFINITION_UNDER_INVESTIGATION**

Trusted control is now secured at **147–129**, but the canonical predicate must remain unchanged/uncreated until the residual is explained by a general event rule and preferably validated by half/player or second-fixture controls.

## Next validation tests

1. Reconstruct possession-ending event chains rather than relying only on event outcome labels.
2. Inspect the exact +1 Forest / +3 Leeds residual events against offside, error and restart semantics.
3. Obtain half or player Possession Lost controls if available; these will sharply constrain the candidate population.
4. Validate the resulting rule on a second fixture before Gold-locking.
5. Keep the separate 16–13 Turnovers control unresolved until its own event semantics are proved.
