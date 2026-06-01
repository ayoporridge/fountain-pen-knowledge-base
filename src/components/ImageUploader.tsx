"use client";

import { useRef, useState } from "react";

interface ImageUploaderProps {
  onUploaded: (markdown: string) => void;
}

export function ImageUploader({ onUploaded }: ImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      const altText = file.name.replace(/\.[^.]+$/, "");
      const markdown = `![${altText}](${data.url})`;
      onUploaded(markdown);

      // Reset file input
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <label
        className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
          uploading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        {uploading ? "上传中..." : "插入图片"}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleUpload}
          className="hidden"
        />
      </label>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
