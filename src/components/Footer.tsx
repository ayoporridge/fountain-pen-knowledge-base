import { PenNib } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="border-t"
      style={{
        borderColor: "var(--color-border)",
        boxShadow: "inset 0 1px 0 var(--color-border)",
      }}
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
                  href="/chat"
                  className="hover:underline"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  问 AI
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
              一个钢笔爱好者的个人项目。收集了 500+ 词条、70+
              标签，覆盖品牌、型号、笔尖、上墨方式。数据来自社区讨论、评测文章和我的个人笔记。
            </p>
          </div>
        </div>

        <div
          className="mt-8 pt-4 text-xs text-center flex items-center justify-center gap-1.5"
          style={{
            borderTop: "1px solid var(--color-border)",
            color: "var(--color-ink-muted)",
          }}
        >
          <PenNib size={12} weight="duotone" />
          钢笔知识图谱
        </div>
      </div>
    </footer>
  );
}
