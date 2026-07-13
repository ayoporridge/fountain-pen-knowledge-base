import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Providers } from "@/components/Providers";
import { TextureOverlay } from "@/components/TextureOverlay";

export const metadata: Metadata = {
  metadataBase: new URL("https://fountain-pen-graph.vercel.app"),
  title: {
    default: "钢笔知识图谱",
    template: "%s | 钢笔知识图谱",
  },
  description: "按品牌、型号、笔尖、上墨方式与历史专题分类浏览的钢笔资料馆",
  openGraph: {
    title: "钢笔知识图谱",
    description: "一座可追溯、可漫游的钢笔资料馆。",
    siteName: "钢笔知识图谱",
    type: "website",
    images: [
      {
        url: "/images/library/warm-pen-atlas/library-hero.jpg",
        width: 1200,
        height: 630,
        alt: "钢笔知识图谱资料馆",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "钢笔知识图谱",
    description: "一座可追溯、可漫游的钢笔资料馆。",
    images: ["/images/library/warm-pen-atlas/library-hero.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <head />
      <body
        className="min-h-full flex flex-col"
        style={{
          backgroundColor: "var(--color-surface)",
          color: "var(--color-ink)",
        }}
      >
        <Providers>
          <TextureOverlay />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
