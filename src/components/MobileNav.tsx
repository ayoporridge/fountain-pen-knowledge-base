"use client";

import {
  BookOpen,
  ChatCircleDots,
  Graph,
  List,
  MagnifyingGlass,
  PenNib,
  X,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const NAV_ITEMS = [
  { href: "/library", label: "图书馆", Icon: BookOpen },
  { href: "/browse", label: "浏览", Icon: PenNib },
  { href: "/search", label: "搜索", Icon: MagnifyingGlass },
  { href: "/graph", label: "关系图谱", Icon: Graph },
  { href: "/chat", label: "问 AI", Icon: ChatCircleDots },
];

const DIMENSION_ITEMS = [
  { href: "/by/brand", label: "品牌" },
  { href: "/by/nib", label: "笔尖类型" },
  { href: "/by/fill", label: "上墨方式" },
  { href: "/by/origin", label: "产地" },
  { href: "/by/price", label: "价位" },
  { href: "/by/usage", label: "用途" },
  { href: "/by/material", label: "笔身材质" },
];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const shouldRestoreFocusRef = useRef(false);
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const close = useCallback(() => {
    shouldRestoreFocusRef.current = true;
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        drawer.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((element) => !element.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close, open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const background = [
      ...new Set(
        [
          document.querySelector<HTMLElement>("main"),
          document.querySelector<HTMLElement>("footer"),
          rootRef.current?.closest("header")?.querySelector<HTMLElement>("nav"),
          rootRef.current?.parentElement?.querySelector<HTMLElement>(
            ":scope > button:last-child",
          ),
          triggerRef.current,
        ].filter((element): element is HTMLElement => Boolean(element)),
      ),
    ];
    const previous = background.map((element) => ({
      element,
      inert: element.inert,
      ariaHidden: element.getAttribute("aria-hidden"),
      tabIndex: element.getAttribute("tabindex"),
    }));
    for (const element of background) {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
      if (element === triggerRef.current)
        element.setAttribute("tabindex", "-1");
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      for (const item of previous) {
        item.element.inert = item.inert;
        if (item.ariaHidden === null)
          item.element.removeAttribute("aria-hidden");
        else item.element.setAttribute("aria-hidden", item.ariaHidden);
        if (item.tabIndex === null) item.element.removeAttribute("tabindex");
        else item.element.setAttribute("tabindex", item.tabIndex);
      }
    };
  }, [open]);

  useEffect(() => {
    if (open || !shouldRestoreFocusRef.current) return;
    shouldRestoreFocusRef.current = false;
    triggerRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (pathname) setOpen(false);
  }, [pathname]);

  return (
    <div ref={rootRef} className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg transition-colors"
        style={{ color: "var(--color-ink-light)" }}
        aria-label="打开导航"
        aria-expanded={open}
        aria-controls="mobile-navigation-dialog"
      >
        <List size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70]">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/35"
            onMouseDown={close}
          />
          <div
            id="mobile-navigation-dialog"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-navigation-title"
            className="absolute right-0 top-0 flex h-full w-[82vw] max-w-xs flex-col border-l shadow-xl animate-slide-in-right"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            <div
              className="flex items-center justify-between border-b p-4"
              style={{ borderColor: "var(--color-border)" }}
            >
              <h2
                id="mobile-navigation-title"
                className="m-0 text-lg font-semibold"
              >
                导航
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={close}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg"
                aria-label="关闭导航"
              >
                <X size={20} />
              </button>
            </div>
            <nav
              className="flex-1 overflow-y-auto p-4"
              aria-label="移动端主导航"
            >
              <div className="space-y-1">
                {NAV_ITEMS.map(({ href, label, Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={close}
                      aria-current={active ? "page" : undefined}
                      className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium"
                      style={{
                        color: active
                          ? "var(--color-accent)"
                          : "var(--color-ink-light)",
                        backgroundColor: active
                          ? "var(--color-accent-light)"
                          : "transparent",
                      }}
                    >
                      <Icon size={18} weight="duotone" />
                      {label}
                    </Link>
                  );
                })}
              </div>
              <h3 className="mb-2 mt-5 px-3 text-xs font-semibold text-ink-muted">
                按维度浏览
              </h3>
              <div className="grid grid-cols-2 gap-1">
                {DIMENSION_ITEMS.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={close}
                      aria-current={active ? "page" : undefined}
                      className="flex min-h-11 items-center rounded-lg px-3 py-2 text-sm"
                      style={{
                        color: active
                          ? "var(--color-accent)"
                          : "var(--color-ink-light)",
                        backgroundColor: active
                          ? "var(--color-accent-light)"
                          : "transparent",
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
