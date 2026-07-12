import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "型号对比",
  description: "并排查看钢笔型号的已登记资料。",
  robots: { index: false, follow: true },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
