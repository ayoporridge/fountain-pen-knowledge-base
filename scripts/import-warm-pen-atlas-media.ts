import fs from "node:fs";
import path from "node:path";
import { createClient, type Client, type InArgs } from "@libsql/client";

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");
const WRITE = process.argv.includes("--write");

type AtlasAsset = {
  id: string;
  title: string;
  imageUrl: string;
  localPath: string;
  summary: string;
  entity?: {
    type: string;
    slug: string;
  };
};

const SOURCE_ID = "warm-pen-atlas-generated";

const ASSETS: AtlasAsset[] = [
  {
    id: "warm-pen-atlas-library-hero",
    title: "Warm Pen Atlas: 图书馆入口封面",
    imageUrl: "/images/library/warm-pen-atlas/library-hero.jpg",
    localPath: "public/images/library/warm-pen-atlas/library-hero.jpg",
    summary:
      "Site-original Warm Pen Atlas hero artwork for the fountain pen library entrance.",
  },
  {
    id: "warm-pen-atlas-brand-museum-cover",
    title: "Warm Pen Atlas: 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/brand-museum-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/brand-museum-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for brand-history and maker-relationship entry points.",
  },
  {
    id: "warm-pen-atlas-hero-paddy-placeholder-cover",
    title: "Warm Pen Atlas: 英雄派迪占位品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/brand-museum-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/brand-museum-cover.jpg",
    summary:
      "Shared site-original Warm Pen Atlas brand museum artwork reused as a placeholder for the under-documented Hero Paddy entry.",
    entity: { type: "brand", slug: "hero-paddy" },
  },
  {
    id: "warm-pen-atlas-douwan-placeholder-cover",
    title: "Warm Pen Atlas: 逗万占位品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/brand-museum-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/brand-museum-cover.jpg",
    summary:
      "Shared site-original Warm Pen Atlas brand museum artwork reused as a placeholder for the DouWan entry.",
    entity: { type: "brand", slug: "douwan" },
  },
  {
    id: "warm-pen-atlas-jinxing-placeholder-cover",
    title: "Warm Pen Atlas: 金星占位品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/brand-museum-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/brand-museum-cover.jpg",
    summary:
      "Shared site-original Warm Pen Atlas brand museum artwork reused as a placeholder for the under-documented JinXing entry.",
    entity: { type: "brand", slug: "jinxing" },
  },
  {
    id: "warm-pen-atlas-lily-placeholder-cover",
    title: "Warm Pen Atlas: 铃兰占位品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/brand-museum-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/brand-museum-cover.jpg",
    summary:
      "Shared site-original Warm Pen Atlas brand museum artwork reused as a placeholder for the under-documented Lily entry.",
    entity: { type: "brand", slug: "lily" },
  },
  {
    id: "warm-pen-atlas-zhangjiang-placeholder-cover",
    title: "Warm Pen Atlas: 长江占位品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/brand-museum-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/brand-museum-cover.jpg",
    summary:
      "Shared site-original Warm Pen Atlas brand museum artwork reused as a placeholder for the under-documented ZhangJiang entry.",
    entity: { type: "brand", slug: "zhangjiang" },
  },
  {
    id: "warm-pen-atlas-mechanism-lab-cover",
    title: "Warm Pen Atlas: 机制实验室封面",
    imageUrl: "/images/library/warm-pen-atlas/mechanism-lab-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/mechanism-lab-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for fountain-pen filling-mechanism education.",
    entity: { type: "concept", slug: "vacuum-filler" },
  },
  {
    id: "warm-pen-atlas-vacuum-filler-model-cover",
    title: "Warm Pen Atlas: 真空上墨型号封面",
    imageUrl: "/images/library/warm-pen-atlas/vacuum-filler-model-cover.jpg",
    localPath:
      "public/images/library/warm-pen-atlas/vacuum-filler-model-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for a generic vacuum-filling model archive cover.",
    entity: { type: "pen", slug: "pilot-custom-823" },
  },
  {
    id: "warm-pen-atlas-school-design-model-cover",
    title: "Warm Pen Atlas: 现代校用设计型号封面",
    imageUrl: "/images/library/warm-pen-atlas/school-design-model-cover.jpg",
    localPath:
      "public/images/library/warm-pen-atlas/school-design-model-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for a modern school-design fountain pen archive cover.",
    entity: { type: "pen", slug: "凌美-lamy-safari-狩猎者" },
  },
  {
    id: "warm-pen-atlas-piston-demonstrator-model-cover",
    title: "Warm Pen Atlas: 透明活塞示范笔封面",
    imageUrl:
      "/images/library/warm-pen-atlas/piston-demonstrator-model-cover.jpg",
    localPath:
      "public/images/library/warm-pen-atlas/piston-demonstrator-model-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for a transparent piston demonstrator model archive cover.",
    entity: { type: "pen", slug: "三文堂-twsbi-eco" },
  },
  {
    id: "warm-pen-atlas-pocket-pens-exhibit-cover",
    title: "Warm Pen Atlas: 口袋笔专题封面",
    imageUrl: "/images/library/warm-pen-atlas/pocket-pens-exhibit-cover.jpg",
    localPath:
      "public/images/library/warm-pen-atlas/pocket-pens-exhibit-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for compact pocket fountain pen exhibits.",
    entity: { type: "pen", slug: "kaweco-liliput" },
  },
  {
    id: "warm-pen-atlas-opus88-brand-cover",
    title: "Warm Pen Atlas: Opus 88 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/opus88-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/opus88-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Opus 88 brand museum entry and modern eyedropper fountain pen context.",
    entity: { type: "brand", slug: "opus88" },
  },
  {
    id: "warm-pen-atlas-eversharp-brand-cover",
    title: "Warm Pen Atlas: Eversharp 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/eversharp-brand-cover.jpg",
    localPath:
      "public/images/library/warm-pen-atlas/eversharp-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Eversharp brand museum entry and 1940s American industrial-design context.",
    entity: { type: "brand", slug: "eversharp" },
  },
  {
    id: "warm-pen-atlas-moore-brand-cover",
    title: "Warm Pen Atlas: Moore 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/moore-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/moore-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Moore brand museum entry and early American safety-pen context.",
    entity: { type: "brand", slug: "moore" },
  },
  {
    id: "warm-pen-atlas-noodlers-ink-brand-cover",
    title: "Warm Pen Atlas: Noodler's Ink 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/noodlers-ink-brand-cover.jpg",
    localPath:
      "public/images/library/warm-pen-atlas/noodlers-ink-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Noodler's Ink brand museum entry and fountain-pen ink culture context.",
    entity: { type: "brand", slug: "noodlers" },
  },
  {
    id: "warm-pen-atlas-twsbi-diamond-mini-archive-cover",
    title: "Warm Pen Atlas: Diamond Mini 型号档案封面",
    imageUrl:
      "/images/library/warm-pen-atlas/twsbi-diamond-mini-archive-cover.jpg",
    localPath:
      "public/images/library/warm-pen-atlas/twsbi-diamond-mini-archive-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for a compact transparent piston demonstrator model archive cover.",
    entity: { type: "pen", slug: "三文堂-twsbi-diamond-mini-al" },
  },
  {
    id: "warm-pen-atlas-twsbi-go-spring-piston-cover",
    title: "Warm Pen Atlas: TWSBI GO 弹簧活塞封面",
    imageUrl:
      "/images/library/warm-pen-atlas/twsbi-go-spring-piston-cover.jpg",
    localPath:
      "public/images/library/warm-pen-atlas/twsbi-go-spring-piston-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for a spring-piston fountain pen model archive cover.",
    entity: { type: "pen", slug: "三文堂-twsbi-go" },
  },
  {
    id: "warm-pen-atlas-namiki-makie-archive-cover",
    title: "Warm Pen Atlas: Namiki Maki-e 型号档案封面",
    imageUrl: "/images/library/warm-pen-atlas/namiki-makie-archive-cover.jpg",
    localPath:
      "public/images/library/warm-pen-atlas/namiki-makie-archive-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for a large luxury Japanese lacquer fountain pen model archive cover.",
    entity: { type: "pen", slug: "并木-namiki-emperor" },
  },
  {
    id: "warm-pen-atlas-literary-editions-archive-cover",
    title: "Warm Pen Atlas: 文学限量系列封面",
    imageUrl:
      "/images/library/warm-pen-atlas/literary-editions-archive-cover.jpg",
    localPath:
      "public/images/library/warm-pen-atlas/literary-editions-archive-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for a literary limited-edition fountain pen collection archive cover.",
    entity: { type: "pen", slug: "万宝龙-montblanc-大文豪系列-writers-edition" },
  },
  {
    id: "warm-pen-atlas-wahl-brand-cover",
    title: "Warm Pen Atlas: Wahl 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/wahl-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/wahl-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Wahl brand museum entry and early American mechanical writing-instrument context.",
    entity: { type: "brand", slug: "wahl" },
  },
  {
    id: "warm-pen-atlas-chilton-brand-cover",
    title: "Warm Pen Atlas: Chilton 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/chilton-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/chilton-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Chilton brand museum entry and pneumatic-filler research context.",
    entity: { type: "brand", slug: "chilton" },
  },
  {
    id: "warm-pen-atlas-dunn-brand-cover",
    title: "Warm Pen Atlas: Dunn 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/dunn-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/dunn-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Dunn brand museum entry and pump-filling archive context.",
    entity: { type: "brand", slug: "dunn" },
  },
  {
    id: "warm-pen-atlas-wearever-brand-cover",
    title: "Warm Pen Atlas: Wearever 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/wearever-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/wearever-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Wearever brand museum entry and mass-market American fountain pen context.",
    entity: { type: "brand", slug: "wearever" },
  },
  {
    id: "warm-pen-atlas-graphomatic-brand-cover",
    title: "Warm Pen Atlas: Graphomatic 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/graphomatic-brand-cover.jpg",
    localPath:
      "public/images/library/warm-pen-atlas/graphomatic-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Graphomatic brand museum entry and technical writing-instrument context.",
    entity: { type: "brand", slug: "graphomatic" },
  },
  {
    id: "warm-pen-atlas-ingersoll-brand-cover",
    title: "Warm Pen Atlas: Ingersoll 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/ingersoll-brand-cover.jpg",
    localPath:
      "public/images/library/warm-pen-atlas/ingersoll-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Ingersoll brand museum entry and value-priced early fountain pen context.",
    entity: { type: "brand", slug: "ingersoll" },
  },
  {
    id: "warm-pen-atlas-morrison-brand-cover",
    title: "Warm Pen Atlas: Morrison 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/morrison-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/morrison-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Morrison brand museum entry and colorful wartime American fountain pen context.",
    entity: { type: "brand", slug: "morrison" },
  },
  {
    id: "warm-pen-atlas-wasp-brand-cover",
    title: "Warm Pen Atlas: WASP 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/wasp-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/wasp-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the WASP brand museum entry and 1930s sub-brand fountain pen context.",
    entity: { type: "brand", slug: "wasp" },
  },
  {
    id: "warm-pen-atlas-monteverde-brand-cover",
    title: "Warm Pen Atlas: Monteverde 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/monteverde-brand-cover.jpg",
    localPath:
      "public/images/library/warm-pen-atlas/monteverde-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Monteverde brand museum entry and modern accessible fountain pen context.",
    entity: { type: "brand", slug: "monteverde" },
  },
  {
    id: "warm-pen-atlas-skb-brand-cover",
    title: "Warm Pen Atlas: SKB 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/skb-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/skb-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the SKB brand museum entry and Taiwanese school and office writing culture.",
    entity: { type: "brand", slug: "skb" },
  },
  {
    id: "warm-pen-atlas-penbbs-brand-cover",
    title: "Warm Pen Atlas: PenBBS 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/penbbs-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/penbbs-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the PenBBS brand museum entry and fountain-pen community ink culture.",
    entity: { type: "brand", slug: "penbbs" },
  },
  {
    id: "warm-pen-atlas-duke-brand-cover",
    title: "Warm Pen Atlas: Duke 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/duke-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/duke-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Duke brand museum entry and Chinese export fountain pen context.",
    entity: { type: "brand", slug: "duke" },
  },
  {
    id: "warm-pen-atlas-kaco-brand-cover",
    title: "Warm Pen Atlas: KACO 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/kaco-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/kaco-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the KACO brand museum entry and contemporary Chinese stationery design context.",
    entity: { type: "brand", slug: "kaco" },
  },
  {
    id: "warm-pen-atlas-snowhite-brand-cover",
    title: "Warm Pen Atlas: Snowhite 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/snowhite-brand-cover.jpg",
    localPath:
      "public/images/library/warm-pen-atlas/snowhite-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Snowhite brand museum entry and everyday school and office writing context.",
    entity: { type: "brand", slug: "snowhite" },
  },
  {
    id: "warm-pen-atlas-delike-brand-cover",
    title: "Warm Pen Atlas: Delike 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/delike-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/delike-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Delike brand museum entry and compact pocket fountain pen context.",
    entity: { type: "brand", slug: "delike" },
  },
  {
    id: "warm-pen-atlas-hero-brand-cover",
    title: "Warm Pen Atlas: Hero 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/hero-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/hero-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Hero brand museum entry and Chinese legacy fountain pen archive context.",
    entity: { type: "brand", slug: "hero" },
  },
  {
    id: "warm-pen-atlas-hongdian-brand-cover",
    title: "Warm Pen Atlas: HongDian 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/hongdian-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/hongdian-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the HongDian brand museum entry and modern metal everyday fountain pen context.",
    entity: { type: "brand", slug: "hongdian" },
  },
  {
    id: "warm-pen-atlas-picasso-brand-cover",
    title: "Warm Pen Atlas: Picasso 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/picasso-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/picasso-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Picasso brand museum entry and art-studio gift fountain pen context.",
    entity: { type: "brand", slug: "picasso" },
  },
  {
    id: "warm-pen-atlas-jinhao-brand-cover",
    title: "Warm Pen Atlas: Jinhao 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/jinhao-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/jinhao-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Jinhao brand museum entry and accessible entry-level fountain pen context.",
    entity: { type: "brand", slug: "jinhao" },
  },
  {
    id: "warm-pen-atlas-majohn-brand-cover",
    title: "Warm Pen Atlas: Majohn 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/majohn-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/majohn-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Majohn brand museum entry and modern Chinese mechanism-experiment context.",
    entity: { type: "brand", slug: "majohn" },
  },
  {
    id: "warm-pen-atlas-wingsung-brand-cover",
    title: "Warm Pen Atlas: Wing Sung 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/wingsung-brand-cover.jpg",
    localPath:
      "public/images/library/warm-pen-atlas/wingsung-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Wing Sung brand museum entry and Chinese fountain pen revival archive context.",
    entity: { type: "brand", slug: "wingsung" },
  },
  {
    id: "warm-pen-atlas-conklin-brand-cover",
    title: "Warm Pen Atlas: Conklin 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/conklin-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/conklin-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Conklin brand museum entry and early American patent-era fountain pen context.",
    entity: { type: "brand", slug: "conklin" },
  },
  {
    id: "warm-pen-atlas-diplomat-brand-cover",
    title: "Warm Pen Atlas: Diplomat 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/diplomat-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/diplomat-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Diplomat brand museum entry and German engineering writing-instrument context.",
    entity: { type: "brand", slug: "diplomat" },
  },
  {
    id: "warm-pen-atlas-esterbrook-brand-cover",
    title: "Warm Pen Atlas: Esterbrook 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/esterbrook-brand-cover.jpg",
    localPath:
      "public/images/library/warm-pen-atlas/esterbrook-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Esterbrook brand museum entry and American revival fountain pen context.",
    entity: { type: "brand", slug: "esterbrook" },
  },
  {
    id: "warm-pen-atlas-kaweco-brand-cover",
    title: "Warm Pen Atlas: Kaweco 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/kaweco-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/kaweco-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Kaweco brand museum entry and compact pocket fountain pen context.",
    entity: { type: "brand", slug: "kaweco" },
  },
  {
    id: "warm-pen-atlas-leonardo-brand-cover",
    title: "Warm Pen Atlas: Leonardo 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/leonardo-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/leonardo-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Leonardo brand museum entry and Italian artisan fountain pen workshop context.",
    entity: { type: "brand", slug: "leonardo" },
  },
  {
    id: "warm-pen-atlas-wancher-brand-cover",
    title: "Warm Pen Atlas: Wancher 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/wancher-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/wancher-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Wancher brand museum entry and Japanese material-research fountain pen context.",
    entity: { type: "brand", slug: "wancher" },
  },
  {
    id: "warm-pen-atlas-twsbi-brand-cover",
    title: "Warm Pen Atlas: TWSBI 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/twsbi-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/twsbi-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the TWSBI brand museum entry and transparent filling-system fountain pen context.",
    entity: { type: "brand", slug: "twsbi" },
  },
  {
    id: "warm-pen-atlas-nakaya-brand-cover",
    title: "Warm Pen Atlas: Nakaya 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/nakaya-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/nakaya-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Nakaya brand museum entry and Japanese handmade lacquer fountain pen context.",
    entity: { type: "brand", slug: "nakaya" },
  },
  {
    id: "warm-pen-atlas-sailor-brand-cover",
    title: "Warm Pen Atlas: Sailor 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/sailor-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/sailor-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Sailor brand museum entry and Japanese nib-craft fountain pen context.",
    entity: { type: "brand", slug: "sailor" },
  },
  {
    id: "warm-pen-atlas-lamy-brand-cover",
    title: "Warm Pen Atlas: LAMY 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/lamy-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/lamy-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the LAMY brand museum entry and modern industrial-design fountain pen context.",
    entity: { type: "brand", slug: "lamy" },
  },
  {
    id: "warm-pen-atlas-aurora-brand-cover",
    title: "Warm Pen Atlas: Aurora 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/aurora-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/aurora-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Aurora brand museum entry and Italian classic fountain pen archive context.",
    entity: { type: "brand", slug: "aurora" },
  },
  {
    id: "warm-pen-atlas-namiki-brand-cover",
    title: "Warm Pen Atlas: Namiki 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/namiki-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/namiki-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Namiki brand museum entry and luxury maki-e fountain pen archive context.",
    entity: { type: "brand", slug: "namiki" },
  },
  {
    id: "warm-pen-atlas-schneider-brand-cover",
    title: "Warm Pen Atlas: Schneider 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/schneider-brand-cover.jpg",
    localPath:
      "public/images/library/warm-pen-atlas/schneider-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Schneider brand museum entry and practical German school and office writing tools.",
    entity: { type: "brand", slug: "schneider" },
  },
  {
    id: "warm-pen-atlas-platinum-brand-cover",
    title: "Warm Pen Atlas: Platinum 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/platinum-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/platinum-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Platinum brand museum entry and Japanese nib and slip-seal archive context.",
    entity: { type: "brand", slug: "platinum" },
  },
  {
    id: "warm-pen-atlas-pilot-brand-cover",
    title: "Warm Pen Atlas: Pilot 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/pilot-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/pilot-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Pilot brand museum entry and Japanese writing-technology product-family archive context.",
    entity: { type: "brand", slug: "pilot" },
  },
  {
    id: "warm-pen-atlas-visconti-brand-cover",
    title: "Warm Pen Atlas: Visconti 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/visconti-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/visconti-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Visconti brand museum entry and Florentine material and filling-system archive context.",
    entity: { type: "brand", slug: "visconti" },
  },
  {
    id: "warm-pen-atlas-cross-brand-cover",
    title: "Warm Pen Atlas: Cross 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/cross-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/cross-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Cross brand museum entry and American fine-writing executive desk archive context.",
    entity: { type: "brand", slug: "cross" },
  },
  {
    id: "warm-pen-atlas-montblanc-brand-cover",
    title: "Warm Pen Atlas: Montblanc 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/montblanc-brand-cover.jpg",
    localPath:
      "public/images/library/warm-pen-atlas/montblanc-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Montblanc brand museum entry and cautious European luxury writing archive context.",
    entity: { type: "brand", slug: "montblanc" },
  },
  {
    id: "warm-pen-atlas-waterman-brand-cover",
    title: "Warm Pen Atlas: Waterman 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/waterman-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/waterman-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Waterman brand museum entry and Parisian early fountain-pen archive context.",
    entity: { type: "brand", slug: "waterman" },
  },
  {
    id: "warm-pen-atlas-mg-brand-cover",
    title: "Warm Pen Atlas: M&G 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/mg-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/mg-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the M&G brand museum entry and modern Chinese stationery studio context.",
    entity: { type: "brand", slug: "mg" },
  },
  {
    id: "warm-pen-atlas-parker-brand-cover",
    title: "Warm Pen Atlas: Parker 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/parker-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/parker-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Parker brand museum entry and transatlantic travel-and-engineering archive context.",
    entity: { type: "brand", slug: "parker" },
  },
  {
    id: "warm-pen-atlas-sheaffer-brand-cover",
    title: "Warm Pen Atlas: Sheaffer 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/sheaffer-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/sheaffer-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Sheaffer brand museum entry and American repair-bench and nib-engineering archive context.",
    entity: { type: "brand", slug: "sheaffer" },
  },
  {
    id: "warm-pen-atlas-pelikan-brand-cover",
    title: "Warm Pen Atlas: Pelikan 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/pelikan-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/pelikan-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Pelikan brand museum entry and German ink-and-piston archive context.",
    entity: { type: "brand", slug: "pelikan" },
  },
  {
    id: "warm-pen-atlas-faber-castell-brand-cover",
    title: "Warm Pen Atlas: Faber-Castell 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/faber-castell-brand-cover.jpg",
    localPath:
      "public/images/library/warm-pen-atlas/faber-castell-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas artwork for the Faber-Castell brand museum entry and German drawing-instrument and materials archive context.",
    entity: { type: "brand", slug: "faber-castell" },
  },
  {
    id: "warm-pen-atlas-admok-brand-cover",
    title: "Warm Pen Atlas: Admok 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/admok-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/admok-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas research-queue artwork for the under-documented Admok brand museum entry.",
    entity: { type: "brand", slug: "admok" },
  },
  {
    id: "warm-pen-atlas-tramol-brand-cover",
    title: "Warm Pen Atlas: Tramol 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/tramol-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/tramol-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas research-queue artwork for the under-documented Tramol brand museum entry.",
    entity: { type: "brand", slug: "tramol" },
  },
  {
    id: "warm-pen-atlas-shanghai-brand-cover",
    title: "Warm Pen Atlas: Shanghai 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/shanghai-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/shanghai-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas research-queue artwork for the under-documented Shanghai brand museum entry.",
    entity: { type: "brand", slug: "shanghai" },
  },
  {
    id: "warm-pen-atlas-dongwu-brand-cover",
    title: "Warm Pen Atlas: DongWu 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/dongwu-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/dongwu-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas research-queue artwork for the under-documented DongWu brand museum entry.",
    entity: { type: "brand", slug: "dongwu" },
  },
  {
    id: "warm-pen-atlas-shule-brand-cover",
    title: "Warm Pen Atlas: ShuLe 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/shule-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/shule-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas research-queue artwork for the under-documented ShuLe brand museum entry.",
    entity: { type: "brand", slug: "shule" },
  },
  {
    id: "warm-pen-atlas-yiren-brand-cover",
    title: "Warm Pen Atlas: YiRen 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/yiren-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/yiren-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas research-queue artwork for the under-documented YiRen brand museum entry.",
    entity: { type: "brand", slug: "yiren" },
  },
  {
    id: "warm-pen-atlas-banju-brand-cover",
    title: "Warm Pen Atlas: BanJu 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/banju-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/banju-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas research-queue artwork for the under-documented BanJu brand museum entry.",
    entity: { type: "brand", slug: "banju" },
  },
  {
    id: "warm-pen-atlas-tangyue-brand-cover",
    title: "Warm Pen Atlas: TangYue 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/tangyue-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/tangyue-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas research-queue artwork for the under-documented TangYue brand museum entry.",
    entity: { type: "brand", slug: "tangyue" },
  },
  {
    id: "warm-pen-atlas-saier-brand-cover",
    title: "Warm Pen Atlas: Saier 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/saier-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/saier-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas research-queue artwork for the under-documented Saier brand museum entry.",
    entity: { type: "brand", slug: "saier" },
  },
  {
    id: "warm-pen-atlas-dagong-brand-cover",
    title: "Warm Pen Atlas: Dagong 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/dagong-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/dagong-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas research-queue artwork for the under-documented Dagong brand museum entry.",
    entity: { type: "brand", slug: "dagong" },
  },
  {
    id: "warm-pen-atlas-yisihua-brand-cover",
    title: "Warm Pen Atlas: YiSiHua 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/yisihua-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/yisihua-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas research-queue artwork for the under-documented YiSiHua brand museum entry.",
    entity: { type: "brand", slug: "yisihua" },
  },
  {
    id: "warm-pen-atlas-campus-brand-cover",
    title: "Warm Pen Atlas: Campus 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/campus-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/campus-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas research-queue artwork for the under-documented Campus brand museum entry.",
    entity: { type: "brand", slug: "campus" },
  },
  {
    id: "warm-pen-atlas-yongxu-brand-cover",
    title: "Warm Pen Atlas: YongXu 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/yongxu-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/yongxu-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas research-queue artwork for the under-documented YongXu brand museum entry.",
    entity: { type: "brand", slug: "yongxu" },
  },
  {
    id: "warm-pen-atlas-paili-brand-cover",
    title: "Warm Pen Atlas: Paili 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/paili-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/paili-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas research-queue artwork for the under-documented Paili brand museum entry.",
    entity: { type: "brand", slug: "paili" },
  },
  {
    id: "warm-pen-atlas-lanbitou-brand-cover",
    title: "Warm Pen Atlas: Lanbitou 品牌馆封面",
    imageUrl: "/images/library/warm-pen-atlas/lanbitou-brand-cover.jpg",
    localPath: "public/images/library/warm-pen-atlas/lanbitou-brand-cover.jpg",
    summary:
      "Site-original Warm Pen Atlas research-queue artwork for the under-documented Lanbitou brand museum entry.",
    entity: { type: "brand", slug: "lanbitou" },
  },
];

