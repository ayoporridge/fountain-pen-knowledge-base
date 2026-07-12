import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "问 AI",
  description: "基于钢笔知识图谱进行辅助查询。",
  robots: { index: false, follow: true },
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
