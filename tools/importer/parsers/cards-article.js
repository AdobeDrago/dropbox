/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article. Base: cards. Source: https://www.dropbox.com/. Generated: 2026-09-30
 *
 * Output (per blocks/cards-article decorator + cards convention): one row per article,
 * 2 columns: [image | eyebrow paragraph ("Article"), H3, description paragraph, CTA link paragraph].
 * The decorator marks a link-free <p> directly before the heading as the eyebrow.
 *
 * Iteration is keyed on the per-card grid cell (.dwg-css-grid__cell containing a heading;
 * structure.json: 3 units, iterationSafe) with a heading-climb fallback. CTA anchors wrap block
 * content (div > span) so they are rebuilt as clean links from their label text.
 *
 * Selectors verified against migration-work/block-context/cards-article/source.html:
 *   .dwg-css-grid__cell, picture > img, h3, heading's previous sibling (div > span "Article"),
 *   p, a[href] > .dwg-button2__text
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

    // Eyebrow: short link-free text immediately preceding the heading
    const prev = heading?.previousElementSibling;
    if (prev && !prev.querySelector('a, img, h1, h2, h3, h4') && clean(prev.textContent)
      && clean(prev.textContent).length < 40) {
      const p = document.createElement('p');
      p.textContent = clean(prev.textContent);
      textCell.push(p);
    }

    if (heading) textCell.push(heading);

    card.querySelectorAll('p').forEach((p) => {
      if (p.closest('a[href]') && !p.closest('a[href]').closest('p')) return;
      if (!clean(p.textContent)) return;
      textCell.push(p);
    });

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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
