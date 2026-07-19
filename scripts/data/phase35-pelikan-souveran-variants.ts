import type {
  CuratedEntityPack,
  CuratedSource,
} from "../lib/curated-content-pack";
import { phase27PelikanPacks } from "./phase27-pelikan";
import { phase32PelikanP0Packs } from "./phase32-pelikan-p0";

export const PHASE35_PELIKAN_ID = "VXUULuCOLOB1";
export const PHASE35_M1005_STRESEMANN_2019_ID = "U1FyHpt9jaE4";
export const PHASE35_M400_ID = "EF34ulVg8PSK";
export const PHASE35_M605_ID = "7gmV0UJORvc7";
export const PHASE35_M815_METAL_STRIPED_ID = "2muSiS2rOSd7";

const RETRIEVED = "2026-07-19";

type LiveSourceInput = Omit<
  CuratedSource,
  "retrievedAt" | "allowedUse" | "archiveUrl" | "archiveLocator"
> & {
  allowedUse?: CuratedSource["allowedUse"];
  locator: string;
};

function liveSource(source: LiveSourceInput): CuratedSource {
  const { allowedUse, locator, ...record } = source;
  return {
    ...record,
    retrievedAt: RETRIEVED,
    allowedUse: allowedUse ?? "summary_only",
    archiveUrl: record.url,
    archiveLocator: [
      "live-source-not-frozen",
      `retrieved=${RETRIEVED}`,
      "external_archive=false",
      "raw_source_stored=false",
      `locator=${locator}`,
    ].join(";"),
  };
}

function priorSource(
  packs: CuratedEntityPack[],
  phaseName: string,
  key: string,
): CuratedSource {
  const source = packs
    .flatMap((pack) => pack.sources)
    .find((candidate) => candidate.key === key);
  if (!source) {
    throw new Error(`${phaseName} source ${key} is unavailable to Phase 35.`);
  }
  return source;
}

