"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";

interface PreviewData {
  name: string;
  summary: string | null;
  link_count: number;
  tags: Array<{ name: string; dimension: string }>;
}

interface HoverPreviewProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function HoverPreview({ href, children, className }: HoverPreviewProps) {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLSpanElement>(null);

  // Extract slug from href (e.g., /pen/pilot-custom-823 → pilot-custom-823)
  const slug = href.split("/").filter(Boolean).pop() || "";

  const handleMouseEnter = useCallback(() => {
    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/entities/${slug}/preview`);
        if (res.ok) {
          const data = await res.json();
          setPreview(data);
          setShow(true);
        }
      } catch {
        // ignore
      }
    }, 300);
  }, [slug]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(false);
  }, []);

  return (
    <span ref={containerRef} className="relative inline">
      <Link
        href={href}
        className={className}
        onBlur={handleMouseLeave}
        onFocus={handleMouseEnter}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </Link>

      {show && preview && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-surface-raised rounded-lg shadow-xl border border-border pointer-events-none">
          <h4 className="font-semibold text-ink mb-1 text-sm">
            {preview.name}
          </h4>
          {preview.summary && (
            <p className="text-xs text-ink-light line-clamp-3 mb-2">
              {preview.summary}
            </p>
          )}
          {preview.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {preview.tags.slice(0, 4).map((tag) => (
                <span
                  key={`${tag.dimension}-${tag.name}`}
                  className="px-1.5 py-0.5 text-[10px] rounded bg-surface-dim text-ink-light"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
          <div className="text-[10px] text-ink-muted mt-1">
            {preview.link_count} 个关联
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-surface-raised border-r border-b border-border rotate-45 -mt-1" />
        </div>
      )}
    </span>
  );
}
