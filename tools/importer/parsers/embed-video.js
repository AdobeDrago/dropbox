/* eslint-disable */
/* global WebImporter */
/**
 * Parser for embed-video. Base: embed. Source: https://www.dropbox.com/enterprise. Generated: 2026-10-01
 *
 * Output (per blocks/embed-video decorator + embed convention): 1 row, 1 cell:
 *   [poster image, link to the video URL]  e.g. https://player.vimeo.com/video/915282309
 * The decorator renders the poster with a play button and loads the Vimeo/YouTube iframe on click.
 *
 * The cleanup transformer removes all iframes in afterTransform, so the player URL is read here
 * (before that happens) from the iframe src / data-src, or any vimeo/youtube URL found in an
 * attribute inside the plank. Vimeo URLs are normalised to player.vimeo.com/video/<id>
 * (keeping the privacy hash `h` if present); autoplay/tracking params are dropped.
 * The play-overlay <button> and its data: SVG icon are UI chrome and are skipped.
 *
 * Selectors verified against migration-work/block-context/embed-video/source.html:
 *   iframe[src*="player.vimeo.com"], .dwg-media picture > img (poster, alt = video description)
 */
export default function parse(element, { document }) {
  const VIDEO_RE = /(https?:)?\/\/(player\.)?(vimeo\.com|youtube\.com|youtu\.be|www\.youtube\.com)\/[^\s"'<>]+/i;

  // 1. Find the video URL
  let rawUrl = '';
  const iframe = element.querySelector('iframe[src*="vimeo"], iframe[src*="youtu"], iframe[data-src], iframe');
  if (iframe) rawUrl = iframe.getAttribute('src') || iframe.getAttribute('data-src') || '';
  if (!VIDEO_RE.test(rawUrl)) {
    rawUrl = '';
    const all = [element, ...element.querySelectorAll('*')];
    for (const el of all) {
      for (const attr of [...el.attributes]) {
        const m = (attr.value || '').match(VIDEO_RE);
        if (m) { rawUrl = m[0]; break; }
      }
      if (rawUrl) break;
    }
  }

  let videoUrl = '';
  if (rawUrl) {
    try {
      const u = new URL(rawUrl, 'https://www.dropbox.com');
      const host = u.hostname.replace(/^www\./, '');
      if (host.endsWith('vimeo.com')) {
        const parts = u.pathname.split('/').filter(Boolean);
        const id = parts.find((p) => /^\d+$/.test(p));
        if (id) {
          const h = u.searchParams.get('h');
          videoUrl = `https://player.vimeo.com/video/${id}${h ? `?h=${h}` : ''}`;
        }
      } else {
        videoUrl = u.href;
      }
    } catch (e) {
      videoUrl = rawUrl;
    }
  }

  // 2. Poster image (skip data: icons such as the play overlay)
  const img = [...element.querySelectorAll('img')].find((i) => {
    const src = i.getAttribute('src') || '';
    return src && !src.startsWith('data:') && !i.closest('button');
  });

  if (!videoUrl && !img) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const contentCell = [];
  if (img) contentCell.push(img.closest('picture') || img);
  if (videoUrl) {
    const a = document.createElement('a');
    a.href = videoUrl;
    a.textContent = videoUrl;
    const p = document.createElement('p');
    p.append(a);
    contentCell.push(p);
  }

  const cells = [[contentCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-video', cells });
  element.replaceWith(block);
}