const SOURCES = {
  "pelikan-catalog-2025": priorSource(
    phase27PelikanPacks,
    "Phase 27",
    "pelikan-catalog-2025",
  ),
  "phase35-pelikan-official-care": liveSource({
    key: "phase35-pelikan-official-care",
    registryKey: "pelikan-fine-writing-official",
    registryName: "Pelikan Fine Writing official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pelikan-fine-writing-official",
    title: "Pelikan Souverän and Classic Warranty Terms and Care — care section",
    url: "https://www.pelikan-passion.com/images/assets/fwi_warranty_current.pdf#page=29",
    homepageUrl: "https://www.pelikan-passion.com/",
    itemType: "warranty_pdf",
    author: "Pelikan",
    summary:
      "Pelikan 现行保养说明：长期停用前排空墨水，以冷水反复吸排；不用热水、肥皂或酒精，日常换墨不要求拆除活塞总成。",
    locator:
      "PDF pages 28-29 care section: empty ink, fill and empty with cold water; no hot water, soap or alcohol",
  }),
  "phase32-pelikan-collectibles-m600": priorSource(
    phase32PelikanP0Packs,
    "Phase 32",
    "phase32-pelikan-collectibles-m600",
  ),
  "phase35-pelikan-official-m1005-mam": liveSource({
    key: "phase35-pelikan-official-m1005-mam",
    registryKey: "pelikan-fine-writing-official",
    registryName: "Pelikan Fine Writing official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pelikan-fine-writing-official",
    title: "Füllhalter M1005 Stresemann M im Etui (product 810487)",
    url: "https://mam.pelikan.com/mam/de/pelikan/products/810487",
    homepageUrl: "https://www.pelikan-passion.com/",
    author: "Pelikan",
    summary:
      "Pelikan 官方媒体资料库（MAM）保留 M1005 Stresemann 与产品号 810487，资产时间为 2019 年。",
    locator:
      "official product detail title, product number 810487 and assigned M1005 Stresemann assets dated 01/2019",
  }),
  "phase35-pelikan-official-m1005-mam-overview": liveSource({
    key: "phase35-pelikan-official-m1005-mam-overview",
    registryKey: "pelikan-fine-writing-official",
    registryName: "Pelikan Fine Writing official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pelikan-fine-writing-official",
    title: "Pelikan MAM — M1005 Stresemann product overview",
    url: "https://mam.pelikan.com/mam/de/pelikan/products?product_filter%5BtaxonomyNode%5D=1543",
    homepageUrl: "https://www.pelikan-passion.com/",
    author: "Pelikan",
    summary:
      "Pelikan 官方 MAM 产品总表：M1005 Stresemann 的 EF、F、M、B 各有两条产品记录，共八个产品号；具体市场或包装差异不由该总表外推。",
    locator:
      "eight M1005 Stresemann records: EF 810425/810463; F 810432/810470; M 810449/810487; B 810456/810494",
  }),
  "phase35-pelikan-official-catalog-2019": liveSource({
    key: "phase35-pelikan-official-catalog-2019",
    registryKey: "pelikan-fine-writing-official",
    registryName: "Pelikan Fine Writing official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pelikan-fine-writing-official",
    title: "Pelikan Fine Writing Instruments 2019",
    url: "https://mam.pelikan.com/en/pelikan/media/812352/download",
    homepageUrl: "https://www.pelikan-passion.com/",
    itemType: "catalog_pdf",
    author: "Pelikan",
    publishedAt: "2019",
    summary:
      "Pelikan 2019 官方书写工具目录覆盖当期 Souverän 系列，并声明书写工具在德国制造；目录的 Souverän 结构说明用于限定 M1005 的产地与活塞家族。",
    locator:
      "2019 Fine Writing Instruments catalogue: Souverän piston-filler family and closing manufacturing statement, ‘All writing instruments are manufactured in Germany’",
  }),
  "phase35-pelikan-collectibles-m1005": liveSource({
    key: "phase35-pelikan-collectibles-m1005",
    registryKey: "pelikan-collectibles",
    registryName: "Pelikan Collectibles",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pelikan-collectibles",
    title: "Pelikan M1005 Stresemann",
    url: "https://www.pelikan-collectibles.de/de/Pelikan/Modelle/Souveraen-Serien/M1000-Basis/M1005/M1005-Stresemann/index.html",
    homepageUrl: "https://www.pelikan-collectibles.com/",
    author: "Dominic Rothemel",
    summary:
      "2019 M1005 Stresemann 收藏档案：Special Edition、18 ct 全镀铑金尖、灰黑条纹、银色饰件与独立测量表。",
    locator:
      "detail table: 2019 Special Edition, rhodium-plated 18 ct nib, black-grey barrel, 146 mm, 14.1 mm, 34.1 g and 1.35 ml",
  }),
  "phase35-pelikans-perch-m1005-announcement": liveSource({
    key: "phase35-pelikans-perch-m1005-announcement",
    registryKey: "the-pelikans-perch",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "the-pelikans-perch",
    title: "News: M1005 Stresemann Announced",
    url: "https://thepelikansperch.com/2019/01/14/pelikan-m1005-stresemann-announced/",
    homepageUrl: "https://thepelikansperch.com/",
    author: "Joshua Danley",
    publishedAt: "2019-01-14",
    summary:
      "M1005 Stresemann 公布期资料：2019 年身份、M805/M405 Stresemann 先行关系、条纹材料、饰件、笔尖和发布期英制规格。",
    locator:
      "announcement body: M1005 family boundary, anthracite cellulose acetate, palladium-plated furniture, 18C rhodium nib, 5.79 in, 1.14 oz and about 1.35 ml",
  }),
  "phase35-pelikans-perch-m1005-release": liveSource({
    key: "phase35-pelikans-perch-m1005-release",
    registryKey: "the-pelikans-perch",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "the-pelikans-perch",
    title: "Release Dates & Debunked Rumors",
    url: "https://thepelikansperch.com/2019/03/16/pelikan-2019-release-dates/",
    homepageUrl: "https://thepelikansperch.com/",
    author: "Joshua Danley",
    publishedAt: "2019-03-16",
    summary:
      "跟踪 M1005 Stresemann 延期至 2019 年 6 月，并转述 Pelikan 市场负责人对外部供应件质量与非笔尖问题的澄清。",
    locator:
      "release table and surrounding statement: M1005 Stresemann June 2019; supplier component issue was not the nib",
  }),
  "phase35-pelikan-official-m400-mam": liveSource({
    key: "phase35-pelikan-official-m400-mam",
    registryKey: "pelikan-fine-writing-official",
    registryName: "Pelikan Fine Writing official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pelikan-fine-writing-official",
    title: "Pelikan Fountain pen Souverän 400 Black-Green M",
    url: "https://mam.pelikan.com/mam/en/pelikan/products/994863",
    homepageUrl: "https://www.pelikan-passion.com/",
    author: "Pelikan",
    summary:
      "Pelikan 官方媒体资料库（MAM）现行黑绿 M400 记录：活塞、14K 双色金尖、EF/F/M/B、条纹 cellulose acetate 与德国制造。",
    locator:
      "official product detail and USP: M400 piston filler, 14-carat bi-color nib in EF/F/M/B, striped cellulose acetate and Made in Germany",
  }),
  "phase35-pelikan-collectibles-m400": liveSource({
    key: "phase35-pelikan-collectibles-m400",
    registryKey: "pelikan-collectibles",
    registryName: "Pelikan Collectibles",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pelikan-collectibles",
    title: "Pelikan M400 & M405 Souverän",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M400-Basis/index.html",
    homepageUrl: "https://www.pelikan-collectibles.com/",
    author: "Dominic Rothemel",
    summary:
      "M400 收藏平台档案：1982–1997 Old Style、1997 年 9 月后新版，两代尺寸重量、笔尖与饰件变化。",
    locator:
      "Old Style and post-09/1997 tables: production periods, nibs, dimensions, weight, capacity, trim and color records",
  }),
  "phase35-pelikans-perch-400-vs-m400": liveSource({
    key: "phase35-pelikans-perch-400-vs-m400",
    registryKey: "the-pelikans-perch",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "the-pelikans-perch",
    title: "How To Differentiate The Pelikan 400 From The M400",
    url: "https://thepelikansperch.com/2019/03/21/pelikan-400-versus-m400/",
    homepageUrl: "https://thepelikansperch.com/",
    author: "Joshua Danley",
    publishedAt: "2019-03-21",
    summary:
      "区分 1950s 400、1982–1997 M400 和 1997 后 M400，细化帽顶、帽环、握位饰环、尾钮饰环与笔尖表面。",
    locator:
      "history and M400 1982-97 vs 1997-present section: cap tops, cap bands, nib design, section and piston-knob trim",
  }),
  "phase35-pelikans-perch-buying-guide": liveSource({
    key: "phase35-pelikans-perch-buying-guide",
    registryKey: "the-pelikans-perch",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "the-pelikans-perch",
    title: "A Guide to Buying Pelikan",
    url: "https://thepelikansperch.com/2015/06/22/choosing-pelikan-fountain-pen/",
    homepageUrl: "https://thepelikansperch.com/",
    author: "Joshua Danley",
    publishedAt: "2015-06-22",
    summary:
      "Pelikan 二手检查资料，包括 1997 后 M400 握位饰环的长期腐蚀风险与帽顶、笔尖、笔杆检查。",
    locator:
      "buying checklist: post-1997 M400 section trim ring corrosion and inspection of nib, barrel, cap and furniture",
  }),
  "phase35-pelikans-perch-m605-database": liveSource({
    key: "phase35-pelikans-perch-m605-database",
    registryKey: "the-pelikans-perch",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "the-pelikans-perch",
    title: "M605",
    url: "https://thepelikansperch.com/database/fountain-pens/m6xx/m605/",
    homepageUrl: "https://thepelikansperch.com/",
    author: "Joshua Danley",
    summary:
      "M605 家族数据库：2003 深蓝起点、银色饰件身份、家族参考尺寸容量，以及 2003 至 2022 年八个已知版本。",
    locator:
      "introduction, family measurements and complete color table: 2003 Dark Blue; 2012 Black and Blue Striated; 2013 Marine Blue Transparent; 2017 White Transparent; 2019 Stresemann; 2021 Green-White; 2022 Tortoiseshell-Black",
  }),
  "phase35-pelikan-collectibles-m605-family": liveSource({
    key: "phase35-pelikan-collectibles-m605-family",
    registryKey: "pelikan-collectibles",
    registryName: "Pelikan Collectibles",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pelikan-collectibles",
    title: "Pelikan M600 & M605 Souverän — M605 section",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M600-Basis/index.html#heading_toc_j_3",
    homepageUrl: "https://www.pelikan-collectibles.com/",
    author: "Dominic Rothemel",
    summary:
      "Pelikan Collectibles 的 M605 专节：分列 2003–2022 八个版本、14 ct 金尖、银色饰件与 133 mm、12.4 mm、18.0 g、1.30 ml 平台表。",
    locator:
      "M605 section heading_toc_j_3, model table and eight color entries: Dark Blue; Black; Blue-striped; Marine Blue Transparent; White Transparent; Stresemann; Green-White; Black Tortoise",
  }),
  "phase35-pelikan-catalog-2013-2014-m605": liveSource({
    key: "phase35-pelikan-catalog-2013-2014-m605",
    registryKey: "pelikan-historical-catalogs",
    registryName: "Pelikan historical catalog archive",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "pelikan-catalog-2013-2014",
    title: "Pelikan Pen Catalogue 2013/2014 — M605 Black and Blue",
    url: "https://www.pelikan-collectibles.com/de/Pelikan/Kataloge/2013-Katalog/Pelikan-Pen-Catalogue-2013-2014.pdf#page=7",
    homepageUrl: "https://www.pelikan-collectibles.de/",
    itemType: "catalog_pdf",
    author: "Pelikan",
    publishedAt: "2013",
    summary:
      "Pelikan 2013/2014 日本市场目录把 M605 Black 与 M605 Blue 并列为两款特别生产钢笔，并列活塞、14K 铑饰金尖与 EF/F/M/B。",
    locator:
      "PDF page 7 / printed pages 12-13: Souverän 605 Black | Blue, special production, piston, 14K rhodium-decorated nib and EF/F/M/B",
  }),
  "phase35-pelikan-annual-report-2013-marine-blue": liveSource({
    key: "phase35-pelikan-annual-report-2013-marine-blue",
    registryKey: "pelikan-company-annual-reports",
    registryName: "Pelikan company reports",
    sourceType: "official",
    tier: "contemporary_archive",
    independenceGroup: "pelikan-annual-report-2013",
    title: "Pelikan International Corporation Berhad Annual Report 2013",
    url: "https://www.pelikan.com/images/assets/picb/Annual_report_2013_part1.pdf?download=",
    homepageUrl: "https://www.pelikan.com/",
    itemType: "annual_report_pdf",
    author: "Pelikan International Corporation Berhad",
    publishedAt: "2013",
    summary:
      "Pelikan 集团 2013 年报点名当年推出的 M605 Marine Blue，并记录该款很快售罄；年报没有给出生产数量。",
    locator:
      "PDF page 31 / printed page 28: M605 Marine Blue launch in 2013 and rapid sell-out",
  }),
  "phase35-pelikans-perch-m605-white-transparent": liveSource({
    key: "phase35-pelikans-perch-m605-white-transparent",
    registryKey: "the-pelikans-perch",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "the-pelikans-perch",
    title: "Review: M605 White-Transparent (2017)",
    url: "https://thepelikansperch.com/2017/12/31/pelikan-m605-white-transparent-review/",
    homepageUrl: "https://thepelikansperch.com/",
    author: "Joshua Danley",
    publishedAt: "2017-12-31",
    summary:
      "2017 White-Transparent 实笔资料：透明笔杆、白色树脂部件、14C/585 单色镀铑尖、EF/F/M/B 与压入式活塞维护边界。",
    locator:
      "Appearance, Nib and Filling System & Maintenance: transparent barrel, white resin components, monotone rhodium-plated 14C/585 nib, EF/F/M/B and friction-fit piston",
  }),
  "phase35-pelikans-perch-m605-stresemann": liveSource({
    key: "phase35-pelikans-perch-m605-stresemann",
    registryKey: "the-pelikans-perch",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "the-pelikans-perch",
    title: "News: M605 Stresemann Announced",
    url: "https://thepelikansperch.com/2019/10/21/pelikan-m605-stresemann-announced/",
    homepageUrl: "https://thepelikansperch.com/",
    author: "Joshua Danley",
    publishedAt: "2019-10-21",
    summary:
      "2019 M605 Stresemann 公布资料，记录灰黑条纹、银色饰件、M6xx 参考尺寸重量与 1.30 ml 容量。",
    locator:
      "announcement and specifications: 2019 M605 Stresemann, 5.28 in capped, 0.56 oz and approximately 1.30 ml",
  }),
  "phase35-pelikan-official-m605-stresemann-mam": liveSource({
    key: "phase35-pelikan-official-m605-stresemann-mam",
    registryKey: "pelikan-fine-writing-official",
    registryName: "Pelikan Fine Writing official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pelikan-fine-writing-official",
    title: "Fountain pen Souverän 605 Stresemann Black-Anthracite M",
    url: "https://mam.pelikan.com/mam/en/pelikan/products/813624",
    homepageUrl: "https://www.pelikan-passion.com/",
    author: "Pelikan",
    publishedAt: "2019",
    summary:
      "Pelikan 官方 MAM 记录 M605 Stresemann：2019 年第 36 周、活塞、14K/585 全镀铑尖、EF/F/M/B、anthracite cellulose acetate 与镀钯饰件。",
    locator:
      "product information and USP: publication CW 36/2019, piston, completely rhodium-plated 14-carat nib, EF/F/M/B, striped cellulose acetate and palladium trim",
  }),
  "phase35-pelikans-perch-m605-green-white": liveSource({
    key: "phase35-pelikans-perch-m605-green-white",
    registryKey: "the-pelikans-perch",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "the-pelikans-perch",
    title: "News: M605 Green-White Special Edition",
    url: "https://thepelikansperch.com/2021/06/02/pelikan-m605-green-white-announced/",
    homepageUrl: "https://thepelikansperch.com/",
    author: "Joshua Danley",
    publishedAt: "2021-06-02",
    summary:
      "2021 M605 Green-White 公布资料：绿色 cellulose acetate 条纹、白色树脂与镀钯色饰件，并区分 2012 M600 白龟纹。",
    locator:
      "announcement body: 2021 M605 Green-White, green striped cellulose acetate, white resin, palladium-plated furniture and prior white M6xx chronology",
  }),
  "phase35-pelikan-official-m605-green-white-salesfolder": liveSource({
    key: "phase35-pelikan-official-m605-green-white-salesfolder",
    registryKey: "pelikan-fine-writing-official",
    registryName: "Pelikan Fine Writing official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pelikan-fine-writing-official",
    title: "Souverän M605 Green-White sales folder",
    url: "https://mam.pelikan.com/en/pelikan/media/925435/download",
    homepageUrl: "https://www.pelikan-passion.com/",
    itemType: "catalog_pdf",
    author: "Pelikan",
    publishedAt: "2021",
    summary:
      "Pelikan 官方销售资料：2021 Green-White 使用绿色条纹 cellulose acetate 饰带、白色树脂、镀钯饰件与全镀铑 14K 金尖，字幅 EF/F/M/B。",
    locator:
      "sales folder: July 2021, striped cellulose acetate sleeve, white resin, palladium-plated trim, fully rhodium-plated 14-carat nib and EF/F/M/B",
  }),
  "phase35-pelikan-official-m605-black-tortoise": liveSource({
    key: "phase35-pelikan-official-m605-black-tortoise",
    registryKey: "pelikan-fine-writing-official",
    registryName: "Pelikan Fine Writing official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pelikan-fine-writing-official",
    title: "Souverän 605 Tortoiseshell-Black",
    url: "https://www.pelikan-passion.com/fr/lecriture/premium/souveraen/souveran-605-tortoiseshell-black.html?fwiRefId=468",
    homepageUrl: "https://www.pelikan-passion.com/",
    author: "Pelikan",
    summary:
      "2022 Tortoiseshell-Black 官方页：M605 身份、活塞、14K/585 镀铑金尖、EF/F/M/B、cellulose acetate、13.3 cm 与 16.4 g。",
    locator:
      "official details and facts: piston, 14K/585 rhodium-decorated nib, EF/F/M/B, cellulose acetate, 13.3 cm capped and 16.4 g",
  }),
  "phase35-pelikans-perch-m605-black-tortoise": liveSource({
    key: "phase35-pelikans-perch-m605-black-tortoise",
    registryKey: "the-pelikans-perch",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "the-pelikans-perch",
    title: "Review: M605 Tortoiseshell-Black (2022)",
    url: "https://thepelikansperch.com/2022/06/12/pelikan-m605-tortoiseshell-black-review/",
    homepageUrl: "https://thepelikansperch.com/",
    author: "Joshua Danley",
    publishedAt: "2022-06-12",
    summary:
      "2022 M605 黑龟纹实笔资料：版本对照、M6xx 轻量中号手感、约 1.30 ml 容量与 press-fit 活塞维护边界。",
    locator:
      "review identity comparison, Weight & Dimensions and Filling System & Maintenance sections",
  }),
  "phase35-pelikan-official-m815-blue": liveSource({
    key: "phase35-pelikan-official-m815-blue",
    registryKey: "pelikan-fine-writing-official",
    registryName: "Pelikan Fine Writing official",
    sourceType: "official",
    tier: "primary",
    independenceGroup: "pelikan-fine-writing-official",
    title: "Souverän 815 Metal Striped Blue",
    url: "https://www.pelikan-passion.com/de/writing/premium/souveraen/souveraen-815-metal-striped-blue.html?fwiRefId=239",
    homepageUrl: "https://www.pelikan-passion.com/",
    author: "Pelikan",
    summary:
      "2025 Blue 官方产品页：黄铜基材、镀钯色饰件、18K/750 全镀铑尖、EF/F/M/B、差动活塞、14.1 cm 和 36 g。",
    locator:
      "official Details and Facts & Figures: brass, palladium-plated trim, rhodium-plated 18K/750 nib, EF/F/M/B, differential piston, 14.1 cm and 36 g",
  }),
  "phase35-pelikan-collectibles-m815-black": liveSource({
    key: "phase35-pelikan-collectibles-m815-black",
    registryKey: "pelikan-collectibles",
    registryName: "Pelikan Collectibles",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pelikan-collectibles",
    title: "Pelikan M815 Metal Striped",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/Souveraen-Series/M800-Basis/M815/M815-Metal-Striped/index.html",
    homepageUrl: "https://www.pelikan-collectibles.com/",
    author: "Dominic Rothemel",
    summary:
      "2018 Black 独立收藏档案：Special Edition、18 ct 金尖、黑色笔身、银色饰件、141 mm、13 mm、38 g 与 1.35 ml。",
    locator:
      "2018 Black Striped detail table: 18 ct nib, 141 mm, 13 mm, 38 g and 1.35 ml",
  }),
  "phase35-pelikan-collectibles-m815-family": liveSource({
    key: "phase35-pelikan-collectibles-m815-family",
    registryKey: "pelikan-collectibles",
    registryName: "Pelikan Collectibles",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "pelikan-collectibles",
    title: "Pelikan M800 Special Editions",
    url: "https://www.pelikan-collectibles.com/en/Pelikan/Models/LE-SE/SE-M800-Basis/index.html",
    homepageUrl: "https://www.pelikan-collectibles.com/",
    author: "Dominic Rothemel",
    summary:
      "M815 特别版总表，分列 2018 Black Striped 与 2025 Blue Striped，证明两者是同一 Metal Striped 家族的年份版本。",
    locator:
      "M815 section: 2018 Black Striped and 2025 Blue Striped listed as separate Special Edition colors",
  }),
  "phase35-pelikans-perch-m815-black": liveSource({
    key: "phase35-pelikans-perch-m815-black",
    registryKey: "the-pelikans-perch",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "the-pelikans-perch",
    title: "Review: M815 Metal Striped (2018)",
    url: "https://thepelikansperch.com/2018/07/21/pelikan-m815-metal-striped-review/",
    homepageUrl: "https://thepelikansperch.com/",
    author: "Joshua Danley",
    publishedAt: "2018-07-21",
    summary:
      "2018 Black 实笔评测：黄铜条纹增重、镀钯饰件、墨窗、M8xx 尺寸和带帽 1.31 oz 实测。",
    locator:
      "Appearance, Construction and Weight & Dimensions sections: brass stripes, palladium trim, ink window, 5.56 in and 1.31 oz capped",
  }),
  "phase35-pelikans-perch-m815-blue": liveSource({
    key: "phase35-pelikans-perch-m815-blue",
    registryKey: "the-pelikans-perch",
    registryName: "The Pelikan's Perch",
    sourceType: "blog",
    tier: "professional_secondary",
    independenceGroup: "the-pelikans-perch",
    title: "News: M815 Metal Striped Blue Special Edition Fountain Pen",
    url: "https://thepelikansperch.com/2025/04/30/pelikan-m815-metal-striped-blue-announced/",
    homepageUrl: "https://thepelikansperch.com/",
    author: "Joshua Danley",
    publishedAt: "2025-04-30",
    summary:
      "2025 Blue 公布期资料：与 2018 Black 的继承关系、深蓝树脂和黄铜结构、镀钯饰件与发布期规格。",
    locator:
      "announcement body: 2025 Blue follows 2018 Black, blue resin and brass, palladium accents, 14.09 cm, 37.13 g and about 1.35 ml",
  }),
  "phase35-m1005-site-original": {
    key: "phase35-m1005-site-original",
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title: "M1005 Stresemann (2019) 身份卡——本站原创事实图",
    url: "/images/library/site-original/pelikan-souveran-variants/pelikan-m1005-stresemann-2019-factual.svg",
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial studio",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创非写实身份卡，只排列 2019 年份、灰条纹、银色饰件和档案规格，不是产品照或比例图。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl:
      "/images/library/site-original/pelikan-souveran-variants/pelikan-m1005-stresemann-2019-factual.svg",
    archiveLocator:
      "project-public-asset:pelikan-m1005-stresemann-2019-factual.svg;site-original=true;factual-svg=true;product-photo=false;mechanical-diagram=false;to-scale=false;created=2026-07-19",
  },
  "phase35-m400-site-original": {
    key: "phase35-m400-site-original",
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title: "M400 Old/New Style 边界卡——本站原创事实图",
    url: "/images/library/site-original/pelikan-souveran-variants/pelikan-m400-generations-factual.svg",
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial studio",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创非写实对照卡，分列 1982–1997 与 1997 年 9 月后的饰件、笔尖和规格口径。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl:
      "/images/library/site-original/pelikan-souveran-variants/pelikan-m400-generations-factual.svg",
    archiveLocator:
      "project-public-asset:pelikan-m400-generations-factual.svg;site-original=true;factual-svg=true;product-photo=false;mechanical-diagram=false;to-scale=false;created=2026-07-19",
  },
  "phase35-m605-site-original": {
    key: "phase35-m605-site-original",
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title: "M605 版本年表——本站原创事实图",
    url: "/images/library/site-original/pelikan-souveran-variants/pelikan-m605-family-factual.svg",
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial studio",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创非写实年表，分开 2003 至 2022 年八个已知 M605 版本，不作材料或色差实物证据。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl:
      "/images/library/site-original/pelikan-souveran-variants/pelikan-m605-family-factual.svg",
    archiveLocator:
      "project-public-asset:pelikan-m605-family-factual.svg;site-original=true;factual-svg=true;product-photo=false;color-proof=false;mechanical-diagram=false;to-scale=false;created=2026-07-19",
  },
  "phase35-m815-site-original": {
    key: "phase35-m815-site-original",
    registryKey: "fountain-pen-graph-editorial",
    registryName: "Fountain Pen Graph editorial studio",
    sourceType: "user_submission",
    tier: "primary",
    independenceGroup: "fountain-pen-graph-editorial",
    title: "M815 Black/Blue 版本规格卡——本站原创事实图",
    url: "/images/library/site-original/pelikan-souveran-variants/pelikan-m815-metal-striped-variants-factual.svg",
    homepageUrl: "/",
    itemType: "image",
    author: "Fountain Pen Graph editorial studio",
    retrievedAt: RETRIEVED,
    summary:
      "本站原创非写实规格卡，把 2018 Black 38 g 和 2025 Blue 官方 36 g 分栏展示，避免误写共同重量。",
    allowedUse: "store_full",
    license: "site-original",
    archiveUrl:
      "/images/library/site-original/pelikan-souveran-variants/pelikan-m815-metal-striped-variants-factual.svg",
    archiveLocator:
      "project-public-asset:pelikan-m815-metal-striped-variants-factual.svg;site-original=true;factual-svg=true;product-photo=false;mechanical-diagram=false;to-scale=false;created=2026-07-19",
  },
} satisfies Record<string, CuratedSource>;

