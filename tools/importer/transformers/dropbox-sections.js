/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: dropbox.com section breaks + Section Metadata.
 * Section boundaries come from payload.template.sections (page-templates.json). They are the
 * 15 direct children of #main-content (dwg-*-plank / dwg-plank-frame containers) verified in
 * migration-work/cleaned.html.
 *
 * Breaks are inserted in beforeTransform (before parsers replace block elements); Section
 * Metadata is inserted in afterTransform anchored to a marker <hr>. Sections are processed in
 * reverse so earlier section elements remain where querySelector found them.
 * Note: <hr> insertion shifts :nth-child indices of later siblings, but reverse iteration means
 * every section still to be processed precedes all inserted <hr> elements.
 */
const SECTION_MARKER_ATTR = 'data-excat-section-id';

// section.selector is an array of candidate selectors - first match wins.
function querySection(root, selectors) {
  const list = Array.isArray(selectors) ? selectors : [selectors];
  for (const sel of list) {
    if (!sel) continue;
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no break, no metadata needed
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue; // never guess a replacement

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue;

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
