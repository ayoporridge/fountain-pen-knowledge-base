"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface EntityDetail {
  id: string;
  type: string;
  slug: string;
  name: string;
  summary: string | null;
  attributes: Record<string, string>;
  tags: Array<{ name: string; dimension: string }>;
}

const ATTR_LABELS: Record<string, string> = {
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

export default function ComparePageWrapper() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto py-8 px-4 text-center text-gray-500">加载中...</div>}>
      <ComparePage />
    </Suspense>
  );
}

function ComparePage() {
  const searchParams = useSearchParams();
  const slugs = (searchParams.get("items") || "").split(",").filter(Boolean);
  const [entities, setEntities] = useState<EntityDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slugs.length === 0) {
      setLoading(false);
      return;
    }

    Promise.all(
      slugs.map(async (slug) => {
        const res = await fetch(`/api/entities/${slug}`);
        if (!res.ok) return null;
        return res.json() as Promise<EntityDetail>;
      }),
    ).then((results) => {
      setEntities(results.filter(Boolean) as EntityDetail[]);
      setLoading(false);
    });
  }, [slugs.join(",")]);

  if (slugs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">对比词条</h1>
        <p className="text-gray-500">请从词条页面添加对比项</p>
        <Link href="/browse" className="text-blue-600 hover:underline mt-4 inline-block">
          去浏览 →
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 text-center text-gray-500">
        加载中...
      </div>
    );
  }

  // Collect all attribute keys
  const allAttrKeys = [...new Set(entities.flatMap((e) => Object.keys(e.attributes)))];

  // Collect all tag dimensions
  const allDimensions = [...new Set(entities.flatMap((e) => e.tags.map((t) => t.dimension)))];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <Link
        href="/"
        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6 inline-block"
      >
        ← 首页
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        对比 ({entities.length} 项)
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 w-32">
                属性
              </th>
              {entities.map((e) => (
                <th
                  key={e.slug}
                  className="text-left p-3 border-b border-gray-200 dark:border-gray-700"
                >
                  <Link
                    href={`/${e.type}/${e.slug}`}
                    className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {e.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Summary */}
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <td className="p-3 text-sm font-medium text-gray-500">摘要</td>
              {entities.map((e) => (
                <td key={e.slug} className="p-3 text-sm text-gray-700 dark:text-gray-300">
                  {e.summary || "—"}
                </td>
              ))}
            </tr>

            {/* Attributes */}
            {allAttrKeys.map((key) => (
              <tr key={key} className="border-b border-gray-100 dark:border-gray-800">
                <td className="p-3 text-sm font-medium text-gray-500">
                  {ATTR_LABELS[key] || key}
                </td>
                {entities.map((e) => (
                  <td key={e.slug} className="p-3 text-sm text-gray-700 dark:text-gray-300">
                    {e.attributes[key] || "—"}
                  </td>
                ))}
              </tr>
            ))}

            {/* Tags by dimension */}
            {allDimensions.map((dim) => (
              <tr key={dim} className="border-b border-gray-100 dark:border-gray-800">
                <td className="p-3 text-sm font-medium text-gray-500">{dim}</td>
                {entities.map((e) => {
                  const dimTags = e.tags.filter((t) => t.dimension === dim);
                  return (
                    <td key={e.slug} className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {dimTags.length > 0 ? dimTags.map((t) => (
                          <span
                            key={t.name}
                            className="px-1.5 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          >
                            {t.name}
                          </span>
                        )) : <span className="text-sm text-gray-400">—</span>}
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
