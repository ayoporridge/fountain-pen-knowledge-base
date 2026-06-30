const INTERNAL_COPY_PATTERNS = [
  /待核验/,
  /需核验/,
  /待审核/,
  /未审核/,
  /已审核/,
  /资料核验中/,
  /补证/,
  /研究队列/,
  /名称与已知线索/,
  /名称边界和已知线索/,
  /方便读者确认/,
  /公开来源没有直接支撑/,
  /未由来源支撑/,
  /写成确定事实/,
  /可以先放在/,
  /currently needs/i,
  /verified facts/i,
  /research-queue/i,
  /brand[- ]?generic/i,
  /Story draft/i,
  /Editorial disambiguation/i,
  /后续补/,
  /后续扩写/,
  /当前草稿/,
  /当前档案/,
  /待补来源/,
  /待拆分/,
  /待重分类/,
  /待合并/,
  /待别名/,
  /重分类/,
  /说法待/,
  /供应需/,
  /版本需/,
  /地区供货待/,
  /可按[^。；\n]{0,80}页面理解/,
  /页面理解/,
];

const REMOVABLE_PHRASES = [
  /（?需按[^）]*核验）?/g,
  /（?具体[^）]*待核验）?/g,
  /（?[^）]*待核验[^）]*）?/g,
  /\/?版本供应需核验/g,
  /\/?颜色供应需核验/g,
  /\/?地区供应需核验/g,
  /\/?材质版本供应需核验/g,
  /\/?作品供应需核验/g,
  /\/?需另页核验/g,
  /\/?需按版本核验/g,
  /\/?需复核/g,
  /[（(]\s*[）)]/g,
];

const VAGUE_PRICE_PATTERNS = [
  /价位$/,
  /高端/,
  /中端/,
  /入门/,
  /二级市场/,
  /渠道价/,
  /说法/,
  /历史价/,
  /收藏价格/,
  /按地区/,
  /墨水价格/,
];

export function cleanPublicText(value: unknown) {
  if (value === null || value === undefined) return null;

  let text = String(value).trim();
  if (!text) return null;

  for (const phrase of REMOVABLE_PHRASES) {
    text = text.replace(phrase, "");
  }

  text = text
    .replace(/\s*\/\s*$/, "")
    .replace(/\s*，\s*$/, "")
    .replace(/\s*；\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return null;
  if (INTERNAL_COPY_PATTERNS.some((pattern) => pattern.test(text))) {
    return null;
  }

  return text;
}

export function hasPublicText(value: unknown) {
  return cleanPublicText(value) !== null;
}

export function displayPublicPrice(value: unknown, sourceName?: string | null) {
  const text = cleanPublicText(value);
  if (!text) return null;
  if (!/[0-9¥￥$€£₹]/.test(text)) return null;
  if (VAGUE_PRICE_PATTERNS.some((pattern) => pattern.test(text))) return null;
  if (text.includes("查询于")) return text.replace(/￥/g, "¥");

  let price = text
    .replace(/^约\s*/, "")
    .replace(/\s*元\s*/g, "")
    .replace(/\s*人民币\s*/g, "")
    .trim();

  if (/^\d+(?:\.\d+)?(?:\s*[-–]\s*\d+(?:\.\d+)?)?$/.test(price)) {
    price = `约 ¥${price.replace(/\s+/g, "")}`;
  } else if (/^\d+(?:\.\d+)?\s*(?:以内|以下)$/.test(price)) {
    price = `约 ¥${price.replace(/\s+/g, "")}`;
  } else if (/^\d+(?:\.\d+)?\+$/.test(price)) {
    price = `约 ¥${price}`;
  } else if (/^[¥￥]\s*\d/.test(price)) {
    price = price.replace(/^￥/, "¥");
  }

  const source = displayPublicSourceName(sourceName);
  return source && source !== "来源" ? `${price}｜来源：${source}` : price;
}

export function displayPublicSourceName(value: unknown) {
  const raw = String(value || "");
  if (/public web research index/i.test(raw)) return "公开资料检索";
  const text = cleanPublicText(raw);
  if (!text) return "来源";
  return text;
}

export function displayPublicSourceTitle(value: unknown) {
  const text = String(value || "")
    .replace(/^Research index:\s*/i, "公开资料检索：")
    .replace(/public-web research index/gi, "公开资料检索")
    .trim();

  return cleanPublicText(text) || "公开资料";
}
