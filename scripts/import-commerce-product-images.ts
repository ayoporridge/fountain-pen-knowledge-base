import { createHash } from "node:crypto";
import { createClient, type Client, type InArgs } from "@libsql/client";

const WRITE = process.argv.includes("--write");
const REPAIR_ONLY = process.argv.includes("--repair-only");
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith("--limit="));
const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1]) : Number.POSITIVE_INFINITY;
const SLUG_ARG = process.argv.find((arg) => arg.startsWith("--slug="));
const ONLY_SLUG = SLUG_ARG ? SLUG_ARG.slice("--slug=".length) : "";
const SLUGS_ARG = process.argv.find((arg) => arg.startsWith("--slugs="));
const ONLY_SLUGS = new Set(
  (SLUGS_ARG ? SLUGS_ARG.slice("--slugs=".length).split(",") : [])
    .map((slug) => slug.trim())
    .filter(Boolean),
);
const USER_AGENT =
  "Mozilla/5.0 fountain-pen-graph-library/0.1 commerce-product-image-metadata";

type PenRow = {
  entityId: string;
  slug: string;
  name: string;
  brandName: string | null;
  seriesName: string | null;
};

type CommerceSite = {
  id: string;
  name: string;
  searchUrl(query: string): string;
};

type ProductCandidate = {
  url: string;
  title: string;
  score: number;
};

type ImageCandidate = {
  url: string;
  score: number;
  reason: string;
};

type BrokenCommerceMedia = {
  mediaId: string;
  entityId: string;
  slug: string;
  name: string;
  brandName: string | null;
  seriesName: string | null;
  title: string;
  sourceUrl: string;
};

type ManualProductPage = {
  slug: string;
  siteId: string;
  siteName: string;
  homepageUrl: string;
  sourceType: "retailer" | "blog" | "official";
  itemType: string;
  license: string;
  title: string;
  url: string;
  imageUrl?: string;
};

const SITES: CommerceSite[] = [
  {
    id: "goldspot",
    name: "Goldspot Pens",
    searchUrl: (query) => `https://www.goldspot.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    id: "goulet",
    name: "Goulet Pens",
    searchUrl: (query) => `https://www.gouletpens.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    id: "cultpens",
    name: "Cult Pens",
    searchUrl: (query) => `https://cultpens.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    id: "ttpen",
    name: "TTpen",
    searchUrl: (query) => `https://www.ttpen.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    id: "tsamsa",
    name: "TSAMSA",
    searchUrl: (query) => `https://tsamsa.com.bd/search?q=${encodeURIComponent(query)}`,
  },
  {
    id: "penboutique",
    name: "Pen Boutique",
    searchUrl: (query) => `https://www.penboutique.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    id: "endlesspens",
    name: "EndlessPens",
    searchUrl: (query) => `https://endlesspens.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    id: "vanness",
    name: "Vanness Pens",
    searchUrl: (query) => `https://vanness1938.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    id: "atlas",
    name: "Atlas Stationers",
    searchUrl: (query) => `https://www.atlasstationers.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    id: "truphae",
    name: "Truphae",
    searchUrl: (query) => `https://www.truphaeinc.com/search?q=${encodeURIComponent(query)}`,
  },
  {
    id: "pensachi",
    name: "Pensachi",
    searchUrl: (query) => `https://www.pensachi.com/search?q=${encodeURIComponent(query)}`,
  },
];

const STOPWORDS = new Set([
  "the",
  "and",
  "with",
  "for",
  "pen",
  "pens",
  "fountain",
  "series",
  "family",
  "model",
  "official",
  "collection",
  "classic",
  "vintage",
  "limited",
  "edition",
  "gold",
  "silver",
  "black",
  "white",
  "blue",
  "green",
  "red",
  "brown",
  "clear",
  "steel",
  "review",
  "profile",
  "line",
  "pending",
  "identity",
  "read",
  "separate",
  "entry",
  "brand",
  "generic",
]);

const BAD_IMAGE_PATTERN =
  /logo|wordmark|ogp|ogimage|icon|favicon|sprite|placeholder|avatar|payment|banner|menu|navi_|header|search|footer|sns|pinterest|facebook|instagram|button|arrow|spacer|pixel|loading|calendar|cart|badge|swatch|newsletter|converter|refill|accessory|apps\.js|core\.js|hover-intent|shopifycloud/i;

const COMMERCE_SKIP_SLUGS = new Set([
  // PNB-13000 is also used on regular #3776 listings; require a source that
  // explicitly identifies the Fuji Shunkei edition before importing.
  "白金-platinum-富士旬景pnb-13000",
]);

