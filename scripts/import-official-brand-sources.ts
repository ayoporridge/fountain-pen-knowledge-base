import fs from "node:fs";
import path from "node:path";
import { createClient, type Client, type InArgs } from "@libsql/client";

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");
const WRITE = process.argv.includes("--write");
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith("--limit="));

type OfficialBrandSource = {
  slug: string;
  referenceRelationType?:
    | "reference"
    | "review"
    | "history"
    | "repair"
    | "official"
    | "community";
  source: {
    id: string;
    name: string;
    sourceType?:
      | "official"
      | "wikimedia"
      | "book"
      | "patent"
      | "blog"
      | "forum"
      | "reddit"
      | "retailer"
      | "user_submission";
    reliability?:
      | "high_for_basic_facts"
      | "high_for_model_history"
      | "official_marketing"
      | "community_opinion"
      | "bibliographic"
      | "technical_primary"
      | "medium"
      | "unknown";
    attribution: string;
    homepageUrl: string;
    notes: string;
  };
  item: {
    id: string;
    title: string;
    url: string;
    itemType: string;
    summary: string;
  };
  claim?: {
    id: string;
    predicate?: string;
    text: string;
    evidenceLocator?: string;
    confidence?: number;
  };
  timeline?: {
    id: string;
    title: string;
    eventType?:
      | "brand_founded"
      | "model_released"
      | "patent_filed"
      | "acquisition"
      | "discontinued"
      | "revival"
      | "design_milestone"
      | "community_event";
    startDate: string;
    description: string;
    circa?: boolean;
  };
};

const OFFICIAL_BRAND_SOURCES: OfficialBrandSource[] = [
  {
    slug: "sailor",
    source: {
      id: "sailor-official",
      name: "Sailor official site",
      attribution: "The Sailor Pen Co., Ltd.",
      homepageUrl: "https://en.sailor.co.jp/",
      notes: "Use for official company history and product-line facts; summarize rather than copy.",
    },
    item: {
      id: "source-sailor-official-history",
      title: "Sailor: Our History",
      url: "https://en.sailor.co.jp/company/our-history/",
      itemType: "official_history",
      summary:
        "Official Sailor history page used as the first source for the brand founding timeline and early gold-nib manufacturing context.",
    },
    claim: {
      id: "claim-sailor-official-history-anchor",
      text:
        "Sailor official history presents 1911 as the founding year of Sakata-Manufactory, an early Sailor predecessor focused on solid gold nibs.",
      evidenceLocator: "Our History / 1911",
      confidence: 0.82,
    },
    timeline: {
      id: "event-sailor-1911-foundation",
      title: "Sakata-Manufactory founded",
      startDate: "1911",
      description:
        "Official Sailor history uses 1911 and Sakata-Manufactory as the starting point for the brand's early nib-making story.",
    },
  },
  {
    slug: "schneider",
    source: {
      id: "schneider-official",
      name: "Schneider official site",
      attribution: "Schneider Schreibgeräte GmbH",
      homepageUrl: "https://schneiderpen.com/",
      notes: "Use for official company timeline and product-development facts; summarize rather than copy.",
    },
    item: {
      id: "source-schneider-official-history",
      title: "Schneider: History of our company",
      url: "https://schneiderpen.com/uk/company/who-we-are/history",
      itemType: "official_history",
      summary:
        "Official Schneider company history page used for founding, refill, and writing-instrument manufacturing milestones.",
    },
    claim: {
      id: "claim-schneider-official-history-anchor",
      text:
        "Schneider official history presents September 1938 as the founding moment of Blum & Schneider OHG, the company's predecessor.",
      evidenceLocator: "History / 1938",
      confidence: 0.82,
    },
    timeline: {
      id: "event-schneider-1938-foundation",
      title: "Blum & Schneider OHG founded",
      startDate: "1938-09",
      description:
        "Official Schneider history identifies September 1938 as the start of Blum & Schneider OHG.",
    },
  },
  {
    slug: "visconti",
    source: {
      id: "visconti-official",
      name: "Visconti official site",
      attribution: "Visconti",
      homepageUrl: "https://www.visconti.it/en/",
      notes: "Use for official brand positioning and modern company history; summarize rather than copy.",
    },
    item: {
      id: "source-visconti-official-history",
      title: "Visconti: History",
      url: "https://www.visconti.it/en/history/",
      itemType: "official_history",
      summary:
        "Official Visconti history page used as a source for the brand's modern luxury-positioning and post-1980s origin.",
    },
    claim: {
      id: "claim-visconti-official-history-anchor",
      text:
        "Visconti official history positions the brand's luxury writing-instrument story as beginning in 1988.",
      evidenceLocator: "History / since 1988",
      confidence: 0.76,
    },
    timeline: {
      id: "event-visconti-1988-origin",
      title: "Visconti modern brand origin",
      startDate: "1988",
      description:
        "Official Visconti material frames 1988 as the starting point for its modern luxury writing-instrument story.",
    },
  },
  {
    slug: "cross",
    source: {
      id: "cross-official",
      name: "A.T. Cross official site",
      attribution: "A.T. Cross",
      homepageUrl: "https://www.cross.com/",
      notes: "Use for official brand history and corporate positioning; summarize rather than copy.",
    },
    item: {
      id: "source-cross-official-about",
      title: "A.T. Cross: About Cross",
      url: "https://www.cross.com/pages/about-cross",
      itemType: "official_history",
      summary:
        "Official Cross about page used for the 1846 Providence origin and long-running fine-writing-instrument positioning.",
    },
    claim: {
      id: "claim-cross-official-history-anchor",
      text:
        "A.T. Cross official material presents 1846 in Providence, Rhode Island as the company's origin.",
      evidenceLocator: "About Cross / 1846",
      confidence: 0.82,
    },
    timeline: {
      id: "event-cross-1846-foundation",
      title: "A.T. Cross founded in Providence",
      startDate: "1846",
      description:
        "Official Cross material uses 1846 and Providence, Rhode Island as the brand's founding origin.",
    },
  },
  {
    slug: "aurora",
    source: {
      id: "aurora-official",
      name: "Aurora official site",
      attribution: "Aurora Pen",
      homepageUrl: "https://aurorapen.it/",
      notes: "Use for official Made in Italy positioning and company-origin facts; summarize rather than copy.",
    },
    item: {
      id: "source-aurora-official-home",
      title: "Aurora Pen official site",
      url: "https://aurorapen.it/",
      itemType: "official_brand_site",
      summary:
        "Official Aurora site used as the first source for the Turin/1919 brand origin and Made in Italy positioning.",
    },
    claim: {
      id: "claim-aurora-official-history-anchor",
      text:
        "Aurora official material presents 1919 in Turin as the brand's origin.",
      evidenceLocator: "Homepage / Dal 1919",
      confidence: 0.76,
    },
    timeline: {
      id: "event-aurora-1919-origin",
      title: "Aurora founded in Turin",
      startDate: "1919",
      description:
        "Official Aurora material uses 1919 and Turin as the origin point for the brand story.",
    },
  },
  {
    slug: "platinum",
    source: {
      id: "platinum-official",
      name: "Platinum official site",
      attribution: "Platinum Pen Co., Ltd.",
      homepageUrl: "https://www.platinum-pen.co.jp/en/",
      notes: "Use for official company background and product facts; summarize rather than copy.",
    },
    item: {
      id: "source-platinum-official-company",
      title: "Platinum Pen: Company",
      url: "https://www.platinum-pen.co.jp/en/company/",
      itemType: "official_company",
      summary:
        "Official Platinum company page registered as the starting source for later company-history expansion.",
    },
  },
  {
    slug: "kaweco",
    source: {
      id: "kaweco-official",
      name: "Kaweco official site",
      attribution: "Kaweco",
      homepageUrl: "https://www.kaweco-pen.com/en/",
      notes: "Use for official product and brand-positioning facts; summarize rather than copy.",
    },
    item: {
      id: "source-kaweco-official-home",
      title: "Kaweco official site",
      url: "https://www.kaweco-pen.com/en/",
      itemType: "official_brand_site",
      summary:
        "Official Kaweco site registered as the first source for later Sport-series and pocket-pen positioning research.",
    },
  },
  {
    slug: "diplomat",
    source: {
      id: "diplomat-official",
      name: "Diplomat official site",
      attribution: "DIPLOMAT Deutschland GmbH",
      homepageUrl: "https://www.diplomat-pen.com/",
      notes:
        "Use for official company history and product-line facts; summarize rather than copy.",
    },
    item: {
      id: "source-diplomat-official-history",
      title: "DIPLOMAT: Our History",
      url: "https://www.diplomat-pen.com/en/our-company/our-history/",
      itemType: "official_history",
      summary:
        "Official Diplomat history page used for the 1922 Hennef origin and the brand's precision-writing-instrument positioning.",
    },
    claim: {
      id: "claim-diplomat-official-history-anchor",
      text:
        "DIPLOMAT official history presents March 1922 in Hennef, Germany as the founding origin of the brand.",
      evidenceLocator: "Our History / 1922",
      confidence: 0.84,
    },
    timeline: {
      id: "event-diplomat-1922-foundation",
      title: "DIPLOMAT founded in Hennef",
      startDate: "1922-03",
      description:
        "Official Diplomat history uses March 1922 and Hennef, Germany as the brand's founding origin.",
    },
  },
  {
    slug: "esterbrook",
    source: {
      id: "esterbrook-official",
      name: "Esterbrook official site",
      attribution: "Esterbrook",
      homepageUrl: "https://www.esterbrookpens.com/",
      notes:
        "Use for official brand history and modern product-line context; summarize rather than copy.",
    },
    item: {
      id: "source-esterbrook-official-history",
      title: "Esterbrook: Brand History",
      url: "https://www.esterbrookpens.com/pages/brand-history",
      itemType: "official_history",
      summary:
        "Official Esterbrook brand-history page used for the 1858 Camden origin and vintage-to-modern brand context.",
    },
    claim: {
      id: "claim-esterbrook-official-history-anchor",
      text:
        "Esterbrook official brand history presents 1858 and Richard Esterbrook's Camden, New Jersey company as the brand origin.",
      evidenceLocator: "Brand History / 1858",
      confidence: 0.82,
    },
    timeline: {
      id: "event-esterbrook-1858-foundation",
      title: "Esterbrook Pen Company established in Camden",
      startDate: "1858",
      description:
        "Official Esterbrook brand history uses 1858 and Camden, New Jersey as the origin of the Esterbrook Pen Company.",
    },
  },
  {
    slug: "conklin",
    source: {
      id: "conklin-official",
      name: "Conklin official site",
      attribution: "Conklin Pens",
      homepageUrl: "https://conklinpens.com/",
      notes:
        "Use for official brand history and modern collection context; summarize rather than copy.",
    },
    item: {
      id: "source-conklin-official-about",
      title: "Conklin: About Us",
      url: "https://conklinpens.com/pages/about-us",
      itemType: "official_history",
      summary:
        "Official Conklin about page used for Roy Conklin, Toledo, and the Crescent Filler design context.",
    },
    claim: {
      id: "claim-conklin-official-history-anchor",
      text:
        "Conklin official material presents Roy Conklin's 1897 Toledo Crescent Filler idea as a key early design milestone.",
      evidenceLocator: "About Us / 1897",
      confidence: 0.78,
    },
    timeline: {
      id: "event-conklin-1897-crescent-filler",
      title: "Roy Conklin Crescent Filler design milestone",
      eventType: "design_milestone",
      startDate: "1897",
      description:
        "Official Conklin material frames Roy Conklin's 1897 Toledo Crescent Filler idea as a foundational writing-instrument milestone.",
    },
  },
  {
    slug: "leonardo",
    source: {
      id: "leonardo-official",
      name: "Leonardo Officina Italiana official site",
      attribution: "Leonardo Officina Italiana",
      homepageUrl: "https://leonardopen.com/",
      notes:
        "Use for official brand positioning and product-family context; summarize rather than copy.",
    },
    item: {
      id: "source-leonardo-official-home",
      title: "Leonardo Officina Italiana official site",
      url: "https://leonardopen.com/",
      itemType: "official_brand_site",
      summary:
        "Official Leonardo site used for family craft positioning and modern Italian fountain-pen brand context.",
    },
    claim: {
      id: "claim-leonardo-official-positioning-anchor",
      text:
        "Leonardo official material positions the brand around over 50 years of fountain-pen experience passed from father to son.",
      evidenceLocator: "Homepage meta description",
      confidence: 0.7,
    },
  },
  {
    slug: "twsbi",
    source: {
      id: "twsbi-official",
      name: "TWSBI official site",
      attribution: "TWSBI",
      homepageUrl: "https://www.twsbi.com/",
      notes:
        "Use for official brand positioning, OEM-background context, and product-line facts; summarize rather than copy.",
    },
    item: {
      id: "source-twsbi-official-about",
      title: "TWSBI: About Us",
      url: "https://www.twsbi.com/pages/about-us",
      itemType: "official_about",
      summary:
        "Official TWSBI about page used for the OEM-manufacturing background and San Wen Tong name explanation.",
    },
    claim: {
      id: "claim-twsbi-official-about-anchor",
      text:
        "TWSBI official material presents the brand as emerging from Ta Shin Precision's decades of OEM manufacturing experience and explains the San Wen Tong naming reference.",
      evidenceLocator: "About Us / OEM manufacturer / San Wen Tong",
      confidence: 0.78,
    },
  },
  {
    slug: "nakaya",
    source: {
      id: "nakaya-official",
      name: "Nakaya official site",
      attribution: "Nakaya Fountain Pen",
      homepageUrl: "https://www.nakaya.org/en/",
      notes:
        "Use for official handmade fountain-pen positioning and Platinum artisan background; summarize rather than copy.",
    },
    item: {
      id: "source-nakaya-official-about",
      title: "Nakaya: About Us",
      url: "https://www.nakaya.org/en/about/",
      itemType: "official_about",
      summary:
        "Official Nakaya about page used for handmade fountain-pen positioning and the Platinum artisan background.",
    },
    claim: {
      id: "claim-nakaya-official-about-anchor",
      text:
        "Nakaya official material presents its pens as handmade by a craftsman with long fountain-pen artisan experience at Platinum Pen's manufacturing factory.",
      evidenceLocator: "About Us / handmade fountain pens",
      confidence: 0.78,
    },
  },
  {
    slug: "wancher",
    source: {
      id: "wancher-official",
      name: "Wancher official site",
      attribution: "Wancher",
      homepageUrl: "https://www.wancherpen.com/",
      notes:
        "Use for official brand positioning and Japanese craft/material context; summarize rather than copy.",
    },
    item: {
      id: "source-wancher-official-home",
      title: "Wancher official site",
      url: "https://www.wancherpen.com/",
      itemType: "official_brand_site",
      summary:
        "Official Wancher site used for premium Japanese fountain-pen positioning and craft/material context.",
    },
    claim: {
      id: "claim-wancher-official-positioning-anchor",
      text:
        "Wancher official material positions the brand around premium Japanese fountain pens and artisan/craft traditions.",
      evidenceLocator: "Homepage meta description / artisan copy",
      confidence: 0.68,
    },
  },
  {
    slug: "namiki",
    source: {
      id: "namiki-official",
      name: "Namiki official site",
      attribution: "PILOT Corporation",
      homepageUrl: "https://www.pilot-namiki.com/en/",
      notes:
        "Use for official Namiki and Maki-e brand positioning; summarize rather than copy.",
    },
    item: {
      id: "source-namiki-official-home",
      title: "Namiki official site",
      url: "https://www.pilot-namiki.com/en/",
      itemType: "official_brand_site",
      summary:
        "Official Namiki site used for luxury Maki-e fountain-pen positioning and Pilot/Namiki brand context.",
    },
    claim: {
      id: "claim-namiki-official-makie-anchor",
      text:
        "Namiki official material presents Namiki as a luxury Maki-e fountain-pen brand associated with Pilot.",
      evidenceLocator: "Homepage meta description",
      confidence: 0.72,
    },
  },
];

