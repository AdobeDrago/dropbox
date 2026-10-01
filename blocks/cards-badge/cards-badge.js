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

function isImageOnly(cell) {
  return cell.querySelector('picture, img') && !cell.textContent.trim();
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.some((c) => c.textContent.trim() || c.querySelector('img'))) return;

    const li = document.createElement('li');
    li.className = 'cards-badge-card';
    const image = document.createElement('div');
    image.className = 'cards-badge-card-image';
    const body = document.createElement('div');
    body.className = 'cards-badge-card-body';

    cells.forEach((cell) => {
      if (isImageOnly(cell) && !image.children.length) {
        while (cell.firstChild) image.append(cell.firstChild);
      } else {
        while (cell.firstChild) body.append(cell.firstChild);
      }
    });

    // a badge authored inside the text cell (single-cell rows) is lifted out
    if (!image.children.length) {
      const first = body.firstElementChild;
      if (first && first.querySelector('picture, img') && !first.textContent.trim()) image.append(first);
    }

    if (image.children.length) li.append(image);
    else li.classList.add('cards-badge-card-no-image');
    if (body.children.length || body.textContent.trim()) li.append(body);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    if (!isSameOrigin(img.getAttribute('src') || '')) {
      img.setAttribute('loading', 'lazy');
      return;
    }
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]));
  });
  block.replaceChildren(ul);
}
