<script setup lang="ts">
import config from "../../ipsumify.config";

// SEO Meta Tags
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

// Always start at top of page (client-side only)
onMounted(() => {
  if (import.meta.client) {
    nextTick(() => {
      window.scrollTo(0, 0);
    });
  }
});

const blocks = ref(3);
const copied = ref(false);
// Use a fixed initial seed to avoid hydration mismatch (server vs client)
const seed = ref(42);
const selectedTheme = ref("lorem");

const options = reactive({
  headers: false,
  codeSnippets: false,
  blockquotes: false,
  lists: false,
  links: false,
  capitalize: true,
  noWrap: false,
});

// Theme definitions
interface Theme {
  id: string;
  label: string;
  icon: string;
  paragraphs: string[];
  headings: string[];
  listItems: string[];
}

const themes: Theme[] = [
  {
    id: "lorem",
    label: "Lorem Ipsum",
    icon: "i-lucide-scroll-text",
    paragraphs: [
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
    ],
    headings: [
      "Overview",
      "Introduction",
      "Summary",
      "Details",
      "Features",
      "Usage",
      "Examples",
      "Notes",
      "Lorem Ipsum",
      "Dolor Sit Amet",
      "Getting Started",
      "Key Concepts",
      "Best Practices",
      "Common Patterns",
      "Quick Reference",
      "Consectetur Adipiscing Elit",
      "Sed Do Eiusmod Tempor",
      "Understanding the Basics",
      "Advanced Configuration Options",
      "Working with Components",
      "Implementation Guidelines",
      "Troubleshooting Common Issues",
      "Performance Optimization Tips",
    ],
    listItems: ["Item one", "Item two", "Item three"],
  },
  {
    id: "dog",
    label: "Dog-em Ipsum",
    icon: "i-lucide-dog",
    paragraphs: [
      "Canis familiaris borkus maximus, Labrador retrievus golden floofen. Corgi pembrokius welshii adorabilis, Shiba inu doge originalis. Vizsla hungaricus pointer nobilum, Weimaraner grayus ghosticus elegantum.",
      "Pomeranian spitzus flooficus, Papillon butterflii earus magnificus. Basenji barklessum africanum, Akita inuus loyalis protectum. Samoyed cloudus whiteum smilius, Malamute alaskanus pullum sledicus.",
      "Beagle snoopicus howlii detectivum, Basset houndus droopii earus longum. Dachshund wienerii tunnelus shortlegum, Bloodhound trackerii scentus supremum. Borzoi russianus speedii elegantus.",
      "Schnauzer beardicus germanium miniatus, Affenpinscher monkii terrius scruffum. Keeshond dutchii floofium grayus, Schipperke belgicus blackus smallum. Leonberger giantus goldenii gentleum.",
      "Cavalier kingus spanielii heartum, Havanese cubanensis silkii lapus. Maltese whiteus ancienti nobleum, Bichon friseum powderii puffus. Shih tzu lionus chrysanthemum flowen.",
      "Doberman pinscherii guardus athleticus, Rottweiler romanum driverii strongum. Boxer playfulis musculus goofium, German shepherdii loyalis intelligentum. Mastiff enormicus gentleum giantus.",
      "Husky sibericus blueeyes pullum, Bernese mountainus tricolorus sweetum. Newfoundland waterus rescuii giantum, Saint Bernard alpinus rescuii barrelum. Great Dane apollous tallestum dogicus.",
      "Poodle standardus curlius smarticum, Goldendoodle hybridicus floofium allergii. Labradoodle crossii friendlius serviceum, Cockapoo mixus adorablis cuddleum. Maltipoo tinicus fluffium lapsum.",
      "Bulldog englishum wrinklii stockium, Frenchie batears snortius compactum. Pug wrinklorum snorticus curlytailus, Boston terrier tuxedous gentlemanicum. Boxer wiggleum excitus playfulium.",
      "Terrier spiritus feistii braveum, Yorkshire tinicus silkii bluetan. Jack Russell energius boundlessum zoomii, Westie whiteum scottius cheerfulem. Airedale kingus terrierii largestum.",
    ],
    headings: [
      "Woof",
      "Good Boy",
      "Fetch Time",
      "Treats",
      "Walkies",
      "Zoomies",
      "Snoot Boops",
      "Belly Rubs",
      "The Pack Life",
      "Puppy Love",
      "Tail Wagging Tales",
      "Bark Park Adventures",
      "Loyal Companions",
      "Paw Patrol",
      "Furry Friends Forever",
      "The Art of the Fetch",
      "Mastering Puppy Eyes",
      "Advanced Treat Negotiations",
      "Squirrel Watching 101",
      "Nap Time Strategies",
      "The Perfect Belly Rub",
      "Mailman Alertness Training",
      "Ultimate Zoomie Techniques",
    ],
    listItems: ["Woof woof", "Bark bark", "Good boy"],
  },
  {
    id: "cat",
    label: "Cat-em Ipsum",
    icon: "i-lucide-cat",
    paragraphs: [
      "Felis catus purrensis maximus, Siamese vocalius blueeyes pointum. Abyssinian tickedus wildii ancienti, Persian flooficum flatfaceus luxurium. Maine Coon giantus gentleus tuftedum earus.",
      "Ragdoll floppicus docilum blueum, Birman sacredus burmanis mittenii. Tonkinese aquaeus mixicum sociablis, Burmese musculus sableum voicium. Balinese longhairus siamicum gracilum.",
      "Russian Blue grayus plushicum shyus, Chartreux frenchii smileum quietum. Korat silverii thailandus luckium, British Shorthair chonkus roundii calmicum. Scottish Fold earfoldus sweetium.",
      "Sphynx hairlessum warmicus wrinkleum, Peterbald elegantus russianum baldicum. Devon Rex elficus curlium pixius, Cornish Rex wavycoatum slenderum playfulem. Oriental sleekus largeearus vocalem.",
      "Bengal leopardicus wildii glitterum, Savannah tallestus africanicum servalum. Ocicat spotticum domesticus wildlookum, Egyptian Mau ancienti spottium fastestum. Toyger stripedus tigerium miniatum.",
      "Norwegian Forest flufficus vikingii waterproofum, Siberian hypoallergicus russianum forestii. Nebelung longhairum grayplushum rareum, Turkish Van swimmicus vanum patternum. Somali foxii longhairus tickedum.",
      "Himalayan persicum pointus fluffium, Exotic Shorthair teddybearum calmicus. Ragamuffin largeum sweeticus docilum, Selkirk Rex curlycoatum sheepii patientum. LaPerm curlicus wavium uniqueum.",
      "Manx taillessum islandicus roundum, Japanese Bobtail pompomii luckyus ancienti. Cymric longhairus manxicum floofem, American Bobtail wildlookum bobbium friendlius. Pixie-Bob polydactylum largeus.",
      "Singapura smallestum draincat sepiatum, Havana Brown chocolatum greeneyeum sleekus. Bombay pantherii blackus coppereyeum, Burmilla shimmeryum silverii gentleum. Chausie jungleum hybridicus athletum.",
      "Turkish Angora ancienti elegantum silkium, Javanese colorpointum longhairum vocalem. Snowshoe pointicum mittenus blueeyes, Khao Manee diamondeyeum whiteum raricum. Lykoi werewolfii partialum hairlessum.",
    ],
    headings: [
      "Meow",
      "Purr Life",
      "Nap Time",
      "Judgment",
      "Treats Now",
      "Box Fort",
      "Zoomies",
      "Worship",
      "Feline Royalty",
      "The Art of Napping",
      "Sunbeam Seeking",
      "Human Training",
      "Cardboard Castles",
      "Mysterious Ways",
      "Graceful Hunters",
      "Mastering the Slow Blink",
      "Advanced Ankle Weaving",
      "Strategic Hairball Placement",
      "Window Bird Theater",
      "Midnight Zoomie Protocol",
      "Perfecting the Judgmental Stare",
      "Keyboard Sitting Techniques",
      "The Unwritten Laws of If It Fits",
    ],
    listItems: ["Meow meow", "Purr purr", "Feed me now"],
  },
  {
    id: "baked",
    label: "Baked-em Ipsum",
    icon: "i-lucide-croissant",
    paragraphs: [
      "Brioche enrichum butteratum, pâte feuilletée laminatum croissantus. Génoise spongicum lightus, mille-feuille layerus crispatum. Baguette croustillant scoreum, pain de campagne rusticorum artisanum.",
      "Kouign-amann caramelus buttericum bretonnium, canelé bordelais crustatum custardum. Financier almondium brownbutterum, madeleine shellicus proustium. Pâte à choux profiterolum éclairum.",
      "Challah braidicum enrichum eggyatum, babka swirlius chocolatum cinnamonum. Panettone milanensis fruiticum domeus, stollen germanicum marzipanum powderus. Pandoro starshapum goldenum veronensis.",
      "Fougasse provençalum olivatum herbus, focaccia italicum dimpledus rosmarinum. Ciabatta slipperum holeum crustycrumbum, grissini stickum thinicum crispus. Pane pugliese durumwheaticum semolinum.",
      "Tarte tatin caramelum inversus appleum, galette rusticorum freeformum buttercrust. Clafoutis cherrium custardum limousinum, far breton pruneatum densium. Gâteau basque creamfilledus almondcrust.",
      "Viennoiserie butteratum laminum, pain au chocolat croissantdoughum. Chausson aux pommes appleturnoverum, palmier elephantearus sugarcrispum. Brioche feuilletée hybridium richum.",
      "Sachertorte viennensis chocolatum apricotglazeum, schwarzwälder kirschtorte cherryum creamum. Dobos torta hungaricum carameltopum layerus, esterházy walnuttum buttercreamus. Linzer torte latticum raspberryjam.",
      "Sfogliatella napoletanum shellicum ricottafillum, cassata siciliana marzipanum candiedfruitum. Cannoli tubicum crispum sweetricottum, zeppole choux friedum creamtoppum. Baba au rhum yeastcakem syrupsoakum.",
      "Crème pâtissière vanillum custardum pipeum, frangipane almondcreamum tartfillingus. Crémeux smoothum richicum glossyum, ganache chocolatum creaminfusum. Buttercream swissum italicum frenchum.",
      "Levain naturalum yeastium starterus, poolish prefermentum frenchium hydrateum. Biga italicum stiffum flavordevlopum, tangzhong asianicum waterroux softicum. Autolyse restum hydrateum glutenum.",
    ],
    headings: [
      "Fresh",
      "Golden",
      "Flaky",
      "Sweet",
      "Crusty",
      "Doughy",
      "Baked",
      "Yummy",
      "From the Oven",
      "Rise and Shine",
      "Butter Makes Better",
      "Sugar and Spice",
      "Crust Perfection",
      "The Proof is Rising",
      "Flour Power",
      "The Art of Lamination",
      "Mastering Sourdough Starters",
      "Perfect Pie Crust Techniques",
      "Croissant Folding Guide",
      "Cookie Science Explained",
      "Bread Scoring Patterns",
      "Frosting and Decorating Tips",
      "The Magic of Fermentation",
    ],
    listItems: ["Yum yum", "So tasty", "Freshly baked"],
  },
  {
    id: "bbq",
    label: "BBQ-em Ipsum",
    icon: "i-lucide-flame",
    paragraphs: [
      "Brisketum pectoralis slowcookum, puntum deckle fattium marbleum. Hickorium quercus mesquitum pecanwood, fumum aromatus carbonis ignum. Pitmasterus tendum focum, temperaturum constantus duecentum.",
      "Costae spareum backribus, sancti ludovici trimatum neaticus. Fricatum paprikum sugarbrownum, allium cuminatum piperum salum. Involvum chartapaper foilum, requiem sliceum servum.",
      "Porcus pullum shoulderum, forkum tenderum shredicus altum. Carolina acetum mustardus, Kansas Civitas dulcis crassum. Coleslavium pickledus panisalbus, proprium plateum completum.",
      "Brisketum planum puntum totum, pinguem capsum updownum debatum. Fumus annulus roseum halum, probatum technicum igneum. Sectum contra granum semper, humidus macer finibus ustum.",
      "Finibus ustum dulcis carneum, caramelum cubum iactum salsamentum. Puntum separatum cubum, revertum fumatorium horam plus. Crispum marginibus tenerum centrum, pitmasterus praemium meritum.",
      "Farciminis nexum calidus intestinum, crepitus tegumen sucus eruptum. Bubulum porcinum mixtum conditum, fumum iuxta praecipuum sectum. Obliquum servum superbus, sinapis optionalum acceptum.",
      "Pullum femur quartum totum, pellis crispum carnem sucum. Alabama salsamentum album, acetum Carolina moppum stylum. Tractum fumatum grillum optiones, gallinaceum rectum bonum.",
      "Fricatum siccum pasta humidum, pernoctem frigidarium marinatum requiem. Sal piper simplex Texanum, complexum Memphis mixtum secretum. Applicare generosum aequum tegmen, cortex formatur pulchre.",
      "Lateribus fabae coleslavium paniscornum, caseum macaroni salatum tuberosum. Pickledus cepae jalapeñus, panisalbus butyrum sectum. Completum plateum aequilibratum prandium, carneum stella lateribus sustentum.",
      "Fumus surgit caminus ascendit, linea formatur mane fidelis. Venditum signum timendum, mane avis obtinet carneum. Dignum omnis expectatio minutum, pitmasterus ars respectum.",
    ],
    headings: [
      "Smoked",
      "Low and Slow",
      "The Pit",
      "Fire",
      "Bark",
      "Rub",
      "Sauce",
      "Tender",
      "Pitmaster Wisdom",
      "Smoke Ring Secrets",
      "Brisket Basics",
      "Rib Techniques",
      "Regional Styles",
      "Wood Selection",
      "Temperature Control",
      "The Art of the Smoke",
      "Building the Perfect Fire",
      "Mastering the Meat Sweats",
      "Competition BBQ Secrets",
      "Sauce Versus Dry Rub",
      "Choosing Your Wood",
      "The Overnight Cook",
      "From Pit to Plate",
    ],
    listItems: ["Smoky goodness", "Fall off the bone", "Worth the wait"],
  },
];

// Get current theme data
const currentTheme = computed(() => {
  return themes.find((t) => t.id === selectedTheme.value) ?? themes[0]!;
});

// Theme options for select dropdown
const themeOptions = computed(() => {
  return themes.map((t) => ({
    value: t.id,
    label: t.label,
    icon: t.icon,
  }));
});

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

function handleRegenerate() {
  seed.value = Math.floor(Math.random() * 100000);
}

function handleReset() {
  // Reset all settings to defaults
  blocks.value = 3;
  seed.value = 42;
  selectedTheme.value = "lorem";
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
