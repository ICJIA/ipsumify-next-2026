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

![Ipsumify Screenshot](documentation/screenshot2.jpg)


## Site

https://ipsumify.com

## Features

- **Markdown-Ready Output** - Generate lorem ipsum with headers, code blocks, blockquotes, lists, and links
- **Multiple Themes** - Choose from classic Lorem Ipsum or fun themed alternatives
- **Customizable Blocks** - Control the number of text blocks (1-20)
- **Formatting Options** - Toggle capitalization and no-wrap mode for cleaner copy-paste
- **One-Click Actions** - Copy to clipboard or download as `.md` file
- **Public API** - REST endpoint for generating text via `curl` or server-side code — no API key required
- **Dark Theme** - Beautiful dark UI optimized for developers and designers
- **Fully Accessible** - 100% Lighthouse accessibility score
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

## API

Ipsumify includes a public REST API deployed as a Netlify Function. Call it with no parameters for sensible defaults, or customize the output with query parameters.

### Quick Start

```bash
# Default: 5 blocks of classic lorem ipsum as markdown
curl https://ipsumify.com/api/generate
```

### Examples

**Get 3 blocks of dog-themed text:**

```bash
curl "https://ipsumify.com/api/generate?theme=dog&blocks=3"
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

### Parameters

| Parameter | Type   | Default    | Description                                                          |
| --------- | ------ | ---------- | -------------------------------------------------------------------- |
| `theme`   | string | `lorem`    | Theme ID: `lorem`, `dog`, `cat`, `baked`, `bbq`                     |
| `blocks`  | number | `5`        | Number of text blocks (1-20)                                        |
| `seed`    | number | `42`       | RNG seed for deterministic output                                   |
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

The `json` format additionally includes `options` and returns `output` as an array of strings (one per block) plus a `markdown` field with the full text.

### Caching and Fair Use

The API is public with no authentication required. Responses are cached at the CDN edge (`Cache-Control: public, max-age=3600`) since identical parameters always produce identical output. Repeated requests with the same parameters are served from cache without invoking the serverless function.

The API is intended for use with `curl` and server-side code. Cross-origin browser requests (e.g., `fetch` from another domain) are blocked — no CORS headers are sent.

## Tech Stack

| Technology                                    | Version | Description                                |
| --------------------------------------------- | ------- | ------------------------------------------ |
| [Nuxt](https://nuxt.com/)                     | 4.x     | Vue.js meta-framework                      |
| [Nuxt UI](https://ui.nuxt.com/)               | 4.x     | Beautiful UI component library             |
| [Tailwind CSS](https://tailwindcss.com/)      | 4.x     | Utility-first CSS framework                |
| [TypeScript](https://www.typescriptlang.org/) | 5.x     | Type-safe JavaScript                       |
| [@nuxtjs/seo](https://nuxtseo.com/)           | 3.x     | SEO module with sitemap and robots.txt     |
| [@nuxt/eslint](https://eslint.nuxt.com/)      | 1.x     | ESLint integration with Nuxt flat config   |
| [Lucide Icons](https://lucide.dev/)           | -       | Beautiful open-source icons                |

## Getting Started

### Prerequisites

- Node.js 22.x or higher (see `.nvmrc`)
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
| `yarn build`       | Build for production (hybrid: static pages + serverless API) |
| `yarn generate`    | Generate fully static site (no serverless functions)         |
| `yarn preview`     | Preview production build locally                             |
| `yarn test`        | Run lint, typecheck, and unit tests                          |
| `yarn test:unit`   | Run Vitest unit tests                                        |
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
├── server/
│   └── api/
│       └── generate.get.ts     # GET /api/generate endpoint
├── utils/
│   ├── clipboard.ts        # Clipboard utility with fallback
│   ├── generate.ts         # Shared text generation (web UI + API)
│   └── random.ts           # Seeded PRNG utilities
├── tests/
│   └── unit/               # Vitest unit tests
├── documentation/          # Screenshots for README
├── public/
│   ├── icon.svg            # Favicon
│   └── og-image.png        # Open Graph image for social sharing
├── app.config.ts           # Nuxt UI colors (primary, neutral)
├── eslint.config.mjs      # ESLint flat config (auto-generated by @nuxt/eslint)
├── ipsumify.config.ts     # Single source of truth for all app config
├── netlify.toml           # Netlify build and security headers
├── nuxt.config.ts         # Nuxt configuration
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## Configuration

**ipsumify.config.ts** is the single source of truth for app configuration. The `nuxt.config.ts` imports from it for SEO, meta tags, and head. Edit `ipsumify.config.ts` for:

| Key                                            | Description                                  |
| ---------------------------------------------- | -------------------------------------------- |
| `name`, `title`, `description`                 | Site identity and SEO                        |
| `url`, `github`                                | URLs                                         |
| `primaryColor`, `backgroundColor`, `tileColor` | Theme colors (hex)                           |
| `defaultThemeId`                               | Default theme (lorem, dog, cat, baked, bbq)  |
| `defaultBlocks`                                | Default number of text blocks (1-20)         |
| `defaultSeed`                                  | Initial RNG seed for SSR-safe hydration      |
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
2. Use Iconify icon classes (e.g. `i-lucide-scroll-text`) for the `icon` field
3. Optionally set `defaultThemeId` in `ipsumify.config.ts` to make it the default

## Deployment

### Netlify (Recommended)

The project deploys as a hybrid site on Netlify: pages are prerendered as static files, and the API runs as a Netlify Function.

- **Build command:** `yarn build`
- **Publish directory:** `.output/public`
- **Node version:** 22 (set in `netlify.toml`)
- **Security headers:** `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, CSP, HSTS
- **API:** `server/api/` routes are automatically deployed as Netlify Functions

1. Connect your repository to Netlify
2. Netlify will automatically detect the build settings from `netlify.toml`
3. Deploy!

## Architecture

- **Hybrid deployment:** Pages are prerendered as static files; the API runs as a serverless function (Netlify Functions via Nitro)
- **Shared generation logic:** Both the web UI and API use `utils/generate.ts` — same code, same output
- **Deterministic output:** Uses a seeded LCPRNG so identical parameters always produce identical text (enables aggressive CDN caching)
- **Config hierarchy:** `ipsumify.config.ts` → `nuxt.config.ts`; theme content lives in `data/themes.ts`

## Accessibility & Quality Scores

### Lighthouse

| Category       | Score |
| -------------- | ----- |
| Accessibility  | 100   |
| Best Practices | 100   |
| SEO            | 100   |

### axe-core

| Metric     | Result |
| ---------- | ------ |
| Violations | 0      |
| Passes     | 37     |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

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