const source = (key: keyof typeof SOURCES): CuratedSource => SOURCES[key];

const M1005_PACK: CuratedEntityPack = {
  key: "phase35-pelikan-m1005-stresemann-2019-v1",
  entityId: PHASE35_M1005_STRESEMANN_2019_ID,
  expectedType: "pen",
  expectedSlug: "pelikan-souveran-m1005-stresemann-2019",
  canonicalName: "Pelikan Souverän M1005 Stresemann (2019)",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/pelikan-m1005-stresemann-2019-publishable-content-2026-07-19.md",
  storyTitle:
    "Pelikan M1005 Stresemann (2019)：特别版身份、延期发布与规格口径",
  primarySourceKey: "phase35-pelikan-official-m1005-mam-overview",
  depthTier: "A",
  aliases: [
    {
      alias: "Pelikan M1005 Stresemann",
      language: "en",
      sourceKey: "phase35-pelikan-official-m1005-mam",
    },
    {
      alias: "Pelikan Souverän M1005 Stresemann",
      language: "de",
      sourceKey: "phase35-pelikan-official-m1005-mam",
    },
    {
      alias: "Pelikan Souveran M1005 Stresemann 2019",
      language: "en",
      sourceKey: "phase35-pelikan-collectibles-m1005",
    },
  ],
  sources: [
    source("phase35-pelikan-official-m1005-mam"),
    source("phase35-pelikan-official-m1005-mam-overview"),
    source("phase35-pelikan-official-catalog-2019"),
    source("phase35-pelikan-collectibles-m1005"),
    source("phase35-pelikans-perch-m1005-announcement"),
    source("phase35-pelikans-perch-m1005-release"),
    source("phase35-pelikans-perch-buying-guide"),
    source("phase35-pelikan-official-care"),
    source("phase35-m1005-site-original"),
  ],
  variants: [
    {
      key: "stresemann-2019",
      name: "M1005 Stresemann Special Edition",
      releaseYear: "2019",
      notes:
        "本页的唯一主体；不包含 2011 Demonstrator、2013 Black 或其他 M1005。",
      sourceKey: "phase35-pelikan-collectibles-m1005",
      variantKind: "edition_group",
    },
    ...["EF", "F", "M", "B"].map((width) => ({
      key: `stresemann-2019-${width.toLowerCase()}`,
      name: `${width} 18K/750 全镀铑金尖`,
      releaseYear: "2019",
      notes: "公布期标准尖号；不代表固定毫米线宽。",
      sourceKey: "phase35-pelikans-perch-m1005-announcement",
      variantKind: "nib" as const,
      parentVariantKey: "stresemann-2019",
    })),
  ],
  scopes: [
    {
      key: "edition-2019",
      scopeKey: "pelikan-m1005-stresemann-special-edition-2019",
      variantKey: "stresemann-2019",
      validFrom: "2019",
      validTo: "2019",
      productionState: "historical",
      nibScope: "18K/750 fully rhodium-plated; EF, F, M, B",
      materialScope:
        "anthracite striped cellulose acetate with black resin and palladium-colored trim",
      editionScope:
        "2019 M1005 Stresemann only; excludes all other M1005 editions",
    },
    {
      key: "launch-2019",
      scopeKey: "pelikan-m1005-stresemann-june-2019-launch",
      validFrom: "2019-06",
      validTo: "2019-06",
      productionState: "historical",
      editionScope:
        "delayed 2019 market launch; supplier component issue was explicitly not attributed to the nib",
    },
    {
      key: "maintenance",
      scopeKey: "pelikan-m1005-stresemann-care-boundary-2026-07-19",
      validFrom: RETRIEVED,
      productionState: "historical",
      editionScope:
        "routine care uses cold-water piston flushing; complete piston removal is not routine cleaning",
    },
    {
      key: "media",
      scopeKey: "pelikan-m1005-stresemann-factual-svg-2026-07-19",
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope:
        "site-original factual card; not a product photo, mechanical diagram or scale reference",
    },
  ],
  claims: [
    {
      key: "identity-2019",
      predicate: "edition_identity",
      objectText:
        "本页只对应 2019 M1005 Stresemann Special Edition，不代表 2011 Demonstrator、2013 Black 或其他 M1005。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "phase35-pelikan-collectibles-m1005",
      locator: "2019 Special Edition identity table",
      evidence: [
        {
          key: "collectibles-identity",
          sourceKey: "phase35-pelikan-collectibles-m1005",
          scopeKey: "edition-2019",
          locator: "M1005 Stresemann | Special Edition | Production 2019",
        },
        {
          key: "official-mam-identity",
          sourceKey: "phase35-pelikan-official-m1005-mam",
          scopeKey: "edition-2019",
          locator: "official M-nib gift-box product title and product number 810487",
        },
      ],
    },
    {
      key: "official-sku-matrix",
      predicate: "edition_product_codes",
      objectText:
        "Pelikan MAM 为 M1005 Stresemann 的 EF、F、M、B 各保留两条产品记录；具体市场或包装差异不由该总表外推，810487 只是 M 尖带盒产品号，不是整款唯一编号。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "phase35-pelikan-official-m1005-mam-overview",
      locator: "official M1005 product overview with eight records",
      evidence: [
        {
          key: "official-sku-overview",
          sourceKey: "phase35-pelikan-official-m1005-mam-overview",
          scopeKey: "edition-2019",
          locator:
            "EF 810425/810463; F 810432/810470; M 810449/810487; B 810456/810494",
        },
      ],
    },
    {
      key: "release-june-2019",
      predicate: "release_date",
      objectText:
        "M1005 Stresemann 在 2019 年延后至 6 月上市；当时 Pelikan 澄清延期与笔尖无关。",
      factClass: "core",
      confidence: 0.97,
      sourceKey: "phase35-pelikans-perch-m1005-release",
      locator: "June 2019 release table and supplier-component clarification",
      evidence: [
        {
          key: "release-date",
          sourceKey: "phase35-pelikans-perch-m1005-release",
          scopeKey: "launch-2019",
          locator: "M1005 Stresemann | June 2019",
        },
      ],
    },
    {
      key: "edition-specs",
      predicate: "edition_dimensions_weight_capacity",
      objectText:
        "2019 收藏档案列闭帽 146 mm、直径 14.1 mm、34.1 g 和 1.35 ml；公布期英制数字另作记录，不与标准 M1000 共用。",
      factClass: "core",
      confidence: 0.97,
      sourceKey: "phase35-pelikan-collectibles-m1005",
      locator: "2019 M1005 Stresemann measurement table",
      evidence: [
        {
          key: "collectibles-specs",
          sourceKey: "phase35-pelikan-collectibles-m1005",
          scopeKey: "edition-2019",
          locator: "146 mm, 14.1 mm, 34.1 g and 1.35 ml",
        },
        {
          key: "announcement-specs",
          sourceKey: "phase35-pelikans-perch-m1005-announcement",
          scopeKey: "edition-2019",
          locator: "5.79 in, 1.14 oz and approximately 1.35 ml",
        },
      ],
    },
    {
      key: "nib-material-filler",
      predicate: "edition_configuration",
      objectText:
        "2019 M1005 Stresemann 使用 18K/750 全镀铑金尖、灰黑条纹 cellulose acetate、镀钯色饰件与内置活塞。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: "phase35-pelikan-collectibles-m1005",
      locator: "2019 edition detail table and announcement configuration",
      evidence: [
        {
          key: "configuration-archive",
          sourceKey: "phase35-pelikan-collectibles-m1005",
          scopeKey: "edition-2019",
          locator: "18 ct rhodium nib, black-grey barrel and silver trim",
        },
        {
          key: "configuration-announcement",
          sourceKey: "phase35-pelikans-perch-m1005-announcement",
          scopeKey: "edition-2019",
          locator:
            "anthracite cellulose acetate, black resin, palladium-plated furniture and piston filler",
        },
      ],
    },
    {
      key: "appearance-boundary",
      predicate: "edition_visual_identity",
      objectText:
        "2019 版由灰黑条纹 cellulose acetate、黑色树脂、镀钯色饰件、双尾环、单握位环、双帽环、银色单雏鸟徽记与全镀铑 18C 尖共同识别；Special Edition 不等于有编号或已公布总量。",
      factClass: "core",
      confidence: 0.97,
      sourceKey: "phase35-pelikans-perch-m1005-announcement",
      locator: "2019 announcement appearance and configuration",
      evidence: [
        {
          key: "announcement-appearance",
          sourceKey: "phase35-pelikans-perch-m1005-announcement",
          scopeKey: "edition-2019",
          locator:
            "anthracite cellulose acetate, black resin, palladium trim, ring layout, one-chick cap logo and rhodium-plated 18C nib",
        },
        {
          key: "collectibles-special-edition-label",
          sourceKey: "phase35-pelikan-collectibles-m1005",
          scopeKey: "edition-2019",
          locator: "Special Edition 2019; no numbered production total stated",
        },
      ],
    },
    {
      key: "care-trim-boundary",
      predicate: "care_and_inspection_boundary",
      objectText:
        "官方日常保养只要求冷水吸排，不用热水、肥皂或酒精；现代 Souverän 的握位饰环应作为二手检查点，但不能写成每支 M1005 都会腐蚀。",
      factClass: "editorial",
      confidence: 0.96,
      sourceKey: "phase35-pelikan-official-care",
      locator: "official care instructions read with modern Souverän buying inspection",
      evidence: [
        {
          key: "official-cold-water-care",
          sourceKey: "phase35-pelikan-official-care",
          scopeKey: "maintenance",
          locator: "cold water only; no hot water, soap or alcohol",
        },
        {
          key: "modern-section-ring-inspection",
          sourceKey: "phase35-pelikans-perch-buying-guide",
          scopeKey: "maintenance",
          locator: "modern Souverän section trim ring corrosion inspection",
        },
      ],
    },
  ],
  spec: {
    brandEntityId: PHASE35_PELIKAN_ID,
    values: {
      series_name: "Souverän M1005 Stresemann Special Edition",
      release_year: "2019-06",
      origin_country: "德国",
      nib: "18K/750 全镀铑金尖；EF、F、M、B",
      fill_system: "内置活塞；约 1.35 ml",
      material:
        "灰黑条纹 cellulose acetate；黑色树脂；镀钯色饰件",
      dimensions:
        "2019 收藏档案：闭帽 146 mm，直径 14.1 mm；发布资料 5.79 in（约 147.1 mm），两组口径不求平均",
      weight:
        "2019 收藏档案：34.1 g；发布资料 1.14 oz（约 32.3 g），两组口径不求平均",
      status: "2019 Special Edition，已停产",
    },
    evidence: [
      {
        key: "brand",
        fieldKey: "brand_entity_id",
        sourceKey: "phase35-pelikan-official-m1005-mam",
        scopeKey: "edition-2019",
        locator: "official Pelikan M1005 Stresemann product detail",
      },
      {
        key: "series",
        fieldKey: "series_name",
        sourceKey: "phase35-pelikan-official-m1005-mam-overview",
        scopeKey: "edition-2019",
        locator: "official M1005 Stresemann product overview",
      },
      {
        key: "origin",
        fieldKey: "origin_country",
        sourceKey: "phase35-pelikan-official-catalog-2019",
        scopeKey: "edition-2019",
        locator:
          "2019 official catalogue closing statement: all writing instruments are manufactured in Germany",
      },
      {
        key: "nib-finish",
        fieldKey: "nib",
        sourceKey: "phase35-pelikans-perch-m1005-announcement",
        scopeKey: "edition-2019",
        locator: "18C/750 completely rhodium-plated nib",
      },
      {
        key: "nib-widths",
        fieldKey: "nib",
        sourceKey: "phase35-pelikan-official-m1005-mam-overview",
        scopeKey: "edition-2019",
        locator:
          "official eight-product matrix: EF 810425/810463; F 810432/810470; M 810449/810487; B 810456/810494",
      },
      {
        key: "fill-piston",
        fieldKey: "fill_system",
        sourceKey: "phase35-pelikan-official-catalog-2019",
        scopeKey: "edition-2019",
        locator: "2019 official Souverän differential-piston family description",
      },
      {
        key: "fill-capacity",
        fieldKey: "fill_system",
        sourceKey: "phase35-pelikans-perch-m1005-announcement",
        scopeKey: "edition-2019",
        locator: "approximately 1.35 ml",
      },
      {
        key: "material",
        fieldKey: "material",
        sourceKey: "phase35-pelikans-perch-m1005-announcement",
        scopeKey: "edition-2019",
        locator:
          "anthracite cellulose acetate, black resin and palladium-plated furniture",
      },
      {
        key: "status",
        fieldKey: "status",
        sourceKey: "phase35-pelikan-collectibles-m1005",
        scopeKey: "edition-2019",
        locator: "2019 Special Edition production record",
      },
      {
        key: "release_year",
        fieldKey: "release_year",
        sourceKey: "phase35-pelikans-perch-m1005-release",
        scopeKey: "launch-2019",
        locator: "release table and clarification: M1005 Stresemann June 2019",
      },
      {
        key: "dimensions-collectibles",
        fieldKey: "dimensions",
        sourceKey: "phase35-pelikan-collectibles-m1005",
        scopeKey: "edition-2019",
        locator: "146 mm capped and 14.1 mm diameter",
      },
      {
        key: "dimensions-announcement",
        fieldKey: "dimensions",
        sourceKey: "phase35-pelikans-perch-m1005-announcement",
        scopeKey: "edition-2019",
        locator: "5.79 inches capped",
      },
      {
        key: "weight-collectibles",
        fieldKey: "weight",
        sourceKey: "phase35-pelikan-collectibles-m1005",
        scopeKey: "edition-2019",
        locator: "34.1 g",
      },
      {
        key: "weight-announcement",
        fieldKey: "weight",
        sourceKey: "phase35-pelikans-perch-m1005-announcement",
        scopeKey: "edition-2019",
        locator: "1.14 oz",
      },
    ],
  },
  conflicts: [
    {
      key: "m1005-measurement-scope",
      fieldKey: "dimensions_weight",
      scopeKey: "edition-2019",
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "Retain the collector table as the metric archive record and the announcement's publication-time imperial figures as a separate measurement; do not normalize either into standard M1000 data.",
      members: [
        {
          citationKey: "dimensions-collectibles",
          assertedValue: "146 mm",
        },
        {
          citationKey: "dimensions-announcement",
          assertedValue: "5.79 in",
        },
        {
          citationKey: "weight-collectibles",
          assertedValue: "34.1 g",
        },
        {
          citationKey: "weight-announcement",
          assertedValue: "1.14 oz",
        },
      ],
    },
  ],
  media: [
    {
      key: "m1005-factual-primary",
      title: "M1005 Stresemann (2019) 身份与规格卡",
      sourceKey: "phase35-m1005-site-original",
      localPath:
        "/images/library/site-original/pelikan-souveran-variants/pelikan-m1005-stresemann-2019-factual.svg",
      author: "Fountain Pen Graph editorial studio",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph 本站原创事实图；仅用于展示已引用的型号与规格，非产品照、非机械图、不按比例。",
      sourceUrl:
        "/images/library/site-original/pelikan-souveran-variants/pelikan-m1005-stresemann-2019-factual.svg",
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: "announcement",
      title: "M1005 Stresemann 正式公布",
      eventType: "design_milestone",
      startDate: "2019-01-14",
      circa: false,
      description: "2019 Special Edition 公布，不回填为 2018 发售。",
      sourceKey: "phase35-pelikans-perch-m1005-announcement",
    },
    {
      key: "launch",
      title: "延后至 2019 年 6 月上市",
      eventType: "model_released",
      startDate: "2019-06",
      circa: false,
      description: "延期由供应件质量导致，Pelikan 澄清不是笔尖问题。",
      sourceKey: "phase35-pelikans-perch-m1005-release",
    },
  ],
};

