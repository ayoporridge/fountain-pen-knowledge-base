"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface CompareItem {
  slug: string;
  name: string;
  type: string;
}

const COMPARE_KEY = "fpkg-compare";

function loadCompare(): CompareItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCompare(items: CompareItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMPARE_KEY, JSON.stringify(items));
}

export function useCompareItems() {
  const [items, setItems] = useState<CompareItem[]>([]);

  useEffect(() => {
    setItems(loadCompare());
  }, []);

  const add = useCallback((item: CompareItem) => {
    setItems((prev) => {
      if (prev.length >= 4 || prev.some((i) => i.slug === item.slug)) return prev;
      const next = [...prev, item];
      saveCompare(next);
      return next;
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.slug !== slug);
      saveCompare(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    saveCompare([]);
  }, []);

  return { items, add, remove, clear };
}

interface CompareBarProps {
  items: CompareItem[];
  onRemove: (slug: string) => void;
  onClear: () => void;
}

export function CompareBar({ items, onRemove, onClear }: CompareBarProps) {
  if (items.length === 0) return null;

  const compareUrl = `/compare?items=${items.map((i) => i.slug).join(",")}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <span className="text-sm text-gray-500">对比 ({items.length}/4)</span>
        <div className="flex gap-2 flex-1 overflow-x-auto">
          {items.map((item) => (
            <span
              key={item.slug}
              className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded"
            >
              {item.name}
              <button
                type="button"
                onClick={() => onRemove(item.slug)}
                className="text-gray-400 hover:text-red-500 ml-1"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Link
            href={compareUrl}
            className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            开始对比
          </Link>
          <button
            type="button"
            onClick={onClear}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            清空
          </button>
        </div>
      </div>
    </div>
  );
}

// Standalone CompareButton for entity pages
interface CompareButtonProps {
  slug: string;
  name: string;
  type: string;
}

export function CompareButton({ slug, name, type }: CompareButtonProps) {
  const [isInCompare, setIsInCompare] = useState(false);

  useEffect(() => {
    const items = loadCompare();
    setIsInCompare(items.some((i) => i.slug === slug));
  }, [slug]);

  const toggle = useCallback(() => {
    const items = loadCompare();
    if (items.some((i) => i.slug === slug)) {
      const next = items.filter((i) => i.slug !== slug);
      saveCompare(next);
      setIsInCompare(false);
    } else if (items.length < 4) {
      items.push({ slug, name, type });
      saveCompare(items);
      setIsInCompare(true);
    }
  }, [slug, name, type]);

  return (
    <button
      type="button"
      onClick={toggle}
      className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
        isInCompare
          ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
          : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      {isInCompare ? "✓ 已加入对比" : "⚖️ 加入对比"}
    </button>
  );
}
