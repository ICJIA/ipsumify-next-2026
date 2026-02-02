<script setup lang="ts">
/**
 * Ipsumify main page - lorem ipsum generator with markdown support.
 *
 * Provides theme selection, block count, markdown element toggles,
 * and copy/download actions. Uses seeded RNG for deterministic,
 * SSR-safe output.
 */
import config from "../../ipsumify.config";
import { themes } from "../../data/themes";

/** SEO meta tags from ipsumify.config */
useSeoMeta({
  title: config.title,
  description: config.description,
  ogType: "website",
  ogTitle: config.title,
  ogDescription: config.description,
  ogUrl: config.url,
  ogSiteName: config.name,
  ogLocale: config.locale,
  ogImage: config.ogImageUrl,
  ogImageWidth: config.ogImageWidth,
  ogImageHeight: config.ogImageHeight,
  ogImageAlt: config.ogImageAlt,
  ogImageType: "image/png",
  twitterCard: "summary_large_image",
  twitterTitle: config.title,
  twitterDescription: config.shortDescription,
  twitterImage: config.ogImageUrl,
  twitterImageAlt: config.ogImageAlt,
  author: config.author,
  colorScheme: "dark",
  themeColor: config.primaryColor,
});

/** Scroll to top on mount (client-side only, avoids hydration issues) */
onMounted(() => {
  if (import.meta.client) {
    nextTick(() => {
      window.scrollTo(0, 0);
    });
  }
});

/** Number of text blocks to generate (1-20) */
const blocks = ref<number>(config.defaultBlocks);
/** Whether copy-to-clipboard succeeded (shows "Copied!" feedback) */
const copied = ref(false);
/** RNG seed - fixed initial value for SSR hydration, random on regenerate */
const seed = ref<number>(config.defaultSeed);
/** Selected theme ID (e.g. lorem, dog, cat) */
const selectedTheme = ref<string>(config.defaultThemeId);

/**
 * Generator options: markdown elements and formatting.
 * @property {boolean} headers - Include H1-H4 markdown headers
 * @property {boolean} codeSnippets - Include code block snippets
 * @property {boolean} blockquotes - Include blockquote excerpts
 * @property {boolean} lists - Include bullet lists
 * @property {boolean} links - Include markdown links
 * @property {boolean} capitalize - Capitalize sentence starts
 * @property {boolean} noWrap - Single line (no newlines) for copy-paste
 */
const options = reactive({
  headers: false,
  codeSnippets: false,
  blockquotes: false,
  lists: false,
  links: false,
  capitalize: true,
  noWrap: false,
});

/** Resolved theme object for the selected theme ID */
const currentTheme = computed(() => {
  return themes.find((t) => t.id === selectedTheme.value) ?? themes[0]!;
});

/** Theme options formatted for USelect dropdown */
const themeOptions = computed(() => {
  return themes.map((t) => ({
    value: t.id,
    label: t.label,
    icon: t.icon,
  }));
});

/**
 * Creates a seeded random number generator (LCPRNG).
 * Deterministic output for same seed - enables SSR-safe generation.
 *
 * @param seedValue - Initial seed
 * @returns Object with next() (0-1 float) and nextInt(min, max) (inclusive)
 */
function seededRandom(seedValue: number): {
  next: () => number;
  nextInt: (min: number, max: number) => number;
} {
  let currentSeed = seedValue;
  return {
    next: () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    },
    nextInt: (min: number, max: number) => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return Math.floor((currentSeed / 233280) * (max - min + 1)) + min;
    },
  };
}

/**
 * Shuffles an array deterministically using a seed.
 * Fisher-Yates with seeded RNG - same seed produces same order.
 *
 * @param array - Strings to shuffle (not mutated)
 * @param seedValue - Seed for reproducible shuffle
 * @returns New shuffled array
 */
function shuffleWithSeed(array: string[], seedValue: number): string[] {
  const shuffled = [...array];
  const rng = seededRandom(seedValue);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    const temp = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp;
  }
  return shuffled;
}

