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
          const data = await res.json() as PreviewData;
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
    <span
      ref={containerRef}
      className="relative inline"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={href} className={className}>
        {children}
      </Link>

      {show && preview && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 pointer-events-none">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">
            {preview.name}
          </h4>
          {preview.summary && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 mb-2">
              {preview.summary}
            </p>
          )}
          {preview.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {preview.tags.slice(0, 4).map((tag) => (
                <span
                  key={`${tag.dimension}-${tag.name}`}
                  className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
          <div className="text-[10px] text-gray-400 mt-1">
            {preview.link_count} 个关联
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 rotate-45 -mt-1" />
        </div>
      )}
    </span>
  );
}
