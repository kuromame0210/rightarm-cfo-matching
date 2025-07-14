import type { Metadata } from "next";
import "./globals.css";
import NavigationPerformanceLogger from '@/components/NavigationPerformanceLogger'
import DebugMenu from '@/components/DebugMenu'
import { Providers } from '@/lib/providers'
import AuthGuard from '@/components/AuthGuard'
import NetworkStatus from '@/components/NetworkStatus'

export const metadata: Metadata = {
  title: "Rextrix - 企業とCFOのマッチングプラットフォーム",
  description: "全国の企業に最適なCFOを届ける完全セルフ型マッチングプラットフォーム",
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
      </head>
      <body className="antialiased">
        <Providers>
          <AuthGuard>
            <NetworkStatus />
            {/* <NavigationPerformanceLogger /> */}
            {children}
            {/* <DebugMenu /> */}
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}