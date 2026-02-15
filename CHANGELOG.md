# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Vitest testing framework with unit tests for random number generation
- Enhanced security headers (CSP, HSTS, Permissions-Policy, X-XSS-Protection)
- Error handling for clipboard operations with fallback for older browsers
- Error boundaries for graceful error recovery
- localStorage persistence for user preferences (theme, blocks, markdown options)
- Keyboard shortcuts (Alt+Shift+R, Alt+Shift+C, Alt+Shift+D, ?)
- Keyboard shortcuts help modal
- Share URL feature - encode settings in URL parameters
- GitHub Actions CI/CD workflow for automated testing and building
- GitHub community files (CONTRIBUTING.md, SECURITY.md, CODE_OF_CONDUCT.md)
- Dependabot configuration for automated dependency updates
- Issue and PR templates

### Changed
- Extracted random number utilities to separate module for better testability
- Extracted magic numbers to named constants (LCPRNG parameters, seed offsets)
- Updated dependencies to latest versions
- Improved copy button with error state feedback

### Fixed
- Copy to clipboard now handles browser compatibility with fallback method

## [2.0.0] - 2026-02-15

### Added
- Initial release with Nuxt 4, Nuxt UI 4, and Tailwind CSS 4
- Five themes: Lorem Ipsum, Dog-em Ipsum, Cat-em Ipsum, Baked-em Ipsum, BBQ-em Ipsum
- Markdown-ready output with headers, code blocks, blockquotes, lists, and links
- Customizable block count (1-20)
- Formatting options (capitalize, no-wrap)
- One-click copy to clipboard
- Download as .md file
- Dark theme UI
- 100% Lighthouse accessibility score
- SEO optimization with sitemap and robots.txt
- SSR-safe generation with seeded random number generator
- Netlify deployment configuration

[Unreleased]: https://github.com/ICJIA/ipsumify-next-2026/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/ICJIA/ipsumify-next-2026/releases/tag/v2.0.0
