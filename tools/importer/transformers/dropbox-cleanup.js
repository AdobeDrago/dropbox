/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: dropbox.com site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html:
 * - iframe#ccpa-iframe                      (line 2)    cookie / CCPA consent banner
 * - a.skip-to-main-content                  (line 6)    skip link
 * - .dwg-nav__overlay                       (line 10)   nav overlay inside #warp-metadata
 * - nav.dwg-nav.dwg-nav--sticky             (line 12)   global header / navigation
 * - #warp-metadata > footer / footer        (line 2367) global footer (only footer on page)
 * - #one-tap-fpjs-container                 (line 2650) Google One Tap / fingerprint container
 * - iframe[src*="marketing.dropbox.com"]    (line 2654) marketing tracking iframe
 * - iframe[src="about:blank"]               (line 2662) blank tracking iframe
 * - .dwg-modal__portal                      (line 2656) empty modal portals
 * - main .dwg-icon-button                   (line 1324) logo-marquee pause button (non-authorable control)
 * - video > source[src=""]                  (lines 997, 1634, 1701, 1768) empty video sources
 * - video.dwg-media-video                   (lines 994, 1631, 1698, 1765) transparent .mov UI
 *   animations with no poster; removed after parsing so no broken media is emitted.
 *
 * The logo marquee ([class*="_ticker_"]) repeats its 8 logos 5x; it is intentionally left
 * untouched here so the carousel-logos parser can read a single set.
 * Direct children of #main-content are never removed, so section :nth-child selectors stay stable.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / consent / widgets that could interfere with block parsing
    WebImporter.DOMUtils.remove(element, [
      '#ccpa-iframe',
      '#one-tap-fpjs-container',
      '.dwg-modal__portal',
      '.dwg-nav__overlay',
      'a.skip-to-main-content',
      // A/B-test (Coframe) injections: sticky CTA bar duplicating page CTAs, empty mount points
      '#cf-sticky-cta-bar',
      '[id^="cf-"][id$="-mount"]',
    ]);

    // Empty <source src=""> entries inside videos produce broken media references
    element.querySelectorAll('video source').forEach((source) => {
      const src = source.getAttribute('src');
      if (src !== null && src.trim() === '') source.remove();
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Default-content CTAs (blocks were already rebuilt by parsers): mark authored button
    // styles so EDS decorateButtons picks them up — primary -> <strong>, outline -> <em>.
    element.querySelectorAll('#main-content a.dwg-button2').forEach((a) => {
      if (a.closest('strong, em')) return;
      let wrapTag = null;
      if (a.classList.contains('dwg-button2--button-style-primary')) wrapTag = 'strong';
      else if (a.classList.contains('dwg-button2--button-style-outline')) wrapTag = 'em';
      if (!wrapTag) return;
      const wrapper = document.createElement(wrapTag);
      a.replaceWith(wrapper);
      wrapper.append(a);
    });

    // Global chrome: header/nav, footer
    WebImporter.DOMUtils.remove(element, [
      'nav.dwg-nav.dwg-nav--sticky',
      '#warp-metadata > footer',
      'footer',
    ]);

    // Tracking iframes and any leftover embeds/scripts
    WebImporter.DOMUtils.remove(element, [
      'iframe[src*="marketing.dropbox.com"]',
      'iframe[src="about:blank"]',
      'iframe',
      'script',
      'noscript',
      'link',
      'style',
    ]);

    // Non-authorable UI control (marquee pause button)
    WebImporter.DOMUtils.remove(element, ['.dwg-icon-button']);

    // Transparent .mov animations have no poster and cannot be rendered as authored media.
    // Parsers have already extracted anything they need, so drop leftover <video> elements.
    element.querySelectorAll('video').forEach((video) => {
      if (!video.getAttribute('poster')) video.remove();
    });

    // Empty <picture><source class="dwg-box"></picture> sources with no srcset
    element.querySelectorAll('picture > source').forEach((source) => {
      if (!source.getAttribute('srcset') && !source.getAttribute('src')) source.remove();
    });

    // Attribute cleanup
    element.querySelectorAll('[coframe-exp-id]').forEach((el) => el.removeAttribute('coframe-exp-id'));
  }
}
