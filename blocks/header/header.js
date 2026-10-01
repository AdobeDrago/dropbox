// desktop layout (horizontal nav with hover dropdowns) starts at 1200px
const isDesktop = window.matchMedia('(width >= 1200px)');

/**
 * Fetches the nav fragment: /content first (local preview), then the site root (DA/EDS).
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), base: resp.url };
}

/**
 * Resolves relative image paths against the fragment URL so they work on any page depth.
 * @param {Element} root fragment root
 * @param {string} base URL the fragment was fetched from
 */
function resolveImages(root, base) {
  root.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!/^(https?:|data:|\/)/.test(src)) img.src = new URL(src, base).href;
    img.loading = 'eager';
  });
}

function closeAll(nav) {
  nav.querySelectorAll('.nav-item[aria-expanded="true"]').forEach((item) => {
    item.setAttribute('aria-expanded', 'false');
    item.querySelector(':scope > button')?.setAttribute('aria-expanded', 'false');
  });
  const wrapper = nav.closest('.nav-wrapper');
  wrapper.classList.remove('is-open');
  wrapper.querySelector('.nav-dropdown-background').style.height = '';
  document.querySelector('.nav-overlay')?.classList.remove('is-open');
}

function openItem(nav, item) {
  closeAll(nav);
  item.setAttribute('aria-expanded', 'true');
  item.querySelector(':scope > button').setAttribute('aria-expanded', 'true');
  if (!isDesktop.matches) return;
  const wrapper = nav.closest('.nav-wrapper');
  const panel = item.querySelector(':scope > .nav-panel');
  wrapper.classList.add('is-open');
  wrapper.querySelector('.nav-dropdown-background').style.height = `${panel.offsetHeight}px`;
  document.querySelector('.nav-overlay')?.classList.add('is-open');
}

/**
 * Splits a card link (img + strong title + trailing text) into styled parts.
 * @param {HTMLAnchorElement} a link
 */
function decorateCardLink(a) {
  const img = a.querySelector('img');
  const title = a.querySelector('strong');
  const desc = [...a.childNodes].filter((n) => n !== img && n !== title)
    .map((n) => n.textContent).join('').trim();
  a.textContent = '';
  if (img) {
    const icon = document.createElement('span');
    icon.className = 'nav-card-icon';
    icon.append(img);
    a.append(icon);
  }
  const text = document.createElement('span');
  text.className = 'nav-card-text';
  const t = document.createElement('span');
  t.className = 'nav-card-title';
  t.textContent = title ? title.textContent.trim() : '';
  text.append(t);
  if (desc) {
    const d = document.createElement('span');
    d.className = 'nav-card-desc';
    d.textContent = desc;
    text.append(d);
  }
  a.append(text);
}

/**
 * Builds a modal picker from a list without links (e.g. the language list).
 * @param {HTMLLIElement} item nav list item
 * @param {HTMLUListElement} list list of options
 */
function buildModalItem(item, list) {
  const [iconP, titleP] = item.querySelectorAll(':scope > p');
  const img = iconP?.querySelector('img');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'nav-icon-button';
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-label', img?.alt || titleP?.textContent.trim() || '');
  if (img) { img.alt = ''; button.append(img); }

  const dialog = document.createElement('dialog');
  dialog.className = 'nav-modal';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'nav-modal-close';
  close.setAttribute('aria-label', 'Close');
  const title = document.createElement('h2');
  title.className = 'nav-modal-title';
  title.textContent = titleP?.textContent.trim() || '';
  const options = document.createElement('ul');
  options.className = 'nav-modal-list';
  [...list.children].forEach((li) => {
    const opt = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = li.textContent.trim();
    b.lang = '';
    b.addEventListener('click', () => dialog.close());
    opt.append(b);
    options.append(opt);
  });
  dialog.append(close, title, options);
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  button.addEventListener('click', () => dialog.showModal());

  item.textContent = '';
  item.classList.add('nav-item-modal');
  item.append(button, dialog);
}

/**
 * Turns an item with a nested list into a dropdown trigger + panel.
 * @param {Element} nav nav element
 * @param {HTMLLIElement} item nav list item
 * @param {HTMLUListElement} list nested list
 */
