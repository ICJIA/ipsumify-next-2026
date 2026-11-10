# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.7.0] - 2026-11-10

### Added
- **A Technical details page**, linked from the top navigation, at `/technical-details`. It is laid out as an infographic: headline figures, large numbered sections, and four diagrams (how the three entry points share one function, the path from a seed to text, an API request through the cache, and the release process). A worked example on the page runs the real generator for any seed you type, so its numbers cannot drift from the code.
- The diagrams are [Mermaid](https://mermaid.js.org/), rendered ahead of time to SVG. Sources are in `diagrams/`; `yarn build:diagrams` regenerates `public/diagrams/`. The page ships no diagram library and still makes no third-party requests.

### Changed
- The site now has two prerendered pages. `scripts/write-csp.mjs` hashes the inline scripts of every prerendered page into the one policy; the server guard serves the new path; and the new page's static HTML gets its own title, description and canonical URL at build time, so a crawler that does not run JavaScript does not read it as a copy of the home page.
- The header wraps on narrow screens, where the navigation now sits under the wordmark.

Verified before release: lint, typecheck, 128 tests and both builds pass; the page was checked in a browser under the production CSP on desktop and at phone width (no console errors, no horizontal overflow, navigation both ways, canonical and title correct); Lighthouse scores 100 in all four categories and axe reports 0 WCAG A/AA violations on desktop and mobile.

The npm package is unchanged and was not republished; `ipsumify@2.6.0` remains the latest on npm.

## [2.6.1] - 2026-11-10

### Added
- **Changelog and GitHub links in the footer**, beside Keyboard Shortcuts. Both open in a new tab. The footer wraps on narrow screens.

The npm package is unchanged in this release and was not republished; `ipsumify@2.6.0` remains the latest on npm.

## [2.6.0] - 2026-11-10

The fixes from a red team / blue team exercise run on v2.5.0. The full account, finding by finding, is in the README.

### Security
- **The API's cache could be poisoned through percent-encoded parameter names.** `?th%65me=dog` was `theme=dog` to the API's query parser and an unknown name to the CDN, which keys its cache on the raw names; the dog-themed text was stored for the URL with no theme. It was reproduced on the live site: any clean API URL could be made to return a different valid response for up to an hour. The API now parses the raw query string itself (`utils/apiQuery.ts`) and decodes nothing: names must be exactly the seven documented ones, each given once, with plain values written one way. Everything else is a 400.
- **Errors are no longer cached** (`Cache-Control: no-store`), so a bad request cannot store anything against a URL.
- **v2.5.0's cache-key fix was bypassable** with junk values (`md=anything`, `lower=zz`, `blocks=05`). All are now 400s.
- **Everything else the function serves now has security headers**, and unknown URLs get a plain 404 in place of the app's HTML shell with status 200 (`server/middleware/guard.ts`).
- **CI hardened**: read-only token, actions pinned to commit hashes, no persisted checkout credentials, the Codecov secret scoped to its step.

### Changed
- **API requests are strict.** Unknown parameters, repeated parameters (including `md=a&md=b`, which v2.5.0 joined), percent-encoded or empty values, leading zeros, unknown `md` names, and `lower`/`nowrap` values other than `1` all return 400.
- **API errors are always JSON**, whatever the `Accept` header, with the body `{ error, statusCode, message }`. The `url` and `statusMessage` fields are gone.
- `md=headings` is accepted by the API and share links as another name for `headers`, as the command line already did.
- CI installs the Node version in `.nvmrc`.

### Fixed
- **A share link with all-default options showed a recipient with saved preferences different text.** Whatever a share link omits is now the default.
- Share links read `blocks=7abc` as 7.
- `nowrap` with headings and HTML output put the whole text inside one `<h1>` (API, command line, Copy as HTML).
- Holding Alt+Shift+D saved the file repeatedly; shortcuts fired with Ctrl or Cmd held; a `keydown` with no key threw.
- **npm package:** `--md __proto__` and similar were accepted; a conflicting block count was silently dropped; `paragraphs()` rejected a `format` it documents as ignored; non-object options and non-boolean switches are now a `TypeError`; the exported lists are frozen; `require('ipsumify')` works on Node versions that can `require` ES modules.
- `scripts/write-csp.mjs` wrote a second policy when run twice on one build.
- `publish.sh` reads the changelog from the release's tag and checks the tag is on origin; `engines` matches Nuxt's supported Node range.
- Sixteen untrue statements in the README, SECURITY.md, and code comments.

Verified before release: `yarn lint`, `yarn typecheck`, `yarn test:coverage` (128 tests, up from 95), `yarn build`, and `yarn build:cli` exit 0; the API and 404 behaviour were confirmed with requests against a local build; the share-link and keyboard fixes were confirmed in a browser against the production build.

## [2.5.0] - 2026-11-10

The fixes from the security and logic audit of 10 November 2026, and the generator as an npm package. The audit, with every finding and its fix or mitigation, is in the README.

### Added
- **`ipsumify` on npm: a command line and a library.** `npx ipsumify` prints five paragraphs of lorem ipsum; options choose the block count, theme, seed, markdown elements (`--headings`, `--code`, `--quotes`, `--lists`, `--links`, `--all`), `--lower`, `--no-linebreaks`, and `--format markdown|text|html|json`. `import ipsumify from 'ipsumify'` does the same in Node. It is the website's engine, bundled with no dependencies: the same seed and options give the same text on the site, in the API, and in the terminal. Source in `packages/ipsumify/`, built by `yarn build:cli`.
- **`publish.sh`**, which checks a release and publishes the package: clean tree on `main`, tag and changelog section present, CI green for the tag's commit, a build and test of that commit in a temporary worktree, the package's exact contents, and an install-and-run of the packed tarball, before asking for the version to be typed and for npm's approval. `--dry-run` does everything but publish.
- A build step, `scripts/write-csp.mjs`, that writes the page's Content-Security-Policy from the built HTML and fails the build if the page references a file the build did not write.

### Security
- **The page's CSP no longer allows arbitrary inline scripts.** `'unsafe-inline'` is replaced by SHA-256 hashes of the page's own inline scripts, computed on every build. Verified in a browser against the production build: the page runs with no violations, and a script injected into it is refused. `connect-src` and `img-src` are narrowed to the site itself and `object-src 'none'` is added. The deprecated `X-XSS-Protection` header is removed.
- **Icons are bundled, not fetched.** Every first visit used to request icon data from `api.iconify.design`. The page now makes no third-party requests at all.
- **The API sets its own security headers** (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, a `default-src 'none'` CSP); `netlify.toml`'s never reached it.
- **The API's cache can no longer be bypassed with a junk parameter.** `Netlify-Vary` keys the CDN cache on the seven documented parameters. There is still no rate limit.
- **Saved preferences are validated on load.** A corrupt or edited `localStorage` value could throw, or ask for a billion blocks and freeze the page on every visit.

### Fixed
- **`?md=headers&md=code` returned HTTP 500.** Repeated parameters are now joined with commas.
- **`format=json` with `md=headers` returned an `output` array that did not match its own `markdown` field** (491 of 500 seeds tested). Both now come from one generation pass.
- **Negative seeds produced broken text** (`seed=-5000` returned 10 characters). The generator now normalizes any seed, and the API rejects seeds outside 0–2,147,483,647, along with `seed=`, `seed=1e3`, and `blocks=1.0`, which it used to accept. Text for every valid seed is unchanged: 167,310 old-versus-new comparisons across all themes and options found no difference.
- **`format=text` with `nowrap=1` left `>`, `•`, and `#` markers in the text.**
- **Opening a share link replaced the visitor's saved preferences.** Nothing is saved until they change a setting; resetting also clears the link's parameters from the address bar.
- **Alt+Shift+C announced "Copied to clipboard" even when the copy failed.**
- **Regenerate could leave the text unchanged.** It now draws from all 233,280 seeds and redraws if the text would be the same.
- **On phones the wordmark overlapped the GitHub link.**
- **v2.4.0 never deployed.** Its dependency update moved Nuxt to a version that needs Node 22.22.3 or later, while `.nvmrc` pinned 22.14.0, and Netlify's build failed; the site stayed on v2.3.2. `.nvmrc`, `netlify.toml`, and a new `engines` field now agree on 22.23.4. CI did not catch it because it installs the newest Node 22.

Verified locally before release: `yarn lint`, `yarn typecheck`, `yarn test:coverage` (95 tests, up from 58), `yarn build`, and `yarn build:cli` all exit 0; the API fixes were confirmed with requests against a local build; and the page was checked in a browser served with its real CSP header.

## [2.4.0] - 2026-11-10

### Added
- **A Regenerate button in the bar above the output**, beside Copy. It does what the Regenerate button in the Options panel does, without scrolling back to the panel. Below the `sm` breakpoint it shows the icon alone so the bar still fits a phone.

### Changed
- **Every dependency brought up to date within its declared range**, superseding the 26 Dependabot pull requests that had been open since February. Among them: Nuxt 4.3.1 → 4.6.4, Nuxt UI 4.4.0 → 4.12.0, Vite 7 → 8, h3 1.15.5 → 1.15.11, devalue 5.6.2 → 6.0.3. `happy-dom` moves from 20 to 21 and `@nuxt/eslint` from 1.13.0 to 1.17.0. `yarn audit` went from 351 advisories (8 critical, 179 high) to 12 (none critical or high); the 12 that remain are in build and lint tooling and in `nuxt-og-image`, which this site disables.
- CI actions: `actions/checkout` and `actions/setup-node` v4 → v6, `actions/upload-artifact` v4 → v7, `codecov/codecov-action` v4 → v6.
- README screenshots retaken; they now show the current interface, in two views.

### Fixed
- **README and SECURITY.md statements that were not true.** SECURITY.md described a static site with no server code and "all processing in the browser", though `/api/generate` runs as a Netlify Function, and labelled the advisories URL an email address. The README now documents the API's 400 responses, Copy as HTML, saved preferences, the `?` shortcut, the missing `yarn` scripts and config keys, the runtime request to `api.iconify.design`, and the known limitations of the API listed there.

Verified locally before release: `yarn lint`, `yarn typecheck`, `yarn test:coverage` (58 tests) and `yarn build` all exit 0. On the production build, Lighthouse (desktop) scores 100 in all four categories and axe-core reports 0 WCAG A/AA violations on desktop and mobile; the new button was clicked in a browser and changes the text, and the Copy menu still opens and closes.

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

[Unreleased]: https://github.com/ICJIA/ipsumify-next-2026/compare/v2.7.0...HEAD
[2.7.0]: https://github.com/ICJIA/ipsumify-next-2026/compare/v2.6.1...v2.7.0
[2.6.1]: https://github.com/ICJIA/ipsumify-next-2026/compare/v2.6.0...v2.6.1
[2.6.0]: https://github.com/ICJIA/ipsumify-next-2026/compare/v2.5.0...v2.6.0
[2.5.0]: https://github.com/ICJIA/ipsumify-next-2026/compare/v2.4.0...v2.5.0
[2.4.0]: https://github.com/ICJIA/ipsumify-next-2026/compare/v2.3.2...v2.4.0
[2.3.2]: https://github.com/ICJIA/ipsumify-next-2026/compare/v2.3.1...v2.3.2
[2.3.1]: https://github.com/ICJIA/ipsumify-next-2026/compare/v2.3.0...v2.3.1
[2.3.0]: https://github.com/ICJIA/ipsumify-next-2026/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/ICJIA/ipsumify-next-2026/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/ICJIA/ipsumify-next-2026/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/ICJIA/ipsumify-next-2026/releases/tag/v2.0.0
