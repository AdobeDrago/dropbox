/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroSplitParser from "./parsers/hero-split.js";
import carouselLogosParser from "./parsers/carousel-logos.js";
import cardsIntegrationParser from "./parsers/cards-integration.js";
import carouselTestimonialParser from "./parsers/carousel-testimonial.js";
import cardsIndustryParser from "./parsers/cards-industry.js";
import cardsArticleParser from "./parsers/cards-article.js";

// TRANSFORMER IMPORTS
import dropboxCleanupTransformer from "./transformers/dropbox-cleanup.js";
import dropboxSectionsTransformer from "./transformers/dropbox-sections.js";

// PARSER REGISTRY
const parsers = {
  "hero-split": heroSplitParser,
  "carousel-logos": carouselLogosParser,
  "cards-integration": cardsIntegrationParser,
  "carousel-testimonial": carouselTestimonialParser,
  "cards-industry": cardsIndustryParser,
  "cards-article": cardsArticleParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "home",
  "description": "Dropbox homepage: split hero, logo marquee, AI integration cards, feature highlights, security panel with testimonial slider, industry tiles, and resource articles",
  "urls": [
    "https://www.dropbox.com/"
  ],
  "blocks": [
    {
      "name": "hero-split",
      "instances": [
        ".dwg-hero-l3-plank .dwg-flex-grid"
      ]
    },
    {
      "name": "carousel-logos",
      "instances": [
        "[class*=\"_ticker_\"]"
      ]
    },
    {
      "name": "cards-integration",
      "instances": [
        ".dwg-multi-block.dwg-plank-frame--graphite .dwg-multi-block__grid"
      ]
    },
    {
      "name": "carousel-testimonial",
      "instances": [
        "[class*=\"_quoteCardsGrid_\"]"
      ]
    },
    {
      "name": "cards-industry",
      "instances": [
        ".dwg-multi-block.dwg-plank-frame--coconut-200 .dwg-multi-block__grid"
      ]
    },
    {
      "name": "cards-article",
      "instances": [
        ".dwg-multi-block.dwg-plank-frame--coconut .dwg-multi-block__grid"
      ]
    }
  ],
  "sections": [
    {
      "id": "rc1",
      "name": "Split hero",
      "selector": [
        ".dwg-hero-l3-plank",
        "#main-content > .dwg-plank-frame:nth-child(1)"
      ],
      "style": "light-beige",
      "blocks": [
        "hero-split"
      ],
      "defaultContent": []
    },
    {
      "id": "rc2",
      "name": "Centered H2 social-proof heading",
      "selector": [
        "#main-content > .dwg-plank-frame--coconut:nth-child(2)"
      ],
      "style": "light-beige",
      "blocks": [
        "carousel-logos"
      ],
      "defaultContent": [
        "h2"
      ]
    },
    {
      "id": "rc3",
      "name": "Eyebrow",
      "selector": [
        "#main-content > .dwg-plank-frame--graphite:nth-child(3)"
      ],
      "style": "dark",
      "blocks": [],
      "defaultContent": [
        ".dwg-stack__item",
        ".dwg-flex-grid__cell > .dwg-box a"
      ]
    },
    {
      "id": "rc4",
      "name": "3-column grid of AI integration items",
      "selector": [
        "#main-content > .dwg-multi-block.dwg-plank-frame--graphite:nth-child(4)"
      ],
      "style": "dark",
      "blocks": [
        "cards-integration"
      ],
      "defaultContent": []
    },
    {
      "id": "rc5",
      "name": "Continuation of integration items",
      "selector": [
        "#main-content > .dwg-multi-block.dwg-plank-frame--graphite:nth-child(5)"
      ],
      "style": "dark",
      "blocks": [
        "cards-integration"
      ],
      "defaultContent": []
    },
    {
      "id": "rc6",
      "name": "Pill eyebrow",
      "selector": [
        "#main-content > .dwg-plank-frame--coconut-200:nth-child(6)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".dwg-stack--v2",
        "picture"
      ]
    },
    {
      "id": "rc7",
      "name": "Pill eyebrow",
      "selector": [
        "#main-content > .dwg-plank-frame--coconut-200:nth-child(7)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".dwg-stack--v2",
        "picture"
      ]
    },
    {
      "id": "rc8",
      "name": "Pill eyebrow",
      "selector": [
        "#main-content > .dwg-plank-frame--coconut-200:nth-child(8)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".dwg-stack--v2",
        "picture"
      ]
    },
    {
      "id": "rc9",
      "name": "Lock icon",
      "selector": [
        "#main-content > .dwg-plank-frame--coconut-200.dwg-bg-color--transparent",
        "#main-content > .dwg-plank-frame:nth-child(9)"
      ],
      "style": "dark-panel",
      "blocks": [
        "carousel-testimonial"
      ],
      "defaultContent": [
        "[class*=\"_top_\"]",
        "[class*=\"_mediaContainer_\"] [class*=\"_rightMedia_\"] picture"
      ]
    },
    {
      "id": "rc10",
      "name": "Centered H2 \"Dropbox empowers across industries\"",
      "selector": [
        "#main-content > .dwg-plank-frame--coconut-200:nth-child(10)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "h2"
      ]
    },
    {
      "id": "rc11",
      "name": "2-column grid of 6 horizontal industry tiles",
      "selector": [
        "#main-content > .dwg-multi-block.dwg-plank-frame--coconut-200"
      ],
      "style": null,
      "blocks": [
        "cards-industry"
      ],
      "defaultContent": []
    },
    {
      "id": "rc12",
      "name": "Centered H2 \"Discover",
      "selector": [
        "#main-content > .dwg-plank-frame--coconut:nth-child(12)"
      ],
      "style": "light-beige",
      "blocks": [],
      "defaultContent": [
        "h2"
      ]
    },
    {
      "id": "rc13",
      "name": "3 white article cards",
      "selector": [
        "#main-content > .dwg-multi-block.dwg-plank-frame--coconut"
      ],
      "style": "light-beige",
      "blocks": [
        "cards-article"
      ],
      "defaultContent": []
    },
    {
      "id": "rc14",
      "name": "Centered link \"View more resources\"",
      "selector": [
        "#main-content > .dwg-rich-text-plank:nth-child(14)"
      ],
      "style": "light-beige",
      "blocks": [],
      "defaultContent": [
        "p"
      ]
    },
    {
      "id": "rc15",
      "name": "Disclaimer paragraph",
      "selector": [
        "#main-content > .dwg-rich-text-plank:nth-child(15)"
      ],
      "style": "light-beige",
      "blocks": [],
      "defaultContent": [
        "p"
      ]
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
