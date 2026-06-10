"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ENTITY_TYPES = [
  { value: "pen", label: "钢笔" },
  { value: "brand", label: "品牌" },
  { value: "concept", label: "概念" },
  { value: "material", label: "材质" },
  { value: "nib", label: "笔尖" },
  { value: "fill_system", label: "上墨方式" },
];

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

function generateSlug(name: string, type: string): string {
  // For Chinese names, use pinyin-like simple conversion or keep as-is
  // Create a base slug: lowercase, replace spaces/special chars with hyphens
  const base = name
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fff-]/g, "")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");

  // If the name is Chinese-only, prefix with type
  if (/^[\u4e00-\u9fff-]+$/.test(base)) {
    return `${type}-${base}`.replace(/-+/g, "-");
  }

  return base || `${type}-${Date.now()}`;
}

export default function NewEntityPage() {
  const router = useRouter();
  const [type, setType] = useState("pen");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [summary, setSummary] = useState("");
  const [bodyMd, setBodyMd] = useState("");
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug when name or type changes
  const handleNameChange = (newName: string) => {
    setName(newName);
    if (!slugManual) {
      setSlug(generateSlug(newName, type));
    }
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    if (!slugManual) {
      setSlug(generateSlug(name, newType));
    }
  };

  const handleSlugChange = (newSlug: string) => {
    setSlugManual(true);
    setSlug(newSlug);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("名称不能为空");
      return;
    }
    if (!slug.trim()) {
      setError("Slug 不能为空");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          slug: slug.trim(),
          name: name.trim(),
          summary: summary.trim() || null,
          body_md: bodyMd.trim() || null,
          attributes,
        }),
      });

      if (res.ok) {
        router.push(`/${type}/${slug.trim()}`);
      } else {
        const data = await res.json();
        setError(data.error || "创建失败");
        setSaving(false);
      }
    } catch {
      setError("网络错误");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-ink-muted hover:text-ink-light"
        >
          ← 首页
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-ink">
        新建词条
      </h1>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Type selection */}
        <div>
          <label className="block text-sm font-medium text-ink-light mb-2">
            词条类型
          </label>
          <div className="flex flex-wrap gap-2">
            {ENTITY_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => handleTypeChange(t.value)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  type === t.value
                    ? "bg-accent text-white border-accent"
                    : "bg-surface-raised text-ink-light border-border hover:border-accent"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-ink-light mb-1">
            名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="例如：百乐 Custom 823"
            className="w-full px-3 py-2 rounded-md border border-border bg-surface-raised text-ink focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>

        {/* Slug (auto-generated, editable) */}
        <div>
          <label className="block text-sm font-medium text-ink-light mb-1">
            URL Slug{" "}
            <span className="text-xs text-ink-muted font-normal">
              (自动生成，可手动修改)
            </span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-muted">
              /{type}/
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="auto-generated-slug"
              className="flex-1 px-3 py-2 rounded-md border border-border bg-surface-raised text-ink font-mono text-sm focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
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
            placeholder="一句话描述这个词条"
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

        {/* Body Markdown */}
        <div>
          <label className="block text-sm font-medium text-ink-light mb-1">
            详细内容 (Markdown)
          </label>
          <textarea
            value={bodyMd}
            onChange={(e) => setBodyMd(e.target.value)}
            rows={12}
            placeholder="使用 Markdown 格式编写详细内容..."
            className="w-full px-3 py-2 rounded-md border border-border bg-surface-raised text-ink font-mono text-sm focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>

        {/* Save / Cancel */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-md bg-accent text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
          >
            {saving ? "创建中..." : "创建词条"}
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-md border border-border hover:bg-surface-dim transition-colors"
          >
            取消
          </Link>
        </div>
      </div>
    </div>
  );
}
