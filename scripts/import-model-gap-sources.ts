import fs from "node:fs";
import path from "node:path";
import {
  createClient,
  type Client,
  type InArgs,
  type InStatement,
} from "@libsql/client";

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");
const WRITE = process.argv.includes("--write");
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith("--limit="));
const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1]) : undefined;
const SLUGS_ARG = process.argv.find((arg) => arg.startsWith("--slugs="));
const SLUG_FILTER = SLUGS_ARG
  ? new Set(
      SLUGS_ARG.slice("--slugs=".length)
        .split(",")
        .map((slug) => slug.trim())
        .filter(Boolean),
    )
  : null;

type SourceRegistrySeed = {
  id: string;
  name: string;
  sourceType:
    | "official"
    | "wikimedia"
    | "book"
    | "patent"
    | "blog"
    | "forum"
    | "reddit"
    | "retailer"
    | "user_submission";
  allowedUse: "store_full" | "store_excerpt" | "summary_only" | "metadata_only" | "link_only" | "forbidden";
  reliability:
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
  fetchMethod: string;
  notes: string;
};

type SourceItemSeed = {
  id: string;
  sourceId: string;
  title: string;
  url: string;
  itemType: string;
  author: string;
  summary: string;
  allowedUse: "store_full" | "store_excerpt" | "summary_only" | "metadata_only" | "link_only" | "forbidden";
  reviewStatus: "pending" | "approved" | "rejected" | "needs_review";
};

type AliasSeed = {
  alias: string;
  language: string;
  sourceId?: string;
};

type ClaimSeed = {
  id: string;
  predicate: string;
  text: string;
  sourceItemId: string;
  evidenceLocator?: string;
  confidence: number;
  reviewStatus: "pending" | "approved" | "rejected" | "needs_source";
};

type ModelSpecSeed = {
  id: string;
  seriesName: string;
  releaseYear: string;
  originCountry: string;
  nib: string;
  fillSystem: string;
  material: string;
  dimensions: string;
  weight: string;
  priceRange: string;
  status: string;
  reviewStatus: "pending" | "approved" | "rejected" | "needs_source";
};

type StorySeed = {
  id: string;
  title: string;
  summary: string;
  bodyMd: string;
  status: "draft" | "needs_sources" | "needs_media" | "reviewed" | "published" | "deprecated";
  sourceNotes: string;
  sourceItemIds: string[];
  claimIds: string[];
};

type VariantSeed = {
  id: string;
  name: string;
  releaseYear?: string;
  notes: string;
  sourceItemId?: string;
  reviewStatus: "pending" | "approved" | "rejected" | "needs_source";
};

type ModelGapSeed = {
  slug: string;
  brandSlug: string;
  aliases: AliasSeed[];
  sourceItemIds: string[];
  spec: ModelSpecSeed;
  claims: ClaimSeed[];
  story: StorySeed;
  variants?: VariantSeed[];
};

type EntityRow = {
  id: string;
  type: string;
  slug: string;
  name: string;
};

const SOURCE_REGISTRY: SourceRegistrySeed[] = [
  {
    id: "public-web-research-index",
    name: "Public web research index",
    sourceType: "user_submission",
    allowedUse: "link_only",
    reliability: "unknown",
    attribution: "Project editorial research",
    homepageUrl: "/library/sources",
    fetchMethod: "manual_search_index",
    notes:
      "Search/index URLs for under-documented entries. These keep pages in a visible research queue and are not direct evidence for hard historical claims.",
  },
  {
    id: "sailor-official",
    name: "Sailor official site",
    sourceType: "official",
    allowedUse: "summary_only",
    reliability: "official_marketing",
    attribution: "The Sailor Pen Co., Ltd.",
    homepageUrl: "https://en.sailor.co.jp/",
    fetchMethod: "manual_verified_url",
    notes:
      "Use for Sailor official product families, model names, product numbers, nib/filling-system claims, and official collection positioning. Region-specific availability still needs product-page scope.",
  },
  {
    id: "lamy-official",
    name: "LAMY official site",
    sourceType: "official",
    allowedUse: "summary_only",
    reliability: "official_marketing",
    attribution: "LAMY",
    homepageUrl: "https://www.lamy.com/",
    fetchMethod: "manual_verified_url",
    notes:
      "Use for LAMY official product pages, material/compatibility notes, and design positioning. Exact older or discontinued model variants still need catalog or archive sources.",
  },
  {
    id: "waterman-official",
    name: "Waterman official site",
    sourceType: "official",
    allowedUse: "summary_only",
    reliability: "official_marketing",
    attribution: "Waterman",
    homepageUrl: "https://www.waterman.com/",
    fetchMethod: "manual_verified_url",
    notes:
      "Use for official Waterman heritage and current collection context. Product pages may block automated fetches; keep model-specific claims review-gated.",
  },
  {
    id: "namiki-official",
    name: "Namiki official site",
    sourceType: "official",
    allowedUse: "summary_only",
    reliability: "official_marketing",
    attribution: "Namiki / Pilot Corporation",
    homepageUrl: "https://www.pilot-namiki.com/en/",
    fetchMethod: "manual_verified_url",
    notes:
      "Use for Namiki official collection and Maki-e positioning. Artwork-level model claims need exact collection or product sources.",
  },
  {
    id: "gentleman-stationer",
    name: "The Gentleman Stationer",
    sourceType: "blog",
    allowedUse: "summary_only",
    reliability: "medium",
    attribution: "The Gentleman Stationer",
    homepageUrl: "https://www.gentlemanstationer.com/",
    fetchMethod: "manual_verified_url",
    notes:
      "Use as secondary review and modern fountain-pen community context; summarize rather than copy.",
  },
  {
    id: "narratess",
    name: "Narratess",
    sourceType: "blog",
    allowedUse: "summary_only",
    reliability: "medium",
    attribution: "Narratess",
    homepageUrl: "https://www.narratess.com/",
    fetchMethod: "manual_verified_url",
    notes:
      "Use as secondary hands-on blog context for PenBBS models, color batches, shops, and buyer-facing positioning; summarize only.",
  },
  {
    id: "nakaya-official",
    name: "Nakaya official site",
    sourceType: "official",
    allowedUse: "summary_only",
    reliability: "official_marketing",
    attribution: "Nakaya Fountain Pen",
    homepageUrl: "https://www.nakaya.org/en/",
    fetchMethod: "manual_verified_url",
    notes:
      "Use for Nakaya handmade-fountain-pen positioning, model-family navigation, and ordering context. Treat exact options as product-page scoped.",
  },
  {
    id: "noodlers-official",
    name: "Noodler's Ink official site",
    sourceType: "official",
    allowedUse: "summary_only",
    reliability: "official_marketing",
    attribution: "Noodler's Ink",
    homepageUrl: "https://noodlersink.com/",
    fetchMethod: "manual_verified_url",
    notes:
      "Use for official Noodler's category/navigation context. Product-level specs still need direct product or retailer pages.",
  },
  {
    id: "parker-official",
    name: "Parker official site",
    sourceType: "official",
    allowedUse: "summary_only",
    reliability: "official_marketing",
    attribution: "Parker",
    homepageUrl: "https://www.parkerpen.com/",
    fetchMethod: "manual_verified_url",
    notes:
      "Use for Parker official collection and product positioning. Treat current product pages as region/time scoped and summarize only.",
  },
  {
    id: "rupertarzeian",
    name: "Rupert Arzeian",
    sourceType: "blog",
    allowedUse: "summary_only",
    reliability: "community_opinion",
    attribution: "Rupert Arzeian",
    homepageUrl: "https://rupertarzeian.com/",
    fetchMethod: "manual_verified_url",
    notes:
      "Independent review/blog source. Use for consumer-facing context, not official model history.",
  },
  {
    id: "fountain-pen-network",
    name: "Fountain Pen Network",
    sourceType: "forum",
    allowedUse: "summary_only",
    reliability: "community_opinion",
    attribution: "Fountain Pen Network contributors",
    homepageUrl: "https://www.fountainpennetwork.com/",
    fetchMethod: "manual_verified_url",
    notes:
      "Use as community review context only. Do not treat individual posts as official product specifications.",
  },
  {
    id: "comfortable-shoes-studio",
    name: "Comfortable Shoes Studio",
    sourceType: "blog",
    allowedUse: "summary_only",
    reliability: "community_opinion",
    attribution: "Comfortable Shoes Studio",
    homepageUrl: "https://comfortableshoesstudio.com/",
    fetchMethod: "manual_verified_url",
    notes:
      "Use as hands-on review context for inexpensive Chinese fountain pens; summarize and keep specifications review-gated.",
  },
  {
    id: "pastor-and-pen",
    name: "Pastor and Pen",
    sourceType: "blog",
    allowedUse: "summary_only",
    reliability: "community_opinion",
    attribution: "Pastor and Pen",
    homepageUrl: "https://www.pastorandpen.com/",
    fetchMethod: "manual_verified_url",
    notes:
      "Use as hands-on review context for fountain pens; consumer impressions and prices remain attributed and time-scoped.",
  },
  {
    id: "left-hook-pens",
    name: "Left Hook Pens",
    sourceType: "blog",
    allowedUse: "summary_only",
    reliability: "community_opinion",
    attribution: "Left Hook Pens",
    homepageUrl: "https://lefthookpens.com/",
    fetchMethod: "manual_verified_url",
    notes:
      "Use as recent hands-on review context. Do not generalize one review sample into official specifications.",
  },
  {
    id: "scribblejot",
    name: "Scribble Jot",
    sourceType: "blog",
    allowedUse: "summary_only",
    reliability: "community_opinion",
    attribution: "Scribble Jot",
    homepageUrl: "https://scribblejot.com/",
    fetchMethod: "manual_verified_url",
    notes:
      "Use as consumer review context for inexpensive fountain pens; summarize only.",
  },
  {
    id: "well-appointed-desk",
    name: "The Well-Appointed Desk",
    sourceType: "blog",
    allowedUse: "summary_only",
    reliability: "medium",
    attribution: "The Well-Appointed Desk",
    homepageUrl: "https://www.wellappointeddesk.com/",
    fetchMethod: "manual_verified_url",
    notes:
      "Use as secondary review context and consumer-facing perspective; summarize rather than copy.",
  },
  {
    id: "sbrebrown",
    name: "SBREBrown",
    sourceType: "blog",
    allowedUse: "summary_only",
    reliability: "medium",
    attribution: "SBREBrown",
    homepageUrl: "https://www.sbrebrown.com/",
    fetchMethod: "manual_verified_url",
    notes:
      "Use for review-page metadata, measurements, and consumer impressions where present. Keep all conclusions attributed.",
  },
];

const SOURCE_ITEMS: SourceItemSeed[] = [
  {
    id: "source-kaco-master-14k-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: KACO Master大师14K",
    url: "https://www.bing.com/search?q=%22KACO%22+%22Master%22+%2214K%22+%22%E9%92%A2%E7%AC%94%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for KACO Master 14K model pages, seller listings, reviews, and direct product evidence. Not direct evidence for specs by itself.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-kaco-sky-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: KACO SKY百锋",
    url: "https://www.bing.com/search?q=%22KACO%22+%22SKY%22+%22%E7%99%BE%E9%94%8B%22+%22%E9%92%A2%E7%AC%94%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for KACO SKY / 百锋 product, review, and listing evidence. Not direct evidence for specs by itself.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-noodlers-simple-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Noodler's simple fountain pen",
    url: "https://www.bing.com/search?q=%22Noodler%27s%22+%22simple%22+%22fountain+pen%22+%22eyedropper%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for the under-specified Noodler's simple fountain-pen entry. Use to resolve whether the page should map to Charlie, Creaper, Ahab, or another model.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-noodlers-official-home",
    sourceId: "noodlers-official",
    title: "Noodler's Ink official site",
    url: "https://noodlersink.com/",
    itemType: "official_brand_site",
    author: "Noodler's Ink",
    summary:
      "Official Noodler's Ink site registered as a brand-level anchor while the exact simple fountain-pen model identity is resolved.",
    allowedUse: "summary_only",
    reviewStatus: "approved",
  },
  {
    id: "source-skb-f10-f21-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: SKB派顿 F10 / F21",
    url: "https://www.bing.com/search?q=%22SKB%22+%22F10%22+%22F21%22+%22%E9%8B%BC%E7%AD%86%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for SKB F10/F21 and Paxton/派顿 naming evidence. Keep exact mapping pending until a direct product or catalog source is attached.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-montblanc-22-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Montblanc 22 vintage",
    url: "https://www.bing.com/search?q=%22Montblanc+22%22+%22fountain+pen%22+vintage",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Montblanc 22 vintage references, catalog mentions, and collector discussions. Not a direct source for dating or specs.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-monteverde-unspecified-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Monteverde unspecified model",
    url: "https://www.bing.com/search?q=%22Monteverde%22+%22fountain+pen%22+%22%E4%B8%87%E7%89%B9%E4%BD%B3%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for the under-specified Monteverde / 万特佳 model entry. Use to split it into a concrete model before adding firm specs.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-nakaya-products-official",
    sourceId: "nakaya-official",
    title: "Nakaya: Models",
    url: "https://www.nakaya.org/en/products/index.html",
    itemType: "official_product_index",
    author: "Nakaya Fountain Pen",
    summary:
      "Official Nakaya model index registered as a starting point for Portable, Writer, Cigar, and decorative/custom model research.",
    allowedUse: "summary_only",
    reviewStatus: "approved",
  },
  {
    id: "source-nakaya-housoge-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Nakaya Housoge",
    url: "https://www.bing.com/search?q=%22Nakaya%22+%22Housoge%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Nakaya Housoge decorative/custom references. Use official or catalog pages before making material or motif claims.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-nakaya-portable-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Nakaya Portable / Portable Cigar",
    url: "https://www.bing.com/search?q=%22Nakaya%22+%22Portable+Cigar%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Nakaya Portable and Portable Cigar references. Use to resolve shape/finish choices and dimensions from direct sources.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-nakaya-portable-writer-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Nakaya Portable Writer 黑溜涂",
    url: "https://www.bing.com/search?q=%22Nakaya%22+%22Portable+Writer%22+%22%E9%BB%91%E6%BA%9C%E5%A1%97%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Nakaya Portable Writer and 黑溜涂 / kuro-tamenuri naming. Keep finish and customization claims pending direct source review.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-duke-unspecified-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Duke unspecified model",
    url: "https://www.bing.com/search?q=%22Duke%22+%22%E5%85%AC%E7%88%B5%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for the under-specified Duke / 公爵 model entry. Use to split concrete models and avoid treating brand-level comments as model facts.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-sailor-0501-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Sailor 0501铱金",
    url: "https://www.bing.com/search?q=%22Sailor%22+%220501%22+%22%E9%93%B1%E9%87%91%22+%22%E9%92%A2%E7%AC%94%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Sailor 0501铱金 references. Use catalog or product evidence before asserting nib material, production period, or series mapping.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-sailor-1029-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Sailor 1029银夹鱼雷",
    url: "https://www.bing.com/search?q=%22Sailor%22+%221029%22+%22%E9%93%B6%E5%A4%B9%E9%B1%BC%E9%9B%B7%22+%22%E9%92%A2%E7%AC%94%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Sailor 1029银夹鱼雷 references. Keep the page as a research queue until a reliable product/catalog source is attached.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-sailor-1911-series-official",
    sourceId: "sailor-official",
    title: "Sailor: 1911 Series",
    url: "https://en.sailor.co.jp/topics/1911-series/",
    itemType: "official_series_page",
    author: "The Sailor Pen Co., Ltd.",
    summary:
      "Official Sailor 1911 Series page used for family-level positioning, classic cigar shape, 21K/14K nib range, and converter/cartridge context.",
    allowedUse: "summary_only",
    reviewStatus: "approved",
  },
  {
    id: "source-sailor-1911-1219-official",
    sourceId: "sailor-official",
    title: "Sailor: 1911 S Fountain Pen 14K",
    url: "https://en.sailor.co.jp/product/11-1219/",
    itemType: "official_product_page",
    author: "The Sailor Pen Co., Ltd.",
    summary:
      "Official Sailor product page for 11-1219 / 1911 S 14K, used to anchor the 1219 standard torpedo entry without over-extending price claims.",
    allowedUse: "summary_only",
    reviewStatus: "approved",
  },
  {
    id: "source-sailor-1911-1521-official",
    sourceId: "sailor-official",
    title: "Sailor: 1911 S Fountain Pen 21K",
    url: "https://en.sailor.co.jp/product/11-1521/",
    itemType: "official_product_page",
    author: "The Sailor Pen Co., Ltd.",
    summary:
      "Official Sailor product page for 11-1521 / 1911 S 21K, used to separate 21K torpedo/Profit Standard evidence from Pro Gear naming.",
    allowedUse: "summary_only",
    reviewStatus: "approved",
  },
  {
    id: "source-sailor-pro-gear-official",
    sourceId: "sailor-official",
    title: "Sailor: Professional Gear Series",
    url: "https://en.sailor.co.jp/topics/professional-gear-series/",
    itemType: "official_series_page",
    author: "The Sailor Pen Co., Ltd.",
    summary:
      "Official Sailor Professional Gear series page used for flat-top Pro Gear family context and variant boundaries.",
    allowedUse: "summary_only",
    reviewStatus: "approved",
  },
  {
    id: "source-sailor-classic-ko-official",
    sourceId: "sailor-official",
    title: "Sailor: Classic Ko Maki-e Fountain Pen",
    url: "https://en.sailor.co.jp/topics/classic-ko-maki-e-fountain-pen-ballpoint-penbrinterview-of-the-prestigious-maki-e-atelier-that-created-the-classic-ko-jewelry-brand/",
    itemType: "official_story_page",
    author: "The Sailor Pen Co., Ltd.",
    summary:
      "Official Sailor story page for Classic Ko Maki-e writing instruments, used as a cautious anchor because this page is more design-story than full catalog spec.",
    allowedUse: "summary_only",
    reviewStatus: "approved",
  },
  {
    id: "source-sailor-king-of-pens-official",
    sourceId: "sailor-official",
    title: "Sailor: King of Pens",
    url: "https://en.sailor.co.jp/topics/king-of-pens/",
    itemType: "official_series_page",
    author: "The Sailor Pen Co., Ltd.",
    summary:
      "Official Sailor King of Pens page used for flagship positioning, oversized nib context, and material/variant boundaries.",
    allowedUse: "summary_only",
    reviewStatus: "approved",
  },
  {
    id: "source-sailor-promenade-1031-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Sailor Promenade漫步1031",
    url: "https://www.bing.com/search?q=%22Sailor%22+%22Promenade%22+%221031%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Sailor Promenade / 漫步1031. Use direct catalog, product, or reliable retailer evidence before asserting exact specs or status.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-sailor-shikiori-1224-official",
    sourceId: "sailor-official",
    title: "Sailor: Professional Gear Series SHIKIORI 11-1224",
    url: "https://en.sailor.co.jp/product/11-1224/",
    itemType: "official_product_page",
    author: "The Sailor Pen Co., Ltd.",
    summary:
      "Official Sailor product page for the SHIKIORI / Professional Gear Slim 11-1224 family, used for name, family, and 14K/convertor-cartridge context.",
    allowedUse: "summary_only",
    reviewStatus: "approved",
  },
  {
    id: "source-sailor-lucky-charm-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Sailor 转运石 / Lucky Charm",
    url: "https://www.bing.com/search?q=%22Sailor%22+%22Lucky+Charm%22+%22%E8%BD%AC%E8%BF%90%E7%9F%B3%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for the Sailor 转运石 / Lucky Charm naming. Keep product family, edition, and Chinese-market nickname pending direct evidence.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-sailor-naginata-togi-official",
    sourceId: "sailor-official",
    title: "Sailor: Naginata Togi special nib",
    url: "https://sailor.co.jp/product/10-7121/",
    itemType: "official_product_page",
    author: "The Sailor Pen Co., Ltd.",
    summary:
      "Official Sailor Japan product page used as a special-nib anchor for 长刀研 / Naginata Togi; the local entry still needs model-versus-nib reclassification review.",
    allowedUse: "summary_only",
    reviewStatus: "approved",
  },
  {
    id: "source-lamy-al-star-official",
    sourceId: "lamy-official",
    title: "LAMY: AL-star fountain pen",
    url: "https://www.lamy.com/en-us/p/lamy-al-star-fountain-pen",
    itemType: "official_product_page",
    author: "LAMY",
    summary:
      "Official LAMY AL-star fountain pen page used for aluminum body, transparent grip, steel nib, and cartridge/converter context.",
    allowedUse: "summary_only",
    reviewStatus: "approved",
  },
  {
    id: "source-lamy-dialog-official",
    sourceId: "lamy-official",
    title: "LAMY: dialog fountain pen",
    url: "https://www.lamy.com/en-us/p/lamy-dialog-fountain-pen",
    itemType: "official_product_page",
    author: "LAMY",
    summary:
      "Official LAMY dialog fountain pen page used for retractable nib/clip mechanism, designer context, and gold-nib positioning.",
    allowedUse: "summary_only",
    reviewStatus: "approved",
  },
  {
    id: "source-lamy-logo-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: LAMY logo fountain pen",
    url: "https://www.bing.com/search?q=%22LAMY+logo%22+%22fountain+pen%22+%22steel+nib%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for the LAMY logo fountain-pen entry. Use archived catalog or current official listing before treating specs and availability as stable.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-lamy-z27-converter-official",
    sourceId: "lamy-official",
    title: "LAMY: Z27 converter",
    url: "https://www.lamy.com/en-us/p/lamy-z-27-converter",
    itemType: "official_accessory_page",
    author: "LAMY",
    summary:
      "Official LAMY Z27 converter page used only as a compatibility clue for older LAMY entries; not a standalone model source for logo specifications.",
    allowedUse: "summary_only",
    reviewStatus: "approved",
  },
  {
    id: "source-lamy-studio-official",
    sourceId: "lamy-official",
    title: "LAMY: studio fountain pen",
    url: "https://www.lamy.com/en-us/p/lamy-studio-fountain-pen",
    itemType: "official_product_page",
    author: "LAMY",
    summary:
      "Official LAMY studio fountain pen page used for current product identity, design positioning, nib/options context, and cartridge/converter compatibility.",
    allowedUse: "summary_only",
    reviewStatus: "approved",
  },
  {
    id: "source-waterman-official-heritage",
    sourceId: "waterman-official",
    title: "Waterman: Heritage",
    url: "https://www.waterman.com/waterman-history.html",
    itemType: "official_history",
    author: "Waterman",
    summary:
      "Official Waterman heritage page used as a brand-level anchor for Waterman model pages while exact current product sources are attached.",
    allowedUse: "summary_only",
    reviewStatus: "approved",
  },
  {
    id: "source-waterman-expert-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Waterman Expert",
    url: "https://www.bing.com/search?q=%22Waterman%22+%22Expert%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Waterman Expert official pages, retail specs, and reviews. Use direct sources before asserting nib, dimensions, or local pricing.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-waterman-hemisphere-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Waterman Hemisphere / Charleston",
    url: "https://www.bing.com/search?q=%22Waterman%22+%22Hemisphere%22+%22Charleston%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for the mixed Charleston / Hemisphere local entry. Use to resolve whether the page should split into two Waterman model archives.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-waterman-carene-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Waterman Carene / Carène",
    url: "https://www.bing.com/search?q=%22Waterman%22+%22Carene%22+%22Car%C3%A8ne%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Waterman Carene / Carène official and review sources. Treat local service and accessory comments as pending until supported.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-gentleman-stationer-penbbs",
    sourceId: "gentleman-stationer",
    title: "The Gentleman Stationer: PenBBS",
    url: "https://www.gentlemanstationer.com/penbbs",
    itemType: "review_index",
    author: "The Gentleman Stationer",
    summary:
      "Secondary review index used for PenBBS community-origin context and the brand's modern Chinese fountain-pen presence in Western review coverage.",
    allowedUse: "summary_only",
    reviewStatus: "pending",
  },
  {
    id: "source-narratess-penbbs-fountain-pens",
    sourceId: "narratess",
    title: "Narratess: Blogmas: PenBBS Fountain Pens",
    url: "https://www.narratess.com/blogmas/blogmas-penbbs-fountain-pens/",
    itemType: "review_article",
    author: "Narratess",
    summary:
      "Secondary review article used for PenBBS buyer-facing context, Etsy/Taobao channels, color batches, and affordable model positioning.",
    allowedUse: "summary_only",
    reviewStatus: "pending",
  },
  {
    id: "source-penbbs-268-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: PenBBS 268",
    url: "https://www.bing.com/search?q=%22PenBBS+268%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for PenBBS 268 product, review, and filling-system evidence. Not direct evidence by itself.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-penbbs-456-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: PenBBS 456",
    url: "https://www.bing.com/search?q=%22PenBBS+456%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for PenBBS 456 product, review, and filling-system evidence. Use direct sources before resolving piston/vacuum naming.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-penbbs-469-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: PenBBS 469",
    url: "https://www.bing.com/search?q=%22PenBBS+469%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for PenBBS 469 product and review evidence. Use direct sources before asserting double-ended or filling-system details.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-penbbs-494-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: PenBBS 494",
    url: "https://www.bing.com/search?q=%22PenBBS+494%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for PenBBS 494 product and review evidence. Not direct evidence by itself.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-penbbs-gold-nib-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: PenBBS 金尖大明尖",
    url: "https://www.bing.com/search?q=%22PenBBS%22+%22%E9%87%91%E5%B0%96%22+%22%E5%A4%A7%E6%98%8E%E5%B0%96%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for PenBBS gold-nib / 大明尖 naming evidence. Keep nib material and size claims pending direct product or catalog sources.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-namiki-official-home",
    sourceId: "namiki-official",
    title: "Namiki official site",
    url: "https://www.pilot-namiki.com/en/",
    itemType: "official_brand_site",
    author: "Namiki / Pilot Corporation",
    summary:
      "Official Namiki site used for luxury Maki-e fountain-pen positioning and Pilot/Namiki brand context.",
    allowedUse: "summary_only",
    reviewStatus: "approved",
  },
  {
    id: "source-namiki-flying-dragon-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Namiki Flying Dragon / 飞升龙",
    url: "https://www.bing.com/search?q=%22Namiki%22+%22Flying+Dragon%22+%22%E9%A3%9E%E5%8D%87%E9%BE%99%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Namiki Flying Dragon / 飞升龙 artwork and collection identity. Use exact official or catalog source before writing artwork-level facts.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-hongdian-1866-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: HongDian 1866",
    url: "https://www.bing.com/search?q=%22HongDian+1866%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for HongDian 1866 product and review evidence. Use direct sources before asserting nib, cartridge/converter, or price details.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-hongdian-516-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: HongDian 516",
    url: "https://www.bing.com/search?q=%22HongDian+516%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for HongDian 516 product and review evidence. Use direct sources before asserting nib, cartridge, or price details.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-hongdian-517-517s-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: HongDian 517 / 517s",
    url: "https://www.bing.com/search?q=%22HongDian+517%22+%22HongDian+517s%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for HongDian 517 and 517s product, listing, and review evidence. Use direct sources before asserting whether 517 and 517s are variants or separate models.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-hongdian-6013-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: HongDian 6013 文武黑将",
    url: "https://www.bing.com/search?q=%22HongDian+6013%22+%22%E6%96%87%E6%AD%A6%E9%BB%91%E5%B0%86%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for HongDian 6013 / 文武黑将 naming, product pages, listings, and review evidence. Not direct evidence for specs by itself.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-hongdian-620-cocktail-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: HongDian 620 鸡尾酒",
    url: "https://www.bing.com/search?q=%22HongDian+620%22+%22%E9%B8%A1%E5%B0%BE%E9%85%92%22+%22Cocktail%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for HongDian 620 / 鸡尾酒 color-theme, product, and review evidence. Use direct sources before writing color or material claims.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-hongdian-m2-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: HongDian M2 迷你",
    url: "https://www.bing.com/search?q=%22HongDian+M2%22+%22%E8%BF%B7%E4%BD%A0%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for HongDian M2 / 迷你 product and review evidence. Pocket-size dimensions, filling system, and price need direct verification.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-hongdian-n6-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: HongDian N6 云章",
    url: "https://www.bing.com/search?q=%22HongDian+N6%22+%22%E4%BA%91%E7%AB%A0%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for HongDian N6 / 云章 product pages and user reviews. Strong value claims should stay as attributed opinion until sources are reviewed.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-hongdian-t1-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: HongDian T1 钛合金",
    url: "https://www.bing.com/search?q=%22HongDian+T1%22+%22%E9%92%9B%E5%90%88%E9%87%91%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for HongDian T1 / 钛合金 product, listing, and review evidence. Use direct sources before asserting material, weight, nib feel, or price.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-hongdian-qin-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: HongDian 秦",
    url: "https://www.bing.com/search?q=%22HongDian%22+%22%E7%A7%A6%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for HongDian 秦 model identity, product listings, and review evidence. Use direct sources before treating the theme name or specs as verified.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-hongdian-sumu-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: HongDian 苏木",
    url: "https://www.bing.com/search?q=%22HongDian%22+%22%E8%8B%8F%E6%9C%A8%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for HongDian 苏木 product and review evidence. User-experience claims such as seal performance need attributed review metadata.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-hongdian-yuanhangzhe-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: HongDian 远航者",
    url: "https://www.bing.com/search?q=%22HongDian%22+%22%E8%BF%9C%E8%88%AA%E8%80%85%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for HongDian 远航者 product, listing, and review evidence. Not direct evidence for material, filling system, or price by itself.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-hongdian-black-forest-pro-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: HongDian Black Forest / Black Forest Pro",
    url: "https://www.bing.com/search?q=%22HongDian%22+%22Black+Forest%22+%22Black+Forest+Pro%22+%221861%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for HongDian Black Forest, Black Forest Pro, and 1861 naming evidence. Use direct sources before merging or splitting the local page.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-delike-element-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Delike Element / 元素系列",
    url: "https://www.bing.com/search?q=%22Delike%22+%22Element%22+%22%E5%85%83%E7%B4%A0%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Delike Element / 元素系列 product pages, listings, and reviews. Use direct sources before asserting specs or series boundaries.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-kaco-edge-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: KACO Edge / 刀锋",
    url: "https://www.bing.com/search?q=%22KACO%22+%22Edge%22+%22%E5%88%80%E9%94%8B%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for KACO Edge / 刀锋 product pages, listings, and reviews. Use direct product or catalog evidence before writing specs.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-mg-retractable-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: M&G / 晨光 按动钢笔",
    url: "https://www.bing.com/search?q=%22M%26G%22+%22%E6%99%A8%E5%85%89%22+%22%E6%8C%89%E5%8A%A8%E9%92%A2%E7%AC%94%22+%22Capless%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for M&G / 晨光 retractable fountain-pen entries and Capless-comparison discussions. Use direct product and review sources before asserting mechanism, cartridge compatibility, or price.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-majohn-80mini-e-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Majohn 80mini-E",
    url: "https://www.bing.com/search?q=%22Majohn+80mini-E%22+%22Moonman+80mini-E%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Majohn / Moonman 80mini-E product pages, listings, and reviews. Use direct sources before asserting size, nib, cartridge, or price.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-majohn-a1-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Majohn A1 retractable",
    url: "https://www.bing.com/search?q=%22Majohn+A1%22+%22Moonman+A1%22+%22retractable%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Majohn A1 retractable fountain-pen product and review evidence. Capless comparisons and quality-control comments need attributed reviews.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-majohn-f9-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Majohn F9 法师",
    url: "https://www.bing.com/search?q=%22Majohn+F9%22+%22%E6%B3%95%E5%B8%88%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Majohn F9 / 法师 model identity, product pages, listings, and review evidence. Not direct evidence for specs by itself.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-majohn-m2-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Majohn M2",
    url: "https://www.bing.com/search?q=%22Majohn+M2%22+%22Moonman+M2%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Majohn / Moonman M2 demonstrator product and review evidence. Use direct sources before asserting filling system, material, or price.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-majohn-p140-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Majohn P140",
    url: "https://www.bing.com/search?q=%22Majohn+P140%22+%22Moonman+P140%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Majohn P140 product, listing, and review evidence. Use direct sources before asserting material, nib, filling system, or price.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-majohn-p141-titanium-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Majohn P141 钛合金",
    url: "https://www.bing.com/search?q=%22Majohn+P141%22+%22%E9%92%9B%E5%90%88%E9%87%91%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Majohn P141 titanium or metal-body variants. Material and hand-feel claims need product evidence and attributed reviews.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-majohn-q1-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Majohn Q1",
    url: "https://www.bing.com/search?q=%22Majohn+Q1%22+%22Moonman+Q1%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Majohn / Moonman Q1 product, listing, and review evidence. Use direct sources before asserting size, filling system, or price.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-majohn-v1-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Majohn V1 vacuum filler",
    url: "https://www.bing.com/search?q=%22Majohn+V1%22+%22Moonman+V1%22+%22vacuum%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Majohn V1 vacuum-filling and demonstrator claims. Use direct product or review sources before asserting mechanism and price.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-majohn-v60-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Majohn V60",
    url: "https://www.bing.com/search?q=%22Majohn+V60%22+%22Moonman+V60%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Majohn V60 product and review evidence. Comparative substitute claims need direct attribution and should not be treated as specs.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-majohn-wancai-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Majohn 丸彩",
    url: "https://www.bing.com/search?q=%22Majohn%22+%22%E4%B8%B8%E5%BD%A9%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Majohn 丸彩 pocket/EDC model evidence. Use direct sources before asserting dimensions, material, or portability claims.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-picasso-916-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Picasso 916",
    url: "https://www.bing.com/search?q=%22Picasso+916%22+%22%E6%AF%95%E5%8A%A0%E7%B4%A2+916%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Picasso 916 product, listing, and review evidence. Use direct sources before asserting nib, filling system, material, or price.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-wingsung-236-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Wing Sung 236",
    url: "https://www.bing.com/search?q=%22Wing+Sung+236%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Wing Sung 236 old-stock, filling-system, rubber-sac, and collector discussion evidence. Direct repair/catalog sources are needed before making vintage-condition claims.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-wingsung-3013-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Wing Sung 3013 vacuum filler",
    url: "https://www.bing.com/search?q=%22Wing+Sung+3013%22+%22fountain+pen%22+%22vacuum%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Wing Sung 3013 product, listing, and vacuum/plunger-filler review evidence. Use direct sources before asserting mechanism, price, or material.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-wingsung-322-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Wing Sung 322",
    url: "https://www.bing.com/search?q=%22Wing+Sung+322%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Wing Sung 322 model identity, nib, filling-system, and low-price evidence. Treat review snippets as leads until direct product/catalog sources are attached.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-wingsung-601-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Wing Sung 601",
    url: "https://www.bing.com/search?q=%22Wing+Sung+601%22+%22fountain+pen%22+%22Parker+51%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Wing Sung 601 product, review, Parker 51-style comparison, hooded-nib, and filling-system evidence. Use direct sources before asserting mechanism or version details.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-wingsung-601a-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Wing Sung 601A",
    url: "https://www.bing.com/search?q=%22Wing+Sung+601A%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Wing Sung 601A product and review evidence. Use to separate 601, 601A, hooded/open-nib variants, and filling-system claims.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-gentleman-stationer-wingsung-618-698",
    sourceId: "gentleman-stationer",
    title: "The Gentleman Stationer: Workhorse Pens - Wing Sung 698 and 618",
    url: "https://www.gentlemanstationer.com/blog/2017/11/15/workhorse-pens-cheap-chinese-fountain-pens-wing-sung-698-and-618",
    itemType: "review_article",
    author: "The Gentleman Stationer",
    summary:
      "Secondary hands-on review context for Wing Sung 698 and 618 as inexpensive piston-filler-style Chinese pens. Specs and prices remain time-scoped.",
    allowedUse: "summary_only",
    reviewStatus: "pending",
  },
  {
    id: "source-scribblejot-wingsung-698",
    sourceId: "scribblejot",
    title: "Scribble Jot: Wing Sung 698",
    url: "https://scribblejot.com/2017/05/13/wing-sung-698/",
    itemType: "review_article",
    author: "Scribble Jot",
    summary:
      "Secondary review anchor for the Wing Sung 698, used to keep piston-filler, nib, and value claims attributed rather than treated as official facts.",
    allowedUse: "summary_only",
    reviewStatus: "pending",
  },
  {
    id: "source-wellappointed-wingsung-618",
    sourceId: "well-appointed-desk",
    title: "The Well-Appointed Desk: Wing Sung 618",
    url: "https://www.wellappointeddesk.com/2017/10/fountain-pen-review-wing-sung-618/",
    itemType: "review_article",
    author: "The Well-Appointed Desk",
    summary:
      "Secondary review anchor for Wing Sung 618, useful for consumer-facing context and comparison language while specs remain review-gated.",
    allowedUse: "summary_only",
    reviewStatus: "pending",
  },
  {
    id: "source-wingsung-699-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Wing Sung 699 vacuum filler",
    url: "https://www.bing.com/search?q=%22Wing+Sung+699%22+%22fountain+pen%22+%22vacuum%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Wing Sung 699 product and vacuum-filler review evidence. Use direct product/review sources before asserting mechanism, price, or Pilot Custom 823 comparison claims.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-wingsung-729-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Wing Sung 729",
    url: "https://www.bing.com/search?q=%22Wing+Sung+729%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for the ambiguous Wing Sung 729 entry. Use to confirm whether the local page refers to a Wing Sung model, a 729-branded pen, or a misclassified entry.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-wingsung-840-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Wing Sung 840",
    url: "https://www.bing.com/search?q=%22Wing+Sung+840%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Wing Sung 840 model identity, nib, filling system, material, and low-price evidence. Direct product or catalog sources are required before specs become factual.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-parker-51-modern-official-search",
    sourceId: "public-web-research-index",
    title: "Research index: Parker 51 modern reissue official/product evidence",
    url: "https://www.bing.com/search?q=%22Parker+51%22+%22fountain+pen%22+%22reissue%22+%22parkerpen.com%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for current/archived Parker 51 reissue official pages, retail product pages, and reviews. Official pages may be region or bot-protected, so exact product facts stay pending.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-gentleman-stationer-parker-51-reissue",
    sourceId: "gentleman-stationer",
    title: "The Gentleman Stationer: The new Parker 51",
    url: "https://www.gentlemanstationer.com/blog/2021/1/25/pen-review-the-new-parker-51",
    itemType: "review_article",
    author: "The Gentleman Stationer",
    summary:
      "Secondary review context for the modern Parker 51 reissue. Use to separate collector expectations, design continuity, and hands-on impressions from official product facts.",
    allowedUse: "summary_only",
    reviewStatus: "pending",
  },
  {
    id: "source-parker-im-official-search",
    sourceId: "public-web-research-index",
    title: "Research index: Parker IM fountain pen official/product evidence",
    url: "https://www.bing.com/search?q=%22Parker+IM%22+%22fountain+pen%22+%22parkerpen.com%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Parker IM official collection/product pages, retail specs, and reviews. Use direct sources before asserting nib, finish, price, or regional availability.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-parker-duofold-modern-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Parker Duofold modern / Centennial",
    url: "https://www.bing.com/search?q=%22Parker+Duofold%22+%22fountain+pen%22+%22Centennial%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Parker Duofold modern/Centennial official pages, reviews, and historical context. Use direct sources before asserting 1921 lineage, current specs, or local price claims.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-parker-jotter-fp-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Parker Jotter fountain pen",
    url: "https://www.bing.com/search?q=%22Parker+Jotter%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Parker Jotter fountain-pen product pages, retailer specs, and reviews. Use direct evidence before mapping ballpoint-family context to fountain-pen specs.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-parker-sonnet-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Parker Sonnet fountain pen",
    url: "https://www.bing.com/search?q=%22Parker+Sonnet%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Parker Sonnet official/product pages and long-term reviews. Nib options, finish variants, price, and comparison claims require direct sources.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-parker-vector-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Parker Vector fountain pen",
    url: "https://www.bing.com/search?q=%22Parker+Vector%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Parker Vector product, student/entry positioning, and review evidence. Use direct product or archive sources before asserting current availability or specs.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-sheaffer-generic-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Sheaffer generic pen entry",
    url: "https://www.bing.com/search?q=%22Sheaffer%22+%22fountain+pen%22+brand+history+official",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for the misclassified Sheaffer brand-generic pen entry. Use to decide whether this local record should be merged into the Sheaffer brand page or split into concrete model archives.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-sheaffer-imperial-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Sheaffer Imperial / Legacy Chinese naming",
    url: "https://www.bing.com/search?q=%22Sheaffer+Imperial%22+%22fountain+pen%22+%22%E7%8A%80%E9%A3%9E%E5%88%A9%22+%22%E5%B8%9D%E5%9B%BD%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Sheaffer Imperial/Legacy naming and the local Chinese 帝国元首 entry. Use direct catalog/review evidence before deciding whether the page maps to Imperial, Legacy, or another Sheaffer model.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-platinum-curidas-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Platinum Curidas",
    url: "https://www.bing.com/search?q=%22Platinum+Curidas%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Platinum Curidas official pages, reviews, retractable mechanism, sealing, and price evidence. Use direct sources before asserting dryness or mechanism performance.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-platinum-izumo-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Platinum Izumo",
    url: "https://www.bing.com/search?q=%22Platinum+Izumo%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Platinum Izumo official pages, urushi/wood/body variants, reviews, and Japanese-craft positioning. Use direct sources before asserting material or model-family details.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-platinum-fuji-shunkei-pnb13000-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Platinum 富士旬景 PNB-13000",
    url: "https://www.bing.com/search?q=%22Platinum%22+%22PNB-13000%22+%22%E5%AF%8C%E5%A3%AB%E6%97%AC%E6%99%AF%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Platinum 富士旬景 / PNB-13000 product identity, seasonal color mapping, and #3776 relationship evidence. Use direct sources before writing upgrade-positioning claims.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-platinum-preppy-pq200-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Platinum 小流星 / Preppy PQ200",
    url: "https://www.bing.com/search?q=%22Platinum%22+%22PQ200%22+%22Preppy%22+%22%E5%B0%8F%E6%B5%81%E6%98%9F%22+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Platinum 小流星 / Preppy PQ200 naming, cartridge compatibility, nib, and entry-level pricing evidence. Use direct sources before merging Chinese nickname with official SKU.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-platinum-president-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Platinum President",
    url: "https://www.bing.com/search?q=%22Platinum+President%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Platinum President official/archive pages, nib, filling system, status, and high-end positioning. Use direct sources before asserting current availability or flagship claims.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-platinum-makie-series-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Platinum Maki-e series",
    url: "https://www.bing.com/search?q=%22Platinum%22+%22Maki-e%22+%22fountain+pen%22+official+%22%E8%8E%B3%E7%BB%98%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Platinum Maki-e fountain-pen series, decorative technique, model-family boundaries, and price evidence. Use official/catalog sources before making artwork or material claims.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-snowhite-fp20-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Snowhite FP20 fountain pen",
    url: "https://www.bing.com/search?q=%22Snowhite+FP20%22+%22fountain+pen%22+%E7%99%BD%E9%9B%AA+FP20",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Snowhite FP20 product identity, nib, cartridge/filling notes, and Chinese stationery-channel evidence. Use direct product/catalog sources before asserting specs.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pilot-78g-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pilot 78G / 78G+",
    url: "https://www.bing.com/search?q=%22Pilot+78G%22+%2278G%2B%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pilot 78G/78G+ model identity, student/entry reputation, nib/filling details, and current availability. Use direct catalog or product sources before verifying claims.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pilot-845-urushi-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pilot Custom 845 Urushi",
    url: "https://www.bing.com/search?q=%22Pilot+Custom+845%22+Urushi+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pilot Custom 845 Urushi official/product evidence, urushi body claims, nib, filling system, and comparisons with Custom 823 or Montblanc 149.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pilot-88g-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pilot 88G fountain pen",
    url: "https://www.bing.com/search?q=%22Pilot+88G%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pilot 88G product identity, relationship to 78G/Metropolitan-family discussions, nib, material, and entry-level pricing evidence.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pilot-custom-912-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pilot Custom Heritage 912",
    url: "https://www.bing.com/search?q=%22Pilot+Custom+Heritage+912%22+PO+nib+%22fountain+pen%22+official+review+Reddit",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pilot Custom Heritage 912 identity, PO and specialty nib discussions, nib/feed evidence, and Reddit/review context. Direct sources are required before writing nib facts.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pilot-capless-decimo-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pilot Capless / Decimo",
    url: "https://www.bing.com/search?q=%22Pilot+Capless%22+Decimo+%22fountain+pen%22+official+review+Vanishing+Point",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pilot Capless/Decimo/Vanishing Point naming, retractable mechanism, nib unit, cartridge/converter notes, and long-term reviews.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pilot-cavalier-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pilot Cavalier fountain pen",
    url: "https://www.bing.com/search?q=%22Pilot+Cavalier%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pilot Cavalier slim-body identity, EDC positioning, nib, filling compatibility, material, and availability evidence.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pilot-custom-74-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pilot Custom 74",
    url: "https://www.bing.com/search?q=%22Pilot+Custom+74%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pilot Custom 74 official/product evidence, nib sizes, converter compatibility, entry-gold-nib reputation, and price anecdotes.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pilot-custom-742-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pilot Custom 742",
    url: "https://www.bing.com/search?q=%22Pilot+Custom+742%22+FA+nib+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pilot Custom 742 identity, nib-size options, FA nib discussions, relationship to Custom 743/823, and product evidence.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pilot-custom-743-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pilot Custom 743",
    url: "https://www.bing.com/search?q=%22Pilot+Custom+743%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pilot Custom 743 official/product evidence, #15 nib context, relation to Custom 823, filling system, and market price notes.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pilot-custom-823-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pilot Custom 823",
    url: "https://www.bing.com/search?q=%22Pilot+Custom+823%22+%22fountain+pen%22+official+review+vacuum",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pilot Custom 823 official/product evidence, vacuum-filler mechanism, color/version notes, cleaning comments, and community reputation.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pilot-elite-95s-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pilot Elite 95S / E95S",
    url: "https://www.bing.com/search?q=%22Pilot+Elite+95S%22+E95S+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pilot Elite 95S/E95S pocket-pen identity, inlaid nib, portability, metal/body claims, and current availability evidence.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pilot-heritage-91-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pilot Custom Heritage 91",
    url: "https://www.bing.com/search?q=%22Pilot+Custom+Heritage+91%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pilot Custom Heritage 91 identity, relationship to Custom 74, nib, filling system, body design, and Chinese price anecdotes.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pilot-heritage-92-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pilot Custom Heritage 92",
    url: "https://www.bing.com/search?q=%22Pilot+Custom+Heritage+92%22+%22fountain+pen%22+official+review+piston",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pilot Custom Heritage 92 product identity, piston-filler evidence, nib, demonstrator body, and price notes.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pilot-iroshizuku-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pilot Iroshizuku ink line",
    url: "https://www.bing.com/search?q=%22Pilot+Iroshizuku%22+%E8%89%B2%E5%BD%A9%E9%9B%AB+ink+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pilot Iroshizuku ink-line identity, color names, bottle sizes, shading/review claims, and the local need to reclassify it away from fountain-pen model pages.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pilot-prera-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pilot Prera",
    url: "https://www.bing.com/search?q=%22Pilot+Prera%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pilot Prera product identity, compact body, color/clear variants, nib compatibility, and Japanese-market popularity claims.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pilot-kakuno-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pilot Kakuno",
    url: "https://www.bing.com/search?q=%22Pilot+Kakuno%22+%E7%AC%91%E8%84%B8+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pilot Kakuno official/product evidence, smiley nib, beginner/student positioning, nib, filling system, and child-friendly claims.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pilot-cocoon-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pilot Cocoon / Metropolitan",
    url: "https://www.bing.com/search?q=%22Pilot+Cocoon%22+Metropolitan+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pilot Cocoon/Metropolitan naming, light-business positioning, metal body, nib, filling system, and regional model identity.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pelikan-m1000-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pelikan Souveran M1000",
    url: "https://www.bing.com/search?q=%22Pelikan+M1000%22+Souveran+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pelikan Souveran M1000 official/product evidence, nib size, piston filler, dimensions, hand-size comments, and comparisons with M800.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pelikan-m1005-stresemann-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pelikan M1005 Stresemann",
    url: "https://www.bing.com/search?q=%22Pelikan+M1005+Stresemann%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pelikan M1005 Stresemann colorway/trim identity, nib, piston filler, limited or availability status, and high-price claims.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pelikan-m200-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pelikan M200",
    url: "https://www.bing.com/search?q=%22Pelikan+M200%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pelikan M200 product evidence, steel nib, piston filler, material, dimensions, and entry-level German piston-filler positioning.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pelikan-m400-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pelikan Souveran M400",
    url: "https://www.bing.com/search?q=%22Pelikan+M400%22+Souveran+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pelikan M400 official/product evidence, nib, piston filler, size, wet-writing reputation, and Custom 823 comparison claims.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pelikan-m600-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pelikan Souveran M600",
    url: "https://www.bing.com/search?q=%22Pelikan+M600%22+Souveran+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pelikan M600 official/product evidence, size positioning between M400 and M800, nib, piston filler, and pricing.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pelikan-m605-white-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pelikan M605 white stripe / white tortoise",
    url: "https://www.bing.com/search?q=%22Pelikan+M605%22+white+stripe+%E7%99%BD%E4%B9%8C%E9%BE%9F+%22fountain+pen%22",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pelikan M605 white-stripe/white-tortoise naming, colorway identity, nib, piston filler, availability, and collector popularity claims.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pelikan-m815-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pelikan M815",
    url: "https://www.bing.com/search?q=%22Pelikan+M815%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pelikan M815 product identity, M800-family positioning, metal stripe or trim claims, 18K nib, piston filler, and high-price claims.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pelikan-p457-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pelikan P457",
    url: "https://www.bing.com/search?q=%22Pelikan+P457%22+%22fountain+pen%22+Safari+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pelikan P457 product identity, Safari comparison context, nib, filling system, material, and whether the entry is a stable fountain-pen model.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-pelikan-m800-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Pelikan Souveran M800",
    url: "https://www.bing.com/search?q=%22Pelikan+Souveran+M800%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Pelikan Souveran M800 product evidence, M800-size positioning, nib, piston filler, striped body, weight, dimensions, and M600/M1000 comparisons.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-visconti-rembrandt-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Visconti Rembrandt",
    url: "https://www.bing.com/search?q=%22Visconti+Rembrandt%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Visconti Rembrandt product identity, resin/acrylic material, magnetic cap claims, steel nib, cartridge/converter filling, and entry-art line positioning.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-visconti-van-gogh-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Visconti Van Gogh",
    url: "https://www.bing.com/search?q=%22Visconti+Van+Gogh%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Visconti Van Gogh fountain pen editions, painting-inspired colors, material, nib, cartridge/converter filling, and mid-range positioning.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-hero-100-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Hero 100",
    url: "https://www.bing.com/search?q=%22Hero+100%22+%22fountain+pen%22+14K+review+%E8%8B%B1%E9%9B%84100",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Hero 100 product identity, 14K nib claims, hooded nib, filling system, aerometric-style mechanism, price, quality-control, and cap-seal comments.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-hero-329-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Hero 329",
    url: "https://www.bing.com/search?q=%22Hero+329%22+%22fountain+pen%22+%E8%8B%B1%E9%9B%84329",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Hero 329 product identity, low-price Chinese fountain pen positioning, hooded nib, filling system, production variants, and quality-control comments.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-hero-616-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Hero 616",
    url: "https://www.bing.com/search?q=%22Hero+616%22+%22fountain+pen%22+%E8%8B%B1%E9%9B%84616",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Hero 616 product identity, Parker 51-style context, hooded nib, filling system, school-pen memory, tuned-version claims, and quality-control comments.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-faber-castell-ambition-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Faber-Castell Ambition",
    url: "https://www.bing.com/search?q=%22Faber-Castell+Ambition%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Faber-Castell Ambition product identity, barrel materials, steel nib, cartridge/converter filling, dimensions, and design-entry positioning.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-faber-castell-e-motion-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Faber-Castell E-Motion",
    url: "https://www.bing.com/search?q=%22Faber-Castell+E-Motion%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Faber-Castell E-Motion product identity, pearwood/resin/metal barrel variants, steel nib, cartridge/converter filling, weight, and object-feel comments.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-faber-castell-ondoro-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Faber-Castell Ondoro smoked oak",
    url: "https://www.bing.com/search?q=%22Faber-Castell+Ondoro%22+smoked+oak+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Faber-Castell Ondoro smoked oak product identity, wooden faceted barrel, steel nib, cartridge/converter filling, availability, and material-design claims.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-gvfc-classic-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Graf von Faber-Castell Classic",
    url: "https://www.bing.com/search?q=%22Graf+von+Faber-Castell+Classic%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Graf von Faber-Castell Classic fountain pen identity, premium wood or metal variants, gold nib claims, cartridge/converter filling, and high-end build-quality comments.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-faber-castell-neo-slim-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Faber-Castell Neo Slim",
    url: "https://www.bing.com/search?q=%22Faber-Castell+Neo+Slim%22+%22fountain+pen%22+official+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Faber-Castell Neo Slim product identity, slim-body positioning, steel nib, cartridge/converter filling, finish variants, build quality, and writing-feel comments.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-faber-castell-loom-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Faber-Castell Loom",
    url: "https://www.bing.com/search?q=%22Faber-Castell+Loom%22+%22fountain+pen%22+official+review+260",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Faber-Castell Loom product identity, steel-nib reputation, anniversary or limited-version claims, price, cartridge/converter filling, and writing-feel comparisons.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-jinhao-10-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Jinhao 10",
    url: "https://www.bing.com/search?q=%22Jinhao+10%22+%22fountain+pen%22+%E9%87%91%E8%B1%AA10%E5%8F%B7",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Jinhao 10 product identity, low-price surprise claims, nib, filling system, material, finish variants, and value-for-money comments.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-jinhao-313-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Jinhao 313",
    url: "https://www.bing.com/search?q=%22Jinhao+313%22+%22fountain+pen%22+%E9%87%91%E8%B1%AA313",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Jinhao 313 product identity, steel nib, cartridge or converter claims, low-price range, student-use context, and quality-control comments.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-jinhao-619-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Jinhao 619",
    url: "https://www.bing.com/search?q=%22Jinhao+619%22+%22fountain+pen%22+%E9%87%91%E8%B1%AA619+1688",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Jinhao 619 product identity, wholesale or classroom-bulk-buying claims, nib, filling system, low-price distribution, and student-use comments.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-jinhao-75-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Jinhao 75",
    url: "https://www.bing.com/search?q=%22Jinhao+75%22+%22fountain+pen%22+%E9%87%91%E8%B1%AA75",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Jinhao 75 product identity, steel nib, cartridge/converter claims, low-price range, finish variants, and beginner-use positioning.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-jinhao-80-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Jinhao 80",
    url: "https://www.bing.com/search?q=%22Jinhao+80%22+%22fountain+pen%22+%E9%87%91%E8%B1%AA80",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Jinhao 80 product identity, steel nib, cartridge/converter claims, slim writing use, LAMY 2000-style discussion if present, and value claims.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-jinhao-82-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Jinhao 82",
    url: "https://www.bing.com/search?q=%22Jinhao+82%22+%22fountain+pen%22+%E9%87%91%E8%B1%AA82",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Jinhao 82 product identity, color options, low-price pocket-pen or toy-pen comments, cartridge/converter claims, and stationery-community popularity.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-jinhao-85-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Jinhao 85",
    url: "https://www.bing.com/search?q=%22Jinhao+85%22+%22fountain+pen%22+%E9%87%91%E8%B1%AA85",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Jinhao 85 product identity, hooded-nib or Parker 51-style discussion, steel nib, cartridge/converter claims, and low-price daily-use comments.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-jinhao-86-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Jinhao 86",
    url: "https://www.bing.com/search?q=%22Jinhao+86%22+%22fountain+pen%22+%E9%87%91%E8%B1%AA86",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Jinhao 86 product identity, steel nib, cartridge/converter claims, low-price daily-writing positioning, finish variants, and quality-control comments.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-jinhao-9035-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Jinhao 9035",
    url: "https://www.bing.com/search?q=%22Jinhao+9035%22+%22fountain+pen%22+%E9%87%91%E8%B1%AA9035",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Jinhao 9035 product identity, steel nib, cartridge/converter claims, wooden or material variants if present, price, and daily-writing comments.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-jinhao-9056-wood-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Jinhao 9056 wood barrel",
    url: "https://www.bing.com/search?q=%22Jinhao+9056%22+wood+%22fountain+pen%22+%E9%87%91%E8%B1%AA9056",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Jinhao 9056 wood-barrel product identity, wooden body claims, nib, cartridge/converter filling, price, finish variants, and material-value comments.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-jinhao-911-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Jinhao 911",
    url: "https://www.bing.com/search?q=%22Jinhao+911%22+%22fountain+pen%22+%E9%87%91%E8%B1%AA911",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Jinhao 911 product identity, steel nib, cartridge/converter claims, 10-30 price range, daily-writing positioning, and quality-control comments.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-jinhao-992-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Jinhao 992",
    url: "https://www.bing.com/search?q=%22Jinhao+992%22+%22fountain+pen%22+%E9%87%91%E8%B1%AA992",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Jinhao 992 product identity, low-price usable-pen claims, plastic cracking discussion, nib, cartridge/converter filling, and beginner-use comments.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-jinhao-x159-159-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Jinhao X159 / 159",
    url: "https://www.bing.com/search?q=%22Jinhao+X159%22+159+%22fountain+pen%22+review",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Jinhao X159/159 product identity, large-body positioning, overseas popularity, nib sizes, cartridge/converter filling, and Montblanc 149 comparison claims.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-jinhao-century-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Jinhao Century / 100",
    url: "https://www.bing.com/search?q=%22Jinhao+Century%22+%22Jinhao+100%22+%22fountain+pen%22+%E9%87%91%E8%B1%AA%E4%B8%96%E7%BA%AA",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Jinhao Century/Jinhao 100 identity, large nib claims, demonstrator or hollow variants, price, filling system, and flagship reputation.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-jinhao-silver-hollow-century-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Jinhao silver hollow Century",
    url: "https://www.bing.com/search?q=%22Jinhao+Century%22+silver+hollow+%22fountain+pen%22+%E9%87%91%E8%B1%AA%E7%BA%AF%E9%93%B6%E9%95%82%E7%A9%BA%E4%B8%96%E7%BA%AA",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Jinhao silver hollow Century identity, silver-decoration claims, demonstrator body, nib, filling system, sub-100 price claims, and material-value comments.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-cross-bailey-light-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Cross Bailey Light",
    url: "https://www.bing.com/search?q=%22Cross+Bailey+Light%22+%22fountain+pen%22+official+review+%E4%BD%B0%E5%88%A9%E8%BD%BB%E7%9B%88",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Cross Bailey Light product identity, brand-positioning, steel nib, cartridge/converter filling, light body, price, and build-quality comments.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
  {
    id: "source-cross-shakespeare-public-search",
    sourceId: "public-web-research-index",
    title: "Research index: Cross Shakespeare",
    url: "https://www.bing.com/search?q=%22Cross+Shakespeare%22+%22fountain+pen%22+%E9%AB%98%E4%BB%95+%E8%8E%8E%E5%A3%AB%E6%AF%94%E4%BA%9A",
    itemType: "research_index",
    author: "Project editorial research",
    summary:
      "Search index for Cross Shakespeare product identity, whether it is a stable Cross fountain-pen model or local naming, price, nib, filling system, and entry-international-brand claims.",
    allowedUse: "link_only",
    reviewStatus: "pending",
  },
];

const RESEARCH_SPEC = {
  releaseYear: "待核验",
  dimensions: "待核验",
  weight: "待核验",
  status: "待核验",
  reviewStatus: "needs_source" as const,
};

function makeBoundaryClaim(
  id: string,
  modelName: string,
  sourceItemId: string,
  focus: string,
): ClaimSeed {
  return {
    id,
    predicate: "evidence_boundary",
    text: `${modelName} currently needs direct product, catalog, or review sources before this library treats ${focus} as verified facts.`,
    sourceItemId,
    evidenceLocator: "Research queue / source boundary",
    confidence: 0.42,
    reviewStatus: "needs_source",
  };
}

function makeOfficialClaim(
  id: string,
  predicate: string,
  text: string,
  sourceItemId: string,
  evidenceLocator: string,
): ClaimSeed {
  return {
    id,
    predicate,
    text,
    sourceItemId,
    evidenceLocator,
    confidence: 0.82,
    reviewStatus: "approved",
  };
}

function makeResearchStory(options: {
  id: string;
  title: string;
  summary: string;
  bodyMd: string;
  sourceNotes: string;
  sourceItemIds: string[];
  claimIds: string[];
}): StorySeed {
  return {
    ...options,
    status: "needs_sources",
  };
}

function makeSearchOnlyModel(options: {
  slug: string;
  brandSlug: string;
  aliases: AliasSeed[];
  sourceItemId: string;
  specId: string;
  seriesName: string;
  originCountry: string;
  nib: string;
  fillSystem: string;
  material: string;
  priceRange: string;
  claimId: string;
  modelName: string;
  focus: string;
  storyId: string;
  storyTitle: string;
  storySummary: string;
  storyBodyMd: string;
  sourceNotes?: string;
  variants?: VariantSeed[];
}): ModelGapSeed {
  return {
    slug: options.slug,
    brandSlug: options.brandSlug,
    aliases: options.aliases,
    sourceItemIds: [options.sourceItemId],
    spec: {
      id: options.specId,
      seriesName: options.seriesName,
      originCountry: options.originCountry,
      nib: options.nib,
      fillSystem: options.fillSystem,
      material: options.material,
      priceRange: options.priceRange,
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        options.claimId,
        options.modelName,
        options.sourceItemId,
        options.focus,
      ),
    ],
    story: makeResearchStory({
      id: options.storyId,
      title: options.storyTitle,
      summary: options.storySummary,
      bodyMd: options.storyBodyMd,
      sourceNotes:
        options.sourceNotes ??
        "Research queue only. Direct product/catalog/review evidence is required before specs and price notes become factual.",
      sourceItemIds: [options.sourceItemId],
      claimIds: [options.claimId],
    }),
    variants: options.variants,
  };
}

const MODELS: ModelGapSeed[] = [
  {
    slug: "kaco-master大师14k",
    brandSlug: "kaco",
    aliases: [
      { alias: "KACO Master 14K", language: "en" },
      { alias: "Master大师14K", language: "zh" },
    ],
    sourceItemIds: ["source-kaco-master-14k-public-search"],
    spec: {
      id: "spec-kaco-master-14k-research",
      seriesName: "Master / 大师",
      originCountry: "中国（待核验）",
      nib: "14K 金尖说法待核验",
      fillSystem: "上墨方式待核验",
      material: "笔身材质待核验",
      priceRange: "入门金尖价位说法待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-kaco-master-14k-source-boundary",
        "KACO Master大师14K",
        "source-kaco-master-14k-public-search",
        "14K nib, price-positioning, and specification notes",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-kaco-master-14k-research",
      title: "把 Master大师14K 先放进金尖入门研究队列",
      summary:
        "KACO Master大师14K 先按待核验型号档案处理：保留“低价 14K 金尖”这一玩家记忆，但不把价格、笔尖和版本写成已审核事实。",
      bodyMd:
        "KACO Master大师14K 的页面目前最需要的不是更多形容词，而是**直接产品页、规格表或可靠评测**。站内原始摘要把它放在“预算卡 500 想摸金尖”的语境里，这说明它有明确的玩家入口；但在没有稳定来源前，14K 笔尖、实际价格、上墨方式、笔身材质和版本差异都应保持待核验。\n\n这个档案先把它归入 KACO 的现代中国文具设计与入门金尖讨论中，后续补证优先级为：官方/店铺产品页、包装或说明书、长期评测、拆解或实测重量尺寸。",
      sourceNotes:
        "Research queue only. The search index is not direct evidence; use it to locate direct product/catalog/review sources.",
      sourceItemIds: ["source-kaco-master-14k-public-search"],
      claimIds: ["claim-kaco-master-14k-source-boundary"],
    }),
  },
  {
    slug: "kaco-sky百锋",
    brandSlug: "kaco",
    aliases: [
      { alias: "KACO SKY", language: "en" },
      { alias: "KACO 百锋", language: "zh" },
    ],
    sourceItemIds: ["source-kaco-sky-public-search"],
    spec: {
      id: "spec-kaco-sky-research",
      seriesName: "SKY / 百锋",
      originCountry: "中国（待核验）",
      nib: "钢尖说法待核验",
      fillSystem: "上墨方式待核验",
      material: "笔身材质待核验",
      priceRange: "入门/中端说法待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-kaco-sky-source-boundary",
        "KACO SKY百锋",
        "source-kaco-sky-public-search",
        "design-positioning, nib, filling-system, and model naming",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-kaco-sky-research",
      title: "把 SKY百锋 先做成设计向待核验档案",
      summary:
        "KACO SKY百锋 暂时以外观设计和现代国产文具语境作为入口，规格、版本和命名边界等待直接来源补证。",
      bodyMd:
        "KACO SKY百锋 的原始摘要强调“外观设计在国产里算突出”，这类评价很容易变成空泛夸奖。更稳妥的处理，是先把它放进 KACO 的现代设计文具路线里，并把具体问题拆开：SKY 与百锋是否完全同一型号、是否存在版本差异、笔尖/上墨/材质规格、以及玩家对外观和书写体验的长期反馈。\n\n当前页面只保留研究队列入口，不写成已审核型号故事。下一步应优先补官方产品页、零售规格页和长期评测。",
      sourceNotes:
        "Research queue only. The search index is not direct evidence; use it to locate direct product/catalog/review sources.",
      sourceItemIds: ["source-kaco-sky-public-search"],
      claimIds: ["claim-kaco-sky-source-boundary"],
    }),
  },
  {
    slug: "noodler鲶鱼-简易钢笔",
    brandSlug: "noodlers",
    aliases: [
      { alias: "Noodler's simple fountain pen", language: "en" },
      { alias: "Noodler's 简易钢笔", language: "zh" },
    ],
    sourceItemIds: [
      "source-noodlers-official-home",
      "source-noodlers-simple-public-search",
    ],
    spec: {
      id: "spec-noodlers-simple-research",
      seriesName: "待核验",
      originCountry: "美国（待核验）",
      nib: "钢尖说法待核验",
      fillSystem: "滴入式说法待核验",
      material: "笔身材质待核验",
      priceRange: "入门价位说法待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-noodlers-simple-source-boundary",
        "Noodler鲶鱼 简易钢笔",
        "source-noodlers-simple-public-search",
        "model identity, nib, eyedropper/filling notes, and material claims",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-noodlers-simple-research",
      title: "先解决 Noodler's 简易钢笔的型号身份",
      summary:
        "Noodler's 简易钢笔先作为待拆分条目保留，重点确认它应对应 Charlie、Creaper、Ahab、Konrad 还是其他具体型号。",
      bodyMd:
        "这个条目的最大问题不是缺少一句介绍，而是**型号身份不够精确**。Noodler's 的钢笔线有多个入门和可调笔尖型号，站内当前的“简易钢笔”名称不足以直接落规格。\n\n本页暂时作为研究队列：先用 Noodler's 官方站作为品牌锚点，再用公开搜索入口收集具体产品页、零售规格和评测。确认具体型号后，应拆成独立型号档案，避免把 Charlie、Creaper、Ahab 或 Konrad 的信息混在一起。",
      sourceNotes:
        "Official site is brand-level context only. Product identity and specs remain needs_source.",
      sourceItemIds: [
        "source-noodlers-official-home",
        "source-noodlers-simple-public-search",
      ],
      claimIds: ["claim-noodlers-simple-source-boundary"],
    }),
  },
  {
    slug: "skb派顿-f10-f21",
    brandSlug: "skb",
    aliases: [
      { alias: "SKB F10 / F21", language: "en" },
      { alias: "SKB 派顿 F10 / F21", language: "zh" },
    ],
    sourceItemIds: ["source-skb-f10-f21-public-search"],
    spec: {
      id: "spec-skb-f10-f21-research",
      seriesName: "F10 / F21",
      originCountry: "台湾（待核验）",
      nib: "钢尖说法待核验",
      fillSystem: "墨囊说法待核验",
      material: "笔身材质待核验",
      priceRange: "待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-skb-f10-f21-source-boundary",
        "SKB派顿 F10 / F21",
        "source-skb-f10-f21-public-search",
        "Paxton/派顿 naming, F10/F21 mapping, and cartridge/nib specs",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-skb-f10-f21-research",
      title: "把 F10 / F21 先放进 SKB 派顿型号队列",
      summary:
        "SKB派顿 F10 / F21 目前保留为待核验组合型号，优先确认派顿命名、F10/F21 关系和具体规格。",
      bodyMd:
        "SKB 的品牌馆已经有较清楚的台湾钢笔史入口，但 F10 / F21 这个型号页还需要单独补证。当前名称同时包含“派顿”和两个型号编号，最容易出现的问题是把套装、系列、颜色或两支不同型号合并成一个页面。\n\n这页先保留为研究队列。后续应先确认 F10 与 F21 是否应拆成两个档案，再补官方产品页、目录图、零售规格和实物评测。",
      sourceNotes:
        "Research queue only. Direct SKB product/catalog evidence is required before specs can be treated as factual.",
      sourceItemIds: ["source-skb-f10-f21-public-search"],
      claimIds: ["claim-skb-f10-f21-source-boundary"],
    }),
  },
  {
    slug: "万宝龙-montblanc-学生龙22",
    brandSlug: "montblanc",
    aliases: [
      { alias: "Montblanc 22", language: "en" },
      { alias: "万宝龙 22", language: "zh" },
      { alias: "学生龙22", language: "zh" },
    ],
    sourceItemIds: ["source-montblanc-22-public-search"],
    spec: {
      id: "spec-montblanc-22-research",
      seriesName: "22 / vintage line",
      originCountry: "德国（待核验）",
      nib: "金尖说法待核验",
      fillSystem: "活塞/上墨方式待核验",
      material: "笔身材质待核验",
      priceRange: "二手入门万宝龙说法待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-montblanc-22-source-boundary",
        "万宝龙 Montblanc 学生龙22",
        "source-montblanc-22-public-search",
        "vintage dating, nib material, filling system, and Chinese nickname",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-montblanc-22-research",
      title: "把 Montblanc 22 先作为 vintage 入门研究页",
      summary:
        "Montblanc 22 暂时按 vintage 待核验型号处理：保留“二手入门万宝龙”的玩家语境，但不写死年代、笔尖和上墨方式。",
      bodyMd:
        "Montblanc 22 这种 vintage 条目很容易被二手市场昵称带偏。站内原始摘要把它称作“学生龙22”，并放在二手市场入门金尖的语境里；但这类说法需要目录、可靠资料站或长期收藏资料交叉确认。\n\n当前档案先建立边界：它属于 Montblanc vintage 研究队列，后续要优先补 catalog/repair/collector 来源，再确定年代、笔尖材质、上墨系统、尺寸和与 12/14/22/24 等相邻型号的关系。",
      sourceNotes:
        "Research queue only. The search index is not direct evidence for vintage dating or specs.",
      sourceItemIds: ["source-montblanc-22-public-search"],
      claimIds: ["claim-montblanc-22-source-boundary"],
    }),
  },
  {
    slug: "万特佳",
    brandSlug: "monteverde",
    aliases: [
      { alias: "Monteverde unspecified model", language: "en" },
      { alias: "万特佳 待核验型号", language: "zh" },
    ],
    sourceItemIds: ["source-monteverde-unspecified-public-search"],
    spec: {
      id: "spec-monteverde-unspecified-research",
      seriesName: "待拆分型号",
      originCountry: "待核验",
      nib: "钢尖说法待核验",
      fillSystem: "上墨方式待核验",
      material: "笔身材质待核验",
      priceRange: "待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-monteverde-unspecified-source-boundary",
        "万特佳 —",
        "source-monteverde-unspecified-public-search",
        "exact model identity and all specifications",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-monteverde-unspecified-research",
      title: "先把万特佳无型号页拆成研究入口",
      summary:
        "当前“万特佳 —”不是可审核的具体型号名，先保留为待拆分入口，后续应拆到 Ritma、Invincia、Regatta 等具体型号。",
      bodyMd:
        "这个页面最大的问题是名字本身：只有品牌，没有具体型号。继续在这个页面补规格会制造伪精确。更合理的做法是把它保留为研究入口，用来收集 Monteverde 具体型号线索，然后拆分到真实型号档案。\n\n后续处理顺序应是：确认原始数据想指向哪个型号；如果无法确认，则把页面降级为品牌相关条目或合并到 Monteverde 品牌馆；只有在找到直接产品页后，才写入笔尖、上墨、材质和尺寸。",
      sourceNotes:
        "Research queue only. This entry should be split into concrete Monteverde model pages before factual specs are added.",
      sourceItemIds: ["source-monteverde-unspecified-public-search"],
      claimIds: ["claim-monteverde-unspecified-source-boundary"],
    }),
  },
  {
    slug: "中屋-nakaya-housoge高级定制",
    brandSlug: "nakaya",
    aliases: [
      { alias: "Nakaya Housoge", language: "en" },
      { alias: "中屋 Housoge 高级定制", language: "zh" },
    ],
    sourceItemIds: [
      "source-nakaya-products-official",
      "source-nakaya-housoge-public-search",
    ],
    spec: {
      id: "spec-nakaya-housoge-research",
      seriesName: "Housoge / custom motif",
      originCountry: "日本（待核验）",
      nib: "大金尖说法待核验",
      fillSystem: "上墨器/墨囊说法待核验",
      material: "漆面/装饰工艺待核验",
      priceRange: "高级定制价位说法待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-nakaya-housoge-source-boundary",
        "中屋 Nakaya Housoge高级定制",
        "source-nakaya-housoge-public-search",
        "motif, customization, nib, finish, and price claims",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-nakaya-housoge-research",
      title: "把 Housoge 先作为中屋定制工艺队列",
      summary:
        "Nakaya Housoge 高级定制先按工艺/装饰主题待核验条目处理，避免把个案、主题和标准型号混写。",
      bodyMd:
        "Nakaya Housoge 这类条目需要特别小心：它可能同时涉及基本笔形、漆面/装饰主题、定制选项和订单个案。直接把它写成一个固定规格型号，很容易误导读者。\n\n当前档案只建立研究入口：以 Nakaya 官方型号索引作为品牌/型号体系锚点，再用公开搜索入口寻找直接页面。后续补证应优先确认 Housoge 是主题、工艺、单件定制还是某个可订购产品页，再写入笔尖、上墨、材料和价格区间。",
      sourceNotes:
        "Nakaya official model index is a general anchor; Housoge-specific claims remain needs_source.",
      sourceItemIds: [
        "source-nakaya-products-official",
        "source-nakaya-housoge-public-search",
      ],
      claimIds: ["claim-nakaya-housoge-source-boundary"],
    }),
  },
  {
    slug: "中屋-nakaya-portable-portable-cigar",
    brandSlug: "nakaya",
    aliases: [
      { alias: "Nakaya Portable", language: "en" },
      { alias: "Nakaya Portable Cigar", language: "en" },
      { alias: "中屋 Portable Cigar", language: "zh" },
    ],
    sourceItemIds: [
      "source-nakaya-products-official",
      "source-nakaya-portable-public-search",
    ],
    spec: {
      id: "spec-nakaya-portable-cigar-research",
      seriesName: "Portable / Portable Cigar",
      originCountry: "日本（待核验）",
      nib: "金尖/定制笔尖说法待核验",
      fillSystem: "上墨器/墨囊说法待核验",
      material: "漆面/笔身材质待核验",
      priceRange: "高端定制价位说法待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-nakaya-portable-cigar-source-boundary",
        "中屋 Nakaya Portable / Portable Cigar",
        "source-nakaya-portable-public-search",
        "Portable versus Portable Cigar naming, dimensions, nib, finish, and filling system",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-nakaya-portable-cigar-research",
      title: "先拆清 Portable 与 Portable Cigar 的边界",
      summary:
        "Nakaya Portable / Portable Cigar 暂时保留为组合待核验条目，后续需要确认是否应拆成不同笔形档案。",
      bodyMd:
        "Nakaya 的型号命名经常同时包含笔形、笔帽结构、漆面和定制选项。Portable / Portable Cigar 这个页面目前像是把两个相邻概念放在一起，因此最需要先做边界整理。\n\n当前档案以 Nakaya 官方型号索引作为体系入口，不写死尺寸和配置。后续应确认 Portable、Portable Cigar、Writer、Cigar、Naka-ai 等笔形关系，再决定是否拆页。",
      sourceNotes:
        "Nakaya official model index is a general anchor; shape-specific facts remain needs_source.",
      sourceItemIds: [
        "source-nakaya-products-official",
        "source-nakaya-portable-public-search",
      ],
      claimIds: ["claim-nakaya-portable-cigar-source-boundary"],
    }),
  },
  {
    slug: "中屋-nakaya-portable-writer-黑溜涂",
    brandSlug: "nakaya",
    aliases: [
      { alias: "Nakaya Portable Writer Kuro-tamenuri", language: "en" },
      { alias: "中屋 Portable Writer 黑溜涂", language: "zh" },
    ],
    sourceItemIds: [
      "source-nakaya-products-official",
      "source-nakaya-portable-writer-public-search",
    ],
    spec: {
      id: "spec-nakaya-portable-writer-kuro-research",
      seriesName: "Portable Writer / 黑溜涂",
      originCountry: "日本（待核验）",
      nib: "大金尖说法待核验",
      fillSystem: "上墨器/墨囊说法待核验",
      material: "黑溜涂漆面说法待核验",
      priceRange: "高端价位说法待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-nakaya-portable-writer-kuro-source-boundary",
        "中屋 Nakaya Portable Writer 黑溜涂",
        "source-nakaya-portable-writer-public-search",
        "Portable Writer shape, kuro-tamenuri finish, nib, and filling system",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-nakaya-portable-writer-kuro-research",
      title: "把 Portable Writer 黑溜涂拆成笔形与漆面两层",
      summary:
        "Nakaya Portable Writer 黑溜涂先按笔形加漆面组合处理，具体配置等待官方产品页或订购说明补证。",
      bodyMd:
        "Portable Writer 黑溜涂这个名字里至少有两层信息：Portable Writer 是笔形/书写配置线索，黑溜涂则更像漆面或完成方式线索。若直接把它写成一个固定 SKU，会丢掉 Nakaya 定制体系的弹性。\n\n当前档案先把它放进待核验队列：保留笔形与漆面两个阅读入口，但不写死尺寸、笔尖、价格或供货状态。下一步需要官方产品页、订购说明或可靠经销资料。",
      sourceNotes:
        "Nakaya official model index is a general anchor; finish-specific facts remain needs_source.",
      sourceItemIds: [
        "source-nakaya-products-official",
        "source-nakaya-portable-writer-public-search",
      ],
      claimIds: ["claim-nakaya-portable-writer-kuro-source-boundary"],
    }),
  },
  {
    slug: "公爵-duke",
    brandSlug: "duke",
    aliases: [
      { alias: "Duke unspecified model", language: "en" },
      { alias: "公爵 待核验型号", language: "zh" },
    ],
    sourceItemIds: ["source-duke-unspecified-public-search"],
    spec: {
      id: "spec-duke-unspecified-research",
      seriesName: "待拆分型号",
      originCountry: "中国（待核验）",
      nib: "钢尖说法待核验",
      fillSystem: "上墨方式待核验",
      material: "笔身材质待核验",
      priceRange: "待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-duke-unspecified-source-boundary",
        "公爵 Duke —",
        "source-duke-unspecified-public-search",
        "exact model identity and all specifications",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-duke-unspecified-research",
      title: "先把公爵无型号页拆成研究入口",
      summary:
        "当前公爵页面缺具体型号名，先作为待拆分入口，避免把品牌层面的制造商资料写成某支笔的规格。",
      bodyMd:
        "公爵这一页现在只有品牌和笼统评价，缺少具体型号。继续往里填笔尖、上墨或材质，会把品牌层面的资料误用到某一支笔上。\n\n当前档案先作为研究入口保留：后续应通过包装、产品页、零售标题或实物照片确认具体型号，再拆分为独立型号页面。没有具体型号前，只保留证据边界。",
      sourceNotes:
        "Research queue only. Split this entry into concrete Duke model pages before factual specs are added.",
      sourceItemIds: ["source-duke-unspecified-public-search"],
      claimIds: ["claim-duke-unspecified-source-boundary"],
    }),
  },
  {
    slug: "写乐-sailor-0501铱金",
    brandSlug: "sailor",
    aliases: [
      { alias: "Sailor 0501", language: "en" },
      { alias: "写乐 0501 铱金", language: "zh" },
    ],
    sourceItemIds: ["source-sailor-0501-public-search"],
    spec: {
      id: "spec-sailor-0501-research",
      seriesName: "0501",
      originCountry: "日本（待核验）",
      nib: "铱金/钢尖说法待核验",
      fillSystem: "上墨方式待核验",
      material: "笔身材质待核验",
      priceRange: "待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-sailor-0501-source-boundary",
        "写乐 Sailor 0501铱金",
        "source-sailor-0501-public-search",
        "model identity, nib description, production period, and writing-feel claims",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-sailor-0501-research",
      title: "把 Sailor 0501 铱金从玩家评价里拆出来",
      summary:
        "Sailor 0501 铱金目前只保留为待核验型号，先不把“日系强钢尖”等玩家评价写成事实。",
      bodyMd:
        "Sailor 0501 铱金的原始摘要带有强烈玩家评价，但这类评价如果没有来源，会让型号档案变成口号。当前页面先把它放入研究队列，重点确认 0501 的产品身份、笔尖材质、生产时期和中文“铱金”叫法。\n\n后续需要目录、产品页、零售规格或长期评测来支撑具体事实；在此之前，书写反馈只能作为待核验线索。",
      sourceNotes:
        "Research queue only. The search index is not direct evidence for nib material or writing feel.",
      sourceItemIds: ["source-sailor-0501-public-search"],
      claimIds: ["claim-sailor-0501-source-boundary"],
    }),
  },
  {
    slug: "写乐-sailor-1029银夹鱼雷",
    brandSlug: "sailor",
    aliases: [
      { alias: "Sailor 1029", language: "en" },
      { alias: "写乐 1029 银夹鱼雷", language: "zh" },
    ],
    sourceItemIds: ["source-sailor-1029-public-search"],
    spec: {
      id: "spec-sailor-1029-research",
      seriesName: "1029 / 鱼雷",
      originCountry: "日本（待核验）",
      nib: "笔尖规格待核验",
      fillSystem: "上墨方式待核验",
      material: "笔身材质待核验",
      priceRange: "待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-sailor-1029-source-boundary",
        "写乐 Sailor 1029银夹鱼雷",
        "source-sailor-1029-public-search",
        "1029 model identity, silver-clip naming, and torpedo/body-shape claims",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-sailor-1029-research",
      title: "把 1029 银夹鱼雷先做成命名待核验页",
      summary:
        "Sailor 1029 银夹鱼雷暂时只保留型号命名线索，后续需要目录或产品页确认 1029、银夹和鱼雷外形的关系。",
      bodyMd:
        "这个页面里同时出现型号编号、银夹描述和鱼雷外形描述。它很可能是玩家口径下的组合命名，而不是一个可以直接从官网检索到的完整系列名。\n\n当前档案先保留研究队列入口。补证时应优先确认 1029 是 SKU、系列还是市场昵称，再处理银夹、外形、笔尖和版本差异。",
      sourceNotes:
        "Research queue only. The search index is not direct evidence for model identity or specs.",
      sourceItemIds: ["source-sailor-1029-public-search"],
      claimIds: ["claim-sailor-1029-source-boundary"],
    }),
  },
  {
    slug: "写乐-sailor-1219标准鱼雷",
    brandSlug: "sailor",
    aliases: [
      { alias: "Sailor 1219", language: "en", sourceId: "sailor-official" },
      { alias: "Sailor 1911 S 14K", language: "en", sourceId: "sailor-official" },
      { alias: "写乐 1219 标准鱼雷", language: "zh" },
    ],
    sourceItemIds: [
      "source-sailor-1911-1219-official",
      "source-sailor-1911-series-official",
    ],
    spec: {
      id: "spec-sailor-1219-research",
      seriesName: "1911 S / 1219",
      releaseYear: "待核验",
      originCountry: "日本",
      nib: "14K 金尖（官方 11-1219 页面口径，具体尖号待核验）",
      fillSystem: "墨囊/上墨器（官方系列口径，配件兼容待核验）",
      material: "树脂/笔身材质细项待核验",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "中文渠道价说法待核验",
      status: "现行/地区供货待核验",
      reviewStatus: "pending",
    },
    claims: [
      makeOfficialClaim(
        "claim-sailor-1219-official-product",
        "official_product_identity",
        "Sailor official product material identifies 11-1219 as a 1911 S 14K fountain pen within the 1911 family.",
        "source-sailor-1911-1219-official",
        "11-1219 / 1911 S / 14K",
      ),
      makeBoundaryClaim(
        "claim-sailor-1219-source-boundary",
        "写乐 Sailor 1219标准鱼雷",
        "source-sailor-1911-1219-official",
        "Chinese channel prices, nickname mapping, dimensions, and current regional availability",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-sailor-1219-research",
      title: "把 1219 标准鱼雷放回 1911 S 14K 证据链",
      summary:
        "Sailor 1219 标准鱼雷先用官方 11-1219 / 1911 S 14K 页面锚定型号身份，渠道价格和中文昵称仍保留待核验。",
      bodyMd:
        "这个条目的原始摘要主要围绕“一航渠道价”展开，但图书馆页不能把渠道价当作型号历史。更稳妥的处理，是先把 1219 放回 Sailor 官方 11-1219 / 1911 S 14K 的证据链里：它属于 1911/Profit 雪茄形产品语境，可以先确认官方产品身份、系列位置和基础笔尖口径。\n\n仍需补证的部分包括中文“标准鱼雷”叫法、不同地区的 Profit/1911 命名差异、实际尺寸重量、颜色/尖号和中文渠道价格。当前页面先保留官方锚点，不把价格波动写成稳定事实。",
      sourceNotes:
        "Official Sailor product page anchors the 11-1219 identity. Chinese channel pricing and nickname mapping remain needs_source.",
      sourceItemIds: [
        "source-sailor-1911-1219-official",
        "source-sailor-1911-series-official",
      ],
      claimIds: [
        "claim-sailor-1219-official-product",
        "claim-sailor-1219-source-boundary",
      ],
    }),
  },
  {
    slug: "写乐-sailor-1911-profit系列",
    brandSlug: "sailor",
    aliases: [
      { alias: "Sailor 1911", language: "en", sourceId: "sailor-official" },
      { alias: "Sailor Profit", language: "en", sourceId: "sailor-official" },
      { alias: "写乐 1911 / Profit", language: "zh" },
    ],
    sourceItemIds: [
      "source-sailor-1911-series-official",
      "source-sailor-1911-1219-official",
      "source-sailor-1911-1521-official",
    ],
    spec: {
      id: "spec-sailor-1911-profit-research",
      seriesName: "1911 / Profit",
      releaseYear: "待核验",
      originCountry: "日本",
      nib: "21K / 14K 金尖（官方系列口径，具体 SKU 待核验）",
      fillSystem: "墨囊/上墨器（官方系列口径，配件兼容待核验）",
      material: "树脂/笔身材质细项待核验",
      dimensions: "按 Standard / Large / S 等版本待拆分",
      weight: "待核验",
      priceRange: "按地区和版本待核验",
      status: "现行系列/地区供货待核验",
      reviewStatus: "pending",
    },
    claims: [
      makeOfficialClaim(
        "claim-sailor-1911-series-official-family",
        "official_series_identity",
        "Sailor official material treats 1911 as a core fountain-pen series with both 21K and 14K nib contexts.",
        "source-sailor-1911-series-official",
        "1911 Series / 21K / 14K",
      ),
      makeBoundaryClaim(
        "claim-sailor-1911-profit-source-boundary",
        "写乐 Sailor 1911/Profit系列",
        "source-sailor-1911-series-official",
        "Profit versus 1911 naming, regional catalog mapping, dimensions, and version hierarchy",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-sailor-1911-profit-research",
      title: "把 1911 / Profit 作为写乐雪茄形主线来读",
      summary:
        "1911 / Profit 是写乐核心产品线之一，但站内需要把系列、地区命名和具体 SKU 分层，否则容易把 14K、21K、Standard、Large 混成一支笔。",
      bodyMd:
        "Sailor 1911 / Profit 这一页适合承担“系列入口”的角色，而不是直接写成单支笔。官方 1911 Series 页面能先支撑系列层面的信息：经典雪茄形外观、21K/14K 金尖语境，以及墨囊/上墨器系统。\n\n真正需要继续补的是**命名边界**：英文站的 1911、日文/玩家语境中的 Profit、中文玩家说的标准鱼雷/大型鱼雷，以及 1219、1521 等产品编号之间的关系。当前档案先把这些线索放到一个页面里，后续应继续拆 Standard、Large、S、Profit Light 等具体档案。",
      sourceNotes:
        "Official Sailor 1911 family and product pages are series/product anchors. Regional naming and version hierarchy remain needs_source.",
      sourceItemIds: [
        "source-sailor-1911-series-official",
        "source-sailor-1911-1219-official",
        "source-sailor-1911-1521-official",
      ],
      claimIds: [
        "claim-sailor-1911-series-official-family",
        "claim-sailor-1911-profit-source-boundary",
      ],
    }),
    variants: [
      {
        id: "variant-sailor-1911-1219",
        name: "1911 S / 11-1219",
        notes: "Official 14K product-page anchor. Chinese standard-torpedo nickname still needs local source mapping.",
        sourceItemId: "source-sailor-1911-1219-official",
        reviewStatus: "pending",
      },
      {
        id: "variant-sailor-1911-1521",
        name: "1911 S / 11-1521",
        notes: "Official 21K product-page anchor. Treat as 1911/Profit evidence, not Pro Gear evidence.",
        sourceItemId: "source-sailor-1911-1521-official",
        reviewStatus: "pending",
      },
    ],
  },
  {
    slug: "写乐-sailor-21k-pro-gear-大鱼雷",
    brandSlug: "sailor",
    aliases: [
      { alias: "Sailor 21K Pro Gear", language: "en", sourceId: "sailor-official" },
      { alias: "Sailor 1911 S 21K", language: "en", sourceId: "sailor-official" },
      { alias: "写乐 21K Pro Gear / 大鱼雷", language: "zh" },
    ],
    sourceItemIds: [
      "source-sailor-1911-1521-official",
      "source-sailor-pro-gear-official",
    ],
    spec: {
      id: "spec-sailor-21k-pro-gear-torpedo-research",
      seriesName: "Pro Gear / 1911 S 21K 身份待拆分",
      releaseYear: "待核验",
      originCountry: "日本",
      nib: "21K 金尖说法待核验",
      fillSystem: "墨囊/上墨器说法待核验",
      material: "树脂/笔身材质细项待核验",
      dimensions: "需要按 Pro Gear 与 1911/Profit 分拆",
      weight: "待核验",
      priceRange: "中文渠道价说法待核验",
      status: "型号身份待拆分",
      reviewStatus: "needs_source",
    },
    claims: [
      makeOfficialClaim(
        "claim-sailor-21k-1521-official-product",
        "official_product_identity",
        "Sailor official product material identifies 11-1521 as a 1911 S 21K fountain pen, which should not be automatically merged into Pro Gear.",
        "source-sailor-1911-1521-official",
        "11-1521 / 1911 S / 21K",
      ),
      makeBoundaryClaim(
        "claim-sailor-21k-pro-gear-source-boundary",
        "写乐 Sailor 21K Pro Gear/大鱼雷",
        "source-sailor-pro-gear-official",
        "whether this local entry refers to Pro Gear 21K, 1911/Profit 1521, or two separate pages",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-sailor-21k-pro-gear-torpedo-research",
      title: "先拆清 21K Pro Gear 与 1521 标准鱼雷",
      summary:
        "这个条目把 21K、Pro Gear 和大鱼雷/1521 语境混在一起，当前先作为命名拆分页，避免把 Pro Gear 平顶线和 1911/Profit 雪茄线混写。",
      bodyMd:
        "这页需要先处理命名，而不是直接扩写体验。站内原始摘要同时出现“21K Pro Gear / 大鱼雷”和“1521 标准鱼雷”，这很可能把两条线索混在一起：**Professional Gear** 是写乐平顶系列，而 **11-1521 / 1911 S 21K** 更接近 1911/Profit 雪茄形证据链。\n\n当前档案保留两个官方锚点：Pro Gear 系列页用于平顶线，11-1521 产品页用于 21K 1911 S。后续如果确认原始条目想说的是 Pro Gear，应拆到 Pro Gear 21K；如果想说的是 1521，则应并入 1911/Profit/标准鱼雷体系。",
      sourceNotes:
        "Official sources intentionally show two possible identities. Do not treat this page as a verified single SKU until the local naming is resolved.",
      sourceItemIds: [
        "source-sailor-1911-1521-official",
        "source-sailor-pro-gear-official",
      ],
      claimIds: [
        "claim-sailor-21k-1521-official-product",
        "claim-sailor-21k-pro-gear-source-boundary",
      ],
    }),
    variants: [
      {
        id: "variant-sailor-21k-pro-gear-candidate",
        name: "Professional Gear 21K candidate",
        notes: "Use the Pro Gear official series page only as a candidate identity until local naming is resolved.",
        sourceItemId: "source-sailor-pro-gear-official",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-sailor-21k-1911-1521-candidate",
        name: "1911 S 21K / 11-1521 candidate",
        notes: "Official 11-1521 product page supports a 1911 S 21K path; this may be the better target for the channel-price note.",
        sourceItemId: "source-sailor-1911-1521-official",
        reviewStatus: "needs_source",
      },
    ],
  },
  {
    slug: "写乐-sailor-classic-ko",
    brandSlug: "sailor",
    aliases: [
      { alias: "Sailor Classic Ko", language: "en", sourceId: "sailor-official" },
      { alias: "Classic Ko Maki-e", language: "en", sourceId: "sailor-official" },
      { alias: "写乐 Classic Ko", language: "zh" },
    ],
    sourceItemIds: ["source-sailor-classic-ko-official"],
    spec: {
      id: "spec-sailor-classic-ko-research",
      seriesName: "Classic Ko / Maki-e",
      releaseYear: "待核验",
      originCountry: "日本",
      nib: "14K 金尖说法待核验",
      fillSystem: "墨囊/上墨器说法待核验",
      material: "莳绘/装饰工艺语境待核验",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "400-600 说法待核验",
      status: "供货状态待核验",
      reviewStatus: "needs_source",
    },
    claims: [
      makeOfficialClaim(
        "claim-sailor-classic-ko-official-story",
        "official_design_context",
        "Sailor official material presents Classic Ko as a Maki-e writing-instrument story rather than a fully specified ordinary catalog line.",
        "source-sailor-classic-ko-official",
        "Classic Ko Maki-e / writing instruments",
      ),
      makeBoundaryClaim(
        "claim-sailor-classic-ko-source-boundary",
        "写乐 Sailor Classic Ko",
        "source-sailor-classic-ko-official",
        "exact catalog identity, nib, filling system, price band, and availability",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-sailor-classic-ko-research",
      title: "把 Classic Ko 先作为设计故事而非普通规格页",
      summary:
        "Classic Ko 暂时用写乐官方设计故事做锚点，价格、14K、上墨方式和中文市场定位都保持待核验。",
      bodyMd:
        "Classic Ko 的资料入口和普通量产型号不太一样：当前能稳定引用的是 Sailor 官方的 Classic Ko Maki-e 故事页，更偏品牌合作/工艺叙事，而不是完整规格表。\n\n所以这页先不急着写“日本、14K、墨囊/上墨器、400-600”这些原始摘要信息。它们可以保留在待核验规格里，但必须等到产品页、目录、包装或可靠零售页补上后，才适合变成已审核事实。",
      sourceNotes:
        "Official Sailor story page anchors design context. Product-level specs and pricing remain needs_source.",
      sourceItemIds: ["source-sailor-classic-ko-official"],
      claimIds: [
        "claim-sailor-classic-ko-official-story",
        "claim-sailor-classic-ko-source-boundary",
      ],
    }),
  },
  {
    slug: "写乐-sailor-king-of-pen笔王",
    brandSlug: "sailor",
    aliases: [
      { alias: "Sailor King of Pen", language: "en", sourceId: "sailor-official" },
      { alias: "Sailor King of Pens", language: "en", sourceId: "sailor-official" },
      { alias: "写乐 笔王", language: "zh" },
    ],
    sourceItemIds: ["source-sailor-king-of-pens-official"],
    spec: {
      id: "spec-sailor-king-of-pen-research",
      seriesName: "King of Pens",
      releaseYear: "待核验",
      originCountry: "日本",
      nib: "大型 21K 金尖（官方系列口径，具体版本待核验）",
      fillSystem: "墨囊/上墨器说法待核验",
      material: "树脂/硬橡胶/莳绘等版本待拆分",
      dimensions: "按版本待核验",
      weight: "按版本待核验",
      priceRange: "中文渠道价说法待核验",
      status: "高端系列/地区供货待核验",
      reviewStatus: "pending",
    },
    claims: [
      makeOfficialClaim(
        "claim-sailor-kop-official-flagship",
        "official_series_positioning",
        "Sailor official material presents King of Pens as a top-range oversized fountain-pen family.",
        "source-sailor-king-of-pens-official",
        "King of Pens / top range / oversized",
      ),
      makeBoundaryClaim(
        "claim-sailor-kop-source-boundary",
        "写乐 Sailor King of Pen笔王",
        "source-sailor-king-of-pens-official",
        "specific variant, material, dimensions, and Chinese channel pricing",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-sailor-king-of-pen-research",
      title: "把 King of Pen 放进写乐旗舰尺寸线",
      summary:
        "King of Pen / King of Pens 先用官方旗舰系列页面锚定定位，再把树脂、硬橡胶、莳绘和不同地区版本留给后续拆分。",
      bodyMd:
        "King of Pen 不是简单的“更贵的写乐”，它在图书馆里应该承担写乐旗舰尺寸线的入口。官方 King of Pens 页面能先支撑它的高端系列和大尺寸书写工具定位；但具体到树脂、硬橡胶、莳绘、不同笔尖和地区供货时，仍要回到产品页逐项核验。\n\n站内原始摘要提到中文渠道价和“深度爱好者才上”，这些更像玩家购买语境，不能替代官方资料。当前页面先保留这种阅读入口，但把价格和具体版本标成待核验。",
      sourceNotes:
        "Official Sailor King of Pens page anchors flagship positioning. Variant-level facts and local prices remain needs_source.",
      sourceItemIds: ["source-sailor-king-of-pens-official"],
      claimIds: [
        "claim-sailor-kop-official-flagship",
        "claim-sailor-kop-source-boundary",
      ],
    }),
  },
  {
    slug: "写乐-sailor-promenade漫步1031",
    brandSlug: "sailor",
    aliases: [
      { alias: "Sailor Promenade", language: "en" },
      { alias: "Sailor 1031", language: "en" },
      { alias: "写乐 Promenade 漫步1031", language: "zh" },
    ],
    sourceItemIds: ["source-sailor-promenade-1031-public-search"],
    spec: {
      id: "spec-sailor-promenade-1031-research",
      seriesName: "Promenade / 漫步1031",
      originCountry: "日本（待核验）",
      nib: "金尖说法待核验",
      fillSystem: "墨囊/上墨器说法待核验",
      material: "树脂/笔身材质待核验",
      priceRange: "中端价位说法待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-sailor-promenade-1031-source-boundary",
        "写乐 Sailor Promenade漫步1031",
        "source-sailor-promenade-1031-public-search",
        "Promenade 1031 model identity, nib, filling system, production status, and channel pricing",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-sailor-promenade-1031-research",
      title: "把 Promenade 漫步1031 先作为中端待核验页",
      summary:
        "Sailor Promenade 漫步1031 当前缺少直接产品来源，先保留为中端均衡路线的研究入口，不把渠道价和配置写成已审核事实。",
      bodyMd:
        "Promenade / 漫步1031 的原始摘要强调“中端均衡”和渠道价，这对用户选购很有用，但不是稳定馆藏事实。当前最需要确认的是：1031 是否是具体 SKU、Promenade 的版本/颜色如何区分、是否仍在售、以及笔尖和上墨规格。\n\n本页暂时只建立研究队列，后续优先补官方旧产品页、目录、可靠零售规格和长期评测。",
      sourceNotes:
        "Research queue only. Direct product/catalog/review evidence is required before specs and price notes can be treated as factual.",
      sourceItemIds: ["source-sailor-promenade-1031-public-search"],
      claimIds: ["claim-sailor-promenade-1031-source-boundary"],
    }),
  },
  {
    slug: "写乐-sailor-四季织1224",
    brandSlug: "sailor",
    aliases: [
      { alias: "Sailor Shikiori 1224", language: "en", sourceId: "sailor-official" },
      { alias: "Sailor Professional Gear Slim SHIKIORI", language: "en", sourceId: "sailor-official" },
      { alias: "写乐 四季织1224", language: "zh" },
    ],
    sourceItemIds: ["source-sailor-shikiori-1224-official"],
    spec: {
      id: "spec-sailor-shikiori-1224-research",
      seriesName: "SHIKIORI / Professional Gear Slim",
      releaseYear: "待核验",
      originCountry: "日本",
      nib: "14K 金尖（官方 11-1224 页面口径，具体尖号待核验）",
      fillSystem: "墨囊/上墨器（官方页面口径，配件兼容待核验）",
      material: "树脂/颜色与材质细项待核验",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "中文渠道价与涨价说法待核验",
      status: "现行/地区供货待核验",
      reviewStatus: "pending",
    },
    claims: [
      makeOfficialClaim(
        "claim-sailor-shikiori-1224-official-product",
        "official_product_identity",
        "Sailor official product material identifies 11-1224 as a SHIKIORI / Professional Gear Slim fountain-pen family entry.",
        "source-sailor-shikiori-1224-official",
        "11-1224 / SHIKIORI / Professional Gear Slim",
      ),
      makeBoundaryClaim(
        "claim-sailor-shikiori-1224-source-boundary",
        "写乐 Sailor 四季织1224",
        "source-sailor-shikiori-1224-official",
        "Chinese price history, edition-color mapping, and 入门三金 positioning",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-sailor-shikiori-1224-research",
      title: "把四季织1224从价格讨论拉回系列证据",
      summary:
        "四季织1224 先用官方 SHIKIORI / Professional Gear Slim 产品页锚定身份，价格涨幅和“入门三金”语境作为待核验玩家线索保留。",
      bodyMd:
        "Sailor 四季织1224 的中文讨论常常围绕价格涨幅和“入门三金”地位变化展开。这个角度对购买决策有帮助，但页面第一层必须先确认它是什么：官方 11-1224 页面能把它放入 SHIKIORI / Professional Gear Slim 语境。\n\n接下来才适合处理中文渠道价、颜色版本、四季命名、是否对应单一 SKU 或一组颜色。当前页面不把价格历史写成事实，只把它作为后续补证方向。",
      sourceNotes:
        "Official Sailor 11-1224 product page anchors identity. Local price-history claims remain needs_source.",
      sourceItemIds: ["source-sailor-shikiori-1224-official"],
      claimIds: [
        "claim-sailor-shikiori-1224-official-product",
        "claim-sailor-shikiori-1224-source-boundary",
      ],
    }),
  },
  {
    slug: "写乐-sailor-转运石",
    brandSlug: "sailor",
    aliases: [
      { alias: "Sailor Lucky Charm", language: "en" },
      { alias: "写乐 转运石", language: "zh" },
    ],
    sourceItemIds: ["source-sailor-lucky-charm-public-search"],
    spec: {
      id: "spec-sailor-lucky-charm-research",
      seriesName: "转运石 / Lucky Charm（待核验）",
      originCountry: "日本（待核验）",
      nib: "笔尖规格待核验",
      fillSystem: "墨囊/上墨器说法待核验",
      material: "颜色/主题/材质待核验",
      priceRange: "入门日系价位说法待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-sailor-lucky-charm-source-boundary",
        "写乐 Sailor 转运石",
        "source-sailor-lucky-charm-public-search",
        "whether 转运石 is a Sailor official product name, Chinese nickname, colorway, or retailer edition",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-sailor-lucky-charm-research",
      title: "先确认转运石到底是型号、昵称还是主题色",
      summary:
        "Sailor 转运石 暂时保留为命名待核验页；它可能是中文昵称、主题色或限定款入口，不能直接写成稳定官方型号。",
      bodyMd:
        "“转运石”这个名字很有记忆点，但也正因为太像中文市场昵称，必须先核验身份。它可能对应 Sailor 某个颜色主题、限定系列、零售标题，也可能只是玩家口径下的简称。\n\n当前页面只保留研究队列入口。后续应优先找官方产品页、包装/吊牌、可靠零售 SKU 或长期评测，确认英文名、所属系列和规格后再扩写。",
      sourceNotes:
        "Research queue only. Search index is not direct evidence for official model identity.",
      sourceItemIds: ["source-sailor-lucky-charm-public-search"],
      claimIds: ["claim-sailor-lucky-charm-source-boundary"],
    }),
  },
  {
    slug: "写乐-sailor-长刀研",
    brandSlug: "sailor",
    aliases: [
      { alias: "Sailor Naginata Togi", language: "en", sourceId: "sailor-official" },
      { alias: "写乐 长刀研", language: "zh" },
    ],
    sourceItemIds: ["source-sailor-naginata-togi-official"],
    spec: {
      id: "spec-sailor-naginata-togi-research",
      seriesName: "Naginata Togi / 特殊笔尖",
      releaseYear: "待核验",
      originCountry: "日本",
      nib: "长刀研特殊笔尖（官方页面口径，具体型号搭配待核验）",
      fillSystem: "取决于搭载笔款，待核验",
      material: "取决于搭载笔款，待核验",
      dimensions: "不适合按单一笔款填写",
      weight: "不适合按单一笔款填写",
      priceRange: "按搭载笔款/地区待核验",
      status: "可能应重分类为笔尖/书写特性",
      reviewStatus: "needs_source",
    },
    claims: [
      makeOfficialClaim(
        "claim-sailor-naginata-official-nib",
        "official_nib_identity",
        "Sailor official material presents Naginata Togi as a special nib concept, so the local entry may need reclassification rather than ordinary model treatment.",
        "source-sailor-naginata-togi-official",
        "Naginata Togi / special nib",
      ),
      makeBoundaryClaim(
        "claim-sailor-naginata-source-boundary",
        "写乐 Sailor 长刀研",
        "source-sailor-naginata-togi-official",
        "whether this page should remain a pen model, move to nib, or split by host model",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-sailor-naginata-togi-research",
      title: "把长刀研先标成笔尖研磨而非单支型号",
      summary:
        "长刀研可能更接近笔尖研磨/书写特性，而不是一支固定型号；当前先保留官方特殊笔尖锚点并提示后续重分类。",
      bodyMd:
        "长刀研最容易被写成“某一支笔”，但从图书馆结构看，它更可能是**笔尖研磨/书写特性**入口。官方 Naginata Togi 页面适合作为特殊笔尖锚点，而不是直接支撑一个完整型号规格。\n\n因此当前页面不会填写单一尺寸、重量或笔身材质。后续更合理的处理可能是：把长刀研迁到 nib 条目，或者在具体搭载笔款下面作为版本/笔尖选项展示。",
      sourceNotes:
        "Official Sailor page anchors Naginata Togi as a special-nib concept. Entity type and host-model mapping remain needs_source.",
      sourceItemIds: ["source-sailor-naginata-togi-official"],
      claimIds: [
        "claim-sailor-naginata-official-nib",
        "claim-sailor-naginata-source-boundary",
      ],
    }),
  },
  {
    slug: "凌美-lamy-al-star-恒星",
    brandSlug: "lamy",
    aliases: [
      { alias: "LAMY AL-star", language: "en", sourceId: "lamy-official" },
      { alias: "LAMY Al-Star", language: "en", sourceId: "lamy-official" },
      { alias: "凌美 恒星", language: "zh" },
    ],
    sourceItemIds: ["source-lamy-al-star-official"],
    spec: {
      id: "spec-lamy-al-star-research",
      seriesName: "AL-star",
      releaseYear: "待核验",
      originCountry: "德国",
      nib: "钢尖（官方产品页口径，尖号/替换兼容待核验）",
      fillSystem: "T10 墨囊 / Z28 上墨器语境待核验",
      material: "铝制笔身（官方产品页口径，具体表面处理待核验）",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "中文入门价位说法待核验",
      status: "现行/限定色年份待核验",
      reviewStatus: "pending",
    },
    claims: [
      makeOfficialClaim(
        "claim-lamy-al-star-official-material",
        "official_material_context",
        "LAMY official product material positions AL-star as a fountain pen with an aluminum body, transparent grip, and steel-nib context.",
        "source-lamy-al-star-official",
        "AL-star / aluminum / transparent grip / steel nib",
      ),
      makeBoundaryClaim(
        "claim-lamy-al-star-source-boundary",
        "凌美 LAMY Al-Star 恒星",
        "source-lamy-al-star-official",
        "value comparison with safari, annual colors, local pricing, and exact accessory compatibility",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-lamy-al-star-research",
      title: "把 AL-star 恒星放进 Safari 之后的金属入口线",
      summary:
        "LAMY AL-star 先用官方产品页锚定铝制笔身、透明握位和钢尖语境；“比 Safari 更值”的判断保留为待补证玩家观点。",
      bodyMd:
        "AL-star / 恒星适合放在 Safari 旁边读：它继承了 LAMY 入门设计语言，但把笔身换成更明显的金属触感。官方 AL-star 页面可以支撑铝制笔身、透明握位、钢尖和墨囊/上墨器语境。\n\n站内原始摘要说“如果非要买凌美入门，恒星比 Safari 更值”，这属于购买判断，后续应交给价格、耐用性、重量、握感和限定色资料来支撑。当前页面先把官方结构补上，不把价值判断写成事实。",
      sourceNotes:
        "Official LAMY AL-star product page anchors material and product identity. Value comparisons and local prices remain needs_source.",
      sourceItemIds: ["source-lamy-al-star-official"],
      claimIds: [
        "claim-lamy-al-star-official-material",
        "claim-lamy-al-star-source-boundary",
      ],
    }),
    variants: [
      {
        id: "variant-lamy-al-star-regular-colors",
        name: "Regular colors",
        notes: "Use official product page as current-family anchor; exact color list changes over time and needs periodic review.",
        sourceItemId: "source-lamy-al-star-official",
        reviewStatus: "pending",
      },
      {
        id: "variant-lamy-al-star-special-editions",
        name: "Special editions / annual colors",
        notes: "Commonly discussed by users, but should be backed by catalog/year sources before becoming a chronology.",
        sourceItemId: "source-lamy-al-star-official",
        reviewStatus: "needs_source",
      },
    ],
  },
  {
    slug: "凌美-lamy-dialog-3-焦点3",
    brandSlug: "lamy",
    aliases: [
      { alias: "LAMY dialog 3", language: "en", sourceId: "lamy-official" },
      { alias: "LAMY dialog", language: "en", sourceId: "lamy-official" },
      { alias: "凌美 焦点3", language: "zh" },
    ],
    sourceItemIds: ["source-lamy-dialog-official"],
    spec: {
      id: "spec-lamy-dialog-3-research",
      seriesName: "dialog / dialog 3",
      releaseYear: "待核验",
      originCountry: "德国",
      nib: "金尖说法待核验",
      fillSystem: "墨囊/上墨器说法待核验",
      material: "金属笔身/表面处理待核验",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "高端按动钢笔价位说法待核验",
      status: "当前官方命名与旧 dialog 3 命名待映射",
      reviewStatus: "needs_source",
    },
    claims: [
      makeOfficialClaim(
        "claim-lamy-dialog-official-mechanism",
        "official_mechanism_context",
        "LAMY official product material presents dialog as a retractable fountain pen with a twist/retract mechanism and clip/nib interaction context.",
        "source-lamy-dialog-official",
        "dialog / retractable fountain pen / mechanism",
      ),
      makeBoundaryClaim(
        "claim-lamy-dialog-3-source-boundary",
        "凌美 LAMY Dialog 3 焦点3",
        "source-lamy-dialog-official",
        "dialog 3 versus current dialog naming, exact nib, designer/release chronology, and comparison with Pilot Capless",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-lamy-dialog-3-research",
      title: "把 Dialog 3 焦点3放进伸缩钢笔机制线",
      summary:
        "LAMY Dialog 3 / dialog 先作为伸缩钢笔机制档案处理，官方 dialog 页面可支撑按动/伸缩语境，但旧名、版本和与 Capless 的比较仍需补证。",
      bodyMd:
        "Dialog 3 / 焦点3 最适合进入“机制型钢笔”路径：用户关心的不是普通笔身规格，而是伸缩笔尖、夹扣联动、金属笔身和单手开合体验。官方 LAMY dialog 页面可以作为机制锚点。\n\n需要谨慎的是命名：当前官方英文页面使用 dialog 命名，而站内条目写 Dialog 3 / 焦点3。它们之间的版本、年代和地区命名要补 catalog 或官方历史资料后才能写死。与 Pilot Capless 的比较也应作为玩家/品类语境，不应直接写成官方事实。",
      sourceNotes:
        "Official LAMY dialog product page anchors the retractable mechanism. Historical dialog 3 naming and competitor comparisons remain needs_source.",
      sourceItemIds: ["source-lamy-dialog-official"],
      claimIds: [
        "claim-lamy-dialog-official-mechanism",
        "claim-lamy-dialog-3-source-boundary",
      ],
    }),
  },
  {
    slug: "凌美-lamy-logo",
    brandSlug: "lamy",
    aliases: [
      { alias: "LAMY logo", language: "en" },
      { alias: "凌美 Logo", language: "zh" },
    ],
    sourceItemIds: [
      "source-lamy-logo-public-search",
      "source-lamy-z27-converter-official",
    ],
    spec: {
      id: "spec-lamy-logo-research",
      seriesName: "logo",
      originCountry: "德国（待核验）",
      nib: "钢尖说法待核验",
      fillSystem: "墨囊/上墨器说法待核验",
      material: "金属/拉丝表面说法待核验",
      priceRange: "100-200 说法待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-lamy-logo-source-boundary",
        "凌美 LAMY Logo",
        "source-lamy-logo-public-search",
        "current fountain-pen availability, archived catalog identity, nib, material, and converter compatibility",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-lamy-logo-research",
      title: "先把 LAMY logo 留在目录补证队列",
      summary:
        "LAMY logo 目前缺少稳定的官方钢笔产品页，先用公开检索和 Z27 配件页作为线索，不把钢尖、材质和 100-200 价位写成事实。",
      bodyMd:
        "LAMY logo 的难点在于：它不像 Safari、AL-star 或 dialog 那样容易找到当前官方钢笔产品页。站内原始摘要给出了“德国、钢尖、墨囊/上墨器、100-200”的清晰规格，但这些都需要 catalog、可靠零售页或官方归档来支撑。\n\n当前页面只保留研究队列。Z27 上墨器页面只能作为配件兼容线索，不能单独证明 logo 钢笔的全部规格。后续应先确认它在不同年份是否有 fountain pen 版本、对应的上墨器型号和笔身材料，再决定是否扩写。",
      sourceNotes:
        "Research queue only. LAMY accessory page is a compatibility clue, not a complete product source.",
      sourceItemIds: [
        "source-lamy-logo-public-search",
        "source-lamy-z27-converter-official",
      ],
      claimIds: ["claim-lamy-logo-source-boundary"],
    }),
  },
  {
    slug: "凌美-lamy-studio-演艺",
    brandSlug: "lamy",
    aliases: [
      { alias: "LAMY studio", language: "en", sourceId: "lamy-official" },
      { alias: "LAMY Studio", language: "en", sourceId: "lamy-official" },
      { alias: "凌美 演艺", language: "zh" },
    ],
    sourceItemIds: ["source-lamy-studio-official"],
    spec: {
      id: "spec-lamy-studio-research",
      seriesName: "studio",
      releaseYear: "待核验",
      originCountry: "德国",
      nib: "钢尖/金尖版本说法待核验",
      fillSystem: "T10 墨囊 / Z27 上墨器语境待核验",
      material: "金属笔身/表面处理待核验",
      dimensions: "待核验",
      weight: "待核验",
      priceRange: "中文二级市场/渠道价说法待核验",
      status: "现行/版本供货待核验",
      reviewStatus: "pending",
    },
    claims: [
      makeOfficialClaim(
        "claim-lamy-studio-official-product",
        "official_product_identity",
        "LAMY official product material identifies studio as a current fountain pen line with a design-led metal-body context.",
        "source-lamy-studio-official",
        "LAMY studio fountain pen / design-led product page",
      ),
      makeBoundaryClaim(
        "claim-lamy-studio-source-boundary",
        "凌美 LAMY Studio 演艺",
        "source-lamy-studio-official",
        "local value comparisons with LAMY 2000, exact nib options, finish variants, and Chinese pricing",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-lamy-studio-research",
      title: "把 LAMY studio 演艺放进设计款日用笔队列",
      summary:
        "LAMY studio 先用官方产品页锚定身份；“花 400 买 Studio 不如加钱上 LAMY 2000”属于玩家购买判断，需要价格和长期评测再补证。",
      bodyMd:
        "LAMY studio / 演艺适合放在 LAMY 的现代设计款日用笔路径里：它不像 safari 那样是校用入口，也不像 LAMY 2000 那样承担品牌现代主义旗舰叙事。官方 studio 页面可以先支撑产品身份和设计款语境。\n\n站内原始摘要里的“花 400 买 Studio 不如加钱上 LAMY 2000”是很典型的玩家购买判断。它需要价格区间、笔尖配置、重量、握感、涂层耐久和同价位对比来支撑。当前档案先记录这个争议入口，但不把价值判断写成事实。",
      sourceNotes:
        "Official LAMY studio product page anchors product identity. Local price/value comparisons remain needs_source.",
      sourceItemIds: ["source-lamy-studio-official"],
      claimIds: [
        "claim-lamy-studio-official-product",
        "claim-lamy-studio-source-boundary",
      ],
    }),
  },
  {
    slug: "坛笔-penbbs-268",
    brandSlug: "penbbs",
    aliases: [
      { alias: "PenBBS 268", language: "en" },
      { alias: "坛笔 268", language: "zh" },
    ],
    sourceItemIds: [
      "source-gentleman-stationer-penbbs",
      "source-penbbs-268-public-search",
    ],
    spec: {
      id: "spec-penbbs-268-research",
      seriesName: "268",
      originCountry: "中国（待核验）",
      nib: "钢尖说法待核验",
      fillSystem: "上墨方式待核验",
      material: "树脂/亚克力说法待核验",
      priceRange: "平价玩家款说法待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-penbbs-268-source-boundary",
        "坛笔 PenBBS 268",
        "source-penbbs-268-public-search",
        "model identity, filling system, nib, material, and buyer-channel claims",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-penbbs-268-research",
      title: "把 PenBBS 268 先放进社区品牌型号队列",
      summary:
        "PenBBS 268 目前先作为待核验型号保留：能确认品牌社区语境，但具体上墨、材质、版本和价格需要直接产品/评测来源。",
      bodyMd:
        "PenBBS 的页面很容易被玩家口碑带着走。268 这个条目当前只有“圈内有固定粉丝群”的入口，说明它属于社区型品牌的典型阅读路径；但这句话不能替代规格。\n\n本页先用 PenBBS 品牌/评测索引建立背景，再用公开检索入口收集 268 的直接产品页、评测和实物资料。确认前，不写死上墨方式、笔尖、材质和价格。",
      sourceNotes:
        "Secondary PenBBS brand/review index plus model search queue. Product-level facts remain needs_source.",
      sourceItemIds: [
        "source-gentleman-stationer-penbbs",
        "source-penbbs-268-public-search",
      ],
      claimIds: ["claim-penbbs-268-source-boundary"],
    }),
  },
  {
    slug: "坛笔-penbbs-456",
    brandSlug: "penbbs",
    aliases: [
      { alias: "PenBBS 456", language: "en" },
      { alias: "坛笔 456", language: "zh" },
    ],
    sourceItemIds: [
      "source-narratess-penbbs-fountain-pens",
      "source-penbbs-456-public-search",
    ],
    spec: {
      id: "spec-penbbs-456-research",
      seriesName: "456",
      originCountry: "中国（待核验）",
      nib: "钢尖说法待核验",
      fillSystem: "活塞/真空上墨说法待核验",
      material: "树脂/亚克力说法待核验",
      priceRange: "平价玩家款说法待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-penbbs-456-source-boundary",
        "坛笔 PenBBS 456",
        "source-penbbs-456-public-search",
        "whether the local 活塞款 summary should actually map to piston, vacuum, or another filling-system description",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-penbbs-456-research",
      title: "先核验 PenBBS 456 的上墨系统",
      summary:
        "PenBBS 456 的原始摘要写作“活塞款”，但上墨系统需要直接来源确认，当前页面先把它放进机制待核验队列。",
      bodyMd:
        "456 这个条目值得单独处理，因为它的核心不是一句“PenBBS 产品线”，而是上墨系统。原始摘要说它是“活塞款”，但社区讨论中这类中文简称经常把活塞、负压、真空或大容量上墨混在一起。\n\n当前档案先把 456 放进机制待核验队列。后续补证顺序应是：产品页或包装说明、拆解/评测、实际上墨路径，再决定它应该进入活塞、真空还是其他机制展览。",
      sourceNotes:
        "Secondary PenBBS context plus model search queue. Filling-system classification remains needs_source.",
      sourceItemIds: [
        "source-narratess-penbbs-fountain-pens",
        "source-penbbs-456-public-search",
      ],
      claimIds: ["claim-penbbs-456-source-boundary"],
    }),
  },
  {
    slug: "坛笔-penbbs-469",
    brandSlug: "penbbs",
    aliases: [
      { alias: "PenBBS 469", language: "en" },
      { alias: "坛笔 469", language: "zh" },
    ],
    sourceItemIds: [
      "source-narratess-penbbs-fountain-pens",
      "source-penbbs-469-public-search",
    ],
    spec: {
      id: "spec-penbbs-469-research",
      seriesName: "469",
      originCountry: "中国（待核验）",
      nib: "笔尖配置待核验",
      fillSystem: "双头/双舱/上墨方式说法待核验",
      material: "树脂/亚克力说法待核验",
      priceRange: "平价玩家款说法待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-penbbs-469-source-boundary",
        "坛笔 PenBBS 469",
        "source-penbbs-469-public-search",
        "body layout, double-ended/double-reservoir claims, filling system, and version differences",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-penbbs-469-research",
      title: "把 PenBBS 469 留给结构形态补证",
      summary:
        "PenBBS 469 先作为结构形态待核验页，重点确认双头/双舱、上墨方式和版本差异。",
      bodyMd:
        "469 的阅读重点更像结构形态，而不是普通外观评价。当前页面不直接写它是双头、双舱还是某种特殊储墨结构，因为这些都需要产品页、实物图和评测互相印证。\n\n本页先建立研究入口：PenBBS 品牌语境来自二级评测资料，469 的具体结构则用检索入口继续找直接证据。",
      sourceNotes:
        "Secondary PenBBS context plus model search queue. Structural claims remain needs_source.",
      sourceItemIds: [
        "source-narratess-penbbs-fountain-pens",
        "source-penbbs-469-public-search",
      ],
      claimIds: ["claim-penbbs-469-source-boundary"],
    }),
  },
  {
    slug: "坛笔-penbbs-494",
    brandSlug: "penbbs",
    aliases: [
      { alias: "PenBBS 494", language: "en" },
      { alias: "坛笔 494", language: "zh" },
    ],
    sourceItemIds: [
      "source-gentleman-stationer-penbbs",
      "source-penbbs-494-public-search",
    ],
    spec: {
      id: "spec-penbbs-494-research",
      seriesName: "494",
      originCountry: "中国（待核验）",
      nib: "钢尖说法待核验",
      fillSystem: "上墨方式待核验",
      material: "笔身材质待核验",
      priceRange: "平价玩家款说法待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-penbbs-494-source-boundary",
        "坛笔 PenBBS 494",
        "source-penbbs-494-public-search",
        "model identity, filling system, material, and buyer-channel claims",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-penbbs-494-research",
      title: "把 PenBBS 494 先做成产品线待核验页",
      summary:
        "PenBBS 494 目前缺少直接来源，先保留品牌社区语境和型号检索入口，避免用笼统产品线评价代替规格。",
      bodyMd:
        "494 当前只有“PenBBS 产品线”的粗略入口。这样的页面如果继续补空泛评价，会让用户看完仍然不知道这支笔有什么结构、尺寸或版本差异。\n\n当前档案先把它做成待核验页：先确认 494 的产品身份、上墨方式、笔尖配置和材料，再决定是否进入某个机制或入门型号专题。",
      sourceNotes:
        "Secondary PenBBS context plus model search queue. Product-level facts remain needs_source.",
      sourceItemIds: [
        "source-gentleman-stationer-penbbs",
        "source-penbbs-494-public-search",
      ],
      claimIds: ["claim-penbbs-494-source-boundary"],
    }),
  },
  {
    slug: "坛笔-penbbs-金尖大明尖",
    brandSlug: "penbbs",
    aliases: [
      { alias: "PenBBS gold nib", language: "en" },
      { alias: "PenBBS 大明尖", language: "zh" },
      { alias: "坛笔 金尖大明尖", language: "zh" },
    ],
    sourceItemIds: [
      "source-narratess-penbbs-fountain-pens",
      "source-penbbs-gold-nib-public-search",
    ],
    spec: {
      id: "spec-penbbs-gold-nib-research",
      seriesName: "金尖 / 大明尖",
      releaseYear: "待核验",
      originCountry: "中国（待核验）",
      nib: "金尖/大明尖命名待核验",
      fillSystem: "取决于搭载笔款，待核验",
      material: "取决于搭载笔款，待核验",
      dimensions: "不适合按单一笔款填写",
      weight: "不适合按单一笔款填写",
      priceRange: "金尖线价位待核验",
      status: "可能应拆为笔尖/版本或搭载型号",
      reviewStatus: "needs_source",
    },
    claims: [
      makeBoundaryClaim(
        "claim-penbbs-gold-nib-source-boundary",
        "坛笔 PenBBS 金尖大明尖",
        "source-penbbs-gold-nib-public-search",
        "whether this is a nib option, a specific model, a size nickname, or a product line",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-penbbs-gold-nib-research",
      title: "先判断金尖大明尖是笔尖还是型号",
      summary:
        "PenBBS 金尖大明尖更像笔尖/版本线索，而不一定是单支笔；当前先保留研究入口，后续需要重分类判断。",
      bodyMd:
        "“金尖大明尖”这个条目需要先拆语义：它可能指金尖产品线、某种大尺寸笔尖、搭载某款笔的版本，或者中文玩家给某个规格的叫法。直接按普通型号填写尺寸、材质和上墨会制造伪精确。\n\n当前页面先把它作为研究入口。后续应优先确认它是否应迁移到 nib 条目，或拆到具体搭载型号的版本里。",
      sourceNotes:
        "Secondary PenBBS context plus nib/model naming search queue. Entity type remains needs_source.",
      sourceItemIds: [
        "source-narratess-penbbs-fountain-pens",
        "source-penbbs-gold-nib-public-search",
      ],
      claimIds: ["claim-penbbs-gold-nib-source-boundary"],
    }),
  },
  {
    slug: "威迪文-waterman-权威-expert",
    brandSlug: "waterman",
    aliases: [
      { alias: "Waterman Expert", language: "en" },
      { alias: "威迪文 权威", language: "zh" },
    ],
    sourceItemIds: [
      "source-waterman-official-heritage",
      "source-waterman-expert-public-search",
    ],
    spec: {
      id: "spec-waterman-expert-research",
      seriesName: "Expert",
      originCountry: "法国（待核验）",
      nib: "钢尖说法待核验",
      fillSystem: "墨囊/上墨器说法待核验",
      material: "金属/漆面说法待核验",
      priceRange: "500-1000 说法待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-waterman-expert-source-boundary",
        "威迪文 Waterman Expert",
        "source-waterman-expert-public-search",
        "Expert model generation, nib, filling system, dimensions, materials, and local price band",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-waterman-expert-research",
      title: "把 Expert 权威先放进现代 Waterman 产品线",
      summary:
        "Waterman Expert 先以官方品牌 heritage 和型号检索入口建立档案；钢尖、上墨、材质和 500-1000 价位都保留待核验。",
      bodyMd:
        "Expert / 权威适合放在 Waterman 的现代商务日用笔路径里读，但当前页面还不能直接写成已审核规格。Waterman 官方 heritage 能支撑品牌历史背景，却不能单独证明 Expert 的笔尖、尺寸或价格。\n\n本页先把 Expert 做成研究队列：先补官方产品页或可靠零售规格，再补长期评测。没有直接来源前，中文价位和“法国、钢尖、墨囊/上墨器”的原始摘要都保持待核验。",
      sourceNotes:
        "Waterman heritage is brand-level context. Model-specific facts use search queue until direct product/catalog sources are attached.",
      sourceItemIds: [
        "source-waterman-official-heritage",
        "source-waterman-expert-public-search",
      ],
      claimIds: ["claim-waterman-expert-source-boundary"],
    }),
  },
  {
    slug: "威迪文-waterman-查尔斯顿-hemisphere",
    brandSlug: "waterman",
    aliases: [
      { alias: "Waterman Hemisphere", language: "en" },
      { alias: "Waterman Charleston", language: "en" },
      { alias: "威迪文 查尔斯顿 / Hemisphere", language: "zh" },
    ],
    sourceItemIds: [
      "source-waterman-official-heritage",
      "source-waterman-hemisphere-public-search",
    ],
    spec: {
      id: "spec-waterman-charleston-hemisphere-research",
      seriesName: "Charleston / Hemisphere 身份待拆分",
      originCountry: "法国（待核验）",
      nib: "钢尖说法待核验",
      fillSystem: "墨囊/上墨器说法待核验",
      material: "笔身材质待核验",
      priceRange: "300-600 说法待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-waterman-charleston-hemisphere-boundary",
        "威迪文 Waterman 查尔斯顿 Hemisphere",
        "source-waterman-hemisphere-public-search",
        "whether this page combines Charleston and Hemisphere, and which specs belong to each model",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-waterman-charleston-hemisphere-research",
      title: "先拆清 Charleston 与 Hemisphere 的混合命名",
      summary:
        "当前条目把查尔斯顿和 Hemisphere 放在一起，先作为身份待拆分页处理，避免把两个 Waterman 系列的规格混写。",
      bodyMd:
        "这个页面最明显的问题是命名：`查尔斯顿 Hemisphere` 很可能把两个 Waterman 系列或市场称呼合并了。继续在这个页面写钢尖、价格和上墨方式，会把不同型号的信息混到一起。\n\n当前档案只做边界整理：Waterman heritage 提供品牌背景，公开检索入口用于确认 Charleston 与 Hemisphere 是否应拆成两个页面。拆清之前，规格和价位都保持待核验。",
      sourceNotes:
        "Waterman heritage is brand-level context. Local mixed naming remains needs_source and may need a split.",
      sourceItemIds: [
        "source-waterman-official-heritage",
        "source-waterman-hemisphere-public-search",
      ],
      claimIds: ["claim-waterman-charleston-hemisphere-boundary"],
    }),
  },
  {
    slug: "威迪文-waterman-海韵-car-ne",
    brandSlug: "waterman",
    aliases: [
      { alias: "Waterman Carene", language: "en" },
      { alias: "Waterman Carène", language: "fr" },
      { alias: "威迪文 海韵", language: "zh" },
    ],
    sourceItemIds: [
      "source-waterman-official-heritage",
      "source-waterman-carene-public-search",
    ],
    spec: {
      id: "spec-waterman-carene-research",
      seriesName: "Carene / Carène",
      originCountry: "法国（待核验）",
      nib: "金尖/嵌入式笔尖说法待核验",
      fillSystem: "墨囊/上墨器说法待核验",
      material: "金属/漆面说法待核验",
      priceRange: "中高端 Waterman 价位待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-waterman-carene-source-boundary",
        "威迪文 Waterman 海韵 Carene",
        "source-waterman-carene-public-search",
        "Carene/Carène spelling, nib design, filling system, service/accessory claims, and local availability",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-waterman-carene-research",
      title: "把 Carène 海韵先做成 Waterman 现代设计页",
      summary:
        "Waterman Carène / 海韵先作为现代设计型号研究页，售后、配件和国内小众程度都作为待核验的用户体验线索。",
      bodyMd:
        "Carène / 海韵适合成为 Waterman 现代设计线的入口，但当前站内摘要主要强调“国内小众、售后和配件不方便”。这类购买体验判断很有用，却需要地区渠道、售后政策和用户长期反馈支撑。\n\n当前档案先锚定 Waterman 品牌背景和 Carène 检索入口，不写死嵌入式笔尖、金尖、上墨方式或售后结论。后续补证应优先找官方产品页、可靠零售规格和维修/配件资料。",
      sourceNotes:
        "Waterman heritage is brand-level context. Carene model facts and local service claims remain needs_source.",
      sourceItemIds: [
        "source-waterman-official-heritage",
        "source-waterman-carene-public-search",
      ],
      claimIds: ["claim-waterman-carene-source-boundary"],
    }),
  },
  {
    slug: "并木-namiki-飞升龙",
    brandSlug: "namiki",
    aliases: [
      { alias: "Namiki Flying Dragon", language: "en" },
      { alias: "Namiki Dragon", language: "en" },
      { alias: "并木 飞升龙", language: "zh" },
    ],
    sourceItemIds: [
      "source-namiki-official-home",
      "source-namiki-flying-dragon-public-search",
    ],
    spec: {
      id: "spec-namiki-flying-dragon-research",
      seriesName: "Flying Dragon / artwork identity pending",
      originCountry: "日本（待核验）",
      nib: "金尖/尺寸待核验",
      fillSystem: "上墨方式待核验",
      material: "莳绘/漆艺主题待核验",
      priceRange: "高端/收藏级说法待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-namiki-flying-dragon-source-boundary",
        "并木 Namiki 飞升龙",
        "source-namiki-flying-dragon-public-search",
        "exact artwork title, collection, nib, filling system, edition status, and whether this is a recurring motif or specific product",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-namiki-flying-dragon-research",
      title: "先确认飞升龙是作品名、主题还是系列条目",
      summary:
        "Namiki 飞升龙目前先按莳绘作品身份待核验页处理；官方 Namiki 站只支撑品牌/工艺语境，具体作品需要精确来源。",
      bodyMd:
        "飞升龙这种条目必须比普通量产型号更谨慎：它可能是作品名、图案主题、限量款、地区译名，甚至与相邻的龙主题作品混淆。官方 Namiki 站能支撑 Maki-e 豪华钢笔的品牌语境，但不能单独证明“飞升龙”的具体笔款规格。\n\n当前页面先建立研究入口。后续应优先找到官方产品页、目录、拍卖/经销资料或可靠图录，确认英文名、所属 collection、笔尖、上墨和版次，再扩写成完整作品档案。",
      sourceNotes:
        "Namiki official site anchors brand/Maki-e context only. Flying Dragon artwork identity remains needs_source.",
      sourceItemIds: [
        "source-namiki-official-home",
        "source-namiki-flying-dragon-public-search",
      ],
      claimIds: ["claim-namiki-flying-dragon-source-boundary"],
    }),
  },
  {
    slug: "弘典-hongdian-1866",
    brandSlug: "hongdian",
    aliases: [
      { alias: "HongDian 1866", language: "en" },
      { alias: "Hong Dian 1866", language: "en" },
      { alias: "弘典 1866", language: "zh" },
    ],
    sourceItemIds: ["source-hongdian-1866-public-search"],
    spec: {
      id: "spec-hongdian-1866-research",
      seriesName: "1866",
      originCountry: "中国（待核验）",
      nib: "钢尖说法待核验",
      fillSystem: "墨囊/上墨器说法待核验",
      material: "笔身材质待核验",
      priceRange: "50-100 说法待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-hongdian-1866-source-boundary",
        "弘典 HongDian 1866",
        "source-hongdian-1866-public-search",
        "product identity, nib, filling system, material, and low-price claims",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-hongdian-1866-research",
      title: "把 HongDian 1866 先作为低价金属日用笔候选",
      summary:
        "HongDian 1866 暂时只保留为待核验型号，钢尖、墨囊/上墨器和 50-100 价位都需要直接产品/评测来源。",
      bodyMd:
        "HongDian 1866 的原始摘要很像电商规格：国家、钢尖、上墨方式和价格都很清楚。但如果没有直接来源，这种清楚反而危险，容易把某个店铺标题当成稳定事实。\n\n当前页面先建立研究队列，后续补证应优先找产品页、包装说明、可靠零售规格和长期评测。确认前，不写死材质、尖号和价格。",
      sourceNotes:
        "Research queue only. Direct product/catalog/review evidence is required before specs and price notes become factual.",
      sourceItemIds: ["source-hongdian-1866-public-search"],
      claimIds: ["claim-hongdian-1866-source-boundary"],
    }),
  },
  {
    slug: "弘典-hongdian-516",
    brandSlug: "hongdian",
    aliases: [
      { alias: "HongDian 516", language: "en" },
      { alias: "Hong Dian 516", language: "en" },
      { alias: "弘典 516", language: "zh" },
    ],
    sourceItemIds: ["source-hongdian-516-public-search"],
    spec: {
      id: "spec-hongdian-516-research",
      seriesName: "516",
      originCountry: "中国（待核验）",
      nib: "钢尖说法待核验",
      fillSystem: "墨囊说法待核验",
      material: "笔身材质待核验",
      priceRange: "20-40 说法待核验",
      ...RESEARCH_SPEC,
    },
    claims: [
      makeBoundaryClaim(
        "claim-hongdian-516-source-boundary",
        "弘典 HongDian 516",
        "source-hongdian-516-public-search",
        "product identity, nib, cartridge/filling system, material, and ultra-low price claims",
      ),
    ],
    story: makeResearchStory({
      id: "story-model-hongdian-516-research",
      title: "把 HongDian 516 先放进超低价型号补证队列",
      summary:
        "HongDian 516 当前按超低价待核验型号处理，20-40 价位、墨囊和钢尖说法都需要直接来源。",
      bodyMd:
        "516 的原始摘要比 1866 更像价格清单：`中国；钢尖；墨囊；20-40`。这类信息如果没有来源，很容易过期，也可能只对应某个渠道、颜色或套装。\n\n本页先保留为研究队列。后续应优先补产品页、零售规格、包装或评测，再决定它是否适合进入“低价入门笔”专题。",
      sourceNotes:
        "Research queue only. Direct product/catalog/review evidence is required before specs and price notes become factual.",
      sourceItemIds: ["source-hongdian-516-public-search"],
      claimIds: ["claim-hongdian-516-source-boundary"],
    }),
  },
  makeSearchOnlyModel({
    slug: "弘典-hongdian-517-517s",
    brandSlug: "hongdian",
    aliases: [
      { alias: "HongDian 517", language: "en" },
      { alias: "HongDian 517s", language: "en" },
      { alias: "Hong Dian 517/517s", language: "en" },
      { alias: "弘典 517/517s", language: "zh" },
    ],
    sourceItemId: "source-hongdian-517-517s-public-search",
    specId: "spec-hongdian-517-517s-research",
    seriesName: "517 / 517s",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊说法待核验",
    material: "笔身材质待核验",
    priceRange: "30-50 说法待核验",
    claimId: "claim-hongdian-517-517s-source-boundary",
    modelName: "弘典 HongDian 517/517s",
    focus:
      "product identity, 517 versus 517s differences, nib, cartridge system, material, and 30-50 price claims",
    storyId: "story-model-hongdian-517-517s-research",
    storyTitle: "把 HongDian 517/517s 先拆成入门型号补证页",
    storySummary:
      "HongDian 517/517s 先保留为入门型号研究档案，517 与 517s 是否只是版本差异、墨囊规格和 30-50 价位都保持待核验。",
    storyBodyMd:
      "517/517s 的页面需要先回答两个问题：它们是同一型号的版本差异，还是应该拆成两个页面；其次，原始摘要里的钢尖、墨囊和 30-50 价位是否来自稳定产品页。\n\n当前档案只建立检索入口和证据边界。后续补证优先级是产品页、包装/说明书、可靠零售规格和长期评测；没有来源前，不把低价和上墨方式写成确定事实。",
  }),
  makeSearchOnlyModel({
    slug: "弘典-hongdian-6013文武黑将",
    brandSlug: "hongdian",
    aliases: [
      { alias: "HongDian 6013", language: "en" },
      { alias: "Hong Dian 6013", language: "en" },
      { alias: "弘典 6013 文武黑将", language: "zh" },
    ],
    sourceItemId: "source-hongdian-6013-public-search",
    specId: "spec-hongdian-6013-research",
    seriesName: "6013 / 文武黑将",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "笔身材质待核验",
    priceRange: "50-80 说法待核验",
    claimId: "claim-hongdian-6013-source-boundary",
    modelName: "弘典 HongDian 6013 文武黑将",
    focus:
      "6013 naming, 文武黑将 market name, nib, filling system, material, and 50-80 price claims",
    storyId: "story-model-hongdian-6013-research",
    storyTitle: "先把 6013 文武黑将放进命名核验队列",
    storySummary:
      "HongDian 6013 文武黑将先按命名待核验页处理，避免把店铺标题里的别名、套装和规格混成稳定型号事实。",
    storyBodyMd:
      "6013 文武黑将的核心问题是命名：`6013` 是型号编号，`文武黑将` 可能是颜色、套装、市场名或玩家称呼。继续扩写前，页面应该先确认这些词之间的关系。\n\n当前档案保留原始摘要里的钢尖、墨囊/上墨器和 50-80 价位，但全部标为待核验。后续适合补一条直接产品来源，再补一条评测来源，用来区分客观规格和手感评价。",
  }),
  makeSearchOnlyModel({
    slug: "弘典-hongdian-620鸡尾酒",
    brandSlug: "hongdian",
    aliases: [
      { alias: "HongDian 620", language: "en" },
      { alias: "HongDian Cocktail", language: "en" },
      { alias: "弘典 620 鸡尾酒", language: "zh" },
    ],
    sourceItemId: "source-hongdian-620-cocktail-public-search",
    specId: "spec-hongdian-620-cocktail-research",
    seriesName: "620 / 鸡尾酒",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "笔身材质待核验",
    priceRange: "50-80 说法待核验",
    claimId: "claim-hongdian-620-cocktail-source-boundary",
    modelName: "弘典 HongDian 620 鸡尾酒",
    focus:
      "620 model identity, Cocktail color/theme naming, nib, filling system, material, and 50-80 price claims",
    storyId: "story-model-hongdian-620-cocktail-research",
    storyTitle: "把 620 鸡尾酒先做成色彩主题待核验页",
    storySummary:
      "HongDian 620 鸡尾酒适合作为色彩主题型号入口，但颜色名、材质和规格都需要产品页或评测来源支撑。",
    storyBodyMd:
      "鸡尾酒这个名字本身很适合图书馆化：它可能对应颜色叙事、透明/渐变材质或一组市场款式。但在证据没有补齐前，页面不能把主题想象直接写成事实。\n\n当前档案先建立 620 / 鸡尾酒的检索入口。后续应确认颜色数量、材质、笔尖、上墨方式和是否存在不同批次，再把它扩写成“平价国产色彩设计”专题里的一个小节点。",
  }),
  makeSearchOnlyModel({
    slug: "弘典-hongdian-m2迷你",
    brandSlug: "hongdian",
    aliases: [
      { alias: "HongDian M2", language: "en" },
      { alias: "Hong Dian M2 Mini", language: "en" },
      { alias: "弘典 M2 迷你", language: "zh" },
    ],
    sourceItemId: "source-hongdian-m2-public-search",
    specId: "spec-hongdian-m2-mini-research",
    seriesName: "M2 / 迷你",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊说法待核验",
    material: "笔身材质待核验",
    priceRange: "30-60 说法待核验",
    claimId: "claim-hongdian-m2-mini-source-boundary",
    modelName: "弘典 HongDian M2 迷你",
    focus:
      "pocket-size dimensions, nib, cartridge system, material, and 30-60 price claims",
    storyId: "story-model-hongdian-m2-mini-research",
    storyTitle: "先核验 M2 迷你的口袋尺寸和上墨方式",
    storySummary:
      "HongDian M2 迷你先作为口袋笔研究页：迷你尺寸、墨囊规格、笔身材质和价位都等直接来源确认。",
    storyBodyMd:
      "M2 迷你的价值不只在价格，更在尺寸：如果它是口袋笔，页面就应该记录合盖、开盖、插帽后的长度，以及携带场景下的握持差异。现在这些都还缺来源。\n\n当前档案把它放进小型日用笔补证队列。后续补证时，尺寸和重量比形容词更重要；上墨方式也要区分短墨囊、标准墨囊和是否可用上墨器。",
  }),
  makeSearchOnlyModel({
    slug: "弘典-hongdian-n6云章",
    brandSlug: "hongdian",
    aliases: [
      { alias: "HongDian N6", language: "en" },
      { alias: "Hong Dian N6 Yunzhang", language: "en" },
      { alias: "弘典 N6 云章", language: "zh" },
    ],
    sourceItemId: "source-hongdian-n6-public-search",
    specId: "spec-hongdian-n6-yunzhang-research",
    seriesName: "N6 / 云章",
    originCountry: "中国（待核验）",
    nib: "钢尖/软弹尖说法待核验",
    fillSystem: "上墨方式待核验",
    material: "笔身材质待核验",
    priceRange: "200 以内说法待核验",
    claimId: "claim-hongdian-n6-yunzhang-source-boundary",
    modelName: "弘典 HongDian N6 云章",
    focus:
      "strong value claims, nib feel, build quality, filling system, material, and sub-200 price positioning",
    storyId: "story-model-hongdian-n6-yunzhang-research",
    storyTitle: "把 N6 云章先从强口碑里拆出证据问题",
    storySummary:
      "N6 云章的原始摘要带有很强的玩家评价，当前页面先把“200 内”“14K 观感”等说法改成待核验的观点线索。",
    storyBodyMd:
      "N6 云章的原始摘要不是普通规格表，而是强烈的玩家判断：`200块以内国产笔天花板级别的做工和写感`，甚至有“如果笔尖标个14K定700块也不违和”的对比。这些句子很有现场感，但它们属于观点线索，不能直接变成图书馆事实。\n\n当前档案先把它拆成两个任务：一是确认客观规格，包括笔尖、上墨、材质、重量和价格；二是给口碑说法寻找可归因的评测来源。没有评测元数据前，页面只保留其为待核验玩家评价。",
  }),
  makeSearchOnlyModel({
    slug: "弘典-hongdian-t1钛合金",
    brandSlug: "hongdian",
    aliases: [
      { alias: "HongDian T1 Titanium", language: "en" },
      { alias: "HongDian T1", language: "en" },
      { alias: "弘典 T1 钛合金", language: "zh" },
    ],
    sourceItemId: "source-hongdian-t1-public-search",
    specId: "spec-hongdian-t1-titanium-research",
    seriesName: "T1 / 钛合金",
    originCountry: "中国（待核验）",
    nib: "钢尖/软弹尖说法待核验",
    fillSystem: "上墨方式待核验",
    material: "钛合金/金属材质说法待核验",
    priceRange: "168 说法待核验",
    claimId: "claim-hongdian-t1-titanium-source-boundary",
    modelName: "弘典 HongDian T1 钛合金",
    focus:
      "titanium or metal material, weight, soft nib feel, filling system, and 168 price claim",
    storyId: "story-model-hongdian-t1-titanium-research",
    storyTitle: "把 T1 钛合金先做成材质和手感核验页",
    storySummary:
      "T1 钛合金的卖点集中在材质、重量和软弹尖手感，当前页面只把这些作为补证任务，不写成已审核规格。",
    storyBodyMd:
      "T1 钛合金的原始摘要把卖点说得很直：`168块全金属+软弹尖`。这类说法特别需要来源，因为材质、重量、弹性和价格都会随批次、渠道和主观体验变化。\n\n当前档案先记录待核验字段：钛合金/金属材质、重量、笔尖弹性、上墨方式和价格。后续如果能找到产品页与长期评测，就可以把它扩成“国产金属日用笔”路线里的材质案例。",
  }),
  makeSearchOnlyModel({
    slug: "弘典-hongdian-秦",
    brandSlug: "hongdian",
    aliases: [
      { alias: "HongDian Qin", language: "en" },
      { alias: "Hong Dian Qin", language: "en" },
      { alias: "弘典 秦", language: "zh" },
    ],
    sourceItemId: "source-hongdian-qin-public-search",
    specId: "spec-hongdian-qin-research",
    seriesName: "秦",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊说法待核验",
    material: "笔身材质待核验",
    priceRange: "30-50 说法待核验",
    claimId: "claim-hongdian-qin-source-boundary",
    modelName: "弘典 HongDian 秦",
    focus:
      "Qin model identity, theme naming, nib, cartridge system, material, and 30-50 price claims",
    storyId: "story-model-hongdian-qin-research",
    storyTitle: "先确认弘典“秦”是型号名还是主题名",
    storySummary:
      "弘典“秦”目前只保留为主题/型号身份待核验页，钢尖、墨囊和 30-50 价位都需要直接来源。",
    storyBodyMd:
      "单字主题名很容易在电商、玩家口语和实际型号之间滑动。`秦` 可能是系列主题、颜色名、套装名，也可能就是型号名。\n\n当前档案先把它放进命名核验队列。后续补证要优先确认完整英文/中文标题、是否存在其他朝代或主题同系列、以及规格是否只对应某个颜色或批次。",
  }),
  makeSearchOnlyModel({
    slug: "弘典-hongdian-苏木",
    brandSlug: "hongdian",
    aliases: [
      { alias: "HongDian Sumu", language: "en" },
      { alias: "Hong Dian Sumu", language: "en" },
      { alias: "弘典 苏木", language: "zh" },
    ],
    sourceItemId: "source-hongdian-sumu-public-search",
    specId: "spec-hongdian-sumu-research",
    seriesName: "苏木",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "上墨方式待核验",
    material: "笔身材质待核验",
    priceRange: "价位待核验",
    claimId: "claim-hongdian-sumu-source-boundary",
    modelName: "弘典 HongDian 苏木",
    focus:
      "review prevalence, seal performance, first-stroke dryness, model identity, nib, filling system, and material",
    storyId: "story-model-hongdian-sumu-research",
    storyTitle: "把苏木的开箱热度和气密性说法分开核验",
    storySummary:
      "苏木条目的原始摘要包含 B 站开箱和气密性体验判断；当前页面先把它们作为待归因评论线索。",
    storyBodyMd:
      "苏木不是单纯缺规格，它还带着明显的体验争议：原始摘要提到 B 站开箱评测频繁出现，也提到放两三天第一笔不出水。这些内容很适合进入玩家口碑区，但前提是有具体视频、发布时间和样本条件。\n\n当前档案先把客观规格和主观体验拆开。产品页负责证明型号、材质和上墨方式；评测来源负责承载气密性、干尖、首笔出水这类体验判断。",
  }),
  makeSearchOnlyModel({
    slug: "弘典-hongdian-远航者",
    brandSlug: "hongdian",
    aliases: [
      { alias: "HongDian Yuanhangzhe", language: "en" },
      { alias: "Hong Dian Voyager", language: "en" },
      { alias: "弘典 远航者", language: "zh" },
    ],
    sourceItemId: "source-hongdian-yuanhangzhe-public-search",
    specId: "spec-hongdian-yuanhangzhe-research",
    seriesName: "远航者",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "笔身材质待核验",
    priceRange: "50-80 说法待核验",
    claimId: "claim-hongdian-yuanhangzhe-source-boundary",
    modelName: "弘典 HongDian 远航者",
    focus:
      "model identity, translated naming, nib, filling system, material, and 50-80 price claims",
    storyId: "story-model-hongdian-yuanhangzhe-research",
    storyTitle: "先把远航者做成名称和规格待核验页",
    storySummary:
      "弘典远航者先按待核验型号处理，英文名、上墨方式、材质和 50-80 价位都等直接来源确认。",
    storyBodyMd:
      "远航者这个名称适合做成带主题感的型号页，但当前材料还停留在简短规格摘要。它需要先确认英文名、完整产品标题和不同颜色/版本，再进入故事扩写。\n\n当前档案先保留为研究队列。后续补证时，产品页优先于二手转述；如果有长期评测，再把重量、握持和日用可靠性写入用户体验部分。",
  }),
  makeSearchOnlyModel({
    slug: "弘典-hongdian-黑森林-黑森林pro",
    brandSlug: "hongdian",
    aliases: [
      { alias: "HongDian Black Forest", language: "en" },
      { alias: "HongDian Black Forest Pro", language: "en" },
      { alias: "HongDian 1861", language: "en" },
      { alias: "弘典 黑森林 / 黑森林 Pro", language: "zh" },
    ],
    sourceItemId: "source-hongdian-black-forest-pro-public-search",
    specId: "spec-hongdian-black-forest-pro-research",
    seriesName: "黑森林 / 黑森林 Pro / 1861",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "金属笔身说法待核验",
    priceRange: "50-100 说法待核验",
    claimId: "claim-hongdian-black-forest-pro-source-boundary",
    modelName: "弘典 HongDian 黑森林 / 黑森林 Pro",
    focus:
      "Black Forest versus Black Forest Pro versus 1861 naming, nib, filling system, material, and 50-100 price claims",
    storyId: "story-model-hongdian-black-forest-pro-research",
    storyTitle: "先拆清黑森林、黑森林 Pro 和 1861 的边界",
    storySummary:
      "黑森林是弘典更容易被用户认出的线索，但当前页面先处理普通黑森林、Pro 与 1861 是否应拆分的问题。",
    storyBodyMd:
      "黑森林比很多弘典型号更像一个真正的入口页：它有较高的识别度，也更容易连接到玩家评测和入门推荐。但当前 slug 把黑森林、黑森林 Pro 和 1861 放在一起，最先要解决的是边界。\n\n当前档案不急着写口碑结论，而是先标出拆分任务：确认普通黑森林、Pro 与 1861 的关系，分别核验笔尖、上墨、材质和价格。边界清楚后，它可以成为弘典品牌馆里的代表型号页。",
    variants: [
      {
        id: "variant-hongdian-black-forest-standard",
        name: "黑森林",
        notes: "可能应与黑森林 Pro / 1861 分开记录，具体关系待产品来源确认。",
        sourceItemId: "source-hongdian-black-forest-pro-public-search",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-hongdian-black-forest-pro-1861",
        name: "黑森林 Pro / 1861",
        notes: "当前只作为待核验版本线索，不把 1861 与 Pro 的关系写成确定事实。",
        sourceItemId: "source-hongdian-black-forest-pro-public-search",
        reviewStatus: "needs_source",
      },
    ],
  }),
  makeSearchOnlyModel({
    slug: "得力克-delike-元素系列",
    brandSlug: "delike",
    aliases: [
      { alias: "Delike Element", language: "en" },
      { alias: "Delike Element series", language: "en" },
      { alias: "得力克 元素系列", language: "zh" },
    ],
    sourceItemId: "source-delike-element-public-search",
    specId: "spec-delike-element-research",
    seriesName: "Element / 元素系列",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "笔身材质待核验",
    priceRange: "价位待核验",
    claimId: "claim-delike-element-source-boundary",
    modelName: "得力克 Delike 元素系列",
    focus:
      "Element series boundaries, nib, filling system, material, and current availability",
    storyId: "story-model-delike-element-research",
    storyTitle: "把 Delike 元素系列先放进低资料系列补证队列",
    storySummary:
      "Delike 元素系列目前只建立研究入口；品牌馆里的 Delike 背景不能替代这个具体系列的产品来源。",
    storyBodyMd:
      "Delike 已经有品牌故事入口，但元素系列仍然缺具体型号证据。品牌层面的 New Moon、平价中国钢笔生态或设计争议，都不能直接证明元素系列的笔尖、材质和上墨方式。\n\n当前档案先建立检索入口。后续补证要先确认元素系列是否包含多个尺寸、颜色或笔尖版本，再决定这个页面是系列总页，还是应该拆成若干具体型号。",
  }),
  makeSearchOnlyModel({
    slug: "文采-kaco-edge刀锋",
    brandSlug: "kaco",
    aliases: [
      { alias: "KACO Edge", language: "en" },
      { alias: "Kaco Edge Dao Feng", language: "en" },
      { alias: "文采 KACO Edge 刀锋", language: "zh" },
    ],
    sourceItemId: "source-kaco-edge-public-search",
    specId: "spec-kaco-edge-research",
    seriesName: "Edge / 刀锋",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "笔身材质待核验",
    priceRange: "价位待核验",
    claimId: "claim-kaco-edge-source-boundary",
    modelName: "文采 KACO Edge 刀锋",
    focus:
      "Edge / 刀锋 model identity, nib, filling system, material, and product positioning",
    storyId: "story-model-kaco-edge-research",
    storyTitle: "把 KACO Edge 刀锋先做成设计型号补证页",
    storySummary:
      "KACO Edge 刀锋先以现代设计型号研究页进入馆藏；刀锋命名、材质、上墨方式和价位都需要直接来源。",
    storyBodyMd:
      "KACO 的品牌馆已经能提供现代中国文具设计语境，但 Edge / 刀锋这个具体型号还需要单独证据。尤其是“刀锋”这样的设计名，必须确认它指向外形、笔尖、颜色，还是市场命名。\n\n当前档案先放入补证队列。后续优先补产品页或目录来源，再补评测；确认前只保留钢尖、墨囊/上墨器和设计定位为待核验线索。",
  }),
  makeSearchOnlyModel({
    slug: "晨光-按动钢笔",
    brandSlug: "mg",
    aliases: [
      { alias: "M&G retractable fountain pen", language: "en" },
      { alias: "M&G press fountain pen", language: "en" },
      { alias: "晨光 按动钢笔", language: "zh" },
    ],
    sourceItemId: "source-mg-retractable-public-search",
    specId: "spec-mg-retractable-research",
    seriesName: "按动钢笔 / retractable entry",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "按动/墨囊结构待核验",
    material: "笔身材质待核验",
    priceRange: "19 说法待核验",
    claimId: "claim-mg-retractable-source-boundary",
    modelName: "晨光 M&G 按动钢笔",
    focus:
      "retractable mechanism, cartridge compatibility, Capless-comparison claims, nib, material, and 19 price claim",
    storyId: "story-model-mg-retractable-research",
    storyTitle: "把晨光按动钢笔先和 Capless 体验装说法分开",
    storySummary:
      "晨光按动钢笔的原始摘要把它放在 Capless 体验装语境里；当前页面先区分机制事实、低价入口和玩家比较。",
    storyBodyMd:
      "晨光按动钢笔最容易被写歪的地方，是把“19 块体验按动钢笔”直接延展成“Capless 替代品”。这个对比有购买决策价值，但必须有具体产品页和评测来源承接。\n\n当前档案先保留三个任务：确认按动机构和墨囊/上墨结构，确认价格是否只对应某个渠道，再把与 Capless 的比较放进归因评论，而不是写成已核验事实。",
  }),
  makeSearchOnlyModel({
    slug: "末匠-majohn-80mini-e",
    brandSlug: "majohn",
    aliases: [
      { alias: "Majohn 80mini-E", language: "en" },
      { alias: "Moonman 80mini-E", language: "en" },
      { alias: "末匠 80mini-E", language: "zh" },
    ],
    sourceItemId: "source-majohn-80mini-e-public-search",
    specId: "spec-majohn-80mini-e-research",
    seriesName: "80mini-E",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊说法待核验",
    material: "笔身材质待核验",
    priceRange: "30-50 说法待核验",
    claimId: "claim-majohn-80mini-e-source-boundary",
    modelName: "末匠 Majohn 80mini-E",
    focus:
      "80mini-E identity, Moonman/Majohn naming, pocket dimensions, nib, cartridge system, material, and 30-50 price claims",
    storyId: "story-model-majohn-80mini-e-research",
    storyTitle: "先核验 80mini-E 的迷你尺寸和命名",
    storySummary:
      "Majohn 80mini-E 先作为迷你便携型号研究页，Moonman/Majohn 命名、墨囊规格和尺寸都保持待核验。",
    storyBodyMd:
      "80mini-E 的关键词是“小”和“命名”。末匠/Majohn 与 Moonman 的旧称关系、80mini-E 的完整标题、以及实际尺寸，都需要直接来源支撑。\n\n当前档案先建立研究入口。后续补证时，优先记录合盖/开盖/插帽长度、墨囊规格和笔尖选项，这些比“便携”这种形容词更能帮助用户判断。",
  }),
  makeSearchOnlyModel({
    slug: "末匠-majohn-a1-按动",
    brandSlug: "majohn",
    aliases: [
      { alias: "Majohn A1", language: "en" },
      { alias: "Moonman A1", language: "en" },
      { alias: "末匠 A1 按动", language: "zh" },
    ],
    sourceItemId: "source-majohn-a1-public-search",
    specId: "spec-majohn-a1-research",
    seriesName: "A1 / retractable",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "按动/墨囊或上墨器结构待核验",
    material: "笔身材质待核验",
    priceRange: "百元价位说法待核验",
    claimId: "claim-majohn-a1-source-boundary",
    modelName: "末匠 Majohn A1 按动",
    focus:
      "retractable mechanism, Capless-comparison claims, quality-control comments, nib, filling system, material, and price",
    storyId: "story-model-majohn-a1-research",
    storyTitle: "把 Majohn A1 的按动机制和 Capless 对比分开写",
    storySummary:
      "Majohn A1 的“百元 Capless”和品控评价都先作为待归因口碑线索，机制、兼容性和规格需要直接来源。",
    storyBodyMd:
      "A1 的原始摘要很有用户感：百元 Capless、海外评价高、按动手感和品控差异。这些都很适合进入购买指南，但不适合直接作为图书馆事实。\n\n当前档案把 A1 拆成两层：产品层核验按动机构、笔尖、上墨和材质；口碑层再记录与 Pilot Capless 的比较、按动手感和品控样本。没有明确评测来源前，只保留为待归因评论。",
  }),
  makeSearchOnlyModel({
    slug: "末匠-majohn-f9法师",
    brandSlug: "majohn",
    aliases: [
      { alias: "Majohn F9", language: "en" },
      { alias: "Moonman F9", language: "en" },
      { alias: "末匠 F9 法师", language: "zh" },
    ],
    sourceItemId: "source-majohn-f9-public-search",
    specId: "spec-majohn-f9-research",
    seriesName: "F9 / 法师",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "笔身材质待核验",
    priceRange: "50-100 说法待核验",
    claimId: "claim-majohn-f9-source-boundary",
    modelName: "末匠 Majohn F9 法师",
    focus:
      "F9 / 法师 model identity, design naming, nib, filling system, material, and 50-100 price claims",
    storyId: "story-model-majohn-f9-research",
    storyTitle: "先确认 F9 法师的型号身份和设计名",
    storySummary:
      "Majohn F9 法师先按个性外观型号研究页处理，法师命名、材质、上墨和价位都等待直接来源。",
    storyBodyMd:
      "F9 法师这类带昵称的现代国产型号，最需要先确认名称边界：`F9` 是编号，`法师` 是市场名、颜色名还是玩家称呼。边界不清时，规格也容易跟其他 F 系列混写。\n\n当前档案先建立检索入口。后续补证应先找产品页和长期评测，再决定它适合放进“末匠个性设计线”还是“平价日用线”。",
  }),
  makeSearchOnlyModel({
    slug: "末匠-majohn-m2",
    brandSlug: "majohn",
    aliases: [
      { alias: "Majohn M2", language: "en" },
      { alias: "Moonman M2", language: "en" },
      { alias: "末匠 M2", language: "zh" },
    ],
    sourceItemId: "source-majohn-m2-public-search",
    specId: "spec-majohn-m2-research",
    seriesName: "M2",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器或滴入式说法待核验",
    material: "透明笔身材质待核验",
    priceRange: "50-100 说法待核验",
    claimId: "claim-majohn-m2-source-boundary",
    modelName: "末匠 Majohn M2",
    focus:
      "Moonman/Majohn naming, demonstrator material, filling system, nib, and 50-100 price claims",
    storyId: "story-model-majohn-m2-research",
    storyTitle: "把 Majohn M2 先放进透明示范笔补证队列",
    storySummary:
      "Majohn M2 的透明示范、上墨方式和 Moonman/Majohn 命名都需要直接来源；当前只建立研究档案。",
    storyBodyMd:
      "M2 很适合成为入门透明示范笔页面，但“透明”“可视墨量”和上墨方式不能靠印象写死。尤其是 Moonman/Majohn 命名变迁可能导致不同资料页标题不一致。\n\n当前档案先做证据边界：确认材质、上墨方式、笔尖、容量和价格，再把它放进透明示范笔或平价入门专题。",
  }),
  makeSearchOnlyModel({
    slug: "末匠-majohn-p140",
    brandSlug: "majohn",
    aliases: [
      { alias: "Majohn P140", language: "en" },
      { alias: "Moonman P140", language: "en" },
      { alias: "末匠 P140", language: "zh" },
    ],
    sourceItemId: "source-majohn-p140-public-search",
    specId: "spec-majohn-p140-research",
    seriesName: "P140",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "笔身材质待核验",
    priceRange: "100-200 说法待核验",
    claimId: "claim-majohn-p140-source-boundary",
    modelName: "末匠 Majohn P140",
    focus:
      "P140 model identity, nib, filling system, material, and 100-200 price claims",
    storyId: "story-model-majohn-p140-research",
    storyTitle: "把 P140 先做成末匠中价位补证页",
    storySummary:
      "Majohn P140 暂按 100-200 价位待核验型号处理，材质、上墨、笔尖和定位都需要产品来源。",
    storyBodyMd:
      "P140 的当前摘要像一个中价位产品清单，但缺少能够支撑“稳定选择”的来源。对于这种型号，规格表和长期评测应该分工：前者确认参数，后者确认日用表现。\n\n当前档案先保留待核验规格。补证完成后，可以把 P140 放在 Majohn 的 P 系列路径中，与 P141 等材质型号并列比较。",
  }),
  makeSearchOnlyModel({
    slug: "末匠-majohn-p141-钛合金",
    brandSlug: "majohn",
    aliases: [
      { alias: "Majohn P141 Titanium", language: "en" },
      { alias: "Moonman P141", language: "en" },
      { alias: "末匠 P141 钛合金", language: "zh" },
    ],
    sourceItemId: "source-majohn-p141-titanium-public-search",
    specId: "spec-majohn-p141-titanium-research",
    seriesName: "P141 / 钛合金",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "钛合金/金属材质说法待核验",
    priceRange: "价位待核验",
    claimId: "claim-majohn-p141-titanium-source-boundary",
    modelName: "末匠 Majohn P141 钛合金",
    focus:
      "titanium or metal material, hand-feel claims, nib, filling system, and product positioning",
    storyId: "story-model-majohn-p141-titanium-research",
    storyTitle: "先把 P141 钛合金的材质和手感说法留给来源",
    storySummary:
      "Majohn P141 钛合金的价值在材质和手感差异，但这些都需要产品页和评测来源支撑。",
    storyBodyMd:
      "P141 钛合金适合进入“国产新锐材质实验”路线，但材质名越明确，越需要证据。钛合金、重量、表面处理和手感都不是可以靠标题猜的字段。\n\n当前档案先建立补证位。后续至少需要一条产品规格来源和一条长期评测，才能把“不一样手感”写成可归因的用户体验。",
  }),
  makeSearchOnlyModel({
    slug: "末匠-majohn-q1",
    brandSlug: "majohn",
    aliases: [
      { alias: "Majohn Q1", language: "en" },
      { alias: "Moonman Q1", language: "en" },
      { alias: "末匠 Q1", language: "zh" },
    ],
    sourceItemId: "source-majohn-q1-public-search",
    specId: "spec-majohn-q1-research",
    seriesName: "Q1",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "笔身材质待核验",
    priceRange: "50-100 说法待核验",
    claimId: "claim-majohn-q1-source-boundary",
    modelName: "末匠 Majohn Q1",
    focus:
      "Q1 model identity, compact/chunky size claims, nib, filling system, material, and 50-100 price claims",
    storyId: "story-model-majohn-q1-research",
    storyTitle: "先核验 Q1 的尺寸、形态和入门价位",
    storySummary:
      "Majohn Q1 先作为小型/入门型号研究页，尺寸形态、上墨方式和 50-100 价位都待产品来源确认。",
    storyBodyMd:
      "Q1 的购买理由往往来自形态：小、短、胖、便携，或者只是好玩。但形态类描述需要尺寸和图片来源，否则容易变成主观印象。\n\n当前档案先记录待核验规格。后续补证应优先补尺寸、重量、笔尖和上墨方式，再决定它是否进入口袋笔、透明笔或趣味造型专题。",
  }),
  makeSearchOnlyModel({
    slug: "末匠-majohn-v1-负压上墨",
    brandSlug: "majohn",
    aliases: [
      { alias: "Majohn V1", language: "en" },
      { alias: "Moonman V1 vacuum filler", language: "en" },
      { alias: "末匠 V1 负压上墨", language: "zh" },
    ],
    sourceItemId: "source-majohn-v1-public-search",
    specId: "spec-majohn-v1-vacuum-research",
    seriesName: "V1 / 负压上墨",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "负压/真空上墨说法待核验",
    material: "透明笔身材质待核验",
    priceRange: "169 说法待核验",
    claimId: "claim-majohn-v1-vacuum-source-boundary",
    modelName: "末匠 Majohn V1 负压上墨",
    focus:
      "vacuum or negative-pressure filling mechanism, demonstrator material, nib, and 169 price claim",
    storyId: "story-model-majohn-v1-vacuum-research",
    storyTitle: "把 V1 负压上墨先放进机制核验队列",
    storySummary:
      "Majohn V1 的负压/真空上墨和透明示范卖点都需要直接来源，当前页面只做机制待核验入口。",
    storyBodyMd:
      "V1 的关键词是机制：负压上墨、透明示范、低价体验。这些词很吸引人，但也最需要准确。负压、真空、活塞和其他上墨词不能混用。\n\n当前档案先保留为机制核验页。后续应补产品结构说明、评测照片或拆解，再决定是否制作证据型 SVG 机制图；在此之前，169 价位和透明示范也只作为待核验线索。",
  }),
  makeSearchOnlyModel({
    slug: "末匠-majohn-v60",
    brandSlug: "majohn",
    aliases: [
      { alias: "Majohn V60", language: "en" },
      { alias: "Moonman V60", language: "en" },
      { alias: "末匠 V60", language: "zh" },
    ],
    sourceItemId: "source-majohn-v60-public-search",
    specId: "spec-majohn-v60-research",
    seriesName: "V60",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "上墨方式待核验",
    material: "笔身材质待核验",
    priceRange: "价位待核验",
    claimId: "claim-majohn-v60-source-boundary",
    modelName: "末匠 Majohn V60",
    focus:
      "V60 model identity, substitute/comparison claims, nib, filling system, material, and price",
    storyId: "story-model-majohn-v60-research",
    storyTitle: "把 V60 的代餐说法先降级成待归因评论",
    storySummary:
      "Majohn V60 的“代餐文学”和竞品比较先作为评论线索，不能替代型号规格和来源边界。",
    storyBodyMd:
      "V60 的原始摘要提到强力竞争对手和“代餐文学”。这类说法很能反映玩家讨论热度，但如果没有具体出处，会让页面变成传闻合集。\n\n当前档案先把比较性语言降级为待归因评论。产品层面仍需确认型号、上墨、材质和笔尖；评论层面再收集具体评测，说明它到底在替代谁、替代了什么体验。",
  }),
  makeSearchOnlyModel({
    slug: "末匠-majohn-丸彩",
    brandSlug: "majohn",
    aliases: [
      { alias: "Majohn Wancai", language: "en" },
      { alias: "Moonman Wancai", language: "en" },
      { alias: "末匠 丸彩", language: "zh" },
    ],
    sourceItemId: "source-majohn-wancai-public-search",
    specId: "spec-majohn-wancai-research",
    seriesName: "丸彩 / Wancai",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "上墨方式待核验",
    material: "笔身材质待核验",
    priceRange: "价位待核验",
    claimId: "claim-majohn-wancai-source-boundary",
    modelName: "末匠 Majohn 丸彩",
    focus:
      "Wancai naming, pocket/EDC claims, dimensions, nib, filling system, material, and price",
    storyId: "story-model-majohn-wancai-research",
    storyTitle: "先把丸彩的 EDC 便携说法落到尺寸证据上",
    storySummary:
      "Majohn 丸彩的口袋/化妆包场景先作为待核验使用线索，尺寸、重量和上墨方式需要来源。",
    storyBodyMd:
      "丸彩的原始摘要很生活化：揣兜里、化妆包里、EDC 小物件。这个方向很适合图书馆的“使用场景”栏目，但必须落到尺寸、重量、收纳方式和漏墨风险上。\n\n当前档案先保留场景线索，不把便携性写成事实。后续补证优先找产品尺寸和长期携带评测。",
  }),
  makeSearchOnlyModel({
    slug: "毕加索-picasso-916",
    brandSlug: "picasso",
    aliases: [
      { alias: "Picasso 916", language: "en" },
      { alias: "Picasso fountain pen 916", language: "en" },
      { alias: "毕加索 916", language: "zh" },
    ],
    sourceItemId: "source-picasso-916-public-search",
    specId: "spec-picasso-916-research",
    seriesName: "916",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "笔身材质待核验",
    priceRange: "价位待核验",
    claimId: "claim-picasso-916-source-boundary",
    modelName: "毕加索 Picasso 916",
    focus:
      "916 model identity, nib, filling system, material, local pricing, and entry-level positioning",
    storyId: "story-model-picasso-916-research",
    storyTitle: "把 Picasso 916 先放进入门国产型号补证队列",
    storySummary:
      "Picasso 916 目前只建立研究档案，钢尖、上墨、材质和入门定位都需要产品页或评测来源。",
    storyBodyMd:
      "Picasso 916 的摘要像一个标准国产入门型号条目：品牌明确、编号明确，但缺少直接来源。越是这种看起来普通的型号，越容易被不同店铺、不同套装和不同年份混写。\n\n当前档案先建立检索入口。后续补证应确认 916 的完整产品标题、笔尖规格、上墨方式、材质和是否有多个颜色/礼盒版本，再进入入门国产笔路线。",
  }),
  makeSearchOnlyModel({
    slug: "永生-wingsung-236",
    brandSlug: "wingsung",
    aliases: [
      { alias: "Wing Sung 236", language: "en" },
      { alias: "永生 236", language: "zh" },
    ],
    sourceItemId: "source-wingsung-236-public-search",
    specId: "spec-wingsung-236-research",
    seriesName: "236 / vintage old stock",
    originCountry: "中国（待核验）",
    nib: "钢尖/老款笔尖说法待核验",
    fillSystem: "胶囊/橡胶件状态待核验",
    material: "笔身材质待核验",
    priceRange: "老库存/二手价位待核验",
    claimId: "claim-wingsung-236-source-boundary",
    modelName: "永生 WingSung 236",
    focus:
      "vintage identity, old-stock condition, rubber-sac aging, nib, filling system, and repair risk",
    storyId: "story-model-wingsung-236-research",
    storyTitle: "先把 236 做成老库存风险核验页",
    storySummary:
      "Wing Sung 236 的原始摘要提醒不要迷信经典复刻；当前页面先把老库存、橡胶件和维修风险拆成待核验证据问题。",
    storyBodyMd:
      "Wing Sung 236 不是普通新款入门笔，它更像一个老库存/旧型号风险页。原始摘要提醒“橡胶件可能老化”，这个信息对用户很重要，但必须用维修资料、收藏讨论或实物评测来承接。\n\n当前档案先建立证据边界：确认 236 的生产时期、上墨结构、常见故障和替换件情况，再决定它是否适合进入“老国笔收藏入门”路线。没有维修来源前，不把橡胶件风险写成普遍事实。",
  }),
  makeSearchOnlyModel({
    slug: "永生-wingsung-3013",
    brandSlug: "wingsung",
    aliases: [
      { alias: "Wing Sung 3013", language: "en" },
      { alias: "永生 3013", language: "zh" },
    ],
    sourceItemId: "source-wingsung-3013-public-search",
    specId: "spec-wingsung-3013-research",
    seriesName: "3013 / vacuum filler",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "负压/真空上墨说法待核验",
    material: "透明笔身材质待核验",
    priceRange: "24 说法待核验",
    claimId: "claim-wingsung-3013-source-boundary",
    modelName: "永生 WingSung 3013",
    focus:
      "vacuum-filler mechanism, demonstrator material, nib, build quality, and ultra-low price claims",
    storyId: "story-model-wingsung-3013-research",
    storyTitle: "把 3013 的低价负压体验拆成机制核验页",
    storySummary:
      "Wing Sung 3013 先作为平价负压/真空上墨研究档案处理，24 元价位、机制名称和透明材质都等待直接来源。",
    storyBodyMd:
      "3013 的入口很明确：极低价格体验负压/真空上墨。这个卖点很吸引用户，但图书馆页需要先把“好玩”和“事实”拆开：到底是哪种上墨结构、是否存在不同批次、透明笔身材质是什么、24 元价格对应哪个渠道和时间。\n\n当前档案只保留研究队列。后续如果能补到产品页、拆解或长期评测，就可以和 Majohn V1、TWSBI VAC700R 等机制页形成可比路径。",
  }),
  makeSearchOnlyModel({
    slug: "永生-wingsung-322",
    brandSlug: "wingsung",
    aliases: [
      { alias: "Wing Sung 322", language: "en" },
      { alias: "永生 322", language: "zh" },
    ],
    sourceItemId: "source-wingsung-322-public-search",
    specId: "spec-wingsung-322-research",
    seriesName: "322",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "上墨方式待核验",
    material: "笔身材质待核验",
    priceRange: "20-40 说法待核验",
    claimId: "claim-wingsung-322-source-boundary",
    modelName: "永生 WingSung 322",
    focus:
      "model identity, nib, filling system, material, and 20-40 price claims",
    storyId: "story-model-wingsung-322-research",
    storyTitle: "把 322 先放进低价永生型号补证队列",
    storySummary:
      "Wing Sung 322 当前只有简短规格摘要，先建立检索入口，避免把低价和钢尖信息写成无来源事实。",
    storyBodyMd:
      "322 是典型的“看起来很普通、但最容易误写”的条目：原始摘要只有中国、钢尖和 20-40 价位。继续扩写前，需要先确认完整产品标题、是否有不同版本、上墨方式和实际价格范围。\n\n当前档案先把它归入永生低价型号研究队列。后续补证优先级是产品页、包装/说明书和至少一条长期评测。",
  }),
  makeSearchOnlyModel({
    slug: "永生-wingsung-601",
    brandSlug: "wingsung",
    aliases: [
      { alias: "Wing Sung 601", language: "en" },
      { alias: "永生 601", language: "zh" },
    ],
    sourceItemId: "source-wingsung-601-public-search",
    specId: "spec-wingsung-601-research",
    seriesName: "601 / hooded-nib line",
    originCountry: "中国（待核验）",
    nib: "暗尖/钢尖说法待核验",
    fillSystem: "类 Vacumatic/活塞/泵式说法待核验",
    material: "笔身材质待核验",
    priceRange: "56 说法待核验",
    claimId: "claim-wingsung-601-source-boundary",
    modelName: "永生 WingSung 601",
    focus:
      "hooded-nib identity, Parker 51-style comparison, filling-system naming, variants, and low-price value claims",
    storyId: "story-model-wingsung-601-research",
    storyTitle: "把 601 放进新永生复兴的核心型号队列",
    storySummary:
      "Wing Sung 601 是新永生讨论里最重要的入口之一，但当前先把暗尖、Parker 51 式外观、上墨结构和低价口碑分开核验。",
    storyBodyMd:
      "601 值得成为 Wing Sung 品牌馆的核心型号页。它连接了三个用户会关心的问题：现代新永生复兴、Parker 51 式暗尖审美、以及低价大容量上墨体验。\n\n但越是热门条目，越不能把玩家口碑直接写成事实。当前页面先保留研究边界：确认 601 与 601A 的区别、上墨系统到底如何描述、不同版本/颜色/笔尖的关系，以及“口碑稳定”“56 块”这类说法来自哪里。",
  }),
  makeSearchOnlyModel({
    slug: "永生-wingsung-601a",
    brandSlug: "wingsung",
    aliases: [
      { alias: "Wing Sung 601A", language: "en" },
      { alias: "永生 601A", language: "zh" },
    ],
    sourceItemId: "source-wingsung-601a-public-search",
    specId: "spec-wingsung-601a-research",
    seriesName: "601A",
    originCountry: "中国（待核验）",
    nib: "钢尖/明尖或半明尖版本待核验",
    fillSystem: "活塞/泵式上墨说法待核验",
    material: "笔身材质待核验",
    priceRange: "30-80 说法待核验",
    claimId: "claim-wingsung-601a-source-boundary",
    modelName: "永生 WingSung 601A",
    focus:
      "601 versus 601A differences, nib layout, filling system, material, and 30-80 price claims",
    storyId: "story-model-wingsung-601a-research",
    storyTitle: "先拆清 601A 和 601 的结构边界",
    storySummary:
      "Wing Sung 601A 先作为 601 相邻型号研究页，明尖/暗尖、上墨结构和价格区间都待直接来源确认。",
    storyBodyMd:
      "601A 页面最需要解决的不是多写一句推荐，而是和 601 的关系。用户看到 601A 时，会自然问：它只是外观版本，还是笔尖、上墨、尺寸和定位都不同？\n\n当前档案先把这些问题列出来，不把原始摘要里的活塞上墨和 30-80 价格写成已审核事实。后续补证适合把 601、601A、618、698 放在一张新永生型号关系表里。",
  }),
  makeSearchOnlyModel({
    slug: "永生-wingsung-618",
    brandSlug: "wingsung",
    aliases: [
      { alias: "Wing Sung 618", language: "en" },
      { alias: "永生 618", language: "zh" },
    ],
    sourceItemId: "source-gentleman-stationer-wingsung-618-698",
    specId: "spec-wingsung-618-research",
    seriesName: "618",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "活塞上墨说法待核验",
    material: "透明/树脂笔身说法待核验",
    priceRange: "30-60 说法待核验",
    claimId: "claim-wingsung-618-source-boundary",
    modelName: "永生 WingSung 618",
    focus:
      "piston-filler identity, 618 versus 698 differences, nib, material, and 30-60 price claims",
    storyId: "story-model-wingsung-618-research",
    storyTitle: "把 618 放进平价活塞/透明日用笔队列",
    storySummary:
      "Wing Sung 618 先用二级评测作为阅读入口，活塞结构、透明材质、版本和低价说法仍保持待核验。",
    storyBodyMd:
      "618 适合承担“平价活塞/透明日用笔”的入口，但它需要和 698 分开。二级评测可以帮助我们理解消费者为什么把 618 和 698 放在一起比较，但不能替代官方或产品规格。\n\n当前档案先保留活塞、钢尖、30-60 价格等待核验字段。后续补证应确认尺寸、容量、笔尖版本和与 698 的差异。",
  }),
  makeSearchOnlyModel({
    slug: "永生-wingsung-698",
    brandSlug: "wingsung",
    aliases: [
      { alias: "Wing Sung 698", language: "en" },
      { alias: "永生 698", language: "zh" },
    ],
    sourceItemId: "source-scribblejot-wingsung-698",
    specId: "spec-wingsung-698-research",
    seriesName: "698",
    originCountry: "中国（待核验）",
    nib: "金尖/钢尖版本说法待核验",
    fillSystem: "活塞上墨说法待核验",
    material: "透明/树脂笔身说法待核验",
    priceRange: "268 说法待核验",
    claimId: "claim-wingsung-698-source-boundary",
    modelName: "永生 WingSung 698",
    focus:
      "piston-filler identity, gold-nib versus steel-nib versions, material, build quality, and 268 price claim",
    storyId: "story-model-wingsung-698-research",
    storyTitle: "把 698 的金尖活塞说法拆成版本核验",
    storySummary:
      "Wing Sung 698 的原始摘要把金尖、活塞和价格放在一起；当前页面先确认是否存在不同笔尖版本和价格周期。",
    storyBodyMd:
      "698 的页面需要处理“版本”问题。原始摘要提到金尖、活塞和 268 价位，但 698 的具体版本、笔尖材质和价格渠道都需要来源确认。\n\n当前档案先把它放进 618/698 平价活塞线。后续补证时应把钢尖版、金尖版、颜色/透明版本、容量和做工评价分开，避免把某个版本的体验套到全部 698 上。",
  }),
  makeSearchOnlyModel({
    slug: "永生-wingsung-699",
    brandSlug: "wingsung",
    aliases: [
      { alias: "Wing Sung 699", language: "en" },
      { alias: "永生 699", language: "zh" },
    ],
    sourceItemId: "source-wingsung-699-public-search",
    specId: "spec-wingsung-699-research",
    seriesName: "699 / vacuum filler",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "负压/真空上墨说法待核验",
    material: "透明/树脂笔身说法待核验",
    priceRange: "50-100 说法待核验",
    claimId: "claim-wingsung-699-source-boundary",
    modelName: "永生 WingSung 699",
    focus:
      "vacuum-filler mechanism, Custom 823-style comparison claims, nib, material, and 50-100 price claims",
    storyId: "story-model-wingsung-699-research",
    storyTitle: "把 699 放进平价真空上墨补证队列",
    storySummary:
      "Wing Sung 699 先作为平价真空/负压上墨研究页，机制、材质、价格和竞品比较都需要来源。",
    storyBodyMd:
      "699 的阅读入口是机制和价格：用户会把它和更贵的真空上墨笔比较，也会关心它到底是不是可靠的低价体验装。\n\n当前档案只保留研究边界。补证优先级是产品页或拆解、长期评测、上墨机制说明和价格样本；与 Pilot Custom 823 或其他真空上墨笔的比较必须作为有出处的评论。",
  }),
  makeSearchOnlyModel({
    slug: "永生-wingsung-729",
    brandSlug: "wingsung",
    aliases: [
      { alias: "Wing Sung 729", language: "en" },
      { alias: "永生 729", language: "zh" },
    ],
    sourceItemId: "source-wingsung-729-public-search",
    specId: "spec-wingsung-729-research",
    seriesName: "729 / identity pending",
    originCountry: "中国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "上墨方式待核验",
    material: "笔身材质待核验",
    priceRange: "待核验",
    claimId: "claim-wingsung-729-source-boundary",
    modelName: "永生 WingSung 729",
    focus:
      "whether this entry is a Wing Sung model, a 729-branded pen, or a data merge error; specs and user-fit claims",
    storyId: "story-model-wingsung-729-research",
    storyTitle: "先确认 729 是永生型号还是误并条目",
    storySummary:
      "Wing Sung 729 的原始摘要更像用户适配建议，当前先处理品牌/型号身份和是否应拆分的问题。",
    storyBodyMd:
      "729 这个条目需要先停下来核对身份。`729` 本身也可能指向其他中国书写品牌或店铺标题，如果没有直接来源，把它放在永生下面可能会造成误导。\n\n当前档案先作为数据清洗入口：确认它到底是 Wing Sung 型号、729 品牌/系列，还是原始数据合并错误。只有身份确认后，才适合讨论“动手能力强的人适合”这类使用建议。",
  }),
  makeSearchOnlyModel({
    slug: "永生-wingsung-840",
    brandSlug: "wingsung",
    aliases: [
      { alias: "Wing Sung 840", language: "en" },
      { alias: "永生 840", language: "zh" },
    ],
    sourceItemId: "source-wingsung-840-public-search",
    specId: "spec-wingsung-840-research",
    seriesName: "840",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "上墨方式待核验",
    material: "笔身材质待核验",
    priceRange: "20-40 说法待核验",
    claimId: "claim-wingsung-840-source-boundary",
    modelName: "永生 WingSung 840",
    focus:
      "model identity, nib, filling system, material, and 20-40 price claims",
    storyId: "story-model-wingsung-840-research",
    storyTitle: "把 840 先放进低价永生型号补证队列",
    storySummary:
      "Wing Sung 840 当前只有极简规格摘要，先建立来源入口，避免把 20-40 价位和钢尖信息写死。",
    storyBodyMd:
      "840 与 322 类似，属于用户可能会搜到但站内几乎没有内容的低价型号。它的页面应该先回答基本问题：完整型号名、生产/销售时期、笔尖、上墨方式、材质和价格是否稳定。\n\n当前档案先保留研究队列。后续如果能找到产品页或长期评测，再决定它是否进入低价学生/日用笔专题。",
  }),
  makeSearchOnlyModel({
    slug: "派克-parker-51复刻",
    brandSlug: "parker",
    aliases: [
      { alias: "Parker 51 reissue", language: "en" },
      { alias: "Parker 51 modern", language: "en" },
      { alias: "派克 51 复刻", language: "zh" },
    ],
    sourceItemId: "source-parker-51-modern-official-search",
    specId: "spec-parker-51-reissue-research",
    seriesName: "Parker 51 modern reissue",
    originCountry: "产地/版本待核验",
    nib: "钢尖/金尖版本说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "树脂/金属帽/版本材质待核验",
    priceRange: "中文渠道价待核验",
    claimId: "claim-parker-51-reissue-source-boundary",
    modelName: "派克 Parker 51复刻",
    focus:
      "modern reissue identity, official product scope, nib variants, filling system, collector expectations, and local pricing",
    storyId: "story-model-parker-51-reissue-research",
    storyTitle: "把 Parker 51 复刻和 vintage 51 分开读",
    storySummary:
      "Parker 51 复刻先作为现代复刻研究页，避免把 vintage Parker 51 的历史光环直接写到现代产品规格和体验上。",
    storyBodyMd:
      "Parker 51 复刻最容易出现的问题，是把经典 Parker 51 的历史声望和现代复刻的产品体验混在一起。用户说“名字太响了”正说明这个页面必须先拆清：它不是 vintage 51 本体，而是现代市场对 51 造型和品牌记忆的再利用。\n\n当前档案先建立研究队列：确认现代复刻的官方产品范围、钢尖/金尖版本、上墨方式、材质和不同地区供货，再把评测里的情怀、外观和书写体验作为有出处的评论记录。",
    variants: [
      {
        id: "variant-parker-51-reissue-steel",
        name: "Modern Parker 51 steel-nib candidate",
        notes: "Likely entry-level modern reissue path; exact SKU, finish, and regional availability need direct product evidence.",
        sourceItemId: "source-parker-51-modern-official-search",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-parker-51-reissue-premium",
        name: "Modern Parker 51 premium/gold-nib candidate",
        notes: "Keep separate from vintage Parker 51 and verify nib/material from official or retailer pages before writing specs.",
        sourceItemId: "source-parker-51-modern-official-search",
        reviewStatus: "needs_source",
      },
    ],
  }),
  makeSearchOnlyModel({
    slug: "派克-parker-im丽雅",
    brandSlug: "parker",
    aliases: [
      { alias: "Parker IM", language: "en" },
      { alias: "Parker IM fountain pen", language: "en" },
      { alias: "派克 IM 丽雅", language: "zh" },
    ],
    sourceItemId: "source-parker-im-official-search",
    specId: "spec-parker-im-research",
    seriesName: "IM",
    originCountry: "产地/版本待核验",
    nib: "钢尖/笔尖规格待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "金属笔身/涂层版本待核验",
    priceRange: "中文渠道价待核验",
    claimId: "claim-parker-im-source-boundary",
    modelName: "派克 Parker IM丽雅",
    focus:
      "Parker IM product identity, local 丽雅 naming, nib, finish variants, filling system, price, and office-use positioning",
    storyId: "story-model-parker-im-research",
    storyTitle: "把 Parker IM 丽雅做成商务日用入口",
    storySummary:
      "Parker IM 丽雅先按商务/日用型号研究页处理，稳定、拿得出手和价格判断都需要产品来源与评测来源分层支撑。",
    storyBodyMd:
      "IM 丽雅的原始摘要很像普通用户的真实需求：不是为了“玩”，而是需要稳定、好用、拿得出手的日常笔。这个方向很适合图书馆，但不能只靠一句购买判断。\n\n当前档案先把问题拆开：官方/零售来源确认 IM 的产品线、笔尖、上墨和涂层版本；评测来源再承载握感、稳定性、商务感和同价位比较。这样用户点进来能看到它为什么是日用入口，而不是只看到空洞推荐。",
  }),
  makeSearchOnlyModel({
    slug: "派克-parker-世纪-duofold",
    brandSlug: "parker",
    aliases: [
      { alias: "Parker Duofold", language: "en" },
      { alias: "Parker Duofold Centennial", language: "en" },
      { alias: "派克 世纪 Duofold", language: "zh" },
      { alias: "派克 大豆腐", language: "zh" },
    ],
    sourceItemId: "source-parker-duofold-modern-public-search",
    specId: "spec-parker-duofold-modern-research",
    seriesName: "Duofold / Centennial",
    originCountry: "产地/版本待核验",
    nib: "金尖/笔尖规格待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "树脂/贵金属装饰/版本材质待核验",
    priceRange: "中文渠道价和跨境价待核验",
    claimId: "claim-parker-duofold-modern-source-boundary",
    modelName: "派克 Parker 世纪 Duofold",
    focus:
      "modern Duofold identity, Centennial/International versions, 1921 lineage claims, nib/material specs, and local price anecdotes",
    storyId: "story-model-parker-duofold-modern-research",
    storyTitle: "把 Parker Duofold 的百年名号和现代产品拆开",
    storySummary:
      "Parker Duofold / 世纪先作为历史名号加现代产品线研究页，1921 传统、现代规格、中文“大豆腐”昵称和跨境价格都等待直接来源。",
    storyBodyMd:
      "Duofold 是 Parker 最容易被历史光环笼罩的系列之一。原始摘要把它和 1921 年、万宝龙 149 之前的历史、中文“大豆腐”昵称和亚马逊好价放在一起，这些都值得保留为阅读线索，但不能混成单一事实。\n\n当前档案先把它拆成三层：历史层确认 Duofold 名号和早期 Parker 叙事；现代产品层确认 Centennial、International、笔尖、材质和产地；购买层再记录跨境价格和玩家昵称。没有直接来源前，价格与历史比较只作为待核验线索。",
    variants: [
      {
        id: "variant-parker-duofold-centennial-candidate",
        name: "Duofold Centennial candidate",
        notes: "Likely modern large-size path; verify exact product page, material, nib, and dimensions before using as factual specs.",
        sourceItemId: "source-parker-duofold-modern-public-search",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-parker-duofold-international-candidate",
        name: "Duofold International candidate",
        notes: "Keep separate from Centennial and vintage Duofold references until direct catalog evidence is attached.",
        sourceItemId: "source-parker-duofold-modern-public-search",
        reviewStatus: "needs_source",
      },
    ],
  }),
  makeSearchOnlyModel({
    slug: "派克-parker-乔特-jotter",
    brandSlug: "parker",
    aliases: [
      { alias: "Parker Jotter fountain pen", language: "en" },
      { alias: "Parker Jotter", language: "en" },
      { alias: "派克 乔特 Jotter", language: "zh" },
    ],
    sourceItemId: "source-parker-jotter-fp-public-search",
    specId: "spec-parker-jotter-fp-research",
    seriesName: "Jotter fountain pen",
    originCountry: "产地/版本待核验",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "塑料/金属部件/版本材质待核验",
    priceRange: "入门价位待核验",
    claimId: "claim-parker-jotter-fp-source-boundary",
    modelName: "派克 Parker 乔特 Jotter",
    focus:
      "Jotter fountain-pen identity, ballpoint-family naming, nib, filling system, material, and entry-level positioning",
    storyId: "story-model-parker-jotter-fp-research",
    storyTitle: "把 Jotter 钢笔从圆珠笔名号里拆出来",
    storySummary:
      "Parker Jotter 钢笔先按入门研究页处理，重点确认它与 Jotter 圆珠笔家族的关系、钢笔规格和真实入门价位。",
    storyBodyMd:
      "Jotter 的麻烦在于：很多用户先认识的是圆珠笔，而不是钢笔。原始摘要说它是“派克最便宜的入门”，这个判断对用户有用，但必须确认对应的是哪一代 Jotter fountain pen、什么笔尖、什么上墨方式和哪个市场价格。\n\n当前档案先作为入门页研究队列。后续补证应把圆珠笔家族名号、钢笔产品页、零售规格和长期书写体验分开。",
  }),
  makeSearchOnlyModel({
    slug: "派克-parker-卓尔-sonnet",
    brandSlug: "parker",
    aliases: [
      { alias: "Parker Sonnet", language: "en" },
      { alias: "Parker Sonnet fountain pen", language: "en" },
      { alias: "派克 卓尔 Sonnet", language: "zh" },
    ],
    sourceItemId: "source-parker-sonnet-public-search",
    specId: "spec-parker-sonnet-research",
    seriesName: "Sonnet",
    originCountry: "产地/版本待核验",
    nib: "钢尖/金尖版本说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "金属笔身/涂层/饰面待核验",
    priceRange: "中文渠道价和版本价差待核验",
    claimId: "claim-parker-sonnet-source-boundary",
    modelName: "派克 Parker 卓尔 Sonnet",
    focus:
      "Sonnet model identity, finish variants, nib experience, comparison claims, filling system, and business-gift positioning",
    storyId: "story-model-parker-sonnet-research",
    storyTitle: "把 Sonnet 卓尔的商务外观和书写争议分开写",
    storySummary:
      "Parker Sonnet 卓尔先作为中端商务型号研究页，外观优势、笔尖争议和同价位比较都需要归因评测。",
    storyBodyMd:
      "Sonnet 的原始摘要很像玩家给购买者的提醒：外观和商务感是优势，但笔尖体验未必压过日系或百利金同价位。这个判断很有价值，但它属于对比性评论，必须有具体评测来源和价格区间。\n\n当前档案先把 Sonnet 拆成产品事实和评价事实：产品事实包括版本、饰面、笔尖、上墨方式和产地；评价事实包括商务感、笔尖体验和同价位对比。没有来源前，不把“优势/劣势”写成稳定结论。",
  }),
  makeSearchOnlyModel({
    slug: "派克-parker-威雅-vector",
    brandSlug: "parker",
    aliases: [
      { alias: "Parker Vector", language: "en" },
      { alias: "Parker Vector fountain pen", language: "en" },
      { alias: "派克 威雅 Vector", language: "zh" },
    ],
    sourceItemId: "source-parker-vector-public-search",
    specId: "spec-parker-vector-research",
    seriesName: "Vector",
    originCountry: "产地/版本待核验",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "塑料/金属部件待核验",
    priceRange: "150 以下说法待核验",
    claimId: "claim-parker-vector-source-boundary",
    modelName: "派克 Parker 威雅 Vector",
    focus:
      "Vector entry positioning, current availability, nib, filling system, material, and sub-150 import-brand claims",
    storyId: "story-model-parker-vector-research",
    storyTitle: "把 Parker Vector 威雅放进入门进口品牌补证页",
    storySummary:
      "Parker Vector 威雅先作为低价进口品牌研究页，150 以下、定位低和规格都需要按市场与版本核验。",
    storyBodyMd:
      "Vector / 威雅的用户入口非常现实：预算有限，但想买到 Parker 这个进口品牌。原始摘要提到“150 以下唯一够得着的进口但定位低”，这既是价格判断，也是定位判断。\n\n当前档案先保留研究边界。后续需要确认当前是否仍稳定在售、不同市场的 Vector 钢笔规格、笔尖和上墨方式，以及低价渠道是否只对应某些库存或套装。",
  }),
  makeSearchOnlyModel({
    slug: "犀飞利-sheaffer-品牌泛称",
    brandSlug: "sheaffer",
    aliases: [
      { alias: "Sheaffer generic pen entry", language: "en" },
      { alias: "犀飞利 品牌泛称", language: "zh" },
    ],
    sourceItemId: "source-sheaffer-generic-public-search",
    specId: "spec-sheaffer-generic-research",
    seriesName: "待重分类 / brand-generic entry",
    originCountry: "美国品牌语境（待核验）",
    nib: "不适合按单一型号填写",
    fillSystem: "不适合按单一型号填写",
    material: "不适合按单一型号填写",
    priceRange: "不适合按单一型号填写",
    claimId: "claim-sheaffer-generic-source-boundary",
    modelName: "犀飞利 Sheaffer（品牌泛称）",
    focus:
      "whether this pen entry should be reclassified or merged into the Sheaffer brand page instead of treated as a model",
    storyId: "story-model-sheaffer-generic-research",
    storyTitle: "先把 Sheaffer 品牌泛称标成待重分类条目",
    storySummary:
      "当前 Sheaffer 品牌泛称不应被当作单支型号扩写；页面先记录它需要合并到品牌馆或拆成具体型号。",
    storyBodyMd:
      "这个条目的名字已经说明问题：它是“品牌泛称”，不是具体型号。继续写笔尖、上墨或材质，只会把 Sheaffer 品牌层面的历史误塞进一支不存在的笔里。\n\n当前档案先作为数据清洗标记保留：应优先判断它是否能并入 Sheaffer 品牌馆，或拆分为 Balance、Snorkel、Targa、Imperial 等具体型号。没有拆分前，本页不填写单一规格。",
    variants: [
      {
        id: "variant-sheaffer-generic-merge-brand",
        name: "Merge into Sheaffer brand candidate",
        notes: "Preferred if no concrete model evidence is attached to the local record.",
        sourceItemId: "source-sheaffer-generic-public-search",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-sheaffer-generic-split-models",
        name: "Split into concrete Sheaffer models candidate",
        notes: "Use only after source evidence identifies a specific model family.",
        sourceItemId: "source-sheaffer-generic-public-search",
        reviewStatus: "needs_source",
      },
    ],
  }),
  makeSearchOnlyModel({
    slug: "犀飞利-sheaffer-帝国元首",
    brandSlug: "sheaffer",
    aliases: [
      { alias: "Sheaffer Imperial candidate", language: "en" },
      { alias: "Sheaffer Legacy candidate", language: "en" },
      { alias: "犀飞利 帝国元首", language: "zh" },
    ],
    sourceItemId: "source-sheaffer-imperial-public-search",
    specId: "spec-sheaffer-imperial-legacy-research",
    seriesName: "Imperial / Legacy identity pending",
    originCountry: "美国品牌语境（待核验）",
    nib: "金尖/嵌入式笔尖说法待核验",
    fillSystem: "Touchdown/墨囊/上墨器等版本待核验",
    material: "金属/树脂/饰面版本待核验",
    priceRange: "高端价位说法待核验",
    claimId: "claim-sheaffer-imperial-legacy-source-boundary",
    modelName: "犀飞利 Sheaffer 帝国元首",
    focus:
      "whether the Chinese 帝国元首 entry maps to Imperial, Legacy, or another Sheaffer model; nib, filling system, material, and high-end claims",
    storyId: "story-model-sheaffer-imperial-legacy-research",
    storyTitle: "先确认“帝国元首”对应 Imperial 还是 Legacy",
    storySummary:
      "Sheaffer 帝国元首先作为中文命名待核验页，避免把 Imperial、Legacy 和高端美系印象混成一个型号。",
    storyBodyMd:
      "“帝国元首”这个中文名需要先核验。它可能指向 Imperial，也可能混入 Legacy、Triumph/嵌入式笔尖或中文渠道的营销命名。若不先确认身份，后续规格会很容易错位。\n\n当前档案先记录候选路径：确定英文型号、版本年代、笔尖结构、上墨系统和饰面，再判断它应进入 Sheaffer 高端美系型号路线，还是拆成更具体的档案。",
  }),
  makeSearchOnlyModel({
    slug: "白金-platinum-curidas",
    brandSlug: "platinum",
    aliases: [
      { alias: "Platinum Curidas", language: "en" },
      { alias: "白金 Curidas", language: "zh" },
    ],
    sourceItemId: "source-platinum-curidas-public-search",
    specId: "spec-platinum-curidas-research",
    seriesName: "Curidas",
    originCountry: "日本（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "透明/树脂笔身说法待核验",
    priceRange: "入门按动价位待核验",
    claimId: "claim-platinum-curidas-source-boundary",
    modelName: "白金 Platinum Curidas",
    focus:
      "retractable mechanism, sealing/dry-out claims, nib, cartridge/converter compatibility, and lower-entry pricing",
    storyId: "story-model-platinum-curidas-research",
    storyTitle: "把 Curidas 放进按动钢笔机制核验队列",
    storySummary:
      "Platinum Curidas 先作为低门槛按动钢笔研究页，密封性、几天不干和机制体验都需要评测来源支撑。",
    storyBodyMd:
      "Curidas 的价值在于机制：它给用户一个比高价按动钢笔更低门槛的选择。原始摘要提到“密封性强几天不写不干”，这类体验判断必须有长期评测或实测条件。\n\n当前档案先把机制、密封、笔尖、上墨和价格拆开。后续可以和 Pilot Capless、LAMY dialog、Majohn A1、晨光按动钢笔放在同一个按动机制路径里比较。",
  }),
  makeSearchOnlyModel({
    slug: "白金-platinum-出云-izumo",
    brandSlug: "platinum",
    aliases: [
      { alias: "Platinum Izumo", language: "en" },
      { alias: "白金 出云 Izumo", language: "zh" },
    ],
    sourceItemId: "source-platinum-izumo-public-search",
    specId: "spec-platinum-izumo-research",
    seriesName: "Izumo",
    originCountry: "日本（待核验）",
    nib: "金尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "漆/木材/版本材质待核验",
    priceRange: "高端价位待核验",
    claimId: "claim-platinum-izumo-source-boundary",
    modelName: "白金 Platinum 出云 Izumo",
    focus:
      "Izumo model-family identity, Japanese craft positioning, material variants, nib, filling system, and understated reputation claims",
    storyId: "story-model-platinum-izumo-research",
    storyTitle: "把 Izumo 出云放进白金和风工艺路线",
    storySummary:
      "Platinum Izumo 出云先作为和风工艺研究页，材质、漆面、版本和“知道的人觉得好”这类口碑都需要来源。",
    storyBodyMd:
      "Izumo 的原始摘要很准确地抓住了一个问题：它可能不是最出圈的型号，但很能代表白金的和风气质。要把这种感觉写成图书馆内容，需要具体到材质、漆面、笔形、版本和用户评价。\n\n当前档案先保留研究入口。后续补证时，应把官方产品线、工艺说明、版本图片和长期评测分开，避免只用“和风”两个字概括整支笔。",
  }),
  makeSearchOnlyModel({
    slug: "白金-platinum-富士旬景pnb-13000",
    brandSlug: "platinum",
    aliases: [
      { alias: "Platinum PNB-13000", language: "en" },
      { alias: "Platinum Fuji Shunkei", language: "en" },
      { alias: "白金 富士旬景 PNB-13000", language: "zh" },
    ],
    sourceItemId: "source-platinum-fuji-shunkei-pnb13000-public-search",
    specId: "spec-platinum-fuji-shunkei-pnb13000-research",
    seriesName: "富士旬景 / PNB-13000",
    originCountry: "日本（待核验）",
    nib: "金尖/笔尖规格待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "树脂/颜色主题/饰面待核验",
    priceRange: "升级价位待核验",
    claimId: "claim-platinum-fuji-shunkei-pnb13000-source-boundary",
    modelName: "白金 Platinum 富士旬景PNB-13000",
    focus:
      "PNB-13000 product identity, Fuji seasonal color mapping, #3776 relationship, material feel, nib, and upgrade-positioning claims",
    storyId: "story-model-platinum-fuji-shunkei-pnb13000-research",
    storyTitle: "把富士旬景 PNB-13000 从 3776 升级说法里拆出来",
    storySummary:
      "富士旬景 PNB-13000 先作为 #3776 相邻/升级感研究页，颜色主题、材质和升级定位都需要直接来源。",
    storyBodyMd:
      "富士旬景 PNB-13000 的原始摘要抓住了购买语境：喜欢 3776，但嫌塑料感重，就可能考虑它。这个判断有用户价值，但需要确认 PNB-13000 与 #3776 的实际关系、笔尖和材质是否一致或不同、颜色主题是否对应季节/富士意象。\n\n当前档案先把它作为白金中高端日用/主题色路线的待核验节点。补证后，它可以和 #3776 Century、Izumo、莳绘系列形成清晰的价格和工艺阶梯。",
  }),
  makeSearchOnlyModel({
    slug: "白金-platinum-小流星pq200",
    brandSlug: "platinum",
    aliases: [
      { alias: "Platinum PQ200", language: "en" },
      { alias: "Platinum Preppy", language: "en" },
      { alias: "白金 小流星 PQ200", language: "zh" },
    ],
    sourceItemId: "source-platinum-preppy-pq200-public-search",
    specId: "spec-platinum-preppy-pq200-research",
    seriesName: "小流星 / PQ200 / Preppy identity pending",
    originCountry: "日本（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊说法待核验",
    material: "透明/塑料笔身待核验",
    priceRange: "30-60 说法待核验",
    claimId: "claim-platinum-preppy-pq200-source-boundary",
    modelName: "白金 Platinum 小流星PQ200",
    focus:
      "Chinese 小流星 nickname, PQ200 versus Preppy mapping, nib, cartridge compatibility, material, and 30-60 price claims",
    storyId: "story-model-platinum-preppy-pq200-research",
    storyTitle: "先确认小流星 PQ200 和 Preppy 的对应关系",
    storySummary:
      "白金小流星 PQ200 先作为入门日系型号待核验页，中文昵称、官方 SKU、钢尖和墨囊规格都需要来源。",
    storyBodyMd:
      "小流星 PQ200 是用户很可能拿来入门的白金低价钢笔，但它的中文昵称和官方型号之间需要先对齐。继续写之前，要确认 PQ200、Preppy、小流星是否完全对应，还是只对应某个渠道或版本。\n\n当前档案先保留 30-60、钢尖、墨囊这些字段为待核验。补证优先级是官方/零售产品页、墨囊兼容性、尖号和不同颜色/笔尖版本。",
  }),
  makeSearchOnlyModel({
    slug: "白金-platinum-总统-president",
    brandSlug: "platinum",
    aliases: [
      { alias: "Platinum President", language: "en" },
      { alias: "白金 总统 President", language: "zh" },
    ],
    sourceItemId: "source-platinum-president-public-search",
    specId: "spec-platinum-president-research",
    seriesName: "President",
    originCountry: "日本（待核验）",
    nib: "大金尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "树脂/饰面版本待核验",
    priceRange: "3000+ 说法待核验",
    claimId: "claim-platinum-president-source-boundary",
    modelName: "白金 Platinum 总统 President",
    focus:
      "President model identity, high-end status, nib, filling system, material, availability, and 3000+ price claims",
    storyId: "story-model-platinum-president-research",
    storyTitle: "把 President 总统先做成白金高端旧线索核验页",
    storySummary:
      "Platinum President 总统先作为高端型号研究页，旗舰/在售状态、大金尖和 3000+ 价位都等待直接来源。",
    storyBodyMd:
      "President / 总统这类高端型号很容易被一句“白金旗舰”概括，但图书馆需要更具体：它的生产状态、与 #3776 和 Izumo 的关系、笔尖尺寸、上墨方式和价格区间都要有来源。\n\n当前档案先保留为研究队列。后续如果发现它已经停产或地区供货不稳定，页面也应该如实标注，避免把旧市场印象写成当前推荐。",
  }),
  makeSearchOnlyModel({
    slug: "白金-platinum-莳绘系列",
    brandSlug: "platinum",
    aliases: [
      { alias: "Platinum Maki-e series", language: "en" },
      { alias: "Platinum Maki-e fountain pen", language: "en" },
      { alias: "白金 莳绘系列", language: "zh" },
    ],
    sourceItemId: "source-platinum-makie-series-public-search",
    specId: "spec-platinum-makie-series-research",
    seriesName: "Maki-e / 莳绘系列",
    originCountry: "日本（待核验）",
    nib: "14K/18K/金尖版本待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "莳绘/漆面/基底材质待核验",
    priceRange: "2000+ 说法待核验",
    claimId: "claim-platinum-makie-series-source-boundary",
    modelName: "白金 Platinum 莳绘系列",
    focus:
      "whether this is a series rather than one model, artwork boundaries, nib variants, filling system, material, and high-end pricing",
    storyId: "story-model-platinum-makie-series-research",
    storyTitle: "把白金莳绘系列先标成系列页而非单支型号",
    storySummary:
      "Platinum 莳绘系列更像装饰工艺/系列入口，不应直接写成单一规格；当前先保留工艺、型号和价格边界。",
    storyBodyMd:
      "莳绘系列最大的问题是层级：它可能不是一支笔，而是一组图案、工艺、基底型号和价格层级。若把它写成单支型号，会让笔尖、尺寸、材质和价格全部失真。\n\n当前档案先作为系列研究页：后续需要确认每个具体作品、基底笔款、笔尖、上墨和工艺说明，再拆成可引用的型号或展览条目。莳绘工艺本身也适合进入图书馆的工艺专题，而不是只挂在型号列表里。",
  }),
  makeSearchOnlyModel({
    slug: "白雪-fp20",
    brandSlug: "snowhite",
    aliases: [
      { alias: "Snowhite FP20", language: "en" },
      { alias: "白雪 FP20", language: "zh" },
    ],
    sourceItemId: "source-snowhite-fp20-public-search",
    specId: "spec-snowhite-fp20-research",
    seriesName: "FP20",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/直液/上墨方式待核验",
    material: "塑料笔身/文具渠道版本待核验",
    priceRange: "低价入门区间待核验",
    claimId: "claim-snowhite-fp20-source-boundary",
    modelName: "白雪 Snowhite FP20",
    focus:
      "FP20 product identity, nib, filling system, material, student stationery positioning, and low-price claims",
    storyId: "story-model-snowhite-fp20-research",
    storyTitle: "把白雪 FP20 放进中国文具入门钢笔队列",
    storySummary:
      "白雪 FP20 先作为中国文具渠道入门钢笔研究页，钢尖、墨囊/直液说法和低价定位都需要产品或目录来源。",
    storyBodyMd:
      "FP20 的原始摘要很短，只留下“中国、钢尖、墨囊”几个线索。这样的条目最容易在网站上显得像残缺数据，但它其实可以成为中国现代文具品牌如何进入钢笔品类的入口。\n\n当前档案先把白雪品牌馆里的直液式/文具工业语境延伸到具体型号：确认 FP20 的官方名称、笔尖、上墨方式、包装渠道和适用人群。没有产品页或目录前，不把“钢尖”和“墨囊”写成已审核事实。",
  }),
  makeSearchOnlyModel({
    slug: "百乐-pilot-78g-78g",
    brandSlug: "pilot",
    aliases: [
      { alias: "Pilot 78G", language: "en" },
      { alias: "Pilot 78G+", language: "en" },
      { alias: "百乐 78G/78G+", language: "zh" },
    ],
    sourceItemId: "source-pilot-78g-public-search",
    specId: "spec-pilot-78g-research",
    seriesName: "78G / 78G+",
    originCountry: "日本品牌/版本产地待核验",
    nib: "钢尖/金色钢尖说法待核验",
    fillSystem: "墨囊/上墨器兼容待核验",
    material: "塑料笔身说法待核验",
    priceRange: "百元内/入门价位待核验",
    claimId: "claim-pilot-78g-source-boundary",
    modelName: "百乐 Pilot 78G/78G+",
    focus:
      "78G versus 78G+ identity, student-pen reputation, nib, filling system, material, availability, and low-price claims",
    storyId: "story-model-pilot-78g-research",
    storyTitle: "把 Pilot 78G/78G+ 的入门神话先放进待核验页",
    storySummary:
      "Pilot 78G/78G+ 先作为入门日系钢笔研究页，学生党口碑、低价神话和型号差异都需要来源拆开。",
    storyBodyMd:
      "78G/78G+ 的原始摘要带着很强的中文社区口吻：神笔、百元内无敌手、学生党首选。这些都说明它有用户记忆，但也必须和产品事实分开。\n\n当前档案先建立三条补证路线：一是确认 78G 和 78G+ 是否是地区/年代/版本差异；二是核验笔尖、上墨器、材质和产地；三是把“神笔”这类评价放进有出处的社区口碑，而不是写成客观结论。",
    variants: [
      {
        id: "variant-pilot-78g-candidate",
        name: "Pilot 78G candidate",
        notes: "Keep separate from 78G+ until catalog or reliable product evidence maps the versions.",
        sourceItemId: "source-pilot-78g-public-search",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-pilot-78g-plus-candidate",
        name: "Pilot 78G+ candidate",
        notes: "Verify Chinese-market naming, nib options, and converter compatibility before merging into one fact card.",
        sourceItemId: "source-pilot-78g-public-search",
        reviewStatus: "needs_source",
      },
    ],
  }),
  makeSearchOnlyModel({
    slug: "百乐-pilot-845-urushi",
    brandSlug: "pilot",
    aliases: [
      { alias: "Pilot Custom 845 Urushi", language: "en" },
      { alias: "Pilot 845 Urushi", language: "en" },
      { alias: "百乐 845 漆杆", language: "zh" },
    ],
    sourceItemId: "source-pilot-845-urushi-public-search",
    specId: "spec-pilot-845-urushi-research",
    seriesName: "Custom 845 / Urushi",
    originCountry: "日本（待核验）",
    nib: "金尖/大型笔尖规格待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "漆面/硬橡胶或树脂基底待核验",
    priceRange: "高端价位待核验",
    claimId: "claim-pilot-845-urushi-source-boundary",
    modelName: "百乐 Pilot 845 Urushi",
    focus:
      "Custom 845 identity, urushi material claims, nib, filling system, flagship comparison, and price positioning",
    storyId: "story-model-pilot-845-urushi-research",
    storyTitle: "把 Pilot 845 Urushi 的旗舰感和产品事实拆开",
    storySummary:
      "Pilot 845 Urushi 先作为百乐高端漆杆研究页，旗舰称呼、与 823/149 对比和漆面材质都需要直接来源。",
    storyBodyMd:
      "845 Urushi 很容易被写成一句“百乐真正旗舰”，但图书馆要把这种社区判断拆细：它到底是哪个 Custom 系列型号，漆面和基底材质如何定义，笔尖规格、上墨方式和价格区间是否随地区变化。\n\n当前档案先保留高端漆杆的阅读入口。后续补证时，应把官方产品页、目录、漆艺说明和长期评测分开，不直接把“比 823 更旗舰”写成事实。",
  }),
  makeSearchOnlyModel({
    slug: "百乐-pilot-88g",
    brandSlug: "pilot",
    aliases: [
      { alias: "Pilot 88G", language: "en" },
      { alias: "百乐 88G", language: "zh" },
    ],
    sourceItemId: "source-pilot-88g-public-search",
    specId: "spec-pilot-88g-research",
    seriesName: "88G",
    originCountry: "日本品牌/版本产地待核验",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器兼容待核验",
    material: "金属/树脂/版本材质待核验",
    priceRange: "入门价位待核验",
    claimId: "claim-pilot-88g-source-boundary",
    modelName: "百乐 Pilot 88G",
    focus:
      "88G model identity, relationship to 78G or Metropolitan-like entry lines, nib, material, filling system, and price",
    storyId: "story-model-pilot-88g-research",
    storyTitle: "先确认 Pilot 88G 和 78G 系谱的关系",
    storySummary:
      "Pilot 88G 先作为低知名度入门型号研究页，重点确认它和 78G/78G+ 的关系、材质与真实规格。",
    storyBodyMd:
      "88G 的问题不是故事不够，而是身份不够清楚。原始摘要说它与 78G+ 同系、知名度稍低，这个判断需要产品页、包装或可靠评测来支撑。\n\n当前档案先把 88G 放进百乐入门钢笔支线。补证时要确认英文型号、地区销售、笔尖和上墨兼容性；如果它只是中文渠道里对某个系列的称呼，也应该在页面里标清楚。",
  }),
  makeSearchOnlyModel({
    slug: "百乐-pilot-912",
    brandSlug: "pilot",
    aliases: [
      { alias: "Pilot Custom Heritage 912", language: "en" },
      { alias: "Pilot Custom 912", language: "en" },
      { alias: "百乐 912 PO尖", language: "zh" },
    ],
    sourceItemId: "source-pilot-custom-912-public-search",
    specId: "spec-pilot-custom-912-research",
    seriesName: "Custom Heritage 912",
    originCountry: "日本（待核验）",
    nib: "PO/FA/特殊尖选项待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "树脂笔身说法待核验",
    priceRange: "中高端金笔价位待核验",
    claimId: "claim-pilot-custom-912-source-boundary",
    modelName: "百乐 Pilot 912",
    focus:
      "Custom Heritage 912 identity, PO nib and other specialty nib options, filling system, material, and Reddit/review reputation",
    storyId: "story-model-pilot-custom-912-research",
    storyTitle: "把 Pilot 912 的特殊尖讨论单独立档",
    storySummary:
      "Pilot 912 先作为特殊尖研究页，PO 尖、FA 等笔尖讨论需要和本体规格、渠道价格分开归因。",
    storyBodyMd:
      "912 在社区里常常不是靠外形出圈，而是靠特殊尖选择被讨论。原始摘要特别提到 PO 尖和 Reddit 讨论，这说明它适合进入“笔尖形制”路线，而不是只写成普通金笔。\n\n当前档案先要求两个层面的证据：官方/目录确认 Custom Heritage 912 的型号和笔尖选项；评测/社区来源再承载 PO 尖、FA 尖、书写控制和适用场景。没有来源前，不把某个尖的体验泛化到整支笔。",
    variants: [
      {
        id: "variant-pilot-custom-912-po-candidate",
        name: "PO nib candidate",
        notes: "Use for PO-nib discussion only after official nib-option or review evidence is attached.",
        sourceItemId: "source-pilot-custom-912-public-search",
        reviewStatus: "needs_source",
      },
    ],
  }),
  makeSearchOnlyModel({
    slug: "百乐-pilot-capless-decimo",
    brandSlug: "pilot",
    aliases: [
      { alias: "Pilot Capless", language: "en" },
      { alias: "Pilot Decimo", language: "en" },
      { alias: "Pilot Vanishing Point", language: "en" },
      { alias: "百乐 Capless/Decimo", language: "zh" },
    ],
    sourceItemId: "source-pilot-capless-decimo-public-search",
    specId: "spec-pilot-capless-decimo-research",
    seriesName: "Capless / Decimo / Vanishing Point",
    originCountry: "日本（待核验）",
    nib: "金尖/笔尖单元规格待核验",
    fillSystem: "墨囊/上墨器兼容待核验",
    material: "金属笔身/轻量版本待核验",
    priceRange: "按动金笔价位待核验",
    claimId: "claim-pilot-capless-decimo-source-boundary",
    modelName: "百乐 Pilot Capless/Decimo",
    focus:
      "Capless, Decimo, and Vanishing Point naming, retractable mechanism, nib unit, filling compatibility, version differences, and long-term reputation",
    storyId: "story-model-pilot-capless-decimo-research",
    storyTitle: "把 Capless/Decimo 放进按动钢笔主轴",
    storySummary:
      "Pilot Capless/Decimo 先作为按动钢笔核心研究页，命名、机制、Decimo 轻薄差异和长期口碑都需要来源分层。",
    storyBodyMd:
      "Capless/Decimo 是整座图书馆里必须认真处理的机制型钢笔：很多后来的按动钢笔都会被拿来和它比较。但这也意味着页面不能只写“按动天花板”。\n\n当前档案先拆三层：命名层确认 Capless、Vanishing Point、Decimo 的地区和版本关系；结构层确认按动机构、笔尖单元和上墨兼容；口碑层再记录长期使用、夹子位置、密封和价格评价。后续可把它和 Curidas、LAMY dialog、Majohn A1、晨光按动钢笔放进同一机制展览。",
    variants: [
      {
        id: "variant-pilot-capless-candidate",
        name: "Capless / Vanishing Point candidate",
        notes: "Verify region naming and nib-unit compatibility before merging with Decimo notes.",
        sourceItemId: "source-pilot-capless-decimo-public-search",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-pilot-decimo-candidate",
        name: "Decimo candidate",
        notes: "Treat as a slimmer/lighter branch only after official product or catalog evidence is attached.",
        sourceItemId: "source-pilot-capless-decimo-public-search",
        reviewStatus: "needs_source",
      },
    ],
  }),
  makeSearchOnlyModel({
    slug: "百乐-pilot-cavalier",
    brandSlug: "pilot",
    aliases: [
      { alias: "Pilot Cavalier", language: "en" },
      { alias: "百乐 Cavalier", language: "zh" },
    ],
    sourceItemId: "source-pilot-cavalier-public-search",
    specId: "spec-pilot-cavalier-research",
    seriesName: "Cavalier",
    originCountry: "日本（待核验）",
    nib: "钢尖/金尖版本待核验",
    fillSystem: "墨囊/上墨器兼容待核验",
    material: "细杆金属笔身说法待核验",
    priceRange: "日用随身价位待核验",
    claimId: "claim-pilot-cavalier-source-boundary",
    modelName: "百乐 Pilot Cavalier",
    focus:
      "Cavalier slim-body identity, EDC portability, nib, material, filling system, and availability",
    storyId: "story-model-pilot-cavalier-research",
    storyTitle: "把 Pilot Cavalier 做成细杆随身笔档案",
    storySummary:
      "Pilot Cavalier 先作为细杆 EDC 研究页，便携性、金属质感、笔尖和供货状态都需要产品来源。",
    storyBodyMd:
      "Cavalier 的入口很清楚：不是旗舰，也不是机制实验，而是细杆、便携、随身携带。原始摘要提到 EDC 和金属质感，这正适合做一页给普通用户看的日用场景档案。\n\n当前档案先核验身份和规格：闭合长度、直径、重量、笔尖、上墨兼容和不同颜色版本。后续评测再承载握持是否过细、长写是否疲劳和适合哪些手型。",
  }),
  makeSearchOnlyModel({
    slug: "百乐-pilot-custom-74",
    brandSlug: "pilot",
    aliases: [
      { alias: "Pilot Custom 74", language: "en" },
      { alias: "百乐 Custom 74", language: "zh" },
      { alias: "百乐 74", language: "zh" },
    ],
    sourceItemId: "source-pilot-custom-74-public-search",
    specId: "spec-pilot-custom-74-research",
    seriesName: "Custom 74",
    originCountry: "日本（待核验）",
    nib: "金尖/尖号选项待核验",
    fillSystem: "墨囊/上墨器兼容待核验",
    material: "树脂笔身说法待核验",
    priceRange: "入门金笔价位待核验",
    claimId: "claim-pilot-custom-74-source-boundary",
    modelName: "百乐 Pilot Custom 74",
    focus:
      "Custom 74 identity, entry gold-nib positioning, nib options, converter compatibility, material, and 480-550 price anecdotes",
    storyId: "story-model-pilot-custom-74-research",
    storyTitle: "把 Custom 74 的入门金笔定位拆成事实和口碑",
    storySummary:
      "Pilot Custom 74 先作为入门金笔研究页，渠道价、涨价传闻、笔尖规格和日用推荐都需要归因。",
    storyBodyMd:
      "Custom 74 的原始摘要很像购买建议：它被看作入门金笔选择，还夹带渠道价和涨价预期。这些信息对用户有用，但必须和稳定规格分开。\n\n当前档案先确认型号、金尖选项、上墨兼容、材质和地区版本；价格和“最终选择”这类判断只进入口碑/市场观察，不作为固定事实。",
  }),
  makeSearchOnlyModel({
    slug: "百乐-pilot-custom-742",
    brandSlug: "pilot",
    aliases: [
      { alias: "Pilot Custom 742", language: "en" },
      { alias: "百乐 Custom 742", language: "zh" },
    ],
    sourceItemId: "source-pilot-custom-742-public-search",
    specId: "spec-pilot-custom-742-research",
    seriesName: "Custom 742",
    originCountry: "日本（待核验）",
    nib: "金尖/FA 等尖型待核验",
    fillSystem: "墨囊/上墨器兼容待核验",
    material: "树脂笔身说法待核验",
    priceRange: "中端 Custom 价位待核验",
    claimId: "claim-pilot-custom-742-source-boundary",
    modelName: "百乐 Pilot Custom 742",
    focus:
      "Custom 742 identity, nib-option breadth, FA nib reputation, relation to Custom 743/823, filling system, and pricing",
    storyId: "story-model-pilot-custom-742-research",
    storyTitle: "把 Custom 742 的价值放在笔尖选择上核验",
    storySummary:
      "Pilot Custom 742 先作为笔尖选项研究页，FA 弹性尖和“823 平价版”说法都需要直接来源或评测归因。",
    storyBodyMd:
      "Custom 742 的摘要已经指向核心：它的卖点可能不是单一外形，而是笔尖选择，尤其是 FA 这类特殊尖。把它只写成“823 平价版”会丢掉重要信息。\n\n当前档案先把 742 放在 Custom 系列的中间层：确认笔尖尺寸、可选尖型、上墨方式和与 743/823 的关系，再把 FA 尖体验、弹性和适用书写放入评测来源。",
  }),
  makeSearchOnlyModel({
    slug: "百乐-pilot-custom-743",
    brandSlug: "pilot",
    aliases: [
      { alias: "Pilot Custom 743", language: "en" },
      { alias: "百乐 Custom 743", language: "zh" },
    ],
    sourceItemId: "source-pilot-custom-743-public-search",
    specId: "spec-pilot-custom-743-research",
    seriesName: "Custom 743",
    originCountry: "日本（待核验）",
    nib: "金尖/#15 笔尖说法待核验",
    fillSystem: "墨囊/上墨器兼容待核验",
    material: "树脂笔身说法待核验",
    priceRange: "1260 起等渠道价待核验",
    claimId: "claim-pilot-custom-743-source-boundary",
    modelName: "百乐 Pilot Custom 743",
    focus:
      "Custom 743 identity, nib size and nib options, relation to Custom 823, filling system, material, and price claims",
    storyId: "story-model-pilot-custom-743-research",
    storyTitle: "把 Custom 743 放进 74 到 823 的升级路径",
    storySummary:
      "Pilot Custom 743 先作为 Custom 系列升级研究页，#15 笔尖、和 823 的关系以及渠道价都需要补证。",
    storyBodyMd:
      "Custom 743 对用户来说常常是“从 74 往上走”的一站，但这个叙事要有结构支撑：笔尖尺寸、可选尖型、上墨方式和与 823 的差异分别是什么。\n\n当前档案先建立升级路径框架。后续补证时，应该把官方 Custom 系列资料、目录、零售规格和长期评测结合起来，避免只靠价格判断定位。",
  }),
  makeSearchOnlyModel({
    slug: "百乐-pilot-custom-823",
    brandSlug: "pilot",
    aliases: [
      { alias: "Pilot Custom 823", language: "en" },
      { alias: "百乐 Custom 823", language: "zh" },
      { alias: "百乐 823", language: "zh" },
    ],
    sourceItemId: "source-pilot-custom-823-public-search",
    specId: "spec-pilot-custom-823-research",
    seriesName: "Custom 823",
    originCountry: "日本（待核验）",
    nib: "金尖/尖号选项待核验",
    fillSystem: "真空上墨说法待核验",
    material: "透明/琥珀/烟灰等版本待核验",
    priceRange: "日用旗舰价位待核验",
    claimId: "claim-pilot-custom-823-source-boundary",
    modelName: "百乐 Pilot Custom 823",
    focus:
      "Custom 823 product identity, vacuum-filling mechanism, color/version differences, cleaning difficulty, long-writing reputation, and price",
    storyId: "story-model-pilot-custom-823-research",
    storyTitle: "把 Custom 823 的日用旗舰口碑和真空上墨事实分开",
    storySummary:
      "Pilot Custom 823 先作为真空上墨日用旗舰研究页，口碑、清洗难度、颜色版本和机制事实都需要来源分层。",
    storyBodyMd:
      "Custom 823 是图书馆里绕不开的型号：它既是很多用户心中的日用旗舰，也是其他真空上墨钢笔经常被拿来比较的参照物。越是这种高口碑型号，越不能只写一句“如果只推荐一支”。\n\n当前档案先把它拆成三层：产品层确认 Custom 823 的官方身份、上墨结构、笔尖和颜色版本；使用层记录大容量、长写和清洗维护；比较层再处理它和 743、845、Wing Sung 699 等型号的关系。口碑强，但证据边界也要强。",
    variants: [
      {
        id: "variant-pilot-custom-823-amber-candidate",
        name: "Amber / brown demonstrator candidate",
        notes: "Verify color naming and region availability before using as a factual version entry.",
        sourceItemId: "source-pilot-custom-823-public-search",
        reviewStatus: "needs_source",
      },
      {
        id: "variant-pilot-custom-823-smoke-candidate",
        name: "Smoke / dark demonstrator candidate",
        notes: "Keep as a candidate until direct product or catalog evidence is attached.",
        sourceItemId: "source-pilot-custom-823-public-search",
        reviewStatus: "needs_source",
      },
    ],
  }),
  makeSearchOnlyModel({
    slug: "百乐-pilot-elite-95s",
    brandSlug: "pilot",
    aliases: [
      { alias: "Pilot Elite 95S", language: "en" },
      { alias: "Pilot E95S", language: "en" },
      { alias: "百乐 Elite 95S", language: "zh" },
    ],
    sourceItemId: "source-pilot-elite-95s-public-search",
    specId: "spec-pilot-elite-95s-research",
    seriesName: "Elite 95S / E95S",
    originCountry: "日本（待核验）",
    nib: "嵌入式金尖说法待核验",
    fillSystem: "墨囊/上墨器兼容待核验",
    material: "短钢笔/金属帽或金属质感待核验",
    priceRange: "随身金笔价位待核验",
    claimId: "claim-pilot-elite-95s-source-boundary",
    modelName: "百乐 Pilot Elite 95S",
    focus:
      "Elite 95S/E95S naming, pocket-pen identity, inlaid nib, portability, material feel, filling system, and availability",
    storyId: "story-model-pilot-elite-95s-research",
    storyTitle: "把 Elite 95S 放进日系短钢笔和随身书写路径",
    storySummary:
      "Pilot Elite 95S 先作为短钢笔/随身金笔研究页，E95S 命名、嵌入式笔尖和便携体验都需要来源。",
    storyBodyMd:
      "Elite 95S 的价值不是参数堆叠，而是短钢笔逻辑：收起来短、插帽后能正常书写，适合随身携带。原始摘要提到出门和金属质感，这些都应变成可核验的使用场景。\n\n当前档案先确认 Elite 95S / E95S 命名、笔尖形态、笔身材质、上墨兼容和当前供货。后续可以把它和 Kaweco Sport、Liliput、Sailor pocket pen 等放进“随身短笔”展览。",
  }),
  makeSearchOnlyModel({
    slug: "百乐-pilot-heritage-91",
    brandSlug: "pilot",
    aliases: [
      { alias: "Pilot Custom Heritage 91", language: "en" },
      { alias: "Pilot Heritage 91", language: "en" },
      { alias: "百乐 Heritage 91", language: "zh" },
    ],
    sourceItemId: "source-pilot-heritage-91-public-search",
    specId: "spec-pilot-heritage-91-research",
    seriesName: "Custom Heritage 91",
    originCountry: "日本（待核验）",
    nib: "金尖/尖号选项待核验",
    fillSystem: "墨囊/上墨器兼容待核验",
    material: "树脂笔身说法待核验",
    priceRange: "407-470 等渠道价待核验",
    claimId: "claim-pilot-heritage-91-source-boundary",
    modelName: "百乐 Pilot Heritage 91",
    focus:
      "Custom Heritage 91 identity, relation to Custom 74, nib, filling system, body design, and Chinese deal-price claims",
    storyId: "story-model-pilot-heritage-91-research",
    storyTitle: "把 Heritage 91 放进 Custom 74 相邻升级页",
    storySummary:
      "Pilot Heritage 91 先作为 Custom 74 相邻型号研究页，价格、外观差异和同尖说法都需要来源。",
    storyBodyMd:
      "Heritage 91 的原始摘要很购买向：比 74 还便宜、同样笔尖但更好看的笔身。这个判断有用，但需要先确认 91 与 Custom 74 的官方关系、笔尖规格、上墨兼容和地区供应。\n\n当前档案先把它放进 Pilot 金尖入门/升级路径：74、91、92、742、743、823 应当形成一条可比较的系列阅读线。价格只保留为渠道线索，不写成稳定事实。",
  }),
  makeSearchOnlyModel({
    slug: "百乐-pilot-heritage-92",
    brandSlug: "pilot",
    aliases: [
      { alias: "Pilot Custom Heritage 92", language: "en" },
      { alias: "Pilot Heritage 92", language: "en" },
      { alias: "百乐 Heritage 92", language: "zh" },
    ],
    sourceItemId: "source-pilot-heritage-92-public-search",
    specId: "spec-pilot-heritage-92-research",
    seriesName: "Custom Heritage 92",
    originCountry: "日本（待核验）",
    nib: "金尖/尖号选项待核验",
    fillSystem: "活塞上墨说法待核验",
    material: "透明/树脂笔身说法待核验",
    priceRange: "669 起等渠道价待核验",
    claimId: "claim-pilot-heritage-92-source-boundary",
    modelName: "百乐 Pilot Heritage 92",
    focus:
      "Custom Heritage 92 identity, piston-filler evidence, nib, demonstrator body, and price claims",
    storyId: "story-model-pilot-heritage-92-research",
    storyTitle: "把 Heritage 92 的活塞金尖身份先核验",
    storySummary:
      "Pilot Heritage 92 先作为百乐活塞金尖研究页，活塞结构、透明笔身和渠道价都等待直接来源。",
    storyBodyMd:
      "Heritage 92 的用户记忆集中在“百乐金尖 + 活塞”。这条线索很适合进入上墨系统路径，但必须先确认具体产品页、活塞结构、笔尖和版本。\n\n当前档案先把 92 和 74/91/823 分开：它可能是 Pilot 体系里少数以活塞为核心卖点的日用金尖，但这需要官方或目录来源支撑。价格只作为待核验市场线索。",
  }),
  makeSearchOnlyModel({
    slug: "百乐-pilot-iroshizuku色彩雫",
    brandSlug: "pilot",
    aliases: [
      { alias: "Pilot Iroshizuku", language: "en" },
      { alias: "Iroshizuku ink", language: "en" },
      { alias: "百乐 色彩雫", language: "zh" },
    ],
    sourceItemId: "source-pilot-iroshizuku-public-search",
    specId: "spec-pilot-iroshizuku-reclassification-research",
    seriesName: "Iroshizuku ink line / 待重分类墨水条目",
    originCountry: "日本（待核验）",
    nib: "不适用：墨水条目",
    fillSystem: "瓶装墨水/容量待核验",
    material: "墨水颜色、染料和 shading 表现待核验",
    priceRange: "墨水价格区间待核验",
    claimId: "claim-pilot-iroshizuku-source-boundary",
    modelName: "百乐 Pilot Iroshizuku 色彩雫",
    focus:
      "whether this local pen entry should be reclassified as an ink line, color range, bottle sizes, shading claims, and review evidence",
    storyId: "story-model-pilot-iroshizuku-reclassification-research",
    storyTitle: "先把 Iroshizuku 色彩雫标成墨水条目",
    storySummary:
      "Pilot Iroshizuku 色彩雫不是钢笔型号，当前先作为待重分类墨水条目处理，颜色、容量和 shading 口碑都需要来源。",
    storyBodyMd:
      "色彩雫出现在 `pen` 列表里，是一个明显的数据层级问题：它更像墨水系列，而不是钢笔型号。当前 schema 还没有 ink 类型，所以先用研究页把误差公开标出来。\n\n后续更好的做法，是为墨水建立独立类型或把它迁移到 concept/material 一类的消耗品页面。当前页面只保留墨水身份、颜色、容量、价格和 shading 评价的补证任务，不把它继续当作钢笔规格写。",
  }),
  makeSearchOnlyModel({
    slug: "百乐-pilot-prera",
    brandSlug: "pilot",
    aliases: [
      { alias: "Pilot Prera", language: "en" },
      { alias: "百乐 Prera", language: "zh" },
    ],
    sourceItemId: "source-pilot-prera-public-search",
    specId: "spec-pilot-prera-research",
    seriesName: "Prera",
    originCountry: "日本（待核验）",
    nib: "钢尖/尖号选项待核验",
    fillSystem: "墨囊/上墨器兼容待核验",
    material: "树脂/透明版本待核验",
    priceRange: "日本本土/入门价位待核验",
    claimId: "claim-pilot-prera-source-boundary",
    modelName: "百乐 Pilot Prera",
    focus:
      "Prera compact-body identity, Japanese-market popularity, clear/color variants, nib, filling system, and price",
    storyId: "story-model-pilot-prera-research",
    storyTitle: "把 Prera 做成小型日用和手帐场景页",
    storySummary:
      "Pilot Prera 先作为小型日用/手帐钢笔研究页，日本本土人气、透明版本和笔尖兼容都需要来源。",
    storyBodyMd:
      "Prera 的原始摘要只说日本本土有人气，但这正好提示它适合按使用场景来读：小型、轻便、颜色/透明版本、手帐和短时间书写。\n\n当前档案先确认型号身份、笔尖、上墨器、尺寸和版本。等有评测来源后，再把“本土人气”和手帐场景写成有出处的用户语境。",
  }),
  makeSearchOnlyModel({
    slug: "百乐-pilot-笑脸-kakuno",
    brandSlug: "pilot",
    aliases: [
      { alias: "Pilot Kakuno", language: "en" },
      { alias: "百乐 笑脸 Kakuno", language: "zh" },
      { alias: "百乐 笑脸", language: "zh" },
    ],
    sourceItemId: "source-pilot-kakuno-public-search",
    specId: "spec-pilot-kakuno-research",
    seriesName: "Kakuno",
    originCountry: "日本品牌/版本产地待核验",
    nib: "笑脸钢尖/尖号选项待核验",
    fillSystem: "墨囊/上墨器兼容待核验",
    material: "塑料笔身说法待核验",
    priceRange: "儿童/学生入门价位待核验",
    claimId: "claim-pilot-kakuno-source-boundary",
    modelName: "百乐 Pilot 笑脸 Kakuno",
    focus:
      "Kakuno beginner positioning, smiley nib, child/student claims, nib, filling system, material, and low-price evidence",
    storyId: "story-model-pilot-kakuno-research",
    storyTitle: "把 Kakuno 笑脸放进入门练字路径",
    storySummary:
      "Pilot Kakuno 笑脸先作为儿童/学生入门钢笔研究页，笑脸笔尖、握持引导和练字推荐都需要来源。",
    storyBodyMd:
      "Kakuno 很适合做“第一支钢笔”的入口，但这类页面不能只写可爱。用户真正关心的是：它为什么适合入门，握持、笔尖、上墨、耐摔和替换成本如何。\n\n当前档案先把笑脸笔尖、学生定位、上墨兼容和版本拆开。后续补证时，可以把它和 Schneider BK402、LAMY safari、Pilot 78G 等放进学生/入门展览。",
  }),
  makeSearchOnlyModel({
    slug: "百乐-pilot-贵妃-cocoon",
    brandSlug: "pilot",
    aliases: [
      { alias: "Pilot Cocoon", language: "en" },
      { alias: "Pilot Metropolitan", language: "en" },
      { alias: "百乐 贵妃 Cocoon", language: "zh" },
    ],
    sourceItemId: "source-pilot-cocoon-public-search",
    specId: "spec-pilot-cocoon-research",
    seriesName: "Cocoon / Metropolitan identity pending",
    originCountry: "日本品牌/版本产地待核验",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器兼容待核验",
    material: "金属笔身说法待核验",
    priceRange: "轻商务入门价位待核验",
    claimId: "claim-pilot-cocoon-source-boundary",
    modelName: "百乐 Pilot 贵妃 Cocoon",
    focus:
      "Cocoon versus Metropolitan naming, light-business positioning, metal body, nib, filling system, and gift/office claims",
    storyId: "story-model-pilot-cocoon-research",
    storyTitle: "先确认贵妃 Cocoon 和 Metropolitan 的命名边界",
    storySummary:
      "Pilot 贵妃 Cocoon 先作为轻商务入门研究页，Cocoon/Metropolitan 命名、金属笔身和办公礼赠定位都需要来源。",
    storyBodyMd:
      "贵妃/Cocoon 的原始摘要很像普通用户视角：体面、轻商务、适合办公。写成图书馆页面时，关键是先确认它和 Metropolitan 的地区命名关系，再处理材质、笔尖和上墨。\n\n当前档案先保留命名边界。后续补证应区分官方地区页、中文渠道昵称和实际 SKU，避免把不同市场名字混成一支笔。",
  }),
  makeSearchOnlyModel({
    slug: "百利金-pelikan-m1000",
    brandSlug: "pelikan",
    aliases: [
      { alias: "Pelikan Souveran M1000", language: "en" },
      { alias: "Pelikan M1000", language: "en" },
      { alias: "百利金 M1000", language: "zh" },
    ],
    sourceItemId: "source-pelikan-m1000-public-search",
    specId: "spec-pelikan-m1000-research",
    seriesName: "Souveran M1000",
    originCountry: "德国（待核验）",
    nib: "金尖/大型笔尖规格待核验",
    fillSystem: "活塞上墨说法待核验",
    material: "树脂/条纹材质待核验",
    priceRange: "旗舰价位待核验",
    claimId: "claim-pelikan-m1000-source-boundary",
    modelName: "百利金 Pelikan M1000",
    focus:
      "M1000 flagship identity, size, nib, piston filler, hand-size comments, M800 comparison, and price",
    storyId: "story-model-pelikan-m1000-research",
    storyTitle: "把 M1000 的旗舰尺寸和手感争议拆开",
    storySummary:
      "Pelikan M1000 先作为 Souveran 最大尺寸研究页，旗舰定位、软弹大尖和“手特别大才合适”都需要来源。",
    storyBodyMd:
      "M1000 的原始摘要抓住了一个非常实用的问题：它是不是太大。旗舰并不自动等于适合日用，尤其 Pelikan M 系列的尺寸、重量、笔尖反馈和握持差异都很重要。\n\n当前档案先把 M1000 放进 M200-M1000 尺寸阶梯。后续补证应确认官方规格、笔尖、活塞、重量和长期评测，再把“除非手特别大”这类经验写成有出处的口碑。",
  }),
  makeSearchOnlyModel({
    slug: "百利金-pelikan-m1005-stresemann",
    brandSlug: "pelikan",
    aliases: [
      { alias: "Pelikan M1005 Stresemann", language: "en" },
      { alias: "Pelikan Souveran M1005 Stresemann", language: "en" },
      { alias: "百利金 M1005 Stresemann", language: "zh" },
    ],
    sourceItemId: "source-pelikan-m1005-stresemann-public-search",
    specId: "spec-pelikan-m1005-stresemann-research",
    seriesName: "Souveran M1005 Stresemann",
    originCountry: "德国（待核验）",
    nib: "18K 金尖说法待核验",
    fillSystem: "活塞上墨说法待核验",
    material: "Stresemann 灰条纹/饰面待核验",
    priceRange: "5000+ 说法待核验",
    claimId: "claim-pelikan-m1005-stresemann-source-boundary",
    modelName: "百利金 Pelikan M1005 Stresemann",
    focus:
      "M1005 Stresemann identity, colorway and trim, nib, piston filler, availability, and 5000+ price claims",
    storyId: "story-model-pelikan-m1005-stresemann-research",
    storyTitle: "把 M1005 Stresemann 当作配色/规格组合核验",
    storySummary:
      "Pelikan M1005 Stresemann 先作为 M1000 级别配色/饰面研究页，18K、活塞和 5000+ 价位都需要来源。",
    storyBodyMd:
      "M1005 Stresemann 不能只按 M1000 的通用规格写。它涉及尺寸级别、钯色/银色饰件、Stresemann 灰条纹语境、供货状态和收藏价格，这些都需要单独来源。\n\n当前档案先建立“具体配色/规格组合”的边界：后续要确认它是否对应 M1000 尺寸、是否限量或停产、笔尖和市场价格如何变化。",
  }),
  makeSearchOnlyModel({
    slug: "百利金-pelikan-m200",
    brandSlug: "pelikan",
    aliases: [
      { alias: "Pelikan M200", language: "en" },
      { alias: "Pelikan Classic M200", language: "en" },
      { alias: "百利金 M200", language: "zh" },
    ],
    sourceItemId: "source-pelikan-m200-public-search",
    specId: "spec-pelikan-m200-research",
    seriesName: "Classic M200",
    originCountry: "德国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "活塞上墨说法待核验",
    material: "树脂笔身说法待核验",
    priceRange: "500-800 说法待核验",
    claimId: "claim-pelikan-m200-source-boundary",
    modelName: "百利金 Pelikan M200",
    focus:
      "M200 entry Pelikan identity, steel nib, piston filler, material, dimensions, and 500-800 price claims",
    storyId: "story-model-pelikan-m200-research",
    storyTitle: "把 M200 放进德系活塞入门路线",
    storySummary:
      "Pelikan M200 先作为德系活塞入门研究页，钢尖、活塞、尺寸和 500-800 价位都需要产品来源。",
    storyBodyMd:
      "M200 的图书馆价值在于它让 Pelikan 的活塞系统从高端线走向更低门槛。它不是 M400/M600 的替代品，也不是单纯低配，而是 Pelikan 尺寸体系里的入门节点。\n\n当前档案先确认钢尖、活塞、材质、尺寸和配色版本。后续可以把它和 M400/M600/M800/M1000 做成系列树，而不是让用户在孤立页面里猜尺寸。",
  }),
  makeSearchOnlyModel({
    slug: "百利金-pelikan-m400",
    brandSlug: "pelikan",
    aliases: [
      { alias: "Pelikan Souveran M400", language: "en" },
      { alias: "Pelikan M400", language: "en" },
      { alias: "百利金 M400", language: "zh" },
    ],
    sourceItemId: "source-pelikan-m400-public-search",
    specId: "spec-pelikan-m400-research",
    seriesName: "Souveran M400",
    originCountry: "德国（待核验）",
    nib: "金尖说法待核验",
    fillSystem: "活塞上墨说法待核验",
    material: "条纹树脂/饰面待核验",
    priceRange: "中高端价位待核验",
    claimId: "claim-pelikan-m400-source-boundary",
    modelName: "百利金 Pelikan M400",
    focus:
      "M400 identity, gold nib, piston filler, size, wet-writing reputation, Custom 823 comparison, and value claims",
    storyId: "story-model-pelikan-m400-research",
    storyTitle: "把 M400 的风格选择和性价比争议分开写",
    storySummary:
      "Pelikan M400 先作为 Souveran 小尺寸金尖研究页，德式湿润书写、价格对比和 823 比较都需要归因。",
    storyBodyMd:
      "M400 的原始摘要很诚实：同价位可能能买到别的强型号，选它更像风格选择。这种判断很适合图书馆，但不能脱离来源。\n\n当前档案先把 M400 放入 Pelikan 尺寸阶梯和风格路线：确认笔尖、活塞、尺寸、重量和配色，再用评测来源承载“湿漉漉书写感”、性价比争议和与 Pilot 823 的比较。",
  }),
  makeSearchOnlyModel({
    slug: "百利金-pelikan-m600",
    brandSlug: "pelikan",
    aliases: [
      { alias: "Pelikan Souveran M600", language: "en" },
      { alias: "Pelikan M600", language: "en" },
      { alias: "百利金 M600", language: "zh" },
    ],
    sourceItemId: "source-pelikan-m600-public-search",
    specId: "spec-pelikan-m600-research",
    seriesName: "Souveran M600",
    originCountry: "德国（待核验）",
    nib: "金尖说法待核验",
    fillSystem: "活塞上墨说法待核验",
    material: "条纹树脂/饰面待核验",
    priceRange: "M400 与 M800 之间价位待核验",
    claimId: "claim-pelikan-m600-source-boundary",
    modelName: "百利金 Pelikan M600",
    focus:
      "M600 identity, size between M400 and M800, nib, piston filler, material, and price-step comments",
    storyId: "story-model-pelikan-m600-research",
    storyTitle: "把 M600 放在 M400 到 M800 的尺寸台阶里",
    storySummary:
      "Pelikan M600 先作为中间尺寸研究页，尺寸升级、价格跳档和与 M400/M800 的关系都需要来源。",
    storyBodyMd:
      "M600 的核心不是某个孤立参数，而是位置：M400 嫌小，但 M800 又太大或太贵时，它成为中间台阶。原始摘要里的价格焦虑正说明这页应该做成比较入口。\n\n当前档案先确认官方规格、笔尖、活塞、尺寸和价格区间。后续 Pelikan 展览可以用 M200/M400/M600/M800/M1000 做一张尺寸树，让用户更容易理解每一级的意义。",
  }),
  makeSearchOnlyModel({
    slug: "百利金-pelikan-m605白乌龟",
    brandSlug: "pelikan",
    aliases: [
      { alias: "Pelikan M605 White Tortoise", language: "en" },
      { alias: "Pelikan M605 white stripe", language: "en" },
      { alias: "百利金 M605 白乌龟", language: "zh" },
    ],
    sourceItemId: "source-pelikan-m605-white-public-search",
    specId: "spec-pelikan-m605-white-research",
    seriesName: "Souveran M605 white-stripe identity pending",
    originCountry: "德国（待核验）",
    nib: "金尖/钯色饰件版本待核验",
    fillSystem: "活塞上墨说法待核验",
    material: "白条纹/白乌龟配色待核验",
    priceRange: "收藏/二级市场价待核验",
    claimId: "claim-pelikan-m605-white-source-boundary",
    modelName: "百利金 Pelikan M605 白乌龟",
    focus:
      "M605 white-stripe or white-tortoise identity, colorway naming, nib, piston filler, availability, and collector popularity",
    storyId: "story-model-pelikan-m605-white-research",
    storyTitle: "先确认 M605 白乌龟到底是哪一个配色",
    storySummary:
      "Pelikan M605 白乌龟先作为高人气配色待核验页，中文昵称、官方色名、饰件和供货状态都需要来源。",
    storyBodyMd:
      "“白乌龟”是典型的中文玩家昵称，图书馆不能直接把它当作官方型号名。它可能指向 white tortoise、white stripe 或某个地区/年份配色，需要先确认英文名、尺寸级别和饰件。\n\n当前档案先标记为配色研究页。后续要用官方产品页、目录、可靠零售页或收藏资料确认命名，再写收藏热度和二级市场价格。",
  }),
  makeSearchOnlyModel({
    slug: "百利金-pelikan-m815",
    brandSlug: "pelikan",
    aliases: [
      { alias: "Pelikan M815", language: "en" },
      { alias: "Pelikan Souveran M815", language: "en" },
      { alias: "百利金 M815", language: "zh" },
    ],
    sourceItemId: "source-pelikan-m815-public-search",
    specId: "spec-pelikan-m815-research",
    seriesName: "Souveran M815 identity pending",
    originCountry: "德国（待核验）",
    nib: "18K 金尖说法待核验",
    fillSystem: "活塞上墨说法待核验",
    material: "金属条纹/饰面待核验",
    priceRange: "3500-5000 说法待核验",
    claimId: "claim-pelikan-m815-source-boundary",
    modelName: "百利金 Pelikan M815",
    focus:
      "M815 product identity, M800-family positioning, metal stripe or trim, 18K nib, piston filler, and high-price claims",
    storyId: "story-model-pelikan-m815-research",
    storyTitle: "把 M815 当作 M800 级别特殊版本核验",
    storySummary:
      "Pelikan M815 先作为 M800 级别特殊版本研究页，金属条纹、18K 笔尖、活塞和高价位都需要直接来源。",
    storyBodyMd:
      "M815 很容易被用户当成 M800 的“更豪华版本”来理解，但图书馆必须先分清官方型号、配色/材质、饰件和年份。尤其是金属条纹、重量、笔尖规格和价格判断，都需要产品页或可靠评测来支撑。\n\n当前档案把它放在 Pelikan 高端尺寸阶梯里，先作为待核验入口。等确认来源后，它可以和 M800、M1000、M1005 Stresemann 一起组成 Souveran 高阶展柜。",
  }),
  makeSearchOnlyModel({
    slug: "百利金-pelikan-p457",
    brandSlug: "pelikan",
    aliases: [
      { alias: "Pelikan P457", language: "en" },
      { alias: "百利金 P457", language: "zh" },
      { alias: "Pelikan P457 fountain pen", language: "en" },
    ],
    sourceItemId: "source-pelikan-p457-public-search",
    specId: "spec-pelikan-p457-research",
    seriesName: "P457 identity pending",
    originCountry: "待核验",
    nib: "笔尖类型待核验",
    fillSystem: "上墨方式待核验",
    material: "笔身材质待核验",
    priceRange: "入门价位说法待核验",
    claimId: "claim-pelikan-p457-source-boundary",
    modelName: "百利金 Pelikan P457",
    focus:
      "P457 identity, whether the entry is a stable Pelikan fountain-pen model, Safari comparison, nib, filling system, material, and price claims",
    storyId: "story-model-pelikan-p457-research",
    storyTitle: "先确认 Pelikan P457 的型号身份和 Safari 对比",
    storySummary:
      "Pelikan P457 先作为身份不明研究页，和 LAMY safari 的对比要等型号、规格和来源确认后再写。",
    storyBodyMd:
      "P457 的原始摘要只有“被拿来和 Safari 对比”，这不足以直接写成型号事实。图书馆先要确认它是否是稳定销售的 Pelikan 钢笔型号、是否有地区命名差异，以及对比 Safari 的维度到底是价格、握持、学生场景还是笔尖体验。\n\n当前档案只保留研究队列：先找产品页、目录或可靠评测，再决定它应留在型号馆、并入某个系列，还是降级为讨论线索。",
  }),
  makeSearchOnlyModel({
    slug: "pelikan-souveran-m800",
    brandSlug: "pelikan",
    aliases: [
      { alias: "Pelikan Souveran M800", language: "en" },
      { alias: "Pelikan M800", language: "en" },
      { alias: "百利金 Souveran M800", language: "zh" },
    ],
    sourceItemId: "source-pelikan-m800-public-search",
    specId: "spec-pelikan-m800-research",
    seriesName: "Souveran M800",
    originCountry: "德国（待核验）",
    nib: "金尖/18K 说法待核验",
    fillSystem: "活塞上墨说法待核验",
    material: "条纹树脂/饰面待核验",
    priceRange: "高端价位待核验",
    claimId: "claim-pelikan-m800-source-boundary",
    modelName: "百利金 Souveran M800",
    focus:
      "M800 identity, M800-size positioning, nib, piston filler, striped body, dimensions, weight, and comparisons with M600/M1000",
    storyId: "story-model-pelikan-m800-research",
    storyTitle: "把 Souveran M800 放进 Pelikan 尺寸主轴",
    storySummary:
      "Pelikan M800 先作为 Souveran 主轴大尺寸研究页，重量、笔尖和与 M600/M1000 的关系需要来源支撑。",
    storyBodyMd:
      "M800 是 Pelikan 尺寸阶梯里最适合做“主轴”的型号之一：比 M600 更有存在感，又不像 M1000 那样明显偏大。原始摘要里的“粗犷有力”可以作为用户感受线索，但不能直接当事实。\n\n当前档案先确认官方规格、笔尖、活塞和条纹笔身，再用评测来源写手感、重量和适合人群。后续可把 M200/M400/M600/M800/M1000 做成一张尺寸路径图。",
  }),
  makeSearchOnlyModel({
    slug: "维斯康蒂-visconti-rembrandt伦勃朗",
    brandSlug: "visconti",
    aliases: [
      { alias: "Visconti Rembrandt", language: "en" },
      { alias: "Visconti Rembrandt fountain pen", language: "en" },
      { alias: "维斯康蒂 Rembrandt 伦勃朗", language: "zh" },
    ],
    sourceItemId: "source-visconti-rembrandt-public-search",
    specId: "spec-visconti-rembrandt-research",
    seriesName: "Rembrandt",
    originCountry: "意大利（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "树脂/亚克力配色待核验",
    priceRange: "1000-1500 说法待核验",
    claimId: "claim-visconti-rembrandt-source-boundary",
    modelName: "维斯康蒂 Visconti Rembrandt",
    focus:
      "Rembrandt identity, art-line positioning, material, cap mechanism, steel nib, cartridge/converter filling, and price claims",
    storyId: "story-model-visconti-rembrandt-research",
    storyTitle: "把 Rembrandt 伦勃朗做成 Visconti 入门艺术线",
    storySummary:
      "Visconti Rembrandt 先作为艺术配色入门线研究页，材质、磁吸笔帽、钢尖和价位都需要直接来源。",
    storyBodyMd:
      "Rembrandt 的价值不只在参数，而在 Visconti 把艺术命名、色彩材料和日用钢笔结合起来的方式。图书馆后续可以把它和 Van Gogh 放在同一个“艺术线”展柜里，但每个事实都要先分清官方叙事和玩家体验。\n\n当前档案先标记型号身份、钢尖、上墨方式、材质和价位为待核验。确认来源后，再补配色图、版本列表和实际书写反馈。",
  }),
  makeSearchOnlyModel({
    slug: "维斯康蒂-visconti-van-gogh梵高",
    brandSlug: "visconti",
    aliases: [
      { alias: "Visconti Van Gogh", language: "en" },
      { alias: "Visconti Van Gogh fountain pen", language: "en" },
      { alias: "维斯康蒂 Van Gogh 梵高", language: "zh" },
    ],
    sourceItemId: "source-visconti-van-gogh-public-search",
    specId: "spec-visconti-van-gogh-research",
    seriesName: "Van Gogh",
    originCountry: "意大利（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "树脂/亚克力艺术配色待核验",
    priceRange: "中端价位待核验",
    claimId: "claim-visconti-van-gogh-source-boundary",
    modelName: "维斯康蒂 Visconti Van Gogh",
    focus:
      "Van Gogh identity, painting-inspired color editions, material, nib, cartridge/converter filling, and mid-range positioning",
    storyId: "story-model-visconti-van-gogh-research",
    storyTitle: "把 Van Gogh 梵高的配色叙事和产品事实分开",
    storySummary:
      "Visconti Van Gogh 先作为艺术配色中端线研究页，具体画作配色、材料和规格都需要逐项核验。",
    storyBodyMd:
      "Van Gogh 系列天然适合图书馆化：每个配色都可以连到画作叙事，但这也最容易让营销文字压过产品事实。图书馆应把“画作灵感”“材料工艺”“笔尖/上墨规格”和“玩家体验”拆成四层。\n\n当前档案先作为研究入口。后续拿到官方产品页和可靠评测后，可以做版本表和配色索引，而不是只写一句“配色独特”。",
  }),
  makeSearchOnlyModel({
    slug: "英雄-hero-100",
    brandSlug: "hero",
    aliases: [
      { alias: "Hero 100", language: "en" },
      { alias: "Hero 100 fountain pen", language: "en" },
      { alias: "英雄 100", language: "zh" },
    ],
    sourceItemId: "source-hero-100-public-search",
    specId: "spec-hero-100-research",
    seriesName: "Hero 100",
    originCountry: "中国（待核验）",
    nib: "14K 金尖说法待核验",
    fillSystem: "暗尖/挤压或气压式上墨说法待核验",
    material: "金属/塑料结构待核验",
    priceRange: "300 元以内说法待核验",
    claimId: "claim-hero-100-source-boundary",
    modelName: "英雄 Hero 100",
    focus:
      "Hero 100 identity, 14K nib, hooded nib, filling system, price, cap seal, quality-control comments, and domestic gold-nib reputation",
    storyId: "story-model-hero-100-research",
    storyTitle: "把 Hero 100 的国产金尖地位和气密争议分开",
    storySummary:
      "Hero 100 先作为国产金尖代表研究页，14K、价格、气密性和品控评价都需要来源归因。",
    storyBodyMd:
      "Hero 100 的原始摘要很有玩家语气：便宜金尖、国产代表、气密性偶尔有问题。这样的内容很有价值，但必须拆成可核验事实和用户经验两层。\n\n当前档案先确认型号、笔尖、上墨系统和价格带，再寻找长期评测或社区讨论承载气密性和品控争议。它后续可以成为国产经典展柜的核心页面。",
  }),
  makeSearchOnlyModel({
    slug: "英雄-hero-329",
    brandSlug: "hero",
    aliases: [
      { alias: "Hero 329", language: "en" },
      { alias: "Hero 329 fountain pen", language: "en" },
      { alias: "英雄 329", language: "zh" },
    ],
    sourceItemId: "source-hero-329-public-search",
    specId: "spec-hero-329-research",
    seriesName: "Hero 329",
    originCountry: "中国（待核验）",
    nib: "暗尖/钢尖说法待核验",
    fillSystem: "上墨方式待核验",
    material: "笔身材质待核验",
    priceRange: "低价入门说法待核验",
    claimId: "claim-hero-329-source-boundary",
    modelName: "英雄 Hero 329",
    focus:
      "Hero 329 identity, low-price positioning, nib, filling system, production variants, and quality-control stability comments",
    storyId: "story-model-hero-329-research",
    storyTitle: "把 Hero 329 先做成低价国货待核验页",
    storySummary:
      "Hero 329 先作为低价国货研究页，品控稳定性和版本差异需要可靠来源或社区样本。",
    storyBodyMd:
      "Hero 329 的原始摘要只有“品控比以前稳定多了”，这是一条典型的社区经验，不适合裸写成事实。图书馆需要先确认它的版本、笔尖、上墨方式和当前生产状态。\n\n当前档案先把它收进研究队列。后续可以用中文评测、老目录和现代购买反馈，把“低价”“稳定”“版本差异”分层写清楚。",
  }),
  makeSearchOnlyModel({
    slug: "英雄-hero-616",
    brandSlug: "hero",
    aliases: [
      { alias: "Hero 616", language: "en" },
      { alias: "Hero 616 fountain pen", language: "en" },
      { alias: "英雄 616", language: "zh" },
    ],
    sourceItemId: "source-hero-616-public-search",
    specId: "spec-hero-616-research",
    seriesName: "Hero 616",
    originCountry: "中国（待核验）",
    nib: "暗尖/钢尖说法待核验",
    fillSystem: "挤压或气压式上墨说法待核验",
    material: "塑料笔身/金属帽说法待核验",
    priceRange: "低价入门说法待核验",
    claimId: "claim-hero-616-source-boundary",
    modelName: "英雄 Hero 616",
    focus:
      "Hero 616 identity, Parker 51-style context, school-pen memory, hooded nib, filling system, tuned versions, and quality-control risk",
    storyId: "story-model-hero-616-research",
    storyTitle: "把 Hero 616 的集体记忆和品控风险分开",
    storySummary:
      "Hero 616 先作为国产集体记忆研究页，Parker 51 式语境、低价和调试版建议都需要来源边界。",
    storyBodyMd:
      "Hero 616 是很适合“图书馆”的页面：它不只是一支低价暗尖笔，也承载了很多人的第一支钢笔记忆。但记忆、外观源流、品控风险和调试版建议必须分开写。\n\n当前档案先保留待核验边界。后续要确认型号事实，再用社区资料呈现“70 后 80 后第一支钢笔”和“买调试版降低风险”的经验说法。",
  }),
  makeSearchOnlyModel({
    slug: "辉柏嘉-faber-castell-ambition雄心",
    brandSlug: "faber-castell",
    aliases: [
      { alias: "Faber-Castell Ambition", language: "en" },
      { alias: "Faber-Castell Ambition fountain pen", language: "en" },
      { alias: "辉柏嘉 Ambition 雄心", language: "zh" },
    ],
    sourceItemId: "source-faber-castell-ambition-public-search",
    specId: "spec-faber-castell-ambition-research",
    seriesName: "Ambition",
    originCountry: "德国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "多材质笔杆版本待核验",
    priceRange: "400-700 说法待核验",
    claimId: "claim-faber-castell-ambition-source-boundary",
    modelName: "辉柏嘉 Faber-Castell Ambition",
    focus:
      "Ambition identity, barrel material variants, steel nib, cartridge/converter filling, dimensions, price, and design-entry positioning",
    storyId: "story-model-faber-castell-ambition-research",
    storyTitle: "把 Ambition 雄心放进材质设计入门页",
    storySummary:
      "Faber-Castell Ambition 先作为设计型入门研究页，材质版本、钢尖和价位需要来源确认。",
    storyBodyMd:
      "Ambition 的重点不是复杂机制，而是 Faber-Castell 把材质、直线造型和日用钢尖组合成一个入门设计物件。原始摘要给了价格和规格，但图书馆需要先验证。\n\n当前档案先确认系列身份、笔杆材质、钢尖、上墨方式和价格区间。后续可以和 E-Motion、Ondoro、伯爵经典放在同一条“材质设计”路径里。",
  }),
  makeSearchOnlyModel({
    slug: "辉柏嘉-faber-castell-e-motion尚品",
    brandSlug: "faber-castell",
    aliases: [
      { alias: "Faber-Castell E-Motion", language: "en" },
      { alias: "Faber-Castell e-motion fountain pen", language: "en" },
      { alias: "辉柏嘉 E-Motion 尚品", language: "zh" },
    ],
    sourceItemId: "source-faber-castell-e-motion-public-search",
    specId: "spec-faber-castell-e-motion-research",
    seriesName: "E-Motion",
    originCountry: "德国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "梨木/树脂/金属版本待核验",
    priceRange: "中端价位待核验",
    claimId: "claim-faber-castell-e-motion-source-boundary",
    modelName: "辉柏嘉 Faber-Castell E-Motion",
    focus:
      "E-Motion identity, barrel material variants, steel nib, cartridge/converter filling, weight, object feel, and writing-experience comments",
    storyId: "story-model-faber-castell-e-motion-research",
    storyTitle: "把 E-Motion 尚品的物件感和笔尖体验分开",
    storySummary:
      "Faber-Castell E-Motion 先作为物件感研究页，重量、材质、笔尖体验和设计评价需要分层归因。",
    storyBodyMd:
      "E-Motion 很容易被一句“物件感强”概括，但图书馆应该拆开：短粗比例、材质版本、重量、握持和笔尖体验不是同一类事实。用户关心它是否好写，也关心它像不像一个值得把玩的物件。\n\n当前档案先确认规格和材质。后续用评测来源承载“在意物件感而不是笔尖体验可以看看”这类经验判断。",
  }),
  makeSearchOnlyModel({
    slug: "辉柏嘉-faber-castell-ondoro极致-烟熏橡木",
    brandSlug: "faber-castell",
    aliases: [
      { alias: "Faber-Castell Ondoro smoked oak", language: "en" },
      { alias: "Faber-Castell Ondoro fountain pen", language: "en" },
      { alias: "辉柏嘉 Ondoro 极致 烟熏橡木", language: "zh" },
    ],
    sourceItemId: "source-faber-castell-ondoro-public-search",
    specId: "spec-faber-castell-ondoro-smoked-oak-research",
    seriesName: "Ondoro smoked oak",
    originCountry: "德国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "烟熏橡木/多面笔杆说法待核验",
    priceRange: "中高端价位待核验",
    claimId: "claim-faber-castell-ondoro-source-boundary",
    modelName: "辉柏嘉 Faber-Castell Ondoro 烟熏橡木",
    focus:
      "Ondoro smoked oak identity, wooden faceted barrel, steel nib, cartridge/converter filling, availability, and material-design claims",
    storyId: "story-model-faber-castell-ondoro-smoked-oak-research",
    storyTitle: "把 Ondoro 烟熏橡木当作材质型设计档案",
    storySummary:
      "Faber-Castell Ondoro 烟熏橡木先作为材质型设计研究页，木材、切面、规格和供货状态都要核验。",
    storyBodyMd:
      "Ondoro 烟熏橡木的吸引力来自材质：它不是单纯换色，而是把木材触感、多面造型和日用书写放在一起。原始摘要里的“有温度”很适合作为展柜标题，但需要来源和实物图支撑。\n\n当前档案先确认烟熏橡木版本、笔尖、上墨方式和供货状态。后续可与 Ambition、E-Motion 组成 Faber-Castell 材质设计路线。",
  }),
  makeSearchOnlyModel({
    slug: "辉柏嘉-faber-castell-伯爵经典-gvfc",
    brandSlug: "faber-castell",
    aliases: [
      { alias: "Graf von Faber-Castell Classic", language: "en" },
      { alias: "GvFC Classic", language: "en" },
      { alias: "辉柏嘉 伯爵经典", language: "zh" },
    ],
    sourceItemId: "source-gvfc-classic-public-search",
    specId: "spec-gvfc-classic-research",
    seriesName: "Graf von Faber-Castell Classic",
    originCountry: "德国（待核验）",
    nib: "金尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "木材/金属饰件版本待核验",
    priceRange: "高端价位待核验",
    claimId: "claim-gvfc-classic-source-boundary",
    modelName: "辉柏嘉 Faber-Castell 伯爵经典 GVFC",
    focus:
      "Graf von Faber-Castell Classic identity, premium material variants, gold nib, cartridge/converter filling, assembly quality, and high-end positioning",
    storyId: "story-model-gvfc-classic-research",
    storyTitle: "把伯爵经典 GVFC 放进高端材质和装配路径",
    storySummary:
      "Graf von Faber-Castell Classic 先作为高端材质研究页，木材版本、金尖、装配精度和高端定位需要来源。",
    storyBodyMd:
      "伯爵经典 GVFC 是 Faber-Castell 体系里最适合展示“精密物件感”的页面之一。原始摘要强调细节、装配和德国制造的实物质感，但这些评价需要被放在来源边界里。\n\n当前档案先确认 Classic 系列身份、材质版本、笔尖和上墨方式。等来源齐全后，它可以成为从 Ambition 到 E-Motion、Ondoro，再到 Graf von Faber-Castell 的升级路径终点。",
  }),
  makeSearchOnlyModel({
    slug: "辉柏嘉-faber-castell-伯爵翎尚-neo-slim",
    brandSlug: "faber-castell",
    aliases: [
      { alias: "Faber-Castell Neo Slim", language: "en" },
      { alias: "Graf von Faber-Castell Neo Slim", language: "en" },
      { alias: "辉柏嘉 Neo Slim 伯爵翎尚", language: "zh" },
    ],
    sourceItemId: "source-faber-castell-neo-slim-public-search",
    specId: "spec-faber-castell-neo-slim-research",
    seriesName: "Neo Slim",
    originCountry: "德国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "金属笔身/饰面版本待核验",
    priceRange: "中高端价位待核验",
    claimId: "claim-faber-castell-neo-slim-source-boundary",
    modelName: "辉柏嘉 Faber-Castell Neo Slim",
    focus:
      "Neo Slim identity, slim-body positioning, steel nib, cartridge/converter filling, finish variants, build quality, and writing-feel comments",
    storyId: "story-model-faber-castell-neo-slim-research",
    storyTitle: "把 Neo Slim 翎尚写成细身设计和写感边界页",
    storySummary:
      "Faber-Castell Neo Slim 先作为细身设计研究页，外观、做工、笔尖弹性和上墨方式都需要来源确认。",
    storyBodyMd:
      "Neo Slim 的原始摘要强调外观和做工，并提醒不要把它当作弹性笔尖体验来买。这个判断很适合图书馆，但必须拆成两层：可核验的产品规格，以及用户对外观、握持和写感的评价。\n\n当前档案先确认系列身份、细身比例、笔尖、上墨方式和饰面版本。后续如果补图，可以让它和 Ambition、E-Motion、Ondoro 放在 Faber-Castell 设计线里对比。",
  }),
  makeSearchOnlyModel({
    slug: "辉柏嘉-faber-castell-如恩-loom",
    brandSlug: "faber-castell",
    aliases: [
      { alias: "Faber-Castell Loom", language: "en" },
      { alias: "Faber-Castell Loom fountain pen", language: "en" },
      { alias: "辉柏嘉 Loom 如恩", language: "zh" },
    ],
    sourceItemId: "source-faber-castell-loom-public-search",
    specId: "spec-faber-castell-loom-research",
    seriesName: "Loom",
    originCountry: "德国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "金属/树脂结构待核验",
    priceRange: "260 周年限量版 329 起说法待核验",
    claimId: "claim-faber-castell-loom-source-boundary",
    modelName: "辉柏嘉 Faber-Castell Loom",
    focus:
      "Loom identity, anniversary or limited-version claims, steel-nib reputation, cartridge/converter filling, price, and writing-feel comparisons",
    storyId: "story-model-faber-castell-loom-research",
    storyTitle: "把 Loom 如恩的钢尖口碑和限量价分开核验",
    storySummary:
      "Faber-Castell Loom 先作为钢尖口碑研究页，限量版价格和“胜过同价位金尖”说法需要来源归因。",
    storyBodyMd:
      "Loom 的原始摘要里有两个不同层次：一个是价格和版本信息，另一个是玩家对钢尖写感的高度评价。前者需要产品或销售来源，后者需要评测或社区样本。\n\n当前档案先把 Loom 放在 Faber-Castell 钢尖体验路径里。后续确认来源后，可以专门比较 Loom、Ambition 和 E-Motion 的同源笔尖体验是否真的有差异。",
  }),
  makeSearchOnlyModel({
    slug: "金豪-jinhao-10号",
    brandSlug: "jinhao",
    aliases: [
      { alias: "Jinhao 10", language: "en" },
      { alias: "Jinhao 10 fountain pen", language: "en" },
      { alias: "金豪 10号", language: "zh" },
    ],
    sourceItemId: "source-jinhao-10-public-search",
    specId: "spec-jinhao-10-research",
    seriesName: "Jinhao 10",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "笔身材质待核验",
    priceRange: "50 元价位说法待核验",
    claimId: "claim-jinhao-10-source-boundary",
    modelName: "金豪 Jinhao 10",
    focus:
      "Jinhao 10 identity, low-price surprise claims, nib, filling system, material, finish variants, and value-for-money comments",
    storyId: "story-model-jinhao-10-research",
    storyTitle: "把 Jinhao 10 先做成 50 元惊喜的待核验页",
    storySummary:
      "Jinhao 10 先作为低价惊喜研究页，价格、做工、笔尖和上墨方式都需要来源确认。",
    storyBodyMd:
      "“50 块的惊喜”是很典型的玩家入口语，它有吸引力，但不能替代产品事实。图书馆需要先确认 Jinhao 10 的型号身份、笔尖、上墨方式、材质和常见版本。\n\n当前档案先把它放进金豪平价展柜。后续再用购买渠道和评测样本去承载“惊喜”“超出价位”这类判断。",
  }),
  makeSearchOnlyModel({
    slug: "金豪-jinhao-313",
    brandSlug: "jinhao",
    aliases: [
      { alias: "Jinhao 313", language: "en" },
      { alias: "Jinhao 313 fountain pen", language: "en" },
      { alias: "金豪 313", language: "zh" },
    ],
    sourceItemId: "source-jinhao-313-public-search",
    specId: "spec-jinhao-313-research",
    seriesName: "Jinhao 313",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊说法待核验",
    material: "笔身材质待核验",
    priceRange: "5-15 元说法待核验",
    claimId: "claim-jinhao-313-source-boundary",
    modelName: "金豪 Jinhao 313",
    focus:
      "Jinhao 313 identity, steel nib, cartridge or converter claims, 5-15 price range, student-use context, and quality-control comments",
    storyId: "story-model-jinhao-313-research",
    storyTitle: "把 Jinhao 313 做成极低价入门样本",
    storySummary:
      "Jinhao 313 先作为 5-15 元低价入门研究页，钢尖、墨囊和学生场景需要核验。",
    storyBodyMd:
      "Jinhao 313 的价值在于极低价格带：它不是靠复杂材料或历史故事进入图书馆，而是代表了现代中国平价钢笔的分发方式和入门门槛。\n\n当前档案先记录待核验规格。后续更重要的是找到真实销售来源和用户样本，确认这个价位下的做工、品控和适用场景。",
  }),
  makeSearchOnlyModel({
    slug: "金豪-jinhao-619",
    brandSlug: "jinhao",
    aliases: [
      { alias: "Jinhao 619", language: "en" },
      { alias: "Jinhao 619 fountain pen", language: "en" },
      { alias: "金豪 619", language: "zh" },
    ],
    sourceItemId: "source-jinhao-619-public-search",
    specId: "spec-jinhao-619-research",
    seriesName: "Jinhao 619",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "笔身材质待核验",
    priceRange: "1688 批发 3 元说法待核验",
    claimId: "claim-jinhao-619-source-boundary",
    modelName: "金豪 Jinhao 619",
    focus:
      "Jinhao 619 identity, wholesale or classroom-bulk-buying claims, nib, filling system, low-price distribution, and student-use comments",
    storyId: "story-model-jinhao-619-research",
    storyTitle: "把 Jinhao 619 的团购神器说法放进证据边界",
    storySummary:
      "Jinhao 619 先作为批发/班级团购研究页，3 元价格、渠道和学生使用场景都需要来源。",
    storyBodyMd:
      "“班级团购神器”这种说法非常像真实使用场景，但也最容易变成没有证据的口号。图书馆可以保留这个入口，但必须让价格、渠道、质量和适用对象分别找到来源。\n\n当前档案先把 Jinhao 619 放入平价分发路径。后续如果能找到 1688、零售或学校采购相关证据，再补成一个很有意思的低价钢笔案例。",
  }),
  makeSearchOnlyModel({
    slug: "金豪-jinhao-75",
    brandSlug: "jinhao",
    aliases: [
      { alias: "Jinhao 75", language: "en" },
      { alias: "Jinhao 75 fountain pen", language: "en" },
      { alias: "金豪 75", language: "zh" },
    ],
    sourceItemId: "source-jinhao-75-public-search",
    specId: "spec-jinhao-75-research",
    seriesName: "Jinhao 75",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊说法待核验",
    material: "笔身材质待核验",
    priceRange: "10-30 元说法待核验",
    claimId: "claim-jinhao-75-source-boundary",
    modelName: "金豪 Jinhao 75",
    focus:
      "Jinhao 75 identity, steel nib, cartridge/converter claims, 10-30 price range, finish variants, and beginner-use positioning",
    storyId: "story-model-jinhao-75-research",
    storyTitle: "把 Jinhao 75 作为 10-30 元日用入口核验",
    storySummary:
      "Jinhao 75 先作为 10-30 元日用入门研究页，钢尖、上墨和基础书写定位需要来源。",
    storyBodyMd:
      "Jinhao 75 这类型号的图书馆价值在于建立“低价日用笔”的真实边界：哪些是产品规格，哪些是渠道价格，哪些是用户对写感和品控的容忍度。\n\n当前档案先确认基本身份和规格。后续可以和 Jinhao 80、82、85 等一起形成金豪入门型号矩阵。",
  }),
  makeSearchOnlyModel({
    slug: "金豪-jinhao-80",
    brandSlug: "jinhao",
    aliases: [
      { alias: "Jinhao 80", language: "en" },
      { alias: "Jinhao 80 fountain pen", language: "en" },
      { alias: "金豪 80", language: "zh" },
    ],
    sourceItemId: "source-jinhao-80-public-search",
    specId: "spec-jinhao-80-research",
    seriesName: "Jinhao 80",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "笔身材质待核验",
    priceRange: "20-40 元说法待核验",
    claimId: "claim-jinhao-80-source-boundary",
    modelName: "金豪 Jinhao 80",
    focus:
      "Jinhao 80 identity, steel nib, cartridge/converter claims, slim writing use, LAMY 2000-style discussion if present, and value claims",
    storyId: "story-model-jinhao-80-research",
    storyTitle: "把 Jinhao 80 的细尖日用和外观讨论分开",
    storySummary:
      "Jinhao 80 先作为 20-40 元日用研究页，细尖、小字场景和外观讨论需要来源边界。",
    storyBodyMd:
      "Jinhao 80 常被拿来聊细尖、小字和低价日用，也可能伴随外观相似性的讨论。图书馆不能把这些混成一句推荐语，而要分开处理。\n\n当前档案先确认型号、笔尖、上墨方式和价格带。后续再补评测来源来承载“小字场景”和外观语境。",
  }),
  makeSearchOnlyModel({
    slug: "金豪-jinhao-82",
    brandSlug: "jinhao",
    aliases: [
      { alias: "Jinhao 82", language: "en" },
      { alias: "Jinhao 82 fountain pen", language: "en" },
      { alias: "金豪 82", language: "zh" },
    ],
    sourceItemId: "source-jinhao-82-public-search",
    specId: "spec-jinhao-82-research",
    seriesName: "Jinhao 82",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "彩色树脂/塑料版本待核验",
    priceRange: "30 元左右说法待核验",
    claimId: "claim-jinhao-82-source-boundary",
    modelName: "金豪 Jinhao 82",
    focus:
      "Jinhao 82 identity, color options, low-price pocket-pen or toy-pen comments, cartridge/converter claims, and stationery-community popularity",
    storyId: "story-model-jinhao-82-research",
    storyTitle: "把 Jinhao 82 当作手帐配色和低价玩具笔核验",
    storySummary:
      "Jinhao 82 先作为彩色低价研究页，手帐配墨、热门监控和玩具笔说法都需要归因。",
    storyBodyMd:
      "Jinhao 82 很适合做图书馆里的“颜色和社群传播”样本：用户可能不是只为写感购买，而是为了颜色、搭墨和可玩性。原始摘要里的“30 块当玩具买”就是这种心理。\n\n当前档案先确认产品身份、配色、上墨方式和价格。后续再用社区资料写手帐党、热门榜和不同墨水搭配。",
  }),
  makeSearchOnlyModel({
    slug: "金豪-jinhao-85",
    brandSlug: "jinhao",
    aliases: [
      { alias: "Jinhao 85", language: "en" },
      { alias: "Jinhao 85 fountain pen", language: "en" },
      { alias: "金豪 85", language: "zh" },
    ],
    sourceItemId: "source-jinhao-85-public-search",
    specId: "spec-jinhao-85-research",
    seriesName: "Jinhao 85",
    originCountry: "中国（待核验）",
    nib: "暗尖/钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "笔身材质待核验",
    priceRange: "20-40 元说法待核验",
    claimId: "claim-jinhao-85-source-boundary",
    modelName: "金豪 Jinhao 85",
    focus:
      "Jinhao 85 identity, hooded-nib or Parker 51-style discussion, steel nib, cartridge/converter claims, and low-price daily-use comments",
    storyId: "story-model-jinhao-85-research",
    storyTitle: "把 Jinhao 85 的暗尖日用和外观源流分开核验",
    storySummary:
      "Jinhao 85 先作为暗尖/低价日用研究页，Parker 51 式讨论、规格和价格都需要来源。",
    storyBodyMd:
      "Jinhao 85 如果涉及暗尖或 Parker 51 式外观讨论，就不能只写成“像某经典”。图书馆要把可观察的结构、产品规格和外观借鉴评价分开。\n\n当前档案先确认型号事实、笔尖和上墨方式。后续可以与 Hero 616、Wing Sung 601 等暗尖/复古语境页面建立对照。",
  }),
  makeSearchOnlyModel({
    slug: "金豪-jinhao-86",
    brandSlug: "jinhao",
    aliases: [
      { alias: "Jinhao 86", language: "en" },
      { alias: "Jinhao 86 fountain pen", language: "en" },
      { alias: "金豪 86", language: "zh" },
    ],
    sourceItemId: "source-jinhao-86-public-search",
    specId: "spec-jinhao-86-research",
    seriesName: "Jinhao 86",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "笔身材质待核验",
    priceRange: "20-40 元说法待核验",
    claimId: "claim-jinhao-86-source-boundary",
    modelName: "金豪 Jinhao 86",
    focus:
      "Jinhao 86 identity, steel nib, cartridge/converter claims, low-price daily-writing positioning, finish variants, and quality-control comments",
    storyId: "story-model-jinhao-86-research",
    storyTitle: "把 Jinhao 86 先放进平价日写矩阵",
    storySummary:
      "Jinhao 86 先作为 20-40 元日写研究页，规格、饰面和品控评价需要来源。",
    storyBodyMd:
      "Jinhao 86 暂时没有足够叙事信息，适合先作为金豪平价矩阵里的待核验占位。它的图书馆价值来自和 75、80、82、85、9035 等型号的横向比较。\n\n当前档案先确认产品身份、基本规格和价格带。后续再根据来源决定它是否需要独立展柜，还是作为金豪入门型号表的一行。",
  }),
  makeSearchOnlyModel({
    slug: "金豪-jinhao-9035",
    brandSlug: "jinhao",
    aliases: [
      { alias: "Jinhao 9035", language: "en" },
      { alias: "Jinhao 9035 fountain pen", language: "en" },
      { alias: "金豪 9035", language: "zh" },
    ],
    sourceItemId: "source-jinhao-9035-public-search",
    specId: "spec-jinhao-9035-research",
    seriesName: "Jinhao 9035",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "笔身材质/木杆说法待核验",
    priceRange: "20-40 元说法待核验",
    claimId: "claim-jinhao-9035-source-boundary",
    modelName: "金豪 Jinhao 9035",
    focus:
      "Jinhao 9035 identity, steel nib, cartridge/converter claims, wooden or material variants if present, price, and daily-writing comments",
    storyId: "story-model-jinhao-9035-research",
    storyTitle: "把 Jinhao 9035 作为材质和日写待核验页",
    storySummary:
      "Jinhao 9035 先作为平价日写研究页，材质版本、规格和价格带需要来源确认。",
    storyBodyMd:
      "Jinhao 9035 的当前信息较薄，不能直接写出明确定位。它先作为一个平价日写型号进入研究队列，重点是确认材质、笔尖、上墨方式和是否存在木杆或其他变体。\n\n后续如果来源显示它与 9056 木杆或其他材质型号有关，可以把它并入金豪材质型低价展柜。",
  }),
  makeSearchOnlyModel({
    slug: "金豪-jinhao-9056木杆",
    brandSlug: "jinhao",
    aliases: [
      { alias: "Jinhao 9056", language: "en" },
      { alias: "Jinhao 9056 wood barrel", language: "en" },
      { alias: "金豪 9056 木杆", language: "zh" },
    ],
    sourceItemId: "source-jinhao-9056-wood-public-search",
    specId: "spec-jinhao-9056-wood-research",
    seriesName: "Jinhao 9056 wood barrel",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "实木笔杆说法待核验",
    priceRange: "低价木杆说法待核验",
    claimId: "claim-jinhao-9056-wood-source-boundary",
    modelName: "金豪 Jinhao 9056 木杆",
    focus:
      "Jinhao 9056 wood-barrel identity, wooden body claims, nib, cartridge/converter filling, price, finish variants, and material-value comments",
    storyId: "story-model-jinhao-9056-wood-research",
    storyTitle: "把 Jinhao 9056 木杆做成低价材质实验页",
    storySummary:
      "Jinhao 9056 木杆先作为低价实木笔杆研究页，木材、价格、规格和材质价值判断都需要来源。",
    storyBodyMd:
      "9056 木杆的原始摘要抓住了一个有意思的点：在很低价格里提供实木笔杆。图书馆可以把它作为“平价材质实验”来写，但必须先确认木材、结构、笔尖和实际价格。\n\n当前档案先建立待核验边界。后续如果来源充足，可以与 Faber-Castell Ondoro、Ambition 和 Jinhao 9035 做一条从低价到中高端的材质路线。",
  }),
  makeSearchOnlyModel({
    slug: "金豪-jinhao-911",
    brandSlug: "jinhao",
    aliases: [
      { alias: "Jinhao 911", language: "en" },
      { alias: "Jinhao 911 fountain pen", language: "en" },
      { alias: "金豪 911", language: "zh" },
    ],
    sourceItemId: "source-jinhao-911-public-search",
    specId: "spec-jinhao-911-research",
    seriesName: "Jinhao 911",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "笔身材质待核验",
    priceRange: "10-30 元说法待核验",
    claimId: "claim-jinhao-911-source-boundary",
    modelName: "金豪 Jinhao 911",
    focus:
      "Jinhao 911 identity, steel nib, cartridge/converter claims, 10-30 price range, daily-writing positioning, and quality-control comments",
    storyId: "story-model-jinhao-911-research",
    storyTitle: "把 Jinhao 911 放进低价日用钢笔矩阵",
    storySummary:
      "Jinhao 911 先作为 10-30 元日用研究页，钢尖、上墨方式和品控评价都需要来源。",
    storyBodyMd:
      "Jinhao 911 的当前摘要只有基本规格和价格带。图书馆先把它作为金豪低价日写矩阵的一员，而不是硬写成推荐结论。\n\n后续要用产品页、渠道页或评测来源确认笔尖、上墨方式、材质和常见问题，再决定它和 75、80、85、86 的差异在哪里。",
  }),
  makeSearchOnlyModel({
    slug: "金豪-jinhao-992",
    brandSlug: "jinhao",
    aliases: [
      { alias: "Jinhao 992", language: "en" },
      { alias: "Jinhao 992 fountain pen", language: "en" },
      { alias: "金豪 992", language: "zh" },
    ],
    sourceItemId: "source-jinhao-992-public-search",
    specId: "spec-jinhao-992-research",
    seriesName: "Jinhao 992",
    originCountry: "中国（待核验）",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "透明/彩色塑料说法待核验",
    priceRange: "3 元可用钢笔说法待核验",
    claimId: "claim-jinhao-992-source-boundary",
    modelName: "金豪 Jinhao 992",
    focus:
      "Jinhao 992 identity, extremely low-price usable-pen claims, plastic cracking discussion, nib, cartridge/converter filling, and beginner-use comments",
    storyId: "story-model-jinhao-992-research",
    storyTitle: "把 Jinhao 992 的三块钱可用神话放进来源边界",
    storySummary:
      "Jinhao 992 先作为极低价可用钢笔研究页，价格、透明塑料、耐用性和品控说法都需要来源。",
    storyBodyMd:
      "“三块钱能买什么？一支能用的钢笔”是强烈的玩家叙事，适合作为图书馆入口，但不能直接当事实。它需要价格来源，也需要样本证明“能用”的边界。\n\n当前档案先确认型号、材质、笔尖和上墨方式。后续要特别注意透明塑料、开裂、品控等长期使用反馈。",
  }),
  makeSearchOnlyModel({
    slug: "金豪-jinhao-x159-159",
    brandSlug: "jinhao",
    aliases: [
      { alias: "Jinhao X159", language: "en" },
      { alias: "Jinhao 159", language: "en" },
      { alias: "金豪 X159 / 159", language: "zh" },
    ],
    sourceItemId: "source-jinhao-x159-159-public-search",
    specId: "spec-jinhao-x159-159-research",
    seriesName: "X159 / 159",
    originCountry: "中国（待核验）",
    nib: "大尺寸钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "树脂/金属版本差异待核验",
    priceRange: "海外低价爆款说法待核验",
    claimId: "claim-jinhao-x159-159-source-boundary",
    modelName: "金豪 Jinhao X159 / 159",
    focus:
      "Jinhao X159/159 identity, large-body positioning, overseas popularity, nib sizes, cartridge/converter filling, and Montblanc 149 comparison claims",
    storyId: "story-model-jinhao-x159-159-research",
    storyTitle: "把 Jinhao X159/159 的海外爆款和大笔身对比分开写",
    storySummary:
      "Jinhao X159/159 先作为海外热门大尺寸研究页，型号差异、大明尖和 149 对比都需要来源。",
    storyBodyMd:
      "X159/159 很容易被写成“低价大笔身替代品”，但图书馆需要先分清 X159 和 159 的材质、重量、笔尖和版本。海外热度也要靠评测与社区证据支撑。\n\n当前档案先建立大尺寸低价笔的研究入口。后续如果来源充分，可和 Montblanc 149、Jinhao Century、Moonman/Majohn 大笔身型号做一张对照路径。",
  }),
  makeSearchOnlyModel({
    slug: "金豪-jinhao-世纪-century",
    brandSlug: "jinhao",
    aliases: [
      { alias: "Jinhao Century", language: "en" },
      { alias: "Jinhao 100", language: "en" },
      { alias: "金豪 世纪 / Century", language: "zh" },
    ],
    sourceItemId: "source-jinhao-century-public-search",
    specId: "spec-jinhao-century-research",
    seriesName: "Century / 100",
    originCountry: "中国（待核验）",
    nib: "大明尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "树脂/透明镂空版本待核验",
    priceRange: "79 元/78 元版本说法待核验",
    claimId: "claim-jinhao-century-source-boundary",
    modelName: "金豪 Jinhao 世纪 / Century",
    focus:
      "Jinhao Century/Jinhao 100 identity, flagship reputation, large nib claims, demonstrator or hollow variants, price, and filling system",
    storyId: "story-model-jinhao-century-research",
    storyTitle: "把 Jinhao 世纪当作金豪王牌和版本树来核验",
    storySummary:
      "Jinhao 世纪/Century 先作为金豪王牌研究页，大明尖、79 元价格和透明镂空版本都需要来源。",
    storyBodyMd:
      "世纪/Century 是金豪页里最像“主轴型号”的一条：它关联大明尖、透明镂空、低价和王牌口碑。图书馆不能把这些全写成一个结论，而要做成版本树。\n\n当前档案先确认 Jinhao 100/Century 命名、笔尖、上墨方式、常见版本和价格区间。后续可以扩成金豪代表型号展柜。",
  }),
  makeSearchOnlyModel({
    slug: "金豪-jinhao-纯银镂空世纪",
    brandSlug: "jinhao",
    aliases: [
      { alias: "Jinhao silver hollow Century", language: "en" },
      { alias: "Jinhao Century silver hollow", language: "en" },
      { alias: "金豪 纯银镂空世纪", language: "zh" },
    ],
    sourceItemId: "source-jinhao-silver-hollow-century-public-search",
    specId: "spec-jinhao-silver-hollow-century-research",
    seriesName: "Century silver hollow variant",
    originCountry: "中国（待核验）",
    nib: "钢尖/大明尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "银饰元素/镂空结构说法待核验",
    priceRange: "不到 100 元说法待核验",
    claimId: "claim-jinhao-silver-hollow-century-source-boundary",
    modelName: "金豪 Jinhao 纯银镂空世纪",
    focus:
      "Jinhao silver hollow Century identity, silver-decoration claims, demonstrator body, nib, filling system, sub-100 price claims, and material-value comments",
    storyId: "story-model-jinhao-silver-hollow-century-research",
    storyTitle: "把纯银镂空世纪先作为世纪变体核验",
    storySummary:
      "金豪纯银镂空世纪先作为 Century 变体研究页，银饰元素、镂空结构和不到 100 元的说法都要来源。",
    storyBodyMd:
      "“纯银镂空世纪”听起来很有卖点，也很容易在材质上产生误读。图书馆需要谨慎确认所谓银饰元素、镂空结构、透明可视墨量和实际价格。\n\n当前档案先把它作为 Century 变体，而不是独立历史主线。后续拿到来源后，再决定是否进入材质/版本展柜。",
  }),
  makeSearchOnlyModel({
    slug: "高仕-cross-佰利轻盈",
    brandSlug: "cross",
    aliases: [
      { alias: "Cross Bailey Light", language: "en" },
      { alias: "Cross Bailey Light fountain pen", language: "en" },
      { alias: "高仕 佰利轻盈", language: "zh" },
    ],
    sourceItemId: "source-cross-bailey-light-public-search",
    specId: "spec-cross-bailey-light-research",
    seriesName: "Bailey Light",
    originCountry: "待核验",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "轻量笔身材质待核验",
    priceRange: "91 元说法待核验",
    claimId: "claim-cross-bailey-light-source-boundary",
    modelName: "高仕 Cross Bailey Light",
    focus:
      "Cross Bailey Light identity, brand-positioning, steel nib, cartridge/converter filling, light body, price, and build-quality comments",
    storyId: "story-model-cross-bailey-light-research",
    storyTitle: "把 Cross Bailey Light 的品牌溢价和做工评价分开核验",
    storySummary:
      "Cross Bailey Light 先作为国际品牌入门研究页，91 元价格、轻量笔身和做工对比需要来源。",
    storyBodyMd:
      "Bailey Light 的原始摘要把品牌溢价和做工对比放在一起，这正是图书馆需要拆开的地方：Cross 作为品牌的价值、具体型号的材料和写感、以及和国产低价笔的做工比较，都需要不同来源。\n\n当前档案先确认型号、笔尖、上墨方式和轻量材料。后续再补渠道价格与用户评测。",
  }),
  makeSearchOnlyModel({
    slug: "高仕-cross-莎士比亚",
    brandSlug: "cross",
    aliases: [
      { alias: "Cross Shakespeare", language: "en" },
      { alias: "Cross Shakespeare fountain pen", language: "en" },
      { alias: "高仕 莎士比亚", language: "zh" },
    ],
    sourceItemId: "source-cross-shakespeare-public-search",
    specId: "spec-cross-shakespeare-research",
    seriesName: "Shakespeare identity pending",
    originCountry: "待核验",
    nib: "钢尖说法待核验",
    fillSystem: "墨囊/上墨器说法待核验",
    material: "笔身材质待核验",
    priceRange: "130-180 元说法待核验",
    claimId: "claim-cross-shakespeare-source-boundary",
    modelName: "高仕 Cross 莎士比亚",
    focus:
      "Cross Shakespeare identity, whether it is a stable Cross fountain-pen model or local naming, price, nib, filling system, and entry-international-brand claims",
    storyId: "story-model-cross-shakespeare-research",
    storyTitle: "先确认 Cross 莎士比亚是不是稳定型号名",
    storySummary:
      "Cross 莎士比亚先作为命名待核验页，国际品牌最低门槛、价格和型号身份需要来源。",
    storyBodyMd:
      "“莎士比亚”可能是系列名、礼盒名、地区销售名或用户俗称。图书馆不能直接把它当作稳定官方型号，需要先确认英文名和产品身份。\n\n当前档案保留待核验边界。后续找到官方页、零售页或可靠评测后，再写它是否真的代表 Cross 国际品牌的低门槛入口。",
  }),
  makeSearchOnlyModel({
    slug: "kimberly-the-pen-that-saved-eversharp",
    brandSlug: "eversharp",
    aliases: [
      { alias: "Eversharp Kimberly", language: "en" },
      { alias: "Kimberly Pockette", language: "en" },
      { alias: "Eversharp Kimberly 拯救 Eversharp 的钢笔", language: "zh" },
    ],
    sourceItemId: "source-richardspens-83d8fe9b3679726e",
    specId: "spec-eversharp-kimberly-research",
    seriesName: "Kimberly",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "上墨方式待核验",
    material: "笔身材质/尺寸版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-eversharp-kimberly-source-boundary",
    modelName: "Eversharp Kimberly",
    focus:
      "Kimberly identity, Eversharp business context, Pockette advertising, filling system, nib, material, timeline, and collector claims",
    storyId: "story-model-eversharp-kimberly-research",
    storyTitle: "把 Kimberly 从长文标题整理成 Eversharp 型号档案",
    storySummary:
      "Eversharp Kimberly 先作为 Richard's Pens 支撑的历史型号页，商业背景、广告图和具体规格仍需逐项复核。",
    storyBodyMd:
      "Kimberly 不是普通的空白型号，它已经有 Richard's Pens profile 作为入口。图书馆应该把长文标题里的“拯救 Eversharp”拆成型号身份、商业背景、广告证据和实际规格。\n\n当前档案先绑定 Richard's Pens 来源，并保留规格待核验。后续可把它放进 Eversharp 战后商业转向或口袋笔展柜。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Product facts and images still require editorial review before publication.",
  }),
  makeSearchOnlyModel({
    slug: "moore-s-non-leakable-fountain-pen",
    brandSlug: "moore",
    aliases: [
      { alias: "Moore's Non-Leakable Fountain Pen", language: "en" },
      { alias: "Moore Non-Leakable", language: "en" },
      { alias: "Moore 防漏钢笔", language: "zh" },
    ],
    sourceItemId: "source-richardspens-b19172d68db6cc4d",
    specId: "spec-moore-non-leakable-research",
    seriesName: "Non-Leakable",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "防漏/上墨结构待核验",
    material: "硬橡胶/材质版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-moore-non-leakable-source-boundary",
    modelName: "Moore's Non-Leakable Fountain Pen",
    focus:
      "Moore Non-Leakable identity, anti-leak design, repair/profile distinction, filling system, nib, material, advertising, and historical timeline",
    storyId: "story-model-moore-non-leakable-research",
    storyTitle: "把 Moore Non-Leakable 的防漏结构和文章来源拆清楚",
    storySummary:
      "Moore Non-Leakable 先作为早期防漏历史型号页，Richard's Pens profile 是入口，结构细节和维修资料需要分层引用。",
    storyBodyMd:
      "Moore Non-Leakable 的页面已经有 Richard's Pens 长文资料，但当前站内摘要混着正文、图片和链接。图书馆需要把它变成可扫描的型号档案：先说明它为何叫 Non-Leakable，再分开列结构、年代、广告和维修资料。\n\n当前档案绑定 profile 来源，暂不把维修页内容并入产品事实。后续可以补一张防漏结构 SVG，而不是继续依赖长文截图。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source; repair-page details should remain separate unless explicitly cited.",
  }),
  makeSearchOnlyModel({
    slug: "morrison-s-patriot",
    brandSlug: "morrison",
    aliases: [
      { alias: "Morrison's Patriot", language: "en" },
      { alias: "Morrison Patriot", language: "en" },
      { alias: "Morrison Patriot 爱国者", language: "zh" },
    ],
    sourceItemId: "source-richardspens-0fa236b38a59782d",
    specId: "spec-morrison-patriot-research",
    seriesName: "Patriot",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "上墨方式待核验",
    material: "战时材料/饰件待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-morrison-patriot-source-boundary",
    modelName: "Morrison's Patriot",
    focus:
      "Morrison Patriot identity, World War II patriotic marketing, wartime material constraints, filling system, nib, advertising, and collector claims",
    storyId: "story-model-morrison-patriot-research",
    storyTitle: "把 Morrison Patriot 做成战时爱国营销型号档案",
    storySummary:
      "Morrison Patriot 先作为 Richard's Pens 支撑的战时型号页，爱国营销、材料和规格需要继续复核。",
    storyBodyMd:
      "Patriot 的价值不只是型号参数，而是战时语境：爱国营销、材料约束、广告图像和实物规格共同构成这支笔的意义。Richard's Pens 已经提供了一个强入口。\n\n当前档案先把长文压缩成型号馆可读结构。后续可补时间线节点和展览段落，把它放进“战时美国钢笔”展柜。",
    sourceNotes:
      "Richard's Pens profile is registered and approved locally for Morrison context; keep summary/link-only boundaries and review images separately.",
  }),
  makeSearchOnlyModel({
    slug: "sheaffer-s-balance",
    brandSlug: "sheaffer",
    aliases: [
      { alias: "Sheaffer's Balance", language: "en" },
      { alias: "Sheaffer Balance", language: "en" },
      { alias: "犀飞利 Balance 平衡", language: "zh" },
    ],
    sourceItemId: "source-richardspens-38e4e4f83ba9b417",
    specId: "spec-sheaffer-balance-research",
    seriesName: "Balance",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "lever/vacuum 等版本待核验",
    material: "赛璐珞/尺寸版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-sheaffer-balance-source-boundary",
    modelName: "Sheaffer's Balance",
    focus:
      "Sheaffer Balance identity, streamlined shape, 1929 advertising context, filling-system variants, nib, material, sizes, and collector claims",
    storyId: "story-model-sheaffer-balance-research",
    storyTitle: "把 Sheaffer Balance 的流线型地位整理成型号档案",
    storySummary:
      "Sheaffer Balance 先作为 Richard's Pens 支撑的经典型号页，流线型外观、版本和上墨差异需要逐项复核。",
    storyBodyMd:
      "Balance 是 Sheaffer 历史里很适合做“设计转向”展柜的型号。当前站内摘要已经含 Richard's Pens 和广告图线索，但需要从长文形态转成型号档案。\n\n当前档案先绑定 profile 来源，保留尺寸、材料、上墨和笔尖待核验。后续可以把 Balance 放进美国工业设计和流线型钢笔路径。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Treat images and exact specifications as review-gated.",
  }),
  makeSearchOnlyModel({
    slug: "sheaffer-s-connaisseur",
    brandSlug: "sheaffer",
    aliases: [
      { alias: "Sheaffer's Connaisseur", language: "en" },
      { alias: "Sheaffer Connaisseur", language: "en" },
      { alias: "犀飞利 Connaisseur", language: "zh" },
    ],
    sourceItemId: "source-richardspens-72c187875d5cf754",
    specId: "spec-sheaffer-connaisseur-research",
    seriesName: "Connaisseur",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "上墨方式待核验",
    material: "笔身材质/版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-sheaffer-connaisseur-source-boundary",
    modelName: "Sheaffer's Connaisseur",
    focus:
      "Sheaffer Connaisseur identity, modern/classic revival context, nib, filling system, material, variants, and collector reputation",
    storyId: "story-model-sheaffer-connaisseur-research",
    storyTitle: "把 Sheaffer Connaisseur 从长文索引变成型号馆页",
    storySummary:
      "Sheaffer Connaisseur 先作为 Richard's Pens 支撑的型号研究页，版本、材料、笔尖和收藏评价都需要继续复核。",
    storyBodyMd:
      "Connaisseur 的当前摘要混入了长文链接和参考资料索引，用户进入详情页会觉得像文章残片。图书馆应该先把它恢复成型号页：是什么、属于 Sheaffer 哪个阶段、有哪些版本、为什么值得收藏。\n\n当前档案先绑定 Richard's Pens profile，并把规格全部放在待核验层。后续再补版本表和时间线。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Exact variants and specifications require editorial review.",
  }),
  makeSearchOnlyModel({
    slug: "sheaffer-s-craftsman",
    brandSlug: "sheaffer",
    aliases: [
      { alias: "Sheaffer's Craftsman", language: "en" },
      { alias: "Sheaffer Craftsman", language: "en" },
      { alias: "犀飞利 Craftsman", language: "zh" },
    ],
    sourceItemId: "source-richardspens-1e786f87b763c11c",
    specId: "spec-sheaffer-craftsman-research",
    seriesName: "Craftsman",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "上墨方式待核验",
    material: "笔身材质/尺寸版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-sheaffer-craftsman-source-boundary",
    modelName: "Sheaffer's Craftsman",
    focus:
      "Sheaffer Craftsman identity, market position, advertising context, nib, filling system, material, size variants, and collector claims",
    storyId: "story-model-sheaffer-craftsman-research",
    storyTitle: "把 Sheaffer Craftsman 从广告长文整理成型号档案",
    storySummary:
      "Sheaffer Craftsman 先作为 Richard's Pens 支撑的历史型号页，广告语境、规格和版本仍需复核。",
    storyBodyMd:
      "Craftsman 当前像一段长文摘录，用户很难快速看出它是什么型号、在 Sheaffer 产品线里处于什么位置。图书馆先把它整理成型号页：身份、年代、广告、上墨、笔尖和材料各自留出位置。\n\n当前档案绑定 Richard's Pens profile，规格仍保持待核验。后续可和 Balance、Tuckaway、Touchdown TM 一起整理 Sheaffer 中低端和便携线索。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Advertising images and exact specifications require editorial review.",
  }),
  makeSearchOnlyModel({
    slug: "sheaffer-s-pfm",
    brandSlug: "sheaffer",
    aliases: [
      { alias: "Sheaffer's PFM", language: "en" },
      { alias: "Sheaffer PFM", language: "en" },
      { alias: "犀飞利 PFM", language: "zh" },
    ],
    sourceItemId: "source-richardspens-e7ab7c545f24715b",
    specId: "spec-sheaffer-pfm-research",
    seriesName: "PFM",
    originCountry: "美国（待核验）",
    nib: "嵌入式笔尖/规格待核验",
    fillSystem: "Snorkel/PFM 上墨系统待核验",
    material: "笔身材质/尺寸版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-sheaffer-pfm-source-boundary",
    modelName: "Sheaffer's PFM",
    focus:
      "Sheaffer PFM identity, Snorkel/PFM filling system, inlaid nib, model variants, advertising context, material, and collector reputation",
    storyId: "story-model-sheaffer-pfm-research",
    storyTitle: "把 Sheaffer PFM 做成大尺寸机制旗舰档案",
    storySummary:
      "Sheaffer PFM 先作为 Richard's Pens 支撑的机制型历史档案，Snorkel/PFM 系统、嵌入式笔尖和版本需要复核。",
    storyBodyMd:
      "PFM 适合从机制和身份两条线来读：它不是普通外观型号，而是把 Sheaffer 的复杂上墨系统、嵌入式笔尖和大尺寸市场定位放在一起。当前摘要还停留在长文片段状态。\n\n当前档案绑定 Richard's Pens profile，暂不把维修页内容混入产品事实。后续应补一张 Snorkel/PFM 机制示意图，让用户不用读完整维修文章也能理解它为什么特殊。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Repair/anatomy pages should stay separate unless explicitly cited.",
  }),
  makeSearchOnlyModel({
    slug: "sheaffer-s-snorkel",
    brandSlug: "sheaffer",
    aliases: [
      { alias: "Sheaffer's Snorkel", language: "en" },
      { alias: "Sheaffer Snorkel", language: "en" },
      { alias: "犀飞利 Snorkel 潜艇", language: "zh" },
    ],
    sourceItemId: "source-richardspens-a17645fa0ce2db51",
    specId: "spec-sheaffer-snorkel-research",
    seriesName: "Snorkel",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "Snorkel 伸缩吸墨管机制待核验",
    material: "笔身材质/型号层级待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-sheaffer-snorkel-source-boundary",
    modelName: "Sheaffer's Snorkel",
    focus:
      "Sheaffer Snorkel identity, extending snorkel filling tube, model hierarchy, nib, material, advertising, and repair/anatomy distinctions",
    storyId: "story-model-sheaffer-snorkel-research",
    storyTitle: "把 Sheaffer Snorkel 从潜艇长文变成机制档案",
    storySummary:
      "Sheaffer Snorkel 先作为 Richard's Pens 支撑的机制型号页，伸缩吸墨管、型号层级和广告语境需要复核。",
    storyBodyMd:
      "Snorkel 是图书馆里最应该图示化的机制之一：用户需要理解的不是一句“潜艇钢笔”，而是伸缩吸墨管如何把吸墨过程和笔尖分开。当前站内内容混有广告图和长文正文。\n\n当前档案先建立型号页结构，绑定 Richard's Pens profile。后续可把 anatomy 与 repair 页面作为机制图来源，而不是把它们混进普通故事段落。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Anatomy and repair details require separate citations.",
  }),
  makeSearchOnlyModel({
    slug: "sheaffer-s-touchdown-tm",
    brandSlug: "sheaffer",
    aliases: [
      { alias: "Sheaffer's Touchdown TM", language: "en" },
      { alias: "Sheaffer Touchdown TM", language: "en" },
      { alias: "犀飞利 Touchdown TM", language: "zh" },
    ],
    sourceItemId: "source-richardspens-0e8fee44221226f1",
    specId: "spec-sheaffer-touchdown-tm-research",
    seriesName: "Touchdown TM",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "Touchdown 气压式上墨机制待核验",
    material: "笔身材质/尺寸版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-sheaffer-touchdown-tm-source-boundary",
    modelName: "Sheaffer's Touchdown TM",
    focus:
      "Sheaffer Touchdown TM identity, Touchdown filling mechanism, TM size/version boundary, nib, material, advertising, and collector claims",
    storyId: "story-model-sheaffer-touchdown-tm-research",
    storyTitle: "把 Sheaffer Touchdown TM 的尺寸和机制边界拆开",
    storySummary:
      "Sheaffer Touchdown TM 先作为 Richard's Pens 支撑的机制型号页，TM 命名、Touchdown 上墨和版本差异需要复核。",
    storyBodyMd:
      "Touchdown TM 的难点在于名字：它既涉及 Touchdown 上墨机制，也涉及 TM 尺寸/版本边界。图书馆应避免把机制名、尺寸名和具体型号混成一团。\n\n当前档案先绑定 Richard's Pens profile，把机制、尺寸、材料、笔尖和广告证据分开留位。后续可与 Snorkel、PFM 组成 Sheaffer 机制演化路径。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Exact TM boundary and mechanism details require editorial review.",
  }),
  makeSearchOnlyModel({
    slug: "sheaffer-s-tuckaway",
    brandSlug: "sheaffer",
    aliases: [
      { alias: "Sheaffer's Tuckaway", language: "en" },
      { alias: "Sheaffer Tuckaway", language: "en" },
      { alias: "犀飞利 Tuckaway", language: "zh" },
    ],
    sourceItemId: "source-richardspens-3ff2917e3e7f3486",
    specId: "spec-sheaffer-tuckaway-research",
    seriesName: "Tuckaway",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "上墨方式/版本差异待核验",
    material: "短笔身/材质版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-sheaffer-tuckaway-source-boundary",
    modelName: "Sheaffer's Tuckaway",
    focus:
      "Sheaffer Tuckaway identity, compact size, wartime/postwar positioning, nib, filling system variants, material, advertising, and collector claims",
    storyId: "story-model-sheaffer-tuckaway-research",
    storyTitle: "把 Sheaffer Tuckaway 做成短钢笔和便携线索页",
    storySummary:
      "Sheaffer Tuckaway 先作为 Richard's Pens 支撑的短钢笔档案，便携尺寸、版本和上墨差异仍需复核。",
    storyBodyMd:
      "Tuckaway 的核心是便携性：它不是普通 Sheaffer 型号缩小，而是把短笔身、口袋携带和时代审美放在一起。当前长文残片很难让用户看到这条线。\n\n当前档案先建立短钢笔型号页，绑定 Richard's Pens profile。后续可以和 Pilot Elite 95S、Kaweco Sport 等便携钢笔做跨时代对照。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Variant and filling-system details require review.",
  }),
  makeSearchOnlyModel({
    slug: "targa-by-sheaffer",
    brandSlug: "sheaffer",
    aliases: [
      { alias: "Sheaffer Targa", language: "en" },
      { alias: "Targa by Sheaffer", language: "en" },
      { alias: "犀飞利 Targa", language: "zh" },
    ],
    sourceItemId: "source-richardspens-de92366daaed09b2",
    specId: "spec-sheaffer-targa-research",
    seriesName: "Targa",
    originCountry: "美国（待核验）",
    nib: "嵌入式笔尖/规格待核验",
    fillSystem: "墨囊/上墨器或版本差异待核验",
    material: "饰面/尺寸版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-sheaffer-targa-source-boundary",
    modelName: "Sheaffer Targa",
    focus:
      "Sheaffer Targa identity, inlaid nib, cartridge/converter or variant filling, finish catalog, 1970s design context, and collector claims",
    storyId: "story-model-sheaffer-targa-research",
    storyTitle: "把 Sheaffer Targa 写成饰面目录和嵌入尖档案",
    storySummary:
      "Sheaffer Targa 先作为 Richard's Pens 支撑的现代经典页，嵌入式笔尖、饰面目录和上墨差异需要复核。",
    storyBodyMd:
      "Targa 的馆藏价值在于 1970s 设计、嵌入式笔尖和丰富饰面。它适合做版本目录，而不只是保留一段广告图长文。\n\n当前档案先把 Targa 从文章残片整理成型号档案。后续可补饰面表和时间线，把它放进 Sheaffer 从 Balance 到现代设计的路径里。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Finish catalog and exact specifications need separate review.",
  }),
  makeSearchOnlyModel({
    slug: "the-camel-pen",
    brandSlug: "camel",
    aliases: [
      { alias: "The Camel Pen", language: "en" },
      { alias: "Camel fountain pen", language: "en" },
      { alias: "骆驼钢笔", language: "zh" },
    ],
    sourceItemId: "source-richardspens-f226dc214a9ff573",
    specId: "spec-camel-pen-research",
    seriesName: "Camel Pen",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "上墨方式待核验",
    material: "笔身材质/广告版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-camel-pen-source-boundary",
    modelName: "The Camel Pen",
    focus:
      "Camel Pen identity, brand/manufacturer attribution, advertising context, filling system, nib, material, and collector claims",
    storyId: "story-model-camel-pen-research",
    storyTitle: "把 Camel Pen 先整理成无品牌归属的历史型号页",
    storySummary:
      "Camel Pen 先作为 Richard's Pens 支撑的历史型号页，品牌实体暂缺，制造商归属和规格需要复核。",
    storyBodyMd:
      "Camel Pen 当前没有对应品牌实体，只有 profile、repair 和 crypt 文章线索。图书馆先不冒充品牌归属，而是把它整理成无品牌归属的历史型号页。\n\n当前档案绑定 Richard's Pens profile，重点是确认制造商、广告、上墨方式和材料。后续来源足够时，再决定是否新增 Camel 品牌实体或并入某个历史厂牌。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Brand/manufacturer attribution is explicitly unverified.",
  }),
  makeSearchOnlyModel({
    slug: "the-chilton-chiltonian",
    brandSlug: "chilton",
    aliases: [
      { alias: "The Chilton Chiltonian", language: "en" },
      { alias: "Chilton Chiltonian", language: "en" },
      { alias: "奇尔顿 Chiltonian", language: "zh" },
    ],
    sourceItemId: "source-richardspens-d5b75a1cd3d6ce43",
    specId: "spec-chilton-chiltonian-research",
    seriesName: "Chiltonian",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "气压/泵式结构待核验",
    material: "笔身材质/后期版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-chilton-chiltonian-source-boundary",
    modelName: "The Chilton Chiltonian",
    focus:
      "Chiltonian identity, late Chilton company context, filling system, nib, material, timeline, and collector claims",
    storyId: "story-model-chilton-chiltonian-research",
    storyTitle: "把 Chiltonian 放进 Chilton 晚期公司迁移语境",
    storySummary:
      "Chiltonian 先作为 Richard's Pens 支撑的历史型号页，公司迁移、晚期定位和规格需要复核。",
    storyBodyMd:
      "Chiltonian 的摘要已经透露了公司迁移和晚期处境，这比单纯参数更重要。图书馆要把它放在 Chilton 从早期创新到后期变化的时间线里。\n\n当前档案绑定 Richard's Pens profile，并保留上墨、笔尖和材料待核验。后续可和 Golden Quill、Wing-flow 组成 Chilton 小型展柜。",
    sourceNotes:
      "Richard's Pens profile is registered and approved locally for Chiltonian context; exact specifications remain review-gated.",
  }),
  makeSearchOnlyModel({
    slug: "the-chilton-golden-quill",
    brandSlug: "chilton",
    aliases: [
      { alias: "The Chilton Golden Quill", language: "en" },
      { alias: "Chilton Golden Quill", language: "en" },
      { alias: "奇尔顿 Golden Quill 金羽", language: "zh" },
    ],
    sourceItemId: "source-richardspens-6455ad4904b18125",
    specId: "spec-chilton-golden-quill-research",
    seriesName: "Golden Quill",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "上墨方式待核验",
    material: "笔身材质/广告版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-chilton-golden-quill-source-boundary",
    modelName: "The Chilton Golden Quill",
    focus:
      "Chilton Golden Quill identity, 1930s advertising context, filling system, nib, material, model position, and collector claims",
    storyId: "story-model-chilton-golden-quill-research",
    storyTitle: "把 Chilton Golden Quill 的广告和型号身份拆开",
    storySummary:
      "Chilton Golden Quill 先作为 Richard's Pens 支撑的历史型号页，广告图、规格和系列位置需要复核。",
    storyBodyMd:
      "Golden Quill 很容易被广告图带着走，但图书馆需要把广告叙事和型号事实分开。它应先说明属于 Chilton 哪个阶段，再说上墨、笔尖、材料和市场定位。\n\n当前档案绑定 Richard's Pens profile。后续可把 Golden Quill 与 Wing-flow、Chiltonian 做成 Chilton 1930s 展柜。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Advertising and exact specifications need editorial review.",
  }),
  makeSearchOnlyModel({
    slug: "the-chilton-wing-flow",
    brandSlug: "chilton",
    aliases: [
      { alias: "The Chilton Wing-flow", language: "en" },
      { alias: "Chilton Wing-flow", language: "en" },
      { alias: "奇尔顿 Wing-flow 翼流", language: "zh" },
    ],
    sourceItemId: "source-richardspens-c1ed0f2f13bc8b1c",
    specId: "spec-chilton-wing-flow-research",
    seriesName: "Wing-flow",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "上墨方式待核验",
    material: "笔身材质/广告版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-chilton-wing-flow-source-boundary",
    modelName: "The Chilton Wing-flow",
    focus:
      "Chilton Wing-flow identity, advertising context, filling system, nib, material, product-line position, and collector claims",
    storyId: "story-model-chilton-wing-flow-research",
    storyTitle: "把 Chilton Wing-flow 做成 1930s 设计和广告档案",
    storySummary:
      "Chilton Wing-flow 先作为 Richard's Pens 支撑的历史型号页，广告、设计名和规格需要复核。",
    storyBodyMd:
      "Wing-flow 的名字本身就有设计意味，适合图书馆化：它可以连接广告语言、笔身造型和 Chilton 的技术路线。当前页面还只是长文残片。\n\n当前档案先建立型号页结构，绑定 Richard's Pens profile。后续再补广告来源、规格和可能的机制图。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Design and specification claims remain review-gated.",
  }),
  makeSearchOnlyModel({
    slug: "the-conklin-glider",
    brandSlug: "conklin",
    aliases: [
      { alias: "The Conklin Glider", language: "en" },
      { alias: "Conklin Glider", language: "en" },
      { alias: "康克令 Glider 滑翔机", language: "zh" },
    ],
    sourceItemId: "source-richardspens-25175231ff08f4fe",
    specId: "spec-conklin-glider-research",
    seriesName: "Glider",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "上墨方式待核验",
    material: "笔身材质/广告版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-conklin-glider-source-boundary",
    modelName: "The Conklin Glider",
    focus:
      "Conklin Glider identity, postwar advertising context, filling system, nib, material, product-line position, and collector claims",
    storyId: "story-model-conklin-glider-research",
    storyTitle: "把 Conklin Glider 从 markdown 残片整理成型号页",
    storySummary:
      "Conklin Glider 先作为 Richard's Pens 支撑的历史型号页，当前 markdown 残留、广告和规格都需要复核。",
    storyBodyMd:
      "Glider 当前摘要甚至残留 markdown fence，说明它最需要先整理成干净的型号档案。第一步不是写更多故事，而是把来源、型号、广告、规格和品牌关系拆清楚。\n\n当前档案绑定 Richard's Pens profile。后续可和 Nozac、Crescent 相关条目一起整理 Conklin 从技术创新到战后产品线的变化。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Existing markdown residue in source summary should be cleaned separately.",
  }),
  makeSearchOnlyModel({
    slug: "the-conklin-nozac",
    brandSlug: "conklin",
    aliases: [
      { alias: "The Conklin Nozac", language: "en" },
      { alias: "Conklin Nozac", language: "en" },
      { alias: "康克令 Nozac", language: "zh" },
    ],
    sourceItemId: "source-richardspens-e7c47ce6acc32399",
    specId: "spec-conklin-nozac-research",
    seriesName: "Nozac",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "Nozac/活塞或容量机制待核验",
    material: "笔身材质/尺寸版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-conklin-nozac-source-boundary",
    modelName: "The Conklin Nozac",
    focus:
      "Conklin Nozac identity, filling/capacity mechanism, anatomy/profile distinction, nib, material, variants, and collector claims",
    storyId: "story-model-conklin-nozac-research",
    storyTitle: "把 Conklin Nozac 的机制和 profile 来源分开",
    storySummary:
      "Conklin Nozac 先作为 Richard's Pens 支撑的机制型历史档案，profile、anatomy 和规格需要分层复核。",
    storyBodyMd:
      "Nozac 不是只靠名字成立的历史型号，它需要机制解释：为什么叫 Nozac、容量/上墨结构如何工作、和 Conklin 其他技术路线有什么关系。Richard's Pens 既有 profile 也有 anatomy 线索。\n\n当前档案先绑定 profile 来源，并保留机制细节待核验。后续可引用 anatomy 页面制作结构图。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Anatomy details should be separately cited before mechanism diagrams are finalized.",
  }),
  makeSearchOnlyModel({
    slug: "the-dunn-pen",
    brandSlug: "dunn",
    aliases: [
      { alias: "The Dunn-Pen", language: "en" },
      { alias: "Dunn-Pen", language: "en" },
      { alias: "邓恩钢笔", language: "zh" },
    ],
    sourceItemId: "source-richardspens-579b2a500f7d4cb5",
    specId: "spec-dunn-pen-research",
    seriesName: "Dunn-Pen",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "泵式/无墨囊上墨结构待核验",
    material: "笔身材质/广告版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-dunn-pen-source-boundary",
    modelName: "The Dunn-Pen",
    focus:
      "Dunn-Pen identity, filling mechanism, advertising context, nib, material, company timeline, and collector claims",
    storyId: "story-model-dunn-pen-research",
    storyTitle: "把 Dunn-Pen 从品牌档案残片整理成型号档案",
    storySummary:
      "Dunn-Pen 先作为 Richard's Pens 支撑的历史型号页，泵式结构、广告和公司时间线需要复核。",
    storyBodyMd:
      "Dunn-Pen 的现有摘要更像一段品牌长文残片，用户进入详情页很难判断它到底是什么型号、为什么值得收进图书馆。第一步是把品牌、型号、广告和上墨机制拆开。\n\n当前档案绑定 Richard's Pens profile，只把它作为研究入口。后续要补公司时间线、机制来源和实物规格，避免把长文叙事直接当成已审定参数。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Filling-mechanism and company-timeline claims require editorial review.",
  }),
  makeSearchOnlyModel({
    slug: "the-esterbrook-dollar-pen",
    brandSlug: "esterbrook",
    aliases: [
      { alias: "The Esterbrook Dollar Pen", language: "en" },
      { alias: "Esterbrook Dollar Pen", language: "en" },
      { alias: "Esterbrook 美元钢笔", language: "zh" },
    ],
    sourceItemId: "source-richardspens-49f83988d5735d84",
    specId: "spec-esterbrook-dollar-pen-research",
    seriesName: "Dollar Pen",
    originCountry: "美国（待核验）",
    nib: "Re-New-Point/笔尖规格待核验",
    fillSystem: "上墨方式待核验",
    material: "笔身材质/尺寸版本待核验",
    priceRange: "Dollar Pen 定价语境待核验",
    claimId: "claim-esterbrook-dollar-pen-source-boundary",
    modelName: "The Esterbrook Dollar Pen",
    focus:
      "Esterbrook Dollar Pen identity, Depression-era pricing context, nib system, filling system, material, variants, and advertising",
    storyId: "story-model-esterbrook-dollar-pen-research",
    storyTitle: "把 Esterbrook Dollar Pen 做成价位和笔尖系统档案",
    storySummary:
      "Esterbrook Dollar Pen 先作为 Richard's Pens 支撑的历史型号页，价位语境、笔尖系统和版本需要复核。",
    storyBodyMd:
      "Dollar Pen 的名字容易让人只看到价格，但图书馆应该把它放进 Esterbrook 的入门市场、可维护笔尖系统和经济时代语境里。它需要从长文摘要变成可扫描的型号页。\n\n当前档案绑定 Richard's Pens profile，并保留价位、笔尖、上墨和材料待核验。后续可与 Model J Family 一起整理 Esterbrook 的大众化路线。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Pricing and nib-system details need direct citation review.",
  }),
  makeSearchOnlyModel({
    slug: "the-esterbrook-model-j-family",
    brandSlug: "esterbrook",
    aliases: [
      { alias: "The Esterbrook Model J Family", language: "en" },
      { alias: "Esterbrook Model J Family", language: "en" },
      { alias: "Esterbrook J 系列", language: "zh" },
    ],
    sourceItemId: "source-richardspens-007320e88188bdcb",
    specId: "spec-esterbrook-model-j-family-research",
    seriesName: "Model J Family",
    originCountry: "美国（待核验）",
    nib: "Re-New-Point/可替换笔尖系统待核验",
    fillSystem: "压杆或版本差异待核验",
    material: "笔身材质/尺寸家族待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-esterbrook-model-j-family-source-boundary",
    modelName: "The Esterbrook Model J Family",
    focus:
      "Esterbrook Model J family identity, Re-New-Point nib system, size variants, filling system, material, postwar context, and collector claims",
    storyId: "story-model-esterbrook-model-j-family-research",
    storyTitle: "把 Esterbrook Model J 家族整理成大众化系统页",
    storySummary:
      "Esterbrook Model J Family 先作为 Richard's Pens 支撑的型号家族页，笔尖系统、尺寸和版本边界需要复核。",
    storyBodyMd:
      "Model J Family 很适合做“可维护、可替换、面向大众”的型号家族页。当前摘要仍混着索引链接和 markdown 残片，读起来不像图书馆条目。\n\n当前档案先绑定 Richard's Pens profile，把 Re-New-Point 笔尖、尺寸家族、上墨和材料都放在待核验层。后续可补一个 Esterbrook 笔尖系统图示。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Nib-system and family-boundary claims require separate review.",
  }),
  makeSearchOnlyModel({
    slug: "the-eversharp-bantam",
    brandSlug: "eversharp",
    aliases: [
      { alias: "The Eversharp Bantam", language: "en" },
      { alias: "Eversharp Bantam", language: "en" },
      { alias: "永锋 Bantam", language: "zh" },
    ],
    sourceItemId: "source-richardspens-b05562d453750f9d",
    specId: "spec-eversharp-bantam-research",
    seriesName: "Bantam",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "上墨方式待核验",
    material: "小型笔身/材质版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-eversharp-bantam-source-boundary",
    modelName: "The Eversharp Bantam",
    focus:
      "Eversharp Bantam identity, compact size, Peter Pan/Bantam context, filling system, nib, material, advertising, and collector claims",
    storyId: "story-model-eversharp-bantam-research",
    storyTitle: "把 Eversharp Bantam 做成小型钢笔线索页",
    storySummary:
      "Eversharp Bantam 先作为 Richard's Pens 支撑的小型历史型号页，尺寸、系列关系和规格需要复核。",
    storyBodyMd:
      "Bantam 的图书馆价值在于“小型钢笔”语境：它需要和口袋笔、女士笔、儿童/礼品市场等可能线索分开核验。当前页面还只是来源长文入口。\n\n当前档案绑定 Richard's Pens profile，先整理型号身份和待核验规格。后续可和 Kimberly、Tuckaway、Kaweco Sport 做跨时代便携钢笔对照。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Compact-size and product-line claims require editorial review.",
  }),
  makeSearchOnlyModel({
    slug: "the-eversharp-coronet",
    brandSlug: "eversharp",
    aliases: [
      { alias: "The Eversharp Coronet", language: "en" },
      { alias: "Eversharp Coronet", language: "en" },
      { alias: "永锋 Coronet", language: "zh" },
    ],
    sourceItemId: "source-richardspens-b97f51202141abf3",
    specId: "spec-eversharp-coronet-research",
    seriesName: "Coronet",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "上墨方式待核验",
    material: "金属/赛璐珞或饰面版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-eversharp-coronet-source-boundary",
    modelName: "The Eversharp Coronet",
    focus:
      "Eversharp Coronet identity, Art Deco design context, trim/material variants, filling system, nib, advertising, and collector claims",
    storyId: "story-model-eversharp-coronet-research",
    storyTitle: "把 Eversharp Coronet 整理成装饰艺术型号档案",
    storySummary:
      "Eversharp Coronet 先作为 Richard's Pens 支撑的历史型号页，装饰艺术语境、饰面和规格需要复核。",
    storyBodyMd:
      "Coronet 的入口不应只是文章摘要，它更像一个设计型档案：外观、饰面、广告和时代审美都需要和实际规格分开呈现。\n\n当前档案绑定 Richard's Pens profile，并把材料、上墨、笔尖和版本全部保留在待核验层。后续可以与 Doric 一起整理 Eversharp 的装饰艺术路线。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Art Deco, trim, and material claims require direct evidence review.",
  }),
  makeSearchOnlyModel({
    slug: "the-eversharp-doric",
    brandSlug: "eversharp",
    aliases: [
      { alias: "The Eversharp Doric", language: "en" },
      { alias: "Eversharp Doric", language: "en" },
      { alias: "永锋 Doric", language: "zh" },
    ],
    sourceItemId: "source-richardspens-aca7947049d51bbb",
    specId: "spec-eversharp-doric-research",
    seriesName: "Doric",
    originCountry: "美国（待核验）",
    nib: "Adjustable/笔尖规格待核验",
    fillSystem: "上墨方式/版本差异待核验",
    material: "多面笔身/颜色材质版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-eversharp-doric-source-boundary",
    modelName: "The Eversharp Doric",
    focus:
      "Eversharp Doric identity, faceted Art Deco body, adjustable nib context, filling-system variants, material colors, advertising, and collector claims",
    storyId: "story-model-eversharp-doric-research",
    storyTitle: "把 Eversharp Doric 做成多面造型和笔尖系统页",
    storySummary:
      "Eversharp Doric 先作为 Richard's Pens 支撑的经典型号页，多面造型、笔尖系统和版本差异需要复核。",
    storyBodyMd:
      "Doric 是最适合图书馆化的 Eversharp 型号之一：多面造型、颜色、广告和可调笔尖线索都能形成清晰展柜。当前摘要还停留在长文片段。\n\n当前档案绑定 Richard's Pens profile，不把可调笔尖或具体上墨机制直接写死。后续应补一张 Doric 版本/机制边界图。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Adjustable nib and variant claims need separate citation review.",
  }),
  makeSearchOnlyModel({
    slug: "the-eversharp-envoy",
    brandSlug: "eversharp",
    aliases: [
      { alias: "The Eversharp Envoy", language: "en" },
      { alias: "Eversharp Envoy", language: "en" },
      { alias: "永锋 Envoy", language: "zh" },
    ],
    sourceItemId: "source-richardspens-4553033860336ad8",
    specId: "spec-eversharp-envoy-research",
    seriesName: "Envoy",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "上墨方式待核验",
    material: "笔身材质/后期版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-eversharp-envoy-source-boundary",
    modelName: "The Eversharp Envoy",
    focus:
      "Eversharp Envoy identity, forgotten/late product-line context, filling system, nib, material, advertising, and collector claims",
    storyId: "story-model-eversharp-envoy-research",
    storyTitle: "把 Eversharp Envoy 放进被遗忘型号研究队列",
    storySummary:
      "Eversharp Envoy 先作为 Richard's Pens 支撑的待核验历史型号页，后期定位、广告和规格需要复核。",
    storyBodyMd:
      "Envoy 当前像一段“被遗忘型号”的文章摘录，适合先整理为研究队列：它属于 Eversharp 哪个阶段、为什么被忽略、与同期产品如何区分，都需要来源支撑。\n\n当前档案绑定 Richard's Pens profile，并保留所有规格字段待核验。后续可与 Symphony、Fifth Avenue 共同梳理战后产品线。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Late-line positioning and specifications require editorial review.",
  }),
  makeSearchOnlyModel({
    slug: "the-eversharp-fifth-avenue-and-sixty-four",
    brandSlug: "eversharp",
    aliases: [
      { alias: "The Eversharp Fifth Avenue and Sixty Four", language: "en" },
      { alias: "Eversharp Fifth Avenue", language: "en" },
      { alias: "Eversharp Sixty Four", language: "en" },
      { alias: "永锋 Fifth Avenue / Sixty Four", language: "zh" },
    ],
    sourceItemId: "source-richardspens-2d9d160c087cb1cc",
    specId: "spec-eversharp-fifth-avenue-sixty-four-research",
    seriesName: "Fifth Avenue / Sixty Four",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "上墨方式/版本差异待核验",
    material: "笔身材质/饰面版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-eversharp-fifth-avenue-sixty-four-source-boundary",
    modelName: "The Eversharp Fifth Avenue and Sixty Four",
    focus:
      "Eversharp Fifth Avenue and Sixty Four identity, postwar design context, variant boundary, filling system, nib, material, advertising, and collector claims",
    storyId: "story-model-eversharp-fifth-avenue-sixty-four-research",
    storyTitle: "把 Eversharp Fifth Avenue 与 Sixty Four 拆成战后型号线索",
    storySummary:
      "Eversharp Fifth Avenue and Sixty Four 先作为 Richard's Pens 支撑的战后型号页，两个名称的边界和规格需要复核。",
    storyBodyMd:
      "Fifth Avenue 与 Sixty Four 放在同一篇 profile 里，容易让用户把两个名称混成一个型号。图书馆需要先拆清楚：哪些是系列、哪些是版本、哪些只是文章叙述。\n\n当前档案绑定 Richard's Pens profile，先建立战后产品线索页。后续再补具体版本表、广告证据和规格来源。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Fifth Avenue / Sixty Four naming boundaries require review.",
  }),
  makeSearchOnlyModel({
    slug: "the-eversharp-pacemaker",
    brandSlug: "eversharp",
    aliases: [
      { alias: "The Eversharp Pacemaker", language: "en" },
      { alias: "Eversharp Pacemaker", language: "en" },
      { alias: "永锋 Pacemaker", language: "zh" },
    ],
    sourceItemId: "source-richardspens-94fd70b6caab70fc",
    specId: "spec-eversharp-pacemaker-research",
    seriesName: "Pacemaker",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "上墨方式待核验",
    material: "笔身材质/版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-eversharp-pacemaker-source-boundary",
    modelName: "The Eversharp Pacemaker",
    focus:
      "Eversharp Pacemaker identity, product-line position, advertising context, filling system, nib, material, variants, and collector claims",
    storyId: "story-model-eversharp-pacemaker-research",
    storyTitle: "把 Eversharp Pacemaker 做成产品线位置档案",
    storySummary:
      "Eversharp Pacemaker 先作为 Richard's Pens 支撑的历史型号页，产品线位置、广告和规格需要复核。",
    storyBodyMd:
      "Pacemaker 的现有页面更像一段 profile 摘要，而不是型号档案。图书馆先把它变成一个可继续扩写的框架：名称、时期、广告、规格和与同门型号的关系。\n\n当前档案绑定 Richard's Pens profile，所有具体参数仍待核验。后续可与 Skyline、Symphony 对照 Eversharp 不同阶段的设计语言。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Product-line and specification claims remain review-gated.",
  }),
  makeSearchOnlyModel({
    slug: "the-eversharp-skyline-family",
    brandSlug: "eversharp",
    aliases: [
      { alias: "The Eversharp Skyline Family", language: "en" },
      { alias: "Eversharp Skyline Family", language: "en" },
      { alias: "永锋 Skyline 系列", language: "zh" },
    ],
    sourceItemId: "source-richardspens-2c869eda3181b203",
    specId: "spec-eversharp-skyline-family-research",
    seriesName: "Skyline Family",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "上墨方式/版本差异待核验",
    material: "笔身材质/尺寸家族待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-eversharp-skyline-family-source-boundary",
    modelName: "The Eversharp Skyline Family",
    focus:
      "Eversharp Skyline family identity, design context, size/trim variants, filling system, nib, material, advertising, and collector claims",
    storyId: "story-model-eversharp-skyline-family-research",
    storyTitle: "把 Eversharp Skyline 家族整理成设计和版本入口",
    storySummary:
      "Eversharp Skyline Family 先作为 Richard's Pens 支撑的型号家族页，设计语境、尺寸和版本需要复核。",
    storyBodyMd:
      "Skyline 是 Eversharp 最适合做“设计入口”的家族之一，但当前详情页仍像长文引用。图书馆需要把它拆成设计语境、尺寸/饰面、上墨和笔尖几条线。\n\n当前档案绑定 Richard's Pens profile，不直接确认具体设计师、版本或规格。后续可补 Skyline 家族版本表和时间线。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Designer, variant, and specification claims need separate review.",
  }),
  makeSearchOnlyModel({
    slug: "the-eversharp-symphony-family",
    brandSlug: "eversharp",
    aliases: [
      { alias: "The Eversharp Symphony Family", language: "en" },
      { alias: "Eversharp Symphony Family", language: "en" },
      { alias: "永锋 Symphony 系列", language: "zh" },
    ],
    sourceItemId: "source-richardspens-37b562a7867add5d",
    specId: "spec-eversharp-symphony-family-research",
    seriesName: "Symphony Family",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "上墨方式/版本差异待核验",
    material: "笔身材质/尺寸版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-eversharp-symphony-family-source-boundary",
    modelName: "The Eversharp Symphony Family",
    focus:
      "Eversharp Symphony family identity, postwar design context, variants, filling system, nib, material, advertising, and collector claims",
    storyId: "story-model-eversharp-symphony-family-research",
    storyTitle: "把 Eversharp Symphony 家族放进战后设计档案",
    storySummary:
      "Eversharp Symphony Family 先作为 Richard's Pens 支撑的战后型号家族页，版本、广告和规格需要复核。",
    storyBodyMd:
      "Symphony Family 适合和 Skyline、Fifth Avenue 一起读：它们能帮助用户理解 Eversharp 战后设计如何变化。当前页面需要先从文章残片变成结构化型号家族页。\n\n当前档案绑定 Richard's Pens profile，并将版本、材料、笔尖和上墨全部放在待核验层。后续再补具体时间线。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Postwar positioning and variant claims require editorial review.",
  }),
  makeSearchOnlyModel({
    slug: "the-eversharp-ventura-family",
    brandSlug: "eversharp",
    aliases: [
      { alias: "The Eversharp Ventura Family", language: "en" },
      { alias: "Eversharp Ventura Family", language: "en" },
      { alias: "永锋 Ventura 系列", language: "zh" },
    ],
    sourceItemId: "source-richardspens-3a5de306b61c90ef",
    specId: "spec-eversharp-ventura-family-research",
    seriesName: "Ventura Family",
    originCountry: "美国（待核验）",
    nib: "笔尖规格待核验",
    fillSystem: "上墨方式/版本差异待核验",
    material: "笔身材质/尺寸版本待核验",
    priceRange: "历史/收藏价格待核验",
    claimId: "claim-eversharp-ventura-family-source-boundary",
    modelName: "The Eversharp Ventura Family",
    focus:
      "Eversharp Ventura family identity, Pennant/article context, late Eversharp product-line position, variants, filling system, nib, material, and collector claims",
    storyId: "story-model-eversharp-ventura-family-research",
    storyTitle: "把 Eversharp Ventura 家族整理成晚期产品线档案",
    storySummary:
      "Eversharp Ventura Family 先作为 Richard's Pens 支撑的晚期型号家族页，文章来源、版本和规格需要复核。",
    storyBodyMd:
      "Ventura Family 的摘要提到文章来源和扩展版本，这说明它不能只当普通型号页处理。图书馆需要明确：profile 是入口，具体历史结论和版本事实要另行核验。\n\n当前档案绑定 Richard's Pens profile，先建立晚期产品线框架。后续可补 Pennant 文章语境、广告证据和型号家族图。",
    sourceNotes:
      "Richard's Pens profile is registered as a summary/link-only source. Pennant/article context and late-line claims require separate review.",
  }),
];

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

function statement(sql: string, args: unknown[] = []): InStatement {
  return { sql, args: args as InArgs };
}

async function runBatch(db: Client, statements: InStatement[]) {
  if (statements.length === 0) return;
  await db.batch(statements, "write");
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

async function findEntity(db: Client, type: string, slug: string) {
  const result = await db.execute({
    sql: "SELECT id, type, slug, name FROM entities WHERE type = ? AND slug = ? LIMIT 1",
    args: [type, slug],
  });
  return (result.rows[0] as EntityRow | undefined) || null;
}

async function writeSourceRegistry(db: Client, source: SourceRegistrySeed) {
  await execute(
    db,
    `INSERT INTO source_registry
      (id, name, source_type, allowed_use, reliability, license, attribution, homepage_url, fetch_method, notes, last_checked_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'copyrighted; summary/link only', ?, ?, ?, ?, date('now'), datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      source_type = excluded.source_type,
      allowed_use = excluded.allowed_use,
      reliability = excluded.reliability,
      attribution = excluded.attribution,
      homepage_url = excluded.homepage_url,
      fetch_method = excluded.fetch_method,
      notes = excluded.notes,
      last_checked_at = excluded.last_checked_at,
      updated_at = datetime('now')`,
    [
      source.id,
      source.name,
      source.sourceType,
      source.allowedUse,
      source.reliability,
      source.attribution,
      source.homepageUrl,
      source.fetchMethod,
      source.notes,
    ],
  );
}

async function writeSourceItem(db: Client, item: SourceItemSeed) {
  await execute(
    db,
    `INSERT INTO source_items
      (id, source_id, title, url, item_type, license, author, retrieved_at, summary, allowed_use, review_status, updated_at)
     VALUES (?, ?, ?, ?, ?, 'copyrighted; summary/link only', ?, date('now'), ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      source_id = excluded.source_id,
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
      item.id,
      item.sourceId,
      item.title,
      item.url,
      item.itemType,
      item.author,
      item.summary,
      item.allowedUse,
      item.reviewStatus,
    ],
  );
}

async function writeReference(
  db: Client,
  entity: EntityRow,
  sourceItemId: string,
  reviewStatus: "pending" | "approved",
) {
  await execute(
    db,
    `INSERT INTO entity_references
      (id, entity_id, source_item_id, relation_type, note, review_status)
     VALUES (?, ?, ?, 'reference', ?, ?)
     ON CONFLICT(entity_id, source_item_id, relation_type) DO UPDATE SET
      note = excluded.note,
      review_status = excluded.review_status`,
    [
      `reference-model-gap-${entity.id}-${sourceItemId}`.slice(0, 160),
      entity.id,
      sourceItemId,
      reviewStatus === "approved"
        ? "Approved model-context source registered for archive expansion. Summary/link only."
        : "Research index registered for under-documented model expansion; direct fact claims remain review-gated.",
      reviewStatus,
    ],
  );
}

async function writeAlias(db: Client, entity: EntityRow, alias: AliasSeed) {
  await execute(
    db,
    `INSERT INTO entity_aliases
      (id, entity_id, alias, language, source_id)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(entity_id, alias, language) DO UPDATE SET
      source_id = excluded.source_id`,
    [
      `alias-${entity.id}-${alias.language}-${alias.alias}`.slice(0, 160),
      entity.id,
      alias.alias,
      alias.language,
      alias.sourceId || null,
    ],
  );
}

async function writeClaim(db: Client, entity: EntityRow, claim: ClaimSeed) {
  await execute(
    db,
    `INSERT INTO claims
      (id, subject_entity_id, predicate, object_text, source_item_id, evidence_locator, confidence, review_status, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      predicate = excluded.predicate,
      object_text = excluded.object_text,
      source_item_id = excluded.source_item_id,
      evidence_locator = excluded.evidence_locator,
      confidence = excluded.confidence,
      review_status = excluded.review_status,
      updated_at = datetime('now')`,
    [
      claim.id,
      entity.id,
      claim.predicate,
      claim.text,
      claim.sourceItemId,
      claim.evidenceLocator || null,
      claim.confidence,
      claim.reviewStatus,
    ],
  );

  await execute(
    db,
    `INSERT INTO citations
      (id, target_type, target_id, source_item_id, claim_id, note)
     VALUES (?, 'claim', ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
      source_item_id = excluded.source_item_id,
      claim_id = excluded.claim_id,
      note = excluded.note`,
    [
      `cite-${claim.id}-${claim.sourceItemId}`.slice(0, 160),
      claim.id,
      claim.sourceItemId,
      claim.id,
      "Research-boundary claim cites this source item. Review status indicates it is not a verified product fact.",
    ],
  );
}

async function writeModelSpec(
  db: Client,
  model: EntityRow,
  brand: EntityRow | null,
  spec: ModelSpecSeed,
  sourceItemId: string,
) {
  await execute(
    db,
    `INSERT INTO model_specs
      (id, entity_id, brand_entity_id, series_name, release_year, origin_country, nib, fill_system, material, dimensions, weight, price_range, status, review_status, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(entity_id) DO UPDATE SET
      brand_entity_id = excluded.brand_entity_id,
      series_name = excluded.series_name,
      release_year = excluded.release_year,
      origin_country = excluded.origin_country,
      nib = excluded.nib,
      fill_system = excluded.fill_system,
      material = excluded.material,
      dimensions = excluded.dimensions,
      weight = excluded.weight,
      price_range = excluded.price_range,
      status = excluded.status,
      review_status = excluded.review_status,
      updated_at = datetime('now')`,
    [
      spec.id,
      model.id,
      brand?.id || null,
      spec.seriesName,
      spec.releaseYear,
      spec.originCountry,
      spec.nib,
      spec.fillSystem,
      spec.material,
      spec.dimensions,
      spec.weight,
      spec.priceRange,
      spec.status,
      spec.reviewStatus,
    ],
  );

  await execute(
    db,
    `INSERT INTO citations
      (id, target_type, target_id, source_item_id, note)
     VALUES (?, 'model_spec', ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
      source_item_id = excluded.source_item_id,
      note = excluded.note`,
    [
      `cite-${spec.id}-${sourceItemId}`.slice(0, 160),
      spec.id,
      sourceItemId,
      "Research model spec uses this source as a queue anchor; review status controls factual confidence.",
    ],
  );
}

async function writeStory(db: Client, entity: EntityRow, story: StorySeed) {
  await execute(
    db,
    `INSERT INTO stories
      (id, entity_id, title, story_type, summary, body_md, status, source_notes, updated_at)
     VALUES (?, ?, ?, 'model_story', ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      summary = excluded.summary,
      body_md = excluded.body_md,
      status = excluded.status,
      source_notes = excluded.source_notes,
      updated_at = datetime('now')`,
    [
      story.id,
      entity.id,
      story.title,
      story.summary,
      story.bodyMd,
      story.status,
      story.sourceNotes,
    ],
  );

  for (const sourceItemId of story.sourceItemIds) {
    await execute(
      db,
      `INSERT INTO citations
        (id, target_type, target_id, source_item_id, note)
       VALUES (?, 'story', ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
        source_item_id = excluded.source_item_id,
        note = excluded.note`,
      [
        `cite-${story.id}-${sourceItemId}`.slice(0, 160),
        story.id,
        sourceItemId,
        "Research model story uses this source as a summary/link-only anchor.",
      ],
    );
  }

  for (const claimId of story.claimIds) {
    await execute(
      db,
      `INSERT INTO citations
        (id, target_type, target_id, claim_id, note)
       VALUES (?, 'story', ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
        claim_id = excluded.claim_id,
        note = excluded.note`,
      [
        `cite-${story.id}-${claimId}`.slice(0, 160),
        story.id,
        claimId,
        "Research model story cites this evidence-boundary claim.",
      ],
    );
  }
}

async function writeVariant(
  db: Client,
  model: EntityRow,
  variant: VariantSeed,
) {
  await execute(
    db,
    `INSERT INTO model_variants
      (id, model_entity_id, variant_name, release_year, notes, source_item_id, review_status)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(model_entity_id, variant_name) DO UPDATE SET
      release_year = excluded.release_year,
      notes = excluded.notes,
      source_item_id = excluded.source_item_id,
      review_status = excluded.review_status`,
    [
      variant.id,
      model.id,
      variant.name,
      variant.releaseYear || null,
      variant.notes,
      variant.sourceItemId || null,
      variant.reviewStatus,
    ],
  );
}

async function writeBrandModelLink(
  db: Client,
  brand: EntityRow | null,
  model: EntityRow,
) {
  if (!brand) return;
  await execute(
    db,
    `INSERT INTO entity_links
      (id, source_id, target_id, link_type)
     VALUES (?, ?, ?, 'brand_model')
     ON CONFLICT(source_id, target_id, link_type) DO NOTHING`,
    [`link-brand-model-${brand.id}-${model.id}`.slice(0, 160), brand.id, model.id],
  );
}

function sourceRegistryStatement(source: SourceRegistrySeed) {
  return statement(
    `INSERT INTO source_registry
      (id, name, source_type, allowed_use, reliability, license, attribution, homepage_url, fetch_method, notes, last_checked_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'copyrighted; summary/link only', ?, ?, ?, ?, date('now'), datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      source_type = excluded.source_type,
      allowed_use = excluded.allowed_use,
      reliability = excluded.reliability,
      attribution = excluded.attribution,
      homepage_url = excluded.homepage_url,
      fetch_method = excluded.fetch_method,
      notes = excluded.notes,
      last_checked_at = excluded.last_checked_at,
      updated_at = datetime('now')`,
    [
      source.id,
      source.name,
      source.sourceType,
      source.allowedUse,
      source.reliability,
      source.attribution,
      source.homepageUrl,
      source.fetchMethod,
      source.notes,
    ],
  );
}

function sourceItemStatement(item: SourceItemSeed) {
  return statement(
    `INSERT INTO source_items
      (id, source_id, title, url, item_type, license, author, retrieved_at, summary, allowed_use, review_status, updated_at)
     VALUES (?, ?, ?, ?, ?, 'copyrighted; summary/link only', ?, date('now'), ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      source_id = excluded.source_id,
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
      item.id,
      item.sourceId,
      item.title,
      item.url,
      item.itemType,
      item.author,
      item.summary,
      item.allowedUse,
      item.reviewStatus,
    ],
  );
}

function referenceStatement(
  entity: EntityRow,
  sourceItemId: string,
  reviewStatus: "pending" | "approved",
) {
  return statement(
    `INSERT INTO entity_references
      (id, entity_id, source_item_id, relation_type, note, review_status)
     VALUES (?, ?, ?, 'reference', ?, ?)
     ON CONFLICT(entity_id, source_item_id, relation_type) DO UPDATE SET
      note = excluded.note,
      review_status = excluded.review_status`,
    [
      `reference-model-gap-${entity.id}-${sourceItemId}`.slice(0, 160),
      entity.id,
      sourceItemId,
      reviewStatus === "approved"
        ? "Approved model-context source registered for archive expansion. Summary/link only."
        : "Research index registered for under-documented model expansion; direct fact claims remain review-gated.",
      reviewStatus,
    ],
  );
}

function aliasStatement(entity: EntityRow, alias: AliasSeed) {
  return statement(
    `INSERT INTO entity_aliases
      (id, entity_id, alias, language, source_id)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(entity_id, alias, language) DO UPDATE SET
      source_id = excluded.source_id`,
    [
      `alias-${entity.id}-${alias.language}-${alias.alias}`.slice(0, 160),
      entity.id,
      alias.alias,
      alias.language,
      alias.sourceId || null,
    ],
  );
}

function claimStatements(entity: EntityRow, claim: ClaimSeed) {
  return [
    statement(
      `INSERT INTO claims
        (id, subject_entity_id, predicate, object_text, source_item_id, evidence_locator, confidence, review_status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
        predicate = excluded.predicate,
        object_text = excluded.object_text,
        source_item_id = excluded.source_item_id,
        evidence_locator = excluded.evidence_locator,
        confidence = excluded.confidence,
        review_status = excluded.review_status,
        updated_at = datetime('now')`,
      [
        claim.id,
        entity.id,
        claim.predicate,
        claim.text,
        claim.sourceItemId,
        claim.evidenceLocator || null,
        claim.confidence,
        claim.reviewStatus,
      ],
    ),
    statement(
      `INSERT INTO citations
        (id, target_type, target_id, source_item_id, claim_id, note)
       VALUES (?, 'claim', ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
        source_item_id = excluded.source_item_id,
        claim_id = excluded.claim_id,
        note = excluded.note`,
      [
        `cite-${claim.id}-${claim.sourceItemId}`.slice(0, 160),
        claim.id,
        claim.sourceItemId,
        claim.id,
        "Research-boundary claim cites this source item. Review status indicates it is not a verified product fact.",
      ],
    ),
  ];
}

function modelSpecStatements(
  model: EntityRow,
  brand: EntityRow | null,
  spec: ModelSpecSeed,
  sourceItemId: string,
) {
  return [
    statement(
      `INSERT INTO model_specs
        (id, entity_id, brand_entity_id, series_name, release_year, origin_country, nib, fill_system, material, dimensions, weight, price_range, status, review_status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(entity_id) DO UPDATE SET
        brand_entity_id = excluded.brand_entity_id,
        series_name = excluded.series_name,
        release_year = excluded.release_year,
        origin_country = excluded.origin_country,
        nib = excluded.nib,
        fill_system = excluded.fill_system,
        material = excluded.material,
        dimensions = excluded.dimensions,
        weight = excluded.weight,
        price_range = excluded.price_range,
        status = excluded.status,
        review_status = excluded.review_status,
        updated_at = datetime('now')`,
      [
        spec.id,
        model.id,
        brand?.id || null,
        spec.seriesName,
        spec.releaseYear,
        spec.originCountry,
        spec.nib,
        spec.fillSystem,
        spec.material,
        spec.dimensions,
        spec.weight,
        spec.priceRange,
        spec.status,
        spec.reviewStatus,
      ],
    ),
    statement(
      `INSERT INTO citations
        (id, target_type, target_id, source_item_id, note)
       VALUES (?, 'model_spec', ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
        source_item_id = excluded.source_item_id,
        note = excluded.note`,
      [
        `cite-${spec.id}-${sourceItemId}`.slice(0, 160),
        spec.id,
        sourceItemId,
        "Research model spec uses this source as a queue anchor; review status controls factual confidence.",
      ],
    ),
  ];
}

function storyStatements(entity: EntityRow, story: StorySeed) {
  const statements = [
    statement(
      `INSERT INTO stories
        (id, entity_id, title, story_type, summary, body_md, status, source_notes, updated_at)
       VALUES (?, ?, ?, 'model_story', ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        summary = excluded.summary,
        body_md = excluded.body_md,
        status = excluded.status,
        source_notes = excluded.source_notes,
        updated_at = datetime('now')`,
      [
        story.id,
        entity.id,
        story.title,
        story.summary,
        story.bodyMd,
        story.status,
        story.sourceNotes,
      ],
    ),
  ];

  for (const sourceItemId of story.sourceItemIds) {
    statements.push(
      statement(
        `INSERT INTO citations
          (id, target_type, target_id, source_item_id, note)
         VALUES (?, 'story', ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
          source_item_id = excluded.source_item_id,
          note = excluded.note`,
        [
          `cite-${story.id}-${sourceItemId}`.slice(0, 160),
          story.id,
          sourceItemId,
          "Research model story uses this source as a summary/link-only anchor.",
        ],
      ),
    );
  }

  for (const claimId of story.claimIds) {
    statements.push(
      statement(
        `INSERT INTO citations
          (id, target_type, target_id, claim_id, note)
         VALUES (?, 'story', ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
          claim_id = excluded.claim_id,
          note = excluded.note`,
        [
          `cite-${story.id}-${claimId}`.slice(0, 160),
          story.id,
          claimId,
          "Research model story cites this evidence-boundary claim.",
        ],
      ),
    );
  }

  return statements;
}

function variantStatement(model: EntityRow, variant: VariantSeed) {
  return statement(
    `INSERT INTO model_variants
      (id, model_entity_id, variant_name, release_year, notes, source_item_id, review_status)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(model_entity_id, variant_name) DO UPDATE SET
      release_year = excluded.release_year,
      notes = excluded.notes,
      source_item_id = excluded.source_item_id,
      review_status = excluded.review_status`,
    [
      variant.id,
      model.id,
      variant.name,
      variant.releaseYear || null,
      variant.notes,
      variant.sourceItemId || null,
      variant.reviewStatus,
    ],
  );
}

function brandModelLinkStatement(brand: EntityRow | null, model: EntityRow) {
  if (!brand) return null;
  return statement(
    `INSERT INTO entity_links
      (id, source_id, target_id, link_type)
     VALUES (?, ?, ?, 'brand_model')
     ON CONFLICT(source_id, target_id, link_type) DO NOTHING`,
    [`link-brand-model-${brand.id}-${model.id}`.slice(0, 160), brand.id, model.id],
  );
}

function modelStatements(
  model: EntityRow,
  brand: EntityRow | null,
  seed: ModelGapSeed,
) {
  const statements: InStatement[] = [];
  for (const sourceItemId of seed.sourceItemIds) {
    statements.push(
      referenceStatement(
        model,
        sourceItemId,
        sourceItemId.includes("official") ? "approved" : "pending",
      ),
    );
  }
  for (const alias of seed.aliases) statements.push(aliasStatement(model, alias));
  statements.push(
    ...modelSpecStatements(model, brand, seed.spec, seed.sourceItemIds[0]),
  );
  for (const claim of seed.claims) statements.push(...claimStatements(model, claim));
  statements.push(...storyStatements(model, seed.story));
  for (const variant of seed.variants || []) {
    statements.push(variantStatement(model, variant));
  }
  const brandLinkStatement = brandModelLinkStatement(brand, model);
  if (brandLinkStatement) statements.push(brandLinkStatement);
  return statements;
}

function getReferencedSourceItemIds(models: ModelGapSeed[]) {
  const ids = new Set<string>();
  for (const seed of models) {
    for (const sourceItemId of seed.sourceItemIds) ids.add(sourceItemId);
    for (const claim of seed.claims) ids.add(claim.sourceItemId);
    for (const sourceItemId of seed.story.sourceItemIds) ids.add(sourceItemId);
    for (const variant of seed.variants || []) {
      if (variant.sourceItemId) ids.add(variant.sourceItemId);
    }
  }
  return ids;
}

async function writeModel(db: Client, seed: ModelGapSeed) {
  const model = await findEntity(db, "pen", seed.slug);
  if (!model) {
    console.warn(`Skip model ${seed.slug}: entity not found`);
    return;
  }

  const brand = await findEntity(db, "brand", seed.brandSlug);
  await runBatch(db, modelStatements(model, brand, seed));
}

async function main() {
  const db = getClient();
  await execute(db, "PRAGMA foreign_keys = ON");
  if (WRITE) await runMigrations(db);

  const selectedModels = SLUG_FILTER
    ? MODELS.filter((model) => SLUG_FILTER.has(model.slug))
    : MODELS;
  const models =
    Number.isFinite(LIMIT) && LIMIT && LIMIT > 0
      ? selectedModels.slice(0, LIMIT)
      : selectedModels;

  console.log(
    WRITE
      ? "Model gap source import: write mode"
      : "Model gap source import: dry run",
  );
  console.log(
    `Sources: ${SOURCE_REGISTRY.length}, items: ${SOURCE_ITEMS.length}, models: ${models.length}`,
  );
  if (SLUG_FILTER) {
    const missingSlugs = [...SLUG_FILTER].filter(
      (slug) => !MODELS.some((model) => model.slug === slug),
    );
    console.log(`Slug filter: ${models.length} matched`);
    if (missingSlugs.length > 0) {
      console.warn(`Missing slugs: ${missingSlugs.join(", ")}`);
    }
  }

  if (WRITE) {
    const shouldWriteOnlyReferencedSources = Boolean(SLUG_FILTER || LIMIT);
    const referencedSourceItemIds = getReferencedSourceItemIds(models);
    const sourceItemsToWrite = shouldWriteOnlyReferencedSources
      ? SOURCE_ITEMS.filter((item) => referencedSourceItemIds.has(item.id))
      : SOURCE_ITEMS;
    const sourceRegistryIdsToWrite = new Set(
      sourceItemsToWrite.map((item) => item.sourceId),
    );
    const sourcesToWrite = shouldWriteOnlyReferencedSources
      ? SOURCE_REGISTRY.filter((source) => sourceRegistryIdsToWrite.has(source.id))
      : SOURCE_REGISTRY;
    console.log(
      `Write scope: ${sourcesToWrite.length} source registries, ${sourceItemsToWrite.length} source items`,
    );
    await runBatch(db, [
      ...sourcesToWrite.map(sourceRegistryStatement),
      ...sourceItemsToWrite.map(sourceItemStatement),
    ]);
  }

  for (const seed of models) {
    const model = await findEntity(db, "pen", seed.slug);
    console.log(`${model?.name || seed.slug} -> ${seed.story.title}`);
    if (WRITE) await writeModel(db, seed);
  }

  if (!WRITE) {
    console.log("Dry run only. Re-run with --write to store model gap archives.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
