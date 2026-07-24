import { getSiteSettings } from '@/sanity/lib/queries'

import LenisProvider from '@/app/components/LenisProvider/LenisProvider'
import { InteractionProvider } from '@/app/context/InteractionContext'
import { PanelProvider } from '@/app/context/PanelContext'
import { WorkAccessProvider } from '@/app/context/WorkAccessContext'

import Nav from '@/app/components/Nav/Nav'
import VideoBackground from '@/app/components/VideoBackground/VideoBackground'

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSiteSettings()

  return (
    <WorkAccessProvider>
      <LenisProvider>
        <InteractionProvider>
          <PanelProvider>

            {settings?.backgroundVideoUrl && (
              <VideoBackground
                url={settings.backgroundVideoUrl}
                infoImageUrl={settings?.whoWeAreImageUrl}
              />
            )}

            <Nav
              logo={settings?.logoUrl}
              reachOut={settings?.reachOut}
              checkWork={settings?.checkWork}
              description={settings?.description}
              info={settings?.info}
              mail={settings?.mail}
            />

            <main>{children}</main>

          </PanelProvider>
        </InteractionProvider>
      </LenisProvider>
    </WorkAccessProvider>
  )
}