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
 * Selectors verified against migration-work/home/block-context/cards-integration/source.html and
 * instances/01.html: .dwg-css-grid__cell, picture > img, h3, p, a.dwg-button2, .dwg-button2__text
 *
 * Enterprise (https://www.dropbox.com/enterprise, 5 instances, verified against
 * migration-work/block-context/cards-integration/source.html + instances/*.html), 2026-10-01:
 *   - 4-up grids (cells carry tablet-lg:dwg-grid-column-span--6 in a 24-col template) emit
 *     "Cards Integration (four-up)"; home grids (span --8 => 3-up) stay "cards-integration".
 *   - Items may have no icon (feature / stat cards: big-number H3 + text). When no item in the
 *     grid has an icon, rows are single-cell [H3, paragraph]; otherwise [icon | text] (empty
 *     icon cell for icon-less items in mixed grids).
 *   - Items may have no CTA.
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

  // Desktop column count, read from the dwg 24-col grid: template columns / cell span at the
  // widest breakpoint present. Home cells use span 8 (3-up) -> plain block; enterprise cells use
  // tablet-lg span 6 (4-up) -> "four-up" option.
  const BPS = ['desktop', 'tablet-lg', 'tablet', 'mobile-lg', ''];
  const valueAt = (el, prefix) => {
    if (!el) return null;
    const classes = (el.getAttribute('class') || '').split(/\s+/);
    for (const bp of BPS) {
      const name = `${bp ? `${bp}:` : ''}${prefix}`;
      const hit = classes.find((c) => c.startsWith(name) && /^\d+$/.test(c.slice(name.length)));
      if (hit) return { bp, value: Number(hit.slice(name.length)) };
    }
    return null;
  };
  const desktopColumns = () => {
    const first = cards[0];
    if (!first) return 0;
    const span = valueAt(first, 'dwg-grid-column-span--');
    const gridEl = first.closest('[class*="dwg-grid-template-columns--"]');
    const template = valueAt(gridEl, 'dwg-grid-template-columns--');
    if (!span || !template || !span.value) return 0;
    return Math.round(template.value / span.value);
  };
  const blockName = desktopColumns() === 4 ? 'Cards Integration (four-up)' : 'cards-integration';

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
    // Items without an icon (feature / stat cards: H3 + paragraph) keep an empty image cell so
    // every row has 2 cells; the decorator renders them as no-icon cards.
    cells.push([img ? (img.closest('picture') || img) : '', textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Text-only grids (no item has an icon, e.g. enterprise feature/stat cards): emit 1-cell rows
  // [H3, paragraph] instead of an empty image column. Mixed grids keep 2 cells per row.
  if (cells.every((row) => row[0] === '')) {
    cells.forEach((row, i) => { cells[i] = [row[1]]; });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: blockName, cells });
  element.replaceWith(block);
}
