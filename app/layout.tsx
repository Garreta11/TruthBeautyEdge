import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { getSiteSettings } from '@/sanity/lib/queries'
import './globals.scss'

const neueHaas = localFont({
  src: './fonts/NeueHaasDisplayRoman.ttf',
  variable: '--font-neue-haas',
})

const bizUDMincho = localFont({
  src: './fonts/BIZUDMincho-Regular.ttf',
  variable: '--font-biz-ud-mincho',
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()

  return {
    title: 'TruthBeautyEdge',
    description: 'A system for creating obsession.',
    icons: settings?.faviconUrl ? { icon: settings.faviconUrl } : undefined,
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${neueHaas.variable} ${bizUDMincho.variable}`}
    >
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}