OFFICIAL_BRAND_SOURCES.push(
  {
    slug: "opus88",
    referenceRelationType: "history",
    source: {
      id: "paper-mouse-blog",
      name: "The Paper Mouse blog",
      sourceType: "blog",
      reliability: "medium",
      attribution: "The Paper Mouse",
      homepageUrl: "https://www.thepapermouse.com/",
      notes:
        "Use as secondary interview/blog material for modern stationery and fountain-pen brand context; summarize rather than copy.",
    },
    item: {
      id: "source-paper-mouse-opus88-spotlight",
      title: "Spotlight: OPUS 88",
      url: "https://www.thepapermouse.com/blogs/whats-new-at-the-paper-mouse/spotlight-opus-88",
      itemType: "interview_article",
      summary:
        "Interview-style shop blog article used as a secondary source for Opus 88's OEM/ODM background, Taiwan fountain-pen-boom context, and post-2017 eyedropper focus.",
    },
    claim: {
      id: "claim-opus88-paper-mouse-eyedropper-focus",
      predicate: "brand_positioning",
      text:
        "The Paper Mouse interview describes OPUS 88 as coming out of a 1975-2017 OEM/ODM background and later focusing on eyedropper fountain pens.",
      evidenceLocator: "history of OPUS 88 / 1975-2017 / 2017",
      confidence: 0.66,
    },
    timeline: {
      id: "event-opus88-2017-eyedropper-focus",
      title: "OPUS 88 focuses on eyedropper fountain pens",
      eventType: "design_milestone",
      startDate: "2017",
      description:
        "The Paper Mouse interview says the company decided after 2017 to make only eyedropper fountain pens.",
    },
  },
  {
    slug: "eversharp",
    referenceRelationType: "history",
    source: {
      id: "penhero",
      name: "PenHero",
      sourceType: "blog",
      reliability: "high_for_model_history",
      attribution: "PenHero authors",
      homepageUrl: "https://www.penhero.com/",
      notes:
        "Use as reference index and claim candidate source; do not copy text or images.",
    },
    item: {
      id: "source-penhero-eversharp-skyline",
      title: "PenHero: Eversharp Skyline 1941-1949",
      url: "https://penhero.com/PenGallery/Eversharp/EversharpSkyline.htm",
      itemType: "profile_article",
      summary:
        "PenHero Eversharp Skyline profile used as a secondary source for Henry Dreyfuss, the 1941 Skyline introduction, and the brand's 1940s industrial-design context.",
    },
    claim: {
      id: "claim-eversharp-penhero-skyline-dreyfuss",
      predicate: "design_milestone",
      text:
        "PenHero describes Eversharp engaging Henry Dreyfuss in 1940 and introducing the Skyline line in 1941.",
      evidenceLocator: "Henry Dreyfuss / unveiled in spring of 1941",
      confidence: 0.72,
    },
    timeline: {
      id: "event-eversharp-1941-skyline",
      title: "Eversharp Skyline introduced",
      eventType: "design_milestone",
      startDate: "1941",
      description:
        "PenHero frames the Skyline as a Henry Dreyfuss-designed Eversharp line introduced in 1941.",
    },
  },
  {
    slug: "moore",
    referenceRelationType: "history",
    source: {
      id: "penhero",
      name: "PenHero",
      sourceType: "blog",
      reliability: "high_for_model_history",
      attribution: "PenHero authors",
      homepageUrl: "https://www.penhero.com/",
      notes:
        "Use as reference index and claim candidate source; do not copy text or images.",
    },
    item: {
      id: "source-penhero-moore-fingertip",
      title: "PenHero: Moore Fingertip 1946-1950",
      url: "https://penhero.com/PenGallery/Moore/MooreFingertip.htm",
      itemType: "profile_article",
      summary:
        "PenHero Moore Fingertip profile used as a secondary source for the Boston/American Fountain Pen Company origin, 1917 Moore Pen Company name change, and 1946-1950 Fingertip context.",
    },
    claim: {
      id: "claim-moore-penhero-boston-origin",
      predicate: "history_anchor",
      text:
        "PenHero describes Moore as starting in Boston in 1900 under the American Fountain Pen Company name and changing to Moore Pen Company in 1917.",
      evidenceLocator: "started in Boston / American Fountain Pen Company / 1917",
      confidence: 0.72,
    },
    timeline: {
      id: "event-moore-1900-boston-origin",
      title: "Moore predecessor starts in Boston",
      startDate: "1900",
      description:
        "PenHero describes Moore's predecessor as starting in Boston in 1900 under the American Fountain Pen Company name.",
    },
  },
  {
    slug: "noodlers",
    referenceRelationType: "reference",
    source: {
      id: "truly-american-made",
      name: "Truly American Made",
      sourceType: "blog",
      reliability: "medium",
      attribution: "Truly American Made",
      homepageUrl: "https://trulyamericanmade.com/",
      notes:
        "Use as secondary manufacturing-origin verification; claims should remain cautious and summary-only.",
    },
    item: {
      id: "source-truly-american-made-noodlers",
      title: "Truly American Made: Noodler's Ink",
      url: "https://trulyamericanmade.com/brands/noodlers-ink",
      itemType: "manufacturing_profile",
      summary:
        "Secondary manufacturing profile used for Noodler's Ink founding/manufacturing-location context and the 100% made-in-USA ink claim.",
    },
    claim: {
      id: "claim-noodlers-tam-made-usa",
      predicate: "manufacturing_context",
      text:
        "Truly American Made profiles Noodler's Ink as founded by Nathan Tardif in Lowell, Massachusetts and describes its inks as 100% made in the USA.",
      evidenceLocator: "Founded 2004 / Lowell / 100% made in the USA",
      confidence: 0.62,
    },
    timeline: {
      id: "event-noodlers-2004-founded",
      title: "Noodler's Ink founded in Lowell",
      startDate: "2004",
      description:
        "Truly American Made profiles Noodler's Ink as founded in 2004 by Nathan Tardif in Lowell, Massachusetts.",
    },
  },
  {
    slug: "wahl",
    referenceRelationType: "history",
    source: {
      id: "richardspens",
      name: "Richard's Pens",
      sourceType: "blog",
      reliability: "high_for_model_history",
      attribution: "Richard Binder / richardspens.com",
      homepageUrl: "https://www.richardspens.com/",
      notes:
        "Use as a high-value collector/reference source for model history and mechanism context; summarize rather than copy.",
    },
    item: {
      id: "source-richardspens-a5372d5df28f3931",
      title: "The Wahl Pen",
      url: "https://www.richardspens.com/ref/profiles/wahl_pen.htm",
      itemType: "profile_article",
      summary:
        "Richard's Pens profile used as a secondary source for early Wahl Pen design vocabulary, including Tempoint-like silhouette, roller clip, and lever details.",
    },
    claim: {
      id: "claim-wahl-richardspens-early-design-anchor",
      predicate: "history_anchor",
      text:
        "Richard's Pens frames the early Wahl Pen through Tempoint-like silhouettes, the adopted roller clip, and distinct lever design elements.",
      evidenceLocator: "roller clip / lever / Wahl Pen",
      confidence: 0.72,
    },
    timeline: {
      id: "event-wahl-1925-advertising-context",
      title: "Wahl Pen appears in 1925 advertising context",
      eventType: "design_milestone",
      startDate: "1925",
      description:
        "Richard's Pens uses a December 1925 Pictorial Review advertisement as the entry point for the Wahl Pen profile.",
    },
  },
  {
    slug: "chilton",
    referenceRelationType: "history",
    source: {
      id: "richardspens",
      name: "Richard's Pens",
      sourceType: "blog",
      reliability: "high_for_model_history",
      attribution: "Richard Binder / richardspens.com",
      homepageUrl: "https://www.richardspens.com/",
      notes:
        "Use as a high-value collector/reference source for model history and mechanism context; summarize rather than copy.",
    },
    item: {
      id: "source-richardspens-d5b75a1cd3d6ce43",
      title: "The Chilton Chiltonian",
      url: "https://www.richardspens.com/ref/profiles/chiltonian.htm",
      itemType: "profile_article",
      summary:
        "Richard's Pens Chiltonian profile used as a secondary source for Chilton's late company context and second-generation pneumatic filling system.",
    },
    claim: {
      id: "claim-chilton-richardspens-pneumatic-anchor",
      predicate: "filling_system_context",
      text:
        "Richard's Pens describes the Chiltonian as a true Chilton fitted with the second-generation pneumatic filling system introduced about 1927.",
      evidenceLocator: "Chiltonian / second-generation pneumatic filling system",
      confidence: 0.72,
    },
    timeline: {
      id: "event-chilton-c1927-second-generation-pneumatic",
      title: "Chilton second-generation pneumatic system",
      eventType: "design_milestone",
      startDate: "1927",
      circa: true,
      description:
        "Richard's Pens dates Chilton's second-generation pneumatic filling system to about 1927.",
    },
  },
  {
    slug: "dunn",
    referenceRelationType: "history",
    source: {
      id: "richardspens",
      name: "Richard's Pens",
      sourceType: "blog",
      reliability: "high_for_model_history",
      attribution: "Richard Binder / richardspens.com",
      homepageUrl: "https://www.richardspens.com/",
      notes:
        "Use as a high-value collector/reference source for model history and mechanism context; summarize rather than copy.",
    },
    item: {
      id: "source-richardspens-579b2a500f7d4cb5",
      title: "The Dunn-Pen",
      url: "https://www.richardspens.com/ref/profiles/dunn.htm",
      itemType: "profile_article",
      summary:
        "Richard's Pens Dunn-Pen profile used as a secondary source for the 1921 New York company, Charles Dunn's pump filler patent, and Little Red Pump-Handle advertising.",
    },
    claim: {
      id: "claim-dunn-richardspens-red-pump-anchor",
      predicate: "filling_system_context",
      text:
        "Richard's Pens describes Dunn-Pen Company as founded in New York City in early 1921, with Charles Dunn's 1920 high-capacity pump filler patent forming the product basis.",
      evidenceLocator: "Dunn-Pen Company / 1921 / high-capacity pump filler",
      confidence: 0.74,
    },
    timeline: {
      id: "event-dunn-1921-company-founded",
      title: "Dunn-Pen Company founded in New York City",
      eventType: "brand_founded",
      startDate: "1921",
      description:
        "Richard's Pens says investors founded Dunn-Pen Company, Inc. in New York City in the first quarter of 1921.",
    },
  },
  {
    slug: "wearever",
    referenceRelationType: "history",
    source: {
      id: "richardspens",
      name: "Richard's Pens",
      sourceType: "blog",
      reliability: "high_for_model_history",
      attribution: "Richard Binder / richardspens.com",
      homepageUrl: "https://www.richardspens.com/",
      notes:
        "Use as a high-value collector/reference source for model history and mechanism context; summarize rather than copy.",
    },
    item: {
      id: "source-richardspens-9f946df0d470f8e5",
      title: "The Wearever Zenith",
      url: "https://www.richardspens.com/ref/profiles/zenith.htm",
      itemType: "profile_article",
      summary:
        "Richard's Pens Zenith profile used as a secondary source for David Kahn, Wearever fountain pens, and injection-molded pen manufacturing context.",
    },
    claim: {
      id: "claim-wearever-richardspens-injection-molding-anchor",
      predicate: "manufacturing_context",
      text:
        "Richard's Pens identifies David Kahn, Inc. as the maker of Wearever fountain pens and connects the company to early American injection-molded pen production.",
      evidenceLocator: "David Kahn, Inc. / maker of Wearever fountain pens / injection molded",
      confidence: 0.72,
    },
    timeline: {
      id: "event-wearever-c1920s-injection-molding",
      title: "David Kahn explores injection-molded pen production",
      eventType: "design_milestone",
      startDate: "1920",
      circa: true,
      description:
        "Richard's Pens says David Kahn investigated injection molding in Germany in the late 1920s and brought machinery back to develop molded pen production.",
    },
  },
  {
    slug: "graphomatic",
    referenceRelationType: "history",
    source: {
      id: "richardspens",
      name: "Richard's Pens",
      sourceType: "blog",
      reliability: "high_for_model_history",
      attribution: "Richard Binder / richardspens.com",
      homepageUrl: "https://www.richardspens.com/",
      notes:
        "Use as a high-value collector/reference source for model history and mechanism context; summarize rather than copy.",
    },
    item: {
      id: "source-richardspens-26f8de3b54f05142",
      title: "The Graphomatic Inkmaker & Colonel",
      url: "https://www.richardspens.com/ref/profiles/inkmaker.htm",
      itemType: "profile_article",
      summary:
        "Richard's Pens profile used as a secondary source for the Graph-O-Matic ink-making fountain pen, Grieshaber Pen Company, Sager Pen Corporation, and wartime ink-making pen context.",
    },
    claim: {
      id: "claim-graphomatic-richardspens-inkmaker-anchor",
      predicate: "wartime_mechanism_context",
      text:
        "Richard's Pens identifies Graph-O-Matic as an ink-making pen listed by Grieshaber Pen Company, then a division of Sager Pen Corporation, in a 1942 wartime context.",
      evidenceLocator:
        "Graph-O-Matic / Grieshaber Pen Company / Sager Pen Corporation / March 1942",
      confidence: 0.74,
    },
    timeline: {
      id: "event-graphomatic-1942-inkmaking-context",
      title: "Graph-O-Matic appears in wartime ink-making pen context",
      eventType: "design_milestone",
      startDate: "1942",
      description:
        "Richard's Pens ties the Graph-O-Matic ink-making pen to Popular Mechanics and wartime advertising in 1942.",
    },
  },
  {
    slug: "ingersoll",
    referenceRelationType: "history",
    source: {
      id: "richardspens",
      name: "Richard's Pens",
      sourceType: "blog",
      reliability: "high_for_model_history",
      attribution: "Richard Binder / richardspens.com",
      homepageUrl: "https://www.richardspens.com/",
      notes:
        "Use as a high-value collector/reference source for model history and mechanism context; summarize rather than copy.",
    },
    item: {
      id: "source-richardspens-19715bd140d8de5e",
      title: "The Ingersoll Dollar Pen",
      url: "https://www.richardspens.com/ref/profiles/ingersoll.htm",
      itemType: "profile_article",
      summary:
        "Richard's Pens profile used as a secondary source for Charles H. Ingersoll, the dollar-pen concept, Newark company context, and 1920s Ingersoll fountain pens.",
    },
    claim: {
      id: "claim-ingersoll-richardspens-dollar-pen-anchor",
      predicate: "market_positioning",
      text:
        "Richard's Pens describes Charles H. Ingersoll as remixing the dollar-watch idea into high-quality fountain pens sold for a dollar through the Charles H. Ingersoll Dollar Pen Company in Newark, New Jersey.",
      evidenceLocator:
        "Charles H. Ingersoll Dollar Pen Company / Newark / sold for a dollar",
      confidence: 0.74,
    },
    timeline: {
      id: "event-ingersoll-1922-dollar-pen-company",
      title: "Charles H. Ingersoll Dollar Pen Company operating in Newark",
      eventType: "brand_founded",
      startDate: "1922",
      description:
        "Richard's Pens places Charles H. Ingersoll's dollar-pen company in Newark, New Jersey by February 1922.",
    },
  },
  {
    slug: "morrison",
    referenceRelationType: "history",
    source: {
      id: "richardspens",
      name: "Richard's Pens",
      sourceType: "blog",
      reliability: "high_for_model_history",
      attribution: "Richard Binder / richardspens.com",
      homepageUrl: "https://www.richardspens.com/",
      notes:
        "Use as a high-value collector/reference source for model history and mechanism context; summarize rather than copy.",
    },
    item: {
      id: "source-richardspens-0fa236b38a59782d",
      title: "Morrison's Patriot",
      url: "https://www.richardspens.com/ref/profiles/patriot.htm",
      itemType: "profile_article",
      summary:
        "Richard's Pens Morrison's Patriot profile used as a secondary source for wartime fountain pen manufacturing context and the Patriot model.",
    },
    claim: {
      id: "claim-morrison-richardspens-patriot-wartime-anchor",
      predicate: "wartime_design_context",
      text:
        "Richard's Pens frames Morrison's Patriot as a fountain pen born of World War II wartime resource constraints and patriotic marketing.",
      evidenceLocator: "Morrison's Patriot / World War II / wartime pen",
      confidence: 0.72,
    },
    timeline: {
      id: "event-morrison-c1943-patriot",
      title: "Morrison Patriot wartime advertising context",
      eventType: "design_milestone",
      startDate: "1943",
      circa: true,
      description:
        "Richard's Pens uses a circa 1943 advertising matchbook as the entry point for the Morrison Patriot profile.",
    },
  },
  {
    slug: "wasp",
    referenceRelationType: "history",
    source: {
      id: "richardspens",
      name: "Richard's Pens",
      sourceType: "blog",
      reliability: "high_for_model_history",
      attribution: "Richard Binder / richardspens.com",
      homepageUrl: "https://www.richardspens.com/",
      notes:
        "Use as a high-value collector/reference source for model history and mechanism context; summarize rather than copy.",
    },
    item: {
      id: "source-richardspens-765c4e651bf3637e",
      title: "The WASP Addipoint",
      url: "https://www.richardspens.com/ref/profiles/addipoint.htm",
      itemType: "profile_article",
      summary:
        "Richard's Pens WASP Addipoint profile used as a secondary source for WASP as a W. A. Sheaffer Pen Company lower-end-market line and Addipoint context.",
    },
    claim: {
      id: "claim-wasp-richardspens-sheaffer-lower-end-anchor",
      predicate: "brand_relationship_context",
      text:
        "Richard's Pens describes WASP as an acronym made from W. A. Sheaffer Pen Company and frames it as a Sheaffer subsidiary line competing in the lower-end market.",
      evidenceLocator:
        "W. A. Sheaffer Pen Company / Wasp subsidiary / lower-end market",
      confidence: 0.74,
    },
    timeline: {
      id: "event-wasp-1938-addipoint-context",
      title: "WASP Addipoint appears in dealer brochure context",
      eventType: "design_milestone",
      startDate: "1938",
      description:
        "Richard's Pens uses a February 1938 Wasp Pen Company dealer brochure page as the entry point for the WASP Addipoint profile.",
    },
  },
  {
    slug: "monteverde",
    referenceRelationType: "official",
    source: {
      id: "monteverde-official",
      name: "Monteverde USA official site",
      sourceType: "official",
      reliability: "official_marketing",
      attribution: "Monteverde USA / Yafa Brands",
      homepageUrl: "https://www.monteverdepens.com/",
      notes:
        "Use for official brand positioning, founding year, product-family context, and materials/ink positioning; summarize rather than copy.",
    },
    item: {
      id: "source-monteverde-official-about",
      title: "Monteverde USA: About Monteverde",
      url: "https://www.monteverdepens.com/pages/about-monteverde",
      itemType: "official_history",
      summary:
        "Official Monteverde USA about page used as the first source for the 1999 brand origin and modern affordable writing-instrument positioning.",
    },
    claim: {
      id: "claim-monteverde-official-1999-anchor",
      predicate: "official_history_anchor",
      text:
        "Monteverde USA official material presents the brand as founded in 1999 and positioned around modern fine writing instruments, color, materials, and accessible quality.",
      evidenceLocator: "Founded in 1999 / European-grade resins / accessible price",
      confidence: 0.76,
    },
    timeline: {
      id: "event-monteverde-1999-founded",
      title: "Monteverde USA founded",
      eventType: "brand_founded",
      startDate: "1999",
      description:
        "Monteverde USA official material identifies 1999 as the brand founding year.",
    },
  },
  {
    slug: "skb",
    referenceRelationType: "official",
    source: {
      id: "skb-official",
      name: "SKB文明鋼筆 official site",
      sourceType: "official",
      reliability: "official_marketing",
      attribution: "SKB文明鋼筆",
      homepageUrl: "https://www.skb.com.tw/",
      notes:
        "Use for official SKB company timeline, Taiwan fountain-pen context, and product-category positioning; summarize rather than copy.",
    },
    item: {
      id: "source-skb-official-about",
      title: "SKB文明鋼筆：關於我們",
      url: "https://www.skb.com.tw/pages/%E9%97%9C%E6%96%BC%E6%88%91%E5%80%91",
      itemType: "official_history",
      summary:
        "Official SKB about page used for the 1955 company origin, early self-branded fountain pens, in-house nib manufacturing context, and 2012 restart of Taiwan-made fountain pens.",
    },
    claim: {
      id: "claim-skb-official-1955-2012-anchor",
      predicate: "official_history_anchor",
      text:
        "SKB official material presents 文明鋼筆股份有限公司 as formally named in 1955, the first self-branded 830 fountain pen as appearing in 1959, and 2012 as the restart of Taiwan-made fountain-pen production.",
      evidenceLocator: "關於我們 / 品牌里程碑 / 1955 / 1959 / 2012",
      confidence: 0.82,
    },
    timeline: {
      id: "event-skb-1955-company-named",
      title: "文明鋼筆股份有限公司 formally named",
      eventType: "brand_founded",
      startDate: "1955",
      description:
        "SKB official history says 文明貿易行 assembled imported pen parts and was later formally named 文明鋼筆股份有限公司 in 1955.",
    },
  },
  {
    slug: "skb",
    referenceRelationType: "history",
    source: {
      id: "huashan1914",
      name: "華山1914文化創意產業園區",
      sourceType: "blog",
      reliability: "medium",
      attribution: "華山1914文化創意產業園區",
      homepageUrl: "https://www.huashan1914.com/",
      notes:
        "Use as secondary interview/editorial material for Taiwanese cultural and brand-history context; summarize rather than copy.",
    },
    item: {
      id: "source-huashan1914-skb-writing-memory",
      title: "華山1914：在筆墨交會中找回初心",
      url: "https://www.huashan1914.com/w/huashan1914/creative_19081517492906027",
      itemType: "interview_article",
      summary:
        "Huashan 1914 article used as a secondary source for SKB's Taiwan writing-memory context, 1955 origin, 1959 830 fountain pen, and 2012 restart of fountain-pen production.",
    },
    claim: {
      id: "claim-skb-huashan-2012-restart-anchor",
      predicate: "revival_context",
      text:
        "Huashan 1914 describes SKB as a long-running Taiwanese pen maker that restarted its fountain-pen production line in 2012.",
      evidenceLocator: "2012年毅然重啟鋼筆生產線",
      confidence: 0.7,
    },
    timeline: {
      id: "event-skb-2012-fountain-pen-restart",
      title: "SKB restarts fountain-pen production",
      eventType: "revival",
      startDate: "2012",
      description:
        "Huashan 1914 and SKB official material both describe 2012 as the restart point for SKB's Taiwan-made fountain-pen production.",
    },
  },
  {
    slug: "penbbs",
    referenceRelationType: "community",
    source: {
      id: "gentleman-stationer",
      name: "The Gentleman Stationer",
      sourceType: "blog",
      reliability: "medium",
      attribution: "The Gentleman Stationer",
      homepageUrl: "https://www.gentlemanstationer.com/",
      notes:
        "Use as secondary review and modern fountain-pen community context; summarize rather than copy.",
    },
    item: {
      id: "source-gentleman-stationer-penbbs",
      title: "The Gentleman Stationer: PenBBS",
      url: "https://www.gentlemanstationer.com/penbbs",
      itemType: "review_index",
      summary:
        "Secondary review index used for PenBBS community-origin context and the brand's modern Chinese fountain-pen presence in Western review coverage.",
    },
    claim: {
      id: "claim-penbbs-gentleman-stationer-forum-anchor",
      predicate: "community_origin_context",
      text:
        "The Gentleman Stationer frames PenBBS as a Chinese fountain-pen brand with roots in a Chinese Internet forum, before its pens became visible in Western review and enthusiast circles.",
      evidenceLocator: "PenBBS brand page / Chinese Internet forum",
      confidence: 0.62,
    },
    timeline: {
      id: "event-penbbs-western-review-context",
      title: "PenBBS appears in Western fountain-pen review context",
      eventType: "community_event",
      startDate: "2019",
      circa: true,
      description:
        "The Gentleman Stationer and other English-language blogs make PenBBS visible to Western fountain-pen readers by the late 2010s.",
    },
  },
  {
    slug: "penbbs",
    referenceRelationType: "review",
    source: {
      id: "narratess",
      name: "Narratess",
      sourceType: "blog",
      reliability: "medium",
      attribution: "Narratess",
      homepageUrl: "https://www.narratess.com/",
      notes:
        "Use as secondary hands-on blog context for PenBBS models, color batches, shops, and buyer-facing positioning; summarize rather than copy.",
    },
    item: {
      id: "source-narratess-penbbs-fountain-pens",
      title: "Narratess: Blogmas: PenBBS Fountain Pens",
      url: "https://www.narratess.com/blogmas/blogmas-penbbs-fountain-pens/",
      itemType: "review_article",
      summary:
        "Narratess review article used as a secondary source for PenBBS as a Chinese brand by Beini Zheng, its Etsy/Taobao shop context, color batches, and affordable model positioning.",
    },
    claim: {
      id: "claim-penbbs-narratess-beini-colors-anchor",
      predicate: "brand_positioning",
      text:
        "Narratess describes PenBBS as a Chinese brand by Beini Zheng, sold through Etsy and Taobao channels, with colorful batch-made pens and accessible pricing.",
      evidenceLocator: "Beini Zheng / Etsy / Taobao / batches",
      confidence: 0.62,
    },
  },
  {
    slug: "duke",
    referenceRelationType: "history",
    source: {
      id: "goldsupplier",
      name: "GoldSupplier",
      sourceType: "retailer",
      reliability: "medium",
      attribution: "GoldSupplier / Shanghai G. Crown Fountain Pen Co., Ltd.",
      homepageUrl: "https://sgcfpcl.goldsupplier.com/",
      notes:
        "Use cautiously as a B2B manufacturer profile, not as a polished official brand history. Summaries should keep the manufacturer-listing boundary visible.",
    },
    item: {
      id: "source-goldsupplier-shanghai-g-crown",
      title: "GoldSupplier: Shanghai G. Crown Fountain Pen Co., Ltd.",
      url: "https://sgcfpcl.goldsupplier.com/",
      itemType: "manufacturer_profile",
      summary:
        "B2B supplier profile used as a cautious secondary source for Shanghai G. Crown Fountain Pen Co., Ltd., its 1992 establishment date, and writing-instrument manufacturing context.",
    },
    claim: {
      id: "claim-duke-goldsupplier-shanghai-g-crown-anchor",
      predicate: "manufacturer_context",
      text:
        "GoldSupplier's company overview lists Shanghai G. Crown Fountain Pen Co., Ltd. as established in 1992 and specializing in writing-instrument manufacturing.",
      evidenceLocator: "Company Overview / Established in 1992",
      confidence: 0.58,
    },
    timeline: {
      id: "event-duke-1992-shanghai-g-crown",
      title: "Shanghai G. Crown manufacturer profile origin",
      eventType: "brand_founded",
      startDate: "1992",
      description:
        "GoldSupplier's company profile lists Shanghai G. Crown Fountain Pen Co., Ltd. as established in 1992; this is treated as manufacturer context, not a full Duke brand history.",
    },
  },
  {
    slug: "duke",
    referenceRelationType: "reference",
    source: {
      id: "duke-pens-australia",
      name: "Duke Pens Australia",
      sourceType: "retailer",
      reliability: "medium",
      attribution: "Tieco International / Duke Pens Australia",
      homepageUrl: "https://www.dukepens.com.au/",
      notes:
        "Use as distributor context for Duke pens and Shanghai G. Crown relationship; do not treat as independent official brand history.",
    },
    item: {
      id: "source-duke-pens-australia-history",
      title: "Duke Pens Australia: History",
      url: "https://www.dukepens.com.au/6.html",
      itemType: "distributor_history",
      summary:
        "Distributor history page used cautiously for the link between Duke Pens Australia/Tieco International and Shanghai G. Crown Fountain Pen Co., Ltd.",
    },
    claim: {
      id: "claim-duke-australia-shanghai-g-crown-link",
      predicate: "distribution_context",
      text:
        "Duke Pens Australia says Tieco International purchases its Duke Pens range from Shanghai G. Crown Fountain Pen Co., Ltd.; this is distributor context rather than independent official history.",
      evidenceLocator: "History / purchase their range of Duke Pens",
      confidence: 0.5,
    },
  },
  {
    slug: "kaco",
    referenceRelationType: "official",
    source: {
      id: "kaco-official",
      name: "KACO official site",
      sourceType: "official",
      reliability: "official_marketing",
      attribution: "上海文采实业有限公司",
      homepageUrl: "https://www.kaco.cc/",
      notes:
        "Use for official KACO brand positioning, founding year, design-award claims, and product-category context; summarize rather than copy.",
    },
    item: {
      id: "source-kaco-official-brand-intro",
      title: "KACO：品牌介绍",
      url: "https://www.kaco.cc/page/2.htm",
      itemType: "official_brand_profile",
      summary:
        "Official KACO brand introduction used for the 2011 Shanghai origin, original-design positioning, writing-tool and cultural-creative-product context, and design-award claims.",
    },
    claim: {
      id: "claim-kaco-official-2011-shanghai-anchor",
      predicate: "official_history_anchor",
      text:
        "KACO official material says Shanghai Wencai Industrial Co., Ltd. founded the KACO writing-tools and cultural-creative-products brand in Shanghai in 2011, with a simple modern original-design positioning.",
      evidenceLocator: "品牌故事 / 2011年于中国上海创立",
      confidence: 0.82,
    },
    timeline: {
      id: "event-kaco-2011-founded",
      title: "KACO founded in Shanghai",
      eventType: "brand_founded",
      startDate: "2011",
      description:
        "KACO official brand introduction uses 2011 and Shanghai as the brand's origin point.",
    },
  },
  {
    slug: "kaco",
    referenceRelationType: "official",
    source: {
      id: "kaco-official",
      name: "KACO official site",
      sourceType: "official",
      reliability: "official_marketing",
      attribution: "上海文采实业有限公司",
      homepageUrl: "https://www.kaco.cc/",
      notes:
        "Use for official KACO brand positioning, founding year, design-award claims, and product-category context; summarize rather than copy.",
    },
    item: {
      id: "source-kaco-official-china-daning",
      title: "KACO：中国大宁钢笔礼盒入围上海设计100+",
      url: "https://www.kaco.cc/list/8/212.htm",
      itemType: "official_news",
      summary:
        "Official KACO company news used as a source for the China Daning fountain-pen gift box, Shanghai Design 100+ context, and KACO's original design product-line framing.",
    },
    claim: {
      id: "claim-kaco-official-china-daning-design-anchor",
      predicate: "design_milestone",
      text:
        "KACO official news says the China Daning fountain-pen gift box was shortlisted for Shanghai Design 100+, and frames KACO around original design products including business writing, daily writing, and cultural-creative lines.",
      evidenceLocator: "中国大宁钢笔礼盒 / 上海设计100+ / 产品线",
      confidence: 0.74,
    },
    timeline: {
      id: "event-kaco-2023-china-daning-design100",
      title: "KACO China Daning fountain-pen gift box in Shanghai Design 100+",
      eventType: "design_milestone",
      startDate: "2023-09-28",
      description:
        "KACO official news reports that its China Daning fountain-pen gift box was shortlisted in the Shanghai Design 100+ program.",
    },
  },
  {
    slug: "snowhite",
    referenceRelationType: "official",
    source: {
      id: "snowhite-official",
      name: "Snowhite Pen official site",
      sourceType: "official",
      reliability: "official_marketing",
      attribution: "Qingdao Changlong Stationery Co., Ltd.",
      homepageUrl: "https://www.china-snowhite.com/",
      notes:
        "Use for official Snowhite export-site company profile, product-category positioning, and OEM/manufacturing context; summarize rather than copy.",
    },
    item: {
      id: "source-snowhite-official-about",
      title: "Snowhite Pen: About Us",
      url: "https://www.china-snowhite.com/about.html",
      itemType: "official_company_profile",
      summary:
        "Official Snowhite Pen company profile used for Qingdao Changlong Stationery's May 1988 founding date and product categories including free-ink-system fountain pens.",
    },
    claim: {
      id: "claim-snowhite-official-1988-fountain-pen-anchor",
      predicate: "official_history_anchor",
      text:
        "Snowhite Pen official material says Qingdao Changlong Stationery was founded in May 1988 and produces Snowhite stationery categories including free-ink-system fountain pens.",
      evidenceLocator: "About Snowhite / founded in May 1988 / fountain pen",
      confidence: 0.8,
    },
    timeline: {
      id: "event-snowhite-1988-founded",
      title: "Qingdao Changlong Stationery founded",
      eventType: "brand_founded",
      startDate: "1988-05",
      description:
        "Snowhite Pen official material identifies May 1988 as the founding date of Qingdao Changlong Stationery.",
    },
  },
  {
    slug: "delike",
    referenceRelationType: "review",
    source: {
      id: "fountain-pen-chronicles",
      name: "Fountain Pen Chronicles",
      sourceType: "blog",
      reliability: "medium",
      attribution: "Fountain Pen Chronicles and More",
      homepageUrl: "https://fountainpenchronicles.blog/",
      notes:
        "Use as secondary hands-on review context for Delike models and Chinese low-cost fountain-pen ecosystem; summarize rather than copy.",
    },
    item: {
      id: "source-fpc-delike-new-moon-3",
      title: "Fountain Pen Chronicles: Delike New Moon 3",
      url: "https://fountainpenchronicles.blog/2023/04/17/delike-new-moon-3/",
      itemType: "review_article",
      summary:
        "Hands-on review used as secondary context for Delike New Moon 3, Shanghai Jingdian/Moonman/Majohn/Delike relationship claims, low-cost Chinese pen positioning, and fude/Waverly nib discussion.",
    },
    claim: {
      id: "claim-delike-fpc-new-moon-jingdian-anchor",
      predicate: "review_context",
      text:
        "Fountain Pen Chronicles describes Delike New Moon 3 as a low-cost Chinese fountain pen in the Shanghai Jingdian / Moonman / Majohn / Delike ecosystem and notes its Sailor Pro Gear Slim-inspired design context.",
      evidenceLocator: "Shanghai Jingdian / Delike New Moon 3 / inspired by",
      confidence: 0.58,
    },
    timeline: {
      id: "event-delike-2023-new-moon-review",
      title: "Delike New Moon 3 reviewed in English-language fountain-pen blog context",
      eventType: "community_event",
      startDate: "2023-04-17",
      description:
        "Fountain Pen Chronicles published a Delike New Moon 3 review that frames the pen in the low-cost Chinese fountain-pen and copycat-design discussion.",
    },
  },
  {
    slug: "delike",
    referenceRelationType: "review",
    source: {
      id: "well-appointed-desk",
      name: "The Well-Appointed Desk",
      sourceType: "blog",
      reliability: "medium",
      attribution: "The Well-Appointed Desk",
      homepageUrl: "https://www.wellappointeddesk.com/",
      notes:
        "Use as secondary review context for Delike New Moon comparison and consumer-facing copycat-design concerns; summarize rather than copy.",
    },
    item: {
      id: "source-wellappointed-delike-new-moon",
      title: "The Well-Appointed Desk: Delike New Moon",
      url: "https://www.wellappointeddesk.com/2017/08/fountain-pen-review-delike-new-moon-aka-fake-sailor-pro-gear-slim/",
      itemType: "review_article",
      summary:
        "Secondary review used for Delike New Moon comparison context, low price, and the visual similarity/copycat concern around Sailor Pro Gear Slim-style pens.",
    },
    claim: {
      id: "claim-delike-wellappointed-new-moon-copycat-anchor",
      predicate: "review_context",
      text:
        "The Well-Appointed Desk reviews Delike New Moon as a low-cost Chinese pen that closely resembles the Sailor Pro Gear Slim, while separating visual similarity from official Sailor branding claims.",
      evidenceLocator: "Delike New Moon / Sailor ProGear Slim / similarities",
      confidence: 0.58,
    },
    timeline: {
      id: "event-delike-2017-new-moon-review",
      title: "Delike New Moon reviewed in copycat-design context",
      eventType: "community_event",
      startDate: "2017-08-15",
      description:
        "The Well-Appointed Desk published a Delike New Moon review comparing it with Sailor Pro Gear Slim-style design cues.",
    },
  },
  {
    slug: "jinhao",
    referenceRelationType: "reference",
    source: {
      id: "alibaba-qiangu",
      name: "Alibaba supplier profile: Shanghai Qiangu Stationery",
      sourceType: "retailer",
      reliability: "medium",
      attribution: "Alibaba.com / Shanghai Qiangu Stationery Co., Ltd.",
      homepageUrl: "https://qiangu.en.alibaba.com/",
      notes:
        "Manufacturer-directory source for Shanghai Qiangu / Jinhao context. Use cautiously; summarize only and do not treat as independent official brand history.",
    },
    item: {
      id: "source-alibaba-qiangu-company-profile",
      title: "Alibaba: Shanghai Qiangu Stationery Co., Ltd.",
      url: "https://qiangu.en.alibaba.com/company_profile.html",
      itemType: "manufacturer_directory",
      summary:
        "Alibaba company profile for Shanghai Qiangu Stationery Co., Ltd. lists writing instruments including fountain pens and describes JINHAO/BAOER as company brands.",
    },
    claim: {
      id: "claim-jinhao-alibaba-qiangu-manufacturer-anchor",
      predicate: "manufacturer_context",
      text:
        "Alibaba's supplier profile presents Shanghai Qiangu Stationery Co., Ltd. as a writing-instrument maker with fountain pens among its main products and JINHAO/BAOER as company brands.",
      evidenceLocator:
        "Company profile / Main Products / Company Description / JINHAO and BAOER",
      confidence: 0.62,
    },
    timeline: {
      id: "event-jinhao-1988-qiangu-directory-anchor",
      title: "Shanghai Qiangu directory profile uses 1988 as company origin",
      eventType: "brand_founded",
      startDate: "1988",
      description:
        "The Alibaba company profile says Shanghai Qiangu Stationery was established in 1988 and later moved to Shanghai; this is treated as manufacturer-directory context, not independently verified brand history.",
      circa: true,
    },
  },
  {
    slug: "majohn",
    referenceRelationType: "review",
    source: {
      id: "sketchywolf",
      name: "Sketchy Wolf",
      sourceType: "blog",
      reliability: "community_opinion",
      attribution: "Sketchy Wolf",
      homepageUrl: "https://sketchywolf.wordpress.com/",
      notes:
        "Independent review/blog source. Use for consumer-facing Majohn/Moonman naming and model-context discussion, not official brand history.",
    },
    item: {
      id: "source-sketchywolf-majohn-a1",
      title: "Sketchy Wolf: Majohn/Moonman A1",
      url: "https://sketchywolf.wordpress.com/2022/09/10/majohn-moonman-a1-fine-fountain-pen-review/",
      itemType: "review",
      summary:
        "Review of the Majohn/Moonman A1 that describes Majohn as the name associated with the former/still-used Moonman naming and discusses the retractable A1 in comparison context.",
    },
    claim: {
      id: "claim-majohn-sketchywolf-moonman-a1-anchor",
      predicate: "review_context",
      text:
        "Sketchy Wolf's A1 review frames Majohn and Moonman as overlapping names in consumer use and treats the A1 as a retractable fountain pen in the Pilot Vanishing Point comparison space.",
      evidenceLocator: "Majohn (Moonman) A1 review / title and description",
      confidence: 0.56,
    },
    timeline: {
      id: "event-majohn-2022-a1-review",
      title: "Majohn/Moonman A1 reviewed in retractable-pen context",
      eventType: "community_event",
      startDate: "2022-09-10",
      description:
        "Sketchy Wolf published a Majohn/Moonman A1 review that makes the naming overlap and retractable-pen comparison visible for library readers.",
    },
  },
  {
    slug: "majohn",
    referenceRelationType: "review",
    source: {
      id: "thepoorpenman",
      name: "The Poor Penman",
      sourceType: "blog",
      reliability: "community_opinion",
      attribution: "The Poor Penman",
      homepageUrl: "https://thepoorpenman.com/",
      notes:
        "Independent review/blog source. Use for Majohn model ecosystem and community comparison context; summarize only.",
    },
    item: {
      id: "source-poorpenman-majohn-over-the-moon",
      title: "The Poor Penman: Over the Moon - Majohn Fountain Pen Review",
      url: "https://thepoorpenman.com/2023/04/29/over-the-moon-majohn-fountain-pen-review/",
      itemType: "review",
      summary:
        "Review discussing Majohn/Moonman pens including A1/A2 comparison context and the modern Chinese value-pen ecosystem.",
    },
    claim: {
      id: "claim-majohn-poorpenman-a1-a2-context",
      predicate: "review_context",
      text:
        "The Poor Penman places Majohn/Moonman pens in a modern Chinese value-pen and retractable-pen comparison context, including A1 and A2 references.",
      evidenceLocator: "Over the Moon / Majohn / A1 / A2",
      confidence: 0.54,
    },
  },
  {
    slug: "wingsung",
    referenceRelationType: "history",
    source: {
      id: "frankunderwater",
      name: "FrankUnderwater",
      sourceType: "blog",
      reliability: "medium",
      attribution: "FrankUnderwater",
      homepageUrl: "https://frankunderwater.com/",
      notes:
        "Independent fountain-pen blog source. Use for New Wing Sung explanatory context, with source-status caveats around ownership and licensing relationships.",
    },
    item: {
      id: "source-frankunderwater-new-wing-sungs",
      title: "FrankUnderwater: The New Wing Sungs Explained",
      url: "https://frankunderwater.com/2017/09/14/the-new-wing-sungs-explained/",
      itemType: "secondary_history",
      summary:
        "Explains the old Wing Sung name, the New Wing Sung revival context, and the relation of models such as 601, 618, and 698 to modern Chinese pen discussions.",
    },
    claim: {
      id: "claim-wingsung-frankunderwater-new-wing-sung-anchor",
      predicate: "secondary_history_anchor",
      text:
        "FrankUnderwater presents Wing Sung as an older Chinese pen name with a complicated New Wing Sung revival context, including 601, 618, and 698 model discussions.",
      evidenceLocator: "The New Wing Sungs Explained / History / 601 / 618 / 698",
      confidence: 0.58,
    },
    timeline: {
      id: "event-wingsung-2017-new-wing-sung-explainer",
      title: "New Wing Sung revival explained for English-language readers",
      eventType: "community_event",
      startDate: "2017-09-14",
      description:
        "FrankUnderwater published an English-language explainer about the New Wing Sung context and modern 600-series pens.",
    },
  },
  {
    slug: "wingsung",
    referenceRelationType: "review",
    source: {
      id: "rupertarzeian",
      name: "Rupert Arzeian",
      sourceType: "blog",
      reliability: "community_opinion",
      attribution: "Rupert Arzeian",
      homepageUrl: "https://rupertarzeian.com/",
      notes:
        "Independent review/blog source. Use for Wing Sung 601 consumer review context, not official model history.",
    },
    item: {
      id: "source-rupertarzeian-wingsung-601",
      title: "Rupert Arzeian: Wing Sung 601 Fountain Pen",
      url: "https://rupertarzeian.com/2023/07/23/wing-sung-601-fountain-pen/",
      itemType: "review",
      summary:
        "Review of the Wing Sung 601 fountain pen that helps anchor the model in consumer-facing Parker 51-style hooded-nib and vintage-inspired discussion.",
    },
    claim: {
      id: "claim-wingsung-rupertarzeian-601-context",
      predicate: "review_context",
      text:
        "Rupert Arzeian's 601 review places the Wing Sung 601 in a hooded-nib, Parker 51-style, vintage-inspired consumer context.",
      evidenceLocator: "Wing Sung 601 Fountain Pen / 601 / Parker 51",
      confidence: 0.52,
    },
  },
  {
    slug: "hero",
    source: {
      id: "hero-group-official",
      name: "上海英雄（集团） official site",
      sourceType: "official",
      reliability: "official_marketing",
      attribution: "上海英雄（集团）有限公司",
      homepageUrl: "https://hero.com.cn/",
      notes:
        "Use for official group history, enterprise relationships, brand honors, and product-category context; summarize rather than copy.",
    },
    item: {
      id: "source-hero-group-about",
      title: "上海英雄（集团）：集团概况",
      url: "https://hero.com.cn/about.html",
      itemType: "official_history",
      summary:
        "Official Hero Group overview used for the Huafu Golden Pen Factory origin, 1966 Hero Golden Pen Factory name change, and Hero fountain-pen brand context.",
    },
    claim: {
      id: "claim-hero-official-1931-huafu-anchor",
      predicate: "official_history_anchor",
      text:
        "上海英雄（集团）官方集团概况把英雄金笔厂前身追溯到 1931 年周荆庭创立的华孚金笔厂，并写到 1966 年华孚金笔厂改名为英雄金笔厂。",
      evidenceLocator: "集团概况 / 华孚金笔厂 / 1966 年英雄金笔厂",
      confidence: 0.82,
    },
    timeline: {
      id: "event-hero-1931-huafu-origin",
      title: "Huafu Golden Pen Factory founded",
      eventType: "brand_founded",
      startDate: "1931",
      description:
        "Hero Group's official overview identifies Huafu Golden Pen Factory, founded in 1931, as the predecessor of Hero Golden Pen Factory.",
    },
  },
  {
    slug: "hero",
    source: {
      id: "hero-group-official",
      name: "上海英雄（集团） official site",
      sourceType: "official",
      reliability: "official_marketing",
      attribution: "上海英雄（集团）有限公司",
      homepageUrl: "https://hero.com.cn/",
      notes:
        "Use for official group history, enterprise relationships, brand honors, and product-category context; summarize rather than copy.",
    },
    item: {
      id: "source-hero-group-classic-products",
      title: "上海英雄（集团）：经典典藏",
      url: "https://hero.com.cn/product/2.html",
      itemType: "official_product_category",
      summary:
        "Official Hero Group product category page showing Hero's current classic-writing-instrument catalog context.",
    },
    claim: {
      id: "claim-hero-official-classic-products-anchor",
      predicate: "official_product_context",
      text:
        "Hero Group's official product catalog has a 经典典藏 category containing Hero iridium and gold pen product lines, useful for separating brand history from current catalog context.",
      evidenceLocator: "产品展示 / 经典典藏 / 英雄铱金笔、金笔",
      confidence: 0.68,
    },
  },
  {
    slug: "hongdian",
    referenceRelationType: "review",
    source: {
      id: "dapprman",
      name: "dapprman",
      sourceType: "blog",
      reliability: "community_opinion",
      attribution: "dapprman",
      homepageUrl: "https://dappr.net/",
      notes:
        "Independent review/blog source. Use for Hong Dian Dark Blue Forest consumer context, not official founding or corporate history.",
    },
    item: {
      id: "source-dapprman-hong-dian-dark-blue-forest",
      title: "dapprman: Hong Dian Dark Blue Forest",
      url: "https://dappr.net/2023/12/21/hong-dian-dark-blue-forest/",
      itemType: "review",
      summary:
        "Review of the Hong Dian Dark Blue Forest that describes Hong Dian/HongDian as a Chinese firm visible on Amazon/Etsy and frames the Forest model as a metal daily-use fountain pen.",
    },
    claim: {
      id: "claim-hongdian-dapprman-dark-blue-forest-anchor",
      predicate: "review_context",
      text:
        "dapprman's review frames Hong Dian/HongDian through the Dark Blue Forest model and consumer-market visibility rather than a complete official company history.",
      evidenceLocator: "Hong Dian Dark Blue Forest / description",
      confidence: 0.5,
    },
    timeline: {
      id: "event-hongdian-2023-dark-blue-forest-review",
      title: "Hong Dian Dark Blue Forest reviewed",
      eventType: "community_event",
      startDate: "2023-12-21",
      description:
        "dapprman published a Hong Dian Dark Blue Forest review that gives the brand a consumer-facing model anchor.",
    },
  },
  {
    slug: "hongdian",
    referenceRelationType: "review",
    source: {
      id: "everyday-scrawl",
      name: "Everyday Scrawl",
      sourceType: "blog",
      reliability: "community_opinion",
      attribution: "Everyday Scrawl",
      homepageUrl: "https://everydayscrawlcom.wordpress.com/",
      notes:
        "Independent review/blog source. Use for Hong Dian Dark Blue Forest handling, nib, and low-cost consumer context; summarize only.",
    },
    item: {
      id: "source-everyday-scrawl-hong-dian-dark-blue-forest",
      title: "Everyday Scrawl: Hong Dian Dark Blue Forest",
      url: "https://everydayscrawlcom.wordpress.com/2020/10/18/hong-dian-dark-blue-forest/",
      itemType: "review",
      summary:
        "Hands-on review of Hong Dian Dark Blue Forest discussing color options, nib options, all-metal construction, cartridge/converter use, and low-price context.",
    },
    claim: {
      id: "claim-hongdian-everyday-scrawl-forest-anchor",
      predicate: "review_context",
      text:
        "Everyday Scrawl's review presents the Hong Dian Dark Blue Forest as a low-cost all-metal cartridge/converter fountain pen with multiple color and nib options.",
      evidenceLocator:
        "Dark Blue Forest review / color options / Extra-Fine, Fine, Bent or Fude / full metal / Cartridge/Converter",
      confidence: 0.54,
    },
  },
  {
    slug: "picasso",
    source: {
      id: "picasso-official-cn",
      name: "毕加索钢笔官方网站",
      sourceType: "official",
      reliability: "official_marketing",
      attribution: "上海帕弗洛文化用品有限公司 / 毕加索钢笔官方网站",
      homepageUrl: "https://www.sh-picasso.com/",
      notes:
        "Use for official company introduction, product-category context, and brand-positioning claims; summarize rather than copy.",
    },
    item: {
      id: "source-picasso-official-company-cn",
      title: "毕加索钢笔官方网站：公司简介",
      url: "https://www.sh-picasso.com/index.php?a=lists&c=index&catid=13&m=content",
      itemType: "official_history",
      summary:
        "Official Chinese company introduction for Picasso pens, used for Shanghai Pafuluo's 2003 establishment, writing-instrument product categories, and design/manufacturing positioning.",
    },
    claim: {
      id: "claim-picasso-official-2003-pafuluo-anchor",
      predicate: "official_history_anchor",
      text:
        "毕加索钢笔官方网站公司简介写明上海帕弗洛文化用品有限公司成立于2003年，并研发、设计、生产、销售毕加索品牌书写工具，包括金笔、铱金笔、美工笔、宝珠笔及配套产品。",
      evidenceLocator: "公司简介 / 上海帕弗洛文化用品有限公司成立于2003年",
      confidence: 0.78,
    },
    timeline: {
      id: "event-picasso-2003-pafuluo-founded",
      title: "Shanghai Pafuluo Stationery founded",
      eventType: "brand_founded",
      startDate: "2003",
      description:
        "Picasso's official company introduction states that Shanghai Pafuluo Stationery Co., Ltd. was established in 2003.",
    },
  },
  {
    slug: "picasso",
    source: {
      id: "picasso-official-cn",
      name: "毕加索钢笔官方网站",
      sourceType: "official",
      reliability: "official_marketing",
      attribution: "上海帕弗洛文化用品有限公司 / 毕加索钢笔官方网站",
      homepageUrl: "https://www.sh-picasso.com/",
      notes:
        "Use for official company introduction, product-category context, and brand-positioning claims; summarize rather than copy.",
    },
    item: {
      id: "source-picasso-official-company-en",
      title: "Picasso official site: Company Introductions",
      url: "https://www.sh-picasso.com/index.php?a=lists&c=index&catid=2&m=content",
      itemType: "official_history",
      summary:
        "Official English company introduction for Picasso pens, used as a cross-language source for the Shanghai Pafuluo / Picasso writing-instrument context.",
    },
    claim: {
      id: "claim-picasso-official-english-company-anchor",
      predicate: "official_company_context",
      text:
        "Picasso's English company introduction presents Shanghai Pafuluo Stationery Co., Ltd. as established in 2003 and connected to China Pen Making Association and ISO 9001 context.",
      evidenceLocator:
        "Company Introductions / established in the year of 2003 / China Pen Making Association / ISO_9001",
      confidence: 0.68,
    },
  },
);

