/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-badge. Base: cards. Source: https://www.dropbox.com/enterprise. Generated: 2026-10-01
 *
 * Output (per blocks/cards-badge decorator + cards convention): one row per badge tile,
 * 2 columns: [badge image | H3, description paragraph].
 *
 * Iteration is keyed on the per-tile grid cell (.dwg-css-grid__cell holding a heading;
 * structure.json: 4 units, iterationSafe) with a heading-climb fallback.
 *
 * Selectors verified against migration-work/block-context/cards-badge/source.html:
 *   .dwg-css-grid__cell, .dwg-media-frame picture > img (alt "G2 badge"), h3, p
 */
export default function parse(element, { document }) {
  let tiles = [...element.querySelectorAll('.dwg-css-grid__cell')]
    .filter((cell) => cell.querySelector('h1, h2, h3, h4') && !cell.querySelector('.dwg-css-grid__cell'));

  if (!tiles.length) {
    tiles = [...element.querySelectorAll('h3, h4')].map((h) => {
      let node = h;
      while (node.parentElement && node.parentElement !== element
        && node.parentElement.querySelectorAll('h3, h4').length === 1) {
        node = node.parentElement;
      }
      return node;
    });
  }

  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const cells = [];

  tiles.forEach((tile) => {
    const img = [...tile.querySelectorAll('img')].find((i) => {
      const src = i.getAttribute('src') || '';
      return src && !src.startsWith('data:');
    });
    const heading = tile.querySelector('h1, h2, h3, h4');
    const textCell = [];
    if (heading) textCell.push(heading);

    tile.querySelectorAll('p').forEach((p) => {
      if (p.querySelector('p')) return; // nested-p wrappers: keep the leaf only
      if (!clean(p.textContent)) return;
      textCell.push(p);
    });

    if (!textCell.length && !img) return;
    cells.push([img ? (img.closest('picture') || img) : '', textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-badge', cells });
  element.replaceWith(block);
}
