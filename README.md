# Ipsumify

[![CI](https://github.com/ICJIA/ipsumify-next-2026/actions/workflows/ci.yml/badge.svg)](https://github.com/ICJIA/ipsumify-next-2026/actions/workflows/ci.yml)
[![Nuxt 4](https://img.shields.io/badge/Nuxt-4.x-00DC82?style=flat&logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![Nuxt UI](https://img.shields.io/badge/Nuxt_UI-4.x-00DC82?style=flat&logo=nuxt.js&logoColor=white)](https://ui.nuxt.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Netlify Status](https://api.netlify.com/api/v1/badges/e40ece77-035e-472f-9f18-87a6e7264832/deploy-status)](https://app.netlify.com/projects/ipsumify/deploys)

## Easily Create Placeholder Text

> The friendliest lorem ipsum generator around. Perfect for designers, writers, and anyone who needs placeholder text.

![Ipsumify with its default settings: classic lorem ipsum, five blocks](documentation/screenshot.png)

With a theme and the markdown elements switched on:

![Ipsumify showing the Dog-em Ipsum theme with headers, code snippets, blockquotes, lists, and links enabled](documentation/screenshot-markdown.png)

On the command line, with `npx ipsumify` (the commands' actual output, rendered as an image):

![Terminal output of npx ipsumify with a theme, headings, and a list](documentation/screenshot-cli.png)

On a phone:

<img src="documentation/screenshot-mobile.png" alt="Ipsumify on a phone-sized screen" width="320">

## Site

https://ipsumify.com

## Table of Contents

- [Features](#features)
- [Themes](#themes)
- [Command Line and npm Package](#command-line-and-npm-package)
- [API](#api)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Deployment](#deployment)
  - [Netlify](#netlify)
- [Architecture](#architecture)
  - [SEO with ssr: false](#seo-with-ssr-false)
- [Accessibility & Quality Scores](#accessibility--quality-scores)
- [Security and Logic Audit](#security-and-logic-audit)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Markdown-Ready Output** - Generate lorem ipsum with headers, code blocks, blockquotes, lists, and links
- **Multiple Themes** - Choose from classic Lorem Ipsum or fun themed alternatives (dog, cat, baked, BBQ)
- **Customizable Blocks** - Control the number of text blocks (1-20)
- **Formatting Options** - Toggle capitalization and no-wrap mode for cleaner copy-paste
- **One-Click Actions** - Regenerate, copy as Markdown or as rendered HTML, or download as an `.md` file, all from the bar above the output
- **Shareable URLs** - Share your exact settings and seed via URL so others see the same output
- **Remembered Preferences** - Theme, block count, and options are saved in your browser's `localStorage`; click the Ipsumify logo to reset everything to defaults
- **Command Line and npm Package** - `npx ipsumify` prints lorem ipsum in your terminal; `import ipsumify from 'ipsumify'` does the same in Node
- **Public API** - REST endpoint with multiple output formats (markdown, JSON, text, HTML) — no API key required
- **Deterministic Output** - Seeded RNG produces identical results for the same parameters, enabling CDN caching
- **Keyboard Shortcuts** - Alt+Shift+R / C / D to regenerate, copy, and download (Option+Shift on Mac); press `?` to list them
- **Dark Theme** - Beautiful dark UI optimized for developers and designers
- **Accessible** - Lighthouse accessibility score of 100 and zero axe-core WCAG A/AA violations
- **SEO Optimized** - Built-in sitemap, robots.txt, and meta tags

## Themes

Ipsumify includes the classic Lorem Ipsum as the default, plus several fun themed alternatives. All themes use Latin-style placeholder text to maintain the traditional Lorem Ipsum aesthetic.

| Theme                     | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| **Lorem Ipsum** (default) | Classic Latin placeholder text                       |
| **Dog-em Ipsum**          | Latinized dog breed names and canine terminology     |
| **Cat-em Ipsum**          | Latinized cat breed names and feline terminology     |
| **Baked-em Ipsum**        | French and Latin pastry and baking terms             |
| **BBQ-em Ipsum**          | Latinized barbecue cuts, techniques, and terminology |

Switch themes using the dropdown in the Options panel. All your other settings (blocks, markdown elements, formatting) are preserved when switching themes.

## Command Line and npm Package

The generator is published to npm as [`ipsumify`](https://www.npmjs.com/package/ipsumify).

```bash
npx ipsumify
```

With no arguments it prints five paragraphs of classic lorem ipsum. Nothing to install, no dependencies, Node 18.3 or later.

It uses the same engine as [ipsumify.com](https://ipsumify.com) and its API: the same theme, block count, seed, and options give the same text in all three.

### Options

| Option | Short | What it does |
| ------ | ----- | ------------ |
| `--blocks <n>` | `-b` | Number of paragraphs, 1–20. Default 5. Also accepted as the first argument (`npx ipsumify 3`) or as `--paragraphs` / `-p` |
| `--theme <id>` | `-t` | `lorem` (default), `dog`, `cat`, `baked`, `bbq` |
| `--seed <n>` | `-s` | Whole number from 0 to 2,147,483,647. The same seed always gives the same text. Random when omitted |
| `--headings` | | Add markdown headings (also `--headers`) |
| `--code` | | Add code snippets |
| `--quotes` | | Add blockquotes |
| `--lists` | | Add bullet lists |
| `--links` | | Add links |
| `--all` | `-a` | All five markdown elements |
| `--md <list>` | | The same, comma-separated, as the API takes them: `--md headings,lists` |
| `--lower` | | Lowercase everything |
| `--no-linebreaks` | | Everything on one line (also `--nowrap`) |
| `--format <name>` | `-f` | `markdown` (default), `text`, `html`, `json` |
| `--themes` | | List the themes |
| `--help` | `-h` | Show help |
| `--version` | `-v` | Show the version |

Code snippets appear before every third block, blockquotes before every second, lists before the third, sixth, and so on, and links before every fourth, so a short run may not include every element you asked for.

Invalid input prints a message to stderr and exits with code 1.

### Examples

One paragraph. `--seed` makes it repeatable; leave it off for different text each run:

```console
$ npx ipsumify 1 --seed 42
Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
```

A theme, with headings and a list:

```console
$ npx ipsumify 3 --theme bbq --headings --lists --seed 7
# Building the Perfect Fire

Brisketum planum puntum totum, pinguem capsum updownum debatum. Fumus annulus roseum halum, probatum technicum igneum. Sectum contra granum semper, humidus macer finibus ustum. Pullum femur quartum totum, pellis crispum carnem sucum. Alabama salsamentum album, acetum Carolina moppum stylum. Tractum fumatum grillum optiones, gallinaceum rectum bonum.

Fumus surgit caminus ascendit, linea formatur mane fidelis. Venditum signum timendum, mane avis obtinet carneum. Dignum omnis expectatio minutum, pitmasterus ars respectum. Fricatum siccum pasta humidum, pernoctem frigidarium marinatum requiem. Sal piper simplex Texanum, complexum Memphis mixtum secretum. Applicare generosum aequum tegmen, cortex formatur pulchre.

- Smoky goodness
- Fall off the bone
- Worth the wait

Lateribus fabae coleslavium paniscornum, caseum macaroni salatum tuberosum. Pickledus cepae jalapeñus, panisalbus butyrum sectum. Completum plateum aequilibratum prandium, carneum stella lateribus sustentum.
```

One line, lowercase — handy for seed data:

```console
$ npx ipsumify 1 --theme cat --no-linebreaks --lower --seed 3
himalayan persicum pointus fluffium, exotic shorthair teddybearum calmicus. ragamuffin largeum sweeticus docilum, selkirk rex curlycoatum sheepii patientum. laperm curlicus wavium uniqueum.
```

Rendered HTML:

```console
$ npx ipsumify 1 --all --format html --seed 42
<h1>Key Concepts</h1>
<pre><code class="language-javascript">const example = &#39;code&#39;;
</code></pre>
<p><a href="https://example.com">Learn more</a> Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
```

Plain text, with the markdown syntax stripped:

```console
$ npx ipsumify 1 --all --format text --seed 42
Key Concepts

Learn more Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
```

JSON, in the same shape the API returns. `output` holds each paragraph's body text; `seed` reports the seed that was used, so a random run can be reproduced:

```console
$ npx ipsumify 2 --format json --seed 42
{
  "theme": "lorem",
  "blocks": 2,
  "seed": 42,
  "format": "json",
  "options": {
    "headers": false,
    "codeSnippets": false,
    "blockquotes": false,
    "lists": false,
    "links": false,
    "capitalize": true,
    "noWrap": false
  },
  "output": [
    "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt."
  ],
  "markdown": "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt."
}
```

Into a file or the clipboard:

```bash
npx ipsumify 10 --all > placeholder.md
npx ipsumify | pbcopy
```

### Use from JavaScript

```bash
npm install ipsumify
```

```js
import ipsumify, { paragraphs, themes } from 'ipsumify'

ipsumify()                                          // five paragraphs, random
ipsumify({ blocks: 2, theme: 'dog', seed: 42 })     // repeatable
ipsumify({ headers: true, lists: true })            // markdown elements
ipsumify({ format: 'html' })                        // or 'text'

paragraphs({ blocks: 3 })                           // ['…', '…', '…']
themes                                              // [{ id: 'lorem', label: 'Lorem Ipsum' }, …]
```

| Option | Type | Default | |
| ------ | ---- | ------- | - |
| `theme` | string | `'lorem'` | `lorem`, `dog`, `cat`, `baked`, `bbq` |
| `blocks` | number | `5` | 1–20 |
| `seed` | number | random | 0–2,147,483,647 |
| `headers`, `code`, `quotes`, `lists`, `links` | boolean | `false` | Markdown elements |
| `lowercase` | boolean | `false` | Lowercase everything |
| `noWrap` | boolean | `false` | Everything on one line |
| `format` | string | `'markdown'` | `markdown`, `text`, `html` |

An unknown theme or format, or a `blocks` or `seed` out of range, throws a `RangeError`. The package is ESM only and ships its own TypeScript types.

### Building and publishing the package

The package's source is in `packages/ipsumify/`. `yarn build:cli` bundles it, with the generator and themes from this repository, into `packages/ipsumify/dist/`. It has no dependencies and shares the app's version number.

Publishing is done with `publish.sh`, from a terminal, after a release (version bumped in `package.json`, `ipsumify.config.ts`, and `packages/ipsumify/package.json`; `CHANGELOG.md` section added; `main` and the `vX.Y.Z` tag pushed; CI green):

```bash
./publish.sh --dry-run   # every check and a dry-run publish; changes nothing
./publish.sh             # the same checks, then publishes after you type the version and approve in npm
```

The script builds and tests the tag's own commit in a temporary worktree, checks the package's contents, installs the packed tarball in a scratch project and runs it, and publishes that same tarball. It never commits, tags, or pushes. A release that changes only the website does not need publishing.

## API

Ipsumify includes a public REST API deployed as a Netlify Function. Call it with no parameters for sensible defaults, or customize the output with query parameters.

### Quick Start

```bash
# Default: 5 blocks of classic lorem ipsum as markdown
curl https://ipsumify.com/api/generate
```

### Examples

**Get 10 blocks of classic lorem ipsum:**

```bash
curl "https://ipsumify.com/api/generate?blocks=10"
```

**Get JSON array of individual blocks (useful for populating UI components):**

```bash
curl "https://ipsumify.com/api/generate?format=json&blocks=4"
```

**Get plain text with no markdown syntax:**

```bash
curl "https://ipsumify.com/api/generate?format=text&blocks=2"
```

**Get rendered HTML:**

```bash
curl "https://ipsumify.com/api/generate?format=html&blocks=3"
```

**Include markdown elements (headers, code blocks, lists):**

```bash
curl "https://ipsumify.com/api/generate?md=headers,code,lists&blocks=5"
```

**Lowercase, single-line output (good for seed data):**

```bash
curl "https://ipsumify.com/api/generate?lower=1&nowrap=1&blocks=2"
```

**Deterministic output with a specific seed:**

```bash
curl "https://ipsumify.com/api/generate?seed=123&blocks=3"
```

**Get 3 blocks of dog-themed text:**

```bash
curl "https://ipsumify.com/api/generate?theme=dog&blocks=3"
```

### Parameters

| Parameter | Type   | Default    | Description                                                          |
| --------- | ------ | ---------- | -------------------------------------------------------------------- |
| `theme`   | string | `lorem`    | Theme ID: `lorem`, `dog`, `cat`, `baked`, `bbq`                     |
| `blocks`  | number | `5`        | Number of text blocks (1-20)                                        |
| `seed`    | number | `42`       | RNG seed for deterministic output: a whole number from 0 to 2,147,483,647 |
| `format`  | string | `markdown` | Response format: `markdown`, `json`, `text`, `html`                 |
| `md`      | string | _(none)_   | Comma-separated markdown elements: `headers,code,quotes,lists,links` |
| `lower`   | string | _(off)_    | Set to `1` to disable capitalization                                |
| `nowrap`  | string | _(off)_    | Set to `1` for single-line output                                   |

### Response Format

All responses return JSON with this structure:

```json
{
  "theme": "lorem",
  "blocks": 5,
  "seed": 42,
  "format": "markdown",
  "output": "..."
}
```

The `json` format additionally includes `options` and returns `output` as an array of strings (one per block of body text, without markdown elements) plus a `markdown` field with the full text.

Invalid `theme`, `blocks`, `seed`, or `format` values return HTTP 400 with a JSON body whose `message` says what was wrong:

```json
{
  "error": true,
  "url": "https://ipsumify.com/api/generate?theme=zzz",
  "statusCode": 400,
  "statusMessage": "Invalid theme \"zzz\". Valid themes: lorem, dog, cat, baked, bbq",
  "message": "Invalid theme \"zzz\". Valid themes: lorem, dog, cat, baked, bbq"
}
```

### Known Limitations

- **Seeds repeat every 233,280 values:** `seed=42` and `seed=233322` return the same text, and some different seeds give the same text for a short output.
- **A blockquote repeats the block it precedes:** it quotes the first 100 characters of the block that follows it.
- **`format=text` drops code snippets** rather than keeping their contents.
- **No rate limit.** See [Caching and Fair Use](#caching-and-fair-use).

### Caching and Fair Use

The API is public with no authentication required. Responses, including 400 errors, are cached at the CDN edge (`Cache-Control: public, max-age=3600`) since identical parameters always produce identical output. Repeated requests with the same parameters are served from cache without invoking the serverless function.

Only the seven documented parameters are part of the cache key (`Netlify-Vary`), so adding an unrelated parameter does not bypass the cache. There is no rate limit; each uncached request does a small, bounded amount of work (at most 20 blocks).

The API is intended for use with `curl` and server-side code. Cross-origin browser requests (e.g., `fetch` from another domain) are blocked — no CORS headers are sent.

### Share URL vs API

Ipsumify has two URL formats that serve different purposes:

| | Share URL | API |
|---|---|---|
| **URL** | `https://ipsumify.com/?theme=dog&blocks=3` | `https://ipsumify.com/api/generate?theme=dog&blocks=3` |
| **Returns** | HTML page (the web app with settings pre-filled) | JSON with generated text |
| **Use case** | Share a link so someone sees the same text in their browser | Programmatically retrieve generated text |
| **curl/fetch** | Returns the full HTML page — not useful for text extraction | Returns structured JSON — designed for this |

The share URL and API accept the same query parameters (`theme`, `blocks`, `md`, `lower`, `nowrap`, `seed`). The API additionally accepts `format`. Share Settings always writes the current `seed` into the link, so a link made after Regenerate reproduces the regenerated text. Both accept a `seed` from 0 to 2,147,483,647; a share link silently ignores an invalid value, where the API returns a 400.

Opening a share link shows its settings without touching your saved preferences. If you then change a setting, what is on screen becomes your saved preferences. Clicking the logo resets everything and removes the link's parameters from the address bar.

## Tech Stack

| Technology                                    | Version | Description                                |
| --------------------------------------------- | ------- | ------------------------------------------ |
| [Nuxt](https://nuxt.com/)                     | 4.x     | Vue.js meta-framework                      |
| [Nuxt UI](https://ui.nuxt.com/)               | 4.x     | Beautiful UI component library             |
| [Tailwind CSS](https://tailwindcss.com/)      | 4.x     | Utility-first CSS framework                |
| [TypeScript](https://www.typescriptlang.org/) | 5.x     | Type-safe JavaScript                       |
| [@nuxtjs/seo](https://nuxtseo.com/)           | 3.x     | SEO module with sitemap and robots.txt     |
| [@nuxt/eslint](https://eslint.nuxt.com/)      | 1.x     | ESLint integration with Nuxt flat config   |
| [marked](https://marked.js.org/)              | 17.x    | Markdown-to-HTML for Copy as HTML and the API's `html` format |
| [Vitest](https://vitest.dev/)                 | 4.x     | Unit tests (with happy-dom)                |
| [Lucide Icons](https://lucide.dev/)           | -       | Beautiful open-source icons                |

## Getting Started

### Prerequisites

- Node.js 22.22.3 or higher (see `.nvmrc`; Nuxt 4.6 requires it)
- Yarn 1.22.x (or npm/pnpm)

### Installation

```bash
# Clone the repository
git clone https://github.com/ICJIA/ipsumify-next-2026.git
cd ipsumify-next-2026

# Install dependencies
yarn install

# Start development server
yarn dev
```

The app will be available at `http://localhost:3000`.

### Development Workflow

Before committing, run lint and typecheck:

```bash
yarn lint
yarn typecheck
```

Use `yarn lint:fix` to auto-fix ESLint issues where possible.

### Available Scripts

| Command            | Description                                     |
| ------------------ | ----------------------------------------------- |
| `yarn dev`         | Start development server with hot reload        |
| `yarn build`       | Build for production (hybrid: static pages + serverless API), then write the page's CSP into `dist/_headers` |
| `yarn build:cli`   | Build the npm package into `packages/ipsumify/dist/`         |
| `yarn generate`    | Generate fully static site (no serverless functions)         |
| `yarn preview`     | Preview production build locally                             |
| `yarn test`        | Run lint, typecheck, and unit tests                          |
| `yarn test:all`    | Run lint, typecheck, unit tests, a production build, and the npm package build |
| `yarn test:unit`   | Run Vitest unit tests                                        |
| `yarn test:unit:watch` | Run Vitest in watch mode                                 |
| `yarn test:coverage` | Run unit tests with a coverage report (what CI runs)       |
| `yarn test:ui`     | Open the Vitest UI                                           |
| `yarn lint`        | Run ESLint on the codebase                                   |
| `yarn lint:fix`    | Run ESLint with auto-fix                                     |
| `yarn typecheck`   | Run TypeScript type checking                                 |
| `yarn postinstall` | Prepare Nuxt (runs automatically after install)              |

## Project Structure

```
ipsumify/
├── app/                    # Nuxt 4 app directory
│   ├── app.vue             # Root component
│   ├── assets/
│   │   └── css/
│   │       └── main.css    # Global styles and Tailwind imports
│   └── pages/
│       └── index.vue       # Main page component
├── data/
│   └── themes.ts           # Theme content (paragraphs, headings, list items)
├── composables/
│   ├── useKeyboardShortcuts.ts # Keyboard shortcut handler
│   ├── useLocalStorage.ts      # Type-safe localStorage wrapper
│   ├── usePreferences.ts       # User preference persistence
│   └── useShareUrl.ts          # Shareable URL generation
├── packages/
│   └── ipsumify/               # The npm package: command line and library
├── scripts/
│   └── write-csp.mjs           # Post-build: hashes inline scripts into the CSP
├── server/
│   └── api/
│       └── generate.get.ts     # GET /api/generate endpoint
├── utils/
│   ├── clipboard.ts        # Clipboard utility with fallback
│   ├── generate.ts         # Shared text generation (web UI + API)
│   └── random.ts           # Seeded PRNG utilities
├── tests/
│   └── unit/               # Vitest unit tests (generate, random, cli, useLocalStorage, usePreferences, useShareUrl)
├── documentation/          # Screenshots for README
├── public/
│   ├── icon.svg            # Favicon
│   ├── llms.txt            # Site and API summary for LLMs (llmstxt.org)
│   └── og-image.png        # Open Graph image for social sharing
├── .github/                # CI workflow, Dependabot config, issue and PR templates
├── app.config.ts           # Nuxt UI colors (primary, neutral)
├── eslint.config.mjs      # ESLint flat config (auto-generated by @nuxt/eslint)
├── ipsumify.config.ts     # Single source of truth for all app config
├── netlify.toml           # Netlify build and security headers
├── nuxt.config.ts         # Nuxt configuration
├── package.json            # Dependencies and scripts
├── publish.sh              # Checks a release and publishes the npm package
├── tsconfig.json           # TypeScript configuration
└── vitest.config.ts        # Vitest configuration
```

## Configuration

**ipsumify.config.ts** is the single source of truth for app configuration. The `nuxt.config.ts` imports from it for SEO, meta tags, and head. Edit `ipsumify.config.ts` for:

| Key                                            | Description                                  |
| ---------------------------------------------- | -------------------------------------------- |
| `name`, `title`, `description`, `shortDescription` | Site identity and SEO                    |
| `url`, `github`, `author`                      | URLs and attribution                         |
| `datePublished`, `dateModified`                | ISO dates for the JSON-LD structured data; update `dateModified` by hand on release |
| `locale`, `defaultLocale`                      | Open Graph locale and HTML `lang`            |
| `ogImageUrl`, `ogImageWidth`, `ogImageHeight`, `ogImageAlt`, `faviconPath` | Social image and favicon |
| `primaryColor`, `backgroundColor`, `tileColor` | Theme colors (hex)                           |
| `defaultThemeId`                               | Default theme (lorem, dog, cat, baked, bbq)  |
| `defaultBlocks`                                | Default number of text blocks (1-20)         |
| `defaultSeed`                                  | Seed used on first load, after a reset, and by the API when none is given |
| `version`                                      | App version (keep in sync with package.json) |

### Theme Colors (Nuxt UI)

Edit `app.config.ts` to customize Nuxt UI component colors:

```typescript
export default defineAppConfig({
  ui: {
    colors: {
      primary: "teal", // Primary accent color
      neutral: "zinc", // Neutral/gray color
    },
  },
});
```

### Adding New Themes

Add a new theme in `data/themes.ts`:

1. Add an object to the `themes` array with `id`, `label`, `icon`, `paragraphs`, `headings`, and `listItems`
2. Use a Lucide icon class (e.g. `i-lucide-scroll-text`) for the `icon` field. Icons are compiled into the bundle at build time and never fetched; theme icons are picked up from `data/themes.ts` automatically. An icon from another collection needs its `@iconify-json/*` package installed
3. Optionally set `defaultThemeId` in `ipsumify.config.ts` to make it the default

## Deployment

### Netlify

The project deploys as a hybrid site on Netlify: pages are prerendered as static files, and the API runs as a Netlify Function.

- **Build command:** `yarn build`
- **Publish directory:** `dist`
- **Node version:** 22.23.4 (set in `netlify.toml`)
- **Security headers:** `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and HSTS come from `netlify.toml`. The Content-Security-Policy is generated at build time by `scripts/write-csp.mjs`, which hashes the page's inline scripts and appends the policy to `dist/_headers`. Netlify applies all of these to the static pages; the API sets its own headers in `server/api/generate.get.ts`
- **API:** `server/api/` routes are automatically deployed as Netlify Functions

1. Connect your repository to Netlify
2. Netlify will automatically detect the build settings from `netlify.toml`
3. Deploy!

## Architecture

- **Hybrid deployment:** Pages are prerendered as static files; the API runs as a serverless function (Netlify Functions via Nitro)
- **Shared generation logic:** Both the web UI and API use `utils/generate.ts` — same code, same output
- **Deterministic output:** Uses a seeded LCPRNG so identical parameters always produce identical text (enables aggressive CDN caching)
- **Config hierarchy:** `ipsumify.config.ts` → `nuxt.config.ts`; theme content lives in `data/themes.ts`
- **Client-side generation:** The web UI generates text in the browser and never calls the API
- **No third-party requests:** Icons are compiled into the client bundle; the page loads nothing from any other origin, and its CSP allows none

### SEO with `ssr: false`

SSR is disabled because reka-ui (used by Nuxt UI v4) crashed during server-side rendering when the app was built. This means `useSeoMeta()` in page components only runs client-side — without further work, crawlers and SEO audit tools would see a raw HTML shell without Open Graph, Twitter Card, or canonical tags.

**Solution:** All SEO meta tags are defined explicitly in `app.head` inside `nuxt.config.ts` rather than relying on `useSeoMeta()`. Tags defined in `app.head` are baked into the prerendered HTML at build time, so they're visible to crawlers without JavaScript execution.

If you modify SEO tags, update them in **both** places:
- `nuxt.config.ts` → `app.head.meta` (for crawlers)
- `app/pages/index.vue` → `useSeoMeta()` (for client-side SPA navigation)

`app/app.vue` adds two client-side corrections for `@nuxtjs/seo` under `ssr: false`: an absolute `rel=canonical` (the module would otherwise emit a relative one), and a plain `%s` title template (the module's default leaves a literal `%siteName` in the tab title).

**Note:** The `@nuxtjs/seo` module's `nuxt-seo-utils` auto-detects files like `og-image.png` in the `public/` directory and injects `og:image` tags with relative paths. To prevent this, ensure `app.head` already includes an `og:image` tag with an absolute URL — the module skips auto-injection when it detects an existing tag.

## Accessibility & Quality Scores

Measured on 10 November 2026 against a local production build of v2.5.0.

### Lighthouse (desktop)

| Category       | Score |
| -------------- | ----- |
| Performance    | 100   |
| Accessibility  | 100   |
| Best Practices | 100   |
| SEO            | 100   |

### axe-core

| Viewport | WCAG A + AA violations |
| -------- | ---------------------- |
| Desktop  | 0                      |
| Mobile   | 0                      |

## Security and Logic Audit

**Audit date: 10 November 2026.** The whole codebase was read and the running app and API were probed with edge-case input. Every finding below was reproduced before it was fixed, and each fix was verified afterwards: by unit tests (93, up from 58), by requests against a local build of the API, and in a browser against the production build served with its real headers. All fixes shipped in v2.5.0.

Nothing found was high severity: the app has no accounts, stores no user data on the server, and renders no untrusted HTML.

### Security

| # | Finding | Severity | Status | Fix or mitigation |
| - | ------- | -------- | ------ | ----------------- |
| S1 | **351 known advisories in dependencies** (8 critical, 179 high), with 26 Dependabot pull requests unmerged since February | Medium | Fixed (v2.4.0) | Every dependency and CI action updated. `yarn audit` now reports 12, none critical or high; all 12 are in build and lint tooling or in `nuxt-og-image`, which this site disables |
| S2 | **Repeating a query parameter crashed the API.** `?md=headers&md=code` returned HTTP 500 | Low | Fixed | Repeated values are joined with commas; `md` accepts them and every other parameter rejects them with a 400 |
| S3 | **The API had almost no security headers.** `netlify.toml` headers reach only static pages | Low | Fixed | The API now sets `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and a `default-src 'none'` CSP itself |
| S4 | **The CDN cache was trivially bypassed, and there is no rate limit.** Any extra parameter (`?x=1`) or any of 2⁵³ seeds forced a fresh function run | Low | Mitigated | `Netlify-Vary` limits the cache key to the seven real parameters, and `seed` is limited to 0–2,147,483,647. Distinct valid requests still each run the function once; the work per request is small and bounded. A true rate limit would need Netlify's paid rate-limiting rules and is not configured |
| S5 | **Icons were fetched from `api.iconify.design` on every first visit**, disclosing visitor IPs to a third party and breaking icons if it was down | Low | Fixed | Icons are compiled into the bundle, the fallback fetch is switched off, and the CSP no longer allows that origin |
| S6 | **The CSP allowed any inline script** (`script-src 'unsafe-inline'`) | Low | Fixed | Inline scripts are allowed by SHA-256 hash, computed from each build's HTML. A script injected into the page is refused; confirmed in a browser. `img-src` no longer allows arbitrary `https:` hosts, and `object-src 'none'` was added |
| S7 | **`X-XSS-Protection: 1; mode=block`** is deprecated and can introduce problems in old browsers | Info | Fixed | Header removed |
| S8 | **Saved preferences were trusted as read.** A corrupt or hand-edited `localStorage` value could throw on load, or request a billion blocks and freeze the page on every visit | Low | Fixed | Every field is validated and falls back to its default |
| S9 | **`style-src` still allows inline styles** | Info | Accepted | Vue and the UI library set element styles at runtime. With no untrusted HTML rendered, the risk is negligible |

### Faulty logic

| # | Finding | Status | Fix |
| - | ------- | ------ | --- |
| L1 | **`format=json` disagreed with itself.** With `md=headers`, the `output` array held different blocks from the `markdown` field (491 of 500 seeds tested), because headings draw from the random sequence that sizes the blocks and the array was built by a separate loop | Fixed | One generation pass now produces both. Every `output` entry appears verbatim in `markdown` |
| L2 | **Negative seeds produced broken text.** `seed=-5000` returned 10 characters; others returned unshuffled or truncated text | Fixed | The generator normalizes any seed into its range, and the API rejects seeds outside 0–2,147,483,647 with a 400, as share links already did. Output for every valid seed is unchanged (167,310 old-versus-new comparisons, no differences) |
| L3 | **The API accepted `seed=` (as 0), `seed=1e3`, and `blocks=1.0`** | Fixed | `blocks` and `seed` must be plain whole numbers |
| L4 | **`format=text` with `nowrap=1` left markdown in the text**: `>` markers, `•` bullets, and every heading's `#` after the first | Fixed | Markers are stripped wherever they appear, not only at the start of a line |
| L5 | **Opening a share link replaced your saved preferences** | Fixed | Nothing is saved until you change a setting yourself. Resetting also removes the link's parameters from the address bar |
| L6 | **The copy shortcut reported success regardless.** Alt+Shift+C showed "Copied to clipboard" even when the copy failed | Fixed | The message now reflects the result |
| L7 | **Regenerate could leave the text unchanged**, and drew from 100,000 seeds of a possible 233,280 | Fixed | It draws from the whole range and redraws if the text would not change |
| L8 | **On phones the "Ipsumify" wordmark ran into the GitHub link** | Fixed | The header scales down below 640px |
| L9 | **A deploy could not build.** The dependency update moved Nuxt to a version needing Node 22.22.3 or later while `.nvmrc` pinned 22.14.0; Netlify's v2.4.0 deploy failed | Fixed | `.nvmrc`, `netlify.toml`, and `package.json` `engines` now agree on a supported Node version |

### Not changed

- **Seeds repeat every 233,280 values.** This is a property of the generator. Changing it would change the text behind every existing share link and cached API response.
- **400 responses are cached for an hour**, like successes. The same bad request always gets the same answer.

## Security

See [SECURITY.md](SECURITY.md) for how to report a vulnerability and for the security measures in place.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Nuxt](https://nuxt.com/) - The intuitive Vue framework
- [Nuxt UI](https://ui.nuxt.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Lucide](https://lucide.dev/) - Beautiful open-source icons
