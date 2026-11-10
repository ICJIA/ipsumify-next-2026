<script setup lang="ts">
/**
 * Technical details — how Ipsumify generates its text and how the site,
 * the API and the npm package are put together, laid out as an infographic:
 * big figures, big headings, and diagrams.
 *
 * The diagrams are Mermaid, rendered ahead of time to the SVGs in
 * public/diagrams (sources in diagrams/, rebuilt with yarn build:diagrams),
 * so the page ships no diagram library.
 *
 * The worked example is computed on the page from the real generator, so it
 * cannot drift from what the code does.
 */
import config from "../../ipsumify.config";
import { themes } from "../../data/themes";
import { generateText, DEFAULT_OPTIONS } from "../../utils/generate";
import {
  seededRandom,
  shuffleWithSeed,
  normalizeSeed,
  LCPRNG_MULTIPLIER,
  LCPRNG_INCREMENT,
  SEED_PERIOD,
  SEED_OFFSETS,
  MAX_SEED,
} from "../../utils/random";

const title = config.technicalDetailsTitle;
const description = config.technicalDetailsDescription;

useSeoMeta({
  title,
  description,
  ogType: "article",
  ogTitle: title,
  ogDescription: description,
  ogUrl: config.technicalDetailsUrl,
  ogSiteName: config.name,
  ogImage: config.ogImageUrl,
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: config.ogImageUrl,
  author: config.author,
  colorScheme: "dark",
  themeColor: config.primaryColor,
});

onMounted(() => {
  window.scrollTo(0, 0);
});

const fmt = (n: number) => n.toLocaleString("en-US");

/** The seed the worked example uses; the reader can change it */
const exampleSeed = ref<number>(config.defaultSeed);

/** Keeps the example's seed a whole number in the accepted range */
const safeSeed = computed(() => {
  const value = Number(exampleSeed.value);
  if (!Number.isInteger(value) || value < 0) return 0;
  return Math.min(value, MAX_SEED);
});

const lorem = themes.find((t) => t.id === config.defaultThemeId) ?? themes[0]!;

/** Every step of generating three blocks, taken from the real functions */
const example = computed(() => {
  const seed = safeSeed.value;
  const state = normalizeSeed(seed);
  const firstNumbers = (() => {
    const rng = seededRandom(seed);
    return Array.from({ length: 4 }, () => rng.next().toFixed(4));
  })();
  // Shuffling the positions shows the order without printing ten paragraphs
  const positions = lorem.paragraphs.map((_, index) => String(index + 1));
  const order = shuffleWithSeed(positions, seed);
  const sizes = (() => {
    const rng = seededRandom(seed + SEED_OFFSETS.BLOCK_SIZES);
    return Array.from({ length: 3 }, () => rng.nextInt(1, 3));
  })();
  let cursor = 0;
  const blocks = sizes.map((size) => {
    const used = Array.from({ length: size }, () => order[cursor++ % order.length]);
    return { size, used: used.join(", ") };
  });
  const text = generateText({ theme: lorem, blocks: 3, seed, options: { ...DEFAULT_OPTIONS } });
  return { seed, state, firstNumbers, order: order.join(", "), blocks, firstWords: `${text.slice(0, 72)}…` };
});

const themeFacts = computed(() =>
  themes.map((t) => ({
    label: t.label,
    id: t.id,
    paragraphs: t.paragraphs.length,
    headings: t.headings.length,
    listItems: t.listItems.length,
  })),
);

/** The page's sections, in order; each gets a big number */
const sections = [
  { id: "one-engine", label: "One engine" },
  { id: "generator", label: "Seed to text" },
  { id: "example", label: "Try it" },
  { id: "markdown", label: "Markdown rhythm" },
  { id: "seeds", label: "Seeds" },
  { id: "api", label: "The API" },
  { id: "npm", label: "npm package" },
  { id: "website", label: "Site and security" },
  { id: "stack", label: "Built with" },
];

/** The headline figures. Each is read from the code it describes. */
const stats = computed(() => [
  { value: "1", label: "function makes all the text" },
  { value: fmt(SEED_PERIOD), label: "distinct seeds" },
  { value: String(themes.length), label: "themes" },
  { value: "4", label: "output formats" },
  { value: "0", label: "requests to other sites" },
  { value: "0", label: "npm dependencies" },
]);

