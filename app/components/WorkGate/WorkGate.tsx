'use client'

import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { validateWorkPassword } from '@/app/work/actions'
import { useWorkAccess } from '@/app/context/WorkAccessContext'
import styles from './WorkGate.module.scss'
import { homepageTransitionOut } from '@/app/animations'

interface Props {
  mail?: string
}

export default function WorkGate({ mail }: Props) {
  const gateRef = useRef<HTMLDivElement>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const { setUnlocked } = useWorkAccess()

  useEffect(() => {
    gsap.fromTo(gateRef.current, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power4.out' })
  }, [])

  const mailtoHref = mail
    ? `mailto:${mail}?subject=${encodeURIComponent('Access code request')}&body=${encodeURIComponent(
        "Hi,\n\nI'd like to request an access code to view past work.\n\nThanks!"
      )}`
    : undefined

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const valid = await validateWorkPassword(code)
    if (valid) {
      homepageTransitionOut(() => {
        setUnlocked(true)
      })
    } else {
      setError(true)
      setCode('')
    }
  }

  return (
    <div ref={gateRef} className={styles.gate}>
      {mailtoHref && (
        <a href={mailtoHref} className={styles.request}>
          Request code
        </a>
      )}
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="password"
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setError(false)
          }}
          className={`${styles.input} ${error ? styles.error : ''}`}
          placeholder=""
        />
        <button type="submit" className={styles.enter}>
          Enter
        </button>
      </form>
    </div>
  )
}
