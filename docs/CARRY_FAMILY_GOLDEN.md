# PitchLab Golden Carry Family

Locked: 2026-08-28

Validation fixture: WhoScored `1983552` — Nottingham Forest 0-1 Leeds United.

Implementation: `ui-carry-metrics.js` — **Carry Engine v5**.

## Gold status

The carry family is `GOLD_LOCKED_PLAYER_CONTROL` against the complete supplied outfield-player table for Nottingham Forest 0-1 Leeds. The reconstruction reconciles all 22 displayed player rows across:

1. Carry count.
2. Carrying Distance (m).
3. Progressive Carry count.
4. Progressive Carrying Distance (m), which is the provider-aligned net forward x-distance across all qualifying carries.

Small sub-decimal differences before display rounding are expected because the raw WhoScored event coordinates are supplied at finite precision. The displayed one-decimal controls reconcile.

## Authoritative metrics

### Carries

A carry is reconstructed controlled movement by one player between a defensible possession/acquisition origin and that player's subsequent on-ball terminal action.

- Minimum movement: **5.0 metres**.
- Maximum event gap: **less than 10 seconds**.
- Pitch conversion: **105m × 68m**.
- No arbitrary maximum carry-distance ceiling is used. The previous 60m ceiling is retired because it excluded a genuine Neco Williams control carry of roughly 63.9m.
- `OffsideGiven` must not create a carry start/end binding.
- Same-clock provider companion records must not automatically destroy a genuine carrier trajectory.
- A teammate's controlled action, including a teammate `BallTouch`, supersedes the previous player's carry ownership.

### Carrying Distance (m)

For each qualifying carry:

`sqrt(((endX-startX)*1.05)^2 + ((endY-startY)*0.68)^2)`

Sum all qualifying carry lengths.

### Avg Carrying Distance (m)

`Carrying Distance / Carries`

Return `0.0` when Carries = 0.

### Progressive Carries

A qualifying carry with net forward x progression of at least **5.0 metres**:

`(endX-startX) * 1.05 >= 5.0`

### Progressive Carrying Distance (m)

Provider-aligned field: **net forward x-distance across all qualifying carries**, not the Euclidean length of progressive carries only:

`sum((endX-startX) * 1.05)`

This field can therefore be negative even when Progressive Carries = 0.

### Avg Progressive Carrying Distance (m)

`Progressive Carrying Distance / Progressive Carries`

Return `0.0` when Progressive Carries = 0.

## Event-chain ownership rules established by the control set

These are general reconstruction rules, not fixture/player corrections:

- A `Tackle` can establish a carry origin regardless of its raw WhoScored outcome flag. PitchLab's independently Gold-validated tackle semantics already show that provider outcome is not a reliable won/lost discriminator for this event family.
- A successful `Foul` record can terminate a carry when it represents the carrier being fouled after established possession/reception or a retained attacking action.
- An immediate `Foul` after a defensive acquisition (`BallRecovery`, `Interception`, `Tackle`, `BlockedPass`) is not independently promoted to a carry merely because spatial separation exceeds 5m.
- `Dispossessed` can terminate a genuine carry.
- `BlockedPass -> Dispossessed` is not treated as a fresh acquisition carry chain when the BlockedPass is a defensive companion record.
- Where `TakeOn` and `Foul` are same-player, same-clock companion records, the on-ball `TakeOn` location owns the terminal trajectory rather than generating a second Foul-ended carry.
- Same-clock opposition defensive companions (for example a paired tackle/clearance at the carrier's terminal event) do not erase the carrier's trajectory.
- Teammate possession actions break ownership; specifically, teammate `BallTouch` cannot be ignored while constructing a later carry for a different player.

## Complete Forest-Leeds player controls

| Team | Player | Carries | Distance (m) | Progressive | Net forward (m) |
|---|---|---:|---:|---:|---:|
| Leeds | Jaka Bijol | 18 | 172.6 | 13 | 124.1 |
| Leeds | Ethan Ampadu | 9 | 78.5 | 5 | 38.4 |
| Leeds | Jayden Bogle | 8 | 93.4 | 4 | 21.3 |
| Leeds | Brenden Aaronson | 8 | 98.1 | 6 | 54.5 |
| Leeds | Tarik Muharemovic | 7 | 51.1 | 4 | 31.9 |
| Leeds | Anton Stach | 6 | 52.8 | 4 | 33.7 |
| Leeds | Noah Okafor | 4 | 62.2 | 4 | 54.7 |
| Leeds | Dominic Calvert-Lewin | 3 | 33.4 | 0 | -21.5 |
| Leeds | Harry Wilson | 3 | 35.5 | 0 | -13.1 |
| Leeds | Joe Rodon | 3 | 32.4 | 2 | 25.2 |
| Leeds | James Justin | 3 | 27.1 | 1 | 8.2 |
| Forest | Morgan Gibbs-White | 15 | 127.9 | 6 | 37.6 |
| Forest | Ola Aina | 13 | 110.1 | 7 | 42.2 |
| Forest | Jair Cunha | 12 | 112.6 | 9 | 66.7 |
| Forest | Ibrahim Sangaré | 12 | 101.6 | 5 | 21.8 |
| Forest | Nikola Milenkovic | 11 | 125.3 | 6 | 65.6 |
| Forest | Neco Williams | 10 | 133.5 | 1 | 25.1 |
| Forest | Murillo | 9 | 68.3 | 2 | 25.7 |
| Forest | James McAtee | 9 | 77.7 | 5 | 32.4 |
| Forest | Igor Jesus | 5 | 47.7 | 3 | 14.5 |
| Forest | Chris Wood | 3 | 23.4 | 0 | -6.3 |
| Forest | Dan Ndoye | 1 | 12.1 | 1 | 10.5 |

## Forensic anchors

Examples that established the general V5 rules include:

- Jayden Bogle: successful TakeOn -> player fouled, recovering the missing ~9.7m carry.
- James Justin: Tackle -> BallRecovery, recovering the missing ~9.9m carry despite the Tackle's raw outcome flag.
- Nikola Milenkovic and Murillo: genuine carries ending in `Dispossessed`.
- Igor Jesus: same-clock unsuccessful TakeOn + Foul companion resolves to one carry ending at the TakeOn location.
- Noah Okafor: a teammate BallTouch between two tackle records prevents a false extra carry.
- Morgan Gibbs-White: same-minute offside companion and defensive BlockedPass chains are prevented from manufacturing extra carries.
- Neco Williams: removal of the invalid 60m cap restores a genuine ~63.9m TakeOn-to-Pass carry, while teammate-control rules remove false BlockedPass chains.

## Implementation rule

All product surfaces must consume the same Carry Family engine. Do not reintroduce the old 9.11m progressive threshold, the older 30% / 15% / 10% distance-to-goal approximation, the retired 60m ceiling, or surface-specific carry reconstruction logic.
