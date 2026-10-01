import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];
const DESKTOP = window.matchMedia('(width >= 900px)');
let instanceId = 0;

// the EDS image service only resizes same-origin (media bus) images;
// external URLs are kept as authored
function isSameOrigin(src) {
  try {
    return new URL(src, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
}

function optimize(scope) {
  scope.querySelectorAll('picture > img').forEach((img) => {
    if (!isSameOrigin(img.getAttribute('src') || '')) {
      img.setAttribute('loading', 'lazy');
      return;
    }
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '1200' }, { width: '750' }]),
    );
  });
}

// pull the item's illustration (first picture/img) out of the body into its own media frame
function extractMedia(body) {
  const pic = body.querySelector('picture') || body.querySelector('img');
  if (!pic) return null;
  const media = document.createElement('div');
  media.className = 'accordion-media-item-media';
  const holder = pic.parentElement;
  media.append(pic);
  // drop the now-empty paragraph that wrapped the image
  if (holder && holder !== body && !holder.textContent.trim() && !holder.querySelector('picture, img')) holder.remove();
  return media;
}

// styling hook: a paragraph holding nothing but one link is the item's arrow CTA
function markCtas(body) {
  body.querySelectorAll(':scope > p').forEach((p) => {
    const link = p.querySelector('a');
    if (p.children.length === 1 && link?.parentElement === p
      && p.textContent.trim() === link.textContent.trim()) {
      p.classList.add('accordion-media-item-cta');
    }
  });
}

// desktop: every item's media sits in the shared right-hand panel; mobile: under its own item
function placeMedia(block, items, panel) {
  items.forEach(({ media, body }) => {
    if (!media) return;
    if (DESKTOP.matches) panel.append(media);
    else body.append(media);
  });
  block.classList.toggle('accordion-media-has-panel', DESKTOP.matches && !!panel.children.length);
}

function setActive(items, index) {
  items.forEach(({ details, media }, i) => {
    const on = i === index;
    if (!on && details.open) details.open = false;
    media?.classList.toggle('is-active', on);
  });
}

export default function decorate(block) {
  instanceId += 1;
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  const list = document.createElement('div');
  list.className = 'accordion-media-items';
  const panel = document.createElement('div');
  panel.className = 'accordion-media-panel';
  panel.setAttribute('aria-hidden', 'true');

  const items = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.some((c) => c.textContent.trim() || c.querySelector('img'))) return;

    // label is the first cell; everything after it is the body.
    // single-cell rows: the first heading/paragraph becomes the label
    let labelCell = cells[0];
    let bodyCells = cells.slice(1);
    if (cells.length === 1) {
      labelCell = document.createElement('div');
      const first = cells[0].firstElementChild;
      if (first && first.textContent.trim()) labelCell.append(first);
      bodyCells = [cells[0]];
    }

    const details = document.createElement('details');
    details.className = 'accordion-media-item';
    details.name = `accordion-media-${instanceId}`;

    const summary = document.createElement('summary');
    summary.className = 'accordion-media-item-label';
    // unwrap a single heading/paragraph so the label stays inline content
    const only = labelCell.children.length === 1 ? labelCell.firstElementChild : null;
    const labelNodes = only && /^(P|H[1-6])$/.test(only.tagName) ? only.childNodes : labelCell.childNodes;
    const labelText = document.createElement('span');
    labelText.className = 'accordion-media-item-title';
    labelText.append(...labelNodes);
    summary.append(labelText);

    const body = document.createElement('div');
    body.className = 'accordion-media-item-body';
    bodyCells.forEach((cell) => { while (cell.firstChild) body.append(cell.firstChild); });

    optimize(body);
    const media = extractMedia(body);
    markCtas(body);

    details.append(summary, body);
    list.append(details);
    items.push({ details, body, media });
  });

  if (!items.length) {
    block.replaceChildren();
    return;
  }

  // first item open by default
  items[0].details.open = true;
  setActive(items, 0);

  items.forEach(({ details }, i) => {
    details.addEventListener('toggle', () => {
      // single-open fallback for browsers without details[name] support
      if (details.open) setActive(items, i);
    });
  });

  block.replaceChildren(list, panel);
  placeMedia(block, items, panel);
  DESKTOP.addEventListener('change', () => placeMedia(block, items, panel));
}