const LIMIT = LIMIT_ARG
  ? Number(LIMIT_ARG.split("=")[1])
  : OFFICIAL_BRAND_SOURCES.length;

type EntityRow = {
  id: string;
  slug: string;
  name: string;
};

function getClient() {
  if (process.env.TURSO_DATABASE_URL) {
    return createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return createClient({ url: "file:data/fpkg.db" });
}

async function execute(db: Client, sql: string, args: unknown[] = []) {
  await db.execute({ sql, args: args as InArgs });
}

async function runMigrations(db: Client) {
  await execute(
    db,
    `CREATE TABLE IF NOT EXISTS migrations (
      name TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  );

  if (!fs.existsSync(MIGRATIONS_DIR)) return;

  const appliedRows = await db.execute("SELECT name FROM migrations");
  const applied = new Set(appliedRows.rows.map((row) => String(row.name)));
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();
  const hasLegacySchema =
    (
      await db.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'entities'",
      )
    ).rows.length > 0;

  for (const file of files) {
    if (applied.has(file)) continue;
    if (hasLegacySchema && file !== "011_library_schema.sql") {
      await execute(
        db,
        "INSERT OR IGNORE INTO migrations (name, applied_at) VALUES (?, datetime('now'))",
        [file],
      );
      continue;
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
    await db.executeMultiple(sql);
    await execute(
      db,
      "INSERT INTO migrations (name, applied_at) VALUES (?, datetime('now'))",
      [file],
    );
    console.log(`Applied migration: ${file}`);
  }
}

async function findLocalEntity(db: Client, slug: string): Promise<EntityRow | null> {
  const result = await db.execute({
    sql: "SELECT id, slug, name FROM entities WHERE slug = ? AND type = 'brand' LIMIT 1",
    args: [slug],
  });
  return (result.rows[0] as EntityRow | undefined) || null;
}

async function writeOfficialSource(
  db: Client,
  local: EntityRow,
  source: OfficialBrandSource,
) {
  await execute(
    db,
    `INSERT INTO source_registry
      (id, name, source_type, allowed_use, reliability, license, attribution, homepage_url, fetch_method, notes, last_checked_at, updated_at)
     VALUES (?, ?, ?, 'summary_only', ?, 'copyrighted; summary/link only', ?, ?, 'manual_verified_url', ?, date('now'), datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      source_type = excluded.source_type,
      reliability = excluded.reliability,
      attribution = excluded.attribution,
      homepage_url = excluded.homepage_url,
      notes = excluded.notes,
      last_checked_at = excluded.last_checked_at,
      updated_at = datetime('now')`,
    [
      source.source.id,
      source.source.name,
      source.source.sourceType || "official",
      source.source.reliability || "official_marketing",
      source.source.attribution,
      source.source.homepageUrl,
      source.source.notes,
    ],
  );

  await execute(
    db,
    `INSERT INTO source_items
      (id, source_id, title, url, item_type, license, author, retrieved_at, summary, allowed_use, review_status, updated_at)
     VALUES (?, ?, ?, ?, ?, 'copyrighted; summary/link only', ?, date('now'), ?, 'summary_only', 'approved', datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      url = excluded.url,
      item_type = excluded.item_type,
      author = excluded.author,
      retrieved_at = excluded.retrieved_at,
      summary = excluded.summary,
      allowed_use = excluded.allowed_use,
      review_status = excluded.review_status,
      updated_at = datetime('now')`,
    [
      source.item.id,
      source.source.id,
      source.item.title,
      source.item.url,
      source.item.itemType,
      source.source.attribution,
      source.item.summary,
    ],
  );

  await execute(
    db,
    `INSERT INTO entity_references
      (id, entity_id, source_item_id, relation_type, note, review_status)
     VALUES (?, ?, ?, ?, ?, 'approved')
     ON CONFLICT(entity_id, source_item_id, relation_type) DO UPDATE SET
      note = excluded.note,
      review_status = excluded.review_status`,
    [
      `reference-${source.referenceRelationType || "official"}-${local.id}-${source.item.id}`,
      local.id,
      source.item.id,
      source.referenceRelationType || "official",
      source.referenceRelationType === "official" || !source.referenceRelationType
        ? "Official brand source registered for later story, timeline, and model-context expansion. Summary/link only."
        : "Secondary brand source registered for later story, timeline, and model-context expansion. Summary/link only; facts require source-status awareness.",
    ],
  );

  if (source.claim) {
    await execute(
      db,
      `INSERT INTO claims
       (id, subject_entity_id, predicate, object_text, source_item_id, evidence_locator, confidence, review_status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
        predicate = excluded.predicate,
        object_text = excluded.object_text,
        source_item_id = excluded.source_item_id,
        evidence_locator = excluded.evidence_locator,
        confidence = excluded.confidence,
        updated_at = datetime('now')`,
      [
        source.claim.id,
        local.id,
        source.claim.predicate || "official_history_anchor",
        source.claim.text,
        source.item.id,
        source.claim.evidenceLocator || null,
        source.claim.confidence ?? 0.75,
      ],
    );
  }

  if (source.timeline) {
    await execute(
      db,
      `INSERT INTO timeline_events
        (id, entity_id, title, event_type, start_date, circa, description, source_item_id, review_status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        event_type = excluded.event_type,
        start_date = excluded.start_date,
        circa = excluded.circa,
        description = excluded.description,
        source_item_id = excluded.source_item_id,
        updated_at = datetime('now')`,
      [
        source.timeline.id,
        local.id,
        source.timeline.title,
        source.timeline.eventType || "brand_founded",
        source.timeline.startDate,
        source.timeline.circa ? 1 : 0,
        source.timeline.description,
        source.item.id,
      ],
    );
  }
}

async function main() {
  const db = getClient();
  await execute(db, "PRAGMA foreign_keys = ON");
  if (WRITE) await runMigrations(db);

  const rows = OFFICIAL_BRAND_SOURCES.slice(0, LIMIT);
  console.log(
    WRITE
      ? "Official brand source import: write mode"
      : "Official brand source import: dry run",
  );

  for (const source of rows) {
    const local = await findLocalEntity(db, source.slug);
    if (!local) {
      console.warn(`Skip ${source.slug}: local brand entity not found`);
      continue;
    }

    console.log(
      `${local.name} -> ${source.item.title} | ${source.item.url}${
        source.claim ? " | claim" : ""
      }${source.timeline ? " | timeline" : ""}`,
    );

    if (WRITE) {
      await writeOfficialSource(db, local, source);
    }
  }

  if (!WRITE) {
    console.log("Dry run only. Re-run with --write to store official sources.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
