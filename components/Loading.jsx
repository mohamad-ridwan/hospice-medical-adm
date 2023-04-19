import styles from 'styles/Loading.module.scss'

function Loading({
    style
}) {
  return (
    <div className={styles['wrapp-loading']} style={style}>
        <div className={styles['loading-circle']}>

        </div>
    </div>
  )
}

export default Loading