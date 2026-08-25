# lufcdata UI Design System

A presentation-only UI reference derived from the signed-off MatchLab visual language.

## Strict boundary

This folder is intentionally isolated from PitchLab application code and contains **no MatchLab or PitchLab backend logic**.

It must not contain:
- SofaScore or FotMob importers
- API clients or endpoints
- metric definitions or Golden metrics
- match calculations
- databases or persistence
- scraping or ingestion logic
- football-specific processing
- MatchLab runtime or launcher code

All examples use static neutral placeholders such as `Item Name`, `Metric Name`, `Value`, `Category`, and `Rank`.

## Files

- `tokens.css` — visual tokens: colour, type, spacing, radius, borders, shadows and responsive sizing.
- `components.css` — reusable presentation components.
- `index.html` — static component showcase/reference page with no JavaScript and no data connection.

## Intended use

Copy individual presentation patterns into another project as needed. Treat this folder as a visual reference, not an application dependency.

## Visual language

The reference preserves the signed-off dark studio aesthetic: deep navy surfaces, restrained translucent borders, soft ambient gradients, mint accent, compact stat containers, thin progress bars, strong numerical hierarchy, subdued secondary copy, circular identity treatments and balanced editorial spacing.
