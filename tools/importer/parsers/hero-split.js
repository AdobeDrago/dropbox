/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-split. Base: hero. Source: https://www.dropbox.com/. Generated: 2026-09-30
 *
 * Output (1 column, per blocks/hero-split/hero-split.js decorator):
 *   row 1: media cell  -> single video link (.webm / .mov). The decorator's isMediaCell()
 *          treats a cell holding exactly one video link and no heading as the media cell.
 *   row 2: content cell -> H1, description paragraph(s), CTA paragraphs (one link each).
 *
 * Selectors verified against migration-work/block-context/hero-split/source.html:
 *   .dwg-hero-l3-plank__content-area   text column (h1, p, a.dwg-button2)
 *   .dwg-hero-l3-plank__media-area     media column (video > source[src])
 *   .dwg-button2__text                 CTA label span (anchors also contain decorative data: SVG icons)
 *   ._primaryCta_ / --button-style-primary   primary CTA (wrapped in <strong>)
 */
export default function parse(element, { document }) {
  const contentArea = element.querySelector('.dwg-hero-l3-plank__content-area') || element;
  const mediaArea = element.querySelector('.dwg-hero-l3-plank__media-area') || element;

  // Heading
  const heading = contentArea.querySelector('h1, h2');

  // Description: leaf paragraphs with text (source nests <p> inside <p>, which re-parses as
  // an empty <p> followed by the text <p>); dedupe by text.
  const seen = new Set();
  const paragraphs = [];
  contentArea.querySelectorAll('p').forEach((p) => {
    if (p.closest('a')) return;
    if (p.querySelector('p')) return;
    const text = p.textContent.replace(/\s+/g, ' ').trim();
    if (!text || seen.has(text)) return;
    seen.add(text);
    const np = document.createElement('p');
    np.textContent = text;
    paragraphs.push(np);
  });

  // CTAs: rebuild as clean links using the label span (drops decorative icon images)
  const ctaParas = [];
  contentArea.querySelectorAll('a[href]').forEach((a) => {
    const label = (a.querySelector('.dwg-button2__text') || a).textContent.replace(/\s+/g, ' ').trim();
    if (!label) return;
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = label;
    const p = document.createElement('p');
    const isPrimary = /_primaryCta_|button-style-primary/.test(a.className || '');
    if (isPrimary) {
      const strong = document.createElement('strong');
      strong.append(link);
      p.append(strong);
    } else {
      p.append(link);
    }
    ctaParas.push(p);
  });

  // Media: transparent video with no poster -> emit a single video link.
  // Prefer .webm (broadest browser support for alpha video), fall back to .mov / any source.
  const sources = [...mediaArea.querySelectorAll('video source[src], video[src]')]
    .map((s) => (s.getAttribute('src') || '').trim())
    .filter(Boolean);
  const videoSrc = sources.find((s) => /\.webm(\?|#|$)/i.test(s))
    || sources.find((s) => /\.mov(\?|#|$)/i.test(s))
    || sources[0];
  const poster = mediaArea.querySelector('video[poster]')?.getAttribute('poster');
  const mediaImg = mediaArea.querySelector('picture, img:not([src^="data:"])');

  if (!heading && !paragraphs.length && !ctaParas.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  const mediaCell = [];
  if (mediaImg) mediaCell.push(mediaImg);
  else if (poster) {
    const img = document.createElement('img');
    img.src = poster;
    mediaCell.push(img);
  }
  if (videoSrc) {
    const a = document.createElement('a');
    a.href = videoSrc;
    a.textContent = videoSrc;
    mediaCell.push(a);
  }
  if (mediaCell.length) cells.push([mediaCell]);

  const contentCell = [];
  if (heading) contentCell.push(heading);
  contentCell.push(...paragraphs, ...ctaParas);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-split', cells });
  element.replaceWith(block);
}