function buildDropdownItem(nav, item, list) {
  const label = item.querySelector(':scope > p')?.textContent.trim() || '';
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-haspopup', 'true');
  button.innerHTML = '<span class="nav-item-label"></span><span class="nav-chevron" aria-hidden="true"></span>';
  button.querySelector('.nav-item-label').textContent = label;

  const panel = document.createElement('div');
  panel.className = 'nav-panel';
  const hasGroups = [...list.children].some((li) => li.querySelector(':scope > ul'));
  const hasCards = !!list.querySelector(':scope > li > a img');
  if (hasGroups) {
    panel.classList.add('nav-panel-columns');
    list.querySelectorAll(':scope > li > p').forEach((p) => p.classList.add('nav-panel-heading'));
  } else if (hasCards) {
    panel.classList.add('nav-panel-cards');
    list.querySelectorAll(':scope > li > a').forEach(decorateCardLink);
  } else {
    panel.classList.add('nav-panel-list');
  }
  const inner = document.createElement('div');
  inner.className = 'nav-panel-inner';
  inner.append(list);
  panel.append(inner);

  item.textContent = '';
  item.classList.add('nav-drop');
  item.setAttribute('aria-expanded', 'false');
  item.append(button, panel);

  item.addEventListener('mouseenter', () => { if (isDesktop.matches) openItem(nav, item); });
  item.addEventListener('mouseleave', () => { if (isDesktop.matches) closeAll(nav); });
  button.addEventListener('click', () => {
    if (item.getAttribute('aria-expanded') === 'true') closeAll(nav);
    else openItem(nav, item);
  });
}

/**
 * Wraps an element's text in a label span (typography lives on the label, layout on the box).
 * @param {Element} el link or button
 * @param {string} className label class
 */
function wrapLabel(el, className) {
  const label = document.createElement('span');
  label.className = className;
  label.append(...el.childNodes);
  el.append(label);
}

/**
 * Decorates a nav section: list items become nav items, a bold link becomes the CTA.
 * @param {Element} nav nav element
 * @param {Element} section section element
 */
function decorateSection(nav, section) {
  section.querySelectorAll(':scope > ul').forEach((ul) => {
    ul.classList.add('nav-list');
    [...ul.children].forEach((item) => {
      item.classList.add('nav-item');
      const sub = item.querySelector(':scope > ul');
      if (!sub) {
        const link = item.querySelector(':scope > a');
        if (link) wrapLabel(link, 'nav-item-label');
        return;
      }
      if (sub.querySelector('a')) buildDropdownItem(nav, item, sub);
      else buildModalItem(item, sub);
    });
  });
  section.querySelectorAll(':scope > p').forEach((p) => {
    const a = p.querySelector('a');
    if (!a) return;
    if (p.querySelector('strong')) {
      a.className = 'button primary';
      wrapLabel(a, 'nav-cta-label');
      p.className = 'nav-cta';
      p.replaceChildren(a);
    }
  });
}

function toggleMenu(nav, force = null) {
  const open = force !== null ? force : nav.getAttribute('aria-expanded') !== 'true';
  nav.setAttribute('aria-expanded', open ? 'true' : 'false');
  const button = nav.querySelector('.nav-hamburger button');
  button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  button.setAttribute('aria-expanded', open ? 'true' : 'false');
  document.body.style.overflowY = open && !isDesktop.matches ? 'hidden' : '';
  if (!open) closeAll(nav);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  if (!fragment) return;
  const root = document.createElement('div');
  root.innerHTML = fragment.html;
  resolveImages(root, fragment.base);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');
  const sections = [...root.querySelectorAll(':scope > div')];
  ['brand', 'sections', 'tools'].forEach((name, i) => {
    const section = sections[i];
    if (!section) return;
    section.className = `nav-${name}`;
    nav.append(section);
  });
  sections.slice(3).forEach((section) => nav.append(section));

  const brandLink = nav.querySelector('.nav-brand a');
  if (brandLink) {
    brandLink.className = 'nav-logo';
    brandLink.setAttribute('aria-label', brandLink.querySelector('img')?.alt || 'Home');
  }
  nav.querySelectorAll('.nav-sections, .nav-tools').forEach((s) => decorateSection(nav, s));

  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-expanded="false" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.querySelector('button').addEventListener('click', () => toggleMenu(nav));
  nav.append(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  const sheet = document.createElement('div');
  sheet.className = 'nav-dropdown-background';
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav, sheet);

  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.addEventListener('click', () => closeAll(nav));
  block.append(navWrapper, overlay);

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (nav.querySelector('.nav-item[aria-expanded="true"]')) closeAll(nav);
    else if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') toggleMenu(nav, false);
  });
  nav.addEventListener('focusout', (e) => {
    if (isDesktop.matches && !nav.contains(e.relatedTarget)) closeAll(nav);
  });
  isDesktop.addEventListener('change', () => toggleMenu(nav, false));
}