/** Generated lorem ipsum text with optional markdown (headers, code, blockquotes, lists, links) */
const generatedText = computed(() => {
  const theme = currentTheme.value;
  const paragraphs = shuffleWithSeed(theme.paragraphs, seed.value);
  const headings = shuffleWithSeed(theme.headings, seed.value + 500);
  const listItems = theme.listItems;
  const rng = seededRandom(seed.value + 1000); // Different seed for block sizes
  const blockSeparator = options.noWrap ? " " : "\n\n";
  let output = "";
  let paragraphIndex = 0;
  let headingIndex = 0;
  let currentHeadingLevel = 1; // Start at H1
  let blocksUntilNextHeading = 0; // Counter for skipping blocks

  // Helper to get next heading text
  const getNextHeading = (): string => {
    const text = headings[headingIndex % headings.length] ?? "Section";
    headingIndex++;
    return options.capitalize ? text : text.toLowerCase();
  };

  // Helper to generate heading markdown
  const makeHeading = (level: number, text: string) => {
    const hashes = "#".repeat(level);
    if (options.noWrap) {
      return `${hashes} ${text} `;
    }
    return `${hashes} ${text}\n\n`;
  };

  for (let i = 0; i < blocks.value; i++) {
    // Random block size: 1-3 sentences
    const blockSize = rng.nextInt(1, 3);
    let blockContent = "";

    for (let j = 0; j < blockSize; j++) {
      const rawSentence = paragraphs[paragraphIndex % paragraphs.length] ?? "";
      paragraphIndex++;

      // Apply capitalize option
      const sentence = options.capitalize
        ? rawSentence
        : rawSentence.toLowerCase();

      blockContent += sentence + " ";
    }

    blockContent = blockContent.trim();

    // Header logic with hierarchy
    if (options.headers) {
      if (i === 0) {
        // Always start with H1
        output += makeHeading(1, getNextHeading());
        currentHeadingLevel = 2;
        blocksUntilNextHeading = rng.nextInt(1, 3); // Skip 1-3 blocks before next heading
      } else if (blocksUntilNextHeading <= 0) {
        // Time for a new heading
        // Randomly decide: go deeper, stay same, or go up
        const decision = rng.nextInt(1, 10);
        if (decision <= 3 && currentHeadingLevel < 4) {
          // 30% chance: go deeper (max H4)
          currentHeadingLevel++;
        } else if (decision <= 5 && currentHeadingLevel > 2) {
          // 20% chance: go up one level (min H2)
          currentHeadingLevel--;
        } else if (decision <= 7 && currentHeadingLevel > 2) {
          // 20% chance: reset to H2
          currentHeadingLevel = 2;
        }
        // 30% chance: stay at same level

        output += makeHeading(currentHeadingLevel, getNextHeading());
        blocksUntilNextHeading = rng.nextInt(1, 4); // Skip 1-4 blocks before next heading
      } else {
        blocksUntilNextHeading--;
      }
    }

    if (options.codeSnippets && i % 3 === 0) {
      if (options.noWrap) {
        output += `\`const example = 'code';\` `;
      } else {
        output += "```javascript\nconst example = 'code';\n```\n\n";
      }
    }
    if (options.blockquotes && i % 2 === 1) {
      if (options.noWrap) {
        output += `> ${blockContent.slice(0, 100)}... `;
      } else {
        output += `> ${blockContent.slice(0, 100)}...\n\n`;
      }
    }
    if (options.lists && i % 3 === 2) {
      if (options.noWrap) {
        const items = listItems
          .map((item) => `• ${options.capitalize ? item : item.toLowerCase()}`)
          .join(" ");
        output += items + " ";
      } else {
        const items = listItems
          .map((item) => `- ${options.capitalize ? item : item.toLowerCase()}`)
          .join("\n");
        output += items + "\n\n";
      }
    }
    if (options.links && i % 4 === 0) {
      const linkText = options.capitalize ? "Learn more" : "learn more";
      output += `[${linkText}](https://example.com) `;
    }
    output += blockContent + blockSeparator;
  }

  // Remove trailing separator and clean up for noWrap mode
  if (options.noWrap) {
    // Remove any <br> tags that might have been introduced
    output = output.replace(/<br\s*\/?>/gi, " ");
    // Replace any remaining newlines with spaces
    output = output.replace(/\n+/g, " ");
    // Collapse multiple spaces into one
    output = output.replace(/\s+/g, " ");
    output = output.trim();
  } else if (output.endsWith("\n\n")) {
    output = output.slice(0, -2);
  }

  return output;
});

/** Picks a new random seed to regenerate output with different content */
function handleRegenerate() {
  seed.value = Math.floor(Math.random() * 100000);
}

