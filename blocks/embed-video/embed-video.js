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

// returns the iframe src for a supported video URL, or null
function getEmbedSrc(href, autoplay) {
  let url;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, '');
  if (host.endsWith('vimeo.com')) {
    // player.vimeo.com/video/<id> or vimeo.com/<id>[/<hash>]
    const parts = url.pathname.split('/').filter(Boolean);
    const idx = parts.findIndex((p) => /^\d+$/.test(p));
    if (idx === -1) return null;
    const params = new URLSearchParams(url.search);
    const hash = parts[idx + 1];
    if (hash && /^[a-f0-9]+$/i.test(hash) && !params.has('h')) params.set('h', hash);
    if (autoplay) params.set('autoplay', '1');
    const qs = params.toString();
    return { src: `https://player.vimeo.com/video/${parts[idx]}${qs ? `?${qs}` : ''}`, provider: 'Vimeo' };
  }
  if (host === 'youtu.be' || host.endsWith('youtube.com')) {
    const id = host === 'youtu.be'
      ? url.pathname.split('/').filter(Boolean)[0]
      : url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop();
    if (!id) return null;
    return { src: `https://www.youtube.com/embed/${encodeURIComponent(id)}?rel=0${autoplay ? '&autoplay=1' : ''}`, provider: 'YouTube' };
  }
  return null;
}

function loadIframe(frame, href, autoplay, label) {
  const embed = getEmbedSrc(href, autoplay);
  if (!embed) return;
  const iframe = document.createElement('iframe');
  iframe.src = embed.src;
  iframe.title = label || `Video from ${embed.provider}`;
  // fullscreen comes from the allow policy; adding allowfullscreen too logs a warning
  iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
  iframe.loading = 'lazy';
  frame.replaceChildren(iframe);
  frame.classList.add('embed-video-is-loaded');
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  const link = [...block.querySelectorAll('a[href]')].find((a) => getEmbedSrc(a.href, false));
  const anyLink = link || block.querySelector('a[href]');
  let poster = block.querySelector('picture');
  if (!poster) {
    const img = block.querySelector('img');
    if (img) {
      poster = document.createElement('picture');
      poster.append(img);
    }
  }

  const frame = document.createElement('div');
  frame.className = 'embed-video-frame';

  if (!link) {
    // unsupported or missing URL: keep poster and a plain link so nothing is lost
    if (poster) frame.append(poster);
    block.replaceChildren(frame);
    if (anyLink) {
      const p = document.createElement('p');
      p.append(anyLink);
      block.append(p);
    }
    return;
  }

  const { href } = link;
  const linkText = link.textContent.trim();
  const label = linkText && linkText !== href ? linkText : '';

  if (poster) {
    const img = poster.querySelector('img');
    if (img && isSameOrigin(img.getAttribute('src') || '')) {
      poster = createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '1600' }, { width: '750' }]);
    } else if (img) {
      img.setAttribute('loading', 'lazy');
    }
    poster.classList.add('embed-video-poster');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'embed-video-play';
    button.setAttribute('aria-label', label ? `Play video: ${label}` : 'Play video');

    frame.append(poster, button);
    frame.addEventListener('click', () => loadIframe(frame, href, true, label), { once: true });
    block.replaceChildren(frame);
    return;
  }

  // no poster: load the player when it scrolls into view
  block.replaceChildren(frame);
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      loadIframe(frame, href, false, label);
    }
  });
  observer.observe(block);
}
