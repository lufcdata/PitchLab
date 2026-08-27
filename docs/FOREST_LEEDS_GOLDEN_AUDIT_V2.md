# Forest 0-1 Leeds — Golden Metric Audit V2

Control fixture: WhoScored match 1983552, Nottingham Forest 0-1 Leeds, 22 August 2026.

These definitions are regression controls. Do not replace them with fixture-specific +/- adjustments. Any future change must reproduce the controls or deliberately version the metric.

## Locked definitions

- Ball Recoveries = BallRecovery + KeeperPickup + Claim.
  - FT: Forest 47, Leeds 43.
  - 1H: Forest 23, Leeds 24.
  - 2H implied: Forest 24, Leeds 19.
- Tackles Won = every Tackle event in this WhoScored feed; do not filter on outcomeType.
  - FT: Forest 8, Leeds 19.
- Ground Duels Won = Tackle + successful TakeOn + successful Foul, excluding Foul events carrying AerialFoul.
  - FT: Forest 31, Leeds 41.
  - Leeds share: 56.9% of 72 ground-duel wins.
- Aerial Duels Won = successful Aerial + successful Foul carrying AerialFoul.
  - FT: Forest 30, Leeds 25.
  - Leeds share: 45.5% of 55 aerial-duel wins.
  - The Forest +1 is the explicitly paired AerialFoul at 38:24 (Forest successful Foul / Leeds unsuccessful Foul).
- Fouls committed = Foul events with outcomeType Unsuccessful.
  - FT: Forest 15, Leeds 14.
- Final Third Entries = any WhoScored Pass event crossing from x < 66.6667 to endX >= 66.6667.
  - Includes qualifying pass-family set-piece deliveries represented as Pass events.
  - Does not add reconstructed carries in this WhoScored/Opta product.
  - FT: Forest 60, Leeds 63.
  - 1H: Forest 24, Leeds 37.
  - 2H implied: Forest 36, Leeds 26.
- High Turnover = open-play controlled possession switch whose new possession begins within 40 metres of the opponent goal line (WhoScored team-relative x >= 61.9048). This is possession-state based, not a raw count of recovery events.
  - FT: Forest 4, Leeds 8.
- Shot-Ending High Turnover = a High Turnover whose resulting attacking sequence reaches a shot before a restart, foul, opposition-controlled possession, or successful opposition sequence-break action such as BlockedPass/Tackle/Interception.
  - FT: Forest 1, Leeds 1.

## Previously locked controls retained

- PPDA: Forest 12.9, Leeds 8.8.
- 10+ Pass Sequences: Forest 6, Leeds 7.
- Touches: Forest 617, Leeds 500.
- Penalty Box Touches: Forest 22, Leeds 15.
- Total Passes: Forest 411, Leeds 326.
- Successful Passes: Forest 321, Leeds 232.
- Pass Accuracy: Forest 78.1%, Leeds 71.2%.
- Final Third Passes: Forest 110, Leeds 92.
- Successful Final Third Passes: Forest 72, Leeds 38.
- Shots Off-Target: Forest 8, Leeds 2.
- Blocked Shots: Forest 2, Leeds 6.
- Shots Inside Box: Forest 6, Leeds 6.
- Shots Outside Box: Forest 6, Leeds 5.
- Shots From Set-Pieces: Forest 8, Leeds 7.
- Set-Piece Goals: Forest 0, Leeds 1.
- Shots — Head: Forest 5, Leeds 3.
- Throw Ins: Forest 25, Leeds 12.
- Clearances: Forest 32, Leeds 31.
- Successful Take-Ons: Forest 10, Leeds 7.
- Dispossessed: Forest 9, Leeds 3.

## Still unresolved / do not force

- Accurate Crosses: conflicting controls exist (2-5 versus earlier 4-3 raw-event interpretation). Keep under audit.
- Woodwork Shots: official control supplied as 2-0, while direct ShotOnPost reconstruction gives 1-0. Keep under audit.
- Turnovers / loss of possession: control 16-13; definition still to be reconstructed separately.
