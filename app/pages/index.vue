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
import { generateText } from "../../utils/generate";
import { usePreferences } from "../../composables/usePreferences";
import { useKeyboardShortcuts } from "../../composables/useKeyboardShortcuts";
import { useShareUrl } from "../../composables/useShareUrl";
import { copyToClipboard } from "../../utils/clipboard";
import { marked } from "marked";

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

/** Timeout duration for copy feedback messages (ms) */
const COPY_FEEDBACK_DURATION = 2000;

/** Number of text blocks to generate (1-20) */
const blocks = ref<number>(config.defaultBlocks);
/** Whether copy-to-clipboard succeeded (shows "Copied!" feedback) */
const copied = ref(false);
/** Whether copy-to-clipboard failed (shows error feedback) */
const copyError = ref(false);
/** RNG seed - fixed initial value for SSR hydration, random on regenerate */
const seed = ref<number>(config.defaultSeed);
/** Whether keyboard shortcuts help modal is visible */
const showShortcutsHelp = ref(false);
/** Shortcut feedback message shown briefly after a shortcut fires */
const shortcutFeedback = ref("");
/** Whether share URL was copied successfully */
const shareCopied = ref(false);
/** Whether copy format menu is visible */
const showCopyMenu = ref(false);
/** Ref for copy menu container (click-outside detection) */
const copyMenuRef = ref<HTMLElement | null>(null);
/** Platform detection for keyboard shortcut display */
const isMac = computed(() => {
  if (import.meta.server) return false;
  // Prefer modern userAgentData API, fall back to userAgent string
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  if (nav.userAgentData?.platform) {
    return nav.userAgentData.platform === "macOS";
  }
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
});
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

/** Preferences management */
const { loadPreferences, savePreferences, resetPreferences, DEFAULT_PREFERENCES } = usePreferences();

/** Share URL management */
const { copyShareUrl, loadFromUrl } = useShareUrl();

/** Scroll to top on mount and load saved preferences (client-side only) */
onMounted(() => {
  if (import.meta.client) {
    window.scrollTo(0, 0);

    // First, try to load from URL parameters (takes priority)
    const urlPrefs = loadFromUrl(DEFAULT_PREFERENCES);

    // Then load from localStorage (used as fallback)
    const savedPrefs = loadPreferences();

    // Apply preferences (URL params override localStorage)
    selectedTheme.value = urlPrefs.theme ?? savedPrefs.theme;
    blocks.value = urlPrefs.blocks ?? savedPrefs.blocks;
    Object.assign(options, savedPrefs.options, urlPrefs.options ?? {});
  }
});

/** Auto-save preferences when they change (watcher registered synchronously for proper cleanup) */
if (import.meta.client) {
  watch(
    [selectedTheme, blocks, () => options],
    () => {
      savePreferences({
        theme: selectedTheme.value,
        blocks: blocks.value,
        options: { ...options },
      });
    },
    { deep: true }
  );
}

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

/** Generated lorem ipsum text with optional markdown */
const generatedText = computed(() => {
  return generateText({
    theme: currentTheme.value,
    blocks: blocks.value,
    seed: seed.value,
    options: { ...options },
  });
});

/** Picks a new random seed to regenerate output with different content */
function handleRegenerate() {
  seed.value = Math.floor(Math.random() * 100000);
}

