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
    li.className = 'cards-integration-card';
    const icon = document.createElement('div');
    icon.className = 'cards-integration-card-icon';
    const body = document.createElement('div');
    body.className = 'cards-integration-card-body';

    cells.forEach((cell) => {
      if (isImageOnly(cell) && !icon.children.length) {
        while (cell.firstChild) icon.append(cell.firstChild);
      } else {
        while (cell.firstChild) body.append(cell.firstChild);
      }
    });

    // an icon authored inside the text cell (single-cell rows) is lifted out
    if (!icon.children.length) {
      const first = body.firstElementChild;
      if (first && first.querySelector('picture, img') && !first.textContent.trim()) icon.append(first);
    }

    // last link-only paragraph is the card's call to action
    const paras = [...body.querySelectorAll(':scope > p')];
    const cta = paras.reverse().find((p) => p.querySelector('a') && p.textContent.trim() === p.querySelector('a').textContent.trim());
    if (cta) cta.classList.add('cards-integration-card-cta');

    if (icon.children.length) li.append(icon);
    li.append(body);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    if (!isSameOrigin(img.getAttribute('src') || '')) {
      img.setAttribute('loading', 'lazy');
      return;
    }
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '96' }]));
  });
  block.replaceChildren(ul);
}
