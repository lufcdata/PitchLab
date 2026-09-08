# Season Performance storage plan

Season Performance uses a manifest-driven fixture store.

## Target production layout

`data/season/2026-27/manifest.json` is the season index. Each fixture is represented by one compressed browser pack containing only the match metadata, player dictionary and raw event objects required by the existing PitchLab Gold metric engine.

The page loads only fixtures whose dates fall inside the active date range. This keeps browser memory and network usage proportional to the requested period rather than the whole historical database.

## V1 ingestion path

The Season Performance surface also supports selecting multiple full WhoScored JSONs through **Load Season JSONs…**. Those files are parsed in-browser, associated to the season manifest by date/fixture identity and never uploaded anywhere by the page.

This gives us a safe working V1 while the automated pack-ingestion step is completed.

## Derived-metric boundary rule

Ordinary event metrics may aggregate their raw event populations across selected fixtures before filtering.

Derived sequence metrics must respect fixture boundaries. Carries are therefore reconstructed once per match and only the resulting carry objects are aggregated. The same principle applies to any future possession sequence, passing-chain or transition model that could otherwise bridge two fixtures.

## Next ingestion step

Automate generation of the compressed fixture packs whenever a new raw match JSON is accepted into PitchLab. The manifest entry should include match ID, date, competition, home/away identity, score, crest paths and pack path. No metric values should be precomputed in the manifest; Gold definitions remain authoritative at runtime.
