import styles from './VideoBackground.module.scss'

interface Props {
  url: string
}

export default function VideoBackground({ url }: Props) {
  return (
    <div className={styles.wrapper}>
      <video
        className={styles.video}
        src={url}
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  )
}