const M400_PACK: CuratedEntityPack = {
  key: "phase35-pelikan-m400-generations-v1",
  entityId: PHASE35_M400_ID,
  expectedType: "pen",
  expectedSlug: "pelikan-souveran-m400",
  canonicalName: "Pelikan Souverän M400",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/pelikan-m400-publishable-content-2026-07-19.md",
  storyTitle: "Pelikan M400：1982 Old Style、1997 改版与现行 S 号规格",
  primarySourceKey: "pelikan-catalog-2025",
  depthTier: "A",
  aliases: [
    {
      alias: "Pelikan M400",
      language: "en",
      sourceKey: "phase35-pelikan-official-m400-mam",
    },
    {
      alias: "Pelikan Souverän M400",
      language: "de",
      sourceKey: "phase35-pelikan-official-m400-mam",
    },
    {
      alias: "Pelikan Souveran M400",
      language: "en",
      sourceKey: "pelikan-catalog-2025",
    },
    {
      alias: "百利金 M400",
      language: "zh",
      sourceKey: "phase35-pelikan-collectibles-m400",
    },
  ],
  sources: [
    source("pelikan-catalog-2025"),
    source("phase35-pelikan-official-m400-mam"),
    source("phase35-pelikan-collectibles-m400"),
    source("phase35-pelikans-perch-400-vs-m400"),
    source("phase35-pelikans-perch-buying-guide"),
    source("phase35-pelikan-official-care"),
    source("phase35-m400-site-original"),
  ],
  variants: [
    {
      key: "old-style-1982-1997",
      name: "M400 Old Style",
      releaseYear: "1982",
      notes:
        "1982 至 1997 年 9 月前；单帽环、无握位饰环与尾钮双环，标准 14 ct 单色尖。",
      sourceKey: "phase35-pelikan-collectibles-m400",
      variantKind: "edition_group",
    },
    {
      key: "new-style-1997-present",
      name: "M400 New Style",
      releaseYear: "1997-09",
      notes:
        "新饰件布局与 14K/585 双色尖；帽顶徽记后续仍有多次变化。",
      sourceKey: "phase35-pelikan-collectibles-m400",
      variantKind: "edition_group",
    },
  ],
  scopes: [
    {
      key: "old-style",
      scopeKey: "pelikan-m400-old-style-1982-1997",
      variantKey: "old-style-1982-1997",
      validFrom: "1982",
      validTo: "1997-08-31",
      productionState: "historical",
      nibScope: "14 ct monotone gold; very early friction-fit unit then screw-in",
      materialScope: "finish-specific; green, brown and later blue striped records exist",
      editionScope: "M400 Old Style, not the 1950s Pelikan 400",
    },
    {
      key: "post-1997",
      scopeKey: "pelikan-m400-new-style-1997-present",
      variantKey: "new-style-1997-present",
      validFrom: "1997-09-01",
      productionState: "current",
      nibScope: "standard 14K/585 bi-color gold; current EF, F, M, B",
      materialScope:
        "finish-specific; current striped listings use striped cellulose acetate and resin components",
      editionScope: "post-1997 M400 with revised trim",
    },
    {
      key: "current-2025",
      scopeKey: "pelikan-m400-current-catalog-2025",
      validFrom: "2025",
      productionState: "current",
      nibScope: "14K/585 bi-color; EF, F, M, B",
      editionScope: "current standard M400 catalog values",
    },
    {
      key: "maintenance",
      scopeKey: "pelikan-m400-care-boundary-2026-07-19",
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope:
        "cold-water piston flushing is routine; post-1997 section trim and historical parts require inspection",
    },
    {
      key: "media",
      scopeKey: "pelikan-m400-generations-factual-svg-2026-07-19",
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope: "site-original comparison card; not a product photograph",
    },
  ],
  claims: [
    {
      key: "generation-boundary",
      predicate: "generation_boundary",
      objectText:
        "M400 于 1982 年重启；1982–1997 Old Style 与 1997 年 9 月后 New Style 必须分开，且不是 1950s Pelikan 400。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "phase35-pelikan-collectibles-m400",
      locator: "Old Style and post-09/1997 model tables",
      evidence: [
        {
          key: "collectibles-generations",
          sourceKey: "phase35-pelikan-collectibles-m400",
          scopeKey: "old-style",
          locator: "M400 Old Style 1982-1997 and M400 since 09/1997",
        },
        {
          key: "perch-generations",
          sourceKey: "phase35-pelikans-perch-400-vs-m400",
          scopeKey: "post-1997",
          locator: "M400 1982-97 vs M400 1997-present comparison",
        },
      ],
    },
    {
      key: "old-style-specs",
      predicate: "historical_platform_specs",
      objectText:
        "Old Style 收藏表列 125 mm、11.7 mm、14.0 g、1.40 ml 与 14 ct 金尖，不覆盖现行目录。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: "phase35-pelikan-collectibles-m400",
      locator: "M400 Old Style measurement and nib table",
      evidence: [
        {
          key: "old-style-table",
          sourceKey: "phase35-pelikan-collectibles-m400",
          scopeKey: "old-style",
          locator: "125 mm, 11.7 mm, 14.0 g, 1.40 ml and 14 ct nib",
        },
      ],
    },
    {
      key: "current-specs",
      predicate: "current_dimensions_weight_capacity",
      objectText:
        "2025 官方目录列闭帽 12.7 cm、直径 11.7 mm、14.9 g、1.3 ml 与 S；收藏表对 1997+ 另列 125 mm 和 15.3 g。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "pelikan-catalog-2025",
      locator: "page 27 Souverän M400 size row",
      evidence: [
        {
          key: "catalog-current",
          sourceKey: "pelikan-catalog-2025",
          scopeKey: "current-2025",
          locator: "M400: 12.7 cm, 11.7 mm, 14.9 g, 1.3 ml, S",
        },
        {
          key: "collectibles-new-style",
          sourceKey: "phase35-pelikan-collectibles-m400",
          scopeKey: "post-1997",
          locator: "M400 since 09/1997: 125 mm, 11.7 mm, 15.3 g and 1.30 ml",
        },
      ],
    },
    {
      key: "current-configuration",
      predicate: "current_configuration",
      objectText:
        "现行黑绿 M400 使用活塞、14K/585 双色金尖、EF/F/M/B 与条纹 cellulose acetate 饰带。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "phase35-pelikan-official-m400-mam",
      locator: "official product detail and USP",
      evidence: [
        {
          key: "official-configuration",
          sourceKey: "phase35-pelikan-official-m400-mam",
          scopeKey: "current-2025",
          locator:
            "piston filler, 14-carat bi-color EF/F/M/B, striped cellulose acetate and resin",
        },
      ],
    },
    {
      key: "design-boundary",
      predicate: "generation_design_changes",
      objectText:
        "1997 改版增加握位饰环、尾钮双环与双帽环，并把标准单色尖改为双色尖；帽顶后续仍有变化。",
      factClass: "core",
      confidence: 0.97,
      sourceKey: "phase35-pelikans-perch-400-vs-m400",
      locator: "M400 1982-97 vs 1997-present visual comparison",
      evidence: [
        {
          key: "visual-boundary",
          sourceKey: "phase35-pelikans-perch-400-vs-m400",
          scopeKey: "post-1997",
          locator:
            "cap top, cap band, nib, section trim and piston-knob trim differences",
        },
      ],
    },
    {
      key: "historical-identification",
      predicate: "predecessor_identity_boundary",
      objectText:
        "1950–1965 Pelikan 400 与 1982 年后的 M400 必须分开：前者硬橡胶供墨有四道纵向鳍片且伸出活塞时可见尾钮下机构螺纹，M400 改用横向多鳍片塑料供墨且尾钮下不见该螺纹。",
      factClass: "core",
      confidence: 0.97,
      sourceKey: "phase35-pelikans-perch-400-vs-m400",
      locator: "feed and piston-knob differences between Pelikan 400 and M400",
      evidence: [
        {
          key: "400-m400-feed-piston",
          sourceKey: "phase35-pelikans-perch-400-vs-m400",
          scopeKey: "old-style",
          locator:
            "four longitudinal ebonite feed fins and visible 400 piston threads versus multi-fin plastic M400 feed and hidden threads",
        },
      ],
    },
    {
      key: "japan-market-numbering",
      predicate: "market_label_boundary",
      objectText:
        "早期日本市场出现的 #500 或 M500 是特定市场编号线索，不是整个 M400 的通用别名，也不据此另拆型号。",
      factClass: "editorial",
      confidence: 0.96,
      sourceKey: "phase35-pelikan-collectibles-m400",
      locator: "early Japanese-market #500 / M500 labeling note",
      evidence: [
        {
          key: "japan-market-label",
          sourceKey: "phase35-pelikan-collectibles-m400",
          scopeKey: "old-style",
          locator: "Japan-market #500 and M500 designation note",
        },
      ],
    },
    {
      key: "color-cross-generation",
      predicate: "color_generation_boundary",
      objectText:
        "蓝条同时见于 1995–1997 Old Style 与 1997 年后的 New Style，棕色龟纹也跨越 1984–1997 与 1998–2006；颜色不能单独断代。",
      factClass: "editorial",
      confidence: 0.97,
      sourceKey: "phase35-pelikan-collectibles-m400",
      locator: "dated Old Style and New Style color tables",
      evidence: [
        {
          key: "old-style-crossing-colors",
          sourceKey: "phase35-pelikan-collectibles-m400",
          scopeKey: "old-style",
          locator: "Old Style Blue 1995-1997 and Brown Tortoise 1984-1997",
        },
        {
          key: "new-style-crossing-colors",
          sourceKey: "phase35-pelikan-collectibles-m400",
          scopeKey: "post-1997",
          locator: "post-1997 Blue and Brown Tortoise 1998-2006",
        },
      ],
    },
  ],
  spec: {
    brandEntityId: PHASE35_PELIKAN_ID,
    values: {
      series_name: "Souverän M400",
      release_year: "1982；1997-09 改版",
      origin_country: "德国",
      nib: "Old Style 14 ct 单色；现行 14K/585 双色 EF/F/M/B",
      fill_system: "内置活塞；现行目录约 1.3 ml",
      material:
        "现行黑绿款为条纹 cellulose acetate 饰带与高等级树脂部件；其他配色逐版核对",
      dimensions:
        "2025 官方：闭帽 12.7 cm、直径 11.7 mm、S；收藏表两代均记 125 mm",
      weight:
        "2025 官方 14.9 g；Old Style 14.0 g；1997+ 收藏表 15.3 g",
      status: "现行型号；按 Old/New Style 分代",
    },
    evidence: [
      {
        key: "brand",
        fieldKey: "brand_entity_id",
        sourceKey: "phase35-pelikan-official-m400-mam",
        scopeKey: "current-2025",
        locator: "official Pelikan M400 product record",
      },
      {
        key: "series",
        fieldKey: "series_name",
        sourceKey: "phase35-pelikan-official-m400-mam",
        scopeKey: "current-2025",
        locator: "product short name M 400",
      },
      {
        key: "release",
        fieldKey: "release_year",
        sourceKey: "phase35-pelikan-collectibles-m400",
        scopeKey: "old-style",
        locator: "M400 Old Style production 1982-1997",
      },
      {
        key: "release-post-1997",
        fieldKey: "release_year",
        sourceKey: "phase35-pelikans-perch-400-vs-m400",
        scopeKey: "post-1997",
        locator: "M400 post-1997 redesign and trim change",
      },
      {
        key: "origin",
        fieldKey: "origin_country",
        sourceKey: "phase35-pelikan-official-m400-mam",
        scopeKey: "current-2025",
        locator: "Made in Germany",
      },
      {
        key: "nib-old-style",
        fieldKey: "nib",
        sourceKey: "phase35-pelikan-collectibles-m400",
        scopeKey: "old-style",
        locator: "Old Style 14 ct single-color nib record",
      },
      {
        key: "nib-new-style-transition",
        fieldKey: "nib",
        sourceKey: "phase35-pelikans-perch-400-vs-m400",
        scopeKey: "post-1997",
        locator: "post-1997 change from monotone to bicolor nib treatment",
      },
      {
        key: "nib-current",
        fieldKey: "nib",
        sourceKey: "phase35-pelikan-official-m400-mam",
        scopeKey: "current-2025",
        locator: "current 14-carat bicolor nib in EF, F, M and B",
      },
      {
        key: "fill",
        fieldKey: "fill_system",
        sourceKey: "phase35-pelikan-official-m400-mam",
        scopeKey: "current-2025",
        locator: "piston filling mechanism",
      },
      {
        key: "fill-capacity-current",
        fieldKey: "fill_system",
        sourceKey: "pelikan-catalog-2025",
        scopeKey: "current-2025",
        locator: "M400 current catalogue capacity 1.3 ml",
      },
      {
        key: "material",
        fieldKey: "material",
        sourceKey: "phase35-pelikan-official-m400-mam",
        scopeKey: "current-2025",
        locator:
          "current Black-Green product: individual striped cellulose acetate material and resin casing",
      },
      {
        key: "dimensions-catalog",
        fieldKey: "dimensions",
        sourceKey: "pelikan-catalog-2025",
        scopeKey: "current-2025",
        locator: "12.7 cm, 11.7 mm and S",
      },
      {
        key: "dimensions-collectibles",
        fieldKey: "dimensions",
        sourceKey: "phase35-pelikan-collectibles-m400",
        scopeKey: "post-1997",
        locator: "125 mm and 11.7 mm",
      },
      {
        key: "weight-catalog",
        fieldKey: "weight",
        sourceKey: "pelikan-catalog-2025",
        scopeKey: "current-2025",
        locator: "14.9 g",
      },
      {
        key: "weight-collectibles",
        fieldKey: "weight",
        sourceKey: "phase35-pelikan-collectibles-m400",
        scopeKey: "post-1997",
        locator: "15.3 g post-1997 and 14.0 g Old Style",
      },
      {
        key: "status-production-history",
        fieldKey: "status",
        sourceKey: "phase35-pelikan-collectibles-m400",
        scopeKey: "post-1997",
        locator: "M400 since 09/1997",
      },
      {
        key: "status-current-catalog",
        fieldKey: "status",
        sourceKey: "pelikan-catalog-2025",
        scopeKey: "current-2025",
        locator: "M400 listed in the 2025 official catalogue",
      },
    ],
  },
  conflicts: [
    {
      key: "current-measurement-sources",
      fieldKey: "dimensions_weight",
      scopeKey: "current-2025",
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "Use the 2025 official catalogue as the current value while preserving the collector platform table as a separately dated historical measurement source.",
      members: [
        { citationKey: "dimensions-catalog", assertedValue: "127 mm" },
        { citationKey: "dimensions-collectibles", assertedValue: "125 mm" },
        { citationKey: "weight-catalog", assertedValue: "14.9 g" },
        { citationKey: "weight-collectibles", assertedValue: "15.3 g" },
      ],
    },
  ],
  media: [
    {
      key: "m400-factual-primary",
      title: "M400 Old/New Style 边界对照卡",
      sourceKey: "phase35-m400-site-original",
      localPath:
        "/images/library/site-original/pelikan-souveran-variants/pelikan-m400-generations-factual.svg",
      author: "Fountain Pen Graph editorial studio",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph 本站原创事实图；用来展示年代与规格边界，非实物照、非比例图。",
      sourceUrl:
        "/images/library/site-original/pelikan-souveran-variants/pelikan-m400-generations-factual.svg",
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: "old-style-launch",
      title: "M400 恢复生产",
      eventType: "model_released",
      startDate: "1982",
      circa: false,
      description: "现代 M400 Old Style 起点，不是 1950s Pelikan 400。",
      sourceKey: "phase35-pelikan-collectibles-m400",
    },
    {
      key: "new-style-revision",
      title: "M400 饰件与笔尖改版",
      eventType: "design_milestone",
      startDate: "1997-09-01",
      circa: false,
      description: "增加饰环并改为标准双色金尖。",
      sourceKey: "phase35-pelikan-collectibles-m400",
    },
  ],
};

