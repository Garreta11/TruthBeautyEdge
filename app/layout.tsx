import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.scss'
import { getSiteSettings } from '@/sanity/lib/queries'
import { InteractionProvider } from './context/InteractionContext'
import { PanelProvider } from './context/PanelContext'
import { WorkAccessProvider } from './context/WorkAccessContext'
import LenisProvider from './components/LenisProvider/LenisProvider'
import VideoBackground from './components/VideoBackground/VideoBackground'
import Nav from './components/Nav/Nav'

const neueHaas = localFont({
  src: './fonts/NeueHaasDisplayRoman.ttf',
  variable: '--font-neue-haas',
})

const bizUDMincho = localFont({
  src: './fonts/BIZUDMincho-Regular.ttf',
  variable: '--font-biz-ud-mincho',
})

export const metadata: Metadata = {
  title: 'TruthBeautyEdge',
  description: 'A system for creating obsession.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getSiteSettings()

  return (
    <html lang="en" className={`${neueHaas.variable} ${bizUDMincho.variable}`}>
      <body suppressHydrationWarning>
        <WorkAccessProvider>
          <LenisProvider>
            <InteractionProvider>
              <PanelProvider>
                {settings?.backgroundVideoUrl && (
                  <VideoBackground url={settings.backgroundVideoUrl} infoImageUrl={settings?.whoWeAreImageUrl} />
                )}
                <Nav logo={settings?.logoUrl} reachOut={settings?.reachOut} checkWork={settings?.checkWork} description={settings?.description} info={settings?.info} mail={settings?.mail} />
                <main>
                  {children}
                </main>
              </PanelProvider>
            </InteractionProvider>
          </LenisProvider>
        </WorkAccessProvider>
      </body>
    </html>
  )
}