/**
 * Which markdown elements come before each of the first twelve blocks.
 * The same rules as utils/generate.ts: code every third block from the
 * first, quotes every second from the second, lists every third from the
 * third, links every fourth from the first.
 */
const rhythm = Array.from({ length: 12 }, (_, i) => ({
  block: i + 1,
  code: i % 3 === 0,
  quote: i % 2 === 1,
  list: i % 3 === 2,
  link: i % 4 === 0,
}));

const rhythmRows = [
  { key: "code", label: "Code", detail: "Blocks 1, 4, 7, …" },
  { key: "quote", label: "Quote", detail: "Blocks 2, 4, 6, …" },
  { key: "list", label: "List", detail: "Blocks 3, 6, 9, …" },
  { key: "link", label: "Link", detail: "Blocks 1, 5, 9, …" },
] as const;

const builtWith = [
  { name: "Nuxt 4", href: "https://nuxt.com/" },
  { name: "Vue 3", href: "https://vuejs.org/" },
  { name: "TypeScript", href: "https://www.typescriptlang.org/" },
  { name: "Nuxt UI 4", href: "https://ui.nuxt.com/" },
  { name: "Tailwind CSS 4", href: "https://tailwindcss.com/" },
  { name: "marked", href: "https://marked.js.org/" },
  { name: "esbuild", href: "https://esbuild.github.io/" },
  { name: "Vitest", href: "https://vitest.dev/" },
  { name: "Mermaid", href: "https://mermaid.js.org/" },
  { name: "Netlify", href: "https://www.netlify.com/" },
];


