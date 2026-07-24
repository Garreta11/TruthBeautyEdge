'use client'

import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { homepageTransitionOut } from '@/app/(site)/animations'
import { useWorkAccess } from '@/app/context/WorkAccessContext'
import styles from './WorkRequest.module.scss'

interface Props {
  checkWork?: string
}


export default function WorkRequest({ checkWork }: Props) {
  const router = useRouter()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { unlocked } = useWorkAccess()

  function handleClick() {
    if (unlocked) {
      homepageTransitionOut(() => {
        router.push('/work')
      })
    } else {
      router.push('/work')
    }
  }

  return (
    <button ref={buttonRef} onClick={handleClick} className={styles.link}>
      <p>{checkWork}</p>
    </button>
  )
}
