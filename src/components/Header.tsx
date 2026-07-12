"use client";

import {
  BookOpen,
  CaretDown,
  ChatCircleDots,
  Graph,
  List,
  MagnifyingGlass,
  PenNib,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";

const DIMENSION_ITEMS = [
  { href: "/by/nib", label: "笔尖类型" },
  { href: "/by/fill", label: "上墨方式" },
  { href: "/by/origin", label: "产地" },
  { href: "/by/price", label: "价位" },
  { href: "/by/usage", label: "用途" },
  { href: "/by/material", label: "笔身材质" },
];

export function Header() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);
  const navStyle = (href: string) => ({
    color: isActive(href) ? "var(--color-accent)" : "var(--color-ink-light)",
    fontWeight: isActive(href) ? 650 : 400,
  });

  // Close dropdown on click outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  // Close on Escape
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [dropdownOpen]);

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-surface) 85%, transparent)",
        boxShadow: "0 1px 0 var(--color-border)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight btn-press"
            style={{ color: "var(--color-ink)" }}
            aria-current={isActive("/") ? "page" : undefined}
          >
            <PenNib
              size={20}
              weight="duotone"
              style={{ color: "var(--color-accent)" }}
            />
            <span>钢笔知识图谱</span>
          </Link>
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/library"
              className="flex min-h-11 items-center gap-1 border-b-2 text-sm transition-colors duration-140"
              style={{
                ...navStyle("/library"),
                borderColor: isActive("/library")
                  ? "var(--color-accent)"
                  : "transparent",
              }}
              aria-current={isActive("/library") ? "page" : undefined}
            >
              <BookOpen size={14} />
              图书馆
            </Link>
            <Link
              href="/browse"
              className="flex min-h-11 items-center border-b-2 text-sm transition-colors duration-140"
              style={{
                ...navStyle("/browse"),
                borderColor: isActive("/browse")
                  ? "var(--color-accent)"
                  : "transparent",
              }}
              aria-current={isActive("/browse") ? "page" : undefined}
            >
              浏览
            </Link>
            <Link
              href="/search"
              className="flex min-h-11 items-center gap-1 border-b-2 text-sm transition-colors duration-140"
              style={{
                ...navStyle("/search"),
                borderColor: isActive("/search")
                  ? "var(--color-accent)"
                  : "transparent",
              }}
              aria-current={isActive("/search") ? "page" : undefined}
            >
              <MagnifyingGlass size={14} />
              搜索
            </Link>
            <Link
              href="/graph"
              className="flex min-h-11 items-center gap-1 border-b-2 text-sm transition-colors duration-140"
              style={{
                ...navStyle("/graph"),
                borderColor: isActive("/graph")
                  ? "var(--color-accent)"
                  : "transparent",
              }}
              aria-current={isActive("/graph") ? "page" : undefined}
            >
              <Graph size={14} />
              关系图谱
            </Link>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 text-sm transition-colors duration-140"
                style={navStyle("/by")}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                aria-current={isActive("/by") ? "page" : undefined}
              >
                <List size={14} />
                按维度
                <CaretDown
                  size={12}
                  className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {dropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-1 w-36 rounded-lg shadow-lg border py-1 z-50 animate-fade-in"
                  style={{
                    backgroundColor: "var(--color-surface-raised)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  {DIMENSION_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDropdownOpen(false)}
                      className="block px-3 py-1.5 text-sm transition-colors duration-140 hover:bg-[var(--color-surface-dim)]"
                      style={{ color: "var(--color-ink-light)" }}
                      aria-current={isActive(item.href) ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/chat"
              className="flex min-h-11 items-center gap-1 border-b-2 text-sm transition-colors duration-140"
              style={{
                ...navStyle("/chat"),
                borderColor: isActive("/chat")
                  ? "var(--color-accent)"
                  : "transparent",
              }}
              aria-current={isActive("/chat") ? "page" : undefined}
            >
              <ChatCircleDots size={14} />问 AI
            </Link>
          </div>
        </nav>
        <div className="flex items-center gap-3">
          <MobileNav />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
