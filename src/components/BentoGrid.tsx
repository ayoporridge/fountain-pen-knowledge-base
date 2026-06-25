"use client";

import { PenNib } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { TYPE_ICONS } from "@/lib/constants";

interface StarEntry {
  name: string;
  slug: string;
}

interface TypeItem {
  type: string;
  label: string;
  stars: StarEntry[];
  cnt: number;
}

export default function BentoGrid({ items }: { items: TypeItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
      {items.map(({ type, label, stars, cnt }) => {
        const Icon = TYPE_ICONS[type] || PenNib;
        return (
          <article
            key={type}
            className={`group p-5 rounded-xl card-hover ${
              type === "pen" ? "sm:col-span-2 sm:row-span-2" : ""
            }`}
            style={{
              backgroundColor: "var(--color-surface-raised)",
              boxShadow: "var(--shadow-raised)",
            }}
          >
            <Link
              href={`/browse?type=${type}`}
              className="mb-3 flex items-center gap-2 transition-colors"
            >
              <span style={{ color: "var(--color-accent)" }}>
                <Icon size={type === "pen" ? 28 : 22} weight="duotone" />
              </span>
              <h3
                className="font-semibold tracking-tight"
                style={{ color: "var(--color-ink)" }}
              >
                {label}
              </h3>
            </Link>
            {stars.length > 0 && (
              <div className="space-y-1.5">
                {stars.map((star) => (
                  <Link
                    key={star.slug}
                    href={`/${type}/${star.slug}`}
                    className="block text-sm truncate transition-colors hover:underline underline-offset-4"
                    style={{ color: "var(--color-ink-light)" }}
                  >
                    {star.name}
                  </Link>
                ))}
              </div>
            )}
            <Link
              href={`/browse?type=${type}`}
              className="mt-3 block text-xs transition-colors hover:underline underline-offset-4"
              style={{ color: "var(--color-ink-muted)" }}
            >
              {cnt} 个词条 →
            </Link>
          </article>
        );
      })}
    </div>
  );
}
