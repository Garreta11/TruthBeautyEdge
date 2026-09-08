import styles from "./BlurredColumns.module.scss"

export default function BlurredColumns() {
  return (
    <div className={styles.columns}>
      <div className={styles.columns__left}>
        <div className={`${styles.columns__layer} ${styles.columns__layer1}`} />
        <div className={`${styles.columns__layer} ${styles.columns__layer2}`} />
        <div className={`${styles.columns__layer} ${styles.columns__layer3}`} />
        <div className={`${styles.columns__layer} ${styles.columns__layer4}`} />
        <div className={`${styles.columns__layer} ${styles.columns__layer5}`} />
      </div>
    </div>
  )
}
