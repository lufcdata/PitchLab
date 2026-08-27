# Possession — Golden V1

Control fixture: WhoScored match 1983552, Nottingham Forest 0-1 Leeds, 22 August 2026.

## Locked definition

Possession is reconstructed from WhoScored possession units:

- include every event with type `Pass`
- exclude events carrying qualifier `ThrowIn`
- possession percentage = team possession units / both teams possession units × 100
- display to one decimal place

This is not time-on-ball and is not touch share.

## Golden controls

- Full Match: Nottingham Forest 56.3% — 43.7% Leeds
- First Half: Nottingham Forest 51.9% — 48.1% Leeds
- Second Half: Nottingham Forest 60.7% — 39.3% Leeds

Validated short-window controls supplied for the first half:

- 0:00–5:02: 33.3% — 66.7%
- 5:02–10:05: 38.7% — 61.3%
- 10:05–15:07: 53.8% — 46.2%
- 15:07–20:09: 53.3% — 46.7%
- 20:09–25:12: 45.0% — 55.0%
- 25:12–30:14: 73.9% — 26.1%
- 30:14–35:16: 66.7% — 33.3%
- 35:16–40:19: 82.0% — 18.0%
- 40:19–HT: 41.7% — 58.3%

Note: exact displayed short-window boundaries can assign events on a boundary to one adjacent provider bucket. Do not change the underlying possession-unit definition to fit boundary-assignment differences.