/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-cta. Base: columns. Source: https://www.dropbox.com/enterprise. Generated: 2026-10-01
 *
 * Output (per blocks/columns-cta decorator + columns convention): 1 row x 2 cells:
 *   [H2 (+ any supporting text) | CTA paragraph(s)]
 * Primary buttons are wrapped in <strong> (EDS primary button), outline buttons in <em>.
 * CTA anchors wrap block content + a data: SVG arrow, so they are rebuilt as clean links.
 *
 * Selectors verified against migration-work/block-context/columns-cta/source.html:
 *   .dwg-flex-grid > .dwg-flex-grid__cell (2 cells), h2, a.dwg-button2(--button-style-primary),
 *   span.dwg-text (CTA label)
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

  const heading = element.querySelector('h1, h2, h3');

  // Supporting text outside CTAs (none on enterprise; kept for variations)
  const textCell = [];
  if (heading) textCell.push(heading);
  element.querySelectorAll('p').forEach((p) => {
    if (p.closest('a, button')) return;
    if (p.querySelector('p')) return;
    if (!clean(p.textContent)) return;
    textCell.push(p);
  });

  const ctaCell = [];
  element.querySelectorAll('a[href]').forEach((a) => {
    if (a.closest('p') && !a.classList.contains('dwg-button2')) return; // inline text links stay in text
    const label = clean((a.querySelector('.dwg-button2__text, span.dwg-text') || a).textContent);
    if (!label) return;
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = label;
    const p = document.createElement('p');
    const cls = a.className || '';
    let wrap = null;
    if (/button-style-primary|_primaryCta_/.test(cls)) wrap = document.createElement('strong');
    else if (/button-style-outline/.test(cls)) wrap = document.createElement('em');
    if (wrap) { wrap.append(link); p.append(wrap); } else p.append(link);
    ctaCell.push(p);
  });

  if (!textCell.length && !ctaCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[textCell, ctaCell.length ? ctaCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-cta', cells });
  element.replaceWith(block);
}
