import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { PenNib, MagnifyingGlass, List, Plus } from "@phosphor-icons/react/dist/ssr";

export function Header() {
  return (
    <header
      className="sticky top-0 z-50 backdrop-blur border-b"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-surface) 85%, transparent)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight btn-press"
            style={{ color: "var(--color-ink)" }}
          >
            <PenNib size={20} weight="duotone" style={{ color: "var(--color-accent)" }} />
            <span>钢笔知识图谱</span>
          </Link>
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/"
              className="text-sm transition-colors hover:underline underline-offset-4"
              style={{ color: "var(--color-ink-light)" }}
            >
              首页
            </Link>
            <Link
              href="/browse"
              className="text-sm transition-colors hover:underline underline-offset-4"
              style={{ color: "var(--color-ink-light)" }}
            >
              浏览
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-1 text-sm transition-colors hover:underline underline-offset-4"
              style={{ color: "var(--color-ink-light)" }}
            >
              <MagnifyingGlass size={14} />
              搜索
            </Link>
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1 text-sm transition-colors hover:underline underline-offset-4"
                style={{ color: "var(--color-ink-light)" }}
              >
                <List size={14} />
                按维度
              </button>
              <div
                className="absolute top-full left-0 mt-1 w-36 rounded-lg shadow-lg border py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
                style={{
                  backgroundColor: "var(--color-surface-raised)",
                  borderColor: "var(--color-border)",
                }}
              >
                {[
                  { href: "/by/nib", label: "笔尖类型" },
                  { href: "/by/fill", label: "上墨方式" },
                  { href: "/by/origin", label: "产地" },
                  { href: "/by/price", label: "价位" },
                  { href: "/by/usage", label: "用途" },
                  { href: "/by/material", label: "笔身材质" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-3 py-1.5 text-sm transition-colors hover:bg-[var(--color-surface-dim)]"
                    style={{ color: "var(--color-ink-light)" }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/chat"
              className="text-sm transition-colors hover:underline underline-offset-4"
              style={{ color: "var(--color-ink-light)" }}
            >
              问 AI
            </Link>
          </div>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/new"
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md text-white transition-colors btn-press hover:opacity-90"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            <Plus size={14} />
            新建词条
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
