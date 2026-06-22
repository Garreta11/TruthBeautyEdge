'use client'

import { useRouter } from 'next/navigation'
import { useInteraction } from '@/app/context/InteractionContext'
import styles from './WorkRequest.module.scss'

interface Props {
  checkWork?: {
    sentence1?: string,
    sentence2?: string
  }
}


export default function WorkRequest({ checkWork }: Props) {
  const { hasInteracted, setInteracted } = useInteraction()
  const router = useRouter()

  function handleClick() {
    setInteracted()
    setTimeout(() => router.push('/work'), hasInteracted ? 0 : 600)
  }

  return (
    <button onClick={handleClick} className={styles.link}>
      <p>{checkWork?.sentence1} <span>{checkWork?.sentence2}</span></p>
    </button>
  )
}
