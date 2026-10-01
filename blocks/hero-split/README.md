# hero-split

Custom **hero** block. Purpose: page-hero.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row, one cell of content.

## Supported variations

No author-selected variations. Layout adapts to content:

- **Video media** (a `.mp4`/`.webm` link, homepage): vertically centered content, square media.
- **Image media** (a picture only, e.g. /enterprise): the block gets `hero-split-image` —
  top-aligned content, 16px body copy, image contained in a 48px frame; stacked below 1024px,
  50/50 at 1024px (560px tall), 1/3 + 2/3 at 1440px (600px tall), full-bleed.
- **Eyebrow**: a short plain-text paragraph before the heading gets `hero-split-eyebrow`.

## Universal Editor fields

N/A (Document Authoring project)
