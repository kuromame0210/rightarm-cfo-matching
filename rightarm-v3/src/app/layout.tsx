import type { Metadata } from "next";
import "./globals.css";
import NavigationPerformanceLogger from '@/components/NavigationPerformanceLogger'
import DebugMenu from '@/components/DebugMenu'

export const metadata: Metadata = {
  title: "RightArm - 企業とCFOのマッチングプラットフォーム",
  description: "全国の企業に\"右腕CFO\"を届ける完全セルフ型マッチングプラットフォーム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="prefetch" as="script" href="/_next/static/chunks/app/scout/page.js" />
        <link rel="prefetch" as="script" href="/_next/static/chunks/app/messages/page.js" />
        <link rel="prefetch" as="script" href="/_next/static/chunks/app/meetings/page.js" />
        <link rel="prefetch" as="script" href="/_next/static/chunks/app/debug/performance/page.js" />
        <link rel="prefetch" as="script" href="/_next/static/chunks/app/debug/components/page.js" />
        <link rel="prefetch" as="script" href="/_next/static/chunks/app/debug/api/page.js" />
      </head>
      <body className="antialiased">
        <NavigationPerformanceLogger />
        {children}
        <DebugMenu />
      </body>
    </html>
  );
}