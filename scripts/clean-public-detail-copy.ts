import { createClient, type Client, type InArgs } from "@libsql/client";
import { existsSync, readFileSync } from "node:fs";

const WRITE = process.argv.includes("--write");
const USE_TURSO = process.argv.includes("--turso");
const REFRESH_SUMMARIES = process.argv.includes("--refresh-summaries");

type StoryRow = {
  entity_id: string;
  story_id: string;
  slug: string;
  name: string;
  entity_summary: string | null;
  title: string;
  story_summary: string | null;
  body_md: string;
};

type SpecRow = {
  id: string;
  origin_country: string | null;
  price_range: string | null;
};

const TITLE_REWRITES: Record<string, string> = {
  "diplomat迪波曼-aero太空梭": "Diplomat Aero：金属机身里的德国日用笔",
  "kaweco-sport": "Kaweco Sport：口袋尺寸的经典小钢笔",
  "sheaffer-s-snorkel": "Sheaffer Snorkel：伸缩吸墨管带来的机械感",
  "the-chilton-wing-flow": "The Chilton Wing-flow：金属线条里的硬朗装饰",
  "the-ingersoll-dollar-pen": "The Ingersoll Dollar Pen：一美元定价里的大众市场野心",
  "the-j-g-rider-fountain-pen": "The J. G. Rider Fountain Pen：可拆 feed 的早期方案",
  "the-parker-51": "Parker 51：随手可用的现代钢笔",
  "the-parker-61": "Parker 61：不用吸墨动作的派克实验",
  "the-parker-vacumatic": "Parker Vacumatic：透明储墨与结构展示",
  "tramol-梵高系列": "Tramol 梵高系列：装饰感很强的日用礼盒笔",
  "wancher万佳-dream-pen": "Wancher Dream Pen：材料和装饰工艺并行的产品线",
  "waterman-s-ink-vue": "Waterman Ink-Vue：可视墨量成为卖点",
  "万宝龙-montblanc-大文豪系列-writers-edition": "Montblanc Writers Edition：文学人物主题收藏系列",
  "三文堂-twsbi-diamond-mini-al": "TWSBI Diamond Mini AL：小尺寸透明活塞笔",
  "三文堂-twsbi-go": "TWSBI GO：弹簧活塞带来的快速上墨",
  "中屋-nakaya-housoge高级定制": "Nakaya Housoge：宝相华纹样与沉金工艺",
  "写乐-sailor-classic-ko": "Sailor Classic Ko：首饰感很强的现代莳绘",
  "写乐-sailor-king-of-pen笔王": "Sailor King of Pen：写乐旗舰尺寸的答案",
  "凌美-lamy-dialog-3-焦点3": "LAMY Dialog 3：隐藏笔尖的旋转伸缩设计",
  "凌美-lamy-studio-演艺": "LAMY Studio：更圆润正式的 LAMY",
  "坛笔-penbbs-469": "PenBBS 469：双笔尖带来的双墨水玩法",
  "弘典-hongdian-秦": "弘典秦：秦代纹样里的日用钢尖",
  "派克-parker-51-经典-vintage": "Parker 51：随手可用的现代钢笔",
  "派克-parker-世纪-duofold": "Parker Duofold：派克经典名号的现代大笔",
  "派克-parker-乔特-jotter": "Parker Jotter 钢笔：熟悉的 Jotter 入门钢笔",
  "白金-platinum-出云-izumo": "Platinum Izumo：安静的漆面与金尖",
  "白金-platinum-富士旬景pnb-13000": "Platinum Fuji Shunkei Kinshu：富士山与秋色的装饰切面",
  "百乐-pilot-845-urushi": "Pilot Custom 845 Urushi：漆面质感里的百乐稳定性",
  "百乐-pilot-custom-742": "Pilot Custom 742：围绕笔尖选择展开的 Custom",
  "百乐-pilot-iroshizuku色彩雫": "Pilot Iroshizuku 色彩雫：百乐的自然色系瓶装墨",
  "百利金-pelikan-m1005-stresemann": "Pelikan M1005 Stresemann：灰条纹里的 M1000 大尺寸",
  "辉柏嘉-faber-castell-ambition雄心": "Faber-Castell Ambition：材质感很强的细杆办公笔",
  "逗万-流光系列": "逗万流光系列：国产设计款里的外观实验",
};

const SUMMARY_POLLUTION =
  /可按|页面理解|重点在|待核验|当前页面|当前档案|研究队列|公开索引|页面确认|页面登记|页面写到|商品标题|资料能确认|适合按|阅读重点|先按/;

