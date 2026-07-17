import gsap from 'gsap'

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
    '+=0.3'
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
  const logo = document.querySelector<HTMLDivElement>('[data-logo]')

  tl.to(video, { opacity: 0, duration: 1, ease: 'power1.out' })
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