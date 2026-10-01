const OPTION_CLASSES = [];
let instanceId = 0;

const pad = (n) => String(n).padStart(2, '0');

// Dropbox UI icons (decorative): chevron for the counter, long arrow for the large side buttons
const svg = (d) => `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path stroke="currentColor" stroke-miterlimit="10" stroke-width="1.5" d="${d}" vector-effect="non-scaling-stroke"/></svg>`;
const CHEVRON_NEXT = svg('m9.25 5.75 6.25 6.5-6.25 6.5');
const CHEVRON_PREV = svg('m14.75 5.75-6.25 6.5 6.25 6.5');
const ARROW_NEXT = svg('M5 11.75h12m-5.25-6.5 6.25 6.5-6.25 6.5');
const ARROW_PREV = svg('M19 11.75H7m5.25-6.5L6 11.75l6.25 6.5');

function isOnly(p, selector) {
  const el = p.querySelector(selector);
  return el && p.textContent.trim() === el.textContent.trim();
}

function createSlide(row, index, total, id) {
  const slide = document.createElement('li');
  slide.className = 'carousel-quote-slide';
  slide.id = `carousel-quote-${id}-slide-${index}`;
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');
  slide.setAttribute('aria-label', `${index + 1} of ${total}`);

  const content = document.createElement('div');
  content.className = 'carousel-quote-slide-content';
  [...row.children].forEach((cell) => {
    while (cell.firstChild) content.append(cell.firstChild);
  });
  // text-only slider: any authored image is dropped
  content.querySelectorAll('picture, img').forEach((el) => {
    const p = el.closest('p');
    el.remove();
    if (p && !p.textContent.trim()) p.remove();
  });

  const paras = [...content.querySelectorAll(':scope > p, :scope > blockquote')];
  let authorFound = false;
  paras.forEach((p) => {
    if (!p.textContent.trim()) return;
    if (p.tagName === 'P' && isOnly(p, 'a')) {
      p.classList.add('carousel-quote-slide-link');
    } else if (!authorFound && p.tagName === 'P' && isOnly(p, 'strong, b')) {
      p.classList.add('carousel-quote-slide-author');
      authorFound = true;
    } else if (authorFound && !content.querySelector('.carousel-quote-slide-role')) {
      p.classList.add('carousel-quote-slide-role');
    } else if (!content.querySelector('.carousel-quote-slide-text')) {
      p.classList.add('carousel-quote-slide-text');
    }
  });

  slide.append(content);
  return slide;
}

function getIndex(list) {
  const slides = [...list.children];
  const left = list.scrollLeft;
  let best = 0;
  slides.forEach((s, i) => {
    if (Math.abs(s.offsetLeft - left) < Math.abs(slides[best].offsetLeft - left)) best = i;
  });
  return best;
}

function updateState(block, index) {
  const list = block.querySelector('.carousel-quote-slides');
  const slides = [...list.children];
  slides.forEach((s, i) => {
    const on = i === index;
    s.setAttribute('aria-hidden', on ? 'false' : 'true');
    s.inert = !on;
  });
  const current = block.querySelector('.carousel-quote-current');
  if (current) current.textContent = pad(index + 1);
  block.dataset.activeSlide = index;
}

function goTo(block, index) {
  const list = block.querySelector('.carousel-quote-slides');
  const slides = [...list.children];
  const i = (index + slides.length) % slides.length;
  // remember the programmatic target so in-flight scroll events don't overwrite the counter
  block.dataset.targetSlide = i;
  clearTimeout(Number(block.dataset.targetTimer));
  block.dataset.targetTimer = setTimeout(() => delete block.dataset.targetSlide, 1500);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  list.scrollTo({ left: slides[i].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
  updateState(block, i);
}

export default function decorate(block) {
  instanceId += 1;
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  const rows = [...block.querySelectorAll(':scope > div')].filter((row) => row.textContent.trim());

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  if (!block.getAttribute('aria-label')) block.setAttribute('aria-label', 'Customer quotes');

  const list = document.createElement('ul');
  list.className = 'carousel-quote-slides';
  rows.forEach((row, i) => list.append(createSlide(row, i, rows.length, instanceId)));

  const viewport = document.createElement('div');
  viewport.className = 'carousel-quote-viewport';
  viewport.append(list);
  block.replaceChildren(viewport);

  if (rows.length < 2) return;

  // large hover-revealed side arrows (desktop pointer only, see CSS); the counter arrows stay the
  // keyboard / screen-reader path, so these are removed from the tab order
  viewport.insertAdjacentHTML('beforeend', `
    <button type="button" class="carousel-quote-side carousel-quote-side-prev" aria-label="Previous quote" tabindex="-1">${ARROW_PREV}</button>
    <button type="button" class="carousel-quote-side carousel-quote-side-next" aria-label="Next quote" tabindex="-1">${ARROW_NEXT}</button>
  `);
  viewport.querySelector('.carousel-quote-side-prev').addEventListener('click', () => goTo(block, Number(block.dataset.activeSlide) - 1));
  viewport.querySelector('.carousel-quote-side-next').addEventListener('click', () => goTo(block, Number(block.dataset.activeSlide) + 1));

  const nav = document.createElement('div');
  nav.className = 'carousel-quote-nav';
  nav.innerHTML = `
    <button type="button" class="carousel-quote-prev" aria-label="Previous quote">${CHEVRON_PREV}</button>
    <p class="carousel-quote-counter" aria-live="polite" aria-atomic="true">
      <span class="carousel-quote-current">01</span><span class="carousel-quote-separator" aria-hidden="true">/</span><span class="carousel-quote-total">${pad(rows.length)}</span>
    </p>
    <button type="button" class="carousel-quote-next" aria-label="Next quote">${CHEVRON_NEXT}</button>
  `;
  block.append(nav);

  nav.querySelector('.carousel-quote-prev').addEventListener('click', () => goTo(block, Number(block.dataset.activeSlide) - 1));
  nav.querySelector('.carousel-quote-next').addEventListener('click', () => goTo(block, Number(block.dataset.activeSlide) + 1));

  // swipe / keyboard scrolling: sync the counter once the scroll settles
  let timer;
  list.addEventListener('scroll', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const i = getIndex(list);
      if (block.dataset.targetSlide !== undefined) {
        if (i !== Number(block.dataset.targetSlide)) return;
        delete block.dataset.targetSlide;
      }
      if (i !== Number(block.dataset.activeSlide)) updateState(block, i);
    }, 100);
  }, { passive: true });

  updateState(block, 0);
}
