# Season Performance V1 validation checklist

Before merging Season Performance V1:

- Main Match/Pitch Events surface remains unchanged apart from a new Season Performance navigation button.
- Date range defaults to 8 Aug 2026 through 8 Sep 2026.
- Multiple raw WhoScored JSON files can be imported together.
- Match counter reflects only fixtures inside the active date range.
- Player selector is rebuilt from the selected Leeds fixture population and includes Whole Team.
- Existing metric selector continues to use the Gold Metric Bible definitions.
- Full Match / First Half / Second Half controls remain functional.
- Carries and Progressive Carries are reconstructed match-by-match before aggregation.
- No cross-fixture carry can be created.
- Event Map uses the existing pitch renderer.
- Heat Map uses the existing heat-map renderer for supported event metrics.
- PNG export canvas is exactly 1080 x 1350.
- Single-match export shows home crest, home team, score, away team and away crest.
- Multi-match export shows Leeds United, match count, date range and competition.
- Export includes selected metric, selected player, event/match count and LUFCDATA.LAB footer.
- Hosted season packs failing to load must not break the page; local multi-JSON import remains available.
