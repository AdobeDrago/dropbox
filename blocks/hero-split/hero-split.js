import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;

// the EDS image service only resizes same-origin (media bus) images;
// external URLs are kept as authored
function isSameOrigin(src) {
  try {
    return new URL(src, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
}

function isVideoLink(a) {
  return a && VIDEO_EXT.test(a.getAttribute('href') || '');
}

function isMediaCell(cell) {
  if (cell.querySelector('picture, img, video')) {
    // a cell is media when it carries no heading and no meaningful text beyond the media
    const text = cell.textContent.trim();
    return !cell.querySelector('h1, h2, h3, h4, h5, h6') && text.length < 40;
  }
  const links = [...cell.querySelectorAll('a')];
  return links.length === 1 && isVideoLink(links[0]) && !cell.querySelector('h1, h2, h3, h4, h5, h6');
}

function buildVideo(href, poster) {
  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.autoplay = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  if (poster) video.poster = poster;
  const source = document.createElement('source');
  source.src = href;
  if (/\.mov/i.test(href)) source.type = 'video/quicktime';
  else if (/\.webm/i.test(href)) source.type = 'video/webm';
  else source.type = 'video/mp4';
  video.append(source);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.autoplay = false;
    video.removeAttribute('autoplay');
  }
  return video;
}

function decorateMedia(media) {
  media.querySelectorAll('picture > img').forEach((img) => {
    if (!isSameOrigin(img.getAttribute('src') || '')) return;
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, true, [{ media: '(min-width: 900px)', width: '1200' }, { width: '750' }]),
    );
  });
  const videoLink = [...media.querySelectorAll('a')].find(isVideoLink);
  if (videoLink) {
    const img = media.querySelector('img');
    const video = buildVideo(videoLink.href, img ? img.currentSrc || img.src : '');
    const wrapper = videoLink.closest('p') || videoLink;
    wrapper.replaceWith(video);
    // the image became the video poster, so drop the duplicate picture
    if (img) img.closest('picture')?.remove();
  }
  // drop empty paragraphs left behind
  media.querySelectorAll('p').forEach((p) => { if (!p.children.length && !p.textContent.trim()) p.remove(); });
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  const cells = [...block.querySelectorAll(':scope > div > div')];
  const content = document.createElement('div');
  content.className = 'hero-split-content';
  const media = document.createElement('div');
  media.className = 'hero-split-media';

  cells.forEach((cell) => {
    const target = isMediaCell(cell) ? media : content;
    while (cell.firstChild) target.append(cell.firstChild);
  });

  // CTA grouping: paragraphs containing only links become a button row
  const ctaParas = [...content.querySelectorAll(':scope > p')].filter((p) => {
    const links = p.querySelectorAll('a');
    return links.length && [...p.childNodes].every((n) => (n.nodeType === Node.TEXT_NODE
      ? !n.textContent.trim()
      : n.tagName === 'A' || n.tagName === 'STRONG' || n.tagName === 'EM'));
  });
  if (ctaParas.length) {
    const ctas = document.createElement('div');
    ctas.className = 'hero-split-ctas';
    ctaParas[0].before(ctas);
    ctaParas.forEach((p) => ctas.append(p));
  }

  // eyebrow: a short plain-text paragraph authored before the heading
  const heading = content.querySelector(':scope > h1, :scope > h2');
  const eyebrow = heading?.previousElementSibling;
  if (eyebrow?.tagName === 'P' && !eyebrow.querySelector('a, picture, img')
    && eyebrow.textContent.trim()) {
    eyebrow.classList.add('hero-split-eyebrow');
  }

  decorateMedia(media);

  block.replaceChildren(content);
  if (!media.children.length) {
    block.classList.add('hero-split-no-media');
    return;
  }
  block.append(media);

  // still-image media (no video) uses the product-screenshot hero layout
  if (!media.querySelector('video') && media.querySelector('img')) {
    block.classList.add('hero-split-image');
    // the hero image is the LCP candidate
    const img = media.querySelector('img');
    img.loading = 'eager';
    img.fetchPriority = 'high';
  }
}
