import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1
        className="text-6xl font-bold mb-4"
        style={{ color: "var(--color-ink)" }}
      >
        404
      </h1>
      <p className="text-lg mb-2" style={{ color: "var(--color-ink-light)" }}>
        这个页面不存在
      </p>
      <p className="text-sm mb-8" style={{ color: "var(--color-ink-muted)" }}>
        可能是链接有误，或者页面已经被移除了
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "#fff",
          }}
        >
          回到首页
        </Link>
        <Link
          href="/browse"
          className="px-4 py-2 rounded-lg transition-colors border"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-ink-light)",
          }}
        >
          浏览全部
        </Link>
      </div>
    </div>
  );
}
