/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-integration. Base: cards. Source: https://www.dropbox.com/. Generated: 2026-09-30
 *
 * Output (per blocks/cards-integration decorator + cards convention): one row per card,
 * 2 columns: [logo image | H3, description paragraph, CTA link paragraph].
 *
 * Two instances exist on the page (3-card grid and 2-card grid); each becomes its own block.
 * Instances disagree on wrapper depth, so iteration is keyed on the per-card grid cell
 * (.dwg-css-grid__cell containing an h3), with an h3-based fallback that climbs to the card root.
 * CTA anchors wrap block content (div/span + data: SVG icon) so they are never iterated;
 * they are rebuilt as clean links from their .dwg-button2__text label.
 *
 * Selectors verified against migration-work/block-context/cards-integration/source.html and
 * instances/01.html: .dwg-css-grid__cell, picture > img, h3, p, a.dwg-button2, .dwg-button2__text
 */
export default function parse(element, { document }) {
  let cards = [...element.querySelectorAll('.dwg-css-grid__cell')]
    .filter((cell) => cell.querySelector('h1, h2, h3, h4') && !cell.querySelector('.dwg-css-grid__cell'));

  if (!cards.length) {
    // Fallback: climb from each heading to the largest ancestor holding only that heading
    cards = [...element.querySelectorAll('h3, h4')].map((h) => {
      let node = h;
      while (node.parentElement && node.parentElement !== element
        && node.parentElement.querySelectorAll('h3, h4').length === 1) {
        node = node.parentElement;
      }
      return node;
    });
  }

  const cells = [];
  cards.forEach((card) => {
    const img = [...card.querySelectorAll('img')].find((i) => !(i.getAttribute('src') || '').startsWith('data:') && !i.closest('a.dwg-button2'));
    const heading = card.querySelector('h1, h2, h3, h4');
    const textCell = [];
    if (heading) textCell.push(heading);

    card.querySelectorAll('p').forEach((p) => {
      if (p.closest('a.dwg-button2')) return;
      if (!p.textContent.trim()) return;
      textCell.push(p);
    });

    // CTA: button-style anchors (not inline links inside the description paragraph)
    [...card.querySelectorAll('a[href]')]
      .filter((a) => !a.closest('p') && (a.classList.contains('dwg-button2') || a.querySelector('.dwg-button2__text')))
      .forEach((a) => {
        const label = (a.querySelector('.dwg-button2__text') || a).textContent.replace(/\s+/g, ' ').trim();
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-integration', cells });
  element.replaceWith(block);
}
