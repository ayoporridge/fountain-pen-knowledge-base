"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

interface Tag {
  id: string;
  name: string;
  slug: string;
  dimension: string;
  level: string;
  description: string | null;
}

interface TagSelectorProps {
  entitySlug: string;
}

const DIMENSION_LABELS: Record<string, string> = {
  nib_type: "笔尖类型",
  fill_system: "上墨方式",
  body_material: "笔身材质",
  origin: "产地",
  price: "价位",
  usage: "用途",
  size: "尺寸",
  era: "年代",
  brand_tier: "品牌定位",
  nib_material: "笔尖材质",
  ink_type: "墨水类型",
  style: "风格",
};

export function TagSelector({ entitySlug }: TagSelectorProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagDimension, setNewTagDimension] = useState("");

  // Fetch all tags and entity's current tags
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tagsRes, entityTagsRes] = await Promise.all([
        fetch("/api/tags?level=atom"),
        fetch(`/api/entities/${entitySlug}/tags`),
      ]);
      const tags = await tagsRes.json() as Tag[];
      const entityTags = await entityTagsRes.json() as Tag[];

      setAllTags(tags);
      setSelectedIds(new Set(entityTags.map((t) => t.id)));
    } catch (err) {
      console.error("Failed to fetch tags:", err);
    } finally {
      setLoading(false);
    }
  }, [entitySlug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get unique dimensions
  const dimensions = useMemo(() => {
    const dims = new Set(allTags.map((t) => t.dimension));
    return Array.from(dims).sort();
  }, [allTags]);

  // Filter tags by search
  const filteredTags = useMemo(() => {
    if (!search.trim()) return allTags;
    const q = search.toLowerCase();
    return allTags.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        (DIMENSION_LABELS[t.dimension] || t.dimension).toLowerCase().includes(q),
    );
  }, [allTags, search]);

  // Group tags by dimension
  const grouped = useMemo(() => {
    const map = new Map<string, Tag[]>();
    for (const tag of filteredTags) {
      const list = map.get(tag.dimension) || [];
      list.push(tag);
      map.set(tag.dimension, list);
    }
    return map;
  }, [filteredTags]);

  // Toggle tag selection
  const toggleTag = async (tagId: string) => {
    const isSelected = selectedIds.has(tagId);
    const newSet = new Set(selectedIds);

    if (isSelected) {
      newSet.delete(tagId);
      await fetch(`/api/entities/${entitySlug}/tags`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag_ids: [tagId] }),
      });
    } else {
      newSet.add(tagId);
      await fetch(`/api/entities/${entitySlug}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag_ids: [tagId] }),
      });
    }

    setSelectedIds(newSet);
  };

  // Create a new tag
  const handleCreateTag = async () => {
    if (!newTagName.trim() || !newTagDimension) return;

    const slug = newTagName
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
      .replace(/^-|-$/g, "");

    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTagName,
          slug: `${newTagDimension}-${slug}`,
          dimension: newTagDimension,
          level: "atom",
        }),
      });

      if (res.ok) {
        const newTag = await res.json() as Tag;
        setAllTags((prev) => [...prev, newTag]);
        // Auto-select the new tag
        await toggleTag(newTag.id);
        setNewTagName("");
        setCreating(false);
      } else {
        const data = await res.json() as { error?: string };
        alert(data.error || "创建失败");
      }
    } catch {
      alert("创建标签失败");
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          原子标签
        </h2>
        <button
          type="button"
          onClick={() => setCreating(!creating)}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {creating ? "取消" : "+ 新建标签"}
        </button>
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索标签..."
          className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Create new tag */}
      {creating && (
        <div className="mb-3 p-3 rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex gap-2 mb-2">
            <select
              value={newTagDimension}
              onChange={(e) => setNewTagDimension(e.target.value)}
              className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="">选择维度</option>
              {Object.entries(DIMENSION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="标签名称"
              className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateTag();
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleCreateTag}
            disabled={!newTagName.trim() || !newTagDimension}
            className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            创建
          </button>
        </div>
      )}

      {/* Tag groups */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Array.from(grouped.entries()).map(([dimension, tags]) => (
          <div key={dimension}>
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              {DIMENSION_LABELS[dimension] || dimension}
              <span className="ml-1 text-gray-400 dark:text-gray-500">
                ({tags.filter((t) => selectedIds.has(t.id)).length}/{tags.length})
              </span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => {
                const isSelected = selectedIds.has(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {grouped.size === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {search ? "没有匹配的标签" : "暂无标签，请先运行 seed-tags 脚本"}
          </p>
        )}
      </div>

      {/* Selected count */}
      {selectedIds.size > 0 && (
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          已选择 {selectedIds.size} 个标签
        </div>
      )}
    </div>
  );
}
