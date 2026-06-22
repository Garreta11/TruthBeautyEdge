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

  useEffect(() => {
    gsap.fromTo(
      gateRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power3.out' }
    )
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const valid = await validateWorkPassword(password)
    if (valid) {
      gsap
        .timeline()
        .to(gateRef.current, {
          opacity: 0,
          y: -16,
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
          <p className={styles.sentence}>
            Insert code
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
            to view past work
          </p>
        </form>
      </div>
      <div ref={contentRef} className={styles.content}>
        {children}
      </div>
    </>
  )
}
