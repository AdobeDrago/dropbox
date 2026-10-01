/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-industry. Base: cards. Source: https://www.dropbox.com/. Generated: 2026-09-30
 *
 * Output (per blocks/cards-industry decorator + cards convention): one row per tile,
 * 2 columns: [photo | H3, description paragraph, CTA link paragraph].
 *
 * Iteration is keyed on the per-card grid cell (.dwg-css-grid__cell containing a heading;
 * structure.json: 6 units, iterationSafe) with a heading-climb fallback. CTA anchors wrap
 * block content (div/span + data: SVG arrow) so they are never iterated; they are rebuilt as
 * clean links from their .dwg-button2__text label (or trimmed text).
 *
 * Selectors verified against migration-work/block-context/cards-industry/source.html:
 *   .dwg-css-grid__cell, [class*="media-frame"] picture > img, h3, p, a[href] > .dwg-button2__text
 */
export default function parse(element, { document }) {
  let cards = [...element.querySelectorAll('.dwg-css-grid__cell')]
    .filter((cell) => cell.querySelector('h1, h2, h3, h4') && !cell.querySelector('.dwg-css-grid__cell'));

  if (!cards.length) {
    cards = [...element.querySelectorAll('h3, h4')].map((h) => {
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

  cards.forEach((card) => {
    const img = [...card.querySelectorAll('img')].find((i) => {
      const src = i.getAttribute('src') || '';
      return src && !src.startsWith('data:');
    });
    const heading = card.querySelector('h1, h2, h3, h4');
    const textCell = [];
    if (heading) textCell.push(heading);

    card.querySelectorAll('p').forEach((p) => {
      if (p.closest('a[href]') && !p.closest('a[href]').closest('p')) return;
      if (!clean(p.textContent)) return;
      textCell.push(p);
    });

    // CTA: anchors not inside a paragraph (button-style links)
    [...card.querySelectorAll('a[href]')]
      .filter((a) => !a.closest('p'))
      .forEach((a) => {
        const label = clean((a.querySelector('.dwg-button2__text') || a).textContent);
        if (!label) return;
        const link = document.createElement('a');
        link.href = a.getAttribute('href');
        link.textContent = label;
        const p = document.createElement('p');
        p.append(link);
        textCell.push(p);
      });

    if (!textCell.length && !img) return;
    cells.push([img ? (img.closest('picture') || img) : '', textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-industry', cells });
  element.replaceWith(block);
}