/** Resets all options and state to ipsumify.config defaults, scrolls to top */
function handleReset() {
  // Reset all settings to defaults (from ipsumify.config)
  blocks.value = config.defaultBlocks;
  seed.value = config.defaultSeed;
  selectedTheme.value = config.defaultThemeId;
  options.headers = false;
  options.codeSnippets = false;
  options.blockquotes = false;
  options.lists = false;
  options.links = false;
  options.capitalize = true;
  options.noWrap = false;

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/** Copies generated text to clipboard and shows "Copied!" for 2s */
async function handleCopy() {
  await navigator.clipboard.writeText(generatedText.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}

/** Downloads generated text as output.md file */
function handleDownload() {
  const blob = new Blob([generatedText.value], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "output.md";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Markdown element toggles for the Options panel.
 * Each item maps to a key in options and provides icon/label for the UI.
 */
const markdownOptions = [
  { key: "headers", icon: "i-lucide-heading", label: "Headers" },
  { key: "codeSnippets", icon: "i-lucide-code", label: "Code snippets" },
  { key: "blockquotes", icon: "i-lucide-quote", label: "Blockquotes" },
  { key: "lists", icon: "i-lucide-list", label: "Lists" },
  { key: "links", icon: "i-lucide-link", label: "External links" },
];
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a] text-[#fafafa]">
    <!-- Skip Link for Accessibility -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-[#00d4aa] focus:px-4 focus:py-2 focus:text-[#0a0a0a] focus:outline-none"
    >
      Skip to main content
    </a>

    <!-- Header -->
    <header class="border-b border-[#1a1a1a] px-6 py-6">
      <div class="mx-auto flex max-w-6xl items-center justify-between">
        <button
          class="flex cursor-pointer items-center gap-4 transition-opacity hover:opacity-80"
          aria-label="Reset to defaults and scroll to top"
          @click="handleReset"
        >
          <UIcon
            name="i-lucide-code"
            class="h-14 w-14 text-[#00d4aa]"
            aria-hidden="true"
          />
          <span
            class="font-sans text-5xl font-black tracking-tight sm:text-6xl md:text-7xl"
            >Ipsumify</span
          >
        </button>
        <nav
          class="flex h-full items-center self-center"
          aria-label="Main navigation"
        >
          <a
            :href="config.github"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 text-sm text-[#d1d5db] transition-colors hover:text-[#fafafa]"
          >
            <UIcon
              name="i-simple-icons-github"
              class="h-5 w-5"
              aria-hidden="true"
            />
            <span>GitHub</span>
          </a>
        </nav>
      </div>
    </header>

    <main id="main-content" class="mx-auto max-w-6xl px-6 py-12">
      <!-- Hero -->
      <div class="mb-16 text-center md:mb-20">
        <div
          class="mb-4 inline-flex items-center gap-2 rounded-full border border-[#1a1a1a] bg-[#111] px-4 py-1.5 text-xs text-[#00d4aa]"
        >
          <UIcon
            :name="currentTheme.icon"
            class="h-3.5 w-3.5"
            aria-hidden="true"
          />
          Markdown-ready {{ currentTheme.label }}
        </div>
        <h1
          class="mb-4 font-sans text-4xl font-black tracking-tight md:text-5xl"
        >
          Easily create placeholder text
        </h1>
        <p class="mx-auto max-w-xl text-[#d1d5db]">
          The friendliest lorem ipsum generator around. Perfect for designers,
          writers, and anyone who needs placeholder text.
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-[320px_1fr]">
        <!-- Options Panel -->
        <div class="rounded-lg border border-[#1a1a1a] bg-[#111] p-6">
          <h2
            class="mb-6 flex items-center gap-2 font-mono text-sm font-medium uppercase tracking-wider text-[#d1d5db]"
          >
            <UIcon
              name="i-lucide-chevron-down"
              class="h-4 w-4"
              aria-hidden="true"
            />
            Options
          </h2>

          <div class="space-y-6">
            <!-- Theme Selector -->
            <div>
              <label
                id="theme-label"
                class="mb-3 flex items-center gap-2 text-sm text-[#d1d5db]"
              >
                <UIcon
                  :name="currentTheme.icon"
                  class="h-4 w-4 text-[#00d4aa]"
                  aria-hidden="true"
                />
                <span>Theme</span>
              </label>
              <USelect
                v-model="selectedTheme"
                :items="themeOptions"
                value-key="value"
                class="w-full"
                size="md"
                color="primary"
                aria-labelledby="theme-label"
              />
            </div>

            <!-- Blocks Slider -->
            <div>
              <label
                id="blocks-label"
                class="mb-3 flex items-center justify-between text-sm text-[#d1d5db]"
              >
                <span>Number of blocks</span>
                <span class="font-mono text-[#00d4aa]">{{ blocks }}</span>
              </label>
              <USlider
                v-model="blocks"
                :min="1"
                :max="20"
                :step="1"
                color="primary"
                size="md"
                name="blocks"
              />
            </div>

            <!-- Markdown Elements -->
            <div class="space-y-4">
              <h3
                class="text-xs font-medium uppercase tracking-wider text-[#9ca3af]"
              >
                Markdown Elements
              </h3>

              <div
                v-for="opt in markdownOptions"
                :key="opt.key"
                class="flex items-center justify-between"
              >
                <div class="flex items-center gap-3">
                  <UIcon
                    :name="opt.icon"
                    class="h-4 w-4 text-[#9ca3af]"
                    aria-hidden="true"
                  />
                  <span class="text-sm text-[#d1d5db]">{{ opt.label }}</span>
                </div>
                <USwitch
                  v-model="options[opt.key as keyof typeof options]"
                  color="primary"
                  size="md"
                  :aria-label="opt.label"
                />
              </div>
            </div>

            <!-- Formatting -->
            <div class="space-y-4 border-t border-[#1a1a1a] pt-4">
              <h3
                class="text-xs font-medium uppercase tracking-wider text-[#9ca3af]"
              >
                Formatting
              </h3>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <UIcon
                    name="i-lucide-hash"
                    class="h-4 w-4 text-[#9ca3af]"
                    aria-hidden="true"
                  />
                  <span class="text-sm text-[#d1d5db]"
                    >Capitalize sentences</span
                  >
                </div>
                <USwitch
                  v-model="options.capitalize"
                  color="primary"
                  size="md"
                  aria-label="Capitalize sentences"
                />
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <UIcon
                    name="i-lucide-wrap-text"
                    class="h-4 w-4 text-[#9ca3af]"
                    aria-hidden="true"
                  />
                  <span class="text-sm text-[#d1d5db]">No wrap</span>
                </div>
                <USwitch
                  v-model="options.noWrap"
                  color="primary"
                  size="md"
                  aria-label="No wrap - combine all blocks into continuous text"
                />
              </div>
            </div>

            <!-- Regenerate Button -->
            <div class="pt-4">
              <UButton
                block
                color="primary"
                variant="soft"
                icon="i-lucide-refresh-cw"
                aria-label="Regenerate lorem ipsum text"
                @click="handleRegenerate"
              >
                Regenerate
              </UButton>
            </div>
          </div>
        </div>

        <!-- Output Panel -->
        <div
          class="flex flex-col rounded-lg border border-[#2a2a2a] bg-[#161616]"
        >
          <div
            class="flex items-center justify-between border-b border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3"
          >
            <button
              class="flex items-center gap-2 transition-colors hover:text-[#00d4aa]"
              aria-label="Download output.md file"
              @click="handleDownload"
            >
              <UIcon
                name="i-lucide-file-text"
                class="h-4 w-4 text-[#9ca3af]"
                aria-hidden="true"
              />
              <span
                class="font-mono text-sm text-[#d1d5db] hover:text-[#00d4aa]"
                >output.md</span
              >
              <UIcon
                name="i-lucide-download"
                class="h-3 w-3 text-[#9ca3af]"
                aria-hidden="true"
              />
            </button>
            <UButton
              variant="ghost"
              size="sm"
              :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
              class="gap-2 text-[#d1d5db] hover:bg-[#1a1a1a] hover:text-[#fafafa]"
              :aria-label="
                copied ? 'Text copied to clipboard' : 'Copy text to clipboard'
              "
              @click="handleCopy"
            >
              <span :class="copied ? 'text-[#00d4aa]' : ''">
                {{ copied ? "Copied!" : "Copy" }}
              </span>
            </UButton>
          </div>
          <div
            class="flex-1 overflow-auto p-4"
            role="region"
            aria-label="Generated lorem ipsum text"
          >
            <pre
              class="whitespace-pre-wrap font-mono text-sm leading-relaxed text-[#d1d5db]"
              aria-live="polite"
              >{{ generatedText }}</pre
            >
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-[#1a1a1a] px-6 py-6">
      <div
        class="mx-auto flex max-w-6xl items-center justify-between text-xs text-[#9ca3af]"
      >
        <span>Built for Writers and Designers</span>
        <span class="font-mono">v{{ config.version }}</span>
      </div>
    </footer>
  </div>
</template>
