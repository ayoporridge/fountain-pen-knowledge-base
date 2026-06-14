import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GlobalShortcuts } from "@/components/GlobalShortcuts";
import { TextureOverlay } from "@/components/TextureOverlay";

export const metadata: Metadata = {
  title: "钢笔知识图谱",
  description: "AI 时代的钢笔百科全书——自由链接、多维探索的钢笔知识网络",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        {/* Google Fonts — loaded via <link> because Tailwind CSS 4 strips @import url() */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=LXGW+WenKai+TC:wght@300;400;700&family=Noto+Serif+SC:wght@200;300;400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{
          backgroundColor: "var(--color-surface)",
          color: "var(--color-ink)",
        }}
      >
        <Providers>
          <TextureOverlay />
          <GlobalShortcuts />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
