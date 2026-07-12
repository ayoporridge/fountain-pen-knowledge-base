import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "浏览全部词条",
  description:
    "浏览钢笔知识图谱全部词条，按品牌、价位、笔尖类型、上墨方式等维度筛选探索。",
  alternates: { canonical: "/browse" },
};

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
