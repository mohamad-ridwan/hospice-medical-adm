import styles from 'styles/Loading.module.scss'

function Loading({
    style,
    classWrapp,
    styleCircle
}) {
  return (
    <div className={`${styles['wrapp-loading']} ${styles[classWrapp]}`} style={style}>
        <div className={styles['loading-circle']} style={styleCircle}>

        </div>
    </div>
  )
}

export default Loading