const M605_PACK: CuratedEntityPack = {
  key: "phase35-pelikan-m605-family-v1",
  entityId: PHASE35_M605_ID,
  expectedType: "pen",
  expectedSlug: "pelikan-souveran-m605",
  canonicalName: "Pelikan Souverän M605",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/pelikan-m605-family-publishable-content-2026-07-19.md",
  storyTitle: "Pelikan M605：八个银饰版本与逐版笔尖边界",
  primarySourceKey: "phase35-pelikan-official-m605-stresemann-mam",
  depthTier: "A",
  aliases: [
    {
      alias: "Pelikan M605",
      language: "en",
      sourceKey: "phase35-pelikans-perch-m605-database",
    },
    {
      alias: "Pelikan Souverän M605",
      language: "de",
      sourceKey: "phase35-pelikan-collectibles-m605-family",
    },
    {
      alias: "Pelikan Souveran M605",
      language: "en",
      sourceKey: "phase35-pelikans-perch-m605-database",
    },
    {
      alias: "百利金 M605",
      language: "zh",
      sourceKey: "phase35-pelikan-collectibles-m605-family",
    },
  ],
  sources: [
    source("pelikan-catalog-2025"),
    source("phase35-pelikans-perch-m605-database"),
    source("phase35-pelikan-collectibles-m605-family"),
    source("phase35-pelikan-catalog-2013-2014-m605"),
    source("phase35-pelikan-annual-report-2013-marine-blue"),
    source("phase35-pelikans-perch-m605-white-transparent"),
    source("phase35-pelikans-perch-m605-stresemann"),
    source("phase35-pelikan-official-m605-stresemann-mam"),
    source("phase35-pelikans-perch-m605-green-white"),
    source("phase35-pelikan-official-m605-green-white-salesfolder"),
    source("phase35-pelikan-official-m605-black-tortoise"),
    source("phase35-pelikans-perch-m605-black-tortoise"),
    source("phase35-pelikan-official-care"),
    source("phase35-m605-site-original"),
  ],
  variants: [
    {
      key: "dark-blue-2003",
      name: "M605 Solid Dark Blue",
      releaseYear: "2003",
      notes: "最初的 M605，以深蓝银饰出口版起步；收藏记录至 2015。",
      sourceKey: "phase35-pelikan-collectibles-m605-family",
      variantKind: "color",
    },
    {
      key: "black-2012",
      name: "M605 Black",
      releaseYear: "2012",
      notes: "纯黑笔杆与笔帽、银色饰件；与同年 Blue Striated 分列。",
      sourceKey: "phase35-pelikan-catalog-2013-2014-m605",
      variantKind: "color",
    },
    {
      key: "blue-striated-2012",
      name: "M605 Blue Striated",
      releaseYear: "2012",
      notes: "蓝色条纹笔杆配黑色笔帽；不是 Marine Blue 透明款。",
      sourceKey: "phase35-pelikan-catalog-2013-2014-m605",
      variantKind: "color",
    },
    {
      key: "marine-blue-transparent-2013",
      name: "M605 Marine Blue Transparent",
      releaseYear: "2013",
      notes: "透明海蓝笔杆与笔帽；官方年报确认当年推出并很快售罄。",
      sourceKey: "phase35-pelikan-annual-report-2013-marine-blue",
      variantKind: "color",
    },
    {
      key: "white-transparent-2017",
      name: "M605 White-Transparent",
      releaseYear: "2017",
      notes: "白色树脂与透明笔身特别版；不是 2012 M600 白龟纹。",
      sourceKey: "phase35-pelikans-perch-m605-white-transparent",
      variantKind: "color",
    },
    {
      key: "stresemann-2019",
      name: "M605 Stresemann / Black-Anthracite",
      releaseYear: "2019",
      notes: "灰黑条纹、黑色树脂与银色饰件；2025 官方目录仍列售。",
      sourceKey: "phase35-pelikan-official-m605-stresemann-mam",
      variantKind: "color",
    },
    {
      key: "green-white-2021",
      name: "M605 Green-White",
      releaseYear: "2021",
      notes: "绿色条纹 cellulose acetate、白色树脂与镀钯色饰件。",
      sourceKey: "phase35-pelikan-official-m605-green-white-salesfolder",
      variantKind: "color",
    },
    {
      key: "tortoiseshell-black-2022",
      name: "M605 Tortoiseshell-Black",
      releaseYear: "2022",
      notes: "灰黑龟纹感条带、黑色树脂与银色饰件特别版。",
      sourceKey: "phase35-pelikan-official-m605-black-tortoise",
      variantKind: "color",
    },
  ],
  scopes: [
    {
      key: "dark-blue-2003",
      scopeKey: "pelikan-m605-dark-blue-2003",
      variantKey: "dark-blue-2003",
      validFrom: "2003",
      validTo: "2015",
      productionState: "historical",
      nibScope: "14C/585 金尖；早期资料记录双色外观",
      materialScope: "深蓝笔杆与笔帽、银色饰件",
      editionScope: "M605 Solid Dark Blue 出口版",
    },
    {
      key: "black-2012",
      scopeKey: "pelikan-m605-black-2012",
      variantKey: "black-2012",
      validFrom: "2012",
      validTo: "2012",
      productionState: "historical",
      nibScope: "14K 铑饰金尖；目录图与早期资料显示双色外观",
      materialScope: "黑色笔杆、黑色笔帽、银色饰件",
      editionScope: "M605 Black 2012 特别生产款",
    },
    {
      key: "blue-striated-2012",
      scopeKey: "pelikan-m605-blue-striated-2012",
      variantKey: "blue-striated-2012",
      validFrom: "2012",
      validTo: "2012",
      productionState: "historical",
      nibScope: "14K 铑饰金尖；目录图与早期资料显示双色外观",
      materialScope: "蓝色条纹笔杆、黑色笔帽、银色饰件",
      editionScope: "M605 Blue Striated 2012 特别生产款",
    },
    {
      key: "marine-blue-transparent-2013",
      scopeKey: "pelikan-m605-marine-blue-transparent-2013",
      variantKey: "marine-blue-transparent-2013",
      validFrom: "2013",
      validTo: "2013",
      productionState: "historical",
      nibScope: "14C/585 单色镀铑金尖；可靠来源未完整列出字幅",
      materialScope: "透明海蓝笔杆与同色透明笔帽",
      editionScope: "M605 Marine Blue Transparent 2013",
    },
    {
      key: "white-transparent-2017",
      scopeKey: "pelikan-m605-white-transparent-2017",
      variantKey: "white-transparent-2017",
      validFrom: "2017",
      validTo: "2017",
      productionState: "historical",
      nibScope: "14C/585 单色镀铑金尖，EF/F/M/B",
      materialScope: "透明笔杆与白色树脂部件；现有来源不外推具体透明材料",
      editionScope: "M605 White-Transparent 2017",
    },
    {
      key: "stresemann-2019",
      scopeKey: "pelikan-m605-stresemann-2019",
      variantKey: "stresemann-2019",
      validFrom: "2019",
      validTo: null,
      productionState: "current",
      nibScope: "14K/585 全镀铑金尖，EF/F/M/B",
      materialScope: "anthracite 条纹 cellulose acetate 与黑色树脂部件",
      editionScope: "M605 Stresemann / Black-Anthracite 现行目录款",
    },
    {
      key: "green-white-2021",
      scopeKey: "pelikan-m605-green-white-2021",
      variantKey: "green-white-2021",
      validFrom: "2021",
      validTo: "2021",
      productionState: "historical",
      nibScope: "14K/585 全镀铑金尖，EF/F/M/B",
      materialScope: "绿色条纹 cellulose acetate 饰带与白色树脂部件",
      editionScope: "M605 Green-White 2021",
    },
    {
      key: "tortoiseshell-black-2022",
      scopeKey: "pelikan-m605-tortoiseshell-black-2022",
      variantKey: "tortoiseshell-black-2022",
      validFrom: "2022",
      validTo: "2022",
      productionState: "historical",
      nibScope: "14K/585 全镀铑金尖，EF/F/M/B",
      materialScope: "灰黑／蓝灰珠光条纹 cellulose acetate 与黑色树脂部件",
      editionScope: "M605 Tortoiseshell-Black 2022",
    },
    {
      key: "family-platform",
      scopeKey: "pelikan-m605-family-platform-2003-2022",
      validFrom: "2003",
      productionState: "current",
      nibScope: "14C/585 gold; finish varies by edition",
      materialScope: "silver/palladium-colored trim identity; barrel material varies",
      editionScope:
        "截至 2022 记录八种外观版本；Stresemann 为现行目录款；排除 2012 M600 Tortoiseshell-White 误标",
    },
    {
      key: "maintenance",
      scopeKey: "pelikan-m605-maintenance-boundary-2026-07-19",
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope:
        "routine piston flushing; press-fit M6xx piston assembly is not routine user disassembly",
    },
    {
      key: "media",
      scopeKey: "pelikan-m605-family-factual-svg-2026-07-19",
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope: "site-original timeline; not product or color evidence",
    },
  ],
  claims: [
    {
      key: "family-identity",
      predicate: "model_family_identity",
      objectText:
        "M605 于 2003 年以深蓝出口版起步，是 M6xx 银色／镀钯色饰件家族，不是某一个白色配色名。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "phase35-pelikans-perch-m605-database",
      locator: "M605 introduction and trim identity",
      evidence: [
        {
          key: "perch-family",
          sourceKey: "phase35-pelikans-perch-m605-database",
          scopeKey: "family-platform",
          locator: "2003 Dark Blue debut and rhodium-plated furniture distinction",
        },
        {
          key: "collectibles-family",
          sourceKey: "phase35-pelikan-collectibles-m605-family",
          scopeKey: "dark-blue-2003",
          locator: "M605 Dark Blue 2003-2015 export model",
        },
      ],
    },
    {
      key: "required-versions",
      predicate: "documented_versions",
      objectText:
        "已分开记录 2003 Solid Dark Blue、2012 Black、2012 Blue Striated、2013 Marine Blue Transparent、2017 White-Transparent、2019 Stresemann、2021 Green-White 与 2022 Tortoiseshell-Black。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "phase35-pelikan-collectibles-m605-family",
      locator: "M605 version table",
      evidence: [
        {
          key: "version-table",
          sourceKey: "phase35-pelikan-collectibles-m605-family",
          scopeKey: "family-platform",
          locator: "eight M605 production/color entries from 2003 through 2022",
        },
      ],
    },
    {
      key: "2012-black-blue-catalog",
      predicate: "variant_identity_boundary",
      objectText:
        "2012 Black 与 Blue Striated 是两个独立特别生产款；官方目录同页列活塞、14K 铑饰金尖及 EF/F/M/B。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "phase35-pelikan-catalog-2013-2014-m605",
      locator: "PDF page 7 / printed pages 12-13",
      evidence: [
        {
          key: "catalog-2012-black",
          sourceKey: "phase35-pelikan-catalog-2013-2014-m605",
          scopeKey: "black-2012",
          locator: "Souverän 605 Black special production listing",
        },
        {
          key: "catalog-2012-blue",
          sourceKey: "phase35-pelikan-catalog-2013-2014-m605",
          scopeKey: "blue-striated-2012",
          locator: "Souverän 605 Blue special production listing",
        },
      ],
    },
    {
      key: "marine-blue-2013",
      predicate: "variant_release_identity",
      objectText:
        "官方年报确认 2013 年推出 M605 Marine Blue 并很快售罄；版本资料将其绑定透明海蓝笔杆、同色透明笔帽与单色镀铑尖。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "phase35-pelikan-annual-report-2013-marine-blue",
      locator: "PDF page 31 / printed page 28",
      evidence: [
        {
          key: "annual-report-release",
          sourceKey: "phase35-pelikan-annual-report-2013-marine-blue",
          scopeKey: "marine-blue-transparent-2013",
          locator: "2013 launch and rapid sell-out",
        },
        {
          key: "perch-marine-identity",
          sourceKey: "phase35-pelikans-perch-m605-database",
          scopeKey: "marine-blue-transparent-2013",
          locator: "Marine Blue Transparent color and monotone rhodium-plated nib",
        },
      ],
    },
    {
      key: "nib-finish-by-edition",
      predicate: "nib_finish_scope",
      objectText:
        "2003 与 2012 三款按早期资料保留双色／铑饰表述；2013、2017、2019、2021、2022 依各版本专属资料绑定单色或全镀铑，不给整个家族写统一表面处理。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: "phase35-pelikans-perch-m605-database",
      locator: "family nib note read together with later edition-specific sources",
      evidence: [
        {
          key: "early-nib-note",
          sourceKey: "phase35-pelikans-perch-m605-database",
          scopeKey: "family-platform",
          locator: "early family nib note and Marine Blue exception",
        },
        {
          key: "white-nib",
          sourceKey: "phase35-pelikans-perch-m605-white-transparent",
          scopeKey: "white-transparent-2017",
          locator: "monotone rhodium-plated 14C/585 nib and EF/F/M/B",
        },
        {
          key: "stresemann-nib",
          sourceKey: "phase35-pelikan-official-m605-stresemann-mam",
          scopeKey: "stresemann-2019",
          locator: "completely rhodium-plated 14-carat nib and EF/F/M/B",
        },
        {
          key: "green-white-nib",
          sourceKey: "phase35-pelikan-official-m605-green-white-salesfolder",
          scopeKey: "green-white-2021",
          locator: "fully rhodium-plated 14-carat nib and EF/F/M/B",
        },
        {
          key: "black-tortoise-nib",
          sourceKey: "phase35-pelikan-official-m605-black-tortoise",
          scopeKey: "tortoiseshell-black-2022",
          locator: "14K/585 rhodium-plated nib and EF/F/M/B",
        },
      ],
    },
    {
      key: "stresemann-current-status",
      predicate: "current_catalog_status",
      objectText:
        "M605 Stresemann 自 2019 年起进入标准目录，2025 官方目录仍列该款；不能把整个 M605 家族写成已停产特别版。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "pelikan-catalog-2025",
      locator: "2025 official catalogue M605 Stresemann listing",
      evidence: [
        {
          key: "official-mam-current-identity",
          sourceKey: "phase35-pelikan-official-m605-stresemann-mam",
          scopeKey: "stresemann-2019",
          locator: "M605 Stresemann product detail and publication CW 36/2019",
        },
        {
          key: "catalog-2025-current",
          sourceKey: "pelikan-catalog-2025",
          scopeKey: "stresemann-2019",
          locator: "M605 Stresemann in the 2025 Souverän catalogue",
        },
      ],
    },
    {
      key: "platform-specs",
      predicate: "family_platform_specs",
      objectText:
        "收藏平台表列 133 mm、12.4 mm、18.0 g 和 1.30 ml；这是家族参考，不是所有版本的单支官方测量。",
      factClass: "core",
      confidence: 0.96,
      sourceKey: "phase35-pelikan-collectibles-m605-family",
      locator: "M605 family measurement table",
      evidence: [
        {
          key: "platform-table",
          sourceKey: "phase35-pelikan-collectibles-m605-family",
          scopeKey: "family-platform",
          locator: "133 mm, 12.4 mm, 18.0 g and 1.30 ml",
        },
      ],
    },
    {
      key: "official-2022-specs",
      predicate: "variant_2022_configuration",
      objectText:
        "2022 Tortoiseshell-Black 官方页列活塞、14K/585 全镀铑金尖、EF/F/M/B、cellulose acetate、13.3 cm 和 16.4 g。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "phase35-pelikan-official-m605-black-tortoise",
      locator: "official 2022 product details and facts",
      evidence: [
        {
          key: "official-2022",
          sourceKey: "phase35-pelikan-official-m605-black-tortoise",
          scopeKey: "tortoiseshell-black-2022",
          locator:
            "piston, 14K/585 rhodium nib, EF/F/M/B, cellulose acetate, 13.3 cm and 16.4 g",
        },
      ],
    },
    {
      key: "mislabel-boundary",
      predicate: "identity_exclusion",
      objectText:
        "2012 Tortoiseshell-White 是金饰 M600；2017 White-Transparent 与 2021 Green-White 才是白色系 M605，三者不能合并。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "phase35-pelikans-perch-m605-green-white",
      locator: "white M6xx chronology in Green-White announcement",
      evidence: [
        {
          key: "white-identity-boundary",
          sourceKey: "phase35-pelikans-perch-m605-green-white",
          scopeKey: "green-white-2021",
          locator:
            "2012 M600 Tortoiseshell White, 2017 M605 White Transparent and 2021 M605 Green-White",
        },
      ],
    },
  ],
  spec: {
    brandEntityId: PHASE35_PELIKAN_ID,
    values: {
      series_name: "Souverän M605 型号家族",
      release_year: "2003",
      origin_country: "德国",
      nib: "14C/585 金尖；2003 与 2012 三款为双色／铑饰记录，2013、2017、2019、2021、2022 按版本专属资料为单色或全镀铑",
      fill_system: "内置活塞；家族档案约 1.30 ml",
      material:
        "银色／镀钯色饰件为身份主线；笔杆材料按版本记录",
      dimensions:
        "收藏平台表 133 mm、12.4 mm；2022 官方闭帽 13.3 cm",
      weight:
        "2022 Tortoiseshell-Black 官方 16.4 g；收藏平台表 18.0 g",
      status: "八个有资料支持的版本；2003–2017 及 2021、2022 为历史版本，Stresemann 自 2019 年起进入标准目录并仍见于 2025 官方目录",
    },
    evidence: [
      {
        key: "brand",
        fieldKey: "brand_entity_id",
        sourceKey: "phase35-pelikan-official-m605-black-tortoise",
        scopeKey: "tortoiseshell-black-2022",
        locator: "official Pelikan M605 product page",
      },
      {
        key: "series",
        fieldKey: "series_name",
        sourceKey: "phase35-pelikans-perch-m605-database",
        scopeKey: "family-platform",
        locator: "M605 family heading and introduction",
      },
      {
        key: "release",
        fieldKey: "release_year",
        sourceKey: "phase35-pelikan-collectibles-m605-family",
        scopeKey: "dark-blue-2003",
        locator: "M605 Dark Blue production begins 2003",
      },
      {
        key: "origin",
        fieldKey: "origin_country",
        sourceKey: "phase35-pelikan-official-m605-black-tortoise",
        scopeKey: "tortoiseshell-black-2022",
        locator: "manufactured and assembled in Germany",
      },
      {
        key: "nib-family-database",
        fieldKey: "nib",
        sourceKey: "phase35-pelikans-perch-m605-database",
        scopeKey: "family-platform",
        locator: "14C-585 family nib and edition-specific finish note",
      },
      {
        key: "nib-later-editions",
        fieldKey: "nib",
        sourceKey: "phase35-pelikan-official-m605-stresemann-mam",
        scopeKey: "stresemann-2019",
        locator: "2019 Stresemann completely rhodium-plated 14-carat nib",
      },
      {
        key: "nib-white-transparent-2017",
        fieldKey: "nib",
        sourceKey: "phase35-pelikans-perch-m605-white-transparent",
        scopeKey: "white-transparent-2017",
        locator: "2017 monotone rhodium-plated 14C/585 nib in EF, F, M and B",
      },
      {
        key: "nib-green-white-2021",
        fieldKey: "nib",
        sourceKey: "phase35-pelikan-official-m605-green-white-salesfolder",
        scopeKey: "green-white-2021",
        locator: "2021 fully rhodium-plated 14-carat nib in EF, F, M and B",
      },
      {
        key: "nib-tortoiseshell-black-2022",
        fieldKey: "nib",
        sourceKey: "phase35-pelikan-official-m605-black-tortoise",
        scopeKey: "tortoiseshell-black-2022",
        locator: "2022 rhodium-plated 14K/585 nib in EF, F, M and B",
      },
      {
        key: "fill",
        fieldKey: "fill_system",
        sourceKey: "phase35-pelikan-official-m605-black-tortoise",
        scopeKey: "tortoiseshell-black-2022",
        locator: "piston fountain pen",
      },
      {
        key: "fill-capacity",
        fieldKey: "fill_system",
        sourceKey: "phase35-pelikan-collectibles-m605-family",
        scopeKey: "family-platform",
        locator: "M605 platform table 1.30 ml",
      },
      {
        key: "material",
        fieldKey: "material",
        sourceKey: "phase35-pelikans-perch-m605-database",
        scopeKey: "family-platform",
        locator: "rhodium-plated furniture and edition color patterns",
      },
      {
        key: "dimensions-platform",
        fieldKey: "dimensions",
        sourceKey: "phase35-pelikan-collectibles-m605-family",
        scopeKey: "family-platform",
        locator: "133 mm and 12.4 mm",
      },
      {
        key: "dimensions-2022",
        fieldKey: "dimensions",
        sourceKey: "phase35-pelikan-official-m605-black-tortoise",
        scopeKey: "tortoiseshell-black-2022",
        locator: "13.3 cm capped",
      },
      {
        key: "weight-platform",
        fieldKey: "weight",
        sourceKey: "phase35-pelikan-collectibles-m605-family",
        scopeKey: "family-platform",
        locator: "18.0 g",
      },
      {
        key: "weight-2022",
        fieldKey: "weight",
        sourceKey: "phase35-pelikan-official-m605-black-tortoise",
        scopeKey: "tortoiseshell-black-2022",
        locator: "16.4 g",
      },
      {
        key: "status-current-stresemann",
        fieldKey: "status",
        sourceKey: "pelikan-catalog-2025",
        scopeKey: "stresemann-2019",
        locator: "M605 Stresemann listed in the 2025 official catalogue",
      },
      {
        key: "status-dark-blue-perch",
        fieldKey: "status",
        sourceKey: "phase35-pelikans-perch-m605-database",
        scopeKey: "dark-blue-2003",
        locator: "Dark Blue classified as special edition in family table",
      },
      {
        key: "status-dark-blue-collectibles",
        fieldKey: "status",
        sourceKey: "phase35-pelikan-collectibles-m605-family",
        scopeKey: "dark-blue-2003",
        locator: "Dark Blue 2003-2015 series-production export model",
      },
      {
        key: "status-historical-versions",
        fieldKey: "status",
        sourceKey: "phase35-pelikan-collectibles-m605-family",
        scopeKey: "family-platform",
        locator:
          "production table records Black and Blue in 2012, Marine Blue in 2013, White-Transparent in 2017, Green-White in 2021 and Tortoiseshell-Black in 2022",
      },
    ],
  },
  conflicts: [
    {
      key: "m605-nib-finish-source-age",
      fieldKey: "nib",
      scopeKey: "family-platform",
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "The older family sentence is kept only for the early editions. Later edition-specific records control the 2017-2022 finishes, so no universal bicolor statement is published.",
      members: [
        {
          citationKey: "nib-family-database",
          assertedValue: "family sentence: all except Marine Blue are bicolor",
        },
        {
          citationKey: "nib-later-editions",
          assertedValue: "2019 Stresemann: completely rhodium-plated",
        },
        {
          citationKey: "nib-white-transparent-2017",
          assertedValue: "2017 White-Transparent: monotone rhodium-plated",
        },
        {
          citationKey: "nib-green-white-2021",
          assertedValue: "2021 Green-White: fully rhodium-plated",
        },
        {
          citationKey: "nib-tortoiseshell-black-2022",
          assertedValue: "2022 Tortoiseshell-Black: rhodium-plated",
        },
      ],
    },
    {
      key: "m605-dark-blue-edition-classification",
      fieldKey: "status",
      scopeKey: "dark-blue-2003",
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "The page retains the documented 2003-2015 export production span and does not infer a numbered limitation from the special-edition label.",
      members: [
        {
          citationKey: "status-dark-blue-perch",
          assertedValue: "special edition",
        },
        {
          citationKey: "status-dark-blue-collectibles",
          assertedValue: "2003-2015 series production / export model",
        },
      ],
    },
    {
      key: "m605-weight-versioning",
      fieldKey: "weight",
      scopeKey: "family-platform",
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "The 18.0 g collector value is retained as a family platform table; 16.4 g is bound only to the official 2022 Tortoiseshell-Black product page. No universal M605 weight is asserted.",
      members: [
        { citationKey: "weight-platform", assertedValue: "18.0 g" },
        { citationKey: "weight-2022", assertedValue: "16.4 g" },
      ],
    },
  ],
  media: [
    {
      key: "m605-factual-primary",
      title: "M605 银饰家族版本年表",
      sourceKey: "phase35-m605-site-original",
      localPath:
        "/images/library/site-original/pelikan-souveran-variants/pelikan-m605-family-factual.svg",
      author: "Fountain Pen Graph editorial studio",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph 本站原创事实图；只展示已引用的年份和版本边界，非产品照、非色差证据。",
      sourceUrl:
        "/images/library/site-original/pelikan-souveran-variants/pelikan-m605-family-factual.svg",
      usageStatus: "primary",
    },
  ],
  timeline: [
    ...[
      ["dark-blue-2003", "M605 Solid Dark Blue 推出", "2003", "phase35-pelikan-collectibles-m605-family"],
      ["black-2012", "M605 Black 推出", "2012", "phase35-pelikan-collectibles-m605-family"],
      ["blue-striated-2012", "M605 Blue Striated 推出", "2012", "phase35-pelikan-collectibles-m605-family"],
      ["marine-blue-transparent-2013", "M605 Marine Blue Transparent 推出", "2013", "phase35-pelikan-annual-report-2013-marine-blue"],
      ["white-transparent-2017", "M605 White-Transparent 推出", "2017", "phase35-pelikans-perch-m605-white-transparent"],
      ["stresemann-2019", "M605 Stresemann 推出", "2019", "phase35-pelikan-official-m605-stresemann-mam"],
      ["green-white-2021", "M605 Green-White 推出", "2021", "phase35-pelikan-official-m605-green-white-salesfolder"],
      ["tortoiseshell-black-2022", "M605 Tortoiseshell-Black 推出", "2022", "phase35-pelikan-official-m605-black-tortoise"],
    ].map(([key, title, startDate, sourceKey]) => ({
      key: String(key),
      title: String(title),
      eventType: "model_released" as const,
      startDate: String(startDate),
      circa: false,
      description: "按具体年份与配色记录，不覆盖其他 M605 版本。",
      sourceKey: String(sourceKey),
    })),
  ],
};

