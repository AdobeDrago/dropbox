/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media. Base: columns. Source: https://www.dropbox.com/enterprise. Generated: 2026-10-01
 *
 * Output (per blocks/columns-media decorator + columns convention): ONE block, one row per
 * media/text plank, 2 cells per row. Cell order mirrors the visual layout so the decorator can
 * alternate sides: image cell first when the image is on the left.
 *   row 1 (#dwg_media_text_plank-2612c7b4e4, container --row-reverse => image left):
 *        [image | eyebrow p, H2, p, p]
 *   row 2 (#dwg_media_text_plank-8e5e9818af, normal order => image right):
 *        [eyebrow p, H2, p, p, CTA | image]
 *
 * The instance selector only matches the first plank; the immediately following sibling
 * planks with class dwg-media-text-plank are consumed as extra rows and removed from the DOM.
 * Empty / &nbsp; spacer paragraphs are dropped. CTAs (button anchors with arrow icon) are
 * rebuilt as clean links; outline buttons -> <em>, primary -> <strong>.
 *
 * Selectors verified against migration-work/block-context/columns-media/source.html and the
 * sibling plank in migration-work/cleaned.html:
 *   .dwg-media-text-plank, .dwg-media-text-plank__container(--row-reverse),
 *   .dwg-media-text-plank__text-content, span.dwg-text (eyebrow), h2, p, a.dwg-button2,
 *   .dwg-media-frame picture > img
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/[\s ]+/g, ' ').trim();
  const PLANK = 'dwg-media-text-plank';

  // Collect this plank plus any directly following media-text sibling planks
  const planks = [element];
  let next = element.nextElementSibling;
  while (next && next.classList.contains(PLANK)) {
    planks.push(next);
    next = next.nextElementSibling;
  }

  const buildRow = (plank) => {
    const container = plank.querySelector(`.${PLANK}__container`) || plank;
    const textArea = container.querySelector(`.${PLANK}__text-content`)
      || [...container.querySelectorAll('h1, h2, h3')].map((h) => h.closest('.dwg-flex-grid__cell'))[0];
    if (!textArea) return null;

    // Media: first real image outside the text area
    const img = [...container.querySelectorAll('img')].find((i) => {
      const src = i.getAttribute('src') || '';
      return src && !src.startsWith('data:') && !textArea.contains(i);
    });
    const mediaCell = img ? [img.closest('picture') || img] : [];

    const textCell = [];
    const heading = textArea.querySelector('h1, h2, h3, h4');

    // Eyebrow: short link-free text block directly before the heading
    const prev = heading?.previousElementSibling;
    if (prev && !prev.querySelector('a, img, h1, h2, h3, h4') && clean(prev.textContent)
      && clean(prev.textContent).length <= 60) {
      const p = document.createElement('p');
      p.textContent = clean(prev.textContent);
      textCell.push(p);
    }
    if (heading) textCell.push(heading);

    textArea.querySelectorAll('p').forEach((p) => {
      if (p.closest('a')) return;
      if (p.querySelector('p')) return;
      if (!clean(p.textContent)) return; // spacer paragraphs
      textCell.push(p);
    });

    [...textArea.querySelectorAll('a[href]')]
      .filter((a) => !a.closest('p'))
      .forEach((a) => {
        const label = clean((a.querySelector('.dwg-button2__text, span.dwg-text') || a).textContent);
        if (!label) return;
        const link = document.createElement('a');
        link.href = a.getAttribute('href');
        link.textContent = label;
        const p = document.createElement('p');
        const cls = a.className || '';
        let wrap = null;
        if (/button-style-primary/.test(cls)) wrap = document.createElement('strong');
        else if (/button-style-outline/.test(cls)) wrap = document.createElement('em');
        if (wrap) { wrap.append(link); p.append(wrap); } else p.append(link);
        textCell.push(p);
      });

    if (!textCell.length && !mediaCell.length) return null;

    // Visual order: --row-reverse puts the (second in DOM) media column on the left.
    // Otherwise follow DOM order of the two columns.
    const reversed = /--row-reverse/.test(container.className || '');
    const mediaFirstInDom = img ? !!(img.compareDocumentPosition(textArea) & 4) : false; // textArea FOLLOWS img
    const imageLeft = reversed ? !mediaFirstInDom : mediaFirstInDom;
    return imageLeft ? [mediaCell, textCell] : [textCell, mediaCell];
  };

  const cells = planks.map(buildRow).filter(Boolean);

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Consumed sibling planks become rows of this block
  planks.slice(1).forEach((p) => p.remove());

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
