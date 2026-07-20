import type { CuratedEntityPack, CuratedSource } from "../lib/curated-content-pack";
import { phase22MontblancPacks } from "./phase22-montblanc";

export const PHASE103_MONTBLANC_BRAND_ID = "CJM8uLY0LmIX";
export const PHASE103_144_ID = "Eh5c49pldpwk";
export const PHASE103_22_ID = "nOIr_Up5WcyJ";
export const PHASE103_144_OLD_SLUG = "万宝龙-montblanc-144";
export const PHASE103_22_OLD_SLUG = "万宝龙-montblanc-学生龙22";
export const PHASE103_144_SLUG = "montblanc-no-144-piston-1949";
export const PHASE103_22_SLUG = "montblanc-no-22-1960s";

const RETRIEVED = "2026-07-20";
function diagram(key: string, title: string, localPath: string): CuratedSource {
  return { key, registryKey: "fountain-pen-graph-editorial-phase103", registryName: "Fountain Pen Graph editorial studio", sourceType: "user_submission", tier: "primary", independenceGroup: "fountain-pen-graph-editorial-phase103", title, url: localPath, homepageUrl: "/", itemType: "image", author: "Fountain Pen Graph editorial", retrievedAt: RETRIEVED, allowedUse: "store_full", license: "site-original", summary: "本站原创事实示意图，非产品照片。", archiveUrl: localPath, archiveLocator: `project-public-asset:${localPath};site-original=true;factual-svg=true;product-photo=false;to-scale=false` };
}
function image(key: string, title: string, source: CuratedSource) {
  return [{ key, title, sourceKey: source.key, localPath: source.url, author: "Fountain Pen Graph editorial", license: "site-original", attributionText: "Fountain Pen Graph 本站原创事实示意图，非产品照片；不代表任何一支存世万宝龙的比例、颜色、笔尖、材料、年份、保存状态或原装性。", sourceUrl: source.url, usageStatus: "primary" as const }];
}
function required(id: string) { const pack = phase22MontblancPacks.find((item) => item.entityId === id); if (!pack) throw new Error(`Missing Phase 22 Montblanc pack: ${id}`); return structuredClone(pack); }
const brand = required(PHASE103_MONTBLANC_BRAND_ID);
brand.key = "phase103-montblanc-brand-v1";
brand.publicationIntent = "publish";
brand.publicationBlockers = [];
const model144 = required(PHASE103_144_ID);
const image144 = diagram("phase103-montblanc-144-svg", "Montblanc No. 144 代际边界事实图", "/images/library/site-original/montblanc-vintage/montblanc-no-144-piston.svg");
model144.key = "phase103-montblanc-no-144-v1";
model144.expectedSlug = PHASE103_144_SLUG;
model144.canonicalName = "Montblanc No. 144（1949 后战活塞款）";
model144.publicationIntent = "publish";
model144.publicationBlockers = [];
model144.sources.push(image144);
model144.media = image("phase103-montblanc-144-media", "Montblanc No. 144 代际边界事实图（非产品照片）", image144);
const model22 = required(PHASE103_22_ID);
const image22 = diagram("phase103-montblanc-no-22-svg", "Montblanc No. 22 身份边界事实图", "/images/library/site-original/montblanc-vintage/montblanc-no-22-1960s.svg");
model22.key = "phase103-montblanc-no-22-v1";
model22.expectedSlug = PHASE103_22_SLUG;
model22.canonicalName = "Montblanc No. 22（1960–1970，中文市场常称“学生龙 22”）";
model22.publicationIntent = "publish";
model22.publicationBlockers = [];
model22.sources.push(image22);
model22.media = image("phase103-montblanc-no-22-media", "Montblanc No. 22 身份边界事实图（非产品照片）", image22);

export const phase103MontblancVintagePacks: CuratedEntityPack[] = [brand, model144, model22];
