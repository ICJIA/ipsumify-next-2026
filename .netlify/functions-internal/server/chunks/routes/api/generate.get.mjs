import { d as defineEventHandler, s as setResponseHeader, g as getQuery, c as createError } from '../../nitro/nitro.mjs';
import { marked } from 'marked';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'vue';
import 'consola';
import '@iconify/utils';
import 'fast-xml-parser';

const themes = [
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
      "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur."
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
      "Performance Optimization Tips"
    ],
    listItems: ["Item one", "Item two", "Item three"]
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
      "Terrier spiritus feistii braveum, Yorkshire tinicus silkii bluetan. Jack Russell energius boundlessum zoomii, Westie whiteum scottius cheerfulem. Airedale kingus terrierii largestum."
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
      "Ultimate Zoomie Techniques"
    ],
    listItems: ["Woof woof", "Bark bark", "Good boy"]
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
      "Turkish Angora ancienti elegantum silkium, Javanese colorpointum longhairum vocalem. Snowshoe pointicum mittenus blueeyes, Khao Manee diamondeyeum whiteum raricum. Lykoi werewolfii partialum hairlessum."
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
      "The Unwritten Laws of If It Fits"
    ],
    listItems: ["Meow meow", "Purr purr", "Feed me now"]
  },
  {
    id: "baked",
    label: "Baked-em Ipsum",
    icon: "i-lucide-croissant",
    paragraphs: [
      "Brioche enrichum butteratum, p\xE2te feuillet\xE9e laminatum croissantus. G\xE9noise spongicum lightus, mille-feuille layerus crispatum. Baguette croustillant scoreum, pain de campagne rusticorum artisanum.",
      "Kouign-amann caramelus buttericum bretonnium, canel\xE9 bordelais crustatum custardum. Financier almondium brownbutterum, madeleine shellicus proustium. P\xE2te \xE0 choux profiterolum \xE9clairum.",
      "Challah braidicum enrichum eggyatum, babka swirlius chocolatum cinnamonum. Panettone milanensis fruiticum domeus, stollen germanicum marzipanum powderus. Pandoro starshapum goldenum veronensis.",
      "Fougasse proven\xE7alum olivatum herbus, focaccia italicum dimpledus rosmarinum. Ciabatta slipperum holeum crustycrumbum, grissini stickum thinicum crispus. Pane pugliese durumwheaticum semolinum.",
      "Tarte tatin caramelum inversus appleum, galette rusticorum freeformum buttercrust. Clafoutis cherrium custardum limousinum, far breton pruneatum densium. G\xE2teau basque creamfilledus almondcrust.",
      "Viennoiserie butteratum laminum, pain au chocolat croissantdoughum. Chausson aux pommes appleturnoverum, palmier elephantearus sugarcrispum. Brioche feuillet\xE9e hybridium richum.",
      "Sachertorte viennensis chocolatum apricotglazeum, schwarzw\xE4lder kirschtorte cherryum creamum. Dobos torta hungaricum carameltopum layerus, esterh\xE1zy walnuttum buttercreamus. Linzer torte latticum raspberryjam.",
      "Sfogliatella napoletanum shellicum ricottafillum, cassata siciliana marzipanum candiedfruitum. Cannoli tubicum crispum sweetricottum, zeppole choux friedum creamtoppum. Baba au rhum yeastcakem syrupsoakum.",
      "Cr\xE8me p\xE2tissi\xE8re vanillum custardum pipeum, frangipane almondcreamum tartfillingus. Cr\xE9meux smoothum richicum glossyum, ganache chocolatum creaminfusum. Buttercream swissum italicum frenchum.",
      "Levain naturalum yeastium starterus, poolish prefermentum frenchium hydrateum. Biga italicum stiffum flavordevlopum, tangzhong asianicum waterroux softicum. Autolyse restum hydrateum glutenum."
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
      "The Magic of Fermentation"
    ],
    listItems: ["Yum yum", "So tasty", "Freshly baked"]
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
      "Lateribus fabae coleslavium paniscornum, caseum macaroni salatum tuberosum. Pickledus cepae jalape\xF1us, panisalbus butyrum sectum. Completum plateum aequilibratum prandium, carneum stella lateribus sustentum.",
      "Fumus surgit caminus ascendit, linea formatur mane fidelis. Venditum signum timendum, mane avis obtinet carneum. Dignum omnis expectatio minutum, pitmasterus ars respectum."
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
      "From Pit to Plate"
    ],
    listItems: ["Smoky goodness", "Fall off the bone", "Worth the wait"]
  }
];

