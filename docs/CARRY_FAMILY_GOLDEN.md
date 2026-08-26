# PitchLab Golden Carry Family

Locked: 2026-08-26

Validation fixture: WhoScored `WS_1983552_raw.json` — Nottingham Forest 0-1 Leeds United.

## Golden metrics

1. **Carries**
   - Reconstructed controlled ball movement of at least **5.0 metres**.
   - WhoScored raw match-centre JSON does not expose a native Carry event, so the movement is reconstructed from the chronological event stream.
   - `OffsideGiven` must not create a carry start/end binding.
   - Paired unsuccessful challenge/turnover events must not automatically destroy genuine control continuity.

2. **Carrying Distance (m)**
   - For each qualifying carry on a 105m × 68m pitch:
   - `sqrt(((endX-startX)*1.05)^2 + ((endY-startY)*0.68)^2)`
   - Sum all qualifying carry lengths.

3. **Avg Carrying Distance (m)**
   - `Carrying Distance / Carries`
   - Return `0.0` when Carries = 0.

4. **Progressive Carries**
   - A qualifying carry with forward x progression of at least **5.0 metres**.
   - `(endX-startX) * 1.05 >= 5.0`

5. **Progressive Carrying Distance (m)**
   - Provider-aligned field: **net forward x-distance across all qualifying carries**, not the Euclidean length of progressive carries only.
   - `sum((endX-startX) * 1.05)`
   - This field can therefore be negative even when Progressive Carries = 0.

6. **Avg Progressive Carrying Distance (m)**
   - `Progressive Carrying Distance / Progressive Carries`
   - Return `0.0` when Progressive Carries = 0.

## Regression controls

The player-level Leeds controls supplied for the Forest match were used as the Golden regression set. Representative anchors include:

- Jaka Bijol: 18 Carries; 172.6m Carrying Distance; 13 Progressive Carries; 124.1m Progressive Carrying Distance.
- Ethan Ampadu: 9; 78.5m; 5; 38.4m.
- Brenden Aaronson: 8; 98.1m; 6; 54.5m.
- Jayden Bogle: 8; 93.4m; 4; 21.3m.
- Tarik Muharemovic: 7; 51.1m; 4; 31.9m.
- Anton Stach: 6; 52.8m; 4; 33.7m.
- Noah Okafor: 4; 62.2m; 4; 54.7m.
- Joe Rodon: 3; 32.4m; 2; 25.2m.
- James Justin: 3; 27.1m; 1; 8.2m.
- Dominic Calvert-Lewin: 3; 33.4m; 0; -21.5m.
- Harry Wilson: 3; 35.5m; 0; -13.1m.

## Implementation rule

All product surfaces must consume the same Carry Family engine. Do not reintroduce the old 9.11m progressive threshold or the older 30% / 15% / 10% distance-to-goal approximation for these metrics.
