import fs from "node:fs";
import path from "node:path";
import { createClient, type Client, type InArgs } from "@libsql/client";

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

async function writeModel(db: Client, seed: ModelGapSeed) {
  const model = await findEntity(db, "pen", seed.slug);
  if (!model) {
    console.warn(`Skip model ${seed.slug}: entity not found`);
    return;
  }

  const brand = await findEntity(db, "brand", seed.brandSlug);
  for (const sourceItemId of seed.sourceItemIds) {
    await writeReference(
      db,
      model,
      sourceItemId,
      sourceItemId.includes("official") ? "approved" : "pending",
    );
  }
  for (const alias of seed.aliases) await writeAlias(db, model, alias);
  await writeModelSpec(db, model, brand, seed.spec, seed.sourceItemIds[0]);
  for (const claim of seed.claims) await writeClaim(db, model, claim);
  await writeStory(db, model, seed.story);
  for (const variant of seed.variants || []) await writeVariant(db, model, variant);
  await writeBrandModelLink(db, brand, model);
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
    for (const source of SOURCE_REGISTRY) await writeSourceRegistry(db, source);
    for (const item of SOURCE_ITEMS) await writeSourceItem(db, item);
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
