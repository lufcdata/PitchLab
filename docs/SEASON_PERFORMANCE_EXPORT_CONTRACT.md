# Season Performance export contract

The Season Performance export target is a deterministic social graphic at exactly **1080 x 1350 px**.

The export renderer must consume the same currently selected metric/player/date/match-period state as the on-screen pitch. It must never calculate a separate metric population for export.

Required identity layers:

- Season Performance / PitchLab title
- selected metric
- selected player or Whole Team
- single-match fixture identity when one fixture is selected
- otherwise Leeds United + selected match count
- selected date range
- competition
- current pitch visual
- current event count and match count
- LUFCDATA.LAB footer

Additional final watermark artwork can be substituted once the exact asset filenames are approved; this must not alter the underlying export dimensions or metric rendering.
