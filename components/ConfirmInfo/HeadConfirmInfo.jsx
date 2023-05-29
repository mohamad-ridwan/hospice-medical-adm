import style from 'styles/HeadConfirmInfo.module.scss'

function HeadConfirmInfo({
  styleTitle,
  styleIcon,
  icon,
  desc
}) {
  return (
    <h1 className={style['title']} style={styleTitle}>
      <i className={icon} style={styleIcon}></i>
      <span className={style['desc']}>
        {desc}
      </span>
    </h1>
  )
}

export default HeadConfirmInfo