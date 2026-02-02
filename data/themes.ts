/**
 * Theme definitions for Ipsumify.
 *
 * Theme content only - all app config (defaults, version, etc.) lives in ipsumify.config.ts
 *
 * @module data/themes
 */

/**
 * Defines a lorem ipsum theme with its content and display metadata.
 *
 * @interface Theme
 */
export interface Theme {
  /** Unique identifier (e.g. lorem, dog, cat) */
  id: string;
  /** Display name shown in the theme selector */
  label: string;
  /** Iconify icon class (e.g. i-lucide-scroll-text) */
  icon: string;
  /** Pool of paragraph sentences for body text */
  paragraphs: string[];
  /** Pool of heading strings for markdown headers */
  headings: string[];
  /** Items for bullet/numbered lists */
  listItems: string[];
}

/**
 * All available lorem ipsum themes.
 * Each theme provides Latin-style placeholder text with a distinct vocabulary.
 *
 * @constant
 * @type {Theme[]}
 */
export const themes: Theme[] = [
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