const LCPRNG_MULTIPLIER = 9301;
const LCPRNG_INCREMENT = 49297;
const LCPRNG_MODULUS = 233280;
const SEED_OFFSETS = {
  HEADINGS: 500,
  BLOCK_SIZES: 1e3
};
function seededRandom(seedValue) {
  let currentSeed = seedValue;
  return {
    next: () => {
      currentSeed = (currentSeed * LCPRNG_MULTIPLIER + LCPRNG_INCREMENT) % LCPRNG_MODULUS;
      return currentSeed / LCPRNG_MODULUS;
    },
    nextInt: (min, max) => {
      currentSeed = (currentSeed * LCPRNG_MULTIPLIER + LCPRNG_INCREMENT) % LCPRNG_MODULUS;
      return Math.floor(currentSeed / LCPRNG_MODULUS * (max - min + 1)) + min;
    }
  };
}
function shuffleWithSeed(array, seedValue) {
  const shuffled = [...array];
  const rng = seededRandom(seedValue);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
}

const DEFAULT_OPTIONS = {
  headers: false,
  codeSnippets: false,
  blockquotes: false,
  lists: false,
  links: false,
  capitalize: true,
  noWrap: false
};
function generateText(params) {
  var _a;
  const { theme, blocks, seed, options } = params;
  const paragraphs = shuffleWithSeed(theme.paragraphs, seed);
  const headings = shuffleWithSeed(theme.headings, seed + SEED_OFFSETS.HEADINGS);
  const listItems = theme.listItems;
  const rng = seededRandom(seed + SEED_OFFSETS.BLOCK_SIZES);
  const blockSeparator = options.noWrap ? " " : "\n\n";
  let output = "";
  let paragraphIndex = 0;
  let headingIndex = 0;
  let currentHeadingLevel = 1;
  let blocksUntilNextHeading = 0;
  const getNextHeading = () => {
    var _a2;
    const text = (_a2 = headings[headingIndex % headings.length]) != null ? _a2 : "Section";
    headingIndex++;
    return options.capitalize ? text : text.toLowerCase();
  };
  const makeHeading = (level, text) => {
    const hashes = "#".repeat(level);
    if (options.noWrap) {
      return `${hashes} ${text} `;
    }
    return `${hashes} ${text}

`;
  };
  for (let i = 0; i < blocks; i++) {
    const blockSize = rng.nextInt(1, 3);
    let blockContent = "";
    for (let j = 0; j < blockSize; j++) {
      const rawSentence = (_a = paragraphs[paragraphIndex % paragraphs.length]) != null ? _a : "";
      paragraphIndex++;
      const sentence = options.capitalize ? rawSentence : rawSentence.toLowerCase();
      blockContent += sentence + " ";
    }
    blockContent = blockContent.trim();
    if (options.headers) {
      if (i === 0) {
        output += makeHeading(1, getNextHeading());
        currentHeadingLevel = 2;
        blocksUntilNextHeading = rng.nextInt(1, 3);
      } else if (blocksUntilNextHeading <= 0) {
        const decision = rng.nextInt(1, 10);
        if (decision <= 3 && currentHeadingLevel < 4) {
          currentHeadingLevel++;
        } else if (decision <= 5 && currentHeadingLevel > 2) {
          currentHeadingLevel--;
        } else if (decision <= 7 && currentHeadingLevel > 2) {
          currentHeadingLevel = 2;
        }
        output += makeHeading(currentHeadingLevel, getNextHeading());
        blocksUntilNextHeading = rng.nextInt(1, 4);
      } else {
        blocksUntilNextHeading--;
      }
    }
    if (options.codeSnippets && i % 3 === 0) {
      if (options.noWrap) {
        output += "`const example = 'code';` ";
      } else {
        output += "```javascript\nconst example = 'code';\n```\n\n";
      }
    }
    if (options.blockquotes && i % 2 === 1) {
      if (options.noWrap) {
        output += `> ${blockContent.slice(0, 100)}... `;
      } else {
        output += `> ${blockContent.slice(0, 100)}...

`;
      }
    }
    if (options.lists && i % 3 === 2) {
      if (options.noWrap) {
        const items = listItems.map((item) => `\u2022 ${options.capitalize ? item : item.toLowerCase()}`).join(" ");
        output += items + " ";
      } else {
        const items = listItems.map((item) => `- ${options.capitalize ? item : item.toLowerCase()}`).join("\n");
        output += items + "\n\n";
      }
    }
    if (options.links && i % 4 === 0) {
      const linkText = options.capitalize ? "Learn more" : "learn more";
      output += `[${linkText}](https://example.com) `;
    }
    output += blockContent + blockSeparator;
  }
  if (options.noWrap) {
    output = output.replace(/<br\s*\/?>/gi, " ");
    output = output.replace(/\n+/g, " ");
    output = output.replace(/\s+/g, " ");
    output = output.trim();
  } else if (output.endsWith("\n\n")) {
    output = output.slice(0, -2);
  }
  return output;
}
function generateBlocks(params) {
  var _a;
  const { theme, blocks, seed, options } = params;
  const paragraphs = shuffleWithSeed(theme.paragraphs, seed);
  const rng = seededRandom(seed + SEED_OFFSETS.BLOCK_SIZES);
  const result = [];
  let paragraphIndex = 0;
  for (let i = 0; i < blocks; i++) {
    const blockSize = rng.nextInt(1, 3);
    let blockContent = "";
    for (let j = 0; j < blockSize; j++) {
      const rawSentence = (_a = paragraphs[paragraphIndex % paragraphs.length]) != null ? _a : "";
      paragraphIndex++;
      const sentence = options.capitalize ? rawSentence : rawSentence.toLowerCase();
      blockContent += sentence + " ";
    }
    result.push(blockContent.trim());
  }
  return result;
}

