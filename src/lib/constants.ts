/**
 * Shared constants for entity types and attributes.
 * Single source of truth — import from @/lib/constants.
 */
import {
  Article,
  Buildings,
  Circle,
  Drop,
  Lightbulb,
  PenNib,
} from "@phosphor-icons/react/dist/ssr";

export const TYPE_LABELS: Record<string, string> = {
  pen: "钢笔",
  brand: "品牌",
  concept: "概念",
  material: "材质",
  nib: "笔尖",
  fill_system: "上墨方式",
  article: "文章",
};

export const TYPE_ICONS: Record<
  string,
  React.ComponentType<Record<string, unknown>>
> = {
  pen: PenNib,
  brand: Buildings,
  concept: Lightbulb,
  material: Circle,
  nib: PenNib,
  fill_system: Drop,
  article: Article,
};

/** Graph node hex colors (used by LocalGraph canvas rendering) */
export const TYPE_COLORS: Record<string, string> = {
  pen: "#8b7355",
  brand: "#6b8f71",
  concept: "#9b7eb8",
  material: "#a0845e",
  nib: "#8b7355",
  fill_system: "#5a8f9b",
  article: "#7a756d",
};

export const ATTR_LABELS: Record<string, string> = {
  nib_size: "笔尖粗细",
  fill_system: "上墨方式",
  body_material: "笔身材质",
  origin_country: "产地",
  price_range: "价位",
  writing_style: "书写风格",
  nib_material: "笔尖材质",
  founded: "创立年份",
  description: "描述",
};