type EntityRow = {
  id: string;
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

async function findEntity(db: Client, asset: AtlasAsset) {
  if (!asset.entity) return null;

  const result = await db.execute({
    sql: "SELECT id FROM entities WHERE type = ? AND slug = ? LIMIT 1",
    args: [asset.entity.type, asset.entity.slug],
  });
  return (result.rows[0] as EntityRow | undefined) || null;
}

async function writeSource(db: Client) {
  await execute(
    db,
    `INSERT INTO source_registry
      (id, name, source_type, allowed_use, reliability, license, attribution, homepage_url, fetch_method, notes, last_checked_at, updated_at)
     VALUES (?, 'Warm Pen Atlas generated artwork', 'user_submission', 'store_full', 'medium', 'site-original', 'Project editorial direction with OpenAI image generation', '/library/media', 'generated_then_curated', ?, date('now'), datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      allowed_use = excluded.allowed_use,
      reliability = excluded.reliability,
      license = excluded.license,
      attribution = excluded.attribution,
      homepage_url = excluded.homepage_url,
      fetch_method = excluded.fetch_method,
      notes = excluded.notes,
      last_checked_at = excluded.last_checked_at,
      updated_at = datetime('now')`,
    [
      SOURCE_ID,
      "Site-original bitmap illustrations in the Warm Pen Atlas style. No brand logos, no readable generated labels, and no exact product-copy intent.",
    ],
  );
}

async function writeAsset(db: Client, asset: AtlasAsset) {
  const entity = await findEntity(db, asset);
  const sourceItemId = `source-${asset.id}`;
  const sourceItemUrl = asset.id.includes("placeholder")
    ? `${asset.imageUrl}#${asset.id}`
    : asset.imageUrl;

  await execute(
    db,
    `INSERT INTO source_items
      (id, source_id, title, url, item_type, license, author, retrieved_at, summary, allowed_use, review_status, updated_at)
     VALUES (?, ?, ?, ?, 'site_original_image', 'site-original', 'Project editorial direction with OpenAI image generation', date('now'), ?, 'store_full', 'approved', datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      url = excluded.url,
      item_type = excluded.item_type,
      license = excluded.license,
      author = excluded.author,
      retrieved_at = excluded.retrieved_at,
      summary = excluded.summary,
      allowed_use = excluded.allowed_use,
      review_status = excluded.review_status,
      updated_at = datetime('now')`,
    [sourceItemId, SOURCE_ID, asset.title, sourceItemUrl, asset.summary],
  );

  await execute(
    db,
    `INSERT INTO media_assets
      (id, entity_id, title, asset_type, image_url, thumbnail_url, local_path, author, license, attribution_text, source_url, source_item_id, review_status, usage_status, updated_at)
     VALUES (?, ?, ?, 'image', ?, ?, ?, 'Project editorial direction with OpenAI image generation', 'site-original', ?, ?, ?, 'approved', 'gallery', datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
      entity_id = excluded.entity_id,
      title = excluded.title,
      asset_type = excluded.asset_type,
      image_url = excluded.image_url,
      thumbnail_url = excluded.thumbnail_url,
      local_path = excluded.local_path,
      author = excluded.author,
      license = excluded.license,
      attribution_text = excluded.attribution_text,
      source_url = excluded.source_url,
      source_item_id = excluded.source_item_id,
      review_status = excluded.review_status,
      usage_status = excluded.usage_status,
      updated_at = datetime('now')`,
    [
      `media-${asset.id}`,
      entity?.id || null,
      asset.title,
      asset.imageUrl,
      asset.imageUrl,
      asset.localPath,
      "site-original · Warm Pen Atlas · AI-assisted bitmap illustration reviewed for library use",
      asset.imageUrl,
      sourceItemId,
    ],
  );
}

async function main() {
  const db = getClient();
  await execute(db, "PRAGMA foreign_keys = ON");
  if (WRITE) await runMigrations(db);

  console.log(
    WRITE
      ? "Warm Pen Atlas media import: write mode"
      : "Warm Pen Atlas media import: dry run",
  );

  for (const asset of ASSETS) {
    const exists = fs.existsSync(path.join(process.cwd(), asset.localPath));
    const entity = await findEntity(db, asset);
    console.log(
      `${asset.title} -> ${asset.imageUrl} | file ${exists ? "ok" : "missing"} | ${
        asset.entity ? entity?.id || "entity missing" : "no entity"
      }`,
    );
  }

  if (!WRITE) {
    console.log("Dry run only. Re-run with --write to store media assets.");
    return;
  }

  await writeSource(db);
  for (const asset of ASSETS) {
    await writeAsset(db, asset);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