const config = {
  /** @type {string} Default theme ID for generator (e.g. lorem, dog, cat) */
  defaultThemeId: "lorem",
  /** @type {number} Default number of text blocks to generate */
  defaultBlocks: 5,
  /** @type {number} Initial seed for deterministic output (SSR-safe) */
  defaultSeed: 42
};

const VALID_THEME_IDS = new Set(themes.map((t) => t.id));
const VALID_FORMATS = /* @__PURE__ */ new Set(["markdown", "json", "text", "html"]);
const MAX_BLOCKS = 20;
const MIN_BLOCKS = 1;
const generate_get = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "public, max-age=3600");
  const query = getQuery(event);
  const themeId = query.theme || config.defaultThemeId;
  if (!VALID_THEME_IDS.has(themeId)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid theme "${themeId}". Valid themes: ${[...VALID_THEME_IDS].join(", ")}`
    });
  }
  let blocks = config.defaultBlocks;
  if (query.blocks !== void 0) {
    const parsed = Number(query.blocks);
    if (!Number.isInteger(parsed) || parsed < MIN_BLOCKS || parsed > MAX_BLOCKS) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid blocks "${query.blocks}". Must be an integer between ${MIN_BLOCKS} and ${MAX_BLOCKS}.`
      });
    }
    blocks = parsed;
  }
  let seed = config.defaultSeed;
  if (query.seed !== void 0) {
    const parsed = Number(query.seed);
    if (!Number.isInteger(parsed)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid seed "${query.seed}". Must be an integer.`
      });
    }
    seed = parsed;
  }
  const format = query.format || "markdown";
  if (!VALID_FORMATS.has(format)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid format "${format}". Valid formats: ${[...VALID_FORMATS].join(", ")}`
    });
  }
  const options = { ...DEFAULT_OPTIONS };
  if (query.md) {
    const mdParts = query.md.split(",");
    options.headers = mdParts.includes("headers");
    options.codeSnippets = mdParts.includes("code");
    options.blockquotes = mdParts.includes("quotes");
    options.lists = mdParts.includes("lists");
    options.links = mdParts.includes("links");
  }
  if (query.lower === "1") {
    options.capitalize = false;
  }
  if (query.nowrap === "1") {
    options.noWrap = true;
  }
  const theme = themes.find((t) => t.id === themeId);
  const params = { theme, blocks, seed, options };
  const markdown = generateText(params);
  if (format === "json") {
    const blockArray = generateBlocks(params);
    return {
      theme: themeId,
      blocks,
      seed,
      format,
      options,
      output: blockArray,
      markdown
    };
  }
  if (format === "html") {
    const html = await marked(markdown);
    return {
      theme: themeId,
      blocks,
      seed,
      format,
      output: html
    };
  }
  if (format === "text") {
    const text = markdown.replace(/^#{1,6}\s+/gm, "").replace(/```[\s\S]*?```/g, "").replace(/`([^`]+)`/g, "$1").replace(/^>\s+/gm, "").replace(/^[-*]\s+/gm, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\n{3,}/g, "\n\n").trim();
    return {
      theme: themeId,
      blocks,
      seed,
      format,
      output: text
    };
  }
  return {
    theme: themeId,
    blocks,
    seed,
    format,
    output: markdown
  };
});

export { generate_get as default };
//# sourceMappingURL=generate.get.mjs.map
