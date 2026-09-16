# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.2] - 2026-09-16

Three defects found by the application health check of 16 September 2026.

### Fixed
- **The browser tab read "Ipsumify - Lorem Ipsum Generator | %siteName".** `@nuxtjs/seo` sets the title template `%s %separator %siteName`, and with `ssr: false` its `%siteName` never resolves on the client: nuxt-site-config only sends the site name when `process.env.NUXT_NO_SSR` is set, which Nuxt 4.3 no longer provides at runtime. The placeholder showed in the tab, bookmarks and history, and in the page title a screen reader announces. `app.vue` now sets the template to `%s` — the title already names the site. Verified in a browser on a production build: the title reads "Ipsumify - Lorem Ipsum Generator" after the app loads, matching the prerendered `<title>`.
- **A share link made after Regenerate showed the recipient different words.** Links carried the theme, block count and options but not the seed, so both ends fell back to seed 42 while Regenerate had picked another. Share Settings now writes `seed` into the link and the page reads it back, accepting only whole numbers from 0 to 2,147,483,647 — a negative seed makes the generator index below zero and return empty text, and past that the arithmetic is no longer guaranteed exact; anything else falls back to the default. The README's promise that others "see the same output" is now true. Verified in a browser on a production build: after Regenerate, the copied link was `/?theme=lorem&blocks=5&seed=80397`, and a fresh browser opening it showed the identical 1,125 characters; `seed=-6` shows ordinary text. Six new unit tests cover encoding, validation and the round trip itself.
- **CI checked a build Netlify never runs, and hid a failing upload.** The build job ran `yarn generate` — a fully static build without the `/api/generate` function — and uploaded `.output/public`, which that configuration never writes, so the artifact step went green having uploaded nothing. It now runs `yarn build`, checks that both `dist/index.html` and the Netlify function bundle exist, and fails if the artifact path is empty. The Codecov upload failed on every run for want of a token (`Token required - not valid tokenless upload`) while `fail_ci_if_error: false` reported it green; it now runs only once a `CODECOV_TOKEN` secret exists, and fails the job if a configured upload breaks.

Verified locally before release: `yarn install --frozen-lockfile`, `yarn lint`, `yarn typecheck`, `yarn test:coverage` (58 tests) and `yarn build` all exit 0, and the build writes both `dist/` and `.netlify/functions-internal/server/`.

## [2.3.1] - 2026-09-16

### Fixed
- **CI has failed on every push since 2026-09-15; `vue-tsc` is now a devDependency.** It was declared nowhere, so `nuxt typecheck` fetched whatever npm's latest was through `npx`. That is now vue-tsc 3.3.11, which accepts any TypeScript from 5.0 up and so is paired with TypeScript 7.0.2 — whose exports map no longer includes `typescript/lib/tsc`, the path vue-tsc loads. The typecheck crashed before checking a line. Declared in `package.json` and locked in `yarn.lock`, it now runs against the project's own TypeScript 5.9.3, the same on every machine and in CI.
- **The type error the working check then found.** The Copy button's `@click="showCopyMenu = !showCopyMenu"` compiles to a handler that returns a boolean, and Nuxt UI's `UButton` types `onClick` as returning nothing. It is now a `toggleCopyMenu()` function. Behavior is unchanged — Vue ignores a handler's return value — and was checked in a browser: the menu opens, closes, and closes on an outside click.

## [2.3.0] - 2026-09-16

