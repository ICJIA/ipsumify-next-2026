<script setup lang="ts">
// SEO Meta Tags
useSeoMeta({
  title: "Ipsumify - Lorem Ipsum Generator",
  ogTitle: "Ipsumify - Lorem Ipsum Generator",
  description:
    "Generate beautiful lorem ipsum placeholder text with markdown support. Built for writers and designers who need realistic placeholder content.",
  ogDescription:
    "Generate beautiful lorem ipsum placeholder text with markdown support. Built for writers and designers who need realistic placeholder content.",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "Ipsumify - Lorem Ipsum Generator",
  twitterDescription:
    "Generate beautiful lorem ipsum placeholder text with markdown support.",
});

const blocks = ref(3);
const copied = ref(false);
// Use a fixed initial seed to avoid hydration mismatch (server vs client)
const seed = ref(42);

const options = reactive({
  headers: false,
  codeSnippets: false,
  blockquotes: false,
  lists: false,
  links: false,
  capitalize: true,
  noWrap: false,
});

const allParagraphs = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.",
  "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
  "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt.",
  "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias.",
  "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.",
  "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.",
  "Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.",
  "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.",
];

// Heading phrases for randomized headers - mix of short and longer
const headingPhrases = [
  // Short (1-2 words)
  "Overview",
  "Introduction",
  "Summary",
  "Details",
  "Features",
  "Usage",
  "Examples",
  "Notes",
  // Medium (2-3 words)
  "Lorem Ipsum",
  "Dolor Sit Amet",
  "Getting Started",
  "Key Concepts",
  "Best Practices",
  "Common Patterns",
  "Quick Reference",
  // Longer (4+ words)
  "Consectetur Adipiscing Elit",
  "Sed Do Eiusmod Tempor",
  "Understanding the Basics",
  "Advanced Configuration Options",
  "Working with Components",
  "Implementation Guidelines",
  "Troubleshooting Common Issues",
  "Performance Optimization Tips",
];

// Simple seeded random number generator
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

// Shuffle array with seed
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

const generatedText = computed(() => {
  const paragraphs = shuffleWithSeed(allParagraphs, seed.value);
  const headings = shuffleWithSeed(headingPhrases, seed.value + 500);
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
        const items = options.capitalize
          ? "• Item one • Item two • Item three"
          : "• item one • item two • item three";
        output += items + " ";
      } else {
        const items = options.capitalize
          ? "- Item one\n- Item two\n- Item three\n\n"
          : "- item one\n- item two\n- item three\n\n";
        output += items;
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

function handleRegenerate() {
  seed.value = Math.floor(Math.random() * 100000);
}

async function handleCopy() {
  await navigator.clipboard.writeText(generatedText.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}

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
        <div class="flex items-center gap-4">
          <UIcon
            name="i-lucide-code"
            class="h-14 w-14 text-[#00d4aa]"
            aria-hidden="true"
          />
          <span
            class="font-sans text-5xl font-black tracking-tight sm:text-6xl md:text-7xl"
            >Ipsumify</span
          >
        </div>
        <nav
          class="flex h-full items-center self-center"
          aria-label="Main navigation"
        >
          <a
            href="https://github.com/ICJIA/ipsumify-next-2026"
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
          <span
            class="h-1.5 w-1.5 rounded-full bg-[#00d4aa]"
            aria-hidden="true"
          />
          Markdown-ready Lorem Ipsum
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
        <span class="font-mono">v1.0.0</span>
      </div>
    </footer>
  </div>
</template>
