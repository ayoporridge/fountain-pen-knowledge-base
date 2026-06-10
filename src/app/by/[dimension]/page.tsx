export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { queryAll } from "@/lib/db";
import type { Metadata } from "next";
import {
  ArrowLeft,
  MagnifyingGlass,
  Buildings,
  CurrencyCircleDollar,
  PenNib,
  Globe,
  Drop,
  BookOpen,
  Clock,
  Ruler,
  Cube,
} from "@phosphor-icons/react/dist/ssr";

const DIMENSION_ICONS: Record<string, React.ElementType> = {
  brand: Buildings,
  price: CurrencyCircleDollar,
  nib: PenNib,
  origin: Globe,
  fill: Drop,
  usage: BookOpen,
  era: Clock,
  size: Ruler,
  material: Cube,
};

const VALID_DIMENSIONS: Record<
  string,
  { label: string; tagDimension: string }
> = {
  brand: { label: "品牌", tagDimension: "brand_tier" },
  price: { label: "价位", tagDimension: "price" },
  nib: { label: "笔尖类型", tagDimension: "nib_type" },
  origin: { label: "产地", tagDimension: "origin" },
  fill: { label: "上墨方式", tagDimension: "fill_system" },
  usage: { label: "用途", tagDimension: "usage" },
  era: { label: "年代", tagDimension: "era" },
  size: { label: "尺寸", tagDimension: "size" },
  material: { label: "笔身材质", tagDimension: "body_material" },
};

interface DimensionPageProps {
  params: Promise<{ dimension: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dimension: string }>;
}): Promise<Metadata> {
  const { dimension } = await params;
  const dimConfig = VALID_DIMENSIONS[dimension];
  if (!dimConfig) {
    return { title: "维度未找到 - 钢笔知识图谱" };
  }
  return {
    title: `按${dimConfig.label}浏览 - 钢笔知识图谱`,
    description: `按${dimConfig.label}维度浏览钢笔知识图谱中的所有词条，发现不同${dimConfig.label}分类下的钢笔。`,
  };
}

export default async function DimensionPage({ params }: DimensionPageProps) {
  const { dimension } = await params;
  const dimConfig = VALID_DIMENSIONS[dimension];

  if (!dimConfig) {
    notFound();
  }

  const Icon = DIMENSION_ICONS[dimension] || MagnifyingGlass;

  const tags = (await queryAll(
    `SELECT t.id, t.name, t.slug, t.dimension, COUNT(et.entity_id) as entity_count
     FROM tags t
     LEFT JOIN entity_tags et ON et.tag_id = t.id
     WHERE t.dimension = ?
     GROUP BY t.id
     HAVING entity_count > 0
     ORDER BY entity_count DESC`,
    [dimConfig.tagDimension]
  )) as Array<{
    id: string;
    name: string;
    slug: string;
    dimension: string;
    entity_count: number;
  }>;

  const totalEntities = tags.reduce((sum, t) => sum + t.entity_count, 0);

  const getBrowseLink = (tagSlug: string) => {
    const dimMap: Record<string, string> = {
      brand: "brand_tier",
      fill: "fill_system",
      nib: "nib_type",
      material: "body_material",
    };
    const param = dimMap[dimension] || dimension;
    return `/browse?${param}=${tagSlug}`;
  };

  return (
    <div
      className="max-w-4xl mx-auto py-8 px-4"
      style={{ color: "var(--color-ink)" }}
    >
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/"
          className="text-sm flex items-center gap-1 transition-colors"
          style={{ color: "var(--color-ink-muted)" }}
        >
          <ArrowLeft size={14} />
          首页
        </Link>
        <Link
          href="/browse"
          className="text-sm transition-colors"
          style={{ color: "var(--color-ink-muted)" }}
        >
          浏览
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <Icon
          size={28}
          weight="duotone"
          style={{ color: "var(--color-accent)" }}
        />
        <h1 className="text-3xl font-bold tracking-tight">
          按{dimConfig.label}浏览
        </h1>
      </div>
      <p
        className="mb-8"
        style={{ color: "var(--color-ink-muted)" }}
      >
        共 {tags.length} 个{dimConfig.label}分类，覆盖 {totalEntities} 个词条
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={getBrowseLink(tag.slug)}
            className="block p-4 rounded-xl transition-all card-hover"
            style={{
              backgroundColor: "var(--color-surface-raised)",
              border: "1px solid var(--color-border-light)",
            }}
          >
            <h3
              className="font-semibold mb-1"
              style={{ color: "var(--color-ink)" }}
            >
              {tag.name}
            </h3>
            <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
              {tag.entity_count} 个词条
            </p>
          </Link>
        ))}
      </div>

      {tags.length === 0 && (
        <div className="text-center py-16">
          <MagnifyingGlass
            size={48}
            weight="duotone"
            style={{ color: "var(--color-ink-muted)" }}
            className="mx-auto mb-4"
          />
          <p style={{ color: "var(--color-ink-muted)" }}>
            暂无{dimConfig.label}分类数据
          </p>
          <Link
            href="/browse"
            className="inline-block mt-4 text-sm transition-colors"
            style={{ color: "var(--color-accent)" }}
          >
            去浏览所有词条 →
          </Link>
        </div>
      )}
    </div>
  );
}
