'use client'

import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { toPlainText } from '@portabletext/toolkit'
import type { PortableTextBlock } from '@portabletext/types'
import { validateWorkPassword } from '@/app/(site)/work/actions'
import { useWorkAccess } from '@/app/context/WorkAccessContext'
import styles from './WorkGate.module.scss'
import { homepageTransitionOut } from '@/app/(site)/animations'

interface Props {
  mail?: string
  subject?: string
  body?: unknown[]
}

export default function WorkGate({ mail, subject, body }: Props) {
  const gateRef = useRef<HTMLDivElement>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const { setUnlocked } = useWorkAccess()

  useEffect(() => {
    gsap.fromTo(gateRef.current, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power4.out' })
  }, [])

  useEffect(() => {
    let cancelled = false;

    const validate = async () => {
      const valid = await validateWorkPassword(code);
      if (!valid || cancelled) return;

      homepageTransitionOut(() => {
        setUnlocked(true);
      });
    };

    validate();

    return () => {
      cancelled = true;
    };
  }, [code]);

  const mailtoHref = mail
    ? `mailto:${mail}?subject=${encodeURIComponent(
        subject || 'Access code request'
      )}&body=${encodeURIComponent(
        body?.length
          ? toPlainText(body as PortableTextBlock[])
          : "Hi,\n\nI'd like to request an access code to view past work.\n\nThanks!"
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
