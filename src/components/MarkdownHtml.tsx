"use client";

import { useEffect, useRef } from "react";

export function MarkdownHtml({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void html;
    const images = Array.from(
      containerRef.current?.querySelectorAll("img") || [],
    );
    const cleanups = images.map((image) => {
      const hideBrokenImage = () => {
        const figure = image.closest("figure");
        if (figure) figure.hidden = true;
        else image.hidden = true;
      };
      image.addEventListener("error", hideBrokenImage);
      if (image.complete && image.naturalWidth === 0) hideBrokenImage();
      return () => image.removeEventListener("error", hideBrokenImage);
    });
    return () => {
      cleanups.forEach((cleanup) => {
        cleanup();
      });
    };
  }, [html]);

  return (
    <div
      ref={containerRef}
      className="prose prose-body dark:prose-invert max-w-none prose-headings:text-ink prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-p:leading-relaxed"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: markdown is sanitized by the server renderer
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
