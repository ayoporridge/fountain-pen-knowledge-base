import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="border-t"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          {/* Navigation */}
          <div>
            <h3
              className="font-semibold mb-3 tracking-tight"
              style={{ color: "var(--color-ink)" }}
            >
              导航
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="hover:underline"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  首页
                </Link>
              </li>
              <li>
                <Link
                  href="/browse"
                  className="hover:underline"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  浏览全部
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="hover:underline"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  搜索
                </Link>
              </li>
              <li>
                <Link
                  href="/new"
                  className="hover:underline"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  新建词条
                </Link>
              </li>
            </ul>
          </div>

          {/* By dimension */}
          <div>
            <h3
              className="font-semibold mb-3 tracking-tight"
              style={{ color: "var(--color-ink)" }}
            >
              按维度浏览
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/by/nib"
                  className="hover:underline"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  笔尖类型
                </Link>
              </li>
              <li>
                <Link
                  href="/by/fill"
                  className="hover:underline"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  上墨方式
                </Link>
              </li>
              <li>
                <Link
                  href="/by/origin"
                  className="hover:underline"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  产地
                </Link>
              </li>
              <li>
                <Link
                  href="/by/price"
                  className="hover:underline"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  价位
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3
              className="font-semibold mb-3 tracking-tight"
              style={{ color: "var(--color-ink)" }}
            >
              关于
            </h3>
            <p style={{ color: "var(--color-ink-muted)", lineHeight: 1.7 }}>
              钢笔知识图谱是一个开放的钢笔百科项目，通过自由链接和多维标签，帮助你漫游探索钢笔世界的一切。
            </p>
          </div>
        </div>

        <div
          className="mt-8 pt-4 border-t text-xs text-center"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-ink-muted)",
          }}
        >
          钢笔知识图谱 · 漫游探索钢笔世界的一切
        </div>
      </div>
    </footer>
  );
}
