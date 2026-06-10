"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  List,
  X,
  MagnifyingGlass,
  ChatCircleDots,
  PenNib,
} from "@phosphor-icons/react/dist/ssr";

const NAV_ITEMS = [
  { href: "/browse", label: "浏览", Icon: PenNib },
  { href: "/search", label: "搜索", Icon: MagnifyingGlass },
  { href: "/by/nib", label: "按维度", Icon: List },
  { href: "/chat", label: "问 AI", Icon: ChatCircleDots },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg transition-colors"
        style={{ color: "var(--color-ink-light)" }}
        aria-label={open ? "关闭菜单" : "打开菜单"}
      >
        {open ? <X size={20} /> : <List size={20} />}
      </button>

      {open && (
        <div className="fixed inset-0 z-40" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
          <div
            ref={drawerRef}
            className="absolute right-0 top-0 h-full w-64 shadow-xl animate-slide-in-right"
            style={{
              backgroundColor: "var(--color-surface)",
              borderLeft: "1px solid var(--color-border)",
            }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
              <span className="font-semibold" style={{ color: "var(--color-ink)" }}>
                导航
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg transition-colors"
                style={{ color: "var(--color-ink-muted)" }}
                aria-label="关闭菜单"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {NAV_ITEMS.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
                  style={{ color: "var(--color-ink-light)" }}
                >
                  <Icon size={18} weight="duotone" style={{ color: "var(--color-accent)" }} />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
