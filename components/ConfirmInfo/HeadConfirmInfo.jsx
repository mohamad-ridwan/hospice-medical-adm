import style from 'styles/HeadConfirmInfo.module.scss'

function HeadConfirmInfo({
  styleTitle,
  icon,
  desc
}) {
  return (
    <h1 className={style['title']} style={styleTitle}>
      <i className={icon}></i>
      <span className={style['desc']}>
        {desc}
      </span>
    </h1>
  )
}

export default HeadConfirmInfo