const INTERNAL_COPY_PATTERNS = [
  /待核验/,
  /需核验/,
  /补证/,
  /研究队列/,
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