const SOURCE_SENTENCE =
  /^(Goldspot|Amazon|TTpen|MoonmanPen|Cult Pens|Goulet|JD|Makoba|Pen Boutique|Truphae|Daraz|JUSPIRIT|TSAMSA|Andy's Pens|Fountain Pen India)\s*(页面|商品标题|的商品标题|写到|指向|确认)/i;

const VAGUE_PRICE =
  /待|说法|价位$|高端|中端|入门|二级市场|渠道价|历史价|收藏价格|按地区|墨水价格|老库存|供货|地区|版本/;

function loadLocalEnv() {
  if (!USE_TURSO || !existsSync(".env.local")) return;
  const text = readFileSync(".env.local", "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }
}

function getClient() {
  loadLocalEnv();
  if (USE_TURSO) {
    if (!process.env.TURSO_DATABASE_URL) {
      throw new Error("--turso requires TURSO_DATABASE_URL");
    }
    return createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return createClient({ url: "file:data/fpkg.db" });
}

async function all<T extends Record<string, unknown>>(
  db: Client,
  sql: string,
  args: unknown[] = [],
) {
  const result = await db.execute({ sql, args: args as InArgs });
  return result.rows.map((row) => row as T);
}

async function run(db: Client, sql: string, args: unknown[] = []) {
  if (!WRITE) return;
  await db.execute({ sql, args: args as InArgs });
}

function stripMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[[^\]]+]\([^)]+\)/g, (match) => {
      const label = match.match(/^\[([^\]]+)]/);
      return label?.[1] || " ";
    })
    .replace(/^#+\s*/gm, "")
    .replace(/[*_`>#|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSentences(text: string) {
  return (text.match(/[^。！？!?]+[。！？!?]?/g) || [])
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function readerSummaryFromBody(bodyMd: string) {
  const sentences = splitSentences(stripMarkdown(bodyMd)).filter(
    (sentence) =>
      !SOURCE_SENTENCE.test(sentence) && !SUMMARY_POLLUTION.test(sentence),
  );
  const picked: string[] = [];
  for (const sentence of sentences) {
    picked.push(sentence);
    const length = picked.join("").length;
    if (length >= 42 || picked.length >= 2) break;
  }

  let summary = picked.join("");
  if (!summary) {
    summary = splitSentences(stripMarkdown(bodyMd)).slice(0, 2).join("");
  }
  if (summary.length > 130) {
    summary = `${summary.slice(0, 127).replace(/[，；、：\s]+$/g, "")}。`;
  }
  return summary || null;
}

function cleanOrigin(value: string | null) {
  if (!value) return null;
  const text = value
    .replace(/（[^）]*(待核验|需核验)[^）]*）/g, "")
    .replace(/\([^)]*(待核验|需核验)[^)]*\)/g, "")
    .replace(/[（(]\s*[）)]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text || null;
}

function cleanPrice(value: string | null) {
  if (!value) return null;
  const raw = value.trim();
  if (raw.includes("查询于")) return raw.replace(/￥/g, "¥");
  if (!raw || VAGUE_PRICE.test(raw)) return null;
  if (!/[0-9¥￥$€£₹]/.test(raw)) return null;
  if (/^约\s*[¥￥$€]\s*\d/.test(raw)) {
    return raw.replace(/^约\s*￥/, "约 ¥");
  }

  const normalized = raw
    .replace(/^约\s*/, "")
    .replace(/\s*元\s*/g, "")
    .replace(/\s*人民币\s*/g, "")
    .trim();

  if (/^\d+(?:\.\d+)?(?:\s*[-–]\s*\d+(?:\.\d+)?)?$/.test(normalized)) {
    return `约 ¥${normalized.replace(/\s+/g, "")}`;
  }
  if (/^\d+(?:\.\d+)?\s*(?:以内|以下)$/.test(normalized)) {
    return `约 ¥${normalized.replace(/\s+/g, "")}`;
  }
  if (/^\d+(?:\.\d+)?\+$/.test(normalized)) {
    return `约 ¥${normalized}`;
  }
  if (/^[¥￥]\s*\d/.test(normalized)) {
    return normalized.replace(/^￥/, "¥");
  }
  return normalized;
}

function cleanBodyCopy(value: string) {
  return value
    .replace(
      /(Goldspot|TTpen|MoonmanPen|Cult Pens|Goulet|JD|Makoba|Pen Boutique|Truphae|Daraz|JUSPIRIT|TSAMSA|Andy's Pens|Fountain Pen India|Amazon(?: US| India| Germany)?|AwesomePens|Montgomery Pens|Peyton Street Pens)\s*(?:的)?页面写到\s*([^，。]+)，这几个词/g,
      "公开资料里出现的 $2，这几个词",
    )
    .replace(
      /(Goldspot|TTpen|MoonmanPen|Cult Pens|Goulet|JD|Makoba|Pen Boutique|Truphae|Daraz|JUSPIRIT|TSAMSA|Andy's Pens|Fountain Pen India|Amazon(?: US| India| Germany)?|AwesomePens|Montgomery Pens|Peyton Street Pens)\s*(?:的)?页面写到\s*([^，。]+)，这些信息/g,
      "公开资料提到 $2，这些信息",
    )
    .replace(
      /(Goldspot|TTpen|MoonmanPen|Cult Pens|Goulet|JD|Makoba|Pen Boutique|Truphae|Daraz|JUSPIRIT|TSAMSA|Andy's Pens|Fountain Pen India|Amazon(?: US| India| Germany)?|AwesomePens|Montgomery Pens|Peyton Street Pens)\s*(?:的)?页面写到\s*([^，。]+)，说明/g,
      "公开资料提到 $2，说明",
    )
    .replace(
      /([A-Za-z][A-Za-z\s'.-]*(?:US|India|Germany)?|Amazon(?: US| India| Germany)?)\s*的商品标题写着\s*([^，。]+)，/g,
      "公开零售资料把它标成 $2，",
    )
    .replace(
      /(Amazon(?: US| India| Germany)?)\s*商品标题写着\s*([^，。]+)，/g,
      "公开零售资料把它标成 $2，",
    )
    .replace(/资料能确认/g, "公开资料可以确认")
    .replace(/页面确认/g, "公开资料确认")
    .replace(/商品页也能帮助读者确认/g, "零售资料可以帮助确认")
    .replace(/重点在/g, "核心是");
}

async function main() {
  const db = getClient();
  const storyRows = await all<StoryRow>(
    db,
    `SELECT
       e.id as entity_id,
       s.id as story_id,
       e.slug,
       e.name,
       e.summary as entity_summary,
       s.title,
       s.summary as story_summary,
       s.body_md
     FROM entities e
     JOIN stories s ON s.entity_id = e.id AND s.story_type = 'model_story'
     WHERE e.type = 'pen'
     ORDER BY e.slug`,
  );

  let titleUpdates = 0;
  let summaryUpdates = 0;
  let bodyUpdates = 0;
  for (const row of storyRows) {
    const nextTitle = TITLE_REWRITES[row.slug];
    if (nextTitle && nextTitle !== row.title) {
      titleUpdates += 1;
      await run(db, "UPDATE stories SET title = ?, updated_at = datetime('now') WHERE id = ?", [
        nextTitle,
        row.story_id,
      ]);
    }

    const nextSummary = readerSummaryFromBody(row.body_md);
    const shouldRefreshSummary =
      REFRESH_SUMMARIES ||
      SUMMARY_POLLUTION.test(row.story_summary || "") ||
      SUMMARY_POLLUTION.test(row.entity_summary || "");
    if (nextSummary && shouldRefreshSummary) {
      const storyChanged = nextSummary !== row.story_summary;
      const entityChanged = nextSummary !== row.entity_summary;
      if (storyChanged || entityChanged) {
        summaryUpdates += 1;
        if (storyChanged) {
          await run(db, "UPDATE stories SET summary = ?, updated_at = datetime('now') WHERE id = ?", [
            nextSummary,
            row.story_id,
          ]);
        }
        if (entityChanged) {
          await run(db, "UPDATE entities SET summary = ?, updated_at = datetime('now') WHERE id = ?", [
            nextSummary,
            row.entity_id,
          ]);
        }
      }
    }

    const nextBody = cleanBodyCopy(row.body_md);
    if (nextBody !== row.body_md) {
      bodyUpdates += 1;
      await run(db, "UPDATE stories SET body_md = ?, updated_at = datetime('now') WHERE id = ?", [
        nextBody,
        row.story_id,
      ]);
    }
  }

  const specRows = await all<SpecRow>(
    db,
    "SELECT id, origin_country, price_range FROM model_specs",
  );

  let originUpdates = 0;
  let priceUpdates = 0;
  for (const row of specRows) {
    const nextOrigin = cleanOrigin(row.origin_country);
    const nextPrice = cleanPrice(row.price_range);
    if (nextOrigin !== row.origin_country) {
      originUpdates += 1;
      await run(db, "UPDATE model_specs SET origin_country = ?, updated_at = datetime('now') WHERE id = ?", [
        nextOrigin,
        row.id,
      ]);
    }
    if (nextPrice !== row.price_range) {
      priceUpdates += 1;
      await run(db, "UPDATE model_specs SET price_range = ?, updated_at = datetime('now') WHERE id = ?", [
        nextPrice,
        row.id,
      ]);
    }
  }

  console.log(
    JSON.stringify(
      {
        mode: WRITE ? "write" : "dry-run",
        database: USE_TURSO ? "turso" : "local",
        titleUpdates,
        summaryUpdates,
        bodyUpdates,
        originUpdates,
        priceUpdates,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
