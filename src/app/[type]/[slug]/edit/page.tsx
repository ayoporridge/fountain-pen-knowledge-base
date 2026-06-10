"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImageUploader } from "@/components/ImageUploader";
import { TagSelector } from "@/components/TagSelector";

interface EntityData {
  id: string;
  type: string;
  slug: string;
  name: string;
  summary: string | null;
  body_md: string | null;
  attributes: Record<string, string>;
}

export default function EditEntityPage({
  params,
}: {
  params: Promise<{ type: string; slug: string }>;
}) {
  const router = useRouter();
  const [entity, setEntity] = useState<EntityData | null>(null);
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [bodyMd, setBodyMd] = useState("");
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resolvedParams, setResolvedParams] = useState<{
    type: string;
    slug: string;
  } | null>(null);

  useEffect(() => {
    params.then((p) => {
      setResolvedParams(p);
      fetch(`/api/entities/${p.slug}`)
        .then((r) => r.json())
        .then((data: EntityData) => {
          setEntity(data);
          setName(data.name);
          setSummary(data.summary || "");
          setBodyMd(data.body_md || "");
          setAttributes(data.attributes || {});
          setLoading(false);
        });
    });
  }, [params]);

  const handleSave = async () => {
    if (!resolvedParams) return;
    setSaving(true);

    const res = await fetch(`/api/entities/${resolvedParams.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        summary: summary || null,
        body_md: bodyMd || null,
        attributes,
      }),
    });

    if (res.ok) {
      router.push(`/${resolvedParams.type}/${resolvedParams.slug}`);
    } else {
      setSaving(false);
      alert("保存失败");
    }
  };

  if (loading || !entity || !resolvedParams) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 animate-pulse">
        <div className="h-8 w-48 bg-surface-dim rounded mb-4" />
        <div className="h-64 bg-surface-dim rounded" />
      </div>
    );
  }

  const ATTR_KEYS = [
    { key: "nib_size", label: "笔尖粗细" },
    { key: "fill_system", label: "上墨方式" },
    { key: "body_material", label: "笔身材质" },
    { key: "origin_country", label: "产地" },
    { key: "price_range", label: "价位" },
    { key: "writing_style", label: "书写风格" },
    { key: "nib_material", label: "笔尖材质" },
    { key: "founded", label: "创立年份" },
    { key: "description", label: "描述" },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link
          href={`/${resolvedParams.type}/${resolvedParams.slug}`}
          className="text-sm text-ink-muted hover:text-ink-light"
        >
          ← 返回词条
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-ink">
        编辑: {entity.name}
      </h1>

      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-ink-light mb-1">
            名称
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border bg-surface-raised text-ink focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>

        {/* Summary */}
        <div>
          <label className="block text-sm font-medium text-ink-light mb-1">
            摘要
          </label>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border bg-surface-raised text-ink focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>

        {/* Attributes */}
        <div>
          <h2 className="text-sm font-medium text-ink-light mb-3">
            结构化属性
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ATTR_KEYS.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs text-ink-muted mb-1">
                  {label}
                </label>
                <input
                  type="text"
                  value={attributes[key] || ""}
                  onChange={(e) =>
                    setAttributes((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-1.5 text-sm rounded-md border border-border bg-surface-raised text-ink focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        {resolvedParams && (
          <div>
            <TagSelector entitySlug={resolvedParams.slug} />
          </div>
        )}

        {/* Body Markdown */}
        <div>
          <label className="block text-sm font-medium text-ink-light mb-1">
            详细内容 (Markdown)
          </label>
          <div className="mb-2">
            <ImageUploader
              onUploaded={(md) => {
                setBodyMd((prev) => (prev ? `${prev}\n${md}` : md));
              }}
            />
          </div>
          <textarea
            value={bodyMd}
            onChange={(e) => setBodyMd(e.target.value)}
            rows={16}
            className="w-full px-3 py-2 rounded-md border border-border bg-surface-raised text-ink font-mono text-sm focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>

        {/* Save button */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-md bg-accent text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
          >
            {saving ? "保存中..." : "保存"}
          </button>
          <Link
            href={`/${resolvedParams.type}/${resolvedParams.slug}`}
            className="px-4 py-2 rounded-md border border-border hover:bg-surface-dim transition-colors"
          >
            取消
          </Link>
        </div>
      </div>
    </div>
  );
}
