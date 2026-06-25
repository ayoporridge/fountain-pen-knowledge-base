import { Compass } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedExhibits } from "@/lib/library";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "历史展览 - 钢笔图书馆",
  description: "策展式钢笔阅读路径，串联品牌、型号、工艺和历史。",
};

export default async function ExhibitsPage() {
  const exhibits = await getPublishedExhibits();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p
          className="mb-2 text-sm font-medium"
          style={{ color: "var(--color-accent)" }}
        >
          Exhibits
        </p>
        <h1 className="mb-3 flex items-center gap-2 text-3xl font-bold">
          <Compass size={28} style={{ color: "var(--color-accent)" }} />
          历史展览
        </h1>
        <p
          className="max-w-3xl text-base leading-relaxed"
          style={{ color: "var(--color-ink-light)" }}
        >
          展览不是单个词条，而是把品牌、型号、机制、人物、广告和社区口碑串成一条可阅读的路径。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {exhibits.map((exhibit) => (
          <Link
            key={exhibit.slug}
            href={`/exhibits/${exhibit.slug}`}
            className="rounded-xl border p-5 card-hover"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface-raised)",
            }}
          >
            <div
              className="mb-2 text-xs"
              style={{ color: "var(--color-ink-muted)" }}
            >
              {exhibit.status}
            </div>
            <h2 className="mb-2 text-lg font-semibold">{exhibit.title}</h2>
            {exhibit.summary && (
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-ink-muted)" }}
              >
                {exhibit.summary}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
