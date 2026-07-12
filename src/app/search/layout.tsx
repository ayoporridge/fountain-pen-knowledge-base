import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "搜索",
  description:
    "搜索钢笔、品牌、概念、工艺。快速找到你想了解的钢笔知识，支持全文检索和语义搜索。",
  robots: { index: false, follow: true },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
