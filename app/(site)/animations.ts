import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

export function activeRowTextReveal() {
  const activeRowContents = document.querySelectorAll<HTMLElement>('[data-active-row-content]')

  const tl = gsap.timeline()
  const splitLinesList: SplitText[] = []
  const splitWordsList: SplitText[] = []

  activeRowContents.forEach((content) => {
    if (content.getClientRects().length === 0) return

    const groups = content.querySelectorAll<HTMLElement>('[data-animate-group]')

    groups.forEach((group) => {
      const splitLines = new SplitText(group, { type: 'lines' })
      splitLinesList.push(splitLines)

      splitLines.lines.forEach((line) => {
        const splitWords = new SplitText(line, { type: 'words' })
        splitWordsList.push(splitWords)

        // The "0" makes every group's lines start together instead of queueing.
        tl.fromTo(
          splitWords.words,
          { filter: 'blur(8px)', autoAlpha: 0 },
          { filter: 'blur(0px)', autoAlpha: 1, duration: 0.8, ease: 'power2.out', stagger: 0.04 },
          0
        )
      })
    })
  })

  const revert = () => {
    splitWordsList.forEach((split) => split.revert())
    splitLinesList.forEach((split) => split.revert())
    tl.kill()
  }

  return revert
}

export function homepageTransition(logoEl: Element | null, onLogoTop?: () => void) {
  const tl = gsap.timeline()
  tl.fromTo(
    logoEl,
    { opacity: 0 },
    { opacity: 1, duration: 1, ease: 'power1.out' },
  )

  tl.fromTo(
    '[data-video-bg]',
    { opacity: 0 },
    { opacity: 1, duration: 1, ease: 'power1.out' }
  )
  /* tl.fromTo(
    '[data-video-bg]',
    { filter: 'blur(44px) brightness(0)' },
    { filter: 'blur(44px) brightness(1)', duration: 1, ease: 'power1.out' }
  ) */
  
  tl.to(
    logoEl,
    {
      top: 10,
      left: 10,
      transform: 'translate(0, 0)',
      duration: 2,
      ease: 'power2.inOut',
      onComplete: () => onLogoTop?.(),
    },
    '+=0.5'
  )

  tl.fromTo(
    '[data-nav-els]',
    { opacity: 0 },
    { opacity: 1, duration: 2, ease: 'power1.out' },
    '-=1'
  )
  
  tl.fromTo(
    '[data-video-volume]',
    { opacity: '0' },
    { opacity: '0.24', duration: 2, ease: 'power1.out' },
    '<'
  )
}

export function homepageTransitionOut(onComplete?: () => void) {
  const tl = gsap.timeline({ onComplete })

  tl.fromTo(
    '[data-video-bg]',
    {
      opacity: 1
    },
    {
      opacity: 0,
      duration: 1,
      ease: 'power1.out',
    }
  )

}

export function workpageTransition() {
  const tl = gsap.timeline()

  const video = document.querySelector<HTMLVideoElement>('[data-video-bg]')
  const videoVolume = document.querySelector<HTMLParagraphElement>('[data-video-volume]')
  const logo = document.querySelector<HTMLDivElement>('[data-logo]')

  tl.to(video, { opacity: 0, duration: 1, ease: 'power1.out' })
  tl.to(videoVolume, { opacity: 0, duration: 1, ease: 'power1.out' }, '<')
  tl.to(logo, { opacity: 1, duration: 1, ease: 'power2.inOut' }, '<')
  tl.fromTo(
    '[data-work-row]',
    { opacity: 0 },
    { opacity: 1, duration: 1, ease: 'power1.out', stagger: 0.1 }
  )
}

export function workpageTransitionOut(onComplete?: () => void) {
  const tl = gsap.timeline({ onComplete })

  tl.fromTo(
    '[data-work-row]',
    { opacity: 1 },
    { opacity: 0, duration: 1, ease: 'power1.out', stagger: 0.1 }
  )
}

// Mirrors the old CSS: transform/backdrop-filter ease out over 0.55s
// (cubic-bezier(0.16, 1, 0.3, 1), approximated here with expo.out) while
// opacity snaps in over 0.1s; content fades in afterwards, once the panel
// has mostly finished scaling up.
export function panelOpen(panelEl: HTMLElement | null, contentEl: HTMLElement | null) {
  if (!panelEl) return

  gsap.killTweensOf([panelEl, contentEl].filter(Boolean) as Element[])

  const tl = gsap.timeline()

  tl.set(panelEl, { pointerEvents: 'all' }, 0)
  tl.fromTo(panelEl, { scale: 0 }, { scale: 1, duration: 0.55, ease: 'expo.out' }, 0)
  tl.fromTo(panelEl, { opacity: 0 }, { opacity: 1, duration: 0.1, ease: 'power1.out' }, 0)
  tl.fromTo(
    panelEl,
    { backdropFilter: 'blur(0.1px)' },
    { backdropFilter: 'blur(50px)', duration: 0.55, ease: 'expo.out' },
    0
  )

  if (contentEl) {
    tl.fromTo(contentEl, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power1.out' }, 0.25)
  }

  return tl
}

// Content fades out first (0.1s), then the panel shrinks + fades out
// (starting 0.1s in), mirroring the old .open.closing CSS transitions.
export function panelClose(panelEl: HTMLElement | null, contentEl: HTMLElement | null) {
  if (!panelEl) return

  gsap.killTweensOf([panelEl, contentEl].filter(Boolean) as Element[])

  const tl = gsap.timeline()

  if (contentEl) {
    tl.to(contentEl, { opacity: 0, duration: 0.1, ease: 'power1.out' }, 0)
  }

  tl.to(panelEl, { opacity: 0, duration: 0.3, ease: 'power1.out' }, 0)
  tl.to(panelEl, { backdropFilter: 'blur(0.1px)', duration: 0.3, ease: 'power1.out' }, 0)
  tl.to(panelEl, { scale: 0, duration: 0.35, ease: 'expo.out' }, 0.1)
  tl.set(panelEl, { pointerEvents: 'none' })

  return tl
}

// Reveals the logo, nav, and background video immediately (no animation) —
// for routes where the homepageTransition that normally reveals them never
// runs, e.g. landing directly on a locked /work deep link. gsap.set's
// selector targeting (unlike a plain document.querySelector) correctly
// applies to every match, not just the first.
export function revealChrome() {
  gsap.set(['[data-logo]', '[data-nav-els]', '[data-video-bg]'], { opacity: 1 })
}