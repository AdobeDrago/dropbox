/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-quote. Base: carousel. Source: https://www.dropbox.com/enterprise. Generated: 2026-10-01
 *
 * Output (per blocks/carousel-quote decorator): one row per slide, 1 cell (text-only):
 *   [quote paragraph, "Read full review" link paragraph (if present),
 *    <p><strong>author</strong></p>, role paragraph]
 * The decorator classifies: link-only p -> review link, first strong-only p -> author,
 * the p after the author -> role, remaining p -> quote text.
 *
 * Iteration is keyed on the slide's quote area (.dwg-quote-group__quote-area, one per slide;
 * structure.json shows 3 groups), falling back to .dwg-quote-group / .dwg-quote-groups__single-group.
 * Slides are de-duplicated by quote text in case the live carousel clones slides for looping.
 * Arrow buttons and the "01/03" page indicator are UI chrome and are not emitted.
 *
 * Selectors verified against migration-work/block-context/carousel-quote/source.html:
 *   .dwg-quote-group__quote-area, > .dwg-stack > p (quote), a.dwg-button2 .dwg-text (link label),
 *   span.dwg-text.dwg-font-weight--medium (author), span.dwg-text.dwg-font-weight--regular (role)
 */
export default function parse(element, { document }) {
  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();

  let slides = [...element.querySelectorAll('.dwg-quote-group__quote-area')];
  if (!slides.length) slides = [...element.querySelectorAll('.dwg-quote-group')];
  if (!slides.length) slides = [...element.querySelectorAll('.dwg-quote-groups__single-group')];

  const seen = new Set();
  const cells = [];

  slides.forEach((slide) => {
    const cell = [];

    // Quote: paragraphs not inside the CTA
    const quoteParas = [...slide.querySelectorAll('p, blockquote')]
      .filter((p) => !p.closest('a, button') && !p.querySelector('p') && clean(p.textContent));
    const quoteText = quoteParas.map((p) => clean(p.textContent)).join(' ');
    if (quoteText && seen.has(quoteText)) return;
    if (quoteText) seen.add(quoteText);
    quoteParas.forEach((q) => {
      const p = document.createElement('p');
      p.textContent = clean(q.textContent);
      cell.push(p);
    });

    // "Read full review" link (button-style anchor with arrow icon -> clean link)
    const cta = slide.querySelector('a[href]');
    if (cta) {
      const label = clean((cta.querySelector('.dwg-button2__text, span.dwg-text') || cta).textContent);
      if (label) {
        const a = document.createElement('a');
        a.href = cta.getAttribute('href');
        a.textContent = label;
        const p = document.createElement('p');
        p.append(a);
        cell.push(p);
      }
    }

    // Author + role: text spans outside the CTA, in source order (author first)
    const spans = [...slide.querySelectorAll('span.dwg-text, cite, figcaption span')]
      .filter((s) => !s.closest('a, button, p') && clean(s.textContent));
    const author = spans.find((s) => /font-weight--(medium|bold|semibold)/.test(s.className)) || spans[0];
    const role = spans.find((s) => s !== author && (!author || (author.compareDocumentPosition(s) & 4)));
    if (author) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = clean(author.textContent);
      p.append(strong);
      cell.push(p);
    }
    if (role) {
      const p = document.createElement('p');
      p.textContent = clean(role.textContent);
      cell.push(p);
    }

    if (!cell.length) return;
    cells.push([cell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-quote', cells });
  element.replaceWith(block);
}
