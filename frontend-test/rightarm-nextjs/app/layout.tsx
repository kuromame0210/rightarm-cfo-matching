import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RightArm - 企業とCFOのマッチングサイト',
  description: '全国の企業に、"右腕CFO"を届ける',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}