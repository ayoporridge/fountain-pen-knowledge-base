"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ATTR_LABELS } from "@/lib/constants";

interface EntityDetail {
  id: string;
  type: string;
  slug: string;
  name: string;
  summary: string | null;
  attributes: Record<string, string>;
  tags: Array<{ name: string; dimension: string }>;
}

export default function ComparePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto py-8 px-4 text-center text-ink-muted">
          加载中...
        </div>
      }
    >
      <ComparePage />
    </Suspense>
  );
}

function ComparePage() {
  const searchParams = useSearchParams();
  const itemsParam = searchParams.get("items") || "";
  const slugs = itemsParam.split(",").filter(Boolean);
  const [entities, setEntities] = useState<EntityDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentSlugs = itemsParam.split(",").filter(Boolean);
    if (currentSlugs.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all(
      currentSlugs.map(async (slug) => {
        const res = await fetch(`/api/entities/${slug}`);
        if (!res.ok) return null;
        return res.json();
      }),
    ).then((results) => {
      setEntities(results.filter(Boolean));
      setLoading(false);
    });
  }, [itemsParam]);

  if (slugs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">对比词条</h1>
        <p className="text-ink-muted">请从词条页面添加对比项</p>
        <Link
          href="/browse"
          className="text-accent hover:underline mt-4 inline-block"
        >
          去浏览 →
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 text-center text-ink-muted">
        加载中...
      </div>
    );
  }

  // Collect all attribute keys
  const allAttrKeys = [
    ...new Set(entities.flatMap((e) => Object.keys(e.attributes))),
  ];

  // Collect all tag dimensions
  const allDimensions = [
    ...new Set(entities.flatMap((e) => e.tags.map((t) => t.dimension))),
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <Link
        href="/"
        className="text-sm text-ink-muted hover:text-ink-light mb-6 inline-block"
      >
        ← 首页
      </Link>

      <h1 className="text-2xl font-bold text-ink mb-6">
        对比 ({entities.length} 项)
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 border-b border-border text-sm text-ink-muted w-32">
                属性
              </th>
              {entities.map((e) => (
                <th
                  key={e.slug}
                  className="text-left p-3 border-b border-border"
                >
                  <Link
                    href={`/${e.type}/${e.slug}`}
                    className="font-semibold text-ink hover:text-accent"
                  >
                    {e.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Summary */}
            <tr className="border-b border-border-light">
              <td className="p-3 text-sm font-medium text-ink-muted">摘要</td>
              {entities.map((e) => (
                <td key={e.slug} className="p-3 text-sm text-ink-light">
                  {e.summary || "—"}
                </td>
              ))}
            </tr>

            {/* Attributes */}
            {allAttrKeys.map((key) => (
              <tr key={key} className="border-b border-border-light">
                <td className="p-3 text-sm font-medium text-ink-muted">
                  {ATTR_LABELS[key] || key}
                </td>
                {entities.map((e) => (
                  <td key={e.slug} className="p-3 text-sm text-ink-light">
                    {e.attributes[key] || "—"}
                  </td>
                ))}
              </tr>
            ))}

            {/* Tags by dimension */}
            {allDimensions.map((dim) => (
              <tr key={dim} className="border-b border-border-light">
                <td className="p-3 text-sm font-medium text-ink-muted">
                  {dim}
                </td>
                {entities.map((e) => {
                  const dimTags = e.tags.filter((t) => t.dimension === dim);
                  return (
                    <td key={e.slug} className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {dimTags.length > 0 ? (
                          dimTags.map((t) => (
                            <span
                              key={t.name}
                              className="px-1.5 py-0.5 text-xs rounded bg-surface-dim text-ink-light"
                            >
                              {t.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-ink-muted">—</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