### Removed
- **The Docker deployment path, which was unused.** `Dockerfile`, `docker-compose.yml`, `.dockerignore`, and the ~215 README lines documenting Docker, Nginx, DigitalOcean and Laravel Forge deployment. Removed because it is not used and not planned.

  **Correction.** This entry, and the commit that made the change, first said the path could never have worked: that `nitro.preset: 'netlify'` in `nuxt.config.ts` outranks `NITRO_PRESET`, so `yarn build` could never produce the `.output/` the Dockerfile copies. That was wrong. `nuxt build` passes `NITRO_PRESET` to Nuxt as a config override (`@nuxt/cli`: `preset: ctx.args.preset || process.env.NITRO_PRESET || process.env.SERVER_PRESET`), and an override beats the config file. On a clean export of this release, `NITRO_PRESET=node-server yarn build` reports `Nitro preset: node-server` and writes `.output/`, and `node .output/server/index.mjs` serves both the page and `/api/generate`. The earlier check loaded the Nuxt config without the CLI, which does resolve `netlify`. The README's statement that "the environment variable overrides the preset at build time" was correct.

  Netlify is now the only documented deployment.

### Fixed
- **The README's Netlify publish directory.** It claimed `.output/public`; `netlify.toml` publishes `dist`. A reader configuring a new Netlify site by hand from the README would have pointed it at a directory the build does not create.

## [2.2.0] - 2026-06-07

### Added
- JSON-LD structured data (`WebApplication` schema) in the prerendered HTML — includes author, publisher, offers, `datePublished`/`dateModified`, and a feature list for search engines and AI systems
- `<meta name="author">` tag for content attribution
- `public/llms.txt` describing the site and public API for LLM consumption (per the llmstxt.org spec)
- `datePublished` and `dateModified` fields in `ipsumify.config.ts` to signal content freshness

### Changed
- Expanded the meta description from 70 to 131 characters for richer AI and search-engine summaries

### Fixed
- Accessibility (WCAG 2.5.3 Label in Name): the logo/reset button and the Share Settings button now include their visible text in their accessible names, so speech-input users can activate them by name
- SEO: force an absolute `rel=canonical` on the client. With `ssr: false`, @nuxtjs/seo emitted a relative path ("/"), which Lighthouse flagged as an invalid canonical (Lighthouse SEO 92 → 100)

## [2.1.0] - 2026-02-15

### Added
- Docker support: Dockerfile, docker-compose.yml, and .dockerignore for self-hosting on port 5150
- Deployment guides for DigitalOcean droplets and Laravel Forge with nginx reverse proxy
- Keyboard shortcut feedback indicator (brief notification on shortcut use)
- README table of contents
- README features: shareable URLs, keyboard shortcuts, Docker, deterministic output
- README section: SEO with `ssr: false` (problem/solution documentation)
- Vitest testing framework with unit tests for random number generation
- Enhanced security headers (CSP, HSTS, Permissions-Policy, X-XSS-Protection)
- Error handling for clipboard operations with fallback for older browsers
- Error boundaries for graceful error recovery
- localStorage persistence for user preferences (theme, blocks, markdown options)
- Keyboard shortcuts (Alt+Shift+R, Alt+Shift+C, Alt+Shift+D, ?)
- Keyboard shortcuts help modal with per-key display
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
- Renamed footer "Shortcuts" to "Keyboard Shortcuts"

### Fixed
- Keyboard shortcuts now work on macOS (Option+Shift produces special characters; match on `event.code` instead of `event.key`)
- OG, Twitter Card, and canonical meta tags now appear in prerendered HTML (required for crawlers with `ssr: false`)
- `og:image` uses absolute URL instead of relative path (fixes social media previews)
- Iconify API added to CSP `connect-src` for icon loading
- Corrected Netlify publish directory
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

[Unreleased]: https://github.com/ICJIA/ipsumify-next-2026/compare/v2.3.2...HEAD
[2.3.2]: https://github.com/ICJIA/ipsumify-next-2026/compare/v2.3.1...v2.3.2
[2.3.1]: https://github.com/ICJIA/ipsumify-next-2026/compare/v2.3.0...v2.3.1
[2.3.0]: https://github.com/ICJIA/ipsumify-next-2026/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/ICJIA/ipsumify-next-2026/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/ICJIA/ipsumify-next-2026/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/ICJIA/ipsumify-next-2026/releases/tag/v2.0.0
