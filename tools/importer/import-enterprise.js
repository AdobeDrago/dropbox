/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroSplitParser from "./parsers/hero-split.js";
import cardsBadgeParser from "./parsers/cards-badge.js";
import accordionMediaParser from "./parsers/accordion-media.js";
import columnsMediaParser from "./parsers/columns-media.js";
import cardsIntegrationParser from "./parsers/cards-integration.js";
import embedVideoParser from "./parsers/embed-video.js";
import carouselQuoteParser from "./parsers/carousel-quote.js";
import columnsCtaParser from "./parsers/columns-cta.js";

// TRANSFORMER IMPORTS
import dropboxCleanupTransformer from "./transformers/dropbox-cleanup.js";
import dropboxSectionsTransformer from "./transformers/dropbox-sections.js";

// PARSER REGISTRY
const parsers = {
  "hero-split": heroSplitParser,
  "cards-badge": cardsBadgeParser,
  "accordion-media": accordionMediaParser,
  "columns-media": columnsMediaParser,
  "cards-integration": cardsIntegrationParser,
  "embed-video": embedVideoParser,
  "carousel-quote": carouselQuoteParser,
  "columns-cta": columnsCtaParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "enterprise",
  "description": "Dropbox Enterprise product page: split hero, G2 badge cards, security accordion with media, alternating media/text rows, feature/integration/stat card grids, Vimeo video, quote slider, closing CTA band",
  "urls": [
    "https://www.dropbox.com/enterprise"
  ],
  "blocks": [
    {
      "name": "hero-split",
      "instances": [
        ".dwg-hero-l3-plank > .dwg-plank-frame__inner > .dwg-flex-grid"
      ]
    },
    {
      "name": "cards-badge",
      "instances": [
        "#dwg_multi_block_plank-adfdcc8096 .dwg-multi-block__grid"
      ]
    },
    {
      "name": "accordion-media",
      "instances": [
        ".dwg-jtbd-plank"
      ]
    },
    {
      "name": "columns-media",
      "instances": [
        "#dwg_media_text_plank-2612c7b4e4"
      ]
    },
    {
      "name": "cards-integration",
      "instances": [
        "#dwg_multi_block_plank-7620d115ea .dwg-multi-block__grid",
        "#dwg_multi_block_plank-adca18c2cd .dwg-multi-block__grid",
        "#dwg_multi_block_plank-b22b0f59a7 .dwg-multi-block__grid",
        "#dwg_multi_block_plank-90effcd6bc .dwg-multi-block__grid",
        "#dwg_multi_block_plank-afbaed9ade .dwg-multi-block__grid"
      ]
    },
    {
      "name": "embed-video",
      "instances": [
        "#dwg_media_asset_plank-2c5d53d68a"
      ]
    },
    {
      "name": "carousel-quote",
      "instances": [
        ".dwg-quote-gallery"
      ]
    },
    {
      "name": "columns-cta",
      "instances": [
        "#dwg_pre_footer_plank-241bcf37b0"
      ]
    }
  ],
  "sections": [
    {
      "id": "es1",
      "name": "Hero",
      "selector": [
        "#dwg_hero_l3_plank-d82d453e7e",
        ".dwg-hero-l3-plank"
      ],
      "style": "light-beige",
      "blocks": [
        "hero-split"
      ],
      "defaultContent": []
    },
    {
      "id": "es2",
      "name": "G2 reviews + badges",
      "selector": [
        "#dwg_headline_plank-3b127dce19"
      ],
      "style": "dark",
      "blocks": [
        "cards-badge"
      ],
      "defaultContent": [
        "h2",
        ".dwg-stack__item .dwg-text",
        "a.dwg-button2"
      ]
    },
    {
      "id": "es3",
      "name": "Security + accordion",
      "selector": [
        "#dwg_headline_plank-f3399edfb5"
      ],
      "style": "light-beige",
      "blocks": [
        "accordion-media"
      ],
      "defaultContent": [
        "h2",
        ".dwg-stack__item .dwg-text",
        "a.dwg-button2"
      ]
    },
    {
      "id": "es4",
      "name": "Enterprise features media rows",
      "selector": [
        "#dwg_headline_plank-8d7ea828aa"
      ],
      "style": "light-beige",
      "blocks": [
        "columns-media"
      ],
      "defaultContent": [
        "h2",
        ".dwg-stack__item .dwg-text",
        "a.dwg-button2"
      ]
    },
    {
      "id": "es5",
      "name": "Like Dropbox, but bigger",
      "selector": [
        "#dwg_headline_plank-bb47e88177"
      ],
      "style": "dark",
      "blocks": [
        "cards-integration"
      ],
      "defaultContent": [
        "h2",
        ".dwg-stack__item .dwg-text",
        "a.dwg-button2"
      ]
    },
    {
      "id": "es6",
      "name": "Expedia video",
      "selector": [
        "#dwg_headline_plank-7f54712143"
      ],
      "style": "light-beige",
      "blocks": [
        "embed-video"
      ],
      "defaultContent": [
        "h2",
        ".dwg-stack__item .dwg-text",
        "a.dwg-button2"
      ]
    },
    {
      "id": "es7",
      "name": "App integrations",
      "selector": [
        "#dwg_headline_plank-13f4876065"
      ],
      "style": "light-beige",
      "blocks": [
        "cards-integration"
      ],
      "defaultContent": [
        "h2",
        ".dwg-stack__item .dwg-text",
        "a.dwg-button2"
      ]
    },
    {
      "id": "es8",
      "name": "Forrester ROI stats",
      "selector": [
        "#dwg_headline_plank-d247160ca8"
      ],
      "style": "dark",
      "blocks": [
        "cards-integration"
      ],
      "defaultContent": [
        "h2",
        ".dwg-stack__item .dwg-text",
        "a.dwg-button2"
      ]
    },
    {
      "id": "es9",
      "name": "Customer quotes",
      "selector": [
        "#dwg_quote_gallery_v2_plank-ab73b05f0c",
        ".dwg-quote-gallery"
      ],
      "style": "light-beige",
      "blocks": [
        "carousel-quote"
      ],
      "defaultContent": []
    },
    {
      "id": "es10",
      "name": "Good company stats",
      "selector": [
        "#dwg_headline_plank-b424e76701"
      ],
      "style": "light-beige",
      "blocks": [
        "cards-integration"
      ],
      "defaultContent": [
        "h2",
        ".dwg-stack__item .dwg-text",
        "a.dwg-button2"
      ]
    },
    {
      "id": "es11",
      "name": "Closing CTA",
      "selector": [
        "#dwg_pre_footer_plank-241bcf37b0"
      ],
      "style": "dark",
      "blocks": [
        "columns-cta"
      ],
      "defaultContent": []
    }
  ]
};

// TRANSFORMER REGISTRY - cleanup first, then sections
const transformers = [
  dropboxCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [dropboxSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - "beforeTransform" or "afterTransform"
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Initial cleanup + section breaks
    executeTransformers("beforeTransform", main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by a prior parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Final cleanup + section metadata
    executeTransformers("afterTransform", main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement("hr");
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path; root URL maps to /index
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, "")
      .replace(/\.html?$/, "");
    const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
