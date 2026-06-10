/**
 * Centralized icon mapping for entity types.
 * Phosphor Icons — consistent strokeWidth, scalable, no emoji.
 */
import {
  PenNib,
  Buildings,
  Lightbulb,
  Drop,
  BookOpen,
  Circle,
  Article,
} from "@phosphor-icons/react/dist/ssr";

export const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  pen: PenNib,
  brand: Buildings,
  concept: Lightbulb,
  material: Circle,       // generic circle for material
  nib: PenNib,
  fill_system: Drop,
  article: Article,
};

export const TYPE_LABELS: Record<string, string> = {
  pen: "钢笔",
  brand: "品牌",
  concept: "概念",
  material: "材质",
  nib: "笔尖",
  fill_system: "上墨方式",
  article: "文章",
};

export const TYPE_COLORS: Record<string, string> = {
  pen: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  brand: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  concept: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  material: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  nib: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  fill_system: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  article: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
};
