'use client'

import { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { validateWorkPassword } from './actions'
import styles from './WorkGate.module.scss'

interface Props {
  children: React.ReactNode
}

export default function WorkGate({ children }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const gateRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const sentenceRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const items = sentenceRef.current ? Array.from(sentenceRef.current.children) : []

    gsap
      .timeline()
      .fromTo(
        gateRef.current,
        { clipPath: 'circle(0% at 0% 50%)' },
        { clipPath: 'circle(150% at 0% 50%)', duration: 0.65, delay: 0.3, ease: 'power3.out' }
      )
      .fromTo(
        items,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', stagger: 0.08 },
        '-=0.4'
      )
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const valid = await validateWorkPassword(password)
    if (valid) {
      gsap
        .timeline()
        .to(gateRef.current, {
          clipPath: 'circle(0% at 0% 50%)',
          duration: 0.45,
          ease: 'power2.in',
        })
        .set(gateRef.current, { display: 'none' })
        .to(contentRef.current, {
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
        })
    } else {
      setError(true)
      setPassword('')
      gsap
        .timeline()
        .to(gateRef.current, {
          backgroundColor: 'rgba(255, 255, 255, 0.18)',
          duration: 0.08,
        })
        .to(gateRef.current, { x: -10, duration: 0.07, ease: 'power2.out' })
        .to(gateRef.current, { x: 10, duration: 0.07 })
        .to(gateRef.current, { x: -7, duration: 0.07 })
        .to(gateRef.current, { x: 7, duration: 0.07 })
        .to(gateRef.current, { x: 0, duration: 0.07, ease: 'power2.inOut' })
        .to(gateRef.current, {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          duration: 0.3,
        }, '-=0.1')
    }
  }

  return (
    <>
      <div ref={gateRef} className={styles.gate}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <p className={styles.sentence} ref={sentenceRef}>
            <span>Insert code</span>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              className={`${styles.input} ${error ? styles.error : ''}`}
              autoFocus
            />
            <span>to view past work</span>
          </p>
        </form>
      </div>
      <div ref={contentRef} className={styles.content}>
        {children}
      </div>
    </>
  )
}
