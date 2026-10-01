import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

// source ticker moves one full logo set (8 x 246px = 1968px) every 90s
const SCROLL_SPEED_PX_PER_S = 1968 / 90;

const SVG_NS = 'http://www.w3.org/2000/svg';
const RING_PATH = 'M12 4c-5.158 0-8 2.841-8 8s2.842 8 8 8c5.159 0 8-2.841 8-8s-2.841-8-8-8m0 14.5c-4.374 0-6.5-2.126-6.5-6.5S7.626 5.5 12 5.5s6.5 2.126 6.5 6.5-2.126 6.5-6.5 6.5';
const PAUSE_PATH = 'M11 9H9.5v6H11zm3.5 0H13v6h1.5z';
const PLAY_PATH = 'm10 15.5 5.5-3.5L10 8.5z';

// the EDS image service only resizes same-origin (media bus) images;
// external URLs are kept as authored
function isSameOrigin(src) {
  try {
    return new URL(src, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
}

function buildIcon() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '32');
  svg.setAttribute('height', '32');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  [
    [RING_PATH, ''],
    [PAUSE_PATH, 'carousel-logos-icon-pause'],
    [PLAY_PATH, 'carousel-logos-icon-play'],
  ].forEach(([d, cls]) => {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    if (cls) path.setAttribute('class', cls);
    svg.append(path);
  });
  return svg;
}

function buildItem(row) {
  const img = row.querySelector('img');
  if (!img) return null;
  const li = document.createElement('li');
  li.className = 'carousel-logos-item';
  let picture;
  if (isSameOrigin(img.getAttribute('src') || '')) {
    picture = createOptimizedPicture(img.src, img.alt || '', false, [{ width: '300' }]);
  } else {
    img.setAttribute('loading', 'lazy');
    picture = img.closest('picture') || img;
  }
  const link = row.querySelector('a[href]');
  if (link) {
    const a = document.createElement('a');
    a.href = link.href;
    a.setAttribute('aria-label', img.alt || link.textContent.trim());
    a.append(picture);
    li.append(a);
  } else {
    li.append(picture);
  }
  return li;
}

function cloneTrack(track) {
  const clone = track.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  clone.querySelectorAll('a').forEach((a) => a.setAttribute('tabindex', '-1'));
  clone.querySelectorAll('img').forEach((img) => { img.alt = ''; });
  return clone;
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  // every image in the block is a logo; authors may put several in one row or one per row
  const rows = [...block.querySelectorAll(':scope > div')];
  const items = [];
  rows.forEach((row) => {
    const imgs = [...row.querySelectorAll('img')];
    if (imgs.length <= 1) {
      const item = buildItem(row);
      if (item) items.push(item);
    } else {
      imgs.forEach((img) => {
        const holder = document.createElement('div');
        holder.append(img.closest('picture') || img);
        const item = buildItem(holder);
        if (item) items.push(item);
      });
    }
  });

  const viewport = document.createElement('div');
  viewport.className = 'carousel-logos-viewport';
  const track = document.createElement('ul');
  track.className = 'carousel-logos-track';
  items.forEach((item) => track.append(item));

  const reel = document.createElement('div');
  reel.className = 'carousel-logos-reel';
  reel.append(track);
  viewport.append(reel);

  block.replaceChildren(viewport);
  if (items.length < 2) return;

  // one clone is always needed for a seamless loop; more are added when a
  // wide viewport would otherwise show a gap at the end of the reel
  reel.append(cloneTrack(track));
  const fill = () => {
    const setWidth = track.getBoundingClientRect().width;
    if (!setWidth) return;
    const needed = Math.ceil(viewport.clientWidth / setWidth) + 1;
    while (reel.children.length < needed) reel.append(cloneTrack(track));
    // keep the source's scroll speed regardless of how many logos are authored
    block.style.setProperty('--carousel-logos-duration', `${(setWidth / SCROLL_SPEED_PX_PER_S).toFixed(2)}s`);
  };
  if (window.ResizeObserver) {
    new ResizeObserver(fill).observe(viewport);
  } else {
    fill();
  }

  block.classList.add('carousel-logos-animated');
  const controls = document.createElement('div');
  controls.className = 'carousel-logos-controls';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'carousel-logos-toggle';
  toggle.setAttribute('aria-label', 'Pause logo animation');
  toggle.append(buildIcon());
  const setState = (paused) => {
    block.classList.toggle('carousel-logos-paused', paused);
    toggle.setAttribute('aria-pressed', String(paused));
  };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setState(reduced);
  toggle.addEventListener('click', () => {
    setState(!block.classList.contains('carousel-logos-paused'));
  });
  controls.append(toggle);
  block.append(controls);
}
