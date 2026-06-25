"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

interface SearchBoxProps {
  placeholder?: string;
  initialValue?: string;
}

export function SearchBox({
  placeholder = "搜索品牌、型号、概念…",
  initialValue = "",
}: SearchBoxProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = value.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-xl items-center gap-3 rounded-xl border px-4 py-3"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface-raised)",
        boxShadow: "var(--shadow-raised)",
      }}
    >
      <MagnifyingGlass
        size={18}
        style={{ color: "var(--color-ink-muted)", flexShrink: 0 }}
      />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-base text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] outline-none"
      />
      <button
        type="submit"
        className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
        style={{
          backgroundColor: "var(--color-accent)",
          color: "var(--color-surface-raised)",
        }}
      >
        搜索
      </button>
    </form>
  );
}