/** Resets all options and state to ipsumify.config defaults, scrolls to top */
function handleReset() {
  blocks.value = config.defaultBlocks;
  seed.value = config.defaultSeed;
  selectedTheme.value = config.defaultThemeId;
  Object.assign(options, DEFAULT_PREFERENCES.options);
  resetPreferences();

  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/** Copies generated text to clipboard and shows "Copied!" for 2s */
async function handleCopy(format: 'markdown' | 'html' = 'markdown') {
  try {
    let textToCopy = generatedText.value;

    if (format === 'html') {
      textToCopy = await marked(generatedText.value);
    }

    await copyToClipboard(textToCopy);
    copied.value = true;
    copyError.value = false;

    setTimeout(() => {
      copied.value = false;
    }, COPY_FEEDBACK_DURATION);
  } catch (error) {
    console.error("Failed to copy text:", error);
    copyError.value = true;
    setTimeout(() => {
      copyError.value = false;
    }, COPY_FEEDBACK_DURATION);
  }
}

/** Downloads generated text as output.md file */
function handleDownload() {
  const blob = new Blob([generatedText.value], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "output.md";
  document.body.appendChild(a);
  try {
    a.click();
  } finally {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

/** Copies in the given format and closes the menu */
async function handleCopyAndClose(format: 'markdown' | 'html') {
  showCopyMenu.value = false;
  await handleCopy(format);
}

/** Close copy menu on outside click */
function handleClickOutside(event: MouseEvent) {
  if (copyMenuRef.value && !copyMenuRef.value.contains(event.target as Node)) {
    showCopyMenu.value = false;
  }
}

onMounted(() => {
  if (import.meta.client) {
    document.addEventListener("click", handleClickOutside);
  }
});

onUnmounted(() => {
  if (import.meta.client) {
    document.removeEventListener("click", handleClickOutside);
  }
});

/** Copies shareable URL with current settings to clipboard */
async function handleShareUrl() {
  try {
    await copyShareUrl({
      theme: selectedTheme.value,
      blocks: blocks.value,
      options: { ...options },
    });
    shareCopied.value = true;
    setTimeout(() => {
      shareCopied.value = false;
    }, COPY_FEEDBACK_DURATION);
  } catch (error) {
    console.error("Failed to copy share URL:", error);
  }
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

/** Show a brief feedback message when a keyboard shortcut fires */
let shortcutFeedbackTimer: ReturnType<typeof setTimeout> | null = null;
function showShortcutFeedback(message: string) {
  if (shortcutFeedbackTimer) clearTimeout(shortcutFeedbackTimer);
  shortcutFeedback.value = message;
  shortcutFeedbackTimer = setTimeout(() => {
    shortcutFeedback.value = "";
  }, COPY_FEEDBACK_DURATION);
}

/** Keyboard shortcuts for common actions (Alt+Shift to avoid browser conflicts) */
useKeyboardShortcuts([
  {
    key: "r",
    altShift: true,
    handler: () => {
      handleRegenerate();
      showShortcutFeedback("Text regenerated");
    },
    description: "Regenerate text",
  },
  {
    key: "c",
    altShift: true,
    handler: () => {
      handleCopy();
      showShortcutFeedback("Copied to clipboard");
    },
    description: "Copy to clipboard",
  },
  {
    key: "d",
    altShift: true,
    handler: () => {
      handleDownload();
      showShortcutFeedback("Downloaded as file");
    },
    description: "Download as file",
  },
  {
    key: "?",
    handler: () => {
      showShortcutsHelp.value = !showShortcutsHelp.value;
    },
    description: "Toggle keyboard shortcuts help",
  },
]);
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

    <!-- Keyboard Shortcut Feedback -->
    <Transition name="fade">
      <div
        v-if="shortcutFeedback"
        class="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-lg border border-[#333] bg-[#1a1a1a] px-4 py-2 text-sm text-[#00d4aa] shadow-lg"
        role="status"
        aria-live="polite"
      >
        {{ shortcutFeedback }}
      </div>
    </Transition>

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
              <ClientOnly>
                <USelect
                  v-model="selectedTheme"
                  :items="themeOptions"
                  value-key="value"
                  class="w-full"
                  size="md"
                  color="primary"
                  aria-labelledby="theme-label"
                />
                <template #fallback>
                  <select
                    v-model="selectedTheme"
                    class="w-full rounded border border-[#333] bg-[#1a1a1a] px-3 py-2 text-[#d1d5db]"
                    aria-labelledby="theme-label"
                  >
                    <option v-for="option in themeOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                </template>
              </ClientOnly>
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

            <!-- Action Buttons -->
            <div class="space-y-2 pt-4">
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
              <UButton
                block
                variant="outline"
                :icon="shareCopied ? 'i-lucide-check' : 'i-lucide-share-2'"
                :aria-label="shareCopied ? 'Share URL copied!' : 'Copy shareable URL with current settings'"
                @click="handleShareUrl"
              >
                <span :class="shareCopied ? 'text-[#00d4aa]' : ''">
                  {{ shareCopied ? "URL Copied!" : "Share Settings" }}
                </span>
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
            <div ref="copyMenuRef" class="relative">
              <UButton
                variant="ghost"
                size="sm"
                :icon="copied ? 'i-lucide-check' : copyError ? 'i-lucide-x' : 'i-lucide-copy'"
                trailing-icon="i-lucide-chevron-down"
                class="gap-2 text-[#d1d5db] hover:bg-[#1a1a1a] hover:text-[#fafafa]"
                :aria-label="
                  copied ? 'Text copied to clipboard' : copyError ? 'Failed to copy' : 'Copy text to clipboard'
                "
                @click="showCopyMenu = !showCopyMenu"
              >
                <span :class="copied ? 'text-[#00d4aa]' : copyError ? 'text-red-400' : ''">
                  {{ copied ? "Copied!" : copyError ? "Failed" : "Copy" }}
                </span>
              </UButton>
              <div
                v-show="showCopyMenu"
                class="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-[#333] bg-[#1a1a1a] py-1 shadow-xl"
              >
                <button
                  class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#d1d5db] hover:bg-[#333] hover:text-[#fafafa]"
                  @click="handleCopyAndClose('markdown')"
                >
                  <UIcon name="i-lucide-file-text" class="h-4 w-4" aria-hidden="true" />
                  Copy as Markdown
                </button>
                <button
                  class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#d1d5db] hover:bg-[#333] hover:text-[#fafafa]"
                  @click="handleCopyAndClose('html')"
                >
                  <UIcon name="i-lucide-code" class="h-4 w-4" aria-hidden="true" />
                  Copy as HTML
                </button>
              </div>
            </div>
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
        <div class="flex items-center gap-4">
          <button
            class="flex items-center gap-1 text-[#00d4aa] hover:underline"
            @click="showShortcutsHelp = true"
          >
            <UIcon name="i-lucide-keyboard" class="h-3 w-3" />
            Keyboard Shortcuts
          </button>
        </div>
        <span class="font-mono">v{{ config.version }}</span>
      </div>
    </footer>

    <!-- Keyboard Shortcuts Help Modal -->
    <ClientOnly>
      <UModal v-model:open="showShortcutsHelp" title="Keyboard Shortcuts">
        <template #body>
          <div class="space-y-3">
            <div class="flex items-center justify-between py-2">
              <span class="text-[#d1d5db]">Regenerate text</span>
              <div class="flex items-center gap-1">
                <kbd class="rounded border border-[#333] bg-[#1a1a1a] px-2.5 py-1.5 font-mono text-sm text-[#00d4aa]">{{ isMac ? "Option" : "Alt" }}</kbd>
                <span class="text-[#555]">+</span>
                <kbd class="rounded border border-[#333] bg-[#1a1a1a] px-2.5 py-1.5 font-mono text-sm text-[#00d4aa]">Shift</kbd>
                <span class="text-[#555]">+</span>
                <kbd class="rounded border border-[#333] bg-[#1a1a1a] px-2.5 py-1.5 font-mono text-sm text-[#00d4aa]">R</kbd>
              </div>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-[#d1d5db]">Copy to clipboard</span>
              <div class="flex items-center gap-1">
                <kbd class="rounded border border-[#333] bg-[#1a1a1a] px-2.5 py-1.5 font-mono text-sm text-[#00d4aa]">{{ isMac ? "Option" : "Alt" }}</kbd>
                <span class="text-[#555]">+</span>
                <kbd class="rounded border border-[#333] bg-[#1a1a1a] px-2.5 py-1.5 font-mono text-sm text-[#00d4aa]">Shift</kbd>
                <span class="text-[#555]">+</span>
                <kbd class="rounded border border-[#333] bg-[#1a1a1a] px-2.5 py-1.5 font-mono text-sm text-[#00d4aa]">C</kbd>
              </div>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-[#d1d5db]">Download file</span>
              <div class="flex items-center gap-1">
                <kbd class="rounded border border-[#333] bg-[#1a1a1a] px-2.5 py-1.5 font-mono text-sm text-[#00d4aa]">{{ isMac ? "Option" : "Alt" }}</kbd>
                <span class="text-[#555]">+</span>
                <kbd class="rounded border border-[#333] bg-[#1a1a1a] px-2.5 py-1.5 font-mono text-sm text-[#00d4aa]">Shift</kbd>
                <span class="text-[#555]">+</span>
                <kbd class="rounded border border-[#333] bg-[#1a1a1a] px-2.5 py-1.5 font-mono text-sm text-[#00d4aa]">D</kbd>
              </div>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-[#d1d5db]">Toggle this help</span>
              <kbd class="rounded border border-[#333] bg-[#1a1a1a] px-2.5 py-1.5 font-mono text-sm text-[#00d4aa]">?</kbd>
            </div>
          </div>
        </template>
      </UModal>
    </ClientOnly>
  </div>
</template>
