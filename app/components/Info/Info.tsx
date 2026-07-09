'use client'

import { PortableText, PortableTextComponents  } from '@portabletext/react'
import Panel from '@/app/components/Panel/Panel'
import styles from './Info.module.scss'

interface Props {
  label?: string
  body?: unknown[]
  open?: boolean
  onOpen?: () => void
  onClose?: () => void
}

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => <h1>{children}</h1>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    h4: ({ children }) => <h4>{children}</h4>,
    normal: ({ children }) => <p>{children}</p>,
    blockquote: ({ children }) => (
      <blockquote>{children}</blockquote>
    ),
  },
}

export default function Info({ label, body, open, onOpen, onClose }: Props) {
  return (
    <Panel label={label} open={open} onOpen={onOpen} onClose={onClose}>
      {body && (
        <div className={styles.body}>
          <PortableText value={body as Parameters<typeof PortableText>[0]['value']} components={components} />
        </div>
      )}
    </Panel>
  )
}