const M815_PACK: CuratedEntityPack = {
  key: "phase35-pelikan-m815-metal-striped-variants-v1",
  entityId: PHASE35_M815_METAL_STRIPED_ID,
  expectedType: "pen",
  expectedSlug: "pelikan-souveran-m815-metal-striped",
  canonicalName: "Pelikan Souverän M815 Metal Striped",
  publicationIntent: "publish",
  publicationBlockers: [],
  markdownFile:
    ".planning/content-research/pelikan-m815-metal-striped-publishable-content-2026-07-19.md",
  storyTitle:
    "Pelikan M815 Metal Striped：2018 Black 38 g 与 2025 Blue 官方 36 g",
  primarySourceKey: "phase35-pelikan-official-m815-blue",
  depthTier: "A",
  aliases: [
    {
      alias: "Pelikan M815 Metal Striped",
      language: "en",
      sourceKey: "phase35-pelikan-collectibles-m815-family",
    },
    {
      alias: "Pelikan Souverän M815 Metal Striped",
      language: "de",
      sourceKey: "phase35-pelikan-official-m815-blue",
    },
    {
      alias: "Pelikan M815 Metal Striped Black",
      language: "en",
      sourceKey: "phase35-pelikan-collectibles-m815-black",
    },
    {
      alias: "Pelikan M815 Metal Striped Blue",
      language: "en",
      sourceKey: "phase35-pelikan-official-m815-blue",
    },
    {
      alias: "百利金 M815 金属条纹",
      language: "zh",
      sourceKey: "phase35-pelikan-collectibles-m815-family",
    },
  ],
  sources: [
    source("phase35-pelikan-official-m815-blue"),
    source("phase35-pelikan-collectibles-m815-black"),
    source("phase35-pelikan-collectibles-m815-family"),
    source("phase35-pelikans-perch-m815-black"),
    source("phase35-pelikans-perch-m815-blue"),
    source("phase35-pelikan-official-care"),
    source("phase35-m815-site-original"),
  ],
  variants: [
    {
      key: "metal-striped-black-2018",
      name: "M815 Metal Striped Black",
      releaseYear: "2018",
      notes:
        "2018 Special Edition；收藏表列 141 mm、13 mm、38 g 与 1.35 ml。",
      sourceKey: "phase35-pelikan-collectibles-m815-black",
      variantKind: "material",
    },
    {
      key: "metal-striped-blue-2025",
      name: "M815 Metal Striped Blue",
      releaseYear: "2025",
      notes:
        "2025 Special Edition；官方页列 14.1 cm、36 g、黄铜基材与 18K/750 全镀铑尖。",
      sourceKey: "phase35-pelikan-official-m815-blue",
      variantKind: "material",
    },
  ],
  scopes: [
    {
      key: "black-2018",
      scopeKey: "pelikan-m815-metal-striped-black-2018",
      variantKey: "metal-striped-black-2018",
      validFrom: "2018",
      validTo: "2018",
      productionState: "historical",
      nibScope: "18 ct gold; exact surface and width must be checked per sample",
      materialScope: "black resin and brass/metal striped construction",
      editionScope: "2018 Metal Striped Black only",
    },
    {
      key: "blue-2025",
      scopeKey: "pelikan-m815-metal-striped-blue-2025",
      variantKey: "metal-striped-blue-2025",
      validFrom: "2025",
      productionState: "current",
      nibScope: "18K/750 fully rhodium-plated; EF, F, M, B",
      materialScope: "blue high-grade resin, brass base and palladium-colored stripes/trim",
      editionScope: "2025 Metal Striped Blue only",
    },
    {
      key: "family-boundary",
      scopeKey: "pelikan-m815-metal-striped-variant-boundary-2026-07-19",
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope:
        "2018 Black and 2025 Blue are separate versions; M815 is not a permanent grade above M805",
    },
    {
      key: "maintenance",
      scopeKey: "pelikan-m815-maintenance-boundary-2026-07-19",
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope:
        "routine piston flushing; metal exterior and threaded M8xx piston require careful service",
    },
    {
      key: "media",
      scopeKey: "pelikan-m815-variants-factual-svg-2026-07-19",
      validFrom: RETRIEVED,
      productionState: "current",
      editionScope: "site-original version card; not a product photograph",
    },
  ],
  claims: [
    {
      key: "variant-boundary",
      predicate: "documented_variants",
      objectText:
        "M815 Metal Striped 分为 2018 Black 与 2025 Blue；年份、颜色与规格必须按版本记录。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "phase35-pelikan-collectibles-m815-family",
      locator: "M815 Black Striped 2018 and Blue Striped 2025 entries",
      evidence: [
        {
          key: "family-variants",
          sourceKey: "phase35-pelikan-collectibles-m815-family",
          scopeKey: "family-boundary",
          locator: "separate 2018 and 2025 Special Edition rows",
        },
      ],
    },
    {
      key: "black-2018-specs",
      predicate: "variant_2018_specs",
      objectText:
        "2018 Black 收藏档案列闭帽 141 mm、直径 13 mm、38 g、1.35 ml 与 18 ct 金尖。",
      factClass: "core",
      confidence: 0.98,
      sourceKey: "phase35-pelikan-collectibles-m815-black",
      locator: "2018 Black detail table",
      evidence: [
        {
          key: "black-archive",
          sourceKey: "phase35-pelikan-collectibles-m815-black",
          scopeKey: "black-2018",
          locator: "141 mm, 13 mm, 38 g, 1.35 ml and 18 ct nib",
        },
        {
          key: "black-review",
          sourceKey: "phase35-pelikans-perch-m815-black",
          scopeKey: "black-2018",
          locator: "5.56 in, 0.53 in and 1.31 oz capped sample",
        },
      ],
    },
    {
      key: "blue-2025-specs",
      predicate: "variant_2025_specs",
      objectText:
        "2025 Blue 现行官方页列闭帽 14.1 cm、36 g、黄铜基材、差动活塞和 18K/750 全镀铑 EF/F/M/B 金尖。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "phase35-pelikan-official-m815-blue",
      locator: "official Blue Details and Facts & Figures",
      evidence: [
        {
          key: "blue-official",
          sourceKey: "phase35-pelikan-official-m815-blue",
          scopeKey: "blue-2025",
          locator:
            "brass base, differential piston, 18K/750 rhodium EF/F/M/B, 14.1 cm and 36 g",
        },
        {
          key: "blue-announcement",
          sourceKey: "phase35-pelikans-perch-m815-blue",
          scopeKey: "blue-2025",
          locator: "announcement figures 14.09 cm, 37.13 g and about 1.35 ml",
        },
      ],
    },
    {
      key: "weight-versioning",
      predicate: "variant_weight_boundary",
      objectText:
        "2018 Black 的 38 g 与 2025 Blue 官方的 36 g 属于两个版本，不存在“M815 共同重量”。",
      factClass: "core",
      confidence: 0.99,
      sourceKey: "phase35-pelikan-official-m815-blue",
      locator: "official 2025 weight compared with 2018 archive table",
      evidence: [
        {
          key: "black-weight",
          sourceKey: "phase35-pelikan-collectibles-m815-black",
          scopeKey: "black-2018",
          locator: "2018 Black: 38 g",
        },
        {
          key: "blue-weight",
          sourceKey: "phase35-pelikan-official-m815-blue",
          scopeKey: "blue-2025",
          locator: "2025 Blue: 36 g",
        },
      ],
    },
  ],
  spec: {
    brandEntityId: PHASE35_PELIKAN_ID,
    values: {
      series_name: "Souverän M815 Metal Striped",
      release_year: "2018 Black；2025 Blue",
      origin_country: "德国",
      nib: "2018 Black 18 ct；2025 Blue 18K/750 全镀铑 EF/F/M/B",
      fill_system: "内置差动活塞；档案容量约 1.35 ml",
      material: "黄铜基材与金属条纹；树脂颜色按 Black／Blue 版本",
      dimensions:
        "2018 Black：141 mm、13 mm；2025 Blue 官方：闭帽 14.1 cm",
      weight:
        "2018 Black：收藏表 38 g、实测约 37.1 g；2025 Blue：官方 36 g、公布资料 37.13 g",
      status: "2018 Black 已停产；2025 Blue Special Edition",
    },
    evidence: [
      {
        key: "brand",
        fieldKey: "brand_entity_id",
        sourceKey: "phase35-pelikan-official-m815-blue",
        scopeKey: "blue-2025",
        locator: "official Pelikan M815 product page",
      },
      {
        key: "series",
        fieldKey: "series_name",
        sourceKey: "phase35-pelikan-collectibles-m815-family",
        scopeKey: "family-boundary",
        locator: "M815 Black and Blue Striped family entries",
      },
      {
        key: "release",
        fieldKey: "release_year",
        sourceKey: "phase35-pelikan-collectibles-m815-family",
        scopeKey: "family-boundary",
        locator: "2018 and 2025 production years",
      },
      {
        key: "origin",
        fieldKey: "origin_country",
        sourceKey: "phase35-pelikan-official-m815-blue",
        scopeKey: "blue-2025",
        locator: "manufactured and assembled in Germany",
      },
      {
        key: "nib",
        fieldKey: "nib",
        sourceKey: "phase35-pelikan-official-m815-blue",
        scopeKey: "blue-2025",
        locator: "18K/750 fully rhodium-plated EF/F/M/B",
      },
      {
        key: "nib-black",
        fieldKey: "nib",
        sourceKey: "phase35-pelikan-collectibles-m815-black",
        scopeKey: "black-2018",
        locator: "2018 Black detail table: 18 ct gold nib",
      },
      {
        key: "fill",
        fieldKey: "fill_system",
        sourceKey: "phase35-pelikan-official-m815-blue",
        scopeKey: "blue-2025",
        locator: "differential piston mechanism",
      },
      {
        key: "fill-capacity",
        fieldKey: "fill_system",
        sourceKey: "phase35-pelikans-perch-m815-blue",
        scopeKey: "blue-2025",
        locator: "announcement figure: approximately 1.35 ml",
      },
      {
        key: "material",
        fieldKey: "material",
        sourceKey: "phase35-pelikan-official-m815-blue",
        scopeKey: "blue-2025",
        locator: "brass base, blue high-grade resin and palladium-colored trim",
      },
      {
        key: "material-black",
        fieldKey: "material",
        sourceKey: "phase35-pelikans-perch-m815-black",
        scopeKey: "black-2018",
        locator: "2018 review: resin body with palladium-plated brass stripes",
      },
      {
        key: "dimensions-black",
        fieldKey: "dimensions",
        sourceKey: "phase35-pelikan-collectibles-m815-black",
        scopeKey: "black-2018",
        locator: "141 mm and 13 mm",
      },
      {
        key: "dimensions-blue",
        fieldKey: "dimensions",
        sourceKey: "phase35-pelikan-official-m815-blue",
        scopeKey: "blue-2025",
        locator: "14.1 cm capped",
      },
      {
        key: "weight-black",
        fieldKey: "weight",
        sourceKey: "phase35-pelikan-collectibles-m815-black",
        scopeKey: "black-2018",
        locator: "38 g",
      },
      {
        key: "weight-blue",
        fieldKey: "weight",
        sourceKey: "phase35-pelikan-official-m815-blue",
        scopeKey: "blue-2025",
        locator: "36 g",
      },
      {
        key: "weight-black-review",
        fieldKey: "weight",
        sourceKey: "phase35-pelikans-perch-m815-black",
        scopeKey: "black-2018",
        locator: "capped review sample: 1.31 oz (approximately 37.1 g)",
      },
      {
        key: "weight-blue-announcement",
        fieldKey: "weight",
        sourceKey: "phase35-pelikans-perch-m815-blue",
        scopeKey: "blue-2025",
        locator: "announcement product literature: 37.13 g",
      },
      {
        key: "status",
        fieldKey: "status",
        sourceKey: "phase35-pelikan-collectibles-m815-family",
        scopeKey: "family-boundary",
        locator: "2018 and 2025 Special Edition rows",
      },
    ],
  },
  conflicts: [
    {
      key: "m815-black-2018-weight-sources",
      fieldKey: "weight",
      scopeKey: "black-2018",
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "For the 2018 Black version, retain the 38 g collector table as the archive value and the approximately 37.1 g capped review sample as a separately measured specimen; do not average them.",
      members: [
        { citationKey: "weight-black", assertedValue: "2018 Black: 38 g" },
        {
          citationKey: "weight-black-review",
          assertedValue: "2018 Black review sample: approximately 37.1 g",
        },
      ],
    },
    {
      key: "m815-blue-2025-weight-sources",
      fieldKey: "weight",
      scopeKey: "blue-2025",
      conflictKind: "field",
      status: "resolved",
      resolutionNote:
        "For the same 2025 Blue version, use the current official product page's 36 g as the main value and preserve the 37.13 g announcement figure as a publication-time source difference.",
      members: [
        { citationKey: "weight-blue", assertedValue: "2025 Blue official: 36 g" },
        {
          citationKey: "weight-blue-announcement",
          assertedValue: "2025 Blue announcement: 37.13 g",
        },
      ],
    },
  ],
  media: [
    {
      key: "m815-factual-primary",
      title: "M815 Metal Striped Black/Blue 版本规格卡",
      sourceKey: "phase35-m815-site-original",
      localPath:
        "/images/library/site-original/pelikan-souveran-variants/pelikan-m815-metal-striped-variants-factual.svg",
      author: "Fountain Pen Graph editorial studio",
      license: "site-original",
      attributionText:
        "Fountain Pen Graph 本站原创事实图；仅分栏展示已引用的版本规格，非产品照、非比例图。",
      sourceUrl:
        "/images/library/site-original/pelikan-souveran-variants/pelikan-m815-metal-striped-variants-factual.svg",
      usageStatus: "primary",
    },
  ],
  timeline: [
    {
      key: "black-2018",
      title: "M815 Metal Striped Black 推出",
      eventType: "model_released",
      startDate: "2018",
      circa: false,
      description: "黑色金属条纹 Special Edition；后与 2025 Blue 分版记录。",
      sourceKey: "phase35-pelikan-collectibles-m815-black",
    },
    {
      key: "blue-2025",
      title: "M815 Metal Striped Blue 推出",
      eventType: "model_released",
      startDate: "2025-06",
      circa: false,
      description: "蓝色金属条纹 Special Edition，现行官方规格单独记录。",
      sourceKey: "phase35-pelikans-perch-m815-blue",
    },
  ],
};

const PELIKAN_BRAND_PACK = phase32PelikanP0Packs.find(
  (pack) => pack.entityId === PHASE35_PELIKAN_ID && pack.expectedType === "brand",
);

if (!PELIKAN_BRAND_PACK) {
  throw new Error("Phase 35 requires the reviewed Phase 32 Pelikan brand pack.");
}

export const phase35PelikanSouveranVariantPacks: CuratedEntityPack[] = [
  structuredClone(PELIKAN_BRAND_PACK),
  M1005_PACK,
  M400_PACK,
  M605_PACK,
  M815_PACK,
];
