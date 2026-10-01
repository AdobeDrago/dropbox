import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];
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

function isImageOnly(cell) {
  return cell.querySelector('picture, img') && !cell.textContent.trim();
}

function createSlide(row, index, id) {
  const slide = document.createElement('li');
  slide.className = 'carousel-testimonial-slide';
  slide.dataset.slideIndex = index;
  slide.id = `carousel-testimonial-${id}-slide-${index}`;

  const media = document.createElement('div');
  media.className = 'carousel-testimonial-slide-media';
  const content = document.createElement('div');
  content.className = 'carousel-testimonial-slide-content';

  [...row.children].forEach((cell) => {
    if (isImageOnly(cell) && !media.children.length) {
      while (cell.firstChild) media.append(cell.firstChild);
    } else {
      while (cell.firstChild) content.append(cell.firstChild);
    }
  });

  media.querySelectorAll('picture > img').forEach((img) => {
    if (!isSameOrigin(img.getAttribute('src') || '')) {
      img.setAttribute('loading', 'lazy');
      return;
    }
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  // first short paragraph before the heading is the eyebrow
  const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    const prev = heading.previousElementSibling;
    if (prev && prev.tagName === 'P' && !prev.querySelector('a')) prev.classList.add('carousel-testimonial-slide-eyebrow');
    if (!heading.id) heading.id = `${slide.id}-title`;
    slide.setAttribute('aria-labelledby', heading.id);
  }

  // the last link is the "watch" CTA; a video link also makes the thumbnail clickable
  const links = content.querySelectorAll('a[href]');
  const cta = links[links.length - 1];
  if (!cta) {
    // imported content can carry the CTA as plain text ("Watch testimonial") with no link:
    // flag the trailing short paragraph after the description so it keeps its CTA position
    const afterHeading = heading
      ? [...content.querySelectorAll(':scope > p')].filter(
        // eslint-disable-next-line no-bitwise
        (p) => heading.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING,
      )
      : [];
    const last = afterHeading[afterHeading.length - 1];
    if (afterHeading.length > 1 && last.textContent.trim().length <= 40 && !last.querySelector('picture, img')) {
      last.classList.add('carousel-testimonial-slide-cta', 'carousel-testimonial-slide-cta-text');
    }
  } else {
    cta.closest('p')?.classList.add('carousel-testimonial-slide-cta');
    const pic = media.querySelector('picture');
    if (pic) {
      const a = document.createElement('a');
      a.href = cta.href;
      a.className = 'carousel-testimonial-slide-play';
      a.setAttribute('tabindex', '-1');
      a.setAttribute('aria-hidden', 'true');
      pic.replaceWith(a);
      a.append(pic);
    }
  }

  if (media.children.length) slide.append(media);
  else slide.classList.add('carousel-testimonial-slide-no-media');
  slide.append(content);
  return slide;
}

function updateState(block) {
  const list = block.querySelector('.carousel-testimonial-slides');
  const prev = block.querySelector('.carousel-testimonial-prev');
  const next = block.querySelector('.carousel-testimonial-next');
  if (!list || !prev || !next) return;
  const max = list.scrollWidth - list.clientWidth - 2;
  prev.disabled = list.scrollLeft <= 2;
  next.disabled = list.scrollLeft >= max;
}

function scrollBySlide(block, dir) {
  const list = block.querySelector('.carousel-testimonial-slides');
  const slide = list.querySelector('.carousel-testimonial-slide');
  if (!slide) return;
  const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
  list.scrollBy({ left: dir * (slide.offsetWidth + gap), behavior: 'smooth' });
}

export default function decorate(block) {
  instanceId += 1;
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  const rows = [...block.querySelectorAll(':scope > div')]
    .filter((row) => row.textContent.trim() || row.querySelector('img'));

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const list = document.createElement('ul');
  list.className = 'carousel-testimonial-slides';
  rows.forEach((row, idx) => list.append(createSlide(row, idx, instanceId)));

  const viewport = document.createElement('div');
  viewport.className = 'carousel-testimonial-viewport';
  viewport.append(list);
  block.replaceChildren(viewport);

  if (rows.length < 2) return;

  const nav = document.createElement('div');
  nav.className = 'carousel-testimonial-nav';
  nav.innerHTML = `
    <button type="button" class="carousel-testimonial-prev" aria-label="Previous slide"></button>
    <button type="button" class="carousel-testimonial-next" aria-label="Next slide"></button>
  `;
  block.append(nav);

  nav.querySelector('.carousel-testimonial-prev').addEventListener('click', () => scrollBySlide(block, -1));
  nav.querySelector('.carousel-testimonial-next').addEventListener('click', () => scrollBySlide(block, 1));
  list.addEventListener('scroll', () => updateState(block), { passive: true });
  window.addEventListener('resize', () => updateState(block));
  requestAnimationFrame(() => updateState(block));
}