const MANUAL_PRODUCT_PAGES: ManualProductPage[] = [
  {
    slug: "admok-简800",
    siteId: "daraz-bd",
    siteName: "Daraz Bangladesh",
    homepageUrl: "https://www.daraz.com.bd/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Admok M800/J800/800 Piston resin Fountain Pen",
    url: "https://www.daraz.com.bd/products/admok-m800j800800-piston-resin-fountain-pen-schmidt-bock-6-effmb-0507mm-nib-ink-pen-luxury-writing-office-school-pens-i465691678.html",
    imageUrl: "https://img.drz.lazcdn.com/static/bd/p/8b507c1aee670614aea48ac5e643e879.jpg_720x720q80.jpg_.webp",
  },
  {
    slug: "noodler鲶鱼-简易钢笔",
    siteId: "centralartsupply",
    siteName: "Central Art Supply",
    homepageUrl: "https://www.centralartsupply.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Noodler's Nib Creaper Flex Fountain Pen - Clear",
    url: "https://www.centralartsupply.com/shop/c/p/NOODLERS-NIB-CREAPER-FLEX-FOUNTAIN-PEN---CLEAR-x82022346.htm",
    imageUrl: "https://media.rainpos.com/10016/A_20240515131427.jpg",
  },
  {
    slug: "百利金-pelikan-m1005-stresemann",
    siteId: "makoba",
    siteName: "Makoba",
    homepageUrl: "https://makoba.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Pelikan M1005 Fountain Pen - Stresemann Special Edition",
    url: "https://makoba.com/products/pelikan-m1005-fountain-pen-stresemann-special-edition",
  },
  {
    slug: "白金-platinum-小流星pq200",
    siteId: "awesomepens",
    siteName: "AwesomePens",
    homepageUrl: "https://awesomepens.co.uk/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Platinum Small Meteor PQ-200 Fountain Pen",
    url: "https://awesomepens.co.uk/product/platinum-small-meteor-pq-200-fountain-pen/",
  },
  {
    slug: "辉柏嘉-faber-castell-如恩-loom",
    siteId: "penaddict",
    siteName: "The Pen Addict",
    homepageUrl: "https://www.penaddict.com/",
    sourceType: "blog",
    itemType: "review_article",
    license: "copyrighted review article",
    title: "Faber-Castell Loom Fountain Pen Review",
    url: "https://www.penaddict.com/blog/faber-castell-loom-fountain-pen-review",
  },
  {
    slug: "英雄-hero-100",
    siteId: "frankunderwater",
    siteName: "FrankUnderwater",
    homepageUrl: "https://frankunderwater.com/",
    sourceType: "blog",
    itemType: "review_article",
    license: "copyrighted review article",
    title: "My Three Type 100 Fountain Pens from Hero",
    url: "https://frankunderwater.com/2017/06/01/my-three-type-100-fountain-pens-from-hero/",
  },
  {
    slug: "金豪-jinhao-80",
    siteId: "rupertarzeian",
    siteName: "Rupert Arzeian",
    homepageUrl: "https://rupertarzeian.com/",
    sourceType: "blog",
    itemType: "review_article",
    license: "copyrighted review article",
    title: "Early thoughts on the Jinhao 80 fountain pen",
    url: "https://rupertarzeian.com/2022/09/24/early-thoughts-on-the-jinhao-80-fountain-pen/",
  },
  {
    slug: "永生-wingsung-601a",
    siteId: "moonmanpen",
    siteName: "MoonmanPen",
    homepageUrl: "https://moonmanpen.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Wing Sung 601A Grey Vacumatic Fountain Pen",
    url: "https://moonmanpen.com/products/wing-sung-601a-grey-vacumatic-fountain-pen-fine-0-5mm-nib-golden-cap-resin-body-ink-window-push-cap-with-converter-box-no-ink",
  },
  {
    slug: "永生-wingsung-618",
    siteId: "wellappointeddesk",
    siteName: "The Well-Appointed Desk",
    homepageUrl: "https://www.wellappointeddesk.com/",
    sourceType: "blog",
    itemType: "review_article",
    license: "copyrighted review article",
    title: "Wing Sung 618 Demonstrator review",
    url: "https://www.wellappointeddesk.com/2018/01/fountain-pen-review-wing-sung-618-demonstrator/",
  },
  {
    slug: "永生-wingsung-698",
    siteId: "scribblejot",
    siteName: "Scribble Jot",
    homepageUrl: "https://scribblejot.com/",
    sourceType: "blog",
    itemType: "review_article",
    license: "copyrighted review article",
    title: "Wing Sung 698 piston filler fountain pen review",
    url: "https://scribblejot.com/wing-sung-698-piston-filler-fountain-pen-review/",
  },
  {
    slug: "永生-wingsung-699",
    siteId: "moonmanpen",
    siteName: "MoonmanPen",
    homepageUrl: "https://moonmanpen.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Wing Sung 699 Transparent Brown Vacuum Filler Fountain Pen",
    url: "https://moonmanpen.com/products/wing-sung-699-transparent-brown-vacuum-filler-fountain-pen-smooth-m-nib-large-ink-capacity-demonstrator-body-gold-trim",
  },
  {
    slug: "the-camel-pen",
    siteId: "richardspens",
    siteName: "Richard's Pens",
    homepageUrl: "https://www.richardspens.com/",
    sourceType: "blog",
    itemType: "profile_article",
    license: "copyrighted reference article",
    title: "The Camel Pen profile",
    url: "https://www.richardspens.com/ref/profiles/camel.htm",
    imageUrl: "https://www.richardspens.com/images/coll/camel_capped.jpg",
  },
  {
    slug: "the-dunn-pen",
    siteId: "richardspens",
    siteName: "Richard's Pens",
    homepageUrl: "https://www.richardspens.com/",
    sourceType: "blog",
    itemType: "profile_article",
    license: "copyrighted reference article",
    title: "The Dunn-Pen profile",
    url: "https://www.richardspens.com/ref/profiles/dunn.htm",
    imageUrl: "https://www.richardspens.com/images/coll/dunn_no_2_capped.jpg",
  },
  {
    slug: "the-j-g-rider-fountain-pen",
    siteId: "richardspens",
    siteName: "Richard's Pens",
    homepageUrl: "https://www.richardspens.com/",
    sourceType: "blog",
    itemType: "profile_article",
    license: "copyrighted reference article",
    title: "The J. G. Rider Fountain Pen profile",
    url: "https://www.richardspens.com/ref/profiles/rider.htm",
    imageUrl: "https://www.richardspens.com/images/coll/rider_5_capped.jpg",
  },
  {
    slug: "the-john-hancock-cartridge-pen",
    siteId: "richardspens",
    siteName: "Richard's Pens",
    homepageUrl: "https://www.richardspens.com/",
    sourceType: "blog",
    itemType: "profile_article",
    license: "copyrighted reference article",
    title: "The John Hancock Cartridge Pen profile",
    url: "https://www.richardspens.com/ref/profiles/hancock.htm",
    imageUrl: "https://www.richardspens.com/images/coll/john_hancock_capped.jpg",
  },
  {
    slug: "the-parker-striped-duofold",
    siteId: "richardspens",
    siteName: "Richard's Pens",
    homepageUrl: "https://www.richardspens.com/",
    sourceType: "blog",
    itemType: "profile_article",
    license: "copyrighted reference article",
    title: "The Parker Striped Duofold profile",
    url: "https://www.richardspens.com/ref/profiles/strduo.htm",
    imageUrl: "https://www.richardspens.com/images/coll/duo_vac.jpg",
  },
  {
    slug: "the-parker-vacumatic",
    siteId: "richardspens",
    siteName: "Richard's Pens",
    homepageUrl: "https://www.richardspens.com/",
    sourceType: "blog",
    itemType: "profile_article",
    license: "copyrighted reference article",
    title: "The Parker Vacumatic profile",
    url: "https://www.richardspens.com/ref/profiles/vac.htm",
    imageUrl: "https://www.richardspens.com/images/ref/profiles/vac/vac34.jpg",
  },
  {
    slug: "the-postal-reservoir-pen",
    siteId: "richardspens",
    siteName: "Richard's Pens",
    homepageUrl: "https://www.richardspens.com/",
    sourceType: "blog",
    itemType: "profile_article",
    license: "copyrighted reference article",
    title: "The Postal Reservoir Pen profile",
    url: "https://www.richardspens.com/ref/profiles/postal.htm",
    imageUrl: "https://www.richardspens.com/images/coll/postal_rfb.jpg",
  },
  {
    slug: "the-security-pen",
    siteId: "richardspens",
    siteName: "Richard's Pens",
    homepageUrl: "https://www.richardspens.com/",
    sourceType: "blog",
    itemType: "profile_article",
    license: "copyrighted reference article",
    title: "The Security Pen profile",
    url: "https://www.richardspens.com/ref/profiles/security.htm",
    imageUrl: "https://www.richardspens.com/images/coll/security_300_l_capped.jpg",
  },
  {
    slug: "sheaffer-s-tuckaway",
    siteId: "richardspens",
    siteName: "Richard's Pens",
    homepageUrl: "https://www.richardspens.com/",
    sourceType: "blog",
    itemType: "profile_article",
    license: "copyrighted reference article",
    title: "Sheaffer's Tuckaway profile",
    url: "https://www.richardspens.com/ref/profiles/tuckaway.htm",
    imageUrl: "https://www.richardspens.com/images/coll/mastertucky_capped.jpg",
  },
  {
    slug: "waterman-s-c-f",
    siteId: "richardspens",
    siteName: "Richard's Pens",
    homepageUrl: "https://www.richardspens.com/",
    sourceType: "blog",
    itemType: "profile_article",
    license: "copyrighted reference article",
    title: "Waterman's C/F profile",
    url: "https://www.richardspens.com/ref/profiles/cf.htm",
    imageUrl: "https://www.richardspens.com/images/ref/profiles/cf/cf_gpt_capped.jpg",
  },
  {
    slug: "waterman-s-x-pen",
    siteId: "richardspens",
    siteName: "Richard's Pens",
    homepageUrl: "https://www.richardspens.com/",
    sourceType: "blog",
    itemType: "profile_article",
    license: "copyrighted reference article",
    title: "Waterman's X-Pen profile",
    url: "https://www.richardspens.com/ref/profiles/xpen.htm",
    imageUrl: "https://www.richardspens.com/images/coll/xpen_gf.jpg",
  },
  {
    slug: "the-esterbrook-model-j-family",
    siteId: "richardspens",
    siteName: "Richard's Pens",
    homepageUrl: "https://www.richardspens.com/",
    sourceType: "blog",
    itemType: "profile_article",
    license: "copyrighted reference article",
    title: "The Esterbrook Model J Family profile",
    url: "https://www.richardspens.com/ref/profiles/j.htm",
    imageUrl: "https://www.richardspens.com/images/coll/j_blue_capped.jpg",
  },
  {
    slug: "the-wahl-pen",
    siteId: "richardspens",
    siteName: "Richard's Pens",
    homepageUrl: "https://www.richardspens.com/",
    sourceType: "blog",
    itemType: "profile_article",
    license: "copyrighted reference article",
    title: "The Wahl Pen profile",
    url: "https://www.richardspens.com/ref/profiles/wahl_pen.htm",
    imageUrl: "https://www.richardspens.com/images/coll/wahl_73.jpg",
  },
  {
    slug: "弘典-hongdian-1866",
    siteId: "furper",
    siteName: "Furper",
    homepageUrl: "https://furper.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Hongdian 1866 Wood Fountain Pen",
    url: "https://furper.com/products/hongdian-1866-wood-fountain-pen-ef-f-nib-metal-retro-writing-office-gift-pen",
  },
  {
    slug: "弘典-hongdian-517-517s",
    siteId: "swastikpenn",
    siteName: "Swastik Penn",
    homepageUrl: "https://www.swastikpenn.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Hongdian Fountain Pen 517D Black",
    url: "https://www.swastikpenn.com/products/hongdian-fountain-pen-517d-black",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0032/7365/4317/products/517D_5571d7b5-3110-4f50-8fba-5c5c631d7b9f_1200x1200.jpg?v=1650629924",
  },
  {
    slug: "弘典-hongdian-t1钛合金",
    siteId: "shanghaiknifedude",
    siteName: "Shanghai Knife Dude",
    homepageUrl: "https://shanghaiknifedude.blogspot.com/",
    sourceType: "blog",
    itemType: "review_article",
    license: "copyrighted review article",
    title: "Hongdian Ti1866/T1 review",
    url: "https://shanghaiknifedude.blogspot.com/2025/01/hongdian-ti1866t1-review.html",
    imageUrl: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgQTtgSEJtsTTytQW-cAbaHTU3QGF4Zg6wnKc1UzTrHtqHzTW_tShZ1zaT9QuYdIHiSMDN5u-mgLUUzawRbOK-dO27vgM6S5xZrulae9_NoKnsCYOz_asK4d9D9uADeG_Zuk_4sHCS2YYRB3xLofrby59ryl3WM2AlQHsH4ZHalG4uFbvDG5VFPVkHMDGbE/s320/GAW_4919.jpg",
  },
  {
    slug: "中屋-nakaya-housoge高级定制",
    siteId: "nakaya",
    siteName: "Nakaya official site",
    homepageUrl: "https://www.nakaya.org/",
    sourceType: "official",
    itemType: "official_product_page",
    license: "copyrighted official product page",
    title: "Nakaya Housoge custom motif product page",
    url: "https://www.nakaya.org/en/products/info/37698/",
    imageUrl: "https://www.nakaya.org/wp-content/uploads/sites/5/2024/07/19030-CPI-10_001.jpg",
  },
  {
    slug: "中屋-nakaya-portable-portable-cigar",
    siteId: "nakaya",
    siteName: "Nakaya official site",
    homepageUrl: "https://www.nakaya.org/",
    sourceType: "official",
    itemType: "official_product_page",
    license: "copyrighted official product page",
    title: "Nakaya Portable Cigar product page",
    url: "https://www.nakaya.org/en/products/info/36624/",
    imageUrl: "https://www.nakaya.org/wp-content/uploads/sites/5/2024/07/01017-CP5-11_001.jpg",
  },
  {
    slug: "中屋-nakaya-portable-writer-黑溜涂",
    siteId: "nakaya",
    siteName: "Nakaya official site",
    homepageUrl: "https://www.nakaya.org/",
    sourceType: "official",
    itemType: "official_product_page",
    license: "copyrighted official product page",
    title: "Nakaya Portable Writer Kuro-Tamenuri review page",
    url: "https://www.nakaya.org/en/review.aspx?id=179&type=body",
    imageUrl: "https://www.nakaya.org/wp-content/uploads/sites/5/2024/07/02017-WP5-11_001.jpg",
  },
  {
    slug: "辉柏嘉-faber-castell-伯爵经典-gvfc",
    siteId: "penboutique",
    siteName: "Pen Boutique",
    homepageUrl: "https://www.penboutique.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Graf von Faber-Castell Classic Platinum-Plated Fountain Pen",
    url: "https://www.penboutique.com/products/graf-von-faber-castell-classic-platinum-plated-fountain-pen",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0046/3421/4518/files/Graf-Von-Faber-Castell-Classic-Platinum-Plated-Fountain-Pen-Graf-Von-Faber-Castell-43070673.png?v=1708839896&width=1200",
  },
  {
    slug: "凌美-lamy-logo",
    siteId: "goulet",
    siteName: "Goulet Pens",
    homepageUrl: "https://www.gouletpens.com/",
    sourceType: "blog",
    itemType: "quick_look_article",
    license: "copyrighted retailer article",
    title: "LAMY logo Fountain Pen: Quick Look",
    url: "https://www.gouletpens.com/blogs/fountain-pen-blog/lamy-logo-quick-look",
    imageUrl: "https://cdn.shopify.com/s/files/1/2603/2528/articles/logo.webp?v=1679345752",
  },
  {
    slug: "写乐-sailor-0501铱金",
    siteId: "amazon-es",
    siteName: "Amazon Spain",
    homepageUrl: "https://www.amazon.es/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Sailor 11-0501-720 Young Profit fountain pen",
    url: "https://www.amazon.es/Marinero-estilogr%C3%A1fica-j%C3%B3venes-profesional-720-negro/dp/B003UM3KUM",
    imageUrl: "https://m.media-amazon.com/images/I/71S6y03DG2L._AC_SL1500_.jpg",
  },
  {
    slug: "写乐-sailor-1029银夹鱼雷",
    siteId: "pensachi",
    siteName: "PenSachi",
    homepageUrl: "https://www.pensachi.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "SAILOR 1911 Standard (Mid size) Fountain Pen - Black Silver",
    url: "https://www.pensachi.com/products/11-1029",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0003/4442/4457/products/IMG_1253_3b81b869-a5f6-4841-b4c1-b5b81d544dd7_grande.jpg?v=1579745131",
  },
  {
    slug: "写乐-sailor-promenade漫步1031",
    siteId: "pensachi",
    siteName: "PenSachi",
    homepageUrl: "https://www.pensachi.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "SAILOR Promenade Fountain Pen - Sparkling Red Gold",
    url: "https://www.pensachi.com/products/11-1031-230",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0003/4442/4457/products/IMG_4128_grande.jpg?v=1571712409",
  },
  {
    slug: "坛笔-penbbs-268",
    siteId: "deskbandit",
    siteName: "Desk Bandit",
    homepageUrl: "https://deskbandit.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "PENBBS 268 - Clear / Silver (Fine)",
    url: "https://deskbandit.com/products/penbbs-268-clear-silver-fine",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/2267/8527/files/268-16SF_2e2ce630-e730-4fa4-9e5a-389a3829a3f2.jpg?v=1758389607",
  },
  {
    slug: "坛笔-penbbs-456",
    siteId: "gentlemanstationer",
    siteName: "The Gentleman Stationer",
    homepageUrl: "https://www.gentlemanstationer.com/",
    sourceType: "blog",
    itemType: "review_article",
    license: "copyrighted review article",
    title: "Pen Review: PenBBS 456 (Vacuum-Filler) Fountain Pen",
    url: "https://www.gentlemanstationer.com/blog/2019/6/7/pen-review-penbbs-456-vacuum-filler-fountain-pen",
    imageUrl:
      "https://images.squarespace-cdn.com/content/v1/5349ba13e4b095a3fb0ba65c/1560018248285-XK5PULHMK4AX4V38J4QQ/IMG_1541.jpg",
  },
  {
    slug: "坛笔-penbbs-469",
    siteId: "wellappointeddesk",
    siteName: "The Well-Appointed Desk",
    homepageUrl: "https://www.wellappointeddesk.com/",
    sourceType: "blog",
    itemType: "review_article",
    license: "copyrighted review article",
    title: "PenBBS 469 Double Nib Fountain Pen review",
    url: "https://www.wellappointeddesk.com/2022/01/fountain-pen-review-penbbs-469-double-nib-fountain-pen/",
    imageUrl:
      "https://i0.wp.com/www.wellappointeddesk.com/wp-content/uploads/2022/01/PenBBS469-4.jpg?fit=1200%2C1000&ssl=1",
  },
  {
    slug: "坛笔-penbbs-494",
    siteId: "amazon-de",
    siteName: "Amazon Germany",
    homepageUrl: "https://www.amazon.de/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Lanxivi Penbbs 494 Piston Fountain Pen Fine Nib",
    url: "https://www.amazon.de/-/en/Lanxivi-Penbbs-494-Fountain-Fine/dp/B07VD4V8YB",
    imageUrl: "https://m.media-amazon.com/images/I/317ZDoWHS3L._AC_.jpg",
  },
  {
    slug: "永生-wingsung-236",
    siteId: "fountainpennetwork",
    siteName: "The Fountain Pen Network",
    homepageUrl: "https://www.fountainpennetwork.com/",
    sourceType: "blog",
    itemType: "forum_review_thread",
    license: "copyrighted forum thread",
    title: "Informal Review - Wing Sung 236",
    url: "https://www.fountainpennetwork.com/forum/topic/260872-informal-review-wing-sung-236/",
    imageUrl: "https://www.fountainpennetwork.com/forum/uploads/imgs/fpn_1392248562__img_0013.jpg",
  },
  {
    slug: "永生-wingsung-3013",
    siteId: "andyspens",
    siteName: "Andy's Pens",
    homepageUrl: "https://www.andys-pens.co.uk/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Wing Sung 3013, Transparent",
    url: "https://www.andys-pens.co.uk/wing-sung-3013-transparent",
    imageUrl:
      "https://www.andys-pens.co.uk/image/cache/catalog/wingsung/wing-sung-3013-transparent-6048-750x750.jpg",
  },
  {
    slug: "永生-wingsung-322",
    siteId: "fountainpenindia",
    siteName: "Fountain Pen India",
    homepageUrl: "https://www.fountainpenindia.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "WingSung 322 Fountain Pen",
    url: "https://www.fountainpenindia.com/product-page/wingsung-322-fountain-pen",
    imageUrl: "https://www.fountainpenindia.com/product-page/3a469b_af7e0887903e46b7971b56c841e1b96c~mv2.jpg",
  },
  {
    slug: "永生-wingsung-840",
    siteId: "montgomerypens",
    siteName: "Montgomery Pens",
    homepageUrl: "https://www.montgomerypens.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Wing Sung 840 Red and Gold Plated Fountain Pen Fine Nib",
    url: "https://www.montgomerypens.com/wing-sung-840-red-and-gold-plated-fountain-pen-fine-nib",
    imageUrl:
      "https://www.montgomerypens.com/images/thumbs/0010073_wing-sung-840-red-and-gold-plated-fountain-pen-fine-nib_225.jpeg",
  },
  {
    slug: "永生-wingsung-729",
    siteId: "minapens",
    siteName: "Minapens",
    homepageUrl: "https://minapens.vn/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "But may co WingSung 729",
    url: "https://minapens.vn/antique_pen/but-may-co-wingsung-729",
    imageUrl: "https://minapens.vn/wp-content/uploads/2023/08/2-16.jpg",
  },
  {
    slug: "金豪-jinhao-619",
    siteId: "awesomepens",
    siteName: "AwesomePens",
    homepageUrl: "https://awesomepens.co.uk/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "JINHAO 619 Fountain Pen",
    url: "https://awesomepens.co.uk/product/jinhao-619-fountain-pen/",
    imageUrl: "https://awesomepens.co.uk/wp-content/uploads/2025/07/JINHAO-619-Fountain-Pen-Clear-black-1.jpg",
  },
  {
    slug: "金豪-jinhao-86",
    siteId: "amazon-us",
    siteName: "Amazon US",
    homepageUrl: "https://www.amazon.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "3 Jinhao 86 Fountain Pen Set",
    url: "https://www.amazon.com/Jinhao-Fountain-Black-Refillable-Converter/dp/B0BY8CZHJT",
    imageUrl: "https://m.media-amazon.com/images/I/61frA2GgA1L._AC_SL1500_.jpg",
  },
  {
    slug: "金豪-jinhao-9035",
    siteId: "amazon-in",
    siteName: "Amazon India",
    homepageUrl: "https://www.amazon.in/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Jinhao 9035 Red Rosewood Wooden Fountain Pen",
    url: "https://www.amazon.in/GOLD-LEAF-Jinhao-Rosewood-Fountain/dp/B082YCNLNZ",
    imageUrl: "https://m.media-amazon.com/images/I/51S3QP0eVGL.jpg",
  },
  {
    slug: "金豪-jinhao-9056木杆",
    siteId: "amazon-us",
    siteName: "Amazon US",
    homepageUrl: "https://www.amazon.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "JINHAO 9056 Natural Wood Fountain Pen",
    url: "https://www.amazon.com/JINHAO-Natural-Fountain-Handmade-Medium/dp/B095HFQHJP",
    imageUrl: "https://m.media-amazon.com/images/I/51XVhN+iwiL._AC_SL1050_.jpg",
  },
  {
    slug: "末匠-majohn-80mini-e",
    siteId: "everythingcalligraphy",
    siteName: "Everything Calligraphy",
    homepageUrl: "https://www.everythingcalligraphy.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Majohn 80 Mini -E Short (Moonman) Fountain Pen",
    url: "https://www.everythingcalligraphy.com/products/moonman-80-mini-e-short-fountain-pen",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0905/3760/products/1_0aaa6bff-932e-4189-a9f4-c38b46b48f7d.jpg?v=1626057336",
  },
  {
    slug: "末匠-majohn-f9法师",
    siteId: "everythingcalligraphy",
    siteName: "Everything Calligraphy",
    homepageUrl: "https://www.everythingcalligraphy.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Majohn F9 (Moonman) Fountain Pen",
    url: "https://www.everythingcalligraphy.com/products/moonman-majohn-f9-fountain-pen",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0905/3760/products/s-l1600_db2738cc-4c36-43ae-8401-e206947ba728.jpg?v=1669970680",
  },
  {
    slug: "末匠-majohn-p140",
    siteId: "moonmanpen",
    siteName: "MoonmanPen",
    homepageUrl: "https://moonmanpen.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Moonman P140 Clear Demonstrator Fountain Pen",
    url: "https://moonmanpen.com/products/moonman-p140-clear-demonstrator-fountain-pen-brass-piston-filling-system-size-8-sun-carved-nib-transparent-resin-body",
    imageUrl: "https://cdn.shopify.com/s/files/1/0870/6346/2210/files/H54a00c25c98e484ba7f8c64ce0609949Z.jpg?v=1777550895",
  },
  {
    slug: "末匠-majohn-p141-钛合金",
    siteId: "moonmanpen",
    siteName: "MoonmanPen",
    homepageUrl: "https://moonmanpen.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Majohn P141 Titanium Alloy Fountain Pen",
    url: "https://moonmanpen.com/products/majohn-p141-titanium-alloy-fountain-pen-size-8-f-nib-ink-window-gold-clip",
    imageUrl: "https://cdn.shopify.com/s/files/1/0870/6346/2210/files/71U6IY1qn2L._SL1500.jpg?v=1724351832",
  },
  {
    slug: "末匠-majohn-v60",
    siteId: "amazon-us",
    siteName: "Amazon US",
    homepageUrl: "https://www.amazon.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Majohn V60 Triangular Piston Fountain Pen",
    url: "https://www.amazon.com/erofa-Majohn-Triangular-Fountain-Writing/dp/B0DK2XBD5F",
    imageUrl: "https://m.media-amazon.com/images/I/71TurrMledL._AC_SL1500_.jpg",
  },
  {
    slug: "弘典-hongdian-516",
    siteId: "amazon-de",
    siteName: "Amazon Germany",
    homepageUrl: "https://www.amazon.de/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Hongdian 516 Series Bright Silver Fine Nib Fountain Pen",
    url: "https://www.amazon.de/-/en/Hongdian-Bright-Silver-Fountain-Stainless/dp/B08DQYGF56",
    imageUrl: "https://m.media-amazon.com/images/I/51e669XZ1kL._AC_SL1200_.jpg",
  },
  {
    slug: "大公-dagong-56揿动式",
    siteId: "cronicasestilograficas",
    siteName: "Cronicas Estilograficas",
    homepageUrl: "https://estilofilos.blogspot.com/",
    sourceType: "blog",
    itemType: "review_article",
    license: "copyrighted review article",
    title: "Matching (XIX). Dagong 56",
    url: "https://estilofilos.blogspot.com/2016/02/matching-xix-dagong-56.html",
    imageUrl:
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjzVuLHpMHP_rr7KgvYBNlk6c33eRA8jDCTkPTe4yOJFPr4BrNY70i3PiAFP9jCBXRmhtyz5ZguPKoF3DdrxYQPvisKCrRUDxwLlsiqv-aoBP786fwrWf7GRqkaSsgnU0pu3xXc_Um0Gs96/w1200-h630-p-k-no-nu/P1050044-blog-WM.jpg",
  },
  {
    slug: "弘典-hongdian-n6云章",
    siteId: "makoba",
    siteName: "Makoba",
    homepageUrl: "https://makoba.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Hongdian N6 Fountain Pens",
    url: "https://makoba.com/collections/hongdian-n6-fountain-pens",
    imageUrl: "https://cdn.shopify.com/s/files/1/0582/0819/0643/collections/Hongdian_N6_Fountain_Pens.jpg?v=1782566277",
  },
  {
    slug: "弘典-hongdian-秦",
    siteId: "amazon-us",
    siteName: "Amazon US",
    homepageUrl: "https://www.amazon.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Hongdian D5X Qin Dynasty Retro Chinese Totem Fountain Pen",
    url: "https://www.amazon.com/Hongdian-D5X-Fountain-Engraving-Converter/dp/B0G6DSLX9L",
    imageUrl: "https://m.media-amazon.com/images/I/61H1GzjBFTL._AC_SL1500_.jpg",
  },
  {
    slug: "弘典-hongdian-远航者",
    siteId: "daraz-lk",
    siteName: "Daraz Sri Lanka",
    homepageUrl: "https://www.daraz.lk/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Hongdian 1843 Voyager Series Metal Wave Pattern Fountain Pen",
    url: "https://www.daraz.lk/products/the-quiet-pagehongdian-1843-voyager-series-metal-wave-pattern-stainless-fountain-pen-beautiful-ripples-iridium-ef-f-nib-classic-pens-i546644458.html",
    imageUrl: "https://img.drz.lazcdn.com/static/lk/p/a7b88af0287115643faa164cb1c166b3.jpg_720x720q80.jpg",
  },
  {
    slug: "得力克-delike-元素系列",
    siteId: "everythingcalligraphy",
    siteName: "Everything Calligraphy",
    homepageUrl: "https://www.everythingcalligraphy.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Delike Element Fountain Pen",
    url: "https://www.everythingcalligraphy.com/products/delike-element-fountain-pen",
    imageUrl: "https://cdn.shopify.com/s/files/1/0905/3760/files/Sf0dfaa5f2ad54120b20048c74164cb4ft.jpg?v=1689327407",
  },
  {
    slug: "文采-kaco-edge刀锋",
    siteId: "swastikpenn",
    siteName: "Swastik Penn",
    homepageUrl: "https://www.swastikpenn.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "KACO Fountain Pen - EDGE BLACK",
    url: "https://www.swastikpenn.com/products/kaco-fountain-pen-edge-black",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/0032/7365/4317/products/21_001cf3eb-260c-4598-89b3-99d64df5195f_1200x1200.jpg?v=1635232375",
  },
  {
    slug: "施耐德-schneider-bk402",
    siteId: "daraz-bd",
    siteName: "Daraz Bangladesh",
    homepageUrl: "https://www.daraz.com.bd/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Schneider BK402 student calligraphy ink pen",
    url: "https://www.daraz.com.bd/products/schneider-schneider-bk402-student-children-calligraphy-pen-mens-and-womens-ink-pen-without-ink-i1575932234.html",
    imageUrl: "https://img.drz.lazcdn.com/collect/cbu/img/ibank/2556337542_109470667.jpg_720x720q80.jpg_.webp",
  },
  {
    slug: "晨光-按动钢笔",
    siteId: "noon-sa",
    siteName: "Noon Saudi Arabia",
    homepageUrl: "https://www.noon.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "M&G Chenguang AFPU9902 Retractable Fountain Pen",
    url: "https://www.noon.com/saudi-en/chenguang-stationery-0-38mm-ef-fine-nib-retractable-fountain-pen-2-pack-3-4mm-diameter-replaceable-ink-cartridge-fountain-pen-student-calligraphy-writing-ink-pen-afpu9902/ZAA6E6C6F6A482464CE15Z/p/?o=a52d9369bf1b7bbc",
    imageUrl:
      "https://f.nooncdn.com/p/pzsku/ZAA6E6C6F6A482464CE15Z/45/_/1779791694/e0faf5c5-ecdf-4970-a985-8350996a5a1b.jpg?width=1200",
  },
  {
    slug: "烂笔头-lanbitou-3059",
    siteId: "andyspens",
    siteName: "Andy's Pens",
    homepageUrl: "https://www.andys-pens.co.uk/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Lanbitou 3059 Fountain Pen, Green",
    url: "https://www.andys-pens.co.uk/lanbitou-3059-fountain-pen-green",
    imageUrl:
      "https://www.andys-pens.co.uk/image/cache/catalog/lanbitou/lanbitou-3059-fountain-pen-green-4377-750x750.jpg",
  },
  {
    slug: "欧领-campus-校园系列",
    siteId: "onlinepen",
    siteName: "ONLINE official shop",
    homepageUrl: "https://www.online-pen.com/",
    sourceType: "official",
    itemType: "official_product_page",
    license: "copyrighted official product page",
    title: "Fountain Pen Campus Color Line",
    url: "https://www.online-pen.com/fountain-pen-campus-color-line-shopname-/61100/3d",
    imageUrl: "https://www.online-pen.com/media/e8/46/45/1689590153/611003D_1_W_3636.jpg?ts=1689590153",
  },
  {
    slug: "犀飞利-sheaffer-帝国元首",
    siteId: "penhero",
    siteName: "PenHero",
    homepageUrl: "https://penhero.com/",
    sourceType: "blog",
    itemType: "reference_article",
    license: "copyrighted reference article",
    title: "Early Sheaffer Imperials 1961-1962",
    url: "https://penhero.com/PenGallery/Sheaffer/SheafferImperialsEarly.htm",
    imageUrl: "https://penhero.com/PenGallery/Sheaffer/Pics/SheafferImperialEarly02.jpg",
  },
  {
    slug: "白雪-fp20",
    siteId: "snowhite",
    siteName: "Snowhite official site",
    homepageUrl: "https://www.china-snowhite.com/",
    sourceType: "official",
    itemType: "official_product_page",
    license: "copyrighted official product page",
    title: "Snowhite Disposable fountain pen FP20",
    url: "https://www.china-snowhite.com/Product/Disposable-fountain-pen-FP20.html",
    imageUrl: "https://www.china-snowhite.com/uploadfiles/128.1.164.122/webid951/source/202601/5963617684707035.jpg",
  },
  {
    slug: "百利金-pelikan-p457",
    siteId: "amazon-us",
    siteName: "Amazon US",
    homepageUrl: "https://www.amazon.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Pelikan Twist P457/M Pure Gold Fountain Pen",
    url: "https://www.amazon.com/Pelikan-Twist-P457-Pure-Fountain/dp/B08N1BSL33",
    imageUrl: "https://m.media-amazon.com/images/I/51thUkpXihL._AC_SL1000_.jpg",
  },
  {
    slug: "铃兰-lily-910-capless",
    siteId: "cronicasestilograficas",
    siteName: "Cronicas Estilograficas",
    homepageUrl: "https://estilofilos.blogspot.com/",
    sourceType: "blog",
    itemType: "review_article",
    license: "copyrighted review article",
    title: "Matching (XXII). Lily 910",
    url: "https://estilofilos.blogspot.com/2017/01/matching-xxii-lily-910.html",
    imageUrl:
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgwebhL721PdZoVQfaPx8xQhZS39NpRLNMBMxnxpHQgIXENVgfaBXbeL62OvS4kDFmtOE703qTO5u_GjD4oW82oH3x8xrhyphenhyphenT_flovPXcG_FXw2fZPw6mWA9eGWbUHUGLrHkFP8q7Yn7xeWl/w1200-h630-p-k-no-nu/IMG_9531-blog-WM.jpg",
  },
  {
    slug: "万宝龙-montblanc-学生龙22",
    siteId: "peytonstreetpens",
    siteName: "Peyton Street Pens",
    homepageUrl: "https://www.peytonstreetpens.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Montblanc 22 Fountain Pen - 1960s, Grey, 14k Extra Fine Nib",
    url: "https://www.peytonstreetpens.com/montblanc-22-fountain-pen-1960s-grey-14k-extra-fine-nib-piston-filler-excellent-works-well.html",
    imageUrl:
      "https://cdn11.bigcommerce.com/s-5ko0zosub2/images/stencil/1280x1280/products/5892/7979/mb22_grey_1__98606.1606154238.jpg?c=1",
  },
  {
    slug: "tramol-梵高系列",
    siteId: "jd",
    siteName: "JD",
    homepageUrl: "https://www.jd.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Tramol 梵高系列钢笔杏花礼盒装",
    url: "https://item.jd.com/10222332297409.html",
    imageUrl:
      "https://img30.360buyimg.com/imgzone/jfs/t1/436264/21/6703/103248/6a0b0d6eF57732f8a/0083320320d3b27a.jpg",
  },
  {
    slug: "依人-yiren-878",
    siteId: "jd",
    siteName: "JD",
    homepageUrl: "https://www.jd.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "YIREN 依人 878 镀银钢笔",
    url: "https://item.jd.com/10188077836835.html",
    imageUrl:
      "https://img30.360buyimg.com/imgzone/jfs/t1/295906/7/19295/83271/68daf7e3Fa34b22f7/a9127ad3a465b870.jpg",
  },
  {
    slug: "白金-platinum-富士旬景pnb-13000",
    siteId: "platinum",
    siteName: "Platinum official site",
    homepageUrl: "https://www.platinum-pen.co.jp/",
    sourceType: "official",
    itemType: "official_product_page",
    license: "copyrighted official product page",
    title: "Platinum Fuji Shunkei Series Kinshu",
    url: "https://www.platinum-pen.co.jp/en/news/detail/?pid=10162",
    imageUrl:
      "https://www.platinum-pen.co.jp/cms/wp-content/uploads/2021/04/d5ce11b244188f556c5d98bad9af0d85.jpg",
  },
  {
    slug: "并木-namiki-飞升龙",
    siteId: "elephant-coral",
    siteName: "Elephant-Coral",
    homepageUrl: "https://www.elephant-coral.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Pilot Namiki 95th Anniversary Rising Dragon Limited Edition",
    url: "https://www.elephant-coral.com/fine-pens/535-pilot-95th-anniversary-rising-dragon-limited-edition.html",
    imageUrl:
      "https://www.elephant-coral.com/959-large_default/pilot-95th-anniversary-rising-dragon-limited-edition.jpg",
  },
  {
    slug: "弘典-hongdian-苏木",
    siteId: "jd",
    siteName: "JD",
    homepageUrl: "https://www.jd.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "HongDian 1866 苏木原木钢笔礼盒",
    url: "https://item.jd.com/100058687373.html",
    imageUrl:
      "https://img30.360buyimg.com/imgzone/jfs/t1/147646/1/49536/85844/6731b79eF5177e42a/f8b6bafbcf93ca1d.jpg",
  },
  {
    slug: "金豪-jinhao-纯银镂空世纪",
    siteId: "nonopen",
    siteName: "非原木铅笔",
    homepageUrl: "https://www.nonopen.com/",
    sourceType: "blog",
    itemType: "review_article",
    license: "copyrighted review article",
    title: "金豪纯银版镂空世纪钢笔评测",
    url: "https://www.nonopen.com/52786.html",
    imageUrl: "https://www.nonopen.com/wp-content/uploads/2023/05/2023050416202540.jpg",
  },
  {
    slug: "高仕-cross-莎士比亚",
    siteId: "jd",
    siteName: "JD",
    homepageUrl: "https://www.jd.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "CROSS Stratford / 莎士比亚系列钢笔宝石蓝白夹",
    url: "https://item.jd.com/100082917635.html",
    imageUrl:
      "https://img14.360buyimg.com/imgzone/jfs/t1/397510/12/7577/81092/69a14298F2fe8b386/008332032003bb9f.jpg",
  },
  {
    slug: "派利-002",
    siteId: "amazon-in",
    siteName: "Amazon India",
    homepageUrl: "https://www.amazon.in/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Paili 002 Demonstrator Fountain Pens Extra Fine Nib",
    url: "https://www.amazon.in/Ledos-Paili-Demonstrator-Fountain-Golden/dp/B0DQ1Z15SR",
    imageUrl: "https://m.media-amazon.com/images/I/71zOjfaO0tL._SL1500_.jpg",
  },
  {
    slug: "意斯华-p36",
    siteId: "amazon-us",
    siteName: "Amazon US",
    homepageUrl: "https://www.amazon.com/",
    sourceType: "retailer",
    itemType: "retailer_product_page",
    license: "copyrighted retailer product page",
    title: "Asvine P36 Titanium Piston Fountain Pen",
    url: "https://www.amazon.com/Asvine-Titanium-Fountain-Transparent-Signature/dp/B0C6G422TD",
    imageUrl: "https://m.media-amazon.com/images/I/51sUEww4aCL._AC_SL1500_.jpg",
  },
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

async function execute<T extends Record<string, unknown>>(
  db: Client,
  sql: string,
  args: unknown[] = [],
) {
  const result = await db.execute({ sql, args: args as InArgs });
  return result.rows.map((row) => row as T);
}

function mediaId(entityId: string, productUrl: string, imageUrl: string) {
  return `media-commerce-${createHash("sha1")
    .update(`${entityId}:${productUrl}:${imageUrl}`)
    .digest("hex")
    .slice(0, 14)}`;
}

function sourceRegistryId(site: CommerceSite) {
  return `retailer-${site.id}`;
}

function sourceItemId(site: CommerceSite, productUrl: string) {
  return `source-commerce-${site.id}-${createHash("sha1")
    .update(productUrl)
    .digest("hex")
    .slice(0, 14)}`;
}

function entityReferenceId(entityId: string, itemId: string) {
  return `eref-commerce-${createHash("sha1")
    .update(`${entityId}:${itemId}`)
    .digest("hex")
    .slice(0, 14)}`;
}

function cleanHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function normalizeText(value: string) {
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    decoded = value;
  }
  return decoded
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[’']s\b/g, "")
    .replace(/[’']/g, "")
    .replace(/([a-z0-9])([\u4e00-\u9fff])/gi, "$1 $2")
    .replace(/([\u4e00-\u9fff])([a-z0-9])/gi, "$1 $2")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(/\s+/)
    .filter((word) => word.length >= 2 || /^[a-z]\d{2,}$/i.test(word))
    .filter((word) => !STOPWORDS.has(word));
}

function brandTokens(row: PenRow) {
  const raw = row.brandName || row.name;
  return [...new Set(tokenize(raw))]
    .flatMap((word) => (word === "wingsung" ? ["wing", "sung"] : [word]))
    .slice(0, 4);
}

function modelTokens(row: PenRow) {
  const brands = new Set(brandTokens(row));
  const raw = `${row.name} ${row.seriesName || ""}`;
  return [...new Set(tokenize(raw))]
    .filter((word) => !brands.has(word))
    .filter((word) => !/^(按|分开|阅读|型号|身份|区分|待定)$/.test(word))
    .slice(0, 10);
}

function hasAliasModelName(row: PenRow) {
  const raw = `${row.name} ${row.seriesName || ""}`;
  return /\/|identity pending|身份|分开|待定/i.test(raw);
}

function latinQuery(row: PenRow) {
  const required = requiredModelHits(row);
  const modelParts =
    required.length > 0
      ? hasAliasModelName(row)
        ? required.slice(0, 1)
        : required
      : modelTokens(row);
  const parts = [...brandTokens(row), ...modelParts]
    .filter((word) => /^[a-z0-9]+$/i.test(word) || /^\d+$/.test(word))
    .filter((word) => !["fp", "ef", "f", "m", "b", "14k", "18k", "21k"].includes(word));
  if (parts.length < 2) return "";
  return `${[...new Set(parts)].join(" ")} fountain pen`;
}

function requiredModelHits(row: PenRow) {
  const models = modelTokens(row);
  const numeric = models.filter(
    (word) => /^(?:[a-z]\d{2,}[a-z]?|\d{2,}[a-z]?)$/.test(word) && !/^\d{2}k$/.test(word),
  );
  if (numeric.length > 0) return numeric;
  const latin = models.filter((word) => /^[a-z0-9]+$/i.test(word) && word.length >= 2);
  return latin.slice(0, 2);
}

function tokenMatches(value: string, token: string) {
  const normalized = normalizeText(value);
  if (/^(?:[a-z]\d{2,}[a-z]?|\d{2,}[a-z]?|[a-z]{1,2})$/.test(token)) {
    const words = normalized.split(/\s+/);
    return words.includes(token) || words.includes(`e${token}`);
  }
  if (/^[a-z]+\d+[a-z]*$/i.test(token)) {
    const compact = normalized.replace(/\s+/g, "");
    return compact.includes(token);
  }
  return normalized.includes(token);
}

function matchesProduct(row: PenRow, value: string) {
  const text = normalizeText(value);
  const brands = brandTokens(row);
  const required = requiredModelHits(row);
  const brandHit = brands.length === 0 || brands.some((token) => tokenMatches(text, token));
  const modelHit =
    required.length > 0 &&
    (hasAliasModelName(row)
      ? tokenMatches(text, required[0])
      : required.every((token) => tokenMatches(text, token)));
  return brandHit && modelHit;
}

function isInkLike(row: PenRow) {
  return /iroshizuku|ink|墨水|色彩雫/i.test(`${row.slug} ${row.name} ${row.seriesName || ""}`);
}

function matchesProductType(row: PenRow, value: string) {
  const text = normalizeText(value);
  if (isInkLike(row)) return /ink|bottle|iroshizuku/.test(text);
  return text.includes("fountain pen");
}

function absoluteUrl(raw: string, baseUrl: string) {
  const first = cleanHtml(raw).split(",")[0]?.trim().split(/\s+/)[0] || raw;
  try {
    const url = new URL(first.startsWith("//") ? `https:${first}` : first, baseUrl);
    if (
      url.protocol === "http:" &&
      /^(cdn\.shopify\.com|static1\.squarespace\.com|images\.squarespace-cdn\.com)$/.test(
        url.hostname,
      )
    ) {
      url.protocol = "https:";
    }
    return url.toString();
  } catch {
    return "";
  }
}

async function fetchText(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,*/*",
        "accept-language": "en-US,en;q=0.9",
      },
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function extractProductLinks(html: string, baseUrl: string, row: PenRow) {
  const links = new Map<string, ProductCandidate>();
  const anchorPattern = /<a\b([^>]+)>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(anchorPattern)) {
    const attrs = match[1];
    const href = attrs.match(/\shref=["']([^"']+)["']/i)?.[1];
    if (!href || !/\/products?\//i.test(href)) continue;
    const url = absoluteUrl(href, baseUrl).replace(/\?.*$/, "");
    const text = cleanHtml(match[2].replace(/<[^>]+>/g, " "));
    const combined = `${url} ${text}`;
    if (!matchesProductType(row, combined)) continue;
    if (!matchesProduct(row, combined)) continue;
    const score =
      10 +
      requiredModelHits(row).filter((token) => tokenMatches(combined, token)).length *
        4;
    const existing = links.get(url);
    if (!existing || existing.score < score) {
      links.set(url, { url, title: text.slice(0, 180), score });
    }
  }
  return [...links.values()].sort((a, b) => b.score - a.score).slice(0, 3);
}

function extractImages(html: string, pageUrl: string, row: PenRow) {
  const images = new Map<string, ImageCandidate>();
  const add = (raw: string, reason: string, score = 0) => {
    const url = absoluteUrl(raw, pageUrl);
    if (!url || BAD_IMAGE_PATTERN.test(url)) return;
    if (normalizeText(url).includes("tsamsa pens")) return;
    if (!/\.(webp|jpe?g|png)(\?|$)/i.test(url)) return;
    if (reason === "image-tag" && !matchesProduct(row, url)) return;
    if (!matchesProduct(row, `${url} ${pageUrl}`)) return;
    const hitCount = requiredModelHits(row).filter((token) =>
      tokenMatches(`${url} ${pageUrl}`, token),
    ).length;
    const candidate = {
      url,
      score:
        score +
        hitCount * 4 +
        (url.includes("cdn.shopify.com") ? 2 : 0) +
        (/\/product/i.test(url) ? 2 : 0),
      reason,
    };
    const existing = images.get(url);
    if (!existing || existing.score < candidate.score) images.set(url, candidate);
  };

  for (const match of html.matchAll(
    /<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src)["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
  )) {
    add(match[1], "meta", 4);
  }
  for (const match of html.matchAll(
    /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src)["'][^>]*>/gi,
  )) {
    add(match[1], "meta", 4);
  }
  for (const match of html.matchAll(
    /<(?:img|source)\b[^>]+(?:src|data-src|data-original|data-lazy-src|srcset|data-srcset)=["']([^"']+)["'][^>]*>/gi,
  )) {
    add(match[1], "image-tag", 2);
  }
  for (const match of html.matchAll(/"image"\s*:\s*"([^"]+)"/gi)) {
    add(match[1], "json-ld", 4);
  }

  return [...images.values()].sort((a, b) => b.score - a.score)[0] || null;
}

async function ensureCommerceSourceItem(
  db: Client,
  site: CommerceSite,
  pen: PenRow,
  product: ProductCandidate,
) {
  const sourceId = sourceRegistryId(site);
  const itemId = sourceItemId(site, product.url);
  await db.execute({
    sql: `INSERT INTO source_registry
            (id, name, source_type, allowed_use, reliability, license, attribution,
             homepage_url, fetch_method, notes, last_checked_at, updated_at)
          VALUES (?, ?, 'retailer', 'metadata_only', 'medium',
                  'copyrighted retailer content', ?, ?, 'html scrape',
                  'Used only for product-page metadata, source link, and externally hosted product image URL.',
                  datetime('now'), datetime('now'))
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            source_type = excluded.source_type,
            allowed_use = excluded.allowed_use,
            reliability = excluded.reliability,
            license = excluded.license,
            attribution = excluded.attribution,
            homepage_url = excluded.homepage_url,
            fetch_method = excluded.fetch_method,
            notes = excluded.notes,
            last_checked_at = excluded.last_checked_at,
            updated_at = datetime('now')`,
    args: [
      sourceId,
      site.name,
      site.name,
      new URL(product.url).origin,
    ] as InArgs,
  });
  await db.execute({
    sql: `INSERT INTO source_items
            (id, source_id, title, url, item_type, license, author, retrieved_at,
             summary, raw_metadata_json, allowed_use, review_status, updated_at)
          VALUES (?, ?, ?, ?, 'retailer_product_page', 'copyrighted retailer product page',
                  ?, datetime('now'), ?, ?, 'metadata_only', 'approved', datetime('now'))
          ON CONFLICT(id) DO UPDATE SET
            source_id = excluded.source_id,
            title = excluded.title,
            url = excluded.url,
            item_type = excluded.item_type,
            license = excluded.license,
            author = excluded.author,
            retrieved_at = excluded.retrieved_at,
            summary = excluded.summary,
            raw_metadata_json = excluded.raw_metadata_json,
            allowed_use = excluded.allowed_use,
            review_status = excluded.review_status,
            updated_at = datetime('now')`,
    args: [
      itemId,
      sourceId,
      product.title || pen.name,
      product.url,
      site.name,
      `Retailer product page matched to ${pen.name}.`,
      JSON.stringify({ site: site.name, productScore: product.score }),
    ] as InArgs,
  });
  await db.execute({
    sql: `INSERT INTO entity_references
            (id, entity_id, source_item_id, relation_type, note, review_status)
          VALUES (?, ?, ?, 'reference', ?, 'approved')
          ON CONFLICT(entity_id, source_item_id, relation_type) DO UPDATE SET
            note = excluded.note,
            review_status = excluded.review_status`,
    args: [
      entityReferenceId(pen.entityId, itemId),
      pen.entityId,
      itemId,
      `Retailer product page used for ${pen.name} product image.`,
    ] as InArgs,
  });
  return itemId;
}

async function ensureManualProductSourceItem(
  db: Client,
  page: ManualProductPage,
  pen: PenRow,
) {
  const sourceId = `product-source-${page.siteId}`;
  const itemId = `source-product-${page.siteId}-${createHash("sha1")
    .update(page.url)
    .digest("hex")
    .slice(0, 14)}`;
  await db.execute({
    sql: `INSERT INTO source_registry
            (id, name, source_type, allowed_use, reliability, license, attribution,
             homepage_url, fetch_method, notes, last_checked_at, updated_at)
          VALUES (?, ?, ?, 'metadata_only', 'medium',
                  ?, ?, ?, 'html scrape',
                  'Used only for source link, metadata, and externally hosted product image URL.',
                  datetime('now'), datetime('now'))
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            source_type = excluded.source_type,
            allowed_use = excluded.allowed_use,
            reliability = excluded.reliability,
            license = excluded.license,
            attribution = excluded.attribution,
            homepage_url = excluded.homepage_url,
            fetch_method = excluded.fetch_method,
            notes = excluded.notes,
            last_checked_at = excluded.last_checked_at,
            updated_at = datetime('now')`,
    args: [
      sourceId,
      page.siteName,
      page.sourceType,
      page.license,
      page.siteName,
      page.homepageUrl,
    ] as InArgs,
  });
  await db.execute({
    sql: `INSERT INTO source_items
            (id, source_id, title, url, item_type, license, author, retrieved_at,
             summary, raw_metadata_json, allowed_use, review_status, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, 'metadata_only',
                  'approved', datetime('now'))
          ON CONFLICT(id) DO UPDATE SET
            source_id = excluded.source_id,
            title = excluded.title,
            url = excluded.url,
            item_type = excluded.item_type,
            license = excluded.license,
            author = excluded.author,
            retrieved_at = excluded.retrieved_at,
            summary = excluded.summary,
            raw_metadata_json = excluded.raw_metadata_json,
            allowed_use = excluded.allowed_use,
            review_status = excluded.review_status,
            updated_at = datetime('now')`,
    args: [
      itemId,
      sourceId,
      page.title,
      page.url,
      page.itemType,
      page.license,
      page.siteName,
      `Manually reviewed source page matched to ${pen.name}.`,
      JSON.stringify({ site: page.siteName, manualProductPage: true }),
    ] as InArgs,
  });
  await db.execute({
    sql: `INSERT INTO entity_references
            (id, entity_id, source_item_id, relation_type, note, review_status)
          VALUES (?, ?, ?, 'reference', ?, 'approved')
          ON CONFLICT(entity_id, source_item_id, relation_type) DO UPDATE SET
            note = excluded.note,
            review_status = excluded.review_status`,
    args: [
      entityReferenceId(pen.entityId, itemId),
      pen.entityId,
      itemId,
      `Manually reviewed product image source for ${pen.name}.`,
    ] as InArgs,
  });
  return itemId;
}

function siteForProductUrl(url: string) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  return SITES.find((site) => {
    const siteHost = new URL(site.searchUrl("")).hostname.replace(/^www\./, "");
    return host === siteHost || host.endsWith(`.${siteHost}`);
  });
}

async function repairExistingCommerceMedia(db: Client) {
  const rows = await execute<BrokenCommerceMedia>(
    db,
    `SELECT ma.id AS mediaId, ma.entity_id AS entityId, e.slug, e.name,
            b.name AS brandName, ms.series_name AS seriesName,
            ma.title, ma.source_url AS sourceUrl
     FROM media_assets ma
     JOIN entities e ON e.id = ma.entity_id
     LEFT JOIN model_specs ms ON ms.entity_id = e.id
     LEFT JOIN entities b ON b.id = ms.brand_entity_id
     WHERE ma.id LIKE 'media-commerce-%'
       AND ma.source_item_id IS NULL
       AND ma.source_url IS NOT NULL
     ORDER BY e.slug`,
  );
  let repaired = 0;
  for (const row of rows) {
    const site = siteForProductUrl(row.sourceUrl);
    if (!site) {
      console.log(`- repair skip ${row.slug}: unknown retailer ${row.sourceUrl}`);
      continue;
    }
    const product: ProductCandidate = {
      url: row.sourceUrl,
      title: row.title.replace(/^电商产品图：/, ""),
      score: 0,
    };
    const itemId = await ensureCommerceSourceItem(db, site, row, product);
    await db.execute({
      sql: `UPDATE media_assets
            SET source_item_id = ?,
                author = ?,
                license = 'retailer product page',
                attribution_text = ?,
                updated_at = datetime('now')
            WHERE id = ?`,
      args: [
        itemId,
        site.name,
        `${site.name}: ${product.title || row.name}`,
        row.mediaId,
      ] as InArgs,
    });
    repaired += 1;
    console.log(`- repaired ${row.slug}: ${itemId}`);
  }
  return repaired;
}

async function getMissingPens(db: Client) {
  return execute<PenRow>(
    db,
    `SELECT e.id AS entityId, e.slug, e.name,
            b.name AS brandName,
            ms.series_name AS seriesName
     FROM entities e
     LEFT JOIN model_specs ms ON ms.entity_id = e.id
     LEFT JOIN entities b ON b.id = ms.brand_entity_id
     WHERE e.type = 'pen'
       AND (
        NOT EXISTS (
          SELECT 1 FROM media_assets ma
          WHERE ma.entity_id = e.id
            AND ma.review_status = 'approved'
            AND ma.usage_status = 'primary'
            AND ma.image_url NOT LIKE '/images/library/warm-pen-atlas/%'
        )
        OR EXISTS (
          SELECT 1 FROM media_assets ma
          WHERE ma.entity_id = e.id
            AND ma.id LIKE 'media-commerce-%'
            AND ma.source_item_id IS NULL
        )
       )
     ORDER BY e.slug`,
  );
}

async function main() {
  const db = getClient();
  if (WRITE) {
    const repaired = await repairExistingCommerceMedia(db);
    if (repaired > 0) console.log(`Repaired ${repaired} existing commerce media source links.`);
    if (REPAIR_ONLY) return;
  }
  let pens = await getMissingPens(db);
  if (ONLY_SLUG) pens = pens.filter((pen) => pen.slug === ONLY_SLUG);
  if (ONLY_SLUGS.size > 0) pens = pens.filter((pen) => ONLY_SLUGS.has(pen.slug));
  let imported = 0;
  let skipped = 0;
  let failed = 0;

  console.log(
    `${WRITE ? "Importing" : "Dry run"} commerce product images for ${pens.length} missing pens.`,
  );

  for (const pen of pens) {
    if (imported >= LIMIT) break;
    let matched = false;
    const manualPages = MANUAL_PRODUCT_PAGES.filter((page) => page.slug === pen.slug);
    for (const page of manualPages) {
      const productHtml = page.imageUrl ? null : await fetchText(page.url);
      if (!page.imageUrl && !productHtml) {
        failed += 1;
        continue;
      }
      const image = page.imageUrl
        ? {
            url: absoluteUrl(page.imageUrl, page.url),
            score: 99,
            reason: "manual-image",
          }
        : extractImages(productHtml || "", page.url, pen);
      if (!image || !image.url) continue;

      const id = mediaId(pen.entityId, page.url, image.url);
      const sourceItem = WRITE
        ? await ensureManualProductSourceItem(db, page, pen)
        : `source-product-${page.siteId}-${createHash("sha1")
            .update(page.url)
            .digest("hex")
            .slice(0, 14)}`;
      if (WRITE) {
        await db.execute({
          sql: `UPDATE media_assets
                SET usage_status = 'gallery', updated_at = datetime('now')
                WHERE entity_id = ?
                  AND usage_status = 'primary'
                  AND image_url NOT LIKE '/images/library/warm-pen-atlas/%'`,
          args: [pen.entityId] as InArgs,
        });
        await db.execute({
          sql: `INSERT INTO media_assets
                  (id, entity_id, title, asset_type, image_url, thumbnail_url,
                   author, license, attribution_text, source_url, source_item_id,
                   review_status, usage_status, updated_at)
                VALUES (?, ?, ?, 'image', ?, ?, ?, ?, ?, ?, ?, 'approved', 'primary', datetime('now'))
                ON CONFLICT(id) DO UPDATE SET
                  entity_id = excluded.entity_id,
                  title = excluded.title,
                  image_url = excluded.image_url,
                  thumbnail_url = excluded.thumbnail_url,
                  author = excluded.author,
                  license = excluded.license,
                  attribution_text = excluded.attribution_text,
                  source_url = excluded.source_url,
                  source_item_id = excluded.source_item_id,
                  review_status = excluded.review_status,
                  usage_status = excluded.usage_status,
                  updated_at = datetime('now')`,
          args: [
            id,
            pen.entityId,
            `核准来源实物图：${page.title}`,
            image.url,
            image.url,
            page.siteName,
            page.license,
            `${page.siteName}: ${page.title}`,
            page.url,
            sourceItem,
          ] as InArgs,
        });
      }
      imported += 1;
      matched = true;
      console.log(
        `- ${WRITE ? "imported" : "would import"} ${pen.slug}: ${image.url} via ${page.siteName} (${image.reason}; ${page.url})`,
      );
      break;
    }
    if (matched) continue;
    if (COMMERCE_SKIP_SLUGS.has(pen.slug)) {
      skipped += 1;
      console.log(`- skip ${pen.slug}: manual source required`);
      continue;
    }
    const query = latinQuery(pen);
    if (!query) {
      skipped += 1;
      continue;
    }

    for (const site of SITES) {
      const searchUrl = site.searchUrl(query);
      const searchHtml = await fetchText(searchUrl);
      if (!searchHtml) {
        failed += 1;
        continue;
      }
      const products = extractProductLinks(searchHtml, searchUrl, pen);
      for (const product of products) {
        const productHtml = await fetchText(product.url);
        if (!productHtml) {
          failed += 1;
          continue;
        }
        const image = extractImages(productHtml, product.url, pen);
        if (!image) continue;

        const id = mediaId(pen.entityId, product.url, image.url);
        const sourceItem = WRITE
          ? await ensureCommerceSourceItem(db, site, pen, product)
          : sourceItemId(site, product.url);
        if (WRITE) {
          await db.execute({
            sql: `UPDATE media_assets
                  SET usage_status = 'gallery', updated_at = datetime('now')
                  WHERE entity_id = ?
                    AND usage_status = 'primary'
                    AND image_url NOT LIKE '/images/library/warm-pen-atlas/%'`,
            args: [pen.entityId] as InArgs,
          });
          await db.execute({
            sql: `INSERT INTO media_assets
                    (id, entity_id, title, asset_type, image_url, thumbnail_url,
                     author, license, attribution_text, source_url, source_item_id,
                     review_status, usage_status, updated_at)
                  VALUES (?, ?, ?, 'image', ?, ?, ?, ?, ?, ?, ?, 'approved', 'primary', datetime('now'))
                  ON CONFLICT(id) DO UPDATE SET
                    entity_id = excluded.entity_id,
                    title = excluded.title,
                    image_url = excluded.image_url,
                    thumbnail_url = excluded.thumbnail_url,
                    author = excluded.author,
                    license = excluded.license,
                    attribution_text = excluded.attribution_text,
                    source_url = excluded.source_url,
                    source_item_id = excluded.source_item_id,
                    review_status = excluded.review_status,
                    usage_status = excluded.usage_status,
                    updated_at = datetime('now')`,
            args: [
              id,
              pen.entityId,
              `电商产品图：${product.title || pen.name}`,
              image.url,
              image.url,
              site.name,
              "retailer product page",
              `${site.name}: ${product.title || pen.name}`,
              product.url,
              sourceItem,
            ] as InArgs,
          });
        }
        imported += 1;
        matched = true;
        console.log(
          `- ${WRITE ? "imported" : "would import"} ${pen.slug}: ${image.url} via ${site.name} (${image.reason}; ${product.url})`,
        );
        break;
      }
      if (matched) break;
    }
    if (!matched) {
      skipped += 1;
      console.log(`- skip ${pen.slug}: no commerce match for "${query}"`);
    }
  }

  console.log(`Done. ${imported} imported, ${skipped} skipped, ${failed} failed.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
