import { getSiteSettings } from '@/sanity/lib/queries'

import LenisProvider from '@/app/components/LenisProvider/LenisProvider'
import { InteractionProvider } from '@/app/context/InteractionContext'
import { PanelProvider } from '@/app/context/PanelContext'
import { WorkAccessProvider } from '@/app/context/WorkAccessContext'
import { ActiveRowProvider } from '@/app/context/ActiveRowContext'

import Nav from '@/app/components/Nav/Nav'
import VideoBackground from '@/app/components/VideoBackground/VideoBackground'
import CustomCursor from '@/app/components/CustomCursor/CustomCursor'

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSiteSettings()

  return (
    <WorkAccessProvider>
      <ActiveRowProvider>
        <LenisProvider>
          <InteractionProvider>
            <PanelProvider>
              <div className="site-cursor-none">
                <CustomCursor />

                {settings?.backgroundVideoUrl && (
                  <VideoBackground
                    url={settings.backgroundVideoUrl}
                    mobileUrl={settings?.backgroundVideoMobileUrl}
                    infoImageUrl={settings?.whoWeAreImageUrl}
                    mobileInfoImageUrl={settings?.whoWeAreImageMobileUrl}
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
              </div>
            </PanelProvider>
          </InteractionProvider>
        </LenisProvider>
      </ActiveRowProvider>
    </WorkAccessProvider>
  )
}