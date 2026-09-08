# Season Performance — Export Canvas Lock

Status: LOCKED FOR V1 VALIDATION
Date: 2026-09-08

## Authoritative export foundation

The user-supplied `Full Canvas.png` is the authoritative visual foundation for Season Performance PNG exports.

Verified source properties:
- Dimensions: exactly 1080 × 1350 px
- Background: RGB (25, 27, 42) / `#191b2a`
- Branding is already positioned in the lower export area

## Rendering contract

1. Export output is always exactly 1080 × 1350 px.
2. The supplied full canvas is the immutable bottom/base layer.
3. Dynamic Season Performance content is rendered over that base rather than recreating the background or footer branding in code.
4. The lower branding area must remain unobstructed.
5. Do not stretch, recolour, reposition, redraw or approximate the supplied branding.
6. Do not use the export canvas as the interactive browser-page background; it is an export-only asset.
7. `#191b2a` remains the fallback canvas colour if the image asset cannot be loaded, but a successful production export should use the supplied full-canvas asset.
8. The earlier 1080 × 100 Base Strap is retained only as a fallback/reference; the full canvas is preferred.

## Gold validation gate

Before Season Performance V1 is signed off:
- confirm the exact full-canvas asset is committed to the repository;
- confirm exported PNG dimensions are 1080 × 1350;
- confirm no seam/background mismatch exists;
- confirm dynamic content never overlaps the locked branding area;
- confirm single-match and multi-match export variants both use the same foundation;
- confirm export remains deterministic for the same filters and loaded season population.
