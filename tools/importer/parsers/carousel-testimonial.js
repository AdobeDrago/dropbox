/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-testimonial. Base: carousel. Source: https://www.dropbox.com/. Generated: 2026-09-30
 *
 * Output (per blocks/carousel-testimonial decorator + carousel convention): one row per slide,
 * 2 columns: [thumbnail image | eyebrow paragraph, H3 quote, description paragraph, CTA].
 *
 * Source notes (verified in migration-work/block-context/carousel-testimonial/source.html):
 *   - thumbnails live in .dwg-media-frame (inside [class*="_mediaSection_"]); the play-icon
 *     overlay ([class*="_icon_"], data: SVG) is decorative and skipped.
 *   - eyebrow: span[class*="_eyebrowText_"]; quote: h3[class*="_quoteText_"]; description: p
 *   - CTAs are <button class="..._mainCtaElement_..."> with no href (they open a JS video modal).
 *     The CTA text is preserved; it becomes a link only if a URL is discoverable on the button
 *     (data-href / data-url / data-video-url / enclosing <a>), otherwise a plain paragraph.
 * Iteration is keyed on the heading (one per slide) and climbs to the slide root (direct child
 * of the grid), so nested/animated wrapper classes (_card_, _cardEntryAnimation_) don't matter.
 */
export default function parse(element, { document }) {
  const headings = [...element.querySelectorAll('h3, h2, h4')];
  const slides = [];
  headings.forEach((h) => {
    let node = h;
    while (node.parentElement && node.parentElement !== element
      && node.parentElement.querySelectorAll('h2, h3, h4').length === 1) {
      node = node.parentElement;
    }
    if (!slides.includes(node)) slides.push(node);
  });

  const clean = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const cells = [];

  slides.forEach((slide) => {
    // Thumbnail
    const frame = slide.querySelector('.dwg-media-frame') || slide.querySelector('[class*="_mediaSection_"]') || slide;
    const img = [...frame.querySelectorAll('img')].find((i) => {
      const src = i.getAttribute('src') || '';
      return src && !src.startsWith('data:') && !i.closest('[class*="_icon_"]');
    });
    const imageCell = img ? (img.closest('picture') || img) : '';

    const textCell = [];
    const eyebrow = slide.querySelector('[class*="_eyebrowText_"]');
    if (eyebrow && clean(eyebrow.textContent)) {
      const p = document.createElement('p');
      p.textContent = clean(eyebrow.textContent);
      textCell.push(p);
    }

    const heading = slide.querySelector('h3, h2, h4');
    if (heading) textCell.push(heading);

    slide.querySelectorAll('p').forEach((p) => {
      if (p.closest('button, a')) return;
      if (!clean(p.textContent)) return;
      textCell.push(p);
    });

    // CTA (button, or anchor fallback)
    const ctaEl = slide.querySelector('button[class*="_mainCtaElement_"], button.dwg-button2')
      || slide.querySelector('a.dwg-button2');
    if (ctaEl) {
      const label = clean((ctaEl.querySelector('.dwg-button2__text') || ctaEl).textContent);
      if (label) {
        const href = ctaEl.getAttribute('href')
          || ctaEl.getAttribute('data-href')
          || ctaEl.getAttribute('data-url')
          || ctaEl.getAttribute('data-video-url')
          || ctaEl.closest('a[href]')?.getAttribute('href');
        const p = document.createElement('p');
        if (href) {
          const a = document.createElement('a');
          a.href = href;
          a.textContent = label;
          p.append(a);
        } else {
          p.textContent = label;
        }
        textCell.push(p);
      }
    }

    if (!textCell.length && !imageCell) return;
    cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-testimonial', cells });
  element.replaceWith(block);
}
