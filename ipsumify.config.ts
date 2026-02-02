/**
 * Ipsumify Configuration
 * Single source of truth for all app configuration values
 *
 * All values are explicit - no internal references
 */

export const config = {
  // Site identity
  name: "Ipsumify",
  title: "Ipsumify - Lorem Ipsum Generator",
  description:
    "Generate beautiful lorem ipsum placeholder text with markdown support. Built for writers and designers who need realistic placeholder content.",
  shortDescription:
    "Generate beautiful lorem ipsum placeholder text with markdown support.",

  // URLs
  url: "https://ipsumify.com",
  github: "https://github.com/ICJIA/ipsumify-next-2026",

  // Branding
  author: "ICJIA",
  locale: "en_US",
  defaultLocale: "en",

  // Theme colors
  primaryColor: "#00d4aa",
  backgroundColor: "#0a0a0a",
  tileColor: "#0a0a0a",

  // Assets (paths)
  ogImagePath: "/og-image.png",
  faviconPath: "/icon.svg",

  // Full asset URLs
  ogImageUrl: "https://ipsumify.com/og-image.png",

  // OG Image dimensions
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: "Ipsumify - Easily create placeholder text",

  // Version
  version: "1.0.0",
} as const;

export default config;
