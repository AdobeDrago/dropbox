import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

// the EDS image service only resizes same-origin (media bus) images;
// external URLs are kept as authored
function isSameOrigin(src) {
  try {
    return new URL(src, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
}

function isMediaCell(cell) {
  return cell.querySelector('picture, img') && !cell.querySelector('h1, h2, h3, h4, h5, h6')
    && cell.textContent.trim().length < 40;
}

// spacer paragraphs (&nbsp; or empty) carried over from the source are noise
function isEmptyParagraph(el) {
  return el.tagName === 'P' && !el.querySelector('picture, img, a') && !el.textContent.replace(/\u00a0/g, '').trim();
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.some((c) => c.textContent.trim() || c.querySelector('img'))) {
      row.remove();
      return;
    }
    row.classList.add('columns-media-row');

    const mediaIndex = cells.findIndex(isMediaCell);
    cells.forEach((cell, i) => {
      if (i === mediaIndex) {
        cell.classList.add('columns-media-media');
        return;
      }
      cell.classList.add('columns-media-text');
      [...cell.children].filter(isEmptyParagraph).forEach((p) => p.remove());

      // short plain paragraph right before the heading is the eyebrow
      const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
      const prev = heading?.previousElementSibling;
      if (prev && prev.tagName === 'P' && !prev.querySelector('a, picture, img') && prev.textContent.trim().length <= 60) {
        prev.classList.add('columns-media-eyebrow');
      }
    });

    if (mediaIndex === -1) row.classList.add('columns-media-row-text-only');
    else if (mediaIndex === 0) row.classList.add('columns-media-row-media-start');
    else row.classList.add('columns-media-row-media-end');
  });

  block.querySelectorAll('.columns-media-media picture > img').forEach((img) => {
    if (!isSameOrigin(img.getAttribute('src') || '')) {
      img.setAttribute('loading', 'lazy');
      return;
    }
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '1200' }, { width: '750' }]),
    );
  });
}
