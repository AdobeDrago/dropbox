/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-media. Base: accordion. Source: https://www.dropbox.com/enterprise. Generated: 2026-10-01
 *
 * Output (per blocks/accordion-media decorator + accordion convention): one row per item,
 * 2 columns: [title | body paragraph(s), "Learn more" link paragraph, item illustration].
 * The decorator lifts the first picture out of the body into the swap panel and opens the
 * first item itself, so no "open" flag is authored.
 *
 * Iteration is keyed on .dwg-accordion-item (structure.json: 3 units, iterationSafe); fallback
 * is the accordion label boxes. The checkbox input, chevron icon (data: SVG) and the CTA arrow
 * icon are UI chrome and are dropped; the CTA is rebuilt as a clean link from its label.
 *
 * Selectors verified against migration-work/block-context/accordion-media/source.html:
 *   .dwg-accordion-item, .dwg-accordion-item__label-box > span, .dwg-accordion-item__dropdown,
 *   .dwg-jtbd-plank__text p, a.dwg-button2 .dwg-text (label), .dwg-jtbd-plank__media picture > img
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

  let items = [...element.querySelectorAll('.dwg-accordion-item')];
  if (!items.length) {
    items = [...element.querySelectorAll('[class*="accordion-item__label"], details')]
      .map((l) => l.closest('[class*="accordion-item"]:not([class*="__"]), details') || l.parentElement);
  }

  const cells = [];
  items.forEach((item) => {
    const labelBox = item.querySelector('.dwg-accordion-item__label-box, label, summary');
    const titleEl = labelBox && (labelBox.querySelector('h2, h3, h4, span.dwg-text, span') || labelBox);
    const title = clean(titleEl?.textContent);
    const panel = item.querySelector('.dwg-accordion-item__dropdown, [class*="dropdown"], [role="region"]') || item;

    const bodyCell = [];
    const textScope = panel.querySelector('.dwg-jtbd-plank__text') || panel;
    textScope.querySelectorAll('p').forEach((p) => {
      if (p.closest('a')) return;
      if (p.querySelector('p')) return;
      if (!clean(p.textContent)) return;
      bodyCell.push(p);
    });

    // CTA links (button-style anchors wrap block content + arrow icon) -> clean paragraph links
    [...textScope.querySelectorAll('a[href]')]
      .filter((a) => !a.closest('p'))
      .forEach((a) => {
        const label = clean((a.querySelector('.dwg-button2__text, span.dwg-text') || a).textContent);
        if (!label) return;
        const link = document.createElement('a');
        link.href = a.getAttribute('href');
        link.textContent = label;
        const p = document.createElement('p');
        p.append(link);
        bodyCell.push(p);
      });

    // Item illustration (shown in the right-hand panel on desktop)
    const mediaScope = panel.querySelector('.dwg-jtbd-plank__media') || panel;
    const img = [...mediaScope.querySelectorAll('img')].find((i) => {
      const src = i.getAttribute('src') || '';
      return src && !src.startsWith('data:');
    });
    if (img) bodyCell.push(img.closest('picture') || img);

    if (!title && !bodyCell.length) return;
    const titleCell = document.createElement('p');
    titleCell.textContent = title;
    cells.push([titleCell, bodyCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-media', cells });
  element.replaceWith(block);
}
