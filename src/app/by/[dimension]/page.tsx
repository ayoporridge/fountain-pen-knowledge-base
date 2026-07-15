import {
  ArrowLeft,
  Buildings,
  Cube,
  Drop,
  Globe,
  MagnifyingGlass,
  PenNib,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDimensionDiscoveryData } from "@/lib/browse-data";

export const dynamic = "force-dynamic";

const DIMENSION_ICONS: Record<string, React.ElementType> = {
  brand: Buildings,
  nib: PenNib,
  origin: Globe,
  fill: Drop,
  material: Cube,
};

const VALID_DIMENSIONS: Record<
  string,
  { label: string; tagDimension: string }
> = {
  brand: { label: "品牌", tagDimension: "brand" },
  nib: { label: "笔尖类型", tagDimension: "nib_type" },
  origin: { label: "产地", tagDimension: "origin" },
  fill: { label: "上墨方式", tagDimension: "fill_system" },
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
    title: `按${dimConfig.label}浏览`,
    description: `按${dimConfig.label}维度浏览钢笔知识图谱中的所有词条，发现不同${dimConfig.label}分类下的钢笔。`,
    alternates: { canonical: `/by/${dimension}` },
  };
}

export default async function DimensionPage({ params }: DimensionPageProps) {
  const { dimension } = await params;
  const dimConfig = VALID_DIMENSIONS[dimension];

  if (!dimConfig) {
    notFound();
  }

  const Icon = DIMENSION_ICONS[dimension] || MagnifyingGlass;

  const { items: tags, totalEntities } = await getDimensionDiscoveryData(
    dimension,
    dimConfig.tagDimension,
  );

  const getBrowseLink = (tagSlug: string) => {
    if (dimension === "brand") return `/brand/${tagSlug}`;

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
      <p className="mb-8" style={{ color: "var(--color-ink-muted)" }}>
        {dimension === "brand"
          ? `共 ${tags.length} 个品牌，已关联 ${totalEntities} 个型号档案`
          : `共 ${tags.length} 个${dimConfig.label}分类，覆盖 ${totalEntities} 个词条`}
      </p>

      <div className="mb-8 flex flex-wrap gap-2">
        {Object.entries(VALID_DIMENSIONS).map(([key, config]) => (
          <Link
            key={key}
            href={`/by/${key}`}
            className="rounded-full border px-3 py-1 text-xs"
            style={{
              borderColor:
                key === dimension
                  ? "var(--color-accent)"
                  : "var(--color-border)",
              backgroundColor:
                key === dimension
                  ? "var(--color-accent-light)"
                  : "var(--color-surface-raised)",
              color:
                key === dimension
                  ? "var(--color-accent)"
                  : "var(--color-ink-muted)",
            }}
          >
            {config.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tags.map((tag) => (
          <Link
            key={`${tag.dimension}:${tag.slug}`}
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
              {dimension === "brand"
                ? `${tag.count} 个关联型号`
                : `${tag.count} 个词条`}
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
