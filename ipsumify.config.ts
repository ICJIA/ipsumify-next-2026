/**
 * Ipsumify Configuration
 *
 * Single source of truth for all app configuration values.
 * All values are explicit - no internal references.
 * Keep version in sync with package.json.
 *
 * @module ipsumify.config
 */

/**
 * Application configuration object.
 * @constant
 */
export const config = {
  /** @type {string} Site display name */
  name: "Ipsumify",
  /** @type {string} Full page title for SEO and browser tab */
  title: "Ipsumify - Lorem Ipsum Generator",
  /** @type {string} Long description for meta tags and SEO */
  description:
    "Generate beautiful lorem ipsum placeholder text with markdown support, themed variants, and a free public API — no signup required.",
  /** @type {string} Short description for Twitter/social cards */
  shortDescription:
    "Generate beautiful lorem ipsum placeholder text with markdown support, themed variants, and a free public API — no signup required.",

  /** @type {string} Canonical site URL */
  url: "https://ipsumify.com",
  /** @type {string} GitHub repository URL */
  github: "https://github.com/ICJIA/ipsumify-next-2026",
  /** @type {string} Path of the page that explains how the generator works */
  technicalDetailsPath: "/technical-details",
  /** @type {string} Full URL of that page, for its canonical and social tags */
  technicalDetailsUrl: "https://ipsumify.com/technical-details",
  /** @type {string} Title of that page */
  technicalDetailsTitle: "Technical Details - Ipsumify",
  /** @type {string} Description of that page */
  technicalDetailsDescription:
    "How Ipsumify works: the seeded generator behind the text, and how the website, the public API and the npm package share it.",
  /** @type {string} Changelog, linked from the footer */
  changelog: "https://github.com/ICJIA/ipsumify-next-2026/blob/main/CHANGELOG.md",

  /** @type {string} Author/organization name */
  author: "ICJIA",
  /** @type {string} ISO 8601 date first published (for JSON-LD / SEO freshness) */
  datePublished: "2026-02-15",
  /** @type {string} ISO 8601 date the page/metadata was last updated */
  dateModified: "2026-11-10",
  /** @type {string} BCP 47 locale (e.g. en_US) */
  locale: "en_US",
  /** @type {string} Default locale for SEO (e.g. en) */
  defaultLocale: "en",

  /** @type {string} Primary accent color (hex) */
  primaryColor: "#00d4aa",
  /** @type {string} Background color for theme (hex) */
  backgroundColor: "#0a0a0a",
  /** @type {string} Tile color for Windows pinned tabs (hex) */
  tileColor: "#0a0a0a",

  /** @type {string} Path to OG image (relative to public/) */
  ogImagePath: "/og-image.png",
  /** @type {string} Path to favicon (relative to public/) */
  faviconPath: "/icon.svg",

  /** @type {string} Full URL to OG image for social sharing */
  ogImageUrl: "https://ipsumify.com/og-image.png",

  /** @type {number} OG image width in pixels */
  ogImageWidth: 1200,
  /** @type {number} OG image height in pixels */
  ogImageHeight: 630,
  /** @type {string} Alt text for OG image */
  ogImageAlt: "Ipsumify - Easily create placeholder text",

  /** @type {string} App version - keep in sync with package.json and packages/ipsumify/package.json (a unit test checks) */
  version: "2.7.0",

  /** @type {string} Default theme ID for generator (e.g. lorem, dog, cat) */
  defaultThemeId: "lorem",
  /** @type {number} Default number of text blocks to generate */
  defaultBlocks: 5,
  /** @type {number} Initial seed for deterministic output (SSR-safe) */
  defaultSeed: 42,
} as const;

export default config;
