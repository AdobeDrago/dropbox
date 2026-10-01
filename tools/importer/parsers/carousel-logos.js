/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-logos. Base: carousel. Source: https://www.dropbox.com/. Generated: 2026-09-30
 *
 * Output (per blocks/carousel-logos/metadata.json + decorator): one row per logo, 1 cell holding
 * the logo image (alt = brand name). The decorator duplicates the set itself for the marquee loop.
 *
 * The source ticker renders the same 8 logos 5 times (5 x ul._list_ > li._item_). Only one set is
 * emitted: prefer the list labelled "Logos" (live DOM), otherwise dedupe every img by normalized src
 * (falling back to alt when src is missing).
 *
 * Selectors verified against migration-work/block-context/carousel-logos/source.html:
 *   ul[class*="_list_"] > li[class*="_item_"] picture > img
 */
export default function parse(element, { document }) {
  const labelled = element.querySelector('[aria-label="Logos"]');
  const scope = labelled || element;

  const keyOf = (img) => {
    const src = (img.getAttribute('src') || img.currentSrc || '').split(/[?#]/)[0].trim();
    return src || (img.getAttribute('alt') || '').trim().toLowerCase();
  };

  const seen = new Set();
  const cells = [];
  scope.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (!src || src.startsWith('data:')) return; // decorative icons (e.g. pause button)
    const key = keyOf(img);
    if (!key || seen.has(key)) return;
    seen.add(key);
    const link = img.closest('a[href]');
    const picture = img.closest('picture') || img;
    if (link) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.append(picture);
      cells.push([a]);
    } else {
      cells.push([picture]);
    }
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-logos', cells });
  element.replaceWith(block);
}