const repo = config.github;
const source = (path: string) => `${repo}/blob/main/${path}`;
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a] text-[#fafafa]">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-[#00d4aa] focus:px-4 focus:py-2 focus:text-[#0a0a0a] focus:outline-none"
    >
      Skip to main content
    </a>

    <header class="border-b border-[#1a1a1a] px-6 py-6">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <NuxtLink
          to="/"
          class="flex items-center gap-3 transition-opacity hover:opacity-80 sm:gap-4"
          aria-label="Ipsumify — back to the generator"
        >
          <UIcon
            name="i-lucide-code"
            class="h-10 w-10 text-[#00d4aa] sm:h-14 sm:w-14"
            aria-hidden="true"
          />
          <span class="font-sans text-4xl font-black tracking-tight sm:text-6xl md:text-7xl">Ipsumify</span>
        </NuxtLink>
        <nav class="flex items-center gap-5" aria-label="Main navigation">
          <NuxtLink
            to="/"
            class="flex items-center gap-2 text-sm text-[#d1d5db] transition-colors hover:text-[#fafafa]"
          >
            <UIcon name="i-lucide-refresh-cw" class="h-4 w-4" aria-hidden="true" />
            <span>Generator</span>
          </NuxtLink>
          <a
            :href="config.github"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 text-sm text-[#d1d5db] transition-colors hover:text-[#fafafa]"
          >
            <UIcon name="i-simple-icons-github" class="h-5 w-5" aria-hidden="true" />
            <span>GitHub</span>
          </a>
        </nav>
      </div>
    </header>

    <main id="main-content" class="info mx-auto max-w-6xl px-6 pb-12">
      <!-- Hero -->
      <div class="py-16 md:py-24">
        <div
          class="mb-6 inline-flex items-center gap-2 rounded-full border border-[#1a1a1a] bg-[#111] px-4 py-1.5 text-xs text-[#00d4aa]"
        >
          <UIcon name="i-lucide-cpu" class="h-3.5 w-3.5" aria-hidden="true" />
          Technical details
        </div>
        <h1 class="mb-8 font-sans text-6xl font-black leading-[0.95] tracking-tight sm:text-7xl md:text-8xl">
          How <span class="text-[#00d4aa]">Ipsumify</span> works
        </h1>
        <p class="max-w-3xl text-xl leading-relaxed text-[#d1d5db] md:text-2xl">
          A small, deterministic text generator with three ways in: this
          website, a public API, and an npm package.
        </p>
      </div>

      <!-- Headline figures -->
      <ul class="stats" aria-label="Ipsumify in numbers">
        <li v-for="stat in stats" :key="stat.label">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </li>
      </ul>

      <nav aria-label="On this page" class="my-12">
        <ol class="flex flex-wrap gap-2">
          <li v-for="(section, index) in sections" :key="section.id">
            <a :href="`#${section.id}`" class="chip">
              <span class="font-mono text-[#00d4aa]">{{ String(index + 1).padStart(2, "0") }}</span>
              {{ section.label }}
            </a>
          </li>
        </ol>
      </nav>

      <!-- 01 -->
      <section id="one-engine" aria-labelledby="h-one-engine">
        <p class="num" aria-hidden="true">01</p>
        <h2 id="h-one-engine">One engine, three ways in</h2>
        <p class="lead">
          All of the text comes from one function,
          <a :href="source('utils/generate.ts')" target="_blank" rel="noopener noreferrer"><code>generateText</code></a>.
          It takes a theme, a number of blocks, a seed and a set of options,
          and returns a string. It reads nothing else, so the same inputs
          always give the same text.
        </p>
        <figure>
          <img
            src="/diagrams/architecture.svg"
            width="726"
            height="465"
            alt="Diagram: the website, the API and the npm package all call generateText, which reads the themes' fixed word lists and returns the same text every time."
          >
        </figure>
        <div class="tiles three">
          <div class="tile">
            <UIcon name="i-lucide-monitor" class="tile-icon" aria-hidden="true" />
            <h3>Website</h3>
            <p>Runs the function in your browser. The page never calls the API.</p>
          </div>
          <div class="tile">
            <UIcon name="i-lucide-server" class="tile-icon" aria-hidden="true" />
            <h3>API</h3>
            <p>Runs it in a serverless function and returns JSON.</p>
          </div>
          <div class="tile">
            <UIcon name="i-lucide-terminal" class="tile-icon" aria-hidden="true" />
            <h3>npm package</h3>
            <p>Bundles it into a command line tool and a library.</p>
          </div>
        </div>
      </section>

      <!-- 02 -->
      <section id="generator" aria-labelledby="h-generator">
        <p class="num" aria-hidden="true">02</p>
        <h2 id="h-generator">From a seed to text</h2>
        <p class="lead">
          Every random choice comes from one small formula. The generator
          keeps a single number, the state, and each step replaces it:
        </p>
        <p class="formula">
          <span class="sr-only">state becomes: </span>(state × {{ fmt(LCPRNG_MULTIPLIER) }} + {{ fmt(LCPRNG_INCREMENT) }}) mod {{ fmt(SEED_PERIOD) }}
        </p>
        <p>
          Dividing the state by {{ fmt(SEED_PERIOD) }} gives a number from 0
          up to, but not including, 1. This is a linear congruential
          generator, one of the simplest there is.
        </p>
      <figure>
          <img
            src="/diagrams/pipeline.svg"
            width="748"
            height="1055"
            alt="Diagram: the seed is normalized, then feeds three streams of random numbers. The first shuffles the paragraphs, the second shuffles the headings, the third chooses each block's size. The blocks are built, markdown elements are added, and the result is formatted as markdown, plain text, HTML or JSON."
          >
        </figure>
      <ol class="steps four">
          <li>
            <h3>Three streams from one seed</h3>
            <p>
              One starts at the seed, one at seed + {{ SEED_OFFSETS.HEADINGS }},
              one at seed + {{ fmt(SEED_OFFSETS.BLOCK_SIZES) }}.
            </p>
          </li>
          <li>
            <h3>Shuffle</h3>
            <p>
              The theme's paragraphs and headings are each put in a new
              order by a Fisher–Yates shuffle.
            </p>
          </li>
          <li>
            <h3>Build the blocks</h3>
            <p>
              Each block is one, two or three paragraphs, taken in shuffled
              order and wrapping around when the list runs out.
            </p>
          </li>
          <li>
            <h3>Decorate and format</h3>
            <p>
              Markdown elements are added, then the blocks are joined with
              blank lines, or spaces in no-wrap mode.
            </p>
          </li>
        </ol>
        <p>
          Separate streams mean that asking for more blocks does not reshuffle
          the text: five blocks are the first five of twenty.
        </p>
        <h3 class="sub">What a theme is</h3>
        <div class="table-wrap" tabindex="0" role="region" aria-label="Themes and the size of their word lists">
          <table>
            <thead>
              <tr>
                <th scope="col">Theme</th>
                <th scope="col">id</th>
                <th scope="col">Paragraphs</th>
                <th scope="col">Headings</th>
                <th scope="col">List items</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in themeFacts" :key="t.id">
                <th scope="row">{{ t.label }}</th>
                <td><code>{{ t.id }}</code></td>
                <td>{{ t.paragraphs }}</td>
                <td>{{ t.headings }}</td>
                <td>{{ t.listItems }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 03 -->
      <section id="example" aria-labelledby="h-example">
        <p class="num" aria-hidden="true">03</p>
        <h2 id="h-example">Try it</h2>
        <p class="lead">
          These values are computed on this page by the same code the
          generator uses. Change the seed and watch every step change.
        </p>
        <div class="example">
          <label for="example-seed" class="seed-label">
            <span>Seed</span>
            <input
              id="example-seed"
              v-model.number="exampleSeed"
              type="number"
              min="0"
              :max="MAX_SEED"
              step="1"
              inputmode="numeric"
            >
          </label>
          <dl aria-live="polite">
            <div>
              <dt>Starting state</dt>
              <dd><span class="big-mono">{{ fmt(example.state) }}</span> <span class="note">the seed, mod {{ fmt(SEED_PERIOD) }}</span></dd>
            </div>
            <div>
              <dt>First random numbers</dt>
              <dd><span class="big-mono">{{ example.firstNumbers.join("  ") }}</span></dd>
            </div>
            <div>
              <dt>Paragraph order after the shuffle</dt>
              <dd><span class="big-mono">{{ example.order }}</span></dd>
            </div>
            <div v-for="(block, index) in example.blocks" :key="index">
              <dt>Block {{ index + 1 }}</dt>
              <dd>
                <span class="big-mono">{{ block.used }}</span>
                <span class="note">{{ block.size }} {{ block.size === 1 ? "paragraph" : "paragraphs" }}</span>
              </dd>
            </div>
            <div>
              <dt>The text begins</dt>
              <dd class="font-mono">{{ example.firstWords }}</dd>
            </div>
          </dl>
        </div>
      </section>

      <!-- 04 -->
      <section id="markdown" aria-labelledby="h-markdown">
        <p class="num" aria-hidden="true">04</p>
        <h2 id="h-markdown">The rhythm of markdown</h2>
        <p class="lead">
          Markdown elements are placed by position, not at random, so they
          arrive at a steady beat. A short output may not have room for all
          of them.
        </p>
        <div class="table-wrap" tabindex="0" role="region" aria-label="Which markdown elements come before each of the first twelve blocks">
          <table class="rhythm">
            <thead>
              <tr>
                <th scope="col">Before block</th>
                <th v-for="cell in rhythm" :key="cell.block" scope="col">{{ cell.block }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rhythmRows" :key="row.key">
                <th scope="row">
                  {{ row.label }}
                  <span class="note block">{{ row.detail }}</span>
                </th>
                <td v-for="cell in rhythm" :key="cell.block">
                  <span v-if="cell[row.key]" class="dot"><span class="sr-only">yes</span></span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="tiles two">
          <div class="tile">
            <UIcon name="i-lucide-heading" class="tile-icon" aria-hidden="true" />
            <h3>Headings are the exception</h3>
            <p>
              An H1 opens the text. After that a heading appears every few
              blocks, its level moving between H2 and H4. Those choices come
              from the stream that sizes the blocks, so switching headings on
              changes how the paragraphs are grouped.
            </p>
          </div>
          <div class="tile">
            <UIcon name="i-lucide-file-text" class="tile-icon" aria-hidden="true" />
            <h3>Four formats, one source</h3>
            <p>
              Markdown is the source. HTML is that markdown passed through
              <a href="https://marked.js.org/" target="_blank" rel="noopener noreferrer">marked</a>;
              plain text is the markdown with its syntax stripped; JSON wraps
              it with the settings that made it.
            </p>
          </div>
        </div>
      </section>

      <!-- 05 -->
      <section id="seeds" aria-labelledby="h-seeds">
        <p class="num" aria-hidden="true">05</p>
        <h2 id="h-seeds">Seeds and repeatability</h2>
        <p class="lead">
          The seed is the whole story: the same seed, theme, block count and
          options give the same text in the browser, from
          <code>curl</code>, and from <code>npx ipsumify</code>.
        </p>
        <div class="tiles three">
          <div class="tile">
            <p class="tile-figure">{{ config.defaultSeed }}</p>
            <h3>The default seed</h3>
            <p>Where the website starts, and what the API uses when you give none.</p>
          </div>
          <div class="tile">
            <p class="tile-figure">{{ fmt(SEED_PERIOD) }}</p>
            <h3>Seeds before they repeat</h3>
            <p>
              Seed {{ config.defaultSeed }} and seed
              {{ fmt(config.defaultSeed + SEED_PERIOD) }} give the same text.
            </p>
          </div>
          <div class="tile">
            <p class="tile-figure">0–{{ fmt(MAX_SEED) }}</p>
            <h3>The accepted range</h3>
            <p>Any whole number in it, in a share link, the API, or the command line.</p>
          </div>
        </div>
        <ul>
          <li>
            <strong>Regenerate</strong> picks a seed at random from all
            {{ fmt(SEED_PERIOD) }}, and picks again if the text would not
            change.
          </li>
          <li>
            <strong>Share Settings</strong> writes the theme, the block count,
            any options that are switched on, and the seed into the link.
            Whatever the link leaves out is at its default, so the person
            opening it sees exactly the text you see.
          </li>
          <li>
            The numbers are easy to predict. This is a generator for
            placeholder text and should never be used for anything that needs
            to be secret.
          </li>
        </ul>
      </section>

      <!-- 06 -->
      <section id="api" aria-labelledby="h-api">
        <p class="num" aria-hidden="true">06</p>
        <h2 id="h-api">The API</h2>
        <p class="lead">
          One endpoint, no key, always JSON. Because the same request always
          has the same answer, most requests never reach the code at all.
        </p>
        <pre tabindex="0" role="region" aria-label="Example API request"><code>curl "{{ config.url }}/api/generate?theme=dog&amp;blocks=3&amp;format=json"</code></pre>
        <figure>
          <img
            src="/diagrams/api.svg"
            width="898"
            height="759"
            alt="Sequence diagram: you send a request to Netlify's CDN. If the answer is already cached, the CDN returns it. If not, it runs the function, which reads the query strictly. A well-formed request is generated and returned as 200 JSON, cached for one hour. Anything else is returned as 400 JSON and never cached."
          >
        </figure>
        <div class="tiles three">
          <div class="tile">
            <p class="tile-figure">1 hour</p>
            <h3>Cached at the CDN</h3>
            <p>A repeated request is usually answered without running the function.</p>
          </div>
          <div class="tile">
            <p class="tile-figure">7</p>
            <h3>Parameters, read strictly</h3>
            <p>
              <code>theme</code>, <code>blocks</code>, <code>seed</code>,
              <code>md</code>, <code>lower</code>, <code>nowrap</code>,
              <code>format</code>. Each once, written one way. Anything else
              is a 400.
            </p>
          </div>
          <div class="tile">
            <p class="tile-figure">20</p>
            <h3>Blocks at most</h3>
            <p>There is no rate limit, but every request is a small, fixed amount of work.</p>
          </div>
        </div>
        <p>
          Strictness is what keeps the cache honest: the cache and the
          function must agree exactly on what a URL means, so the function
          refuses any URL where they might not. The parameters and responses
          are documented in the
          <a :href="`${repo}#api`" target="_blank" rel="noopener noreferrer">README</a>.
        </p>
      </section>

      <!-- 07 -->
      <section id="npm" aria-labelledby="h-npm">
        <p class="num" aria-hidden="true">07</p>
        <h2 id="h-npm">The npm package</h2>
        <p class="lead">
          <a href="https://www.npmjs.com/package/ipsumify" target="_blank" rel="noopener noreferrer"><code>ipsumify</code></a>
          is the generator, the themes and the markdown renderer bundled into
          a few files. It has no dependencies and runs nothing on install.
        </p>
        <pre tabindex="0" role="region" aria-label="Example command"><code>npx ipsumify 3 --theme bbq --headings --lists</code></pre>
        <div class="split">
          <figure>
            <img
              src="/diagrams/release.svg"
              width="565"
              height="855"
              alt="Diagram: pushing a version tag starts CI and a Netlify deploy. After CI passes, publish.sh rebuilds and tests the tagged commit, packs the package, installs it in a scratch project and runs it. You approve in npm, and the package is published."
            >
          </figure>
          <ol class="steps">
            <li>
              <h3>Random by default</h3>
              <p>
                The command line picks a new seed each run. Pass
                <code>--seed</code> and it prints what this website shows for
                that seed.
              </p>
            </li>
            <li>
              <h3>A library too</h3>
              <p><code>import ipsumify from 'ipsumify'</code> gives Node programs the same function.</p>
            </li>
            <li>
              <h3>One version number</h3>
              <p>The package and this site are released together from the same tag.</p>
            </li>
            <li>
              <h3>Tested as it will be installed</h3>
              <p>
                The release script publishes the exact file it has just
                installed and run, and nothing reaches npm without a person's
                approval.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <!-- 08 -->
      <section id="website" aria-labelledby="h-website">
        <p class="num" aria-hidden="true">08</p>
        <h2 id="h-website">The site, and its security</h2>
        <p class="lead">
          The pages are built ahead of time into static files and served from
          a CDN. The text appears once the JavaScript has loaded and run the
          generator in your browser. Nothing you do is sent anywhere.
        </p>
        <div class="tiles four">
          <div class="tile">
            <p class="tile-figure">0</p>
            <h3>Accounts or cookies</h3>
            <p>Your settings are kept in your browser's <code>localStorage</code> and checked when read back.</p>
          </div>
          <div class="tile">
            <p class="tile-figure">0</p>
            <h3>Other sites contacted</h3>
            <p>Icons, fonts, scripts and styles all come from this site.</p>
          </div>
          <div class="tile">
            <p class="tile-figure">SHA-256</p>
            <h3>Script allow-list</h3>
            <p>
              A Content-Security-Policy allows the page's own scripts by hash,
              computed on every build. An injected script would not run.
            </p>
          </div>
          <div class="tile">
            <p class="tile-figure">404</p>
            <h3>For unknown URLs</h3>
            <p>A plain one, not the app. The page also cannot be framed by another site.</p>
          </div>
        </div>
        <p>
          The code has been through a security audit and a red team / blue
          team exercise. Every finding and its fix is listed in the
          <a :href="`${repo}#security-and-logic-audits`" target="_blank" rel="noopener noreferrer">README</a>.
        </p>
      </section>

      <!-- 09 -->
      <section id="stack" aria-labelledby="h-stack">
        <p class="num" aria-hidden="true">09</p>
        <h2 id="h-stack">Built with</h2>
        <ul class="built">
          <li v-for="item in builtWith" :key="item.name">
            <a :href="item.href" target="_blank" rel="noopener noreferrer" class="chip">{{ item.name }}</a>
          </li>
        </ul>
        <p>
          The source is on
          <a :href="repo" target="_blank" rel="noopener noreferrer">GitHub</a>
          under the MIT license. The generator is in
          <a :href="source('utils/generate.ts')" target="_blank" rel="noopener noreferrer"><code>utils/generate.ts</code></a>
          and
          <a :href="source('utils/random.ts')" target="_blank" rel="noopener noreferrer"><code>utils/random.ts</code></a>,
          and the themes in
          <a :href="source('data/themes.ts')" target="_blank" rel="noopener noreferrer"><code>data/themes.ts</code></a>.
        </p>
        <p>
          <NuxtLink to="/" class="cta">
            <UIcon name="i-lucide-arrow-left" class="h-5 w-5" aria-hidden="true" />
            Back to the generator
          </NuxtLink>
        </p>
      </section>
    </main>

    <footer class="border-t border-[#1a1a1a] px-6 py-6">
      <div
        class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-[#9ca3af]"
      >
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
          <NuxtLink to="/" class="flex items-center gap-1 text-[#00d4aa] hover:underline">
            <UIcon name="i-lucide-refresh-cw" class="h-3 w-3" aria-hidden="true" />
            Generator
          </NuxtLink>
          <a
            :href="config.changelog"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1 text-[#00d4aa] hover:underline"
          >
            <UIcon name="i-lucide-history" class="h-3 w-3" aria-hidden="true" />
            Changelog
          </a>
          <a
            :href="config.github"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1 text-[#00d4aa] hover:underline"
          >
            <UIcon name="i-simple-icons-github" class="h-3 w-3" aria-hidden="true" />
            GitHub
          </a>
        </div>
        <span class="font-mono">v{{ config.version }}</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* An infographic, so everything is a size up from the generator page */
.info section {
  scroll-margin-top: 1.5rem;
  border-top: 1px solid #1a1a1a;
  padding: 4.5rem 0;
}

.info .num {
  margin-bottom: 0.5rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: clamp(3.5rem, 10vw, 7rem);
  font-weight: 800;
  line-height: 1;
  color: #00d4aa;
}

.info h2 {
  margin-bottom: 1.5rem;
  font-size: clamp(2.25rem, 6vw, 4rem);
  font-weight: 900;
  line-height: 1.02;
  letter-spacing: -0.025em;
  color: #fafafa;
}

.info section > p,
.info section > ul > li {
  max-width: 48rem;
  font-size: 1.125rem;
  line-height: 1.75;
  color: #d1d5db;
}

.info section > p {
  margin-bottom: 1.5rem;
}

.info section > p.lead {
  font-size: clamp(1.25rem, 2.4vw, 1.5rem);
  line-height: 1.55;
  color: #fafafa;
}

.info section > ul:not(.built) {
  margin: 0 0 1.5rem;
  padding-left: 1.25rem;
  list-style: disc;
}

.info section > ul > li {
  margin-bottom: 0.75rem;
}

.info li::marker {
  color: #00d4aa;
}

.info h3.sub {
  margin: 3rem 0 1rem;
  font-size: 1.5rem;
  font-weight: 800;
  color: #fafafa;
}

.info strong {
  font-weight: 700;
  color: #fafafa;
}

.info section a:not(.chip):not(.cta) {
  color: #00d4aa;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.info section a:not(.chip):not(.cta):hover {
  color: #5eead4;
}

.info code {
  border-radius: 4px;
  background: #1a1a1a;
  padding: 0.1rem 0.4rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9em;
  color: #fafafa;
}

.info a code {
  color: inherit;
}

.info pre {
  margin-bottom: 2rem;
  overflow-x: auto;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  background: #161616;
  padding: 1.25rem 1.5rem;
  font-size: clamp(0.9rem, 2vw, 1.25rem);
}

.info pre code {
  background: none;
  padding: 0;
  font-size: 1em;
  color: #fafafa;
}

/* Headline figures */
.stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  overflow: hidden;
  border: 1px solid #1a1a1a;
  border-radius: 16px;
  background: #1a1a1a;
}

@media (min-width: 768px) {
  .stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.stats li {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
  background: #0a0a0a;
  padding: 1.25rem 1rem;
}

@media (min-width: 640px) {
  .stats li {
    padding: 1.75rem 1.5rem;
  }
}

.stat-value {
  font-size: clamp(1.6rem, 7vw, 4.75rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.03em;
  color: #00d4aa;
}

.stat-label {
  font-size: 1rem;
  color: #d1d5db;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #2a2a2a;
  border-radius: 999px;
  background: #111;
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  color: #d1d5db;
  transition: border-color 0.15s, color 0.15s;
}

.chip:hover {
  border-color: #00d4aa;
  color: #fafafa;
}

.built {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 2rem;
}

.built .chip {
  font-size: 1.125rem;
  font-weight: 600;
  padding: 0.7rem 1.25rem;
}

/* Diagrams */
.info figure {
  margin: 2.5rem 0;
  border: 1px solid #1a1a1a;
  border-radius: 16px;
  background: #0d0d0d;
  padding: clamp(1rem, 3vw, 2.5rem);
}

.info figure img {
  display: block;
  width: 100%;
  max-width: 56rem;
  height: auto;
  margin: 0 auto;
}

.split {
  display: grid;
  gap: 2rem;
  align-items: start;
  margin: 2.5rem 0;
}

.split figure {
  margin: 0;
}

@media (min-width: 1024px) {
  .split {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  }
}

/* The big formula */
.info section > p.formula {
  max-width: none;
  margin: 2rem 0;
  border-left: 6px solid #00d4aa;
  background: #111;
  padding: 1.5rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: clamp(1.1rem, 3.6vw, 2.5rem);
  font-weight: 700;
  line-height: 1.3;
  color: #fafafa;
  overflow-wrap: anywhere;
}

/* Numbered steps */
.steps {
  display: grid;
  gap: 1rem;
  counter-reset: step;
}

.steps li {
  position: relative;
  counter-increment: step;
  border: 1px solid #1a1a1a;
  border-radius: 12px;
  background: #111;
  padding: 1.25rem 1.25rem 1.25rem 4.75rem;
}

.steps li::before {
  content: counter(step);
  position: absolute;
  top: 1rem;
  left: 1.25rem;
  font-size: 2.75rem;
  font-weight: 900;
  line-height: 1;
  color: #00d4aa;
}

.steps.four {
  margin: 2.5rem 0;
}

@media (min-width: 768px) {
  .steps.four {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.steps h3,
.tile h3 {
  margin-bottom: 0.35rem;
  font-size: 1.25rem;
  font-weight: 800;
  color: #fafafa;
}

.steps p,
.tile p {
  font-size: 1rem;
  line-height: 1.6;
  color: #d1d5db;
}

/* Tiles */
.tiles {
  display: grid;
  gap: 1rem;
  margin: 2.5rem 0;
}

@media (min-width: 640px) {
  .tiles.two,
  .tiles.four {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tiles.three {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .tiles.four {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.tile {
  border: 1px solid #1a1a1a;
  border-radius: 12px;
  background: #111;
  padding: 1.5rem;
}

.tile-icon {
  margin-bottom: 0.75rem;
  width: 2.25rem;
  height: 2.25rem;
  color: #00d4aa;
}

.tile p.tile-figure {
  margin-bottom: 0.75rem;
  font-size: clamp(1.75rem, 3.4vw, 2.75rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
  color: #00d4aa;
  overflow-wrap: anywhere;
}

/* Tables */
.table-wrap {
  /* Positioned, so the visually hidden text inside the dots scrolls with the
     table. Without it that text sits outside the scroll box and widens the
     whole page on a phone. */
  position: relative;
  margin: 1.5rem 0 2rem;
  overflow-x: auto;
  border: 1px solid #1a1a1a;
  border-radius: 12px;
}

.table-wrap:focus-visible,
.info pre:focus-visible {
  outline: 2px solid #00d4aa;
  outline-offset: 2px;
}

.info table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.0625rem;
}

.info th,
.info td {
  border-bottom: 1px solid #1a1a1a;
  padding: 0.85rem 1rem;
  text-align: left;
  vertical-align: middle;
  color: #d1d5db;
}

.info thead th {
  background: #111;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #9ca3af;
}

.info tbody th {
  font-weight: 700;
  color: #fafafa;
}

.info tbody tr:last-child th,
.info tbody tr:last-child td {
  border-bottom: 0;
}

.rhythm {
  min-width: 46rem;
}

.rhythm thead th:not(:first-child),
.rhythm td {
  width: 3rem;
  padding-right: 0.25rem;
  padding-left: 0.25rem;
  text-align: center;
}

.rhythm thead th:not(:first-child) {
  font-size: 1rem;
  color: #fafafa;
}

.dot {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 999px;
  background: #00d4aa;
  vertical-align: middle;
}

.note {
  font-size: 0.875rem;
  font-weight: 400;
  color: #9ca3af;
}

.note.block {
  display: block;
}

/* The worked example */
.example {
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  background: #111;
  padding: clamp(1.25rem, 3vw, 2.25rem);
}

.seed-label {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 800;
  color: #fafafa;
}

.seed-label input {
  width: min(100%, 16rem);
  border: 2px solid #333;
  border-radius: 10px;
  background: #0a0a0a;
  padding: 0.5rem 1rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 2rem;
  font-weight: 700;
  color: #00d4aa;
}

.seed-label input:focus {
  border-color: #00d4aa;
  outline: none;
}

.example dl > div {
  display: grid;
  gap: 0.35rem 1.5rem;
  border-top: 1px solid #2a2a2a;
  padding: 1rem 0;
}

@media (min-width: 768px) {
  .example dl > div {
    grid-template-columns: 17rem 1fr;
    align-items: baseline;
  }
}

.example dt {
  font-size: 1rem;
  color: #9ca3af;
}

.example dd {
  min-width: 0;
  overflow-wrap: anywhere;
  color: #d1d5db;
}

.big-mono {
  margin-right: 0.75rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: clamp(1.15rem, 2.6vw, 1.75rem);
  font-weight: 700;
  color: #fafafa;
  white-space: pre-wrap;
}

.cta {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  border-radius: 10px;
  background: #00d4aa;
  padding: 0.9rem 1.5rem;
  font-size: 1.125rem;
  font-weight: 800;
  color: #0a0a0a;
}

.cta:hover {
  background: #5eead4;
}
</style>
